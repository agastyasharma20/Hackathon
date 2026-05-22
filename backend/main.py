import os
import random
import re
import requests
from dotenv import load_dotenv

# Load .env file from backend directory (where GROK_API_KEY lives)
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

import models
import schemas
import ai_engine
import demo_data
from database import engine, Base, get_db

# Initialize FastAPI App
app = FastAPI(
    title="BharatSync AI API",
    description="Futuristic AI-powered Smart Public Governance Platform Backend",
    version="1.0.0"
)

# Configure CORS so our Next.js frontend can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root health check route
@app.get("/")
def root():
    return {
        "platform": "BharatSync AI",
        "tagline": "AI Governance Intelligence & Smart Escalation Platform",
        "version": "1.0.0",
        "status": "🟢 OPERATIONAL",
        "frontend": "http://localhost:3000",
        "api_docs": "http://localhost:8000/docs",
        "endpoints": {
            "complaints": "/api/complaints",
            "dashboard_stats": "/api/dashboard/stats",
            "analytics": "/api/dashboard/analytics",
            "departments": "/api/departments",
            "chatbot": "/api/chatbot [POST]",
            "escalation_audit": "/api/escalate/audit [POST]"
        }
    }

# Startup Handler to seed database and initialize indexes
@app.on_event("startup")
def startup_event():
    # 1. Create tables
    Base.metadata.create_all(bind=engine)
    
    # 2. Check if seeded, if not, trigger seeder
    db = SessionLocal = next(get_db())
    try:
        dept_count = db.query(models.Department).count()
        if dept_count == 0:
            print("Database empty. Seeding realistic hackathon demo data...")
            demo_data.seed_database()
            
        # 3. Fetch all complaints from DB to feed the duplicate detector index
        complaints_db = db.query(models.Complaint).all()
        complaints_list = [
            {"id": c.id, "description": c.description} for c in complaints_db
        ]
        print(f"Loading {len(complaints_list)} complaints into the semantic duplicate index asynchronously...")
        import threading
        threading.Thread(
            target=ai_engine.initialize_duplicate_detector,
            args=(complaints_list,),
            daemon=True
        ).start()
        
    except Exception as e:
        print(f"Error during startup seeder/index initialization: {e}")
    finally:
        db.close()

# 1. Realtime typing analysis endpoint
@app.post("/api/complaints/analyze")
def analyze_complaint(request: Dict[str, str], db: Session = Depends(get_db)):
    text = request.get("text", "")
    if not text or len(text.strip()) < 5:
        raise HTTPException(status_code=400, detail="Text must be at least 5 characters long")
        
    analysis = ai_engine.analyze_complaint_text(text)
    
    # Check for duplicate
    duplicate_match = ai_engine.search_similar_complaints(text, similarity_threshold=0.45)
    
    response = {
        "analysis": analysis,
        "duplicate": None
    }
    
    if duplicate_match:
        dup_id = duplicate_match["id"]
        dup_complaint = db.query(models.Complaint).filter(models.Complaint.id == dup_id).first()
        if dup_complaint:
            response["duplicate"] = {
                "id": dup_complaint.id,
                "title": dup_complaint.title,
                "status": dup_complaint.status,
                "similarity_score": duplicate_match["similarity_score"],
                "engine": duplicate_match["engine"],
                "category": dup_complaint.category
            }
            
    return response

