import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

interface StatusPopupProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'success' | 'info' | 'error';
}

const StatusPopup: React.FC<StatusPopupProps> = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info'
}) => {
    if (typeof document === 'undefined') return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="w-8 h-8" />;
            case 'error':
                return <AlertCircle className="w-8 h-8" />;
            case 'info':
            default:
                return <Info className="w-8 h-8" />;
        }
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 font-sans">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
                        className="relative bg-[#F9F8F4] w-full max-w-lg p-10 shadow-2xl border border-white/10 text-center m-4 overflow-hidden rounded-sm"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-zinc-400 hover:text-black transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex justify-center mb-8">
                            <motion.div
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center"
                            >
                                {getIcon()}
                            </motion.div>
                        </div>

                        <h3 className="text-3xl md:text-4xl font-serif italic mb-4 text-[#1A1A1A]">{title}</h3>
                        <p className="text-xs md:text-sm font-sans text-zinc-600 uppercase tracking-widest leading-relaxed mb-8">
                            {message}
                        </p>

                        <button
                            onClick={onClose}
                            className="mt-4 w-full py-4 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-black transition-all"
                        >
                            Close
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default StatusPopup;
