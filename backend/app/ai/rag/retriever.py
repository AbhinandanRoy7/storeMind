from app.ai.embeddings.generate_embeddings import EmbeddingPipeline

class StoreRetriever:
    def __init__(self):
        self.pipeline = EmbeddingPipeline()
        
    def retrieve(self, query: str, collection_name: str = "store_metrics", limit: int = 5) -> list:
        try:
            query_vector = self.pipeline.generate_query_embedding(query)
            search_result = self.pipeline.client.query_points(
                collection_name=collection_name,
                query=query_vector,
                limit=limit
            )
            return [hit.payload.get("text", "") for hit in search_result.points]
        except Exception as e:
            print(f"[Retriever Error] Failed to retrieve from Qdrant: {e}")
            return ["Notice: Historical RAG context is temporarily unavailable. Answer based only on the LIVE METRICS provided."]

    def get_context_string(self, query: str) -> str:
        docs = self.retrieve(query, limit=3)
        if not docs:
            return "No historical metrics available."
        return "\n\n---\n\n".join(docs)
