import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Habit } from '../types';
import { HabitsWeeklyTrend } from './HabitsWeeklyTrend';
import { CompassDialGauge } from './CompassDialGauge';
import { 
  Check, 
  Flame, 
  Anchor, 
  Plus, 
  X, 
  Trash2, 
  Archive, 
  Activity,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const HabitsPage: React.FC = () => {
  const { 
    habits, 
    selectedDate, 
    dailyRecords, 
    toggleHabit, 
    addNewHabit, 
    removeHabit 
  } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [filterType, setFilterType] = useState<'all' | 'build' | 'break' | 'anchor'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'build' | 'break'>('build');
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'weekends' | 'weekly'>('daily');
  const [isAnchor, setIsAnchor] = useState(false);
  const [category, setCategory] = useState('Productivity');

  const currentRecord = dailyRecords[selectedDate];
  const completedHabitIds = currentRecord?.completedHabitIds || [];

  // Streak calculator
  const calculateStreak = (habitId: string) => {
    let streak = 0;
    const checkDate = new Date();
    for (let i = 0; i < 90; i++) {
      const parts = [
        checkDate.getFullYear(),
        String(checkDate.getMonth() + 1).padStart(2, '0'),
        String(checkDate.getDate()).padStart(2, '0')
      ];
      const dStr = parts.join('-');
      const dayRec = dailyRecords[dStr];
      const isDone = dayRec?.completedHabitIds?.includes(habitId);
      if (isDone) {
        streak++;
      } else {
        if (i === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  };

  // Completion rate past 30 days
  const calculateRate = (habitId: string) => {
    let completed = 0;
    const checkDate = new Date();
    for (let i = 0; i < 30; i++) {
      const parts = [
        checkDate.getFullYear(),
        String(checkDate.getMonth() + 1).padStart(2, '0'),
        String(checkDate.getDate()).padStart(2, '0')
      ];
      const dStr = parts.join('-');
      if (dailyRecords[dStr]?.completedHabitIds?.includes(habitId)) {
        completed++;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return Math.round((completed / 30) * 100);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name: name.trim(),
      type,
      frequency,
      isAnchor,
      category: category.trim() || 'General',
      createdAt: new Date().toISOString()
    };

    await addNewHabit(newHabit);
    setName('');
    setIsAnchor(false);
    setIsAdding(false);
  };

  const filteredHabits = useMemo(() => {
    return habits.filter(h => {
      if (!showArchived && h.archived) return false;
      if (showArchived && !h.archived) return false;
      if (filterType === 'build') return h.type === 'build';
      if (filterType === 'break') return h.type === 'break';
      if (filterType === 'anchor') return h.isAnchor;
      return true;
    });
  }, [habits, showArchived, filterType]);

  const activeHabits = useMemo(() => habits.filter(h => !h.archived), [habits]);
  const habitCompletionPct = activeHabits.length > 0 
    ? Math.round((completedHabitIds.length / activeHabits.length) * 100) 
    : 0;

  const totalStreakDays = useMemo(() => {
    return activeHabits.reduce((acc, h) => acc + calculateStreak(h.id), 0);
  }, [activeHabits, dailyRecords]);

  // Brand color tokens
  const brandAccent = isDark ? '#8b7bff' : '#7c5ef0';
  const dialTeal = '#2dd4bf'; // Secondary chart-only accent

  return (
    <div className="space-y-3.5 max-w-4xl pb-16">
      {/* 1. Instrument Telemetry Top Cluster: Compass Dial Gauge + Headline Telemetry */}
      <div className={`p-3.5 sm:p-4 rounded-lg border grid grid-cols-1 md:grid-cols-12 gap-3 items-center ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-inherit border-opacity-10 pb-3 md:pb-0 md:pr-3">
          <CompassDialGauge
            value={habitCompletionPct}
            targetValue={80}
            label="TODAY'S EXECUTION"
            sublabel={`${completedHabitIds.length} of ${activeHabits.length} habits calibrated`}
            isDark={isDark}
            compact={true}
          />
        </div>

        <div className="md:col-span-7 grid grid-cols-2 gap-2.5">
          {/* Stat 1: Habits Logged */}
          <div className={`p-2.5 rounded-lg border ${
            isDark ? 'bg-[#1c1c2e] border-white/[0.06]' : 'bg-[#f3f1fb] border-[#e7e4f4]'
          }`}>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7d7a96] block">
              EXECUTION STATUS
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-2xl font-bold font-mono tabular-nums tracking-wider ${
                isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
              }`}>
                {completedHabitIds.length}/{activeHabits.length}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#7d7a96] block mt-0.5">
              ROUTINES COMPLETED
            </span>
          </div>

          {/* Stat 2: Cumulative Momentum */}
          <div className={`p-2.5 rounded-lg border ${
            isDark ? 'bg-[#1c1c2e] border-white/[0.06]' : 'bg-[#f3f1fb] border-[#e7e4f4]'
          }`}>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7d7a96] block">
              CUMULATIVE STREAK
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-2xl font-bold font-mono tabular-nums tracking-wider ${
                isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
              }`}>
                {totalStreakDays}
              </span>
              <span className="text-[10px] font-mono text-[#7d7a96]">DAYS</span>
            </div>
            <span className="text-[10px] font-mono text-[#7d7a96] block mt-0.5">
              AGGREGATE MOMENTUM
            </span>
          </div>

          {/* Stat 3: Target Discipline Ref */}
          <div className={`p-2.5 rounded-lg border ${
            isDark ? 'bg-[#1c1c2e] border-white/[0.06]' : 'bg-[#f3f1fb] border-[#e7e4f4]'
          }`}>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7d7a96] block">
              DISCIPLINE BENCHMARK
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold font-mono tabular-nums tracking-wider text-[#2dd4bf]">
                80%
              </span>
              <span className="text-[10px] font-mono text-[#2dd4bf] font-semibold">REF</span>
            </div>
            <span className="text-[10px] font-mono text-[#7d7a96] block mt-0.5">
              MINIMUM DAILY THRESHOLD
            </span>
          </div>

          {/* Stat 4: Active Anchor Routines */}
          <div className={`p-2.5 rounded-lg border ${
            isDark ? 'bg-[#1c1c2e] border-white/[0.06]' : 'bg-[#f3f1fb] border-[#e7e4f4]'
          }`}>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7d7a96] block">
              ANCHOR PROTOCOLS
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-2xl font-bold font-mono tabular-nums tracking-wider ${
                isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
              }`}>
                {activeHabits.filter(h => h.isAnchor).length}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#7d7a96] block mt-0.5">
              CRITICAL MORAL WEIGHTS
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top action bar & filter controls */}
      <div className={`p-2.5 sm:p-3 rounded-lg flex flex-wrap items-center justify-between gap-2.5 border ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Underline-style minimal filter tabs */}
          <div className="flex items-center gap-1 text-[11px] font-mono">
            {(['all', 'build', 'break', 'anchor'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterType(f)}
                className={`px-2 py-1 rounded-md uppercase tracking-wider transition-colors cursor-pointer ${
                  filterType === f
                    ? isDark 
                      ? 'bg-[#1c1c2e] text-[#ece9fb] font-semibold border border-white/[0.08]' 
                      : 'bg-[#f3f1fb] text-[#18172b] font-semibold border border-[#e7e4f4]'
                    : 'text-[#7d7a96] hover:text-[#ece9fb]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className={`px-2 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
              showArchived
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-[#7d7a96] hover:text-[#ece9fb]'
            }`}
          >
            <Archive className="w-3 h-3 stroke-[1.75]" />
            <span>{showArchived ? 'Archived' : 'Archived'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold font-mono tracking-wider uppercase cursor-pointer flex items-center gap-1 transition-colors ${
            isDark 
              ? 'bg-[#8b7bff] text-[#0a0a0f] hover:bg-[#9d8fff]' 
              : 'bg-[#7c5ef0] text-white hover:bg-[#6e4ee6]'
          }`}
        >
          {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 stroke-[2]" />}
          <span>{isAdding ? 'Cancel' : 'New Habit'}</span>
        </button>
      </div>

      {/* 3. Add Habit form */}
      {isAdding && (
        <form onSubmit={handleCreate} className={`p-3.5 rounded-lg space-y-3 text-xs border ${
          isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
        }`}>
          <div className={`text-[11px] font-mono font-semibold uppercase tracking-wider ${
            isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
          }`}>
            Define Routine Protocol
          </div>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Protocol title (e.g. 90-min deep work block, No late snacking...)"
            className={`w-full rounded-md px-3 py-1.5 text-xs focus:outline-none placeholder:text-[#7d7a96] ${
              isDark 
                ? 'bg-[#0a0a0f] text-[#ece9fb] border border-white/[0.08] focus:border-[#8b7bff]' 
                : 'bg-[#f9f8fd] text-[#18172b] border border-[#e7e4f4] focus:border-[#7c5ef0]'
            }`}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
            <div>
              <label className="block text-[#7d7a96] font-mono uppercase text-[10px] mb-0.5">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className={`w-full rounded-md px-2 py-1 ${
                  isDark 
                    ? 'bg-[#0a0a0f] text-[#ece9fb] border border-white/[0.08]' 
                    : 'bg-[#f9f8fd] text-[#18172b] border border-[#e7e4f4]'
                }`}
              >
                <option value="build">Build (Positive Habit)</option>
                <option value="break">Break (Restraint Habit)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#7d7a96] font-mono uppercase text-[10px] mb-0.5">Cadence</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className={`w-full rounded-md px-2 py-1 ${
                  isDark 
                    ? 'bg-[#0a0a0f] text-[#ece9fb] border border-white/[0.08]' 
                    : 'bg-[#f9f8fd] text-[#18172b] border border-[#e7e4f4]'
                }`}
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-[#7d7a96] font-mono uppercase text-[10px] mb-0.5">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Productivity, Health..."
                className={`w-full rounded-md px-2 py-1 ${
                  isDark 
                    ? 'bg-[#0a0a0f] text-[#ece9fb] border border-white/[0.08]' 
                    : 'bg-[#f9f8fd] text-[#18172b] border border-[#e7e4f4]'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-1.5 text-[11px] text-[#7d7a96] cursor-pointer">
              <input
                type="checkbox"
                checked={isAnchor}
                onChange={(e) => setIsAnchor(e.target.checked)}
                className="rounded border-zinc-700 text-amber-500 focus:ring-0"
              />
              <span className="flex items-center gap-1 font-medium text-amber-400">
                <Anchor className="w-3 h-3" />
                Anchor protocol (weighs heavily in daily moral score)
              </span>
            </label>

            <button
              type="submit"
              className={`px-3 py-1.5 rounded-md font-semibold font-mono text-[11px] uppercase tracking-wider ${
                isDark 
                  ? 'bg-[#8b7bff] text-[#0a0a0f] hover:bg-[#9d8fff]' 
                  : 'bg-[#7c5ef0] text-white hover:bg-[#6e4ee6]'
              }`}
            >
              Create Habit
            </button>
          </div>
        </form>
      )}

      {/* 4. Weekly Trend Chart */}
      <HabitsWeeklyTrend />

      {/* 5. Habit Full List Table with Circular Progress Indicator */}
      <div className={`rounded-lg overflow-hidden border ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b text-[10px] uppercase font-mono tracking-wider ${
                isDark 
                  ? 'border-white/[0.08] text-[#7d7a96] bg-[#0a0a0f]' 
                  : 'border-[#e7e4f4] text-[#7d7a96] bg-[#f9f8fd]'
              }`}>
                <th className="py-2.5 px-3 w-14 text-center">Status</th>
                <th className="py-2.5 px-3">Habit Protocol</th>
                <th className="py-2.5 px-3 hidden sm:table-cell">Type</th>
                <th className="py-2.5 px-3 hidden sm:table-cell">Cadence</th>
                <th className="py-2.5 px-3">Streak</th>
                <th className="py-2.5 px-3 hidden md:table-cell">30d Consistency</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit divide-opacity-10">
              {filteredHabits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#7d7a96] text-[11px] font-mono">
                    No habits match current filter.
                  </td>
                </tr>
              ) : (
                filteredHabits.map((habit) => {
                  const isCompleted = completedHabitIds.includes(habit.id);
                  const streak = calculateStreak(habit.id);
                  const rate = calculateRate(habit.id);

                  // Circular Progress Indicator geometry
                  // Ring radius = 9, circumference = 2 * PI * 9 ≈ 56.55
                  const ringR = 9;
                  const ringCirc = 2 * Math.PI * ringR;
                  // For today's goal completion: if completed => 100%, else shows 30d consistency momentum
                  const displayPct = isCompleted ? 100 : rate;
                  const ringOffset = ringCirc * (1 - displayPct / 100);

                  return (
                    <tr 
                      key={habit.id} 
                      className={`group transition-colors ${
                        isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Circular Progress Indicator Ring Toggle */}
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={async () => {
                            await toggleHabit(habit.id);
                            if (!isCompleted) {
                              confetti({ particleCount: 15, spread: 35, origin: { y: 0.6 } });
                            }
                          }}
                          className="relative inline-flex items-center justify-center p-0.5 cursor-pointer focus:outline-none group/ring"
                          title={isCompleted ? 'Mark uncompleted' : `Complete today (${rate}% 30-day consistency)`}
                        >
                          {/* SVG Radial Ring Gauge */}
                          <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
                            {/* Track */}
                            <circle
                              cx="12"
                              cy="12"
                              r={ringR}
                              stroke={isDark ? 'rgba(236,233,251,0.1)' : 'rgba(24,23,43,0.1)'}
                              strokeWidth="2"
                              fill="none"
                            />
                            {/* Progress Arc */}
                            <circle
                              cx="12"
                              cy="12"
                              r={ringR}
                              stroke={isCompleted ? brandAccent : (rate > 0 ? (isDark ? '#7d7a96' : '#9c98b6') : 'transparent')}
                              strokeWidth="2.25"
                              strokeLinecap="round"
                              fill="none"
                              strokeDasharray={ringCirc}
                              strokeDashoffset={ringOffset}
                              className="transition-all duration-300"
                            />
                          </svg>

                          {/* Center state icon / dot */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {isCompleted ? (
                              <Check 
                                className="w-3 h-3 stroke-[2.5]" 
                                style={{ color: brandAccent }} 
                              />
                            ) : (
                              <div 
                                className={`w-1 h-1 rounded-full transition-all group-hover/ring:scale-150 ${
                                  rate > 0 ? (isDark ? 'bg-[#7d7a96]' : 'bg-[#9c98b6]') : 'bg-transparent'
                                }`} 
                              />
                            )}
                          </div>
                        </button>
                      </td>

                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`font-medium ${
                            isCompleted 
                              ? 'text-[#7d7a96] line-through' 
                              : isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
                          }`}>
                            {habit.name}
                          </span>
                          {habit.isAnchor && (
                            <span className="text-[9px] font-semibold text-amber-400 flex items-center gap-0.5">
                              <Anchor className="w-2.5 h-2.5" />
                              Anchor
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#7d7a96] font-mono sm:hidden">
                          {habit.type} · {habit.frequency}
                        </div>
                      </td>

                      <td className="py-2 px-3 hidden sm:table-cell capitalize text-[#7d7a96] font-mono text-[11px]">
                        {habit.type}
                      </td>

                      <td className="py-2 px-3 hidden sm:table-cell capitalize text-[#7d7a96] font-mono text-[11px]">
                        {habit.frequency}
                      </td>

                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1 text-[11px] font-mono tabular-nums text-[#ece9fb] dark:text-[#ece9fb] light:text-[#18172b]">
                          <Flame className={`w-3 h-3 ${streak > 0 ? 'text-amber-400 fill-amber-400/20' : 'text-[#7d7a96]'}`} />
                          <span>{streak}d</span>
                        </div>
                      </td>

                      {/* 30d Consistency with Radial / Bar Gauge & JetBrains Mono digits */}
                      <td className="py-2 px-3 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-sm bg-white/[0.08] overflow-hidden">
                            <div 
                              className="h-full rounded-sm transition-all duration-300"
                              style={{ 
                                width: `${rate}%`,
                                backgroundColor: rate >= 80 ? dialTeal : brandAccent
                              }} 
                            />
                          </div>
                          <span className="font-mono text-[10px] font-semibold tabular-nums text-[#7d7a96]">
                            {rate}%
                          </span>
                        </div>
                      </td>

                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeHabit(habit.id)}
                          className="p-1 text-[#7d7a96] hover:text-rose-400 transition-colors cursor-pointer rounded"
                          title="Delete habit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Button (FAB) on mobile: Circular with subtle radial glow in brand accent */}
      <button
        type="button"
        onClick={() => setIsAdding(true)}
        className={`md:hidden fixed bottom-18 right-4 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-all z-40 ${
          isDark
            ? 'bg-[#8b7bff] text-[#0a0a0f] shadow-[0_0_24px_rgba(139,123,255,0.45)]'
            : 'bg-[#7c5ef0] text-white shadow-[0_0_24px_rgba(124,94,240,0.4)]'
        }`}
        aria-label="Add Habit"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>
    </div>
  );
};
