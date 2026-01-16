
import React from 'react';
import { motion as motionBase, useInView } from 'framer-motion';
import { CoffeeItem } from '../types';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

interface MenuPreviewProps {
  onAddToCart: (item: CoffeeItem) => void;
  onGoToMenu: () => void;
}

const items = [
  {
    id: '1',
    name: "Midnight Roast",
    tagline: "Taste the Void.",
    notes: "Dark Chocolate & Smoke",
    caffeine: "Extreme",
    intensity: 9,
    price: 470,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=1974",
    description: "Our flagship dark roast. A dense, smoky profile that swallows light and wakes the dead."
  },
  {
    id: '2',
    name: "Gallery Blend",
    tagline: "Curated Complexity.",
    notes: "Berry & Walnut",
    caffeine: "High",
    intensity: 7,
    price: 400,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=1974",
    description: "Balanced for the artist's palate. Layered notes of fruit and nut that unfold with every sip."
  },
  {
    id: '3',
    name: "Obsidian No. 7",
    tagline: "Shatter the Ceiling.",
    notes: "Molasses & Earth",
    caffeine: "Very High",
    intensity: 10,
    price: 500,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=1974",
    description: "Pure, unadulterated Robusta concentrate. Thick, syrup-like body with a caffeine payload that hits like a hammer."
  },
  {
    id: '4',
    name: "Verdant Life",
    tagline: "Breath of Nature.",
    notes: "Fresh & Organic",
    caffeine: "None",
    intensity: 0,
    price: 600,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=1772",
    description: "A touch of green to your space. This curated plant brings life and tranquility to your coffee ritual."
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

// Helper component for individual cards to handle InView logic separately
const MenuCard: React.FC<{ item: typeof items[0], index: number, onAddToCart: any, onToast: (msg: string) => void }> = ({ item, index, onAddToCart, onToast }) => {
  // Use a ref locally for this card
  const ref = React.useRef(null);
  // Use framer-motion's useInView hook. 
  // margin: "-40% 0px -40% 0px" means it activates when the middle 20% of the element is in the viewport
  const isInView = useInView(ref, { margin: "-40% 0px -40% 0px" });
  const isMobile = useIsMobile();

  // Animation variants defined locally
  const cardVariants = {
    hidden: isMobile
      ? { x: '-100%', y: 0, opacity: 0 }
      : { y: '-100%', x: 0, opacity: 0 },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      className="group relative w-full h-full overflow-hidden bg-[#0a0a0a] min-h-[80vh] md:min-h-auto"
    >
      {/* Vivid Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <div className={`absolute inset-0 bg-black/40 transition-colors duration-700 z-10 md:group-hover:bg-black/70 ${isInView ? 'bg-black/70' : ''}`} />
        <img
          src={item.image}
          className={`block w-full h-full object-cover transition-transform duration-[2s] ease-out md:group-hover:scale-105 ${isInView ? 'scale-105' : 'scale-100'}`}
          alt={item.name}
        />
      </div>

      {/* Readability Gradient */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

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
                  onToast(`${item.name} added to cart`);
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

import Toast from './Toast';

const MenuPreview: React.FC<MenuPreviewProps> = ({ onAddToCart, onGoToMenu }) => {
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const toastTimeoutRef = React.useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToastMessage(null), 2000); // 2s duration for visibility
  };

  return (
    <section className="relative w-full h-auto md:h-screen bg-[#111] text-[#F3F3F3] overflow-x-hidden">
      {/* Full Screen Vertical Strips */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.8 }}
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.3
            }
          }
        }}
        className="w-full h-full grid grid-cols-1 md:grid-cols-4"
      >
        {items.map((item, idx) => (
          <MenuCard key={idx} item={item} index={idx} onAddToCart={onAddToCart} onToast={showToast} />
        ))}
      </motion.div>
      <Toast message={toastMessage} />
    </section>
  );
};

export default MenuPreview;
