import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Coffee, Minimize2, Maximize2 } from 'lucide-react';
import './ChatWidget.css';

interface ApiResponse {
  action?: 'navigate' | 'respond';
  parameters?: {
    route?: string;
    message?: string;
  };
  reply?: string;
  error?: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "Hi! I'm your Rabuste Barista. Ask me about our menu, calories, or for a recommendation!", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isLoading]);

  // --- HELPER TO CLEAN TEXT ON FRONTEND ---
  const cleanText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\*\*/g, "") // Remove bold markers
      .replace(/__/g, "")   // Remove italics markers
      .replace(/^\*/gm, "•"); // Turn list stars into bullets
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      let botResponse = "I didn't catch that.";
      
      if (data.action === 'navigate' && data.parameters?.route) {
        botResponse = `Taking you to the ${data.parameters.route.replace('/', '')} page...`;
        setTimeout(() => { window.location.href = data.parameters?.route || '/'; }, 1500);
      } else if (data.action === 'respond' && data.parameters?.message) {
        botResponse = data.parameters.message;
      } else if (data.reply) {
        botResponse = data.reply;
      } else if (data.error) {
        botResponse = `Server Error: ${data.error}`;
      }

      // Clean the text before setting it
      setMessages(prev => [...prev, { text: cleanText(botResponse), isUser: false }]);

    } catch (error: any) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { text: "⚠️ Connection Error. Is the server running?", isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-widget-container" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
      
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chat-widget-button flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
          style={{ backgroundColor: '#2C1810', width: '60px', height: '60px' }} 
        >
          <MessageCircle className="text-[#F3E5AB]" size={30} />
        </button>
      )}

      {isOpen && (
        <div className={`chat-window bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${isMinimized ? 'h-[60px]' : 'h-[500px]'}`} 
             style={{ width: '350px', border: '1px solid #2C1810' }}>
          
          <div className="chat-header p-4 flex justify-between items-center text-[#F3E5AB]" style={{ backgroundColor: '#2C1810' }}>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
              <Coffee size={20} />
              <div className="flex flex-col">
                <span className="font-bold leading-tight">RABUSTE</span>
                <span className="text-[10px] font-normal opacity-80">AI Assistant</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMinimized(!isMinimized)} className="hover:opacity-80"><Minimize2 size={16} /></button>
              <button onClick={() => setIsOpen(false)} className="hover:opacity-80"><X size={20} /></button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="chat-messages flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#FAF9F6]">
                {messages.map((msg, index) => (
                  <div key={index} 
                       className={`message p-3 rounded-lg max-w-[85%] text-sm ${msg.isUser ? 'self-end' : 'self-start'}`}
                       style={{
                         whiteSpace: 'pre-wrap', // Essential for lists!
                         backgroundColor: msg.isUser ? '#2C1810' : '#EFEBE9',
                         color: msg.isUser ? '#F3E5AB' : '#2C1810',
                         border: msg.isUser ? 'none' : '1px solid #D7CCC8',
                         borderRadius: '8px'
                       }}>
                    {msg.text}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="bg-[#EFEBE9] p-3 rounded-lg flex items-center gap-2 text-[#2C1810] text-sm w-fit border border-[#D7CCC8]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Brewing answer...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-area p-3 border-t border-gray-200 bg-white flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about menu, calories..."
                  disabled={isLoading}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#2C1810] text-sm"
                />
                <button 
                  onClick={handleSend} 
                  disabled={isLoading || !input.trim()}
                  className="p-2 rounded-md disabled:opacity-50"
                  style={{ backgroundColor: '#2C1810', color: '#F3E5AB' }}
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}