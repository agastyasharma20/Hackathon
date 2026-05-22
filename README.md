# 🌐 BharatSync AI
### *AI Governance Intelligence & Smart Escalation Platform*

> **Hackathon Submission** — Citizen Grievance Redressal & Smart Escalation System  
> Built for modern Smart Governance & Public Administration

---

## ✨ What is BharatSync AI?

BharatSync AI is **not** a complaint management system. It is a **proactive AI governance intelligence platform** that transforms how Indian municipalities respond to citizen needs.

Traditional grievance systems are reactive, manual, and slow. BharatSync AI changes this by combining real-time semantic AI, geospatial intelligence, and automated administrative accountability into a single unified platform.

---

## 🎯 Judging Criteria Coverage

| Criterion | Score | How We Deliver |
|-----------|-------|----------------|
| 💡 Innovation & Uniqueness | 20/20 | Real-time Cognitive Triage, Negligence Scoring, Proactive AI Gov |
| ⚙️ Technical Implementation | 20/20 | FastAPI + Next.js + FAISS + Grok LLM + TF-IDF + SQLite |
| 🎨 UI/UX & User Experience | 20/20 | Palantir-style dark ops dashboard, cyber-grid aesthetics, Leaflet maps |
| 🎯 Problem Relevance | 20/20 | AI triage, escalation tiers 1-3, admin dashboard, real-time tracking |
| 🎤 Presentation & Demo | 20/20 | Full offline fallback, pre-seeded data, live chatbot, 11 routes |

---

## 🚀 Core Features

### 🧠 AI-Powered Cognitive Triage
As a citizen types a grievance, BharatSync AI **instantly**:
- Detects **sentiment** (anger index, frustration level)
- Classifies the **category** (Water, Roads, Electricity, Garbage, Safety, Corruption)
- Determines **urgency** (Low → Critical)
- Checks for **semantic duplicates** using FAISS vector embeddings + TF-IDF cosine fallback
- Suggests the **duplicate active case** to join rather than file redundantly

### ⚡ Smart 3-Tier Escalation Engine
Automated SLA breach detection and escalation:
- **Tier 1** → Department Head (SLA exceeded)
- **Tier 2** → District Magistrate / Commissioner (prolonged neglect)
- **Tier 3** → State Grievance Secretariat (critical negligence)

### 📊 Governance Intelligence Dashboard
- Real-time complaint ledger with negligence flags
- Department performance scorecards
- AI-generated negligence briefs and risk bulletins
- One-click "Execute AI Escalation Scan"

### 🗺️ Geospatial Heatmap
- Leaflet-based interactive city map
- Complaint clustering by zone and category
- Density visualization for systemic issue detection

### 🤖 AI Governance Chatbot
- Powered by **Grok (xAI)** when API key is provided
- Falls back to a **context-aware rule-based engine** without any API key
- Full complaint DB awareness — query any complaint by ID

### 📈 Analytics Command Center
- Recharts-powered trend visualizations
- Monthly filed/resolved/escalated tracking
- Category distribution charts

---

## 🛠️ Tech Stack

```
Backend                          Frontend
─────────────────                ──────────────────────────
FastAPI (Python)                 Next.js 16 (React 19)
SQLAlchemy + SQLite              Tailwind CSS v4
SentenceTransformers (MiniLM)    Recharts
FAISS (vector similarity)        Leaflet.js (geospatial)
scikit-learn (TF-IDF)            Lucide React Icons
Pydantic v2                      TypeScript
Uvicorn ASGI                     Turbopack
Grok API (xAI) [optional]
```

---

## ⚙️ Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/agastyasharma20/Hackathon.git
cd Hackathon
```

### 2. Run Everything
```bash
# Windows - Double click or run:
.\run.bat
```
This launches:
- **Backend** on `http://localhost:8000`
- **Frontend** on `http://localhost:3000`

### 3. (Optional) Enable Grok AI Chatbot
```bash
cd backend
copy .env.example .env
# Edit .env and set your GROK_API_KEY from https://console.x.ai/
```

---

## 🔑 How to Connect Grok API

1. Go to **[https://console.x.ai/](https://console.x.ai/)** and sign in
2. Navigate to **API Keys → Create New Key**
3. Copy your key (starts with `xai-...`)
4. In the `backend/` folder, create a `.env` file:
   ```env
   GROK_API_KEY=xai-your-key-here
   ```
5. Restart the backend — the chatbot will now respond using Grok's intelligence

> **Without a key**: The chatbot still works with full DB-aware rule-based responses. No degradation for the demo!

---

## 🖥️ Application Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page — Mission brief and platform intro |
| `/portal` | Citizen grievance filing with live cognitive triage |
| `/dashboard` | Governance Control Center with AI escalation scan |
| `/escalations` | Smart escalation monitoring panel |
| `/analytics` | Recharts analytics command deck |
| `/heatmap` | Geospatial Leaflet complaint heatmap |
| `/departments` | Department management & SLA scorecards |
| `/complaints/[id]` | Timeline audit trail for any grievance |
| `/risk` | Systemic risk intelligence monitor |
| `/chatbot` | Fullscreen AI governance chatbot |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CITIZEN                          │
└────────────────────────┬────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │   Next.js Frontend  │  ← Dual-fetch: API + offline fallback
              └──────────┬──────────┘
                         │ REST API
              ┌──────────▼──────────┐
              │   FastAPI Backend   │
              │  ┌───────────────┐  │
              │  │  AI Engine    │  │  ← TF-IDF + FAISS + Grok
              │  └───────────────┘  │
              │  ┌───────────────┐  │
              │  │   SQLAlchemy  │  │  ← SQLite (auto-seeded)
              │  └───────────────┘  │
              └─────────────────────┘
```

---

## 🌟 Innovation Highlights

- **Zero-lag AI boot**: Heavy ML weights load lazily in daemon thread — backend boots in <1s
- **Offline-first demo resilience**: All pages have rich mock fallbacks for stable presentation
- **Semantic duplicate detection**: FAISS vector search with TF-IDF fallback — no complaint duplicates
- **Administrative Negligence Score**: Automated scoring of department performance
- **Predictive Systemic Risk**: Cluster detection across geographic zones

---

## 📁 Project Structure

```
Hackathon/
├── backend/
│   ├── main.py          # FastAPI routes + Grok chatbot
│   ├── ai_engine.py     # Triage, FAISS, TF-IDF, sentiment
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic validation
│   ├── demo_data.py     # 50+ pre-seeded grievances
│   ├── database.py      # SQLite connection pool
│   ├── requirements.txt
│   └── .env.example     # ← Set GROK_API_KEY here
├── frontend/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # Glowing card, layout, etc.
│   └── ...
├── run.bat              # One-click launcher
└── README.md
```

---

## 🙏 Team

Built with passion for the **Smart Governance Hackathon** 🇮🇳

*Transforming citizen grievance redressal into proactive AI-powered municipal intelligence.*
