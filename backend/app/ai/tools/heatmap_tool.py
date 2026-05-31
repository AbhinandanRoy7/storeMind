from app.core.supabase import get_supabase

def get_zone_engagement() -> dict:
    """Returns zone popularity and engagement metrics based on zone events."""
    supabase = get_supabase()
    
    res = supabase.table("events").select("*").in_("event_type", ["ZONE_ENTER", "ZONE_EXIT"]).execute()
    
    zones = {}
    for ev in res.data:
        meta = ev.get("metadata", {})
        if not meta: continue
        z_name = meta.get("zone", "UNKNOWN")
        if z_name == "UNKNOWN": continue
        
        if z_name not in zones:
            zones[z_name] = {"visits": 0, "total_dwell": 0.0}
            
        if ev["event_type"] == "ZONE_ENTER":
            zones[z_name]["visits"] += 1
        elif ev["event_type"] == "ZONE_EXIT":
            zones[z_name]["total_dwell"] += meta.get("dwell_time", 0.0)
            
    output = {}
    for z, data in zones.items():
        v = data["visits"]
        output[z] = {
            "visits": v,
            "avg_dwell_seconds": round(data["total_dwell"] / v, 2) if v > 0 else 0.0
        }
    return output
