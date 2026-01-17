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
    <section className="relative min-h-screen w-full overflow-x-hidden font-sans bg-[#F3EFE0] flex flex-col md:block">

      {/* Content Section (Mobile: Order 1, Desktop: Overlay) */}
      <div className="relative z-10 w-full px-6 pt-32 pb-8 order-1 md:order-none md:absolute md:bottom-36 md:left-12 md:p-0 max-w-md md:pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="md:bg-[#F3EFE0]/80 md:backdrop-blur-md md:border md:border-black/5 md:shadow-2xl md:px-12 md:py-16 md:rounded-none pointer-events-auto"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs uppercase tracking-[0.3em] text-[#1A1A1A] mb-8 font-sans"
          >
            Visit Us
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-6xl md:text-6xl font-serif italic tracking-tight leading-[0.9] mb-10 text-[#1A1A1A]"
          >
            Find the<br /> Rabuste Bar.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-8"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-black/5 rounded-full mt-1">
                <MapPin className="w-5 h-5 text-[#1A1A1A]" strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-black font-bold">Physical Storefront</p>
                <p className="text-sm text-[#1A1A1A] leading-relaxed font-sans font-medium text-balance">
                  Dimpal Row House, 15, Gymkhana Rd,<br />
                  Piplod, Surat, Gujarat 395007, India
                </p>
              </div>
            </div>

            <button
              onClick={handleDirections}
              className="group w-full md:w-auto px-8 py-4 bg-[#1A1A1A] text-[#F9F8F4] text-[10px] uppercase tracking-[0.3em] font-sans hover:bg-black transition-all flex items-center justify-center md:justify-start gap-4 rounded-lg md:rounded-none"
            >
              <span>Get Directions</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Map Section (Mobile: Order 2, Desktop: Background) */}
      <div className="relative w-full h-[65vh] order-2 md:order-none md:absolute md:inset-0 md:h-full z-0 px-2 pb-10 md:p-0">
        <div className="w-full h-full rounded-none md:rounded-none overflow-hidden shadow-inner md:shadow-none border border-black/5 md:border-0 relative grayscale-[20%] contrast-[1.05]">
          <iframe
            title="Rabuste Surat Location"
            src="https://maps.google.com/maps?q=Rabuste+Coffee,+Surat&t=&z=15&ie=UTF8&iwloc=near&output=embed"
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
};

export default FindStorePage;
