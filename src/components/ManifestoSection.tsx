import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useTime } from 'framer-motion';

// Caffeine Comparison Visualization
const CaffeineComparison: React.FC = () => {
    return (
        <div className="w-full h-full min-h-[500px] flex items-center justify-center p-8">
            <div className="relative w-full max-w-md bg-[#F9F8F4] text-[#1A1A1A] p-10 border border-black/5">
                {/* Header */}
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h4 className="text-sm font-sans uppercase tracking-[0.3em] text-[#A35D36] mb-2 font-bold">
                            Performance
                        </h4>
                        <h3 className="text-2xl font-serif italic">
                            The Kick Gap
                        </h3>
                    </div>
                    <div className="p-2 border border-black/10 rounded-full">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
                        </svg>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="flex gap-8 items-end h-[240px] mb-8 relative">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="w-full h-px bg-black/5 border-t border-dashed border-black/10" />
                        ))}
                    </div>

                    {/* Bar 1: Arabica */}
                    <div className="w-1/2 flex flex-col gap-4 relative z-10 group">
                        <div className="text-right">
                            <span className="text-2xl font-mono text-zinc-400 group-hover:text-zinc-600 transition-colors">1.2%</span>
                        </div>
                        <div className="h-[100px] w-full bg-zinc-200 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                        </div>
                        <span className="text-xs uppercase tracking-widest text-zinc-400 font-medium">Standard Arabica</span>
                    </div>

                    {/* Bar 2: Rabuste */}
                    <div className="w-1/2 flex flex-col gap-4 relative z-10 group">
                        <div className="text-right">
                            <span className="text-4xl font-mono text-[#A35D36] font-bold">2.4%</span>
                        </div>
                        <div className="h-[200px] w-full bg-[#A35D36] relative overflow-hidden shadow-[0_0_30px_rgba(163,93,54,0.3)]">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                            <motion.div
                                initial={{ top: "100%" }}
                                whileInView={{ top: "-100%" }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-1/2 bg-gradient-to-b from-transparent via-white/40 to-transparent"
                            />
                        </div>
                        <span className="text-xs uppercase tracking-widest text-[#A35D36] font-bold">Rabuste Pure</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-8 border-t border-black/10">
                    <p className="font-sans text-xl text-zinc-600 leading-relaxed font-medium">
                        <strong className="text-black">Translation:</strong> You drink half as much to get twice as much done. Efficiency is the ultimate luxury.
                    </p>
                </div>
            </div>
        </div>
    );
};

const ManifestoSection: React.FC = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 75%", "end end"]
    });

    const words = [
        "We", "reject", "the", "smooth.",
        "We", "reject", "the", "mild.",
        "Coffee", "was", "meant", "to", "wake", "you", "up."
    ];

    return (
        <section ref={containerRef} className="relative min-h-screen flex items-center bg-[#F9F8F4] text-[#1A1A1A] overflow-hidden py-24">

            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0">
                <svg width="100%" height="100%">
                    <filter id="noise">
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                        <feColorMatrix type="saturate" values="0" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noise)" />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                {/* LEFT: Text Content */}
                <div className="flex flex-col gap-16">
                    {/* Kinetic Headline - No Blur */}
                    <div className="flex flex-wrap content-start gap-x-3 gap-y-2 md:gap-x-4">
                        {/* Phase 1: We reject the smooth */}
                        <motion.div
                            initial={{ opacity: 0.2, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="w-full"
                        >
                            <span className="text-4xl md:text-6xl lg:text-7xl font-sans font-bold italic text-zinc-400">"</span>
                            <span className="text-4xl md:text-6xl lg:text-7xl font-sans font-bold tracking-tight text-[#1A1A1A]">We reject the </span>
                            <span className="text-4xl md:text-6xl lg:text-7xl font-sans font-bold tracking-tight text-[#A35D36]">smooth.</span>
                        </motion.div>

                        {/* Phase 2: We reject the mild */}
                        <motion.div
                            initial={{ opacity: 0.2, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="w-full"
                        >
                            <span className="text-4xl md:text-6xl lg:text-7xl font-sans font-bold tracking-tight text-[#1A1A1A]">We reject the </span>
                            <span className="text-4xl md:text-6xl lg:text-7xl font-sans font-bold tracking-tight text-[#A35D36]">mild.</span>
                        </motion.div>

                        {/* Phase 3: Coffee was meant to wake you up */}
                        <motion.div
                            initial={{ opacity: 0.2, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                            className="w-full mt-4"
                        >
                            <span className="text-4xl md:text-6xl lg:text-7xl font-sans font-bold tracking-tight text-[#1A1A1A]">Coffee was meant to </span>
                            <span className="text-4xl md:text-6xl lg:text-7xl font-sans font-bold tracking-tight text-[#A35D36]">wake you up.</span>
                            <span className="text-4xl md:text-6xl lg:text-7xl font-sans font-bold italic text-zinc-400">"</span>
                        </motion.div>
                    </div>

                    {/* Divider & Doctrine */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="pl-8 border-l-4 border-[#A35D36]"
                    >
                        <h3 className="text-xs font-sans uppercase tracking-[0.4em] text-zinc-400 mb-6 font-bold">
                            The Doctrine
                        </h3>
                        <p className="text-lg md:text-xl font-medium font-sans text-zinc-800 leading-relaxed mb-6">
                            While the world obsesses over delicate floral notes, we obsess over <span className="underline decoration-[#A35D36]/30 decoration-2 underline-offset-4">raw horsepower</span>.
                        </p>
                        <p className="text-lg md:text-xl font-sans text-zinc-600 leading-relaxed">
                            High-altitude Robusta beans, masterfully roasted to unlock specific chocolate and earthy tones with <strong className="text-black">double the caffeine payload</strong> of Arabica.
                        </p>
                    </motion.div>
                </div>

                {/* RIGHT: Visual Element */}
                <div className="block h-full min-h-[400px] lg:min-h-[600px] border-l border-black/5 border-t lg:border-t-0 mt-10 lg:mt-0 pt-10 lg:pt-0">
                    <CaffeineComparison />
                </div>

            </div>
        </section>
    );
};

export default ManifestoSection;
