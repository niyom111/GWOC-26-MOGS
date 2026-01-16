import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { Page, CoffeeItem, CartItem } from './types';
import Header from './components/Header';
import Hero from './components/Hero';
import StickySection from './components/StickySection';
import GalleryTeaser from './components/GalleryTeaser';
import MenuPreview from './components/MenuPreview';
import Reviews from './components/Reviews';
import MenuPage from './components/MenuPage';
import CartPage from './components/CartPage';
import WorkshopPage from './components/WorkshopPage';
import ArtPage from './components/ArtPage';
import PhilosophyPage from './components/PhilosophyPage';
import Footer from './components/Footer';
import PaymentFailurePage from './components/PaymentFailurePage';
import AdminDashboard from './components/AdminDashboard';


import FindStorePage from './components/FindStorePage';
import RobustaStory from './components/RobustaStory';
import FAQPage from './components/FAQPage';
import FranchisePage from './components/FranchisePage';
import TrackOrderPage from './components/TrackOrderPage';
import EmployeeDashboard from './components/EmployeeDashboard';
import { motion as motionBase, AnimatePresence } from 'framer-motion';
import { DataProvider, useDataContext } from './DataContext';
import { API_BASE_URL } from './config';

import ChatWidget from './components/ChatWidget';

import ManifestoSection from './components/ManifestoSection';
import ProcessScroll from './components/ProcessScroll';
import StatsSection from './components/StatsSection';


// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

// ScrollToTop component to reset scroll only when new page mounts
// Moved outside App to prevent re-mounting on state changes (like cart updates)
// ScrollToTop component removed in favor of manual restoration logic in App

