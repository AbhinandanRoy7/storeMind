from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class SessionSchema(BaseModel):
    session_id: uuid.UUID
    visitor_id: str
    entry_time: Optional[datetime] = None
    exit_time: Optional[datetime] = None
    session_duration_seconds: Optional[int] = None
    conversion_status: Optional[bool] = False
