import React, { useState, useEffect } from 'react';
import { motion as motionBase } from 'framer-motion';
import { Search, ArrowLeft, Clock, Package, ChefHat } from 'lucide-react';
import { Page } from '../types';
import { API_BASE_URL } from '../config';

const motion = motionBase as any;

interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  date: string;
  pickupTime: string;
  status: string;
  payment_status?: string;
  payment_method?: string;
}

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

  // Periodically refresh status display to show automatic updates
  useEffect(() => {
    if (!searched || orders.length === 0) return;

    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [searched, orders.length]);

  // Calculate displayed status based on elapsed time (auto-update from placed to preparing)
  const getDisplayStatus = (order: Order): string => {
    const orderDate = new Date(order.date).getTime();
    const now = Date.now();
    const elapsed = now - orderDate;
    const twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds

    // If order is "placed" and 2 minutes have passed, show as "preparing"
    if (order.status === 'placed' && elapsed >= twoMinutes) {
      return 'preparing';
    }
    // If status is "ready", show as "ready"
    if (order.status === 'ready') {
      return 'ready';
    }
    // Otherwise show the actual status
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

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F3EFE0] text-[#0a0a0a] pt-24 md:pt-32 pb-40 px-6 md:px-10 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => onNavigate(Page.HOME)}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[9px] md:text-[13px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-black mb-3 md:mb-4 font-sans"
            >
              Order Tracking
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-serif italic tracking-tight"
            >
              Track Your Orders
            </motion.h1>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 bg-white border border-black/20 px-4 py-4 text-sm font-sans uppercase outline-none focus:border-black"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#0a0a0a] text-[#F9F8F4] text-[10px] uppercase tracking-[0.3em] font-sans hover:bg-black transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-xs text-red-600 font-sans">{error}</p>
          )}
        </form>

        {/* Results */}
        {searched && !loading && (
          <div>
            {orders.length === 0 ? (
              <div className="text-center py-16 border-t border-black/5">
                <p className="font-serif text-xl mb-2">No orders found</p>
                <p className="text-sm text-zinc-500 font-sans">
                  No orders were found for this email address.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-zinc-600 font-sans mb-4">
                  Found {orders.length} order{orders.length > 1 ? 's' : ''}
                </p>
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-black/10 rounded-xl p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-serif text-lg">Order #{order.id.slice(-8)}</h3>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-sans font-medium ${getStatusColor(getDisplayStatus(order))}`}>
                            {getStatusIcon(getDisplayStatus(order))}
                            {getDisplayStatus(order)}
                          </span>
                        </div>
                        <p className="text-xs text-black font-sans">
                          Placed on {new Date(order.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-xs text-black font-sans mt-1">
                          Pickup time: {order.pickupTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-serif text-xl">₹{order.total.toFixed(0)}</p>
                        <p className="text-xs text-black font-sans mt-1">
                          {order.payment_method || 'Payment method not specified'}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-black/5 pt-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-black font-sans mb-2">Items</p>
                      <div className="space-y-2">
                        {order.items
                          .filter(item => item.id && item.name && item.price != null && item.quantity != null)
                          .map((item, idx) => (
                          <div key={item.id || idx} className="flex justify-between text-sm font-sans">
                            <span>
                              {item.name || 'Unknown Item'} × {item.quantity ?? 0}
                            </span>
                            <span className="text-black">
                              ₹{(item.price * item.quantity).toFixed(0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;

