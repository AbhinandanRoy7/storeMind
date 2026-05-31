# cv/funnel_engine.py

class FunnelEngine:
    def __init__(self):
        pass

    def compute_funnel(self, completed_sessions: list) -> dict:
        """
        Computes the retail conversion funnel from completed sessions:
        ENTRY -> ZONE_VISIT -> BILLING -> PURCHASE
        Returns a dictionary of counts:
        {
            "entry": int,
            "zone_visit": int,
            "billing": int,
            "purchase": int
        }
        """
        counts = {
            "entry": 0,
            "zone_visit": 0,
            "billing": 0,
            "purchase": 0
        }
        
        for session in completed_sessions:
            events = session.get("events", [])
            
            # 1. Entry is always met since they entered the store to have a session
            counts["entry"] += 1
            
            # 2. Zone Visit: Visited any brand shelf
            has_zone_visit = False
            for event in events:
                if event.startswith("ZONE_ENTER") and "BILLING" not in event:
                    has_zone_visit = True
                    break
            if has_zone_visit:
                counts["zone_visit"] += 1
                
            # 3. Billing: Entered the billing counter zone
            has_billing = False
            for event in events:
                if "BILLING" in event:
                    has_billing = True
                    break
            if has_billing:
                counts["billing"] += 1
                
            # 4. Purchase: Completed a purchase
            if session.get("purchase_made", False) or "PURCHASE" in events:
                counts["purchase"] += 1
                
        return counts
