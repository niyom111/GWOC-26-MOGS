import React from 'react';
import { motion as motionBase } from 'framer-motion';
import { Star } from 'lucide-react';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

const reviews = [
  {
    name: 'Viren Sanghavi',
    initial: 'V',
    text:
      'Rabuste Coffee offers a solid experience with their Red Bull espresso, which I found to be both good and decently priced. The service is impressively fast, and the ambiance adds to the appeal. The coffee was freshly brewed, delivering a perfect hit of rich, dark flavors. Definitely worth a visit!',
  },
  {
    name: 'Darshil Dalal',
    initial: 'D',
    text:
      'Very original coffee beans and u must try this if u want dark and woody coffee flavours!',
  },
  {
    name: 'Tiya Sukhrani',
    initial: 'T',
    text:
      "I'd like to share my experience visting here, the staff is very good, coffee on spot, and siders are also good, liked the desert too, i mostly visit here and i like the place, good for people who work from cafe. MUST VISIT!!",
  },
];

const GoogleReviews: React.FC = () => {
  return (
    <section className="bg-[#0a0a0a] text-white py-24 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 mb-4 font-sans">
            Google review summary
          </p>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-baseline gap-4">
              <span className="text-6xl md:text-7xl font-serif">4.8</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-400 font-sans">
              41 reviews
            </p>
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
              transition={{ duration: 0.6, delay: idx * 0.05 }}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-8 flex flex-col gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-sm font-semibold text-black">
                  {review.initial}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">
                    {review.name}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-sm md:text-[13px] leading-relaxed text-zinc-200 font-sans">
                {review.text}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;
