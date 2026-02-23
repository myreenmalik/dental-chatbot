"use client";

import { useState } from "react";

export default function Home() {
  const [localInput, setLocalInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Manual fetch function to bypass the "append is not a function" error
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // 1. Add user message to the UI
    const userMsg = { id: Date.now().toString(), role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setLocalInput("");

    try {
      // 2. Direct POST request to your route.ts
      const response = await fetch('api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!response.ok) throw new Error("Failed to connect to API");

      // 3. Manual Stream Decoding
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      // Add a placeholder for the assistant
      setMessages(prev => [...prev, { id: 'temp', role: 'assistant', content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        assistantContent += decoder.decode(value, { stream: true });
        
        // Update the placeholder with real-time text
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = assistantContent;
          return newMessages;
        });
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { id: 'error', role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(localInput);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <header className="bg-blue-600 p-4 text-white shadow-md">
        <h1 className="text-xl font-bold flex items-center gap-2">🩺 MPS Dental Assistant</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center pt-20">
            <h2 className="text-slate-600 mb-6 text-lg">How can we help you today?</h2>
            <button 
              type="button"
              onClick={() => sendMessage("What are your hours?")}
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-full font-semibold hover:bg-blue-600 hover:text-white transition-all mx-auto"
            >
              🕒 Check Hours
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-800'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-xs text-slate-400 animate-pulse italic">Assistant is thinking...</div>
            )}
          </div>
        )}
      </main>

      <footer className="p-4 bg-white border-t">
        <form onSubmit={onFormSubmit} className="max-w-2xl mx-auto flex gap-2">
          <input 
            className="flex-1 border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900"
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            placeholder="Type your question..."
          />
          <button 
            type="submit" 
            disabled={isLoading || !localInput.trim()}
            className="bg-blue-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}