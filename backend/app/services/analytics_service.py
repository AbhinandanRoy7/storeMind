from app.core.supabase import get_supabase
from app.services.pos_correlation import pos_service
import datetime

class AnalyticsService:
    def __init__(self):
        self.db = get_supabase()

    def get_metrics(self, store_id: str):
        # Fetch events for today (for MVP, we just fetch all to mock "real-time today")
        events_resp = self.db.table("events").select("visitor_id, event_type, metadata").execute()
        rows = events_resp.data or []
        
        # 1. Unique Visitors (exclude staff)
        visitors = set()
        for r in rows:
            is_staff = (r.get("metadata") or {}).get("is_staff", False)
            if not is_staff:
                visitors.add(r["visitor_id"])
        
        unique_visitors = len(visitors)
        
        # 2. Conversion Rate and Revenue (via POS Correlation)
        sessions_resp = self.db.table("sessions").select("*").execute()
        # Correlate sessions with POS data in-memory
        correlated_sessions = pos_service.correlate_sessions(sessions_resp.data)
        
        total_sessions = len(correlated_sessions)
        converted = sum(1 for s in correlated_sessions if s.get("conversion_status"))
        conversion_rate = (converted / total_sessions * 100) if total_sessions > 0 else 0.0
        
        total_revenue = sum(s.get("basket_value_inr", 0.0) for s in correlated_sessions)
        avg_basket_size = (total_revenue / converted) if converted > 0 else 0.0
        revenue_per_visitor = (total_revenue / unique_visitors) if unique_visitors > 0 else 0.0
        
        # 3. Avg Dwell per zone
        zone_dwells = {}
        for r in rows:
            if r["event_type"] == "ZONE_DWELL":
                z = (r.get("metadata") or {}).get("zone", "UNKNOWN")
                dwell = (r.get("metadata") or {}).get("dwell_ms", 0)
                if z not in zone_dwells:
                    zone_dwells[z] = []
                zone_dwells[z].append(dwell)
        
        avg_dwell_per_zone = {
            z: sum(dwells) / len(dwells) / 1000.0 # Convert ms to seconds
            for z, dwells in zone_dwells.items()
        }
        
        # 4. Queue Depth & Abandonment
        joins = sum(1 for r in rows if r["event_type"] == "BILLING_QUEUE_JOIN")
        abandons = sum(1 for r in rows if r["event_type"] == "BILLING_QUEUE_ABANDON")
        purchases = sum(1 for r in rows if r["event_type"] == "PURCHASE")
        
        # Queue depth is roughly joins minus leaves
        queue_depth = max(0, joins - (abandons + purchases))
        abandonment_rate = (abandons / joins * 100) if joins > 0 else 0.0
        revenue_lost_to_abandonment = abandons * avg_basket_size

        return {
            "store_id": store_id,
            "unique_visitors": unique_visitors,
            "conversion_rate": conversion_rate,
            "total_revenue": total_revenue,
            "avg_basket_size": avg_basket_size,
            "revenue_per_visitor": revenue_per_visitor,
            "revenue_lost_to_abandonment": revenue_lost_to_abandonment,
            "avg_dwell_per_zone": avg_dwell_per_zone,
            "queue_depth": queue_depth,
            "abandonment_rate": abandonment_rate
        }

    def get_funnel(self, store_id: str):
        # Session is the unit. We use sets to prevent double-counting re-entries
        events_resp = self.db.table("events").select("visitor_id, event_type, metadata").in_("event_type", ["ENTRY", "ZONE_ENTER", "BILLING_QUEUE_JOIN", "PURCHASE"]).execute()
        
        entries = set()
        zones = set()
        billings = set()
        purchases = set()
        
        for ev in events_resp.data:
            vid = ev["visitor_id"]
            is_staff = (ev.get("metadata") or {}).get("is_staff", False)
            if is_staff:
                continue
                
            etype = ev["event_type"]
            if etype == "ENTRY":
                entries.add(vid)
            elif etype == "ZONE_ENTER":
                zones.add(vid)
            elif etype == "BILLING_QUEUE_JOIN":
                billings.add(vid)
            elif etype == "PURCHASE":
                purchases.add(vid)
                
        # Calculate drop-off %
        def dropoff(current, prev):
            if prev == 0: return 0.0
            return round((1.0 - (current / prev)) * 100, 1)

        return {
            "entries": len(entries),
            "zone_visits": len(zones),
            "billing_visits": len(billings),
            "purchases": len(purchases),
            "drop_offs": {
                "entry_to_zone": dropoff(len(zones), len(entries)),
                "zone_to_billing": dropoff(len(billings), len(zones)),
                "billing_to_purchase": dropoff(len(purchases), len(billings))
            }
        }

    def get_heatmaps(self, store_id: str):
        events_resp = self.db.table("events").select("visitor_id, event_type, metadata").in_("event_type", ["ZONE_ENTER", "ZONE_DWELL"]).execute()
        
        zone_visits = {}
        zone_dwells = {}
        visitors = set()
        
        for ev in events_resp.data:
            z = (ev.get("metadata") or {}).get("zone", "UNKNOWN")
            visitors.add(ev["visitor_id"])
            if ev["event_type"] == "ZONE_ENTER":
                zone_visits[z] = zone_visits.get(z, 0) + 1
            elif ev["event_type"] == "ZONE_DWELL":
                dwell = (ev.get("metadata") or {}).get("dwell_ms", 0)
                if z not in zone_dwells:
                    zone_dwells[z] = []
                zone_dwells[z].append(dwell)
                
        # Normalize to 0-100
        max_visits = max(zone_visits.values()) if zone_visits else 1
        normalized_visits = {z: int((v / max_visits) * 100) for z, v in zone_visits.items()}
        
        avg_dwell = {
            z: sum(dwells) / len(dwells) / 1000.0
            for z, dwells in zone_dwells.items()
        }
        
        confidence = "low" if len(visitors) < 20 else "high"
        
        return {
            "data_confidence": confidence,
            "zone_popularity_normalized": normalized_visits,
            "avg_dwell_seconds": avg_dwell,
            "raw_visits": zone_visits
        }

    def get_anomalies(self, store_id: str):
        # 1. Queue Spike
        events_resp = self.db.table("events").select("event_type, timestamp, metadata").execute()
        joins = sum(1 for r in events_resp.data if r["event_type"] == "BILLING_QUEUE_JOIN")
        abandons = sum(1 for r in events_resp.data if r["event_type"] == "BILLING_QUEUE_ABANDON")
        purchases = sum(1 for r in events_resp.data if r["event_type"] == "PURCHASE")
        queue_depth = max(0, joins - (abandons + purchases))
        
        anomalies = []
        if queue_depth > 15:
            anomalies.append({
                "type": "BILLING_QUEUE_SPIKE",
                "severity": "CRITICAL",
                "description": f"Queue depth has spiked to {queue_depth} customers.",
                "suggested_action": "Deploy backup cashier to Counter 2 immediately."
            })
        elif queue_depth > 8:
            anomalies.append({
                "type": "BILLING_QUEUE_SPIKE",
                "severity": "WARN",
                "description": f"Queue depth is building up ({queue_depth} customers).",
                "suggested_action": "Monitor queue length closely."
            })
            
        # 1.5 CHECKOUT_DELAY (Wait times > 90s)
        # Parse wait_seconds from queue events metadata
        wait_times = []
        for r in events_resp.data:
            if r["event_type"] in ["queue_completed", "BILLING_QUEUE_ABANDON", "QUEUE_ABANDON"]:
                meta = r.get("metadata") or {}
                wait_sec = meta.get("wait_seconds")
                if wait_sec is not None:
                    wait_times.append(float(wait_sec))
                    
        if wait_times:
            avg_wait = sum(wait_times) / len(wait_times)
            if avg_wait > 90.0:
                anomalies.append({
                    "type": "CHECKOUT_DELAY",
                    "severity": "CRITICAL",
                    "description": f"Average checkout time is {avg_wait:.1f}s, significantly above the 90s threshold.",
                    "suggested_action": "Open second billing counter immediately."
                })
            
        # 2. Conversion Drop (mock 7-day avg comparison for MVP)
        sessions_resp = self.db.table("sessions").select("conversion_status").execute()
        total = len(sessions_resp.data)
        converted = sum(1 for s in sessions_resp.data if s.get("conversion_status"))
        cv = (converted / total * 100) if total > 0 else 0
        if cv < 10.0 and total > 50:
            anomalies.append({
                "type": "CONVERSION_DROP",
                "severity": "CRITICAL",
                "description": f"Conversion rate is {cv:.1f}%, significantly below the 7-day average of 18%.",
                "suggested_action": "Check product availability in high-traffic zones."
            })
            
        # 3. Dead Zone (no visits in 30 min)
        # MVP: Just check if any zone has 0 visits today
        zone_visits = set()
        for r in events_resp.data:
            if r["event_type"] == "ZONE_ENTER":
                z = (r.get("metadata") or {}).get("zone")
                if z: zone_visits.add(z)
                
        expected_zones = {"MAYBELLINE", "DERMDOC", "FACES_CANADA", "LAKME", "PLUM"}
        dead_zones = expected_zones - zone_visits
        for dz in dead_zones:
            anomalies.append({
                "type": "DEAD_ZONE",
                "severity": "INFO",
                "description": f"Zone {dz} has had no visits recently.",
                "suggested_action": "Verify if the section is accessible or if lighting/signage is faulty."
            })
            
        return anomalies

analytics_service = AnalyticsService()

