import os
import sys
import uuid
from datetime import datetime, timezone, timedelta
import random

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.supabase import get_supabase
from app.services.event_service import event_service
from app.schemas.event import EventSchema

def create_test_events():
    db = get_supabase()
    
    print("Creating test events...")
    
    # Ensure there's a store
    stores = db.table("stores").select("id").limit(1).execute()
    if not stores.data:
        print("No store found. Please run seed.py first.")
        return
        
    store_id = stores.data[0]["id"]
    
    events_to_ingest = []
    base_time = datetime.now(timezone.utc)
    
    # Simulate 10 visitors
    for i in range(1, 11):
        visitor_id = f"VIS{i:03d}"
        
        # Ensure visitor exists
        # In a real app, visitor creation might happen automatically on first detection, 
        # but since we have a foreign key on events -> visitors, we should create them if they don't exist.
        try:
            db.table("visitors").insert({
                "visitor_id": visitor_id,
                "store_id": store_id,
                "first_seen": base_time.isoformat(),
                "last_seen": base_time.isoformat(),
                "is_staff": False
            }).execute()
        except Exception as e:
            # Might already exist
            pass
            
        # Entry event
        entry_time = base_time + timedelta(minutes=random.randint(1, 60))
        events_to_ingest.append(EventSchema(
            visitor_id=visitor_id,
            event_type="ENTRY",
            timestamp=entry_time,
            confidence=0.95
        ))
        
        # Zone Enter event
        zone_time = entry_time + timedelta(minutes=random.randint(1, 5))
        events_to_ingest.append(EventSchema(
            visitor_id=visitor_id,
            event_type="ZONE_ENTER",
            timestamp=zone_time,
            confidence=0.90,
            zone_id=uuid.uuid4()
        ))
        
        # Zone Exit event
        zone_exit_time = zone_time + timedelta(minutes=random.randint(2, 10))
        events_to_ingest.append(EventSchema(
            visitor_id=visitor_id,
            event_type="ZONE_EXIT",
            timestamp=zone_exit_time,
            confidence=0.90
        ))
        
        # Exit event
        exit_time = zone_exit_time + timedelta(minutes=random.randint(1, 5))
        events_to_ingest.append(EventSchema(
            visitor_id=visitor_id,
            event_type="EXIT",
            timestamp=exit_time,
            confidence=0.95
        ))
        
    # Ingest events via service
    count = event_service.store_events(events_to_ingest)
    print(f"Successfully ingested {count} test events.")

if __name__ == "__main__":
    create_test_events()
