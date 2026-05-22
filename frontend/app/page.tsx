"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GlowingCard } from "@/components/glowing-card";
import { 
  ArrowRight, 
  Cpu, 
  ShieldAlert, 
  Map, 
  Layers, 
  TrendingUp, 
  Activity, 
  MessageSquareCode, 
  CheckCircle,
  Sparkles
} from "lucide-react";

interface WorkflowStep {
  title: string;
  desc: string;
  badge: string;
}

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState<number>(0);

  const workflowSteps: WorkflowStep[] = [
    {
      title: "Citizen Input",
      desc: "Citizen submits complaints in plain English or regional languages, with option for image or voice files.",
      badge: "Grievance Filed"
    },
    {
      title: "Cognitive Triage",
      desc: "AI NLP classifier performs real-time category mapping, sentiment grading, and recommended department routing.",
      badge: "AI Categorized"
    },
    {
      title: "Vector Similarity Index",
      desc: "Semantic AI engine checks similarity thresholds using FAISS vector spaces to group duplicate complaints.",
      badge: "Duplicate Scanned"
    },
    {
      title: "Smart Escalation",
      desc: "Escalation engine tracks SLA thresholds and citizen frustration metrics to alert District Commissioners.",
      badge: "Negligence Monitored"
    },
    {
      title: "Remedial Resolution",
      desc: "Department teams execute field tasks, upload digital audit evidence, and notify the citizen upon validation.",
      badge: "SLA Compliant"
    }
  ];

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden p-8">
      {/* Background grids */}
      <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-cyan/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-neon-purple/5 rounded-full filter blur-[100px] pointer-events-none" />

      {/* Hero Header */}
      <div className="relative z-10 max-w-4xl mx-auto text-center pt-16 pb-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-mono mb-6 uppercase tracking-wider animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>BharatSync AI Cognitive OS</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 uppercase font-mono">
          Transforming Public <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-teal glow-text-cyan">
            Governance Through AI
          </span>
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl font-sans max-w-2xl mx-auto mb-10 leading-relaxed">
          The next-generation enterprise cognitive operating system for smart public administration. 
          Bridging the gap between citizen expectations and government accountability in real-time.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link href="/portal" className="w-full">
            <button className="w-full py-4 px-6 rounded-xl font-mono text-sm uppercase tracking-wider font-semibold cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.3)] bg-gradient-to-r from-neon-blue to-neon-cyan text-slate-950 hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2">
              <span>Launch Citizen Portal</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </Link>
          <Link href="/dashboard" className="w-full">
            <button className="w-full py-4 px-6 rounded-xl font-mono text-sm uppercase tracking-wider font-semibold cursor-pointer border border-slate-700/80 bg-slate-900/60 hover:bg-slate-900 hover:border-neon-cyan/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:scale-105 transition-all duration-300 text-slate-100 flex items-center justify-center">
              <span>Admin Control Center</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Analytics scorecard preview */}
      <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        <GlowingCard variant="cyan">
          <div className="font-mono text-slate-500 text-xs uppercase">Seeded Cases</div>
          <div className="font-mono text-3xl font-extrabold text-white mt-2 tracking-tight">50+</div>
          <div className="font-mono text-[10px] text-neon-cyan mt-1">● SEEDED DATABASE</div>
        </GlowingCard>

        <GlowingCard variant="purple">
          <div className="font-mono text-slate-500 text-xs uppercase">Avg SLA Target</div>
          <div className="font-mono text-3xl font-extrabold text-white mt-2 tracking-tight">4.8d</div>
          <div className="font-mono text-[10px] text-neon-purple mt-1">▼ -18% DELAY REDUCTION</div>
        </GlowingCard>

        <GlowingCard variant="green">
          <div className="font-mono text-slate-500 text-xs uppercase">Auto Routing</div>
          <div className="font-mono text-3xl font-extrabold text-white mt-2 tracking-tight">98.4%</div>
          <div className="font-mono text-[10px] text-neon-green mt-1">▲ SLA ROUTING CONFIDENCE</div>
        </GlowingCard>

        <GlowingCard variant="red">
          <div className="font-mono text-slate-500 text-xs uppercase">Negligence Flags</div>
          <div className="font-mono text-3xl font-extrabold text-white mt-2 tracking-tight">12</div>
          <div className="font-mono text-[10px] text-neon-red mt-1">🚨 SMART ESCALATIONS ACTIVE</div>
        </GlowingCard>
      </div>

      {/* Interactive Workflow visualization */}
      <div className="relative z-10 max-w-5xl mx-auto w-full mb-16">
        <div className="text-center mb-8">
          <h2 className="font-mono font-bold text-xl uppercase tracking-wider text-slate-200">
            Cognitive Pipeline Visualization
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-mono">
            Click on pipeline nodes to inspect processing logic
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 relative mb-6">
          {workflowSteps.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-xl border font-mono cursor-pointer transition-all duration-300 relative text-left ${
                  isActive 
                    ? "bg-slate-900 border-neon-cyan/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : "bg-slate-950/40 border-slate-900 hover:border-slate-800 hover:bg-slate-900/40"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 font-bold ${
                  isActive ? "bg-neon-cyan text-slate-950" : "bg-slate-900 text-slate-400"
                }`}>
                  {idx + 1}
                </div>
                <div className={`text-xs font-semibold uppercase ${isActive ? "text-neon-cyan" : "text-slate-300"}`}>
                  {step.title}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                  {step.badge}
                </div>
                {idx < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 translate-x-1/2 w-4 h-[1px] bg-slate-800 z-20" />
                )}
              </div>
            );
          })}
        </div>

        {/* Selected step details */}
        <div className="p-6 rounded-xl border border-slate-800/80 bg-slate-900/20 backdrop-blur font-mono text-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[2px] h-full bg-neon-cyan" />
          <div className="text-xs text-neon-cyan uppercase tracking-wider font-semibold mb-1">
            Pipeline Node {activeStep + 1}: {workflowSteps[activeStep].title}
          </div>
          <p className="text-slate-400 leading-relaxed text-xs">
            {workflowSteps[activeStep].desc}
          </p>
        </div>
      </div>

      {/* Core Features Cards */}
      <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <GlowingCard variant="default">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="font-mono font-bold text-sm uppercase text-slate-100">
              AI NLP Categorization
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Realtime analysis of grievance text on typing. Instantly maps complaints into water infrastructure, safety alerts, power outages, and predicts sentiment indices.
          </p>
        </GlowingCard>

        <GlowingCard variant="default">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded bg-neon-purple/10 border border-neon-purple/30 text-neon-purple">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-mono font-bold text-sm uppercase text-slate-100">
              Smart Escalation Engine
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Systemic delay monitor that calculates escalation risk scores. Automatically routes cases upwards to District Commissioner levels on SLA neglect or repeated warnings.
          </p>
        </GlowingCard>

        <GlowingCard variant="default">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded bg-neon-teal/10 border border-neon-teal/30 text-neon-teal">
              <Map className="w-5 h-5" />
            </div>
            <h3 className="font-mono font-bold text-sm uppercase text-slate-100">
              Spatial Heatmaps
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Geographic issue mapping with Leaflet.js. Visualizes complaint hotspots, density aggregates, and area-wise risk indices directly for smart administration oversight.
          </p>
        </GlowingCard>
      </div>

      {/* Enterprise Footer */}
      <footer className="relative z-10 border-t border-slate-900 pt-8 mt-12 max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center justify-between text-[11px] font-mono text-slate-500">
        <div className="mb-4 md:mb-0">
          © 2026 BHARATSYNC AI OPERATING SYSTEM. ENTERPRISE HACKATHON EDITION.
        </div>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-neon-cyan transition-colors">Vigilance Board</a>
          <a href="#" className="hover:text-neon-cyan transition-colors">Oversight Commission</a>
          <a href="#" className="hover:text-neon-cyan transition-colors">Developer Console</a>
        </div>
      </footer>
    </div>
  );
}
