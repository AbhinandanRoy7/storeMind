# cv/staff_interaction.py

import math

class StaffInteractionEngine:
    def __init__(self, dist_threshold=0.3, time_threshold=15.0):
        self.dist_threshold = dist_threshold
        self.time_threshold = time_threshold
        # (customer_track_id, staff_track_id) -> start_timestamp
        self.active_interactions = {}
        # set of (customer_track_id, staff_track_id) that have already triggered event in current interaction
        self.triggered_interactions = set()

    def update(self, active_tracks: dict, staff_ids: set, current_time: float) -> list:
        """
        active_tracks: track_id -> {"centroid": [cx, cy], "visitor_id": str}
        staff_ids: set of visitor_id strings that are identified as staff
        current_time: float representing current video timestamp in seconds
        Returns list of STAFF_INTERACTION event dicts.
        """
        events = []
        
        # Separate customers and staff currently visible
        customers = []
        staff_members = []
        
        for tid, data in active_tracks.items():
            vid = data.get("visitor_id")
            if not vid:
                continue
            if vid in staff_ids:
                staff_members.append((tid, data["centroid"], vid))
            else:
                customers.append((tid, data["centroid"], vid))

        current_pairs = set()
        
        # Check all customer-staff pairs
        for cust_tid, cust_c, cust_vid in customers:
            for staff_tid, staff_c, staff_vid in staff_members:
                dist = math.sqrt((cust_c[0] - staff_c[0])**2 + (cust_c[1] - staff_c[1])**2)
                
                if dist <= self.dist_threshold:
                    pair = (cust_tid, staff_tid)
                    current_pairs.add(pair)
                    
                    if pair not in self.active_interactions:
                        self.active_interactions[pair] = current_time
                    else:
                        start_time = self.active_interactions[pair]
                        elapsed = current_time - start_time
                        
                        if elapsed >= self.time_threshold and pair not in self.triggered_interactions:
                            self.triggered_interactions.add(pair)
                            events.append({
                                "event": "STAFF_INTERACTION",
                                "customer_id": cust_vid,
                                "staff_id": staff_vid,
                                "duration": round(elapsed, 2)
                            })

        # Clean up pairs that are no longer in proximity
        for pair in list(self.active_interactions.keys()):
            if pair not in current_pairs:
                del self.active_interactions[pair]
                self.triggered_interactions.discard(pair)
                
        return events

    def reset(self):
        self.active_interactions = {}
        self.triggered_interactions = set()
