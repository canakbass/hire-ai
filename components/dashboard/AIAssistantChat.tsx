'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, Sparkles, Loader2, Minimize2 } from 'lucide-react';
import { sendChatMessage } from '@/lib/actions/chat_actions';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIAssistantChat({ isOpen, onClose }: AIAssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: 'Merhaba! Ben HireAI İK Asistanınız. İşe alım sürecinizle ilgili analizler veya platform kullanımı hakkında bana her şeyi sorabilirsiniz.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Otomatik scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    
    const newMsg: Message = { id: Date.now().toString(), role: 'user', content: userText };
    setMessages(prev => [...prev, newMsg]);
    setIsLoading(true);

    const apiMessages = [
      { role: 'system' as const, content: 'Sen HireAI asistanısın. İşe alım, CV analizleri, mülakat ipuçları konularında uzmansın. Cevapların kısa, profesyonel, yapıcı ve Türkçe olmalı.' },
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: userText }
    ];

    const result = await sendChatMessage(apiMessages);
    
    if (result.error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ ${result.error}`
      }]);
    } else if (result.text) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: result.text
      }]);
    }
    
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-[#0b0f19] border-l border-[#1e293b] shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="h-16 border-b border-[#1e293b] flex items-center justify-between px-4 bg-gradient-to-r from-[#151c2f] to-[#0b0f19]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              HireAI Asistan <Sparkles className="w-3 h-3 text-indigo-400" />
            </h2>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Çevrimiçi
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center ${
              msg.role === 'user' 
                ? 'bg-slate-700 text-white' 
                : 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.3)]'
            }`}>
              {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
              msg.role === 'user' 
                ? 'bg-slate-700 text-white rounded-tr-sm' 
                : 'bg-[#151c2f] border border-[#1e293b] text-slate-200 rounded-tl-sm shadow-md'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.3)]">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="max-w-[80%] rounded-2xl px-4 py-2.5 bg-[#151c2f] border border-[#1e293b] rounded-tl-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span className="text-xs text-slate-400">Düşünüyor...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-[#1e293b] bg-[#0b0f19]">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Asistana bir soru sorun..."
            className="w-full bg-[#151c2f] border border-[#1e293b] text-sm text-white rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-colors"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 flex items-center justify-center text-white disabled:text-slate-500 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-2 text-center">
           <p className="text-[9px] text-slate-500 flex items-center justify-center gap-1">
             HireAI <Sparkles className="w-2 h-2" /> Gemini tarafından desteklenmektedir.
           </p>
        </div>
      </div>

    </div>
  );
}
