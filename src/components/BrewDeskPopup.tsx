import React, { useState, useEffect, useRef } from 'react';
import { motion as motionBase } from 'framer-motion';
import { CoffeeItem } from '../types';
import { API_BASE_URL } from '../config';

// Fix for framer-motion type mismatch
const motion = motionBase as any;

interface BrewDeskPopupProps {
  onClose: () => void;
  onAddToCart: (item: CoffeeItem) => void;
}

// BrewDesk popup: calm, minimal, vibe-based suggestion UI
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

  const handleAddToCartWithQuantity = (item: CoffeeItem, quantity: number, itemName: string) => {
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
    <div className="w-full max-w-lg bg-[#F9F8F4] border border-black/10 rounded-2xl shadow-xl p-6 md:p-8 font-sans max-h-[85vh] overflow-y-auto no-scrollbar">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">BrewDesk Suggestion</p>
        <button
          type="button"
          onClick={onClose}
          className="text-[11px] uppercase tracking-[0.25em] text-zinc-500 hover:text-zinc-800 transition-opacity"
        >
          Close
        </button>
      </div>

      <h2 className="text-3xl md:text-4xl font-serif italic mb-8">
        Let me help you choose.
      </h2>

      {/* Two-column layout: Activity / Mood - Symmetric */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* ACTIVITY column */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3 ml-1">Activity</p>
          <div className="flex flex-col gap-3">
            {[
              { key: 'work', label: 'DEEP FOCUS', hint: 'productivity, flow, clarity' },
              { key: 'hangout', label: 'CATCH UP', hint: 'friends, gossip, laughter' },
              { key: 'chill', label: 'SLOW SIP', hint: 'peace, quiet, savoring' },
            ].map((opt) => {
              const selected = selectedActivityKey === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    setSelectedActivityKey(opt.key);
                    setError(null);
                  }}
                  className={[
                    'group w-full px-6 py-4 rounded-xl text-xs uppercase tracking-[0.25em] border transition-all duration-200 flex flex-col items-start justify-center text-left relative overflow-hidden',
                    selected
                      ? 'bg-[#0a0a0a] text-[#F9F8F4] border-[#0a0a0a] shadow-md'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50',
                  ].join(' ')}
                >
                  <span className="relative z-10 font-semibold">{opt.label}</span>
                  <span
                    className={[
                      'text-[10px] mt-1 font-sans normal-case tracking-normal transition-opacity duration-200',
                      selected ? 'text-zinc-400 opacity-100' : 'text-zinc-400 opacity-60 group-hover:opacity-100',
                    ].join(' ')}
                  >
                    {opt.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MOOD column */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3 ml-1">Current Mood</p>
          <div className="flex flex-col gap-3">
            {[
              { key: 'energetic', label: 'BUZZING', hint: 'sustain the vibe' },
              { key: 'weak', label: 'DRAINED', hint: 'need a kick' },
              { key: 'comfort', label: 'COZY', hint: 'warm hug' },
            ].map((opt) => {
              const selected = selectedMoodKey === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    setSelectedMoodKey(opt.key);
                    setError(null);
                  }}
                  className={[
                    'group w-full px-6 py-4 rounded-xl text-xs uppercase tracking-[0.25em] border transition-all duration-200 flex flex-col items-start justify-center text-left relative overflow-hidden',
                    selected
                      ? 'bg-[#0a0a0a] text-[#F9F8F4] border-[#0a0a0a] shadow-md'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50',
                  ].join(' ')}
                >
                  <span className="relative z-10 font-semibold">{opt.label}</span>
                  <span
                    className={[
                      'text-[10px] mt-1 font-sans normal-case tracking-normal transition-opacity duration-200',
                      selected ? 'text-zinc-400 opacity-100' : 'text-zinc-400 opacity-60 group-hover:opacity-100',
                    ].join(' ')}
                  >
                    {opt.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error (calm) */}
      {error && (
        <p className="text-[11px] text-zinc-500 mb-3">
          {error}
        </p>
      )}

      {/* Results */}
      {result && (
        <div className="mt-4 space-y-4 text-sm">
          {result.coffee && (
            <div className="border border-black/10 rounded-xl p-3">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Coffee</p>
                  <p className="font-serif text-lg mb-1">{result.coffee.name}</p>
                  <p className="text-xs text-zinc-600">₹{result.coffee.price}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCoffeeQuantity(Math.max(1, coffeeQuantity - 1))}
                    className="w-8 h-8 rounded-full border border-black/20 flex items-center justify-center text-sm hover:bg-black/5 transition-colors"
                  >
                    −
                  </button>
                  <span className="text-sm font-medium w-8 text-center">{coffeeQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setCoffeeQuantity(coffeeQuantity + 1)}
                    className="w-8 h-8 rounded-full border border-black/20 flex items-center justify-center text-sm hover:bg-black/5 transition-colors"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-full border border-black/20 text-[10px] uppercase tracking-[0.25em] hover:bg-[#0a0a0a] hover:text-[#F9F8F4] transition-colors"
                  onClick={() => {
                    const rec = result.coffee;
                    const item: CoffeeItem = {
                      id: rec.id,
                      name: rec.name,
                      notes: rec.category || 'Coffee',
                      caffeine: (rec.caffeine_mg && rec.caffeine_mg > 220)
                        ? 'High'
                        : 'Medium',
                      intensity: 4,
                      image: rec.image || '/media/menu-placeholder.jpg',
                      price: rec.price,
                      description: rec.description || rec.category || rec.name,
                    };
                    handleAddToCartWithQuantity(item, coffeeQuantity, rec.name);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          )}

          {result.snack && (
            <div className="border border-black/10 rounded-xl p-3">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Snack</p>
                  <p className="font-serif text-lg mb-1">{result.snack.name}</p>
                  <p className="text-xs text-zinc-600">₹{result.snack.price}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSnackQuantity(Math.max(1, snackQuantity - 1))}
                    className="w-8 h-8 rounded-full border border-black/20 flex items-center justify-center text-sm hover:bg-black/5 transition-colors"
                  >
                    −
                  </button>
                  <span className="text-sm font-medium w-8 text-center">{snackQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setSnackQuantity(snackQuantity + 1)}
                    className="w-8 h-8 rounded-full border border-black/20 flex items-center justify-center text-sm hover:bg-black/5 transition-colors"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-full border border-black/20 text-[10px] uppercase tracking-[0.25em] hover:bg-[#0a0a0a] hover:text-[#F9F8F4] transition-colors"
                  onClick={() => {
                    const rec = result.snack;
                    const item: CoffeeItem = {
                      id: rec.id,
                      name: rec.name,
                      notes: rec.category || 'Snack',
                      caffeine: 'None',
                      intensity: 1,
                      image: rec.image || '/media/menu-placeholder.jpg',
                      price: rec.price,
                      description: rec.description || rec.category || rec.name,
                    };
                    handleAddToCartWithQuantity(item, snackQuantity, rec.name);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CTA row */}
      <div className="flex justify-end mt-6 text-[11px] uppercase tracking-[0.25em]">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="px-8 py-2 rounded-full bg-[#0a0a0a] text-[#F9F8F4] hover:bg-black transition-colors disabled:opacity-40"
        >
          {loading ? 'Brewing...' : 'Get Recommendation'}
        </button>
      </div>

      {/* Toast notification */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          className="fixed top-8 left-1/2 z-50 bg-[#0a0a0a] text-[#F9F8F4] px-6 py-3 rounded-full text-xs uppercase tracking-[0.25em] shadow-xl"
        >
          {toastMessage}
        </motion.div>
      )}
    </div>
  );
};

export default BrewDeskPopup;