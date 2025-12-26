
import React from 'react';
import { motion as motionBase } from 'framer-motion';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

const items = [
  { 
    id: 1, 
    name: "Midnight Roast", 
    notes: "Dark Chocolate & Smoke", 
    caffeine: "High", 
    intensity: 9,
    img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=1974" 
  },
  { 
    id: 2, 
    name: "Gallery Blend", 
    notes: "Toasted Walnut & Berry", 
    caffeine: "Very High", 
    intensity: 7,
    img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=1974" 
  },
  { 
    id: 3, 
    name: "Espresso No. 7", 
    notes: "Molasses & Earth", 
    caffeine: "Extreme", 
    intensity: 10,
    img: "https://images.unsplash.com/photo-1497933321188-941f9ad36b12?auto=format&fit=crop&q=80&w=2069" 
  },
];

const MenuSection: React.FC = () => {
  return (
    <section className="bg-[#111] text-[#F3F3F3] py-40 px-8 relative overflow-hidden">
      {/* Decorative background text */}
      <div className="absolute top-20 -left-10 text-[15rem] font-gothic opacity-[0.02] pointer-events-none select-none">
        ROBUSTA
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[10px] uppercase tracking-[0.5em] font-mono text-zinc-500 mb-6 block">The Product Layer</span>
            <h2 className="text-7xl md:text-[8rem] font-gothic tracking-tighter leading-none">Curated <br/> Offerings.</h2>
          </motion.div>
          <div className="mt-12 md:mt-0 text-right">
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-4 max-w-xs ml-auto">
              Our beans are ethically sourced, single-estate, and roasted daily.
            </p>
            <button className="text-[10px] uppercase tracking-[0.4em] font-bold border-b border-zinc-700 pb-1 hover:border-white transition-all">
              Shop Full Collection
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-800/50 border border-zinc-800/50">
          {items.map((item, idx) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.8 }}
              className="bg-[#111] p-12 group cursor-pointer hover:bg-zinc-900/50 transition-colors duration-700"
            >
              <div className="aspect-[4/5] overflow-hidden mb-12 relative">
                <motion.img 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 1 }}
                  src={item.img} 
                  className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                  alt={item.name}
                />
                <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 text-[8px] font-mono uppercase tracking-widest text-white">
                  Intensity: {item.intensity}/10
                </div>
              </div>

              <div className="mb-10">
                <h3 className="text-4xl font-gothic mb-4 group-hover:text-white transition-colors">{item.name}</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{item.notes}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest py-3 border-y border-zinc-800">
                  <span className="text-zinc-500">Caffeine Level</span>
                  <span className="text-white font-bold">{item.caffeine}</span>
                </div>
              </div>

              <button className="w-full py-5 bg-transparent border border-zinc-800 group-hover:bg-white group-hover:text-black group-hover:border-white text-[10px] uppercase tracking-[0.4em] font-bold transition-all duration-500">
                Add to Ritual
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
