"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GlowingCard } from "@/components/glowing-card";
import { 
  BarChart3,
  Search,
  Filter,
  AlertTriangle,
  Zap,
  Building2,
  Calendar,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileWarning,
  RefreshCw,
  TrendingDown,
  Loader2
} from "lucide-react";


const INITIAL_MOCK_COMPLAINTS = [
  { id: 1, title: "Severe potholes on the main road of Scheme 54", category: "Roads", sentiment: -0.7, urgency: "High", status: "Escalated", location: "Zone 4, Vijay Nagar", department_code: "ROADS", age_days: 15, negligence_flag: true, escalation_level: 1, created_at: "2026-05-07T12:00:00Z" },
  { id: 9, title: "Major sewage pipe burst near Vijay Nagar square", category: "Water", sentiment: -0.9, urgency: "Critical", status: "Escalated", location: "Zone 1, Vijay Nagar", department_code: "WATER", age_days: 18, negligence_flag: true, escalation_level: 2, created_at: "2026-05-04T10:00:00Z" },
  { id: 17, title: "Fallen high-voltage wire near Scheme 114 park", category: "Electricity", sentiment: -0.95, urgency: "Critical", status: "In Progress", location: "Zone 8, Vijay Nagar", department_code: "POWER", age_days: 2, negligence_flag: false, escalation_level: 0, created_at: "2026-05-20T08:30:00Z" },
  { id: 24, title: "Overflowing garbage bin near Scheme 54 market", category: "Garbage", sentiment: -0.5, urgency: "Medium", status: "Resolved", location: "Zone 4, Vijay Nagar", department_code: "GARBAGE", age_days: 8, negligence_flag: false, escalation_level: 0, created_at: "2026-05-14T09:00:00Z" },
  { id: 31, title: "Complete lack of streetlights on Scheme 78 main stretch", category: "Public Safety", sentiment: -0.8, urgency: "High", status: "Escalated", location: "Zone 8, Vijay Nagar", department_code: "SAFETY", age_days: 22, negligence_flag: true, escalation_level: 3, created_at: "2026-04-30T15:00:00Z" },
  { id: 38, title: "Clerk demanding bribe for property tax correction", category: "Corruption", sentiment: -0.9, urgency: "Critical", status: "Pending", location: "Zone 4, Vijay Nagar", department_code: "CORRUPTION", age_days: 1, negligence_flag: false, escalation_level: 0, created_at: "2026-05-21T11:00:00Z" },
  { id: 10, title: "Contaminated water supply in Sector A, Scheme 54", category: "Water", sentiment: -0.8, urgency: "Critical", status: "In Progress", location: "Zone 4, Vijay Nagar", department_code: "WATER", age_days: 4, negligence_flag: false, escalation_level: 0, created_at: "2026-05-18T14:20:00Z" },
  { id: 19, title: "Damaged transformer sparking near LIG Colony", category: "Electricity", sentiment: -0.8, urgency: "Critical", status: "Resolved", location: "Zone 3, Vijay Nagar", department_code: "POWER", age_days: 3, negligence_flag: false, escalation_level: 0, created_at: "2026-05-19T07:10:00Z" },
  { id: 26, title: "No garbage collection vehicle for 5 days in Sukhlia", category: "Garbage", sentiment: -0.6, urgency: "High", status: "Pending", location: "Zone 5, Vijay Nagar", department_code: "GARBAGE", age_days: 5, negligence_flag: false, escalation_level: 0, created_at: "2026-05-17T09:40:00Z" },
  { id: 40, title: "Siphoning of road construction materials by contractor", category: "Corruption", sentiment: -0.8, urgency: "High", status: "In Progress", location: "Zone 9, Vijay Nagar", department_code: "CORRUPTION", age_days: 8, negligence_flag: false, escalation_level: 0, created_at: "2026-05-14T16:15:00Z" },
];

