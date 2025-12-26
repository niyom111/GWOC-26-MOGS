
import React from 'react';
import { motion as motionBase, useScroll, useTransform } from 'framer-motion';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

const StickySection: React.FC = () => {
  const containerRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const img1Y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const img2Y = useTransform(scrollYProgress, [0, 1], [100, -400]);

  return (
    <section ref={containerRef} id="standard" className="relative min-h-[180vh] bg-[#F9F8F4] pt-10 md:pt-14 pb-24 md:pb-28 px-6 md:px-16">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-28">
        {/* Left Sticky Content */}
        <div className="lg:w-[46%] lg:sticky lg:top-40 h-fit self-start z-10 pt-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[10px] uppercase tracking-[0.5em] font-sans text-zinc-400 mb-8 block">
              The Philosophy
            </span>
            <h2 className="text-6xl md:text-[8rem] font-serif mb-12 leading-[0.9] tracking-tighter text-[#1A1A1A] font-bold italic">
              A Choice, <br/> Not an <br/> Alternative.
            </h2>
            
            <div className="max-w-sm space-y-10">
              <p className="text-lg font-sans leading-relaxed text-[#1A1A1A] tracking-tight">
                Rabuste is built on a singular conviction: Robusta is not inferior; it is misunderstood. We exclusively brew high-grade Robusta for its bold taste, thicker crema, and double the caffeine payload of Arabica. This is coffee for the conscious, energetic, and intentional.
              </p>
              
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-px bg-zinc-300" />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold">2x Caffeine Payload</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-px bg-zinc-300" />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Intense Crema Structure</span>
                </div>
              </div>

              <button className="group relative pt-10 flex items-center space-x-6 text-[11px] uppercase tracking-[0.4em] font-bold">
                <span>The Sourcing Story</span>
                <motion.div 
                  className="w-12 h-px bg-black"
                  whileHover={{ width: 80 }}
                  transition={{ duration: 0.4 }}
                />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Scrolling Parallax Images */}
        <div className="lg:w-[54%] lg:pl-24 xl:pl-32 pt-24 lg:pt-80 flex flex-col gap-16 items-end justify-center">
          <motion.div
            className="relative w-full lg:w-full h-[600px] bg-zinc-100 overflow-hidden shadow-2xl rounded-2xl"
          >
            <img
              src="/media/pic1.jpeg"
              className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 transition-all duration-1000"
              alt="Robusta ritual"
            />
          </motion.div>

          <motion.div
            className="relative w-full lg:w-full h-[600px] bg-zinc-100 overflow-hidden shadow-2xl rounded-2xl"
          >
            <img
              src="/media/pic2.jpeg"
              className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 transition-all duration-1000"
              alt="Brew details"
            />
          </motion.div>

          <motion.div
            className="relative w-full lg:w-full h-[600px] bg-zinc-100 overflow-hidden shadow-2xl rounded-2xl"
          >
            <img
              src="/media/pic3.jpeg"
              className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 transition-all duration-1000"
              alt="Cafe atmosphere"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StickySection;
