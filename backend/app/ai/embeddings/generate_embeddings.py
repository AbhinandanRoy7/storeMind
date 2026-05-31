import os
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

class EmbeddingPipeline:
    def __init__(self, qdrant_path: str = "./qdrant_data"):
        print("[Embeddings] Loading BAAI/bge-small-en-v1.5 model...")
        self.model = SentenceTransformer("BAAI/bge-small-en-v1.5")
        
        print("[Embeddings] Connecting to local Qdrant...")
        from app.core.config import settings
        
        if settings.QDRANT_URL and settings.QDRANT_API_KEY:
            self.client = QdrantClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY
            )
            print(f"[Embeddings] Connected to Qdrant Cloud at {settings.QDRANT_URL}")
        else:
            path = settings.QDRANT_PATH if settings.QDRANT_PATH else "../qdrant_data"
            root_qdrant = os.path.abspath(os.path.join(os.getcwd(), path))
            self.client = QdrantClient(path=root_qdrant)
            print(f"[Embeddings] Connected to local Qdrant at {root_qdrant}")
        
        self._init_collections()

    def _init_collections(self):
        collections = ["store_metrics", "store_events", "anomalies", "recommendations"]
        existing = [c.name for c in self.client.get_collections().collections]
        
        for c in collections:
            if c not in existing:
                self.client.create_collection(
                    collection_name=c,
                    vectors_config=VectorParams(size=384, distance=Distance.COSINE) # bge-small output size
                )
                print(f"[Qdrant] Created collection {c}")

    def embed_and_store(self, collection_name: str, doc_id: str, text: str, metadata: dict = None):
        vector = self.model.encode(text).tolist()
        
        import hashlib
        int_id = int(hashlib.sha256(doc_id.encode('utf-8')).hexdigest(), 16) % (10 ** 18)
        
        point = PointStruct(
            id=int_id,
            vector=vector,
            payload={"text": text, **(metadata or {})}
        )
        
        self.client.upsert(
            collection_name=collection_name,
            points=[point]
        )
        print(f"[Qdrant] Inserted document into {collection_name}")

    def generate_query_embedding(self, query: str) -> list:
        # BGE recommended instruction for retrieval queries
        instruction = "Represent this sentence for searching relevant passages: "
        return self.model.encode(instruction + query).tolist()
