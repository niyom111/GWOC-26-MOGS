import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion as motionBase, AnimatePresence as AnimatePresenceBase, Variants, useScroll, useTransform, useSpring } from 'framer-motion';
import {
    Coffee, Palette, Users, CheckCircle,
    TrendingUp, DollarSign, MapPin, Heart, ChevronDown, X
} from 'lucide-react';
import { API_BASE_URL } from '../config';

// Fix for framer-motion compatibility
// The environment requires casting these components to 'any' to avoid type/runtime issues
const motion = motionBase as any;
const AnimatePresence = AnimatePresenceBase as any;

interface FaqItem {
    id: number;
    question: string;
    answer: string;
}

// --- ROADMAP TIMELINE (Symmetrical Curved) ---
const TimelineSection: React.FC = () => {
    // Scroll progress for the drawing animation
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });

    // We explicitly map the scroll progress to pathLength to ensure it draws as we scroll
    const pathLength = useSpring(scrollYProgress, { stiffness: 400, damping: 90 });

    return (
        <section ref={containerRef} className="py-24 px-4 md:px-12 max-w-7xl mx-auto overflow-hidden">
            <motion.div
                className="mb-10 md:mb-24 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                {/* Reduced text size as requested */}
                <h2 className="text-4xl md:text-6xl font-serif italic mb-6">From Vision to Launch.</h2>
                <div className="h-px w-24 bg-[#A35D36] mx-auto" />
            </motion.div>

            <div className="relative">
                {/* 
                    DESKTOP CURVED LINE SVG 
                    Fixed width 800px centered.
                    Height 1100px covers the items perfectly with padding.
                */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1100px] hidden md:block pointer-events-none" style={{ zIndex: 0 }}>
                    <svg
                        viewBox="0 0 800 1100"
                        fill="none"
                        preserveAspectRatio="xMidYMin slice"
                        className="w-full h-full"
                        style={{ overflow: 'visible' }}
                    >
                        {/* Background Trace (Light) */}
                        <motion.path
                            d="M 400 0 
                               C 400 50, 250 50, 250 100
                               C 250 200, 550 200, 550 300
                               C 550 400, 250 400, 250 500
                               C 250 600, 550 600, 550 700
                               C 550 800, 250 800, 250 900
                               C 250 1000, 400 1000, 400 1100"
                            stroke="#A35D36"
                            strokeWidth="2"
                            strokeOpacity="0.1"
                        />
                        {/* Animated Foreground Path (Draws on Scroll) */}
                        <motion.path
                            d="M 400 0 
                               C 400 50, 250 50, 250 100
                               C 250 200, 550 200, 550 300
                               C 550 400, 250 400, 250 500
                               C 250 600, 550 600, 550 700
                               C 550 800, 250 800, 250 900
                               C 250 1000, 400 1000, 400 1100"
                            stroke="#A35D36"
                            strokeWidth="3"
                            style={{ pathLength }}
                        />
                    </svg>
                </div>

                {/* MOBILE STRAIGHT LINE (Hidden on Desktop) */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-black/5 md:hidden">
                    <motion.div
                        className="w-full bg-[#A35D36] origin-top"
                        initial={{ height: 0 }}
                        whileInView={{ height: "100%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                    />
                </div>

                <div className="space-y-0 relative z-10 pt-0 md:pt-0">
                    {[
                        { step: "01", title: "Inquiry", desc: "Submit your basic details and interest." },
                        { step: "02", title: "Evaluation", desc: "Site visit and financial assessment." },
                        { step: "03", title: "Agreement", desc: "Signing the MOU and franchise fees." },
                        { step: "04", title: "Build-Out", desc: "Interiors, hiring, and procurement." },
                        { step: "05", title: "Launch", desc: "Grand opening and marketing blitz." }
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            className={`flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0 relative`}
                            style={{
                                // Strict 200px height on Desktop to match SVG coordinates perfectly.
                                height: typeof window !== 'undefined' && window.innerWidth >= 768 ? '200px' : 'auto',
                                minHeight: '200px'
                            }}
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            {/* 
                                DOT POSITIONING
                                Matches SVG Peaks: Left (250) & Right (550).
                                Center is 400. 
                                Left offset: -150px.
                                Right offset: +150px.
                            */}
                            <div className="hidden md:absolute md:flex items-center justify-center w-0 h-0 z-20 left-1/2 top-1/2 -translate-y-1/2"
                                style={{ transform: `translate(${index % 2 === 0 ? '-150px' : '150px'}, -50%)` }}
                            >
                                <motion.div
                                    className="w-5 h-5 shrink-0 rounded-full border-[2px] border-white shadow-xl z-30"
                                    style={{ backgroundColor: '#ef4444' }}
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                                />
                            </div>

                            {/* Mobile Dot */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-0 md:hidden w-5 h-5 shrink-0 rounded-full border-[2px] border-white shadow-xl z-30" style={{ backgroundColor: '#ef4444' }}></div>


                            {/* 
                                CONTENT POSITIONING
                                Desktop uses a zigzag layout.
                                Mobile uses a single centered vertical line.
                            */}

                            {/* DESKTOP CONTENT (Alternating Sides) */}
                            <div className={`hidden md:block w-1/2 ${index % 2 !== 0 ? 'invisible' : 'pr-48 text-right'}`}>
                                {index % 2 === 0 && (
                                    <>
                                        <span className="text-8xl font-serif italic text-black/25 block -mb-10 relative z-0">{item.step}</span>
                                        <div className="relative z-10">
                                            <h3 className="text-4xl font-serif italic mb-2 text-black">{item.title}</h3>
                                            <p className="font-sans text-black text-xl leading-relaxed">{item.desc}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className={`hidden md:block w-1/2 ${index % 2 === 0 ? 'invisible' : 'pl-48 text-left'}`}>
                                {index % 2 !== 0 && (
                                    <>
                                        <span className="text-8xl font-serif italic text-black/25 block -mb-10 relative z-0">{item.step}</span>
                                        <div className="relative z-10">
                                            <h3 className="text-4xl font-serif italic mb-2 text-black">{item.title}</h3>
                                            <p className="font-sans text-black text-xl leading-relaxed">{item.desc}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* MOBILE CONTENT (Always Center Aligned) */}
                            <div className="md:hidden flex flex-col items-center text-center px-6 py-10 w-full">
                                <span className="text-7xl font-serif italic text-black/25 block -mb-8 relative z-0">{item.step}</span>
                                <div className="relative z-10">
                                    <h3 className="text-3xl font-serif italic mb-2 text-black">{item.title}</h3>
                                    <p className="font-sans text-black text-lg leading-relaxed">{item.desc}</p>
                                </div>
                            </div>

                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FranchisePage: React.FC = () => {
    // Debug logging to confirm render
    useEffect(() => {
        console.log("FranchisePage mounted");
    }, []);

    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [contactNumber, setContactNumber] = useState<string>('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        contact_number: '',
        email: '',
        enquiry: ''
    });
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Responsive State
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    // Fetch Data
    useEffect(() => {
        // Fetch Settings
        fetch(`${API_BASE_URL}/api/franchise/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.contact_number) setContactNumber(data.contact_number);
            })
            .catch(err => console.error('Failed to fetch settings:', err));

        // Fetch FAQs
        fetch(`${API_BASE_URL}/api/franchise/faq`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setFaqs(data);
            })
            .catch(err => console.error('Failed to fetch FAQs:', err));
    }, []);

    const toggleFaq = (index: number) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('submitting');
        setErrorMessage('');

        try {
            const res = await fetch(`${API_BASE_URL}/api/franchise/enquire`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                if (errData.error?.includes('relation') || errData.error?.includes('franchise_')) {
                    throw new Error('System Error: Database tables not found. Please run the migration script.');
                }
                throw new Error(errData.error || 'Submission failed');
            }

            setFormStatus('success');
            setTimeout(() => {
                setIsModalOpen(false);
                setFormStatus('idle');
                setFormData({ full_name: '', contact_number: '', email: '', enquiry: '' }); // Reset form
            }, 3000);
        } catch (err: any) {
            console.error(err);
            setFormStatus('error');
            setErrorMessage(err.message);
        }
    };

    // --- NEW COMPONENT: CURVED TIMELINE ---
    // --- ANIMATION REFS & LOGIC ---
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"]
    });

    // Parallax logic for images
    const missionRef = useRef(null);
    const { scrollYProgress: missionProgress } = useScroll({ target: missionRef, offset: ["start end", "end start"] });
    const missionY = useTransform(missionProgress, [0, 1], ["0%", "20%"]);

    const supportRef = useRef(null);
    const { scrollYProgress: supportProgress } = useScroll({ target: supportRef, offset: ["start end", "end start"] });
    const supportY = useTransform(supportProgress, [0, 1], ["0%", "-10%"]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1, // Faster stagger for snappiness
                delayChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <div className="min-h-screen bg-[#F3EFE0] overflow-x-hidden text-[#1A1A1A]" ref={targetRef}>

            {/* 1. HERO SECTION - Clean, No Image, Just Vibe */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20 bg-black">
                {/* Background Video */}
                <div className="absolute inset-0 z-0 bg-black">
                    <motion.video
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        transition={{ duration: 2.5, ease: "easeOut" }} // Slower fade for video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src="/media/franchiseheropage3.mp4" type="video/mp4" />
                    </motion.video>
                    {/* Unified Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-black/30 pointer-events-none" />
                </div>

                {/* Background Noise - Reduced opacity */}
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
                    <svg width="100%" height="100%">
                        <filter id="noise">
                            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                            <feColorMatrix type="saturate" values="0" />
                        </filter>
                        <rect width="100%" height="100%" filter="url(#noise)" />
                    </svg>
                </div>

                {/* Subtle Breathing Glow - Adjusted for white text contrast */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.08, 0.05] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-white rounded-full blur-[120px] pointer-events-none"
                    style={{ willChange: "transform, opacity" }}
                />

                <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        key="partnership-tag"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="mb-8"
                    >
                        <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-white/90 font-sans inline-block border-b border-white/30 pb-3">
                            The Partnership
                        </h2>
                    </motion.div>

                    <div className="overflow-hidden mb-2 relative">
                        <motion.h1
                            key="hero-title-1"
                            className="text-[13vw] md:text-[8vw] leading-[0.9] font-serif italic tracking-tighter text-white"
                            initial={{ opacity: 0, y: "100%" }} // Percentage often handles resize better
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            style={{ willChange: "transform, opacity" }}
                        >
                            Built for
                        </motion.h1>
                    </div>
                    <div className="overflow-hidden mb-12 relative pb-4">
                        <motion.h1
                            key="hero-title-2"
                            className="text-[13vw] md:text-[8vw] leading-[0.9] font-serif italic tracking-tighter text-white"
                            initial={{ opacity: 0, y: "100%" }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            style={{ willChange: "transform, opacity" }}
                        >
                            Intentionality.
                        </motion.h1>
                    </div>

                    <motion.p
                        key="hero-subtitle"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="text-xl md:text-3xl font-serif italic max-w-3xl mx-auto leading-relaxed text-white/90"
                    >
                        Own a sanctuary of bold Robusta and minimalist design. <br className="hidden md:block" />Join the movement.
                    </motion.p>
                </div>
            </section>

            {/* 2. STORYTELLING SECTION */}
            <section id="mission" className="py-20 md:py-32 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-10%" }}
                    variants={containerVariants}
                >
                    <motion.h2 variants={itemVariants} className="text-[12px] font-bold uppercase tracking-[0.4em] text-[#A35D36] mb-6 font-sans">Our Mission</motion.h2>
                    <motion.h3 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-serif italic mb-8 text-[#1A1A1A] leading-tight">
                        <span className="font-bold">We are reclaiming</span> <br /><span className="text-baige">the narrative of Robusta.</span>
                    </motion.h3>
                    <motion.div variants={itemVariants} className="h-px w-24 bg-[#A35D36] mb-8" />
                    <motion.p variants={itemVariants} className="font-sans text-xl md:text-2xl text-black mb-6 leading-relaxed">
                        For too long, Robusta has been misunderstood. At Rabuste, we source single-origin, high-grade beans that challenge the status quo.
                    </motion.p>
                    <motion.p variants={itemVariants} className="font-sans text-xl md:text-2xl text-black leading-relaxed">
                        Our spaces are designed to be more than just cafes—they are cultural hubs where bold coffee meets minimalist art and community workshops.
                    </motion.p>
                </motion.div>

                <div ref={missionRef} className="relative h-[350px] md:h-[700px] rounded-none overflow-hidden shadow-2xl group">
                    <motion.div className="absolute inset-0 w-full h-full">
                        <img
                            src="/media/franchisecoffee.jpg"
                            alt="Perfect Espresso Pour"
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                </div>
            </section>

            {/* 3. PREREQUISITES - INFOGRAPHIC CARDS */}
            <section className="pt-24 pb-8 text-[#1A1A1A]">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <motion.div
                        className="mb-20 text-center"
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-6xl md:text-6xl font-serif italic mb-6">The Blueprint.</h2>
                        <p className="text-black font-sans max-w-xl mx-auto text-sm md:text-base uppercase tracking-[0.25em]">
                            What it takes to build a Rabuste sanctuary.
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 text-black"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-10%" }}
                    >
                        {/* Card 1: Space */}
                        <motion.div
                            variants={itemVariants}
                            initial={{ opacity: 0.8, scale: 0.95, backgroundColor: "#ffffff", color: "#000000" }}
                            whileInView={{
                                opacity: 1,
                                scale: 1.03,
                                backgroundColor: isDesktop ? "#ffffff" : "#000000",
                                color: isDesktop ? "#000000" : "#ffffff"
                            }}
                            viewport={isDesktop ? { once: false, amount: 0.5 } : { once: false, amount: 0.3, margin: "-40% 0px -40% 0px" }}
                            whileHover={isDesktop ? {
                                scale: 1.05,
                                y: -5,
                                backgroundColor: "#000000",
                                color: "#ffffff"
                            } : { scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                backgroundColor: { duration: 0.5 },
                                color: { duration: 0.5 },
                                scale: { duration: 0.4 }
                            }}
                            className="p-8 md:p-10 rounded-none relative overflow-hidden border border-black/5 shadow-md cursor-pointer"
                            style={{ willChange: "background-color, color" }}
                        >
                            <motion.h4
                                className="text-lg md:text-xl font-bold uppercase tracking-[0.2em] mb-6 font-sans"
                                initial={{ color: "#000000" }}
                                whileInView={{ color: "inherit" }}
                                transition={{ duration: 0.5 }}
                            >
                                Space
                            </motion.h4>
                            <motion.p
                                className="text-3xl md:text-5xl font-serif italic mb-6"
                                initial={{ color: "#000000" }}
                                whileInView={{ color: "inherit" }}
                                transition={{ duration: 0.5 }}
                            >
                                1000 <span className="text-xl font-sans text-zinc-400 not-italic mx-2">-</span> 1500 <motion.span
                                    className="text-xs font-sans not-italic block mt-1"
                                    initial={{ color: "#71717a" }}
                                    whileInView={{ color: "inherit" }}
                                    transition={{ duration: 0.5 }}
                                >
                                    sq.ft.
                                </motion.span>
                            </motion.p>
                            <motion.p
                                className="text-lg font-sans leading-relaxed border-t pt-6 border-current border-opacity-20 transition-colors duration-500"
                            >
                                Ideally located in high-street zones or premium commercial hubs with high footfall.
                            </motion.p>
                        </motion.div>

                        {/* Card 2: Investment */}
                        <motion.div
                            variants={itemVariants}
                            initial={{ opacity: 0.8, scale: 0.95, backgroundColor: "#ffffff", color: "#000000" }}
                            whileInView={{
                                opacity: 1,
                                scale: 1.03,
                                backgroundColor: isDesktop ? "#ffffff" : "#000000",
                                color: isDesktop ? "#000000" : "#ffffff"
                            }}
                            viewport={isDesktop ? { once: false, amount: 0.5 } : { once: false, amount: 0.3, margin: "-40% 0px -40% 0px" }}
                            whileHover={isDesktop ? {
                                scale: 1.05,
                                y: -5,
                                backgroundColor: "#000000",
                                color: "#ffffff"
                            } : { scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                backgroundColor: { duration: 0.5 },
                                scale: { duration: 0.4 }
                            }}
                            className="p-8 md:p-10 rounded-none relative overflow-hidden border border-black/5 shadow-md cursor-pointer"
                            style={{ willChange: "background-color, color" }}
                        >
                            <motion.h4
                                className="text-lg md:text-xl font-bold uppercase tracking-[0.2em] mb-6 font-sans"
                                initial={{ color: "#000000" }}
                                whileInView={{ color: "inherit" }}
                                transition={{ duration: 0.5 }}
                            >
                                Investment
                            </motion.h4>
                            <motion.p
                                className="text-3xl md:text-5xl font-serif italic mb-6"
                                initial={{ color: "#000000" }}
                                whileInView={{ color: "inherit" }}
                                transition={{ duration: 0.5 }}
                            >
                                ₹35L <span className="text-xl font-sans text-zinc-400 not-italic mx-2">-</span> 50L
                            </motion.p>
                            <motion.p
                                className="text-lg font-sans leading-relaxed border-t pt-6 border-current border-opacity-20 transition-colors duration-500"
                            >
                                Total setup cost including license fees, interiors, equipment, and initial stock.
                            </motion.p>
                        </motion.div>

                        {/* Card 3: Passion */}
                        <motion.div
                            variants={itemVariants}
                            initial={{ opacity: 0.8, scale: 0.95, backgroundColor: "#ffffff", color: "#000000" }}
                            whileInView={{
                                opacity: 1,
                                scale: 1.03,
                                backgroundColor: isDesktop ? "#ffffff" : "#000000",
                                color: isDesktop ? "#000000" : "#ffffff"
                            }}
                            viewport={isDesktop ? { once: false, amount: 0.5 } : { once: false, amount: 0.3, margin: "-40% 0px -40% 0px" }}
                            whileHover={isDesktop ? {
                                scale: 1.05,
                                y: -5,
                                backgroundColor: "#000000",
                                color: "#ffffff"
                            } : { scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                backgroundColor: { duration: 0.5 },
                                scale: { duration: 0.4 }
                            }}
                            className="p-8 md:p-10 rounded-none relative overflow-hidden border border-black/5 shadow-md cursor-pointer"
                            style={{ willChange: "background-color, color" }}
                        >
                            <motion.h4
                                className="text-lg md:text-xl font-bold uppercase tracking-[0.2em] mb-6 font-sans"
                                initial={{ color: "#000000" }}
                                whileInView={{ color: "inherit" }}
                                transition={{ duration: 0.5 }}
                            >
                                Experience
                            </motion.h4>
                            <motion.p
                                className="text-3xl md:text-5xl font-serif italic mb-6"
                                initial={{ color: "#000000" }}
                                whileInView={{ color: "inherit" }}
                                transition={{ duration: 0.5 }}
                            >
                                Passion First
                            </motion.p>
                            <motion.p
                                className="text-lg font-sans leading-relaxed border-t pt-6 border-current border-opacity-20 transition-colors duration-500"
                            >
                                No prior F&B experience needed. A deep commitment to quality and community is mandatory.
                            </motion.p>
                        </motion.div>
                    </motion.div>
                </div>
            </section >

            {/* 4. FINANCIALS - DARK CARDS */}
            < section className="pt-0 pb-24 px-6 md:px-12 max-w-7xl mx-auto" >
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <motion.div
                        variants={itemVariants}
                        initial={{ opacity: 0.8, scale: 0.95, backgroundColor: "#ffffff", color: "#000000" }}
                        whileInView={{
                            opacity: 1,
                            scale: 1.03,
                            backgroundColor: isDesktop ? "#ffffff" : "#000000",
                            color: isDesktop ? "#000000" : "#ffffff"
                        }}
                        viewport={isDesktop ? { once: false, amount: 0.5 } : { once: false, amount: 0.3, margin: "-40% 0px -40% 0px" }}
                        whileHover={isDesktop ? {
                            scale: 1.05,
                            y: -5,
                            backgroundColor: "#000000",
                            color: "#ffffff"
                        } : { scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            backgroundColor: { duration: 0.5 },
                            scale: { duration: 0.4 }
                        }}
                        className="border border-black/5 p-12 rounded-none text-center shadow-md cursor-pointer group">
                        <motion.div
                            className={`w-20 h-20 mx-auto rounded-full border flex items-center justify-center mb-6 transition-colors duration-500 ${isDesktop ? "border-black/10 text-[#A35D36] group-hover:border-white/20 group-hover:text-white" : "border-white/20 text-white"}`}
                        >
                            <span className="text-3xl font-serif font-bold italic">7%</span>
                        </motion.div>
                        <motion.h3
                            className="text-3xl font-serif italic mb-2"
                            initial={{ color: "#000000" }}
                            whileInView={{ color: "inherit" }}
                            transition={{ duration: 0.5 }}
                        >
                            Royalty
                        </motion.h3>
                        <motion.p
                            className="text-xs uppercase tracking-[0.4em] font-bold font-sans opacity-60"
                            initial={{ color: "#000000" }}
                            whileInView={{ color: "inherit" }}
                            transition={{ duration: 0.5 }}
                        >
                            Monthly Gross Sales
                        </motion.p>
                    </motion.div>
                    <motion.div
                        variants={itemVariants}
                        initial={{ opacity: 0.8, scale: 0.95, backgroundColor: "#ffffff", color: "#000000" }}
                        whileInView={{
                            opacity: 1,
                            scale: 1.03,
                            backgroundColor: isDesktop ? "#ffffff" : "#000000",
                            color: isDesktop ? "#000000" : "#ffffff"
                        }}
                        viewport={isDesktop ? { once: false, amount: 0.5 } : { once: false, amount: 0.3, margin: "-40% 0px -40% 0px" }}
                        whileHover={isDesktop ? {
                            scale: 1.05,
                            y: -5,
                            backgroundColor: "#000000",
                            color: "#ffffff"
                        } : { scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            backgroundColor: { duration: 0.5 },
                            scale: { duration: 0.4 }
                        }}
                        className="border border-black/5 p-12 rounded-none text-center shadow-md cursor-pointer group">
                        <motion.div
                            className={`w-20 h-20 mx-auto rounded-full border flex items-center justify-center mb-6 transition-colors duration-500 ${isDesktop ? "border-black/10 text-[#A35D36] group-hover:border-white/20 group-hover:text-white" : "border-white/20 text-white"}`}
                        >
                            <span className="text-3xl font-serif font-bold italic">2%</span>
                        </motion.div>
                        <motion.h3
                            className="text-3xl font-serif italic mb-2"
                            initial={{ color: "#000000" }}
                            whileInView={{ color: "inherit" }}
                            transition={{ duration: 0.5 }}
                        >
                            Ad Fund
                        </motion.h3>
                        <motion.p
                            className="text-xs uppercase tracking-[0.4em] font-bold font-sans opacity-60"
                            initial={{ color: "#000000" }}
                            whileInView={{ color: "inherit" }}
                            transition={{ duration: 0.5 }}
                        >
                            National Marketing
                        </motion.p>
                    </motion.div>
                    <motion.div
                        variants={itemVariants}
                        initial={{ opacity: 0.8, scale: 0.95, backgroundColor: "#ffffff", color: "#000000" }}
                        whileInView={{
                            opacity: 1,
                            scale: 1.03,
                            backgroundColor: isDesktop ? "#ffffff" : "#000000",
                            color: isDesktop ? "#000000" : "#ffffff"
                        }}
                        viewport={isDesktop ? { once: false, amount: 0.5 } : { once: false, amount: 0.3, margin: "-40% 0px -40% 0px" }}
                        whileHover={isDesktop ? {
                            scale: 1.05,
                            y: -5,
                            backgroundColor: "#000000",
                            color: "#ffffff"
                        } : { scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            backgroundColor: { duration: 0.5 },
                            scale: { duration: 0.4 }
                        }}
                        className="border border-black/5 p-12 rounded-none text-center shadow-md cursor-pointer group">
                        <motion.div
                            className={`w-20 h-20 mx-auto rounded-full border flex items-center justify-center mb-6 transition-colors duration-500 ${isDesktop ? "border-black/10 text-[#A35D36] group-hover:border-white/20 group-hover:text-white" : "border-white/20 text-white"}`}
                        >
                            <TrendingUp className="w-8 h-8" />
                        </motion.div>
                        <motion.h3
                            className="text-3xl font-serif italic mb-2"
                            initial={{ color: "#000000" }}
                            whileInView={{ color: "inherit" }}
                            transition={{ duration: 0.5 }}
                        >
                            18-24 Mo.
                        </motion.h3>
                        <motion.p
                            className="text-xs uppercase tracking-[0.4em] font-bold font-sans opacity-60"
                            initial={{ color: "#000000" }}
                            whileInView={{ color: "inherit" }}
                            transition={{ duration: 0.5 }}
                        >
                            Estimated ROI
                        </motion.p>
                    </motion.div>
                </motion.div>
            </section >

            {/* 5. ROADMAP TIMELINE */}
            < TimelineSection />

            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
                <div ref={supportRef} className="order-2 md:order-1 relative h-[350px] md:h-[600px] rounded-none overflow-hidden shadow-2xl group">
                    <motion.div className="absolute inset-0 w-full h-full">
                        <img
                            src="/media/franchise_barista_training.png"
                            alt="Barista Training"
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-10 right-10 text-white z-10 text-right">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h3 className="font-serif italic text-3xl md:text-4xl mb-2">World-class <br />Training.</h3>
                            <div className="h-1 w-12 bg-[#A35D36] ml-auto" />
                        </motion.div>
                    </div>
                </div>

                <div className="order-1 md:order-2 space-y-10">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={containerVariants}
                    >
                        <motion.h2 variants={itemVariants} className="text-6xl md:text-7xl font-serif italic mb-6">Success is Shared.</motion.h2>
                        <motion.p variants={itemVariants} className="text-zinc-600 font-sans mb-12 leading-relaxed text-lg md:text-xl">
                            We don't just hand you a manual. We provide a complete ecosystem of support to ensure your Rabuste is a landmark.
                        </motion.p>

                        <div className="grid grid-cols-1 gap-6">
                            {[
                                { icon: Coffee, title: "Barista Academy", desc: "Hands-on training in roasting, brewing, and latte art at our HQ." },
                                { icon: Users, title: "Operations", desc: "SOPs, inventory management, and staffing guidelines." },
                                { icon: TrendingUp, title: "Marketing", desc: "Local store marketing plans and digital asset bank." }
                            ].map((item, i) => (
                                <motion.div
                                    variants={itemVariants}
                                    key={i}
                                    initial={{ opacity: 0.8, scale: 0.95, backgroundColor: "#ffffff", color: "#000000" }}
                                    whileInView={{
                                        opacity: 1,
                                        scale: 1.03,
                                        backgroundColor: isDesktop ? "#ffffff" : "#000000",
                                        color: isDesktop ? "#000000" : "#ffffff"
                                    }}
                                    viewport={isDesktop ? { once: false, amount: 0.5 } : { once: false, amount: 0.3, margin: "-40% 0px -40% 0px" }}
                                    whileHover={isDesktop ? {
                                        scale: 1.05,
                                        y: -5,
                                        backgroundColor: "#000000",
                                        color: "#ffffff"
                                    } : { scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20,
                                        backgroundColor: { duration: 0.5 },
                                        scale: { duration: 0.4 }
                                    }}
                                    className="flex gap-5 p-5 border border-black/5 rounded-none shadow-md cursor-pointer"
                                    style={{ willChange: "background-color, color" }}
                                >
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-current border-opacity-10 transition-colors duration-500"
                                    >
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4
                                            className="font-bold font-serif italic mb-2 text-2xl transition-colors duration-500"
                                        >
                                            {item.title}
                                        </h4>
                                        <p
                                            className="text-xs font-sans tracking-wide leading-relaxed opacity-80 transition-colors duration-500"
                                        >
                                            {item.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>



            {/* 8. FAQ */}
            <section className="py-32 max-w-3xl mx-auto px-6 md:px-12 text-center">
                <motion.h2
                    className="text-5xl md:text-7xl font-serif italic mb-16 inline-block"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    FAQs
                </motion.h2>
                {
                    faqs.length === 0 ? (
                        <p className="text-center text-zinc-400 font-sans text-xs uppercase tracking-widest">No FAQs available at the moment.</p>
                    ) : (
                        <div className="space-y-6">
                            {faqs.map((item, index) => (
                                <div key={item.id} className="border border-black/5 overflow-hidden rounded-2xl bg-white shadow-lg">
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className={`w-full flex items-center justify-between py-5 px-6 md:px-8 text-left transition-all duration-300 ${activeFaq === index ? 'bg-black/[0.02]' : 'hover:bg-black/[0.02]'}`}
                                    >
                                        <span className={`font-serif text-xl md:text-2xl italic pr-8 tracking-tight transition-colors duration-300 ${activeFaq === index ? 'text-[#A35D36]' : 'text-[#1A1A1A]'}`}>
                                            {item.question}
                                        </span>
                                        <motion.div
                                            animate={{ rotate: activeFaq === index ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ChevronDown className={`w-5 h-5 transition-colors duration-300 ${activeFaq === index ? 'text-[#A35D36]' : 'text-zinc-400'}`} />
                                        </motion.div>
                                    </button>
                                    <AnimatePresence>
                                        {activeFaq === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden border-t border-black/5"
                                            >
                                                <div className="p-6 md:p-8 bg-white">
                                                    <p className="font-sans text-base md:text-lg text-zinc-700 leading-relaxed max-w-2xl border-l-2 border-[#A35D36] pl-6 italic">
                                                        {item.answer}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    )
                }
            </section>

            {/* 9. FINAL CTA */}
            <section className="py-32 px-6 text-center bg-black text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-60">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src="/media/forestaesthetic.mp4" type="video/mp4" />
                    </video>
                </div>
                {/* Enhanced gradient for better blending with footer */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />

                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-5xl md:text-8xl font-serif italic mb-8">Ready to Start?</h2>
                        <p className="font-sans text-white max-w-xl mx-auto mb-12 text-xl md:text-2xl">
                            Let's build something beautiful together.
                        </p>
                        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                            <button
                                onClick={() => {
                                    setIsModalOpen(true);
                                }}
                                className="w-full md:w-64 px-12 py-6 bg-transparent text-white font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#F3EFE0] hover:text-black transition-all duration-300 text-sm border border-white/20 hover:border-[#F3EFE0]"
                            >
                                Apply Now
                            </button>
                            <a href={`tel:${contactNumber.replace(/[^0-9+]/g, '')}`} className="w-full md:w-64 px-12 py-6 border border-white/20 text-white font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#F3EFE0] hover:text-black transition-all duration-300 text-sm inline-flex justify-center items-center">
                                Call Us
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>



            {/* MODAL (Same as before, preserved) */}
            {
                isModalOpen && typeof document !== 'undefined' && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 font-sans">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="bg-[#F9F8F4] w-full max-w-lg rounded-none shadow-2xl overflow-hidden relative z-[10000]"
                        >
                            <div className="bg-[#1A1A1A] text-[#F9F8F4] px-8 py-8 flex justify-between items-center">
                                <div>
                                    <h3 className="text-4xl font-serif italic mb-2">Partnership Inquiry</h3>
                                    <p className="text-s uppercase tracking-[0.2em] text-white/50">Join the movement</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 max-h-[80vh] overflow-y-auto">
                                {formStatus === 'success' ? (
                                    <div className="text-center py-10">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-20 h-20 bg-[#A35D36]/10 text-[#A35D36] rounded-full flex items-center justify-center mx-auto mb-6"
                                        >
                                            <CheckCircle className="w-10 h-10" />
                                        </motion.div>
                                        <h4 className="text-3xl font-serif italic mb-4">Received!</h4>
                                        <p className="text-zinc-600 font-sans text-sm">We will review your application and get back to you soon.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* ... Form fields preserved ... */}
                                        <div>
                                            <label className="block text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                name="full_name"
                                                required
                                                value={formData.full_name}
                                                onChange={handleInputChange}
                                                className="w-full bg-[#F3EFE0] border border-black/5 text-black px-4 py-4 rounded-none outline-none focus:border-[#A35D36] transition-colors text-base"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold mb-2">Contact Number</label>
                                            <input
                                                type="tel"
                                                name="contact_number"
                                                required
                                                value={formData.contact_number}
                                                onChange={handleInputChange}
                                                className="w-full bg-[#F3EFE0] border border-black/5 text-black px-4 py-4 rounded-none outline-none focus:border-[#A35D36] transition-colors text-base"
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full bg-[#F3EFE0] border border-black/5 text-black px-4 py-4 rounded-none outline-none focus:border-[#A35D36] transition-colors text-base"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold mb-2">Your intent</label>
                                            <textarea
                                                name="enquiry"
                                                required
                                                value={formData.enquiry}
                                                onChange={handleInputChange}
                                                className="w-full bg-[#F3EFE0] border border-black/5 text-black px-4 py-4 rounded-none outline-none focus:border-[#A35D36] transition-colors h-32 resize-none text-base"
                                                placeholder="Why do you want to partner with Rabuste?"
                                            ></textarea>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={formStatus === 'submitting'}
                                            className="w-full bg-[#1A1A1A] text-white font-bold uppercase tracking-[0.2em] py-5 rounded-none hover:bg-[#A35D36] transition-colors disabled:opacity-50 text-xs"
                                        >
                                            {formStatus === 'submitting' ? 'Sending...' : 'Submit Application'}
                                        </button>

                                        {formStatus === 'error' && (
                                            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center text-xs">
                                                <p className="font-bold">Submission Failed</p>
                                                <p>{errorMessage}</p>
                                            </div>
                                        )}
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>,
                    document.body
                )
            }

        </div >
    );
};

export default FranchisePage;