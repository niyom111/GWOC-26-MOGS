import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, Clock, Package, ChefHat } from 'lucide-react';
import { Page, Order } from '../types';
import Footer from '../components/Footer';
import { API_BASE_URL } from '../config';

interface TrackOrderPageProps {
  onNavigate: (page: Page) => void;
}

const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Trigger content animation after video loads
  useEffect(() => {
    if (videoLoaded) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 500); // Wait for video fade-in to establish
      return () => clearTimeout(timer);
    }
  }, [videoLoaded]);

  // Periodically refresh status display
  useEffect(() => {
    if (!searched || orders.length === 0) return;

    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [searched, orders.length]);

  const getDisplayStatus = (order: Order): string => {
    const orderDate = new Date(order.date).getTime();
    const now = Date.now();
    const elapsed = now - orderDate;
    const twoMinutes = 2 * 60 * 1000;

    if (order.status === 'placed' && elapsed >= twoMinutes) {
      return 'preparing';
    }
    if (order.status === 'ready') {
      return 'ready';
    }
    return order.status;
  };

  const getStatusIcon = (status: string) => {
    if (!status) return <Package className="w-4 h-4" />;
    switch (status.toLowerCase()) {
      case 'placed':
        return <Package className="w-4 h-4" />;
      case 'preparing':
        return <ChefHat className="w-4 h-4" />;
      case 'ready':
        return <Clock className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-zinc-200 text-zinc-700';
    switch (status.toLowerCase()) {
      case 'placed':
        return 'bg-zinc-200 text-zinc-700';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-zinc-200 text-zinc-700';
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrimmed = (email ?? '').trim();
    if (!emailTrimmed) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/by-email?email=${encodeURIComponent(email.trim())}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!email.trim()) {
      setSearched(false);
      setOrders([]);
      setRefreshTrigger(0);
    }
  }, [email]);

  return (
    <div className="relative w-full text-[#F3EFE0] overflow-x-hidden min-h-[200vh]">
      {/* Background Video - Fixed to viewport to prevent stretching */}
      <div className={`fixed inset-0 z-0 overflow-hidden bg-black transition-opacity duration-1000 ease-in-out ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          style={{ width: '100vw', height: '100vh', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
          className="w-full h-full object-cover"
          onCanPlay={() => setVideoLoaded(true)}
        >
          <source src="/coffeeaesthetic.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 flex flex-col justify-start min-h-[200vh]">
        <div className="fixed top-0 left-0 right-0 z-50 pt-24 md:pt-32 px-6 md:px-10 bg-gradient-to-b from-black/80 via-black/40 to-transparent pb-8 pointer-events-none">
          {/* Gradient backdrop for header visibility */}
        </div>

        {/* Content */}
        <div className="w-full flex-1 flex flex-col pt-24 md:pt-32 pb-40">
          {/* Header & Search */}
          <div className="w-full max-w-4xl mx-auto px-6 md:px-10 mb-8">
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => onNavigate(Page.HOME)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-[#F3EFE0]"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showContent ? 1 : 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-[9px] md:text-[13px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-[#F3EFE0]/80 mb-3 md:mb-4 font-sans"
                >
                  Order Tracking
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 30 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-4xl md:text-7xl font-serif italic tracking-tight text-[#F3EFE0]"
                >
                  Track Your Orders
                </motion.h1>
              </div>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-0">
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 bg-white/10 backdrop-blur-md px-4 py-4 text-sm font-sans outline-none focus:ring-0 text-[#F3EFE0] placeholder-[#F3EFE0]/50"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#F3EFE0] text-[#0a0a0a] text-[10px] uppercase tracking-[0.3em] font-sans hover:bg-[#F3EFE0]/90 transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-xs text-red-400 font-sans">{error}</p>
              )}
            </form>
          </div>

          {/* Results Area */}
          <div className="w-full max-w-4xl mx-auto px-6 md:px-10 flex-1">
            <AnimatePresence>
              {searched && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="transition-all duration-500"
                >
                  {loading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="w-8 h-8 border-2 border-[#F3EFE0]/20 border-t-[#F3EFE0] rounded-full animate-spin" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-16 border-t border-[#F3EFE0]/10">
                      <p className="font-serif text-xl mb-2 text-[#F3EFE0]">No orders found</p>
                      <p className="text-sm text-[#F3EFE0]/60 font-sans">
                        No orders were found for this email address.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto scrollbar-hide">
                      <p className="text-sm text-[#F3EFE0]/60 font-sans mb-4">
                        Found {orders.length} order{orders.length > 1 ? 's' : ''}
                      </p>
                      {orders.map((order, index) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white/10 backdrop-blur-md border border-[#F3EFE0]/10 rounded-xl p-6 hover:bg-white/15 transition-colors"
                        >
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-serif text-lg text-[#F3EFE0]">
                                  Order #{order.id.slice(-8)}
                                </h3>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-sans font-medium ${getStatusColor(getDisplayStatus(order))}`}>
                                  {getStatusIcon(getDisplayStatus(order))}
                                  {getDisplayStatus(order)}
                                </span>
                              </div>
                              <p className="text-xs text-[#F3EFE0]/80 font-sans">
                                Placed on {new Date(order.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              <p className="text-xs text-[#F3EFE0]/80 font-sans mt-1">
                                Pickup time: {order.pickupTime}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-serif text-xl text-[#F3EFE0]">₹{order.total.toFixed(0)}</p>
                              <p className="text-xs text-[#F3EFE0]/80 font-sans mt-1">
                                {order.payment_method || 'Payment method not specified'}
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-[#F3EFE0]/10 pt-4">
                            <p className="text-xs uppercase tracking-[0.3em] text-[#F3EFE0]/60 font-sans mb-2">
                              Items
                            </p>
                            <div className="space-y-2">
                              {order.items
                                .filter(item => item.id && item.name && item.price != null && item.quantity != null)
                                .map((item, idx) => (
                                  <div key={item.id || idx} className="flex justify-between text-sm font-sans text-[#F3EFE0]/90">
                                    <span>{item.name || 'Unknown Item'} × {item.quantity ?? 0}</span>
                                    <span className="text-[#F3EFE0]">₹{(item.price * item.quantity).toFixed(0)}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Spacer to push footer down if content is short */}
        <div className="flex-1" />

        {/* Footer - Always at bottom of document */}
        <div className="w-full relative z-20 mt-auto">
          <Footer onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
