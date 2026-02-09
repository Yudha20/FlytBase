import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface IntroScreenProps {
    onDismiss: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleContinue = () => {
        setIsExiting(true);
        setTimeout(() => {
            onDismiss();
        }, 500);
    };

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#121212]/95 backdrop-blur-xl transition-opacity duration-700 ease-in-out ${isVisible && !isExiting ? 'opacity-100' : 'opacity-0'}`}
        >
            <div
                className={`max-w-[480px] w-full px-8 py-12 flex flex-col items-center text-center transition-all duration-700 ease-out transform ${isVisible && !isExiting ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}
            >
                <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                    FlytBase Ops Console
                </h1>

                <p className="text-lg text-white/50 leading-relaxed mb-12 max-w-[380px]">
                    Seamless monitoring and unified control for your <span className="text-white/80 font-medium">autonomous drone fleets</span>.
                </p>

                <button
                    onClick={handleContinue}
                    className="group relative flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_35px_rgba(37,99,235,0.5)] border border-blue-400/20"
                >
                    <span>Get Started</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="mt-12 text-xs text-white/20 uppercase tracking-[0.2em] font-medium">
                    Enterprise Security • Live Operations
                </div>
            </div>
        </div>
    );
};
