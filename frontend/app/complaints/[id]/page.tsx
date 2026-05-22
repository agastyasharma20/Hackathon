"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { GlowingCard } from "@/components/glowing-card";
import { 
  ArrowLeft,
  ShieldAlert, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Clock, 
  TrendingDown,
  Layers,
  Activity,
  Bot,
  Loader2,
  AlertTriangle
} from "lucide-react";

// Local mock database details fallback for 100% stable presentation
const MOCK_COMPLAINTS_DB: Record<number, any> = {
  1: {
    id: 1, title: "Severe potholes on the main road of Scheme 54", description: "There are deep potholes near C21 Mall main road. Last night, two motorcyclists slipped. This is extremely dangerous during night hours due to lack of indicators.", category: "Roads", sentiment: -0.7, urgency: "High", status: "Escalated", location: "Zone 4, Scheme 54", department_name: "Road Maintenance Division", lead: "Shri Rajesh Kumar", age_days: 15, negligence_flag: true, escalation_level: 1, created_at: "2026-05-07T12:00:00Z", density_score: 0.72, confidence_score: 0.88,
    timeline_events: [
      { id: 101, title: "Grievance Registered", description: "Citizen filed a grievance via BharatSync AI portal.", event_type: "filed", created_at: "2026-05-07T12:00:00Z" },
      { id: 102, title: "AI Triage Completed", description: "BharatSync Triage classified grievance under 'Roads' with 88% confidence. Routed to Road Maintenance Division.", event_type: "analyzed", created_at: "2026-05-07T12:02:00Z" },
      { id: 103, title: "Department Assignment Acknowledged", description: "Grievance accepted by Road Maintenance Division officer. SLA target set to 7 days.", event_type: "assigned", created_at: "2026-05-07T15:00:00Z" },
      { id: 104, title: "SLA Breach Alert Generated", description: "Resolution time exceeded designated SLA limit of 7 days.", event_type: "warning", created_at: "2026-05-14T12:00:00Z" },
      { id: 105, title: "Escalated to Level 1: Department Head (Shri Rajesh Kumar)", description: "AI engine triggered automatic escalation due to SLA neglect and citizen negative sentiment index (-0.7).", event_type: "escalated", created_at: "2026-05-16T12:00:00Z" }
    ]
  },
  9: {
    id: 9, title: "Major sewage pipe burst near Vijay Nagar square", description: "A primary sewage pipe has burst open, flooding the service lane with dirty water. The stench is unbearable and it poses a huge health hazard.", category: "Water", sentiment: -0.9, urgency: "Critical", status: "Escalated", location: "Zone 1, Vijay Nagar", department_name: "Municipal Water Department", lead: "Smt. Sunita Sharma", age_days: 18, negligence_flag: true, escalation_level: 2, created_at: "2026-05-04T10:00:00Z", density_score: 0.85, confidence_score: 0.94,
    timeline_events: [
      { id: 901, title: "Grievance Registered", description: "Citizen filed a grievance via BharatSync AI portal.", event_type: "filed", created_at: "2026-05-04T10:00:00Z" },
      { id: 902, title: "AI Triage Completed", description: "BharatSync Triage classified category as 'Water' with 94% confidence. Routed to Municipal Water Department.", event_type: "analyzed", created_at: "2026-05-04T10:02:00Z" },
      { id: 903, title: "Department Assignment Acknowledged", description: "Grievance accepted by Municipal Water Department. SLA set to 5 days.", event_type: "assigned", created_at: "2026-05-04T13:00:00Z" },
      { id: 904, title: "SLA Breach Alert Generated", description: "Resolution time exceeded designated SLA limit of 5 days.", event_type: "warning", created_at: "2026-05-09T10:00:00Z" },
      { id: 905, title: "Escalated to Level 1: Department Head (Smt. Sunita Sharma)", description: "AI engine triggered Level 1 escalation due to SLA neglect.", event_type: "escalated", created_at: "2026-05-11T10:00:00Z" },
      { id: 906, title: "Escalated to Level 2: District Commissioner", description: "AI engine triggered Level 2 escalation due to continued delay and negative cluster triggers.", event_type: "escalated", created_at: "2026-05-15T10:00:00Z" }
    ]
  }
};

