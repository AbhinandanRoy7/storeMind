from app.core.supabase import get_supabase

def get_active_anomalies() -> list:
    """Returns all active operational anomalies (e.g. Queue Spike, Dead Zone)."""
    supabase = get_supabase()
    res = supabase.table("anomalies").select("*").eq("status", "ACTIVE").execute()
    return res.data
