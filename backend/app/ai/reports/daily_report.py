from app.ai.rag.document_builder import build_daily_analytics_document
from app.ai.recommendations.recommendation_engine import RecommendationEngine

def generate_end_of_day_report() -> dict:
    doc = build_daily_analytics_document()
    metrics_text = doc["content"]
    
    engine = RecommendationEngine()
    recommendations = engine.generate_daily_recommendations()
    
    full_report = f"""# 📊 StoreMind AI - Daily Executive Report
    
## Daily Metrics
{metrics_text}

## AI Recommendations
{recommendations}
"""
    return {
        "title": f"Daily Report - {doc['metadata']['date']}",
        "content": full_report
    }
