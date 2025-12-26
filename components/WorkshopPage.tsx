
import React, { useState } from 'react';
import { motion as motionBase } from 'framer-motion';
import { Calendar, Users, Send } from 'lucide-react';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

const workshops = [
  { id: '1', name: "Latte Art Basics", desc: "Master the classic heart and rosetta using Robusta's thick crema.", date: "Oct 24", time: "10:00 AM", seats: 3, img: "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&q=80&w=1000" },
  { id: '2', name: "Canvas & Coffee", desc: "A painting session using coffee-based pigments and watercolors.", date: "Oct 28", time: "6:00 PM", seats: 5, img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1000" },
  { id: '3', name: "The Robusta Brew", desc: "Deep dive into temperature and pressure variables for high-caffeine extraction.", date: "Nov 02", time: "8:00 AM", seats: 2, img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1000" },
];
const WorkshopPage: React.FC = () => {
  const [signedUp, setSignedUp] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setSignedUp(true);
    setTimeout(() => setSignedUp(false), 3000);
  };

  return (
    <div className="pt-32 pb-40 px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-32">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] uppercase tracking-[0.5em] text-zinc-400 mb-6">Education & Mastery</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-7xl md:text-9xl font-serif italic tracking-tighter leading-none">Craft & Community.</motion.h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-40">
          {workshops.map((w, idx) => (
            <motion.div 
              key={w.id} 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: idx * 0.1 }}
              className="group bg-white border border-black/5 p-8"
            >
              <div className="aspect-square overflow-hidden mb-8 grayscale group-hover:grayscale-0 transition-all duration-700">
                <img src={w.img} className="w-full h-full object-cover" alt={w.name} />
              </div>
              <h3 className="text-3xl font-serif italic mb-4">{w.name}</h3>
              <p className="text-sm font-sans text-zinc-500 mb-8 leading-relaxed uppercase tracking-wider">{w.desc}</p>
              
              <div className="flex flex-col space-y-3 mb-10 text-[10px] font-sans uppercase tracking-[0.2em] font-bold">
                <div className="flex justify-between border-b border-black/5 pb-2">
                  <span className="text-zinc-400">Date & Time</span>
                  <span>{w.date} @ {w.time}</span>
                </div>
                <div className="flex justify-between border-b border-black/5 pb-2">
                  <span className="text-zinc-400">Available</span>
                  <span className={w.seats < 3 ? 'text-red-500' : ''}>{w.seats} spots left</span>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <input required type="email" placeholder="EMAIL ADDRESS" className="w-full bg-[#f9f9f9] border-b border-black/10 p-3 text-[10px] font-sans uppercase tracking-widest outline-none focus:border-black transition-all" />
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" className="w-3 h-3 accent-black" />
                  <span className="text-[9px] text-zinc-400 uppercase tracking-widest">Receive updates</span>
                </label>
                <button type="submit" className="w-full py-4 bg-black text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-zinc-800 transition-all">
                  {signedUp ? 'Success!' : 'Reserve Seat'}
                </button>
              </form>
            </motion.div>
          ))}
        </div>

        {/* Host Section */}
        <section className="bg-black text-white p-12 md:p-32 relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <h2 className="text-5xl md:text-7xl font-serif italic mb-10 tracking-tighter">Host Your Own.</h2>
            <p className="text-sm font-sans text-zinc-400 mb-12 uppercase tracking-[0.2em] leading-relaxed">Have a craft or idea to share? We provide the canvas, the audience, and the coffee.</p>
            
            <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <input placeholder="WORKSHOP IDEA" className="bg-transparent border-b border-white/20 p-4 text-[10px] font-sans uppercase tracking-widest outline-none focus:border-white transition-all" />
              <input placeholder="PREFERRED DATES" className="bg-transparent border-b border-white/20 p-4 text-[10px] font-sans uppercase tracking-widest outline-none focus:border-white transition-all" />
              <input placeholder="CONTACT INFO" className="bg-transparent border-b border-white/20 p-4 text-[10px] font-sans uppercase tracking-widest outline-none focus:border-white transition-all md:col-span-2" />
              <button className="md:col-span-2 py-5 border border-white/20 hover:bg-white hover:text-black transition-all text-[11px] uppercase tracking-[0.4em] font-bold flex items-center justify-center space-x-4">
                <span>Submit Proposal</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
          <div className="absolute top-20 right-20 text-[20rem] font-serif opacity-[0.03] select-none pointer-events-none">HOST</div>
        </section>
      </div>
    </div>
  );
};

export default WorkshopPage;
