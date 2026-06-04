from fastapi import APIRouter
from pydantic import BaseModel
from app.ai.llm.gemini_client import GeminiClient
from app.ai.rag.retriever import StoreRetriever
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/api/v1/ai", tags=["Copilot"])

class ChatRequest(BaseModel):
    query: str

gemini = None
retriever = None

def get_gemini():
    global gemini
    if gemini is None:
        gemini = GeminiClient()
    return gemini

def get_retriever():
    global retriever
    if retriever is None:
        retriever = StoreRetriever()
    return retriever

@router.post("/chat")
def chat_with_copilot(req: ChatRequest):
    retriever_inst = get_retriever()
    context = retriever_inst.get_context_string(req.query)
    
    live_metrics = analytics_service.get_metrics("STORE_BLR_002")
    live_anomalies = analytics_service.get_anomalies("STORE_BLR_002")
    live_context = f"LIVE METRICS:\n{live_metrics}\nLIVE ANOMALIES:\n{live_anomalies}\n\n"
    
    system_prompt = """
    You are the StoreMind AI Copilot, an expert Retail Operating System assistant.
    Analyze the provided LIVE METRICS and LIVE ANOMALIES (which include real-time queue depths, checkout delays, revenue, and queue abandonment revenue loss).
    Identify operational bottlenecks and root causes (e.g. 'Cashier absent for 15s during active queue').
    Provide prescriptive, executive-level operational recommendations. Do not hallucinate data.
    """
    
    final_prompt = f"{live_context}Historical Context (RAG):\n{context}\n\nQuestion: {req.query}"
    
    gemini_inst = get_gemini()
    response = gemini_inst.ask_llm(final_prompt, system_instruction=system_prompt)
    
    return {
        "response": response,
        "context_used": context
    }
