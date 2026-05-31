# cv/visitor_registry.py

import cv2
import numpy as np

class VisitorRegistry:
    def __init__(self, match_threshold=0.6):
        self.mapping = {}  # (camera_id, track_id) -> visitor_id
        self.visitors = {} # visitor_id -> {"hist": np.ndarray, "last_seen": float, "camera_id": str}
        self.next_visitor_number = 1
        self.match_threshold = match_threshold

    def _compute_histogram(self, crop):
        if crop is None or crop.size == 0:
            return None
        hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
        hist = cv2.calcHist([hsv], [0, 1], None, [50, 60], [0, 180, 0, 256])
        cv2.normalize(hist, hist, 0, 1, cv2.NORM_MINMAX)
        return hist

    def get_or_create_visitor(self, camera_id: str, track_id: str, frame: np.ndarray, bbox: list, current_time: float) -> str:
        key = (camera_id, track_id)
        if key in self.mapping:
            vid = self.mapping[key]
            self.visitors[vid]["last_seen"] = current_time
            self.visitors[vid]["camera_id"] = camera_id
            return vid
            
        x1, y1, x2, y2 = [int(max(0, v)) for v in bbox]
        crop = frame[y1:y2, x1:x2]
        hist = self._compute_histogram(crop)
        
        if hist is not None:
            # Try to match with existing visitors from OTHER cameras
            best_match = None
            best_score = 0.0
            for vid, vdata in self.visitors.items():
                if vdata["camera_id"] == camera_id:
                    continue
                    
                if current_time - vdata["last_seen"] > 30.0:
                    continue
                    
                if vdata["hist"] is not None:
                    score = cv2.compareHist(hist, vdata["hist"], cv2.HISTCMP_CORREL)
                    if score > best_score and score > self.match_threshold:
                        best_score = score
                        best_match = vid
                    
            if best_match:
                self.mapping[key] = best_match
                self.visitors[best_match]["hist"] = hist 
                self.visitors[best_match]["last_seen"] = current_time
                self.visitors[best_match]["camera_id"] = camera_id
                print(f"[ReID] Matched {camera_id}:{track_id} to {best_match} (Score: {best_score:.2f})")
                return best_match
                
        # Create a new visitor
        vid = f"VIS_{self.next_visitor_number:03d}"
        self.mapping[key] = vid
        self.visitors[vid] = {
            "hist": hist,
            "last_seen": current_time,
            "camera_id": camera_id
        }
        self.next_visitor_number += 1
        return vid

    def reset(self):
        self.mapping = {}
        self.visitors = {}
        self.next_visitor_number = 1

