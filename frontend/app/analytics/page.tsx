"use client";

import React, { useState, useEffect } from "react";
import { GlowingCard } from "@/components/glowing-card";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  Building2, 
  Clock,
  RefreshCw,
  Loader2
} from "lucide-react";

// Mock Fallback Analytics Data Engine
const MOCK_ANALYTICS_DATA = {
  trends: [
    { month: "Jan", filed: 45, resolved: 38, escalated: 4 },
    { month: "Feb", filed: 58, resolved: 42, escalated: 9 },
    { month: "Mar", filed: 72, resolved: 55, escalated: 11 },
    { month: "Apr", filed: 64, resolved: 50, escalated: 8 },
    { month: "May", filed: 89, resolved: 68, escalated: 15 },
    { month: "Jun", filed: 110, resolved: 82, escalated: 24 }
  ],
  category_distribution: [
    { category: "Roads", count: 12 },
    { category: "Water", count: 15 },
    { category: "Electricity", count: 9 },
    { category: "Garbage", count: 8 },
    { category: "Public Safety", count: 5 },
    { category: "Corruption", count: 4 }
  ],
  department_performance: [
    { name: "Road Maintenance Div", code: "ROADS", performance: 79.2, risk: 28.5, budget: 64.8 },
    { name: "Municipal Water Dept", code: "WATER", performance: 68.4, risk: 42.1, budget: 78.5 },
    { name: "Power Grid Board", code: "POWER", performance: 91.5, risk: 12.8, budget: 53.2 },
    { name: "Waste Management Auth", code: "GARBAGE", performance: 74.0, risk: 35.0, budget: 48.9 },
    { name: "Public Safety Command", code: "SAFETY", performance: 86.4, risk: 18.2, budget: 37.5 },
    { name: "Anti-Corruption Bureau", code: "CORRUPTION", performance: 94.8, risk: 5.4, budget: 22.1 }
  ]
};

const COLORS = ["#00d2ff", "#06b6d4", "#14b8a6", "#8b5cf6", "#f59e0b", "#ef4444"];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(MOCK_ANALYTICS_DATA);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/dashboard/analytics");
      if (res.ok) {
        const payload = await res.json();
        setData(payload);
      } else {
        throw new Error("API rejection");
      }
    } catch (err) {
      console.log("Using local mock analytical data...");
      setData(MOCK_ANALYTICS_DATA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="flex-1 p-8 relative flex flex-col justify-between font-mono">
      <div className="absolute inset-0 cyber-grid-fine opacity-10 pointer-events-none" />

      {/* Control Room Header */}
      <div className="relative z-10 border-b border-slate-900 pb-6 mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-wider text-slate-100 uppercase">
            Complaint Analytics
          </h2>
          <p className="text-slate-500 text-[11px] uppercase tracking-widest mt-1">
            System performance trends, category distributions, and SLA metrics
          </p>
        </div>
        
        <button
          onClick={fetchAnalytics}
          className="py-2.5 px-4 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition text-[11px] uppercase flex items-center space-x-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {loading ? (
        <div className="flex-1 py-40 text-center flex flex-col items-center justify-center text-slate-500 relative z-10">
          <Loader2 className="w-10 h-10 animate-spin text-neon-cyan mb-4" />
          <p className="text-xs uppercase">Compiling System Metrics & Predictions...</p>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Chart 1: Monthly operational trends */}
          <div className="lg:col-span-8">
            <GlowingCard variant="cyan">
              <div className="flex items-center space-x-2 text-slate-200 text-xs uppercase font-bold border-b border-slate-800 pb-3 mb-6">
                <TrendingUp className="w-4 h-4 text-neon-cyan" />
                <span>Cognitive Flow Trends (6-Month Scale)</span>
              </div>
              
              <div className="h-80 w-full font-sans text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.trends} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <XAxis dataKey="month" stroke="#475569" strokeWidth={1} tickLine={false} />
                    <YAxis stroke="#475569" strokeWidth={1} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.95)", border: "1px solid #06b6d4", color: "#f8fafc", fontFamily: "monospace" }} 
                      itemStyle={{ color: "#22d3ee" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                    <Line type="monotone" dataKey="filed" stroke="#00d2ff" strokeWidth={2.5} name="Total Filed" dot={{ r: 4 }} activeDot={{ r: 7 }} />
                    <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="SLA Resolved" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="escalated" stroke="#8b5cf6" strokeWidth={2} name="Escalated Alerts" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlowingCard>
          </div>

          {/* Chart 2: Category Pie Distribution */}
          <div className="lg:col-span-4">
            <GlowingCard variant="default">
              <div className="flex items-center space-x-2 text-slate-200 text-xs uppercase font-bold border-b border-slate-800 pb-3 mb-6">
                <PieIcon className="w-4 h-4 text-neon-cyan animate-pulse" />
                <span>Grievance Category Distribution</span>
              </div>
              
              <div className="h-80 w-full font-sans text-xs flex flex-col justify-center">
                <ResponsiveContainer width="100%" height="75%">
                  <PieChart>
                    <Pie
                      data={data.category_distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="category"
                    >
                      {data.category_distribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.95)", border: "1px solid #06b6d4", color: "#f8fafc", fontFamily: "monospace" }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Pie legend grid */}
                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono mt-4 max-h-[80px] overflow-y-auto pr-1">
                  {data.category_distribution.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-slate-400 truncate uppercase">{entry.category}: {entry.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlowingCard>
          </div>

          {/* Chart 3: Department Performance ratings */}
          <div className="lg:col-span-12">
            <GlowingCard variant="default">
              <div className="flex items-center space-x-2 text-slate-200 text-xs uppercase font-bold border-b border-slate-800 pb-3 mb-6">
                <Building2 className="w-4 h-4 text-neon-cyan" />
                <span>Department SLA Performance Indexes (%)</span>
              </div>

              <div className="h-80 w-full font-sans text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.department_performance} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <XAxis dataKey="code" stroke="#475569" strokeWidth={1} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#475569" strokeWidth={1} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.95)", border: "1px solid #06b6d4", color: "#f8fafc", fontFamily: "monospace" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                    <Bar dataKey="performance" fill="#14b8a6" radius={[4, 4, 0, 0]} name="SLA Compliance Score (%)" />
                    <Bar dataKey="risk" fill="#ef4444" radius={[4, 4, 0, 0]} name="Administrative Risk (%)" />
                    <Bar dataKey="budget" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Budget Spent Ratio (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlowingCard>
          </div>
        </div>
      )}
    </div>
  );
}
