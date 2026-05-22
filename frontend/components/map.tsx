"use client";

import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface MapItem {
  id: number;
  title: string;
  category: string;
  urgency: string;
  status: string;
  location: string;
  latitude: number;
  longitude: number;
}

interface MapComponentProps {
  items: MapItem[];
  selectedCategory: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Roads: "#00d2ff",      // Cyan
  Water: "#06b6d4",      // Cyan
  Electricity: "#8b5cf6", // Purple
  Garbage: "#f59e0b",    // Orange
  "Public Safety": "#10b981", // Green
  Corruption: "#ef4444"  // Red
};

export default function CustomMap({ items, selectedCategory }: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  // Dynamically load leaflet on the client side only
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    // Resolve Leaflet module dynamically
    import("leaflet").then((L) => {
      // Fix default Leaflet icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      // Initialize map instance if not already done
      if (!mapInstanceRef.current) {
        // Center around central Indore (Vijay Nagar)
        mapInstanceRef.current = L.map(mapContainerRef.current!).setView([22.7500, 75.8900], 14);

        // Add CartoDB Dark Matter tile layer
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 20
        }).addTo(mapInstanceRef.current);

        markersGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      }

      // Clear existing markers
      if (markersGroupRef.current) {
        markersGroupRef.current.clearLayers();
      }

      // Filter and render markers
      const filtered = items.filter(
        (item) => selectedCategory === "ALL" || item.category === selectedCategory
      );

      filtered.forEach((item) => {
        const color = CATEGORY_COLORS[item.category] || "#06b6d4";

        // 1. Create a pulsing density heat ring around the marker coordinate
        const circle = L.circle([item.latitude, item.longitude], {
          color: color,
          fillColor: color,
          fillOpacity: 0.15,
          radius: item.urgency === "Critical" ? 180 : item.urgency === "High" ? 120 : 70,
          weight: 1
        });
        circle.addTo(markersGroupRef.current);

        // 2. Create the focal point marker anchor
        const pulsingDot = L.circleMarker([item.latitude, item.longitude], {
          radius: 6,
          color: color,
          fillColor: "#070a13",
          fillOpacity: 1,
          weight: 2
        });

        // 3. Bind clean descriptive popups linking to details page
        const popupContent = `
          <div style="font-family: monospace; font-size: 10px; line-height: 1.5; color: #f8fafc;">
            <div style="font-size: 11px; font-weight: bold; color: ${color}; text-transform: uppercase; margin-bottom: 2px;">
              [${item.category.toUpperCase()}] TICKET #${item.id}
            </div>
            <div style="font-weight: bold; color: #e2e8f0; margin-bottom: 6px; font-family: sans-serif;">
              ${item.title}
            </div>
            <div style="margin-bottom: 6px;">
              STATUS: <b style="color: #22d3ee; text-transform: uppercase;">${item.status}</b>
            </div>
            <div>
              <a href="/complaints/${item.id}" style="color: #00d2ff; text-decoration: none; font-weight: bold; text-transform: uppercase;">
                Open Telemetry Detail →
              </a>
            </div>
          </div>
        `;

        pulsingDot.bindPopup(popupContent);
        pulsingDot.addTo(markersGroupRef.current);
      });
    });

    // Cleanup map instance on unmount
    return () => {
      // Note: we can keep the map instance intact between simple renders, but standard cleanup is fine
    };
  }, [items, selectedCategory]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.5)] relative">
      {/* Target Container element */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />
      
      {/* Custom grid scanline overlay for futuristic hud feel */}
      <div className="absolute inset-0 pointer-events-none border border-neon-cyan/20 rounded-xl z-10" />
    </div>
  );
}
