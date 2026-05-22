from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    code = Column(String, unique=True, index=True) # e.g. ROADS, WATER, POWER, GARBAGE, SAFETY, CORRUPTION
    lead = Column(String) # e.g. "Shri A. K. Sharma"
    sla_days = Column(Integer, default=7) # SLA threshold
    risk_index = Column(Float, default=15.0) # Calculated system risk (0-100)
    performance_score = Column(Float, default=85.0) # SLA compliance rate (0-100)
    budget_utilization = Column(Float, default=45.0) # percentage of budget spent

    # Relationships
    complaints = relationship("Complaint", back_populates="department")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    category = Column(String, index=True) # e.g. Roads, Water, Electricity, Garbage, Public Safety, Corruption
    sentiment = Column(Float, default=0.0) # -1.0 (very negative) to +1.0 (very positive)
    urgency = Column(String, default="Medium") # Low, Medium, High, Critical
    status = Column(String, default="Pending") # Pending, Routed, In Progress, Escalated, Resolved
    location = Column(String) # e.g. "Vijay Nagar, Zone 4"
    latitude = Column(Float)
    longitude = Column(Float)
    image_url = Column(String, nullable=True)
    voice_url = Column(String, nullable=True)
    duplicate_ref_id = Column(Integer, nullable=True) # ID of the original complaint if duplicate
    escalation_level = Column(Integer, default=0) # 0: None, 1: Dept Head, 2: District Comm, 3: State Sect
    negligence_flag = Column(Boolean, default=False) # True if AI flags department negligence
    confidence_score = Column(Float, default=0.0) # AI confidence in routing
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    age_days = Column(Integer, default=0) # Simulated age for testing escalations
    density_score = Column(Float, default=0.0) # Density index of similar complaints in surrounding area
    resolution_time_days = Column(Float, nullable=True)

    # Relationships
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    department = relationship("Department", back_populates="complaints")
    timeline_events = relationship("TimelineEvent", back_populates="complaint", cascade="all, delete-orphan")

class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"))
    title = Column(String)
    description = Column(String)
    event_type = Column(String) # filed, analyzed, assigned, warning, escalated, resolved, comment
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    complaint = relationship("Complaint", back_populates="timeline_events")
