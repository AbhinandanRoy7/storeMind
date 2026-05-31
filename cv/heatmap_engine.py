# cv/heatmap_engine.py

class HeatmapEngine:
    def __init__(self):
        # zone_name -> list of dwell times
        self.zone_dwells = {}
        # zone_name -> count of entries
        self.zone_popularity = {}

    def register_zone_entry(self, zone_name: str):
        if zone_name not in self.zone_popularity:
            self.zone_popularity[zone_name] = 0
        self.zone_popularity[zone_name] += 1

    def register_zone_dwell(self, zone_name: str, dwell_time: float):
        if zone_name not in self.zone_dwells:
            self.zone_dwells[zone_name] = []
        self.zone_dwells[zone_name].append(dwell_time)

    def get_analytics(self) -> dict:
        """
        Computes popularity, average dwell, and engagement score for all active zones.
        Returns:
        {
            "zone_popularity": {zone: count},
            "avg_dwell": {zone: seconds},
            "engagement_score": {zone: score}
        }
        """
        popularity = {}
        avg_dwell = {}
        engagement_score = {}
        
        # All unique zones we have observed
        all_zones = set(self.zone_popularity.keys()).union(self.zone_dwells.keys())
        
        for zone in all_zones:
            pop = self.zone_popularity.get(zone, 0)
            popularity[zone] = pop
            
            dwells = self.zone_dwells.get(zone, [])
            avg_d = round(sum(dwells) / len(dwells), 2) if dwells else 0.0
            avg_dwell[zone] = avg_d
            
            # Engagement Heuristic: popularity * average dwell time
            # High popularity + high dwell means a highly engaging product zone
            engagement_score[zone] = round(pop * avg_d, 2)
            
        return {
            "zone_popularity": popularity,
            "avg_dwell": avg_dwell,
            "engagement_score": engagement_score
        }

    def reset(self):
        self.zone_dwells = {}
        self.zone_popularity = {}
