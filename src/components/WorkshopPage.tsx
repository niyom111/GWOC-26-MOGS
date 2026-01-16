import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Send, X, CheckCircle2, Loader2 } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { useDataContext } from '../DataContext';
import { API_BASE_URL } from '../config';

// --- CONFIGURATION ---
const EMAIL_CONFIG_RESERVATION = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_WORKSHOP_RESERVE_SERVICE_ID,
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_WORKSHOP_RESERVE_PUBLIC_KEY,
  TEMPLATE_ID_USER: import.meta.env.VITE_EMAILJS_WORKSHOP_RESERVE_TEMPLATE_ID,
  ADMIN_EMAIL: 'robustecafe@gmail.com'
};

const EMAIL_CONFIG_HOSTING = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_HOST_SERVICE_ID,
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_HOST_PUBLIC_KEY,
  TEMPLATE_ID_ADMIN: import.meta.env.VITE_EMAILJS_HOST_TEMPLATE_ID,
  ADMIN_EMAIL: 'robustecafe@gmail.com'
};

import Toast from './Toast';

const WorkshopPage: React.FC = () => {
  const { workshops, setWorkshops } = useDataContext();

  // Check for missing keys on mount
  useEffect(() => {
    const missingKeys: string[] = [];
    if (!EMAIL_CONFIG_RESERVATION.SERVICE_ID) missingKeys.push('VITE_EMAILJS_WORKSHOP_RESERVE_SERVICE_ID');
    if (!EMAIL_CONFIG_RESERVATION.PUBLIC_KEY) missingKeys.push('VITE_EMAILJS_WORKSHOP_RESERVE_PUBLIC_KEY');
    if (!EMAIL_CONFIG_RESERVATION.TEMPLATE_ID_USER) missingKeys.push('VITE_EMAILJS_WORKSHOP_RESERVE_TEMPLATE_ID');

    if (!EMAIL_CONFIG_HOSTING.SERVICE_ID) missingKeys.push('VITE_EMAILJS_HOST_SERVICE_ID');
    if (!EMAIL_CONFIG_HOSTING.PUBLIC_KEY) missingKeys.push('VITE_EMAILJS_HOST_PUBLIC_KEY');
    if (!EMAIL_CONFIG_HOSTING.TEMPLATE_ID_ADMIN) missingKeys.push('VITE_EMAILJS_HOST_TEMPLATE_ID');

    if (missingKeys.length > 0) {
      console.warn('⚠️ [Workshops] Missing EmailJS Configuration Keys:', missingKeys.join(', '));
      console.warn('   Please check your .env file.');
    } else {
      console.log('✅ [Workshops] EmailJS Configuration loaded successfully.');
    }
  }, []);

  const [reservationEmails, setReservationEmails] = useState<{ [key: string]: string }>({});
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = React.useRef<number | null>(null);

  // Updated Host Form State
  const [hostForm, setHostForm] = useState({
    contact_email: '',
    preferred_date: '',
    workshop_details: ''
  });

  const [isHosting, setIsHosting] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; body: string } | null>(null);

  // --- HANDLERS ---

  const handleReservationEmailChange = (id: string, value: string) => {
    setReservationEmails(prev => ({ ...prev, [id]: value.toLowerCase() }));
  };

  const formatDateInput = (value: string) => {
    // Remove non-numeric chars
    const cleaned = value.replace(/\D/g, '');

    // Auto-format as DD/MM/YYYY
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
  };

  const handleHostChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'preferred_date') {
      setHostForm(prev => ({ ...prev, [name]: formatDateInput(value) }));
    } else if (name === 'contact_email') {
      setHostForm(prev => ({ ...prev, [name]: value.toLowerCase() }));
    } else {
      setHostForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // 1. RESERVE SPOT -> Sends Email to USER + Updates DB
  const handleReserveSubmit = (e: React.FormEvent, workshopId: string) => {
    e.preventDefault();
    const userEmail = reservationEmails[workshopId];
    if (!userEmail) return;

    setReservingId(workshopId);

    const workshop = workshops.find(w => w.id === workshopId);
    if (!workshop) return;

    // Params for User Email Template
    const templateParams = {
      to_email: userEmail,
      workshop_name: workshop.title,
      workshop_date: workshop.datetime,
      reply_to: EMAIL_CONFIG_RESERVATION.ADMIN_EMAIL
    };

    emailjs.send(EMAIL_CONFIG_RESERVATION.SERVICE_ID, EMAIL_CONFIG_RESERVATION.TEMPLATE_ID_USER, templateParams, EMAIL_CONFIG_RESERVATION.PUBLIC_KEY)
      .then(async () => {
        // Success: Update DB and decrement remaining
        try {
          const response = await fetch(`${API_BASE_URL}/api/workshops/${workshopId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
          });

          if (response.ok) {
            const updatedWorkshop = await response.json();
            // Update local state
            setWorkshops(prev => prev.map(w => w.id === workshopId ? updatedWorkshop : w));
          }
        } catch (error) {
          console.error('Failed to update workshop:', error);
        }

        setReservingId(null);
        setReservationEmails(prev => ({ ...prev, [workshopId]: '' }));

        // Show Toast
        setToastMessage(`Reservation Request Sent for ${workshop.title}`);
        if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = window.setTimeout(() => setToastMessage(null), 2000);

        // Show Confirmation
        setModalContent({
          title: "Request Sent.",
          body: `We have received your reservation request for "${workshop.title}". A confirmation email has been sent to ${userEmail}.`
        });
      })
      .catch((err) => {
        console.error("Reservation Failed:", err);
        setReservingId(null);
        alert("Failed to send reservation. Please try again later.");
      });
  };

  // 2. HOST PROPOSAL -> Sends Email to ADMIN (New Logic)
  const handleHostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsHosting(true);

    // Params for Admin Email Template (New Keys)
    const templateParams = {
      contact_email: hostForm.contact_email,
      preferred_date: hostForm.preferred_date,
      workshop_details: hostForm.workshop_details,
      to_name: "Rabuste Cafe Team"
    };

    emailjs.send(EMAIL_CONFIG_HOSTING.SERVICE_ID, EMAIL_CONFIG_HOSTING.TEMPLATE_ID_ADMIN, templateParams, EMAIL_CONFIG_HOSTING.PUBLIC_KEY)
      .then(() => {
        setIsHosting(false);
        setHostForm({ contact_email: '', preferred_date: '', workshop_details: '' });

        // Show Toast
        setToastMessage("Proposal Received");
        if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = window.setTimeout(() => setToastMessage(null), 2000);

        setModalContent({
          title: "Proposal Received.",
          body: "Your workshop concept has been sent to our curation team. We will review your details and reach out via email shortly."
        });
      })
      .catch((err) => {
        console.error("Hosting Failed:", err);
        setIsHosting(false);
        alert("Failed to send proposal. Please check your connection and try again.");
      });
  };

  return (
    <div className="pt-24 md:pt-32 pb-40 px-6 md:px-8 bg-[#F3EFE0]">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 md:mb-32 flex flex-col md:flex-row justify-between items-end gap-6 md:gap-10">
          <div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] md:text-[13px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-black mb-4 md:mb-6">Education & Mastery</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-9xl font-serif italic tracking-tighter leading-none">Community.</motion.h1>
          </div>
          <p className="max-w-xs text-[14px] md:text-s font-sans text-black uppercase tracking-widest leading-relaxed text-right italic">
            "A space shaped by presence and practice, where making unfolds through shared attention"
          </p>
        </header>

        {/* WORKSHOPS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-40">
          {workshops.map((w, idx) => {
            const isSoldOut = w.remaining === 0;
            const isLoading = reservingId === w.id;

            return (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`group overflow-hidden ${isSoldOut ? 'opacity-70' : ''} transition-all duration-500 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.12)] hover:shadow-[0_4px_30px_-8px_rgba(0,0,0,0.18)]`}
              >
                {/* Full-bleed image at top */}
                <div className="relative overflow-hidden">
                  <div className="aspect-[16/11] overflow-hidden bg-zinc-100">
                    <img
                      src={w.image_url || "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&q=80&w=1000"}
                      className={`w-full h-full object-cover transition-all duration-700 ${isSoldOut ? 'grayscale opacity-50' : 'group-hover:scale-[1.02]'}`}
                      alt={w.title}
                    />
                    {isSoldOut && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
                        <span className="bg-rose-500/95 text-white text-[9px] uppercase tracking-[0.25em] font-semibold px-3 py-1.5 rounded-sm shadow-md">Sold Out</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content - warm off-white background */}
                <div className="bg-[#FDFCF9] p-5 md:p-6">
                  {/* Title - dominant */}
                  <h3 className="text-xl md:text-2xl font-serif italic mb-2 text-[#1A1A1A] leading-snug tracking-tight">{w.title}</h3>

                  {/* Description - lighter weight */}
                  <p className="text-[10px] md:text-[11px] font-sans text-black mb-4 leading-relaxed uppercase tracking-[0.15em]">{w.description || "A unique coffee craft experience"}</p>

                  {/* Compact info section */}
                  <div className="flex flex-col gap-1.5 mb-4 text-[9px] font-sans uppercase tracking-[0.15em] text-[#1A1A1A]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-black font-medium">Date:</span>
                      <span className="text-[10px] font-semibold text-emerald-600">{w.datetime}</span>
                    </div>
                    <div className="flex items-baseline gap-1 pb-3 border-b border-black/[0.04]">
                      <span className="text-black font-medium">Spots:</span>
                      <span className={`text-[10px] font-semibold ${w.remaining <= 4 ? 'text-rose-500' : 'text-emerald-600'}`}>{w.remaining} left</span>
                    </div>
                  </div>

                  {/* Compressed form */}
                  <form onSubmit={(e) => handleReserveSubmit(e, w.id)} className="space-y-2.5">
                    <input
                      required
                      type="email"
                      disabled={isSoldOut || isLoading}
                      value={reservationEmails[w.id] || ''}
                      onChange={(e) => handleReservationEmailChange(w.id, e.target.value)}
                      placeholder={isSoldOut ? "CLOSED" : "your@email.com"}
                      className="w-full bg-white/60 border border-black/[0.06] px-3 py-2.5 text-[10px] font-sans lowercase tracking-wide outline-none focus:border-black/20 focus:bg-white transition-all text-black placeholder:text-zinc-300 placeholder:lowercase disabled:opacity-40 disabled:cursor-not-allowed rounded-sm"
                    />

                    {/* Compact button */}
                    <button
                      type="submit"
                      disabled={isSoldOut || isLoading}
                      className={`w-full py-2.5 text-[9px] uppercase tracking-[0.25em] font-semibold transition-all flex items-center justify-center gap-2 rounded-sm ${isSoldOut
                        ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
                        : 'bg-[#1A1A1A] text-[#FDFCF9] hover:bg-black shadow-sm hover:shadow-md'
                        }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Reserving</span>
                        </>
                      ) : isSoldOut ? (
                        <span>Full</span>
                      ) : (
                        <span>Reserve</span>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* HOST SECTION */}
        <section className="bg-black text-white p-8 md:p-32 relative overflow-hidden rounded-sm">
          <div className="max-w-2xl relative z-10">
            <h2 className="text-4xl md:text-7xl font-serif italic mb-6 md:mb-10 tracking-tighter">Host Your Own.</h2>
            <p className="text-xs md:text-sm font-sans text-zinc-400 mb-8 md:mb-12 uppercase tracking-[0.2em] leading-relaxed">
              Have a craft or idea to share? We provide the canvas, the audience, and the coffee.
            </p>

            <form onSubmit={handleHostSubmit} className="grid grid-cols-1 gap-6 md:gap-8">
              <input
                name="contact_email"
                type="email"
                value={hostForm.contact_email}
                onChange={handleHostChange}
                required
                placeholder="CONTACT EMAIL"
                className="bg-transparent border-b border-white/20 p-3 md:p-4 text-[10px] font-sans lowercase tracking-widest outline-none focus:border-white transition-all text-white placeholder:text-zinc-400 placeholder:uppercase"
              />

              <input
                name="preferred_date"
                type="text"
                value={hostForm.preferred_date}
                onChange={handleHostChange}
                required
                maxLength={10}
                placeholder="PREFERRED DATE (DD/MM/YYYY)"
                className="bg-transparent border-b border-white/20 p-3 md:p-4 text-[10px] font-sans uppercase tracking-widest outline-none focus:border-white transition-all text-white placeholder:text-zinc-400"
              />

              <textarea
                name="workshop_details"
                value={hostForm.workshop_details}
                onChange={handleHostChange}
                required
                rows={4}
                placeholder="DETAILED WORKSHOP IDEA (Theme, format, requirements, etc.)"
                className="bg-transparent border-b border-white/20 p-3 md:p-4 text-[10px] font-sans uppercase tracking-widest outline-none focus:border-white transition-all text-white placeholder:text-zinc-400 resize-none"
              />

              <button
                type="submit"
                disabled={isHosting}
                className="py-4 md:py-5 border border-white/20 hover:bg-white hover:text-black transition-all text-[10px] md:text-[11px] uppercase tracking-[0.4em] font-bold flex items-center justify-center space-x-4 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isHosting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Proposal...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Proposal</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
          <div className="absolute top-20 right-20 text-[10rem] md:text-[20rem] font-serif opacity-[0.03] select-none pointer-events-none text-white">HOST</div>
        </section>
      </div>

      {/* DYNAMIC MODAL */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {modalContent && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 font-sans">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModalContent(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
                className="relative bg-[#F9F8F4] w-full max-w-lg p-10 shadow-2xl border border-white/10 text-center m-4"
              >
                <button
                  onClick={() => setModalContent(null)}
                  className="absolute top-6 right-6 text-zinc-400 hover:text-black transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="flex justify-center mb-8">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </motion.div>
                </div>

                <h3 className="text-3xl md:text-4xl font-serif italic mb-4 text-[#1A1A1A]">{modalContent.title}</h3>
                <p className="text-xs md:text-sm font-sans text-zinc-600 uppercase tracking-widest leading-relaxed mb-8">
                  {modalContent.body}
                </p>

                <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">
                  Ref ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                </div>

                <button
                  onClick={() => setModalContent(null)}
                  className="mt-10 w-full py-4 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-black transition-all"
                >
                  Close Confirmation
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <Toast message={toastMessage} />
    </div>
  );
};

export default WorkshopPage;