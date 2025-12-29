
import React from 'react';
import { motion as motionBase } from 'framer-motion';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

const events = [
  { name: "Latte Art 101", time: "Every Saturday — 10AM", fee: "$45" },
  { name: "Painting with Coffee", time: "Monthly Series — 6PM", fee: "$60" },
  { name: "The Robusta Brewing Class", time: "Daily — 8AM", fee: "Complimentary" },
];

const Workshops: React.FC = () => {
  return (
    <section className="bg-black text-white py-32 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[10px] uppercase tracking-[0.5em] font-mono text-zinc-500 mb-8 block"
          >
            Education & Mastery
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-7xl md:text-[9rem] font-gothic mb-12 tracking-tighter leading-none"
          >
            Workshops <br/> & Events.
          </motion.h2>
          <motion.button 
            whileHover={{ x: 10 }}
            className="flex items-center space-x-6 text-[11px] uppercase tracking-[0.3em] font-bold group"
          >
            <span>Browse Full Calendar</span>
            <div className="w-16 h-px bg-white group-hover:w-24 transition-all duration-700" />
          </motion.button>
        </div>

        <div className="space-y-px bg-white/10 border border-white/10">
          {events.map((event, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-black p-10 flex justify-between items-center group cursor-pointer hover:bg-zinc-900 transition-all"
            >
              <div>
                <h3 className="text-2xl font-gothic mb-2 group-hover:text-zinc-300 transition-colors">{event.name}</h3>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{event.time}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono tracking-widest block mb-2">{event.fee}</span>
                <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest">Reserve Spot</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Workshops;
