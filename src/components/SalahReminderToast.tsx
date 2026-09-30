import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp, getLocalDateString } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { countLoggedPrayers } from '../services/salahService';
import { alarmAudioService } from '../services/alarmAudioService';
import { PrayerName, PRAYER_CONFIG, PrayerStatus, RingtoneOption } from '../types';
import { 
  Compass, 
  X, 
  ArrowRight, 
  BellRing, 
  Volume2, 
  VolumeX, 
  Users, 
  User as SoloUser,
  Clock
} from 'lucide-react';

interface SalahReminderToastProps {
  onNavigateToSalah: () => void;
}

interface ActiveReminder {
  type: 'daily_afternoon' | 'custom_prayer';
  prayer?: PrayerName;
  prayerLabel?: string;
  timeLabel?: string;
  title: string;
  message: string;
  isTestPreview?: boolean;
  ringDurationMinutes: number;
  ringtone: RingtoneOption;
}

// Convert 24h 'HH:mm' to 'h:mm A'
function format12Hour(timeStr: string): string {
  try {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
  } catch {
    return timeStr;
  }
}

// Format seconds into 'M:SS'
function formatSeconds(totalSecs: number): string {
  const mins = Math.floor(Math.max(0, totalSecs) / 60);
  const secs = Math.max(0, totalSecs) % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * Salah Reminder Toast Notification System:
 * - Plays an alarm ringtone for 5 minutes by default (or user-configured duration).
 * - Displays active countdown and sound wave ringing animation.
 * - Allows instant one-click silence / stop alarm without losing quick log actions.
 * - Auto-silences and dismisses when prayer is logged (Bajamat/Solo) or duration finishes.
 */
export const SalahReminderToast: React.FC<SalahReminderToastProps> = ({ onNavigateToSalah }) => {
  const { 
    salahRecords, 
    prayerReminders, 
    prayerReminderSettings,
    updateSalahPrayer 
  } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [activeReminder, setActiveReminder] = useState<ActiveReminder | null>(null);
  const [isSoundPlaying, setIsSoundPlaying] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300); // 5 min default

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const durationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Stop alarm audio and clear countdown timers
  const stopAlarmSound = useCallback(() => {
    alarmAudioService.stopAlarm();
    setIsSoundPlaying(false);
  }, []);

  const clearAllTimers = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (durationTimeoutRef.current) {
      clearTimeout(durationTimeoutRef.current);
      durationTimeoutRef.current = null;
    }
  }, []);

  // Dismiss reminder completely
  const dismissActiveReminder = useCallback(() => {
    stopAlarmSound();
    clearAllTimers();

    if (!activeReminder) return;

    const todayStr = getLocalDateString();
    try {
      if (activeReminder.type === 'daily_afternoon') {
        localStorage.setItem(`axis_salah_reminder_dismissed_${todayStr}`, 'true');
      } else if (activeReminder.type === 'custom_prayer' && activeReminder.prayer) {
        localStorage.setItem(`axis_salah_prayer_reminder_dismissed_${todayStr}_${activeReminder.prayer}`, 'true');
      }
    } catch {}

    setActiveReminder(null);
  }, [activeReminder, stopAlarmSound, clearAllTimers]);

  // Trigger an active reminder and initiate alarm ringtone & countdown
  const triggerReminder = useCallback((reminder: ActiveReminder) => {
    stopAlarmSound();
    clearAllTimers();

    setActiveReminder(reminder);

    const totalSeconds = (reminder.ringDurationMinutes || 5) * 60;
    setSecondsRemaining(totalSeconds);

    // Start alarm ringtone if sound enabled
    if (prayerReminderSettings.soundEnabled) {
      try {
        alarmAudioService.startAlarm({
          ringtone: reminder.ringtone,
          volume: prayerReminderSettings.volume
        });
        setIsSoundPlaying(true);
      } catch (err) {
        console.warn('Could not auto-start alarm ringtone:', err);
      }
    } else {
      setIsSoundPlaying(false);
    }

    // Countdown interval (decrements every second)
    countdownIntervalRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          // Duration completed
          stopAlarmSound();
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Duration timer to automatically stop alarm after user set duration
    durationTimeoutRef.current = setTimeout(() => {
      stopAlarmSound();
    }, totalSeconds * 1000);
  }, [prayerReminderSettings, stopAlarmSound, clearAllTimers]);

  // Main evaluation logic
  const evaluateReminders = useCallback(() => {
    // Only check if user is active in the app
    if (typeof document !== 'undefined' && document.hidden) {
      return;
    }

    // If an alarm is already ringing or active, don't interrupt
    if (activeReminder) return;

    const now = new Date();
    const todayStr = getLocalDateString(now);
    const todayRecord = salahRecords[todayStr];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    // 1. Check custom prayer reminders
    const prayersToCheck: PrayerName[] = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'];

    for (const prayer of prayersToCheck) {
      const config = prayerReminders[prayer];
      if (!config || !config.enabled) continue;

      // If prayer is already logged for today, skip
      if (todayRecord && todayRecord[prayer] !== 'none') continue;

      // Check if scheduled time has arrived
      const [schedH, schedM] = config.time.split(':').map(Number);
      const schedTotalMinutes = schedH * 60 + schedM;

      // Has the scheduled time arrived? Window: scheduled time up to 240 mins
      const hasArrived = currentTotalMinutes >= schedTotalMinutes && (currentTotalMinutes - schedTotalMinutes <= 240);
      if (!hasArrived) continue;

      // Check if already dismissed today
      const dismissKey = `axis_salah_prayer_reminder_dismissed_${todayStr}_${prayer}`;
      try {
        if (localStorage.getItem(dismissKey) === 'true') continue;
      } catch {}

      // Found active custom prayer reminder!
      const prayerMeta = PRAYER_CONFIG.find(p => p.id === prayer);
      const pLabel = prayerMeta?.label || prayer;

      const ringtone = config.ringtone || prayerReminderSettings.ringtone || 'classic-alarm';
      const ringDurationMinutes = config.ringDurationMinutes || prayerReminderSettings.ringDurationMinutes || 5;

      triggerReminder({
        type: 'custom_prayer',
        prayer,
        prayerLabel: pLabel,
        timeLabel: format12Hour(config.time),
        title: `${pLabel} prayer alarm`,
        message: `${pLabel} hasn't been logged yet today. Alarm is ringing.`,
        ringDurationMinutes,
        ringtone
      });

      return;
    }

    // 2. Check 2:00 PM catch-up daily reminder
    if (currentHour >= 14) {
      const loggedCount = countLoggedPrayers(todayRecord);
      if (loggedCount === 0) {
        const catchupKey = `axis_salah_reminder_dismissed_${todayStr}`;
        let isDismissed = false;
        try {
          isDismissed = localStorage.getItem(catchupKey) === 'true';
        } catch {}

        if (!isDismissed) {
          triggerReminder({
            type: 'daily_afternoon',
            timeLabel: 'Past 2:00 PM',
            title: 'Salah reminder alarm',
            message: 'No daily prayers have been logged yet today. Take a moment to log your routine.',
            ringDurationMinutes: prayerReminderSettings.ringDurationMinutes || 5,
            ringtone: prayerReminderSettings.ringtone || 'classic-alarm'
          });

          return;
        }
      }
    }
  }, [activeReminder, salahRecords, prayerReminders, prayerReminderSettings, triggerReminder]);

  // Periodic and focus event listeners
  useEffect(() => {
    const initialTimer = setTimeout(evaluateReminders, 1500);
    const interval = setInterval(evaluateReminders, 30000);

    const handleVisibility = () => {
      if (!document.hidden) {
        evaluateReminders();
      }
    };

    // Custom preview event listener for testing from settings UI
    const handleTestEvent = (e: CustomEvent<{ prayer?: PrayerName; ringtone?: RingtoneOption; ringDurationMinutes?: number }>) => {
      const p = e.detail?.prayer || 'zuhr';
      const meta = PRAYER_CONFIG.find(item => item.id === p);
      const label = meta?.label || 'Zuhr';
      const cfg = prayerReminders[p];

      const tone = e.detail?.ringtone || cfg?.ringtone || prayerReminderSettings.ringtone || 'classic-alarm';
      const duration = e.detail?.ringDurationMinutes || cfg?.ringDurationMinutes || prayerReminderSettings.ringDurationMinutes || 5;

      triggerReminder({
        type: 'custom_prayer',
        prayer: p,
        prayerLabel: label,
        timeLabel: cfg ? format12Hour(cfg.time) : '1:15 PM',
        title: `${label} prayer alarm (Test)`,
        message: `${label} hasn't been logged yet today. Alarm is ringing for ${duration} minutes.`,
        isTestPreview: true,
        ringDurationMinutes: duration,
        ringtone: tone
      });
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    window.addEventListener('axis-test-prayer-reminder', handleTestEvent as EventListener);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
      window.removeEventListener('axis-test-prayer-reminder', handleTestEvent as EventListener);
      stopAlarmSound();
      clearAllTimers();
    };
  }, [evaluateReminders, triggerReminder, prayerReminders, prayerReminderSettings, stopAlarmSound, clearAllTimers]);

  // If prayers are logged while reminder is ringing, stop alarm and dismiss automatically
  useEffect(() => {
    if (!activeReminder) return;

    const todayStr = getLocalDateString();
    const record = salahRecords[todayStr];

    if (activeReminder.type === 'daily_afternoon') {
      if (countLoggedPrayers(record) > 0) {
        stopAlarmSound();
        clearAllTimers();
        setActiveReminder(null);
      }
    } else if (activeReminder.type === 'custom_prayer' && activeReminder.prayer) {
      if (record && record[activeReminder.prayer] !== 'none') {
        stopAlarmSound();
        clearAllTimers();
        setActiveReminder(null);
      }
    }
  }, [salahRecords, activeReminder, stopAlarmSound, clearAllTimers]);

  const handleQuickLog = async (status: PrayerStatus) => {
    if (!activeReminder || !activeReminder.prayer) return;
    const todayStr = getLocalDateString();
    stopAlarmSound();
    await updateSalahPrayer(todayStr, activeReminder.prayer, status);
    dismissActiveReminder();
  };

  const handleNavigate = () => {
    stopAlarmSound();
    dismissActiveReminder();
    onNavigateToSalah();
  };

  const toggleSound = () => {
    if (isSoundPlaying) {
      stopAlarmSound();
    } else if (activeReminder) {
      try {
        alarmAudioService.startAlarm({
          ringtone: activeReminder.ringtone,
          volume: prayerReminderSettings.volume
        });
        setIsSoundPlaying(true);
      } catch (e) {
        console.warn('Could not start sound:', e);
      }
    }
  };

  if (!activeReminder) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-16 md:bottom-6 right-3 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100vw-1.5rem)] sm:w-auto animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-auto"
    >
      <div
        className={`p-3.5 sm:p-4 rounded-xl border shadow-2xl flex items-start gap-3 backdrop-blur-md transition-colors relative overflow-hidden ${
          isDark
            ? 'bg-[#131320]/95 border-amber-500/30 text-[#ece9fb] ring-1 ring-amber-500/20'
            : 'bg-white/95 border-amber-500/40 text-[#18172b] ring-1 ring-amber-500/25'
        }`}
      >
        {/* Subtle pulsating alarm indicator banner at top */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          isSoundPlaying ? 'bg-gradient-to-r from-amber-500 via-purple-500 to-amber-500 animate-pulse' : 'bg-transparent'
        }`} />

        {/* Left Icon Badge with Alarm Pulse Animation */}
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 relative transition-all ${
            isSoundPlaying
              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40 animate-pulse'
              : isDark
                ? 'bg-[#1c1c2e] text-[#8b7bff] border border-white/[0.08]'
                : 'bg-[#f3f1fb] text-[#7c5ef0] border-[#e7e4f4]'
          }`}
        >
          {activeReminder.type === 'custom_prayer' ? (
            <BellRing className={`w-4 h-4 stroke-[2] ${isSoundPlaying ? 'animate-bounce' : ''}`} />
          ) : (
            <Compass className="w-4 h-4 stroke-[1.75]" />
          )}

          {/* Sound waves icon badge */}
          {isSoundPlaying && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-semibold font-sans tracking-tight flex items-center gap-1.5">
              <span>{activeReminder.title}</span>
              {activeReminder.isTestPreview && (
                <span className="text-[9px] font-sans font-medium px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-600 dark:text-purple-300">
                  Preview
                </span>
              )}
            </h4>

            {/* Countdown / Duration pill */}
            <div className={`flex items-center gap-1 text-[10px] font-sans tabular-nums font-semibold px-2 py-0.5 rounded-full border ${
              isSoundPlaying
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 animate-pulse'
                : 'bg-black/5 dark:bg-white/5 border-inherit text-[#6b6882] dark:text-[#8d8aab]'
            }`}>
              <Clock className="w-2.5 h-2.5 stroke-[2]" />
              <span>{formatSeconds(secondsRemaining)} left</span>
            </div>
          </div>

          <p className="text-[11px] text-[#6b6882] dark:text-[#8d8aab] mt-1 leading-snug font-sans">
            {activeReminder.message}
          </p>

          {/* Sound status indicator pill & quick audio toggle */}
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={toggleSound}
              className={`text-[11px] font-sans font-medium px-2 py-0.5 rounded-md flex items-center gap-1.5 border transition-colors cursor-pointer ${
                isSoundPlaying
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25'
                  : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-[#6b6882] dark:text-[#8d8aab] hover:text-[#18172b] dark:hover:text-[#ece9fb]'
              }`}
              title={isSoundPlaying ? 'Stop ringtone audio' : 'Play ringtone audio'}
            >
              {isSoundPlaying ? (
                <>
                  <Volume2 className="w-3 h-3 stroke-[2] animate-pulse text-amber-500" />
                  <span>Ringing ({activeReminder.ringDurationMinutes}m alarm) • Click to silence</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3 h-3 stroke-[2]" />
                  <span>Alarm muted • Click to play sound</span>
                </>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {activeReminder.type === 'custom_prayer' && activeReminder.prayer ? (
              <>
                <button
                  type="button"
                  onClick={() => handleQuickLog('bajamat')}
                  className={`text-xs font-medium font-sans px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isDark
                      ? 'bg-[#7059f0] text-white hover:bg-[#7e69f5]'
                      : 'bg-[#7c5ef0] text-white hover:bg-[#6e4ee6]'
                  }`}
                  title="Mark prayer as completed in congregation and stop alarm"
                >
                  <Users className="w-3 h-3 stroke-[2]" />
                  <span>Bajamat</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLog('solo')}
                  className={`text-xs font-medium font-sans px-2 py-1 rounded-md border transition-colors cursor-pointer flex items-center gap-1 ${
                    isDark
                      ? 'border-white/10 hover:bg-white/[0.06] text-[#ece9fb]'
                      : 'border-slate-200 hover:bg-slate-50 text-[#18172b]'
                  }`}
                  title="Mark prayer as completed alone and stop alarm"
                >
                  <SoloUser className="w-3 h-3 stroke-[2]" />
                  <span>Solo</span>
                </button>

                <button
                  type="button"
                  onClick={handleNavigate}
                  className={`text-xs font-medium font-sans px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    isDark
                      ? 'text-[#8d8aab] hover:text-[#ece9fb] hover:bg-white/[0.05]'
                      : 'text-[#6b6882] hover:text-[#18172b] hover:bg-slate-100'
                  }`}
                >
                  View Salah
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleNavigate}
                className={`text-xs font-medium font-sans px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  isDark
                    ? 'bg-[#7059f0] text-white hover:bg-[#7e69f5]'
                    : 'bg-[#7c5ef0] text-white hover:bg-[#6e4ee6]'
                }`}
              >
                <span>Log Salah</span>
                <ArrowRight className="w-3 h-3 stroke-[2]" />
              </button>
            )}

            {/* Quick Stop Audio / Dismiss */}
            {isSoundPlaying ? (
              <button
                type="button"
                onClick={stopAlarmSound}
                className="text-xs font-medium font-sans px-2 py-1 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer"
                title="Silence the ringtone sound now"
              >
                Silence Alarm
              </button>
            ) : null}

            <button
              type="button"
              onClick={dismissActiveReminder}
              className={`text-xs font-medium font-sans px-2 py-1 rounded-md transition-colors cursor-pointer ${
                isDark
                  ? 'text-[#8d8aab] hover:text-[#ece9fb] hover:bg-white/[0.05]'
                  : 'text-[#6b6882] hover:text-[#18172b] hover:bg-slate-100'
              }`}
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={dismissActiveReminder}
          aria-label="Dismiss alarm reminder"
          className="text-[#6b6882] dark:text-[#8d8aab] hover:text-[#18172b] dark:hover:text-[#ece9fb] p-0.5 rounded cursor-pointer shrink-0 transition-colors"
        >
          <X className="w-3.5 h-3.5 stroke-[1.75]" />
        </button>
      </div>
    </div>
  );
};
