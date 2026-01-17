import React from 'react';
import { Instagram, ArrowUp, Phone, Mail } from 'lucide-react';
import { Page } from '../types';
import { useDataContext } from '../DataContext';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { orderSettings } = useDataContext();
  const [isFooterLogoActive, setIsFooterLogoActive] = React.useState(false);
  const footerLogoTimeoutRef = React.useRef<number | null>(null);

  const handleFooterLogoClick = () => {
    // If already active, clear timeout and deactivate immediately (toggle off)
    if (isFooterLogoActive) {
      if (footerLogoTimeoutRef.current) {
        window.clearTimeout(footerLogoTimeoutRef.current);
        footerLogoTimeoutRef.current = null;
      }
      setIsFooterLogoActive(false);
      return;
    }

    // Activate
    setIsFooterLogoActive(true);

    // Auto-deactivate after 3 seconds
    if (footerLogoTimeoutRef.current) {
      window.clearTimeout(footerLogoTimeoutRef.current);
    }
    footerLogoTimeoutRef.current = window.setTimeout(() => {
      setIsFooterLogoActive(false);
      footerLogoTimeoutRef.current = null;
    }, 3000);
  };
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black text-white">
      {/* Centerpiece Wordmark: Reduced by 33% and specifically using logo2.png */}
      {/* Centerpiece Wordmark: Reduced by 33% and specifically using logo2.png */}
      <div
        className="relative flex items-center justify-center h-[25vh] md:h-[40vh] overflow-hidden group border-b border-white/5 cursor-pointer"
        onClick={handleFooterLogoClick}
      >
        <img
          src="/media/logo2.png"
          alt="Rabuste Mark"
          className={`w-[66%] object-contain transition-all duration-[1500ms] ${isFooterLogoActive ? 'opacity-100' : 'opacity-20 md:group-hover:opacity-100'
            }`}
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
          <p className="text-base md:text-lg font-sans text-zinc-400 max-w-md leading-relaxed">
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
              { label: 'Portal', action: () => onNavigate(Page.ADMIN) },
              { label: 'Employee', action: () => onNavigate(Page.EMPLOYEE) },
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
            {orderSettings?.contact_info_1 && (
              <li>
                <a
                  href={orderSettings.contact_info_1.includes('@') ? `mailto:${orderSettings.contact_info_1}` : `tel:${orderSettings.contact_info_1}`}
                  className="flex items-center space-x-3 hover:text-white transition-colors duration-700 ease-out group"
                >
                  {orderSettings.contact_info_1.includes('@') ? (
                    <Mail className="w-4 h-4 transition-transform duration-700 ease-[0.22,1,0.36,1] group-hover:scale-110" />
                  ) : (
                    <Phone className="w-4 h-4 transition-transform duration-700 ease-[0.22,1,0.36,1] group-hover:scale-110" />
                  )}
                  <span className="relative">
                    {orderSettings.contact_info_1}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all duration-700 ease-[0.22,1,0.36,1] group-hover:w-full" />
                  </span>
                </a>
              </li>
            )}
            {orderSettings?.contact_info_2 && (
              <li>
                <a
                  href={orderSettings.contact_info_2.includes('@') ? `mailto:${orderSettings.contact_info_2}` : `tel:${orderSettings.contact_info_2}`}
                  className="flex items-center space-x-3 hover:text-white transition-colors duration-700 ease-out group"
                >
                  {orderSettings.contact_info_2.includes('@') ? (
                    <Mail className="w-4 h-4 transition-transform duration-700 ease-[0.22,1,0.36,1] group-hover:scale-110" />
                  ) : (
                    <Phone className="w-4 h-4 transition-transform duration-700 ease-[0.22,1,0.36,1] group-hover:scale-110" />
                  )}
                  <span className="relative">
                    {orderSettings.contact_info_2}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all duration-700 ease-[0.22,1,0.36,1] group-hover:w-full" />
                  </span>
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-10 pb-32 md:pb-6 flex flex-col md:grid md:grid-cols-3 items-center border-t border-white/10 text-xs font-sans tracking-[0.2em] text-zinc-400 uppercase space-y-4 md:space-y-0">
        <button
          onClick={scrollToTop}
          className="flex items-center space-x-3 mb-6 md:mb-0 hover:text-white transition-colors duration-700 ease-out font-bold group md:col-start-3 md:justify-self-end md:row-start-1"
        >
          <span>Return to Origin</span>
          <ArrowUp className="w-4 h-4 transition-transform duration-700 ease-[0.22,1,0.36,1] group-hover:-translate-y-1" />
        </button>
        <div className="md:col-start-2 md:justify-self-center md:row-start-1 text-center w-full whitespace-normal md:whitespace-nowrap">© 2026 RABUSTE COFFEE CO. — BUILT FOR INTENTIONALITY</div>
      </div>
    </footer>
  );
};

export default Footer;