export default function GovernanceDashboard() {
  // Operational states
  const [complaints, setComplaints] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total_complaints: 50,
    pending_complaints: 28,
    resolved_complaints: 22,
    high_risk_complaints: 8,
    escalated_complaints: 12,
    negligence_alerts: 5
  });
  
  const [loading, setLoading] = useState(true);
  const [escalationLoading, setEscalationLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [negligenceFilter, setNegligenceFilter] = useState(false);

  // AI-generated active briefs scrolling list
  const aiBriefs = [
    "⚠️ CRITICAL PEAK: Water infrastructure issues in Scheme 54 Sector A spiked by 32% over 72 hours. Crossing lines suspected.",
    "🚨 ADMIN NEGLECT: Roads department SLA delay ratios reached 28.5% this week. Unfinished gravel works in Vijay Nagar identified.",
    "⚠️ CLUSTER DETECTED: 4 consecutive public safety issues logged near LIG park during evening hours. Escalated to patrol squads.",
    "🚨 ESCALATION: Case #9 promoted to Level 3 oversight as Municipal Water Department failed to acknowledge valve leaks in 18 days."
  ];

  // Fetch from backend
  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch("http://localhost:8000/api/dashboard/stats");
      const complaintsRes = await fetch("http://localhost:8000/api/complaints");
      
      if (statsRes.ok && complaintsRes.ok) {
        const statsData = await statsRes.json();
        const complaintsData = await complaintsRes.json();
        setStats(statsData);
        setComplaints(complaintsData);
      } else {
        throw new Error("HTTP Fetch Error");
      }
    } catch (err) {
      console.log("Using dynamic mock data engine fallback...");
      setComplaints(INITIAL_MOCK_COMPLAINTS);
      setStats({
        total_complaints: 52,
        pending_complaints: 32,
        resolved_complaints: 20,
        high_risk_complaints: 14,
        escalated_complaints: 12,
        negligence_alerts: 6
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Run Smart Escalation Audit API
  const handleEscalationAudit = async () => {
    setEscalationLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/escalate/audit", {
        method: "POST"
      });
      
      if (res.ok) {
        const data = await res.json();
        alert(`Audit Complete! ${data.escalated_records} delayed grievances automatically escalated by AI.`);
        fetchData();
      } else {
        throw new Error("Escalation failed");
      }
    } catch (err) {
      console.log("Failing back to mock audit execution.");
      // Simulate local audit updates: promote Pending tickets aged > 5 days to Escalated and trigger negligence!
      const updatedComplaints = complaints.map(c => {
        if ((c.status === "Pending" || c.status === "In Progress") && c.age_days > 4) {
          return {
            ...c,
            status: "Escalated",
            escalation_level: 1,
            negligence_flag: true
          };
        }
        return c;
      });
      
      setComplaints(updatedComplaints);
      setStats((prev: any) => ({
        ...prev,
        pending_complaints: Math.max(0, prev.pending_complaints - 2),
        escalated_complaints: prev.escalated_complaints + 2,
        negligence_alerts: prev.negligence_alerts + 2
      }));
      
      alert("Audit Simulation Complete! 2 neglected complaints automatically escalated by AI. Negligence logs registered.");
    } finally {
      setEscalationLoading(false);
    }
  };

  // Filter complaints based on Search, Status, and Negligence tags
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchesNegligence = !negligenceFilter || c.negligence_flag === true;
    
    return matchesSearch && matchesStatus && matchesNegligence;
  });

  return (
    <div className="flex-1 p-8 relative flex flex-col justify-between font-mono">
      <div className="absolute inset-0 cyber-grid-fine opacity-10 pointer-events-none" />

      {/* Control Room Header */}
      <div className="relative z-10 border-b border-slate-900 pb-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-wider text-slate-100 uppercase">
            Governance Control Desk
          </h2>
          <p className="text-slate-500 text-[11px] uppercase tracking-widest mt-1">
            Cognitive Audit, SLA Trackers & Spatial Routing
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="py-2.5 px-4 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition text-[11px] uppercase flex items-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Core</span>
          </button>
          
          <button
            onClick={handleEscalationAudit}
            disabled={escalationLoading}
            className="py-2.5 px-4 rounded-lg bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border border-neon-purple/50 hover:from-neon-purple hover:to-neon-pink hover:text-slate-950 text-neon-purple hover:shadow-[0_0_15px_rgba(139,92,246,0.35)] transition text-[11px] uppercase flex items-center space-x-1.5 cursor-pointer"
          >
            <Zap className={`w-3.5 h-3.5 ${escalationLoading ? "animate-spin" : ""}`} />
            <span>{escalationLoading ? "Auditing SLA..." : "Execute AI Escalation Scan"}</span>
          </button>
        </div>
      </div>

      {/* Scoreboard counters */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <GlowingCard variant="default">
          <div className="text-[10px] text-slate-500 uppercase">Active Nodes</div>
          <div className="text-2xl font-black text-white mt-1.5 tracking-tight">{stats.total_complaints}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">TOTAL REGISTERED</div>
        </GlowingCard>

        <GlowingCard variant="cyan">
          <div className="text-[10px] text-slate-500 uppercase">Backlog Pool</div>
          <div className="text-2xl font-black text-neon-cyan mt-1.5 tracking-tight">{stats.pending_complaints}</div>
          <div className="text-[9px] text-neon-cyan/70 mt-0.5">UNRESOLVED FILES</div>
        </GlowingCard>

        <GlowingCard variant="green">
          <div className="text-[10px] text-slate-500 uppercase">Remedial Complete</div>
          <div className="text-2xl font-black text-neon-green mt-1.5 tracking-tight">{stats.resolved_complaints}</div>
          <div className="text-[9px] text-neon-green/70 mt-0.5">SLA COMPLIANT</div>
        </GlowingCard>

        <GlowingCard variant="purple">
          <div className="text-[10px] text-slate-500 uppercase">Escalations</div>
          <div className="text-2xl font-black text-neon-purple mt-1.5 tracking-tight">{stats.escalated_complaints}</div>
          <div className="text-[9px] text-neon-purple/70 mt-0.5">LEVEL 1-3 MONITOR</div>
        </GlowingCard>

        <GlowingCard variant="red">
          <div className="text-[10px] text-slate-500 uppercase">Negligence Flags</div>
          <div className="text-2xl font-black text-neon-red mt-1.5 tracking-tight">{stats.negligence_alerts}</div>
          <div className="text-[9px] text-neon-red/70 mt-0.5">ADMIN SLA EXCEEDED</div>
        </GlowingCard>

        <GlowingCard variant="default">
          <div className="text-[10px] text-slate-500 uppercase">Efficiency Index</div>
          <div className="text-2xl font-black text-white mt-1.5 tracking-tight">84.2%</div>
          <div className="text-[9px] text-neon-teal mt-0.5">SYSTEM LEVEL avg</div>
        </GlowingCard>
      </div>

      {/* Grid: Triage Bulletins & Complaint Ledger */}
      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Complaint Ledger Ledger */}
        <div className="xl:col-span-8 space-y-6">
          <GlowingCard variant="default">
            {/* Table Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter ledger by title, location or category..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-neon-cyan/50 font-sans"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-[10px] text-slate-300 focus:outline-none"
                >
                  <option value="ALL">ALL STATUS</option>
                  <option value="Pending">PENDING</option>
                  <option value="In Progress">IN PROGRESS</option>
                  <option value="Escalated">ESCALATED</option>
                  <option value="Resolved">RESOLVED</option>
                </select>

                <button
                  onClick={() => setNegligenceFilter(!negligenceFilter)}
                  className={`py-2 px-3 rounded-lg border text-[10px] uppercase font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                    negligenceFilter
                      ? "bg-neon-red/10 border-neon-red text-neon-red"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FileWarning className="w-3.5 h-3.5" />
                  <span>Negligence Only</span>
                </button>
              </div>
            </div>

            {/* Complaints Table Ledger */}
            {loading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-neon-cyan mb-3" />
                <p className="text-xs uppercase">Polling node clusters...</p>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="py-20 text-center text-slate-600 text-xs uppercase">
                No tickets matching query criteria found in database ledger.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-slate-500 uppercase pb-3">
                      <th className="pb-3 font-semibold">Grievance Ticket</th>
                      <th className="pb-3 font-semibold">Triage Target</th>
                      <th className="pb-3 font-semibold">Priority</th>
                      <th className="pb-3 font-semibold">Time Active</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Oversight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.map((c) => (
                      <tr 
                        key={c.id} 
                        className="border-b border-slate-800/40 hover:bg-slate-900/20 transition-colors duration-200"
                      >
                        <td className="py-4 pr-3 max-w-[240px]">
                          <div className="font-bold text-slate-200 font-sans truncate">{c.title}</div>
                          <div className="text-[9px] text-slate-500 mt-1 flex items-center uppercase">
                            <span className="text-neon-cyan mr-1.5 font-bold">#{c.id}</span>
                            <span>{c.location}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-850 text-slate-300 font-bold uppercase">
                            {c.department_code || c.category.toUpperCase().slice(0, 5)}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            c.urgency === "Critical"
                              ? "bg-neon-red/10 border border-neon-red/20 text-neon-red"
                              : c.urgency === "High"
                              ? "bg-neon-orange/10 border border-neon-orange/20 text-neon-orange"
                              : "bg-slate-900 border border-slate-800 text-slate-400"
                          }`}>
                            {c.urgency}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={c.negligence_flag ? "text-neon-red font-bold" : "text-slate-400"}>
                            {c.age_days} Days
                          </span>
                          {c.negligence_flag && (
                            <span className="ml-1 text-neon-red font-black" title="SLA Breached! Negligence Flag active.">⚠️</span>
                          )}
                        </td>
                        <td className="py-4">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                            c.status === "Resolved"
                              ? "bg-neon-green/10 border border-neon-green/20 text-neon-green"
                              : c.status === "Escalated"
                              ? "bg-neon-purple/10 border border-neon-purple/20 text-neon-purple"
                              : c.status === "In Progress"
                              ? "bg-neon-blue/10 border border-neon-blue/20 text-neon-blue"
                              : "bg-slate-950 border border-slate-850 text-slate-500"
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <Link href={`/complaints/${c.id}`}>
                            <button className="p-1.5 rounded border border-slate-800 bg-slate-950/80 hover:border-neon-cyan/50 text-slate-400 hover:text-neon-cyan transition cursor-pointer">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlowingCard>
        </div>

        {/* Right Column: AI Triage Bulletins */}
        <div className="xl:col-span-4 space-y-6">
          <GlowingCard variant="purple" active={true}>
            <div className="flex items-center space-x-2 text-slate-200 text-xs uppercase font-bold border-b border-slate-850 pb-3 mb-4">
              <AlertTriangle className="w-4 h-4 text-neon-purple animate-pulse" />
              <span>AI Negligence & Briefs</span>
            </div>
            
            <div className="space-y-4">
              {aiBriefs.map((brief, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-950/60 border border-slate-850 p-3 rounded-lg text-[10px] leading-relaxed text-slate-400 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-[2px] h-full bg-neon-purple" />
                  <p>{brief}</p>
                </div>
              ))}
            </div>
          </GlowingCard>

          <GlowingCard variant="default">
            <div className="flex items-center space-x-2 text-slate-200 text-xs uppercase font-bold border-b border-slate-850 pb-3 mb-4">
              <Building2 className="w-4 h-4 text-neon-cyan" />
              <span>Division Telemetry</span>
            </div>
            <div className="space-y-3 font-mono text-[10px] text-slate-400">
              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-850 flex justify-between items-center">
                <span>ROADS PERFORMANCE</span>
                <span className="text-neon-teal font-bold">79.2%</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-850 flex justify-between items-center">
                <span>WATER PERFORMANCE</span>
                <span className="text-neon-purple font-bold">68.4%</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-850 flex justify-between items-center">
                <span>POWER PERFORMANCE</span>
                <span className="text-neon-green font-bold">91.5%</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-850 flex justify-between items-center">
                <span>GARBAGE PERFORMANCE</span>
                <span className="text-neon-orange font-bold">74.0%</span>
              </div>
            </div>
          </GlowingCard>
        </div>
      </div>
    </div>
  );
}
