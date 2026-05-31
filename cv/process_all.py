"""
StoreMind AI — Phase 2 Real CCTV Processing Pipeline
Processes all 5 cameras, generates debug videos, stores events to Supabase.

Usage:
    python -m cv.process_all
    python cv/process_all.py
"""

import os
import sys
import time
import json
import cv2
import numpy as np
from datetime import datetime, timezone, timedelta
from pathlib import Path

# ── path setup ────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from cv.config.cameras import CAMERAS
from cv.detection import PersonDetector
from cv.visitor_registry import VisitorRegistry
from cv.entry_exit_engine import EntryExitEngine
from cv.zone_engine import ZoneEngine
from cv.dwell_engine import DwellEngine
from cv.billing_engine import BillingEngine
from cv.queue_engine import QueueEngine
from cv.session_engine import SessionEngine
from cv.funnel_engine import FunnelEngine
from cv.heatmap_engine import HeatmapEngine
from cv.anomaly_engine import AnomalyEngine

try:
    import requests
    BACKEND_URL = "http://localhost:8000/api/v1/events/ingest"
    BACKEND_AVAILABLE = True
except ImportError:
    BACKEND_AVAILABLE = False

# ── constants ─────────────────────────────────────────────────────────────────
CCTV_DIR   = ROOT / "CCTV Footage"
OUTPUT_DIR = ROOT / "outputs"
YOLO_MODEL = str(ROOT / "yolov8s.pt")

# Process every Nth frame (6 = process 5fps from 30fps footage, good balance of speed & accuracy)
FRAME_SKIP = 6
# Start time for synthetic timestamps (today at 10:00 AM UTC)
SESSION_START = datetime.now(timezone.utc).replace(hour=10, minute=0, second=0, microsecond=0)


# ── helpers ───────────────────────────────────────────────────────────────────
def pixel_centroid_from_norm(cx_norm, cy_norm, w, h):
    return int(cx_norm * w), int(cy_norm * h)


