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
                className={`max-w-[480px] w-full px-8 py-12 flex flex-col items-center text-center transition-all duration-700 ease-out transform ${isVisible && !isExiting ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}
            >
                <h1 className="text-[36px] font-bold tracking-tight mb-4 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                    FlytBase Ops Console
                </h1>

                <p className="text-[20px] text-white/50 leading-tight mb-8 max-w-[420px]">
                    Seamless monitoring and unified control<br />
                    for your <span className="text-white/80 font-medium">autonomous drone fleets</span>.
                </p>

                <button
                    onClick={handleContinue}
                    className="group relative w-[200px] h-[56px] flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_35px_rgba(37,99,235,0.5)] border border-blue-400/20"
                >
                    <div className="flex items-center gap-0 group-hover:gap-1 transition-all duration-300">
                        <span>Get Started</span>
                        <div className="w-0 group-hover:w-5 overflow-hidden transition-all duration-300 flex items-center">
                            <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    </div>
                </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center">
                <div className="text-[12px] text-white/30 font-regular">
                    Enterprise Security • Live Operations
                </div>
            </div>
        </div>
    );
};
