import React from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  return (
    <div className="bg-gradient-card border border-white/10 rounded-lg px-4 py-3 shadow-neu-flat hover:shadow-neu-hover flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 backdrop-blur-md">
      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 shadow-inner">
        <Check size={12} className="text-emerald-400 animate-in zoom-in spin-in-90 duration-300" />
      </div>
      <span className="text-[16px] text-white font-medium drop-shadow-sm">{message}</span>
    </div>
  );
};