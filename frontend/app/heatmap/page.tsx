"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { GlowingCard } from "@/components/glowing-card";
import { 
  Map, 
  MapPin, 
  Layers, 
  Eye, 
  AlertTriangle,
  RefreshCw,
  Loader2
} from "lucide-react";

// Dynamically import Leaflet map component with ssr disabled to prevent Next.js build errors
const CustomMap = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex flex-col items-center justify-center bg-slate-950 border border-slate-900 rounded-xl text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-neon-cyan mb-3" />
      <p className="text-xs uppercase tracking-wider">Acquiring GIS Satellites...</p>
    </div>
  )
});

const MOCK_HEATMAP_COMPLAINTS = [
  { id: 1, title: "Severe potholes on the main road of Scheme 54", category: "Roads", urgency: "High", status: "Escalated", location: "Zone 4, Scheme 54", latitude: 22.7532, longitude: 75.8912 },
  { id: 2, title: "Caved-in asphalt on LIG Link Road", category: "Roads", urgency: "High", status: "Escalated", location: "Zone 3, LIG Sector", latitude: 22.7445, longitude: 75.8821 },
  { id: 9, title: "Major sewage pipe burst near Vijay Nagar square", category: "Water", urgency: "Critical", status: "Escalated", location: "Zone 1, Vijay Nagar", latitude: 22.7584, longitude: 75.8942 },
  { id: 10, title: "Contaminated water supply in Sector A, Scheme 54", category: "Water", urgency: "Critical", status: "In Progress", location: "Zone 4, Scheme 54", latitude: 22.7511, longitude: 75.8931 },
  { id: 17, title: "Fallen high-voltage wire near Scheme 114 park", category: "Electricity", urgency: "Critical", status: "In Progress", location: "Zone 8, Scheme 114", latitude: 22.7621, longitude: 75.9015 },
  { id: 19, title: "Damaged transformer sparking near LIG Colony", category: "Electricity", urgency: "Critical", status: "Resolved", location: "Zone 3, LIG Sector", latitude: 22.7428, longitude: 75.8805 },
  { id: 24, title: "Overflowing garbage bin near Scheme 54 market", category: "Garbage", urgency: "Medium", status: "Resolved", location: "Zone 4, Scheme 54", latitude: 22.7525, longitude: 75.8920 },
  { id: 26, title: "No garbage collection vehicle for 5 days in Sukhlia", category: "Garbage", urgency: "High", status: "Pending", location: "Zone 5, Sukhlia", latitude: 22.7662, longitude: 75.8752 },
  { id: 31, title: "Complete lack of streetlights on Scheme 78 main stretch", category: "Public Safety", urgency: "High", status: "Escalated", location: "Zone 8, Scheme 78", latitude: 22.7681, longitude: 75.8995 },
  { id: 34, title: "Eve-teasing and harassment zone near girl's hostel", category: "Public Safety", urgency: "High", status: "In Progress", location: "Zone 4, Scheme 54", latitude: 22.7562, longitude: 75.8928 },
  { id: 38, title: "Clerk demanding bribe for property tax correction", category: "Corruption", urgency: "Critical", status: "Pending", location: "Zone 4, Scheme 54", latitude: 22.7548, longitude: 75.8895 },
  { id: 40, title: "Siphoning of road construction materials by contractor", category: "Corruption", urgency: "High", status: "In Progress", location: "Zone 9, Ring Road", latitude: 22.7315, longitude: 75.9125 }
];

export default function HeatmapPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8500/api/complaints"); // Intentional or standard url check
      const actualRes = await fetch("http://localhost:8000/api/complaints");
      if (actualRes.ok) {
        const data = await actualRes.json();
        setComplaints(data);
      } else {
        throw new Error("HTTP error");
      }
    } catch (err) {
      console.log("Using local geocoded complaints dataset...");
      setComplaints(MOCK_HEATMAP_COMPLAINTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const categories = ["ALL", "Roads", "Water", "Electricity", "Garbage", "Public Safety", "Corruption"];

  return (
    <div className="flex-1 p-8 relative flex flex-col justify-between font-mono">
      <div className="absolute inset-0 cyber-grid-fine opacity-10 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 border-b border-slate-900 pb-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-wider text-slate-100 uppercase">
            Spatial Incident Heatmaps
          </h2>
          <p className="text-slate-500 text-[11px] uppercase tracking-widest mt-1">
            Geographic issue density, vector clusters, and division hotspots
          </p>
        </div>
        
        <button
          onClick={fetchComplaints}
          className="py-2.5 px-4 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition text-[11px] uppercase flex items-center space-x-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync GIS Nodes</span>
        </button>
      </div>

      {/* Grid splits */}
      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        
        {/* Left: Map Area with Category Buttons */}
        <div className="xl:col-span-9 space-y-6">
          {/* Category Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-950/40 rounded-xl border border-slate-900/60">
            <span className="text-[10px] text-slate-500 uppercase px-2 font-bold flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Layer filters:</span>
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-1.5 px-3 rounded-lg border text-[10px] uppercase font-bold transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-neon-cyan/15 border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                    : "bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Map wrapper */}
          <div className="h-[520px]">
            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 border border-slate-900 rounded-xl text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-neon-cyan mb-3" />
                <p className="text-xs uppercase tracking-wider">Acquiring GIS Satellites...</p>
              </div>
            ) : (
              <CustomMap items={complaints} selectedCategory={selectedCategory} />
            )}
          </div>
        </div>

        {/* Right: GIS Stats widgets */}
        <div className="xl:col-span-3 space-y-6">
          <GlowingCard variant="cyan" active={true}>
            <div className="flex items-center space-x-2 text-slate-200 text-xs uppercase font-bold border-b border-slate-850 pb-3 mb-4">
              <MapPin className="w-4 h-4 text-neon-cyan" />
              <span>GIS Control Room</span>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg">
                <div className="text-[9px] text-slate-500 uppercase">Active Geo Clusters</div>
                <div className="text-xl font-black text-white mt-1">18 Hotspots</div>
                <div className="text-[8px] text-neon-cyan mt-0.5">ZONE 4 OVERALL PEAK DENSITY</div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg">
                <div className="text-[9px] text-slate-500 uppercase">GIS Tracking Precision</div>
                <div className="text-xl font-black text-white mt-1">5m Radius</div>
                <div className="text-[8px] text-neon-green mt-0.5">RTK CORRECTIONS ONLINE</div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg">
                <div className="text-[9px] text-slate-500 uppercase">System Density Threshold</div>
                <div className="text-xl font-black text-neon-red mt-1">CRITICAL LEVEL</div>
                <div className="text-[8px] text-neon-red/70 mt-0.5">SLA ALERTS AT PIECE DENSITY</div>
              </div>
            </div>
          </GlowingCard>

          <GlowingCard variant="default">
            <div className="flex items-center space-x-2 text-slate-200 text-xs uppercase font-bold border-b border-slate-850 pb-3 mb-4">
              <AlertTriangle className="w-4 h-4 text-neon-purple" />
              <span>Hotspot Audits</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Spatial markers automatically scale in size based on the predicted **urgency index** and **complaint density score**. 
              
              Double-click any focal pin to unlock administrative details and direct routing coordinates for inspection teams.
            </p>
          </GlowingCard>
        </div>

      </div>
    </div>
  );
}
