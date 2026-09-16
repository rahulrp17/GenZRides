import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { aiAPI } from "../../services/endpoints";

const SUGGESTED_PROMPTS = [
  "What vehicles are available?",
  "Fare from Madurai to Chennai",
  "Distance from Chennai to Bangalore",
  "How do I book a ride?",
];

function formatReply(text) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, i) => {
    let formatted = line
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="text-gray-300">$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-green-400 text-xs">$1</code>');

    if (line.startsWith("• ") || line.startsWith("- ")) {
      formatted = formatted.replace(/^[•-]\s/, "");
      return (
        <div key={i} className="flex gap-2 ml-1">
          <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
        </div>
      );
    }
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return <div key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
  });
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setMessages([]);
    setError(null);
    setInput("");
  }, []);

  const sendMessage = useCallback(async (text) => {
    const msg = text.trim();
    if (!msg || loading) return;

    setError(null);
    // Snapshot history BEFORE appending (last 6 turns for follow-up context).
    let history = [];
    setMessages((prev) => {
      history = prev.slice(-6).map((m) => ({ role: m.role, content: m.content }));
      return [...prev, { role: "user", content: msg }];
    });
    setInput("");
    setLoading(true);

    try {
      const { data } = await aiAPI.chat(msg, history);
      if (data.success) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.data.reply }]);
      } else {
        setError(data.message || "Failed to get response");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleRetry = () => {
    if (messages.length > 0) {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
      if (lastUserMsg) {
        setError(null);
        sendMessage(lastUserMsg.content);
      }
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Motion.button
        onClick={() => {
          if (isOpen) {
            handleClose();
          } else {
            setIsOpen(true);
          }
        }}
        className="fixed bottom-[4.5rem] right-2 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-shadow"
        style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.9), rgba(59,130,246,0.9))",
          boxShadow: "0 0 30px rgba(16,185,129,0.4), 0 0 60px rgba(59,130,246,0.2)",
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1, boxShadow: "0 0 40px rgba(16,185,129,0.6), 0 0 80px rgba(59,130,246,0.3)" }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <Motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={24} className="text-white" />
            </Motion.div>
          ) : (
            <Motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Bot size={24} className="text-white" />
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring when closed */}
        {!isOpen && (
          <Motion.span
            className="absolute inset-0 rounded-full border-2 border-green-400/50"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </Motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <Motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />

            {/* Panel */}
            <Motion.div
              className="fixed z-50 flex flex-col
                inset-x-0 bottom-0 top-16
                md:inset-auto md:bottom-[5.5rem] md:right-2 md:w-[400px] md:h-[600px] md:max-h-[80vh]
                md:rounded-[24px] overflow-hidden"
              style={{
                background: "linear-gradient(180deg, rgba(15,23,42,0.97) 0%, rgba(0,0,0,0.98) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(16,185,129,0.1)",
              }}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5"
                style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.1))" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(59,130,246,0.3))" }}>
                  <Sparkles size={18} className="text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white tracking-tight">GenZRides Assistant</h3>
                  <p className="text-[10px] text-gray-400">AI-powered ride helper</p>
                </div>
                <button               onClick={handleClose} className="p-1.5 hover:bg-white/10 rounded-lg transition md:hidden">
                  <X size={18} className="text-gray-400" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.length === 0 && !loading && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(59,130,246,0.2))" }}>
                      <Bot size={32} className="text-green-400" />
                    </div>
                    <h4 className="text-white font-semibold mb-1">How can I help you?</h4>
                    <p className="text-gray-400 text-xs mb-5">Ask about fares, routes, vehicles, or bookings</p>
                    <div className="w-full space-y-2">
                      {SUGGESTED_PROMPTS.map((p) => (
                        <button
                          key={p}
                          onClick={() => sendMessage(p)}
                          className="w-full text-left px-3 py-2.5 rounded-xl text-sm
                            bg-white/5 border border-white/5 text-gray-300
                            hover:bg-white/10 hover:border-green-500/30 hover:text-white
                            transition-all duration-200"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
                      ${msg.role === "user"
                        ? "bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-br-md"
                        : "bg-white/5 border border-white/5 text-gray-200 rounded-bl-md"
                      }`}>
                      {msg.role === "assistant" ? (
                        <div className="space-y-0.5">{formatReply(msg.content)}</div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                      <Loader2 size={16} className="text-green-400 animate-spin" />
                      <span className="text-xs text-gray-400">Thinking...</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex justify-start">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl rounded-bl-md px-3.5 py-2.5 max-w-[85%]">
                      <p className="text-sm text-red-400 mb-2">{error}</p>
                      <button onClick={handleRetry} className="flex items-center gap-1.5 text-xs text-red-300 hover:text-red-200 transition">
                        <RefreshCw size={12} /> Retry
                      </button>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested prompts (when messages exist but few) */}
              {messages.length > 0 && messages.length <= 2 && !loading && (
                <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                  {SUGGESTED_PROMPTS.slice(0, 3).map((p) => (
                    <button
                      key={p}
                      onClick={() => sendMessage(p)}
                      className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px]
                        bg-white/5 border border-white/5 text-gray-400
                        hover:bg-white/10 hover:text-white transition-all whitespace-nowrap"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSubmit} className="px-3 pb-3 pt-1">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-1.5
                  focus-within:border-green-500/30 transition-colors">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    disabled={loading}
                    className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none py-1.5"
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="p-2 rounded-xl transition-all
                      bg-gradient-to-r from-green-500 to-emerald-600
                      hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]
                      disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {loading ? (
                      <Loader2 size={16} className="text-white animate-spin" />
                    ) : (
                      <Send size={16} className="text-white" />
                    )}
                  </button>
                </div>
              </form>
            </Motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
