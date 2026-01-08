import React from 'react';
import { User, RefreshCw, Bell, Clock, FolderOpen } from 'lucide-react';

interface TopBarProps {
  onSync: () => void;
  isSyncing: boolean;
  onAlertIconClick: () => void;
  onOpenActivityLog: () => void;
  onOpenEvidenceLog: () => void;
  alertCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({ onSync, isSyncing, onAlertIconClick, onOpenActivityLog, onOpenEvidenceLog, alertCount }) => {
  return (
    <header className="w-full h-16 bg-app/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5 px-8 flex items-center justify-between shadow-neu-flat">
      <div className="flex items-center gap-3">
        <span className="text-white text-[16px] font-semibold tracking-tight drop-shadow-sm">
          FlytBase Ops Console
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
            
            <div className="relative group">
            <button 
                onClick={onOpenEvidenceLog}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface border border-white/5 hover:bg-surface-hover hover:border-white/10 transition-all duration-200 shadow-neu-flat hover:shadow-neu-hover active:shadow-neu-pressed"
                aria-label="Evidence Log"
            >
                <FolderOpen size={18} className="text-white/72 group-hover:text-white transition-colors" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-surface border border-white/10 rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                <span className="text-[12px] text-white font-medium">Evidence Log</span>
            </div>
            </div>

            <div className="relative group">
            <button 
                onClick={onOpenActivityLog}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface border border-white/5 hover:bg-surface-hover hover:border-white/10 transition-all duration-200 shadow-neu-flat hover:shadow-neu-hover active:shadow-neu-pressed"
                aria-label="Activity Log"
            >
                <Clock size={18} className="text-white/72 group-hover:text-white transition-colors" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-surface border border-white/10 rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                <span className="text-[12px] text-white font-medium">Activity Log</span>
            </div>
            </div>

            <div className="relative group">
            <button 
                onClick={onAlertIconClick}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface border border-white/5 hover:bg-surface-hover hover:border-white/10 transition-all duration-200 relative shadow-neu-flat hover:shadow-neu-hover active:shadow-neu-pressed"
                aria-label="Alerts"
            >
                <Bell size={18} className="text-white/72 group-hover:text-white transition-colors" />
                {alertCount > 0 && (
                    <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full shadow-sm ring-2 ring-surface" />
                )}
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-surface border border-white/10 rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                <span className="text-[12px] text-white font-medium">Alerts {alertCount > 0 ? `(${alertCount})` : ''}</span>
            </div>
            </div>
            
            <div className="relative group">
            <button 
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface border border-white/5 hover:bg-surface-hover hover:border-white/10 transition-all duration-200 shadow-neu-flat hover:shadow-neu-hover active:shadow-neu-pressed"
                aria-label="Profile"
            >
                <User size={18} className="text-white/72 group-hover:text-white transition-colors" />
            </button>
            </div>
        </div>
      </div>
    </header>
  );
};