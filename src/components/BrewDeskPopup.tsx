import React, { useState, useEffect, useRef } from 'react';
import { motion as motionBase, AnimatePresence } from 'framer-motion';
import { CoffeeItem } from '../types';
import { useDataContext } from '../DataContext';
import { API_BASE_URL } from '../config';

// Fix for framer-motion type mismatch
const motion = motionBase as any;

import Toast from './Toast';

interface BrewDeskPopupProps {
    onClose: () => void;
    onAddToCart: (item: CoffeeItem) => void;
}

// BrewDesk popup: Wide, Premium, Minimal, Balanced.
const BrewDeskPopup: React.FC<BrewDeskPopupProps> = ({ onClose, onAddToCart }) => {
    const [selectedActivityKey, setSelectedActivityKey] = useState<string | null>(null);
    const [selectedMoodKey, setSelectedMoodKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<any | null>(null);
    const [coffeeQuantity, setCoffeeQuantity] = useState(1);
    const [snackQuantity, setSnackQuantity] = useState(1);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const toastTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) {
                window.clearTimeout(toastTimeoutRef.current);
            }
        };
    }, []);

    type Activity = 'Work' | 'Hangout' | 'Chill';
    type Mood = 'Energetic' | 'Weak' | 'Comfort';

    const activityMap: Record<string, Activity> = {
        work: 'Work',
        hangout: 'Hangout',
        chill: 'Chill',
    };

    const moodMap: Record<string, Mood> = {
        energetic: 'Energetic',
        weak: 'Weak',
        comfort: 'Comfort',
    };

    const canSubmit = selectedActivityKey && selectedMoodKey && !loading;

    const handleSubmit = async () => {
        if (!selectedActivityKey || !selectedMoodKey) return;

        const activity = activityMap[selectedActivityKey];
        const mood = moodMap[selectedMoodKey];

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/api/recommendations/context`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mood, activity }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Unable to suggest right now.');
            }

            const data = await res.json();
            setResult(data);
            setCoffeeQuantity(1);
            setSnackQuantity(1);
        } catch (e: any) {
            setError('Something didn\'t brew right. Try again.');
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    // Auto-update effect: functionality to update recommendation when selection changes
    useEffect(() => {
        if (result && selectedActivityKey && selectedMoodKey) {
            handleSubmit();
        }
    }, [selectedActivityKey, selectedMoodKey]);

    const { orderSettings } = useDataContext();

    const handleAddToCartWithQuantity = (item: CoffeeItem, quantity: number, itemName: string) => {
        // Intercept if ordering is disabled to avoid showing the checkout success toast
        if (orderSettings && !orderSettings.menu_orders_enabled) {
            onAddToCart(item); // This will trigger the parent's StatusPopup
            return;
        }

        for (let i = 0; i < quantity; i++) {
            onAddToCart(item);
        }

        const message = quantity > 1
            ? `${quantity}x ${itemName} added to cart`
            : `${itemName} added to cart`;

        setToastMessage(message);

        if (toastTimeoutRef.current) {
            window.clearTimeout(toastTimeoutRef.current);
        }
        toastTimeoutRef.current = window.setTimeout(() => {
            setToastMessage(null);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/20 backdrop-blur-sm">
            {/* Main Card Container - Wide & Centered */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} // smooth easeOut
                className="relative w-full max-w-[1120px] bg-[#F3EFE0] rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                style={{ height: 'auto', minHeight: '600px' }} // Target height range
            >
                {/* Close Button - absolute top right */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors"
                >
                    Close
                </button>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-8 md:p-12 lg:p-16 flex flex-col">

                    {/* Header Section */}
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif italic text-[#27272a] mb-3 md:mb-4">
                            Let me help you choose.
                        </h2>
                        <p className="text-zinc-500 font-sans text-sm md:text-base tracking-wide uppercase">
                            Curate your perfect moment
                        </p>
                    </div>

                    {/* Selection Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 lg:gap-32 w-full max-w-5xl mx-auto mb-12">

                        {/* Column 1: Activity */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3 mb-6 border-b border-zinc-200 pb-2">
                                <span className="text-[10px] font-bold text-black uppercase tracking-widest">01</span>
                                <span className="text-xs font-medium text-zinc-400 uppercase tracking-[0.2em]">Select Activity</span>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { key: 'work', label: 'Deep Focus', hint: 'Productivity & Flow' },
                                    { key: 'hangout', label: 'Catch Up', hint: 'Friends & Laughter' },
                                    { key: 'chill', label: 'Slow Sip', hint: 'Peace & Quiet' },
                                ].map((opt) => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setSelectedActivityKey(opt.key)}
                                        className={`
                                        w-full text-left p-4 md:p-5 rounded-none transition-all duration-300 group
                                        ${selectedActivityKey === opt.key
                                                ? 'bg-black text-white shadow-lg translate-x-1'
                                                : 'bg-white hover:bg-zinc-50 text-zinc-600 border border-black/60 hover:border-black'
                                            }
                                    `}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className={`font-serif text-xl italic ${selectedActivityKey === opt.key ? 'text-white' : 'text-[#27272a]'}`}>
                                                {opt.label}
                                            </span>
                                            {selectedActivityKey === opt.key && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                                            )}
                                        </div>
                                        <span className={`text-[10px] uppercase tracking-wider mt-1 block ${selectedActivityKey === opt.key ? 'text-white/70' : 'text-zinc-400'}`}>
                                            {opt.hint}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Column 2: Mood */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3 mb-6 border-b border-zinc-200 pb-2">
                                <span className="text-[10px] font-bold text-black uppercase tracking-widest">02</span>
                                <span className="text-xs font-medium text-zinc-400 uppercase tracking-[0.2em]">Select Mood</span>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { key: 'energetic', label: 'Buzzing', hint: 'Sustain the vibe' },
                                    { key: 'weak', label: 'Drained', hint: 'Need a kick' },
                                    { key: 'comfort', label: 'Cozy', hint: 'Warm hug' },
                                ].map((opt) => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setSelectedMoodKey(opt.key)}
                                        className={`
                                        w-full text-left p-4 md:p-5 rounded-none transition-all duration-300 group
                                        ${selectedMoodKey === opt.key
                                                ? 'bg-black text-white shadow-lg translate-x-1'
                                                : 'bg-white hover:bg-zinc-50 text-zinc-600 border border-black/60 hover:border-black'
                                            }
                                    `}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className={`font-serif text-xl italic ${selectedMoodKey === opt.key ? 'text-white' : 'text-[#27272a]'}`}>
                                                {opt.label}
                                            </span>
                                            {selectedMoodKey === opt.key && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                                            )}
                                        </div>
                                        <span className={`text-[10px] uppercase tracking-wider mt-1 block ${selectedMoodKey === opt.key ? 'text-white/70' : 'text-zinc-400'}`}>
                                            {opt.hint}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-2">
                            <span className="text-xs text-red-500 font-medium bg-red-50 px-3 py-1 rounded-full border border-red-100">
                                {error}
                            </span>
                        </div>
                    )}

                    {/* Recommendations Section */}
                    {result ? (
                        <div className="mt-auto animate-in fade-in slide-in-from-bottom-8 duration-700 w-full max-w-5xl mx-auto pt-8 border-t border-zinc-200/60">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                {/* Coffee Card */}
                                {result.coffee && (
                                    <div className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm flex flex-col md:flex-row gap-6 items-center hover:shadow-md transition-shadow">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] font-bold text-black uppercase tracking-widest"> Ideally Suited</span>
                                            </div>
                                            <h3 className="font-serif text-2xl italic text-[#27272a] mb-1">{result.coffee.name}</h3>
                                            <p className="text-zinc-500 text-xs mb-4">Perfect match for your mood.</p>
                                            <span className="text-lg font-serif italic text-black">₹{result.coffee.price}</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-3 min-w-[120px]">
                                            <div className="flex items-center gap-3 bg-zinc-50 rounded-full px-2 py-1">
                                                <button onClick={() => setCoffeeQuantity(Math.max(1, coffeeQuantity - 1))} className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-black">-</button>
                                                <span className="text-xs font-semibold w-4 text-center">{coffeeQuantity}</span>
                                                <button onClick={() => setCoffeeQuantity(coffeeQuantity + 1)} className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-black">+</button>
                                            </div>
                                            <button
                                                onClick={() => handleAddToCartWithQuantity({
                                                    id: result.coffee.id,
                                                    name: result.coffee.name,
                                                    notes: result.coffee.category || 'Coffee',
                                                    caffeine: (result.coffee.caffeine_mg && result.coffee.caffeine_mg > 220) ? 'High' : 'Medium',
                                                    intensity: 4,
                                                    image: result.coffee.image || '/media/menu-placeholder.jpg',
                                                    price: result.coffee.price,
                                                    description: result.coffee.description || result.coffee.category || result.coffee.name,
                                                    diet_pref: result.coffee.diet_pref
                                                }, coffeeQuantity, result.coffee.name)}
                                                className="w-full py-2 px-4 bg-white border border-black/20 hover:bg-black hover:text-white text-black text-[10px] uppercase tracking-widest font-bold rounded-lg transition-colors shadow-sm"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Snack Card */}
                                {result.snack && (
                                    <div className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm flex flex-col md:flex-row gap-6 items-center hover:shadow-md transition-shadow">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] font-bold text-black uppercase tracking-widest">Accompaniment</span>
                                            </div>
                                            <h3 className="font-serif text-2xl italic text-[#27272a] mb-1">{result.snack.name}</h3>
                                            <p className="text-zinc-500 text-xs mb-4">Pairs beautifully.</p>
                                            <span className="text-lg font-serif italic text-black">₹{result.snack.price}</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-3 min-w-[120px]">
                                            <div className="flex items-center gap-3 bg-zinc-50 rounded-full px-2 py-1">
                                                <button onClick={() => setSnackQuantity(Math.max(1, snackQuantity - 1))} className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-black">-</button>
                                                <span className="text-xs font-semibold w-4 text-center">{snackQuantity}</span>
                                                <button onClick={() => setSnackQuantity(snackQuantity + 1)} className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-black">+</button>
                                            </div>
                                            <button
                                                onClick={() => handleAddToCartWithQuantity({
                                                    id: result.snack.id,
                                                    name: result.snack.name,
                                                    notes: result.snack.category || 'Snack',
                                                    caffeine: 'None',
                                                    intensity: 1,
                                                    image: result.snack.image || '/media/menu-placeholder.jpg',
                                                    price: result.snack.price,
                                                    description: result.snack.description || result.snack.category || result.snack.name,
                                                    diet_pref: result.snack.diet_pref
                                                }, snackQuantity, result.snack.name)}
                                                className="w-full py-2 px-4 bg-white border border-black/20 hover:bg-black hover:text-white text-black text-[10px] uppercase tracking-widest font-bold rounded-lg transition-colors shadow-sm"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Initial CTA to Reveal - Centered at bottom area */
                        <div className="mt-auto pt-8 flex justify-center w-full">
                            <button
                                onClick={handleSubmit}
                                disabled={!canSubmit}
                                className={`
                                group relative px-8 py-3 rounded-full overflow-hidden transition-all duration-500
                                ${canSubmit
                                        ? 'bg-black hover:bg-black/90 text-white shadow-lg cursor-pointer transform hover:-translate-y-1'
                                        : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
                                    }
                            `}
                            >
                                <span className="relative z-10 text-xs font-bold uppercase tracking-[0.25em]">
                                    {loading ? 'Curating...' : 'Reveal Recommendation'}
                                </span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Toast Notification */}
                <Toast message={toastMessage} />
            </motion.div>
        </div>
    );
};

export default BrewDeskPopup;
