import React from 'react';
import { Loader2, Check } from 'lucide-react';
import { Job } from '../types';

interface RunningTaskPillProps {
  job: Job;
}

export const RunningTaskPill: React.FC<RunningTaskPillProps> = ({ job }) => {
  return (
    <div className="w-full flex justify-center animate-in slide-in-from-top-2 fade-in duration-500">
        <div className="bg-surface border border-white/10 rounded-full pl-3 pr-4 py-2 flex items-center gap-3 shadow-xl">
             {/* Icon State */}
             <div className={`w-5 h-5 rounded-full flex items-center justify-center ${job.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {job.status === 'Running' && <Loader2 size={12} className="animate-spin" />}
                {job.status === 'Completed' && <Check size={12} />}
             </div>

             {/* Text Content */}
             <div className="flex items-center gap-2 text-[13px]">
                <span className="text-white/60 font-medium">
                    {job.status === 'Running' ? 'Now running:' : 'Completed:'}
                </span>
                <span className="text-white font-medium">
                    {job.type}
                </span>
                <span className="text-white/20">•</span>
                <span className="text-white/80">{job.siteName}</span>
                
                {job.status === 'Running' && (
                    <>
                        <span className="text-white/20">•</span>
                        <span className="text-blue-400 font-mono tabular-nums">{job.duration}s left</span>
                    </>
                )}
             </div>

             {/* Action */}
             {job.status === 'Running' && (
                 <button className="ml-2 text-[11px] font-semibold text-white/40 hover:text-white transition-colors uppercase tracking-wide">
                     View Live
                 </button>
             )}
        </div>
    </div>
  );
};