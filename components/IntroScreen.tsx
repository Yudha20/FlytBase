import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface IntroScreenProps {
    onDismiss: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleContinue = () => {
        setIsExiting(true);
        setTimeout(() => {
            onDismiss();
        }, 500);
    };

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#121212] backdrop-blur-xl transition-opacity duration-700 ease-in-out ${isVisible && !isExiting ? 'opacity-100' : 'opacity-0'}`}
        >
            <div
                className={`max-w-[640px] w-full px-8 py-12 flex flex-col items-center text-center transition-all duration-700 ease-out transform ${isVisible && !isExiting ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}
            >
                <h1 className="text-[36px] font-bold tracking-tight mb-4 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                    FlytBase Ops Console
                </h1>

                <p className="text-[20px] text-white/50 leading-tight mb-8 max-w-full">
                    Monitor missions and control your drone fleet<br />
                    from a single <span className="text-white/80 font-medium">operations console</span>.
                </p>

                <button
                    onClick={handleContinue}
                    className="group relative w-[160px] h-[40px] flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold rounded-xl active:scale-[0.98] transition-all duration-300 border border-blue-400/20 shadow-lg shadow-black/30"
                >
                    <span className="inline-flex items-center gap-[6px] select-none pointer-events-none">
                        <span>Get Started</span>
                        <span className="w-4 flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-300">
                                <ArrowRight size={16} />
                            </span>
                        </span>
                    </span>
                </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center">
                <div className="text-[12px] text-white/30 font-regular">
                    Operator Control Centre
                </div>
            </div>
        </div>
    );
};
