"use client";

import { useState, useRef, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://viviancao-bluerosemart-api.hf.space";

type Message = {
  role: "user" | "assistant";
  content: string;
  agent?: string;
};

const AGENT_LABELS: Record<string, string> = {
  policy: "Policy Agent",
  product: "Product Agent",
  tech: "Tech Agent",
  general: "General Agent",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your BlueRoseMart AI assistant. Ask me about pianos, policies, or how to use the platform." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.answer, agent: data.agent }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I could not reach the AI service. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 bg-brand-500 hover:bg-brand-400 text-white rounded-2xl px-4 py-2 flex items-center gap-3 shadow-lg transition"
        aria-label="Open chat"
      >
        <span className="text-2xl">{open ? "✕" : "🎹"}</span>
        {!open && (
          <div className="text-left">
            <p className="font-bold text-sm leading-tight">BlueRoseMart AI</p>
            <p className="text-brand-100 text-xs leading-tight">Policy · Product · Tech · General</p>
          </div>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-brand-500 px-4 py-3 flex items-center gap-2">
            <span className="text-xl">🎹</span>
            <div>
              <p className="text-white font-bold text-sm">BlueRoseMart AI</p>
              <p className="text-brand-100 text-xs">Policy · Product · Tech · General</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-brand-500 text-white"
                    : "bg-gray-800 text-gray-200"
                }`}>
                  {msg.agent && (
                    <p className="text-xs text-brand-400 mb-1">{AGENT_LABELS[msg.agent] ?? msg.agent}</p>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-xl px-3 py-2 text-sm text-gray-400 animate-pulse">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-700 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about pianos, policies…"
              className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white rounded-lg px-3 py-2 text-sm font-semibold transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
