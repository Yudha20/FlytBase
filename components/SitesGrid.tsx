import React, { useState } from 'react';
import { Site } from '../types';
import { Search } from 'lucide-react';

const SITES: Site[] = [
  {
    id: '1', name: 'Site A', location: 'Uttar Pradesh',
    dronesReady: 3, dronesBusy: 0, lastEvent: '12m ago',
    status: 'Normal', activeTask: null, connectionState: 'Online', alertCount: 0
  },
  {
    id: '2', name: 'Site B', location: 'Karnataka',
    dronesReady: 0, dronesBusy: 1, lastEvent: '2m ago',
    status: 'Investigating', activeTask: 'Sweep running (42s)', connectionState: 'Online', alertCount: 0
  },
  {
    id: '3', name: 'Site C', location: 'Maharashtra',
    dronesReady: 2, dronesBusy: 0, lastEvent: '2h ago',
    status: 'Normal', activeTask: null, connectionState: 'Online', alertCount: 0
  },
];

type FilterType = 'All' | 'Alerts' | 'Running' | 'Offline';

export const SitesGrid: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSites = SITES.filter(site => {
    // Text Search
    const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.location.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Filter Chips
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Alerts') return (site.alertCount || 0) > 0 || site.status === 'Alert' || site.status === 'Investigating';
    if (activeFilter === 'Running') return site.activeTask !== null;
    if (activeFilter === 'Offline') return site.connectionState === 'Offline';

    return true;
  });

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Controls Row: Filters + Search */}
      <div className="flex items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex items-center gap-2">
          {(['All', 'Alerts', 'Running', 'Offline'] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`
                   h-[28px] px-3 rounded-full text-[12px] font-medium transition-all border
                   ${activeFilter === filter
                  ? 'bg-white/10 text-white border-white/10 shadow-neu-flat'
                  : 'bg-transparent text-white/50 border-transparent hover:bg-white/5 hover:text-white/70 shadow-none'}
                `}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Compact Search */}
        <div className="relative group w-[180px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 group-hover:text-white/50 transition-colors" />
          <input
            type="text"
            placeholder="Search sites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[32px] bg-black/20 border border-white/5 rounded-lg pl-8 pr-3 text-[12px] text-white placeholder:text-white/30 focus:bg-black/30 focus:border-white/10 focus:outline-none transition-all shadow-neu-pressed"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
        {filteredSites.length > 0 ? (
          filteredSites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-white/30 text-[12px]">
            No sites found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

const SiteCard: React.FC<{ site: Site }> = ({ site }) => {
  // Determine Status Color
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Normal': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm';
      case 'Investigating': return 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
      case 'Alert': return 'bg-red-500/10 text-red-400 border-red-500/20 shadow-glow-red';
      default: return 'bg-white/5 text-white/50 border-white/5';
    }
  };

  // Determine Active Line Style
  const isActive = !!site.activeTask;
  const isSweep = isActive && (site.activeTask?.toLowerCase().includes('sweep') || false);

  return (
    <div className="bg-gradient-card border border-white/5 rounded-xl p-4 hover:border-white/10 cursor-pointer transition-all duration-300 group flex flex-col h-full min-h-[140px] shadow-neu-flat hover:-translate-y-1 hover:shadow-neu-hover">

      {/* Top Row: Name + Status */}
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-[16px] font-semibold text-white group-hover:text-white transition-colors leading-tight drop-shadow-sm">
          {site.name}
        </h3>
        <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${getStatusColor(site.status)}`}>
          {site.status}
        </span>
      </div>

      {/* Location */}
      <div className="text-[12px] text-white/40 leading-snug mb-3">
        {site.location}
      </div>

      {/* Middle Block: Drones + Activity */}
      <div className="flex flex-col gap-1 mb-auto">
        {/* Drones */}
        <div className="text-[12px] text-white/70">
          Drones: <span className="text-white">{site.dronesReady} ready</span>
          {site.dronesBusy > 0 && <span className="text-white/50"> / {site.dronesBusy} busy</span>}
        </div>

        {/* Active Task (The Key Field) */}
        <div className="text-[12px] font-medium mt-1 flex items-center gap-1.5">
          {isActive ? (
            <>
              <span className="text-white/50">Active:</span>
              <span className={isSweep ? 'text-blue-400 drop-shadow-sm' : 'text-white'}>
                {site.activeTask}
              </span>
            </>
          ) : (
            <span className="text-white/30">Active: None</span>
          )}
        </div>
      </div>

      {/* Footer: Time + Connection */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-4">
        <span className="text-[12px] text-white/40 font-medium">Last event: {site.lastEvent}</span>

        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${site.connectionState === 'Online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
          <span className="text-[12px] text-white/60 font-medium">{site.connectionState}</span>
        </div>
      </div>
    </div>
  );
};