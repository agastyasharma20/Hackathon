import React from "react";

interface GlowingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "cyan" | "purple" | "red" | "green" | "default";
  active?: boolean;
  className?: string;
}

export const GlowingCard: React.FC<GlowingCardProps> = ({
  children,
  variant = "default",
  active = false,
  className = "",
  ...props
}) => {
  const baseStyle = "relative rounded-xl p-6 cyber-panel transition-all duration-300";
  
  const borderStyles = {
    default: active ? "border-neon-cyan/80 shadow-[0_0_15px_rgba(6,182,212,0.15)]" : "border-slate-800 hover:border-neon-cyan/40",
    cyan: active ? "border-neon-cyan shadow-[0_0_20px_rgba(6,182,212,0.25)]" : "border-slate-800 hover:border-neon-cyan/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]",
    purple: active ? "border-neon-purple shadow-[0_0_20px_rgba(139,92,246,0.25)]" : "border-slate-800 hover:border-neon-purple/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)]",
    red: active ? "border-neon-red shadow-[0_0_20px_rgba(239,68,68,0.25)]" : "border-slate-800 hover:border-neon-red/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)]",
    green: active ? "border-neon-green shadow-[0_0_20px_rgba(16,185,129,0.25)]" : "border-slate-800 hover:border-neon-green/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]",
  };

  return (
    <div
      className={`${baseStyle} ${borderStyles[variant]} ${className}`}
      {...props}
    >
      {/* Dynamic glow effect corners for futuristic feel */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 rounded-tl border-slate-700 pointer-events-none group-hover:border-neon-cyan transition-colors duration-300" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 rounded-tr border-slate-700 pointer-events-none group-hover:border-neon-cyan transition-colors duration-300" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 rounded-bl border-slate-700 pointer-events-none group-hover:border-neon-cyan transition-colors duration-300" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 rounded-br border-slate-700 pointer-events-none group-hover:border-neon-cyan transition-colors duration-300" />
      
      {children}
    </div>
  );
};
