import React from 'react';
import { motion as motionBase } from 'framer-motion';
import { Star } from 'lucide-react';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

const reviews = [
  {
    name: 'Viren Sanghavi',
    initial: 'V',
    avatarClass: 'bg-amber-400',
    text:
      'Rabuste Coffee offers a solid experience with their Red Bull espresso, which I found to be both good and decently priced. The service is impressively fast, and the ambiance adds to the appeal. The coffee was freshly brewed, delivering a perfect hit of rich, dark flavors. Definitely worth a visit!',
  },
  {
    name: 'Darshil Dalal',
    initial: 'D',
    avatarClass: 'bg-orange-400',
    text:
      'Very original coffee beans and u must try this if u want dark and woody coffee flavours!',
  },
  {
    name: 'Tiya Sukhrani',
    initial: 'T',
    avatarClass: 'bg-pink-400',
    text:
      "I’d like to share my experience visting here, the staff is very good, coffee on spot, and siders are also good, liked the desert too, i mostly visit here and i like the place, good for people who work from cafe. MUST VISIT!!",
  },
];

const Reviews: React.FC = () => {
  return (
    <section className="relative text-white py-32 px-6 md:px-12 overflow-hidden bg-black">
      {/* Background video - slightly darker overlay for readability */}
      <div className="absolute inset-0 z-0">
        <video
          className="w-full h-full object-cover opacity-60"
          src="/media/rating-background.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center justify-center gap-10 mb-24 text-center">
          <div className="flex items-center gap-6 bg-white/5 backdrop-blur-xl px-8 py-4 rounded-full border border-white/5">
            {/* Google G logo */}
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl font-semibold shadow-lg">
              <span className="bg-clip-text text-transparent bg-[conic-gradient(from_180deg_at_50%_50%,#4285F4_0deg,#4285F4_90deg,#0F9D58_90deg,#0F9D58_180deg,#F4B400_180deg,#F4B400_270deg,#DB4437_270deg,#DB4437_360deg)]">
                G
              </span>
            </div>

            <div className="flex flex-col items-start gap-1">
              <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-sans">
                Google Rating
              </span>
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-serif text-white leading-none">4.8</span>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {reviews.map((review, idx) => (
            <motion.article
              key={review.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="bg-zinc-900/40 backdrop-blur-sm rounded-3xl p-10 flex flex-col gap-6 hover:bg-zinc-900/60 transition-colors duration-500"
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
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-lg leading-relaxed text-zinc-300 font-sans font-light">
                "{review.text}"
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
