# PROMPT: "Write a Pytest function that tests the idempotency of an ingest function. The function is called `event_service.store_events_with_partial_success(events)`. I want to simulate an incoming batch of events containing an `event_id`. Provide a mock of the Supabase insert call. Call the function twice with the exact same payload, and assert that the second call is rejected because of idempotency, resulting in 0 accepted events."
# CHANGES MADE: The AI incorrectly tried to mock the database to throw a Unique Constraint Error for the second call. However, our implementation uses an in-memory `seen_event_ids` Set for idempotency *before* hitting the database. I overrode the AI's test logic to clear `seen_event_ids` at the start of the test, and manually asserted that the second result returns `{"accepted": 0, "failed": 0}` without hitting the database mock at all.
import pytest
from unittest.mock import patch, MagicMock
from app.services import event_service

def test_idempotency_store_events():
    # Reset seen_event_ids for the test
    event_service.seen_event_ids.clear()
    
    events = [
        {
            "event_id": "123-abc",
            "timestamp": "2026-05-31T10:00:00Z",
            "camera_id": "cam-1",
            "event_type": "STORE_ENTRY",
            "visitor_id": "v-1",
            "metadata": {}
        }
    ]
    
    with patch("app.core.supabase.get_supabase") as mock_supabase:
        mock_db = MagicMock()
        mock_supabase.return_value = mock_db
        # Mock successful insert
        mock_db.table().insert().execute.return_value = MagicMock()
        
        # Call first time
        result1 = event_service.store_events_with_partial_success(events)
        assert result1["accepted"] == 1
        assert result1["failed"] == 0
        
        # Call second time with same event_id
        result2 = event_service.store_events_with_partial_success(events)
        # Should be silently dropped as duplicate, resulting in 0 accepted
        assert result2["accepted"] == 0
        assert result2["failed"] == 0

def test_all_staff_clip(client):
    # This would usually use a FastAPI TestClient to hit /metrics
    pass
