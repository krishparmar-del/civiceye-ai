import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useCivic } from '../../context/CivicContext';
import { Problem, isProblemActive } from '../../types';
import { MapPin } from 'lucide-react';

interface Props {
  onOpenDetails: (problem: Problem) => void;
}

export const CitizenMap: React.FC<Props> = ({ onOpenDetails }) => {
  const { currentUser, problems } = useCivic();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [statusFilter, setStatusFilter] = useState<'Active' | 'All' | 'Closed'>('Active');

  const visibleProblems = problems.filter((p) => {
    if (p.isDuplicateOf) return false;
    if (statusFilter === 'Active') {
      if (!isProblemActive(p.status)) return false;
    } else if (statusFilter === 'Closed') {
      if (p.status !== 'Closed') return false;
    }
    return true;
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLat = 22.7155;
    const initialLng = 75.8924;

    const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 14);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Citizen registered location pin
    const homeIcon = L.divIcon({
      className: 'home-pin',
      html: `<div style="background-color: #4E5B38; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #FFFDF8; box-shadow: 0 4px 6px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">⌂</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    L.marker([22.7150, 75.8920], { icon: homeIcon })
      .bindPopup(
        `<div style="padding: 10px; font-family: sans-serif;">
          <strong style="color: #262820; font-size: 13px;">Your Registered Ward</strong>
          <div style="color: #696A5D; font-size: 11px; margin-top: 2px;">${currentUser?.block || 'Tilak Nagar'}, Indore</div>
        </div>`
      )
      .addTo(map);

    // Add defect markers
    visibleProblems.forEach((prob) => {
      let pinColor = '#65734A';
      if (prob.priority === 'Critical') pinColor = '#8A3838';
      else if (prob.priority === 'High') pinColor = '#B28A45';
      else if (prob.status === 'Completed' || prob.status === 'Closed') pinColor = '#5F7650';

      const customIcon = L.divIcon({
        className: 'civic-marker-pin',
        html: `<div style="background-color: ${pinColor}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid #FFFDF8; box-shadow: 0 2px 4px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold; cursor: pointer;">!</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const popupContent = `
        <div style="padding: 12px; width: 230px; font-family: sans-serif;">
          <div style="font-size: 10px; color: #696A5D; font-weight: 600; text-transform: uppercase;">${prob.category} · ${prob.id}</div>
          <strong style="font-size: 13px; color: #262820; display: block; margin: 4px 0 6px;">${prob.title}</strong>
          <div style="font-size: 11px; color: #696A5D; margin-bottom: 8px;">
            Status: <strong>${prob.status}</strong><br/>
            Affected: <strong>${prob.affectedCount} citizens</strong>
          </div>
          <button id="btn-view-${prob.id}" style="width: 100%; padding: 6px; background-color: #65734A; color: #ffffff; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">
            View Full Details
          </button>
        </div>
      `;

      const marker = L.marker([prob.latitude, prob.longitude], { icon: customIcon })
        .bindPopup(popupContent)
        .addTo(map);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-view-${prob.id}`);
        if (btn) {
          btn.onclick = () => onOpenDetails(prob);
        }
      });
    });

    return () => {
      map.remove();
    };
  }, [visibleProblems, currentUser, onOpenDetails]);

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary tracking-tight">
            Citizen Area Map
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Geographic incident map for {currentUser?.block || 'Indore'}
          </p>
        </div>

        {/* Status filter toggle */}
        <div className="bg-surface p-1 rounded-xl border border-theme flex items-center text-xs">
          <button
            onClick={() => setStatusFilter('Active')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'Active'
                ? 'bg-olive-primary text-white font-semibold shadow-xs'
                : 'text-theme-secondary hover:text-theme-primary'
            }`}
          >
            Active Problems
          </button>
          <button
            onClick={() => setStatusFilter('Closed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'Closed'
                ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                : 'text-theme-secondary hover:text-theme-primary'
            }`}
          >
            Resolved Only
          </button>
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'All'
                ? 'bg-theme-secondary text-white font-semibold shadow-xs'
                : 'text-theme-secondary hover:text-theme-primary'
            }`}
          >
            All
          </button>
        </div>
      </div>

      <div className="bg-card-theme p-3 rounded-2xl border border-theme flex items-center justify-between gap-4 text-xs theme-transition">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#8A3838] inline-block"></span>
            <span className="font-medium text-theme-primary">Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#B28A45] inline-block"></span>
            <span className="font-medium text-theme-primary">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#65734A] inline-block"></span>
            <span className="font-medium text-theme-primary">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#5F7650] inline-block"></span>
            <span className="font-medium text-theme-primary">Resolved</span>
          </div>
        </div>

        <span className="text-[11px] text-theme-muted font-mono">
          Showing {visibleProblems.length} mapped incidents
        </span>
      </div>

      <div className="h-[540px] rounded-2xl overflow-hidden border border-theme shadow-xs relative bg-surface theme-transition">
        <div ref={mapContainerRef} className="w-full h-full" />
        {visibleProblems.length === 0 && (
          <div className="absolute top-4 left-4 z-[500] bg-card-theme border border-theme px-3.5 py-2 rounded-xl shadow-md text-xs text-theme-secondary font-medium">
            📍 No {statusFilter.toLowerCase()} issues in this area
          </div>
        )}
      </div>
    </div>
  );
};
