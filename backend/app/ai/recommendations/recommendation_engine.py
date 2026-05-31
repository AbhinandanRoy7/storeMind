from app.ai.llm.gemini_client import GeminiClient
from app.ai.tools.funnel_tool import get_funnel_stats
from app.ai.tools.heatmap_tool import get_zone_engagement
from app.ai.tools.footfall_tool import get_footfall_stats
from app.ai.tools.anomaly_tool import get_active_anomalies

class RecommendationEngine:
    def __init__(self):
        self.gemini = GeminiClient()

    def generate_daily_recommendations(self) -> str:
        footfall = get_footfall_stats()
        funnel = get_funnel_stats()
        heatmap = get_zone_engagement()
        anomalies = get_active_anomalies()
        
        context = f"""
        Footfall: {footfall}
        Funnel: {funnel}
        Heatmap (Zone Engagement): {heatmap}
        Active Anomalies: {anomalies}
        """
        
        prompt = f"""
        You are an elite retail analytics engine.
        Review this live store data:
        {context}
        
        Generate exactly 3 bullet-point business recommendations. Focus on resolving the anomalies, 
        improving the worst-performing zones, and optimizing staff/queue placement.
        """
        
        return self.gemini.ask_llm(prompt)
