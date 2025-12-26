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
    <section className="bg-[#060606] text-white pt-24 pb-40 px-6 md:px-12 lg:px-24 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => onBack(Page.AWARENESS)}
          className="mb-10 inline-flex items-center space-x-3 text-[10px] uppercase tracking-[0.4em] text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Philosophy</span>
        </button>

        <header className="mb-16 text-left">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.5em] text-zinc-500 mb-4 font-sans"
          >
            The Origin
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif italic tracking-tight leading-tight mb-6"
          >
            The Robusta Story.
          </motion.h1>
          <p className="text-sm md:text-base text-zinc-400 max-w-2xl leading-relaxed">
            Before it was misunderstood, Robusta was revered. This is the story of a bean that refused to be
            domesticated by taste trendsand why its bold character has become the backbone of our craft.
          </p>
        </header>

        {/* Hero Image / Video */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20 relative aspect-[16/9] overflow-hidden rounded-lg border border-white/10"
        >
          <video
            className="w-full h-full object-cover"
            src="/media/coffee-beans.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 max-w-md">
            <h2 className="text-xl md:text-2xl font-serif mb-2">From Highlands to Harbour</h2>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              Robusta thrives where other coffees faltersteep altitudes, heavy rains, and volcanic soil. In the
              highlands of Vietnam and the forests of India, farmers have cultivated these resilient cherries for
              generations.
            </p>
          </div>
        </motion.div>

        {/* History Section */}
        <section className="space-y-10 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl md:text-3xl font-serif mb-4">A Bean in the Shadows.</h3>
            <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
              For much of the last century, Robusta was relegated to the backgroundblended into espresso for crema,
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
            <h3 className="text-2xl md:text-3xl font-serif mb-4">The Shift Toward Character.</h3>
            <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
              As coffee drinkers grew more adventurous, a new curiosity emerged: what if we stopped hiding Robusta?
              What if we pursued its natural strengthsthe deep cocoa, the molasses, the earth and spiceinstead of
              sanding them down?
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-2xl md:text-3xl font-serif mb-4">Reclamation, Not Reinvention.</h3>
            <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
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
              className="relative overflow-hidden rounded-lg border border-white/10"
            >
              <img
                src="https://images.unsplash.com/photo-1581331559191-31c1c11d9e0a?auto=format&fit=crop&q=80&w=1200"
                className="w-full h-56 object-cover"
                alt="Robusta coffee plants in Vietnam"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-xs text-zinc-200">
                High-altitude farms in Vietnam where Robusta cherries grow dense and resilient, shaped by monsoon rains
                and red basalt soil.
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative overflow-hidden rounded-lg border border-white/10"
            >
              <img
                src="https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&q=80&w=1200"
                className="w-full h-56 object-cover"
                alt="Coffee being processed in India"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-xs text-zinc-200">
                In southern India, generations of growers experiment with fermentation and drying to coax out layered
                flavors from each lot.
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative overflow-hidden rounded-lg border border-white/10"
            >
              <img
                src="https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&q=80&w=1200"
                className="w-full h-56 object-cover"
                alt="Roasting robusta coffee beans"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-xs text-zinc-200">
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
