import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Filter, Download, X, Calendar, ChevronDown, 
  MoreVertical, FileText, CheckCircle2, AlertTriangle, 
  Clock, MapPin, Shield, Video, Camera, Mic, 
  ArrowRight, Check, AlertCircle, ChevronUp, SlidersHorizontal, ArrowUpRight
} from 'lucide-react';

interface EvidenceRepositoryProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCase: (caseId: string) => void;
}

interface RepoCase {
  id: string;
  type: string;
  site: string;
  zone: string;
  status: 'Active' | 'Closed' | 'Escalated' | 'Exported';
  confidence: 'High' | 'Med' | 'Low';
  evidenceCount: number;
  lastActivity: string;
  integrity: 'Verified' | 'Partial' | 'Flagged';
  timestamp: number;
}

const MOCK_REPO_CASES: RepoCase[] = [
  { 
    id: 'INC-938471', type: 'Intrusion Suspected', site: 'Site A', zone: 'Gate 2', 
    status: 'Active', confidence: 'High', evidenceCount: 12, lastActivity: 'Just now', 
    integrity: 'Verified', timestamp: Date.now() 
  },
  { 
    id: 'INC-938468', type: 'Perimeter Warning', site: 'Site C', zone: 'Sector 4', 
    status: 'Closed', confidence: 'Med', evidenceCount: 4, lastActivity: '2h ago', 
    integrity: 'Verified', timestamp: Date.now() - 7200000 
  },
  { 
    id: 'INC-938455', type: 'Vehicle Loitering', site: 'Site A', zone: 'North Wall', 
    status: 'Escalated', confidence: 'High', evidenceCount: 8, lastActivity: '5h ago', 
    integrity: 'Partial', timestamp: Date.now() - 18000000 
  },
  { 
    id: 'INC-938442', type: 'Equipment Check', site: 'Site B', zone: 'Roof', 
    status: 'Exported', confidence: 'Low', evidenceCount: 15, lastActivity: '1d ago', 
    integrity: 'Verified', timestamp: Date.now() - 86400000 
  },
  { 
    id: 'INC-938430', type: 'Motion Detected', site: 'Site A', zone: 'Lobby', 
    status: 'Closed', confidence: 'Low', evidenceCount: 2, lastActivity: '1d ago', 
    integrity: 'Flagged', timestamp: Date.now() - 90000000 
  },
  { 
    id: 'INC-938411', type: 'Unauthorized Access', site: 'Site D', zone: 'Lab 1', 
    status: 'Closed', confidence: 'High', evidenceCount: 24, lastActivity: '2d ago', 
    integrity: 'Verified', timestamp: Date.now() - 172800000 
  },
  { 
    id: 'INC-938399', type: 'System Offline', site: 'Site B', zone: 'Server Room', 
    status: 'Closed', confidence: 'High', evidenceCount: 1, lastActivity: '3d ago', 
    integrity: 'Verified', timestamp: Date.now() - 259200000 
  },
];

