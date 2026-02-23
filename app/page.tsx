"use client";
import { useRef, useState } from "react";

type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(false);

  // Keep an always-up-to-date copy of messages to avoid stale state in fetch body
  const messagesRef = useRef<ChatMsg[]>([]);
  messagesRef.current = messages;

  async function send(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: ChatMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    // Create an assistant placeholder for streaming
    const assistantId = crypto.randomUUID();
    const assistantMsg: ChatMsg = {
      id: assistantId,
      role: "assistant",
      content: "",
    };

    // Update UI immediately
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setLoading(true);
    setInput("");

    try {
      const bodyMessages = [...messagesRef.current, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: bodyMessages }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || `Request failed (${res.status})`);
      }

      if (!res.body) {
        throw new Error("No response body (stream missing).");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        content += decoder.decode(value, { stream: true });

        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content } : m))
        );
      }
    } catch (e) {
      console.error(e);
      // Show error in the assistant bubble so you see it in the UI
      const msg = e instanceof Error ? e.message : "Unknown error";
      setMessages((prev) =>
        prev.map((m) =>
          m.role === "assistant" && m.content === ""
            ? { ...m, content: `Error: ${msg}` }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="bg-blue-600 p-4 text-white font-bold text-xl shadow">
        🩺 MPS Dental Assistant
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-3 rounded-2xl max-w-[80%] ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border shadow-sm text-black"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </main>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="p-4 bg-white border-t flex gap-2"
      >
        <input
          className="flex-1 border p-3 rounded-xl text-black outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold disabled:opacity-60"
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}