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
      {/* Background Video */}
      <motion.div
        style={{ scale }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
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

      {/* Top gradient behind navbar */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-32 z-10 bg-gradient-to-b from-black/60 to-transparent" />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center px-6 text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="inline-block relative"
        >
          <motion.img
            src="/media/logo.png"
            alt="Rabuste Coffee"
            className="w-80 md:w-[28rem] mx-auto object-contain"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          />
        </motion.div>

        {/* Hero Text */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 1.0
              }
            }
          }}
          className="mt-16 text-center pt-4"
        >
          {["“Robusta", "at", "Rabuste”"].map((word, index) => (
            <motion.span
              key={index}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 50,
                  filter: 'blur(20px)'
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: 'blur(0px)',
                  transition: {
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1]
                  }
                }
              }}
              className="inline-block text-5xl md:text-8xl text-[#FEF9E7] tracking-tight drop-shadow-2xl mx-2 md:mx-4"
              style={{
                fontFamily: "'Melodrama', serif",
                fontWeight: 700
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section >
  );
};

export default Hero;
