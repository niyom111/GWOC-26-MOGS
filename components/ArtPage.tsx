
import React from 'react';
import { motion as motionBase } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

const galleryItems = [
  { id: '1', title: "Transient Echoes", artist: "Maya V.", price: "$1,200", available: true, img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1945" },
  { id: '2', title: "Velvet Dawn", artist: "Julian K.", price: "$850", available: false, img: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=1976" },
  { id: '3', title: "Obsidian Flow", artist: "Soma L.", price: "$2,400", available: true, img: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1974" },
  { id: '4', title: "Primal Surge", artist: "Erik B.", price: "$1,800", available: true, img: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=1974" },
  { id: '5', title: "Dusk Ritual", artist: "Lara M.", price: "$3,100", available: false, img: "https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&q=80&w=2070" },
  { id: '6', title: "Carbon Hue", artist: "Aris P.", price: "$950", available: true, img: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=2072" },
];

// Define props for ArtPage
interface ArtPageProps {
  onAddToCart: () => void;
}

const ArtPage: React.FC<ArtPageProps> = ({ onAddToCart }) => {
  return (
    <div className="pt-32 pb-40 px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-32 flex flex-col md:flex-row justify-between items-end gap-10">
          <div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] uppercase tracking-[0.5em] text-zinc-400 mb-6">The Micro Gallery</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-7xl md:text-9xl font-serif italic tracking-tighter leading-none">The Canvas.</motion.h1>
          </div>
          <p className="max-w-xs text-xs font-sans text-zinc-400 uppercase tracking-widest leading-relaxed text-right italic">
            "A curated sanctuary for the emerging. Every piece is selected to mirror the intensity of our brew."
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {galleryItems.map((art, idx) => (
            <motion.div 
              key={art.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[3/4] overflow-hidden mb-8 relative bg-zinc-100">
                <img 
                  src={art.img} 
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
                  alt={art.title}
                />
                <div className="absolute top-4 left-4 flex space-x-2">
                  <div className={`px-3 py-1 text-[8px] font-sans uppercase tracking-[0.2em] font-bold backdrop-blur-md ${art.available ? 'bg-white/90 text-black border border-black/5' : 'bg-red-500/90 text-white'}`}>
                    {art.available ? 'Available' : 'Sold Out'}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-3xl font-serif italic mb-2">{art.title}</h3>
                  <p className="text-[10px] font-sans text-zinc-400 uppercase tracking-widest">{art.artist}</p>
                </div>
                <span className="text-sm font-sans font-bold">{art.price}</span>
              </div>

              {art.available && (
                <button 
                  onClick={onAddToCart}
                  className="w-full py-4 border border-black/10 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all text-[10px] uppercase tracking-[0.3em] font-bold flex items-center justify-center space-x-3"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Collection</span>
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtPage;
