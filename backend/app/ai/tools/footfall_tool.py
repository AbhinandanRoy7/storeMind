from app.core.supabase import get_supabase

def get_footfall_stats(date: str = None) -> dict:
    """Returns the total number of store entries (footfall) and active sessions."""
    supabase = get_supabase()
    
    res = supabase.table("sessions").select("*", count="exact").execute()
    total_sessions = len(res.data)
    
    pur_res = supabase.table("sessions").select("*", count="exact").eq("conversion_status", True).execute()
    total_purchases = len(pur_res.data)
    
    return {
        "total_footfall": total_sessions,
        "total_purchases": total_purchases
    }
