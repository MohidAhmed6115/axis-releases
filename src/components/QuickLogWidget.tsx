import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { DayColor, COLOR_DEFINITIONS } from '../types';
import { Sparkles, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

export const QuickLogWidget: React.FC = () => {
  const { 
    selectedDate, 
    dailyRecords, 
    recordReview, 
    computeSuggestedColor 
  } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const record = dailyRecords[selectedDate];
  const currentColor = record?.color;
  const currentNote = record?.note || '';

  const [selectedColor, setSelectedColor] = useState<DayColor>(currentColor || null);
  const [note, setNote] = useState<string>(currentNote);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  React.useEffect(() => {
    setSelectedColor(dailyRecords[selectedDate]?.color || null);
    setNote(dailyRecords[selectedDate]?.note || '');
    setFeedbackMsg(null);
  }, [selectedDate, dailyRecords]);

  const handleSelectColor = (col: DayColor) => {
    setSelectedColor(col);
  };

  const handleAutoSuggest = () => {
    const suggestion = computeSuggestedColor(selectedDate);
    if (suggestion.color) {
      setSelectedColor(suggestion.color);
      setFeedbackMsg(`Suggested ${suggestion.color.toUpperCase()}`);
    } else {
      setFeedbackMsg(suggestion.reason || 'No suggestion available');
    }
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedColor) {
      setFeedbackMsg('Select a color rating');
      return;
    }
    if (!note.trim() || note.trim().length < 3) {
      setFeedbackMsg('Add a short note');
      return;
    }

    setSubmitting(true);
    try {
      await recordReview(selectedColor, note.trim());
      setFeedbackMsg('Saved');
      if (selectedColor === 'green' || selectedColor === 'gold') {
        confetti({
          particleCount: 20,
          spread: 35,
          origin: { y: 0.6 }
        });
      }
      setTimeout(() => setFeedbackMsg(null), 2500);
    } catch (err: any) {
      setFeedbackMsg(err?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const colorKeys: (Exclude<DayColor, null>)[] = ['red', 'yellow', 'orange', 'green', 'gold'];

  return (
    <section className={`rounded-lg p-3 border ${
      isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-inherit border-opacity-10">
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-semibold tracking-tight font-mono uppercase ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
            Daily Self-Review
          </span>
          <span className="text-[#7d7a96] text-[10px]">·</span>
          <span className="text-[10px] text-[#7d7a96] font-mono">CALIBRATION LOG</span>
          {currentColor && (
            <span
              className="w-1.5 h-1.5 rounded-full inline-block ml-0.5"
              style={{ backgroundColor: COLOR_DEFINITIONS[currentColor].hex }}
              title={`Logged: ${COLOR_DEFINITIONS[currentColor].label}`}
            />
          )}
        </div>

        <button
          type="button"
          onClick={handleAutoSuggest}
          className={`text-[10px] font-mono flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
            isDark 
              ? 'text-[#7d7a96] hover:text-[#ece9fb] hover:bg-white/[0.04]' 
              : 'text-[#7d7a96] hover:text-[#18172b] hover:bg-[#f3f1fb]'
          }`}
          title="Auto-suggest based on habits & telemetry"
        >
          <Sparkles className="w-2.5 h-2.5 text-amber-400 stroke-[1.75]" />
          <span>AUTO</span>
        </button>
      </div>

      {/* Row of 5 small color circles (no card borders, no per-option descriptions) */}
      <form onSubmit={handleSubmit} className="mt-2 space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3 sm:gap-4">
            {colorKeys.map((colKey) => {
              const item = COLOR_DEFINITIONS[colKey];
              const isSelected = selectedColor === colKey;

              return (
                <button
                  key={colKey}
                  type="button"
                  onClick={() => handleSelectColor(colKey)}
                  className="group relative p-1 cursor-pointer flex items-center justify-center transition-all focus:outline-none"
                  title={`${item.label}: ${item.description}`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                      isSelected
                        ? 'scale-125 ring-2 ring-[#ece9fb] ring-offset-2 ring-offset-[#131320]'
                        : 'opacity-65 hover:opacity-100 hover:scale-110'
                    }`}
                    style={{ backgroundColor: item.hex }}
                  />
                </button>
              );
            })}
          </div>

          {selectedColor && (
            <span className="text-[10px] font-mono font-medium text-[#7d7a96] truncate max-w-[120px] uppercase">
              {COLOR_DEFINITIONS[selectedColor].label}
            </span>
          )}
        </div>

        {/* Single-line note field with small Save button */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            required
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Today's factual note: what triggered it, what you did..."
            className={`flex-1 rounded-md px-2.5 py-1 text-xs focus:outline-none placeholder:text-[#7d7a96] ${
              isDark 
                ? 'bg-[#0a0a0f] text-[#ece9fb] border border-white/[0.08] focus:border-[#8b7bff]' 
                : 'bg-[#f9f8fd] text-[#18172b] border border-[#e7e4f4] focus:border-[#7c5ef0]'
            }`}
          />

          <button
            type="submit"
            disabled={submitting}
            className={`px-3 py-1 rounded-md font-semibold text-[11px] font-mono transition-colors cursor-pointer shrink-0 flex items-center gap-1 disabled:opacity-50 ${
              isDark 
                ? 'bg-[#8b7bff] text-[#0a0a0f] hover:bg-[#9d8fff]' 
                : 'bg-[#7c5ef0] text-white hover:bg-[#6e4ee6]'
            }`}
          >
            {submitting ? (
              <span className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-2.5 h-2.5 stroke-[2]" />
                <span>{currentColor ? 'UPDATE' : 'CALIBRATE'}</span>
              </>
            )}
          </button>
        </div>

        {feedbackMsg && (
          <div className="text-[10px] text-right font-mono text-[#8b7bff]">
            {feedbackMsg}
          </div>
        )}
      </form>
    </section>
  );
};
