import React, { useState } from 'react';
import { useApp, getLocalDateString } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { PRAYER_CONFIG, PrayerName, PrayerStatus, createDefaultSalahRecord } from '../types';
import { PrayerToggleGroup, SoloPrayerIcon, BajamatPrayerIcon } from './PrayerIcons';
import { computeSalahStats, getPast7DaysSalahGrid } from '../services/salahService';
import { PrayerReminderModal } from './PrayerReminderModal';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Flame, 
  Trophy, 
  Users, 
  CheckCircle,
  ShieldCheck,
  Compass,
  Bell,
  Clock
} from 'lucide-react';

export const SalahPage: React.FC = () => {
  const { 
    salahRecords, 
    updateSalahPrayer, 
    selectedDate, 
    setSelectedDate,
    salahAsAnchorHabit,
    prayerReminders,
    prayerReminderSettings
  } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const activeRemindersCount = Object.values(prayerReminders || {}).filter(r => r?.enabled).length;

  const todayStr = getLocalDateString();
  const activeRecord = salahRecords[selectedDate] || createDefaultSalahRecord(selectedDate);

  // Compute all statistics
  const stats = computeSalahStats(salahRecords, selectedDate);
  const weekGrid = getPast7DaysSalahGrid(salahRecords, selectedDate);

  // Date navigation handlers
  const handlePrevDay = () => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() - 1);
    setSelectedDate(getLocalDateString(current));
  };

  const handleNextDay = () => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + 1);
    setSelectedDate(getLocalDateString(current));
  };

  const handleToday = () => {
    setSelectedDate(todayStr);
  };

  const isToday = selectedDate === todayStr;

  const formattedDateTitle = (() => {
    try {
      const parts = selectedDate.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return selectedDate;
    }
  })();

  const handlePrayerChange = async (prayer: PrayerName, status: PrayerStatus) => {
    await updateSalahPrayer(selectedDate, prayer, status);
  };

  return (
    <div className="space-y-4 max-w-5xl pb-16">
      {/* Top Bar: Date Header Controller & Anchor Habit Status */}
      <div className={`p-3.5 sm:p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-md border flex items-center justify-center shrink-0 ${
            isDark ? 'bg-[#1c1c2e] border-white/[0.08] text-[#ece9fb]' : 'bg-[#f3f1fb] border-[#e7e4f4] text-[#18172b]'
          }`}>
            <Compass className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-sm sm:text-base font-semibold font-sans tracking-tight ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                {formattedDateTitle}
              </h2>
              {isToday && (
                <span className={`text-xs font-sans px-2 py-0.5 rounded font-medium ring-[1.5px] ${
                  isDark ? 'ring-[#8b7bff] text-[#8b7bff]' : 'ring-[#7c5ef0] text-[#7c5ef0]'
                }`}>
                  Today
                </span>
              )}
            </div>
            <p className="text-xs font-sans text-[#6b6882] dark:text-[#8d8aab] mt-0.5">
              {stats.prayersLoggedToday} of 5 daily prayers logged ({stats.bajamatCountToday} in congregation)
            </p>
          </div>
        </div>

        {/* Header Actions: Reminders button & Date Stepper Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
          {/* Reminders Button */}
          <button
            type="button"
            onClick={() => setIsReminderModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-sans font-medium transition-colors cursor-pointer ${
              activeRemindersCount > 0
                ? isDark
                  ? 'bg-[#1c1c2e] border-[#7059f0]/40 text-[#ece9fb] hover:bg-[#25253d]'
                  : 'bg-[#f4f2fb] border-[#7c5ef0]/30 text-[#18172b] hover:bg-[#ece8fa]'
                : isDark
                  ? 'bg-[#1c1c2e] border-white/[0.08] text-[#8d8aab] hover:text-[#ece9fb]'
                  : 'bg-[#f3f1fb] border-[#e7e4f4] text-[#6b6882] hover:text-[#18172b]'
            }`}
            title="Configure custom prayer reminders"
          >
            <Bell className={`w-3.5 h-3.5 stroke-[1.75] ${activeRemindersCount > 0 ? 'text-[#8b7bff]' : ''}`} />
            <span>Reminders</span>
            {activeRemindersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#7c5ef0] dark:bg-[#7059f0] text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
                {activeRemindersCount}
              </span>
            )}
          </button>

          <div className={`flex items-center gap-0.5 p-1 rounded-md border text-xs font-sans ${
            isDark ? 'bg-[#1c1c2e] border-white/[0.08]' : 'bg-[#f3f1fb] border-[#e7e4f4]'
          }`}>
            <button
              type="button"
              onClick={handlePrevDay}
              aria-label="Previous day"
              title="Previous day"
              className="p-1 rounded text-[#6b6882] dark:text-[#8d8aab] hover:text-[#18172b] dark:hover:text-[#ece9fb] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[2]" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className={`px-2.5 py-0.5 text-xs font-sans font-medium rounded cursor-pointer transition-colors ${
                isToday
                  ? 'ring-[1.5px] ring-[#7c5ef0] dark:ring-[#8b7bff] text-[#7c5ef0] dark:text-[#8b7bff]'
                  : 'text-[#6b6882] dark:text-[#8d8aab] hover:text-[#18172b] dark:hover:text-[#ece9fb]'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNextDay}
              aria-label="Next day"
              title="Next day"
              className="p-1 rounded text-[#6b6882] dark:text-[#8d8aab] hover:text-[#18172b] dark:hover:text-[#ece9fb] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </div>
        </div>
      </div>

      {/* Anchor Habit Status Indicator (if enabled) */}
      {salahAsAnchorHabit && (
        <div className={`px-3.5 py-2.5 rounded-lg border flex items-center justify-between text-xs ${
          isDark 
            ? 'bg-[#181829] border-white/[0.08] text-[#c9c6de]' 
            : 'bg-[#f4f2fb] border-[#e7e4f4] text-[#474464]'
        }`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#8b7bff] stroke-[1.75]" />
            <span>
              <strong>Anchor Habit Active:</strong> All 5 prayers are required to calibrate your daily anchor discipline streak.
            </span>
          </div>
          <span className="text-[11px] font-mono tabular-nums font-semibold shrink-0">
            {stats.prayersLoggedToday === 5 ? 'COMPLETE' : `${stats.prayersLoggedToday} / 5`}
          </span>
        </div>
      )}

      {/* Desktop side-by-side, mobile stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN (7 cols): Today's Card with 5 Prayer Rows */}
        <section className={`lg:col-span-7 rounded-lg border p-4 sm:p-5 flex flex-col justify-between ${
          isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
        }`}>
          <div>
            <div className="flex items-center justify-between border-b pb-3 mb-3 border-inherit border-opacity-10">
              <div>
                <h3 className={`text-sm sm:text-base font-semibold font-sans tracking-tight ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                  Daily prayers
                </h3>
                <p className="text-xs text-[#6b6882] dark:text-[#8d8aab] mt-0.5 font-sans">
                  Select Solo or Congregation (Bajamat) to calibrate each prayer.
                </p>
              </div>

              {/* Status Indicator */}
              <div className="text-right">
                <span className={`text-xs font-sans font-bold tabular-nums ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                  {stats.prayersLoggedToday} / 5
                </span>
                <span className="text-xs font-sans text-[#6b6882] dark:text-[#8d8aab] block">
                  Logged
                </span>
              </div>
            </div>

            {/* The 5 Prayer Rows */}
            <div className="space-y-2.5">
              {PRAYER_CONFIG.map((prayer) => {
                const currentStatus = activeRecord[prayer.id];
                const isLogged = currentStatus !== 'none';

                return (
                  <div
                    key={prayer.id}
                    className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                      isDark 
                        ? isLogged 
                          ? 'bg-[#181829] border-white/[0.12]' 
                          : 'bg-[#131320]/60 border-white/[0.05] hover:border-white/[0.1]' 
                        : isLogged 
                          ? 'bg-[#f8f7fd] border-[#dedae9]' 
                          : 'bg-white border-[#e7e4f4] hover:border-slate-300'
                    }`}
                  >
                    {/* Left: Prayer Name & Period Description */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-md border flex items-center justify-center shrink-0 font-mono text-xs font-bold ${
                        isLogged
                          ? isDark 
                            ? 'bg-[#ece9fb] text-[#0a0a0f] border-[#ece9fb]' 
                            : 'bg-[#18172b] text-white border-[#18172b]'
                          : isDark 
                            ? 'bg-transparent text-[#7d7a96] border-white/[0.08]' 
                            : 'bg-transparent text-[#7d7a96] border-slate-200'
                      }`}>
                        {prayer.label[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold tracking-tight ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                            {prayer.label}
                          </span>
                          <span className="text-[10px] text-[#7d7a96] font-mono uppercase">
                            {prayer.period}
                          </span>
                          {prayerReminders?.[prayer.id]?.enabled && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsReminderModalOpen(true);
                              }}
                              title={`Alarm set for ${prayerReminders[prayer.id].time} (${prayerReminders[prayer.id].ringDurationMinutes || prayerReminderSettings.ringDurationMinutes || 5} min alarm). Click to modify.`}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-medium text-[#7c5ef0] dark:text-[#b4a8ff] bg-[#7c5ef0]/10 hover:bg-[#7c5ef0]/20 transition-colors cursor-pointer"
                            >
                              <Clock className="w-2.5 h-2.5 stroke-[2]" />
                              <span>{prayerReminders[prayer.id].time}</span>
                              <span className="text-[9px] opacity-75 font-normal">
                                • {prayerReminders[prayer.id].ringDurationMinutes || prayerReminderSettings.ringDurationMinutes || 5}m alarm
                              </span>
                            </button>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-[#7d7a96] mt-0.5 flex items-center gap-1.5">
                          {currentStatus === 'none' && (
                            <span>Not prayed</span>
                          )}
                          {currentStatus === 'solo' && (
                            <span className="font-medium text-[#18172b] dark:text-[#ece9fb]">Prayed alone (solo)</span>
                          )}
                          {currentStatus === 'bajamat' && (
                            <span className="font-medium text-[#18172b] dark:text-[#ece9fb]">In congregation (bajamat)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: The Two Icon Toggles (Solo & Bajamat) */}
                    <PrayerToggleGroup
                      status={currentStatus}
                      onChange={(nextStatus) => handlePrayerChange(prayer.id, nextStatus)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Info & Hint */}
          <div className="mt-4 pt-3 border-t border-inherit border-opacity-10 flex items-center justify-between text-[11px] text-[#7d7a96] font-mono">
            <span>Tap icon to toggle • Tap active icon to reset</span>
            <span>Mutually exclusive</span>
          </div>
        </section>

        {/* RIGHT COLUMN (5 cols): 7-Day Grid & Stats */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. 7-Day Grid */}
          <section className={`rounded-lg border p-4 sm:p-4.5 ${
            isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
          }`}>
            <div className="flex items-center justify-between mb-3 font-sans">
              <h3 className={`text-xs sm:text-sm font-semibold tracking-tight ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                7-day consistency grid
              </h3>
              <span className="text-xs text-[#6b6882] dark:text-[#8d8aab]">
                Past 7 days
              </span>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-sans text-[#6b6882] dark:text-[#8d8aab] pb-2 font-medium w-16">
                      Prayer
                    </th>
                    {weekGrid.map((col) => {
                      const isColSelected = col.date === selectedDate;
                      const isColToday = col.isToday;

                      return (
                        <th key={col.date} className="pb-2 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedDate(col.date)}
                            className="flex flex-col items-center mx-auto cursor-pointer"
                            title={col.date}
                          >
                            <span className="text-[11px] font-sans text-[#6b6882] dark:text-[#8d8aab] font-normal mb-1">
                              {col.dayName}
                            </span>
                            <div
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all ${
                                isColSelected
                                  ? 'bg-[#7c5ef0] dark:bg-[#7059f0] text-white shadow-xs font-semibold'
                                  : isColToday
                                    ? 'ring-[1.5px] ring-[#7c5ef0] dark:ring-[#8b7bff] text-[#18172b] dark:text-[#ece9fb] font-semibold'
                                    : 'text-[#18172b] dark:text-[#ece9fb] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                              }`}
                            >
                              <span className="text-xs font-sans tabular-nums">
                                {col.dayNumber}
                              </span>
                            </div>
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-inherit divide-opacity-5">
                  {PRAYER_CONFIG.map((prayer) => (
                    <tr key={prayer.id}>
                      <td className="text-left py-1.5 text-xs font-sans font-medium text-[#6b6882] dark:text-[#8d8aab]">
                        {prayer.label}
                      </td>
                      {weekGrid.map((col) => {
                        const status = col[prayer.id];
                        return (
                          <td key={col.date} className="py-1.5 px-0.5">
                            <div
                              title={`${col.date} • ${prayer.label}: ${status === 'none' ? 'Not prayed' : status === 'solo' ? 'Solo' : 'Bajamat'}`}
                              className={`w-6 h-6 sm:w-7 sm:h-7 mx-auto rounded-sm flex items-center justify-center transition-colors ${
                                status === 'none'
                                  ? 'border border-dashed border-[#7d7a96]/30 bg-transparent'
                                  : status === 'solo'
                                    ? 'bg-slate-400 dark:bg-slate-600 border border-slate-500'
                                    : 'bg-slate-900 text-white dark:bg-slate-200 dark:text-black border border-slate-800 dark:border-white shadow-xs'
                              }`}
                            >
                              {status === 'solo' && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-200" />
                              )}
                              {status === 'bajamat' && (
                                <span className="w-2 h-2 rounded-xs bg-white dark:bg-slate-900" />
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* One-Line Legend as specified */}
            <div className="mt-3.5 pt-3 border-t border-inherit border-opacity-10 flex flex-wrap items-center justify-between gap-2 text-xs font-sans text-[#6b6882] dark:text-[#8d8aab]">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-xs border border-dashed border-[#7d7a96]/40 bg-transparent" />
                <span>Not prayed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-xs bg-slate-400 dark:bg-slate-600 border border-slate-500 flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-white" />
                </div>
                <span>Solo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-xs bg-slate-900 dark:bg-slate-200 border border-slate-800 dark:border-white flex items-center justify-center">
                  <span className="w-1 h-1 bg-white dark:bg-slate-900" />
                </div>
                <span>Bajamat</span>
              </div>
            </div>
          </section>

          {/* 2. Stats Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Stat 1: 7-Day Bajamat Rate */}
            <div className={`p-3 rounded-lg border flex flex-col justify-between font-sans ${
              isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
            }`}>
              <div className="flex items-center justify-between text-[#6b6882] dark:text-[#8d8aab] text-xs font-medium">
                <span>7-day congregation</span>
                <Users className="w-3.5 h-3.5 text-[#6b6882] dark:text-[#8d8aab] stroke-[1.75]" />
              </div>
              <div className="my-1.5">
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums leading-none ${
                    isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
                  }`}>
                    {stats.bajamatRate7Days}%
                  </span>
                </div>
                <div className="text-xs text-[#6b6882] dark:text-[#8d8aab] mt-1 tabular-nums font-sans">
                  {stats.bajamatCount7Days} of {stats.totalLogged7Days} logged
                </div>
              </div>
              <div className="w-full bg-white/[0.06] h-1 rounded-xs overflow-hidden">
                <div 
                  className="bg-[#7d7a96] dark:bg-[#ece9fb] h-full transition-all duration-300"
                  style={{ width: `${stats.bajamatRate7Days}%` }}
                />
              </div>
            </div>

            {/* Stat 2: 30-Day Bajamat Rate */}
            <div className={`p-3 rounded-lg border flex flex-col justify-between font-sans ${
              isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
            }`}>
              <div className="flex items-center justify-between text-[#6b6882] dark:text-[#8d8aab] text-xs font-medium">
                <span>30-day congregation</span>
                <Users className="w-3.5 h-3.5 text-[#6b6882] dark:text-[#8d8aab] stroke-[1.75]" />
              </div>
              <div className="my-1.5">
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums leading-none ${
                    isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
                  }`}>
                    {stats.bajamatRate30Days}%
                  </span>
                </div>
                <div className="text-xs text-[#6b6882] dark:text-[#8d8aab] mt-1 tabular-nums font-sans">
                  {stats.bajamatCount30Days} of {stats.totalLogged30Days} logged
                </div>
              </div>
              <div className="w-full bg-white/[0.06] h-1 rounded-xs overflow-hidden">
                <div 
                  className="bg-[#7d7a96] dark:bg-[#ece9fb] h-full transition-all duration-300"
                  style={{ width: `${stats.bajamatRate30Days}%` }}
                />
              </div>
            </div>

            {/* Stat 3: Current 5/5 Streak */}
            <div className={`p-3 rounded-lg border flex flex-col justify-between font-sans ${
              isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
            }`}>
              <div className="flex items-center justify-between text-[#6b6882] dark:text-[#8d8aab] text-xs font-medium">
                <span>Prayer streak</span>
                <Flame className="w-3.5 h-3.5 text-zinc-400 stroke-[1.75]" />
              </div>
              <div className="my-1.5">
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums leading-none ${
                    isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
                  }`}>
                    {stats.currentStreak}
                  </span>
                  <span className="text-xs text-[#6b6882] dark:text-[#8d8aab] font-sans">days</span>
                </div>
                <div className="text-xs text-[#6b6882] dark:text-[#8d8aab] mt-1 font-sans">
                  All 5 prayers logged
                </div>
              </div>
              <div className="text-xs text-[#6b6882] dark:text-[#8d8aab] truncate font-sans">
                {stats.currentStreak > 0 ? 'Active discipline' : 'Awaiting today'}
              </div>
            </div>

            {/* Stat 4: Best Streak */}
            <div className={`p-3 rounded-lg border flex flex-col justify-between font-sans ${
              isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
            }`}>
              <div className="flex items-center justify-between text-[#6b6882] dark:text-[#8d8aab] text-xs font-medium">
                <span>Best streak</span>
                <Trophy className="w-3.5 h-3.5 text-zinc-400 stroke-[1.75]" />
              </div>
              <div className="my-1.5">
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums leading-none ${
                    isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
                  }`}>
                    {stats.bestStreak}
                  </span>
                  <span className="text-xs text-[#6b6882] dark:text-[#8d8aab] font-sans">days</span>
                </div>
                <div className="text-xs text-[#6b6882] dark:text-[#8d8aab] mt-1 font-sans">
                  All-time highest
                </div>
              </div>
              <div className="text-xs text-[#6b6882] dark:text-[#8d8aab] truncate font-sans">
                Record calibration
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Prayer Reminders Modal */}
      <PrayerReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
      />
    </div>
  );
};
