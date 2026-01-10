
import React from 'react';
import { motion as motionBase, useScroll, useTransform } from 'framer-motion';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

const Hero: React.FC = () => {
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 800], [1.05, 1.2]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
      <motion.div
        style={{ scale }}
        className="absolute inset-0 z-0 overflow-hidden"
      >
        <video
          className="w-full h-full object-cover"
          src="/media/coffee-beans.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/50" />
      </motion.div>

      {/* Top gradient behind navbar for readability */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-32 z-10 bg-gradient-to-b from-black/60 to-transparent" />

      <div className="relative z-20 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="inline-block relative"
        >
          <motion.img
            src="/media/logo.png"
            alt="Rabuste Coffee"
            className="w-72 md:w-96 mx-auto object-contain"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          />
          <motion.span
            initial={{ opacity: 0, x: 20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="absolute -bottom-6 right-0 text-[11px] uppercase tracking-[0.4em] font-sans text-zinc-300"
          >

          </motion.span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
          animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
          transition={{ delay: 1.5, duration: 2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 text-6xl md:text-8xl font-script text-[#F9F8F4] tracking-wide text-center pt-4"
        >
          Robusta at Rabuste
        </motion.p>


      </div>


    </section>
  );
};

export default Hero;
