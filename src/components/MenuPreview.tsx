
import React from 'react';
import { motion as motionBase } from 'framer-motion';
import { CoffeeItem } from '../types';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

interface MenuPreviewProps {
  onAddToCart: (item: CoffeeItem) => void;
  onGoToMenu: () => void;
}

const items: CoffeeItem[] = [
  { id: '1', name: "Midnight Roast", notes: "Dark Chocolate & Smoke", caffeine: "Extreme", intensity: 9, price: 22, image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=1974", description: "Our flagship dark roast." },
  { id: '2', name: "Gallery Blend", notes: "Berry & Walnut", caffeine: "High", intensity: 7, price: 20, image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=1974", description: "Balanced and artistic." },
  { id: '3', name: "Obsidian No. 7", notes: "Molasses & Earth", caffeine: "Very High", intensity: 10, price: 24, image: "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?auto=format&fit=crop&q=80&w=2069", description: "Intense robusta concentrate." },
];

const MenuPreview: React.FC<MenuPreviewProps> = ({ onAddToCart, onGoToMenu }) => {
  return (
    <section className="bg-[#111] text-[#F3F3F3] py-40 px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-24 flex justify-between items-end">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
            }}
          >
            <motion.span
              variants={{ hidden: { x: -20, opacity: 0 }, visible: { x: 0, opacity: 1, transition: { duration: 0.8 } } }}
              className="text-[10px] uppercase tracking-[0.5em] text-zinc-500 mb-6 block font-sans"
            >
              Current Offerings
            </motion.span>
            <motion.h2
              variants={{ hidden: { x: -30, opacity: 0 }, visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } } }}
              className="text-6xl md:text-8xl font-serif tracking-tighter leading-none font-bold italic"
            >
              Curated <br /> Rituals.
            </motion.h2>
          </motion.div>
          <button
            onClick={onGoToMenu}
            className="text-[10px] uppercase tracking-[0.4em] font-bold border-b border-zinc-700 pb-2 hover:border-white transition-all hidden md:block"
          >
            Shop Full Catalog
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-800/50 border border-zinc-800/50">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="bg-[#111] p-12 group"
            >
              <div className="aspect-[4/5] overflow-hidden mb-12 relative">
                <img
                  src={item.image}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  alt={item.name}
                />
              </div>

              <h3 className="text-3xl font-serif mb-4 italic">{item.name}</h3>
              <p className="text-[10px] font-sans text-zinc-500 uppercase tracking-widest mb-10">{item.notes}</p>

              <div className="flex justify-between items-center py-4 border-y border-zinc-800 mb-10 text-[10px] uppercase tracking-widest font-bold">
                <span className="text-zinc-500">Payload</span>
                <span>{item.caffeine}</span>
              </div>

              <button
                onClick={() => onAddToCart(item)}
                className="w-full py-5 border border-zinc-800 hover:bg-white hover:text-black hover:border-white transition-all text-[11px] uppercase tracking-[0.4em] font-bold"
              >
                Add to Cart — ${item.price}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center md:hidden">
          <button
            onClick={onGoToMenu}
            className="text-[10px] uppercase tracking-[0.4em] font-bold border-b border-zinc-700 pb-2"
          >
            Shop Full Catalog
          </button>
        </div>
      </div>
    </section>
  );
};

export default MenuPreview;
