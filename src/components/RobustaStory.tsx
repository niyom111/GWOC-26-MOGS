import React from 'react';
import { motion as motionBase } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Page } from '../types';

const motion = motionBase as any;

interface RobustaStoryProps {
  onBack: (page: Page) => void;
}

const RobustaStory: React.FC<RobustaStoryProps> = ({ onBack }) => {
  return (
    <section className="pt-24 md:pt-32 pb-40 px-6 md:px-8 bg-[#F9F8F4] text-[#0a0a0a] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => onBack(Page.AWARENESS)}
          className="mb-8 md:mb-10 inline-flex items-center space-x-3 text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Philosophy</span>
        </button>

        <header className="mb-16 md:mb-20 text-left">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-zinc-500 mb-4 font-sans"
          >
            The Origin
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif italic tracking-tight leading-tight mb-6 text-[#1A1A1A]"
          >
            The Robusta Story.
          </motion.h1>
          <p className="text-sm md:text-base text-zinc-600 max-w-2xl leading-relaxed uppercase tracking-widest">
            Before it was misunderstood, Robusta was revered. This is the story of a bean that refused to be
            domesticated by taste trends—and why its bold character has become the backbone of our craft.
          </p>
        </header>

        {/* Hero Video */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-24 relative aspect-[16/9] overflow-hidden rounded-2xl border border-black/10 bg-black"
        >
          <video
            className="w-full h-full object-cover"
            src="/media/robusta-story.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 max-w-md text-white">
            <h2 className="text-xl md:text-2xl font-serif mb-2">From Highlands to Harbour</h2>
            <p className="text-xs md:text-sm text-zinc-200 leading-relaxed">
              Robusta thrives where other coffees falter—steep altitudes, heavy rains, and volcanic soil. In the
              highlands of Vietnam and the forests of India, farmers have cultivated these resilient cherries for
              generations.
            </p>
          </div>
        </motion.div>

        {/* History Section */}
        <section className="space-y-10 mb-24">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl md:text-3xl font-serif mb-4 text-[#1A1A1A]">A Bean in the Shadows.</h3>
            <p className="text-sm md:text-base text-zinc-700 leading-relaxed">
              For much of the last century, Robusta was relegated to the background—blended into espresso for crema,
              hidden in instant coffee, and rarely celebrated on its own. Its intense bitterness and towering caffeine
              content were treated as flaws instead of features.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h3 className="text-2xl md:text-3xl font-serif mb-4 text-[#1A1A1A]">The Shift Toward Character.</h3>
            <p className="text-sm md:text-base text-zinc-700 leading-relaxed">
              As coffee drinkers grew more adventurous, a new curiosity emerged: what if we stopped hiding Robusta?
              What if we pursued its natural strengths—the deep cocoa, the molasses, the earth and spice—instead of
              sanding them down?
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-2xl md:text-3xl font-serif mb-4 text-[#1A1A1A]">Reclamation, Not Reinvention.</h3>
            <p className="text-sm md:text-base text-zinc-700 leading-relaxed">
              At Rabuste, we don't try to disguise what Robusta is. We refine it. Through rigorous sourcing,
              sugarcane and honey processing, and precise roast curves, we reveal a spectrum that ranges from
              burnt-sugar sweetness to blackstrap depth. It is coffee that doesn't whisper—it resonates.
            </p>
          </motion.div>
        </section>

        {/* Visual Story Strip */}
        <section className="space-y-8">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-serif mb-4"
          >
            From Field to Furnace.
          </motion.h3>

          <div className="grid gap-6 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-lg border border-black/10 bg-black group"
            >
              <img
                src="/media/robusta-story1.jpg"
                className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Robusta coffee plants in Vietnam"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-xs text-zinc-100">
                High-altitude farms in Vietnam where Robusta cherries grow dense and resilient, shaped by monsoon rains
                and red basalt soil.
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative overflow-hidden rounded-lg border border-black/10 bg-black group"
            >
              <img
                src="/media/robusta-story2.jpg"
                className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Coffee being processed in India"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-xs text-zinc-100">
                In southern India, generations of growers experiment with fermentation and drying to coax out layered
                flavors from each lot.
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative overflow-hidden rounded-lg border border-black/10 bg-black group"
            >
              <img
                src="/media/robusta-story3.jpg"
                className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Roasting robusta coffee beans"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-xs text-zinc-100">
                In the roastery, careful heat curves transform dense green seeds into thick-bodied, crema-rich
                expressions of power.
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default RobustaStory;
