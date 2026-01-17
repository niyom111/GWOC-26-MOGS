import React, { useState } from 'react';
import { motion as motionBase, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

// Fix for framer-motion type mismatch
const motion = motionBase as any;

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  // --- ORIGINAL ITEMS ---
  {
    category: 'General',
    question: 'what is robusta?',
    answer:
      'Robusta is a bold coffee bean known for its deep, intense character. It carries higher caffeine, a fuller body, and earthy, chocolate-forward notes—often finished with a lingering strength that stays with you. Where some coffees whisper, Robusta speaks with clarity and confidence.',
  },
  {
    category: 'General',
    question: 'do i need an account?',
    answer:
      'No login is required to experience Rabuste. Browse our coffees, artworks, and workshops freely. When you are ready to purchase or reserve a spot, you can check out in just a few clicks—no mandatory account walls.',
  },
  // --- NEW ITEMS (ORDERING & SERVICE) ---
  {
    category: 'Ordering',
    question: 'how do I track my order?',
    answer:
      'You can track your order by navigating to the "Track Order" page and entering the email address you used during checkout to view real-time status updates.',
  },
  {
    category: 'Ordering',
    question: 'what payment methods are accepted?',
    answer:
      'We accept all major credit/debit cards, UPI (valid for 5 minutes), and Net Banking via our secure Razorpay integration. For in-store pickup orders, you may also choose to pay at the counter.',
  },

  {
    category: 'Art',
    question: 'how does art purchase work?',
    answer:
      'Every piece on our walls is available for purchase. We partner directly with local and emerging artists so that each sale flows back to the creator. When you take a piece home, you are investing in the culture that shapes the café.',
  },
];

const FAQPage: React.FC = () => {
  // Allow one open at a time
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#F9F8F4] pt-32 pb-40 px-6 font-sans">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <header className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl font-serif italic text-black tracking-tight"
          >
            FAQs
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-base font-serif italic uppercase tracking-[0.1em] text-zinc-600 mt-4"
          >
            Frequently Asked Questions
          </motion.p>
        </header>

        {/* List */}
        <div className="space-y-6">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  backgroundColor: isOpen ? '#ffffff' : '#ffffff',
                  color: isOpen ? '#9B6833' : '#5C4033'
                }}
                whileHover={{
                  scale: 1.02,
                  backgroundColor: '#000000',
                  color: '#ffffff'
                }}
                transition={{
                  duration: 0.3,
                  layout: { duration: 0.3 }
                }}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className={`
                  rounded-none shadow-sm cursor-pointer overflow-hidden
                  ${isOpen ? 'ring-1 ring-[#9B6833]/20 shadow-md' : 'hover:shadow-lg'}
                `}
              >
                {/* Question Header */}
                <div className="p-6 md:p-8 flex items-center justify-between group">
                  <h3 className={`text-xl md:text-2xl font-serif italic transition-colors duration-300 w-full`}>
                    {item.question}
                  </h3>

                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                    ${isOpen ? 'bg-[#9B6833] text-white rotate-180' : 'bg-[#EFEBE0] text-[#5C4033]'}
                  `}>
                    <ChevronDown size={18} strokeWidth={2.5} />
                  </div>
                </div>

                {/* Animated Answer Body */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 md:px-8 pb-8">
                        <div className="flex border-l-2 border-[#9B6833] pl-6 py-1">
                          <p className="leading-relaxed text-sm md:text-base font-serif italic opacity-90">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Still have questions? <a href="mailto:hello@rabuste.com" className="text-[#9B6833] border-b border-[#9B6833]/30 hover:border-[#9B6833]">Email us</a>
          </p>
        </motion.div>

      </div>
    </div>
  );
};

export default FAQPage;
