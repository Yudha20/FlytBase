import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, ChevronRight, Clock } from 'lucide-react';
import { LogEntry } from '../types';

interface ActivityLogDrawerProps {
  logs: LogEntry[];
  isOpen: boolean;
  onClose: () => void;
  initialFilter: { query?: string } | null;
}

export const ActivityLogDrawer: React.FC<ActivityLogDrawerProps> = ({ logs, isOpen, onClose, initialFilter }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Apply Deep Link Filters
  useEffect(() => {
    if (isOpen) {
      if (initialFilter?.query) setSearchQuery(initialFilter.query);
    } else {
        setSearchQuery('');
    }
  }, [isOpen, initialFilter]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches = 
          log.action.toLowerCase().includes(query) ||
          log.site.toLowerCase().includes(query) ||
          log.details.toLowerCase().includes(query) ||
          (log.incidentId && log.incidentId.toLowerCase().includes(query)) ||
          (log.asset && log.asset.toLowerCase().includes(query));
        if (!matches) return false;
      }
      return true;
    });
  }, [logs, searchQuery]);

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getRelativeTime = (log: LogEntry) => {
    if (!log.incidentStartTime) return null;
    const diff = Math.floor((log.timestamp - log.incidentStartTime) / 1000);
    const sign = diff >= 0 ? '+' : '-';
    const absDiff = Math.abs(diff);
    const mins = Math.floor(absDiff / 60).toString().padStart(2, '0');
    const secs = (absDiff % 60).toString().padStart(2, '0');
    return `T${sign}${mins}:${secs}`;
  };

  return (
    <div 
        className={`
            fixed top-[88px] bottom-[24px] w-[440px] bg-surface border border-white/5 rounded-xl z-50 flex flex-col overflow-hidden shadow-2xl
            transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        `}
        style={{
            left: isOpen ? '24px' : '-460px', 
            opacity: isOpen ? 1 : 0
        }}
    >
        {/* Header */}
        <div className="h-[72px] px-6 flex items-center justify-between border-b border-white/5 bg-surface shrink-0">
            <div className="flex items-center gap-3">
                <Clock size={18} className="text-white/70" />
                <h2 className="text-[16px] font-semibold text-white">Activity Log</h2>
            </div>
            <button 
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
                <X size={18} />
            </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/5 bg-surface/50 backdrop-blur-sm">
            <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input 
                    type="text" 
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 bg-white/5 border border-white/5 rounded-lg pl-9 pr-3 text-[13px] text-white placeholder:text-white/30 focus:border-white/20 focus:bg-white/10 outline-none transition-all"
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>
        </div>

        {/* Log List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-0">
            {filteredLogs.length > 0 ? (
                <div className="flex flex-col">
                    {filteredLogs.map((log) => {
                        const isExpanded = expandedLogId === log.id;
                        const relTime = getRelativeTime(log);

                        return (
                            <div 
                                key={log.id} 
                                className={`border-b border-white/5 transition-colors ${isExpanded ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
                            >
                                {/* Row Header */}
                                <button 
                                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                    className="w-full flex items-start gap-3 p-4 text-left"
                                >
                                    {/* Left: Time Metadata */}
                                    <div className="flex flex-col items-end shrink-0 w-[70px] pt-0.5">
                                        <span className="text-[13px] font-mono text-white/60">{formatTime(log.timestamp)}</span>
                                        {relTime && <span className="text-[10px] font-mono text-blue-400 font-medium">{relTime}</span>}
                                    </div>
                                    
                                    {/* Right: Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-[13px] font-bold text-white truncate">{log.action}</span>
                                            {log.result !== 'INFO' && (
                                                <span className={`text-[9px] px-1 rounded uppercase font-bold tracking-wider ${log.result === 'SUCCESS' ? 'text-emerald-400' : 'text-white/50'}`}>
                                                    ({log.result})
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[12px] text-white/50">
                                            <span>{log.site}</span>
                                            {log.asset && (
                                                <>
                                                    <span className="text-white/20">•</span>
                                                    <span>{log.asset}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className={`mt-1 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-white' : 'text-white/20'}`}>
                                        <ChevronRight size={14} />
                                    </div>
                                </button>

                                {/* Expanded Details */}
                                <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isExpanded ? 'max-h-[300px]' : 'max-h-0'}`}>
                                    <div className="px-4 pb-4 pl-[98px]">
                                        <div className="p-3 bg-black/20 rounded-lg border border-white/5 space-y-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <div className="text-[10px] uppercase tracking-wider text-white/30 font-bold mb-1">Actor</div>
                                                    <div className="text-[12px] text-white">{log.actor}</div>
                                                </div>
                                                {log.incidentId && (
                                                    <div>
                                                        <div className="text-[10px] uppercase tracking-wider text-white/30 font-bold mb-1">Incident ID</div>
                                                        <div className="text-[12px] text-blue-300 font-mono">{log.incidentId}</div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-white/30 font-bold mb-1">Details</div>
                                                <div className="text-[12px] text-white/80 leading-relaxed">{log.details}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-white/30">
                    <Search size={24} className="mb-3 opacity-50" />
                    <p className="text-[13px]">No activity logs found</p>
                </div>
            )}
        </div>
    </div>
  );
};