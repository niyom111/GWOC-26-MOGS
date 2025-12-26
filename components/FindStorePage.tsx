import React from 'react';
import { motion as motionBase } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

const FindStorePage: React.FC = () => {
  const handleDirections = () => {
    window.open('https://maps.app.goo.gl/VZWoGudPSAgWND3dA', '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="bg-[#F9F8F4] text-[#1A1A1A] pt-32 pb-40 px-8 min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.5em] text-zinc-500 mb-6 font-sans"
          >
            Visit Us
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif italic tracking-tight leading-tight mb-10 text-[#1A1A1A]"
          >
            Find the<br /> Rabuste Bar.
          </motion.h1>

          <div className="space-y-8 font-sans text-sm tracking-widest uppercase text-[#1A1A1A]">
            <div className="flex items-start space-x-4">
              <MapPin className="w-5 h-5 mt-1 text-zinc-500" />
              <div>
                <p className="text-zinc-600 text-[10px] mb-2">Physical Storefront</p>
                <p className="text-[12px] text-[#1A1A1A] leading-relaxed">
                  Dimpal Row House, 15, Gymkhana Rd,<br />
                  Piplod, Surat, Gujarat 395007, India
                </p>
              </div>
            </div>

            <p className="text-[10px] text-zinc-700 max-w-sm leading-relaxed">
              A focused bar built around the Robusta standard. Expect limited seating, elevated caffeine
              payloads, and a rotating calendar of workshops and gallery nights.
            </p>
          </div>

          <button
            onClick={handleDirections}
            className="mt-10 inline-flex items-center space-x-4 px-8 py-4 border border-black/10 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-black hover:text-[#F9F8F4] transition-all"
          >
            <span>Get Directions</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative w-full border border-black/10 bg-white overflow-hidden aspect-[4/3]"
          >
            <iframe
              title="Rabuste Surat Location"
              src="https://maps.google.com/maps?q=Dimpal+Row+House,+15,+Gymkhana+Rd,+Piplod,+Surat,+Gujarat&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </motion.div>

          <p className="text-[9px] text-zinc-500 font-sans uppercase tracking-widest">
            Map is approximate. Use the directions link for live navigation updates.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FindStorePage;
