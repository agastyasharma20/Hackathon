"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  BarChart3,
  Map,
  Building2,
  FileSpreadsheet,
  AlertTriangle,
  MessageSquareCode,
  Compass,
  Activity,
  Cpu
} from "lucide-react";

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navigationItems: SidebarItem[] = [
    { name: "Terminal Welcome", path: "/", icon: Compass },
    { name: "Citizen AI Portal", path: "/portal", icon: MessageSquareCode, badge: "Live" },
    { name: "Governance Control", path: "/dashboard", icon: LayoutDashboard },
    { name: "Smart Escalations", path: "/escalations", icon: ShieldAlert, badge: "12", badgeColor: "bg-red-500/20 text-red-400 border border-red-500/30" },
    { name: "Complaint Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Geospatial Heatmap", path: "/heatmap", icon: Map },
    { name: "Department Control", path: "/departments", icon: Building2 },
    { name: "Systemic Risk Desk", path: "/risk", icon: AlertTriangle, badge: "3 Alert", badgeColor: "bg-amber-500/20 text-amber-400 border border-amber-500/30" },
    { name: "AI AI-Gov Chatbot", path: "/chatbot", icon: Cpu },
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-72 bg-cyber-dark border-r border-slate-800/80 flex flex-col z-40 select-none shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      {/* Background cyber grid effect */}
      <div className="absolute inset-0 cyber-grid-fine opacity-20 pointer-events-none" />
      
      {/* Brand Header */}
      <div className="relative p-6 border-b border-slate-800/80 flex items-center space-x-3 overflow-hidden bg-slate-950/40">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent animate-pulse" />
        <div className="p-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
          <Activity className="w-6 h-6 text-neon-cyan animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-wider text-slate-100 uppercase font-mono">
            BharatSync <span className="text-neon-cyan glow-text-cyan">AI</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
            Gov-Intelligence OS v4.8
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 relative scrollbar-thin">
        {navigationItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-lg font-mono text-sm tracking-wide transition-all duration-300 relative group overflow-hidden ${
                isActive
                  ? "bg-slate-900/60 border border-neon-cyan/50 text-neon-cyan shadow-[inset_0_0_12px_rgba(6,182,212,0.08)]"
                  : "text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-900/30 hover:border-slate-800/50"
              }`}
            >
              {/* Active glow pointer */}
              {isActive && (
                <div className="absolute left-0 top-0 w-[3px] h-full bg-neon-cyan shadow-[0_0_10px_#06b6d4]" />
              )}
              
              <div className="flex items-center space-x-3.5 z-10">
                <Icon className={`w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? "text-neon-cyan" : "text-slate-500 group-hover:text-neon-cyan"
                }`} />
                <span className="font-medium">{item.name}</span>
              </div>

              {item.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider font-mono z-10 ${
                  item.badgeColor || "bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30"
                }`}>
                  {item.badge}
                </span>
              )}
              
              {/* Futuristic scanning hover overlay */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-slate-800/10 to-transparent transition-transform duration-1000 ease-out" />
            </Link>
          );
        })}
      </nav>

      {/* Control Room Telemetry dial at footer of sidebar */}
      <div className="relative p-5 border-t border-slate-800/80 bg-slate-950/40 font-mono text-[11px] text-slate-400 space-y-3 z-10">
        <div className="absolute inset-0 cyber-grid-fine opacity-10 pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <span className="text-slate-500">SLA COMPLIANCE</span>
          <span className="text-neon-teal font-semibold">84.6%</span>
        </div>
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
          <div className="bg-gradient-to-r from-neon-blue to-neon-teal h-full w-[84.6%] shadow-[0_0_8px_#14b8a6]" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
          <div className="bg-slate-900/50 p-2 rounded border border-slate-800/50">
            <div className="text-slate-500 text-[9px] uppercase">Active Nodes</div>
            <div className="text-slate-200 font-bold mt-0.5 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green mr-1.5 animate-ping" />
              18 Zones
            </div>
          </div>
          <div className="bg-slate-900/50 p-2 rounded border border-slate-800/50">
            <div className="text-slate-500 text-[9px] uppercase">AI Confidence</div>
            <div className="text-neon-cyan font-bold mt-0.5">94.2% avg</div>
          </div>
        </div>

        <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1 border-t border-slate-800/30">
          <span>DM CONSOLE DISPATCH</span>
          <span className="text-neon-cyan animate-pulse">● READY</span>
        </div>
      </div>
    </aside>
  );
};
