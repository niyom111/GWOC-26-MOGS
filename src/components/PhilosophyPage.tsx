
import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Page } from '../types';

// Decorative Icons
const CoffeeBeanIcon = ({ className = "" }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 4c2.76 0 5 2.24 5 5 0 2.8-2.5 7.15-5 10.74C9.5 16.15 7 11.8 7 9c0-2.76 2.24-5 5-5z" />
        <path d="M10.5 7.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S10.5 11 10.5 14s2 3 2 3-3-1.5-3-5 .67-1.5 1.5-1.5z" />
    </svg>
);

const CoffeeCupIcon = ({ className = "" }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M18.5 4H5.5C4.67 4 4 4.67 4 5.5V13c0 3.31 2.69 6 6 6h4c3.31 0 6-2.69 6-6V5.5c0-.83-.67-1.5-1.5-1.5zM18 13c0 2.21-1.79 4-4 4h-4c-2.21 0-4-1.79-4-4V6h12v7z" />
        <path d="M21 7h-1v7c0 1.1-.9 2-2 2v2c2.21 0 4-1.79 4-4V7z" />
        <path d="M8 2h2v3H8zm4 0h2v3h-2zm4 0h2v3h-2z" />
    </svg>
);

const StarIcon = ({ className = "" }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
    </svg>
);


interface SectionProps {
    children: React.ReactNode;
    className?: string;
}

const Section: React.FC<SectionProps> = ({ children, className = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });

    return (
        <motion.section
            ref={ref}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`relative py-20 ${className}`}
        >
            {children}
        </motion.section>
    );
};


// Extracted Card Component to handle Intersection Observer more cleanly
interface TrifectaCardProps {
    item: any;
    index: number;
    onNavigate: (page: Page) => void;
}

const TrifectaCard: React.FC<TrifectaCardProps> = ({ item, index, onNavigate }) => {
    const ref = useRef(null);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // If it's intersecting the center area (defined by rootMargin below)
                setIsActive(entry.isIntersecting);
            },
            {
                root: null,
                // Shrink the intersection area to a thin strip in the center of the viewport
                // 50% from top, 50% from bottom (approx)
                // Actually creating a 10px high window in the center
                rootMargin: '-50% 0px -50% 0px',
                threshold: 0
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    // Helper to conditionally apply classes based on active state OR hover (for desktop)
    const iconColorClass = isActive ? 'text-black scale-110' : 'text-zinc-300 group-hover:text-black group-hover:scale-110';
    const buttonClass = isActive
        ? 'bg-black text-white border-black'
        : 'bg-zinc-50 text-black border-zinc-200 hover:bg-black hover:text-white hover:border-black';

    return (
        <motion.div
            ref={ref}
            whileHover={{ y: -8 }}
            // We only want the scroll trigger on mobile, but it's fine if it triggers on desktop too as long as it looks good.
            // However, 'isActive' logic is mainly for mobile scroll. On desktop, hover still works.
            className={`bg-white p-10 border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group h-full justify-between ${isActive ? 'shadow-xl -translate-y-2' : ''}`}
        >
            <div className="flex flex-col items-center">
                <div className={`mb-6 transition-all transform duration-300 ${iconColorClass}`}>
                    {index === 1 ? <StarIcon className="w-12 h-12" /> : item.icon}
                </div>
                <h3 className="text-xl font-bold uppercase tracking-widest mb-4 text-black">{item.title}</h3>
                <p className="text-zinc-600 text-sm leading-relaxed mb-8 max-w-xs">
                    {item.desc}
                </p>
            </div>

            <button
                onClick={() => onNavigate(item.target)}
                className={`px-6 py-3 text-[10px] uppercase tracking-[0.25em] font-bold border transition-all duration-300 ${buttonClass}`}
            >
                {item.action}
            </button>
        </motion.div>
    );
};


// Extracted Story Card Component
interface StoryCardProps {
    year: string;
    title: string;
    children: React.ReactNode;
    delay?: number;
}

