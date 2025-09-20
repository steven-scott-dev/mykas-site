import React, { useState, useEffect, useRef } from 'react';
import FloatingGratitudes from './FloatingGratitudes';
import BudgetAndSavings from './BudgetAndSavings';
import CleoStyleCoach from './CleoStyleCoach';
import PrayerWall from './PrayerWall';
import WhatToWear from './WhatToWear';

// -------------- CONSTANTS (Global 24h Gratitude Gate) --------------
const LAST_AT_KEY = 'myka_gratitude_last_at';
const TEXT_KEY = 'myka_gratitude_text';
const HISTORY_KEY = 'myka_gratitude_history';
const DAY_MS = 24 * 60 * 60 * 1000;

// ---------- CLEAN SHARP THEME ----------
const theme = {
  // Warm ivory canvas
  appBg: 'bg-[#FFF8ED]',
  bodyText: 'text-[#0B0B0C]',
  subtleText: 'text-[#4B5563]',
  hairline: 'border-[#E5E7EB]',

  // Nav: crisp white, hairline, sharp
  nav: 'bg-white border border-[#E5E7EB] shadow-sm',
  navText: 'text-[#0B0B0C]',
  navHover: 'hover:text-[#1A1A1A]',
  navActive: 'text-[#0B0B0C] border-b-2 border-[#129C94]',

  // Headings
  header: 'text-4xl md:text-5xl font-extrabold tracking-tight text-[#0B0B0C]',
  sub: 'text-base md:text-lg text-[#4B5563] italic',

  // Cards: crisp white, thin border, subtle shadow
  card: 'bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6 md:p-8 text-[#0B0B0C]',

  // Buttons: teal primary, outline secondary
  primaryBtn: 'bg-[#129C94] hover:bg-[#0F8A83] text-white font-semibold',
  secondaryBtn: 'bg-transparent hover:bg-[#F3F4F6] text-[#0B0B0C] border border-[#D1D5DB]',
};

