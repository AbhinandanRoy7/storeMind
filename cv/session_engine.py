# cv/session_engine.py

class SessionEngine:
    def __init__(self):
        # visitor_id -> dict of session data
        self.active_sessions = {}
        self.completed_sessions = []

    def start_session(self, visitor_id: str, timestamp: float):
        if visitor_id not in self.active_sessions:
            self.active_sessions[visitor_id] = {
                "visitor_id": visitor_id,
                "start_time": timestamp,
                "end_time": None,
                "duration": 0.0,
                "events": ["ENTRY"],
                "purchase_made": False
            }
            print(f"[SessionEngine] Started session for {visitor_id} at {timestamp:.2f}s")

    def add_event(self, visitor_id: str, event_name: str, timestamp: float):
        if visitor_id not in self.active_sessions:
            # We enforce that all sessions must start with an ENTRY now
            return 
            
        session = self.active_sessions[visitor_id]
        
        # Avoid duplicate consecutive events
        if session["events"] and session["events"][-1] == event_name:
            return
            
        session["events"].append(event_name)
        
        if event_name == "PURCHASE":
            session["purchase_made"] = True
            
        print(f"[SessionEngine] Event added for {visitor_id}: {event_name}")

    def end_session(self, visitor_id: str, timestamp: float) -> dict:
        if visitor_id in self.active_sessions:
            session = self.active_sessions.pop(visitor_id)
            session["end_time"] = timestamp
            session["duration"] = round(timestamp - session["start_time"], 2)
            
            if "EXIT" not in session["events"]:
                session["events"].append("EXIT")
                
            self.completed_sessions.append(session)
            print(f"[SessionEngine] Completed session for {visitor_id}. Duration: {session['duration']}s")
            return session
            
        return None

    def get_session(self, visitor_id: str) -> dict:
        return self.active_sessions.get(visitor_id)

    def get_all_completed(self) -> list:
        return self.completed_sessions

    def reset(self):
        self.active_sessions = {}
        self.completed_sessions = []

