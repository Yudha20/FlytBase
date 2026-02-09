import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ArrowUp, Search, Check, Loader2, LayoutGrid, X, Pencil } from 'lucide-react';
import { Site } from '../types';

// Mock Data
const MOCK_SITES: Site[] = [
  {
    id: '1', name: 'Site A', location: 'Uttar Pradesh',
    dronesReady: 3, dronesBusy: 0, lastEvent: '12m ago',
    status: 'Normal', activeTask: null, connectionState: 'Online'
  },
  {
    id: '2', name: 'Site B', location: 'Karnataka',
    dronesReady: 0, dronesBusy: 1, lastEvent: '2m ago',
    status: 'Investigating', activeTask: 'Sweep running', connectionState: 'Online'
  },
  {
    id: '3', name: 'Site C', location: 'Maharashtra',
    dronesReady: 2, dronesBusy: 0, lastEvent: '2h ago',
    status: 'Normal', activeTask: null, connectionState: 'Online'
  },
];

const QUICK_ACTIONS = [
  "Run quick sweep",
  "Review last incident",
  "Status check",
  "Export report",
  "Deploy drone"
];

const HELPER_TEMPLATES = [
  "Run quick sweep on Site A",
  "Status check across All sites",
  "Review last incident",
  "Open activity log for INC-..."
];

interface CommandBarProps {
  onCommandSent: (cmd: string) => void;
}

