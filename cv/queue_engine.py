# cv/queue_engine.py

class QueueEngine:
    def __init__(self, abandon_threshold=10.0):
        self.abandon_threshold = abandon_threshold
        # track_id -> join_timestamp
        self.queue_members = {}

    def update(self, track_id: str, zone_name: str, event_type: str, timestamp: float, purchased: bool = False) -> list:
        """
        Updates the queue state.
        Returns a list of event dicts: QUEUE_JOIN, QUEUE_LEAVE, QUEUE_ABANDON.
        """
        events = []
        if zone_name != "BILLING":
            return events

        if event_type == "ZONE_ENTER":
            self.queue_members[track_id] = timestamp
            events.append({
                "event": "QUEUE_JOIN",
                "queue_length": self.get_queue_length(),
                "confidence": 0.95
            })
            
        elif event_type == "ZONE_EXIT":
            join_time = self.queue_members.pop(track_id, None)
            if join_time is not None:
                dwell = timestamp - join_time
                # If they stayed a very short time and did NOT purchase, they abandoned
                if not purchased and dwell < self.abandon_threshold:
                    events.append({
                        "event": "QUEUE_ABANDON",
                        "wait_time": round(dwell, 2),
                        "queue_length": self.get_queue_length(),
                        "confidence": 0.90
                    })
                else:
                    events.append({
                        "event": "QUEUE_LEAVE",
                        "wait_time": round(dwell, 2),
                        "queue_length": self.get_queue_length(),
                        "confidence": 0.95
                    })
                    
        return events

    def get_queue_length(self) -> int:
        return len(self.queue_members)

    def reset(self):
        self.queue_members = {}
