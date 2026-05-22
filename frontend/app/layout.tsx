import type { Metadata } from "next";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "BharatSync AI - Cyber Governance & Smart Escalation System",
  description: "Futuristic enterprise-grade AI public grievance redressal and smart escalation OS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-cyber-bg min-h-screen text-slate-100 flex overflow-hidden">
        {/* Futuristic Cyber Navigation Sidebar */}
        <Sidebar />
        
        {/* Main Control Center Area */}
        <main className="flex-1 ml-72 min-h-screen relative overflow-y-auto bg-cyber-bg flex flex-col">
          {/* Subtle Ambient Scanline Overlay for Cyber Theme */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neon-cyan/5 via-transparent to-transparent pointer-events-none z-0" />
          
          <div className="relative flex-1 z-10 flex flex-col">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
