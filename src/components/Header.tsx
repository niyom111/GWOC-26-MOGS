import React from 'react';
import { motion as motionBase, AnimatePresence as AnimatePresenceBase, useScroll, useMotionValueEvent, useTransform } from 'framer-motion';
import { ShoppingBag, Menu, X } from 'lucide-react';
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
    { label: 'Our Story', page: Page.AWARENESS },
    { label: 'Find Store', page: Page.FIND_STORE },
    { label: 'Track Order', page: Page.TRACK_ORDER },
    { label: 'Franchise', page: Page.FRANCHISE },
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
  // MENU BUTTON BACKGROUND:
  // Always brand brown now
  const menuButtonBg = 'bg-[#A35D36] border-[#A35D36]';

  // --- SCROLL VISIBILITY LOGIC ---
  const { scrollY } = useScroll();
  const [isHovered, setIsHovered] = React.useState(false);

  // Create a smooth opacity value based on scroll position
  const scrollOpacity = useTransform(scrollY, [0, 200], [1, 0.8]);

  return (
    <>
      {/* HEADER CONTAINER (Logo & Cart Only) */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`${isHome ? 'fixed' : 'relative'} top-0 left-0 w-full z-40 pointer-events-none`}
      >
        <div
          className={`relative flex items-center justify-between px-6 ${isHome ? 'py-1' : 'pt-2 pb-3'
            }`}
        >
          {/* LOGO */}
          <div className="flex-1 pointer-events-auto">
            {!isHome && currentPage !== Page.ADMIN && (
              <button
                onClick={() => handleNavigate(Page.HOME)}
                className="absolute top-6 left-8 z-50 flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <img
                  src="/media/logo.png"
                  alt="Rabuste Logo"
                  className={`h-16 md:h-20 w-32 object-contain ${logoFilterClass}`}
                />
              </button>
            )}
          </div>

          {/* RIGHT SIDE ICONS */}
          {currentPage !== Page.ADMIN && (
            <div className={`fixed top-5 right-5 md:top-9 md:right-12 z-50 flex items-center space-x-3 md:space-x-4 pointer-events-auto ${textColorClass}`}>
              {/* Cart Button */}
              <button
                onClick={() => handleNavigate(Page.CART)}
                className="relative cursor-pointer opacity-100 hover:opacity-70 transition-opacity text-[#A35D36]"
              >
                <ShoppingBag className="w-5 h-5 md:w-7 md:h-7" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`absolute -top-2 -right-2 text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-black ${isHome ? 'bg-white text-black' : 'bg-black text-white'}`}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              {/* Hamburger Menu Button (Mobile Only) */}
              <button
                onClick={() => setMenuOpen(true)}
                className="relative cursor-pointer hover:opacity-80 transition-opacity text-white md:hidden"
                aria-label="Open navigation menu"
              >
                <span className={`inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border ${menuButtonBg}`}>
                  <Menu className="w-5 h-5 md:w-6 md:h-6" />
                </span>
              </button>
            </div>
          )}
        </div>
      </motion.header>

      {/* HORIZONTAL FOOTER NAVIGATION (Desktop Only) */}
      {currentPage !== Page.ADMIN && (
        <motion.nav
          style={{ opacity: isHovered ? 1 : scrollOpacity }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="hidden md:flex fixed top-6 left-0 right-0 z-50 justify-center px-4 pointer-events-none"
        >
          <div className="bg-black/30 backdrop-blur-xl rounded-xl shadow-2xl px-2 py-2 flex items-center max-w-full overflow-x-auto no-scrollbar border border-white/10 pointer-events-auto">
            <div className="flex items-center space-x-1 px-2">
              {navLinks.map((link) => {
                const isActive = currentPage === link.page;
                return (
                  <button
                    key={link.page}
                    onClick={() => handleNavigate(link.page)}
                    className={`
                      relative px-5 py-3 rounded-full text-[10px] md:text-xs uppercase tracking-[0.15em] font-bold whitespace-nowrap transition-all duration-300
                      ${isActive
                        ? 'bg-[#F3EFE0] text-black shadow-md'
                        : 'text-white hover:bg-white/10'
                      }
                    `}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.nav>
      )}

      {/* SIDEBAR DRAWER (Mobile Only) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-black/60 md:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed right-0 top-0 h-full w-[80vw] max-w-sm bg-white text-[#0a0a0a] px-8 py-10 flex flex-col shadow-2xl"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <button
                onClick={() => setMenuOpen(false)}
                className="absolute top-6 right-6 text-sm uppercase tracking-[0.3em] flex items-center space-x-2 hover:opacity-70 transition-opacity text-[#0a0a0a]"
                aria-label="Close navigation menu"
              >
                <span className="text-[10px]">Close</span>
                <X className="w-5 h-5" />
              </button>

              <div className="mt-12 space-y-6 text-right">
                {navLinks.map((link, idx) => (
                  <button
                    key={link.page}
                    onClick={() => handleNavigate(link.page)}
                    className="group block w-full text-right text-2xl font-serif font-medium tracking-tight text-[#0a0a0a]"
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