import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hi! I am your AI Nutritionist. How can I help you meet your goals today?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('https://nutri-track-xirg.onrender.com/api/chat', { message: input });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting to the network right now.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="w-full mt-12 mb-8">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full glass-button-primary py-4 uppercase tracking-widest text-xs font-bold flex justify-center items-center gap-2"
        >
          <span>Ask AI Nutritionist</span>
          <span>💬</span>
        </button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          className="border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden bg-transparent shadow-sm flex flex-col h-[400px]"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-800 glass">
            <h3 className="font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              AI Nutritionist
            </h3>
            <button 
              onClick={() => {
                setIsOpen(false);
                setMessages([{ role: 'assistant', content: 'Hi! I am your AI Nutritionist. How can I help you meet your goals today?' }]);
              }} 
              className="text-secondary hover:text-red-500 transition px-2 font-bold select-none"
            >
              ✕
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] text-sm rounded-md p-3 ${msg.role === 'user' ? 'bg-black text-white dark:bg-transparent dark:text-black rounded-tr-none' : 'bg-zinc-100 dark:bg-zinc-800 rounded-tl-none border border-zinc-200 dark:border-zinc-700'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-100 dark:bg-zinc-800 text-sm rounded-md p-3 rounded-tl-none text-secondary">
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="border-t border-zinc-200 dark:border-zinc-800 p-2 flex glass">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about calories, diets, recipes..." 
              className="flex-1 bg-transparent p-2 text-sm outline-none"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} className="px-4 py-2 font-bold uppercase tracking-widest text-[10px] bg-black text-white dark:bg-transparent dark:text-black transition-opacity disabled:opacity-50">
              Send
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}

export default ChatBot;

