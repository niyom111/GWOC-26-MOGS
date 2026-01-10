
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
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
        >
          <motion.span
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.8 } } }}
            className="text-[10px] uppercase tracking-[0.5em] text-zinc-500 mb-6 block"
          >
            Where Culture Distills
          </motion.span>
          <motion.h2
            variants={{ hidden: { y: 40, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } } }}
            className="text-6xl md:text-8xl font-serif text-white tracking-tighter mb-10 italic"
          >
            Coffee Meets Canvas.
          </motion.h2>
          <motion.button
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.8 } } }}
            onClick={onNavigate}
            className="px-10 py-4 border border-white/20 text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-white hover:text-black transition-all"
          >
            Visit Gallery
          </motion.button>
        </motion.div>
      </div>

      <div className="flex space-x-4 animate-marquee">
        <motion.div
          className="flex space-x-6 px-10"
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        >
          {[...teaserImages, ...teaserImages, ...teaserImages].map((img, i) => (
            <div key={i} className="flex-shrink-0 w-80 h-[500px] overflow-hidden transition-all cursor-pointer group">
              <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Art Piece" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default GalleryTeaser;
