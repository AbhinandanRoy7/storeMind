from pydantic import BaseModel
from typing import Optional
import uuid

class AnomalySchema(BaseModel):
    id: Optional[uuid.UUID] = None
    anomaly_type: Optional[str] = None
    severity: str
    description: Optional[str] = None
    status: Optional[str] = None
