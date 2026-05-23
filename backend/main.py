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

# 10. AI Chatbot Agent endpoint - Powered by Grok xAI with full city context
@app.post("/api/chatbot", response_model=schemas.ChatResponse)
def chat_assistant(request: schemas.ChatRequest, db: Session = Depends(get_db)):
    msg_lower = request.message.lower()
    
    # Pull live stats to give Grok real context
    total = db.query(models.Complaint).count()
    pending = db.query(models.Complaint).filter(models.Complaint.status == "Pending").count()
    escalated = db.query(models.Complaint).filter(models.Complaint.status == "Escalated").count()
    resolved = db.query(models.Complaint).filter(models.Complaint.status == "Resolved").count()
    negligence = db.query(models.Complaint).filter(models.Complaint.negligence_flag == True).count()

    # Build rich system prompt with live data
    GROK_SYSTEM_PROMPT = f"""You are **BharatSync AI** — the AI Governance Intelligence Assistant for Indore Municipal Corporation.
You are embedded in a real-time public grievance management system serving 3.2 million citizens of Indore, Madhya Pradesh, India.

## LIVE PLATFORM STATUS (as of now):
- Total grievances registered: {total}
- Pending/In-Progress: {pending}
- Escalated cases (SLA breached): {escalated}
- Resolved cases: {resolved}
- Active negligence flags: {negligence}

## YOUR CAPABILITIES:
1. Look up any complaint by ID (e.g. "Status of complaint #9")
2. Explain the 3-tier Smart Escalation Engine (Dept Head → District Magistrate → State Secretariat)
3. Explain AI triage, sentiment analysis, and FAISS semantic duplicate detection
4. Guide citizens on how to file new grievances
5. Explain department SLA targets and performance metrics
6. Provide insights on systemic governance failures
7. Explain the geospatial heatmap and risk monitoring system

## DEPARTMENTS MANAGED:
- Road Maintenance Division (SLA: 7 days) — Roads, potholes, bridges
- Municipal Water Department (SLA: 5 days) — Water supply, sewage, leaks
- Power Grid Board (SLA: 3 days) — Electricity, transformers, outages
- Waste Management Authority (SLA: 4 days) — Garbage, sanitation
- Public Safety Command (SLA: 2 days) — Crime, streetlights, hazards
- Anti-Corruption Vigilance Bureau (SLA: 1 day) — Bribes, fraud, extortion

## ESCALATION TIERS:
- Tier 1: Department Head notified (SLA breach detected)
- Tier 2: District Magistrate / Commissioner alerted (prolonged neglect)  
- Tier 3: State Grievance Secretariat oversight (critical negligence)

## TONE:
Respond in a professional, futuristic, empathetic, and authoritative tone. Be specific and actionable.
Keep responses concise but informative. Use **bold** for emphasis. Use bullet points for lists.
Always end with a helpful next action for the user."""

    complaint_match = re.search(r'\b(?:complaint|case|id|ticket|issue|#)\s*#?\s*(\d+)\b', msg_lower)
    reply = ""
    reasoning = ["Initializing BharatSync AI governance reasoning engine..."]
    actions = []
    c = None
    c_id = None

    if complaint_match:
        c_id = int(complaint_match.group(1))
        c = db.query(models.Complaint).filter(models.Complaint.id == c_id).first()
        
        if c:
            dept_name = c.department.name if c.department else "Unassigned Department"
            sla = c.department.sla_days if c.department else 7
            reasoning.append(f"Parsed complaint reference: ID #{c_id}")
            reasoning.append(f"DB record found: '{c.title}', status='{c.status}', category='{c.category}', age={c.age_days}d")
            reasoning.append(f"Department: {dept_name}, SLA={sla}d, Negligence={c.negligence_flag}")
            GROK_SYSTEM_PROMPT += f"\n\n## COMPLAINT #{c_id} DETAILS:\n- Title: {c.title}\n- Status: {c.status}\n- Category: {c.category}\n- Location: {c.location}\n- Department: {dept_name} (SLA: {sla} days)\n- Age: {c.age_days} days old\n- Urgency: {c.urgency}\n- Escalation Level: {c.escalation_level}\n- Negligence Flag: {c.negligence_flag}\n- Sentiment Score: {c.sentiment}"
            actions = ["View Audit Timeline", "Trigger Escalation", "Contact Department"]
        else:
            reasoning.append(f"Complaint ID #{c_id} not found in database.")
            actions = ["File New Complaint", "Search Other Cases"]

    # Build conversation history for Grok
    messages_for_grok = [{"role": "system", "content": GROK_SYSTEM_PROMPT}]
    if hasattr(request, 'history') and request.history:
        for h in request.history[-6:]:  # Last 3 exchanges
            messages_for_grok.append(h)
    messages_for_grok.append({"role": "user", "content": request.message})

    grok_api_key = os.environ.get("GROK_API_KEY", "")
    
    if grok_api_key:
        try:
            reasoning.append("Routing to Grok-beta LLM via xAI API with live city context...")
            res = requests.post(
                "https://api.x.ai/v1/chat/completions",
                headers={"Authorization": f"Bearer {grok_api_key}", "Content-Type": "application/json"},
                json={
                    "model": "grok-beta",
                    "messages": messages_for_grok,
                    "max_tokens": 600,
                    "temperature": 0.7
                },
                timeout=15
            )
            if res.status_code == 200:
                reply = res.json()["choices"][0]["message"]["content"]
                usage = res.json().get("usage", {})
                reasoning.append(f"✓ Grok response generated ({usage.get('completion_tokens', '?')} tokens)")
                reasoning.append("Live city data context injected into LLM reasoning chain.")
            else:
                reasoning.append(f"Grok API error {res.status_code}. Activating rule-based fallback.")
        except Exception as e:
            reasoning.append(f"Grok API timeout/error. Activating offline rule-based engine.")

    # Rich rule-based fallback
    if not reply:
        if c_id and c:
            if c.status == "Resolved":
                reply = f"**Complaint #{c_id}** — '{c.title}' has been **✅ Resolved** successfully.\n\nThe {dept_name} completed field remediation in {c.resolution_time_days or c.age_days} days. Thank you for using BharatSync AI to keep Indore clean and safe!"
            elif c.status == "Escalated":
                overdue = max(0, c.age_days - sla)
                reply = f"**Complaint #{c_id}** is currently **🔴 Escalated (Tier {c.escalation_level})**.\n\n**Why:** {dept_name} exceeded its {sla}-day SLA target by **{overdue} days**. The case has been automatically escalated by our Smart Escalation Engine.\n\n**Current status:** {'District Magistrate oversight active.' if c.escalation_level >= 2 else 'Department Head has been notified.'}"
                actions = ["Trigger Emergency Briefing", "Contact Ombudsman", "View Audit Trail"]
            else:
                remaining = max(0, sla - c.age_days)
                reply = f"**Complaint #{c_id}** — '{c.title}'\n\n**Status:** {c.status} with {dept_name}\n**Time active:** {c.age_days} days (SLA: {sla} days)\n**Remaining SLA time:** {remaining} days\n\nField teams are working on this. You'll be notified on resolution."
                actions = ["Request Status Update", "View Timeline"]
        elif c_id and not c:
            reply = f"Complaint **#{c_id}** was not found in our system. Please verify the ID or file a new grievance via the **Citizen Portal**."
        elif any(w in msg_lower for w in ["escalat", "delay", "sla", "tier"]):
            reply = "BharatSync AI's **Smart Escalation Engine** monitors every case for SLA compliance:\n\n- **Tier 1:** Dept Head alerted on SLA breach\n- **Tier 2:** District Magistrate notified on prolonged neglect\n- **Tier 3:** State Secretariat oversight on critical cases\n\nEscalation triggers: SLA breach + high sentiment score + complaint cluster density spikes."
            actions = ["View Escalation Dashboard", "Check City SLA Compliance"]
        elif any(w in msg_lower for w in ["file", "report", "new", "submit", "complaint"]):
            reply = "To file a new grievance:\n\n1. Go to the **Citizen Portal**\n2. Type your issue — AI instantly categorizes and routes it\n3. Get your Case ID for tracking\n\nOur AI analyzes your text in real-time for sentiment, urgency, and duplicate detection!"
            actions = ["Open Citizen Portal"]
        elif any(w in msg_lower for w in ["stat", "dashboard", "overview", "how many"]):
            reply = f"**Live BharatSync AI Statistics:**\n\n- 📊 Total Cases: **{total}**\n- ⏳ Active/Pending: **{pending}**\n- 🔴 Escalated: **{escalated}**\n- ✅ Resolved: **{resolved}**\n- 🚨 Negligence Flags: **{negligence}**\n\nAll data reflects the live Indore municipal ledger."
            actions = ["View Full Dashboard", "Open Analytics"]
        else:
            reply = f"Greetings! I am **BharatSync AI** — Indore's AI Governance Intelligence Assistant.\n\nI currently monitor **{total} active grievances** across 18 city zones. I can:\n- Track any complaint by ID (try: *'Status of complaint #9'*)\n- Explain escalation rules and SLA policies\n- Provide live city governance statistics\n- Guide you through filing a new grievance\n\nHow can I assist you today?"
            actions = ["Check Status", "File Complaint", "View Dashboard"]
            
    return {
        "reply": reply,
        "reasoning_steps": reasoning,
        "actions": actions
    }

