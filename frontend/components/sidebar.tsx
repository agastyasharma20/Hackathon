"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  BarChart3,
  Map,
  Building2,
  AlertTriangle,
  MessageSquareCode,
  Compass,
  Activity,
  Cpu,
  Zap,
} from "lucide-react";

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  badge?: string;
  badgeVariant?: "cyan" | "red" | "amber" | "green";
}

const navigationItems: SidebarItem[] = [
  { name: "Terminal Welcome", path: "/", icon: Compass },
  { name: "Citizen AI Portal", path: "/portal", icon: MessageSquareCode, badge: "LIVE", badgeVariant: "green" },
  { name: "Governance Control", path: "/dashboard", icon: LayoutDashboard },
  { name: "Smart Escalations", path: "/escalations", icon: ShieldAlert, badge: "12", badgeVariant: "red" },
  { name: "Complaint Analytics", path: "/analytics", icon: BarChart3 },
  { name: "Geospatial Heatmap", path: "/heatmap", icon: Map },
  { name: "Department Control", path: "/departments", icon: Building2 },
  { name: "Systemic Risk Desk", path: "/risk", icon: AlertTriangle, badge: "3", badgeVariant: "amber" },
  { name: "AI-Gov Chatbot", path: "/chatbot", icon: Cpu, badge: "AI", badgeVariant: "cyan" },
];

const badgeStyles: Record<string, string> = {
  cyan: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
  red: "bg-red-500/15 text-red-400 border border-red-500/30",
  amber: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  green: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
};

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "280px",
        height: "100vh",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#070a13",
        borderRight: "1px solid rgba(30,41,59,0.7)",
        boxShadow: "4px 0 30px rgba(0,0,0,0.6)",
        overflow: "hidden",
      }}
    >
      {/* Fine grid overlay */}
      <div className="absolute inset-0 cyber-grid-fine opacity-25 pointer-events-none" />

      {/* Top glow line */}
      <div
        className="absolute top-0 left-0 w-full h-[1px] pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, #06b6d4, transparent)" }}
      />

      {/* ─── Brand Header ─── */}
      <div
        style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid rgba(30,41,59,0.7)",
          background: "rgba(15,23,42,0.5)",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              padding: "8px",
              borderRadius: "10px",
              background: "rgba(6,182,212,0.1)",
              border: "1px solid rgba(6,182,212,0.3)",
              boxShadow: "0 0 15px rgba(6,182,212,0.15)",
            }}
          >
            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-widest text-slate-100 uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              BharatSync <span className="text-cyan-400 glow-text-cyan">AI</span>
            </h1>
            <p className="text-[9px] text-slate-500 tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Gov-Intelligence OS v4.8
            </p>
          </div>
        </div>

        {/* Live clock */}
        <div
          className="mt-3 px-3 py-1.5 rounded-lg flex items-center justify-between"
          style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.12)" }}
        >
          <span className="text-[9px] text-slate-500 uppercase tracking-wider" style={{ fontFamily: "monospace" }}>SYSTEM CLOCK</span>
          <span className="text-[10px] text-cyan-400 font-mono tabular-nums" suppressHydrationWarning>
            {time.toLocaleTimeString("en-IN", { hour12: false })}
          </span>
        </div>
      </div>

      {/* ─── Navigation ─── */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        <p className="text-[9px] text-slate-600 uppercase tracking-widest px-2 mb-2" style={{ fontFamily: "monospace" }}>
          Navigation Matrix
        </p>
        {navigationItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderRadius: "10px",
                border: isActive ? "1px solid rgba(6,182,212,0.4)" : "1px solid transparent",
                background: isActive ? "rgba(6,182,212,0.07)" : "transparent",
                color: isActive ? "#22d3ee" : "#94a3b8",
                textDecoration: "none",
                transition: "all 0.2s ease",
                position: "relative",
                overflow: "hidden",
              }}
              className="group hover:!bg-slate-900/50 hover:!border-slate-700/60 hover:!text-slate-200"
            >
              {/* Active left bar */}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "4px",
                    bottom: "4px",
                    width: "3px",
                    borderRadius: "0 2px 2px 0",
                    background: "#06b6d4",
                    boxShadow: "0 0 8px #06b6d4",
                  }}
                />
              )}
              <div className="flex items-center gap-3" style={{ paddingLeft: isActive ? "4px" : "0" }}>
                <Icon
                  style={{
                    width: "15px",
                    height: "15px",
                    flexShrink: 0,
                    color: isActive ? "#22d3ee" : "#64748b",
                    transition: "color 0.2s",
                  }}
                  className="group-hover:!text-cyan-400"
                />
                <span
                  className="text-[12px] font-medium tracking-wide"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {item.name}
                </span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md tracking-wider ${
                    badgeStyles[item.badgeVariant || "cyan"]
                  }`}
                  style={{ fontFamily: "monospace" }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ─── Footer Telemetry ─── */}
      <div
        style={{
          padding: "14px 16px",
          borderTop: "1px solid rgba(30,41,59,0.7)",
          background: "rgba(15,23,42,0.5)",
          flexShrink: 0,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] text-slate-500 uppercase tracking-wider" style={{ fontFamily: "monospace" }}>SLA Compliance</span>
          <span className="text-[10px] text-teal-400 font-bold" style={{ fontFamily: "monospace" }}>84.6%</span>
        </div>
        <div style={{ height: "3px", borderRadius: "2px", background: "#1e293b", overflow: "hidden", marginBottom: "12px" }}>
          <div
            style={{
              height: "100%",
              width: "84.6%",
              background: "linear-gradient(90deg, #00d2ff, #14b8a6)",
              boxShadow: "0 0 6px #14b8a6",
              borderRadius: "2px",
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div
            className="p-2 rounded-lg"
            style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(30,41,59,0.7)" }}
          >
            <div className="text-[8px] text-slate-500 uppercase mb-1" style={{ fontFamily: "monospace" }}>Active Zones</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span className="text-[11px] text-slate-200 font-bold">18</span>
            </div>
          </div>
          <div
            className="p-2 rounded-lg"
            style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(30,41,59,0.7)" }}
          >
            <div className="text-[8px] text-slate-500 uppercase mb-1" style={{ fontFamily: "monospace" }}>AI Confidence</div>
            <div className="text-[11px] text-cyan-400 font-bold" style={{ fontFamily: "monospace" }}>94.2%</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span className="text-[9px] text-slate-500 uppercase" style={{ fontFamily: "monospace" }}>DM Console</span>
          </div>
          <span className="text-[9px] text-emerald-400 flex items-center gap-1" style={{ fontFamily: "monospace" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            READY
          </span>
        </div>
      </div>
    </aside>
  );
};
