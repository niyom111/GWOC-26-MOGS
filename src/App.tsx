import React, { useState, useEffect } from 'react';
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
import AwarenessPage from './components/AwarenessPage';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import FindStorePage from './components/FindStorePage';
import RobustaStory from './components/RobustaStory';
import FAQPage from './components/FAQPage';
import { motion as motionBase, AnimatePresence } from 'framer-motion';
import { DataProvider } from './DataContext';

import ChatWidget from './components/ChatWidget';


// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

const App: React.FC = () => {
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
        return Page.AWARENESS;
      case '/find-store':
        return Page.FIND_STORE;
      case '/robusta-story':
        return Page.ROBUSTA_STORY;
      case '/faq':
        return Page.FAQ;
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
      case Page.AWARENESS:
        return '/philosophy';
      case Page.FIND_STORE:
        return '/find-store';
      case Page.ROBUSTA_STORY:
        return '/robusta-story';
      case Page.FAQ:
        return '/faq';
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
    if (window.location.pathname !== newPath) {
      window.history.pushState({ page }, '', newPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
  };

  const addToCart = (item: CoffeeItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <DataProvider>
      <div className="min-h-screen font-sans bg-[#F9F8F4] text-[#1A1A1A]">
        <Header onNavigate={navigateTo} currentPage={currentPage} cartCount={cartCount} />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {currentPage === Page.HOME && (
              <>
                <Hero />
                <StickySection />
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
              />
            )}

            {currentPage === Page.WORKSHOPS && (
              <WorkshopPage />
            )}

            {currentPage === Page.ART && (
              <ArtPage onAddToCart={addToCart} />
            )}

            {currentPage === Page.AWARENESS && (
              <AwarenessPage onNavigate={navigateTo} />
            )}

            {currentPage === Page.FIND_STORE && (
              <FindStorePage />
            )}

            {currentPage === Page.ROBUSTA_STORY && (
              <RobustaStory onBack={() => navigateTo(Page.AWARENESS)} />
            )}

            {currentPage === Page.FAQ && (
              <FAQPage />
            )}

            {currentPage === Page.ADMIN && (
              <AdminRoute>
                {handleLogout => (
                  <AdminDashboard onBack={() => navigateTo(Page.HOME)} onLogout={handleLogout} />
                )}
              </AdminRoute>
            )}
          </motion.div>
        </AnimatePresence>

        {currentPage !== Page.ADMIN && <Footer onNavigate={navigateTo} />}

        {/* --- ADDED CHAT WIDGET HERE --- */}
        <ChatWidget />
      </div>
    </DataProvider>
  );
};

// Simple hardcoded admin login gate with loading overlay
const AdminRoute: React.FC<{ children: (logout: () => void) => React.ReactNode }> = ({ children }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLogin, setLastLogin] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('rabuste_last_login');
  });

  const handleLoginSuccess = () => {
    setIsLoading(true);
    const now = new Date().toISOString();

    setTimeout(() => {
      // Save this successful login time for the next visit
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('rabuste_last_login', now);
      }
      setIsLoading(false);
      setIsAuthenticated(true);
      setEmail('');
      setPassword('');
      setError(null);
      // We intentionally do NOT update lastLogin here so the login screen
      // always shows the previous successful login timestamp.
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'robustecafe@gmail.com' && password === 'GWOC26@robusta') {
      handleLoginSuccess();
    } else {
      setError('Invalid Credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setError(null);
    setIsLoading(false);
    // Refresh lastLogin from storage so the login card shows the most recent timestamp
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('rabuste_last_login');
      setLastLogin(stored);
    }
  };

  if (isAuthenticated) {
    return <>{children(handleLogout)}</>;
  }

  return (
    <div className="min-h-screen bg-[#F9F8F4] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="w-full max-w-sm bg-white border border-black/10 rounded-xl shadow-sm p-8 z-10">
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
            <label className="block text-[11px] uppercase tracking-[0.25em] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-transparent border border-black/20 rounded-md px-3 py-2 outline-none focus:border-black"
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

export default App;