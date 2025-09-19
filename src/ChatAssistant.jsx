import React from 'react';

const SYS_PROMPT = `You are Myka’s AI Buddy. Speak warmly and simply. Tone: kind, encouraging, and grounded in Christian faith when relevant. 
Myka likes Harry Potter, Legos, and Christian music—feel free to use gentle, magical metaphors and playful references.
Be practical and supportive. If advice involves health, suggest talking to a trusted adult or professional. Avoid heavy jargon.`;

function useLocalStorage(key, initialValue) {
  const [value, setValue] = React.useState(() => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : initialValue;
    } catch {
      return initialValue;
    }
  });
  React.useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}

export default function ChatAssistant({ open, onClose, seedContext }) {
  const [messages, setMessages] = useLocalStorage('myka_chat_messages', [
    { role: 'system', content: SYS_PROMPT },
    ...(seedContext ? [{ role: 'user', content: `Context: ${seedContext}` }] : []),
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function sendMessage(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages.filter(m => m.role !== 'system'), { role: 'user', content: text }];
    setMessages([{ role: 'system', content: SYS_PROMPT }, ...next]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'system', content: SYS_PROMPT }, ...next] }),
      });
      if (!res.ok) throw new Error('Chat request failed');
      const data = await res.json();
      const assistantMsg = data?.message ?? 'Sorry, I had trouble responding.';
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMsg }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Hmm, I ran into a hiccup. Try again in a moment?' }]);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([{ role: 'system', content: SYS_PROMPT }]);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backdropFilter: 'blur(6px)' }}>
      <div className="relative w-full max-w-2xl mx-4 rounded-3xl border-4 border-pink-300 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(135deg,#6d28d9,#ec4899 60%,#fbbf24)' }} />
        <div className="bg-white/90">
          <div className="flex items-center justify-between px-5 py-3 border-b border-pink-200">
            <h3 className="text-xl font-extrabold text-purple-700">Myka’s AI Buddy ✨</h3>
            <div className="flex gap-2">
              <button onClick={clearChat} className="px-3 py-1 text-sm rounded-lg bg-pink-100 text-pink-700 hover:bg-pink-200">Clear</button>
              <button onClick={onClose} className="px-3 py-1 text-sm rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Close</button>
            </div>
          </div>

          <div ref={scrollRef} className="h-96 overflow-y-auto px-5 py-4 space-y-3">
            {messages.filter(m => m.role !== 'system').map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={`inline-block px-4 py-2 rounded-2xl shadow
                  ${m.role === 'user' ? 'bg-pink-600 text-white' : 'bg-purple-50 text-purple-800 border border-purple-200'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-left text-purple-600 italic">typing…</div>}
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 p-4 border-t border-pink-200">
            <input
              className="flex-1 px-4 py-3 rounded-xl border-2 border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="Ask anything... (e.g., Help me plan my week?)"
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 text-purple-900 font-bold border-2 border-yellow-200 hover:from-pink-400 hover:to-yellow-200 disabled:opacity-60"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}