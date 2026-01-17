import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
    message: string | null;
    onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -20, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -20, x: '-50%' }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed top-14 md:top-32 left-1/2 z-[9999] bg-[#0a0a0a] text-[#F3EFE0] px-6 py-3 rounded-full text-xs md:text-sm font-medium font-sans shadow-2xl flex items-center gap-3 backdrop-blur-md"
                    style={{ transform: 'translateX(-50%)' }} // Ensure centered horizontally
                >
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    {message}
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default Toast;
