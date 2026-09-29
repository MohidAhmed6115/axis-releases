import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { alarmAudioService } from '../services/alarmAudioService';
import { 
  PrayerName, 
  PRAYER_CONFIG, 
  DEFAULT_PRAYER_REMINDERS, 
  RINGTONE_OPTIONS, 
  RingtoneOption,
  DEFAULT_PRAYER_REMINDER_SETTINGS
} from '../types';
import { 
  Bell, 
  X, 
  Clock, 
  RotateCcw, 
  Play, 
  CheckCircle2, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Music,
  Timer
} from 'lucide-react';

interface PrayerReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DURATION_OPTIONS = [
  { value: 1, label: '1 minute' },
  { value: 2, label: '2 minutes' },
  { value: 3, label: '3 minutes' },
  { value: 5, label: '5 minutes (Default)' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' }
];

// Format 24h 'HH:mm' to 12h 'h:mm AM/PM'
function format12HourTime(timeStr: string): string {
  try {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
  } catch {
    return timeStr;
  }
}

export const PrayerReminderModal: React.FC<PrayerReminderModalProps> = ({ isOpen, onClose }) => {
  const { 
    prayerReminders, 
    updatePrayerReminder, 
    resetPrayerReminders,
    prayerReminderSettings,
    updatePrayerReminderSettings
  } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [testSuccessPrayer, setTestSuccessPrayer] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeCount = Object.values(prayerReminders).filter(r => r.enabled).length;

  const handleToggle = (prayerId: PrayerName) => {
    const current = prayerReminders[prayerId];
    updatePrayerReminder(prayerId, { enabled: !current.enabled });
  };

  const handleTimeChange = (prayerId: PrayerName, time: string) => {
    if (!time) return;
    updatePrayerReminder(prayerId, { time });
  };

  const handlePrayerDurationChange = (prayerId: PrayerName, durationStr: string) => {
    const duration = parseInt(durationStr, 10);
    if (isNaN(duration)) return;
    updatePrayerReminder(prayerId, { ringDurationMinutes: duration });
  };

  const handleToggleAll = (enable: boolean) => {
    (Object.keys(prayerReminders) as PrayerName[]).forEach(p => {
      updatePrayerReminder(p, { enabled: enable });
    });
  };

  const handlePreviewSound = (tone?: RingtoneOption) => {
    const selectedTone = tone || prayerReminderSettings.ringtone;
    alarmAudioService.unlockAudioContext();
    alarmAudioService.previewRingtone(selectedTone, prayerReminderSettings.volume);
    setIsPlayingPreview(true);
    setTimeout(() => setIsPlayingPreview(false), 2600);
  };

  const handleTestReminder = (prayerId: PrayerName) => {
    setTestSuccessPrayer(prayerId);
    setTimeout(() => setTestSuccessPrayer(null), 2500);

    const prayerConfig = prayerReminders[prayerId];
    const duration = prayerConfig?.ringDurationMinutes || prayerReminderSettings.ringDurationMinutes || 5;
    const tone = prayerConfig?.ringtone || prayerReminderSettings.ringtone || 'classic-alarm';

    // Dispatch preview event for SalahReminderToast with ringtone and duration
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('axis-test-prayer-reminder', {
          detail: { 
            prayer: prayerId,
            ringDurationMinutes: duration,
            ringtone: tone
          }
        })
      );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className={`max-w-xl w-full rounded-xl border shadow-2xl p-4 sm:p-6 relative max-h-[92vh] overflow-y-auto font-sans transition-colors ${
          isDark
            ? 'bg-[#131320] border-white/10 text-[#ece9fb]'
            : 'bg-white border-[#e7e4f4] text-[#18172b]'
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6b6882] dark:text-[#8d8aab] hover:text-[#18172b] dark:hover:text-[#ece9fb] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 stroke-[1.75]" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3 mb-5 pr-8">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              isDark
                ? 'bg-[#1c1c2e] text-[#8b7bff] border border-white/[0.08]'
                : 'bg-[#f3f1fb] text-[#7c5ef0] border-[#e7e4f4]'
            }`}
          >
            <Bell className="w-4 h-4 stroke-[1.75]" />
          </div>
          <div>
            <h2 id="reminder-modal-title" className="text-base sm:text-lg font-semibold tracking-tight">
              Prayer reminders & alarm
            </h2>
            <p className="text-xs text-[#6b6882] dark:text-[#8d8aab] mt-0.5 leading-relaxed">
              Set custom reminder times for each daily prayer. Alarms ring for 5 minutes by default or your chosen duration.
            </p>
          </div>
        </div>

        {/* Alarm Sound & Ring Duration Configuration Section */}
        <div
          className={`p-3.5 sm:p-4 rounded-xl border mb-5 transition-colors ${
            isDark
              ? 'bg-[#181829] border-white/[0.1] text-[#ece9fb]'
              : 'bg-[#faf9fe] border-[#e2def0] text-[#18172b]'
          }`}
        >
          <div className="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-inherit border-opacity-15">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-amber-500/15 text-amber-500">
                <Music className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-xs font-semibold tracking-tight">Alarm Ringtone & Ring Duration</h3>
                <p className="text-[11px] text-[#6b6882] dark:text-[#8d8aab]">
                  Custom alarm sound and default ring length
                </p>
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#6b6882] dark:text-[#8d8aab] font-medium hidden sm:inline">
                {prayerReminderSettings.soundEnabled ? 'Sound on' : 'Muted'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={prayerReminderSettings.soundEnabled}
                onClick={() => updatePrayerReminderSettings({ soundEnabled: !prayerReminderSettings.soundEnabled })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  prayerReminderSettings.soundEnabled
                    ? isDark ? 'bg-[#7059f0]' : 'bg-[#7c5ef0]'
                    : isDark ? 'bg-white/20' : 'bg-slate-300'
                }`}
                title={prayerReminderSettings.soundEnabled ? 'Mute alarm ringtone' : 'Enable alarm ringtone'}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    prayerReminderSettings.soundEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            {/* Ringtone Selector */}
            <div>
              <label htmlFor="ringtone-select" className="block text-[11px] font-medium text-[#6b6882] dark:text-[#8d8aab] mb-1">
                Ringtone sound
              </label>
              <div className="flex items-center gap-1.5">
                <select
                  id="ringtone-select"
                  value={prayerReminderSettings.ringtone}
                  onChange={(e) => updatePrayerReminderSettings({ ringtone: e.target.value as RingtoneOption })}
                  disabled={!prayerReminderSettings.soundEnabled}
                  className={`flex-1 text-xs font-sans px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-[#0f0f18] border-white/15 text-[#ece9fb] focus:border-[#8b7bff]'
                      : 'bg-white border-[#dedae9] text-[#18172b] focus:border-[#7c5ef0]'
                  } ${!prayerReminderSettings.soundEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {RINGTONE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {/* Preview Sound Button */}
                <button
                  type="button"
                  onClick={() => handlePreviewSound()}
                  disabled={!prayerReminderSettings.soundEnabled}
                  title="Test hear this ringtone"
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium font-sans flex items-center gap-1 transition-colors cursor-pointer ${
                    isPlayingPreview
                      ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                      : isDark
                        ? 'border-white/10 hover:bg-white/[0.06] text-[#c9c6de]'
                        : 'border-[#dedae9] hover:bg-slate-100 text-[#474464]'
                  } ${!prayerReminderSettings.soundEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Play className={`w-3 h-3 stroke-[2] ${isPlayingPreview ? 'animate-spin' : ''}`} />
                  <span>{isPlayingPreview ? 'Playing...' : 'Test'}</span>
                </button>
              </div>
            </div>

            {/* Default Ring Duration */}
            <div>
              <label htmlFor="ring-duration-select" className="block text-[11px] font-medium text-[#6b6882] dark:text-[#8d8aab] mb-1">
                Ring duration (time it rings for)
              </label>
              <div className="flex items-center gap-1.5">
                <select
                  id="ring-duration-select"
                  value={prayerReminderSettings.ringDurationMinutes}
                  onChange={(e) => updatePrayerReminderSettings({ ringDurationMinutes: parseInt(e.target.value, 10) })}
                  className={`w-full text-xs font-sans px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-[#0f0f18] border-white/15 text-[#ece9fb] focus:border-[#8b7bff]'
                      : 'bg-white border-[#dedae9] text-[#18172b] focus:border-[#7c5ef0]'
                  }`}
                >
                  {DURATION_OPTIONS.map((dur) => (
                    <option key={dur.value} value={dur.value}>
                      {dur.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Volume Control */}
            <div className="sm:col-span-2 flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 min-w-0">
                {prayerReminderSettings.soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-[#7c5ef0] dark:text-[#8b7bff] shrink-0" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-[#6b6882] dark:text-[#8d8aab] shrink-0" />
                )}
                <span className="text-[11px] text-[#6b6882] dark:text-[#8d8aab]">Volume</span>
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-xs">
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={prayerReminderSettings.volume}
                  onChange={(e) => updatePrayerReminderSettings({ volume: parseFloat(e.target.value) })}
                  disabled={!prayerReminderSettings.soundEnabled}
                  className={`w-full accent-[#7c5ef0] cursor-pointer ${!prayerReminderSettings.soundEnabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                />
                <span className="text-[11px] font-sans tabular-nums text-[#6b6882] dark:text-[#8d8aab] w-9 text-right">
                  {Math.round(prayerReminderSettings.volume * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily 2:00 PM catch-up indicator */}
        <div
          className={`p-3 rounded-lg border mb-4 flex items-start gap-2.5 text-xs ${
            isDark
              ? 'bg-[#181829] border-white/[0.08] text-[#c9c6de]'
              : 'bg-[#f8f7fd] border-[#dedae9] text-[#474464]'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-[#8b7bff] shrink-0 mt-0.5 stroke-[1.75]" />
          <div className="flex-1">
            <span className="font-semibold block text-[#18172b] dark:text-[#ece9fb]">
              Daily 2:00 PM catch-up reminder
            </span>
            <span className="text-[11px] text-[#6b6882] dark:text-[#8d8aab] leading-snug">
              Always active. Alerts after 2:00 PM if zero daily prayers have been logged.
            </span>
          </div>
        </div>

        {/* Quick Batch Controls */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-inherit border-opacity-10 text-xs">
          <span className="text-[#6b6882] dark:text-[#8d8aab] font-medium">
            Active: <strong className="text-[#18172b] dark:text-[#ece9fb] tabular-nums">{activeCount} of 5</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleToggleAll(true)}
              className="px-2 py-0.5 text-xs font-medium text-[#7c5ef0] dark:text-[#8b7bff] hover:underline cursor-pointer"
            >
              Enable all
            </button>
            <span className="text-[#6b6882] dark:text-[#8d8aab]">·</span>
            <button
              type="button"
              onClick={() => handleToggleAll(false)}
              className="px-2 py-0.5 text-xs font-medium text-[#6b6882] dark:text-[#8d8aab] hover:underline cursor-pointer"
            >
              Disable all
            </button>
          </div>
        </div>

        {/* 5 Prayers List */}
        <div className="space-y-2.5">
          {PRAYER_CONFIG.map((prayer) => {
            const config = prayerReminders[prayer.id] || DEFAULT_PRAYER_REMINDERS[prayer.id];
            const isEnabled = config.enabled;
            const isTesting = testSuccessPrayer === prayer.id;
            const currentDuration = config.ringDurationMinutes || prayerReminderSettings.ringDurationMinutes || 5;

            return (
              <div
                key={prayer.id}
                className={`p-3 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-2.5 ${
                  isDark
                    ? isEnabled
                      ? 'bg-[#181829] border-white/[0.12]'
                      : 'bg-[#131320]/60 border-white/[0.05] opacity-80'
                    : isEnabled
                      ? 'bg-[#fbfafd] border-[#dedae9]'
                      : 'bg-white border-[#e7e4f4] opacity-80'
                }`}
              >
                {/* Left: Prayer Label & Period */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 font-sans text-xs font-semibold ${
                      isEnabled
                        ? isDark
                          ? 'bg-[#7059f0] text-white border-[#7059f0]'
                          : 'bg-[#7c5ef0] text-white border-[#7c5ef0]'
                        : isDark
                          ? 'bg-white/[0.04] text-[#8d8aab] border-white/[0.08]'
                          : 'bg-slate-100 text-[#6b6882] border-slate-200'
                    }`}
                  >
                    {prayer.label[0]}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-semibold tracking-tight ${
                        isEnabled 
                          ? isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
                          : 'text-[#6b6882] dark:text-[#8d8aab]'
                      }`}>
                        {prayer.label}
                      </span>
                      <span className="text-xs text-[#6b6882] dark:text-[#8d8aab]">
                        ({prayer.period})
                      </span>
                    </div>

                    <div className="text-[11px] text-[#6b6882] dark:text-[#8d8aab] flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 stroke-[1.5]" />
                        <span className="tabular-nums font-medium">
                          {isEnabled ? format12HourTime(config.time) : 'Disabled'}
                        </span>
                      </span>

                      {isEnabled && (
                        <span className="flex items-center gap-1 text-[#8b7bff] dark:text-[#a094ff]">
                          <Timer className="w-3 h-3 stroke-[1.5]" />
                          <span>{currentDuration}m alarm</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Time Input, Duration Override, Test Button & Toggle Switch */}
                <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-inherit border-opacity-10">
                  {/* Time Input */}
                  <div className="flex items-center gap-1">
                    <label htmlFor={`time-${prayer.id}`} className="sr-only">
                      {prayer.label} reminder time
                    </label>
                    <input
                      id={`time-${prayer.id}`}
                      type="time"
                      value={config.time}
                      onChange={(e) => handleTimeChange(prayer.id, e.target.value)}
                      disabled={!isEnabled}
                      className={`text-xs font-sans tabular-nums px-2 py-1 rounded-md border transition-colors ${
                        isEnabled
                          ? isDark
                            ? 'bg-[#0e0e17] border-white/15 text-[#ece9fb] focus:border-[#8b7bff] focus:outline-hidden'
                            : 'bg-white border-[#dedae9] text-[#18172b] focus:border-[#7c5ef0] focus:outline-hidden'
                          : 'bg-transparent border-transparent text-[#6b6882] dark:text-[#8d8aab] cursor-not-allowed'
                      }`}
                    />
                  </div>

                  {/* Per-Prayer Ring Duration Selector */}
                  {isEnabled && (
                    <select
                      value={config.ringDurationMinutes || prayerReminderSettings.ringDurationMinutes || 5}
                      onChange={(e) => handlePrayerDurationChange(prayer.id, e.target.value)}
                      title={`Ring duration for ${prayer.label}`}
                      className={`text-[11px] font-sans px-1.5 py-1 rounded-md border transition-colors cursor-pointer ${
                        isDark
                          ? 'bg-[#0e0e17] border-white/15 text-[#ece9fb]'
                          : 'bg-white border-[#dedae9] text-[#18172b]'
                      }`}
                    >
                      <option value="1">1m</option>
                      <option value="2">2m</option>
                      <option value="3">3m</option>
                      <option value="5">5m (default)</option>
                      <option value="10">10m</option>
                      <option value="15">15m</option>
                    </select>
                  )}

                  {/* Test Alarm Button */}
                  <button
                    type="button"
                    onClick={() => handleTestReminder(prayer.id)}
                    title={`Test alarm ringtone for ${prayer.label} (${currentDuration} min ring)`}
                    className={`text-[11px] font-medium font-sans px-2 py-1 rounded-md border flex items-center gap-1 transition-colors cursor-pointer ${
                      isTesting
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : isDark
                          ? 'border-white/10 hover:bg-white/[0.06] text-[#c9c6de]'
                          : 'border-[#dedae9] hover:bg-slate-100 text-[#474464]'
                    }`}
                  >
                    {isTesting ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 stroke-[2] text-emerald-400" />
                        <span>Ringing</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-2.5 h-2.5 stroke-[2]" />
                        <span>Test Alarm</span>
                      </>
                    )}
                  </button>

                  {/* Accessible Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isEnabled}
                    onClick={() => handleToggle(prayer.id)}
                    title={isEnabled ? `Disable ${prayer.label} reminder` : `Enable ${prayer.label} reminder`}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      isEnabled
                        ? isDark ? 'bg-[#7059f0]' : 'bg-[#7c5ef0]'
                        : isDark ? 'bg-white/20' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 mt-6 pt-3.5 border-t border-inherit border-opacity-10 text-xs">
          <button
            type="button"
            onClick={resetPrayerReminders}
            className="flex items-center gap-1 text-[#6b6882] dark:text-[#8d8aab] hover:text-[#18172b] dark:hover:text-[#ece9fb] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Reset defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium font-sans cursor-pointer transition-colors ${
              isDark
                ? 'bg-[#7059f0] text-white hover:bg-[#7e69f5]'
                : 'bg-[#7c5ef0] text-white hover:bg-[#6e4ee6]'
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
