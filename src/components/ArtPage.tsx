import React, { useState, useRef, useEffect } from 'react';
import { motion as motionBase, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { CoffeeItem } from '../types';
import { useDataContext, ArtAdminItem } from '../DataContext';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

// Define props for ArtPage
interface ArtPageProps {
  onAddToCart: (item: CoffeeItem) => void;
}

const ArtPage: React.FC<ArtPageProps> = ({ onAddToCart }) => {
  const { artItems } = useDataContext();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleAddToCart = (art: ArtAdminItem) => {
    // Treat Art as a CoffeeItem for the cart (shared structure)
    // Note: In a real app, we might distinguish types more clearly
    onAddToCart({
      id: art.id,
      name: art.title,
      notes: art.artist,
      caffeine: 'N/A',
      intensity: 0,
      image: art.image,
      price: art.price,
      description: `Art piece by ${art.artist}`
    });

    setToastMessage(`${art.title} added to collection`);

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 1500);
  };

  return (
    <div className="pt-24 md:pt-32 pb-40 px-6 md:px-8 bg-[#F9F8F4]">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 md:mb-32 flex flex-col md:flex-row justify-between items-end gap-6 md:gap-10">
          <div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-zinc-400 mb-4 md:mb-6">The Micro Gallery</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-9xl font-serif italic tracking-tighter leading-none">The Canvas.</motion.h1>
          </div>
          <p className="max-w-xs text-[10px] md:text-xs font-sans text-zinc-400 uppercase tracking-widest leading-relaxed text-right italic">
            "A curated sanctuary for the emerging. Every piece is selected to mirror the intensity of our brew."
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {artItems.map((art, idx) => {
            const isAvailable = art.stock > 0;
            return (
              <motion.div
                key={art.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="aspect-[3/4] overflow-hidden mb-8 relative bg-zinc-100">
                  <img
                    src={art.image}
                    className={`w-full h-full object-cover transition-all duration-1000 ${isAvailable ? 'grayscale-0' : 'grayscale'}`}
                    alt={art.title}
                  />
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <div className={`px-3 py-1 text-[8px] font-sans uppercase tracking-[0.2em] font-bold backdrop-blur-md ${isAvailable ? 'bg-white/90 text-black border border-black/5' : 'bg-red-500/90 text-white'}`}>
                      {isAvailable ? 'Available' : 'Sold Out'}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-serif italic mb-2">{art.title}</h3>
                    <p className="text-[10px] font-sans text-zinc-400 uppercase tracking-widest">{art.artist}</p>
                    {isAvailable && (
                      <p className="text-[9px] font-sans text-emerald-600 mt-2 uppercase tracking-wide">
                        {art.stock} piece{art.stock > 1 ? 's' : ''} remaining
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-sans font-bold">₹{art.price.toLocaleString()}</span>
                </div>

                {isAvailable && (
                  <button
                    onClick={() => handleAddToCart(art)}
                    className="w-full py-4 border border-black/10 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all text-[10px] uppercase tracking-[0.3em] font-bold flex items-center justify-center space-x-3"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Collection</span>
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed top-8 left-1/2 z-50 bg-[#0a0a0a] text-[#F9F8F4] px-6 py-3 rounded-full text-xs uppercase tracking-[0.25em] shadow-xl"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArtPage;
