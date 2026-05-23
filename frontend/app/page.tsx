"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GlowingCard } from "@/components/glowing-card";
import {
  ArrowRight,
  Cpu,
  ShieldAlert,
  Map,
  TrendingUp,
  Activity,
  MessageSquareCode,
  Sparkles,
  Zap,
  GitBranch,
  Eye,
  CheckCircle2,
} from "lucide-react";

const workflowSteps = [
  { title: "Citizen Input", desc: "Citizen submits grievance in plain English or regional languages, with optional image/voice upload.", badge: "Grievance Filed", icon: MessageSquareCode, color: "#06b6d4" },
  { title: "Cognitive Triage", desc: "Real-time AI NLP classifier maps category, sentiment, urgency, and routes to the correct department.", badge: "AI Categorized", icon: Cpu, color: "#8b5cf6" },
  { title: "Semantic Dedup", desc: "FAISS vector engine checks for similar existing complaints to prevent duplicates and cluster issues.", badge: "Dedup Scanned", icon: GitBranch, color: "#14b8a6" },
  { title: "Smart Escalation", desc: "SLA breach engine auto-escalates through Tier 1 → 2 → 3 based on delay, sentiment and negligence.", badge: "Auto-Escalated", icon: ShieldAlert, color: "#f59e0b" },
  { title: "Resolution", desc: "Department teams complete field work, log digital evidence, citizen is notified on closure.", badge: "SLA Compliant", icon: CheckCircle2, color: "#10b981" },
];

const stats = [
  { label: "Seeded Cases", value: "50+", sub: "● LIVE DATABASE", color: "#06b6d4" },
  { label: "Avg SLA Target", value: "4.8d", sub: "▼ 18% DELAY DROP", color: "#8b5cf6" },
  { label: "AI Routing Acc.", value: "98.4%", sub: "▲ CONFIDENCE RATE", color: "#10b981" },
  { label: "Negligence Flags", value: "12", sub: "🚨 ESCALATIONS LIVE", color: "#ef4444" },
];

