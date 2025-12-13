import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const Toast = ({ message, onClose, duration = 2000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 flex items-center space-x-2 bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-full shadow-lg transition-all animate-fade-in-down">
            <CheckCircle size={16} className="text-green-400" />
            <span className="text-sm font-medium">{message}</span>
        </div>
    );
};

export default Toast;
