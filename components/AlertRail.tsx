import React from 'react';
import { Alert } from '../types';
import { X } from 'lucide-react';

interface AlertRailProps {
  alerts: Alert[];
  selectedAlertId: string | null;
  onSelectAlert: (id: string) => void;
  onClose: () => void;
  isOpen: boolean;
  isDrawerOpen: boolean;
}

export const AlertRail: React.FC<AlertRailProps> = ({ alerts, selectedAlertId, onSelectAlert, onClose, isOpen, isDrawerOpen }) => {
  if (alerts.length === 0) return null;

  // Positioning Logic: Consistent margins
  const rightPosition = isDrawerOpen ? '500px' : '24px';

  return (
    <div
      className={`
        fixed top-[88px] bottom-[24px] w-[320px] bg-surface border border-white/5 rounded-xl z-30 shadow-neu-flat
        transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col overflow-hidden
      `}
      style={{
        right: isOpen ? rightPosition : '-340px',
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? 'translateX(0)' : 'translateX(20px)'
      }}
    >
      {/* Header */}
      <div className="h-[72px] px-6 flex items-center justify-between border-b border-white/5 shrink-0 bg-surface/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-[16px] font-semibold text-white">Alerts</span>
          <span className="bg-black/30 text-white text-[12px] font-bold px-2 py-0.5 rounded-full shadow-inner">{alerts.length}</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar">
        {alerts.map((alert) => {
          const isSelected = selectedAlertId === alert.id;
          const isUnreviewed = alert.status === 'Unreviewed';

          const statusStyles = isUnreviewed
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-sm'
            : 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-glow-blue';

          const activeBarColor = isUnreviewed ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-blue-500 shadow-glow-blue';

          // Conditional Selection Style (No Gradient)
          const cardClasses = isSelected
            ? 'bg-white/5 border-white/10'
            : 'bg-surface border-transparent hover:bg-white/5 hover:border-white/5';

          return (
            <button
              key={alert.id}
              onClick={() => onSelectAlert(alert.id)}
              className={`
                        w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden
                        flex flex-col gap-2 shadow-sm
                        ${cardClasses}
                    `}
            >
              {/* Active Indicator Bar */}
              {isSelected && <div className={`absolute left-0 top-0 bottom-0 w-1 ${activeBarColor}`} />}

              <div className="flex items-center justify-between w-full pl-1">
                <span className={`text-[16px] font-semibold leading-none truncate pr-2 drop-shadow-sm ${isSelected ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>{alert.type}</span>
                {alert.severity === 'High' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 shadow-glow-red" />}
              </div>

              <div className="text-[12px] text-white/50 pl-1 group-hover:text-white/70 transition-colors">
                {alert.site}
              </div>

              <div className="flex items-center justify-between mt-1 pl-1">
                <span className="text-[12px] text-white/40">
                  Just now
                </span>

                <span className={`
                            text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border
                            ${statusStyles}
                        `}>
                  {alert.status}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};