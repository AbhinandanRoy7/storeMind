# cv/billing_engine.py

class BillingEngine:
    def __init__(self, purchase_dwell_threshold=20.0):
        self.purchase_dwell_threshold = purchase_dwell_threshold
        self.billing_entries = {}  # visitor_id -> start_timestamp
        self.billing_visits = set() # visitor_id -> True if they visited > 20s

    def update(self, visitor_id: str, zone_name: str, event_type: str, timestamp: float) -> list:
        """
        Returns a list of event dicts: BILLING_VISIT
        """
        events = []
        if zone_name != "BILLING":
            return events

        if event_type == "ZONE_ENTER":
            self.billing_entries[visitor_id] = timestamp
            
        elif event_type == "ZONE_EXIT":
            start_time = self.billing_entries.pop(visitor_id, None)
            
            if start_time is not None:
                dwell = timestamp - start_time
                if dwell >= self.purchase_dwell_threshold:
                    if visitor_id not in self.billing_visits:
                        self.billing_visits.add(visitor_id)
                        events.append({
                            "event": "BILLING_VISIT",
                            "dwell_time": round(dwell, 2),
                            "confidence": 0.95
                        })
                    
        return events
        
    def has_billing_visit(self, visitor_id: str) -> bool:
        return visitor_id in self.billing_visits

    def reset(self):
        self.billing_entries = {}
        self.billing_visits = set()

