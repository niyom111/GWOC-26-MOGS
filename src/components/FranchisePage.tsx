import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, Variants, useScroll, useTransform } from 'framer-motion';
import {
    Coffee, Palette, Users, CheckCircle,
    TrendingUp, DollarSign, MapPin, Heart, ChevronDown, X
} from 'lucide-react';
import { API_BASE_URL } from '../config';

interface FaqItem {
    id: number;
    question: string;
    answer: string;
}

const FranchisePage: React.FC = () => {
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
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        }
    };

    return (
        <div className="min-h-screen bg-[#F9F8F4] overflow-hidden text-[#1A1A1A]" ref={targetRef}>

            {/* 1. HERO SECTION - Clean, No Image, Just Vibe */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
                {/* Background Noise/Gradient */}
                <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none mix-blend-multiply">
                    <svg width="100%" height="100%">
                        <filter id="noise">
                            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                            <feColorMatrix type="saturate" values="0" />
                        </filter>
                        <rect width="100%" height="100%" filter="url(#noise)" />
                    </svg>
                </div>

                {/* Subtle Breathing Glow */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.05, 0.03] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-[#A35D36] rounded-full blur-[100px] pointer-events-none"
                />

                <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                    >
                        <motion.div variants={itemVariants}>
                            <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-[#A35D36] mb-8 font-sans inline-block border-b border-[#A35D36]/30 pb-2">
                                The Partnership
                            </h2>
                        </motion.div>

                        <div className="overflow-hidden mb-6 md:mb-8">
                            <motion.h1
                                className="text-[13vw] md:text-[8vw] leading-[0.85] font-serif italic tracking-tighter text-[#1A1A1A]"
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            >
                                Built for
                            </motion.h1>
                        </div>
                        <div className="overflow-hidden mb-8 md:mb-12">
                            <motion.h1
                                className="text-[13vw] md:text-[8vw] leading-[0.85] font-serif italic tracking-tighter text-[#A35D36]"
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                transition={{ duration: 1.2, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                            >
                                Intentionality.
                            </motion.h1>
                        </div>

                        <motion.p variants={itemVariants} className="text-lg md:text-2xl font-sans max-w-xl mx-auto leading-relaxed text-zinc-600 mb-0 md:mb-10">
                            Own a sanctuary of bold Robusta and minimalist design. <br className="hidden md:block" />Join the movement.
                        </motion.p>
                    </motion.div>
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
                    <motion.h2 variants={itemVariants} className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#A35D36] mb-6 font-sans">Our Mission</motion.h2>
                    <motion.h3 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-serif italic mb-8 text-[#1A1A1A] leading-tight">
                        We are reclaiming <br /><span className="text-zinc-400">the narrative of Robusta.</span>
                    </motion.h3>
                    <motion.div variants={itemVariants} className="h-px w-24 bg-[#A35D36] mb-8" />
                    <motion.p variants={itemVariants} className="font-sans text-lg text-zinc-600 mb-6 leading-relaxed">
                        For too long, Robusta has been misunderstood. At Rabuste, we source single-origin, high-grade beans that challenge the status quo.
                    </motion.p>
                    <motion.p variants={itemVariants} className="font-sans text-lg text-zinc-600 leading-relaxed">
                        Our spaces are designed to be more than just cafes—they are cultural hubs where bold coffee meets minimalist art and community workshops.
                    </motion.p>
                </motion.div>

                <div ref={missionRef} className="relative h-[350px] md:h-[700px] rounded-2xl overflow-hidden shadow-2xl group">
                    <motion.div style={{ y: missionY }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
                        <img
                            src="/media/franchise_coffee_pour.png"
                            alt="Perfect Espresso Pour"
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                </div>
            </section>

            {/* 3. PREREQUISITES - INFOGRAPHIC CARDS */}
            <section className="py-24 bg-[#1A1A1A] text-[#F9F8F4]">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <motion.div
                        className="mb-20 text-center"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-serif italic mb-6">The Blueprint.</h2>
                        <p className="text-zinc-400 font-sans max-w-xl mx-auto text-[10px] md:text-xs uppercase tracking-[0.25em]">
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
                        <motion.div variants={itemVariants}
                            className="bg-[#F9F8F4] p-8 md:p-10 rounded-xl relative group overflow-hidden hover:bg-white transition-colors duration-300"
                        >
                            <div className="absolute -right-8 -top-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:rotate-12">
                                <MapPin className="w-48 h-48" />
                            </div>
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 mb-6 font-sans">Space</h4>
                            <p className="text-3xl md:text-5xl font-serif italic mb-6">1000 <span className="text-xl font-sans text-zinc-400 not-italic mx-2">-</span> 1500 <span className="text-xs font-sans text-zinc-500 not-italic block mt-1">sq.ft.</span></p>
                            <p className="text-sm text-zinc-600 font-sans leading-relaxed border-t border-black/10 pt-6">
                                Ideally located in high-street zones or premium commercial hubs with high footfall.
                            </p>
                        </motion.div>

                        {/* Card 2: Investment */}
                        <motion.div variants={itemVariants}
                            className="bg-[#F9F8F4] p-8 md:p-10 rounded-xl relative group overflow-hidden hover:bg-white transition-colors duration-300"
                        >
                            <div className="absolute -right-8 -top-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:rotate-12">
                                <DollarSign className="w-48 h-48" />
                            </div>
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 mb-6 font-sans">Investment</h4>
                            <p className="text-3xl md:text-5xl font-serif italic mb-6">₹35L <span className="text-xl font-sans text-zinc-400 not-italic mx-2">-</span> 50L</p>
                            <p className="text-sm text-zinc-600 font-sans leading-relaxed border-t border-black/10 pt-6">
                                Total setup cost including license fees, interiors, equipment, and initial stock.
                            </p>
                        </motion.div>

                        {/* Card 3: Passion */}
                        <motion.div variants={itemVariants}
                            className="bg-[#F9F8F4] p-8 md:p-10 rounded-xl relative group overflow-hidden hover:bg-white transition-colors duration-300"
                        >
                            <div className="absolute -right-8 -top-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:rotate-12">
                                <Heart className="w-48 h-48" />
                            </div>
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 mb-6 font-sans">Experience</h4>
                            <p className="text-3xl md:text-5xl font-serif italic mb-6">Passion First</p>
                            <p className="text-sm text-zinc-600 font-sans leading-relaxed border-t border-black/10 pt-6">
                                No prior F&B experience needed. A deep commitment to quality and community is mandatory.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* 4. FINANCIALS - DARK CARDS */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <motion.div variants={itemVariants} className="bg-white border border-black/5 p-12 rounded-2xl text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                        <div className="w-20 h-20 mx-auto rounded-full border border-[#A35D36]/30 group-hover:border-[#A35D36] flex items-center justify-center mb-6 text-[#A35D36] transition-colors">
                            <span className="text-3xl font-serif font-bold italic">7%</span>
                        </div>
                        <h3 className="text-2xl font-serif italic">Royalty</h3>
                        <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 mt-2 font-sans group-hover:text-black transition-colors">Monthly Gross Sales</p>
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-white border border-black/5 p-12 rounded-2xl text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                        <div className="w-20 h-20 mx-auto rounded-full border border-black/10 group-hover:border-black flex items-center justify-center mb-6 transition-colors">
                            <span className="text-3xl font-serif font-bold italic">2%</span>
                        </div>
                        <h3 className="text-2xl font-serif italic">Ad Fund</h3>
                        <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 mt-2 font-sans group-hover:text-black transition-colors">National Marketing</p>
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-[#A35D36]/5 border border-[#A35D36]/20 p-12 rounded-2xl text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                        <div className="w-20 h-20 mx-auto rounded-full border border-[#A35D36] bg-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-8 h-8 text-[#A35D36]" />
                        </div>
                        <h3 className="text-2xl font-serif text-[#A35D36] italic">18-24 Mo.</h3>
                        <p className="text-[10px] uppercase tracking-[0.4em] text-[#A35D36]/70 mt-2 font-sans">Estimated ROI</p>
                    </motion.div>
                </motion.div>
            </section>

            {/* 5. ROADMAP TIMELINE */}
            <section className="py-24 bg-white relative overflow-hidden">
                {/* Background Noise/Gradient */}
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
                    <svg width="100%" height="100%">
                        <filter id="noise2">
                            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                            <feColorMatrix type="saturate" values="0" />
                        </filter>
                        <rect width="100%" height="100%" filter="url(#noise2)" />
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                    <motion.h2
                        className="text-4xl md:text-5xl font-serif italic mb-20 text-center"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >From Vision to Launch.</motion.h2>

                    <div className="relative">
                        {/* Progressive Line */}
                        <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-px bg-black/5">
                            <motion.div
                                className="w-full bg-[#A35D36] origin-top"
                                initial={{ height: 0 }}
                                whileInView={{ height: "100%" }}
                                viewport={{ once: true }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                            />
                        </div>

                        <div className="space-y-16 md:space-y-0 relative">
                            {[
                                { step: "01", title: "Inquiry", desc: "Submit your basic details and interest." },
                                { step: "02", title: "Evaluation", desc: "Site visit and financial assessment." },
                                { step: "03", title: "Agreement", desc: "Signing the MOU and franchise fees." },
                                { step: "04", title: "Build-Out", desc: "Interiors, hiring, and procurement." },
                                { step: "05", title: "Launch", desc: "Grand opening and marketing blitz." }
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} pl-12 md:pl-0`}
                                    initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-10%" }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                >
                                    <div className="w-full md:w-1/2 text-left md:text-left px-4 md:px-12">
                                        <div className={`md:${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
                                            <span className="text-7xl md:text-8xl font-serif italic text-black/5 block mb-4 leading-[0.5] font-black">{item.step}</span>
                                            <h3 className="text-2xl md:text-3xl font-serif italic mb-3">{item.title}</h3>
                                            <p className="font-sans text-zinc-500 text-sm leading-relaxed max-w-xs md:ml-auto md:mr-0">{item.desc}</p>
                                        </div>
                                    </div>
                                    {/* Dot */}
                                    <motion.div
                                        className="absolute left-[14px] md:left-1/2 md:-ml-[0.6rem] w-4 h-4 rounded-full bg-[#A35D36] border-[4px] border-white shadow-xl z-10"
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.2 + 0.5, type: "spring" }}
                                    />
                                    <div className="w-full md:w-1/2" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. SUPPORT SECTION */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
                <div ref={supportRef} className="order-2 md:order-1 relative h-[350px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl group">
                    <motion.div style={{ y: supportY }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
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
                        <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-serif italic mb-6">Success is Shared.</motion.h2>
                        <motion.p variants={itemVariants} className="text-zinc-600 font-sans mb-12 leading-relaxed text-lg">
                            We don't just hand you a manual. We provide a complete ecosystem of support to ensure your Rabuste is a landmark.
                        </motion.p>

                        <div className="grid grid-cols-1 gap-6">
                            {[
                                { icon: Coffee, title: "Barista Academy", desc: "Hands-on training in roasting, brewing, and latte art at our HQ." },
                                { icon: Users, title: "Operations", desc: "SOPs, inventory management, and staffing guidelines." },
                                { icon: TrendingUp, title: "Marketing", desc: "Local store marketing plans and digital asset bank." }
                            ].map((item, i) => (
                                <motion.div variants={itemVariants} key={i} className="flex gap-6 p-6 border border-black/5 rounded-xl bg-white hover:border-[#A35D36]/20 transition-all duration-300 hover:shadow-lg group">
                                    <div className="w-12 h-12 rounded-full bg-[#A35D36]/10 flex items-center justify-center shrink-0 group-hover:bg-[#A35D36] group-hover:text-white transition-colors duration-300">
                                        <item.icon className="w-5 h-5 text-[#A35D36] group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold font-serif italic mb-2 text-xl">{item.title}</h4>
                                        <p className="text-xs text-zinc-500 font-sans tracking-wide leading-relaxed">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>



            {/* 8. FAQ */}
            <section className="py-32 max-w-3xl mx-auto px-6 md:px-12">
                <h2 className="text-3xl md:text-5xl font-serif italic mb-16 text-center">Common Questions.</h2>
                {faqs.length === 0 ? (
                    <p className="text-center text-zinc-400 font-sans text-xs uppercase tracking-widest">No FAQs available at the moment.</p>
                ) : (
                    <div className="space-y-2">
                        {faqs.map((item, index) => (
                            <div key={item.id} className="border-b border-black/5">
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex items-center justify-between py-8 text-left group"
                                >
                                    <span className="font-serif text-xl group-hover:text-[#A35D36] transition-colors pr-8">{item.question}</span>
                                    <motion.div
                                        animate={{ rotate: activeFaq === index ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ChevronDown className="w-5 h-5 text-zinc-300 group-hover:text-[#A35D36]" />
                                    </motion.div>
                                </button>
                                <AnimatePresence>
                                    {activeFaq === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="pb-8 font-sans text-sm text-zinc-500 leading-relaxed max-w-2xl">{item.answer}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* 9. FINAL CTA */}
            <section className="py-32 px-6 text-center bg-[#1A1A1A] text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <img src="/media/franchise_community_event.png" className="w-full h-full object-cover grayscale" alt="Community" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent" />

                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-5xl md:text-8xl font-serif italic mb-8">Ready to Start?</h2>
                        <p className="font-sans text-white/70 max-w-xl mx-auto mb-12 text-lg">
                            Let's build something beautiful together.
                        </p>
                        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                            <button
                                onClick={() => {
                                    setIsModalOpen(true);
                                }}
                                className="w-full md:w-60 px-12 py-5 bg-white text-black font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#A35D36] hover:text-white transition-all duration-300 text-xs shadow-xl hover:shadow-2xl hover:-translate-y-1 border border-transparent"
                            >
                                Apply Now
                            </button>
                            <a href={`tel:${contactNumber.replace(/[^0-9+]/g, '')}`} className="w-full md:w-60 px-12 py-5 border border-white/20 text-white font-bold uppercase tracking-[0.2em] rounded-full hover:bg-white/10 transition-all duration-300 text-xs inline-flex justify-center items-center">
                                Call Us
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* STICKY BOTTOM BAR (Mobile) */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-black/5 z-40 flex justify-between items-center md:hidden"
            >
                <span className="font-serif italic text-lg">Rabuste Franchise</span>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-[0.25em] rounded-full shadow-lg"
                >
                    Apply
                </button>
            </motion.div>

            {/* MODAL (Same as before, preserved) */}
            {isModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 font-sans">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-[#F9F8F4] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative z-[10000]"
                    >
                        <div className="bg-[#1A1A1A] text-[#F9F8F4] px-8 py-8 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-serif italic mb-1">Partnership Inquiry</h3>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Join the movement</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
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
                                        <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            required
                                            value={formData.full_name}
                                            onChange={handleInputChange}
                                            className="w-full bg-white border border-black/5 px-4 py-4 rounded-xl outline-none focus:border-[#A35D36] transition-colors"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-2">Contact Number</label>
                                        <input
                                            type="tel"
                                            name="contact_number"
                                            required
                                            value={formData.contact_number}
                                            onChange={handleInputChange}
                                            className="w-full bg-white border border-black/5 px-4 py-4 rounded-xl outline-none focus:border-[#A35D36] transition-colors"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full bg-white border border-black/5 px-4 py-4 rounded-xl outline-none focus:border-[#A35D36] transition-colors"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-2">Tell us about yourself</label>
                                        <textarea
                                            name="enquiry"
                                            required
                                            value={formData.enquiry}
                                            onChange={handleInputChange}
                                            className="w-full bg-white border border-black/5 px-4 py-4 rounded-xl outline-none focus:border-[#A35D36] transition-colors h-32 resize-none"
                                            placeholder="Why do you want to partner with Rabuste?"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={formStatus === 'submitting'}
                                        className="w-full bg-[#1A1A1A] text-white font-bold uppercase tracking-[0.2em] py-5 rounded-xl hover:bg-[#A35D36] transition-colors disabled:opacity-50 text-xs"
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
            )}

        </div>
    );
};

export default FranchisePage;
