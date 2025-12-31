
import React, { useRef } from 'react';
import {
    motion,
    useScroll,
    useSpring,
    useTransform,
    useMotionValue,
    useVelocity,
    useAnimationFrame
} from 'framer-motion';

// Local implementation of wrap utility
const wrap = (min: number, max: number, v: number) => {
    const rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

interface ParallaxTextProps {
    children: React.ReactNode;
    baseVelocity: number;
}

const ParallaxText: React.FC<ParallaxTextProps> = ({ children, baseVelocity = 100 }) => {
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    });
    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
        clamp: false
    });

    const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

    const directionFactor = useRef<number>(1);
    useAnimationFrame((t, delta) => {
        let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

        if (velocityFactor.get() < 0) {
            directionFactor.current = -1;
        } else if (velocityFactor.get() > 0) {
            directionFactor.current = 1;
        }

        moveBy += directionFactor.current * moveBy * velocityFactor.get();

        baseX.set(baseX.get() + moveBy);
    });

    return (
        <div className="parallax overflow-hidden flex flex-nowrap m-0 whitespace-nowrap">
            <motion.div className="scroller flex flex-nowrap font-serif italic tracking-tighter leading-none" style={{ x }}>
                {children}
                {children}
                {children}
                {children}
            </motion.div>
        </div>
    );
};


const MarqueeSection: React.FC = () => {
    const { scrollY } = useScroll();
    const skew = useTransform(scrollY, [0, 1000], [0, 5], { clamp: false }); // Subtle base skew
    const scrollVelocity = useVelocity(scrollY);
    const skewVelocity = useSpring(scrollVelocity, { stiffness: 100, damping: 30 });
    const skewFactor = useTransform(skewVelocity, [-1000, 1000], [-20, 20]);

    return (
        <section className="relative bg-[#F9F8F4] py-20 z-20 overflow-hidden border-y border-black/5 group">
            <motion.div style={{ skewX: skewFactor }} className="flex flex-col gap-8">

                {/* Lane 1: Product Focus - Bold & Direct */}
                <ParallaxText baseVelocity={-1.5}>
                    <span className="text-[3rem] md:text-[5rem] mx-4 font-black tracking-tighter text-[#1A1A1A]">100% ROBUSTA</span>
                    <span className="text-xl md:text-3xl mx-4 self-center text-[#A35D36]">✦</span>
                    <span className="text-[3rem] md:text-[5rem] mx-4 font-black tracking-tighter text-[#A35D36]">DOUBLE CAFFEINE</span>
                    <span className="text-xl md:text-3xl mx-4 self-center text-[#A35D36]">✦</span>
                    <span className="text-[3rem] md:text-[5rem] mx-4 font-black tracking-tighter text-[#1A1A1A]">SINGLE ORIGIN</span>
                    <span className="text-xl md:text-3xl mx-4 self-center text-[#A35D36]">✦</span>
                </ParallaxText>

                {/* Lane 2: Brand/Venue Context - Artistic & Elegant */}
                <ParallaxText baseVelocity={1}>
                    <span className="text-[3rem] md:text-[5rem] mx-4 font-black text-transparent stroke-black stroke-1" style={{ WebkitTextStroke: '1px #1A1A1A' }}>ART GALLERY</span>
                    <span className="text-[3rem] md:text-[5rem] mx-4 font-serif italic text-[#A35D36] px-4 font-light">Espresso Bar</span>
                    <span className="text-[3rem] md:text-[5rem] mx-4 font-black text-transparent stroke-black stroke-1" style={{ WebkitTextStroke: '1px #1A1A1A' }}>WORKSHOPS</span>
                </ParallaxText>

                {/* Lane 3: Vibe/Philosophy - Heavy & Impactful */}
                <ParallaxText baseVelocity={-2}>
                    <span className="text-[3rem] md:text-[5rem] mx-4 font-black tracking-tight text-[#1A1A1A]">WAKE UP</span>
                    <span className="text-[3rem] md:text-[5rem] mx-4 font-serif italic text-[#1A1A1A] px-2 font-light opacity-60">To Real Energy</span>
                    <span className="text-[3rem] md:text-[5rem] mx-4 font-black tracking-tight text-[#1A1A1A]">NO COMPROMISE</span>
                </ParallaxText>

            </motion.div>

            {/* Vignette Overlay (Light) - Reduced opacity to let text pop */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#F9F8F4] via-transparent to-[#F9F8F4] z-10 opacity-60" />

            {/* Hover Mask to pause/dim? Optional, let's stick to clean for now */}
        </section>
    );
};

export default MarqueeSection;
