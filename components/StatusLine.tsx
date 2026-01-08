import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface StatusLineProps {
    lastSync: Date;
    onSync?: () => void;
    isSyncing?: boolean;
}

export const StatusLine: React.FC<StatusLineProps> = ({ lastSync, onSync, isSyncing }) => {
  const [timeDisplay, setTimeDisplay] = useState('Just now');

  useEffect(() => {
    const updateTime = () => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - lastSync.getTime()) / 1000);

        if (diffInSeconds < 30) {
            setTimeDisplay('Just now');
        } else if (diffInSeconds < 60) {
            setTimeDisplay('30s ago');
        } else {
            const minutes = Math.floor(diffInSeconds / 60);
            setTimeDisplay(`${minutes}m ago`);
        }
    };

    updateTime(); // Initial run
    const intervalId = setInterval(updateTime, 1000); 

    return () => clearInterval(intervalId);
  }, [lastSync]);

  return (
    <div className="flex flex-col items-start justify-center select-none w-full gap-1.5">
      {/* Line 1: Primary Reassurance */}
      <div className="flex items-center gap-3 animate-[fadeInUp_0.4s_ease-out_forwards]">
        {/* Status Beacon */}
        <div className="relative flex items-center justify-center">
           <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-breathe" />
        </div>
        
        <h1 className="text-[26px] font-semibold text-white tracking-tight leading-tight">
          Monitoring active
        </h1>
      </div>
      
      {/* Line 2: System Heartbeat */}
      <div className="pl-[22px] animate-[fadeInUp_0.4s_ease-out_0.12s_forwards] opacity-0 flex items-center gap-3 text-[13px] text-white/60 font-medium tracking-wide">
        
        <div className="flex items-center gap-1.5">
            <span className="text-white/60">Alerts:</span>
            <span className="text-white">0</span>
        </div>

        <span className="text-white/20">•</span>

        <div className="flex items-center gap-1.5">
            <span className="text-white/60">Tasks:</span>
            <span className="text-white">1 running</span>
        </div>

        <span className="text-white/20">•</span>

        <div className="flex items-center gap-1.5">
            <span className="text-white/60">Fleet:</span>
            <span className="text-emerald-400">all connected</span>
        </div>

        <span className="text-white/20">•</span>

        <div className="flex items-center gap-2 transition-all duration-500">
            <span className="text-white/60">Sync:</span>
            <span className="text-emerald-400">{timeDisplay}</span>
            {onSync && (
                <button 
                    onClick={onSync} 
                    disabled={isSyncing}
                    className={`
                        w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors
                        ${isSyncing ? 'animate-spin opacity-50' : 'opacity-50 hover:opacity-100'}
                    `}
                    title="Sync now"
                >
                    <RefreshCw size={12} className="text-white" />
                </button>
            )}
        </div>

      </div>
    </div>
  );
};