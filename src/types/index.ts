export type DayColor = 'red' | 'yellow' | 'orange' | 'green' | 'gold' | null;

export interface Habit {
  id: string;
  name: string;
  type: 'build' | 'break'; // 'build' (start doing) or 'break' (stop doing)
  frequency: 'daily' | 'weekdays' | 'weekends' | 'weekly';
  customDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  isAnchor: boolean; // Anchor habit weighs more heavily in day's color evaluation
  category?: string;
  icon?: string;
  createdAt: string;
  archived?: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  completed: boolean;
  completedAt?: string;
  linkedHabitId?: string;
  order: number;
  isRecurring?: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  addToCalendar?: boolean;
  calendarEventId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  isAllDay?: boolean;
  source: 'google' | 'manual';
  location?: string;
}

export interface ScreenTimeAppUsage {
  packageName: string;
  appName: string;
  durationMinutes: number;
  isHighRisk: boolean;
  icon?: string;
}

export interface DailyScreenTimeData {
  totalMinutes: number;
  highRiskMinutes: number;
  apps: ScreenTimeAppUsage[];
  lastSyncedAt?: string;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD format (primary key in user's days collection)
  color: DayColor;
  note: string; // Short written note: what happened, what triggered it, what you did well
  reviewedAt?: string;
  completedHabitIds: string[]; // Habit IDs completed on this date
  completedTaskIds: string[];  // Task IDs completed on this date
  screenTime?: DailyScreenTimeData;
  autoSuggestedColor?: DayColor;
  autoSuggestReason?: string;
}

export interface ColorDef {
  color: DayColor;
  label: string;
  description: string;
  badgeClass: string;
  bgClass: string;
  borderClass: string;
  hex: string;
}

export const COLOR_DEFINITIONS: Record<Exclude<DayColor, null>, ColorDef> = {
  red: {
    color: 'red',
    label: 'Red',
    description: 'Did something sinful or harmful to oneself/others',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    bgClass: 'bg-rose-950/60',
    borderClass: 'border-rose-500/50',
    hex: '#ef4444'
  },
  yellow: {
    color: 'yellow',
    label: 'Yellow',
    description: 'Wasted time, but nothing harmful committed',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    bgClass: 'bg-amber-950/60',
    borderClass: 'border-amber-500/50',
    hex: '#f59e0b'
  },
  orange: {
    color: 'orange',
    label: 'Orange',
    description: 'Not productive, but not wasteful either; neutral maintenance',
    badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    bgClass: 'bg-orange-950/60',
    borderClass: 'border-orange-500/50',
    hex: '#f97316'
  },
  green: {
    color: 'green',
    label: 'Green',
    description: 'Avoided harmful acts AND did something genuinely useful',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    bgClass: 'bg-emerald-950/60',
    borderClass: 'border-emerald-500/50',
    hex: '#10b981'
  },
  gold: {
    color: 'gold',
    label: 'Gold',
    description: 'Exceeded normal effort or achieved a major milestone',
    badgeClass: 'bg-yellow-400/25 text-amber-200 border-yellow-400/50',
    bgClass: 'bg-yellow-950/70',
    borderClass: 'border-yellow-400/70',
    hex: '#eab308'
  }
};

export type TargetPlatform = 'android' | 'desktop' | 'web';

// --- SALAH (DAILY PRAYERS) ---
export type PrayerName = 'fajr' | 'zuhr' | 'asr' | 'maghrib' | 'isha';
export type PrayerStatus = 'none' | 'solo' | 'bajamat';

export interface SalahRecord {
  date: string; // YYYY-MM-DD
  fajr: PrayerStatus;
  zuhr: PrayerStatus;
  asr: PrayerStatus;
  maghrib: PrayerStatus;
  isha: PrayerStatus;
  updatedAt: string; // ISO timestamp
}

export const PRAYER_CONFIG: { id: PrayerName; label: string; period: string }[] = [
  { id: 'fajr', label: 'Fajr', period: 'Dawn' },
  { id: 'zuhr', label: 'Zuhr', period: 'Noon' },
  { id: 'asr', label: 'Asr', period: 'Afternoon' },
  { id: 'maghrib', label: 'Maghrib', period: 'Sunset' },
  { id: 'isha', label: 'Isha', period: 'Night' }
];

export const createDefaultSalahRecord = (date: string): SalahRecord => ({
  date,
  fajr: 'none',
  zuhr: 'none',
  asr: 'none',
  maghrib: 'none',
  isha: 'none',
  updatedAt: new Date().toISOString()
});

export interface PrayerReminderConfig {
  enabled: boolean;
  time: string; // HH:mm format
  ringDurationMinutes?: number; // per-prayer override, defaults to global ringDurationMinutes
  ringtone?: RingtoneOption; // per-prayer override
}

export type RingtoneOption = 'classic-alarm' | 'gentle-bell' | 'marimba-melody' | 'digital-pulse' | 'soft-chime';

export interface RingtoneConfig {
  id: RingtoneOption;
  label: string;
  description: string;
}

export const RINGTONE_OPTIONS: RingtoneConfig[] = [
  { id: 'classic-alarm', label: 'Classic Alarm', description: 'Rhythmic two-tone digital alarm beep' },
  { id: 'gentle-bell', label: 'Gentle Bell', description: 'Harmonic resonant acoustic bell' },
  { id: 'marimba-melody', label: 'Melodic Chime', description: 'Pleasing acoustic ascending notes' },
  { id: 'digital-pulse', label: 'Digital Pulse', description: 'Modern crisp radar pulse' },
  { id: 'soft-chime', label: 'Singing Chime', description: 'Peaceful mindfulness bowl chime' }
];

export interface PrayerReminderGlobalSettings {
  soundEnabled: boolean;
  ringtone: RingtoneOption;
  ringDurationMinutes: number; // default: 5 minutes
  volume: number; // 0.0 to 1.0 (default 0.8)
}

export const DEFAULT_PRAYER_REMINDER_SETTINGS: PrayerReminderGlobalSettings = {
  soundEnabled: true,
  ringtone: 'classic-alarm',
  ringDurationMinutes: 5,
  volume: 0.8
};

export type SalahCustomReminders = Record<PrayerName, PrayerReminderConfig>;

export const DEFAULT_PRAYER_REMINDERS: SalahCustomReminders = {
  fajr: { enabled: false, time: '05:30', ringDurationMinutes: 5, ringtone: 'classic-alarm' },
  zuhr: { enabled: false, time: '13:15', ringDurationMinutes: 5, ringtone: 'classic-alarm' },
  asr: { enabled: false, time: '16:45', ringDurationMinutes: 5, ringtone: 'classic-alarm' },
  maghrib: { enabled: false, time: '19:15', ringDurationMinutes: 5, ringtone: 'classic-alarm' },
  isha: { enabled: false, time: '21:00', ringDurationMinutes: 5, ringtone: 'classic-alarm' }
};

// --- MOBILE SWIPE GESTURES CONFIGURATION ---
export type SwipeTaskAction = 'delete' | 'complete' | 'expand' | 'none';
export type SwipeSensitivity = 'low' | 'normal' | 'high';

export interface SwipeGestureSettings {
  enabled: boolean;
  enablePageNavigation: boolean;
  leftSwipeAction: SwipeTaskAction;
  rightSwipeAction: SwipeTaskAction;
  sensitivity: SwipeSensitivity;
  hapticFeedback: boolean;
}

export const DEFAULT_SWIPE_GESTURE_SETTINGS: SwipeGestureSettings = {
  enabled: true,
  enablePageNavigation: true,
  leftSwipeAction: 'delete',
  rightSwipeAction: 'complete',
  sensitivity: 'normal',
  hapticFeedback: true
};

export const SWIPE_SENSITIVITY_THRESHOLDS: Record<SwipeSensitivity, { label: string; thresholdPx: number; desc: string }> = {
  high: { label: 'High', thresholdPx: 35, desc: 'Quick, responsive touch (~35px)' },
  normal: { label: 'Normal', thresholdPx: 60, desc: 'Balanced standard swipe (~60px)' },
  low: { label: 'Low', thresholdPx: 100, desc: 'Firm, intentional swipe (~100px)' }
};

