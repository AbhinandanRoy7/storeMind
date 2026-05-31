# cv/tracking.py

import numpy as np

class PersonTracker:
    def __init__(self, max_lost=15, min_iou=0.3):
        self.max_lost = max_lost
        self.min_iou = min_iou
        self.next_track_id = 1
        self.tracks = {}  # track_id -> {"centroid": [cx, cy], "bbox": [x1, y1, x2, y2], "lost": int}

    def update(self, detections):
        """
        Updates tracks with list of detections.
        Each detection: {"bbox": [x1, y1, x2, y2], "confidence": float, "centroid": [cx, cy]}
        Returns updated tracks dict: track_id -> {"centroid": [cx, cy], "bbox": [x1, y1, x2, y2]}
        """
        # Increment lost counter for all existing tracks
        for tid in list(self.tracks.keys()):
            self.tracks[tid]["lost"] += 1

        if not detections:
            # Clean up old lost tracks
            self._cleanup_tracks()
            return self._active_tracks()

        # If there are no existing tracks, register all detections
        if not self.tracks:
            for det in detections:
                self._register(det)
            return self._active_tracks()

        # Get list of existing track IDs and their centroids
        track_ids = list(self.tracks.keys())
        track_centroids = np.array([self.tracks[tid]["centroid"] for tid in track_ids])

        # Get list of detection centroids
        det_centroids = np.array([det["centroid"] for det in detections])

        # Compute Euclidean distance matrix between existing track centroids and detection centroids
        distances = np.linalg.norm(track_centroids[:, np.newaxis] - det_centroids, axis=2)

        # Match tracks to detections
        # Find the smallest distances row by row
        row_indices = distances.min(axis=1).argsort()
        col_indices = distances.argmin(axis=1)[row_indices]

        used_rows = set()
        used_cols = set()

        for r, c in zip(row_indices, col_indices):
            if r in used_rows or c in used_cols:
                continue

            # If distance is too large, don't match (threshold in normalized coordinate space)
            if distances[r, c] > 0.15:
                continue

            tid = track_ids[r]
            det = detections[c]
            self.tracks[tid]["centroid"] = det["centroid"]
            self.tracks[tid]["bbox"] = det["bbox"]
            self.tracks[tid]["lost"] = 0
            
            used_rows.add(r)
            used_cols.add(c)

        # Deregister tracks that have been lost for too long
        self._cleanup_tracks()

        # Register remaining detections as new tracks
        for c, det in enumerate(detections):
            if c not in used_cols:
                self._register(det)

        return self._active_tracks()

    def _register(self, det):
        tid = self.next_track_id
        self.tracks[tid] = {
            "centroid": det["centroid"],
            "bbox": det["bbox"],
            "lost": 0
        }
        self.next_track_id += 1

    def _cleanup_tracks(self):
        for tid in list(self.tracks.keys()):
            if self.tracks[tid]["lost"] > self.max_lost:
                del self.tracks[tid]

    def _active_tracks(self):
        # Only return tracks that are currently active (not lost in the current frame)
        active = {}
        for tid, track in self.tracks.items():
            if track["lost"] == 0:
                active[f"track_{tid}"] = {
                    "centroid": track["centroid"],
                    "bbox": track["bbox"]
                }
        return active
