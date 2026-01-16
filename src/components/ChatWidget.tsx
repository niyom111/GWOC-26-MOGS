import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Coffee } from 'lucide-react';
import { motion, AnimatePresence, useDragControls, useAnimation } from 'framer-motion';
import './ChatWidget.css';
import { API_BASE_URL } from '../config';
import { Page } from '../types';

// Simple hook for mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

// Helper to render text with Bold formatting and Line Breaks
const FormatMessage = ({ text }: { text: string }) => {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className="text-[15px] leading-relaxed tracking-wide font-sans text-inherit">
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*.*?\*\*)/g);

        return (
          <p key={i} className="min-h-[1em] mb-1 last:mb-0">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
              }
              return <span key={j}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
};

interface ChatWidgetProps {
  currentPage?: Page;
}

export default function ChatWidget({ currentPage }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "Hi! I'm Labubu AI. Ask me about our menu, calories, or for a recommendation!", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isLoading]);

  const handleSend = async () => {
    if (!(input ?? '').trim()) return;

    const userMsg = input;
    const currentHistory = [...messages, { text: userMsg, isUser: true }];
    setMessages(prev => [...prev, { text: userMsg, isUser: true }]);
    setInput('');
    setIsLoading(true);

    try {
      const contextHistory = currentHistory.slice(-6).map(m => ({
        role: m.isUser ? 'user' : 'model',
        text: m.text
      }));

      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          context: { history: contextHistory }
        })
      });
      const data = await res.json();

      let botResponse = "I'm not sure how to respond to that.";

      if (data.action === 'navigate' && data.parameters?.route) {
        botResponse = `Taking you to the ${data.parameters.route.replace('/', '')} page...`;
        setTimeout(() => { window.location.href = data.parameters?.route || '/'; }, 1500);
      } else if (data.action === 'respond' && data.parameters?.message) {
        botResponse = data.parameters.message;
      } else if (data.reply) {
        botResponse = data.reply;
      }

      setMessages(prev => [...prev, { text: botResponse, isUser: false }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { text: "Connection error.", isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  const isMobile = useIsMobile();
  const controls = useAnimation();

  useEffect(() => {
    if (currentPage === Page.FRANCHISE) {
      controls.set({ opacity: 0 });
      controls.start({
        opacity: 1,
        transition: { delay: 1.5, duration: 1, ease: 'easeOut' }
      });
    } else {
      controls.start({ opacity: 1, transition: { duration: 0.5 } });
    }
  }, [currentPage, controls]);

  return (
    <motion.div
      className="chat-widget-container"
      animate={controls}
      style={{
        position: 'fixed',
        bottom: isMobile ? '16px' : '20px',
        right: isMobile ? '16px' : '20px',
        zIndex: 9999,
        width: isMobile ? 'calc(100vw - 32px)' : '350px',
        maxWidth: '350px',
        height: isMobile ? '50vh' : '500px',
        maxHeight: isMobile ? '80vh' : '500px',
        pointerEvents: 'none'
      }}>
      {/* Container is fixed size to prevent layout shifts, but pointer-events-none so it doesn't block clicks when closed/small.
          We re-enable pointer-events on the actual children.
      */}

      {/* Simultaneous animation for fluid feel */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute bottom-0 right-0 pointer-events-auto origin-bottom-right"
          >
            <button
              onClick={() => setIsOpen(true)}
              className={`flex items-center justify-center gap-2 rounded-full shadow-lg transition-transform hover:scale-105 ${isMobile ? 'px-4 py-3' : 'px-6 py-3'}`}
              style={{ backgroundColor: '#A35D36', height: isMobile ? '48px' : '56px', width: 'auto' }}
            >
              <MessageCircle className="text-[#F9F8F4]" size={isMobile ? 20 : 26} />
              <span className={`text-[#F9F8F4] font-bold whitespace-nowrap ${isMobile ? 'text-sm' : 'text-lg'}`}>Labubu AI</span>
            </button>
          </motion.div>
        )}

        {isOpen && (
          <motion.div
            key="window"
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={`bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col absolute bottom-0 right-0 pointer-events-auto origin-bottom-right`}
            style={{
              width: isMobile ? '100%' : '100%',
              height: '100%',
              border: '1px solid #A35D36',
              resize: isMobile ? 'vertical' : 'none',
              overflow: 'hidden',
              minHeight: '300px',
              maxHeight: '80vh'
            }}
          >
            {/* Header */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className={`chat-header flex justify-between items-center text-[#F9F8F4] cursor-move ${isMobile ? 'p-3' : 'p-5'}`}
              style={{ backgroundColor: '#A35D36', touchAction: 'none' }}
            >
              <div className="flex items-center gap-3 pointer-events-none">
                <Coffee size={isMobile ? 22 : 28} />
                <div className="flex flex-col">
                  <span className={`font-bold leading-tight ${isMobile ? 'text-lg' : 'text-xl'}`}>Labubu</span>
                  <span className="text-sm font-normal opacity-90">AI Assistant</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsOpen(false)} className="hover:opacity-80 transition-opacity">
                  <X size={isMobile ? 20 : 24} />
                </button>
              </div>
            </div>
            <div className={`chat-messages flex-1 overflow-y-auto flex flex-col gap-4 bg-[#F3EFE0] ${isMobile ? 'p-3' : 'p-5'}`}>
              {messages.map((msg, index) => (
                <div key={index}
                  className={`message rounded-xl max-w-[85%] leading-relaxed shadow-sm ${msg.isUser ? 'self-end' : 'self-start'} ${isMobile ? 'p-3 text-[14px]' : 'p-4 text-[16px]'}`}
                  style={{
                    whiteSpace: 'pre-wrap',
                    backgroundColor: msg.isUser ? '#A35D36' : '#EFEBE9',
                    color: msg.isUser ? '#F9F8F4' : '#2C1810',
                    border: msg.isUser ? 'none' : '1px solid #D7CCC8',
                    borderRadius: '16px',
                    borderBottomRightRadius: msg.isUser ? '2px' : '16px',
                    borderBottomLeftRadius: msg.isUser ? '16px' : '2px'
                  }}>
                  <FormatMessage text={msg.text} />
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#F3F0EB] p-3 rounded-2xl rounded-tl-none border border-[#E7E5E4] flex items-center gap-2 text-xs text-[#8B5E3C] font-medium tracking-wide">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    BREWING...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-[#E7E5E4]">
              <div className="flex gap-2 items-center bg-transparent">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about menu, calories..."
                  disabled={isLoading}
                  className={`flex-1 border border-gray-300 rounded-xl focus:outline-none focus:border-[#A35D36] ${isMobile ? 'p-3 text-[14px]' : 'p-3.5 text-[16px]'}`}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !(input ?? '').trim()}
                  className={`rounded-xl disabled:opacity-50 transition-all hover:brightness-110 shadow-sm ${isMobile ? 'p-3' : 'p-3.5'}`}
                  style={{ backgroundColor: '#A35D36', color: '#F9F8F4' }}
                >
                  <Send className="w-5 h-5 -ml-0.5 mt-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