def draw_zone_overlays(frame, cam_id):
    """Draw zone polygons + labels on frame."""
    h, w = frame.shape[:2]
    cam_conf = CAMERAS.get(cam_id, {})
    for zone_name, poly_norm in cam_conf.get("zones", {}).items():
        pts = np.array([[int(x * w), int(y * h)] for x, y in poly_norm], np.int32)
        cv2.polylines(frame, [pts], True, (0, 200, 255), 2)
        cx = int(np.mean([p[0] for p in pts]))
        cy = int(np.mean([p[1] for p in pts]))
        cv2.putText(frame, zone_name, (cx - 40, cy), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 200, 255), 1)

    # Draw virtual entry line for CAM_3
    vl = cam_conf.get("virtual_line")
    if vl:
        x1 = int(vl["start"][0] * w); y1 = int(vl["start"][1] * h)
        x2 = int(vl["end"][0] * w);   y2 = int(vl["end"][1] * h)
        cv2.line(frame, (x1, y1), (x2, y2), (0, 0, 255), 3)
        cv2.putText(frame, "ENTRY LINE", (x1 + 10, y1 - 8),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    return frame


def push_event(payload: dict):
    """Non-blocking push to FastAPI backend."""
    if not BACKEND_AVAILABLE:
        return
    try:
        requests.post(BACKEND_URL, json={"events": [payload]}, timeout=1.5)
    except Exception:
        pass


# ── per-camera processor ──────────────────────────────────────────────────────
def process_camera(
    cam_id: str,
    video_path: Path,
    detector: PersonDetector,
    visitor_registry: VisitorRegistry,
    entry_exit_engine: EntryExitEngine,
    zone_engine: ZoneEngine,
    dwell_engine: DwellEngine,
    billing_engine: BillingEngine,
    queue_engine: QueueEngine,
    session_engine: SessionEngine,
    heatmap_engine: HeatmapEngine,
    anomaly_engine: AnomalyEngine,
    all_events: list,
    predictions: dict,
):
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        print(f"[ERROR] Cannot open {video_path}")
        return

    fps    = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total  = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    w      = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h      = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    out_fps = fps / FRAME_SKIP

    OUTPUT_DIR.mkdir(exist_ok=True)
    out_path = OUTPUT_DIR / f"{cam_id}_debug.mp4"
    writer = cv2.VideoWriter(
        str(out_path),
        cv2.VideoWriter_fourcc(*"mp4v"),
        out_fps,
        (w, h),
    )

    cam_conf = CAMERAS.get(cam_id, {})
    print(f"\n[{cam_id}] Processing {total} frames @ {fps:.0f}fps → {video_path.name}", flush=True)
    print(f"[{cam_id}] Debug output → {out_path}", flush=True)

    frame_idx = 0
    processed = 0
    t_start = time.time()

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_idx += 1
        if frame_idx % FRAME_SKIP != 0:
            continue

        processed += 1
        t_sec = frame_idx / fps  # seconds into the video

        # ── YOLO + ByteTrack ─────────────────────────────────────────────────
        detections = detector.detect_and_track(frame)

        tracks_this_frame = {}

        for det in detections:
            raw_tid = det["track_id"]
            cx_n, cy_n = det["centroid"]
            bbox = det["bbox"]
            conf = det["confidence"]

            # track_id → visitor_id (persistent across camera-restarts)
            vis_id = visitor_registry.get_or_create_visitor(cam_id, raw_tid, frame, bbox, t_sec)
            tracks_this_frame[vis_id] = {"centroid": [cx_n, cy_n], "bbox": bbox}

            # ── Entry / Exit (CAM_3 only — has virtual_line) ─────────────────
            if "virtual_line" in cam_conf:
                ev = entry_exit_engine.update(vis_id, [cx_n, cy_n], cam_conf["virtual_line"])
                if ev == "ENTRY":
                    session_engine.start_session(vis_id, t_sec)
                    payload = _make_payload(vis_id, "ENTRY", t_sec, conf, cam_id)
                    all_events.append(payload); predictions["entries"] += 1
                    push_event(payload)
                    print(f"  [EVENT] ENTRY  → {vis_id}")
                elif ev == "EXIT":
                    # Infer PURCHASE if visitor had a billing visit
                    if billing_engine.has_billing_visit(vis_id):
                        p = _make_payload(vis_id, "PURCHASE", t_sec, 0.92, cam_id)
                        all_events.append(p); predictions["purchases"] += 1
                        push_event(p)
                        session_engine.add_event(vis_id, "PURCHASE", t_sec)
                        print(f"  [EVENT] PURCHASE → {vis_id}")
                    payload = _make_payload(vis_id, "EXIT", t_sec, conf, cam_id)
                    all_events.append(payload)
                    push_event(payload)
                    session_engine.end_session(vis_id, t_sec)
                    print(f"  [EVENT] EXIT   → {vis_id}")

            # ── Zone Engine ──────────────────────────────────────────────────
            zone_events = zone_engine.update(cam_id, vis_id, [cx_n, cy_n])
            for ze in zone_events:
                zone_name = ze["zone"]
                if ze["event"] == "ZONE_ENTER":
                    heatmap_engine.register_zone_entry(zone_name)
                    dwell_engine.handle_zone_event(vis_id, "ZONE_ENTER", zone_name, t_sec)
                    session_engine.add_event(vis_id, "ZONE_VISIT", t_sec)
                    payload = _make_payload(vis_id, "ZONE_ENTER", t_sec, conf, cam_id,
                                            extra={"zone": zone_name})
                    all_events.append(payload)
                    push_event(payload)

                    # Billing engine
                    for bev in billing_engine.update(vis_id, zone_name, "ZONE_ENTER", t_sec):
                        bp = _make_payload(vis_id, bev["event"], t_sec, bev.get("confidence", 0.9), cam_id)
                        all_events.append(bp); push_event(bp)
                        session_engine.add_event(vis_id, bev["event"], t_sec)
                        print(f"  [EVENT] {bev['event']} → {vis_id} in {zone_name}")

                elif ze["event"] == "ZONE_EXIT":
                    dwell_ev = dwell_engine.handle_zone_event(vis_id, "ZONE_EXIT", zone_name, t_sec)
                    if dwell_ev:
                        heatmap_engine.register_zone_dwell(zone_name, dwell_ev["duration"])
                        payload = _make_payload(vis_id, "ZONE_DWELL", t_sec, conf, cam_id,
                                                extra={"zone": zone_name,
                                                       "dwell_seconds": round(dwell_ev["duration"], 1)})
                        all_events.append(payload); push_event(payload)
                    for bev in billing_engine.update(vis_id, zone_name, "ZONE_EXIT", t_sec):
                        bp = _make_payload(vis_id, bev["event"], t_sec, bev.get("confidence", 0.9), cam_id)
                        all_events.append(bp); push_event(bp)

            # ── Queue Engine ─────────────────────────────────────────────────
            q_events = queue_engine.update(cam_id, vis_id, [cx_n, cy_n], t_sec) if hasattr(queue_engine, "update") else []
            for qev in (q_events or []):
                payload = _make_payload(vis_id, qev["event"], t_sec, 0.85, cam_id)
                all_events.append(payload)
                if qev["event"] == "QUEUE_JOIN":
                    predictions["queue_joins"] += 1
                push_event(payload)

        # ── Annotate & write debug frame ─────────────────────────────────────
        debug = frame.copy()
        debug = draw_zone_overlays(debug, cam_id)

        for vis_id, td in tracks_this_frame.items():
            x1, y1, x2, y2 = [int(v) for v in td["bbox"]]
            cx_px, cy_px = int(td["centroid"][0] * w), int(td["centroid"][1] * h)
            cv2.rectangle(debug, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.circle(debug, (cx_px, cy_px), 4, (0, 255, 0), -1)
            cv2.putText(debug, vis_id[-6:], (x1, y1 - 6),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)

        elapsed = time.time() - t_start
        proc_fps = processed / elapsed if elapsed > 0 else 0.0
        cv2.putText(debug, f"{cam_id}  frame {frame_idx}/{total}  {proc_fps:.1f} FPS",
                    (10, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(debug, f"Tracks: {len(tracks_this_frame)}  Events: {len(all_events)}",
                    (10, 54), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 1)

        writer.write(debug)

        if processed % 50 == 0:
            pct = (frame_idx / total) * 100
            print(f"  [{cam_id}] {pct:.0f}%  frame={frame_idx}  tracks={len(tracks_this_frame)}  "
                  f"events={len(all_events)}  fps={proc_fps:.1f}", flush=True)

    cap.release()
    writer.release()
    print(f"[{cam_id}] Done. {processed} frames processed. Debug → {out_path}", flush=True)


def _make_payload(vis_id, event_type, t_sec, conf, cam_id, extra=None):
    ts = (SESSION_START + timedelta(seconds=t_sec)).isoformat()
    p = {
        "visitor_id":  vis_id,
        "event_type":  event_type,
        "timestamp":   ts,
        "confidence":  round(conf, 3),
        "metadata":    {"camera_id": cam_id, **(extra or {})},
    }
    if extra and "zone" in extra:
        p["zone_id"] = extra["zone"]
    return p


# ── main ──────────────────────────────────────────────────────────────────────
def run_all():
    print("=" * 60, flush=True)
    print("   STOREMIND AI  —  PHASE 2 REAL CCTV PIPELINE", flush=True)
    print("=" * 60, flush=True)
    print(f"CCTV dir : {CCTV_DIR}", flush=True)
    print(f"Outputs  : {OUTPUT_DIR}", flush=True)
    print(f"Model    : {YOLO_MODEL}", flush=True)
    print(f"Frame skip: every {FRAME_SKIP} frames", flush=True)
    print(flush=True)

    # ── shared engines ────────────────────────────────────────────────────────
    detector         = PersonDetector(YOLO_MODEL)
    visitor_registry = VisitorRegistry()
    entry_exit       = EntryExitEngine()
    zone_engine      = ZoneEngine()
    dwell_engine     = DwellEngine()
    billing_engine   = BillingEngine()
    queue_engine     = QueueEngine()
    session_engine   = SessionEngine()
    funnel_engine    = FunnelEngine()
    heatmap_engine   = HeatmapEngine()
    anomaly_engine   = AnomalyEngine()

    all_events: list = []
    predictions = {"entries": 0, "purchases": 0, "queue_joins": 0, "anomalies": 0}

    total_start = time.time()

    # ── process each camera sequentially (GPU memory safe) ───────────────────
    for i in range(1, 6):
        cam_id    = f"CAM_{i}"
        vid_path  = CCTV_DIR / f"CAM {i}.mp4"
        if not vid_path.exists():
            print(f"[SKIP] {vid_path} not found")
            continue

        process_camera(
            cam_id, vid_path,
            detector, visitor_registry,
            entry_exit, zone_engine, dwell_engine,
            billing_engine, queue_engine,
            session_engine, heatmap_engine, anomaly_engine,
            all_events, predictions,
        )

    total_elapsed = time.time() - total_start

    # ── final analytics ───────────────────────────────────────────────────────
    completed_sessions = session_engine.get_all_completed()
    funnel = funnel_engine.compute_funnel(completed_sessions)
    heatmaps = heatmap_engine.get_analytics()

    conversion = (funnel["purchase"] / funnel["entry"] * 100) if funnel["entry"] > 0 else 0.0

    print("\n" + "=" * 60)
    print("   PIPELINE COMPLETE")
    print("=" * 60)
    print(f"Total processing time : {total_elapsed:.1f}s")
    print(f"Total events generated: {len(all_events)}")
    print(f"\n--- FUNNEL ---")
    print(f"  Store Entries    : {funnel['entry']}")
    print(f"  Zone Visits      : {funnel['zone_visit']}")
    print(f"  Billing Visits   : {funnel['billing']}")
    print(f"  Purchases        : {funnel['purchase']}")
    print(f"  Conversion Rate  : {conversion:.1f}%")
    print(f"\n--- HEATMAP ---")
    for zone, visits in sorted(heatmaps.get("zone_popularity", {}).items(), key=lambda x: -x[1]):
        avg_d = heatmaps["avg_dwell"].get(zone, 0.0)
        print(f"  {zone:<20} {visits:>4} visits  avg dwell {avg_d:.0f}s")

    # ── save events to JSON ───────────────────────────────────────────────────
    out_json = OUTPUT_DIR / "all_events.json"
    with open(out_json, "w") as f:
        json.dump({"events": all_events, "summary": {
            "total_events": len(all_events),
            "funnel": funnel,
            "conversion_rate_pct": round(conversion, 2),
            "heatmaps": heatmaps,
            "processing_time_seconds": round(total_elapsed, 1),
        }}, f, indent=2)
    print(f"\n[Output] Events JSON → {out_json}")

    # ── ground truth validation ───────────────────────────────────────────────
    gt_path = ROOT / "evaluation" / "ground_truth.json"
    if gt_path.exists():
        with open(gt_path) as f:
            gt = json.load(f)
        print("\n--- GROUND TRUTH VALIDATION ---")
        for key in ["entries", "purchases", "queue_joins"]:
            pred = predictions.get(key, 0)
            truth = gt.get(key, 0)
            if truth > 0:
                precision = min(pred, truth) / pred if pred > 0 else 0
                recall    = min(pred, truth) / truth
                f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
                print(f"  {key:<15} pred={pred}  truth={truth}  P={precision:.2f}  R={recall:.2f}  F1={f1:.2f}")
            else:
                print(f"  {key:<15} pred={pred}  truth=N/A")

    print("\n[DONE] Open outputs/ to view debug videos.")
    print("[DONE] Check Supabase → events table for all ingested records.")
    return all_events, funnel, heatmaps


if __name__ == "__main__":
    run_all()
