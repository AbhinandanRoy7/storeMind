import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from app.core.config import settings

def main():
    qdrant = QdrantClient(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY
    )
    
    # Step 8: Test Connection
    print("Testing Qdrant connection...")
    collections = qdrant.get_collections()
    print("Current collections:", collections)
    
    # Step 9: Create Collections
    target_collections = [
        "store_metrics",
        "store_events",
        "anomalies",
        "recommendations",
        "reports"
    ]
    
    existing = [c.name for c in collections.collections]
    
    for collection_name in target_collections:
        if collection_name not in existing:
            print(f"Creating collection {collection_name}...")
            qdrant.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=384, distance=Distance.COSINE),
            )
            print(f"Collection {collection_name} created.")
        else:
            print(f"Collection {collection_name} already exists.")
            
    print("Final collections:", qdrant.get_collections())

if __name__ == "__main__":
    main()
