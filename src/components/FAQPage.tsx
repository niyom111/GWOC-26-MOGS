import React from 'react';
import { motion as motionBase } from 'framer-motion';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

const faqItems = [
  {
    question: 'Account',
    answer:
      'No login is required to experience Rabuste. Browse our coffees, artworks, and workshops freely. When you are ready to purchase or reserve a spot, you can check out in just a few clicks—no mandatory account walls.',
  },
  {
    question: 'Ordering',
    answer:
      'We are intentionally built for momentum. Place a pre-order online for "Grab-and-Go" and your drinks or beans will be waiting when you arrive. Seating is limited by design, so we prioritize speed and precision over lingering queues.',
  },
  {
    question: 'Art',
    answer:
      'Every piece on our walls is available for purchase. We partner directly with local and emerging artists so that each sale flows back to the creator. When you take a piece home, you are investing in the culture that shapes the café.',
  },
  {
    question: 'Workshops',
    answer:
      'We host a mix of complimentary community sessions and ticketed deep-dives. From latte art labs to creative residencies and caffeine science nights, there is always a new way to learn, share, and experiment.',
  },
];

const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <div className="pt-24 md:pt-32 pb-40 px-6 md:px-8 bg-[#F3EFE0] text-[#1A1A1A]">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 md:mb-12 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-zinc-500 mb-4 font-sans"
          >
            Support
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif italic tracking-tight"
          >
            Frequently Asked Questions
          </motion.h1>
        </header>

        <section className="border-t border-black/10 pt-8">
          <div className="divide-y divide-black/10">
            {faqItems.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={item.question}>
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-sm md:text-base uppercase tracking-[0.3em] text-[#1A1A1A]">
                      {item.question}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="pb-6 text-sm md:text-base text-zinc-700 leading-relaxed">{item.answer}</div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default FAQPage;
