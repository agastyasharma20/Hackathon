from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

# Department schemas
class DepartmentBase(BaseModel):
    name: str
    code: str
    lead: str
    sla_days: int

class DepartmentResponse(DepartmentBase):
    id: int
    risk_index: float
    performance_score: float
    budget_utilization: float

    class Config:
        from_attributes = True

# TimelineEvent schemas
class TimelineEventBase(BaseModel):
    title: str
    description: str
    event_type: str

class TimelineEventResponse(TimelineEventBase):
    id: int
    complaint_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Complaint schemas
class ComplaintCreate(BaseModel):
    description: str
    title: Optional[str] = None
    location: Optional[str] = "Vijay Nagar, Sector 4"
    latitude: Optional[float] = 22.7196
    longitude: Optional[float] = 75.8577
    image_url: Optional[str] = None
    voice_url: Optional[str] = None

class ComplaintResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    sentiment: float
    urgency: str
    status: str
    location: str
    latitude: float
    longitude: float
    image_url: Optional[str] = None
    voice_url: Optional[str] = None
    duplicate_ref_id: Optional[int] = None
    escalation_level: int
    negligence_flag: bool
    confidence_score: float
    created_at: datetime
    updated_at: datetime
    age_days: int
    density_score: float
    resolution_time_days: Optional[float] = None
    department_id: Optional[int] = None
    department: Optional[DepartmentResponse] = None

    class Config:
        from_attributes = True

class ComplaintDetailResponse(ComplaintResponse):
    timeline_events: List[TimelineEventResponse] = []

# Realtime typing analysis response
class AIAnalysisResponse(BaseModel):
    category: str
    sentiment: float
    sentiment_label: str
    urgency: str
    department_code: str
    department_name: str
    escalation_risk: str
    confidence_score: float

# Chatbot schemas
class ChatRequest(BaseModel):
    message: str
    complaint_id: Optional[int] = None

class ChatResponse(BaseModel):
    reply: str
    reasoning_steps: List[str] = []
    actions: List[str] = []

# Dashboard Stats schemas
class DashboardStats(BaseModel):
    total_complaints: int
    pending_complaints: int
    resolved_complaints: int
    high_risk_complaints: int
    escalated_complaints: int
    negligence_alerts: int
