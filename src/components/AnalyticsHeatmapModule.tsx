import React from 'react';
import { useApp, getLocalDateString } from '../context/AppContext';
import { COLOR_DEFINITIONS, DayColor } from '../types';
import { 
  Trophy, 
  Calendar as CalendarIcon, 
  Flame, 
  ShieldCheck, 
  Sparkles,
  PieChart
} from 'lucide-react';

export const AnalyticsHeatmapModule: React.FC = () => {
  const { dailyRecords, setSelectedDate } = useApp();

  // Generate 70 days (10 weeks) for GitHub-style timeline heatmap
  const totalDays = 70;
  const daysArray = Array.from({ length: totalDays }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (totalDays - 1 - i));
    const dateStr = getLocalDateString(d);
    const record = dailyRecords[dateStr];
    return {
      date: dateStr,
      dayOfWeek: d.getDay(),
      record
    };
  });

  // Calculate streaks
  let currentStreak = 0;
  let maxStreak = 0;
  let redFreeStreak = 0;

  const sortedDates = Object.keys(dailyRecords).sort();
  for (const dateKey of sortedDates) {
    const rec = dailyRecords[dateKey];
    if (rec.color === 'green' || rec.color === 'gold') {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
    }

    if (rec.color && rec.color !== 'red') {
      redFreeStreak++;
    } else if (rec.color === 'red') {
      redFreeStreak = 0;
    }
  }

  // Count distribution of colors
  const colorCounts: Record<string, number> = {
    gold: 0,
    green: 0,
    orange: 0,
    yellow: 0,
    red: 0,
    unrated: 0
  };

  Object.values(dailyRecords).forEach(r => {
    if (r.color) {
      colorCounts[r.color] = (colorCounts[r.color] || 0) + 1;
    } else {
      colorCounts.unrated = (colorCounts.unrated || 0) + 1;
    }
  });

  const totalRated = Object.values(dailyRecords).filter(r => r.color).length;

  return (
    <section className="bg-[#121922] rounded-2xl p-3 sm:p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-semibold text-white tracking-tight">Heatmap</h2>
            <span className="text-zinc-600 text-xs">·</span>
            <span className="text-[11px] text-zinc-400 font-mono tabular-nums">
              10-week matrix
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
            Visual record of daily performance. Tap to navigate.
          </p>
        </div>
      </div>

      {/* Streak & Metric Summaries */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 sm:p-2.5 rounded-xl bg-[#0b0f14]">
          <span className="text-[10px] text-zinc-500 font-medium block">Best Streak</span>
          <div className="text-xs sm:text-sm font-bold text-white font-mono tabular-nums mt-0.5">
            {maxStreak}d
          </div>
        </div>

        <div className="p-2 sm:p-2.5 rounded-xl bg-[#0b0f14]">
          <span className="text-[10px] text-zinc-500 font-medium block">Red-Free</span>
          <div className="text-xs sm:text-sm font-bold text-emerald-400 font-mono tabular-nums mt-0.5">
            {redFreeStreak}d
          </div>
        </div>

        <div className="p-2 sm:p-2.5 rounded-xl bg-[#0b0f14]">
          <span className="text-[10px] text-zinc-500 font-medium block">Logged</span>
          <div className="text-xs sm:text-sm font-bold text-zinc-200 font-mono tabular-nums mt-0.5">
            {totalRated}d
          </div>
        </div>
      </div>

      {/* 10-Week Matrix */}
      <div>
        <div className="flex items-center justify-between mb-2 text-[11px]">
          <span className="font-semibold text-zinc-300">Activity Grid</span>
          <span className="text-zinc-500 text-[10px]">Tap cell to navigate</span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#0b0f14] overflow-x-auto">
          <div className="grid grid-flow-col grid-rows-7 gap-1 min-w-[360px]">
            {daysArray.map((day) => {
              const colorKey = day.record?.color;
              const colorDef = colorKey ? COLOR_DEFINITIONS[colorKey] : null;

              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedDate(day.date)}
                  className="w-3 h-3 rounded-xs transition-all hover:scale-125 hover:z-10 relative group cursor-pointer focus:outline-none"
                  style={{
                    backgroundColor: colorDef ? colorDef.hex : 'rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 border border-white/20 text-[9px] text-white px-1.5 py-0.5 rounded shadow-xl pointer-events-none whitespace-nowrap z-30">
                    <span className="font-semibold">{day.date}</span>: {colorDef ? colorDef.label : 'Unreviewed'}
                    {day.record?.note && (
                      <p className="text-zinc-400 text-[8px] max-w-xs truncate">{day.record.note}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Color Key */}
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/[0.04] text-[10px] text-zinc-400">
            <span className="text-zinc-500">Legend:</span>
            <div className="flex items-center gap-2">
              {(['red', 'yellow', 'orange', 'green', 'gold'] as Exclude<DayColor, null>[]).map((c) => (
                <span key={c} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs inline-block" style={{ backgroundColor: COLOR_DEFINITIONS[c].hex }} />
                  <span className="text-zinc-300">{COLOR_DEFINITIONS[c].label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Breakdown */}
      <div className="pt-1">
        <span className="text-[11px] font-semibold text-zinc-400 block mb-2">Rating Breakdown</span>
        <div className="space-y-1.5">
          {(['gold', 'green', 'orange', 'yellow', 'red'] as Exclude<DayColor, null>[]).map((col) => {
            const count = colorCounts[col] || 0;
            const pct = totalRated > 0 ? Math.round((count / totalRated) * 100) : 0;
            const def = COLOR_DEFINITIONS[col];

            return (
              <div key={col} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 w-24">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: def.hex }} />
                  <span className="text-zinc-300 font-medium">{def.label}</span>
                </div>

                <div className="flex-1 mx-2.5 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: def.hex
                    }}
                  />
                </div>

                <span className="font-mono tabular-nums text-zinc-500 text-[10px] w-14 text-right">
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
