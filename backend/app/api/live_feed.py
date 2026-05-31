"""
AI PROMPT USED: "Create a FastAPI SSE endpoint that streams real-time store event counts
to a frontend client so it can show a live dashboard without polling."

GET /live-feed  →  Server-Sent Events stream
Emits a JSON object every 2 seconds with the latest running totals of:
  entries, exits, zone_enters, billing_queue_joins, reentries, staff_events
The frontend subscribes using the EventSource browser API.
"""

import asyncio
import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.core.supabase import get_supabase

router = APIRouter(tags=["live"])


async def event_stream():
    """
    SSE generator — queries Supabase every 2 seconds and pushes fresh counts.
    The frontend subscribes using:  const es = new EventSource('/live-feed')
    """
    db = get_supabase()
    while True:
        try:
            # Count each event type from the events table
            rows = db.table("events").select("event_type, metadata").execute()
            all_rows = rows.data or []

            entries   = sum(1 for r in all_rows if r["event_type"] == "ENTRY" and not (r.get("metadata") or {}).get("is_staff"))
            exits     = sum(1 for r in all_rows if r["event_type"] == "EXIT"  and not (r.get("metadata") or {}).get("is_staff"))
            reentries = sum(1 for r in all_rows if r["event_type"] == "REENTRY")
            zone_enters = sum(1 for r in all_rows if r["event_type"] == "ZONE_ENTER")
            billing   = sum(1 for r in all_rows if r["event_type"] == "BILLING_QUEUE_JOIN")
            staff     = sum(1 for r in all_rows if (r.get("metadata") or {}).get("is_staff") is True)

            payload = {
                "entries":      entries,
                "exits":        exits,
                "reentries":    reentries,
                "zone_enters":  zone_enters,
                "billing":      billing,
                "staff_events": staff,
                "total":        entries + exits + zone_enters + billing + reentries,
            }

            # SSE format: "data: <json>\n\n"
            yield f"data: {json.dumps(payload)}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

        await asyncio.sleep(2)   # push update every 2 seconds


@router.get("/live-feed")
async def live_feed():
    """
    Server-Sent Events endpoint.
    The frontend connects once; this streams updates forever.
    """
    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection":    "keep-alive",
            "X-Accel-Buffering": "no",   # disable Nginx buffering
        },
    )
