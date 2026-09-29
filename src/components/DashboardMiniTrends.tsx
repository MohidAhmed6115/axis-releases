import React, { useMemo, useState } from 'react';
import { useApp, getLocalDateString } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { COLOR_DEFINITIONS, DayColor } from '../types';

export const DashboardMiniTrends: React.FC = () => {
  const { dailyRecords, habits } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [timeframe, setTimeframe] = useState<'7' | '30'>('7');
  const daysCount = timeframe === '7' ? 7 : 30;

  // Compute habit completion % per day for the sparkline
  const trendData = useMemo(() => {
    const list: { date: string; display: string; rate: number; color: DayColor }[] = [];
    const base = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      const dStr = getLocalDateString(d);
      const rec = dailyRecords[dStr];
      const completedCount = rec?.completedHabitIds?.length || 0;
      const rate = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
      
      list.push({
        date: dStr,
        display: `${d.getMonth() + 1}/${d.getDate()}`,
        rate,
        color: rec?.color || null
      });
    }
    return list;
  }, [dailyRecords, habits, daysCount]);

  // Color distribution counts over this timeframe
  const colorCounts = useMemo(() => {
    const counts: Record<Exclude<DayColor, null>, number> = {
      gold: 0,
      green: 0,
      orange: 0,
      yellow: 0,
      red: 0
    };
    trendData.forEach(item => {
      if (item.color) {
        counts[item.color]++;
      }
    });
    return counts;
  }, [trendData]);

  const ratedTotal = Object.values(colorCounts).reduce((a, b) => a + b, 0);
  const avgRate = Math.round(trendData.reduce((acc, c) => acc + c.rate, 0) / (trendData.length || 1));

  // Dial teal (#2dd4bf) used exclusively as secondary chart reference benchmark
  const dialTeal = '#2dd4bf';

  return (
    <div className={`p-3 sm:p-3.5 rounded-lg border ${
      isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
    }`}>
      {/* Header with 7/30d switcher */}
      <div className="flex items-center justify-between pb-2 border-b border-inherit border-opacity-10 text-xs">
        <div className="flex items-center gap-1.5 font-mono">
          <span className={`font-semibold uppercase tracking-wider text-xs ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
            Glanceable Telemetry
          </span>
          <span className="text-[#7d7a96] text-[10px]">·</span>
          <span className="text-[10px] text-[#7d7a96]">Habit rate & review distribution</span>
        </div>

        <div className={`flex items-center p-0.5 rounded-md border text-[10px] font-mono ${
          isDark ? 'bg-[#1c1c2e] border-white/[0.08]' : 'bg-[#f3f1fb] border-[#e7e4f4]'
        }`}>
          <button
            type="button"
            onClick={() => setTimeframe('7')}
            className={`px-2 py-0.5 rounded font-medium transition-all cursor-pointer ${
              timeframe === '7'
                ? isDark 
                  ? 'bg-[#131320] text-[#ece9fb] font-semibold border border-white/[0.08]' 
                  : 'bg-white text-[#18172b] font-semibold border border-[#e7e4f4]'
                : 'text-[#7d7a96]'
            }`}
          >
            7D
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('30')}
            className={`px-2 py-0.5 rounded font-medium transition-all cursor-pointer ${
              timeframe === '30'
                ? isDark 
                  ? 'bg-[#131320] text-[#ece9fb] font-semibold border border-white/[0.08]' 
                  : 'bg-white text-[#18172b] font-semibold border border-[#e7e4f4]'
                : 'text-[#7d7a96]'
            }`}
          >
            30D
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2.5">
        {/* Left: Mini sparkline / bar chart of habit completion rate */}
        <div>
          <div className="flex items-center justify-between text-[10px] text-[#7d7a96] mb-1.5 font-mono uppercase">
            <span>Habit Completion Rate</span>
            <div className="flex items-center gap-2">
              <span className="text-[#2dd4bf]">REF: 80%</span>
              <span className="tabular-nums font-bold text-[#ece9fb] dark:text-[#ece9fb] light:text-[#18172b]">
                AVG {avgRate}%
              </span>
            </div>
          </div>

          <div className="h-14 flex items-end gap-1 px-1 py-1 rounded-md bg-black/20 overflow-hidden relative">
            {/* Secondary Reference Benchmark line inside chart (#2dd4bf dial teal) */}
            <div 
              className="absolute left-0 right-0 border-t border-dashed pointer-events-none z-10" 
              style={{ bottom: '80%', borderColor: dialTeal, opacity: 0.55 }}
              title="80% Discipline Reference Benchmark"
            />

            {trendData.map((d, i) => {
              const h = Math.max(8, d.rate);
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative z-20"
                >
                  <div
                    className="w-full rounded-xs transition-all group-hover:brightness-125"
                    style={{
                      height: `${h}%`,
                      backgroundColor: d.color ? COLOR_DEFINITIONS[d.color].hex : (isDark ? '#3f3f46' : '#cbd5e1')
                    }}
                  />
                  {/* Tooltip */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black/95 text-white text-[9px] px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-30 font-mono border border-white/10">
                    {d.date}: {d.rate}%
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-[#7d7a96] mt-1">
            <span>{trendData[0]?.display}</span>
            <span>TODAY</span>
          </div>
        </div>

        {/* Right: Color distribution bar & counts */}
        <div>
          <div className="flex items-center justify-between text-[10px] text-[#7d7a96] mb-1.5 font-mono uppercase">
            <span>Daily Review Quality</span>
            <span className="tabular-nums">{ratedTotal}/{daysCount} LOGGED</span>
          </div>

          {/* Stacked bar representing color proportion */}
          <div className="h-6 flex rounded-md overflow-hidden bg-black/25">
            {(['gold', 'green', 'orange', 'yellow', 'red'] as const).map(color => {
              const count = colorCounts[color];
              if (count === 0) return null;
              const pct = (count / (ratedTotal || 1)) * 100;
              const def = COLOR_DEFINITIONS[color];
              return (
                <div
                  key={color}
                  className="h-full transition-all group relative cursor-pointer"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: def.hex
                  }}
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/95 text-white text-[9px] px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-30 font-mono border border-white/10">
                    {def.label}: {count} days ({Math.round(pct)}%)
                  </div>
                </div>
              );
            })}
            {ratedTotal === 0 && (
              <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-[#7d7a96]">
                No evaluations yet
              </div>
            )}
          </div>

          {/* Legend counts */}
          <div className="flex items-center justify-between mt-2 text-[9px] font-mono">
            {(['gold', 'green', 'orange', 'yellow', 'red'] as const).map(color => {
              const def = COLOR_DEFINITIONS[color];
              return (
                <div key={color} className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: def.hex }} />
                  <span className="text-[#7d7a96]">{colorCounts[color]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
