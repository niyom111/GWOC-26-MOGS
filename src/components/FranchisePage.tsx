import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Coffee, Palette, Users, ArrowRight, CheckCircle,
    TrendingUp, DollarSign, MapPin, Heart, ChevronDown, X
} from 'lucide-react';

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
        fetch('http://localhost:5000/api/franchise/settings')
            .then(res => res.json())
            .then(data => {
                if (data.contact_number) setContactNumber(data.contact_number);
            })
            .catch(err => console.error('Failed to fetch settings:', err));

        // Fetch FAQs
        fetch('http://localhost:5000/api/franchise/faq')
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
            const res = await fetch('http://localhost:5000/api/franchise/enquire', {
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

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.8, ease: "easeOut" }
    };

    return (
        <div className="min-h-screen bg-[#F9F8F4] overflow-hidden">

            {/* 1. HERO SECTION */}
            <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/media/franchise_hero_interior.png"
                        alt="Rabuste Cafe Interior"
                        className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 text-center text-white">
                    <motion.h1
                        className="text-[12vw] md:text-[8vw] leading-[0.85] font-serif mb-6 tracking-tighter"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Built for <br /><span className="text-orange-500">Intentionality.</span>
                    </motion.h1>
                    <motion.p
                        className="text-lg md:text-2xl font-sans max-w-2xl mx-auto leading-relaxed opacity-90"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        Own a sanctuary of bold Robusta and minimalist design. Join the movement.
                    </motion.p>
                </div>
            </section>

            {/* 2. STORYTELLING SECTION */}
            <section className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
                <motion.div {...fadeInUp}>
                    <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-orange-600 mb-6">Our Mission</h2>
                    <h3 className="text-4xl md:text-5xl font-serif mb-8 text-[#1A1A1A] leading-tight">
                        We are reclaiming <br />the narrative of Robusta.
                    </h3>
                    <p className="font-sans text-lg text-zinc-600 mb-6 leading-relaxed">
                        For too long, Robusta has been misunderstood. At Rabuste, we source single-origin, high-grade beans that challenge the status quo.
                    </p>
                    <p className="font-sans text-lg text-zinc-600 leading-relaxed">
                        Our spaces are designed to be more than just cafes—they are cultural hubs where bold coffee meets minimalist art and community workshops.
                    </p>
                </motion.div>
                <motion.div
                    className="relative h-[600px] rounded-2xl overflow-hidden shadow-2xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <img
                        src="/media/franchise_coffee_pour.png"
                        alt="Perfect Espresso Pour"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </motion.div>
            </section>

            {/* 3. PREREQUISITES - INFOGRAPHIC CARDS */}
            <section className="py-24 bg-[#1A1A1A] text-[#F9F8F4]">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <motion.div className="mb-16 text-center" {...fadeInUp}>
                        <h2 className="text-4xl md:text-5xl font-serif mb-4">The Blueprint</h2>
                        <p className="text-zinc-400 font-sans max-w-xl mx-auto">
                            What it takes to build a Rabuste sanctuary.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-black">
                        {/* Card 1: Space */}
                        <motion.div
                            className="bg-[#F9F8F4] p-8 rounded-xl relative group overflow-hidden"
                            whileHover={{ y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <MapPin className="w-24 h-24" />
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Space</h4>
                            <p className="text-3xl md:text-4xl font-serif mb-4">1000-1500 <span className="text-lg font-sans text-zinc-500">sq.ft.</span></p>
                            <p className="text-sm text-zinc-600 font-sans leading-relaxed border-t border-black/10 pt-4">
                                Ideally located in high-street zones or premium commercial hubs with high footfall.
                            </p>
                        </motion.div>

                        {/* Card 2: Investment */}
                        <motion.div
                            className="bg-[#F9F8F4] p-8 rounded-xl relative group overflow-hidden"
                            whileHover={{ y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <DollarSign className="w-24 h-24" />
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Investment</h4>
                            <p className="text-3xl md:text-4xl font-serif mb-4">₹35L - 50L</p>
                            <p className="text-sm text-zinc-600 font-sans leading-relaxed border-t border-black/10 pt-4">
                                Total setup cost including license fees, interiors, equipment, and initial stock.
                            </p>
                        </motion.div>

                        {/* Card 3: Passion */}
                        <motion.div
                            className="bg-[#F9F8F4] p-8 rounded-xl relative group overflow-hidden"
                            whileHover={{ y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Heart className="w-24 h-24" />
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Experience</h4>
                            <p className="text-3xl md:text-4xl font-serif mb-4">Passion First</p>
                            <p className="text-sm text-zinc-600 font-sans leading-relaxed border-t border-black/10 pt-4">
                                No prior F&B experience needed. A deep commitment to quality and community is mandatory.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 4. FINANCIALS - DARK CARDS */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
                <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" {...fadeInUp}>
                    <div className="bg-white border border-black/10 p-10 rounded-2xl text-center shadow-sm">
                        <div className="w-20 h-20 mx-auto rounded-full border-4 border-orange-500 flex items-center justify-center mb-6">
                            <span className="text-2xl font-serif font-bold">7%</span>
                        </div>
                        <h3 className="text-xl font-serif ">Royalty</h3>
                        <p className="text-xs uppercase tracking-widest text-zinc-500 mt-2">Monthly Gross Sales</p>
                    </div>
                    <div className="bg-white border border-black/10 p-10 rounded-2xl text-center shadow-sm">
                        <div className="w-20 h-20 mx-auto rounded-full border-4 border-black flex items-center justify-center mb-6">
                            <span className="text-2xl font-serif font-bold">2%</span>
                        </div>
                        <h3 className="text-xl font-serif ">Ad Fund</h3>
                        <p className="text-xs uppercase tracking-widest text-zinc-500 mt-2">National Marketing</p>
                    </div>
                    <div className="bg-orange-50 border border-orange-100 p-10 rounded-2xl text-center shadow-sm">
                        <div className="w-20 h-20 mx-auto rounded-full border-4 border-orange-200 bg-white flex items-center justify-center mb-6">
                            <TrendingUp className="w-8 h-8 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-serif text-orange-900">18-24 Mo.</h3>
                        <p className="text-xs uppercase tracking-widest text-orange-700/60 mt-2">Estimated ROI</p>
                    </div>
                </motion.div>
            </section>

            {/* 5. ROADMAP TIMELINE */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <motion.h2 className="text-4xl md:text-5xl font-serif mb-16 text-center" {...fadeInUp}>From Vision to Launch</motion.h2>

                    <div className="relative">
                        {/* Line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/10 hidden md:block" />

                        <div className="space-y-12 md:space-y-0 relative">
                            {[
                                { step: "01", title: "Inquiry", desc: "Submit your basic details and interest." },
                                { step: "02", title: "Evaluation", desc: "Site visit and financial assessment." },
                                { step: "03", title: "Agreement", desc: "Signing the MOU and franchise fees." },
                                { step: "04", title: "Build-Out", desc: "Interiors, hiring, and procurement." },
                                { step: "05", title: "Launch", desc: "Grand opening and marketing blitz." }
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="w-full md:w-1/2 text-center md:text-left px-8">
                                        <div className={`${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                                            <span className="text-6xl font-serif text-black/5 block mb-2">{item.step}</span>
                                            <h3 className="text-2xl font-serif mb-2">{item.title}</h3>
                                            <p className="font-sans text-zinc-500">{item.desc}</p>
                                        </div>
                                    </div>
                                    <div className="w-4 h-4 rounded-full bg-black border-4 border-white shadow-lg relative z-10 hidden md:block" />
                                    <div className="w-full md:w-1/2" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. SUPPORT SECTION */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <motion.div
                    className="order-2 md:order-1 relative h-[500px] rounded-2xl overflow-hidden"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <img
                        src="/media/franchise_barista_training.png"
                        alt="Barista Training"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white font-serif text-2xl">
                        World-class Training
                    </div>
                </motion.div>

                <div className="order-1 md:order-2 space-y-8">
                    <motion.div {...fadeInUp}>
                        <h2 className="text-4xl md:text-5xl font-serif mb-6">Success is Shared</h2>
                        <p className="text-zinc-600 font-sans mb-10 leading-relaxed">
                            We don't just hand you a manual. We provide a complete ecosystem of support to ensure your Rabuste is a landmark.
                        </p>

                        <div className="grid grid-cols-1 gap-6">
                            {[
                                { icon: Coffee, title: "Barista Academy", desc: "Hands-on training in roasting, brewing, and latte art at our HQ." },
                                { icon: Users, title: "Operations", desc: "SOPs, inventory management, and staffing guidelines." },
                                { icon: TrendingUp, title: "Marketing", desc: "Local store marketing plans and digital asset bank." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-4 border border-black/5 rounded-xl bg-white">
                                    <item.icon className="w-6 h-6 text-orange-600 shrink-0" />
                                    <div>
                                        <h4 className="font-bold font-serif mb-1">{item.title}</h4>
                                        <p className="text-sm text-zinc-500 font-sans">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 7. TRUST & NUMBERS */}
            <section className="py-20 bg-black text-[#F9F8F4]">
                <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
                    <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-white/50 mb-12">Numbers That Matter</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { val: "50k+", label: "Cups Served" },
                            { val: "12+", label: "Cities" },
                            { val: "4.8", label: "Avg Rating" },
                            { val: "100%", label: "Robusta" }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-4xl md:text-6xl font-serif mb-2">{stat.val}</div>
                                <div className="text-xs uppercase tracking-widest opacity-60">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 8. FAQ */}
            <section className="py-24 max-w-4xl mx-auto px-6 md:px-12">
                <h2 className="text-3xl md:text-4xl font-serif mb-12 text-center">Common Questions</h2>
                {faqs.length === 0 ? (
                    <p className="text-center text-zinc-400 font-sans">No FAQs available at the moment.</p>
                ) : (
                    <div className="space-y-4">
                        {faqs.map((item, index) => (
                            <div key={item.id} className="border-b border-black/10">
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex items-center justify-between py-6 text-left group"
                                >
                                    <span className="font-serif text-lg group-hover:text-orange-600 transition-colors">{item.question}</span>
                                    <ChevronDown className={`w-5 h-5 transition-transform ${activeFaq === index ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {activeFaq === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="pb-6 font-sans text-zinc-600 leading-relaxed">{item.answer}</p>
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
                    <img src="/media/franchise_community_event.png" className="w-full h-full object-cover" alt="Community" />
                </div>
                <div className="relative z-10">
                    <h2 className="text-5xl md:text-7xl font-serif mb-8">Ready to Start?</h2>
                    <p className="font-sans text-white/70 max-w-xl mx-auto mb-10 text-lg">
                        Let's build something beautiful together.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <button
                            onClick={() => {
                                console.log('[FranchisePage] Opening modal...');
                                setIsModalOpen(true);
                            }}
                            className="inline-block px-10 py-5 bg-white text-black font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-200 transition-colors"
                        >
                            Apply Now
                        </button>
                        <a href={`tel:${contactNumber.replace(/[^0-9+]/g, '')}`} className="inline-block px-10 py-5 border border-white/30 text-white font-bold uppercase tracking-[0.2em] rounded-full hover:bg-white/10 transition-colors">
                            Call Us
                        </a>
                    </div>
                </div>
            </section>

            {/* STICKY BOTTOM BAR (Mobile/Desktop) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-black/5 z-40 flex justify-between items-center md:hidden">
                <span className="font-serif text-lg">Rabuste Franchise</span>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full"
                >
                    Apply
                </button>
            </div>

            {/* MODAL */}
            {isModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-6 font-sans">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-[#F9F8F4] w-full max-w-lg rounded-2xl shadow-xl overflow-hidden relative z-[10000]"
                    >
                        <div className="bg-[#1A1A1A] text-[#F9F8F4] px-8 py-6 flex justify-between items-center">
                            <h3 className="text-2xl font-serif">Partnership Inquiry</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/60 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 max-h-[80vh] overflow-y-auto">
                            {formStatus === 'success' ? (
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-2xl font-serif mb-2">Received!</h4>
                                    <p className="text-zinc-600 font-sans">We will review your application and get back to you soon.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest font-bold mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            required
                                            value={formData.full_name}
                                            onChange={handleInputChange}
                                            className="w-full bg-white border border-black/10 px-4 py-3 rounded-lg outline-none focus:border-black transition-colors"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest font-bold mb-2">Contact Number</label>
                                        <input
                                            type="tel"
                                            name="contact_number"
                                            required
                                            value={formData.contact_number}
                                            onChange={handleInputChange}
                                            className="w-full bg-white border border-black/10 px-4 py-3 rounded-lg outline-none focus:border-black transition-colors"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest font-bold mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full bg-white border border-black/10 px-4 py-3 rounded-lg outline-none focus:border-black transition-colors"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest font-bold mb-2">Tell us about yourself</label>
                                        <textarea
                                            name="enquiry"
                                            required
                                            value={formData.enquiry}
                                            onChange={handleInputChange}
                                            className="w-full bg-white border border-black/10 px-4 py-3 rounded-lg outline-none focus:border-black transition-colors h-32 resize-none"
                                            placeholder="Why do you want to partner with Rabuste?"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={formStatus === 'submitting'}
                                        className="w-full bg-[#1A1A1A] text-white font-bold uppercase tracking-[0.2em] py-4 rounded-lg hover:bg-black transition-colors disabled:opacity-50"
                                    >
                                        {formStatus === 'submitting' ? 'Sending...' : 'Submit Application'}
                                    </button>

                                    {formStatus === 'error' && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-center text-xs">
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