export const EvidenceRepository: React.FC<EvidenceRepositoryProps> = ({ isOpen, onClose, onOpenCase }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Needs Review'>('All');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [selectedCaseIds, setSelectedCaseIds] = useState<Set<string>>(new Set());
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportTarget, setExportTarget] = useState<'single' | 'bulk'>('single');
  const [sortMode, setSortMode] = useState('Last activity');

  // Filter State
  const [filters, setFilters] = useState({
      status: [] as string[],
      site: [] as string[],
      integrity: [] as string[]
  });

  // Computed
  const filteredCases = useMemo(() => {
    return MOCK_REPO_CASES.filter(c => {
      // 1. Tab Filter
      if (activeTab === 'Active' && c.status !== 'Active') return false;
      if (activeTab === 'Needs Review' && c.integrity === 'Verified') return false;

      // 2. Search
      if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matches = c.id.toLowerCase().includes(q) || 
                          c.type.toLowerCase().includes(q) || 
                          c.site.toLowerCase().includes(q);
          if (!matches) return false;
      }

      // 3. Detailed Filters (only if expanded/set)
      if (filters.status.length > 0 && !filters.status.includes(c.status)) return false;
      if (filters.site.length > 0 && !filters.site.includes(c.site)) return false;
      if (filters.integrity.length > 0 && !filters.integrity.includes(c.integrity)) return false;

      return true;
    });
  }, [searchQuery, activeTab, filters]);

  // Handlers
  const toggleSelection = (id: string) => {
      const newSet = new Set(selectedCaseIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedCaseIds(newSet);
  };

  const toggleAllSelection = () => {
      if (selectedCaseIds.size === filteredCases.length) {
          setSelectedCaseIds(new Set());
      } else {
          setSelectedCaseIds(new Set(filteredCases.map(c => c.id)));
      }
  };

  const handleFilterToggle = (category: keyof typeof filters, value: string) => {
      setFilters(prev => {
          const current = prev[category];
          const updated = current.includes(value) 
            ? current.filter(item => item !== value)
            : [...current, value];
          return { ...prev, [category]: updated };
      });
  };

  const clearFilters = () => {
      setFilters({ status: [], site: [], integrity: [] });
  };

  const activeFilterCount = filters.status.length + filters.site.length + filters.integrity.length;

  // -- Render Helpers --
  
  const IntegrityBadge = ({ status }: { status: string }) => {
      if (status === 'Verified') return (
          <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-medium">
              <CheckCircle2 size={10} /> Verified
          </span>
      );
      if (status === 'Partial') return (
          <span className="flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 font-medium">
              <AlertTriangle size={10} /> Partial
          </span>
      );
      return (
          <span className="flex items-center gap-1 text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20 font-medium">
              <AlertCircle size={10} /> Flagged
          </span>
      );
  };

  if (!isOpen) return null;

  return (
    <div 
        className={`
            fixed top-[88px] bottom-[24px] right-[24px] w-[500px] bg-surface border border-white/5 rounded-xl z-50 shadow-2xl flex flex-col overflow-hidden
            animate-in slide-in-from-right-4 fade-in duration-300
        `}
    >
      {/* A) Drawer Header */}
      <div className="h-[72px] px-6 flex items-center justify-between border-b border-white/5 shrink-0 bg-surface/50 backdrop-blur-md">
        <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3">
               <Shield size={18} className="text-blue-400" />
               <h1 className="text-[16px] font-semibold text-white">Evidence Repository</h1>
            </div>
            <div className="text-[11px] text-white/50 mt-1 flex items-center gap-2">
                <span>Master Library</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>{MOCK_REPO_CASES.length} cases</span>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => { setExportTarget('bulk'); setShowExportModal(true); }}
                className="h-8 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[12px] text-white font-medium flex items-center gap-2 transition-colors"
            >
                <Download size={14} />
                Bulk Export
            </button>
            <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
                <X size={18} />
            </button>
        </div>
      </div>

      {/* B) Search & Controls (Sticky) */}
      <div className="p-4 border-b border-white/5 space-y-3 bg-surface/80 backdrop-blur-md z-20">
          <div className="flex gap-2">
              <div className="relative flex-1 group">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/60 transition-colors" />
                  <input 
                      type="text" 
                      placeholder="Search cases by ID, site, or tag..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 bg-black/20 border border-white/10 rounded-lg pl-9 pr-3 text-[13px] text-white placeholder:text-white/30 focus:border-white/20 focus:bg-white/10 outline-none transition-all shadow-neu-pressed"
                  />
              </div>
              
              <div className="relative w-[140px]">
                  <select 
                     className="w-full h-9 bg-black/20 border border-white/10 rounded-lg pl-3 pr-8 text-[12px] text-white outline-none appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                  >
                      <option>Last 7 days</option>
                      <option>Last 24 hours</option>
                      <option>Last 30 days</option>
                      <option>Custom range</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              </div>
          </div>

          <div className="flex items-center justify-between">
              {/* Tabs */}
              <div className="flex gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
                  {(['All', 'Active', 'Needs Review'] as const).map(tab => (
                      <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`
                              px-3 py-1 rounded text-[11px] font-medium transition-all
                              ${activeTab === tab ? 'bg-surface text-white shadow-sm border border-white/10' : 'text-white/40 hover:text-white/70'}
                          `}
                      >
                          {tab === 'All' ? 'All Cases' : tab}
                      </button>
                  ))}
              </div>

              <div className="flex items-center gap-2">
                  <div className="relative group">
                       <button className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white transition-colors">
                           Sort: <span className="text-white">{sortMode}</span> <ChevronDown size={10} />
                       </button>
                  </div>
                  
                  <div className="w-px h-3 bg-white/10" />

                  <button 
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${isFilterExpanded || activeFilterCount > 0 ? 'text-blue-400 bg-blue-500/10' : 'text-white/40 hover:text-white'}`}
                  >
                      <Filter size={12} />
                      <span className="text-[11px] font-medium">Filter {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
                      {isFilterExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                  </button>
              </div>
          </div>
      </div>

      {/* C) Expandable Filters */}
      {isFilterExpanded && (
          <div className="p-4 border-b border-white/5 bg-surface/30 animate-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Active Filters</span>
                  <button onClick={clearFilters} className="text-[11px] text-blue-400 hover:text-blue-300">Clear all</button>
              </div>
              
              <div className="space-y-3">
                  {/* Row 1: Status */}
                  <div className="flex items-center gap-2">
                      <span className="text-[12px] text-white/60 w-[60px]">Status:</span>
                      <div className="flex gap-1.5 flex-wrap">
                          {['Active', 'Closed', 'Escalated'].map(opt => (
                              <button 
                                key={opt}
                                onClick={() => handleFilterToggle('status', opt)}
                                className={`px-2.5 py-0.5 rounded border text-[11px] transition-colors ${filters.status.includes(opt) ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'}`}
                              >
                                  {opt}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Row 2: Integrity */}
                  <div className="flex items-center gap-2">
                      <span className="text-[12px] text-white/60 w-[60px]">Integrity:</span>
                      <div className="flex gap-1.5 flex-wrap">
                          {['Verified', 'Partial', 'Flagged'].map(opt => (
                              <button 
                                key={opt}
                                onClick={() => handleFilterToggle('integrity', opt)}
                                className={`px-2.5 py-0.5 rounded border text-[11px] transition-colors ${filters.integrity.includes(opt) ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'}`}
                              >
                                  {opt}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Row 3: Site */}
                  <div className="flex items-center gap-2">
                      <span className="text-[12px] text-white/60 w-[60px]">Site:</span>
                      <div className="flex gap-1.5 flex-wrap">
                          {['Site A', 'Site B', 'Site C', 'Site D'].map(opt => (
                              <button 
                                key={opt}
                                onClick={() => handleFilterToggle('site', opt)}
                                className={`px-2.5 py-0.5 rounded border text-[11px] transition-colors ${filters.site.includes(opt) ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'}`}
                              >
                                  {opt}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* D) List View */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-black/20 p-2 space-y-1">
          {filteredCases.length > 0 ? (
              filteredCases.map((c) => {
                  const isSelected = selectedCaseIds.has(c.id);
                  return (
                      <div 
                        key={c.id}
                        className={`
                            group flex items-start gap-3 p-3 rounded-lg border transition-all duration-200
                            ${isSelected ? 'bg-blue-500/5 border-blue-500/20' : 'bg-surface border-white/5 hover:bg-white/5 hover:border-white/10'}
                        `}
                      >
                          {/* Selection */}
                          <div className="pt-1">
                              <button 
                                onClick={() => toggleSelection(c.id)}
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-white/20 group-hover:border-white/40'}`}
                              >
                                  {isSelected && <Check size={10} className="text-white" />}
                              </button>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                  <div className="flex items-center gap-2">
                                      <span className="text-[13px] font-bold text-white tracking-tight">{c.id}</span>
                                      <span className="text-[13px] text-white/80 truncate">{c.type}</span>
                                  </div>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-[11px] text-white/50">
                                  <span>{c.site}</span>
                                  <span className="text-white/20">•</span>
                                  <span>{c.zone}</span>
                                  <div className="flex items-center gap-2 ml-1">
                                      <span className={`px-1.5 rounded uppercase font-bold tracking-wider text-[9px] border ${c.status === 'Active' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-white/40 bg-white/5 border-white/10'}`}>
                                          {c.status}
                                      </span>
                                      <IntegrityBadge status={c.integrity} />
                                  </div>
                              </div>

                              <div className="flex items-center justify-between mt-2.5">
                                   <div className="flex items-center gap-3 text-[10px] text-white/40">
                                       <span className="flex items-center gap-1"><FileText size={10} /> {c.evidenceCount} items</span>
                                       <span className="flex items-center gap-1"><Clock size={10} /> {c.lastActivity}</span>
                                   </div>
                                   
                                   {/* Quick Actions */}
                                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button 
                                         onClick={() => { setExportTarget('single'); setShowExportModal(true); }}
                                         className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white" title="Export Case"
                                       >
                                           <Download size={14} />
                                       </button>
                                       <button 
                                         onClick={() => onOpenCase(c.id)}
                                         className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white" title="Open Case File"
                                       >
                                           <ArrowUpRight size={14} />
                                       </button>
                                   </div>
                              </div>
                          </div>
                      </div>
                  );
              })
          ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-white/30">
                  <Search size={24} className="mb-3 opacity-50" />
                  <p className="text-[13px]">No cases match your filters.</p>
                  <button onClick={clearFilters} className="mt-2 text-[12px] text-blue-400 hover:text-blue-300">Clear filters</button>
              </div>
          )}
      </div>

      {/* E) Sticky Bulk Action Bar */}
      {selectedCaseIds.size > 0 && (
          <div className="p-3 border-t border-white/10 bg-surface z-30 animate-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <span className="text-[12px] text-white font-medium">{selectedCaseIds.size} selected</span>
                      <button onClick={toggleAllSelection} className="text-[11px] text-white/40 hover:text-white">
                          {selectedCaseIds.size === filteredCases.length ? 'Deselect all' : 'Select all'}
                      </button>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={() => setSelectedCaseIds(new Set())} className="px-3 py-1.5 rounded-lg border border-white/10 text-[12px] text-white/60 hover:bg-white/5">
                          Cancel
                      </button>
                      <button 
                          onClick={() => { setExportTarget('bulk'); setShowExportModal(true); }}
                          className="px-4 py-1.5 rounded-lg bg-white text-app text-[12px] font-bold hover:bg-white/90 flex items-center gap-2"
                      >
                          <Download size={12} />
                          Export Selected
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* F) Export Modal Overlay */}
      {showExportModal && (
          <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
              <div className="bg-surface border border-white/10 rounded-xl w-full max-w-[320px] shadow-2xl bg-gradient-surface">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center">
                      <h3 className="text-[14px] font-semibold text-white">
                          {exportTarget === 'single' ? 'Export Case Package' : `Export ${selectedCaseIds.size} Cases`}
                      </h3>
                      <button onClick={() => setShowExportModal(false)}><X size={14} className="text-white/40 hover:text-white" /></button>
                  </div>
                  <div className="p-4 space-y-4">
                      {/* Name (Auto) */}
                      <div>
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5 block">Package Name</label>
                          <div className="text-[12px] font-mono text-white/70 bg-black/20 p-2 rounded border border-white/5 truncate">
                              {exportTarget === 'single' ? 'INC-938471_Evidence_2025-01-08' : `Bulk_Export_${selectedCaseIds.size}_Items_2025`}
                          </div>
                      </div>
                      
                      {/* Toggles */}
                      <div>
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2 block">Include</label>
                          <div className="space-y-2">
                              {['Media (Video/Photo)', 'Notes & Logs', 'Chain of Custody Report', 'Manifest Hash'].map(item => (
                                  <label key={item} className="flex items-center gap-2 cursor-pointer group">
                                      <div className="w-3.5 h-3.5 rounded border border-blue-500 bg-blue-500 flex items-center justify-center">
                                          <Check size={10} className="text-white" />
                                      </div>
                                      <span className="text-[12px] text-white/80 group-hover:text-white">{item}</span>
                                  </label>
                              ))}
                          </div>
                      </div>
                      
                      {/* Action */}
                      <button 
                        onClick={() => { setShowExportModal(false); setSelectedCaseIds(new Set()); }}
                        className="w-full h-9 rounded-lg bg-blue-600 text-white text-[12px] font-bold hover:bg-blue-500 shadow-glow-blue flex items-center justify-center gap-2 mt-2"
                      >
                          <Download size={12} />
                          {exportTarget === 'single' ? 'Download Package (145 MB)' : 'Start Bulk Export'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};