import { Capacitor, registerPlugin } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

export interface UsageStatItem {
  packageName: string;
  totalTimeForegroundMs: number;
  totalMinutes: number;
  lastTimeUsed: number;
  firstTimeStamp?: number;
  lastTimeStamp?: number;
}

export interface UsageStatsPluginInterface {
  hasUsagePermission(): Promise<{ granted: boolean }>;
  requestUsagePermission(): Promise<{ opened: boolean }>;
  getUsageStats(options?: { startTime?: number; endTime?: number }): Promise<{
    usageStats: UsageStatItem[];
    startTime: number;
    endTime: number;
  }>;
}

// Register native plugin for Capacitor
export const NativeUsageStats = registerPlugin<UsageStatsPluginInterface>('UsageStats');

export const isNativeAndroid = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && Boolean((window as any).electronAPI?.isElectron);
};

export const getRuntimePlatform = (): 'android' | 'electron' | 'web' => {
  if (isNativeAndroid()) return 'android';
  if (isElectron()) return 'electron';
  return 'web';
};

/**
 * Checks if the Android device has granted Usage Access permissions.
 * Gracefully returns false on non-Android platforms.
 */
export async function checkAndroidUsagePermission(): Promise<boolean> {
  if (!isNativeAndroid()) return false;
  try {
    const res = await NativeUsageStats.hasUsagePermission();
    return Boolean(res?.granted);
  } catch (err) {
    console.warn('NativeUsageStats.hasUsagePermission error:', err);
    return false;
  }
}

/**
 * Dispatches intent to Android Usage Access system settings.
 */
export async function requestAndroidUsagePermission(): Promise<boolean> {
  if (!isNativeAndroid()) return false;
  try {
    const res = await NativeUsageStats.requestUsagePermission();
    return Boolean(res?.opened);
  } catch (err) {
    console.warn('NativeUsageStats.requestUsagePermission error:', err);
    return false;
  }
}

/**
 * Fetches real usage stats from Android UsageStatsManager.
 */
export async function fetchAndroidUsageStats(
  startTime?: number,
  endTime?: number
): Promise<UsageStatItem[]> {
  if (!isNativeAndroid()) return [];
  try {
    const res = await NativeUsageStats.getUsageStats({ startTime, endTime });
    return res?.usageStats || [];
  } catch (err) {
    console.warn('NativeUsageStats.getUsageStats error:', err);
    return [];
  }
}

/**
 * Registers Deep Link handler for OAuth on Android Capacitor
 */
export function registerAndroidOAuthListener(
  onOAuthRedirect: (url: string) => void
): () => void {
  if (!Capacitor.isNativePlatform()) {
    return () => {};
  }

  const handle = CapApp.addListener('appUrlOpen', (event) => {
    if (event.url && event.url.startsWith('com.axis.app://')) {
      onOAuthRedirect(event.url);
    }
  });

  return () => {
    handle.then((h) => h.remove());
  };
}
