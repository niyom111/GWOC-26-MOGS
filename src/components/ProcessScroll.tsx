
import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';

const ProcessCard: React.FC<{
    step: any;
    index: number;
    x: MotionValue<string>;
    containerScroll: MotionValue<number>;
    onImageLoad?: () => void;
}> = ({ step, index, x, containerScroll, onImageLoad }) => {

    // Parallax the image inside the card based on global scroll
    // We Map global scroll 0-1 to a shift in image position
    const imageX = useTransform(containerScroll, [0, 1], ["0%", "20%"]);

    return (
        <motion.div
            className="relative h-[65vh] w-[85vw] md:h-[70vh] md:w-[40vw] flex-shrink-0 overflow-hidden bg-[#F3EFE0] border-r border-black/10 group perspective-1000"
        >
            {/* Parallax Image Content */}
            <div className="absolute inset-0 w-full h-full">
                <img
                    src={step.img}
                    alt={step.title}
                    className="w-full h-full object-cover transition-all duration-700 ease-out"
                    onLoad={onImageLoad}
                />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />

            {/* Changed justify-center to justify-end using padding to position text lower */}
            <div className="absolute inset-0 p-8 md:p-12 pb-24 md:pb-32 flex flex-col justify-end items-center text-center z-10 transition-transform duration-500 group-hover:scale-105">
                <span className="text-[120px] md:text-[200px] font-bold text-white/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none select-none pointer-events-none">
                    0{step.id}
                </span>

                <div className="overflow-visible relative z-10">
                    <motion.h3
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: false, amount: 0.1 }}
                        transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
                        style={{ willChange: "transform, opacity" }}
                        className="text-4xl md:text-7xl text-white font-serif mb-4 italic"
                    >
                        {step.title}
                    </motion.h3>
                </div>

                <div className="overflow-visible relative z-10">
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: false, amount: 0.1 }}
                        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                        style={{ willChange: "transform, opacity" }}
                        className="text-zinc-300 font-sans text-sm md:text-lg max-w-md mx-auto leading-relaxed"
                    >
                        {step.desc}
                    </motion.p>
                </div>
            </div>
        </motion.div>
    );
};

const ProcessScroll: React.FC = () => {
    const targetRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [scrollRange, setScrollRange] = React.useState(0);
    const [isMobile, setIsMobile] = React.useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Measure the width of the horizontal content to determine exact scroll distance
    useEffect(() => {
        const element = scrollContainerRef.current;
        if (!element) return;

        const updateScrollRange = () => {
            if (scrollContainerRef.current) {
                const scrollWidth = scrollContainerRef.current.scrollWidth;
                const clientWidth = window.innerWidth;
                const newRange = scrollWidth - clientWidth;
                // Only update if dimensions actually changed significantly to avoid loops
                setScrollRange(current => Math.abs(current - newRange) > 1 ? newRange : current);
            }
        };

        // Initial measurement
        updateScrollRange();

        // Robust measurement using ResizeObserver
        const resizeObserver = new ResizeObserver(() => {
            updateScrollRange();
        });

        resizeObserver.observe(element);

        // Fallback: Check measurement again after a short delay for late image loads
        const timeout = setTimeout(updateScrollRange, 1000);

        window.addEventListener('resize', updateScrollRange);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateScrollRange);
            clearTimeout(timeout);
        };
    }, []);

    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"]
    });

    // Smooth spring physics for desktop "professional" feel
    // On mobile, use direct scrollYProgress to remove "lag/float" feeling. Desktop gets spring.
    const springProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
    const activeProgress = isMobile ? scrollYProgress : springProgress;

    // Start scrolling only after 15% of the section is consumed
    // End scrolling at 85% to create a "buffer" at the end where it stays on the last slide
    // before the user scrolls out to the next section.
    const x = useTransform(activeProgress, [0.15, 0.85], [0, -scrollRange]);

    const steps = [
        {
            id: 1,
            title: "Selection",
            desc: "We hunt for high-altitude Robusta cherries that others fear. Only the dense, the bold, and the potent make the cut.",
            img: "/media/rabuste-selection.png"
        },
        {
            id: 2,
            title: "Roasting",
            desc: "Roasted deep into the second crack. We don't preserve floral notes; we forge body, crema, and raw intensity.",
            img: "/media/rabuste-roasting.png"
        },
        {
            id: 3,
            title: "Extraction",
            desc: "High pressure, high temperature. We squeeze every drop of oil to create a crema thick enough to eat.",
            img: "/media/rabuste-extraction.png"
        },
        {
            id: 4,
            title: "Dominion",
            desc: "Served without milk, sugar, or apology. The pure, unadulterated taste of victory.",
            img: "/media/rabuste-dominian.png"
        },
    ];

    return (
        // Height controls the "speed" of the scroll. Increased to 800vh on mobile to slow it down (absorb more scroll).
        <section ref={targetRef} className="relative h-[800vh] md:h-[400vh] bg-[#F3EFE0] overflow-visible">
            {/* Sticky container uses 100dvh for better mobile dynamic viewport support */}
            <div className="sticky top-0 z-10 flex h-[100dvh] md:h-screen items-start pt-16 md:items-center md:pt-0 overflow-hidden bg-[#F3EFE0] text-[#1A1A1A]">

                {/* Horizontal Moving Container using ref for measurement */}
                <motion.div ref={scrollContainerRef} style={{ x, willChange: "transform" }} className="flex items-center">
                    <div className="flex-shrink-0 w-[85vw] md:w-[50vw] h-auto flex flex-col justify-center px-8 md:px-24">
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-[#A35D36] text-m font-sans uppercase tracking-[0.5em] mb-6"
                        >
                            The Ritual
                        </motion.span>
                        <h2 className="text-6xl md:text-[8rem] font-serif leading-[0.85] tracking-tighter mb-12">
                            From<br />
                            Bean To<br />
                            <span className="italic text-[#A35D36]">Cup.</span>
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full border border-black/20 flex items-center justify-center">
                                <div className="w-1 h-1 bg-black rounded-full animate-ping" />
                            </div>
                            <p className="text-xs uppercase tracking-[0.3em] font-sans text-[#A35D36]">
                                Scroll to Initiate
                            </p>
                        </div>
                    </div>

                    {steps.map((step, index) => (
                        <div key={step.id} className="h-auto flex-shrink-0 flex flex-col justify-center md:pt-0">
                            <ProcessCard
                                step={step}
                                index={index}
                                x={x}
                                // Pass raw scrollYProgress for parallax internal to card if needed
                                containerScroll={scrollYProgress}
                                onImageLoad={() => {
                                    // Force a recalculation when image loads
                                    window.dispatchEvent(new Event('resize'));
                                }}
                            />
                        </div>
                    ))}

                </motion.div>
            </div>
        </section>
    );
};

export default ProcessScroll;
