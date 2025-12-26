
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
          className="w-[66%] object-contain opacity-20 group-hover:opacity-100 transition-all duration-[1500ms] grayscale group-hover:grayscale-0"
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-black/10" />
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-20 pb-32 grid grid-cols-1 md:grid-cols-4 gap-20">
        <div className="col-span-1 md:col-span-2">
          {/* Brand Logo Stamp: Increased size of logo.png and tight vertical gap */}
          <div className="mb-2">
            <img 
              src="/media/logo.png" 
              alt="Rabuste Logo" 
              className="h-24 md:h-28 object-contain"
            />
          </div>
          <p className="text-[12px] font-sans text-zinc-400 max-w-sm uppercase tracking-widest leading-relaxed">
            Rabuste is a specialty coffee collective focused on the reclamation of Robusta coffee, operating from Surat.
          </p>
        </div>

        <div>
          <h4 className="text-[9px] uppercase tracking-[0.5em] text-zinc-600 mb-10 font-sans">Navigate</h4>
          <ul className="space-y-6 text-[10px] font-sans uppercase tracking-widest">
            <li><button onClick={() => onNavigate(Page.FIND_STORE)} className="hover:text-zinc-400 transition-colors">Find Store</button></li>
            <li><button onClick={() => onNavigate(Page.FAQ)} className="hover:text-zinc-400 transition-colors">FAQ</button></li>
            <li><button onClick={() => onNavigate(Page.MENU)} className="hover:text-zinc-400 transition-colors">Menu</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[9px] uppercase tracking-[0.5em] text-zinc-600 mb-10 font-sans">Connect</h4>
          <ul className="space-y-6 text-[10px] font-sans uppercase tracking-widest">
            <li>
              <a
                href="https://www.instagram.com/rabuste.coffee"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 hover:text-zinc-400 transition-colors"
              >
                <Instagram className="w-3 h-3" /> <span>Instagram</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col md:row-reverse md:flex-row justify-between items-center border-t border-white/10 text-[9px] font-sans tracking-widest text-zinc-600 uppercase">
        <button 
          onClick={scrollToTop}
          className="flex items-center space-x-3 mb-6 md:mb-0 hover:text-white transition-colors"
        >
          <span>Return to Origin</span>
          <ArrowUp className="w-3 h-3" />
        </button>
        <div>© 2024 RABUSTE COFFEE CO. — BUILT FOR INTENTIONALITY</div>
      </div>
    </footer>
  );
};

export default Footer;
