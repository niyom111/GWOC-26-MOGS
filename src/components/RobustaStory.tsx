import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowLeft, Mountain, CloudRain, Flame } from 'lucide-react';
import { Page } from '../types';

interface RobustaStoryProps {
  onBack: (page: Page) => void;
}

const StorySection: React.FC<{
  title: string;
  children: React.ReactNode;
  imageSrc: string;
  imageAlt: string;
  reversed?: boolean;
  isVideo?: boolean;
  icon?: React.ReactNode;
}> = ({ title, children, imageSrc, imageAlt, reversed = false, isVideo = false, icon }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-20%" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  return (
    <div ref={ref} className={`min-h-[80vh] flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center overflow-hidden bg-[#F3EFE0]`}>
      {/* Image Side */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-screen sticky top-0 overflow-hidden">
        <motion.div
          style={{ scale }}
          className="w-full h-full relative"
        >
          <div className="absolute inset-0 bg-black/10 z-10" />
          {isVideo ? (
            <video
              src={imageSrc}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>
      </div>

      {/* Content Side */}
      <div className={`w-full md:w-1/2 p-8 md:p-24 relative z-20 flex flex-col justify-center bg-[#F3EFE0]`}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          {icon && <div className="mb-6 text-[#1A1A1A]">{icon}</div>}
          <h2 className="text-4xl md:text-6xl font-serif italic mb-8 text-[#1A1A1A] leading-tight">
            {title}
          </h2>
          <div className="prose prose-xl text-black font-normal leading-relaxed">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const RobustaStory: React.FC<RobustaStoryProps> = ({ onBack }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <div ref={containerRef} className="bg-[#F3EFE0] min-h-screen relative font-sans">
      {/* Navigation - REMOVED */}


      {/* Hero Section */}
      <section className="h-screen relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <video
            src="/media/robusta-story.mp4"
            className="w-full h-full object-cover scale-105"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto pt-32">
          <motion.span
            initial={{ opacity: 0, letterSpacing: '0.2em' }}
            animate={{ opacity: 1, letterSpacing: '0.4em' }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="block text-xs md:text-sm uppercase mb-6 text-zinc-300"
          >
            The Origin Story
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl md:text-9xl font-serif italic mb-16 leading-none"
          >
            The Robusta
            <br />
            Revival.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '6rem' }}
            transition={{ delay: 1, duration: 1 }}
            className="w-[1px] bg-gradient-to-b from-white/0 via-white to-white/0 mx-auto mb-16"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="text-lg md:text-xl text-zinc-200 max-w-xl mx-auto font-light leading-relaxed"
          >
            Before it was misunderstood, it was revered. The story of the bean that refused to be domesticated.
          </motion.p>
        </div>
      </section>

      {/* Intro Text Block */}
      <section className="py-32 px-6 bg-[#F3EFE0] flex justify-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-10%" }}
          className="text-2xl md:text-4xl text-center max-w-4xl font-serif leading-snug text-[#1A1A1A]"
        >
          "Robusta thrives where other coffees falter—steep altitudes, heavy rains, and volcanic soil. It is nature's defiant answer to delicate cultivation."
        </motion.p>
      </section>

      {/* Story Sections */}
      <StorySection
        title="A Bean in the Shadows"
        imageSrc="/media/robusta-story3.jpg"
        imageAlt="Dark Roasted Coffee Beans"
        icon={<CloudRain className="w-8 h-8" />}
      >
        <p className="mb-6">
          For much of the last century, Robusta was relegated to the background—blended into espresso for crema, hidden in instant coffee, and rarely celebrated on its own.
        </p>
        <p>
          Its intense bitterness and towering caffeine content were treated as flaws instead of features. The world wanted safe, soft flavors. <strong className="font-semibold text-black">Robusta gave them a storm.</strong>
        </p>
      </StorySection>

      <StorySection
        title="The Shift Toward Character"
        imageSrc="/media/robusta-story2.jpg"
        imageAlt="Coffee Processing"
        reversed
        icon={<Mountain className="w-8 h-8" />}
      >
        <p className="mb-6">
          As coffee drinkers grew more adventurous, a new curiosity emerged: what if we stopped hiding Robusta? What if we pursued its natural strengths—the deep cocoa, the molasses, the earth and spice—instead of sanding them down?
        </p>
        <p>
          We began to look for <strong className="font-semibold text-black">High-Altitude Robusta (Fine Robusta)</strong>, beans cultivated with the same care as the finest Arabicas.
        </p>
      </StorySection>

      <StorySection
        title="Reclamation, Not Reinvention"
        imageSrc="/media/robusta-story1.jpg"
        imageAlt="Coffee Plants"
        icon={<Flame className="w-8 h-8" />}
      >
        <p className="mb-6">
          At Rabuste, we don't try to disguise what Robusta is. We refine it. Through rigorous sourcing, sugarcane and honey processing, and precise roast curves, we reveal a spectrum that ranges from burnt-sugar sweetness to blackstrap depth.
        </p>
        <p>
          It is coffee that doesn't whisper—it resonates. This is the new standard of strength.
        </p>
      </StorySection>

      {/* Final Call to Action */}
      <section className="py-40 bg-[#F3EFE0] text-[#1A1A1A] text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <h2 className="text-5xl md:text-7xl font-serif italic mb-8">
            Taste the Origin.
          </h2>
          <p className="text-zinc-600 mb-12 text-lg">
            Experience the unfiltered power of Rabuste.
          </p>
          <button
            onClick={() => onBack(Page.MENU)}
            className="px-10 py-4 bg-[#1A1A1A] text-white text-xs uppercase tracking-[0.25em] font-bold hover:bg-zinc-800 transition-colors"
          >
            Explore the Menu
          </button>
        </div>
      </section>

    </div>
  );
};

export default RobustaStory;