const StoryCard: React.FC<StoryCardProps> = ({ year, title, children, delay = 0 }) => {
    const ref = useRef(null);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsActive(entry.isIntersecting);
            },
            {
                root: null,
                rootMargin: '-50% 0px -50% 0px',
                threshold: 0
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-5%" }}
            transition={{ duration: 0.7, ease: "easeOut", delay }}
            whileHover={{ y: -8 }}
            className={`bg-white p-10 md:p-12 border border-black/5 shadow-sm transition-all duration-500 group h-full flex flex-col ${isActive ? 'shadow-xl -translate-y-2' : 'hover:shadow-xl'}`}
        >
            <div className="flex items-center justify-between mb-8 border-b border-black/5 pb-4">
                <span className={`text-xs uppercase tracking-[0.25em] font-bold transition-colors ${isActive ? 'text-black' : 'text-zinc-400 group-hover:text-black'}`}>
                    {year}
                </span>
            </div>
            <h3 className="text-4xl md:text-6xl font-serif italic leading-none text-black mb-6">
                {title}
            </h3>
            <div className="space-y-6 text-zinc-600 text-lg leading-relaxed font-light">
                {children}
            </div>
        </motion.div>
    );
};


interface AwarenessPageProps {
    onNavigate: (page: Page) => void;
}

