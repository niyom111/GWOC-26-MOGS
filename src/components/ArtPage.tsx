import React, { useState, useRef, useEffect } from 'react';
import { motion as motionBase, AnimatePresence } from 'framer-motion';
import { CoffeeItem } from '../types';
import { useDataContext, ArtAdminItem } from '../DataContext';
import ArtworkCard from './ArtworkCard';
import Toast from './Toast';

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
    const artistName = art.artist_name || art.artist || 'Unknown Artist';
    onAddToCart({
      id: art.id,
      name: art.title,
      notes: artistName,
      caffeine: 'N/A',
      intensity: 0,
      image: art.image,
      price: art.price,
      description: `Art piece by ${artistName}`
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
    <div className="pt-24 md:pt-32 pb-40 px-6 md:px-8 bg-[#F3EFE0]">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 md:mb-32 flex flex-col md:flex-row justify-between items-end gap-6 md:gap-10">
          <div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] md:text-[13px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-black mb-4 md:mb-6">The Micro Gallery</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-9xl font-serif italic tracking-tighter leading-none">The Canvas.</motion.h1>
          </div>
          <p className="max-w-xs text-[14px] md:text-s font-sans text-black uppercase tracking-widest leading-relaxed text-right italic">
            "A curated sanctuary for the emerging. Every piece is selected to mirror the intensity of our brew."
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {artItems.map((art, idx) => (
            <ArtworkCard
              key={art.id}
              art={art}
              index={idx}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>

    </div >
  );
};

export default ArtPage;