export const CommandBar: React.FC<CommandBarProps> = ({ onCommandSent }) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [scope, setScope] = useState<Site | null>(null); // null = "All sites"

  // Execution & Review State
  const [isReviewing, setIsReviewing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);

  // Dropdown states
  const [isScopeOpen, setIsScopeOpen] = useState(false);
  const [isAtMenuOpen, setIsAtMenuOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const scopeRef = useRef<HTMLDivElement>(null);
  const atMenuRef = useRef<HTMLDivElement>(null);

  // Filter sites based on query
  const filteredSites = useMemo(() => {
    if (!searchQuery) return MOCK_SITES;
    const q = searchQuery.toLowerCase();
    return MOCK_SITES.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const showAllSitesOption = searchQuery === '';

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (scopeRef.current && !scopeRef.current.contains(event.target as Node)) {
        setIsScopeOpen(false);
      }
      if (atMenuRef.current && !atMenuRef.current.contains(event.target as Node)) {
        setIsAtMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (inputValue.length > 0 || isExecuting || isReviewing || isFocused) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % HELPER_TEMPLATES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [inputValue, isExecuting, isReviewing, isFocused]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [isAtMenuOpen, isScopeOpen, searchQuery]);

  const handleScopeSelect = (site: Site | null) => {
    setScope(site);
    setIsScopeOpen(false);
    setIsAtMenuOpen(false);
    setSearchQuery('');

    if (isAtMenuOpen || inputValue.includes('@')) {
      const lastAtIndex = inputValue.lastIndexOf('@');
      if (lastAtIndex !== -1) {
        setInputValue(inputValue.substring(0, lastAtIndex).trim());
      }
    }
    inputRef.current?.focus();
  };

  const handleChipClick = (action: string) => {
    const cmd = `${action}`;
    setInputValue(cmd);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    const lastAtIndex = val.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const query = val.slice(lastAtIndex + 1);
      setSearchQuery(query);
      setIsAtMenuOpen(true);
      setIsScopeOpen(false);
    } else {
      if (isAtMenuOpen) setIsAtMenuOpen(false);
      setSearchQuery('');
    }
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    setIsReviewing(true);
  };

  const handleConfirm = () => {
    setIsReviewing(false);
    setIsExecuting(true);
    setExecutionStep(0);

    setTimeout(() => setExecutionStep(1), 800);
    setTimeout(() => setExecutionStep(2), 2200);
    setTimeout(() => setExecutionStep(3), 3500);
    setTimeout(() => {
      setIsExecuting(false);
      const finalCmd = scope ? `${inputValue} on ${scope.name}` : inputValue;
      onCommandSent(finalCmd);
      setInputValue('');
    }, 4500);
  };

  const handleCancel = () => {
    setIsReviewing(false);
    setInputValue('');
    if (scope) setScope(null);
    inputRef.current?.focus();
  };

  const handleEdit = () => {
    setIsReviewing(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const performSelection = () => {
    if (showAllSitesOption) {
      if (selectedIndex === 0) {
        handleScopeSelect(null);
      } else {
        const site = filteredSites[selectedIndex - 1];
        if (site) handleScopeSelect(site);
      }
    } else {
      const site = filteredSites[selectedIndex];
      if (site) handleScopeSelect(site);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isReviewing) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
      return;
    }

    if (isAtMenuOpen || isScopeOpen) {
      const listLength = filteredSites.length;
      const totalOptions = showAllSitesOption ? listLength + 1 : listLength;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalOptions);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalOptions) % totalOptions);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (totalOptions > 0) performSelection();
      } else if (e.key === 'Escape') {
        setIsAtMenuOpen(false);
        setIsScopeOpen(false);
      }
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }

    if (e.key === 'Backspace' && inputValue === '' && scope) {
      setScope(null);
    }
  };

  const isTyping = inputValue.length > 0;
  const isActive = isTyping || isFocused || isAtMenuOpen || isExecuting || isScopeOpen || isReviewing;
  const currentScopeName = scope ? scope.name : "All sites";

  // Unified List Renderer
  const renderSiteList = () => (
    <div className="flex flex-col gap-1 py-1">
      <div className="px-3 py-1.5 text-[12px] font-bold text-white/30 uppercase tracking-wider flex justify-between items-center">
        <span>Select Scope</span>
        {!showAllSitesOption && <span className="text-white/20">{filteredSites.length} found</span>}
      </div>

      {showAllSitesOption && (
        <button
          onClick={() => handleScopeSelect(null)}
          className={`
                    mx-1 px-3 py-2 rounded-lg transition-all group text-left flex items-center justify-between
                    ${selectedIndex === 0 ? 'bg-white/10 text-white shadow-inner' : 'text-white/70 hover:bg-white/5 hover:text-white'}
                `}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!scope ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/40'}`}>
              <LayoutGrid size={14} />
            </div>
            <div>
              <div className="text-[12px] font-medium leading-tight">All sites</div>
              <div className="text-[12px] text-white/40 leading-tight mt-0.5">Global scope</div>
            </div>
          </div>
          {!scope && <Check size={14} className="text-blue-400" />}
        </button>
      )}

      {showAllSitesOption && filteredSites.length > 0 && <div className="my-1 h-px bg-white/5 mx-2" />}

      {filteredSites.length > 0 ? (
        filteredSites.map((site, idx) => {
          const listIndex = showAllSitesOption ? idx + 1 : idx;
          const isSelected = scope?.id === site.id;
          const isHighlighted = selectedIndex === listIndex;

          return (
            <button
              key={site.id}
              onClick={() => handleScopeSelect(site)}
              className={`
                            mx-1 px-3 py-2 rounded-lg transition-all group text-left flex items-center justify-between
                            ${isHighlighted ? 'bg-white/10 text-white shadow-inner' : 'text-white/70 hover:bg-white/5'}
                        `}
            >
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full mt-0.5 shrink-0 ${site.status === 'Alert' ? 'bg-red-500' : site.status === 'Investigating' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <div>
                  <div className={`text-[12px] font-medium leading-tight ${isSelected || isHighlighted ? 'text-blue-400' : 'text-white'}`}>
                    {site.name}
                  </div>
                  <div className="text-[12px] text-white/50 leading-tight mt-0.5">{site.location}</div>
                </div>
              </div>
              {isSelected && <Check size={14} className="text-blue-400" />}
            </button>
          );
        })
      ) : (
        <div className="px-4 py-3 text-[12px] text-white/30 italic text-center">No sites found</div>
      )}
    </div>
  );

  const ExecutionStepper = () => (
    <div className="px-4 pb-4 pt-1 flex flex-col gap-0 animate-in fade-in slide-in-from-top-2">
      <div className="w-full h-px bg-white/5 mb-4" />
      {[
        { title: "Sweep queued", sub: `Site A • System • ${new Date().toLocaleTimeString()}`, status: "SUCCESS" },
        { title: "Drone assigned", sub: "Drone 2 • Battery 78% • Link good", status: "SUCCESS" },
        { title: "Sweep launched", sub: "T+00:00", status: "RUNNING" },
        { title: "Sweep in progress", sub: "ETA 45s", status: "QUEUED" },
      ].map((step, idx) => (
        <div key={idx} className="flex gap-4 min-h-[40px] relative">
          <div className="flex flex-col items-center w-4">
            <div className={`w-2 h-2 rounded-full mt-1.5 z-10 transition-colors duration-300 ${idx < executionStep ? 'bg-blue-500' : idx === executionStep ? 'bg-blue-400 animate-pulse' : 'bg-white/10'}`} />
            {idx !== 3 && <div className="w-px h-full bg-white/5 absolute top-3.5 left-2 -translate-x-1/2" />}
          </div>
          <div className={`flex-1 flex justify-between pb-4 transition-opacity duration-300 ${idx > executionStep ? 'opacity-30' : 'opacity-100'}`}>
            <div>
              <div className="text-[12px] font-medium text-white">{step.title}</div>
              <div className="text-[12px] text-white/40 mt-0.5">{step.sub}</div>
            </div>
            <div>
              {idx < executionStep && <span className="text-[12px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold tracking-wider shadow-sm">DONE</span>}
              {idx === executionStep && <span className="text-[12px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-bold tracking-wider flex items-center gap-1 shadow-glow-blue"><Loader2 size={8} className="animate-spin" /> RUNNING</span>}
              {idx > executionStep && <span className="text-[12px] bg-white/5 text-white/30 px-1.5 py-0.5 rounded font-bold tracking-wider">QUEUED</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative w-full rounded-xl flex flex-col transition-all duration-300 bg-surface 
        border border-subtle shadow-neu-flat pb-0
        ${isActive ? 'shadow-glow-blue border-blue-500/30' : 'hover:border-white/10'}
      `}
    >
      {isActive && (
        <svg className="absolute inset-0 w-full h-full rotate-180 pointer-events-none z-0 rounded-xl" fill="none">
          <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="11" stroke="#3B82F6" strokeWidth="1.5" pathLength="100" strokeDasharray="100" strokeDashoffset="100" className="animate-draw opacity-80" />
        </svg>
      )}

      <div className="p-4 flex flex-col gap-3 relative z-10 bg-gradient-card rounded-xl">
        <div className="relative flex items-center justify-start z-30" ref={scopeRef}>
          <button
            onClick={() => { if (!isExecuting && !isReviewing) { setIsScopeOpen(!isScopeOpen); setIsAtMenuOpen(false); setSearchQuery(''); } }}
            className={`
                    h-[28px] rounded-full px-3 border transition-all flex items-center gap-2 text-[12px] font-medium shadow-neu-flat hover:shadow-neu-hover
                    ${isScopeOpen || scope ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-glow-blue' : 'bg-surface border-subtle text-white/72 hover:bg-surface-hover hover:text-white'}
                    ${(isExecuting || isReviewing) ? 'opacity-50 cursor-not-allowed' : ''}
                `}
          >
            Scope: <span>{currentScopeName}</span>
          </button>
          {isScopeOpen && (
            <div className="absolute top-[36px] left-0 w-[300px] bg-surface border border-white/10 rounded-xl shadow-2xl z-[60] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-left bg-gradient-surface shadow-neu-hover">
              <div className="p-2 border-b border-white/5">
                <div className="flex items-center bg-black/30 rounded-lg px-2 h-8 border border-white/5 focus-within:border-white/20 transition-colors shadow-inner">
                  <Search size={14} className="text-white/50 mr-2 shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search sites..."
                    className="bg-transparent border-none outline-none text-[12px] text-white w-full placeholder:text-white/30 h-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
              <div className="max-h-[280px] overflow-y-auto p-1 custom-scrollbar">
                {renderSiteList()}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-1 relative h-10 w-full z-20" ref={atMenuRef}>
          {scope && (
            <button
              onClick={() => { if (!isExecuting && !isReviewing) { setIsScopeOpen(!isScopeOpen); setIsAtMenuOpen(false); } }}
              className="shrink-0 text-[16px] text-blue-400 font-medium hover:text-blue-300 transition-colors mr-1 cursor-pointer"
            >
              {scope.name}
            </button>
          )}

          <div className="relative flex-grow h-full flex items-center group">
            {!inputValue && !isExecuting && !isReviewing && (
              <div className="absolute inset-0 flex items-center pointer-events-none text-[16px] text-white/30">
                <span key={placeholderIndex} className="animate-fade-in-out-up">{HELPER_TEMPLATES[placeholderIndex]}</span>
              </div>
            )}

            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              disabled={isExecuting || isReviewing}
              className="w-full bg-transparent border-none outline-none text-[16px] text-white h-full relative z-10 disabled:opacity-80 disabled:cursor-not-allowed"
              autoComplete="off"
            />

            {isAtMenuOpen && !isExecuting && !isReviewing && (
              <div className="absolute top-[40px] left-0 w-[300px] bg-surface border border-white/10 rounded-xl shadow-2xl z-[60] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-left bg-gradient-surface shadow-neu-hover">
                <div className="max-h-[280px] overflow-y-auto p-1 custom-scrollbar">
                  {renderSiteList()}
                </div>
              </div>
            )}

            {!inputValue && !isExecuting && !isReviewing && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-200 flex items-center justify-center">
                <div className="w-8 h-8 flex items-center justify-center text-[14px] text-white/30">/</div>
              </div>
            )}
          </div>

          <div className="relative group/submit flex items-center">
            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isExecuting || isReviewing}
              className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 shadow-neu-flat
                    ${inputValue.trim() && !isExecuting && !isReviewing ? 'bg-gradient-blue hover:opacity-90 shadow-glow-blue' : 'bg-surface cursor-not-allowed opacity-50'}
                `}
            >
              {isExecuting ? <Loader2 size={16} className="text-white animate-spin" /> : <ArrowUp size={16} className="text-white opacity-100" />}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions - Floating Row (No Sticky Label) */}
      {!isExecuting && !isReviewing && (
        <div className="relative w-full overflow-hidden h-[44px]">
          {/* Scrolling Chips Container */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar mask-linear-fade h-full px-4">
            {QUICK_ACTIONS.map((action) => (
              <button key={action} onClick={() => handleChipClick(action)} className="h-[26px] px-3 rounded-full bg-surface border border-white/5 hover:border-white/20 hover:bg-white/5 text-[12px] text-white/70 hover:text-white transition-all whitespace-nowrap shrink-0 shadow-neu-flat hover:shadow-neu-hover">
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {isReviewing && (
        <div className="px-4 pb-4 pt-1 flex flex-col gap-0 animate-in fade-in slide-in-from-top-2">
          <div className="w-full h-px bg-white/5 mb-4" />

          <div className="mb-6 pl-1">
            <div className="text-[12px] font-bold text-white/40 uppercase tracking-wider mb-3">Execution Plan</div>
            <div className="space-y-3 border-l border-white/10 pl-4 ml-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 shadow-glow-blue" />
                <span className="text-[12px] text-white/80">Queue sweep sequence</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 shadow-glow-blue" />
                <span className="text-[12px] text-white/80">Assign available drone</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 shadow-glow-blue" />
                <span className="text-[12px] text-white/80">Launch and monitor</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleCancel}
              className="text-[12px] font-medium text-white/40 hover:text-white transition-colors px-2 py-1.5 flex items-center gap-1.5"
            >
              <X size={14} />
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="text-[12px] font-medium text-white/60 hover:text-white transition-colors px-3 py-1.5 flex items-center gap-1.5 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 shadow-sm"
              >
                <Pencil size={13} />
                Edit
              </button>
              <button
                onClick={handleConfirm}
                className="bg-gradient-blue hover:opacity-90 text-white text-[12px] font-semibold px-4 py-1.5 rounded-lg shadow-glow-blue transition-all flex items-center gap-1.5 border border-blue-400/20"
              >
                <Check size={14} strokeWidth={3} />
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {isExecuting && <ExecutionStepper />}
    </div>
  );
};