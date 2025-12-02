import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw, Trash2 } from 'lucide-react';
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
  timestamp: Date;
}

const SUGGESTIONS = [
  "🌧️ Will it rain today?",
  "👕 What should I wear?",
  "📅 7-day forecast",
  "🚶 Is it safe to go outside?",
  "☀️ UV Index info",
  "🌡️ Current temperature"
];

const AiAssistant: React.FC<AiAssistantProps> = ({ isDark, weatherCondition }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      sender: 'bot', 
      text: "Hello! 👋 I'm **Climatix AI**, your personal weather assistant.\n\nI can help you with:\n• Weather forecasts & conditions\n• What to wear recommendations\n• UV index & safety tips\n• Rain predictions\n\nHow can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);


  const formatMessage = (text: string) => {
    return text.split('\n').map((line, i) => {
    
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      if (line.trim().startsWith('•')) {
        return <div key={i} className="ml-2 flex items-start gap-2"><span className="text-blue-500">•</span><span dangerouslySetInnerHTML={{ __html: formatted.replace('•', '') }} /></div>;
      }
      return <div key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  
  const simulateTyping = async (response: string): Promise<void> => {
    return new Promise((resolve) => {
      const typingTime = Math.min(response.length * 15, 2000); // Max 2 seconds
      setTimeout(resolve, typingTime);
    });
  };

  
  const processMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { 
      id: Date.now().toString(), 
      sender: 'user', 
      text: text.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Get AI response
    const responseText = await chatWithAi(text);
    
    // Simulate typing delay for natural feel
    await simulateTyping(responseText);
    
    const botMsg: Message = { 
      id: (Date.now() + 1).toString(), 
      sender: 'bot', 
      text: responseText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
    
    // Focus back on input
    inputRef.current?.focus();
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    processMessage(input);
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Remove emoji from suggestion for cleaner query
    const cleanSuggestion = suggestion.replace(/^[^\w\s]+\s*/, '');
    processMessage(cleanSuggestion);
  };

  const handleClearChat = () => {
    setMessages([
      { 
        id: Date.now().toString(), 
        sender: 'bot', 
        text: "Chat cleared! 🧹 How can I help you with the weather today?",
        timestamp: new Date()
      }
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="relative flex-1 h-full overflow-hidden animate-fade-in">
      
      {/* Background Animation Layer */}
      <BackgroundEffects isNight={isDark} condition={weatherCondition} />

      {/* Main Container */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-2 md:p-4">
        
        {/* Chat Container */}
        <div className="w-[95%] md:w-[70%] lg:w-[60%] h-[95%] md:h-[90%] flex flex-col transition-all duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2 drop-shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Bot className="text-white" size={22} />
              </div>
              <div>
                <span>Climatix AI</span>
                <div className="text-xs font-normal text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Always online
                </div>
              </div>
            </h2>
            
            <button
              onClick={handleClearChat}
              className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
              title="Clear chat"
            >
              <Trash2 size={18} />
            </button>
          </div>
          
          {/* Chat Box */}
          <div className="flex-1 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 dark:border-white/10 flex flex-col overflow-hidden">
            
            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-hide" 
              role="log"
              aria-live="polite"
            >
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in-up`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-md ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                      : 'bg-gradient-to-br from-purple-500 to-pink-500'
                  }`}>
                    {msg.sender === 'user' ? (
                      <User size={16} className="text-white" />
                    ) : (
                      <Bot size={16} className="text-white" />
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md' 
                        : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-bl-md border border-gray-100 dark:border-slate-700'
                    }`}>
                      <div className="text-sm md:text-base leading-relaxed">
                        {formatMessage(msg.text)}
                      </div>
                    </div>
                    <div className={`text-xs text-gray-400 mt-1 px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-md">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-xs text-gray-400 ml-2">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-4 py-2 border-t border-gray-100 dark:border-slate-700/50 bg-gray-50/50 dark:bg-slate-800/30">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isTyping}
                    className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full border border-gray-200 dark:border-slate-600 transition-all duration-200 flex items-center gap-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything about weather..."
                    className="w-full bg-gray-100 dark:bg-slate-700 border-0 rounded-xl px-4 py-3 pr-12 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    disabled={isTyping}
                  />
                  {input.length > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      {input.length}/500
                    </span>
                  )}
                </div>
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95 flex items-center justify-center"
                  aria-label="Send message"
                >
                  {isTyping ? (
                    <RefreshCw size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                Climatix AI • Your personal weather assistant
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