const AwarenessPage: React.FC<AwarenessPageProps> = ({ onNavigate }) => {
    const { scrollYProgress } = useScroll();
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    return (
        <div className="bg-[#F9F8F4] text-[#1A1A1A] overflow-hidden font-sans selection:bg-black selection:text-[#F9F8F4] relative">

            {/* Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-[#1A1A1A] origin-left z-50"
                style={{ scaleX: scrollYProgress }}
            />

            {/* FULL SCREEN HERO SECTION */}
            <div className="relative h-screen w-full overflow-hidden flex items-center justify-center">
                {/* Video Background */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src="/media/philosphy.mp4" type="video/mp4" />
                </video>

                {/* Dark Overlay for Readability */}
                <div className="absolute inset-0 bg-black/50" />

                {/* Hero Content - Centered */}
                <motion.div
                    style={{ opacity: heroOpacity, scale: heroScale }}
                    className="relative z-10 flex flex-col items-center justify-center p-4 -mt-24"
                >
                    {/* Top Text */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-7xl md:text-[11rem] font-serif italic tracking-tighter leading-[0.85] text-[#F9F8F4] text-center"
                    >
                        More Than
                    </motion.h1>

                    {/* Bottom Text */}
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-7xl md:text-[11rem] font-serif italic tracking-tighter leading-[0.85] text-[#F9F8F4] text-center"
                    >
                        A Buzz.
                    </motion.h1>
                </motion.div>

                {/* Bottom Text - Pinned to Viewport Bottom */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="absolute bottom-24 left-0 right-0 z-20 flex flex-col items-center gap-4 pb-8"
                >
                    <div className="flex gap-4 text-zinc-300">
                        <StarIcon className="w-4 h-4" />
                        <StarIcon className="w-4 h-4" />
                        <StarIcon className="w-4 h-4" />
                    </div>
                    <p className="text-xs md:text-sm text-zinc-300 uppercase tracking-[0.3em] font-medium border-b border-zinc-200/50 pb-2">
                        Discipline meets Decadence
                    </p>
                </motion.div>
            </div>

            {/* SECTION 1: The Name - Reverted to Grid Layout */}
            <Section className="min-h-screen w-full flex items-center justify-center bg-[#F9F8F4] px-6 md:px-20">
                <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Left Side: Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="order-1 md:order-1 md:pl-12"
                    >
                        <h2 className="text-4xl md:text-7xl font-serif italic tracking-tight mb-8 text-black leading-[0.9]">
                            The Name: <br />
                            <span className="underline decoration-1 underline-offset-8 decoration-zinc-300">Rabuste</span>
                        </h2>

                        <p className="text-base md:text-xl text-zinc-800 leading-relaxed font-light text-balance max-w-xl">
                            A deliberate distortion of <span className="font-semibold text-black">Robusta</span>.
                            While others softened coffee into comfort, we leaned into the power.
                            It is a declaration of strength in every sip, rejecting the diluted and the mundane.
                            <br /><br />
                            We source beans that fight for their place in the cup, delivering a caffeine punch that wakes the soul, not just the body.
                            <br /><br />
                            <span className="block text-zinc-900 text-sm uppercase tracking-widest font-medium">
                                Intensity is not to be diluted.
                            </span>
                        </p>
                    </motion.div>

                    {/* Right Side: Video */}
                    <div className="order-2 md:order-2 flex justify-center md:justify-end w-full md:pr-24">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            className="relative w-full max-w-lg aspect-[3/4] rounded-lg overflow-hidden shadow-2xl"
                        >
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            >
                                <source src="/media/philosphy1.mp4" type="video/mp4" />
                            </video>
                        </motion.div>
                    </div>
                </div>
            </Section>


            {/* Main Content Container for Remaining Sections */}
            <div className="max-w-7xl mx-auto px-6 md:px-20 relative z-10 pb-12">








                {/* SECTION 2: The Sourcing */}
                <Section className="relative pt-8">
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                        <div className="md:col-span-6 flex justify-start">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "-10%" }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="aspect-[3/4] relative w-full max-w-lg rounded-lg overflow-hidden shadow-2xl mt-6 md:mt-0 md:-ml-12"
                            >
                                <img
                                    src="/media/rabuste1.jpeg"
                                    alt="Source"
                                    className="w-full h-full object-cover contrast-125"
                                />
                            </motion.div>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            className="md:col-span-6 md:pl-10 space-y-8"
                        >
                            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-zinc-900 font-bold">
                                <span>The Sourcing</span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-serif italic leading-none text-black">
                                Why Only <br />Robusta?
                            </h2>
                            <p className="text-zinc-800 text-lg md:text-xl font-light leading-relaxed max-w-lg text-balance">
                                For decades, the coffee industry has sidelined Robusta, dismissing it as the inferior sibling to Arabica. We exist to reclaim the bean the world ignored. Robusta is not just stronger; it is resilient, bold, and unapologetic. It provides <span className="font-medium bg-zinc-100 px-2">twice the caffeine</span> and a richer antioxidant load, delivering a cup that doesn't just wake you up—it commands your attention.
                            </p>

                            <div className="grid grid-cols-2 gap-6 pt-6">
                                <div className="bg-[#F9F8F4] p-6 border border-zinc-200 text-center shadow-sm">
                                    <span className="block text-2xl md:text-3xl font-serif italic text-black">2x</span>
                                    <span className="text-[10px] md:text-xs uppercase tracking-widest text-zinc-400">Caffeine</span>
                                </div>
                                <div className="bg-[#F9F8F4] p-6 border border-zinc-200 text-center shadow-sm">
                                    <span className="block text-2xl md:text-3xl font-serif italic text-black">High</span>
                                    <span className="text-[10px] md:text-xs uppercase tracking-widest text-zinc-400">Altitude</span>
                                </div>
                            </div>

                            <button
                                onClick={() => onNavigate(Page.ROBUSTA_STORY)}
                                className="mt-6 text-xs uppercase tracking-[0.25em] border-b border-black pb-2 hover:text-zinc-600 transition-colors font-bold"
                            >
                                Read The Deep Dive
                            </button>
                        </motion.div>
                    </div>
                </Section>





                {/* SECTION 3: The Visionary (Widened) */}
                <div className="w-[120%] -ml-[10%]">
                    <Section className="bg-[#F9F8F4] p-12 md:p-24 border border-[#1A1A1A]/5 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-10%" }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="md:col-span-7 order-2 md:order-1"
                            >
                                <div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-zinc-900 font-bold mb-8">
                                    <span>The Visionary</span>
                                </div>
                                <blockquote className="text-4xl md:text-6xl font-serif italic leading-tight text-black mb-10">
                                    "We didn't build Rabuste to compete with the coffee shop next door. We built it to compete with your comfort zone."
                                </blockquote>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-px bg-zinc-300" />
                                    <cite className="not-italic text-base uppercase tracking-widest text-zinc-900 font-semibold flex flex-col">
                                        Vaibhav Sutaria
                                        <span className="text-[10px] text-zinc-600 tracking-[0.2em] mt-1 font-medium">Founder</span>
                                    </cite>
                                </div>
                            </motion.div>
                            <div className="md:col-span-5 order-1 md:order-2">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true, margin: "-10%" }}
                                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                    className="aspect-square relative max-w-[550px] mx-auto"
                                >
                                    <div className="absolute inset-0 border border-black translate-x-6 translate-y-6" />
                                    <img
                                        src="/media/founder.jpeg"
                                        alt="Founder"
                                        className="w-full h-full object-cover relative z-10 border border-white"
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </Section>
                </div>



                {/* SECTION 3.5: The Story (Revamped) */}
                <Section className="py-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-stretch relative z-10">
                        {/* Card 1: The Genesis */}
                        <StoryCard year="Est. 2024" title="The Genesis.">
                            <p>
                                The Rabuste journey began in 2024 with a clear and simple vision. While the world chased Arabica, our founder <strong className="text-black font-medium">Vaibhav</strong> saw the untamed potential of the ignored bean.
                            </p>
                            <p>
                                He didn't just want to brew coffee; he wanted to <strong className="text-black font-medium">challenge the palate</strong>. By treating Robusta with the respect usually reserved for fine wine, we unlocked a flavor profile that is bold, unapologetic, and <em className="text-black not-italic border-b border-black/20">impossible to ignore</em>.
                            </p>
                        </StoryCard>

                        {/* Card 2: The Gallery */}
                        <StoryCard year="Curated Space" title="The Gallery." delay={0.2}>
                            <p>
                                A cafe should be more than a caffeine stop; it should be a place of <strong className="text-black font-medium">provocation</strong>. Vaibhav's deep love for art shaped Rabuste into a living gallery.
                            </p>
                            <p>
                                We don't use art as decoration. We curate pieces that <strong className="text-black font-medium">spark conversation</strong>. When you step inside, you aren't just drinking coffee—you are entering a space where flavor and visual creativity collide to wake up your imagination.
                            </p>
                        </StoryCard>
                    </div>
                </Section>


                {/* SECTION 4: The Trifecta */}
                <Section className="mt-8 px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl md:text-7xl font-serif italic text-black mb-6">
                            The Trifecta.
                        </h2>
                        <div className="h-px w-24 bg-black mx-auto mb-8" />
                        <p className="text-zinc-600 text-lg md:text-xl font-light leading-relaxed max-w-3xl mx-auto text-balance">
                            Rabuste is built on three unshakeable pillars. We believe that true coffee culture goes beyond the cup—it is an immersion of the senses. By fusing high-grade Robusta, avant-garde art, and expert-led education, we create an ecosystem where flavor, creativity, and knowledge converge. This is our holy trinity; an experience designed not just to be consumed, but to be felt.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Menu",
                                desc: "Explore our curated selection of high-grade Robusta brews, from classic espressos to experimental pours designed to awaken the senses.",
                                icon: <CoffeeBeanIcon className="w-10 h-10" />,
                                action: "View Menu",
                                target: Page.MENU
                            },
                            {
                                title: "Fine Art",
                                desc: "Immerse yourself in our living gallery spaces. We feature rotating collections from avant-garde artists that challenge perspective.",
                                icon: <StarIcon className="w-10 h-10" />,
                                action: "View Gallery",
                                target: Page.ART
                            },
                            {
                                title: "Workshops",
                                desc: "Join our sensory labs and masterclasses. Learn the science of extraction, latte art, and the history of the bean from our experts.",
                                icon: <CoffeeCupIcon className="w-10 h-10" />,
                                action: "Join Workshop",
                                target: Page.WORKSHOPS
                            }
                        ].map((item, i) => (
                            <TrifectaCard key={i} item={item} index={i} onNavigate={onNavigate} />
                        ))}
                    </div>
                </Section>



            </div>
        </div>
    );
};

export default AwarenessPage;