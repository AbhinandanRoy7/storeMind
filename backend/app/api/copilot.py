from fastapi import APIRouter
from pydantic import BaseModel
from app.ai.llm.gemini_client import GeminiClient
from app.ai.rag.retriever import StoreRetriever

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
    # Retrieve context from Qdrant
    retriever_inst = get_retriever()
    context = retriever_inst.get_context_string(req.query)
    
    system_prompt = """
    You are the StoreMind AI Copilot. You answer business questions about the retail store based on the retrieved data.
    If the answer is not in the data, say you don't know. Do not hallucinate. Be extremely specific with numbers.
    """
    
    final_prompt = f"Context from store metrics:\n{context}\n\nQuestion: {req.query}"
    
    gemini_inst = get_gemini()
    response = gemini_inst.ask_llm(final_prompt, system_instruction=system_prompt)
    
    return {
        "response": response,
        "context_used": context
    }
