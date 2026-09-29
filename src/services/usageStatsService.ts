import { registerPlugin, Capacitor } from '@capacitor/core';

export interface NativeUsageStat {
  packageName: string;
  totalTimeInForegroundMs: number;
  totalMinutes: number;
  lastTimeUsed: number;
}

export interface UsageStatsPluginInterface {
  hasUsagePermission(): Promise<{ granted: boolean }>;
  requestUsagePermission(): Promise<{ requested: boolean }>;
  getUsageStats(options?: { startDate?: number; endDate?: number }): Promise<{
    stats: NativeUsageStat[];
    startTime: number;
    endTime: number;
  }>;
}

// Register the custom plugin for Capacitor
export const UsageStats = registerPlugin<UsageStatsPluginInterface>('UsageStats');

/**
 * Returns true if the app is currently running inside native Android via Capacitor.
 */
export function isAndroidCapacitor(): boolean {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  } catch (e) {
    return false;
  }
}

/**
 * Returns true if running inside the Electron desktop shell.
 */
export function isElectronEnvironment(): boolean {
  return typeof window !== 'undefined' && Boolean((window as any).electronAPI?.isElectron);
}

/**
 * Queries Android system usage access permission via native Java plugin.
 */
export async function checkNativeUsagePermission(): Promise<boolean> {
  if (!isAndroidCapacitor()) return false;
  try {
    const res = await UsageStats.hasUsagePermission();
    return Boolean(res?.granted);
  } catch (err) {
    console.warn('Native usage permission check failed:', err);
    return false;
  }
}

/**
 * Opens system Usage Access settings screen on Android so the user can enable permission.
 */
export async function requestNativeUsagePermission(): Promise<void> {
  if (!isAndroidCapacitor()) return;
  try {
    await UsageStats.requestUsagePermission();
  } catch (err) {
    console.warn('Failed to open Usage Access Settings:', err);
  }
}

/**
 * Fetches per-app usage stats from UsageStatsManager on Android.
 */
export async function fetchNativeUsageStats(
  startDate?: number,
  endDate?: number
): Promise<NativeUsageStat[] | null> {
  if (!isAndroidCapacitor()) return null;
  try {
    const res = await UsageStats.getUsageStats({ startDate, endDate });
    return res.stats || [];
  } catch (err) {
    console.warn('Failed to fetch native usage stats:', err);
    return null;
  }
}
