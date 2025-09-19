import React, { useState, useEffect } from 'react';
import FloatingGratitudes from './FloatingGratitudes';
import BudgetAndSavings from './BudgetAndSavings';
import CleoStyleCoach from './CleoStyleCoach';
import PrayerWall from "./PrayerWall";

// Helper for localStorage key
function getGratitudeKey() {
  const now = new Date();
  const hours = now.getHours();
  const period = hours < 12 ? 'morning' : 'evening';
  const date = now.toISOString().slice(0, 10);
  return `myka_gratitude_${date}_${period}`;
}

// Magical sparkles SVG background
function SparkleBG() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <defs>
        <radialGradient id="sparkle" cx="50%" cy="50%" r="80%">
          <stop offset="0%" stopColor="#fff7fb" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#f0c3fc" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="20%" cy="30%" r="80" fill="url(#sparkle)" />
      <circle cx="80%" cy="60%" r="60" fill="url(#sparkle)" />
      <circle cx="60%" cy="80%" r="40" fill="url(#sparkle)" />
      <circle cx="40%" cy="20%" r="50" fill="url(#sparkle)" />
    </svg>
  );
}

function GratitudeModal({ onSubmit }) {
  const [gratitude, setGratitude] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!gratitude.trim()) {
      setError("Please enter something you're thankful for!");
      return;
    }
    onSubmit(gratitude);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(6px)' }}>
      <div className="relative bg-gradient-to-br from-purple-800 via-pink-700 to-purple-600 rounded-3xl shadow-2xl p-10 max-w-lg w-full border-4 border-yellow-300 animate-fadeIn" style={{ boxShadow: '0 0 40px 10px #e9aaff88' }}>
        {/* Magical swirl */}
        <div className="absolute -top-8 -left-8">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <path d="M10,40 Q40,10 70,40 Q40,70 10,40" fill="none" stroke="#ffd700" strokeWidth="3" strokeDasharray="6 6" />
            <circle cx="10" cy="40" r="4" fill="#ffd700" />
            <circle cx="70" cy="40" r="2" fill="#fff" />
          </svg>
        </div>
        {/* Gold accent line */}
        <div className="h-1 w-24 bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-300 rounded-full mx-auto mb-4" />
        <h2 className="text-3xl font-extrabold text-white mb-2 flex items-center font-serif tracking-wide drop-shadow-lg" style={{ letterSpacing: '0.04em' }}>
          <span className="mr-2">✨</span>Gratitude Magic
        </h2>
        <p className="text-lg text-yellow-100 italic mb-6 font-cursive" style={{ fontFamily: 'cursive' }}>Before you enter, what's one thing you're thankful for today?</p>
        <form onSubmit={handleSubmit}>
          <input
            className="w-full p-4 rounded-xl border-2 border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 mb-3 text-lg bg-white bg-opacity-80 text-purple-900 font-semibold shadow-inner"
            type="text"
            placeholder="I'm thankful for..."
            value={gratitude}
            onChange={e => { setGratitude(e.target.value); setError(""); }}
            autoFocus
            style={{ fontFamily: 'serif' }}
          />
          {error && <div className="text-pink-200 mb-2 font-bold">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 text-purple-900 font-extrabold text-lg shadow-lg hover:from-pink-400 hover:to-yellow-200 transition-all duration-200 border-2 border-yellow-200 animate-shimmer"
            style={{ boxShadow: '0 0 16px 2px #ffd70088' }}
          >
            Enter ✨
          </button>
        </form>
        <div className="mt-6 text-xs text-yellow-100 text-center font-cursive" style={{ fontFamily: 'cursive' }}>Let gratitude unlock your magic! 🌟</div>
      </div>
    </div>
  );
}

