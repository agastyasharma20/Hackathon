import type { Metadata } from "next";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "BharatSync AI — Cyber Governance & Smart Escalation System",
  description: "Futuristic enterprise-grade AI public grievance redressal and smart escalation OS. Built for modern smart governance.",
  keywords: "AI governance, citizen grievance, smart escalation, municipal management, India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="bg-cyber-bg text-slate-100"
        style={{ display: "flex", height: "100vh", overflow: "hidden" }}
      >
        {/* Fixed Sidebar */}
        <Sidebar />

        {/* Main Scrollable Content Area */}
        <main
          style={{
            marginLeft: "280px",
            flex: 1,
            height: "100vh",
            overflowY: "auto",
            overflowX: "hidden",
            position: "relative",
            backgroundColor: "#030712",
          }}
        >
          {/* Ambient glow top-right */}
          <div
            className="pointer-events-none fixed"
            style={{
              top: 0,
              right: 0,
              width: "600px",
              height: "400px",
              background: "radial-gradient(ellipse at top right, rgba(6,182,212,0.04) 0%, transparent 70%)",
              zIndex: 0,
            }}
          />
          {/* Ambient glow bottom-left */}
          <div
            className="pointer-events-none fixed"
            style={{
              bottom: 0,
              left: "280px",
              width: "500px",
              height: "400px",
              background: "radial-gradient(ellipse at bottom left, rgba(139,92,246,0.04) 0%, transparent 70%)",
              zIndex: 0,
            }}
          />

          <div style={{ position: "relative", zIndex: 1, minHeight: "100%" }}>
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
