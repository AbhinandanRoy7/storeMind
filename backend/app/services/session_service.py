from app.core.supabase import get_supabase
from datetime import datetime
import uuid

class SessionService:
    def __init__(self):
        self.db = get_supabase()

    def process_event_for_session(self, visitor_id: str, event_type: str, event_timestamp: datetime):
        if event_type == "ENTRY":
            self.create_session(visitor_id, event_timestamp)
        elif event_type == "EXIT":
            self.close_session(visitor_id, event_timestamp)
        # Handle conversion if applicable
        # e.g., if event_type == 'PURCHASE' or something similar for phase 1

    def create_session(self, visitor_id: str, entry_time: datetime):
        # Create a new session record
        data = {
            "visitor_id": visitor_id,
            "entry_time": entry_time.isoformat(),
            "conversion_status": False
        }
        self.db.table("sessions").insert(data).execute()

    def close_session(self, visitor_id: str, exit_time: datetime):
        # Find active session for visitor
        response = self.db.table("sessions").select("*").eq("visitor_id", visitor_id).is_("exit_time", "null").order("entry_time", desc=True).limit(1).execute()
        sessions = response.data
        if not sessions:
            return # No active session found
        
        session = sessions[0]
        entry_time = datetime.fromisoformat(session["entry_time"])
        if entry_time.tzinfo is None:
            from datetime import timezone
            entry_time = entry_time.replace(tzinfo=timezone.utc)
        if exit_time.tzinfo is None:
            from datetime import timezone
            exit_time = exit_time.replace(tzinfo=timezone.utc)
            
        duration = int((exit_time - entry_time).total_seconds())

        self.db.table("sessions").update({
            "exit_time": exit_time.isoformat(),
            "session_duration_seconds": duration
        }).eq("id", session["id"]).execute()

session_service = SessionService()
