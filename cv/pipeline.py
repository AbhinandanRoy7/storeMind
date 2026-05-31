# cv/pipeline.py

import time
import requests
from datetime import datetime, timezone, timedelta

# Import all modules
from cv.config.cameras import CAMERAS
from cv.detection import PersonDetector
from cv.tracking import PersonTracker
from cv.visitor_registry import VisitorRegistry
from cv.entry_exit_engine import EntryExitEngine
from cv.zone_engine import ZoneEngine
from cv.dwell_engine import DwellEngine
from cv.product_interest import ProductInterestEngine
from cv.staff_interaction import StaffInteractionEngine
from cv.billing_engine import BillingEngine
from cv.queue_engine import QueueEngine
from cv.staff_detection import StaffDetectionEngine
from cv.session_engine import SessionEngine
from cv.funnel_engine import FunnelEngine
from cv.heatmap_engine import HeatmapEngine
from cv.anomaly_engine import AnomalyEngine
from cv.evaluation import EvaluationModule

class StoreMindPipeline:
    def __init__(self, backend_url="http://localhost:8000"):
        self.backend_url = backend_url
        self.ingest_endpoint = f"{backend_url}/api/v1/events/ingest"
        
        # Initialize all modules
        self.detector = PersonDetector()
        self.tracker = PersonTracker()
        self.visitor_registry = VisitorRegistry()
        self.entry_exit_engine = EntryExitEngine()
        self.zone_engine = ZoneEngine()
        self.dwell_engine = DwellEngine()
        self.product_interest_engine = ProductInterestEngine()
        self.staff_interaction_engine = StaffInteractionEngine()
        self.billing_engine = BillingEngine()
        self.queue_engine = QueueEngine()
        self.staff_detection_engine = StaffDetectionEngine()
        self.session_engine = SessionEngine()
        self.funnel_engine = FunnelEngine()
        self.heatmap_engine = HeatmapEngine()
        self.anomaly_engine = AnomalyEngine()
        self.evaluation_module = EvaluationModule()
        
        # In-memory stats
        self.all_events = []
        self.predictions = {
            "entries": 0,
            "purchases": 0,
            "queue_joins": 0,
            "anomalies": 0
        }

    def process_event(self, visitor_id: str, event_type: str, timestamp_sec: float, confidence: float = 0.95, metadata: dict = None, zone_id: str = None):
        """
        Ingests a single event into the pipeline state and logs it.
        """
        # Calculate real datetime timestamp offset from a starting time (e.g. today at 10 AM)
        start_dt = datetime.now(timezone.utc).replace(hour=10, minute=0, second=0, microsecond=0)
        event_dt = start_dt + timedelta(seconds=timestamp_sec)
        
        event_payload = {
            "visitor_id": visitor_id,
            "event_type": event_type,
            "timestamp": event_dt.isoformat(),
            "confidence": confidence,
            "metadata": metadata or {}
        }
        if zone_id:
            event_payload["zone_id"] = zone_id
            
        self.all_events.append(event_payload)
        
        # Update metrics for evaluation
        if event_type == "ENTRY":
            self.predictions["entries"] += 1
        elif event_type == "PURCHASE":
            self.predictions["purchases"] += 1
        elif event_type == "QUEUE_JOIN":
            self.predictions["queue_joins"] += 1
        elif event_type == "ANOMALY":
            self.predictions["anomalies"] += 1

        # Feed to Session Engine
        if event_type == "ENTRY":
            self.session_engine.start_session(visitor_id, timestamp_sec)
        elif event_type == "EXIT":
            self.session_engine.end_session(visitor_id, timestamp_sec)
        else:
            self.session_engine.add_event(visitor_id, event_type, timestamp_sec)

        # POST event to backend if online
        try:
            r = requests.post(self.ingest_endpoint, json={"events": [event_payload]}, timeout=2.0)
            if r.status_code == 200:
                print(f"[Pipeline] Successfully pushed {event_type} event to FastAPI backend.")
        except Exception:
            pass # Backend might not be running at this microsecond, keep going silently

    def run_real_inference(self, cctv_dir: str):
        """
        Process all 5 CCTV videos concurrently through the real detection pipeline.
        """
        print("\n=== STARTING REAL INFERENCE PIPELINE (CONCURRENT) ===")
        self.reset()
        import os
        import cv2
        import time
        from cv.visualizer import Visualizer
        
        caps = {}
        outs = {}
        vis = Visualizer(CAMERAS)
        
        for i in range(1, 6):
            cam_id = f"CAM_{i}"
            vid_path = os.path.join(cctv_dir, f"CAM {i}.mp4")
            out_path = os.path.join(os.path.dirname(cctv_dir), "outputs", f"debug_cam{i}.mp4")
            if os.path.exists(vid_path):
                cap = cv2.VideoCapture(vid_path)
                if cap.isOpened():
                    caps[cam_id] = cap
                    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                    fps = cap.get(cv2.CAP_PROP_FPS) or 30
                    os.makedirs(os.path.dirname(out_path), exist_ok=True)
                    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                    outs[cam_id] = cv2.VideoWriter(out_path, fourcc, fps, (w, h))
                else:
                    print(f"[Error] Cannot open video {vid_path}")
            else:
                print(f"[Warning] {vid_path} not found.")
                
        if not caps:
            print("[Error] No videos found to process.")
            return

        frame_idx = 0
        start_time = time.time()
        
        while True:
            frames_read = 0
            frames = {}
            for cam_id, cap in list(caps.items()):
                ret, frame = cap.read()
                if ret:
                    frames[cam_id] = frame
                    frames_read += 1
                else:
                    cap.release()
                    if outs.get(cam_id):
                        outs[cam_id].release()
                    del caps[cam_id]
                    if cam_id in outs:
                        del outs[cam_id]
                    
            if frames_read == 0:
                break
                
            frame_idx += 1
            t = frame_idx / 30.0
            
            for cam_id, frame in frames.items():
                cam_config = CAMERAS.get(cam_id, {})
                detections = self.detector.detect_and_track(frame)
                
                tracks = {}
                for det in detections:
                    tid = det["track_id"]
                    c = det["centroid"]
                    
                    vid = self.visitor_registry.get_or_create_visitor(cam_id, tid, frame, det["bbox"], t)
                    
                    tracks[vid] = {
                        "bbox": det["bbox"],
                        "centroid": c
                    }
                    
                    if "virtual_line" in cam_config:
                        entry_ev = self.entry_exit_engine.update(vid, c, cam_config["virtual_line"])
                        if entry_ev == "ENTRY":
                            self.session_engine.start_session(vid, t)
                            self.process_event(vid, "ENTRY", t, metadata={"camera_id": cam_id})
                        elif entry_ev == "EXIT":
                            if self.billing_engine.has_billing_visit(vid):
                                self.process_event(vid, "PURCHASE", t, confidence=0.98)
                                self.session_engine.add_event(vid, "PURCHASE", t)
                            self.process_event(vid, "EXIT", t, metadata={"camera_id": cam_id})
                            self.session_engine.end_session(vid, t)
                    
                    zone_events = self.zone_engine.update(cam_id, vid, c)
                    for ev in zone_events:
                        z_name = ev["zone"]
                        if ev["event"] == "ZONE_ENTER":
                            self.heatmap_engine.register_zone_entry(z_name)
                            self.process_event(vid, "ZONE_ENTER", t, metadata={"camera_id": cam_id, "zone": z_name})
                            self.dwell_engine.handle_zone_event(vid, "ZONE_ENTER", z_name, t)
                            self.session_engine.add_event(vid, "ZONE_VISIT", t)
                            
                            billing_events = self.billing_engine.update(vid, z_name, "ZONE_ENTER", t)
                            for bev in billing_events:
                                self.process_event(vid, bev["event"], t, confidence=bev.get("confidence", 0.9))
                                self.session_engine.add_event(vid, bev["event"], t)
                                
                        elif ev["event"] == "ZONE_EXIT":
                            self.process_event(vid, "ZONE_EXIT", t, metadata={"camera_id": cam_id, "zone": z_name})
                            dwell_event = self.dwell_engine.handle_zone_event(vid, "ZONE_EXIT", z_name, t)
                            if dwell_event:
                                self.heatmap_engine.register_zone_dwell(z_name, dwell_event["duration"])
                                
                            billing_events = self.billing_engine.update(vid, z_name, "ZONE_EXIT", t)
                            for bev in billing_events:
                                self.process_event(vid, bev["event"], t, metadata={"dwell_time": bev.get("dwell_time")})
                                self.session_engine.add_event(vid, bev["event"], t)
                                
                vis_frame = frame.copy()
                vis_frame = vis.draw_zones(vis_frame, cam_id)
                vis_frame = vis.draw_tracking(vis_frame, tracks)
                
                elapsed = time.time() - start_time
                proc_fps = (frame_idx * len(frames)) / elapsed if elapsed > 0 else 0.0
                outs[cam_id].write(vis.add_overlay(vis_frame, frame_idx, proc_fps))
                
            if frame_idx % 100 == 0:
                print(f"[Pipeline] Processed {frame_idx} frames across active cameras... (Overall FPS: {proc_fps:.1f})")
                
        print("\n=== REAL INFERENCE PIPELINE COMPLETED ===")

    def get_summary_report(self) -> str:
        completed = self.session_engine.get_all_completed()
        funnel = self.funnel_engine.compute_funnel(completed)
        heatmaps = self.heatmap_engine.get_analytics()
        evaluation_report = self.evaluation_module.generate_report_string(self.predictions)
        
        report = []
        report.append("==================================================")
        report.append("          STOREMIND AI PIPELINE REPORT            ")
        report.append("==================================================")
        report.append(f"Completed Shopper Sessions: {len(completed)}")
        for sess in completed:
            report.append(f"\nVisitor: {sess['visitor_id']}")
            report.append(f"  Duration: {sess['duration']}s")
            report.append(f"  Timeline: {' -> '.join(sess['events'])}")
            
        report.append("\n==================================================")
        report.append("             CONVERSION FUNNEL ANALYTICS          ")
        report.append("==================================================")
        report.append(f"Store Entries:     {funnel['entry']}")
        report.append(f"Brand Zone Visits: {funnel['zone_visit']}")
        report.append(f"Billing Arrived:   {funnel['billing']}")
        report.append(f"Purchase Conversions: {funnel['purchase']}")
        if funnel['entry'] > 0:
            conv = (funnel['purchase'] / funnel['entry']) * 100.0
            report.append(f"Conversion Rate:   {conv:.1f}%")
            
        report.append("\n==================================================")
        report.append("             ZONE HEATMAPS ENGAGEMENT             ")
        report.append("==================================================")
        report.append(f"{'Zone':<15} | {'Visits':<8} | {'Avg Dwell':<10} | {'Engagement':<10}")
        report.append("--------------------------------------------------")
        for zone in heatmaps["zone_popularity"].keys():
            pop = heatmaps["zone_popularity"].get(zone, 0)
            avg_d = heatmaps["avg_dwell"].get(zone, 0.0)
            score = heatmaps["engagement_score"].get(zone, 0.0)
            report.append(f"{zone:<15} | {pop:<8} | {avg_d:<10} | {score:<10}")

        report.append("\n" + evaluation_report)
        return "\n".join(report)

    def reset(self):
        self.all_events = []
        self.predictions = {
            "entries": 0,
            "purchases": 0,
            "queue_joins": 0,
            "anomalies": 0
        }
        self.entry_exit_engine.reset()
        self.zone_engine.reset()
        self.dwell_engine.reset()
        self.product_interest_engine.reset()
        self.staff_interaction_engine.reset()
        self.billing_engine.reset()
        self.queue_engine.reset()
        self.staff_detection_engine.reset()
        self.session_engine.reset()
        self.anomaly_engine.reset()
