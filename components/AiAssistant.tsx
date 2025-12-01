import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles } from 'lucide-react';
import { chatWithAi } from '../services/geminiService';
import BackgroundEffects from './BackgroundEffects';
import { WeatherCondition } from '../types';

interface AiAssistantProps {
  isDark: boolean;
  weatherCondition?: WeatherCondition;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

const SUGGESTIONS = [
  "Will it rain today?",
  "What should I wear?",
  "7-day forecast summary",
  "Is it safe to go outside?",
  "Explain the UV Index",
  "Tomorrow's weather"
];

const AiAssistant: React.FC<AiAssistantProps> = ({ isDark, weatherCondition }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: 'Hello! I am Climatix Bot. Ask me anything about the weather!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Core logic to process a message
  const processMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: text };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const responseText = await chatWithAi(text);
    
    const botMsg: Message = { id: (Date.now() + 1).toString(), sender: 'bot', text: responseText };
    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    processMessage(input);
    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    processMessage(suggestion);
  };

  return (
    <div className="relative flex-1 h-full overflow-hidden animate-fade-in">
      
      {/* Background Animation Layer - Full Screen */}
      <BackgroundEffects isNight={isDark} condition={weatherCondition} />

      {/* Centering Wrapper */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-2 md:p-4">
        
        {/* Compact Container: 95% mobile width, 65% desktop width */}
        <div className="w-[95%] md:w-[65%] h-[95%] md:h-[85%] flex flex-col transition-all duration-300">
          
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2 drop-shadow-sm shrink-0 pl-1">
            <Bot className="text-blue-600 dark:text-blue-400" size={24} aria-hidden="true" />
            AI Weather Assistant
          </h2>
          
          {/* Glassmorphic Chat Container - Compact */}
          <div className="flex-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-[1.5rem] shadow-lg border border-white/40 dark:border-white/10 flex flex-col overflow-hidden transition-colors">
            
            {/* Chat Area - Compact Padding */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide" 
              role="log"
              aria-live="polite" 
              aria-atomic="false"
              aria-label="Chat history"
              tabIndex={0}
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-2 text-sm md:text-base rounded-xl shadow-sm backdrop-blur-md animate-fade-in-up ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none shadow-blue-500/20' 
                      : 'bg-white/80 dark:bg-slate-700/80 text-gray-800 dark:text-gray-200 rounded-bl-none border border-white/40 dark:border-white/5'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                 <div className="flex justify-start" aria-label="Bot is typing">
                   <div className="bg-white/80 dark:bg-slate-700/80 px-4 py-3 rounded-xl rounded-bl-none flex space-x-1 shadow-sm backdrop-blur-md border border-white/40 dark:border-white/5">
                     <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                     <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-75"></div>
                     <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-150"></div>
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Scroll Area - Compact */}
            <div className="px-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide shrink-0 mask-image-linear-to-r">
               {SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isTyping}
                    className="whitespace-nowrap px-3 py-1.5 bg-white/40 dark:bg-slate-700/40 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full border border-white/30 dark:border-white/10 transition-all duration-200 backdrop-blur-md flex items-center gap-1 group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles size={10} className="opacity-50 group-hover:opacity-100 group-hover:text-yellow-300 transition-opacity" />
                    {suggestion}
                  </button>
               ))}
            </div>

            {/* Input Area - Compact */}
            <form onSubmit={handleSend} className="p-3 pt-1 border-t border-white/20 dark:border-white/5 flex items-center gap-2 bg-white/30 dark:bg-slate-900/30">
              <label htmlFor="chat-input" className="sr-only">Type your message</label>
              <input
                id="chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about weather..."
                className="flex-1 bg-white/80 dark:bg-slate-800/80 border border-white/50 dark:border-slate-600/50 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/40 transition-all backdrop-blur-sm"
                disabled={isTyping}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="bg-blue-600 dark:bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 disabled:opacity-50 transition-colors shadow-lg shadow-blue-200/50 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95"
                aria-label="Send message"
              >
                <Send size={18} aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;