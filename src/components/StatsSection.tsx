import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

const AnimatedValue: React.FC<{ value: string; isInView: boolean }> = ({ value, isInView }) => {
    // Check if value is numeric for counting animation
    const isNumeric = /^\d+/.test(value);
    const numericPart = isNumeric ? parseInt(value.replace(/\D/g, '')) : 0;
    const suffix = isNumeric ? value.replace(numericPart.toString(), '') : '';

    const springValue = useSpring(0, { stiffness: 50, damping: 20 });
    const displayValue = useTransform(springValue, (current) => Math.round(current));

    useEffect(() => {
        if (isInView && isNumeric) {
            springValue.set(numericPart);
        }
    }, [isInView, isNumeric, numericPart, springValue]);

    if (isNumeric) {
        // Count up animation for numbers
        return (
            <span className="flex">
                <motion.span>{displayValue}</motion.span>
                <span>{suffix}</span>
            </span>
        );
    }

    // Scramble for text
    return <ScrambleText reveal={isInView} text={value} />;
};

const ScrambleText: React.FC<{
    text: string;
    reveal?: boolean;
}> = ({ text, reveal }) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$";
    const [display, setDisplay] = useState(text);

    useEffect(() => {
        if (!reveal) return;
        let iteration = 0;
        const interval = setInterval(() => {
            setDisplay(
                text.split("").map((char, index) => {
                    if (index < iteration) return text[index];
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join("")
            );
            if (iteration >= text.length) clearInterval(interval);
            iteration += 1 / 3;
        }, 30);
        return () => clearInterval(interval);
    }, [reveal, text]);

    return <span>{display}</span>;
}


const StatBlock: React.FC<{
    value: string;
    label: string;
    sub: string;
    index: number
}> = ({ value, label, sub, index }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-100px" });
    // Strict center focus for mobile styling: only active when in the middle slice of screen
    const isCenter = useInView(ref, { margin: "-45% 0px -45% 0px" });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const showActive = isMobile && isCenter;

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.15, ease: "easeOut" }}
            className="group relative flex flex-col justify-between px-6 py-16 lg:p-14 border-b border-black/10 md:border-b-0 md:border-r last:border-r-0 hover:bg-[#EEE8D5] transition-colors duration-500 min-h-[50vh]"
        >
            {/* Top Label */}
            <div className="flex items-center gap-3 mb-12">
                <div className={`w-2 h-2 rounded-full transition-colors duration-300 ring-2 ring-transparent ${showActive ? 'bg-[#CE2029] ring-red-100' : 'bg-zinc-300 group-hover:bg-[#CE2029] group-hover:ring-red-100'}`} />
                <span className={`text-sm font-sans uppercase tracking-[0.2em] transition-colors duration-300 font-medium ${showActive ? 'text-black' : 'text-zinc-900 group-hover:text-black'}`}>
                    {label}
                </span>
            </div>

            <div className="mb-12 relative flex justify-center">
                <div className={`text-[5rem] lg:text-[7.5rem] font-bold font-serif text-[#1A1A1A] tracking-tighter leading-[0.9] transition-transform duration-500 ${showActive ? 'translate-x-2' : 'group-hover:translate-x-2'}`}>
                    <AnimatedValue value={value} isInView={isInView} />
                </div>
            </div>

            {/* Bottom Description */}
            <div className="mt-auto">
                <div className={`w-full h-[1px] mb-6 origin-left transition-all duration-500 ${showActive ? 'scale-x-100 bg-[#CE2029]' : 'bg-black/10 scale-x-50 group-hover:scale-x-100 group-hover:bg-[#CE2029]'}`} />
                <p className={`text-xl font-sans leading-relaxed max-w-[90%] transition-colors duration-500 ${showActive ? 'text-black' : 'text-zinc-900 group-hover:text-black'}`}>
                    {sub}
                </p>
            </div>

            {/* Hover Gradient Overlay */}
            <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#CE2029] to-transparent transition-opacity duration-700 ${showActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
        </motion.div>
    );
};

const StatsSection: React.FC = () => {
    return (
        <section className="bg-[#F3EFE0] text-black border-y border-black/10 overflow-hidden text-[10px] mt-24 md:mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3">
                <StatBlock
                    index={0}
                    value="210mg"
                    label="Payload"
                    sub="Avg caffeine per serving. Double the standard. Not for the faint of heart."
                />
                <StatBlock
                    index={1}
                    value="100%"
                    label="Purity"
                    sub="Single Origin Coorg Robusta. No blends. No fillers. No compromise."
                />
                <StatBlock
                    index={2}
                    value="ZERO"
                    label="Tolerance"
                    sub="For mediocrity. We reject the mild, the smooth, and the boring."
                />
            </div>
        </section>
    );
};

export default StatsSection;