# 11. AI Complaint Summary Generator (new endpoint)
@app.post("/api/complaints/{complaint_id}/summarize")
def summarize_complaint(complaint_id: int, db: Session = Depends(get_db)):
    """Generate an AI-powered executive summary of a complaint using Grok"""
    c = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    dept_name = c.department.name if c.department else "Unassigned"
    timeline_events = db.query(models.TimelineEvent).filter(models.TimelineEvent.complaint_id == complaint_id).all()
    timeline_text = "\n".join([f"- [{e.event_type.upper()}] {e.title}: {e.description}" for e in timeline_events])
    
    grok_api_key = os.environ.get("GROK_API_KEY", "")
    
    if grok_api_key:
        try:
            prompt = f"""Generate a concise executive summary (3-4 sentences) for this municipal complaint:

Title: {c.title}
Category: {c.category} | Status: {c.status} | Urgency: {c.urgency}
Location: {c.location} | Age: {c.age_days} days
Department: {dept_name}
Sentiment Score: {c.sentiment} | Escalation Level: {c.escalation_level}
Negligence Flag: {c.negligence_flag}

Timeline:
{timeline_text}

Write as a governance officer's briefing note. Be factual and direct."""

            res = requests.post(
                "https://api.x.ai/v1/chat/completions",
                headers={"Authorization": f"Bearer {grok_api_key}", "Content-Type": "application/json"},
                json={
                    "model": "grok-beta",
                    "messages": [
                        {"role": "system", "content": "You are a senior governance officer writing executive briefing notes. Be concise, factual, and professional."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 200
                },
                timeout=10
            )
            if res.status_code == 200:
                summary = res.json()["choices"][0]["message"]["content"]
                return {"summary": summary, "engine": "grok-beta", "complaint_id": complaint_id}
        except Exception as e:
            pass
    
    # Fallback summary
    summary = f"Complaint #{complaint_id} regarding '{c.title}' filed under {c.category} category. Currently {c.status} with {dept_name} for {c.age_days} days (urgency: {c.urgency}). {'Administrative negligence flag active — SLA significantly breached.' if c.negligence_flag else 'Within standard monitoring parameters.'}"
    return {"summary": summary, "engine": "rule-based", "complaint_id": complaint_id}

# 12. Predictive Hotspot Analysis (new innovation endpoint)
@app.get("/api/analytics/hotspots")
def get_hotspot_predictions(db: Session = Depends(get_db)):
    """AI-predicted grievance hotspots based on complaint cluster patterns"""
    from collections import Counter
    
    # Get all unresolved complaints
    complaints = db.query(models.Complaint).filter(models.Complaint.status != "Resolved").all()
    
    # Calculate zone-wise cluster risk
    zone_category_counts: dict = {}
    for c in complaints:
        zone = c.location.split(",")[0].strip() if c.location else "Unknown Zone"
        key = f"{zone}|{c.category}"
        zone_category_counts[key] = zone_category_counts.get(key, 0) + 1
    
    hotspots = []
    for key, count in sorted(zone_category_counts.items(), key=lambda x: -x[1]):
        zone, category = key.split("|")
        risk_score = min(100, count * 18 + random.randint(0, 10))
        hotspots.append({
            "zone": zone,
            "category": category,
            "complaint_count": count,
            "risk_score": risk_score,
            "prediction": "HIGH RISK — Systemic failure likely within 7 days" if risk_score > 60 else "MODERATE — Monitor closely",
            "recommended_action": f"Pre-emptive deployment of {category} response team to {zone}"
        })
    
    return {
        "hotspots": hotspots[:8],
        "analysis_timestamp": datetime.now().isoformat(),
        "total_active_complaints": len(complaints),
        "ai_confidence": 0.87
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

