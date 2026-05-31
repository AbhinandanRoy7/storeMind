# PROMPT: "Write Pytest test cases for a FastAPI application's analytics_service.py. Specifically, create tests for: an empty store (where unique visitors should be 0), a scenario with only staff members (where unique visitors should be 0), a scenario with a store entry, a billing queue join, and an abandon but no purchase (where abandonment rate is 100%), and a funnel scenario with a re-entry to the same zone to ensure visitors are not double-counted."
# CHANGES MADE: I had to override the AI's default imports. It suggested `from app.core import get_supabase`, but our codebase uses `from app.core.supabase import get_supabase`. I also manually injected the `mock_get_supabase` into the `analytics_service.get_metrics` logic because the AI missed the exact structure of our Supabase mock data response.
import pytest
from unittest.mock import patch, MagicMock
from app.services import analytics_service

@patch("app.core.supabase.get_supabase")
def test_metrics_empty_store(mock_get_supabase):
    mock_db = MagicMock()
    mock_get_supabase.return_value = mock_db
    
    # Mock empty data
    mock_db.table().select().eq().execute.return_value = MagicMock(data=[])
    
    metrics = analytics_service.get_metrics("store-123")
    
    assert metrics["unique_visitors"] == 0
    assert metrics["avg_dwell_per_zone"] == {}
    assert metrics["queue_depth"] == 0
    assert metrics["abandonment_rate"] == 0.0

@patch("app.core.supabase.get_supabase")
def test_metrics_all_staff(mock_get_supabase):
    mock_db = MagicMock()
    mock_get_supabase.return_value = mock_db
    
    # Mock data with only staff
    mock_db.table().select().eq().execute.return_value = MagicMock(data=[
        {
            "event_type": "STORE_ENTRY",
            "visitor_id": "staff-1",
            "metadata": {"is_staff": "true"}
        },
        {
            "event_type": "STORE_ENTRY",
            "visitor_id": "staff-2",
            "metadata": {"is_staff": "true"}
        }
    ])
    
    metrics = analytics_service.get_metrics("store-123")
    
    # Should exclude staff from visitors
    assert metrics["unique_visitors"] == 0

@patch("app.core.supabase.get_supabase")
def test_zero_purchases(mock_get_supabase):
    mock_db = MagicMock()
    mock_get_supabase.return_value = mock_db
    
    # Mock data with no purchases
    mock_db.table().select().eq().execute.return_value = MagicMock(data=[
        {
            "event_type": "STORE_ENTRY",
            "visitor_id": "vis-1",
            "metadata": {"is_staff": "false"}
        },
        {
            "event_type": "BILLING_QUEUE_JOIN",
            "visitor_id": "vis-1",
            "metadata": {"is_staff": "false"}
        },
        {
            "event_type": "BILLING_QUEUE_ABANDON",
            "visitor_id": "vis-1",
            "metadata": {"is_staff": "false"}
        }
    ])
    
    metrics = analytics_service.get_metrics("store-123")
    
    # Abandonment rate should be 100%, no div by zero error
    assert metrics["abandonment_rate"] == 100.0
    assert metrics["queue_depth"] == 0

@patch("app.core.supabase.get_supabase")
def test_funnel_re_entry(mock_get_supabase):
    mock_db = MagicMock()
    mock_get_supabase.return_value = mock_db
    
    # Mock data with re-entry
    mock_db.table().select().eq().execute.return_value = MagicMock(data=[
        {"event_type": "STORE_ENTRY", "visitor_id": "v1", "metadata": {}},
        {"event_type": "ZONE_ENTRY", "visitor_id": "v1", "metadata": {}},
        {"event_type": "ZONE_ENTRY", "visitor_id": "v1", "metadata": {}}, # Re-entry
        {"event_type": "BILLING_QUEUE_JOIN", "visitor_id": "v1", "metadata": {}},
        {"event_type": "PURCHASE", "visitor_id": "v1", "metadata": {}}
    ])
    
    funnel = analytics_service.get_funnel("store-123")
    
    # Counts should be exactly 1 per step despite re-entry
    assert funnel["store_entry"] == 1
    assert funnel["zone_visited"] == 1
    assert funnel["billing_queue"] == 1
    assert funnel["purchase"] == 1
