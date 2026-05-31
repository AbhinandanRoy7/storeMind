from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="/stores/{store_id}", tags=["anomalies"])

from app.services.analytics_service import analytics_service

@router.get("/anomalies")
def get_anomalies(store_id: str):
    return analytics_service.get_anomalies(store_id)
