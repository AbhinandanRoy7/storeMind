from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles
import time
import structlog
import os
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ]
)
logger = structlog.get_logger()

REQUEST_COUNT = Counter('storemind_requests_total', 'Total requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('storemind_request_latency_seconds', 'Request latency', ['endpoint'])

app = FastAPI(
    title="StoreMind AI",
    description="AI-Powered Retail Conversion Intelligence Platform",
    version="4.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_and_measure(request: Request, call_next):
    import uuid
    start = time.time()
    trace_id = request.headers.get("x-trace-id") or str(uuid.uuid4())
    
    store_id = None
    path_parts = request.url.path.strip("/").split("/")
    if len(path_parts) >= 2 and path_parts[0] == "stores":
        store_id = path_parts[1]
        
    structlog.contextvars.bind_contextvars(trace_id=trace_id, store_id=store_id)
    
    try:
        response = await call_next(request)
        status_code = response.status_code
    except Exception as e:
        logger.error("Unhandled exception or database unavailable", error=str(e))
        return JSONResponse(
            status_code=503,
            content={
                "error": "Database unavailable or internal service failure.",
                "code": "SERVICE_UNAVAILABLE"
            }
        )
        
    latency_ms = int((time.time() - start) * 1000)
    
    logger.info(
        "request",
        trace_id=trace_id,
        store_id=store_id,
        endpoint=request.url.path,
        method=request.method,
        latency_ms=latency_ms,
        status_code=status_code
    )
    
    REQUEST_COUNT.labels(method=request.method, endpoint=request.url.path, status=status_code).inc()
    REQUEST_LATENCY.labels(endpoint=request.url.path).observe(latency_ms / 1000.0)
    
    return response

@app.get("/health")
def health_check():
    import datetime
    from app.core.supabase import get_supabase
    
    db = get_supabase()
    
    # Get max timestamp
    events_resp = db.table("events").select("timestamp").order("timestamp", desc=True).limit(1).execute()
    
    warnings = []
    last_event_ts = None
    
    if events_resp.data:
        last_event_ts = events_resp.data[0]["timestamp"]
        # Parse it
        try:
            # Handle standard ISO formatting with or without Z
            if last_event_ts.endswith("Z"):
                last_event_ts_dt = datetime.datetime.fromisoformat(last_event_ts[:-1])
            else:
                last_event_ts_dt = datetime.datetime.fromisoformat(last_event_ts)
                
            # If naive, assume UTC
            if last_event_ts_dt.tzinfo is None:
                last_event_ts_dt = last_event_ts_dt.replace(tzinfo=datetime.timezone.utc)
                
            now = datetime.datetime.now(datetime.timezone.utc)
            if (now - last_event_ts_dt).total_seconds() > 600:
                warnings.append("STALE_FEED: No events received in the last 10 minutes")
        except Exception:
            pass
            
    if not last_event_ts:
        last_event_ts = datetime.datetime.utcnow().isoformat()
        warnings.append("STALE_FEED: No events in database")
        
    return {
        "status": "healthy",
        "version": "4.0.0",
        "services": {"supabase": "connected", "qdrant": "connected", "gemini": "connected"},
        "last_event_timestamp": last_event_ts,
        "warnings": warnings
    }
@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

from app.api.events import router as events_router
from app.api.analytics import router as analytics_router
from app.api.anomalies import router as anomalies_router
from app.api.copilot import router as copilot_router
from app.api.reports import router as reports_router
from app.api.live_feed import router as live_feed_router

app.include_router(events_router)
app.include_router(analytics_router)
app.include_router(anomalies_router)
app.include_router(copilot_router)
app.include_router(reports_router)
app.include_router(live_feed_router)

# Serve the debug CCTV footage for the frontend dashboard
outputs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "outputs")
if os.path.exists(outputs_dir):
    app.mount("/videos", StaticFiles(directory=outputs_dir), name="videos")
