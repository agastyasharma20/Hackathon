"use client";

import React, { useState, useEffect } from "react";
import { GlowingCard } from "@/components/glowing-card";
import { 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  Building2, 
  Activity, 
  FileWarning,
  CheckCircle,
  Lightbulb,
  Loader2,
  RefreshCw
} from "lucide-react";

const MOCK_RISK_WARNINGS = [
  { id: 1, title: "Wastewater contamination bottleneck in Zone 8 (Scheme 78)", description: "4 consecutive drinking water contamination complaints logged within 72 hours. Zero administrative response registered from Municipal Water Department. SLA exceeded by 4 days.", level: "Critical", department: "WATER" },
  { id: 2, title: "Road division backlog overload in Zone 4 (Scheme 54)", description: "12 active pothole grievances remain unresolved. Average road team response lag has reached 18.2 days (SLA threshold is 7 days). Structural contractor negligence suspected.", level: "High", department: "ROADS" },
  { id: 3, title: "Systemic lighting blackout zone in Scheme 78", description: "Entire 1.5 km street lighting grid remains dark for 22 consecutive days. Associated with 3 nighttime mugging/theft filings. High-risk safety hazard.", level: "Critical", department: "SAFETY" },
  { id: 4, title: "Corruption cluster at Zone 4 municipal office", description: "3 distinct filings flagged clerk extortion during property tax correction. Repeated administrative bottlenecks identified.", level: "High", department: "CORRUPTION" }
];

export default function RiskMonitoringPage() {
  const [warnings, setWarnings] = useState<any[]>(MOCK_RISK_WARNINGS);
  const [loading, setLoading] = useState(true);

  const fetchRiskData = async () => {
    setLoading(true);
    try {
      // Simulate fetch, falls back gracefully
      const res = await fetch("http://localhost:8000/api/complaints?negligence=true");
      if (res.ok) {
        const data = await res.json();
        // Map to structured risk format
        const mapped = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: `Grievance in status '${item.status}' has been active for ${item.age_days} days. AI classified urgency as ${item.urgency} and flagged administrative delay.`,
          level: item.urgency === "Critical" ? "Critical" : "High",
          department: item.department_code || item.category.toUpperCase().slice(0, 5)
        }));
        setWarnings(mapped.length > 0 ? mapped : MOCK_RISK_WARNINGS);
      } else {
        throw new Error("HTTP error");
      }
    } catch (err) {
      console.log("Using local mock risk bulletins...");
      setWarnings(MOCK_RISK_WARNINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, []);

  return (
    <div className="flex-1 p-8 relative flex flex-col justify-between font-mono">
      <div className="absolute inset-0 cyber-grid-fine opacity-10 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 border-b border-slate-900 pb-6 mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-wider text-slate-100 uppercase">
            Systemic Risk Monitoring
          </h2>
          <p className="text-slate-500 text-[11px] uppercase tracking-widest mt-1">
            Top-level Administrative delay logs, negligence indices & AI audits
          </p>
        </div>
        
        <button
          onClick={fetchRiskData}
          className="py-2.5 px-4 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition text-[11px] uppercase flex items-center space-x-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Risk Matrices</span>
        </button>
      </div>

      {loading ? (
        <div className="flex-1 py-40 text-center flex flex-col items-center justify-center text-slate-500 relative z-10">
          <Loader2 className="w-10 h-10 animate-spin text-neon-cyan mb-4" />
          <p className="text-xs uppercase">Auditing Municipal Ledgers for Neglect...</p>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Scorecards & AI Recommendations */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* Health indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <GlowingCard variant="red" active={true}>
                <div className="text-[10px] text-slate-500 uppercase">City Threat Index</div>
                <div className="text-3xl font-black text-neon-red mt-1.5 tracking-tight">24.5%</div>
                <div className="text-[9px] text-neon-red/70 mt-0.5">MODERATE THREAT LEVEL</div>
              </GlowingCard>

              <GlowingCard variant="purple">
                <div className="text-[10px] text-slate-500 uppercase">Active Neglect Spots</div>
                <div className="text-3xl font-black text-neon-purple mt-1.5 tracking-tight">{warnings.length}</div>
                <div className="text-[9px] text-neon-purple/70 mt-0.5">SLA EXCEEDANCE DETECTED</div>
              </GlowingCard>

              <GlowingCard variant="default">
                <div className="text-[10px] text-slate-500 uppercase">Avg SLA Gap</div>
                <div className="text-3xl font-black text-slate-100 mt-1.5 tracking-tight">+4.8 Days</div>
                <div className="text-[9px] text-slate-500 mt-0.5">DAYS OVER TARGET DEADLINE</div>
              </GlowingCard>
            </div>

            {/* Risk alerts bulletins list */}
            <GlowingCard variant="default">
              <div className="flex items-center space-x-2 text-slate-200 text-xs uppercase font-bold border-b border-slate-800 pb-3 mb-6">
                <ShieldAlert className="w-4 h-4 text-neon-red animate-pulse" />
                <span>AI Negligence Warnings & Alerts</span>
              </div>

              <div className="space-y-4">
                {warnings.map((warn) => (
                  <div 
                    key={warn.id}
                    className="p-4 rounded-xl border border-slate-900 bg-slate-950/40 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs font-bold text-slate-200 font-sans">{warn.title}</div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        warn.level === "Critical"
                          ? "bg-neon-red/10 border border-neon-red/35 text-neon-red animate-pulse"
                          : "bg-neon-orange/10 border border-neon-orange/35 text-neon-orange"
                      }`}>
                        {warn.level}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans font-medium mb-3">
                      {warn.description}
                    </p>
                    <div className="flex items-center justify-between text-[9px] text-slate-500 uppercase border-t border-slate-900/60 pt-2">
                      <span>AFFECTED DIVISION: <b className="text-neon-cyan">{warn.department}</b></span>
                      <span className="text-neon-purple font-semibold">● ACTIVE ALARM TRIGGERED</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlowingCard>
          </div>

          {/* Right: Policy recommendations */}
          <div className="xl:col-span-4">
            <GlowingCard variant="purple" active={true} className="h-full flex flex-col">
              <div className="flex items-center space-x-2 text-slate-200 text-xs uppercase font-bold border-b border-slate-850 pb-3 mb-4">
                <Lightbulb className="w-4 h-4 text-neon-purple animate-pulse" />
                <span>AI Policy Recommendations</span>
              </div>

              <div className="space-y-4 text-[10px] text-slate-400 leading-relaxed">
                <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-[2px] h-full bg-neon-purple" />
                  <div className="font-bold text-slate-300 uppercase mb-1">Reallocate Water Budgets</div>
                  <p>Systemic contaminant breaches in Zone 8 suggest piping leaks. Propose moving 12% of Road repair capital to Water filtration works in Zone 8.</p>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-[2px] h-full bg-neon-purple" />
                  <div className="font-bold text-slate-300 uppercase mb-1">SLA Deadline Adjustments</div>
                  <p>Road maintenance division SLA compliance (79.2%) is slipping due to structural delays. Propose shifting default SLA bounds from 7 days to 9 days to align with labor supply capacity.</p>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-[2px] h-full bg-neon-purple" />
                  <div className="font-bold text-slate-300 uppercase mb-1">Deploy Security Patrols</div>
                  <p>Repeated public safety blackout reports on Scheme 78 main stretch are associated with street crimes. Trigger temporary security squads to Zone 8 park.</p>
                </div>
              </div>
            </GlowingCard>
          </div>

        </div>
      )}
    </div>
  );
}
