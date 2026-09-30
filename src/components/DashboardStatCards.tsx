import React, { useMemo } from 'react';
import { useApp, getLocalDateString } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { COLOR_DEFINITIONS, DayColor } from '../types';
import { CompassDialGauge } from './CompassDialGauge';
import { 
  CheckCircle2, 
  ListTodo, 
  Flame, 
  Calendar as CalendarIcon,
  Activity,
  Compass
} from 'lucide-react';
import { countLoggedPrayers, countBajamatPrayers } from '../services/salahService';

export const DashboardStatCards: React.FC = () => {
  const { 
    habits, 
    tasks, 
    dailyRecords, 
    calendarEvents, 
    salahRecords,
    selectedDate 
  } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Salah Today counts
  const currentSalah = salahRecords[selectedDate];
  const salahLoggedCount = countLoggedPrayers(currentSalah);
  const salahBajamatCount = countBajamatPrayers(currentSalah);

  // 1. Habit Completion % Today
  const currentRecord = dailyRecords[selectedDate];
  const completedHabits = currentRecord?.completedHabitIds || [];
  const activeHabits = habits.filter(h => !h.archived);
  const habitPct = activeHabits.length > 0 
    ? Math.round((completedHabits.length / activeHabits.length) * 100) 
    : 0;

  // 2. Task Completion % Today
  const todaysTasks = tasks.filter(t => !t.dueDate || t.dueDate === selectedDate);
  const completedTasks = todaysTasks.filter(t => t.completed);
  const taskPct = todaysTasks.length > 0 
    ? Math.round((completedTasks.length / todaysTasks.length) * 100) 
    : 0;

  // 3. Current Streak (days of consecutive green/gold rating up to today)
  const currentStreak = useMemo(() => {
    let streak = 0;
    const checkDate = new Date();
    for (let i = 0; i < 90; i++) {
      const dStr = getLocalDateString(checkDate);
      const rec = dailyRecords[dStr];
      if (rec?.color === 'green' || rec?.color === 'gold') {
        streak++;
      } else {
        if (i === 0 && !rec?.color) {
          // If today isn't rated yet, check from yesterday without breaking
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  }, [dailyRecords]);

  // 4. Past 7 days quality evaluation
  const weekColors = useMemo(() => {
    const list: { date: string; color: DayColor }[] = [];
    const base = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      const dStr = getLocalDateString(d);
      list.push({ date: dStr, color: dailyRecords[dStr]?.color || null });
    }
    return list;
  }, [dailyRecords]);

  // Win rate: % of rated days that were green or gold in the past 7 days
  const winRate = useMemo(() => {
    const rated = weekColors.filter(w => w.color !== null);
    if (rated.length === 0) return 0;
    const wins = rated.filter(w => w.color === 'green' || w.color === 'gold').length;
    return Math.round((wins / rated.length) * 100);
  }, [weekColors]);

  // 5. Upcoming calendar events count
  const upcomingEventsCount = useMemo(() => {
    const now = new Date();
    return calendarEvents.filter(ev => {
      try {
        const evStart = new Date(ev.startTime);
        return evStart >= now || ev.startTime.startsWith(selectedDate);
      } catch {
        return false;
      }
    }).length;
  }, [calendarEvents, selectedDate]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
      {/* Primary Compass-Dial Gauge: The one deliberately bold visual instrument per screen */}
      <div className={`md:col-span-5 p-3.5 sm:p-4 rounded-lg border flex flex-col items-center justify-between ${
        isDark 
          ? 'bg-[#131320] border-white/[0.08]' 
          : 'bg-white border-[#e7e4f4]'
      }`}>
        <div className="w-full flex items-center justify-between text-[10px] font-mono tracking-wider uppercase mb-1">
          <span className="text-[#7d7a96] font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8b7bff] inline-block animate-pulse" />
            INSTRUMENT CLUSTER
          </span>
          <span className="text-[#7d7a96]">AXIS DIAL</span>
        </div>

        <CompassDialGauge
          value={habitPct}
          targetValue={80}
          label="HABIT EXECUTION"
          sublabel={`${completedHabits.length} of ${activeHabits.length} habits calibrated`}
          isDark={isDark}
          className="my-auto py-1"
        />

        <div className="w-full pt-2.5 mt-1 border-t border-inherit border-opacity-10 flex items-center justify-between text-[10px] font-mono text-[#7d7a96]">
          <span>TARGET: 80% DISCIPLINE</span>
          <span className="tabular-nums">CALIBRATED TODAY</span>
        </div>
      </div>

      {/* Supporting Instrument Telemetry Grid: precision stat blocks */}
      <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 font-sans">
        {/* Cell 1: Salah Today */}
        <div className={`p-3 rounded-lg border flex flex-col justify-between ${
          isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
        }`}>
          <div className="flex items-center justify-between text-[#6b6882] dark:text-[#8d8aab] text-xs font-medium">
            <span>Salah logged</span>
            <Compass className="w-3.5 h-3.5 text-[#6b6882] dark:text-[#8d8aab] stroke-[1.75]" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-normal leading-none ${
                isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
              }`}>
                {salahLoggedCount}/5
              </span>
              <span className="text-xs text-[#6b6882] dark:text-[#8d8aab] font-sans">prayers</span>
            </div>
            <div className="text-xs text-[#6b6882] dark:text-[#8d8aab] font-sans mt-1 truncate">
              {salahBajamatCount} in congregation (bajamat)
            </div>
          </div>
          <div className="w-full bg-white/[0.06] h-1 rounded-sm overflow-hidden">
            <div 
              className="bg-[#7d7a96] dark:bg-[#ece9fb] h-full rounded-sm transition-all duration-300"
              style={{ width: `${(salahLoggedCount / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Cell 2: Tasks Today */}
        <div className={`p-3 rounded-lg border flex flex-col justify-between ${
          isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
        }`}>
          <div className="flex items-center justify-between text-[#6b6882] dark:text-[#8d8aab] text-xs font-medium">
            <span>Tasks completed</span>
            <ListTodo className="w-3.5 h-3.5 text-[#6b6882] dark:text-[#8d8aab] stroke-[1.75]" />
          </div>
          <div className="my-2">
            <div className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-normal leading-none ${
              isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
            }`}>
              {taskPct}%
            </div>
            <div className="text-xs text-[#6b6882] dark:text-[#8d8aab] font-sans mt-1">
              {completedTasks.length} of {todaysTasks.length} tasks completed
            </div>
          </div>
          <div className="w-full bg-white/[0.06] h-1 rounded-sm overflow-hidden">
            <div 
              className="bg-[#8b7bff] h-full rounded-sm transition-all duration-300"
              style={{ width: `${taskPct}%` }}
            />
          </div>
        </div>

        {/* Cell 3: Consecutive Streak */}
        <div className={`p-3 rounded-lg border flex flex-col justify-between ${
          isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
        }`}>
          <div className="flex items-center justify-between text-[#6b6882] dark:text-[#8d8aab] text-xs font-medium">
            <span>Discipline streak</span>
            <Flame className="w-3.5 h-3.5 text-amber-500 stroke-[1.75]" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-normal leading-none ${
                isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
              }`}>
                {currentStreak}
              </span>
              <span className="text-xs text-[#6b6882] dark:text-[#8d8aab] font-sans">days</span>
            </div>
            <div className="text-xs text-[#6b6882] dark:text-[#8d8aab] font-sans mt-1">
              Consecutive green / gold
            </div>
          </div>
          <div className="text-xs text-[#6b6882] dark:text-[#8d8aab] truncate font-sans">
            {currentStreak > 0 ? 'Accumulating velocity' : "Awaiting today's rating"}
          </div>
        </div>

        {/* Cell 4: 7-Day Performance Ratio */}
        <div className={`p-3 rounded-lg border flex flex-col justify-between ${
          isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
        }`}>
          <div className="flex items-center justify-between text-[#6b6882] dark:text-[#8d8aab] text-xs font-medium">
            <span>7-day win rate</span>
            <Activity className="w-3.5 h-3.5 text-[#6b6882] dark:text-[#8d8aab] stroke-[1.75]" />
          </div>
          <div className="my-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-normal leading-none ${
                isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
              }`}>
                {winRate}%
              </span>
              <span className="text-xs text-[#6b6882] dark:text-[#8d8aab] font-sans">ratio</span>
            </div>
            {/* 7-Day Spectrum Bar */}
            <div className="flex items-center gap-1 h-2 mt-2">
              {weekColors.map((w, idx) => {
                const def = w.color ? COLOR_DEFINITIONS[w.color] : null;
                return (
                  <div
                    key={idx}
                    className="flex-1 h-full rounded-xs transition-opacity"
                    style={{
                      backgroundColor: def ? def.hex : (isDark ? 'rgba(236,233,251,0.1)' : 'rgba(24,23,43,0.1)')
                    }}
                    title={`${w.date}: ${def ? def.label : 'Unreviewed'}`}
                  />
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-sans text-[#6b6882] dark:text-[#8d8aab]">
            <span>-6 days</span>
            <span>Today</span>
          </div>
        </div>

        {/* Cell 5: Upcoming Schedule */}
        <div className={`p-3 rounded-lg border flex flex-col justify-between ${
          isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
        }`}>
          <div className="flex items-center justify-between text-[#6b6882] dark:text-[#8d8aab] text-xs font-medium">
            <span>Upcoming events</span>
            <CalendarIcon className="w-3.5 h-3.5 text-[#6b6882] dark:text-[#8d8aab] stroke-[1.75]" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-normal leading-none ${
                isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
              }`}>
                {upcomingEventsCount}
              </span>
              <span className="text-xs text-[#6b6882] dark:text-[#8d8aab] font-sans">events</span>
            </div>
            <div className="text-xs text-[#6b6882] dark:text-[#8d8aab] font-sans mt-1">
              Active on schedule
            </div>
          </div>
          <div className="text-xs font-sans text-[#6b6882] dark:text-[#8d8aab] truncate">
            Google Calendar synced
          </div>
        </div>
      </div>
    </div>
  );
};
