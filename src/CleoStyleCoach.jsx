import React from 'react';

const ATTITUDE = [
  "Okay, money wizard. Let’s see what chaos you’ve brewed. 🧙‍♀️",
  "I come with receipts and vibes. Let’s talk coins. 💅",
  "I’m not judging… I’m just narrating your wallet’s journey. Loudly.",
];

function useLocalStore(key, initial) {
  const [val, setVal] = React.useState(() => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : initial; } catch { return initial; }
  });
  React.useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]);
  return [val, setVal];
}

function currency(n) {
  const num = Number(n) || 0;
  return num.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function computeInsights({ income, items = [], goals = [] }) {
  const totalPlanned = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
  const remaining = (Number(income) || 0) - totalPlanned;

  const catSorted = [...items].sort((a, b) => (b.amount || 0) - (a.amount || 0));
  const top = catSorted[0];
  const second = catSorted[1];

  const lines = [];

  if (!income && items.length === 0 && goals.length === 0) {
    lines.push("Blank slate energy. Add income and a couple categories and I’ll bring the spice.");
  } else {
    if (income) lines.push(`You set income at ${currency(income)}. Bold. Let’s make it behave.`);
    if (items.length) {
      lines.push(`You planned ${currency(totalPlanned)} across ${items.length} categories. ${remaining >= 0 ? `Leftover: ${currency(remaining)} (don’t spend it all on boba).` : `You’re over by ${currency(Math.abs(remaining))}. We need a tiny trim.`}`);
      if (top) lines.push(`Top category: ${top.name} at ${currency(top.amount)} ${second ? `— next is ${second.name} at ${currency(second.amount)}.` : ''}`);
      const heavy = items.filter(it => Number(it.amount) > (income ? income * 0.15 : 200));
      if (heavy.length >= 2) lines.push(`These are looking thicc: ${heavy.slice(0, 3).map(h => h.name).join(', ')}. Want a mini-cap next week?`);
    }
    for (const g of goals) {
      const pct = g.target ? Math.round(((Number(g.saved) || 0) / g.target) * 100) : 0;
      if (pct >= 100) lines.push(`Goal “${g.title}”: 100% — flex achieved. 🎉`);
      else if (pct >= 60) lines.push(`Goal “${g.title}”: ${pct}% — we’re in the home stretch. Toss ${currency(Math.max(10, Math.round((g.target - (g.saved || 0)) / 4)))} this week?`);
      else lines.push(`Goal “${g.title}”: ${pct}% — slow and shiny. Try +$15 every Friday?`);
    }
  }

  if (lines.length === 0) lines.push("Shockingly quiet in here. Add a goal or category and I’ll spill the tea.");
  return lines;
}

export default function CleoStyleCoach({ open, onClose }) {
  // Pull from the same keys your app already uses
  const [income] = useLocalStore('myka_income', 0);
  const [items] = useLocalStore('myka_budget_items', []);       // from BudgetAndSavings
  const [goals] = useLocalStore('myka_savings_goals', []);      // from BudgetAndSavings

  const [messages, setMessages] = useLocalStore('myka_cleo_chat', [
    { role: 'coach', content: ATTITUDE[0] }
  ]);
  const [input, setInput] = React.useState('');

  if (!open) return null;

  function roastAndRespond(userText) {
    const t = userText.toLowerCase();
    const insights = computeInsights({ income, items, goals });

    if (t.includes('roast') || t.includes('honest') || t.includes('truth')) {
      return [
        "You asked for honesty, not mercy. Here we go:",
        ...insights.slice(0, 3),
        "Tiny fix: cap your top category by 10% for the next 7 days. Deal?"
      ].join('\n• ');
    }

    if (t.includes('budget') || t.includes('spend') || t.includes('leftover')) {
      return [
        "Budget vibes:",
        ...insights.slice(0, 2),
        remainingTip(income, items)
      ].join('\n• ');
    }

    if (t.includes('goal') || t.includes('save')) {
      const goalLine = insights.find(s => s.includes('Goal')) || "Add a savings goal and I’ll give you a mini game plan.";
      return `Savings check: ${goalLine}\n• Micro-challenge: move $15 today and rename it “Future Me Tax.”`;
    }

    if (t.includes('challenge') || t.includes('cap') || t.includes('streak')) {
      return "Challenge menu: 3‑day “Home Drinks Only”, 5‑day “$0 impulse buys”, or 7‑day “$5 to goals daily”. Pick one and I’ll track it.";
    }

    // Default: one-liner with attitude
    const spicy = ATTITUDE[Math.floor(Math.random() * ATTITUDE.length)];
    return `${spicy}\n• ${insights[0]}`;
  }

  function remainingTip(income, items) {
    const total = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
    const left = (Number(income) || 0) - total;
    if (!income) return "Add monthly income so I can calculate what’s left to play with.";
    if (left < 0) return `You’re over ${currency(Math.abs(left))}. Trim the top category by 10% — painless, promise.`;
    if (left === 0) return "Balanced perfectly. Smells like discipline. Also smells like no boba.";
    return `Leftover ${currency(left)}. Split it 70/30: goals vs treats. Future-you says thanks.`;
  }

  function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setTimeout(() => {
      const a = roastAndRespond(text);
      setMessages(prev => [...prev, { role: 'coach', content: a }]);
    }, 240);
  }

  function clearChat() {
    setMessages([{ role: 'coach', content: ATTITUDE[1] }]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backdropFilter: 'blur(6px)' }}>
      <div className="relative w-full max-w-2xl mx-4 rounded-3xl border-4 border-pink-300 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(135deg,#6d28d9,#ec4899 60%,#fbbf24)' }} />
        <div className="bg-white/90">
          <div className="flex items-center justify-between px-5 py-3 border-b border-pink-200">
            <h3 className="text-xl font-extrabold text-purple-700">Money Buddy (Cleo‑ish) 💬</h3>
            <div className="flex gap-2">
              <button onClick={clearChat} className="px-3 py-1 text-sm rounded-lg bg-pink-100 text-pink-700 hover:bg-pink-200">Clear</button>
              <button onClick={onClose} className="px-3 py-1 text-sm rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Close</button>
            </div>
          </div>

          <div className="h-96 overflow-y-auto px-5 py-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={`whitespace-pre-wrap inline-block px-4 py-2 rounded-2xl shadow
                  ${m.role === 'user' ? 'bg-pink-600 text-white' : 'bg-purple-50 text-purple-800 border border-purple-200'}`}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={send} className="flex gap-2 p-4 border-t border-pink-200">
            <input
              className="flex-1 px-4 py-3 rounded-xl border-2 border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder='Try: "Roast my budget", "What’s my leftover?", or "Give me a challenge"'
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button className="px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 text-purple-900 font-bold border-2 border-yellow-200 hover:from-pink-400 hover:to-yellow-200">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}