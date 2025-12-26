
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
import { MenuProvider } from './context/MenuContext';

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
      <MenuProvider>
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
            <ArtPage onAddToCart={() => {}} /> 
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
            <AdminDashboard onBack={() => navigateTo(Page.HOME)} />
          )}
          </motion.div>
        </AnimatePresence>

        {currentPage !== Page.ADMIN && <Footer onNavigate={navigateTo} />}
      </div>
      </MenuProvider>
    </DataProvider>
  );
};

export default App;
