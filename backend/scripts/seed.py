import os
import sys
import uuid
from datetime import datetime, timezone

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.supabase import get_supabase

def seed_database():
    db = get_supabase()
    
    print("Seeding database...")
    
    # Create a store
    store_id = str(uuid.uuid4())
    db.table("stores").insert({
        "id": store_id,
        "store_code": "BLR-01",
        "store_name": "Brigade Road Store",
        "city": "Bangalore"
    }).execute()
    print(f"Created store: {store_id}")
    
    # Create 5 cameras
    camera_types = ["ENTRY", "FLOOR", "FLOOR", "FLOOR", "BILLING"]
    for i in range(5):
        cam_id = str(uuid.uuid4())
        db.table("cameras").insert({
            "id": cam_id,
            "store_id": store_id,
            "camera_code": f"CAM-0{i+1}",
            "camera_type": camera_types[i]
        }).execute()
        print(f"Created camera: {cam_id} ({camera_types[i]})")
        
    print("Seed complete.")

if __name__ == "__main__":
    seed_database()
