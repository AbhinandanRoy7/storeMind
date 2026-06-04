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
        
        if zone_name == "BILLING":
            self.billing_dwell[visitor_id] += 1.0
            
        duration = self.last_seen[visitor_id] - self.first_seen[visitor_id]
        
        # Calculate behavioral staff score
        # 0.4 weight for behind counter (normalized)
        counter_score = min(1.0, self.billing_dwell[visitor_id] / self.counter_dwell_threshold) * 0.4
        # 0.3 weight for continuous presence (normalized)
        presence_score = min(1.0, duration / self.continuous_work_threshold) * 0.3
        # 0.3 weight for cross-camera presence (normalized to 3 cameras)
        camera_score = min(1.0, len(self.seen_cameras[visitor_id]) / 3.0) * 0.3
        
        total_score = counter_score + presence_score + camera_score
        
        if total_score >= 0.6:  # Threshold for staff detection
            self.staff_visitors.add(visitor_id)
            print(f"[StaffEngine] Visitor {visitor_id} flagged as STAFF (Score: {total_score:.2f})")
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
