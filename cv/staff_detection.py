# cv/staff_detection.py

class StaffDetectionEngine:
    def __init__(self, counter_dwell_threshold=30.0, continuous_work_threshold=120.0):
        self.counter_dwell_threshold = counter_dwell_threshold
        self.continuous_work_threshold = continuous_work_threshold
        
        # visitor_id -> cumulative dwell in billing counter zone
        self.billing_dwell = {}
        # visitor_id -> first seen timestamp
        self.first_seen = {}
        # visitor_id -> last seen timestamp
        self.last_seen = {}
        # visitor_id -> set of camera IDs where seen
        self.seen_cameras = {}
        
        # Set of confirmed staff visitor IDs
        self.staff_visitors = set()

    def update(self, visitor_id: str, camera_id: str, zone_name: str, current_time: float) -> bool:
        """
        Updates tracking statistics for a visitor to determine if they are staff.
        Returns True if they are classified as staff, False otherwise.
        """
        if visitor_id in self.staff_visitors:
            return True
            
        # Update seen timestamps
        if visitor_id not in self.first_seen:
            self.first_seen[visitor_id] = current_time
            self.seen_cameras[visitor_id] = set()
            self.billing_dwell[visitor_id] = 0.0
            
        self.last_seen[visitor_id] = current_time
        self.seen_cameras[visitor_id].add(camera_id)
        
        # Rule 1: Spend a lot of time in the Billing zone (specifically behind the counter area)
        # Note: For CCTV cameras, the staff member spends cumulative time at BILLING
        if zone_name == "BILLING":
            # Assume 1 second intervals for simplicity in cumulative updates
            self.billing_dwell[visitor_id] += 1.0
            if self.billing_dwell[visitor_id] >= self.counter_dwell_threshold:
                self.staff_visitors.add(visitor_id)
                print(f"[StaffEngine] Visitor {visitor_id} flagged as STAFF (Rule: Spend > {self.counter_dwell_threshold}s at billing counter)")
                return True
                
        # Rule 2: Appears continuously over a long period (e.g. >120s)
        duration = self.last_seen[visitor_id] - self.first_seen[visitor_id]
        if duration >= self.continuous_work_threshold:
            self.staff_visitors.add(visitor_id)
            print(f"[StaffEngine] Visitor {visitor_id} flagged as STAFF (Rule: Continuous store presence > {self.continuous_work_threshold}s)")
            return True
            
        # Rule 3: Appears in multiple camera feeds (e.g. >= 3 cameras)
        if len(self.seen_cameras[visitor_id]) >= 3:
            self.staff_visitors.add(visitor_id)
            print(f"[StaffEngine] Visitor {visitor_id} flagged as STAFF (Rule: Seen in multiple cameras: {self.seen_cameras[visitor_id]})")
            return True
            
        return False

    def is_staff(self, visitor_id: str) -> bool:
        return visitor_id in self.staff_visitors

    def get_staff_set(self) -> set:
        return self.staff_visitors

    def reset(self):
        self.billing_dwell = {}
        self.first_seen = {}
        self.last_seen = {}
        self.seen_cameras = {}
        self.staff_visitors = set()
