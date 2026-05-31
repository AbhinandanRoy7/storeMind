import cv2
import numpy as np

class Visualizer:
    def __init__(self, camera_config):
        self.camera_config = camera_config
        
    def draw_zones(self, frame, camera_id):
        if camera_id not in self.camera_config:
            return frame
            
        h, w = frame.shape[:2]
        cam_info = self.camera_config[camera_id]
        
        # Draw Zones
        if "zones" in cam_info:
            for zone_name, polygon in cam_info["zones"].items():
                # Convert normalized coords to pixel coords
                pts = np.array([[int(p[0] * w), int(p[1] * h)] for p in polygon], np.int32)
                pts = pts.reshape((-1, 1, 2))
                
                # Draw polygon
                cv2.polylines(frame, [pts], True, (255, 0, 0), 2)
                
                # Draw label with background
                x, y = pts[0][0]
                (label_w, label_h), _ = cv2.getTextSize(zone_name, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
                cv2.rectangle(frame, (x, y - label_h - 10), (x + label_w, y), (255, 0, 0), -1)
                cv2.putText(frame, zone_name, (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
                
        # Draw Virtual Lines
        if "virtual_line" in cam_info:
            line = cam_info["virtual_line"]
            start_pt = (int(line["start"][0] * w), int(line["start"][1] * h))
            end_pt = (int(line["end"][0] * w), int(line["end"][1] * h))
            cv2.line(frame, start_pt, end_pt, (0, 0, 255), 3)
            
            label = "ENTRY/EXIT LINE"
            (label_w, label_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            cv2.rectangle(frame, (start_pt[0], start_pt[1] - label_h - 10), (start_pt[0] + label_w, start_pt[1]), (0, 0, 255), -1)
            cv2.putText(frame, label, (start_pt[0], start_pt[1] - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
        return frame
        
    def draw_tracking(self, frame, tracks):
        """
        tracks: dict of { track_id: {"bbox": [x1,y1,x2,y2], "centroid": [cx,cy]} }
        """
        h, w = frame.shape[:2]
        for tid, data in tracks.items():
            x1, y1, x2, y2 = [int(v) for v in data["bbox"]]
            cx, cy = int(data["centroid"][0] * w), int(data["centroid"][1] * h)
            
            # Bounding box
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            # Centroid
            cv2.circle(frame, (cx, cy), 5, (0, 0, 255), -1)
            
            # Label
            label = str(tid)
            (label_w, label_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
            cv2.rectangle(frame, (x1, y1 - label_h - 10), (x1 + label_w, y1), (0, 255, 0), -1)
            cv2.putText(frame, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
            
        return frame
        
    def add_overlay(self, frame, frame_idx, fps):
        cv2.putText(frame, f"Frame: {frame_idx}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        cv2.putText(frame, f"FPS: {fps:.1f}", (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        return frame
