import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { DayColor, COLOR_DEFINITIONS } from '../types';
import { 
  Sparkles, 
  Send, 
  Calendar as CalendarIcon, 
  Flame, 
  ShieldCheck, 
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DailyReviewHistoryPage: React.FC = () => {
  const { 
    selectedDate, 
    setSelectedDate, 
    dailyRecords, 
    recordReview, 
    habits, 
    tasks, 
    platform, 
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

  // Compute 10-week (70 days) matrix
  const daysArray = useMemo(() => {
    const arr = [];
    const baseDate = new Date();
    // 70 days ending on baseDate
    for (let i = 69; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      arr.push({
        date: dateStr,
        dayOfWeek: d.getDay(),
        record: dailyRecords[dateStr] || null
      });
    }
    return arr;
  }, [dailyRecords]);

  // Streaks & metrics
  const { maxStreak, redFreeStreak, totalRated, colorCounts } = useMemo(() => {
    let currentStreak = 0;
    let max = 0;
    let redFree = 0;
    const counts: Record<Exclude<DayColor, null>, number> = {
      gold: 0,
      green: 0,
      orange: 0,
      yellow: 0,
      red: 0
    };

    // Calculate streaks going backwards from today
    const checkDate = new Date();
    let countingGreen = true;
    let countingRedFree = true;

    for (let i = 0; i < 90; i++) {
      const year = checkDate.getFullYear();
      const month = String(checkDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkDate.getDate()).padStart(2, '0');
      const dStr = `${year}-${month}-${day}`;
      const rec = dailyRecords[dStr];

      if (rec?.color) {
        counts[rec.color] = (counts[rec.color] || 0) + 1;
      }

      if (countingGreen) {
        if (rec?.color === 'green' || rec?.color === 'gold') {
          currentStreak++;
          if (currentStreak > max) max = currentStreak;
        } else {
          if (i > 0) countingGreen = false;
        }
      }

      if (countingRedFree) {
        if (rec?.color && rec.color !== 'red') {
          redFree++;
        } else if (rec?.color === 'red') {
          countingRedFree = false;
        }
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    const rated = Object.values(dailyRecords).filter(r => r.color).length;
    return { maxStreak: max, redFreeStreak: redFree, totalRated: rated, colorCounts: counts };
  }, [dailyRecords]);

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedColor) {
      setFeedbackMsg('Select a color rating');
      return;
    }
    if (!note.trim() || note.trim().length < 4) {
      setFeedbackMsg('Add a factual reflection note');
      return;
    }

    setSubmitting(true);
    try {
      await recordReview(selectedColor, note.trim());
      setFeedbackMsg('Calibration logged');
      if (selectedColor === 'green' || selectedColor === 'gold') {
        confetti({ particleCount: 25, spread: 40, origin: { y: 0.6 } });
      }
      setTimeout(() => setFeedbackMsg(null), 2500);
    } catch (err: any) {
      setFeedbackMsg(err?.message || 'Error saving');
    } finally {
      setSubmitting(false);
    }
  };

  // Past reviews sorted descending
  const pastReviewsList = useMemo(() => {
    return Object.values(dailyRecords)
      .filter(r => r.color)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [dailyRecords]);

  const colorKeys: (Exclude<DayColor, null>)[] = ['red', 'yellow', 'orange', 'green', 'gold'];

  return (
    <div className="space-y-3.5 max-w-4xl pb-16">
      {/* 1. Precision Stat cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className={`p-3 rounded-lg border ${
          isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
        }`}>
          <span className="text-[10px] text-[#7d7a96] font-mono uppercase tracking-wider block">
            PEAK GREEN/GOLD
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-wider ${
              isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
            }`}>
              {maxStreak}
            </span>
            <span className="text-[10px] font-mono text-[#7d7a96]">DAYS</span>
          </div>
          <p className="text-[9px] font-mono text-[#7d7a96] mt-0.5 uppercase">Consecutive high discipline</p>
        </div>

        <div className={`p-3 rounded-lg border ${
          isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
        }`}>
          <span className="text-[10px] text-[#7d7a96] font-mono uppercase tracking-wider block">
            RED-FREE STREAK
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-wider text-emerald-400">
              {redFreeStreak}
            </span>
            <span className="text-[10px] font-mono text-[#7d7a96]">DAYS</span>
          </div>
          <p className="text-[9px] font-mono text-[#7d7a96] mt-0.5 uppercase">Zero moral relapse</p>
        </div>

        <div className={`p-3 rounded-lg border ${
          isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
        }`}>
          <span className="text-[10px] text-[#7d7a96] font-mono uppercase tracking-wider block">
            CALIBRATIONS STORED
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-wider ${
              isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
            }`}>
              {totalRated}
            </span>
            <span className="text-[10px] font-mono text-[#7d7a96]">DAYS</span>
          </div>
          <p className="text-[9px] font-mono text-[#7d7a96] mt-0.5 uppercase">Telemetry history</p>
        </div>
      </div>

      {/* 2. 10-Week Accountability Matrix */}
      <section className={`p-3.5 sm:p-4 rounded-lg space-y-3 border ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <div className="flex items-center justify-between pb-2 border-b border-inherit border-opacity-10 text-xs">
          <div className="flex items-center gap-1.5 font-mono">
            <span className={`font-semibold tracking-tight uppercase text-xs ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
              10-Week Accountability Matrix
            </span>
            <span className="text-[#7d7a96] text-[10px]">·</span>
            <span className="text-[10px] text-[#7d7a96]">Select cell to calibrate date</span>
          </div>
        </div>

        <div className="p-3 rounded-md bg-black/25 overflow-x-auto">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[480px]">
            {daysArray.map((day) => {
              const colorKey = day.record?.color;
              const colorDef = colorKey ? COLOR_DEFINITIONS[colorKey] : null;
              const isSelected = day.date === selectedDate;

              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedDate(day.date)}
                  className={`w-3.5 h-3.5 rounded-xs transition-all hover:scale-125 hover:z-10 relative group cursor-pointer focus:outline-none ${
                    isSelected ? 'ring-2 ring-[#ece9fb] ring-offset-1 ring-offset-[#131320]' : ''
                  }`}
                  style={{
                    backgroundColor: colorDef ? colorDef.hex : (isDark ? 'rgba(236, 233, 251, 0.08)' : 'rgba(24, 23, 43, 0.08)')
                  }}
                >
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/95 text-[9px] text-[#ece9fb] px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-30 font-mono border border-white/10 shadow-xl">
                    <span className="font-semibold">{day.date}</span>: {colorDef ? colorDef.label : 'Unreviewed'}
                    {day.record?.note && (
                      <p className="text-[#7d7a96] text-[8px] max-w-xs truncate">{day.record.note}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Color Key */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.04] text-[10px] font-mono text-[#7d7a96]">
            <span>SCALE:</span>
            <div className="flex items-center gap-2.5">
              {colorKeys.map((c) => (
                <span key={c} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs inline-block" style={{ backgroundColor: COLOR_DEFINITIONS[c].hex }} />
                  <span className="text-[#7d7a96]">{COLOR_DEFINITIONS[c].label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Day Reflection Form */}
        <div className={`p-3 rounded-md border ${
          isDark ? 'bg-[#0a0a0f] border-white/[0.08]' : 'bg-[#f9f8fd] border-[#e7e4f4]'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-mono font-semibold uppercase ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
              Calibrate Date: {selectedDate}
            </span>
            {currentColor && (
              <span className="text-[10px] font-mono text-[#7d7a96] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLOR_DEFINITIONS[currentColor].hex }} />
                {COLOR_DEFINITIONS[currentColor].label}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveReview} className="space-y-2">
            <div className="flex items-center gap-3">
              {colorKeys.map((colKey) => {
                const item = COLOR_DEFINITIONS[colKey];
                const isSelected = selectedColor === colKey;

                return (
                  <button
                    key={colKey}
                    type="button"
                    onClick={() => setSelectedColor(colKey)}
                    className="p-1 cursor-pointer flex items-center justify-center transition-all focus:outline-none"
                    title={`${item.label}: ${item.description}`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                        isSelected
                          ? 'scale-125 ring-2 ring-[#ece9fb] ring-offset-2 ring-offset-[#0a0a0f]'
                          : 'opacity-65 hover:opacity-100 hover:scale-110'
                      }`}
                      style={{ backgroundColor: item.hex }}
                    />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                required
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Factual reflection note for this date..."
                className={`flex-1 rounded-md px-2.5 py-1 text-xs focus:outline-none placeholder:text-[#7d7a96] ${
                  isDark 
                    ? 'bg-[#131320] text-[#ece9fb] border border-white/[0.08] focus:border-[#8b7bff]' 
                    : 'bg-white text-[#18172b] border border-[#e7e4f4] focus:border-[#7c5ef0]'
                }`}
              />
              <button
                type="submit"
                disabled={submitting}
                className={`px-3 py-1 rounded-md font-semibold text-[11px] font-mono transition-colors cursor-pointer shrink-0 uppercase tracking-wider ${
                  isDark 
                    ? 'bg-[#8b7bff] text-[#0a0a0f] hover:bg-[#9d8fff]' 
                    : 'bg-[#7c5ef0] text-white hover:bg-[#6e4ee6]'
                }`}
              >
                {submitting ? '...' : (currentColor ? 'Update' : 'Calibrate')}
              </button>
            </div>
            {feedbackMsg && (
              <div className="text-[10px] text-right font-mono text-[#8b7bff]">
                {feedbackMsg}
              </div>
            )}
          </form>
        </div>
      </section>

      {/* 3. Chronological Past Reviews List */}
      <section className={`p-3.5 sm:p-4 rounded-lg space-y-3 border ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <div className="flex items-center justify-between pb-2 border-b border-inherit border-opacity-10 text-xs font-mono uppercase">
          <span className={`font-semibold tracking-tight ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
            Historical Calibrations
          </span>
          <span className="text-[#7d7a96] text-[10px]">
            {pastReviewsList.length} LOGGED
          </span>
        </div>

        <div className="space-y-1.5 divide-y divide-inherit divide-opacity-5">
          {pastReviewsList.length === 0 ? (
            <div className="py-6 text-center text-[#7d7a96] text-[11px] font-mono">
              No historical calibrations recorded.
            </div>
          ) : (
            pastReviewsList.map((r) => {
              const def = r.color ? COLOR_DEFINITIONS[r.color] : null;
              return (
                <div 
                  key={r.date} 
                  className={`pt-2 flex items-start justify-between gap-3 text-xs cursor-pointer group transition-colors ${
                    r.date === selectedDate ? 'bg-white/[0.03] p-1.5 rounded-md' : ''
                  }`}
                  onClick={() => setSelectedDate(r.date)}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                      style={{ backgroundColor: def?.hex || '#71717a' }}
                      title={def?.label}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-[#ece9fb] dark:text-[#ece9fb] light:text-[#18172b]">
                          {r.date}
                        </span>
                        <span className="text-[10px] font-mono text-[#7d7a96] uppercase">
                          {def?.label}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-0.5 ${isDark ? 'text-[#ece9fb]/80' : 'text-[#18172b]/80'}`}>
                        {r.note || 'No notes entered.'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-[#7d7a96] shrink-0">
                    {r.completedHabitIds?.length || 0} habits
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