# 2. Create Complaint Endpoint
@app.post("/api/complaints", response_model=schemas.ComplaintResponse)
def create_complaint(complaint_in: schemas.ComplaintCreate, db: Session = Depends(get_db)):
    # 1. Perform automated AI Triage
    ai_triage = ai_engine.analyze_complaint_text(complaint_in.description)
    
    # Generate derived title if none supplied
    title = complaint_in.title or f"{ai_triage['category']} Grievance at {complaint_in.location}"
    
    # 2. Match department in database
    dept = db.query(models.Department).filter(models.Department.code == ai_triage["department_code"]).first()
    dept_id = dept.id if dept else None
    
    # 3. Scan for duplicate reference
    duplicate_ref = None
    duplicate_match = ai_engine.search_similar_complaints(complaint_in.description, similarity_threshold=0.45)
    if duplicate_match:
        duplicate_ref = duplicate_match["id"]
        
    # 4. Density calculations based on geographical vicinity & same category
    # (Mock calculations for demonstration, offset by active category cluster in that region)
    cat_cluster_count = db.query(models.Complaint).filter(
        models.Complaint.category == ai_triage["category"],
        models.Complaint.status != "Resolved"
    ).count()
    density = round(min(0.98, 0.1 + (cat_cluster_count * 0.08)), 2)
    
    # 5. Save Complaint
    new_complaint = models.Complaint(
        title=title,
        description=complaint_in.description,
        category=ai_triage["category"],
        sentiment=ai_triage["sentiment"],
        urgency=ai_triage["urgency"],
        status="Pending" if not duplicate_ref else "Routed", # Instantly route if a parent already exists
        location=complaint_in.location,
        latitude=complaint_in.latitude,
        longitude=complaint_in.longitude,
        image_url=complaint_in.image_url,
        voice_url=complaint_in.voice_url,
        duplicate_ref_id=duplicate_ref,
        confidence_score=ai_triage["confidence_score"],
        density_score=density,
        department_id=dept_id
    )
    
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    
    # 6. Add to semantic/TF-IDF indexes immediately for next submissions
    ai_engine.add_complaint_to_indexes(new_complaint.id, new_complaint.description)
    
    # 7. Create timeline audits
    db.add(models.TimelineEvent(
        complaint_id=new_complaint.id,
        title="Grievance Registered",
        description="Grievance submitted by citizen onto the BharatSync AI central portal.",
        event_type="filed"
    ))
    
    db.add(models.TimelineEvent(
        complaint_id=new_complaint.id,
        title="AI Routing Executed",
        description=f"BharatSync Triage classified category as '{new_complaint.category}' and routed case to {ai_triage['department_name']} (SLA: {dept.sla_days} Days).",
        event_type="analyzed"
    ))
    
    if duplicate_ref:
        db.add(models.TimelineEvent(
            complaint_id=new_complaint.id,
            title="Duplicate Linked",
            description=f"AI detected high-similarity duplicate. Grievance linked to Case ID #{duplicate_ref} to pool engineering efforts.",
            event_type="warning"
        ))
        
    db.commit()
    db.refresh(new_complaint)
    return new_complaint

# 3. Get Complaints Endpoint (with filter utilities)
@app.get("/api/complaints", response_model=List[schemas.ComplaintResponse])
def get_complaints(
    status: Optional[str] = None,
    category: Optional[str] = None,
    urgency: Optional[str] = None,
    negligence: Optional[bool] = None,
    department_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Complaint)
    
    if status:
        query = query.filter(models.Complaint.status == status)
    if category:
        query = query.filter(models.Complaint.category == category)
    if urgency:
        query = query.filter(models.Complaint.urgency == urgency)
    if negligence is not None:
        query = query.filter(models.Complaint.negligence_flag == negligence)
    if department_id:
        query = query.filter(models.Complaint.department_id == department_id)
        
    # Order by newest first
    return query.order_by(models.Complaint.created_at.desc()).all()

# 4. Get Single Complaint Detailed Response
@app.get("/api/complaints/{complaint_id}", response_model=schemas.ComplaintDetailResponse)
def get_complaint_detail(complaint_id: int, db: Session = Depends(get_db)):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint

# 5. Resolve Complaint Endpoint
@app.post("/api/complaints/{complaint_id}/resolve", response_model=schemas.ComplaintResponse)
def resolve_complaint(complaint_id: int, db: Session = Depends(get_db)):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    complaint.status = "Resolved"
    complaint.resolution_time_days = round(random.uniform(1.0, 4.0), 1) if not complaint.age_days else float(complaint.age_days)
    
    # Add timeline log
    db.add(models.TimelineEvent(
        complaint_id=complaint.id,
        title="Grievance Resolved Successfully",
        description="Public works teams completed remedial tasks on site. Verified via digital inspection logs.",
        event_type="resolved"
    ))
    db.commit()
    db.refresh(complaint)
    return complaint

