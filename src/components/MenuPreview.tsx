import React from 'react';
import { motion as motionBase, useInView } from 'framer-motion';
import { CoffeeItem } from '../types';
import { useDataContext } from '../DataContext';
import StatusPopup from './StatusPopup';
import Toast from './Toast';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

interface MenuPreviewProps {
  onAddToCart: (item: CoffeeItem) => void;
  onGoToMenu: () => void;
}

const items = [
  {
    id: 'robusta-cold-non-milk-iced-americano',
    name: "Robusta Iced Americano",
    tagline: "The Wake Up Call.",
    notes: "Pure & Unapologetic",
    caffeine: "Extreme",
    intensity: 9,
    price: 160,
    image: "/media/robusta iced americano.png",
    description: "A double shot of Grade-A Robusta over ice. No sugar, no lies. The ultimate caffeine punch."
  },
  {
    id: 'robusta-cold-milk-iced-latte',
    name: "Robusta Iced Latte",
    tagline: "Creamy Intensity.",
    notes: "Bold & Smooth",
    caffeine: "High",
    intensity: 7,
    price: 220,
    image: "/media/robusta iced latte.png",
    description: "Our signature Robusta tamed by milk, but never silenced. A perfect balance of strength and comfort."
  },
  {
    id: 'manual-brew-cranberry-cold-brew-tonic',
    name: "Cranberry Cold Brew Tonic",
    tagline: "Fruity & Complex.",
    notes: "Tart & Refreshing",
    caffeine: "Medium",
    intensity: 6,
    price: 280,
    image: "/media/Cranberry Cold Brew Tonic.png",
    description: "Cold brew steeped for 18h, collided with tonic and cranberry. A sparkling, complex refresher."
  },
  {
    id: 'food-nutella-croissant',
    name: "Nutella Croissant",
    tagline: "Decadence.",
    notes: "Flaky & Rich",
    caffeine: "None",
    intensity: 0,
    price: 200,
    image: "/media/nutella croissant.png",
    description: "Butter croissant filled generously with Nutella. A flaky, chocolaty guilty pleasure."
  },
];

// Helper hook for mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

