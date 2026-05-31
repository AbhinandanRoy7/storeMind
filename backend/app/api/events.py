from fastapi import APIRouter, Request, HTTPException
from app.services.event_service import event_service

router = APIRouter(prefix="/events", tags=["events"])

@router.post("/ingest")
async def ingest_events(request: Request):
    import structlog
    body = await request.json()
    events_raw = body.get("events", [])
    
    structlog.contextvars.bind_contextvars(event_count=len(events_raw))
    
    if len(events_raw) > 500:
        raise HTTPException(status_code=400, detail="Batch size exceeds limit of 500 events")
        
    result = event_service.store_events_with_partial_success(events_raw)
    return result
