import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
    error?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    isLoading = false,
    error,
}) => {
    const variantStyles = {
        danger: 'bg-red-500 hover:bg-red-600',
        warning: 'bg-amber-500 hover:bg-amber-600',
        info: 'bg-blue-500 hover:bg-blue-600',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-md bg-white rounded-[12px] shadow-xl p-6 mx-4"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/5 transition-colors"
                        >
                            <X className="w-4 h-4 text-zinc-400" />
                        </button>

                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${variant === 'danger' ? 'bg-red-100' :
                                variant === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
                            }`}>
                            <AlertTriangle className={`w-6 h-6 ${variant === 'danger' ? 'text-red-500' :
                                    variant === 'warning' ? 'text-amber-500' : 'text-blue-500'
                                }`} />
                        </div>

                        {/* Content */}
                        <h3 className="text-lg font-semibold text-black mb-2">{title}</h3>
                        <p className="text-[14px] text-zinc-600 mb-6">{message}</p>

                        {/* Error message */}
                        {error && (
                            <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-[8px] text-[13px] text-red-600">
                                {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2.5 text-[13px] font-medium text-zinc-700 bg-[#F5F5F5] hover:bg-[#EBEBEB] rounded-[8px] transition-colors disabled:opacity-50"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={`flex-1 px-4 py-2.5 text-[13px] font-medium text-white rounded-[8px] transition-colors disabled:opacity-50 ${variantStyles[variant]}`}
                            >
                                {isLoading ? 'Processing...' : confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmDialog;
