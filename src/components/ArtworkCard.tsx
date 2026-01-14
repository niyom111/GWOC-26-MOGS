import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { ArtAdminItem } from '../DataContext';

interface ArtworkCardProps {
  art: ArtAdminItem;
  index: number;
  onAddToCart?: (art: ArtAdminItem) => void;
}

const ArtworkCard: React.FC<ArtworkCardProps> = ({ art, index, onAddToCart }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleImageClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsFlipped(!isFlipped);
    }
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(art);
    }
  };

  const isAvailable = art.stock > 0;
  const artistName = art.artist_name || art.artist || 'Unknown Artist';
  const artistBio = art.artist_bio || '';
  const description = art.description || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      {/* FlipContainer - ONLY the image area */}
      <div
        className="relative mb-8 cursor-pointer"
        style={{ perspective: '1200px' }}
        onClick={handleImageClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${art.title}`}
      >
        <div
          className="relative w-full aspect-[3/4]"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* CardFront - Image */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
            }}
          >
            <div className="w-full h-full overflow-hidden relative bg-zinc-100">
              <img
                src={art.image || ''}
                className={`w-full h-full object-cover transition-all duration-1000 ${isAvailable ? 'grayscale-0' : 'grayscale'}`}
                alt={art.title || 'Art piece'}
              />
              <div className="absolute top-4 left-4 flex space-x-2">
                <div className={`px-3 py-1 text-[8px] font-sans uppercase tracking-[0.2em] font-bold backdrop-blur-md ${isAvailable ? 'bg-white/90 text-black border border-black/5' : 'bg-red-500/90 text-white'}`}>
                  {isAvailable ? 'Available' : 'Sold Out'}
                </div>
              </div>
            </div>
          </div>

          {/* CardBack - Details (must fit without scrolling) */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div 
              className="w-full h-full flex flex-col justify-between"
              style={{ 
                backgroundColor: '#222222',
                padding: '2.25rem 2rem',
              }}
            >
              <div className="flex-1 flex flex-col justify-start" style={{ maxWidth: '100%' }}>
                {/* Title - Large Serif, Italic */}
                <h2 className="text-4xl md:text-5xl font-serif italic mb-5 leading-tight" style={{ color: '#f2f2f2' }}>
                  {art.title || 'Untitled Art'}
                </h2>

                {/* Artist Name - Uppercase, Roman, Spaced */}
                <p 
                  className="text-sm font-sans mb-6 font-normal tracking-[0.15em]"
                  style={{ color: '#f2f2f2' }}
                >
                  {artistName.toUpperCase()}
                </p>

                {/* Price */}
                <p 
                  className="text-base font-sans font-medium mb-8"
                  style={{ color: '#f2f2f2' }}
                >
                  ₹{(art.price ?? 0).toLocaleString()}
                </p>

                {/* Artist Bio - Concise */}
                {artistBio && (
                  <div className="mb-8">
                    <h4 
                      className="text-sm font-sans mb-3.5 font-normal tracking-[0.12em]"
                      style={{ color: '#f2f2f2' }}
                    >
                      ABOUT THE ARTIST
                    </h4>
                    <p 
                      className="text-base font-serif italic leading-relaxed font-normal"
                      style={{ color: '#f2f2f2', lineHeight: '1.75' }}
                    >
                      {artistBio.length > 120 ? `${artistBio.substring(0, 120)}...` : artistBio}
                    </p>
                  </div>
                )}

                {/* Description/Story - Concise */}
                {description && (
                  <div>
                    <h4 
                      className="text-sm font-sans mb-3.5 font-normal tracking-[0.12em]"
                      style={{ color: '#f2f2f2' }}
                    >
                      THE STORY
                    </h4>
                    <p 
                      className="text-base font-serif italic leading-relaxed font-normal"
                      style={{ color: '#f2f2f2', lineHeight: '1.75' }}
                    >
                      {description.length > 120 ? `${description.substring(0, 120)}...` : description}
                    </p>
                  </div>
                )}

                {/* Fallback if no content */}
                {!artistBio && !description && (
                  <p 
                    className="text-base font-serif italic leading-relaxed"
                    style={{ color: '#f2f2f2', opacity: 0.7, lineHeight: '1.75' }}
                  >
                    No additional details available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* StaticDetails - Always visible, never flips */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-3xl font-serif italic mb-2">{art.title}</h3>
          <p className="text-[10px] font-sans text-zinc-400 uppercase tracking-widest">{artistName}</p>
          {isAvailable && (
            <p className="text-[9px] font-sans text-emerald-600 mt-2 uppercase tracking-wide">
              {art.stock} piece{art.stock > 1 ? 's' : ''} remaining
            </p>
          )}
        </div>
        <span className="text-sm font-sans font-bold">₹{art.price.toLocaleString()}</span>
      </div>

      {isAvailable && onAddToCart && (
        <button
          onClick={handleAddToCartClick}
          className="w-full py-4 border border-black/10 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all text-[10px] uppercase tracking-[0.3em] font-bold flex items-center justify-center space-x-3"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Add to Collection</span>
        </button>
      )}
    </motion.div>
  );
};

export default ArtworkCard;
