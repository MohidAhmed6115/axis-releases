import { Habit, TaskItem, DailyRecord, CalendarEvent, DailyScreenTimeData, SalahRecord } from '../types';

export interface GuestDataStore {
  habits: Habit[];
  tasks: TaskItem[];
  dailyRecords: Record<string, DailyRecord>;
  calendarEvents: CalendarEvent[];
  highRiskApps: string[];
  simulatedScreenTime: DailyScreenTimeData;
  salahRecords: Record<string, SalahRecord>;
  salahAsAnchorHabit: boolean;
}

const GUEST_STORAGE_KEY = 'axis_hive_guest_data_v1';
const GUEST_INITIALIZED_KEY = 'axis_guest_initialized';

export const DEFAULT_GUEST_HABITS: Habit[] = [];

export const DEFAULT_GUEST_TASKS: TaskItem[] = [];

export const DEFAULT_GUEST_EVENTS: CalendarEvent[] = [];

export const DEFAULT_HIGH_RISK_APPS: string[] = [];

export const DEFAULT_SCREEN_TIME: DailyScreenTimeData = {
  totalMinutes: 0,
  highRiskMinutes: 0,
  apps: [],
  lastSyncedAt: new Date().toISOString()
};

const LEGACY_PREVIEW_HABIT_IDS = new Set([
  'local-habit-anchor-work',
  'local-habit-clean-screen',
  'local-habit-movement',
  'local-habit-reading',
  'local-habit-no-late-scroll',
  'habit-anchor-morning',
  'habit-nofap-discipline',
  'habit-exercise',
  'habit-reading',
  'habit-no-late-scroll'
]);

const LEGACY_PREVIEW_TASK_IDS = new Set([
  'local-task-1',
  'local-task-2',
  'task-1',
  'task-2'
]);

const LEGACY_PREVIEW_EVENT_IDS = new Set([
  'local-cal-1',
  'cal-event-1'
]);

export const LEGACY_PREVIEW_PACKAGES = new Set([
  'com.instagram.android',
  'com.zhiliaoapp.musically',
  'com.google.android.youtube',
  'com.twitter.android',
  'com.reddit.frontpage',
  'com.supercell.clashofclans',
  'org.telegram.messenger',
  'com.slack',
  'com.google.android.gm',
  'com.android.chrome'
]);

/**
 * Loads device-local guest data (Hive storage equivalent).
 * Starts completely empty with clean state (no preview or seed data).
 */
export function loadGuestData(): GuestDataStore {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (raw) {
      const parsed: GuestDataStore = JSON.parse(raw);
      // Cleanse any legacy preview / demo data that may have been stored in previous builds
      const cleanedHabits = (parsed.habits || []).filter(h => !LEGACY_PREVIEW_HABIT_IDS.has(h.id));
      const cleanedTasks = (parsed.tasks || []).filter(t => !LEGACY_PREVIEW_TASK_IDS.has(t.id));
      const cleanedEvents = (parsed.calendarEvents || []).filter(e => !LEGACY_PREVIEW_EVENT_IDS.has(e.id) && e.title !== 'Focus Sprint & Engineering');
      
      const cleanedHighRiskApps = (parsed.highRiskApps || []).filter(
        p => Boolean(p) && !LEGACY_PREVIEW_PACKAGES.has(p)
      );

      const cleanedApps = (parsed.simulatedScreenTime?.apps || []).filter(
        a => Boolean(a && a.packageName) && !LEGACY_PREVIEW_PACKAGES.has(a.packageName)
      );
      const totalMinutes = cleanedApps.reduce((acc, a) => acc + (a.durationMinutes || 0), 0);
      const highRiskMinutes = cleanedApps
        .filter(a => a.isHighRisk || cleanedHighRiskApps.includes(a.packageName))
        .reduce((acc, a) => acc + (a.durationMinutes || 0), 0);

      const cleanedScreenTime: DailyScreenTimeData = {
        totalMinutes,
        highRiskMinutes,
        apps: cleanedApps,
        lastSyncedAt: parsed.simulatedScreenTime?.lastSyncedAt || new Date().toISOString()
      };

      const cleanedStore: GuestDataStore = {
        habits: cleanedHabits,
        tasks: cleanedTasks,
        dailyRecords: parsed.dailyRecords || {},
        calendarEvents: cleanedEvents,
        highRiskApps: cleanedHighRiskApps,
        simulatedScreenTime: cleanedScreenTime,
        salahRecords: parsed.salahRecords || {},
        salahAsAnchorHabit: Boolean(parsed.salahAsAnchorHabit)
      };

      saveGuestData(cleanedStore);
      return cleanedStore;
    }
  } catch (e) {
    console.error('Error loading guest data:', e);
  }

  // Pure clean slate: no preview habits, tasks, or events
  const initialStore: GuestDataStore = {
    habits: [],
    tasks: [],
    dailyRecords: {},
    calendarEvents: [],
    highRiskApps: [],
    simulatedScreenTime: DEFAULT_SCREEN_TIME,
    salahRecords: {},
    salahAsAnchorHabit: false
  };

  saveGuestData(initialStore);
  localStorage.setItem(GUEST_INITIALIZED_KEY, 'true');
  return initialStore;
}

/**
 * Persists guest profile locally without making any Firestore calls.
 */
export function saveGuestData(data: GuestDataStore): void {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving guest data:', e);
  }
}

/**
 * Clears local guest profile after successful merge to Firestore on user sign in.
 */
export function clearGuestData(): void {
  try {
    localStorage.removeItem(GUEST_STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing guest data:', e);
  }
}

/**
 * Check if there is local guest data available to be merged.
 */
export function hasGuestDataToMerge(): boolean {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return false;
    const parsed: GuestDataStore = JSON.parse(raw);
    return (
      (parsed.habits && parsed.habits.length > 0) ||
      (parsed.tasks && parsed.tasks.length > 0) ||
      (parsed.dailyRecords && Object.keys(parsed.dailyRecords).length > 0) ||
      (parsed.salahRecords && Object.keys(parsed.salahRecords).length > 0)
    );
  } catch {
    return false;
  }
}
