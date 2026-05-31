from fastapi import APIRouter
from app.ai.reports.daily_report import generate_end_of_day_report
from app.ai.recommendations.recommendation_engine import RecommendationEngine

router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])

@router.get("/latest")
def get_latest_report():
    try:
        report = generate_end_of_day_report()
        return report
    except Exception as e:
        return {"title": "Report Unavailable", "content": f"Could not generate report: {str(e)}"}

@router.get("/recommendations")
def get_recommendations():
    try:
        engine = RecommendationEngine()
        recs = engine.generate_daily_recommendations()
        return {"recommendations": recs}
    except Exception as e:
        return {"recommendations": f"Could not generate recommendations: {str(e)}"}
