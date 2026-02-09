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

                <p className="text-[20px] text-white/50 leading-tight mb-8 max-w-[480px]">
                    Intelligent mission monitoring and unified command<br />
                    for your <span className="text-white/80 font-medium">autonomous drone fleets</span>.
                </p>

                <button
                    onClick={handleContinue}
                    className="group relative w-[200px] h-[56px] flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-2xl active:scale-[0.98] transition-all duration-300 border border-blue-400/20"
                >
                    <div className="relative flex items-center justify-center">
                        <span>Get Started</span>
                        <div className="absolute left-full ml-1 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center">
                            <ArrowRight size={20} />
                        </div>
                    </div>
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
