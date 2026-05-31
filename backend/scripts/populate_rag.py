import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ai.rag.document_builder import build_daily_analytics_document
from app.ai.embeddings.generate_embeddings import EmbeddingPipeline

def main():
    print("Building daily analytics document...")
    doc = build_daily_analytics_document()
    print("Document built:")
    print(doc["content"])
    
    print("\nInitializing embedding pipeline...")
    pipeline = EmbeddingPipeline()
    
    print("Storing document in Qdrant...")
    pipeline.embed_and_store(
        collection_name="store_metrics",
        doc_id=doc["id"],
        text=doc["content"],
        metadata=doc["metadata"]
    )
    
    print("Done!")

if __name__ == "__main__":
    main()