# 6. Escalate Complaint (Manual / AI Smart Trigger Override)
@app.post("/api/complaints/{complaint_id}/escalate", response_model=schemas.ComplaintResponse)
def escalate_complaint(complaint_id: int, db: Session = Depends(get_db)):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    complaint.status = "Escalated"
    complaint.escalation_level = min(3, complaint.escalation_level + 1)
    complaint.negligence_flag = True
    
    dept = db.query(models.Department).filter(models.Department.id == complaint.department_id).first()
    dept_lead = dept.lead if dept else "Administrative Officer"
    
    level_descriptions = {
        1: f"Case escalated to Division Department Head: {dept_lead} (Level 1 Escalation).",
        2: "Case escalated to District Magistrate / Commissioner (Level 2 Escalation). Immediate department hearings triggered.",
        3: "Case escalated to State Grievance Secretariat Oversight Commission (Level 3 Critical Escalation)."
    }
    
    db.add(models.TimelineEvent(
        complaint_id=complaint.id,
        title=f"Manual/Smart Escalation Level {complaint.escalation_level} Triggered",
        description=level_descriptions.get(complaint.escalation_level, "Administrative escalation applied."),
        event_type="escalated"
    ))
    db.commit()
    db.refresh(complaint)
    return complaint

# 7. Dashboard statistics widgets API
@app.get("/api/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total = db.query(models.Complaint).count()
    pending = db.query(models.Complaint).filter(models.Complaint.status == "Pending").count()
    resolved = db.query(models.Complaint).filter(models.Complaint.status == "Resolved").count()
    high_risk = db.query(models.Complaint).filter(models.Complaint.urgency == "Critical").count()
    escalated = db.query(models.Complaint).filter(models.Complaint.status == "Escalated").count()
    negligence = db.query(models.Complaint).filter(models.Complaint.negligence_flag == True).count()
    
    return {
        "total_complaints": total,
        "pending_complaints": pending + db.query(models.Complaint).filter(models.Complaint.status == "Routed").count() + db.query(models.Complaint).filter(models.Complaint.status == "In Progress").count(),
        "resolved_complaints": resolved,
        "high_risk_complaints": high_risk,
        "escalated_complaints": escalated,
        "negligence_alerts": negligence
    }

# 8. Department Management stats API
@app.get("/api/departments", response_model=List[schemas.DepartmentResponse])
def get_departments(db: Session = Depends(get_db)):
    return db.query(models.Department).all()

# 9. Smart Escalation Engine periodic audit runner (simulated)
@app.post("/api/escalate/audit")
def run_smart_escalation_audit(db: Session = Depends(get_db)):
    # Scan all unresolved, non-escalated complaints where age exceeds the department's SLA
    complaints = db.query(models.Complaint).filter(
        models.Complaint.status.in_(["Pending", "Routed", "In Progress"]),
        models.Complaint.escalation_level == 0
    ).all()
    
    escalated_count = 0
    
    for c in complaints:
        dept = db.query(models.Department).filter(models.Department.id == c.department_id).first()
        if not dept:
            continue
            
        # Escalation parameters: age exceeds SLA limit or density spikes, combined with high negative sentiment
        if c.age_days > dept.sla_days or (c.urgency in ["High", "Critical"] and c.sentiment < -0.6 and c.age_days > 2):
            c.status = "Escalated"
            c.escalation_level = 1
            c.negligence_flag = True if c.age_days > (dept.sla_days * 1.5) else False
            
            db.add(models.TimelineEvent(
                complaint_id=c.id,
                title="Automated AI Smart Escalation Triggered",
                description=f"Escalated to Division Lead {dept.lead} due to SLA breach ({c.age_days}/{dept.sla_days} days) & critical sentiment ({c.sentiment}).",
                event_type="escalated"
            ))
            escalated_count += 1
            
    db.commit()
    return {"message": "Escalation audit complete", "escalated_records": escalated_count}

# 10. AI Chatbot Agent endpoint with multi-criteria reasoning details
@app.post("/api/chatbot", response_model=schemas.ChatResponse)
def chat_assistant(request: schemas.ChatRequest, db: Session = Depends(get_db)):
    msg_lower = request.message.lower()
    
    # 1. Check if user is asking about a specific complaint ID or references a complaint
    complaint_match = re.search(r'\b(?:complaint|case|id|ticket|issue)\s*#?\s*(\d+)\b', msg_lower)
    
    reply = ""
    reasoning = []
    actions = []
    
    grok_api_key = os.environ.get("GROK_API_KEY", "")
    system_context = "You are BharatSync AI Governance Intelligence Assistant. Respond in a highly professional, futuristic, and helpful tone. "
    
    if complaint_match:
        c_id = int(complaint_match.group(1))
        c = db.query(models.Complaint).filter(models.Complaint.id == c_id).first()
        
        if c:
            dept_name = c.department.name if c.department else "Unassigned Department"
            sla = c.department.sla_days if c.department else 7
            
            reasoning.append(f"Parsed request referencing Complaint ID: #{c_id}")
            reasoning.append(f"Located active record in DB: status='{c.status}', category='{c.category}', age={c.age_days} days.")
            system_context += f"The user is asking about Complaint #{c_id} ('{c.title}'), which is '{c.status}'. It is handled by {dept_name} (SLA: {sla} days) and is currently {c.age_days} days old."
            actions.append("View Detailed Audit")
        else:
            reasoning.append(f"Parsed ID #{c_id} but did not find a matching record in the database.")
            system_context += f"The user is asking about Complaint #{c_id}, but it does NOT exist in the database. Inform them politely."
            
    # Try calling Grok API if key is present
    if grok_api_key:
        try:
            reasoning.append("Delegating reasoning to Grok LLM via xAI API...")
            res = requests.post(
                "https://api.x.ai/v1/chat/completions",
                headers={"Authorization": f"Bearer {grok_api_key}", "Content-Type": "application/json"},
                json={
                    "model": "grok-beta",
                    "messages": [
                        {"role": "system", "content": system_context},
                        {"role": "user", "content": request.message}
                    ]
                },
                timeout=10
            )
            if res.status_code == 200:
                reply = res.json()["choices"][0]["message"]["content"]
                reasoning.append("Successfully generated dynamic response using Grok.")
            else:
                reasoning.append(f"Grok API returned status {res.status_code}. Falling back to rule-based engine.")
        except Exception as e:
            reasoning.append(f"Grok API failed: {e}. Falling back to rule-based engine.")
            
    # Fallback to local rule-based engine if Grok is not active or failed
    if not reply:
        if complaint_match and c:
            if c.status == "Resolved":
                reply = f"Your Complaint ID #{c_id} regarding '{c.title}' has been successfully **Resolved**. The works were completed in {c.resolution_time_days} days, well within our quality guidelines. Thank you for using BharatSync AI to keep our city clean and safe!"
                actions.append("View Resolution Gallery")
            elif c.status == "Escalated":
                reasoning.append(f"Exceeded SLA of {sla} days (current age: {c.age_days} days). Negligence flag is {c.negligence_flag}.")
                reply = f"Your Complaint ID #{c_id} is currently flagged as **Escalated** (Level {c.escalation_level}) to high-ranking city authorities. This occurred automatically because the {dept_name} exceeded its average SLA limit of {sla} days by {c.age_days - sla} days. The District Magistrate's office is actively supervising resolution. We sincerely apologize for this administrative delay."
                actions.append("Trigger Emergency Briefing")
                actions.append("Contact Ombudsman")
            else:
                reply = f"Your Complaint ID #{c_id} ('{c.title}') is in status **{c.status}** with the {dept_name}. It has been active for {c.age_days} days. The target SLA resolution time is {sla} days, meaning the department has {max(0, sla - c.age_days)} days left to resolve the issue. Rest assured, the field teams are actively working on it."
                actions.append("Request Status Check")
        elif complaint_match and not c:
            reply = f"I see you are inquiring about Complaint ID #{c_id}, but I couldn't locate that ticket in our system. Please double-check your ID number or file a new ticket in the Citizen Portal."
        elif "status" in msg_lower or "how to check" in msg_lower:
            reasoning.append("User inquiring about status retrieval mechanism.")
            reply = "You can view the status and interactive timeline of any grievance by navigating to the **Governance Intelligence Dashboard**, finding the ticket in the list, and clicking 'View Details'. Alternatively, you can type your complaint ID here (e.g. 'Status of complaint #12') and I'll fetch the DB record for you."
        elif "escalate" in msg_lower or "delay" in msg_lower:
            reasoning.append("User inquiring about the smart escalation engine rules.")
            reply = "BharatSync AI uses a **Smart Escalation Engine** that automatically promotes issues from departments to higher-ranking administrators if: \n1. The complaint age exceeds the department SLA threshold.\n2. High density clusters (duplicate spikes) of the same category are detected in an area.\n3. Citizen sentiment triggers severe critical negative patterns (e.g. public safety issues). \n\nEscalations move from Level 1 (Department Head) to Level 2 (District Commissioner) and finally Level 3 (State Secretariat)."
            actions.append("View Escalation Metrics")
        elif "how do i file" in msg_lower or "new complaint" in msg_lower or "report" in msg_lower:
            reasoning.append("User inquiring about complaint filing flow.")
            reply = "To file a new grievance, simply go to the **Citizen Portal** page. Write the details of your issue; our **realtime AI assistant** will instantly analyze your text, predict the urgency, assign it to the proper municipal department, and check for any duplicates. You can also upload pictures and voice recordings!"
            actions.append("Go to Citizen Portal")
        else:
            reasoning.append("Inquiry is general. Triggering generic futuristic LLM assistant responder.")
            reply = "Greetings! I am the BharatSync AI Governance Intelligence Assistant. I am designed to assist you with tracking citizen complaints, exploring municipal risk indices, explaining smart routing, and triggering escalations on neglected municipal projects. How can I assist you with smart civic administration today? (Tip: Set GROK_API_KEY in the backend environment to unlock dynamic LLM responses!)"
            
    return {
        "reply": reply,
        "reasoning_steps": reasoning,
        "actions": actions
    }

# 11. Custom analytical data endpoint for Recharts visualizations
@app.get("/api/dashboard/analytics")
def get_dashboard_analytics(db: Session = Depends(get_db)):
    # Trends: Resolved vs Escalated vs Total over a 6-month simulated timeline
    trends = [
        {"month": "Jan", "filed": 45, "resolved": 38, "escalated": 4},
        {"month": "Feb", "filed": 58, "resolved": 42, "escalated": 9},
        {"month": "Mar", "filed": 72, "resolved": 55, "escalated": 11},
        {"month": "Apr", "filed": 64, "resolved": 50, "escalated": 8},
        {"month": "May", "filed": 89, "resolved": 68, "escalated": 15},
        {"month": "Jun", "filed": 110, "resolved": 82, "escalated": 24}
    ]
    
    # Category Distribution counts
    categories = db.query(models.Complaint.category, models.func.count(models.Complaint.id))\
        .group_by(models.Complaint.category).all()
    distribution = [{"category": cat, "count": count} for cat, count in categories]
    
    # Satisfactory score & SLA performance metrics per department
    departments = db.query(models.Department).all()
    dept_performance = [
        {
            "name": d.name,
            "code": d.code,
            "performance": d.performance_score,
            "risk": d.risk_index,
            "budget": d.budget_utilization
        }
        for d in departments
    ]
    
    return {
        "trends": trends,
        "category_distribution": distribution,
        "department_performance": dept_performance
    }

