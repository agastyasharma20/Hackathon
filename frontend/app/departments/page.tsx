"use client";

import React, { useState, useEffect } from "react";
import { GlowingCard } from "@/components/glowing-card";
import { 
  Building2, 
  User, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  ShieldAlert,
  Loader2,
  RefreshCw
} from "lucide-react";

const MOCK_DEPARTMENTS = [
  { id: 1, name: "Road Maintenance Division", code: "ROADS", lead: "Shri Rajesh Kumar", sla_days: 7, risk_index: 28.5, performance_score: 79.2, budget_utilization: 64.8 },
  { id: 2, name: "Municipal Water Department", code: "WATER", lead: "Smt. Sunita Sharma", sla_days: 5, risk_index: 42.1, performance_score: 68.4, budget_utilization: 78.5 },
  { id: 3, name: "Power Grid Board", code: "POWER", lead: "Shri Anil Gupta", sla_days: 3, risk_index: 12.8, performance_score: 91.5, budget_utilization: 53.2 },
  { id: 4, name: "Waste Management Authority", code: "GARBAGE", lead: "Shri Vinay Patel", sla_days: 4, risk_index: 35.0, performance_score: 74.0, budget_utilization: 48.9 },
  { id: 5, name: "Public Safety Command", code: "SAFETY", lead: "Smt. Priyanka Rao", sla_days: 6, risk_index: 18.2, performance_score: 86.4, budget_utilization: 37.5 },
  { id: 6, name: "Anti-Corruption Vigilance Bureau", code: "CORRUPTION", lead: "Shri Devendra Prasad", sla_days: 10, risk_index: 5.4, performance_score: 94.8, budget_utilization: 22.1 }
];

export default function DepartmentsDashboard() {
  const [departments, setDepartments] = useState<any[]>(MOCK_DEPARTMENTS);
  const [loading, setLoading] = useState(true);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/departments");
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
      } else {
        throw new Error("API rejection");
      }
    } catch (err) {
      console.log("Using local mock departments dataset...");
      setDepartments(MOCK_DEPARTMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <div className="flex-1 p-8 relative flex flex-col justify-between font-mono">
      <div className="absolute inset-0 cyber-grid-fine opacity-10 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 border-b border-slate-900 pb-6 mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-wider text-slate-100 uppercase">
            Department Control
          </h2>
          <p className="text-slate-500 text-[11px] uppercase tracking-widest mt-1">
            Division Performance indices, SLA targets & active budgets
          </p>
        </div>
        
        <button
          onClick={fetchDepartments}
          className="py-2.5 px-4 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition text-[11px] uppercase flex items-center space-x-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Divisions</span>
        </button>
      </div>

      {loading ? (
        <div className="flex-1 py-40 text-center flex flex-col items-center justify-center text-slate-500 relative z-10">
          <Loader2 className="w-10 h-10 animate-spin text-neon-cyan mb-4" />
          <p className="text-xs uppercase">Compiling Division SLA Metrics...</p>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const performanceColor = dept.performance_score >= 85 
              ? "text-neon-green" 
              : dept.performance_score >= 75 
              ? "text-neon-cyan" 
              : "text-neon-orange";

            const riskColor = dept.risk_index >= 35 
              ? "text-neon-red font-bold" 
              : dept.risk_index >= 15 
              ? "text-neon-purple font-semibold" 
              : "text-slate-400";
              
            return (
              <GlowingCard 
                key={dept.id} 
                variant={dept.risk_index >= 35 ? "red" : dept.performance_score >= 85 ? "green" : "cyan"}
              >
                {/* Header */}
                <div className="border-b border-slate-800 pb-3.5 mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4.5 h-4.5 text-neon-cyan" />
                    <span className="font-bold text-xs uppercase text-slate-200 font-sans tracking-wide truncate max-w-[180px]">
                      {dept.name}
                    </span>
                  </div>
                  <span className="text-[9px] bg-slate-950 px-2 py-0.5 rounded text-slate-400 border border-slate-850">
                    {dept.code}
                  </span>
                </div>

                {/* Details list */}
                <div className="space-y-4 font-mono text-[10px] text-slate-400">
                  {/* Lead director */}
                  <div className="flex justify-between items-center bg-slate-950/60 p-2 rounded border border-slate-850">
                    <span className="text-slate-500 uppercase flex items-center"><User className="w-3.5 h-3.5 mr-1" /> Lead Director</span>
                    <span className="text-slate-200 font-semibold">{dept.lead}</span>
                  </div>

                  {/* SLA Target */}
                  <div className="flex justify-between items-center bg-slate-950/60 p-2 rounded border border-slate-850">
                    <span className="text-slate-500 uppercase flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> SLA Deadline</span>
                    <span className="text-slate-200 font-semibold">{dept.sla_days} Days</span>
                  </div>

                  {/* Performance Dial progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 uppercase flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-1" /> SLA Compliance</span>
                      <span className={`${performanceColor} font-bold`}>{dept.performance_score}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full border border-slate-850 overflow-hidden p-[1px]">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          dept.performance_score >= 85 ? "bg-neon-green" : dept.performance_score >= 75 ? "bg-neon-cyan" : "bg-neon-orange"
                        }`}
                        style={{ width: `${dept.performance_score}%` }}
                      />
                    </div>
                  </div>

                  {/* Risk & Budget Spent row split */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-950/60 p-2.5 rounded border border-slate-850 text-center">
                      <div className="text-slate-500 uppercase text-[9px] flex items-center justify-center"><AlertTriangle className="w-3 h-3 mr-1" /> Risk index</div>
                      <div className={`text-sm font-black mt-1 ${riskColor}`}>{dept.risk_index}%</div>
                    </div>
                    
                    <div className="bg-slate-950/60 p-2.5 rounded border border-slate-850 text-center">
                      <div className="text-slate-500 uppercase text-[9px] flex items-center justify-center"><ShieldAlert className="w-3 h-3 mr-1" /> Budget spent</div>
                      <div className="text-sm font-black text-slate-200 mt-1">{dept.budget_utilization}%</div>
                    </div>
                  </div>
                </div>
              </GlowingCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
