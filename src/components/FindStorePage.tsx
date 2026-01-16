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
    <section className="relative h-screen w-full overflow-hidden font-sans">
      {/* Full Screen Map Background */}
      <div className="absolute inset-0 z-0">
        <iframe
          title="Rabuste Surat Location"
          src="https://maps.google.com/maps?q=Rabuste+Coffee,+Surat&t=&z=15&ie=UTF8&output=embed"
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        {/* Subtle overlay to harmonize with overlay card if needed, or rely on map filters */}
      </div>

      {/* Floating Info Card */}
      <div className="absolute z-10 top-1/2 -translate-y-1/2 left-4 md:left-24 max-w-md pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#F3EFE0]/90 backdrop-blur-xl border border-black/5 shadow-2xl p-8 md:p-12 rounded-none md:rounded-xl pointer-events-auto"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[13px] uppercase tracking-[0.3em] text-[#1A1A1A] mb-8 font-sans"
          >
            Visit Us
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-6xl md:text-7xl lg:text-8xl font-serif italic tracking-tight leading-[0.9] mb-8 text-[#1A1A1A]"
          >
            Find the<br /> Rabuste Bar.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 mt-0.5 text-[#1A1A1A]" strokeWidth={1.5} />
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.2em] text-black font-bold">Physical Storefront</p>
                <p className="text-sm text-[#1A1A1A] leading-relaxed font-sans">
                  Dimpal Row House, 15, Gymkhana Rd,<br />
                  Piplod, Surat, Gujarat 395007, India
                </p>
              </div>
            </div>

            <button
              onClick={handleDirections}
              className="group w-full md:w-auto mt-4 px-8 py-4 bg-[#1A1A1A] text-[#F9F8F4] text-[10px] uppercase tracking-[0.3em] font-sans hover:bg-black transition-all flex items-center justify-center gap-3"
            >
              <span>Get Directions</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FindStorePage;
