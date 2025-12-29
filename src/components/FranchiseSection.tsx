
import React from 'react';
import { motion as motionBase } from 'framer-motion';
import { Briefcase, ArrowRight } from 'lucide-react';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

const FranchiseSection: React.FC = () => {
  return (
    <section id="franchise" className="bg-[#1A1A1A] text-white py-40 px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
        <div className="md:w-1/2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="aspect-square bg-zinc-800 overflow-hidden relative"
          >
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069"
              className="w-full h-full object-cover transition-all duration-1000"
              alt="Franchise Opportunity"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 border border-white/10 flex items-center justify-center">
                <Briefcase className="w-12 h-12 text-white/20" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="md:w-1/2">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[10px] uppercase tracking-[0.5em] text-zinc-500 mb-8 block">Expansion & Partnership</span>
            <h2 className="text-6xl md:text-8xl font-gothic mb-10 tracking-tighter leading-none text-[#F3F3F3]">
              Partner <br /> With Us.
            </h2>
            <p className="text-sm font-mono leading-relaxed text-zinc-400 mb-12 uppercase tracking-wider max-w-lg">
              Bring the Rabuste standard to your city. We are looking for intentional partners who share our appetite for excellence, art, and the boldest coffee on the planet.
            </p>

            <motion.button
              whileHover={{ x: 10 }}
              className="group flex items-center space-x-6 text-[12px] uppercase tracking-[0.5em] font-bold"
            >
              <span>Franchise Enquiry</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FranchiseSection;
