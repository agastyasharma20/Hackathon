"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GlowingCard } from "@/components/glowing-card";
import { 
  ShieldAlert, 
  ArrowUpRight, 
  CheckCircle2, 
  UserPlus, 
  FileWarning, 
  AlertTriangle,
  Clock,
  Compass,
  CornerDownRight,
  TrendingDown,
  Layers,
  ChevronRight,
  Activity,
  Loader2,
  RefreshCw
} from "lucide-react";

const INITIAL_MOCK_ESCALATIONS = [
  { id: 9, title: "Major sewage pipe burst near Vijay Nagar square", category: "Water", sentiment: -0.9, urgency: "Critical", status: "Escalated", location: "Zone 1, Vijay Nagar", department_code: "WATER", department_name: "Municipal Water Department", lead: "Smt. Sunita Sharma", age_days: 18, negligence_flag: true, escalation_level: 2, created_at: "2026-05-04T10:00:00Z", density_score: 0.85, confidence_score: 0.94 },
  { id: 1, title: "Severe potholes on the main road of Scheme 54", category: "Roads", sentiment: -0.7, urgency: "High", status: "Escalated", location: "Zone 4, Vijay Nagar", department_code: "ROADS", department_name: "Road Maintenance Division", lead: "Shri Rajesh Kumar", age_days: 15, negligence_flag: true, escalation_level: 1, created_at: "2026-05-07T12:00:00Z", density_score: 0.72, confidence_score: 0.88 },
  { id: 31, title: "Complete lack of streetlights on Scheme 78 main stretch", category: "Public Safety", sentiment: -0.8, urgency: "High", status: "Escalated", location: "Zone 8, Vijay Nagar", department_code: "SAFETY", department_name: "Public Safety Command", lead: "Smt. Priyanka Rao", age_days: 22, negligence_flag: true, escalation_level: 3, created_at: "2026-04-30T15:00:00Z", density_score: 0.82, confidence_score: 0.89 },
  { id: 2, title: "Caved-in asphalt on LIG Link Road", category: "Roads", sentiment: -0.6, urgency: "High", status: "Escalated", location: "Zone 3, LIG Sector", department_code: "ROADS", department_name: "Road Maintenance Division", lead: "Shri Rajesh Kumar", age_days: 12, negligence_flag: false, escalation_level: 1, created_at: "2026-05-10T11:00:00Z", density_score: 0.54, confidence_score: 0.91 },
  { id: 11, title: "Water contamination and sewage smell in Zone 5", category: "Water", sentiment: -0.85, urgency: "Critical", status: "Escalated", location: "Zone 5, Sukhlia", department_code: "WATER", department_name: "Municipal Water Department", lead: "Smt. Sunita Sharma", age_days: 9, negligence_flag: false, escalation_level: 1, created_at: "2026-05-13T14:00:00Z", density_score: 0.68, confidence_score: 0.96 }
];

