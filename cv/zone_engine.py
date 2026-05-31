# cv/zone_engine.py

from cv.config.cameras import CAMERAS

def point_in_polygon(x, y, poly):
    """
    Ray-casting algorithm to check if a point (x, y) is inside a polygon.
    poly is a list of [x, y] coordinates.
    """
    n = len(poly)
    inside = False
    if n < 3:
        return False
        
    p1x, p1y = poly[0]
    for i in range(n + 1):
        p2x, p2y = poly[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xints = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xints:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside

class ZoneEngine:
    def __init__(self):
        # track_id -> current_zone
        self.visitor_zones = {}

    def update(self, camera_id: str, track_id: str, centroid: list) -> list:
        """
        Updates visitor position and checks for zone entries/exits.
        Returns a list of event dicts:
        [
            {"event": "ZONE_ENTER", "zone": "MINIMALIST"},
            {"event": "ZONE_EXIT", "zone": "LAKME"}
        ]
        """
        camera_conf = CAMERAS.get(camera_id, {})
        zones = camera_conf.get("zones", {})
        
        cx, cy = centroid
        new_zone = None
        
        # Check which zone the centroid falls into
        for zone_name, polygon in zones.items():
            if point_in_polygon(cx, cy, polygon):
                new_zone = zone_name
                break  # Assumes disjoint shelves for simplicity
                
        prev_zone = self.visitor_zones.get(track_id)
        events = []
        
        if prev_zone != new_zone:
            # Handle exit from previous zone
            if prev_zone:
                events.append({
                    "event": "ZONE_EXIT",
                    "zone": prev_zone
                })
            # Handle enter into new zone
            if new_zone:
                events.append({
                    "event": "ZONE_ENTER",
                    "zone": new_zone
                })
            self.visitor_zones[track_id] = new_zone
            
        return events
        
    def get_current_zone(self, track_id: str) -> str:
        return self.visitor_zones.get(track_id)

    def reset(self):
        self.visitor_zones = {}
