# cv/entry_exit_engine.py

def ccw(A, B, C):
    return (C[1]-A[1]) * (B[0]-A[0]) > (B[1]-A[1]) * (C[0]-A[0])

def intersect(A, B, C, D):
    return ccw(A, C, D) != ccw(B, C, D) and ccw(A, B, C) != ccw(A, B, D)

class EntryExitEngine:
    def __init__(self):
        self.history = {}  # track_id -> list of centroids

    def update(self, track_id: str, centroid: list, virtual_line: dict) -> str:
        """
        virtual_line: {"start": [x1, y1], "end": [x2, y2]}
        Returns: "ENTRY", "EXIT", or None.
        """
        if not virtual_line:
            return None
            
        cx, cy = centroid
        if track_id not in self.history:
            self.history[track_id] = [centroid]
            return None
        
        prev_centroid = self.history[track_id][-1]
        self.history[track_id].append(centroid)
        
        # Keep history short
        if len(self.history[track_id]) > 10:
            self.history[track_id].pop(0)
            
        A = virtual_line["start"]
        B = virtual_line["end"]
        C = prev_centroid
        D = centroid
        
        if intersect(A, B, C, D):
            # Assuming top of the screen (y=0) is deeper inside the store.
            # D[1] < C[1] means moving "up" the screen, which is entering.
            if D[1] < C[1]:
                return "ENTRY"
            else:
                return "EXIT"
            
        return None
        
    def reset(self):
        self.history = {}

