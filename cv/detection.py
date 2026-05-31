# cv/detection.py

import os
import cv2

class PersonDetector:
    def __init__(self, model_name="yolov8s.pt"):
        self.model_name = model_name
        self.model = None
        self.use_yolo = False
        
        try:
            from ultralytics import YOLO
            self.model = YOLO(model_name)
            self.use_yolo = True
            print(f"[Detector] YOLOv8s model loaded successfully.")
        except ImportError:
            print("[Detector] 'ultralytics' library not found. Cannot run real inference.")
        except Exception as e:
            print(f"[Detector] Failed to load YOLO model: {e}")

    def detect_and_track(self, frame):
        """
        Runs YOLO tracking (ByteTrack) on the frame.
        Returns a list of detections:
        {
            "track_id": "track_1",
            "bbox": [x1, y1, x2, y2],
            "confidence": float,
            "centroid": [norm_cx, norm_cy]
        }
        """
        if not self.use_yolo or frame is None:
            return []
            
        try:
            # Run inference, filter for person (class 0), use tracker
            results = self.model.track(frame, classes=[0], persist=True, verbose=False, tracker="bytetrack.yaml")
            detections = []
            
            if len(results) > 0 and results[0].boxes is not None:
                boxes = results[0].boxes
                
                # Check if IDs exist (might not in first frame or if tracking fails)
                if boxes.id is None:
                    return []
                    
                for box, track_id in zip(boxes, boxes.id):
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    conf = float(box.conf[0].item())
                    tid = int(track_id.item())
                    
                    cx = (x1 + x2) / 2.0
                    cy = (y1 + y2) / 2.0
                    
                    h, w = frame.shape[:2]
                    norm_cx = cx / w
                    norm_cy = cy / h
                    
                    detections.append({
                        "track_id": f"track_{tid}",
                        "bbox": [x1, y1, x2, y2],
                        "confidence": conf,
                        "centroid": [norm_cx, norm_cy]
                    })
            return detections
        except Exception as e:
            print(f"[Detector] Error running YOLO tracking: {e}")
            return []
