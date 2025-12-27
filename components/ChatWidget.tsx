import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Coffee } from 'lucide-react'; // Added Coffee icon!

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.details);

      setMessages(prev => [...prev, { text: data.reply, isUser: false }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "⚠️ The barista is busy right now. Please try again.", isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* 1. THE FLOATING BUTTON (Cream Color to pop against dark site) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#F3E5AB] hover:bg-[#e6d690] text-[#2C1810] rounded-full p-4 shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2 border-2 border-[#2C1810]"
        >
          {/* Changed icon to Coffee cup if you want, or keep MessageCircle */}
          <MessageCircle size={28} strokeWidth={2.5} />
        </button>
      )}

      {/* 2. THE CHAT WINDOW */}
      {isOpen && (
        <div className="bg-[#FAF9F6] rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col border-2 border-[#2C1810] overflow-hidden" style={{ height: '550px' }}>
          
          {/* Header: Dark Espresso Background */}
          <div className="bg-[#2C1810] text-[#F3E5AB] p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <Coffee size={20} />
              <div>
                <h3 className="font-bold text-lg tracking-wide">RABUSTE</h3>
                <p className="text-xs text-[#d4a373]">Virtual Barista</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-white transition-colors">
              <X size={22} />
            </button>
          </div>

          {/* Messages Area: Off-white "Parchment" color */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF9F6]">
            {messages.length === 0 && (
              <div className="text-center mt-10 opacity-60">
                <Coffee className="w-12 h-12 mx-auto text-[#2C1810] mb-2" />
                <p className="text-[#2C1810] text-sm">Welcome to Rabuste.<br/>How can I help you brew today?</p>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 text-sm shadow-sm ${
                  msg.isUser 
                    ? 'bg-[#2C1810] text-[#F3E5AB] rounded-2xl rounded-br-sm' // User: Espresso color
                    : 'bg-[#EFEBE9] text-[#2C1810] border border-[#d7ccc8] rounded-2xl rounded-bl-sm' // Bot: Milk foam color
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#EFEBE9] p-3 rounded-2xl rounded-bl-sm border border-[#d7ccc8] flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#2C1810]" />
                  <span className="text-xs text-[#5d4037]">Brewing answer...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-[#e0e0e0]">
            <div className="flex gap-2 bg-[#F5F5F5] rounded-full px-2 py-1 border border-[#e0e0e0] focus-within:border-[#2C1810] focus-within:ring-1 focus-within:ring-[#2C1810] transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about our roasts..."
                className="flex-1 bg-transparent px-3 py-2 text-sm outline-none text-[#2C1810] placeholder:text-gray-400"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="text-[#2C1810] hover:bg-[#e0e0e0] p-2 rounded-full transition-colors disabled:opacity-30"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}