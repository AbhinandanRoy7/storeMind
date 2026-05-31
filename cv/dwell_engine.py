# cv/dwell_engine.py

class DwellEngine:
    def __init__(self):
        # (track_id, zone_name) -> start_timestamp (or float seconds)
        self.dwell_starts = {}

    def handle_zone_event(self, track_id: str, event_type: str, zone_name: str, timestamp: float) -> dict:
        """
        Processes ZONE_ENTER and ZONE_EXIT events to compute dwell times.
        timestamp is a float representing seconds/time in the pipeline.
        Returns a ZONE_DWELL event dictionary if a dwell concludes, otherwise None.
        """
        key = (track_id, zone_name)
        
        if event_type == "ZONE_ENTER":
            self.dwell_starts[key] = timestamp
            return None
            
        elif event_type == "ZONE_EXIT":
            start_time = self.dwell_starts.pop(key, None)
            if start_time is not None:
                duration = max(0.0, timestamp - start_time)
                return {
                    "event": "ZONE_DWELL",
                    "zone": zone_name,
                    "duration": round(duration, 2)
                }
                
        return None

    def get_current_dwell(self, track_id: str, zone_name: str, current_time: float) -> float:
        key = (track_id, zone_name)
        start_time = self.dwell_starts.get(key)
        if start_time is not None:
            return max(0.0, current_time - start_time)
        return 0.0

    def reset(self):
        self.dwell_starts = {}