const AppContent: React.FC = () => {
  const { artItems, refreshArtItems } = useDataContext();

  const pathToPage = (path: string): Page => {
    switch (path) {
      case '/menu':
        return Page.MENU;
      case '/cart':
        return Page.CART;
      case '/workshops':
        return Page.WORKSHOPS;
      case '/art':
        return Page.ART;
      case '/philosophy':
        return Page.PHILOSOPHY;
      case '/find-store':
        return Page.FIND_STORE;
      case '/robusta-story':
        return Page.ROBUSTA_STORY;
      case '/faq':
        return Page.FAQ;
      case '/franchise':
        return Page.FRANCHISE;
      case '/track-order':
        return Page.TRACK_ORDER;
      case '/employee':
        return Page.EMPLOYEE;
      case '/admin':
        return Page.ADMIN;
      default:
        return Page.HOME;
    }
  };

  const pageToPath = (page: Page): string => {
    switch (page) {
      case Page.MENU:
        return '/menu';
      case Page.CART:
        return '/cart';
      case Page.WORKSHOPS:
        return '/workshops';
      case Page.ART:
        return '/art';
      case Page.PHILOSOPHY:
        return '/philosophy';
      case Page.FIND_STORE:
        return '/find-store';
      case Page.ROBUSTA_STORY:
        return '/robusta-story';
      case Page.FAQ:
        return '/faq';
      case Page.FRANCHISE:
        return '/franchise';
      case Page.TRACK_ORDER:
        return '/track-order';
      case Page.EMPLOYEE:
        return '/employee';
      case Page.ADMIN:
        return '/admin';
      case Page.HOME:
      default:
        return '/';
    }
  };

  const [currentPage, setCurrentPage] = useState<Page>(() => pathToPage(window.location.pathname));
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem('rabuste_cart');
      if (!raw) return [];
      const parsed = JSON.parse(raw) as CartItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(pathToPage(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('rabuste_cart', JSON.stringify(cart));
    } catch {
      // ignore write errors
    }
  }, [cart]);

  const navigateTo = (page: Page) => {
    const newPath = pageToPath(page);

    // If navigating to the same page (e.g. clicking Home logo while on Home), just scroll to top
    if (window.location.pathname === newPath) {
      window.scrollTo(0, 0);
      return;
    }

    if (window.location.pathname !== newPath) {
      // Save scroll position of current page before leaving
      const currentState = window.history.state || {};
      window.history.replaceState({ ...currentState, scrollY: window.scrollY }, '');

      window.history.pushState({ page }, '', newPath);
    }
    setCurrentPage(page);
  };

  const addToCart = (item: CoffeeItem) => {
    // Check if this is an art item and validate stock
    const isArtItem = artItems.some(art => art.id === item.id);

    if (isArtItem) {
      const artItem = artItems.find(art => art.id === item.id);
      if (artItem) {
        const existing = cart.find(i => i.id === item.id);
        const currentCartQuantity = existing?.quantity || 0;
        const requestedQuantity = currentCartQuantity + 1;

        if (requestedQuantity > artItem.stock) {
          alert(`Only ${artItem.stock} piece${artItem.stock > 1 ? 's' : ''} available. You already have ${currentCartQuantity} in your cart.`);
          return;
        }
      }
    }

    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = async (id: string) => {
    // Remove from cart (stock is only decremented when order is placed, not when adding/removing from cart)
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;

    // Check if this is an art item and validate stock
    const isArtItem = artItems.some(art => art.id === id);

    if (isArtItem) {
      const artItem = artItems.find(art => art.id === id);
      if (artItem && quantity > artItem.stock) {
        alert(`Only ${artItem.stock} piece${artItem.stock > 1 ? 's' : ''} available.`);
        return;
      }
    }

    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Track first mount for reload detection
  const isFirstMount = React.useRef(true);

  // Manual Scroll Restoration
  React.useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // On page reload (F5), force scroll to top
    if (isFirstMount.current) {
      isFirstMount.current = false;
      const navEntries = performance.getEntriesByType("navigation");
      if (navEntries.length > 0) {
        const navEntry = navEntries[0] as PerformanceNavigationTiming;
        if (navEntry.type === 'reload') {
          // Clear any saved scroll from history state so it doesn't persist
          const currentState = window.history.state || {};
          if (currentState.scrollY) {
            const newState = { ...currentState };
            delete newState.scrollY;
            window.history.replaceState(newState, '');
          }

          window.scrollTo(0, 0);
          return;
        }
      }
    }

    // Restore scroll or reset to top
    // REMOVED: Auto-scroll logic moved to onExitComplete to prevent jumps
    const state = window.history.state;
    // if (state && typeof state.scrollY === 'number') {
    //   window.scrollTo(0, state.scrollY);
    // } else {
    //   window.scrollTo(0, 0);
    // }
  }, [currentPage]);

  const handleExitComplete = () => {
    // Restore scroll or reset to top AFTER exit animation finishes
    const state = window.history.state;
    if (state && typeof state.scrollY === 'number') {
      window.scrollTo(0, state.scrollY);
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  return (
    <DataProvider>
      <div className="min-h-screen font-sans bg-[#F9F8F4] text-[#1A1A1A]">
        {currentPage !== Page.ADMIN && currentPage !== Page.EMPLOYEE && (
          <Header onNavigate={navigateTo} currentPage={currentPage} cartCount={cartCount} />
        )}

        <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => {
              // Vital for position: fixed/sticky to work
              document.body.style.overflowX = 'hidden';
            }}
            id="page-transition-wrapper"
          >
            {/* ScrollToTop removed */}
            {currentPage === Page.HOME && (
              <>
                <Hero />
                <StickySection onNavigate={navigateTo} />
                <StatsSection />
                <ManifestoSection />
                <ProcessScroll />
                <GalleryTeaser onNavigate={() => navigateTo(Page.ART)} />
                <MenuPreview onAddToCart={addToCart} onGoToMenu={() => navigateTo(Page.MENU)} />
                <Reviews />
              </>
            )}

            {currentPage === Page.MENU && (
              <MenuPage onAddToCart={addToCart} />
            )}

            {currentPage === Page.CART && (
              <CartPage
                cart={cart}
                onRemove={removeFromCart}
                onUpdateQuantity={updateQuantity}
                onBackToMenu={() => navigateTo(Page.MENU)}
                onClearCart={() => setCart([])}
                onBackToHome={() => navigateTo(Page.HOME)}
                onPaymentFailure={() => navigateTo(Page.PAYMENT_FAILURE)}
                artItems={artItems}
              />
            )}

            {currentPage === Page.WORKSHOPS && (
              <WorkshopPage />
            )}

            {currentPage === Page.ART && (
              <ArtPage onAddToCart={addToCart} cart={cart} artItems={artItems} />
            )}

            {currentPage === Page.PHILOSOPHY && (
              <PhilosophyPage onNavigate={navigateTo} />
            )}

            {currentPage === Page.FIND_STORE && (
              <FindStorePage />
            )}

            {currentPage === Page.ROBUSTA_STORY && (
              <RobustaStory onBack={() => navigateTo(Page.PHILOSOPHY)} />
            )}

            {currentPage === Page.FAQ && (
              <FAQPage />
            )}

            {currentPage === Page.FRANCHISE && (
              <FranchisePage />
            )}

            {currentPage === Page.TRACK_ORDER && (
              <TrackOrderPage onNavigate={navigateTo} />
            )}

            {currentPage === Page.EMPLOYEE && (
              <EmployeeDashboard onNavigate={navigateTo} onBack={() => navigateTo(Page.HOME)} />
            )}

            {currentPage === Page.ADMIN && (
              <AdminRoute onBack={() => navigateTo(Page.HOME)}>
                {handleLogout => (
                  <AdminDashboard onBack={() => navigateTo(Page.HOME)} onLogout={handleLogout} />
                )}
              </AdminRoute>
            )}
          </motion.div>
        </AnimatePresence>

        {currentPage !== Page.ADMIN && currentPage !== Page.EMPLOYEE && currentPage !== Page.TRACK_ORDER && <Footer onNavigate={navigateTo} />}

        {/* --- ADDED CHAT WIDGET HERE --- */}
        {currentPage !== Page.ADMIN && currentPage !== Page.EMPLOYEE && currentPage !== Page.CART && <ChatWidget />}
      </div>
    </DataProvider>
  );
};

