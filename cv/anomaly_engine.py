# cv/anomaly_engine.py

class AnomalyEngine:
    def __init__(self, dead_zone_threshold=1800.0, camera_failure_threshold=10.0):
        self.dead_zone_threshold = dead_zone_threshold
        self.camera_failure_threshold = camera_failure_threshold
        
        # zone_name -> timestamp of last visitor detection
        self.last_zone_detection = {}
        # camera_id -> timestamp of last detection
        self.last_camera_detection = {}
        
        # Set of active anomalies currently triggered (to avoid duplicate spam)
        self.active_anomalies = set()

    def update(self, 
               current_time: float, 
               queue_length: int, 
               active_visitors_count: int, 
               active_staff_count: int, 
               camera_detections: dict) -> list:
        """
        Runs check rules and returns a list of anomaly event dicts.
        camera_detections: camera_id -> detection_count
        """
        anomalies = []

        # Rule 1: Queue Spike
        if queue_length > 5:
            anomaly_key = "QUEUE_SPIKE"
            if anomaly_key not in self.active_anomalies:
                self.active_anomalies.add(anomaly_key)
                anomalies.append({
                    "event": "ANOMALY",
                    "anomaly_type": "QUEUE_SPIKE",
                    "severity": "HIGH",
                    "description": f"Billing queue size is critical: {queue_length} customers waiting."
                })
        else:
            self.active_anomalies.discard("QUEUE_SPIKE")

        # Rule 2: Staff Shortage
        # If there are customers but no staff, or ratio is > 10
        if active_visitors_count > 0:
            if active_staff_count == 0 and active_visitors_count > 10:
                anomaly_key = "STAFF_SHORTAGE"
                if anomaly_key not in self.active_anomalies:
                    self.active_anomalies.add(anomaly_key)
                    anomalies.append({
                        "event": "ANOMALY",
                        "anomaly_type": "STAFF_SHORTAGE",
                        "severity": "HIGH",
                        "description": f"Staff shortage detected! {active_visitors_count} customers in store and 0 staff."
                    })
            elif active_staff_count > 0 and (active_visitors_count / active_staff_count) > 10:
                anomaly_key = "STAFF_SHORTAGE"
                if anomaly_key not in self.active_anomalies:
                    self.active_anomalies.add(anomaly_key)
                    anomalies.append({
                        "event": "ANOMALY",
                        "anomaly_type": "STAFF_SHORTAGE",
                        "severity": "WARNING",
                        "description": f"Shopper-to-staff ratio is high: {active_visitors_count / active_staff_count:.1f} (Customers: {active_visitors_count}, Staff: {active_staff_count})."
                    })
            else:
                self.active_anomalies.discard("STAFF_SHORTAGE")
        else:
            self.active_anomalies.discard("STAFF_SHORTAGE")

        # Rule 3: Camera Failure
        # Update last seen detection for each camera
        for cam_id, count in camera_detections.items():
            if count > 0:
                self.last_camera_detection[cam_id] = current_time
            else:
                last_seen = self.last_camera_detection.get(cam_id, 0.0)
                elapsed = current_time - last_seen
                if elapsed >= self.camera_failure_threshold:
                    anomaly_key = f"CAMERA_FAILURE_{cam_id}"
                    if anomaly_key not in self.active_anomalies:
                        self.active_anomalies.add(anomaly_key)
                        anomalies.append({
                            "event": "ANOMALY",
                            "anomaly_type": "CAMERA_FAILURE",
                            "severity": "CRITICAL",
                            "description": f"Camera feed fail alert: 0 detections on {cam_id} for {elapsed:.1f}s."
                        })
                else:
                    self.active_anomalies.discard(f"CAMERA_FAILURE_{cam_id}")

        return anomalies

    def register_zone_visitor(self, zone_name: str, current_time: float):
        self.last_zone_detection[zone_name] = current_time

    def check_dead_zones(self, current_time: float, active_zones: list) -> list:
        """
        Checks if any shelf zone has seen 0 visitors for 30 minutes.
        """
        anomalies = []
        for zone in active_zones:
            last_seen = self.last_zone_detection.get(zone, 0.0)
            elapsed = current_time - last_seen
            if elapsed >= self.dead_zone_threshold:
                anomaly_key = f"DEAD_ZONE_{zone}"
                if anomaly_key not in self.active_anomalies:
                    self.active_anomalies.add(anomaly_key)
                    anomalies.append({
                        "event": "ANOMALY",
                        "anomaly_type": "DEAD_ZONE",
                        "severity": "LOW",
                        "description": f"Dead zone detected: shelf zone '{zone}' has had 0 visits in the last 30 minutes."
                    })
        return anomalies

    def reset(self):
        self.last_zone_detection = {}
        self.last_camera_detection = {}
        self.active_anomalies = set()
