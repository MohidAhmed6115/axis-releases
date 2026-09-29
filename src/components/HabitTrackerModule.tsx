import React, { useState } from 'react';
import { useApp, getLocalDateString } from '../context/AppContext';
import { Habit } from '../types';
import { 
  Check, 
  Flame, 
  Anchor, 
  Plus, 
  X, 
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const HabitTrackerModule: React.FC = () => {
  const { 
    habits, 
    selectedDate, 
    dailyRecords, 
    toggleHabit, 
    addNewHabit, 
    removeHabit 
  } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitType, setNewHabitType] = useState<'build' | 'break'>('build');
  const [newHabitFreq, setNewHabitFreq] = useState<'daily' | 'weekdays' | 'weekends' | 'weekly'>('daily');
  const [isAnchor, setIsAnchor] = useState(false);
  const [category, setCategory] = useState('Productivity');

  const currentRecord = dailyRecords[selectedDate];
  const completedHabitIds = currentRecord?.completedHabitIds || [];

  const calculateStreak = (habitId: string) => {
    let streak = 0;
    const checkDate = new Date();
    
    for (let i = 0; i < 60; i++) {
      const dStr = getLocalDateString(checkDate);
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

  const handleToggle = async (habitId: string) => {
    const willComplete = !completedHabitIds.includes(habitId);
    await toggleHabit(habitId);
    if (willComplete) {
      confetti({
        particleCount: 20,
        spread: 35,
        origin: { y: 0.7 }
      });
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name: newHabitName.trim(),
      type: newHabitType,
      frequency: newHabitFreq,
      isAnchor: isAnchor,
      category: category.trim() || 'General',
      createdAt: new Date().toISOString()
    };

    await addNewHabit(newHabit);
    setNewHabitName('');
    setIsAnchor(false);
    setIsAdding(false);
  };

  return (
    <section className="bg-[#121922] rounded-2xl p-3 sm:p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-semibold text-white tracking-tight">Habit Tracker</h2>
            <span className="text-zinc-600 text-xs">·</span>
            <span className="text-[11px] text-zinc-400 font-mono tabular-nums">
              {completedHabitIds.length}/{habits.length}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
            Tap to mark complete. Anchor habits weigh heavily.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="text-[11px] flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-zinc-200 transition-colors cursor-pointer font-medium"
        >
          {isAdding ? <X className="w-3 h-3 stroke-[1.75]" /> : <Plus className="w-3 h-3 stroke-[2]" />}
          <span>{isAdding ? 'Cancel' : 'Add'}</span>
        </button>
      </div>

      {/* Inline Creation Form */}
      {isAdding && (
        <form onSubmit={handleCreateHabit} className="my-3 p-3 rounded-xl bg-[#0b0f14] space-y-2.5 text-xs">
          <span className="text-[11px] font-semibold text-zinc-200 block">Create Habit</span>
          <input
            type="text"
            required
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="e.g. 90-minute deep focus block, No late snacking..."
            className="w-full bg-[#121922] rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none placeholder:text-zinc-600"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <div>
              <label className="block text-zinc-500 mb-0.5">Type</label>
              <select
                value={newHabitType}
                onChange={(e) => setNewHabitType(e.target.value as any)}
                className="w-full bg-[#121922] rounded-lg px-2 py-1 text-zinc-200"
              >
                <option value="build">Build (Start Doing)</option>
                <option value="break">Break (Stop Doing)</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-500 mb-0.5">Frequency</label>
              <select
                value={newHabitFreq}
                onChange={(e) => setNewHabitFreq(e.target.value as any)}
                className="w-full bg-[#121922] rounded-lg px-2 py-1 text-zinc-200"
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-500 mb-0.5">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Productivity, Health..."
                className="w-full bg-[#121922] rounded-lg px-2 py-1 text-zinc-200"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-1.5 text-[11px] text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnchor}
                onChange={(e) => setIsAnchor(e.target.checked)}
                className="rounded border-zinc-700 text-amber-500 focus:ring-0"
              />
              <span className="flex items-center gap-1 font-medium text-amber-400">
                <Anchor className="w-3 h-3 stroke-[1.75]" />
                Anchor habit
              </span>
            </label>

            <button
              type="submit"
              className="px-3 py-1 bg-white text-zinc-950 font-semibold text-[11px] rounded-lg hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Save Habit
            </button>
          </div>
        </form>
      )}

      {/* Habit Items */}
      <div className="mt-2 divide-y divide-white/[0.04]">
        {habits.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-[11px]">
            No habits yet. Tap "Add" to define your routines.
          </div>
        ) : (
          habits.map((habit) => {
            const isCompleted = completedHabitIds.includes(habit.id);
            const streak = calculateStreak(habit.id);

            return (
              <div
                key={habit.id}
                className="py-2 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Clean circle tap button */}
                  <button
                    type="button"
                    onClick={() => handleToggle(habit.id)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                        : 'border border-white/25 hover:border-white/40 text-transparent'
                    }`}
                    title={isCompleted ? 'Mark not done' : 'Mark done'}
                  >
                    <Check className={`w-3 h-3 stroke-[2.5] ${isCompleted ? 'opacity-100' : 'opacity-0'}`} />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-medium transition-all truncate ${isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
                        {habit.name}
                      </span>

                      {habit.isAnchor && (
                        <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-0.5 shrink-0">
                          <Anchor className="w-2.5 h-2.5 stroke-[2]" />
                          Anchor
                        </span>
                      )}

                      <span className="text-[10px] text-zinc-500 shrink-0">
                        · {habit.type === 'break' ? 'Break' : 'Build'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                      <span>{habit.frequency}</span>
                      {habit.category && (
                        <>
                          <span className="text-zinc-700">·</span>
                          <span>{habit.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 text-[10px] font-mono tabular-nums text-zinc-300 px-1.5 py-0.5 rounded bg-white/[0.04]">
                    <Flame className={`w-3 h-3 stroke-[1.75] ${streak > 0 ? 'text-amber-400 fill-amber-400/20' : 'text-zinc-600'}`} />
                    <span>{streak}d</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeHabit(habit.id)}
                    className="p-1 text-zinc-600 hover:text-rose-400 transition-colors cursor-pointer rounded opacity-0 group-hover:opacity-100"
                    title="Delete habit"
                  >
                    <Trash2 className="w-3 h-3 stroke-[1.75]" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
