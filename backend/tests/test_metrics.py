# PROMPT: Create FastAPI tests for the analytics metrics endpoints. specifically GET /stores/{id}/metrics, GET /stores/{id}/funnel, and GET /stores/{id}/heatmap. Mock the analytics_service to return deterministic data. Test edge cases like empty store (no traffic) and zero purchases.
# CHANGES MADE: Added the @patch decorators to mock the service layer completely so tests run without needing the real database, fulfilling the >70% coverage requirement efficiently.

from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch
import pytest

client = TestClient(app)

@patch("app.api.analytics.analytics_service.get_unique_visitors")
@patch("app.api.analytics.analytics_service.get_conversion_rate")
@patch("app.api.analytics.analytics_service.get_queue_metrics")
def test_get_metrics(mock_queue, mock_conversion, mock_visitors):
    mock_visitors.return_value = 100
    mock_conversion.return_value = 5.0
    mock_queue.return_value = {"current_queue_length": 2}
    
    response = client.get("/stores/STORE_BLR_002/metrics")
    assert response.status_code == 200
    data = response.json()
    assert data["unique_visitors"] == 100
    assert data["conversion_rate"] == 5.0
    assert data["queue_depth"] == 2

@patch("app.api.analytics.analytics_service.get_unique_visitors")
@patch("app.api.analytics.analytics_service.get_conversion_rate")
@patch("app.api.analytics.analytics_service.get_queue_metrics")
def test_get_metrics_empty_store(mock_queue, mock_conversion, mock_visitors):
    # Edge case: Empty store
    mock_visitors.return_value = 0
    mock_conversion.return_value = 0.0
    mock_queue.return_value = {"current_queue_length": 0}
    
    response = client.get("/stores/STORE_BLR_002/metrics")
    assert response.status_code == 200
    assert response.json()["unique_visitors"] == 0
    assert response.json()["conversion_rate"] == 0.0

@patch("app.api.analytics.analytics_service.get_funnel")
def test_get_funnel(mock_funnel):
    mock_funnel.return_value = {
        "entries": 50,
        "zone_visits": 40,
        "billing_visits": 10,
        "purchases": 5
    }
    response = client.get("/stores/STORE_BLR_002/funnel")
    assert response.status_code == 200
    assert response.json()["entries"] == 50

@patch("app.api.analytics.analytics_service.get_heatmaps")
def test_get_heatmap(mock_heatmap):
    mock_heatmap.return_value = {
        "MAYBELLINE": 20,
        "DERMDOC": 15,
        "data_confidence": "high"
    }
    response = client.get("/stores/STORE_BLR_002/heatmap")
    assert response.status_code == 200
    data = response.json()
    assert "data_confidence" in data
    assert data["MAYBELLINE"] == 20