// Helper component for individual cards
const MenuCard: React.FC<{ item: typeof items[0], index: number, onAddToCart: (item: any) => void }> = ({ item, index, onAddToCart }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { margin: "-40% 0px -40% 0px" });
  const isMobile = useIsMobile();

  // Desktop: hidden/visible (inherited from parent stagger)
  const desktopVariants = {
    hidden: { y: '-100%', x: 0, opacity: 0 },
    visible: {
      y: 0, x: 0, opacity: 1,
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
    }
  };

  // Mobile: mobileHidden/mobileVisible (triggered individually by scroll)
  // We use DIFFERENT keys to break inheritance from parent's 'visible' propagation
  const mobileVariants = {
    mobileHidden: { x: -50, opacity: 0 },
    mobileVisible: {
      x: 0, y: 0, opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      ref={ref}
      // Select variant set based on device
      variants={isMobile ? mobileVariants : desktopVariants}
      // Initial state: uses specific key based on device, or undefined (inherits) for desktop
      initial={isMobile ? "mobileHidden" : undefined}
      // Trigger: Mobile -> explicit whileInView. Desktop -> relies on parent propagation (undefined here)
      whileInView={isMobile ? "mobileVisible" : undefined}
      viewport={isMobile ? { once: true, amount: 0.1 } : undefined}
      className="group relative w-full h-full overflow-hidden bg-[#0a0a0a] min-h-[80vh] md:min-h-auto"
    >
      {/* Vivid Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <div className={`absolute inset-0 bg-black/20 transition-colors duration-700 z-10 md:group-hover:bg-black/60 ${isInView ? 'bg-black/60' : ''}`} />
        <img
          src={item.image}
          className={`block w-full h-full object-cover transition-transform duration-[2s] ease-out md:group-hover:scale-105 ${isInView ? 'scale-105' : 'scale-100'}`}
          alt={item.name}
        />
      </div>

      {/* Readability Gradient */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60" />

      {/* Content Container */}
      <div className="absolute inset-0 z-30 flex flex-col justify-end pb-40 md:pb-24 px-8 md:px-12">

        {/* Always Visible Title */}
        <div className={`transform transition-all duration-700 relative z-40 md:group-hover:-translate-y-4 ${isInView ? '-translate-y-4' : 'translate-y-0'}`}>
          <span className="text-[10px] text-[#A35D36] uppercase tracking-[0.3em] font-bold block mb-4">
            {item.notes}
          </span>
          <h3 className="text-4xl md:text-6xl font-sans leading-none mb-4 text-white">
            {item.name}
          </h3>
        </div>

        {/* Interaction Stack */}
        <div className="relative min-h-[140px]">

          {/* Tagline: Visible by default on Desktop. On Mobile, visible ONLY when NOT in view. */}
          <div className={`absolute top-0 left-0 w-full transition-all duration-300 transform pointer-events-none
              md:opacity-100 md:translate-y-0 md:group-hover:opacity-0 md:group-hover:translate-y-4
              ${isInView ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
            `}>
            <p className="text-2xl font-sans text-zinc-300 tracking-wide">
              {item.tagline}
            </p>
            <div className="mt-8 w-12 h-[1px] bg-white/30" />
          </div>

          {/* Description & Button: Hidden by default on Desktop. On Mobile, visible ONLY when IN VIEW. */}
          <div className={`absolute top-0 left-0 w-full transition-all duration-300 transform
              md:opacity-0 md:translate-y-8 md:group-hover:opacity-100 md:group-hover:translate-y-0
              ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}>
            <p className="text-xl text-zinc-300 leading-relaxed mb-8 font-sans border-l-2 border-[#A35D36] pl-4 max-w-sm">
              {item.description}
            </p>

            <div className="flex items-center gap-8">
              <span className="text-3xl font-serif italic text-white">₹{item.price}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(item);
                }}
                className="px-8 py-4 bg-white text-black min-w-[160px] text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-[#A35D36] hover:text-white transition-colors shadow-xl"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MenuPreview: React.FC<MenuPreviewProps> = ({ onAddToCart, onGoToMenu }) => {
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const toastTimeoutRef = React.useRef<number | null>(null);
  const isMobile = useIsMobile();

  // Get settings for order availability check
  const { orderSettings } = useDataContext();
  const [isOrderPopupOpen, setIsOrderPopupOpen] = React.useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToastMessage(null), 2000); // 2s duration for visibility
  };

  const handleAddToCart = (item: CoffeeItem) => {
    if (orderSettings && !orderSettings.menu_orders_enabled) {
      setIsOrderPopupOpen(true);
      return;
    }
    onAddToCart(item);
    showToast(`${item.name} added to cart`);
  };

  // Parent Variants
  const parentDesktopVariants = {
    hidden: {}, // Original code didn't hide parent opacity
    visible: {
      transition: { staggerChildren: 0.3 }
    }
  };

  // Mobile Parent: Always visible (opacity 1) so it doesn't hide children.
  // We use same keys 'hidden'/'visible' so we can keep simple props,
  // but values ensure visibility.
  const parentMobileVariants = {
    hidden: { opacity: 1 },
    visible: { opacity: 1 }
  };

  return (
    <section className="relative w-full min-h-0 md:min-h-screen bg-[#111] text-[#F3F3F3] overflow-x-hidden flex flex-col">
      {/* Heading Section - Moved above products */}
      <div className="relative w-full py-20 bg-[#F3EFE0] z-10 text-center border-b border-black/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[12px] uppercase tracking-[0.5em] text-zinc-900 font-bold mb-6 block">
            Handpicked
          </span>
          <h2 className="text-6xl md:text-8xl font-serif text-[#1A1A1A] tracking-tighter mb-10 italic">
            The Selection.
          </h2>
          <button
            onClick={onGoToMenu}
            className="px-10 py-4 border border-black/20 text-[#1A1A1A] text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#1A1A1A] hover:text-[#F3EFE0] transition-colors"
          >
            View Full Menu
          </button>
        </motion.div>
      </div>

      {/* Full Screen Vertical Strips */}
      <motion.div
        // Parent always uses standard keys 'hidden'/'visible'
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        // Swap variant definitions based on device
        variants={isMobile ? parentMobileVariants : parentDesktopVariants}
        className="w-full flex-1 grid grid-cols-1 md:grid-cols-4 md:min-h-[600px]"
      >
        {items.map((item, idx) => (
          <MenuCard key={idx} item={item} index={idx} onAddToCart={handleAddToCart} />
        ))}
      </motion.div>

      <StatusPopup
        isOpen={isOrderPopupOpen}
        onClose={() => setIsOrderPopupOpen(false)}
        title="We're Closed for Now"
        message="We are not accepting new menu orders at the moment. Please check back soon!"
        type="info"
      />

      <Toast message={toastMessage} />
    </section>
  );
};

export default MenuPreview;
