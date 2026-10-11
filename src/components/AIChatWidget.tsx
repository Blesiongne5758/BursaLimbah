/**
 * BursaLimbah.com - AI Chat Widget
 * Floating chat widget with AI assistant
 */

import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { AIAgentService } from '../services';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Zap } from 'lucide-react';

export default function AIChatWidget() {
  const { chatOpen, toggleChat, chatMessages, addMessage } = useStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: `msg_${Date.now()}`,
      senderId: 'user',
      senderName: 'Anda',
      content: input,
      isAI: false,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);
    setInput('');
    setIsTyping(true);

    const allMessages = [...chatMessages, userMsg].map((m) => ({
      role: m.isAI ? ('assistant' as const) : ('user' as const),
      content: m.content,
    }));
    const response = await AIAgentService.chat(allMessages);

    const aiMsg = {
      id: `msg_${Date.now()}_ai`,
      senderId: 'ai',
      senderName: 'Asisten BursaLimbah',
      content: response.content,
      isAI: true,
      timestamp: new Date().toISOString(),
      toolCalls: response.toolCalls,
    };
    addMessage(aiMsg);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[380px] max-w-[calc(100vw-2rem)] h-[520px] bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Asisten AI</p>
                  <p className="text-xs text-emerald-200">GPT-4o • Online</p>
                </div>
              </div>
              <button onClick={toggleChat} className="p-1 hover:bg-white/20 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.isAI ? 'bg-slate-100 text-slate-800 rounded-bl-md' : 'bg-emerald-600 text-white rounded-br-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    {msg.toolCalls && (
                      <div className="mt-2 pt-2 border-t border-slate-200/50">
                        <p className="text-[10px] opacity-60 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> {msg.toolCalls.map((tc) => tc.name).join(', ')}()
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 150, 300].map((d) => (
                        <div
                          key={d}
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${d}ms` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Tanya tentang limbah, harga, regulasi..."
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 text-center">AI bisa salah. Verifikasi info penting.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          chatOpen ? 'bg-slate-700 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'
        }`}
      >
        {chatOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </motion.button>
    </div>
  );
}
