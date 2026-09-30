import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  DayColor, 
  COLOR_DEFINITIONS 
} from '../types';
import { 
  Sparkles, 
  Send, 
  Check, 
  ListChecks, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DailyReviewCard: React.FC = () => {
  const { 
    selectedDate, 
    dailyRecords, 
    recordReview, 
    habits, 
    tasks, 
    platform, 
    computeSuggestedColor 
  } = useApp();

  const record = dailyRecords[selectedDate];
  const currentColor = record?.color;
  const currentNote = record?.note || '';

  const [selectedColor, setSelectedColor] = useState<DayColor>(currentColor || null);
  const [note, setNote] = useState<string>(currentNote);
  const [submitting, setSubmitting] = useState(false);
  const [showAutoSuggest, setShowAutoSuggest] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  React.useEffect(() => {
    setSelectedColor(dailyRecords[selectedDate]?.color || null);
    setNote(dailyRecords[selectedDate]?.note || '');
    setFeedbackMsg(null);
  }, [selectedDate, dailyRecords]);

  const completedHabitsCount = record?.completedHabitIds?.length || 0;
  const completedTasksCount = record?.completedTaskIds?.length || 0;
  const totalHabits = habits.length;

  const handleSelectColor = (col: DayColor) => {
    setSelectedColor(col);
  };

  const handleAutoSuggest = () => {
    const suggestion = computeSuggestedColor(selectedDate);
    setSelectedColor(suggestion.color);
    setShowAutoSuggest(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedColor) {
      setFeedbackMsg('Select a color rating before saving.');
      return;
    }
    if (!note.trim() || note.trim().length < 5) {
      setFeedbackMsg('A short reflection note is required.');
      return;
    }

    setSubmitting(true);
    try {
      await recordReview(selectedColor, note.trim());
      setFeedbackMsg('Saved for today');
      if (selectedColor === 'green' || selectedColor === 'gold') {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 }
        });
      }
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg(err?.message || 'Could not save review.');
    } finally {
      setSubmitting(false);
    }
  };

  const colorKeys: (Exclude<DayColor, null>)[] = ['red', 'yellow', 'orange', 'green', 'gold'];

  return (
    <section className="bg-[#121922] rounded-2xl p-3 sm:p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-semibold text-white tracking-tight">Daily Review</h2>
            <span className="text-zinc-600 text-xs">·</span>
            <span className="text-[11px] text-zinc-400 font-medium">
              {currentColor ? (
                <span className="inline-flex items-center gap-1 text-zinc-300">
                  <span 
                    className="w-1.5 h-1.5 rounded-full" 
                    style={{ backgroundColor: COLOR_DEFINITIONS[currentColor].hex }} 
                  />
                  {COLOR_DEFINITIONS[currentColor].label}
                </span>
              ) : (
                'Unset'
              )}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5 truncate max-w-xs">
            Evaluate today's focus honestly.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAutoSuggest}
          className="text-[11px] flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition-colors cursor-pointer font-medium"
        >
          <Sparkles className="w-3 h-3 text-amber-400 stroke-[1.75]" />
          <span>Auto-suggest</span>
        </button>
      </div>

      {/* Auto-suggest insight callout */}
      {showAutoSuggest && (
        <div className="mt-2.5 p-2 rounded-xl bg-white/[0.02] text-[11px] flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5 stroke-[1.75]" />
          <div className="flex-1">
            <span className="font-semibold text-zinc-200">Suggested: </span>
            <span className="text-zinc-400">{computeSuggestedColor(selectedDate).reason}</span>
          </div>
        </div>
      )}

      {/* Collapsed 5-Color Selection: Horizontal row of small colored circles without card borders */}
      <div className="py-3">
        <div className="flex items-center justify-between px-2 sm:px-6">
          {colorKeys.map((colKey) => {
            const item = COLOR_DEFINITIONS[colKey];
            const isSelected = selectedColor === colKey;

            return (
              <button
                key={colKey}
                type="button"
                onClick={() => handleSelectColor(colKey)}
                className="group relative p-2 cursor-pointer flex flex-col items-center justify-center transition-all"
                title={item.label}
              >
                <div 
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    isSelected 
                      ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#121922]' 
                      : 'opacity-70 group-hover:opacity-100 group-hover:scale-110'
                  }`}
                  style={{ backgroundColor: item.hex }}
                />
              </button>
            );
          })}
        </div>

        {/* Selected rating label & description below row */}
        {selectedColor ? (
          <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03] text-[11px] flex items-center gap-2 transition-all">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLOR_DEFINITIONS[selectedColor].hex }} />
            <span className="font-semibold text-zinc-200">{COLOR_DEFINITIONS[selectedColor].label}:</span>
            <span className="text-zinc-400 truncate">{COLOR_DEFINITIONS[selectedColor].description}</span>
          </div>
        ) : (
          <div className="mt-2 text-center text-[10px] text-zinc-600">
            Tap a circle above to rate today
          </div>
        )}
      </div>

      {/* Reflection Note & Submission */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div>
          <div className="flex items-center justify-between mb-1 text-[11px]">
            <label className="font-medium text-zinc-400">
              Reflection Note
            </label>
            <span className="text-[10px] text-zinc-500">
              Triggers & execution
            </span>
          </div>
          <textarea
            required
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Record an honest, factual summary..."
            className="w-full bg-[#0b0f14] rounded-xl p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all resize-none"
          />
        </div>

        {/* Footer Meta & Action */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.04] text-[11px] text-zinc-400">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="flex items-center gap-1">
              <ListChecks className="w-3 h-3 stroke-[1.75]" />
              <span className="font-mono tabular-nums text-zinc-300">{completedHabitsCount}/{totalHabits}</span>
            </span>
            <span className="text-zinc-600">·</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 stroke-[1.75]" />
              <span className="font-mono tabular-nums text-zinc-300">{completedTasksCount}</span>
            </span>
            {platform === 'android' && record?.screenTime && (
              <>
                <span className="text-zinc-600">·</span>
                <span className="flex items-center gap-1 text-rose-300/80">
                  <Clock className="w-3 h-3 stroke-[1.75]" />
                  <span className="font-mono tabular-nums">{record.screenTime.highRiskMinutes}m</span>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {feedbackMsg && (
              <span className={`text-[10px] ${feedbackMsg.includes('Saved') ? 'text-emerald-400' : 'text-rose-400'}`}>
                {feedbackMsg}
              </span>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="px-3 py-1.5 bg-white text-zinc-950 font-semibold text-[11px] rounded-lg hover:bg-zinc-200 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? (
                <span className="w-3 h-3 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3 h-3 stroke-[2]" />
                  <span>{currentColor ? 'Update' : 'Save'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};
