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
    { label: 'Home', page: Page.HOME },
    { label: 'Menu', page: Page.MENU },
    { label: 'Workshops', page: Page.WORKSHOPS },
    { label: 'Art Gallery', page: Page.ART },
    { label: 'Philosophy', page: Page.PHILOSOPHY },
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
  const isFranchise = currentPage === Page.FRANCHISE;
  // GLOBAL ADAPTIVE COLORS:
  // We use mix-blend-difference on the header so icons invert based on background.
  // This requires the icons themselves to be white (or light) to contrast properly when inverted.
  const textColorClass = 'text-[#F3EFE0]';
  const logoFilterClass = 'brightness-100';



  // --- SCROLL VISIBILITY LOGIC ---
  const { scrollY } = useScroll();
  const [isHovered, setIsHovered] = React.useState(false);

  // Smooth scroll animations mapping exact scroll positions to visual styles
  const navOpacity = useTransform(scrollY, [0, 200], [1, 0.8]);
  const navBackground = useTransform(scrollY, [0, 200], ["rgba(0,0,0,0.45)", "rgba(0,0,0,0.2)"]);

  return (
    <>
      {/* LOGO CONTAINER (Absolute - Scrolls with page) */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="absolute top-0 left-0 w-full z-50 pointer-events-none transition-all duration-700 mix-blend-difference"
      >
        <div className={`relative flex items-center justify-between px-6 ${isHome ? 'py-1' : 'pt-2 pb-3'}`}>
          {/* LOGO (Inner Pages Only - or Conditional) */}
          {!isHome && currentPage !== Page.ADMIN && (
            <button
              onClick={() => handleNavigate(Page.HOME)}
              className={`absolute top-6 left-8 z-50 flex items-center justify-center hover:opacity-80 transition-opacity pointer-events-auto ${currentPage === Page.FIND_STORE ? 'md:hidden' : ''}`}
            >
              <img
                src="/media/logo.png"
                alt="Rabuste Logo"
                className={`h-16 md:h-20 w-30 object-contain ${logoFilterClass}`}
              />
            </button>
          )}
        </div>
      </motion.header>

      {/* RIGHT SIDE ICONS (Fixed - Sticky) */}
      {currentPage !== Page.ADMIN && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`fixed top-4 right-4 md:top-8 md:right-12 z-50 flex items-center space-x-4 md:space-x-6 pointer-events-auto ${textColorClass} mix-blend-difference`}
        >
          {/* Cart Button */}
          <button
            onClick={() => handleNavigate(Page.CART)}
            className="relative cursor-pointer opacity-100 hover:opacity-70 transition-opacity"
          >
            <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                // Badge Colors Flipped for Contrast
                className="absolute -top-2 -right-2 text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-black bg-[#F3EFE0] text-black"
              >
                {cartCount}
              </motion.span>
            )}
          </button>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="relative cursor-pointer hover:opacity-80 transition-opacity md:hidden p-2"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </motion.div>
      )}

      {/* HORIZONTAL FOOTER NAVIGATION (Desktop Only) */}
      {currentPage !== Page.ADMIN && (
        <motion.nav
          style={{ opacity: isHovered ? 1 : navOpacity }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="hidden md:flex fixed top-6 left-0 right-0 z-50 justify-center px-4 pointer-events-none"
        >
          <motion.div
            style={{
              backgroundColor: navBackground
            }}
            className="backdrop-blur-xl rounded-xl shadow-2xl px-2 py-2 flex items-center max-w-full overflow-x-auto no-scrollbar pointer-events-auto"
          >
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
          </motion.div>
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