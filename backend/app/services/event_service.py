from app.core.supabase import get_supabase
from app.schemas.event import EventSchema
from app.services.session_service import session_service

class EventService:
    def __init__(self):
        self.db = get_supabase()
        self.seen_event_ids = set()
        
    def store_events_with_partial_success(self, raw_events: list[dict]):
        from pydantic import ValidationError
        
        valid_events = []
        errors = []
        
        valid_types = [
            "ENTRY", "EXIT", "ZONE_ENTER", "ZONE_EXIT", "ZONE_DWELL",
            "BILLING_QUEUE_JOIN", "BILLING_QUEUE_ABANDON", "REENTRY",
            "QUEUE_JOIN", "QUEUE_ABANDON", "ANOMALY"
        ]
        
        for idx, raw in enumerate(raw_events):
            try:
                parsed = EventSchema(**raw)
                if parsed.event_type not in valid_types:
                    errors.append({"index": idx, "error": f"Invalid event_type: {parsed.event_type}"})
                    continue
                    
                # Idempotency check
                if parsed.event_id in self.seen_event_ids:
                    # Silently skip duplicates to be idempotent
                    continue
                    
                self.seen_event_ids.add(parsed.event_id)
                valid_events.append(parsed)
            except ValidationError as e:
                errors.append({"index": idx, "error": str(e.errors())})
                
        if not valid_events:
            return {"accepted": 0, "failed": len(errors), "errors": errors}
            
        data = []
        for e in valid_events:
            event_data = {
                "visitor_id": e.visitor_id,
                "event_type": e.event_type,
                "timestamp":  e.timestamp.isoformat(),
                "confidence": e.confidence,
                "metadata": {
                    "event_id": e.event_id,
                    "store_id": e.store_id,
                    "camera_id": e.camera_id,
                    "dwell_ms": e.dwell_ms,
                    "is_staff": e.is_staff,
                }
            }
            if e.zone_id:
                event_data["zone_id"] = e.zone_id
            if e.metadata:
                event_data["metadata"].update(e.metadata)
            data.append(event_data)
        
        # Insert into database
        self.db.table("events").insert(data).execute()
        
        # Update sessions based on events
        for e in valid_events:
            session_service.process_event_for_session(e.visitor_id, e.event_type, e.timestamp)
            
        return {
            "accepted": len(valid_events),
            "failed": len(errors),
            "errors": errors
        }

event_service = EventService()
