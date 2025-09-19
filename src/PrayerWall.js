import React from 'react';

function useLocalStore(key, initial) {
  const [val, setVal] = React.useState(() => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : initial;
    } catch {
      return initial;
    }
  });
  React.useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  }, [key, val]);
  return [val, setVal];
}

export default function PrayerWall() {
  const [prayers, setPrayers] = useLocalStore("myka_prayers", []);
  const [text, setText] = React.useState("");

  // Add new prayer
  function addPrayer(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const newPrayer = {
      id: crypto.randomUUID(),
      text: text.trim(),
      date: new Date().toLocaleDateString(),
      prayedCount: 0,
      answered: false,
    };
    setPrayers(prev => [...prev, newPrayer]);
    setText("");
  }

  // Increment prayed count
  function prayFor(id) {
    setPrayers(prev =>
      prev.map(p =>
        p.id === id ? { ...p, prayedCount: p.prayedCount + 1 } : p
      )
    );
  }

  // Mark as answered
  function markAnswered(id) {
    setPrayers(prev =>
      prev.map(p =>
        p.id === id ? { ...p, answered: !p.answered } : p
      )
    );
  }

  // Delete prayer
  function deletePrayer(id) {
    setPrayers(prev => prev.filter(p => p.id !== id));
  }

  // Separate into answered/unanswered
  const unanswered = prayers.filter(p => !p.answered);
  const answered = prayers.filter(p => p.answered);

  return (
    <div className="prayer-wall p-8 space-y-10">
      
      {/* Center prayer input */}
      <div className="flex justify-center mb-8">
        <form onSubmit={addPrayer} className="w-full max-w-md text-center">
          <textarea
            className="w-full p-3 rounded-xl border-2 border-purple-300 mb-3 resize-none"
            placeholder="Type your prayer request..."
            rows="3"
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <button className="px-6 py-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-xl font-bold">
            Post Prayer
          </button>
        </form>
      </div>

      {/* Unanswered Prayers Grid */}
      <section>
        <h3 className="text-xl font-bold text-pink-700 mb-4">🌸 Prayer Wall</h3>
        {unanswered.length === 0 ? (
          <div className="text-gray-500 italic">No active prayer requests</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {unanswered.map(p => (
              <div
                key={p.id}
                className="prayer-card p-4 rounded-2xl border-2 shadow bg-white border-pink-200"
              >
                <p className="text-purple-900 font-medium">{p.text}</p>
                <small className="block text-sm text-gray-500 mb-2">{p.date}</small>

                <div className="flex gap-2">
                  <button
                    onClick={() => prayFor(p.id)}
                    className="px-3 py-1 text-sm rounded-lg bg-pink-100 text-pink-700 hover:bg-pink-200"
                  >
                    🙏 I Prayed ({p.prayedCount})
                  </button>
                  <button
                    onClick={() => markAnswered(p.id)}
                    className="px-3 py-1 text-sm rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  >
                    ✨ Answered
                  </button>
                  <button
                    onClick={() => deletePrayer(p.id)}
                    className="px-3 py-1 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200 ml-auto"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Answered Prayers Section */}
      <section>
        <h3 className="text-xl font-bold text-green-700 mb-4">✨ Answered Prayers</h3>
        {answered.length === 0 ? (
          <div className="text-gray-500 italic">No answered prayers yet…</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {answered.map(p => (
              <div
                key={p.id}
                className="prayer-card p-4 rounded-2xl border-2 shadow bg-green-50 border-green-400"
              >
                <p className="text-green-800 font-semibold">{p.text}</p>
                <small className="block text-sm text-green-600 mb-2">{p.date}</small>

                <div className="flex gap-2">
                  <button
                    onClick={() => markAnswered(p.id)}
                    className="px-3 py-1 text-sm rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  >
                    ↩️ Move Back
                  </button>
                  <button
                    onClick={() => deletePrayer(p.id)}
                    className="px-3 py-1 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200 ml-auto"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}