// ---------- GRATITUDE MODAL ----------
function GratitudeModal({ onSubmit }) {
  const [gratitude, setGratitude] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const val = gratitude.trim();
    if (!val) {
      setError("Please enter something you're thankful for!");
      return;
    }
    onSubmit(val);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative max-w-lg w-[92%] rounded-lg border border-[#E5E7EB] p-8 bg-white shadow-lg">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0B0B0C] text-center">
          One quick gratitude
        </h2>
        <p className="mt-2 text-center text-[#4B5563]">What’s one thing you’re thankful for right now?</p>
        <form onSubmit={handleSubmit} className="mt-6">
          <input
            className="w-full p-4 rounded-md border border-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#129C94] bg-white text-[#0B0B0C]"
            type="text"
            placeholder="I’m thankful for..."
            value={gratitude}
            onChange={(e) => { setGratitude(e.target.value); setError(''); }}
            autoFocus
          />
          {error && <div className="mt-2 text-sm text-[#D4455A] font-medium">{error}</div>}
          <div className="mt-5 flex items-center gap-3">
            <button type="submit" className={`px-5 py-3 rounded-md ${theme.primaryBtn} transition-colors`}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- GRATITUDE SCROLLER ----------
function GratitudeScroller({ entries }) {
  if (!entries || entries.length === 0) return null;

  const chip = 'bg-white text-[#0B0B0C] border border-[#E5E7EB]';

  const loop = [...entries, ...entries, ...entries].slice(0, Math.max(10, entries.length * 2));

  return (
    <div className="relative mt-6">
      <div className="overflow-hidden rounded-md border border-[#E5E7EB] bg-white">
        <div className="flex gap-3 whitespace-nowrap animate-marquee will-change-transform py-3 px-3">
          {loop.map((item, idx) => (
            <span
              key={`${item.ts}-${idx}`}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md ${chip} text-sm`}
              title={new Date(item.ts).toLocaleString()}
            >
              <span className="text-[#129C94]">•</span>
              <span className="italic">{item.text}</span>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 28s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
      `}</style>
    </div>
  );
}

// ---------- PAGE HERO ----------
function PageHero({ page, gratitude }) {
  const bgByPage = {
    home: '/hero-home.jpg',
    budget: '/hero-budget.jpg',
    prayers: '/hero-prayers.jpg',
    outfits: '/hero-outfits.jpg',
  };

  const titles = {
    home: 'A great day starts with clarity',
    budget: 'Own your money story',
    prayers: 'Write it down, lift it up',
    outfits: 'Dress with confidence and joy',
  };
  const subtitles = {
    home: 'Simple choices. Calm focus. Steady progress.',
    budget: 'Plan, save, and celebrate every small win.',
    prayers: 'Share what’s on your heart and pray for others.',
    outfits: 'Quick outfit ideas based on weather, vibe, and events.',
  };
  const ctas = {
    home: [
      { label: 'See Gratitudes', href: '#gratitudes', primary: true },
      { label: 'Add a Prayer', href: '#write-prayer', primary: false },
    ],
    budget: [
      { label: 'Add Expense', href: '#add-expense', primary: true },
      { label: 'Set a Goal', href: '#set-goal', primary: false },
    ],
    prayers: [
      { label: 'Write a Prayer', href: '#write-prayer', primary: true },
      { label: 'View Prayer Wall', href: '#prayer-wall', primary: false },
    ],
    outfits: [
      { label: "Today's Fit", href: '#todays-fit', primary: true },
      { label: 'Plan Week', href: '#plan-week', primary: false },
    ],
  };

  const bg = bgByPage[page];

  return (
    <section
      className="relative w-full h-[50vh] md:h-[58vh] lg:h-[66vh] overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Minimal vignette to ensure legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <div className="max-w-4xl w-full text-center">
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
            {titles[page]}
          </h1>
          <p className="mt-4 text-white/95 text-lg md:text-xl max-w-3xl mx-auto">
            {subtitles[page]}
          </p>

          {page === 'home' && gratitude ? (
            <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-md bg-white/90 text-[#0B0B0C] border border-[#E5E7EB]">
              <span className="text-sm font-semibold">Today’s gratitude:</span>
              <span className="italic text-sm">{gratitude}</span>
            </div>
          ) : null}

          <div className="mt-8 flex items-center justify-center gap-3">
            {ctas[page].map((c) => (
              <a
                key={c.href}
                href={c.href}
                className={`px-5 py-3 rounded-md font-semibold ${c.primary ? theme.primaryBtn : theme.secondaryBtn}`}
              >
                {c.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- APP ----------
function App() {
  const [showModal, setShowModal] = useState(false);
  const [gratitude, setGratitude] = useState(localStorage.getItem(TEXT_KEY) || '');
  const [gratitudes, setGratitudes] = useState(gratitude ? [gratitude] : []);
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const reopenTimerRef = useRef(null);

  const [page, setPage] = useState('home'); // home | budget | prayers | outfits
  const [coachOpen, setCoachOpen] = useState(false);

  // On mount: enforce global 24h gate
  useEffect(() => {
    const lastAtStr = localStorage.getItem(LAST_AT_KEY);
    const now = Date.now();
    if (!lastAtStr) {
      setShowModal(true);
    } else {
      const lastAt = Number(lastAtStr);
      const elapsed = now - lastAt;
      if (elapsed >= DAY_MS) {
        setShowModal(true);
      } else {
        const msLeft = DAY_MS - elapsed;
        reopenTimerRef.current = setTimeout(() => setShowModal(true), msLeft);
      }
    }
    return () => {
      if (reopenTimerRef.current) clearTimeout(reopenTimerRef.current);
    };
  }, []);

  function handleGratitudeSubmit(entry) {
    const now = Date.now();
    localStorage.setItem(TEXT_KEY, entry);
    localStorage.setItem(LAST_AT_KEY, String(now));
    setGratitude(entry);
    setGratitudes((prev) => [entry, ...prev].slice(0, 25));
    const newItem = { text: entry, ts: now };
    const nextHistory = [newItem, ...history].slice(0, 200);
    setHistory(nextHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
    setShowModal(false);
    if (reopenTimerRef.current) clearTimeout(reopenTimerRef.current);
    reopenTimerRef.current = setTimeout(() => setShowModal(true), DAY_MS);
  }

  function NavItem({ id, children }) {
    const active = page === id;
    return (
      <button
        onClick={() => setPage(id)}
        className={`px-3 py-2 text-sm md:text-base ${theme.navText} ${theme.navHover} ${
          active ? theme.navActive : 'border-b-2 border-transparent'
        }`}
      >
        {children}
      </button>
    );
  }

  return (
    <>
      {showModal && <GratitudeModal onSubmit={handleGratitudeSubmit} />}

      {/* Floating gratitudes (subtle) */}
      <FloatingGratitudes gratitudes={gratitudes} />

      <div
        className={`relative min-h-screen flex flex-col ${theme.appBg} ${theme.bodyText}`}
        style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}
      >
        {/* NAV */}
        <nav className={`relative z-20 ${theme.nav} px-4 md:px-6 py-2 flex items-center justify-between`}>
          <div className="flex items-center gap-2 md:gap-4">
            <NavItem id="home">Home</NavItem>
            <NavItem id="budget">Budget</NavItem>
            <NavItem id="prayers">Prayers</NavItem>
            <NavItem id="outfits">Outfits</NavItem>
            <button
              onClick={() => setCoachOpen(true)}
              className={`px-3 py-2 text-sm md:text-base ${theme.navText} ${theme.navHover} border-b-2 border-transparent`}
            >
              Money Buddy
            </button>
          </div>
          <div className="hidden md:block text-sm text-[#6B7280] pr-1">Clear. Calm. Confident.</div>
        </nav>

        {/* HEADER */}
        <header className="relative z-10 text-center mt-8 px-4">
          <h1 className={`${theme.header} mb-1`}>Welcome, Myka!</h1>
          <p className={`${theme.sub}`}>A clean and sharp life guide</p>
        </header>

        {/* MAIN */}
        <main className="relative z-10 mt-6 flex flex-col items-center w-full px-4 flex-grow">
          {page === 'home' && (
            <div className="w-full max-w-6xl mx-auto">
              <PageHero page="home" gratitude={gratitude} />
              <section id="gratitudes" className="mt-6">
                <h3 className="sr-only">Gratitude History</h3>
                <GratitudeScroller entries={history} />
              </section>
            </div>
          )}

          {page === 'budget' && (
            <div className="w-full max-w-6xl mx-auto">
              <PageHero page="budget" />
              <section id="add-expense" className={`${theme.card} mt-6`}>
                <BudgetAndSavings />
              </section>
            </div>
          )}

          {page === 'prayers' && (
            <div className="w-full max-w-6xl mx-auto">
              <PageHero page="prayers" />
              <section id="prayer-wall" className={`${theme.card} mt-6`}>
                <PrayerWall />
              </section>
            </div>
          )}

          {page === 'outfits' && (
            <div className="w-full max-w-6xl mx-auto">
              <PageHero page="outfits" />
              <section id="todays-fit" className={`${theme.card} mt-6`}>
                <WhatToWear />
              </section>
            </div>
          )}
        </main>

        {/* FOOTER */}
        <footer className="relative z-10 text-center mb-8 mt-10 px-4 text-[#6B7280]">
          Made with love for Myka
        </footer>
      </div>

      {/* Money Buddy Coach modal */}
      <CleoStyleCoach open={coachOpen} onClose={() => setCoachOpen(false)} />
    </>
  );
}

export default App;