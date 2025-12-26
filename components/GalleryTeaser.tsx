
import React from 'react';
import { motion as motionBase } from 'framer-motion';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

interface GalleryTeaserProps {
  onNavigate: () => void;
}

const GalleryTeaser: React.FC<GalleryTeaserProps> = ({ onNavigate }) => {
  const teaserImages = [
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1945",
    "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=1976",
    "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1974",
    "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=1974",
  ];

  return (
    <section className="bg-black py-40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 mb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-[10px] uppercase tracking-[0.5em] text-zinc-500 mb-6 block">Where Culture Distills</span>
          <h2 className="text-6xl md:text-8xl font-serif text-white tracking-tighter mb-10 italic">Coffee Meets Canvas.</h2>
          <button 
            onClick={onNavigate}
            className="px-10 py-4 border border-white/20 text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-white hover:text-black transition-all"
          >
            Visit Gallery
          </button>
        </motion.div>
      </div>

      <div className="flex space-x-4 animate-marquee">
        <motion.div 
          className="flex space-x-6 px-10"
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        >
          {[...teaserImages, ...teaserImages, ...teaserImages].map((img, i) => (
            <div key={i} className="flex-shrink-0 w-80 h-[500px] overflow-hidden grayscale hover:grayscale-0 transition-all cursor-pointer">
              <img src={img} className="w-full h-full object-cover" alt="Art Piece" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default GalleryTeaser;
