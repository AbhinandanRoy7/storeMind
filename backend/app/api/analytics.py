from fastapi import APIRouter
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/stores/{store_id}", tags=["analytics"])

@router.get("/metrics")
def get_metrics(store_id: str):
    return analytics_service.get_metrics(store_id)

@router.get("/funnel")
def get_funnel(store_id: str):
    return analytics_service.get_funnel(store_id)

@router.get("/heatmap")
def get_heatmap(store_id: str):
    return analytics_service.get_heatmaps(store_id)

# Keep some original endpoints mapped for backward compatibility with frontend if needed,
# or just let the frontend break and we'll fix the frontend later.
@router.get("/footfall")
def get_footfall(store_id: str):
    return {"count": analytics_service.get_footfall()}

@router.get("/queue")
def get_queue(store_id: str):
    return analytics_service.get_queue_metrics()
