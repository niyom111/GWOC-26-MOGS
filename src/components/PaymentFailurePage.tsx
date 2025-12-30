import React from 'react';
import { motion as motionBase } from 'framer-motion';
import { useDataContext } from '../DataContext';
import { Page } from '../types';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const motion = motionBase as any;

interface PaymentFailurePageProps {
    onBackToCart: () => void;
}

const PaymentFailurePage: React.FC<PaymentFailurePageProps> = ({ onBackToCart }) => {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-24 pb-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-white border border-red-100 rounded-2xl p-8 shadow-sm"
            >
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>

                <h1 className="text-3xl font-serif mb-4 text-[#0a0a0a]">Uh-oh!</h1>

                <p className="text-sm font-sans text-zinc-600 mb-8 leading-relaxed">
                    It looks like the payment didn't go through.
                    Don't worry, your order hasn't been placed yet.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={onBackToCart}
                        className="w-full py-3 bg-[#0a0a0a] text-[#F9F8F4] text-[10px] uppercase tracking-[0.3em] font-sans rounded-full hover:bg-black transition-colors flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Return to Checkout</span>
                    </button>

                    <p className="text-[10px] text-zinc-400 font-sans">
                        Your items are still waiting for you.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentFailurePage;
