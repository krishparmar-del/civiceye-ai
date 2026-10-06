import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useCivic } from '../../context/CivicContext';
import { Problem } from '../../types';
import { Filter, Layers, MapPin } from 'lucide-react';

interface Props {
  onOpenDetails: (problem: Problem) => void;
}

export const OfficialMap: React.FC<Props> = ({ onOpenDetails }) => {
  const { problems, currentUser } = useCivic();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Active');

  const visibleProblems = problems.filter((p) => {
    if (p.isDuplicateOf) return false;
    if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
    if (priorityFilter !== 'All' && p.priority !== priorityFilter) return false;
    if (statusFilter === 'Active') {
      if (p.status === 'Closed' || p.status === 'Rejected') return false;
    } else if (statusFilter !== 'All' && p.status !== statusFilter) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center on Indore (Tilak Nagar center ~ 22.7155, 75.8924)
    const initialLat = 22.7155;
    const initialLng = 75.8924;

    const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 13);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Add municipal ward boundary circle around Tilak Nagar / Zone 7
    L.circle([22.7155, 75.8924], {
      color: '#4E5B38',
      fillColor: '#87956A',
      fillOpacity: 0.08,
      radius: 1800,
      weight: 1.5,
      dashArray: '4, 4',
    })
      .bindPopup(
        `<div style="padding: 10px; font-family: sans-serif;">
          <strong style="color: #262820; font-size: 13px;">Jurisdiction Zone 7 (${currentUser?.block || 'Tilak Nagar'})</strong>
          <div style="color: #696A5D; font-size: 11px; margin-top: 2px;">Indore Municipal Corporation</div>
        </div>`
      )
      .addTo(map);

    visibleProblems.forEach((prob) => {
      let pinColor = '#65734A';
      if (prob.priority === 'Critical') pinColor = '#8A3838';
      else if (prob.priority === 'High') pinColor = '#B28A45';
      else if (prob.status === 'Completed' || prob.status === 'Closed') pinColor = '#5F7650';

      const customIcon = L.divIcon({
        className: 'official-marker-pin',
        html: `<div style="background-color: ${pinColor}; width: 26px; height: 26px; border-radius: 50%; border: 2px solid #FFFDF8; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold; cursor: pointer;">!</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const popupContent = `
        <div style="padding: 12px; width: 250px; font-family: sans-serif;">
          <div style="font-size: 10px; color: #696A5D; font-weight: 600; text-transform: uppercase;">
            ${prob.category} · Priority ${prob.priorityScore}/100
          </div>
          <strong style="font-size: 13px; color: #262820; display: block; margin: 4px 0 6px;">${prob.title}</strong>
          <div style="font-size: 11px; color: #696A5D; margin-bottom: 8px;">
            Ward: <strong>${prob.ward} (${prob.block})</strong><br/>
            Status: <strong>${prob.status}</strong><br/>
            Dept: <strong>${prob.department}</strong><br/>
            Affected: <strong>${prob.affectedCount} citizens</strong>
          </div>
          <button id="btn-official-view-${prob.id}" style="width: 100%; padding: 6px; background-color: #65734A; color: #ffffff; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">
            Inspect & Manage Status
          </button>
        </div>
      `;

      const marker = L.marker([prob.latitude, prob.longitude], { icon: customIcon })
        .bindPopup(popupContent)
        .addTo(map);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-official-view-${prob.id}`);
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
            Official Jurisdiction Map
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Geographic incident distribution and priority clustering across Indore Municipal Corporation
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-card-theme border border-theme rounded-xl font-medium text-theme-primary focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            <option value="Pothole">Pothole</option>
            <option value="Road">Road</option>
            <option value="Streetlight">Streetlight</option>
            <option value="Drainage">Drainage</option>
            <option value="Water">Water</option>
            <option value="Garbage">Garbage</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-card-theme border border-theme rounded-xl font-medium text-theme-primary focus:outline-hidden"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-card-theme border border-theme rounded-xl font-medium text-theme-primary focus:outline-hidden"
          >
            <option value="Active">Active Problems (Default)</option>
            <option value="All">All Incidents</option>
            <option value="Reported">Reported</option>
            <option value="Verified">Verified</option>
            <option value="Work in Progress">Work in Progress</option>
            <option value="Pending Citizen Verification">Pending Verification</option>
            <option value="Closed">Resolved / Closed Only</option>
          </select>
        </div>
      </div>

      {/* Map Legend */}
      <div className="bg-card-theme p-3 rounded-2xl border border-theme flex items-center justify-between gap-4 text-xs theme-transition">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#8A3838] inline-block"></span>
            <span className="font-semibold text-theme-primary">Critical Priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#B28A45] inline-block"></span>
            <span className="font-semibold text-theme-primary">High Priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#65734A] inline-block"></span>
            <span className="font-semibold text-theme-primary">Normal / In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#5F7650] inline-block"></span>
            <span className="font-semibold text-theme-primary">Resolved / Closed</span>
          </div>
        </div>

        <span className="text-[11px] text-theme-muted font-mono">
          Showing {visibleProblems.length} mapped incidents
        </span>
      </div>

      <div className="h-[580px] rounded-2xl overflow-hidden border border-theme shadow-xs relative bg-surface theme-transition">
        <div ref={mapContainerRef} className="w-full h-full" />
        {visibleProblems.length === 0 && (
          <div className="absolute top-4 left-4 z-[500] bg-card-theme border border-theme px-3.5 py-2 rounded-xl shadow-md text-xs text-theme-secondary font-medium">
            📍 No infrastructure issues reported in this jurisdiction yet
          </div>
        )}
      </div>
    </div>
  );
};
