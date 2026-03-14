import React, { useState,useEffect } from 'react';

// --- Cookie Banner Component ---
export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const accepted = localStorage.getItem('cookiesAccepted');
        if (!accepted) setIsVisible(true);
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookiesAccepted', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:bottom-8 md:left-1/2 md:right-auto md:translate-x-[-50%] bg-gray-900 text-white p-4 md:p-6 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 z-50">
            <span className="text-sm md:text-base">
                This website uses cookies to ensure you get the best experience. Learn more about what we do in our <a href="/privacy" className="underline hover:no-underline">Privacy Policy</a>.
            </span>
            <button 
                onClick={acceptCookies} 
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 font-semibold  text-white rounded-lg  text-sm md:text-base transition"
            >
                Accept
            </button>
        </div>
    );
}