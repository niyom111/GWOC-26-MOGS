
import React from 'react';
import { motion as motionBase, useScroll, useTransform } from 'framer-motion';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

const GallerySection: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const yBanner = useTransform(scrollYProgress, [0.3, 0.7], [0, -100]);

  return (
    <section className="relative h-[120vh] w-full bg-black overflow-hidden flex items-center justify-center">
      {/* Immersive Background */}
      <motion.div 
        style={{ y: yBanner }}
        className="absolute inset-0 z-0"
      >
        <img 
          src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1945" 
          className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
          alt="Art Gallery Background"
        />
      </motion.div>

      {/* Floating Content Box */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 bg-white text-black p-12 md:p-20 max-w-2xl text-center shadow-2xl mx-6"
      >
        <span className="text-[10px] uppercase tracking-[0.4em] font-mono text-zinc-400 mb-6 block">Where Culture Distills</span>
        <h2 className="text-5xl md:text-7xl font-gothic mb-8 tracking-tighter">Coffee Meets Canvas.</h2>
        <p className="text-sm font-mono leading-relaxed mb-10 text-[#444]">
          Rabuste is more than a café; it is a micro-gallery for the emerging. Every location features a rotating series of local canvas artists who share our appetite for the bold.
        </p>
        <button className="px-10 py-4 border border-black text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-black hover:text-white transition-all">
          View Artist Collection
        </button>
      </motion.div>

      <div className="absolute top-10 left-10 text-[8px] uppercase tracking-[0.5em] text-white opacity-40 font-mono">
        Exhibition 04 — Obsidian Flow
      </div>
    </section>
  );
};

export default GallerySection;
