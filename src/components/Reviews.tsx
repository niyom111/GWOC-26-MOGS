import React, { useEffect, useState } from 'react';
import { motion as motionBase } from 'framer-motion';
import { Star } from 'lucide-react';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

const FALLBACK_REVIEWS = [
  {
    name: 'Viren Sanghavi',
    initial: 'V',
    avatarClass: 'bg-amber-400',
    text:
      'Rabuste Coffee offers a solid experience with their Red Bull espresso, which I found to be both good and decently priced. The service is impressively fast, and the ambiance adds to the appeal. The coffee was freshly brewed, delivering a perfect hit of rich, dark flavors. Definitely worth a visit!',
    rating: 5
  },
  {
    name: 'Darshil Dalal',
    initial: 'D',
    avatarClass: 'bg-orange-400',
    text:
      'Very original coffee beans and u must try this if u want dark and woody coffee flavours!',
    rating: 5
  },
  {
    name: 'Tiya Sukhrani',
    initial: 'T',
    avatarClass: 'bg-pink-400',
    text:
      "I’d like to share my experience visting here, the staff is very good, coffee on spot, and siders are also good, liked the desert too, i mostly visit here and i like the place, good for people who work from cafe. MUST VISIT!!",
    rating: 5
  },
];

const AVATAR_COLORS = [
  'bg-amber-400',
  'bg-orange-400',
  'bg-pink-400',
  'bg-rose-400',
  'bg-cyan-400',
  'bg-emerald-400'
];

interface ReviewData {
  name: string;
  initial: string;
  avatarClass: string;
  text: string;
  rating: number;
  original_url?: string;
}

const StarRating: React.FC<{ rating: number; className?: string }> = ({ rating, className = "w-5 h-5" }) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const fillPercentage = Math.min(Math.max(rating - i, 0), 1) * 100;

        return (
          <div key={i} className="relative">
            {/* Empty/Background Star */}
            <Star className={`${className} text-neutral-600`} />

            {/* Filled Star Overlay */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star className={`${className} fill-amber-400 text-amber-400`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewData[]>(FALLBACK_REVIEWS);
  const [googleRating, setGoogleRating] = useState<number>(4.8);
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string>('https://google.com/maps'); // Default fallback
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews`);
        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();

        if (data.reviews && data.reviews.length > 0) {
          const formattedReviews = data.reviews.map((r: any, idx: number) => ({
            name: r.name,
            initial: r.initial || r.name.charAt(0).toUpperCase(),
            // Cycle through colors
            avatarClass: AVATAR_COLORS[idx % AVATAR_COLORS.length],
            text: r.text,
            rating: r.rating,
            original_url: r.original_url
          }));

          setReviews(formattedReviews);
          // Ensure we don't accidentally show 0 or undefined, but allow valid updates
          if (typeof data.rating === 'number') setGoogleRating(data.rating);
          if (data.google_maps_url) setGoogleMapsUrl(data.google_maps_url);
        }
      } catch (err) {
        console.error('Error loading reviews:', err);
        // Fallback is already set
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <section className="relative text-white py-32 px-6 md:px-12 overflow-hidden bg-black">
      {/* Background video - sticky to reduce zoom on tall mobile content */}
      <div className="absolute inset-0 z-0">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <video
            className="w-full h-full object-cover opacity-100 scale-100"
            src="/media/rating-background.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center justify-center gap-10 mb-24 text-center">

          <div className="flex items-center gap-6 bg-white/5 backdrop-blur-xl px-8 py-4 rounded-full border border-white/5">
            {/* Google G logo (Standard SVG) */}
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-7 h-7">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </div>

            <div className="flex flex-col items-start gap-1">
              <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-sans group-hover:text-neutral-300 transition-colors">
                Google Rating
              </span>
              <div className="flex items-baseline gap-4">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl font-serif text-white leading-none"
                >
                  {isLoading ? '...' : googleRating}
                </motion.span>

                {/* Custom Precise Star Rating */}
                <StarRating rating={googleRating} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Auto-Scroll Marquee */}
        <div className="md:hidden overflow-hidden w-screen relative left-1/2 -translate-x-1/2">
          <motion.div
            className="flex w-max gap-4"
            animate={{ x: "-50%" }}
            transition={{ duration: 25, ease: "linear", repeat: Infinity }}
          >
            {[...reviews, ...reviews, ...reviews, ...reviews].map((review, idx) => (
              <div
                key={`mobile-rev-${idx}`}
                className="w-[85vw] flex-shrink-0 bg-zinc-900/40 backdrop-blur-sm rounded-3xl p-8 flex flex-col gap-6 border border-white/5 mr-0 pr-0"
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-black shadow-lg ${review.avatarClass}`}
                  >
                    {review.initial}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-lg font-serif tracking-wide text-white">{review.name}</span>
                    <div className="flex items-center gap-1 opacity-80">
                      <StarRating rating={review.rating} className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                <p className="text-lg leading-relaxed text-zinc-300 font-sans font-light line-clamp-6">
                  "{review.text}"
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Desktop Grid (Hidden on Mobile) */}
        <div className="hidden md:grid grid-cols-3 gap-12">
          {reviews.map((review, idx) => (
            <motion.article
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="bg-zinc-900/40 backdrop-blur-sm rounded-3xl p-10 flex flex-col gap-6 hover:bg-zinc-900/60 transition-colors duration-500 h-full border border-white/5"
            >
              <div className="flex items-center gap-5">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-black shadow-lg ${review.avatarClass}`}
                >
                  {review.initial}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-serif tracking-wide text-white">{review.name}</span>
                  <div className="flex items-center gap-1 opacity-80">
                    <StarRating rating={review.rating} className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <p className="text-lg leading-relaxed text-zinc-300 font-sans font-light line-clamp-6">
                "{review.text}"
              </p>
            </motion.article>
          ))}
        </div>
      </div >
    </section >
  );
};

export default Reviews;

