import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { AxisLogo } from './AxisLogo';
import { 
  Sun, 
  Moon, 
  Laptop, 
  Smartphone, 
  Monitor, 
  LogIn, 
  LogOut, 
  Bell, 
  ShieldCheck, 
  Cloud,
  Check,
  Info,
  Calendar,
  Trash2,
  Download,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  Compass,
  Github,
  Sparkles,
  ExternalLink,
  GitPullRequest
} from 'lucide-react';
import { 
  generateJSONExport, 
  generateHabitsCSV, 
  generateTasksCSV, 
  generateDailyReviewsCSV, 
  downloadBlob 
} from '../services/exportService';
import { SwipeGestureSettingsSection } from './SwipeGestureSettingsSection';
import { ContributeModal } from './ContributeModal';
import { ReleaseNotesModal } from './ReleaseNotesModal';

export const SettingsPage: React.FC = () => {
  const { 
    user, 
    authMode, 
    logout, 
    openAuthModal, 
    platform, 
    setPlatform,
    autoSyncCalendarTasks,
    setAutoSyncCalendarTasks,
    salahAsAnchorHabit,
    setSalahAsAnchorHabit,
    clearAllData,
    habits,
    tasks,
    dailyRecords,
    calendarEvents,
    salahRecords
  } = useApp();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [notificationMute, setNotificationMute] = useState(false);
  const [dailyReminderTime, setDailyReminderTime] = useState('21:00');
  const [savedMsg, setSavedMsg] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState(false);

  const getFormattedDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const handleExportJSON = () => {
    const jsonStr = generateJSONExport(
      habits,
      tasks,
      dailyRecords,
      calendarEvents,
      user?.email || null,
      platform,
      salahRecords
    );
    const filename = `axis-archive-${getFormattedDate()}.json`;
    downloadBlob(jsonStr, filename, 'application/json');
    setExportSuccessMsg(`Exported ${filename}`);
    setTimeout(() => setExportSuccessMsg(null), 3500);
  };

  const handleExportHabitsCSV = () => {
    const csvStr = generateHabitsCSV(habits, dailyRecords);
    const filename = `axis-habits-streaks-${getFormattedDate()}.csv`;
    downloadBlob(csvStr, filename, 'text/csv');
    setExportSuccessMsg(`Exported ${filename}`);
    setTimeout(() => setExportSuccessMsg(null), 3500);
  };

  const handleExportTasksCSV = () => {
    const csvStr = generateTasksCSV(tasks);
    const filename = `axis-task-history-${getFormattedDate()}.csv`;
    downloadBlob(csvStr, filename, 'text/csv');
    setExportSuccessMsg(`Exported ${filename}`);
    setTimeout(() => setExportSuccessMsg(null), 3500);
  };

  const handleExportReviewsCSV = () => {
    const csvStr = generateDailyReviewsCSV(dailyRecords);
    const filename = `axis-daily-reviews-${getFormattedDate()}.csv`;
    downloadBlob(csvStr, filename, 'text/csv');
    setExportSuccessMsg(`Exported ${filename}`);
    setTimeout(() => setExportSuccessMsg(null), 3500);
  };

  const handleClearData = async () => {
    await clearAllData();
    setConfirmClear(false);
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
  };

  const handleSaveNotifications = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const brandAccent = isDark ? '#8b7bff' : '#7c5ef0';

  return (
    <div className="space-y-3.5 max-w-2xl pb-16">
      {/* 1. Theme Configuration */}
      <section className={`rounded-lg p-3.5 sm:p-4 border ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <h2 className={`text-xs sm:text-sm font-semibold font-mono uppercase tracking-tight ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
          Appearance & Theme
        </h2>
        <p className="text-[11px] text-[#7d7a96] mt-0.5">
          Select visual canvas preference. Calibrated to system settings by default.
        </p>

        <div className="grid grid-cols-3 gap-2 mt-3 font-mono">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-2.5 rounded-md border text-left cursor-pointer transition-all ${
              theme === 'light'
                ? isDark 
                  ? 'border-[#8b7bff] bg-[#1c1c2e]' 
                  : 'border-[#7c5ef0] bg-[#f3f1fb] font-semibold'
                : isDark ? 'border-white/[0.06] hover:bg-white/[0.04]' : 'border-[#e7e4f4] hover:bg-slate-50'
            }`}
          >
            <Sun className="w-4 h-4 mb-1 text-amber-500 stroke-[1.75]" />
            <div className={`text-xs font-medium uppercase ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>Light</div>
            <div className="text-[10px] text-[#7d7a96] font-sans">Crisp daylight canvas</div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-2.5 rounded-md border text-left cursor-pointer transition-all ${
              theme === 'dark'
                ? isDark 
                  ? 'border-[#8b7bff] bg-[#1c1c2e] font-semibold' 
                  : 'border-[#7c5ef0] bg-[#f3f1fb] font-semibold'
                : isDark ? 'border-white/[0.06] hover:bg-white/[0.04]' : 'border-[#e7e4f4] hover:bg-slate-50'
            }`}
          >
            <Moon className="w-4 h-4 mb-1 text-[#8b7bff] stroke-[1.75]" />
            <div className={`text-xs font-medium uppercase ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>Dark</div>
            <div className="text-[10px] text-[#7d7a96] font-sans">Low-light focus</div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-2.5 rounded-md border text-left cursor-pointer transition-all ${
              theme === 'system'
                ? isDark 
                  ? 'border-[#8b7bff] bg-[#1c1c2e] font-semibold' 
                  : 'border-[#7c5ef0] bg-[#f3f1fb] font-semibold'
                : isDark ? 'border-white/[0.06] hover:bg-white/[0.04]' : 'border-[#e7e4f4] hover:bg-slate-50'
            }`}
          >
            <Laptop className="w-4 h-4 mb-1 text-[#7d7a96] stroke-[1.75]" />
            <div className={`text-xs font-medium uppercase ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>System</div>
            <div className="text-[10px] text-[#7d7a96] font-sans">Follows OS theme</div>
          </button>
        </div>
      </section>

      {/* 2. Platform Target Mode */}
      <section className={`rounded-lg p-3.5 sm:p-4 border ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <h2 className={`text-xs sm:text-sm font-semibold font-mono uppercase tracking-tight ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
          Platform Operating Mode
        </h2>
        <p className="text-[11px] text-[#7d7a96] mt-0.5">
          Toggles mobile UsageStats screen-time telemetry and layout constraints.
        </p>

        <div className="grid grid-cols-2 gap-2 mt-3 font-mono">
          <button
            type="button"
            onClick={() => setPlatform('android')}
            className={`p-2.5 rounded-md border text-left cursor-pointer transition-all ${
              platform === 'android'
                ? isDark 
                  ? 'border-[#8b7bff] bg-[#1c1c2e]' 
                  : 'border-[#7c5ef0] bg-[#f3f1fb]'
                : isDark ? 'border-white/[0.06] hover:bg-white/[0.04]' : 'border-[#e7e4f4] hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-4 h-4 mb-1 text-emerald-400 stroke-[1.75]" />
            <div className={`text-xs font-medium uppercase ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>Android Mode</div>
            <div className="text-[10px] text-[#7d7a96] font-sans">Enables app usage stats & phone viewport telemetry</div>
          </button>

          <button
            type="button"
            onClick={() => setPlatform('desktop')}
            className={`p-2.5 rounded-md border text-left cursor-pointer transition-all ${
              platform === 'desktop'
                ? isDark 
                  ? 'border-[#8b7bff] bg-[#1c1c2e]' 
                  : 'border-[#7c5ef0] bg-[#f3f1fb]'
                : isDark ? 'border-white/[0.06] hover:bg-white/[0.04]' : 'border-[#e7e4f4] hover:bg-slate-50'
            }`}
          >
            <Monitor className="w-4 h-4 mb-1 text-[#8b7bff] stroke-[1.75]" />
            <div className={`text-xs font-medium uppercase ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>Desktop Mode</div>
            <div className="text-[10px] text-[#7d7a96] font-sans">Optimized for wide monitor dashboards</div>
          </button>
        </div>
      </section>

      {/* Mobile Swipe Gesture Configuration */}
      <SwipeGestureSettingsSection />

      {/* 3. Account & Sync Settings */}
      <section className={`rounded-lg p-3.5 sm:p-4 border ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xs sm:text-sm font-semibold font-mono uppercase tracking-tight ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
              Account & Synchronization
            </h2>
            <p className="text-[11px] text-[#7d7a96] mt-0.5">
              Persistence across devices via Firebase Firestore.
            </p>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono border ${
            isDark ? 'bg-[#1c1c2e] border-white/[0.08] text-[#ece9fb]' : 'bg-[#f3f1fb] border-[#e7e4f4] text-[#18172b]'
          }`}>
            <Cloud className="w-3 h-3 text-[#8b7bff]" />
            <span>{authMode === 'authenticated' ? 'SYNCED' : 'LOCAL ONLY'}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-inherit border-opacity-10">
          {authMode === 'guest' ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className={`text-xs font-medium font-mono uppercase block ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                  Guest Mode Active
                </span>
                <span className="text-[11px] text-[#7d7a96]">
                  Data is preserved locally in this browser. Sign in anytime to merge into a cloud account.
                </span>
              </div>
              <button
                type="button"
                onClick={() => openAuthModal('Sign in to sync your habits, tasks, and daily reviews.')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold font-mono uppercase tracking-wider cursor-pointer shrink-0 flex items-center justify-center gap-1.5 transition-colors ${
                  isDark 
                    ? 'bg-[#8b7bff] text-[#0a0a0f] hover:bg-[#9d8fff]' 
                    : 'bg-[#7c5ef0] text-white hover:bg-[#6e4ee6]'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 stroke-[2]" />
                <span>Sign in / Sync</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className={`text-xs font-medium font-mono uppercase block ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                  {user?.displayName || 'User'}
                </span>
                <span className="text-[11px] text-[#7d7a96] font-mono">
                  {user?.email}
                </span>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="px-3 py-1.5 rounded-md text-xs font-mono uppercase text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 cursor-pointer shrink-0 flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4. Calendar Auto-Sync for Tasks */}
      <section className={`rounded-lg p-3.5 sm:p-4 border ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#7d7a96] stroke-[1.75]" />
          <h2 className={`text-xs sm:text-sm font-semibold font-mono uppercase tracking-tight ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
            Calendar Task Synchronization
          </h2>
        </div>
        <p className="text-[11px] text-[#7d7a96] mt-0.5">
          Push scheduled tasks with due dates and times directly to your Google Calendar.
        </p>

        <div className="mt-3 pt-3 border-t border-inherit border-opacity-10 text-xs">
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <span className={`font-medium block ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                Automatically add new tasks to Calendar
              </span>
              <span className="text-[10px] text-[#7d7a96] leading-relaxed block mt-0.5">
                When enabled, newly created tasks with both a due date and time are synchronized to your primary Google Calendar without asking each time.
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoSyncCalendarTasks}
              onClick={() => setAutoSyncCalendarTasks(!autoSyncCalendarTasks)}
              className={`w-9 h-5 rounded-full p-[2px] transition-colors cursor-pointer shrink-0 relative focus:outline-none ${
                autoSyncCalendarTasks 
                  ? (isDark ? 'bg-[#8b7bff]' : 'bg-[#7c5ef0]') 
                  : (isDark ? 'bg-zinc-700' : 'bg-slate-300')
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  autoSyncCalendarTasks ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Salah & Spiritual Discipline (Anchor Habit Link) */}
      <section className={`rounded-lg p-3.5 sm:p-4 border ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#8b7bff] stroke-[1.75]" />
          <h2 className={`text-xs sm:text-sm font-semibold font-mono uppercase tracking-tight ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
            Salah & Spiritual Discipline
          </h2>
        </div>
        <p className="text-[11px] text-[#7d7a96] mt-0.5">
          Configure daily prayer tracking and anchor habit calibration.
        </p>

        <div className="mt-3 pt-3 border-t border-inherit border-opacity-10 text-xs">
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <span className={`font-medium block ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                Count Salah as my anchor habit
              </span>
              <span className="text-[10px] text-[#7d7a96] leading-relaxed block mt-0.5">
                When enabled, a day counts as anchor-complete only when all five daily prayers (Fajr, Zuhr, Asr, Maghrib, Isha) are logged. This automatically feeds your anchor streak and Daily Review auto-suggest weighting.
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={salahAsAnchorHabit}
              onClick={() => setSalahAsAnchorHabit(!salahAsAnchorHabit)}
              className={`w-9 h-5 rounded-full p-[2px] transition-colors cursor-pointer shrink-0 relative focus:outline-none ${
                salahAsAnchorHabit 
                  ? (isDark ? 'bg-[#8b7bff]' : 'bg-[#7c5ef0]') 
                  : (isDark ? 'bg-zinc-700' : 'bg-slate-300')
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  salahAsAnchorHabit ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 6. Data Export & Portability */}
      <section className={`rounded-lg p-3.5 sm:p-4 border ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-[#8b7bff] stroke-[1.75]" />
              <h2 className={`text-xs sm:text-sm font-semibold font-mono uppercase tracking-tight ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                Data Export & Portability
              </h2>
            </div>
            <p className="text-[11px] text-[#7d7a96] mt-0.5">
              Export your habits, streaks, tasks, and daily review evaluations as JSON or CSV files.
            </p>
          </div>

          {/* Quick counts preview */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#7d7a96]">
            <span className={`px-1.5 py-0.5 rounded border ${isDark ? 'bg-black/30 border-white/5 text-[#ece9fb]' : 'bg-[#f4f2fb] border-[#e2dff0] text-[#18172b]'}`}>
              {habits.length} habits
            </span>
            <span>·</span>
            <span className={`px-1.5 py-0.5 rounded border ${isDark ? 'bg-black/30 border-white/5 text-[#ece9fb]' : 'bg-[#f4f2fb] border-[#e2dff0] text-[#18172b]'}`}>
              {tasks.length} tasks
            </span>
            <span>·</span>
            <span className={`px-1.5 py-0.5 rounded border ${isDark ? 'bg-black/30 border-white/5 text-[#ece9fb]' : 'bg-[#f4f2fb] border-[#e2dff0] text-[#18172b]'}`}>
              {Object.keys(dailyRecords).length} reviews
            </span>
          </div>
        </div>

        {exportSuccessMsg && (
          <div className="mt-3 p-2.5 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2] text-emerald-400 shrink-0" />
            <span>{exportSuccessMsg}</span>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-inherit border-opacity-10 space-y-3 font-mono">
          {/* JSON Master Archive Card */}
          <div className={`p-3 rounded-md border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isDark ? 'bg-[#181926] border-white/[0.06]' : 'bg-[#f7f6fc] border-[#e7e4f4]'
          }`}>
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[#8b7bff]/15 text-[#8b7bff] flex items-center justify-center shrink-0 mt-0.5">
                <FileJson className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div>
                <span className={`text-xs font-semibold uppercase block ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                  Full Archive (.json)
                </span>
                <span className="text-[11px] text-[#7d7a96] normal-case font-sans block mt-0.5 leading-relaxed">
                  Complete structured backup including active habits, calculated streak milestones, task history, and daily review logs.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportJSON}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider cursor-pointer shrink-0 flex items-center justify-center gap-1.5 transition-colors ${
                isDark 
                  ? 'bg-[#8b7bff] text-[#0a0a0f] hover:bg-[#9d8fff]' 
                  : 'bg-[#7c5ef0] text-white hover:bg-[#6e4ee6]'
              }`}
            >
              <Download className="w-3.5 h-3.5 stroke-[2]" />
              <span>Download JSON</span>
            </button>
          </div>

          {/* Individual CSV Export Options */}
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#7d7a96] block mb-2">
              Spreadsheet Exports (.csv)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleExportHabitsCSV}
                className={`p-2.5 rounded-md border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  isDark ? 'bg-[#181926] border-white/[0.06] hover:border-[#8b7bff]/40' : 'bg-[#f7f6fc] border-[#e7e4f4] hover:border-[#7c5ef0]/40'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 text-[#2dd4bf] mb-1">
                    <FileSpreadsheet className="w-3.5 h-3.5 stroke-[1.75]" />
                    <span className="text-[11px] font-semibold uppercase">Habits & Streaks</span>
                  </div>
                  <p className="text-[10px] text-[#7d7a96] normal-case font-sans leading-snug">
                    Habit definitions, anchor markers, lifetime counts, current & max streaks.
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-semibold text-[#8b7bff] flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  <span>Export CSV</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleExportTasksCSV}
                className={`p-2.5 rounded-md border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  isDark ? 'bg-[#181926] border-white/[0.06] hover:border-[#8b7bff]/40' : 'bg-[#f7f6fc] border-[#e7e4f4] hover:border-[#7c5ef0]/40'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                    <FileSpreadsheet className="w-3.5 h-3.5 stroke-[1.75]" />
                    <span className="text-[11px] font-semibold uppercase">Tasks History</span>
                  </div>
                  <p className="text-[10px] text-[#7d7a96] normal-case font-sans leading-snug">
                    Action items, priorities, due dates, timestamps, and completion statuses.
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-semibold text-[#8b7bff] flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  <span>Export CSV</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleExportReviewsCSV}
                className={`p-2.5 rounded-md border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  isDark ? 'bg-[#181926] border-white/[0.06] hover:border-[#8b7bff]/40' : 'bg-[#f7f6fc] border-[#e7e4f4] hover:border-[#7c5ef0]/40'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                    <FileSpreadsheet className="w-3.5 h-3.5 stroke-[1.75]" />
                    <span className="text-[11px] font-semibold uppercase">Daily Reviews</span>
                  </div>
                  <p className="text-[10px] text-[#7d7a96] normal-case font-sans leading-snug">
                    Chronological color evaluations, notes, habit/task counts, and screen-time.
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-semibold text-[#8b7bff] flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  <span>Export CSV</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Data Management / Reset */}
      <section className={`rounded-lg p-3.5 sm:p-4 border ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <div className="flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-400 stroke-[1.75]" />
          <h2 className={`text-xs sm:text-sm font-semibold font-mono uppercase tracking-tight ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
            Data Management
          </h2>
        </div>
        <p className="text-[11px] text-[#7d7a96] mt-0.5">
          Erase habits, tasks, calendar events, and review records for a completely clean slate.
        </p>

        <div className="mt-3 pt-3 border-t border-inherit border-opacity-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className={`text-xs font-medium font-mono uppercase block ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
              Clear All Data (Clean Slate)
            </span>
            <span className="text-[11px] text-[#7d7a96]">
              {clearedNotice ? '✓ All records have been cleared to a clean state.' : 'Permanently resets habits, tasks, and history to zero.'}
            </span>
          </div>

          <div>
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearData}
                  className="px-3 py-1.5 rounded-md text-xs font-mono font-semibold uppercase bg-rose-600 text-white hover:bg-rose-700 cursor-pointer transition-colors"
                >
                  Confirm Erase
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase border cursor-pointer transition-colors ${
                    isDark ? 'border-white/10 text-zinc-400 hover:text-white' : 'border-zinc-300 text-zinc-600 hover:text-black'
                  }`}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="px-3 py-1.5 rounded-md text-xs font-mono uppercase text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 cursor-pointer transition-colors"
              >
                Clear All Data
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 7. GitHub Community, Open Source & Releases */}
      <section className={`rounded-lg p-3.5 sm:p-4 border ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#8b7bff]/15 text-[#8b7bff] flex items-center justify-center shrink-0">
              <Github className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h2 className={`text-xs sm:text-sm font-semibold font-mono uppercase tracking-tight flex items-center gap-2 ${
                isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
              }`}>
                GitHub & Open Source Release
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  v1.2.0
                </span>
              </h2>
              <p className="text-[11px] text-[#7d7a96] mt-0.5">
                Join our open-source project, download latest Android / Windows builds, or submit contributions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsReleaseNotesOpen(true)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold font-mono uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8b7bff]" />
              <span>What's New</span>
            </button>

            <button
              type="button"
              onClick={() => setIsContributeOpen(true)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold font-mono uppercase tracking-wider cursor-pointer flex items-center gap-1.5 transition-colors ${
                isDark 
                  ? 'bg-[#8b7bff] text-[#0a0a0f] hover:bg-[#9d8fff]' 
                  : 'bg-[#7c5ef0] text-white hover:bg-[#6e4ee6]'
              }`}
            >
              <Github className="w-3.5 h-3.5" />
              <span>Contribute</span>
            </button>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-inherit border-opacity-10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          <a
            href="https://github.com/MohidAhmed6115/axis-releases"
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2.5 rounded-md border flex items-center justify-between transition-colors group ${
              isDark ? 'bg-[#181926] border-white/[0.06] hover:border-[#8b7bff]/40' : 'bg-[#f7f6fc] border-[#e7e4f4] hover:border-[#7c5ef0]/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-[#8b7bff]" />
              <div>
                <div className="font-semibold">MohidAhmed6115 / axis-releases</div>
                <div className="text-[10px] text-[#7d7a96] font-sans">Public repository on GitHub</div>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[#7d7a96] group-hover:text-[#8b7bff]" />
          </a>

          <a
            href="https://github.com/MohidAhmed6115/axis-releases/releases"
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2.5 rounded-md border flex items-center justify-between transition-colors group ${
              isDark ? 'bg-[#181926] border-white/[0.06] hover:border-[#8b7bff]/40' : 'bg-[#f7f6fc] border-[#e7e4f4] hover:border-[#7c5ef0]/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="font-semibold">Download Releases</div>
                <div className="text-[10px] text-[#7d7a96] font-sans">Android APK & Windows installer</div>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[#7d7a96] group-hover:text-emerald-400" />
          </a>
        </div>
      </section>

      {/* 8. Brand Compass Metaphor & Philosophy */}
      <section className={`rounded-lg p-3.5 sm:p-4 border ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <div className="flex items-center gap-3">
          <AxisLogo className="w-8 h-8 rounded-md shrink-0" />
          <div>
            <h3 className={`text-xs font-semibold font-mono uppercase tracking-wider ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
              Axis Instrument v1.2.0
            </h3>
            <p className="text-[10px] text-[#7d7a96] font-mono mt-0.5">
              Instrument, not app. Calibrated for personal accountability and self-mastery.
            </p>
          </div>
        </div>
      </section>

      {/* Modals */}
      <ContributeModal 
        isOpen={isContributeOpen} 
        onClose={() => setIsContributeOpen(false)}
        onOpenReleaseNotes={() => setIsReleaseNotesOpen(true)}
      />
      <ReleaseNotesModal
        isOpen={isReleaseNotesOpen}
        onClose={() => setIsReleaseNotesOpen(false)}
        onOpenContribute={() => setIsContributeOpen(true)}
      />
    </div>
  );
};