function App() {
  const [showModal, setShowModal] = useState(false);
  const [gratitude, setGratitude] = useState("");
  const [gratitudes, setGratitudes] = useState([]);
  const [page, setPage] = useState('home'); // home | budget | prayers
  const [coachOpen, setCoachOpen] = useState(false);

  useEffect(() => {
    const key = getGratitudeKey();
    const saved = localStorage.getItem(key);
    if (!saved) {
      setShowModal(true);
    } else {
      setGratitude(saved);
      setGratitudes([saved]);
    }
  }, []);

  function handleGratitudeSubmit(entry) {
    const key = getGratitudeKey();
    localStorage.setItem(key, entry);
    setGratitudes(prev => [...prev, entry]);
    setGratitude(entry);
    setShowModal(false);
  }

  return (
    <>
      <FloatingGratitudes gratitudes={gratitudes} />
      <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ fontFamily: 'serif' }}>
        {/* Background */}
        <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #ec4899 60%, #fbbf24 100%)' }}></div>
        <SparkleBG />
        {showModal && <GratitudeModal onSubmit={handleGratitudeSubmit} />}

        {/* NAV BAR */}
        <nav className="relative z-20 bg-white/80 backdrop-blur-md border-b-2 border-pink-300 px-6 py-4 flex justify-center gap-6 shadow-md">
          <button
            onClick={() => setPage('home')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${page === 'home' ? 'bg-pink-300 text-purple-900' : 'text-purple-700 hover:text-pink-700'}`}
          >
            🏠 Home
          </button>
          <button
            onClick={() => setPage('budget')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${page === 'budget' ? 'bg-pink-300 text-purple-900' : 'text-purple-700 hover:text-pink-700'}`}
          >
            💰 Budget
          </button>
          <button
            onClick={() => setPage('prayers')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${page === 'prayers' ? 'bg-pink-300 text-purple-900' : 'text-purple-700 hover:text-pink-700'}`}
          >
            🙏 Prayer Wall
          </button>
          <button
            onClick={() => setCoachOpen(true)}
            className="px-4 py-2 rounded-lg font-bold text-purple-700 hover:text-pink-700 transition-colors"
          >
            💬 Money Buddy
          </button>
        </nav>

        {/* HEADER */}
        <header className="relative z-10 text-center mt-8">
          <h1 className="text-4xl font-extrabold text-white mb-3 drop-shadow-xl tracking-wider font-serif">
            Welcome, Myka! <span className="ml-2">🪄</span>
          </h1>
          {gratitude && (
            <div className="bg-white/80 rounded-xl shadow-xl p-4 inline-block border-2 border-yellow-200 mt-2">
              <span className="text-purple-700 font-bold">Today's gratitude:</span>
              <span className="italic text-pink-700"> {gratitude}</span>
            </div>
          )}
        </header>

        {/* MAIN CONTENT */}
        <main className="relative z-10 mt-6 flex flex-col items-center w-full px-4 flex-grow">
          {page === 'home' && (
            <div className="w-full max-w-5xl">
              {/* Hero Section */}
              <section className="bg-gradient-to-r from-purple-500 via-pink-400 to-yellow-300 text-white rounded-3xl shadow-2xl p-10 mb-10 text-center">
                <h2 className="text-4xl font-extrabold mb-4 drop-shadow-lg">
                  🌟 You Are Loved, Guided & Growing 🌟
                </h2>
                <p className="text-lg max-w-2xl mx-auto font-medium">
                  Every prayer, every dollar saved, and every choice you make is shaping a bright future ✨. 
                  Keep going — you're doing amazing things, even on the small days.
                </p>
              </section>

              {/* Dashboard Preview */}
              <div className="bg-white bg-opacity-90 rounded-3xl shadow-2xl p-10 border-4 border-pink-300 text-center">
                <h3 className="text-2xl font-extrabold text-purple-700 mb-6 flex items-center font-serif justify-center">
                  <span className="mr-2">🦄</span> Explore Your Magical Dashboard
                </h3>
                <ul className="text-pink-700 space-y-3 text-lg font-semibold">
                  <li>✨ Personalized AI Chat Assistant</li>
                  <li>💰 Budget Maker & Savings Goals</li>
                  <li>🙏 Prayer Wall</li>
                  <li>👗 What to Wear Advisor</li>
                  <li>🎯 Goal Tracker</li>
                  <li>🎓 College & Faith on Campus</li>
                  <li>🧠 Mental Health & Self-Care</li>
                  <li>💌 Message from Mom/Dad</li>
                </ul>
              </div>
            </div>
          )}
          {page === 'budget' && <BudgetAndSavings />}
          {page === 'prayers' && <PrayerWall />}
        </main>

        {/* FOOTER */}
        <footer className="relative z-10 mt-16 text-sm text-yellow-100 font-cursive mb-4 text-center">
          Made with <span className="text-yellow-300">★</span> magic for Myka | Harry Potter & Lego sparkle included!
        </footer>

        {/* Animations */}
        <style>{`
          @keyframes shimmer {
            0% { background-position: -400px 0; }
            100% { background-position: 400px 0; }
          }
          .animate-shimmer {
            background-image: linear-gradient(90deg, #ffd700 0%, #fff 50%, #ffd700 100%);
            background-size: 400px 100%;
            animation: shimmer 2s linear infinite;
          }
          .animate-fadeIn {
            animation: fadeIn 0.8s cubic-bezier(.4,0,.2,1);
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>

      {/* COACH MODAL */}
      <CleoStyleCoach open={coachOpen} onClose={() => setCoachOpen(false)} />
    </>
  );
}

export default App;