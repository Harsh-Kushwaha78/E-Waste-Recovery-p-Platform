// frontend/src/components/DeviceChat.jsx
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getChatHistory, sendChatMessage } from "../lib/chat";

export default function DeviceChat({ deviceId }) {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [configured, setConfigured] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!expanded) return;
    getChatHistory(token, deviceId)
      .then((data) => {
        setMessages(data.messages);
        setConfigured(data.configured);
      })
      .catch(() => {});
  }, [expanded, deviceId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const userText = input;
    setInput("");
    setSending(true);
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: userText, _id: `temp-${Date.now()}` }]);

    try {
      const data = await sendChatMessage(token, deviceId, userText);
      setMessages((prev) => [...prev, data.message]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4 w-full text-left text-sm font-medium text-slate-700 hover:border-blue-300"
      >
        💬 Ask a question about this device
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-slate-800 text-sm">Ask about this device</h3>
        <button onClick={() => setExpanded(false)} className="text-xs text-slate-400 hover:text-slate-600">
          Collapse
        </button>
      </div>

      {!configured && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          The chatbot isn't configured for this deployment (no GENAI_API_KEY
          set). Everything else in the app still works - you can view
          components, tests, and valuations directly.
        </p>
      )}

      {configured && (
        <>
          <div className="max-h-64 overflow-y-auto space-y-2 mb-2 text-sm">
            {messages.length === 0 && (
              <p className="text-slate-400 text-xs">
                Ask things like "What's my SSD worth?" or "Should I recycle
                the battery?" - answers are based only on this device's
                recorded data, never invented prices.
              </p>
            )}
            {messages.map((m) => (
              <div
                key={m._id}
                className={`p-2 rounded-lg ${
                  m.role === "user" ? "bg-blue-50 text-blue-900 ml-6" : "bg-slate-50 text-slate-700 mr-6"
                }`}
              >
                {m.content}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={sending}
              className="flex-1 text-sm rounded-lg border border-slate-300 px-3 py-1.5"
            />
            <button
              type="submit"
              disabled={sending}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium px-3 py-1.5 rounded-lg"
            >
              {sending ? "..." : "Send"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