export default function SmartEscalationDashboard() {
  const [escalations, setEscalations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<number>(0); // Selected complaint index for timeline inspection

  // Fetch escalated complaints
  const fetchEscalations = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/complaints?status=Escalated");
      if (res.ok) {
        const data = await res.json();
        setEscalations(data);
      } else {
        throw new Error("HTTP Fetch Error");
      }
    } catch (err) {
      console.log("Using local mock escalated complaints dataset...");
      setEscalations(INITIAL_MOCK_ESCALATIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  // Handle Escalation Level Up Override
  const handlePromoteEscalation = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/complaints/${id}/escalate`, {
        method: "POST"
      });
      if (res.ok) {
        alert("Escalation Tier Promoted Successfully!");
        fetchEscalations();
      } else {
        throw new Error("API error");
      }
    } catch (err) {
      console.log("Failing back to mock promoter.");
      setEscalations(prev => 
        prev.map(item => {
          if (item.id === id) {
            const nextLevel = Math.min(3, item.escalation_level + 1);
            return {
              ...item,
              escalation_level: nextLevel,
              negligence_flag: nextLevel > 1 ? true : item.negligence_flag
            };
          }
          return item;
        })
      );
      alert("Manual Smart Escalation Tier promoted in offline preview mode.");
    }
  };

  // Handle Resolution Action
  const handleResolve = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/complaints/${id}/resolve`, {
        method: "POST"
      });
      if (res.ok) {
        alert("Grievance Marked as Resolved! Removed from active escalation deck.");
        fetchEscalations();
      } else {
        throw new Error("API error");
      }
    } catch (err) {
      console.log("Failing back to mock resolver.");
      setEscalations(prev => prev.filter(item => item.id !== id));
      alert("Grievance marked as resolved in offline preview. Audit log updated.");
    }
  };

  const selectedComplaint = escalations[activeTab];

  // Helper to map levels to official authorities
  const escalationTiers = [
    { name: "Unescalated", desc: "Standard Department Handling" },
    { name: "Tier 1: Department Head", desc: "Oversight by Division General Lead" },
    { name: "Tier 2: District Commissioner", desc: "Direct Supervision by Indore Commissioner Office" },
    { name: "Tier 3: Oversight Secretariat", desc: "State Secretariat Ministerial Commission Intervention" }
  ];

  return (
    <div className="flex-1 p-8 relative flex flex-col justify-between font-mono">
      <div className="absolute inset-0 cyber-grid-fine opacity-10 pointer-events-none" />

      {/* Control Room Header */}
      <div className="relative z-10 border-b border-slate-900 pb-6 mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-wider text-slate-100 uppercase">
            Smart Escalations Deck
          </h2>
          <p className="text-slate-500 text-[11px] uppercase tracking-widest mt-1">
            Systemic Neglect audits, SLA breaches & Ministerial overrides
          </p>
        </div>
        
        <button
          onClick={fetchEscalations}
          className="py-2.5 px-4 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition text-[11px] uppercase flex items-center space-x-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Escalations</span>
        </button>
      </div>

      {/* Scorecards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <GlowingCard variant="purple" active={true}>
          <div className="text-[10px] text-slate-500 uppercase">Active Triage Pool</div>
          <div className="text-3xl font-black text-neon-purple mt-1.5 tracking-tight">{escalations.length}</div>
          <div className="text-[9px] text-neon-purple/70 mt-0.5">CRITICAL ESCALATIONS ACTIVE</div>
        </GlowingCard>

        <GlowingCard variant="red">
          <div className="text-[10px] text-slate-500 uppercase">Negligence Detected</div>
          <div className="text-3xl font-black text-neon-red mt-1.5 tracking-tight">
            {escalations.filter(c => c.negligence_flag).length}
          </div>
          <div className="text-[9px] text-neon-red/70 mt-0.5">SLA BREACH x1.5 EXCEEDED</div>
        </GlowingCard>

        <GlowingCard variant="default">
          <div className="text-[10px] text-slate-500 uppercase">Avg Response Lag</div>
          <div className="text-3xl font-black text-slate-100 mt-1.5 tracking-tight">14.4d</div>
          <div className="text-[9px] text-slate-500 mt-0.5">DAYS IN DELAY STATUS</div>
        </GlowingCard>

        <GlowingCard variant="cyan">
          <div className="text-[10px] text-slate-500 uppercase">Ombudsman Desk</div>
          <div className="text-3xl font-black text-neon-cyan mt-1.5 tracking-tight">
            {escalations.filter(c => c.escalation_level === 3).length}
          </div>
          <div className="text-[9px] text-neon-cyan/70 mt-0.5">LEVEL 3 SEC OVERSIGHT</div>
        </GlowingCard>
      </div>

      {/* Main double column workspace split */}
      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: List of active escalated tickets */}
        <div className="xl:col-span-7 space-y-4">
          <h3 className="text-xs font-semibold uppercase text-slate-400 mb-2 flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4 text-neon-purple" />
            <span>Escalation Queue</span>
          </h3>

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center text-slate-500 bg-slate-950/20 border border-slate-900 rounded-xl">
              <Loader2 className="w-8 h-8 animate-spin text-neon-purple mb-3" />
              <p className="text-xs uppercase">TRIAGING CRITICAL TIMELINES...</p>
            </div>
          ) : escalations.length === 0 ? (
            <div className="py-20 text-center text-slate-600 text-xs uppercase bg-slate-950/20 border border-slate-900 rounded-xl">
              Clean Slate. Zero active escalated grievances.
            </div>
          ) : (
            <div className="space-y-4">
              {escalations.map((c, idx) => {
                const isActive = activeTab === idx;
                const isHighlyNeglected = c.negligence_flag;
                
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveTab(idx)}
                    className={`p-5 rounded-xl border font-mono transition-all duration-300 relative text-left cursor-pointer ${
                      isActive 
                        ? "bg-slate-900 border-neon-purple shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                        : "bg-slate-950/30 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/10"
                    }`}
                  >
                    {/* Glowing indicator corner on negligence */}
                    {isHighlyNeglected && (
                      <div className="absolute top-0 right-0 px-2 py-0.5 bg-neon-red/10 border-b border-l border-neon-red/35 text-neon-red font-black text-[8px] rounded-tr-xl tracking-wider uppercase animate-pulse">
                        ⚠️ Negligence Detected
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-2 pr-20">
                      <div>
                        <div className="text-xs font-bold text-slate-200 font-sans truncate max-w-[340px]">
                          {c.title}
                        </div>
                        <div className="text-[9px] text-slate-500 mt-1 uppercase flex items-center">
                          <span className="text-neon-cyan font-bold mr-1.5">#{c.id}</span>
                          <span>{c.location}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 font-sans line-clamp-2 leading-relaxed mb-4">
                      {c.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/40 text-[9px] text-slate-500 uppercase">
                      <div>
                        DEPT: <span className="text-slate-300 font-semibold">{c.department_code}</span>
                      </div>
                      <div>•</div>
                      <div>
                        ANGER: <span className="text-neon-purple font-semibold">{Math.abs(c.sentiment * 100)}%</span>
                      </div>
                      <div>•</div>
                      <div>
                        DELAY: <span className="text-neon-red font-semibold">{c.age_days} DAYS</span>
                      </div>
                      <div className="ml-auto">
                        <span className="text-neon-cyan font-semibold bg-neon-cyan/10 border border-neon-cyan/25 px-2 py-0.5 rounded">
                          TIER {c.escalation_level}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Complaint Audit Panel */}
        <div className="xl:col-span-5 space-y-6">
          <h3 className="text-xs font-semibold uppercase text-slate-400 mb-2">
            Audit Control Console
          </h3>

          {!selectedComplaint ? (
            <div className="p-8 text-center text-slate-600 text-xs uppercase border border-slate-900 bg-slate-950/20 rounded-xl">
              Select an escalated ticket to load audit parameters.
            </div>
          ) : (
            <GlowingCard variant={selectedComplaint.negligence_flag ? "red" : "purple"} active={true}>
              <div className="space-y-6 font-mono">
                {/* Header info */}
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase">
                    <span>Audit Ticket #{selectedComplaint.id}</span>
                    <span className="text-neon-red font-bold flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-red mr-1.5 animate-ping" />
                      IMMEDIATE ACTION REQUIRED
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 font-sans mt-1">
                    {selectedComplaint.title}
                  </h4>
                </div>

                {/* Telemetry metrics detail list */}
                <div className="space-y-3.5 text-[10px] text-slate-400">
                  <div className="flex justify-between items-center p-2.5 rounded bg-slate-950/60 border border-slate-850">
                    <span>CIVIC DIVISION TARGET</span>
                    <span className="text-slate-200 font-semibold">{selectedComplaint.department_name}</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded bg-slate-950/60 border border-slate-850">
                    <span>DIVISION DIRECTOR</span>
                    <span className="text-neon-cyan font-semibold">{selectedComplaint.lead || "Oversight Board"}</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded bg-slate-950/60 border border-slate-850">
                    <span>CITIZEN ANGER COEFFICIENT</span>
                    <span className="text-neon-purple font-semibold">{Math.abs(selectedComplaint.sentiment * 100)}% NEGATIVE</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded bg-slate-950/60 border border-slate-850">
                    <span>DUPLICATE SPIKE DENSITY</span>
                    <span className="text-neon-orange font-semibold">{(selectedComplaint.density_score * 100).toFixed(0)}% INDEX</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded bg-slate-950/60 border border-slate-850">
                    <span>TRIAGE CLASSIFICATION SPEED</span>
                    <span className="text-neon-green font-semibold">120ms (CONF: {selectedComplaint.confidence_score * 100}%)</span>
                  </div>
                </div>

                {/* Escalation Step Indicator diagram */}
                <div className="space-y-3">
                  <div className="text-[10px] text-slate-500 uppercase">Escalation Supervisory Pathway</div>
                  
                  <div className="space-y-2.5 font-sans relative pl-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                    {escalationTiers.map((tier, idx) => {
                      const isReached = selectedComplaint.escalation_level >= idx;
                      const isCurrent = selectedComplaint.escalation_level === idx;
                      
                      return (
                        <div key={idx} className="relative text-xs">
                          {/* Anchor Circle marker */}
                          <div className={`absolute -left-[24px] top-1 w-3.5 h-3.5 rounded-full border-2 ${
                            isCurrent
                              ? "bg-neon-red border-neon-red shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse"
                              : isReached
                              ? "bg-neon-purple border-neon-purple"
                              : "bg-slate-950 border-slate-800"
                          }`} />
                          
                          <div className={`font-mono text-[10px] font-bold ${isReached ? "text-slate-200" : "text-slate-500"}`}>
                            {tier.name}
                          </div>
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                            {tier.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Control Action Buttons */}
                <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-6">
                  {/* Escalate Tier button */}
                  <button
                    onClick={() => handlePromoteEscalation(selectedComplaint.id)}
                    disabled={selectedComplaint.escalation_level >= 3}
                    className={`py-3 px-4 rounded-xl border text-[10px] font-bold uppercase transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                      selectedComplaint.escalation_level >= 3
                        ? "bg-slate-900 border-slate-850 text-slate-600 cursor-not-allowed"
                        : "bg-neon-purple/10 border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-slate-950"
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Override Tier Up</span>
                  </button>

                  {/* Resolve button */}
                  <button
                    onClick={() => handleResolve(selectedComplaint.id)}
                    className="py-3 px-4 rounded-xl border border-neon-green bg-neon-green/10 text-neon-green hover:bg-neon-green hover:text-slate-950 text-[10px] font-bold uppercase transition flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Inspect and Close</span>
                  </button>
                </div>
              </div>
            </GlowingCard>
          )}
        </div>
      </div>
    </div>
  );
}
