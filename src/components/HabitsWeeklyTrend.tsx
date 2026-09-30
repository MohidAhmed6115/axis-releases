import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { TrendingUp, CheckCircle2, Award, Calendar } from 'lucide-react';

interface WeeklyTrendPoint {
  date: string;
  day: string;
  fullDate: string;
  rate: number;
  completed: number;
  total: number;
}

export const HabitsWeeklyTrend: React.FC = () => {
  const { habits, dailyRecords, selectedDate } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Compute habit completion percentages for the last 7 days
  const { weeklyData, avgRate, bestDay, todayRate } = useMemo(() => {
    const list: WeeklyTrendPoint[] = [];
    const today = new Date();
    
    // Non-archived active habits
    const activeHabits = habits.filter(h => !h.archived);
    const totalHabits = activeHabits.length;

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const dayName = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const fullDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const record = dailyRecords[dateStr];
      const completedCount = record?.completedHabitIds?.length || 0;
      const rate = totalHabits > 0 
        ? Math.min(100, Math.round((completedCount / totalHabits) * 100)) 
        : 0;

      list.push({
        date: dateStr,
        day: dayName,
        fullDate,
        rate,
        completed: completedCount,
        total: totalHabits
      });
    }

    const sum = list.reduce((acc, curr) => acc + curr.rate, 0);
    const avg = Math.round(sum / (list.length || 1));
    
    // Find best day
    let best = list[0];
    for (const item of list) {
      if (item.rate > (best?.rate || 0)) {
        best = item;
      }
    }

    const todayItem = list[list.length - 1];

    return {
      weeklyData: list,
      avgRate: avg,
      bestDay: best,
      todayRate: todayItem?.rate || 0
    };
  }, [habits, dailyRecords]);

  // Custom sleek tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: WeeklyTrendPoint = payload[0].payload;
      return (
        <div className={`p-2.5 rounded-md border text-xs ${
          isDark 
            ? 'bg-[#1c1c2e] border-white/10 text-[#ece9fb]' 
            : 'bg-white border-[#e7e4f4] text-[#18172b]'
        }`}>
          <div className="flex items-center gap-1.5 font-mono text-[11px] mb-1">
            <Calendar className="w-3 h-3 text-[#7d7a96]" />
            <span>{data.fullDate} ({data.day})</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-[11px]">
            <span className="text-[#7d7a96]">Completion:</span>
            <span className="font-mono font-bold tabular-nums text-[#8b7bff]">{data.rate}%</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-[10px] text-[#7d7a96] mt-0.5">
            <span>Completed:</span>
            <span className="font-mono tabular-nums">{data.completed} of {data.total} habits</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const chartColor = isDark ? '#8b7bff' : '#7c5ef0';
  const dialTeal = '#2dd4bf';

  return (
    <div className={`rounded-lg p-3.5 sm:p-4 border ${
      isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-inherit border-opacity-10">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#8b7bff] stroke-[2]" />
            <h3 className={`text-xs sm:text-sm font-semibold font-mono uppercase tracking-tight ${
              isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
            }`}>
              Weekly Telemetry Trend
            </h3>
            <span className="text-[#7d7a96] text-[10px]">·</span>
            <span className="text-[10px] text-[#7d7a96] font-mono">7-DAY RECORD</span>
          </div>
          <p className="text-[11px] text-[#7d7a96] mt-0.5">
            Daily habit execution telemetry across active routines
          </p>
        </div>

        {/* Stats Readout Blocks */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-[11px]">
          <div className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
            isDark ? 'bg-[#1c1c2e] border-white/[0.08]' : 'bg-[#f3f1fb] border-[#e7e4f4]'
          }`}>
            <span className="text-[#7d7a96] font-mono text-[10px]">7D AVG:</span>
            <span className="font-mono font-bold tabular-nums tracking-wide text-[#ece9fb] dark:text-[#ece9fb] light:text-[#18172b]">{avgRate}%</span>
          </div>

          <div className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
            isDark ? 'bg-[#1c1c2e] border-white/[0.08]' : 'bg-[#f3f1fb] border-[#e7e4f4]'
          }`}>
            <span className="text-[#7d7a96] font-mono text-[10px]">TODAY:</span>
            <span className="font-mono font-bold tabular-nums tracking-wide text-[#ece9fb] dark:text-[#ece9fb] light:text-[#18172b]">{todayRate}%</span>
          </div>

          {bestDay && bestDay.rate > 0 && (
            <div className={`hidden md:flex px-2.5 py-1 rounded-md border items-center gap-1.5 ${
              isDark ? 'bg-[#1c1c2e] border-white/[0.08]' : 'bg-[#f3f1fb] border-[#e7e4f4]'
            }`}>
              <Award className="w-3 h-3 text-[#2dd4bf]" />
              <span className="text-[#7d7a96] font-mono text-[10px]">PEAK:</span>
              <span className="font-mono font-semibold tabular-nums text-[#2dd4bf]">{bestDay.day} ({bestDay.rate}%)</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-3.5 h-48 sm:h-52 w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart 
            data={weeklyData} 
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="habitRateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop 
                  offset="5%" 
                  stopColor={chartColor} 
                  stopOpacity={isDark ? 0.35 : 0.25} 
                />
                <stop 
                  offset="95%" 
                  stopColor={chartColor} 
                  stopOpacity={0.0} 
                />
              </linearGradient>
            </defs>

            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke={isDark ? 'rgba(236,233,251,0.06)' : 'rgba(24,23,43,0.06)'} 
            />

            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ 
                fill: isDark ? '#7d7a96' : '#7d7a96', 
                fontSize: 10,
                fontFamily: 'JetBrains Mono' 
              }} 
            />

            <YAxis 
              domain={[0, 100]} 
              ticks={[0, 25, 50, 75, 100]}
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(v) => `${v}%`}
              tick={{ 
                fill: isDark ? '#7d7a96' : '#7d7a96', 
                fontSize: 9,
                fontFamily: 'JetBrains Mono' 
              }} 
            />

            {/* Secondary Dial Teal Reference Line (Exclusive chart-only reference) */}
            <ReferenceLine 
              y={80} 
              stroke={dialTeal} 
              strokeDasharray="4 4" 
              strokeWidth={1.5}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area 
              type="monotone" 
              dataKey="rate" 
              stroke={chartColor} 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#habitRateGradient)" 
              dot={{ 
                r: 3, 
                fill: isDark ? '#0a0a0f' : '#ffffff', 
                stroke: chartColor, 
                strokeWidth: 2 
              }}
              activeDot={{ 
                r: 5, 
                fill: chartColor, 
                stroke: isDark ? '#ece9fb' : '#18172b', 
                strokeWidth: 2 
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
