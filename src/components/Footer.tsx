
import React from 'react';
import { Instagram, ArrowUp } from 'lucide-react';
import { Page } from '../types';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black text-white">
      {/* Centerpiece Wordmark: Reduced by 33% and specifically using logo2.png */}
      <div className="relative flex items-center justify-center h-[25vh] md:h-[40vh] overflow-hidden group border-b border-white/5">
        <img
          src="/media/logo2.png"
          alt="Rabuste Mark"
          className="w-[66%] object-contain opacity-20 group-hover:opacity-100 transition-all duration-[1500ms]"
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-black/10" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-12 md:pt-16 pb-20 md:pb-24 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-20">
        <div className="col-span-1 md:col-span-2">
          {/* Brand Logo Stamp */}
          <div className="mb-4">
            <img
              src="/media/logo.png"
              alt="Rabuste Logo"
              className="h-24 md:h-32 object-contain"
            />
          </div>
          <p className="text-sm md:text-base font-sans text-zinc-300 max-w-md uppercase tracking-widest leading-relaxed">
            Rabuste is a specialty coffee collective focused on the reclamation of Robusta coffee, operating from Surat.
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.3em] text-zinc-400 mb-8 font-bold font-sans">Navigate</h4>
          <ul className="space-y-4 text-sm font-sans uppercase tracking-[0.2em] text-zinc-200">
            {/* Motion-enhanced links for smooth interactions */}
            {[
              { label: 'Find Store', action: () => onNavigate(Page.FIND_STORE) },
              { label: 'FAQ', action: () => onNavigate(Page.FAQ) },
              { label: 'Menu', action: () => onNavigate(Page.MENU) },
            ].map((link) => (
              <li key={link.label}>
                <button
                  onClick={link.action}
                  className="hover:text-white transition-colors duration-700 ease-out flex items-center group"
                >
                  <span className="relative">
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all duration-700 ease-[0.22,1,0.36,1] group-hover:w-full" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.3em] text-zinc-400 mb-8 font-bold font-sans">Connect</h4>
          <ul className="space-y-4 text-sm font-sans uppercase tracking-[0.2em] text-zinc-200">
            <li>
              <a
                href="https://www.instagram.com/rabuste.coffee"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 hover:text-white transition-colors duration-700 ease-out group"
              >
                <Instagram className="w-4 h-4 transition-transform duration-700 ease-[0.22,1,0.36,1] group-hover:scale-110" />
                <span className="relative">
                  Instagram
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all duration-700 ease-[0.22,1,0.36,1] group-hover:w-full" />
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col md:row-reverse md:flex-row justify-between items-center border-t border-white/10 text-xs font-sans tracking-[0.2em] text-zinc-400 uppercase space-y-4 md:space-y-0">
        <button
          onClick={scrollToTop}
          className="flex items-center space-x-3 mb-6 md:mb-0 hover:text-white transition-colors duration-700 ease-out font-bold group"
        >
          <span>Return to Origin</span>
          <ArrowUp className="w-4 h-4 transition-transform duration-700 ease-[0.22,1,0.36,1] group-hover:-translate-y-1" />
        </button>
        <div>© 2024 RABUSTE COFFEE CO. — BUILT FOR INTENTIONALITY</div>
      </div>
    </footer>
  );
};

export default Footer;
