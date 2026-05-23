import React from "react";

interface GlowingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "cyan" | "purple" | "red" | "green" | "orange" | "default";
  active?: boolean;
  className?: string;
  noPadding?: boolean;
}

const variantConfig: Record<string, { border: string; glow: string; accent: string }> = {
  default: { border: "rgba(30,41,59,0.7)", glow: "rgba(6,182,212,0.08)", accent: "#06b6d4" },
  cyan:    { border: "rgba(6,182,212,0.3)",   glow: "rgba(6,182,212,0.15)",  accent: "#06b6d4" },
  purple:  { border: "rgba(139,92,246,0.3)",  glow: "rgba(139,92,246,0.12)", accent: "#8b5cf6" },
  red:     { border: "rgba(239,68,68,0.3)",   glow: "rgba(239,68,68,0.12)",  accent: "#ef4444" },
  green:   { border: "rgba(16,185,129,0.3)",  glow: "rgba(16,185,129,0.12)", accent: "#10b981" },
  orange:  { border: "rgba(245,158,11,0.3)",  glow: "rgba(245,158,11,0.12)", accent: "#f59e0b" },
};

export const GlowingCard: React.FC<GlowingCardProps> = ({
  children,
  variant = "default",
  active = false,
  className = "",
  noPadding = false,
  style,
  ...props
}) => {
  const cfg = variantConfig[variant];

  return (
    <div
      className={`card-lift ${className}`}
      style={{
        position: "relative",
        borderRadius: "14px",
        padding: noPadding ? "0" : "20px",
        background: "rgba(15, 23, 42, 0.5)",
        border: `1px solid ${active ? cfg.accent + "70" : cfg.border}`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: active
          ? `0 0 20px ${cfg.glow}, 0 4px 24px rgba(0,0,0,0.3)`
          : `0 4px 24px rgba(0,0,0,0.2)`,
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        ...style,
      }}
      {...props}
    >
      {/* Corner accents */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "12px", height: "12px", borderTop: `2px solid ${cfg.accent}30`, borderLeft: `2px solid ${cfg.accent}30`, borderRadius: "14px 0 0 0", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: "12px", height: "12px", borderTop: `2px solid ${cfg.accent}30`, borderRight: `2px solid ${cfg.accent}30`, borderRadius: "0 14px 0 0", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "12px", height: "12px", borderBottom: `2px solid ${cfg.accent}30`, borderLeft: `2px solid ${cfg.accent}30`, borderRadius: "0 0 0 14px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: "12px", height: "12px", borderBottom: `2px solid ${cfg.accent}30`, borderRight: `2px solid ${cfg.accent}30`, borderRadius: "0 0 14px 0", pointerEvents: "none" }} />

      {children}
    </div>
  );
};