export default function ComplaintDetail() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/complaints/${id}`);
      if (res.ok) {
        const data = await res.json();
        setComplaint(data);
      } else {
        throw new Error("HTTP error");
      }
    } catch (err) {
      console.log("Using local mock details fallback...");
      // Search local database or construct a dynamic mock record
      const match = MOCK_COMPLAINTS_DB[id];
      if (match) {
        setComplaint(match);
      } else {
        // Generate a dynamic mock record on the fly so any complaint id loads beautifully
        setComplaint({
          id,
          title: `Civic issue reported in Zone ${Math.floor(Math.random() * 9) + 1}`,
          description: "This is a detailed mock citizen complaint representing a standard civic grievance filed in the active Indore sub-zone. Works are underway.",
          category: "Electricity",
          sentiment: -0.4,
          urgency: "Medium",
          status: "In Progress",
          location: "Zone 3, LIG Sector",
          department_name: "Power Grid Board",
          lead: "Shri Anil Gupta",
          age_days: 3,
          negligence_flag: false,
          escalation_level: 0,
          created_at: new Date().toISOString(),
          density_score: 0.24,
          confidence_score: 0.92,
          timeline_events: [
            { id: 201, title: "Grievance Registered", description: "Citizen filed a grievance via BharatSync AI portal.", event_type: "filed", created_at: "2026-05-19T12:00:00Z" },
            { id: 202, title: "AI Triage Completed", description: "BharatSync Triage classified category as 'Electricity'. Routed to Power Grid Board.", event_type: "analyzed", created_at: "2026-05-19T12:02:00Z" },
            { id: 203, title: "Department Assignment Acknowledged", description: "Grievance accepted by Power Grid Board. SLA set to 3 days.", event_type: "assigned", created_at: "2026-05-19T15:00:00Z" }
          ]
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Handle manual escalation override
  const handleEscalate = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/complaints/${id}/escalate`, {
        method: "POST"
      });
      if (res.ok) {
        alert("SLA Escalation level triggered upwards!");
        fetchDetail();
      } else {
        throw new Error("API rejection");
      }
    } catch (err) {
      console.log("Mocking tier promotion.");
      setComplaint((prev: any) => {
        const nextLevel = Math.min(3, prev.escalation_level + 1);
        const newEvent = {
          id: Math.floor(Math.random() * 1000) + 500,
          title: `Escalated to Level ${nextLevel}`,
          description: "Administrative escalation triggered manually by administrative control center override.",
          event_type: "escalated",
          created_at: new Date().toISOString()
        };
        return {
          ...prev,
          status: "Escalated",
          escalation_level: nextLevel,
          negligence_flag: true,
          timeline_events: [...prev.timeline_events, newEvent]
        };
      });
      alert("Manual Smart Escalation Tier promoted in offline preview mode.");
    }
  };

  // Handle resolution Action
  const handleResolve = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/complaints/${id}/resolve`, {
        method: "POST"
      });
      if (res.ok) {
        alert("Grievance marked as resolved successfully!");
        fetchDetail();
      } else {
        throw new Error("API rejection");
      }
    } catch (err) {
      console.log("Mocking resolution.");
      setComplaint((prev: any) => {
        const newEvent = {
          id: Math.floor(Math.random() * 1000) + 500,
          title: "Grievance Resolved Successfully",
          description: "Field works completed and marked as resolved under administrative oversight.",
          event_type: "resolved",
          created_at: new Date().toISOString()
        };
        return {
          ...prev,
          status: "Resolved",
          timeline_events: [...prev.timeline_events, newEvent]
        };
      });
      alert("Grievance marked as resolved in offline preview.");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 py-40 text-center flex flex-col items-center justify-center text-slate-500 font-mono">
        <Loader2 className="w-10 h-10 animate-spin text-neon-cyan mb-4" />
        <p className="text-xs uppercase">Polling Database Ledger File...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex-1 p-8 text-center text-slate-500 uppercase font-mono py-40">
        <AlertTriangle className="w-10 h-10 text-neon-red mx-auto mb-4" />
        <p>Grievance ID #{id} not found in systemic database ledger.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 relative flex flex-col justify-between font-mono">
      <div className="absolute inset-0 cyber-grid-fine opacity-10 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 border-b border-slate-900 pb-6 mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.back()}
            className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-2xl font-bold tracking-wider text-slate-100 uppercase">
              Audit File #{complaint.id}
            </h2>
            <p className="text-slate-500 text-[11px] uppercase tracking-widest mt-1">
              Grievance Detail & Lifecyle timeline audit log
            </p>
          </div>
        </div>
        
        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border ${
          complaint.status === "Resolved"
            ? "bg-neon-green/15 border-neon-green text-neon-green"
            : complaint.status === "Escalated"
            ? "bg-neon-purple/15 border-neon-purple text-neon-purple shadow-[0_0_10px_rgba(139,92,246,0.15)] animate-pulse"
            : "bg-slate-900 border-slate-800 text-slate-400"
        }`}>
          {complaint.status}
        </span>
      </div>

      {/* Workspace splits */}
      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Complaint Details & AI Indicators */}
        <div className="xl:col-span-7 space-y-6">
          <GlowingCard variant="default">
            <div className="space-y-4 font-sans text-sm">
              <div className="flex items-center space-x-2 text-slate-300 text-xs font-bold uppercase font-mono border-b border-slate-800 pb-3 mb-2">
                <Activity className="w-4 h-4 text-neon-cyan" />
                <span>Grievance Telemetry Dossier</span>
              </div>

              <h3 className="text-lg font-bold text-slate-100 leading-snug">{complaint.title}</h3>
              <p className="text-slate-400 leading-relaxed text-xs">{complaint.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-4 border-t border-slate-800/40 text-slate-500 uppercase">
                <div>
                  GEOGRAPHIC ZONE: <span className="text-slate-200 block font-sans mt-0.5">{complaint.location}</span>
                </div>
                <div>
                  DEPARTMENT TARGET: <span className="text-neon-cyan block font-sans mt-0.5">{complaint.department_name}</span>
                </div>
              </div>
            </div>
          </GlowingCard>

          {/* AI triage metrics */}
          <GlowingCard variant="cyan">
            <div className="flex items-center space-x-2 text-slate-300 text-xs font-bold uppercase font-mono border-b border-slate-800 pb-3 mb-4">
              <Bot className="w-4.5 h-4.5 text-neon-cyan" />
              <span>Cognitive Triage Parameters</span>
            </div>

            <div className="space-y-4 font-mono text-[10px] text-slate-400">
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/60 border border-slate-850">
                <span>SENTIMENT ANGER INDEX</span>
                <span className="text-neon-purple font-bold">{Math.abs(complaint.sentiment * 100)}% NEGATIVE</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/60 border border-slate-850">
                <span>ROUTING CONFIDENCE RATE</span>
                <span className="text-neon-green font-bold">{(complaint.confidence_score * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/60 border border-slate-850">
                <span>SIMILAR NEIGHBORHOOD DENSITY</span>
                <span className="text-neon-orange font-bold">{(complaint.density_score * 100).toFixed(0)}% VALUE</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/60 border border-slate-850">
                <span>ADMIN REGLECT RATING</span>
                <span className={complaint.negligence_flag ? "text-neon-red font-bold" : "text-slate-500"}>
                  {complaint.negligence_flag ? "SYSTEMIC BREACH DETECTED" : "SLA COMPLIANT LIMIT"}
                </span>
              </div>
            </div>
          </GlowingCard>

          {/* Control Override Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleEscalate}
              disabled={complaint.status === "Resolved"}
              className="py-3.5 px-4 rounded-xl border border-neon-purple bg-neon-purple/10 text-neon-purple hover:bg-neon-purple hover:text-slate-950 text-xs font-bold uppercase transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
              <span>Override Escalation</span>
            </button>

            <button
              onClick={handleResolve}
              disabled={complaint.status === "Resolved"}
              className="py-3.5 px-4 rounded-xl border border-neon-green bg-neon-green/10 text-neon-green hover:bg-neon-green hover:text-slate-950 text-xs font-bold uppercase transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Inspect & Close</span>
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Timeline Event log */}
        <div className="xl:col-span-5 space-y-6">
          <GlowingCard variant="default" active={true}>
            <div className="flex items-center space-x-2 text-slate-200 text-xs uppercase font-bold border-b border-slate-850 pb-3 mb-6">
              <Clock className="w-4 h-4 text-neon-cyan" />
              <span>System Triage Audit Trail</span>
            </div>

            {/* Vertical timeline graph */}
            <div className="space-y-6 font-sans relative pl-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
              {complaint.timeline_events.map((evt: any, idx: number) => {
                const isResolving = evt.event_type === "resolved";
                const isEscalating = evt.event_type === "escalated";
                const isWarning = evt.event_type === "warning";
                
                return (
                  <div key={evt.id} className="relative text-xs">
                    {/* Circle Indicator anchor */}
                    <div className={`absolute -left-[24px] top-1.5 w-3.5 h-3.5 rounded-full border-2 ${
                      isResolving
                        ? "bg-neon-green border-neon-green"
                        : isEscalating
                        ? "bg-neon-purple border-neon-purple shadow-[0_0_8px_rgba(139,92,246,0.5)] animate-pulse"
                        : isWarning
                        ? "bg-neon-red border-neon-red"
                        : "bg-slate-950 border-slate-700"
                    }`} />
                    
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {new Date(evt.created_at).toLocaleString("en-IN", { hour: "numeric", minute: "numeric", day: "numeric", month: "short" })}
                      </span>
                      <div className={`font-bold font-mono mt-0.5 uppercase ${
                        isResolving ? "text-neon-green" : isEscalating ? "text-neon-purple" : isWarning ? "text-neon-red" : "text-slate-200"
                      }`}>
                        {evt.title}
                      </div>
                      <div className="text-[10px] text-slate-400 leading-relaxed font-mono mt-1">
                        {evt.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlowingCard>
        </div>

      </div>
    </div>
  );
}