// Simple hardcoded admin login gate with loading overlay
const AdminRoute: React.FC<{ children: (logout: () => void) => React.ReactNode, onBack: () => void }> = ({ children, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLogin, setLastLogin] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('rabuste_last_login');
  });

  // Check for persistent session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = window.sessionStorage.getItem('rabuste_admin_session');
      if (session === 'active') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoading(true);
    const now = new Date().toISOString();

    setTimeout(() => {
      // Save this successful login time for the next visit
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('rabuste_last_login', now);
        window.sessionStorage.setItem('rabuste_admin_session', 'active');
      }
      setIsLoading(false);
      setIsAuthenticated(true);
      setUsername('');
      setPassword('');
      setError(null);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'rabustecafeadmin' && password === 'Admin@6767') {
      handleLoginSuccess();
    } else {
      setError('Invalid Credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setError(null);
    setIsLoading(false);
    // Refresh lastLogin from storage so the login card shows the most recent timestamp
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('rabuste_last_login');
      setLastLogin(stored);
      window.sessionStorage.removeItem('rabuste_admin_session');
    }
  };

  if (isAuthenticated) {
    return <>{children(handleLogout)}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src="/media/login.png" alt="Login Background" className="w-full h-full object-cover" />
      </div>

      <div className="w-full max-w-sm bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-8 z-10 relative">
        <h1 className="text-2xl font-serif mb-2 text-center">Admin Login</h1>
        <p className="text-xs text-zinc-500 font-sans mb-4 text-center uppercase tracking-[0.25em]">
          Rabuste Coffee
        </p>
        {lastLogin && (
          <p className="text-[10px] text-zinc-500 font-sans mb-4 text-center">
            Last successful login:{' '}
            {new Date(lastLogin).toLocaleString()}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.25em] mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-transparent border border-black/20 rounded-md px-3 py-2 outline-none focus:border-black"
              placeholder="Enter Username"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.25em] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent border border-black/20 rounded-md px-3 py-2 outline-none focus:border-black"
              placeholder="Enter Password"
              required
            />
          </div>
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          <button
            type="submit"
            className="w-full mt-4 py-2.5 bg-[#0a0a0a] text-[#F9F8F4] text-[10px] uppercase tracking-[0.3em] rounded-full hover:bg-black transition-colors disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <button
          onClick={onBack}
          className="w-full mt-4 py-2 text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-sans hover:text-[#0a0a0a] transition-colors"
        >
          Back
        </button>
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white border border-black rounded-xl px-8 py-6 shadow-xl flex flex-col items-center space-y-4"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className="w-3 h-3 rounded-full bg-black animate-pulse" />
              <p className="text-xs font-sans uppercase tracking-[0.25em] text-black">
                Signing in...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;