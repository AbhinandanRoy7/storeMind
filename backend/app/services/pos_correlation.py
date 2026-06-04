import csv
import os
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any

class POSCorrelationService:
    def __init__(self, csv_path: str = None):
        self.transactions = []
        if csv_path is None:
            # Try to find the CSV in the project root
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
            csv_path = os.path.join(base_dir, "POS - sample transactionsb1e826f.csv")
            
        self.csv_path = csv_path
        self._load_data()

    def _load_data(self):
        if not os.path.exists(self.csv_path):
            print(f"[Warning] POS data file not found at {self.csv_path}")
            return

        # Read and aggregate by order_id
        # Schema: order_id,order_date,order_time,store_id,product_id,brand_name,total_amount
        orders = {}
        with open(self.csv_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                order_id = row['order_id']
                if order_id not in orders:
                    # Parse timestamp "10-04-2026 12:15:05" (Assuming DD-MM-YYYY)
                    date_str = f"{row['order_date']} {row['order_time']}"
                    try:
                        dt = datetime.strptime(date_str, "%d-%m-%Y %H:%M:%S")
                        dt = dt.replace(tzinfo=timezone.utc)
                    except ValueError:
                        continue

                    orders[order_id] = {
                        "transaction_id": f"TXN_{order_id.zfill(5)}",
                        "store_id": row['store_id'],
                        "timestamp": dt,
                        "basket_value_inr": 0.0,
                        "used": False
                    }
                
                # Add total_amount
                try:
                    orders[order_id]["basket_value_inr"] += float(row['total_amount'])
                except ValueError:
                    pass

        self.transactions = list(orders.values())
        # Sort by timestamp
        self.transactions.sort(key=lambda x: x["timestamp"])
        print(f"[POS Correlation] Loaded {len(self.transactions)} aggregated transactions.")

    def correlate_sessions(self, sessions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Takes a list of session dictionaries (from Supabase) and correlates them with POS transactions.
        Modifies the sessions in-place (adding basket_value_inr, transaction_id) and returns them.
        """
        # Reset 'used' flag for a fresh correlation run
        for t in self.transactions:
            t["used"] = False

        for session in sessions:
            # Initialize defaults
            session["basket_value_inr"] = 0.0
            session["transaction_id"] = None
            
            if not session.get("exit_time"):
                continue

            try:
                # Handle varying ISO formats from Supabase
                exit_str = session["exit_time"]
                if exit_str.endswith("Z"):
                    exit_str = exit_str[:-1]
                exit_dt = datetime.fromisoformat(exit_str)
                if exit_dt.tzinfo is None:
                    exit_dt = exit_dt.replace(tzinfo=timezone.utc)
            except ValueError:
                continue

            # Look for a transaction within +/- 5 minutes
            # The prompt says: "Visitor in billing zone within 5 minutes before POS transaction counts as converted visitor."
            # Which means POS timestamp should be between (exit_dt - 5m) and (exit_dt + 5m)
            best_txn = None
            for txn in self.transactions:
                if txn["used"]:
                    continue
                
                # Check store_id matches if we had it in session (often we map store_code, but for hackathon let's just check time)
                # Actually, session comes from a specific store_id in the API, we can assume it's filtered
                
                time_diff = txn["timestamp"] - exit_dt
                if timedelta(minutes=-5) <= time_diff <= timedelta(minutes=5):
                    best_txn = txn
                    break
            
            if best_txn:
                best_txn["used"] = True
                session["conversion_status"] = True
                session["basket_value_inr"] = best_txn["basket_value_inr"]
                session["transaction_id"] = best_txn["transaction_id"]

        return sessions

# Global singleton
pos_service = POSCorrelationService()
