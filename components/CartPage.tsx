
import React from 'react';
import { motion as motionBase } from 'framer-motion';
import { CartItem } from '../types';
import { Trash2, Minus, Plus, ArrowLeft } from 'lucide-react';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

interface CartPageProps {
  cart: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onBackToMenu: () => void;
}

const CartPage: React.FC<CartPageProps> = ({ cart, onRemove, onUpdateQuantity, onBackToMenu }) => {
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.085;
  const total = subtotal + tax;

  return (
    <div className="bg-[#F9F8F4] text-[#0a0a0a] pt-32 pb-40 px-6 md:px-10 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] uppercase tracking-[0.5em] text-zinc-500 mb-4 font-sans"
            >
              Current Selections
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-serif italic tracking-tight"
            >
              Your Cart
            </motion.h1>
          </div>

          {cart.length > 0 && (
            <button
              onClick={onBackToMenu}
              className="mt-6 md:mt-0 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-sans text-zinc-600 hover:text-[#0a0a0a]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Menu</span>
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="py-24 text-center border-t border-black/5 mt-8">
            <p className="font-serif text-2xl mb-6">Your cart is currently empty.</p>
            <button
              onClick={onBackToMenu}
              className="inline-flex items-center gap-2 px-8 py-3 border border-black/20 text-[10px] uppercase tracking-[0.3em] font-sans hover:bg-[#0a0a0a] hover:text-[#F9F8F4] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Menu</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-8">
            {/* Items list */}
            <div className="md:col-span-2 bg-white/60 border border-black/5 rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-serif">Items</h2>
                <span className="text-xs font-sans text-zinc-500 uppercase tracking-[0.25em]">
                  {cart.length} item{cart.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="divide-y divide-black/10">
                {cart.map(item => (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-serif text-[15px]">{item.name}</p>
                      <p className="mt-1 text-[11px] text-zinc-500 uppercase tracking-[0.25em] font-sans">
                        {item.notes}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-black/15 rounded-full px-3 py-1.5 gap-3">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="text-zinc-600 hover:text-[#0a0a0a] disabled:opacity-40"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-sans w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="text-zinc-600 hover:text-[#0a0a0a]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold font-sans">
                          ₹{item.price * item.quantity}
                        </p>
                        <button
                          onClick={() => onRemove(item.id)}
                          className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.25em] text-zinc-500 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="md:col-span-1 h-fit bg-white/80 border border-black/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-sans mb-2">
                  Summary
                </p>
                <h2 className="text-2xl font-serif">Order Total</h2>
              </div>

              <div className="space-y-3 text-sm font-sans">
                <div className="flex justify-between">
                  <span className="text-zinc-600">Subtotal</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Tax (approx. 8.5%)</span>
                  <span>₹{tax.toFixed(0)}</span>
                </div>
                <div className="flex justify-between pt-3 mt-2 border-t border-black/10 text-base font-semibold">
                  <span>Total</span>
                  <span>₹{total.toFixed(0)}</span>
                </div>
              </div>

              <button className="w-full mt-4 py-3 bg-[#0a0a0a] text-[#F9F8F4] text-[10px] uppercase tracking-[0.3em] font-sans rounded-full hover:bg-black transition-colors">
                Checkout
              </button>

              <p className="text-[10px] text-zinc-500 font-sans mt-2">
                Taxes and final totals are estimated. Payment handled at the counter.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