const features = [
  { icon: Cpu, color: "#06b6d4", bg: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.25)", title: "AI NLP Categorization", desc: "Keystroke-level triage as citizens type. Instantly maps to Water, Roads, Power, Safety, or Corruption departments with 98%+ routing confidence." },
  { icon: ShieldAlert, color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.25)", title: "3-Tier Escalation Engine", desc: "Automated SLA breach detection escalates cases: Department Head → District Magistrate → State Secretariat. Zero manual intervention needed." },
  { icon: Map, color: "#14b8a6", bg: "rgba(20,184,166,0.08)", border: "rgba(20,184,166,0.25)", title: "Geospatial Heatmap", desc: "Interactive Leaflet.js city map with complaint clustering, zone density overlays, and real-time systemic risk visualization." },
  { icon: Eye, color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", title: "Negligence Scoring", desc: "Quantified administrative accountability score per department. Flags repeated SLA violators and surfaces systemic governance failures." },
  { icon: Activity, color: "#ec4899", bg: "rgba(236,72,153,0.08)", border: "rgba(236,72,153,0.25)", title: "Recharts Analytics", desc: "Rich temporal analytics: complaint velocity, resolution trends, department performance, and citizen satisfaction index over time." },
  { icon: TrendingUp, color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", title: "Grok AI Chatbot", desc: "xAI Grok-powered governance mainframe for citizens and admins. Context-aware DB lookups, escalation explanations, and live status retrieval." },
];

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [liveCount, setLiveCount] = useState(50);

  useEffect(() => {
    const t = setInterval(() => {
      setLiveCount(c => c + Math.floor(Math.random() * 2));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: "100%", padding: "0", position: "relative" }}>
      {/* Ambient backgrounds */}
      <div style={{ position: "fixed", top: "-100px", right: "-100px", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "0", left: "200px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
      <div className="cyber-grid-fine absolute inset-0 opacity-20 pointer-events-none" style={{ zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto", padding: "48px 40px 80px" }}>

        {/* ─── Hero ─── */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div
            className="inline-flex items-center gap-2 mb-6 animate-pulse"
            style={{
              padding: "6px 16px",
              borderRadius: "100px",
              background: "rgba(6,182,212,0.08)",
              border: "1px solid rgba(6,182,212,0.3)",
              color: "#22d3ee",
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            <Sparkles style={{ width: "12px", height: "12px" }} />
            BharatSync AI Cognitive OS — Hackathon Edition
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#f8fafc",
              marginBottom: "24px",
            }}
          >
            Transforming Public{" "}
            <span className="gradient-text-cyan glow-text-cyan" style={{ display: "block" }}>
              Governance Through AI
            </span>
          </h1>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "1.05rem",
              lineHeight: 1.7,
              maxWidth: "640px",
              margin: "0 auto 40px",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            The next-generation enterprise cognitive operating system for smart public administration.
            Bridging the gap between citizen expectations and government accountability — in real-time.
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/portal">
              <button
                style={{
                  padding: "14px 28px",
                  borderRadius: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  background: "linear-gradient(135deg, #0ea5e9, #06b6d4, #14b8a6)",
                  color: "#030712",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 0 25px rgba(6,182,212,0.35)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.3s ease",
                }}
                className="hover:scale-105 hover:shadow-[0_0_40px_rgba(6,182,212,0.6)]"
              >
                Launch Citizen Portal
                <ArrowRight style={{ width: "14px", height: "14px" }} />
              </button>
            </Link>
            <Link href="/dashboard">
              <button
                style={{
                  padding: "14px 28px",
                  borderRadius: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  background: "rgba(15,23,42,0.6)",
                  color: "#e2e8f0",
                  border: "1px solid rgba(51,65,85,0.8)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.3s ease",
                }}
                className="hover:scale-105 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
              >
                <Zap style={{ width: "14px", height: "14px", color: "#22d3ee" }} />
                Admin Control Center
              </button>
            </Link>
          </div>
        </div>

        {/* ─── Stats Row ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "64px" }}>
          {stats.map((s, i) => (
            <div
              key={i}
              className="card-lift"
              style={{
                padding: "20px",
                borderRadius: "14px",
                background: "rgba(15,23,42,0.5)",
                border: `1px solid rgba(${s.color === "#06b6d4" ? "6,182,212" : s.color === "#8b5cf6" ? "139,92,246" : s.color === "#10b981" ? "16,185,129" : "239,68,68"},0.2)`,
                backdropFilter: "blur(10px)",
              }}
            >
              <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "monospace", marginBottom: "8px" }}>{s.label}</div>
              <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#f8fafc", lineHeight: 1, fontFamily: "'JetBrains Mono', monospace", marginBottom: "6px" }}>
                {s.label === "Seeded Cases" ? `${liveCount}+` : s.value}
              </div>
              <div style={{ fontSize: "9px", color: s.color, fontFamily: "monospace", letterSpacing: "0.05em" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ─── Pipeline Workflow ─── */}
        <div style={{ marginBottom: "64px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h2 style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#e2e8f0" }}>
              Cognitive Pipeline Visualization
            </h2>
            <p style={{ color: "#475569", fontSize: "11px", fontFamily: "monospace", marginTop: "6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Click on pipeline nodes to inspect processing logic
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginBottom: "20px" }}>
            {workflowSteps.map((step, idx) => {
              const isActive = activeStep === idx;
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  style={{
                    padding: "16px 14px",
                    borderRadius: "12px",
                    border: isActive ? `1px solid ${step.color}40` : "1px solid rgba(30,41,59,0.6)",
                    background: isActive ? `${step.color}08` : "rgba(15,23,42,0.4)",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    textAlign: "left",
                    position: "relative",
                  }}
                  className="hover:scale-105"
                >
                  {isActive && (
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", borderRadius: "12px 12px 0 0", background: step.color, boxShadow: `0 0 8px ${step.color}` }} />
                  )}
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "10px",
                      background: isActive ? `${step.color}20` : "rgba(30,41,59,0.5)",
                      border: isActive ? `1px solid ${step.color}40` : "1px solid rgba(30,41,59,0.5)",
                    }}
                  >
                    <Icon style={{ width: "14px", height: "14px", color: isActive ? step.color : "#64748b" }} />
                  </div>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: isActive ? step.color : "#cbd5e1", fontFamily: "monospace", letterSpacing: "0.05em", marginBottom: "4px" }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: "8px", color: "#475569", textTransform: "uppercase", fontFamily: "monospace" }}>{step.badge}</div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              padding: "20px 24px",
              borderRadius: "12px",
              border: "1px solid rgba(30,41,59,0.7)",
              background: "rgba(15,23,42,0.5)",
              backdropFilter: "blur(8px)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", background: workflowSteps[activeStep].color, borderRadius: "12px 0 0 12px" }} />
            <div style={{ paddingLeft: "16px" }}>
              <div style={{ fontSize: "10px", color: workflowSteps[activeStep].color, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "monospace", marginBottom: "6px", fontWeight: 700 }}>
                Pipeline Node {activeStep + 1}: {workflowSteps[activeStep].title}
              </div>
              <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.65, fontFamily: "'Inter', sans-serif" }}>
                {workflowSteps[activeStep].desc}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Feature Cards ─── */}
        <div style={{ marginBottom: "64px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h2 style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#e2e8f0" }}>
              Platform Capabilities
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="card-lift"
                  style={{
                    padding: "22px",
                    borderRadius: "14px",
                    background: "rgba(15,23,42,0.5)",
                    border: "1px solid rgba(30,41,59,0.6)",
                    backdropFilter: "blur(8px)",
                    transition: "all 0.25s ease",
                  }}
                >
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: f.bg,
                      border: `1px solid ${f.border}`,
                      marginBottom: "14px",
                    }}
                  >
                    <Icon style={{ width: "18px", height: "18px", color: f.color }} />
                  </div>
                  <h3 style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#e2e8f0", fontFamily: "monospace", marginBottom: "8px" }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Footer ─── */}
        <footer
          style={{
            borderTop: "1px solid rgba(30,41,59,0.5)",
            paddingTop: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ fontSize: "10px", color: "#475569", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            © 2026 BharatSync AI Operating System — Hackathon Edition 🇮🇳
          </div>
          <div style={{ display: "flex", gap: "24px" }}>
            {["Vigilance Board", "Oversight Commission", "Developer API"].map(l => (
              <a key={l} href="#" style={{ fontSize: "10px", color: "#475569", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "none", transition: "color 0.2s" }}
                className="hover:text-cyan-400"
              >{l}</a>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
