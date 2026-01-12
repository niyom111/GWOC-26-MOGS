import React, { useState, useEffect } from 'react';
import { motion as motionBase, AnimatePresence } from 'framer-motion';
import { CartItem } from '../types';
import { Trash2, Minus, Plus, ArrowLeft, CheckCircle2 } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { useDataContext } from '../DataContext';
import { API_BASE_URL } from '../config';

const motion = motionBase as any;

interface CartPageProps {
  cart: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onBackToMenu: () => void;
  onClearCart: () => void;
  onBackToHome: () => void;
  onPaymentFailure: () => void;
}

const CartPage: React.FC<CartPageProps> = ({
  cart,
  onRemove,
  onUpdateQuantity,
  onBackToMenu,
  onClearCart,
  onBackToHome,
  onPaymentFailure,
}) => {
  const { placeOrder } = useDataContext();

  // EmailJS configuration (must be VITE_ prefixed in .env)
  const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
  const EMAILJS_TEMPLATE_ID_COUNTER = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_COUNTER as string;
  const EMAILJS_TEMPLATE_ID_ONLINE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_ONLINE as string;
  const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;

  // Log missing config
  useEffect(() => {
    const missingKeys: string[] = [];
    if (!EMAILJS_SERVICE_ID) missingKeys.push('VITE_EMAILJS_SERVICE_ID');
    if (!EMAILJS_TEMPLATE_ID_COUNTER) missingKeys.push('VITE_EMAILJS_TEMPLATE_ID_COUNTER');
    if (!EMAILJS_TEMPLATE_ID_ONLINE) missingKeys.push('VITE_EMAILJS_TEMPLATE_ID_ONLINE');
    if (!EMAILJS_PUBLIC_KEY) missingKeys.push('VITE_EMAILJS_PUBLIC_KEY');

    if (missingKeys.length > 0) {
      console.warn('⚠️ [Cart] Missing EmailJS Configuration Keys:', missingKeys.join(', '));
      console.warn('   Please check your .env file.');
    } else {
      console.log('✅ [Cart] EmailJS Configuration loaded successfully.');
    }
  }, []);

  // Initialize EmailJS once
  useEffect(() => {
    if (EMAILJS_PUBLIC_KEY) {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    }
  }, []);

  const subtotal = cart.reduce((acc, item) => {
    const price = item.price ?? 0;
    const quantity = item.quantity ?? 0;
    return acc + price * quantity;
  }, 0);
  const total = subtotal;

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [pickupTime, setPickupTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'counter' | 'upi'>('counter');

  // Razorpay configuration
  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string;

  // Generates simple <tr><td> rows to be injected into the EmailJS template table
  const generateEmailHTML = (items: CartItem[]) => {
    if (items.length === 0) {
      return '<tr><td colspan="2">No items in order</td></tr>';
    }

    return items
      .filter(item => item.id && item.name && item.price != null && item.quantity != null)
      .map(item => {
        const notesPart = item.notes ? ` - ${item.notes.toUpperCase()}` : '';
        const itemName = item.name || 'Unknown Item';
        const itemQuantity = item.quantity ?? 0;
        const itemPriceValue = (item.price ?? 0) * itemQuantity;
        const itemLine = `${itemName}${notesPart} × ${itemQuantity}`;
        const itemPrice = `₹${itemPriceValue.toFixed(0)}`;

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

    const orderData = {
      id: Date.now().toString(),
      customer: { name, phone: customer.phone, email },
      items: cart,
      total,
      pickupTime,
      date: new Date().toISOString()
    };

    try {
      if (paymentMethod === 'upi') {
        // Handle UPI payment flow
        await handleRazorpayPayment(orderData);
      } else {
        // Handle Pay at Counter flow (existing flow)
        const order = await placeOrder(
          { name, phone: customer.phone, email },
          cart,
          total,
          pickupTime,
          'counter'
        );

        // Order saved successfully - now try to send email (non-blocking)
        try {
          const itemsHTML = generateEmailHTML(cart);
          // Shotgun approach: send email in multiple common fields to ensure template matches one
          const templateParams = {
            to_name: name,
            to_email: email,
            email: email,     // Helper: In case template uses {{email}}
            reply_to: email,  // Helper: In case template uses {{reply_to}}
            recipient: email, // Helper: In case template uses {{recipient}}
            order_id: order.id,
            message: itemsHTML,
            total_price: total.toFixed(0),
            pickup_time: pickupTime,
          };

          console.log('[Cart] Sending EmailJS with params:', templateParams);

          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID_COUNTER,
            templateParams,
            EMAILJS_PUBLIC_KEY
          );
          console.log('[Cart] Email sent successfully');
        } catch (emailError: any) {
          // Email failed but order was saved
          console.error('Email sending failed:', emailError);
          // ALERT THE USER so they know why
          alert(`Order Placed, but Email Failed: ${emailError?.text || emailError?.message || 'Unknown error'}`);
        }

        onClearCart();
        setCheckoutOpen(false);
        setSuccessOpen(true);
        setSubmitting(false);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      // Alert explicit error
      alert(`Checkout Failed: ${err.message || 'Unknown error'}`);
      setError(err.message || 'Failed to process order. Please try again or inform staff.');
      setSubmitting(false);
    }
  };

  // Restrict phone to 10 digits only
  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    setCustomer((prev) => ({ ...prev, phone: digits }));
  };

  // Load Razorpay script
  useEffect(() => {
    if (paymentMethod === 'upi' && RAZORPAY_KEY_ID) {
      // Check if script already exists
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (existingScript) {
          document.body.removeChild(existingScript);
        }
      };
    }
  }, [paymentMethod, RAZORPAY_KEY_ID]);

  // Handle Razorpay payment
  const handleRazorpayPayment = async (orderData: any) => {
    if (!RAZORPAY_KEY_ID) {
      const msg = 'Payment service unavailable. Missing Razorpay Key. Please check console/env.';
      console.error(msg);
      alert(msg);
      setError('Payment service unavailable. Please use Pay at Counter option.');
      setSubmitting(false);
      return;
    }

    try {
      // Create Razorpay order
      const response = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: orderData.total,
          currency: 'INR',
          customer: orderData.customer
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const razorpayOrder = await response.json();

      // Initialize Razorpay checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Rabuste Cafe',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true
        },
        handler: async function (response: any) {
          try {
            console.log('[PAYMENT] Razorpay payment success, verifying...');

            // Verify payment
            const verifyResponse = await fetch(`${API_BASE_URL}/api/payments/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: orderData
              })
            });

            if (!verifyResponse.ok) {
              const errorData = await verifyResponse.json();
              throw new Error(errorData.error || 'Payment verification failed');
            }

            const verifyResult = await verifyResponse.json();
            console.log('[PAYMENT] Payment verified and order saved:', verifyResult);

            // Payment verified and order saved - now try to send email (non-blocking)
            try {
              const itemsHTML = generateEmailHTML(orderData.items);
              const templateParams = {
                to_name: orderData.customer.name,
                to_email: orderData.customer.email,
                email: orderData.customer.email,    // Helper
                reply_to: orderData.customer.email, // Helper
                recipient: orderData.customer.email,// Helper
                order_id: orderData.id,
                message: itemsHTML,
                total_price: orderData.total.toFixed(0),
                pickup_time: orderData.pickupTime,
              };

              console.log('[Payment] Sending EmailJS with params:', templateParams);

              await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID_ONLINE,
                templateParams,
                EMAILJS_PUBLIC_KEY
              );
              console.log('[PAYMENT] Email receipt sent successfully');
            } catch (emailError) {
              // Email failed but payment succeeded - log it but don't fail the flow
              console.warn('[PAYMENT] Email sending failed (payment succeeded):', emailError);
            }

            // Success: clear cart and show success UI
            onClearCart();
            setCheckoutOpen(false);
            setSuccessOpen(true);
            setSubmitting(false);
          } catch (err: any) {
            console.error('[PAYMENT] Payment verification error:', err);
            setError(err.message || 'Payment verification failed. Please contact support.');
            setSubmitting(false);
          }
        },
        prefill: {
          name: orderData.customer.name,
          email: orderData.customer.email,
          contact: orderData.customer.phone
        },
        theme: {
          color: '#0a0a0a'
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
            setError('Payment cancelled');
          }
        }
      };

      const razorpay = (window as any).Razorpay;
      if (!razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      const razorpayInstance = new razorpay(options);
      razorpayInstance.on('payment.failed', function (response: any) {
        console.error('Razorpay payment failed:', response.error);
        setSubmitting(false);
        onPaymentFailure();
      });

      razorpayInstance.open();
    } catch (err: any) {
      console.error('Razorpay payment error:', err);
      setError(err.message || 'Failed to initiate payment. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F9F8F4] text-[#0a0a0a] pt-24 md:pt-32 pb-40 px-6 md:px-10 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 md:mb-12">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-zinc-500 mb-3 md:mb-4 font-sans"
            >
              Current Selections
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-serif italic tracking-tight"
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
                {cart.map((item) => {
                  if (!item.id || !item.name || item.price == null || item.quantity == null) return null;
                  return (
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
                          ₹{((item.price ?? 0) * (item.quantity ?? 0)).toFixed(0)}
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
                  );
                })}
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
                Taxes and final totals are estimated. Choose payment method at checkout.
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
              <h2 className="text-2xl font-serif mb-4">Checkout</h2>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-[11px] uppercase tracking-[0.25em] mb-3">Payment Method</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="counter"
                      checked={paymentMethod === 'counter'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'counter' | 'upi')}
                      className="w-4 h-4 text-[#0a0a0a] border-black/20 focus:ring-[#0a0a0a]"
                    />
                    <span className="text-sm">Pay at Counter</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'counter' | 'upi')}
                      className="w-4 h-4 text-[#0a0a0a] border-black/20 focus:ring-[#0a0a0a]"
                      disabled={!RAZORPAY_KEY_ID}
                    />
                    <span className="text-sm">
                      Pay Online
                      {!RAZORPAY_KEY_ID && <span className="text-xs text-zinc-400 ml-2">(Unavailable)</span>}
                    </span>
                  </label>
                </div>
                {paymentMethod === 'counter' && (
                  <p className="text-xs text-zinc-500 font-sans mt-3">
                    Reserve your order now. A receipt will be emailed to you. Please pay at the counter when ready.
                  </p>
                )}
                {paymentMethod === 'upi' && (
                  <p className="text-xs text-zinc-500 font-sans mt-3">
                    Complete payment via Razorpay. Your order will be confirmed after successful payment.
                  </p>
                )}
              </div>

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
                      setPaymentMethod('counter');
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
                    {submitting
                      ? (paymentMethod === 'upi' ? 'Processing Payment...' : 'Placing Order...')
                      : (paymentMethod === 'upi' ? 'Pay Online' : 'Confirm Order')}
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
                {paymentMethod === 'counter' && 'Please proceed to the counter for payment.'}
                {paymentMethod === 'upi' && 'Your payment has been processed successfully.'}
              </p>
              <button
                onClick={() => {
                  setSuccessOpen(false);
                  setPaymentMethod('counter');
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