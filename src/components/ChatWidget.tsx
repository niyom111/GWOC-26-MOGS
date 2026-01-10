import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import './ChatWidget.css'; // Ensure you have this CSS file

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

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "Hi! I'm your Rabuste Barista. Ask me about our menu, calories, or for a recommendation!", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

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

      let botReply = "I'm not sure how to respond to that.";

      if (data.action === 'navigate') {
        botReply = `Navigating you to ${data.parameters.route}...`;
        window.location.href = data.parameters.route;
      } else if (data.parameters && data.parameters.message) {
        botReply = data.parameters.message;
      } else if (data.reply) {
        botReply = data.reply;
      }

      setMessages(prev => [...prev, { text: botReply, isUser: false }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { text: "Connection error.", isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-all z-50 ${isOpen ? 'bg-[#2C150F] text-white rotate-90' : 'bg-[#2C150F] text-white'}`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[360px] h-[550px] bg-[#FAFAF9] rounded-xl shadow-2xl overflow-hidden font-sans flex flex-col z-50 animate-in slide-in-from-bottom-5 duration-300">

          {/* Header */}
          <div className="bg-[#2C150F] text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><line x1="6" x2="6" y1="2" y2="4" /><line x1="10" x2="10" y1="2" y2="4" /><line x1="14" x2="14" y1="2" y2="4" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-lg tracking-wide leading-tight">RABUSTE</h3>
                <p className="text-xs text-white/70 uppercase tracking-wider">AI Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAFAF9]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 text-[15px] shadow-sm leading-relaxed ${msg.isUser
                    ? 'bg-[#2C150F] text-white rounded-2xl rounded-tr-none'
                    : 'bg-[#F3F0EB] text-[#44403C] rounded-2xl rounded-tl-none border border-[#E7E5E4]'
                    }`}
                >
                  <FormatMessage text={msg.text} />
                </div>
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
                className="flex-1 bg-white border border-[#E7E5E4] rounded-lg px-4 py-3 text-[#44403C] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#8B5E3C] transition-colors"
                autoFocus
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-[#A08875] hover:bg-[#8B5E3C] text-white p-3 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:shadow-none active:scale-95"
              >
                <Send className="w-5 h-5 -ml-0.5 mt-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}