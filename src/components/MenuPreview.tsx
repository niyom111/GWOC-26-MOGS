
import React from 'react';
import { motion as motionBase } from 'framer-motion';
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
    price: 22,
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
    price: 20,
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
    price: 24,
    image: "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?auto=format&fit=crop&q=80&w=2069",
    description: "Pure, unadulterated Robusta concentrate. Thick, syrup-like body with a caffeine payload that hits like a hammer."
  },
];

const MenuPreview: React.FC<MenuPreviewProps> = ({ onAddToCart, onGoToMenu }) => {
  return (
    <section className="relative w-full h-screen bg-[#111] text-[#F3F3F3] overflow-hidden">
      {/* Full Screen Vertical Strips */}
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 border-t border-b border-white/10">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ height: "0%" }}
            whileInView={{ height: "100%" }}
            viewport={{ once: true }}
            transition={{
              duration: 1.2,
              delay: idx * 0.15,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="group relative w-full h-full overflow-hidden bg-[#0a0a0a] border-r border-white/10 last:border-r-0"
          >
            {/* Vivid Background Image */}
            <div className="absolute inset-0 w-full h-full">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors duration-700 z-10" />
              <img
                src={item.image}
                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                alt={item.name}
              />
            </div>

            {/* Readability Gradient */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

            {/* Content Container */}
            <div className="absolute inset-0 z-30 flex flex-col justify-end pb-12 md:pb-24 px-8 md:px-12">

              {/* Always Visible Title */}
              <div className="transform transition-all duration-700 group-hover:-translate-y-4 relative z-40">
                <span className="text-[10px] text-[#A35D36] uppercase tracking-[0.3em] font-bold block mb-4">
                  {item.notes}
                </span>
                <h3 className="text-4xl md:text-6xl font-serif italic leading-none mb-4 text-white">
                  {item.name}
                </h3>
              </div>

              {/* Interaction Stack */}
              <div className="relative min-h-[140px]">

                {/* Default State: Tagline (Absolute positioning for crossfade) */}
                <div className="absolute top-0 left-0 w-full transition-all duration-500 delay-100 transform group-hover:opacity-0 group-hover:translate-y-4 opacity-100 translate-y-0 pointer-events-none">
                  <p className="text-sm font-sans text-zinc-300 tracking-wide">
                    {item.tagline}
                  </p>
                  <div className="mt-8 w-12 h-[1px] bg-white/30" />
                </div>

                {/* Hover State: Description & Button (Absolute positioning for crossfade) */}
                <div className="absolute top-0 left-0 w-full transition-all duration-500 transform opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0">
                  <p className="text-sm text-zinc-300 leading-relaxed mb-8 font-sans border-l-2 border-[#A35D36] pl-4 max-w-sm">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-8">
                    <span className="text-3xl font-serif italic text-white">${item.price}</span>
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
        ))}
      </div>
    </section>
  );
};

export default MenuPreview;
