import json
from datetime import datetime
from app.ai.tools.footfall_tool import get_footfall_stats
from app.ai.tools.funnel_tool import get_funnel_stats
from app.ai.tools.heatmap_tool import get_zone_engagement
from app.ai.tools.anomaly_tool import get_active_anomalies

def build_daily_analytics_document() -> dict:
    """
    Transforms the current Supabase analytics into a rich text document for RAG.
    """
    date_str = datetime.now().strftime("%Y-%m-%d")
    
    footfall = get_footfall_stats()
    funnel = get_funnel_stats()
    heatmap = get_zone_engagement()
    anomalies = get_active_anomalies()
    
    sorted_zones = sorted(heatmap.items(), key=lambda x: x[1]['visits'], reverse=True)
    top_zone = sorted_zones[0][0] if sorted_zones else "N/A"
    worst_zone = sorted_zones[-1][0] if sorted_zones else "N/A"
    
    doc_text = f"Date: {date_str}\n"
    doc_text += f"Total Footfall (Store Entries): {footfall['total_footfall']}\n"
    doc_text += f"Total Purchases: {footfall['total_purchases']}\n"
    doc_text += f"Overall Conversion Rate: {funnel['overall_conversion_rate_percentage']}%\n"
    
    doc_text += f"\nFunnel Breakdown:\n"
    doc_text += f"- Entries: {funnel['entries']}\n"
    doc_text += f"- Zone Visits: {funnel['zone_visits']}\n"
    doc_text += f"- Billing Visits: {funnel['billing_visits']}\n"
    
    doc_text += f"\nZone Performance:\n"
    doc_text += f"Top Zone: {top_zone}\n"
    doc_text += f"Worst Zone: {worst_zone}\n"
    for z, data in heatmap.items():
        doc_text += f"- {z}: {data['visits']} visits, avg dwell {data['avg_dwell_seconds']}s\n"
        
    doc_text += f"\nActive Anomalies:\n"
    if not anomalies:
        doc_text += "None\n"
    else:
        for an in anomalies:
            doc_text += f"- [{an.get('severity', 'WARN')}] {an.get('anomaly_type', 'Alert')}: {an.get('description', '')}\n"
            
    return {
        "id": f"daily_metrics_{date_str}",
        "content": doc_text,
        "metadata": {
            "date": date_str,
            "type": "daily_metrics"
        }
    }
