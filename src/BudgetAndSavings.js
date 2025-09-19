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

function currency(n) {
  if (n === '' || n === null || n === undefined) return '$0';
  const num = Number(n) || 0;
  return num.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function BudgetAndSavings() {
  // Daily income tracking (server tips)
  const [dailyIncome, setDailyIncome] = useLocalStore('myka_daily_income', []);
  const [todayAmount, setTodayAmount] = React.useState('');

  // Budget buckets (Wants/Needs/Savings)
  const [buckets, setBuckets] = useLocalStore('myka_buckets', {
    needs: { allocated: 0, spent: 0 },
    wants: { allocated: 0, spent: 0 },
    savings: { allocated: 0, spent: 0 }
  });

  // Savings goals state
  const [goals, setGoals] = useLocalStore('myka_savings_goals', []);
  const [goalTitle, setGoalTitle] = React.useState('');
  const [goalTarget, setGoalTarget] = React.useState('');

  // Credit builder checklist
  const [creditChecklist, setCreditChecklist] = useLocalStore('myka_credit_checklist', [
    { id: 1, task: 'Get a secured credit card', completed: false },
    { id: 2, task: 'Set one small bill (Spotify, phone, Netflix) to auto-pay with card', completed: false },
    { id: 3, task: 'Pay statement balance in full (not just minimum)', completed: false },
    { id: 4, task: 'Keep card balance under 30% of credit limit', completed: false },
    { id: 5, task: 'Check credit score monthly (Credit Karma, etc.)', completed: false }
  ]);

  // Calculate totals
  const totalEarned = dailyIncome.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  const totalAllocated = buckets.needs.allocated + buckets.wants.allocated + buckets.savings.allocated;
  const unallocated = totalEarned - totalAllocated;
  const creditStars = creditChecklist.filter(item => item.completed).length;

  // Add daily income
  function addDailyIncome(e) {
    e.preventDefault();
    if (!todayAmount) return;
    const today = new Date().toLocaleDateString();
    const amount = Number(todayAmount);
    
    setDailyIncome(prev => {
      const existing = prev.find(entry => entry.date === today);
      if (existing) {
        return prev.map(entry => 
          entry.date === today 
            ? { ...entry, amount: existing.amount + amount }
            : entry
        );
      } else {
        return [...prev, { id: crypto.randomUUID(), date: today, amount }];
      }
    });
    setTodayAmount('');
  }

  // Update bucket allocation
  function updateBucketAllocation(bucketType, amount) {
    setBuckets(prev => ({
      ...prev,
      [bucketType]: { ...prev[bucketType], allocated: Math.max(0, Number(amount) || 0) }
    }));
  }

  // Update bucket spending
  function updateBucketSpending(bucketType, delta) {
    setBuckets(prev => ({
      ...prev,
      [bucketType]: { 
        ...prev[bucketType], 
        spent: Math.max(0, Math.min(prev[bucketType].allocated, prev[bucketType].spent + delta))
      }
    }));
  }

  // Auto-allocate using 50/30/20 rule
  function autoAllocate() {
    const needs = Math.round(totalEarned * 0.5);
    const wants = Math.round(totalEarned * 0.3);
    const savings = Math.round(totalEarned * 0.2);
    
    setBuckets({
      needs: { ...buckets.needs, allocated: needs },
      wants: { ...buckets.wants, allocated: wants },
      savings: { ...buckets.savings, allocated: savings }
    });
  }

  // Toggle credit checklist item
  function toggleCreditItem(id) {
    setCreditChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  }

  // Savings goals functions
  function addGoal(e) {
    e.preventDefault();
    if (!goalTitle.trim() || !goalTarget) return;
    setGoals(prev => [...prev, { 
      id: crypto.randomUUID(), 
      title: goalTitle.trim(), 
      target: Number(goalTarget), 
      saved: 0 
    }]);
    setGoalTitle('');
    setGoalTarget('');
  }

  function updateGoalSaved(id, delta) {
    setGoals(prev => prev.map(g => {
      if (g.id !== id) return g;
      const next = Math.max(0, Math.min(g.target, (Number(g.saved) || 0) + delta));
      return { ...g, saved: next };
    }));
  }

  function removeGoal(id) {
    setGoals(prev => prev.filter(g => g.id !== id));
  }

  return (
    <div className="relative z-10 max-w-6xl w-full bg-white/90 border-4 border-pink-300 rounded-3xl shadow-2xl p-6 md:p-10">
      <h2 className="text-3xl font-extrabold text-purple-700 mb-6 flex items-center">
        <span className="mr-2">💰</span> Myka's Money Manager
      </h2>

      {/* Daily Income Tracker */}
      <section className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
        <h3 className="text-xl font-bold text-green-700 mb-3 flex items-center">
          <span className="mr-2">💵</span> Daily Tips & Income
        </h3>
        <form onSubmit={addDailyIncome} className="flex gap-3 mb-4">
          <input
            type="number"
            className="flex-1 px-4 py-2 rounded-xl border-2 border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="How much did you make today?"
            value={todayAmount}
            onChange={e => setTodayAmount(e.target.value)}
            min="0"
            step="0.01"
          />
          <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-400 to-emerald-400 text-white font-bold hover:from-green-500 hover:to-emerald-500">
            Add Today's Tips
          </button>
        </form>
        
        <div className="flex items-center justify-between">
          <div className="text-green-800">
            <span className="text-2xl font-bold">{currency(totalEarned)}</span>
            <span className="text-sm ml-2">Total Earned</span>
          </div>
          <div className="text-sm text-green-600">
            {dailyIncome.length} days tracked
          </div>
        </div>
      </section>

      {/* Wants/Needs/Savings Buckets */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-pink-700 flex items-center">
            <span className="mr-2">🪣</span> Money Buckets
          </h3>
          <button 
            onClick={autoAllocate}
            className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold hover:from-purple-500 hover:to-pink-500"
          >
            Auto-Split (50/30/20)
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {/* Needs Bucket */}
          <div className="p-4 rounded-2xl border-2 border-blue-200 bg-blue-50">
            <h4 className="font-bold text-blue-700 mb-2 flex items-center">
              <span className="mr-2">🏠</span> NEEDS (50%)
            </h4>
            <div className="space-y-2">
              <input
                type="number"
                className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Allocate amount"
                value={buckets.needs.allocated}
                onChange={e => updateBucketAllocation('needs', e.target.value)}
                min="0"
              />
              <div className="text-sm text-blue-600">
                Spent: {currency(buckets.needs.spent)} / {currency(buckets.needs.allocated)}
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => updateBucketSpending('needs', -10)}
                  className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  -$10
                </button>
                <button 
                  onClick={() => updateBucketSpending('needs', 10)}
                  className="px-2 py-1 text-xs rounded bg-blue-200 text-blue-800 hover:bg-blue-300"
                >
                  +$10
                </button>
              </div>
            </div>
          </div>

          {/* Wants Bucket */}
          <div className="p-4 rounded-2xl border-2 border-pink-200 bg-pink-50">
            <h4 className="font-bold text-pink-700 mb-2 flex items-center">
              <span className="mr-2">🛍️</span> WANTS (30%)
            </h4>
            <div className="space-y-2">
              <input
                type="number"
                className="w-full px-3 py-2 rounded-lg border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="Allocate amount"
                value={buckets.wants.allocated}
                onChange={e => updateBucketAllocation('wants', e.target.value)}
                min="0"
              />
              <div className="text-sm text-pink-600">
                Spent: {currency(buckets.wants.spent)} / {currency(buckets.wants.allocated)}
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => updateBucketSpending('wants', -10)}
                  className="px-2 py-1 text-xs rounded bg-pink-100 text-pink-700 hover:bg-pink-200"
                >
                  -$10
                </button>
                <button 
                  onClick={() => updateBucketSpending('wants', 10)}
                  className="px-2 py-1 text-xs rounded bg-pink-200 text-pink-800 hover:bg-pink-300"
                >
                  +$10
                </button>
              </div>
            </div>
          </div>

          {/* Savings Bucket */}
          <div className="p-4 rounded-2xl border-2 border-purple-200 bg-purple-50">
            <h4 className="font-bold text-purple-700 mb-2 flex items-center">
              <span className="mr-2">💎</span> SAVINGS (20%)
            </h4>
            <div className="space-y-2">
              <input
                type="number"
                className="w-full px-3 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Allocate amount"
                value={buckets.savings.allocated}
                onChange={e => updateBucketAllocation('savings', e.target.value)}
                min="0"
              />
              <div className="text-sm text-purple-600">
                Saved: {currency(buckets.savings.spent)} / {currency(buckets.savings.allocated)}
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => updateBucketSpending('savings', -10)}
                  className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-700 hover:bg-purple-200"
                >
                  -$10
                </button>
                <button 
                  onClick={() => updateBucketSpending('savings', 10)}
                  className="px-2 py-1 text-xs rounded bg-purple-200 text-purple-800 hover:bg-purple-300"
                >
                  +$10
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center p-3 bg-yellow-50 rounded-xl border border-yellow-200">
          <span className="text-yellow-800 font-semibold">
            Unallocated Money: {currency(unallocated)}
          </span>
        </div>
      </section>

      {/* Credit Builder Checklist */}
      <section className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border-2 border-indigo-200">
        <h3 className="text-xl font-bold text-indigo-700 mb-3 flex items-center">
          <span className="mr-2">⭐</span> Credit Builder Checklist
          <span className="ml-2 px-3 py-1 text-sm bg-yellow-200 text-yellow-800 rounded-full">
            {creditStars}/5 Stars
          </span>
        </h3>
        
        <div className="space-y-3">
          {creditChecklist.map(item => (
            <div key={item.id} className="flex items-start gap-3 p-3 bg-white/70 rounded-xl">
              <button
                onClick={() => toggleCreditItem(item.id)}
                className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                  item.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-gray-300 hover:border-indigo-400'
                }`}
              >
                {item.completed && '✓'}
              </button>
              <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-indigo-800'}`}>
                {item.task}
              </span>
              {item.completed && <span className="text-yellow-500">⭐</span>}
            </div>
          ))}
        </div>
        
        {creditStars === 5 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-xl text-center">
            <span className="text-2xl">🎉</span>
            <div className="font-bold text-orange-800">Congratulations! You're building amazing credit habits!</div>
          </div>
        )}
      </section>

      {/* Savings Goals */}
      <section>
        <h3 className="text-xl font-bold text-pink-700 mb-3 flex items-center">
          <span className="mr-2">🎯</span> Savings Goals
        </h3>
        <form onSubmit={addGoal} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input
            className="px-4 py-2 rounded-xl border-2 border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
            placeholder="Goal (e.g., New Laptop)"
            value={goalTitle}
            onChange={e => setGoalTitle(e.target.value)}
          />
          <input
            type="number"
            className="px-4 py-2 rounded-xl border-2 border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
            placeholder="Target ($)"
            value={goalTarget}
            min="0"
            onChange={e => setGoalTarget(e.target.value)}
          />
          <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 text-purple-900 font-bold border-2 border-yellow-200 hover:from-pink-400 hover:to-yellow-200">
            Add Goal
          </button>
        </form>

        {goals.length === 0 ? (
          <div className="text-purple-700/80 italic">No goals yet. Add one above!</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {goals.map(g => {
              const pct = g.target > 0 ? Math.round((Number(g.saved) || 0) / g.target * 100) : 0;
              return (
                <div key={g.id} className="p-4 rounded-2xl border-2 border-pink-200 bg-white/70">
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="text-purple-800 font-extrabold">{g.title}</div>
                    <div className="text-pink-700 font-semibold">{currency(g.saved)} / {currency(g.target)}</div>
                  </div>
                  <div className="w-full h-3 bg-pink-100 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-gradient-to-r from-pink-400 to-purple-400" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateGoalSaved(g.id, -25)}
                      className="px-3 py-1 rounded-lg bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-200"
                    >
                      - $25
                    </button>
                    <button
                      onClick={() => updateGoalSaved(g.id, 25)}
                      className="px-3 py-1 rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-200"
                    >
                      + $25
                    </button>
                    <button
                      onClick={() => removeGoal(g.id)}
                      className="ml-auto px-3 py-1 rounded-lg bg-white text-pink-700 hover:bg-pink-50 border border-pink-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}