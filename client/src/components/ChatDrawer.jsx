import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, User } from 'lucide-react';

export default function ChatDrawer({
  messages,
  onSendMessage,
  myUser,
  onClose,
  activeTypers
}) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="w-full md:w-80 bg-slate-950 border-l border-slate-800 flex flex-col h-full z-10">
      {/* Header */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-200">Room Chat</span>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-full">
            {messages.length}
          </span>
        </div>

        <button
          onClick={onClose}
          title="Close Chat"
          className="p-1 hover:text-rose-400 text-slate-400 rounded transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 space-y-2">
            <MessageSquare className="w-8 h-8 opacity-40 text-slate-400" />
            <p className="text-xs">No messages yet.<br />Say hello to your room collaborators!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.username === myUser?.username;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-1.5 mb-1 text-[11px]">
                  <span
                    style={{ color: msg.color || '#818cf8' }}
                    className="font-semibold"
                  >
                    {isMe ? 'You' : msg.username}
                  </span>
                  <span className="text-slate-500 text-[10px]">{msg.time}</span>
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {activeTypers && activeTypers.length > 0 && (
        <div className="px-3 py-1 text-[11px] text-slate-400 italic bg-slate-900/40">
          {activeTypers.join(', ')} typing...
        </div>
      )}

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900/70">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl transition"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
