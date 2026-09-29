import { registerPlugin } from '@capacitor/core';
import { isAndroidCapacitor } from './usageStatsService';
import { Habit, SalahRecord, DailyRecord, DayColor, PrayerName, PrayerStatus } from '../types';

interface WidgetSyncPayload {
  date: string;
  color: string | null;
  note: string;
  salah: {
    fajr: string;
    zuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  habits: Array<{
    id: string;
    name: string;
    isAnchor: boolean;
    completed: boolean;
  }>;
}

interface WidgetDataResponse {
  todayDate: string;
  color: string;
  note: string;
  hasPendingSync: boolean;
  salah: {
    fajr: string;
    zuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  habitsJson: string;
}

interface AxisWidgetPluginInterface {
  syncWidgetData(options: WidgetSyncPayload): Promise<{ synced: boolean }>;
  getWidgetData(): Promise<WidgetDataResponse>;
  clearPendingSync(): Promise<{ cleared: boolean }>;
  notifyWidgets(): Promise<{ notified: boolean }>;
}

const AxisWidget = registerPlugin<AxisWidgetPluginInterface>('AxisWidget');

/**
 * Pushes the current day's rating, Salah prayers, and active habits to native Android widgets.
 * Writes directly to SharedPreferences so home screen widgets reflect changes instantly.
 */
export async function syncToNativeAndroidWidgets(
  todayDate: string,
  todayDailyRecord: DailyRecord | undefined,
  todaySalahRecord: SalahRecord | undefined,
  habits: Habit[]
): Promise<void> {
  if (!isAndroidCapacitor()) return;

  try {
    const activeHabits = habits
      .filter(h => !h.archived)
      .map(h => ({
        id: h.id,
        name: h.name,
        isAnchor: Boolean(h.isAnchor),
        completed: Boolean(todayDailyRecord?.completedHabitIds?.includes(h.id))
      }));

    const payload: WidgetSyncPayload = {
      date: todayDate,
      color: todayDailyRecord?.color || '',
      note: todayDailyRecord?.note || '',
      salah: {
        fajr: todaySalahRecord?.fajr || 'none',
        zuhr: todaySalahRecord?.zuhr || 'none',
        asr: todaySalahRecord?.asr || 'none',
        maghrib: todaySalahRecord?.maghrib || 'none',
        isha: todaySalahRecord?.isha || 'none'
      },
      habits: activeHabits
    };

    await AxisWidget.syncWidgetData(payload);
  } catch (err) {
    console.warn('Native widget sync skipped or failed:', err);
  }
}

/**
 * Checks if the user interacted with home screen widgets while the app was closed/offline.
 * If pending updates exist, returns the updated payload to be merged into in-app state and Firestore.
 */
export async function pollPendingWidgetUpdates(): Promise<WidgetDataResponse | null> {
  if (!isAndroidCapacitor()) return null;

  try {
    const data = await AxisWidget.getWidgetData();
    if (data && data.hasPendingSync) {
      await AxisWidget.clearPendingSync();
      return data;
    }
  } catch (err) {
    console.warn('Error reading widget updates:', err);
  }
  return null;
}
