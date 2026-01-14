import React, { useState, useEffect } from 'react';
import { motion as motionBase } from 'framer-motion';
import { Lock, Package, ChefHat, Clock, CheckCircle2 } from 'lucide-react';
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

interface EmployeeDashboardProps {
  onNavigate: (page: Page) => void;
  onBack: () => void;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ onNavigate, onBack }) => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [statusUpdates, setStatusUpdates] = useState<Record<string, string>>({});

  const EMPLOYEE_PIN = '0022';

  useEffect(() => {
    // Check if already authenticated in session
    const auth = sessionStorage.getItem('rabuste_employee_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchActiveOrders();
    }
    
    // Scroll to top on mount - use multiple methods to ensure it works
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    
    // Run immediately
    scrollToTop();
    
    // Also run after a short delay to ensure DOM is ready
    const timeout = setTimeout(scrollToTop, 100);
    
    return () => clearTimeout(timeout);
  }, []);

  // Handle browser back button - log out and navigate to home
  useEffect(() => {
    if (!isAuthenticated) return;

    // Push a state when authenticated so we can detect back button
    const currentState = window.history.state;
    if (!currentState || !currentState.employeeDashboard) {
      window.history.pushState({ employeeDashboard: true }, '', window.location.pathname);
    }

    const handlePopState = () => {
      // When back button is pressed, log out and go to home
      // Clear session storage first
      sessionStorage.removeItem('rabuste_employee_auth');
      setIsAuthenticated(false);
      setOrders([]);
      setStatusUpdates({});
      // Navigate to home
      onBack();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, onBack]);

  const fetchActiveOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/active`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data || []);
      // Initialize status updates with current statuses
      const initialStatuses: Record<string, string> = {};
      (data || []).forEach((order: Order) => {
        initialStatuses[order.id] = order.status;
      });
      setStatusUpdates(initialStatuses);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === EMPLOYEE_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem('rabuste_employee_auth', 'true');
      fetchActiveOrders();
      setPin('');
      setError(null);
    } else {
      setError('Invalid PIN');
      setPin('');
    }
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setStatusUpdates(prev => ({
      ...prev,
      [orderId]: newStatus
    }));
  };

  const handleUpdateStatus = async (orderId: string) => {
    const newStatus = statusUpdates[orderId];
    if (!newStatus) return;

    setUpdatingOrderId(orderId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, updated_by: 'employee' })
      });

      if (!response.ok) throw new Error('Failed to update status');

      // Refresh orders
      await fetchActiveOrders();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('rabuste_employee_auth');
    setOrders([]);
    setStatusUpdates({});
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
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-[#F9F8F4] text-[#0a0a0a] min-h-screen flex items-center justify-center px-4 w-full overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-white border border-black/10 rounded-xl shadow-sm p-6 md:p-8"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-black/5 rounded-full">
              <Lock className="w-8 h-8 text-[#0a0a0a]" />
            </div>
          </div>
          <h1 className="text-2xl font-serif mb-2 text-center">Employee Access</h1>
          <p className="text-xs text-zinc-500 font-sans mb-6 text-center uppercase tracking-[0.25em]">
            Enter PIN to continue
          </p>
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.25em] mb-1 font-sans">PIN</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-transparent border border-black/20 rounded-md px-3 py-2 outline-none focus:border-black font-sans"
                placeholder="Enter PIN"
                required
                maxLength={4}
              />
            </div>
            {error && <p className="text-xs text-red-600 font-sans">{error}</p>}
            <button
              type="submit"
              className="w-full mt-4 py-2.5 bg-[#0a0a0a] text-[#F9F8F4] text-[10px] uppercase tracking-[0.3em] rounded-full hover:bg-black transition-colors font-sans"
            >
              Authenticate
            </button>
          </form>
          <button
            onClick={onBack}
            className="w-full mt-4 py-2 text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-sans hover:text-[#0a0a0a] transition-colors"
          >
            Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F8F4] text-[#0a0a0a] pt-16 md:pt-32 pb-20 md:pb-40 px-4 md:px-10 min-h-screen w-full overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-zinc-500 mb-3 md:mb-4 font-sans"
            >
              Employee Dashboard
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-serif italic tracking-tight"
            >
              Active Orders
            </motion.h1>
          </div>
          <button
            onClick={fetchActiveOrders}
            disabled={loading}
            className="px-4 py-2 text-[10px] uppercase tracking-[0.3em] font-sans border border-black/20 rounded-lg hover:bg-black/5 transition-colors disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600 font-sans">{error}</p>
          </div>
        )}

        {/* Orders List */}
        {loading && orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-sans text-zinc-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 border-t border-black/5">
            <p className="font-serif text-xl mb-2">No active orders</p>
            <p className="text-sm text-zinc-500 font-sans">
              All orders have been completed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-black/10 rounded-xl p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-serif text-lg">Order #{order.id.slice(-8)}</h3>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-sans font-medium bg-zinc-100 text-zinc-700">
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 font-sans mb-1">
                      <strong>Customer:</strong> {order.customer.name}
                    </p>
                    <p className="text-xs text-zinc-500 font-sans mb-1">
                      <strong>Email:</strong> {order.customer.email}
                    </p>
                    <p className="text-xs text-zinc-500 font-sans mb-1">
                      <strong>Phone:</strong> {order.customer.phone}
                    </p>
                    <p className="text-xs text-zinc-500 font-sans">
                      <strong>Pickup:</strong> {order.pickupTime} | {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-xl">₹{order.total.toFixed(0)}</p>
                    <p className="text-xs text-zinc-500 font-sans mt-1">
                      {order.payment_method || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-black/5 pt-4 mb-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 font-sans mb-2">Items</p>
                  <div className="space-y-1">
                    {order.items
                      .filter(item => item.id && item.name && item.price != null && item.quantity != null)
                      .map((item, idx) => (
                      <div key={item.id || idx} className="flex justify-between text-sm font-sans">
                        <span>
                          {item.name || 'Unknown Item'} × {item.quantity ?? 0}
                        </span>
                        <span className="text-zinc-600">
                          ₹{((item.price ?? 0) * (item.quantity ?? 0)).toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update Section */}
                <div className="border-t border-black/5 pt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="flex-1">
                    <label className="block text-[11px] uppercase tracking-[0.25em] mb-2 font-sans">Update Status</label>
                    <select
                      value={statusUpdates[order.id] || order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="w-full bg-transparent border border-black/20 rounded-md px-3 py-2 outline-none focus:border-black text-sm font-sans"
                    >
                      <option value="placed">Placed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <button
                    onClick={() => handleUpdateStatus(order.id)}
                    disabled={updatingOrderId === order.id || (statusUpdates[order.id] || order.status) === order.status}
                    className="px-6 py-2 bg-[#0a0a0a] text-[#F9F8F4] text-[10px] uppercase tracking-[0.3em] font-sans rounded-lg hover:bg-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {updatingOrderId === order.id ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;

