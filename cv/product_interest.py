# cv/product_interest.py

import math

class ProductInterestEngine:
    def __init__(self, speed_threshold=0.03, dwell_threshold=10.0):
        self.speed_threshold = speed_threshold
        self.dwell_threshold = dwell_threshold
        self.interest_triggered = set()  # set of (track_id, zone_name)
        self.centroid_history = {}  # track_id -> list of (timestamp, centroid)

    def update(self, track_id: str, zone_name: str, centroid: list, current_time: float, dwell_time: float) -> dict:
        """
        Updates product interest heuristic.
        Returns a PRODUCT_INTEREST event dict if triggered, otherwise None.
        """
        if not zone_name or zone_name == "BILLING":
            return None
            
        key = (track_id, zone_name)
        if key in self.interest_triggered:
            return None  # Already triggered for this shelf visit
            
        # Store centroid history to calculate speed
        if track_id not in self.centroid_history:
            self.centroid_history[track_id] = []
        self.centroid_history[track_id].append((current_time, centroid))
        
        if len(self.centroid_history[track_id]) > 5:
            self.centroid_history[track_id].pop(0)
            
        # Calculate movement speed
        speed = 0.0
        if len(self.centroid_history[track_id]) >= 2:
            t1, c1 = self.centroid_history[track_id][0]
            t2, c2 = self.centroid_history[track_id][-1]
            dt = t2 - t1
            if dt > 0:
                dist = math.sqrt((c2[0] - c1[0])**2 + (c2[1] - c1[1])**2)
                speed = dist / dt

        # Heuristic: Dwell > 10s and speed is low
        if dwell_time >= self.dwell_threshold and speed < self.speed_threshold:
            self.interest_triggered.add(key)
            return {
                "event": "PRODUCT_INTEREST",
                "zone": zone_name,
                "confidence": 0.90
            }
            
        return None

    def reset_for_track_zone(self, track_id: str, zone_name: str):
        key = (track_id, zone_name)
        self.interest_triggered.discard(key)

    def reset(self):
        self.interest_triggered = set()
        self.centroid_history = {}
