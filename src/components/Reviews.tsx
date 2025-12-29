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
    <section className="relative text-white py-24 px-8 border-t border-white/10 overflow-hidden">
      {/* Background video */}
      <div className="absolute inset-0 z-0">
        <video
          className="w-full h-full object-cover"
          src="/media/rating-background.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center justify-center gap-6 mb-16 text-center">
          <div className="flex items-center gap-4">
            {/* Google G logo approximation */}
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl font-semibold">
              <span className="bg-clip-text text-transparent bg-[conic-gradient(from_180deg_at_50%_50%,#4285F4_0deg,#4285F4_90deg,#0F9D58_90deg,#0F9D58_180deg,#F4B400_180deg,#F4B400_270deg,#DB4437_270deg,#DB4437_360deg)]">
                G
              </span>
            </div>

            <div className="flex flex-col gap-1 items-start">
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-sans">
                Google Rating
              </span>
              <div className="flex items-baseline gap-4">
                <span className="text-5xl md:text-6xl font-serif text-white">4.8</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <motion.article
              key={review.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              className="bg-black/40 border border-white/10 backdrop-blur-md rounded-2xl p-8 flex flex-col gap-4 transition-transform transition-colors duration-300 hover:-translate-y-1 hover:border-white/20"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-black ${review.avatarClass}`}
                >
                  {review.initial}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{review.name}</span>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-sm md:text-[13px] leading-relaxed text-neutral-200 font-sans">
                {review.text}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
