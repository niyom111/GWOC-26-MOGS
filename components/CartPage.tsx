import React, { useState, useEffect } from 'react';
import { motion as motionBase, AnimatePresence } from 'framer-motion';
import { CartItem } from '../types';
import { Trash2, Minus, Plus, ArrowLeft, CheckCircle2 } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { useDataContext } from '../DataContext';

const motion = motionBase as any;

interface CartPageProps {
  cart: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onBackToMenu: () => void;
  onClearCart: () => void;
  onBackToHome: () => void;
}

const CartPage: React.FC<CartPageProps> = ({
  cart,
  onRemove,
  onUpdateQuantity,
  onBackToMenu,
  onClearCart,
  onBackToHome,
}) => {
  const { placeOrder } = useDataContext();

  // EmailJS configuration (must be VITE_ prefixed in .env)
  const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
  const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
  const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;

  // Log missing config
  useEffect(() => {
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error('EmailJS configuration missing. Check your .env file.');
    }
  }, []);

  // Initialize EmailJS once
  useEffect(() => {
    if (EMAILJS_PUBLIC_KEY) {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    }
  }, []);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.085;
  const total = subtotal + tax;

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [pickupTime, setPickupTime] = useState('');

  // Generates simple <tr><td> rows to be injected into the EmailJS template table
  const generateEmailHTML = (items: CartItem[]) => {
    if (items.length === 0) {
      return '<tr><td colspan="2">No items in order</td></tr>';
    }

    return items
      .map(item => {
        const notesPart = item.notes ? ` - ${item.notes.toUpperCase()}` : '';
        const itemLine = `${item.name}${notesPart} × ${item.quantity}`;
        const itemPrice = `₹${(item.price * item.quantity).toFixed(0)}`;

        return `
<tr>
  <td>${itemLine}</td>
  <td class="price-cell">${itemPrice}</td>
</tr>`;
      })
      .join('');
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const name = customer.name.trim();
    const phoneDigits = customer.phone.replace(/\D/g, '');
    const email = customer.email.trim().toLowerCase();

    // Validation
    if (!name) {
      setError('Please enter your name.');
      return;
    }
    if (phoneDigits.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!pickupTime) {
      setError('Please select a pickup time.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const order = placeOrder(
        { name, phone: customer.phone, email },
        cart,
        total,
        pickupTime
      );

      const itemsHTML = generateEmailHTML(cart);

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_name: name,
          to_email: email,
          order_id: order.id,
          message: itemsHTML,
          total_price: total.toFixed(0),
          pickup_time: pickupTime,
        },
        EMAILJS_PUBLIC_KEY
      );

      onClearCart();
      setCheckoutOpen(false);
      setSuccessOpen(true);
    } catch (err: any) {
      console.error('EmailJS failed:', err);
      setError('Failed to send receipt. Please try again or inform staff.');
    } finally {
      setSubmitting(false);
    }
  };

  // Restrict phone to 10 digits only
  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    setCustomer((prev) => ({ ...prev, phone: digits }));
  };

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

        {/* Empty Cart */}
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
            {/* Cart Items */}
            <div className="md:col-span-2 bg-white/60 border border-black/5 rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-serif">Items</h2>
                <span className="text-xs font-sans text-zinc-500 uppercase tracking-[0.25em]">
                  {cart.length} item{cart.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="divide-y divide-black/10">
                {cart.map((item) => (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-serif text-[15px]">{item.name}</p>
                      {item.notes && (
                        <p className="mt-1 text-[11px] text-zinc-500 uppercase tracking-[0.25em] font-sans">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-black/15 rounded-full px-3 py-1.5 gap-3">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="text-zinc-600 hover:text-[#0a0a0a] disabled:opacity-40"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-sans w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="text-zinc-600 hover:text-[#0a0a0a]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold font-sans">
                          ₹{(item.price * item.quantity).toFixed(0)}
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

            {/* Order Summary */}
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

              <button
                onClick={() => setCheckoutOpen(true)}
                className="w-full mt-4 py-3 bg-[#0a0a0a] text-[#F9F8F4] text-[10px] uppercase tracking-[0.3em] font-sans rounded-full hover:bg-black transition-colors"
              >
                Checkout
              </button>

              <p className="text-[10px] text-zinc-500 font-sans mt-2">
                Taxes and final totals are estimated. Payment handled at the counter.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {checkoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
className="w-full max-w-md mx-4 bg-white rounded-xl border border-black/10 shadow-xl p-6 md:p-8"
            >
              <h2 className="text-2xl font-serif mb-4">Pay at Counter</h2>
              <p className="text-xs text-zinc-500 font-sans mb-6">
                Reserve your order now. A receipt will be emailed to you. Please pay at the counter when ready.
              </p>

              <form onSubmit={handleCheckoutSubmit} className="space-y-5 font-sans text-sm">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.25em] mb-1">Name</label>
                  <input
                    required
                    value={customer.name}
                    onChange={(e) => setCustomer((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-transparent border border-black/20 rounded-md px-3 py-2 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.25em] mb-1">Phone</label>
                  <input
                    required
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="10-digit phone number"
                    maxLength={10}
                    className="w-full bg-transparent border border-black/20 rounded-md px-3 py-2 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.25em] mb-1">Pickup Time</label>
                  <input
                    required
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-transparent border border-black/20 rounded-md px-3 py-2 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.25em] mb-1">Email</label>
                  <input
                    required
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-transparent border border-black/20 rounded-md px-3 py-2 outline-none focus:border-black"
                  />
                </div>

                {error && <p className="text-xs text-red-600">{error}</p>}

                <div className="flex justify-end gap-3 pt-4 text-[11px] uppercase tracking-[0.25em]">
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutOpen(false);
                      setError(null);
                    }}
                    disabled={submitting}
                    className="px-4 py-2 text-zinc-500 hover:text-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-[#0a0a0a] text-[#F9F8F4] rounded-full hover:bg-black disabled:opacity-60"
                  >
                    {submitting ? 'Placing Order...' : 'Confirm Order'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Success Modal */}
        {successOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
className="w-full max-w-md mx-4 bg-white rounded-xl border border-black/10 shadow-xl p-6 md:p-8 text-center"
            >
              <CheckCircle2 className="w-16 h-16 mx-auto mb-6 text-black" />
              <h2 className="text-2xl font-serif mb-3">Order Placed Successfully</h2>
              <p className="text-sm text-zinc-600 font-sans mb-8">
                Your receipt has been sent to your email.<br />
                Please proceed to the counter for payment.
              </p>
              <button
                onClick={() => {
                  setSuccessOpen(false);
                  onBackToHome();
                }}
                className="px-8 py-3 bg-[#0a0a0a] text-[#F9F8F4] text-[10px] uppercase tracking-[0.3em] font-sans rounded-full hover:bg-black"
              >
                Return to Home
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartPage;