"use client";

import React, { useState, useEffect, useRef } from "react";
import { GlowingCard } from "@/components/glowing-card";
import { 
  Cpu, 
  Send, 
  Terminal, 
  Mic, 
  Sparkles, 
  HelpCircle, 
  ArrowRight,
  ChevronRight,
  Activity,
  Bot,
  User,
  Loader2
} from "lucide-react";

interface Message {
  sender: "user" | "ai";
  text: string;
  reasoningSteps?: string[];
  actions?: string[];
}

export default function ChatbotPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Greetings. I am the **BharatSync AI Governance Assistant**. I am linked directly to the Indore administrative ledger database. \n\nI can explain smart routing rules, explain how our smart escalation works, or query specific live tickets. For example, try typing **'Status of complaint #9'** or **'Why is my ticket #1 delayed?'**.",
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    // User message
    const userMsg: Message = { sender: "user", text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend })
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, {
          sender: "ai",
          text: data.reply,
          reasoningSteps: data.reasoning_steps,
          actions: data.actions
        }]);
      } else {
        throw new Error("HTTP error");
      }
    } catch (err) {
      console.log("Using local chatbot logic fallback...");
      // Simulate local chatbot responses for offline resilience
      setTimeout(() => {
        const msgLower = textToSend.toLowerCase();
        let reply = "";
        let reasoning: string[] = [];
        let actions: string[] = [];

        if (msgLower.includes("#9") || msgLower.includes("complaint 9") || msgLower.includes("ticket 9")) {
          reasoning = [
            "Parsed user query for Complaint ID: #9",
            "Located active record: category='Water', status='Escalated', age=18 days",
            "Matched SLA limits: target=5 days (Breached by 13 days)",
            "Identified active escalation status: Level 2 (District Commissioner level)"
          ];
          reply = "Your Complaint ID **#9** ('Major sewage pipe burst near Vijay Nagar square') is flagged as **Escalated** (Level 2). \n\nThis occurred automatically because the Municipal Water Department breached its average SLA limit of **5 days** and has not updated the ticket in **18 days**. The Indore District Commissioner's office is now supervising field works. We apologize for this administrative delay.";
          actions = ["Trigger Emergency Briefing", "Request Inspection Photos", "Contact Division Ombuds"];
        } else if (msgLower.includes("#1") || msgLower.includes("complaint 1") || msgLower.includes("ticket 1")) {
          reasoning = [
            "Parsed user query for Complaint ID: #1",
            "Located active record: category='Roads', status='Escalated', age=15 days",
            "Matched SLA limits: target=7 days (Breached by 8 days)",
            "Identified active escalation status: Level 1 (Division Head level)"
          ];
          reply = "Your Complaint ID **#1** ('Severe potholes on the main road of Scheme 54') is currently in status **Escalated** (Level 1) under the Road Maintenance Division. \n\nSLA limit is 7 days, meaning the department has run over by **8 days**. Case has been pushed to Division Head Shri Rajesh Kumar for quick clearance.";
          actions = ["Request Status Check", "File Senior Appeal"];
        } else if (msgLower.includes("escalat") || msgLower.includes("rules") || msgLower.includes("delayed")) {
          reasoning = [
            "User inquiring about smart escalation engine criteria.",
            "Fetching active systemic rule variables."
          ];
          reply = "BharatSync AI's **Smart Escalation Engine** monitors municipal folders for delays. Grievances are promoted to higher boards if:\n1. Ticket age exceeds department SLA thresholds.\n2. Area complaint density spikes (suggesting a systemic cluster).\n3. Sentiment score breaches -0.7 index (high public safety hazard).";
          actions = ["View Escalation Control Deck", "Check City SLA Compliance"];
        } else {
          reasoning = [
            "Unidentified keyword prompt. Initializing generic conversational responder."
          ];
          reply = "I am the **BharatSync AI Assistant**, connected to Indore's municipal ledger. \n\nI can help you file grievances, explain automated routing metrics, track delayed issues, or trigger escalation logs. Let me know if you would like me to check a specific complaint ID (e.g. 'Check complaint #9').";
          actions = ["Go to Citizen Portal", "View Heatmaps"];
        }

        setMessages(prev => [...prev, {
          sender: "ai",
          text: reply,
          reasoningSteps: reasoning,
          actions: actions
        }]);
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 h-screen relative flex flex-col justify-between font-mono p-8">
      <div className="absolute inset-0 cyber-grid-fine opacity-10 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 border-b border-slate-900 pb-4 mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded bg-neon-cyan/10 border border-neon-cyan/20">
            <Terminal className="w-5 h-5 text-neon-cyan animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-wider text-slate-100 uppercase">
              AI-Gov Chatbot Assistant
            </h2>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-0.5">
              Secure mainframe cognitive console
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-[10px] text-slate-400 bg-slate-950 px-3 py-1 rounded border border-slate-900">
          <Activity className="w-3.5 h-3.5 text-neon-cyan animate-pulse mr-1" />
          <span>LLM ACTIVE / DB CONNECTED</span>
        </div>
      </div>

      {/* Main double split frame */}
      <div className="relative z-10 flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 overflow-hidden min-h-0">
        
        {/* Left Column: Interactive Chat Terminal */}
        <div className="xl:col-span-8 flex flex-col justify-between bg-slate-950/40 rounded-xl border border-slate-900/60 p-4 h-full min-h-0">
          {/* Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin mb-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex space-x-3 items-start max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse space-x-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar Icon */}
                <div className={`p-2 rounded-lg border shrink-0 ${
                  msg.sender === "user" 
                    ? "bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan" 
                    : "bg-neon-purple/10 border-neon-purple/30 text-neon-purple"
                }`}>
                  {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 animate-pulse" />}
                </div>

                {/* Bubble content */}
                <div className="space-y-3">
                  <div className={`p-3.5 rounded-xl border font-sans text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-slate-900 border-neon-cyan/30 text-slate-100"
                      : "bg-slate-900/40 border-slate-800 text-slate-200"
                  }`}>
                    {/* Render markdown style lines */}
                    {msg.text.split("\n\n").map((para, pIdx) => (
                      <p key={pIdx} className={pIdx > 0 ? "mt-2" : ""}>
                        {para.split("**").map((chunk, cIdx) => 
                          cIdx % 2 === 1 ? <strong key={cIdx} className="text-neon-cyan font-semibold font-mono">{chunk}</strong> : chunk
                        )}
                      </p>
                    ))}
                  </div>

                  {/* Actions associated with AI responses */}
                  {msg.sender === "ai" && msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {msg.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleSend(act)}
                          className="py-1.5 px-3 rounded-lg border border-slate-800 bg-slate-950/80 hover:border-neon-cyan/40 text-slate-400 hover:text-neon-cyan text-[10px] font-mono transition cursor-pointer"
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex space-x-3 items-start mr-auto">
                <div className="p-2 rounded-lg bg-neon-purple/10 border border-neon-purple/30 text-neon-purple shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-900/30 border border-slate-850 p-3.5 rounded-xl flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1 text-neon-purple" />
                  <span>CONSTRUCTING LOGICAL PATHWAY...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form message input bar */}
          <div className="flex items-center space-x-3 border-t border-slate-900 pt-3.5 bg-slate-950/40">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder="Ask a question or enter a ticket ID (e.g. 'Status of ticket #9')..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-neon-cyan/50 font-sans"
            />
            
            {/* Record voice simulation */}
            <button
              onClick={() => handleSend("Status of ticket #9")}
              className="p-3 rounded-xl border border-slate-800 hover:border-neon-cyan bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-neon-cyan transition cursor-pointer"
              title="Record Voice Query"
            >
              <Mic className="w-4 h-4" />
            </button>
            
            {/* Send */}
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim()}
              className={`p-3 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center ${
                !input.trim()
                  ? "bg-slate-900 border border-slate-850 text-slate-600 cursor-not-allowed"
                  : "bg-neon-cyan text-slate-950 hover:shadow-[0_0_15px_#06b6d4]"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Reasoning thought steps accordion display */}
        <div className="xl:col-span-4 h-full flex flex-col min-h-0">
          <GlowingCard variant="purple" className="flex-1 flex flex-col justify-between min-h-0 h-full">
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center space-x-2 text-slate-200 text-xs uppercase font-bold border-b border-slate-850 pb-3 mb-4 shrink-0">
                <Cpu className="w-4 h-4 text-neon-purple" />
                <span>AI Reasoning Thought Chain</span>
              </div>

              {/* Scrollable logic logs */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 scrollbar-thin text-[10px] text-slate-400 font-mono">
                {/* Look for latest AI reasoning */}
                {(() => {
                  const lastAiMsg = [...messages].reverse().find(m => m.sender === "ai" && m.reasoningSteps);
                  
                  if (!lastAiMsg || !lastAiMsg.reasoningSteps || lastAiMsg.reasoningSteps.length === 0) {
                    return (
                      <div className="py-20 text-center text-slate-600 uppercase">
                        Awaiting query analysis... Thought logs will compile in this pane.
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-3.5">
                      {lastAiMsg.reasoningSteps.map((step, sIdx) => (
                        <div 
                          key={sIdx}
                          className="bg-slate-950/60 border border-slate-850 p-3 rounded-lg relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-[2px] h-full bg-neon-purple" />
                          <div className="text-neon-purple font-semibold mb-1 uppercase tracking-wider text-[9px]">
                            Logic Unit Log {sIdx + 1}
                          </div>
                          <p className="leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Quick helper prompts */}
            <div className="border-t border-slate-850 pt-4 mt-4 shrink-0 space-y-2">
              <span className="text-[9px] text-slate-500 uppercase block font-bold">Suggested Mainframe Enquiries</span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleSend("Explain smart escalation rules")}
                  className="w-full text-left p-2 rounded bg-slate-950/40 border border-slate-850 hover:border-neon-cyan/30 text-[9px] text-slate-400 hover:text-slate-200 transition cursor-pointer flex justify-between items-center"
                >
                  <span>How does smart escalation execute?</span>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                </button>
                <button
                  onClick={() => handleSend("Check complaint #9")}
                  className="w-full text-left p-2 rounded bg-slate-950/40 border border-slate-850 hover:border-neon-cyan/30 text-[9px] text-slate-400 hover:text-slate-200 transition cursor-pointer flex justify-between items-center"
                >
                  <span>Inspect critical delay Case #9</span>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                </button>
              </div>
            </div>
          </GlowingCard>
        </div>

      </div>
    </div>
  );
}
