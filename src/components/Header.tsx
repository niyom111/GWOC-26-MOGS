import React from 'react';
import { motion as motionBase, AnimatePresence as AnimatePresenceBase } from 'framer-motion';
import { ShoppingBag, Menu, User, X } from 'lucide-react';
import { Page } from '../types';

// Fix for framer-motion type mismatch
const motion = motionBase as any;
const AnimatePresence = AnimatePresenceBase as any;

interface HeaderProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
  cartCount: number;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage, cartCount }) => {
  const navLinks = [
    { label: 'Menu', page: Page.MENU },
    { label: 'Workshops', page: Page.WORKSHOPS },
    { label: 'Art Gallery', page: Page.ART },
    { label: 'Philosophy', page: Page.AWARENESS },
    { label: 'Find Store', page: Page.FIND_STORE },
  ];

  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    setMenuOpen(false);
  };

  const isHome = currentPage === Page.HOME;

  // --- EXPLICIT COLOR MODES ---
  // HOME (Dark Video): Text is White.
  // INNER (Light Cream): Text is Black.
  const textColorClass = isHome ? 'text-white' : 'text-[#0a0a0a]';
  
  // LOGO FILTER:
  // Home: brightness-100 (Keeps it White/Original)
  // Inner: brightness-0 (Forces it to SOLID BLACK)
  const logoFilterClass = isHome ? 'brightness-100' : 'brightness-0';

  // MENU BUTTON BACKGROUND:
  // Home: Dark glass effect.
  // Inner: Subtle dark ring for contrast against cream.
  const menuButtonBg = isHome 
    ? 'bg-black/50 border-white/10 backdrop-blur-md' 
    : 'bg-black/5 border-black/10';

  return (
    <>
      {/* HEADER CONTAINER */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`${isHome ? 'fixed' : 'relative'} top-0 left-0 w-full z-40 pointer-events-none`}
      >
        <div
          className={`relative flex items-center px-6 ${
            isHome ? 'py-1' : 'pt-2 pb-3'
          }`}
        >
          {/* LOGO (Inner Pages Only - or Conditional) */}
          {/* We show logo on inner pages to navigate home, but hide it on Admin. */}
          {!isHome && currentPage !== Page.ADMIN && (
            <button
              onClick={() => handleNavigate(Page.HOME)}
              className="absolute top-6 left-8 z-50 flex items-center justify-center hover:opacity-80 transition-opacity pointer-events-auto"
            >
              <img
                src="/media/logo.png"
                alt="Rabuste Logo"
                className={`h-16 md:h-20 w-30 object-contain ${logoFilterClass}`} 
              />
            </button>
          )}

      {/* RIGHT SIDE ICONS */}
      {currentPage !== Page.ADMIN && (
      <div className={`fixed top-4 right-4 z-50 flex items-center space-x-4 md:space-x-6 pointer-events-auto ${textColorClass}`}>
            
            {/* Portal Button */}
            <button 
              onClick={() => handleNavigate(Page.ADMIN)}
              className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.4em] font-sans font-semibold opacity-100 hover:opacity-70 transition-opacity"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Portal</span>
            </button>

            {/* Cart Button */}
            <button 
              onClick={() => handleNavigate(Page.CART)}
              className="relative cursor-pointer opacity-100 hover:opacity-70 transition-opacity"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  // Badge Colors Flipped for Contrast
                  className={`absolute -top-2 -right-2 text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-black ${isHome ? 'bg-white text-black' : 'bg-black text-white'}`}
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMenuOpen(true)}
              className="relative cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="Open navigation menu"
            >
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${menuButtonBg}`}>
                <Menu className="w-5 h-5" />
              </span>
            </button>
          </div>
      )}
        </div>
      </motion.header>

      {/* SIDEBAR DRAWER (Solid White) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-black/60" // Dark overlay
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              // DRAWER: Always White BG, Black Text
              className="fixed right-0 top-0 h-full w-72 md:w-80 lg:w-[26vw] max-w-md bg-white text-[#0a0a0a] px-8 py-10 md:px-10 md:py-16 flex flex-col shadow-2xl"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <button
                onClick={() => setMenuOpen(false)}
                className="absolute top-6 right-6 text-sm uppercase tracking-[0.3em] flex items-center space-x-2 hover:opacity-70 transition-opacity text-[#0a0a0a]"
                aria-label="Close navigation menu"
              >
                <span className="hidden md:inline text-[10px]">Close</span>
                <X className="w-5 h-5" />
              </button>

              <div className="mt-10 space-y-5 md:space-y-6 text-right">
                {navLinks.map((link, idx) => (
                  <button
                    key={link.page}
                    onClick={() => handleNavigate(link.page)}
                    className="group block w-full text-right text-2xl md:text-3xl font-serif font-medium tracking-tight text-[#0a0a0a]"
                    style={{ transitionDelay: `${idx * 60}ms` }}
                  >
                    <span className="relative inline-block">
                      <span className="relative z-10">{link.label}</span>
                      <span className="absolute right-0 bottom-0 h-px w-0 bg-[#0a0a0a] transition-all duration-300 group-hover:w-full" />
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;