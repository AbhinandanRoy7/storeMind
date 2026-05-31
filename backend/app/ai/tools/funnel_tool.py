from app.core.supabase import get_supabase

def get_funnel_stats() -> dict:
    """Returns the store conversion funnel (Entries -> Zone Visits -> Billing -> Purchase)."""
    supabase = get_supabase()
    
    entries = supabase.table("events").select("*", count="exact").eq("event_type", "ENTRY").execute()
    zones = supabase.table("events").select("*", count="exact").eq("event_type", "ZONE_ENTER").execute()
    billing = supabase.table("events").select("*", count="exact").eq("event_type", "BILLING_VISIT").execute()
    purchases = supabase.table("events").select("*", count="exact").eq("event_type", "PURCHASE").execute()
    
    e_count = len(entries.data)
    p_count = len(purchases.data)
    conv = round((p_count / e_count * 100), 2) if e_count > 0 else 0.0
    
    return {
        "entries": e_count,
        "zone_visits": len(zones.data),
        "billing_visits": len(billing.data),
        "purchases": p_count,
        "overall_conversion_rate_percentage": conv
    }
