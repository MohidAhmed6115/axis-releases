import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  auth, 
  onAuthStateChanged, 
  signInWithPopup, 
  googleProvider, 
  GoogleAuthProvider,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  fbSignOut,
  User 
} from '../lib/firebase';
import { 
  Habit, 
  TaskItem, 
  DailyRecord, 
  CalendarEvent, 
  TargetPlatform,
  DayColor,
  DailyScreenTimeData,
  PrayerName,
  PrayerStatus,
  SalahRecord,
  createDefaultSalahRecord,
  PrayerReminderConfig,
  SalahCustomReminders,
  DEFAULT_PRAYER_REMINDERS,
  PrayerReminderGlobalSettings,
  DEFAULT_PRAYER_REMINDER_SETTINGS,
  SwipeGestureSettings,
  DEFAULT_SWIPE_GESTURE_SETTINGS
} from '../types';
import { alarmAudioService } from '../services/alarmAudioService';
import { 
  subscribeToHabits, 
  subscribeToTasks, 
  subscribeToDailyRecords, 
  subscribeToCalendarEvents, 
  subscribeToSalahRecords,
  saveHabit, 
  deleteHabit, 
  saveTask, 
  deleteTask, 
  toggleHabitForDay, 
  submitDailyReview, 
  saveCalendarEvent, 
  deleteCalendarEvent,
  saveSalahRecord,
  seedInitialUserData,
  mergeGuestDataToFirestore
} from '../services/dataService';
import { 
  loadGuestData, 
  saveGuestData, 
  clearGuestData,
  hasGuestDataToMerge,
  DEFAULT_HIGH_RISK_APPS,
  DEFAULT_SCREEN_TIME,
  LEGACY_PREVIEW_PACKAGES,
  GuestDataStore 
} from '../services/localGuestStorage';
import {
  syncTaskToGoogleCalendar,
  deleteGoogleCalendarEvent,
  setStoredGCalToken
} from '../services/calendarSyncService';
import { isAndroidCapacitor, isElectronEnvironment } from '../services/usageStatsService';
import { initOAuthDeepLinkListener, startElectronGoogleOAuth } from '../services/nativeOAuthService';
import { isDayAllPrayersLogged, countLoggedPrayers } from '../services/salahService';
import { syncToNativeAndroidWidgets, pollPendingWidgetUpdates } from '../services/nativeWidgetService';

// Format YYYY-MM-DD in local time
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export type AuthMode = 'guest' | 'authenticated';

interface AppContextType {
  user: User | null;
  authMode: AuthMode;
  loading: boolean;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  platform: TargetPlatform;
  setPlatform: (p: TargetPlatform) => void;

  // Navigation / Modal controls
  isAuthModalOpen: boolean;
  openAuthModal: (reason?: string) => void;
  closeAuthModal: () => void;
  authModalReason: string | null;

  // Banner & Sync confirmation
  showSyncBanner: boolean;
  dismissSyncBanner: () => void;
  syncConfirmationMsg: string | null;
  clearSyncConfirmation: () => void;

  // Auth actions
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;

  // Data
  habits: Habit[];
  tasks: TaskItem[];
  dailyRecords: Record<string, DailyRecord>;
  calendarEvents: CalendarEvent[];
  salahRecords: Record<string, SalahRecord>;

  // Quick operations (Dual-backed: Local for guest, Firestore for user)
  toggleHabit: (habitId: string) => Promise<void>;
  toggleTaskCompletion: (taskId: string) => Promise<void>;
  addNewHabit: (habit: Habit) => Promise<void>;
  removeHabit: (habitId: string) => Promise<void>;
  addNewTask: (task: TaskItem) => Promise<void>;
  updateTask: (task: TaskItem) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
  reorderTasks: (newTasks: TaskItem[]) => Promise<void>;
  recordReview: (color: DayColor, note: string) => Promise<void>;
  addEvent: (event: CalendarEvent) => Promise<void>;
  removeEvent: (eventId: string) => Promise<void>;

  // Salah Operations
  updateSalahPrayer: (date: string, prayer: PrayerName, status: PrayerStatus) => Promise<void>;
  salahAsAnchorHabit: boolean;
  setSalahAsAnchorHabit: (enabled: boolean) => void;
  prayerReminders: SalahCustomReminders;
  updatePrayerReminder: (prayer: PrayerName, config: Partial<PrayerReminderConfig>) => void;
  resetPrayerReminders: () => void;
  prayerReminderSettings: PrayerReminderGlobalSettings;
  updatePrayerReminderSettings: (settings: Partial<PrayerReminderGlobalSettings>) => void;

  // Swipe Gesture Configuration
  swipeGestureSettings: SwipeGestureSettings;
  updateSwipeGestureSettings: (settings: Partial<SwipeGestureSettings>) => void;
  resetSwipeGestureSettings: () => void;

  // Calendar auto-sync settings
  autoSyncCalendarTasks: boolean;
  setAutoSyncCalendarTasks: (enabled: boolean) => void;

  // Screen time state
  screenTimeSettings: {
    highRiskApps: string[];
    simulatedScreenTime: DailyScreenTimeData;
  };
  setHighRiskApps: (apps: string[]) => void;
  updateSimulatedScreenTime: (data: DailyScreenTimeData) => void;

  // Viewport mode simulation
  deviceViewportMode: 'phone' | 'full';
  setDeviceViewportMode: (m: 'phone' | 'full') => void;

  // Auto suggestion
  computeSuggestedColor: (date: string) => { color: DayColor; reason: string };

  // Instrument calibration signature motion trigger
  calibrationTrigger: number;
  triggerCalibration: () => void;

  // Clear all data / Reset clean slate
  clearAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // Guest mode is default on first launch - never blocks user!
  const [authMode, setAuthMode] = useState<AuthMode>('guest');
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [platform, setPlatform] = useState<TargetPlatform>(() => {
    if (isElectronEnvironment()) return 'desktop';
    if (isAndroidCapacitor()) return 'android';
    return 'android';
  });

  // Non-blocking sign-in navigation modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<string | null>(null);

  // Persistent but dismissible banner
  const [showSyncBanner, setShowSyncBanner] = useState<boolean>(() => {
    return localStorage.getItem('axis_dismiss_sync_banner') !== 'true';
  });
  const [syncConfirmationMsg, setSyncConfirmationMsg] = useState<string | null>(null);

  // Local Guest State (backed by Hive/localStorage)
  const [guestStore, setGuestStore] = useState<GuestDataStore>(() => loadGuestData());

  // Instrument calibration motion trigger (signature mechanical calibration on review log)
  const [calibrationTrigger, setCalibrationTrigger] = useState<number>(() => Date.now());
  const triggerCalibration = () => setCalibrationTrigger(Date.now());

  // Live in-memory states (populated either from guestStore or Firestore subscriptions)
  const [habits, setHabits] = useState<Habit[]>(() => guestStore.habits || []);
  const [tasks, setTasks] = useState<TaskItem[]>(() => guestStore.tasks || []);
  const [dailyRecords, setDailyRecords] = useState<Record<string, DailyRecord>>(() => guestStore.dailyRecords || {});
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => guestStore.calendarEvents || []);
  const [salahRecords, setSalahRecords] = useState<Record<string, SalahRecord>>(() => guestStore.salahRecords || {});

  // Salah as Anchor Habit setting
  const [salahAsAnchorHabit, setSalahAsAnchorHabitState] = useState<boolean>(() => {
    const stored = localStorage.getItem('axis_salah_as_anchor_habit');
    if (stored !== null) return stored === 'true';
    return guestStore.salahAsAnchorHabit || false;
  });

  const setSalahAsAnchorHabit = (enabled: boolean) => {
    setSalahAsAnchorHabitState(enabled);
    localStorage.setItem('axis_salah_as_anchor_habit', enabled ? 'true' : 'false');
    if (authMode === 'guest') {
      persistGuestStore(s => ({ ...s, salahAsAnchorHabit: enabled }));
    }
  };

  const updateSalahPrayer = async (date: string, prayer: PrayerName, status: PrayerStatus) => {
    const existing = salahRecords[date] || createDefaultSalahRecord(date);
    const updated: SalahRecord = {
      ...existing,
      date,
      [prayer]: status,
      updatedAt: new Date().toISOString()
    };

    const newMap = {
      ...salahRecords,
      [date]: updated
    };
    setSalahRecords(newMap);

    if (authMode === 'authenticated' && user) {
      await saveSalahRecord(user.uid, updated);
    } else {
      persistGuestStore(s => ({
        ...s,
        salahRecords: newMap
      }));
    }
  };

  // Custom Reminders for Each Prayer
  const [prayerReminders, setPrayerReminders] = useState<SalahCustomReminders>(() => {
    try {
      const stored = localStorage.getItem('axis_salah_custom_reminders');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_PRAYER_REMINDERS,
          ...parsed
        };
      }
    } catch (e) {
      console.error('Error loading prayer reminders:', e);
    }
    return DEFAULT_PRAYER_REMINDERS;
  });

  const updatePrayerReminder = (prayer: PrayerName, config: Partial<PrayerReminderConfig>) => {
    setPrayerReminders(prev => {
      const updated: SalahCustomReminders = {
        ...prev,
        [prayer]: {
          ...prev[prayer],
          ...config
        }
      };
      try {
        localStorage.setItem('axis_salah_custom_reminders', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving prayer reminders:', e);
      }
      return updated;
    });
  };

  // Global Prayer Reminder Settings (sound, ringtone, duration, volume)
  const [prayerReminderSettings, setPrayerReminderSettings] = useState<PrayerReminderGlobalSettings>(() => {
    try {
      const stored = localStorage.getItem('axis_salah_reminder_global_settings');
      if (stored) {
        return {
          ...DEFAULT_PRAYER_REMINDER_SETTINGS,
          ...JSON.parse(stored)
        };
      }
    } catch (e) {
      console.error('Error loading prayer reminder global settings:', e);
    }
    return DEFAULT_PRAYER_REMINDER_SETTINGS;
  });

  const updatePrayerReminderSettings = (settings: Partial<PrayerReminderGlobalSettings>) => {
    setPrayerReminderSettings(prev => {
      const updated: PrayerReminderGlobalSettings = {
        ...prev,
        ...settings
      };
      try {
        localStorage.setItem('axis_salah_reminder_global_settings', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving prayer reminder global settings:', e);
      }
      return updated;
    });
  };

  const resetPrayerReminders = () => {
    setPrayerReminders(DEFAULT_PRAYER_REMINDERS);
    setPrayerReminderSettings(DEFAULT_PRAYER_REMINDER_SETTINGS);
    try {
      localStorage.setItem('axis_salah_custom_reminders', JSON.stringify(DEFAULT_PRAYER_REMINDERS));
      localStorage.setItem('axis_salah_reminder_global_settings', JSON.stringify(DEFAULT_PRAYER_REMINDER_SETTINGS));
    } catch (e) {
      console.error('Error resetting prayer reminders:', e);
    }
  };

  // Mobile Swipe Gesture Configuration
  const [swipeGestureSettings, setSwipeGestureSettings] = useState<SwipeGestureSettings>(() => {
    try {
      const stored = localStorage.getItem('axis_swipe_gesture_settings');
      if (stored) {
        return {
          ...DEFAULT_SWIPE_GESTURE_SETTINGS,
          ...JSON.parse(stored)
        };
      }
    } catch (e) {
      console.error('Error loading swipe gesture settings:', e);
    }
    return DEFAULT_SWIPE_GESTURE_SETTINGS;
  });

  const updateSwipeGestureSettings = (settings: Partial<SwipeGestureSettings>) => {
    setSwipeGestureSettings(prev => {
      const updated: SwipeGestureSettings = {
        ...prev,
        ...settings
      };
      try {
        localStorage.setItem('axis_swipe_gesture_settings', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving swipe gesture settings:', e);
      }
      return updated;
    });
  };

  const resetSwipeGestureSettings = () => {
    setSwipeGestureSettings(DEFAULT_SWIPE_GESTURE_SETTINGS);
    try {
      localStorage.removeItem('axis_swipe_gesture_settings');
    } catch (e) {
      console.error('Error resetting swipe gesture settings:', e);
    }
  };

  // Unlock AudioContext on first user interaction so alarms ring without autoplay block
  useEffect(() => {
    const handleUnlock = () => {
      alarmAudioService.unlockAudioContext();
    };
    window.addEventListener('pointerdown', handleUnlock, { once: true });
    window.addEventListener('keydown', handleUnlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleUnlock);
      window.removeEventListener('keydown', handleUnlock);
    };
  }, []);

  const [highRiskApps, setHighRiskAppsState] = useState<string[]>(() => 
    (guestStore.highRiskApps || []).filter(p => Boolean(p) && !LEGACY_PREVIEW_PACKAGES.has(p))
  );
  const [screenTimeData, setScreenTimeData] = useState<DailyScreenTimeData>(() => {
    const rawApps = guestStore.simulatedScreenTime?.apps || [];
    const filteredApps = rawApps.filter(a => Boolean(a && a.packageName) && !LEGACY_PREVIEW_PACKAGES.has(a.packageName));
    return {
      totalMinutes: filteredApps.reduce((acc, a) => acc + (a.durationMinutes || 0), 0),
      highRiskMinutes: filteredApps.filter(a => a.isHighRisk).reduce((acc, a) => acc + (a.durationMinutes || 0), 0),
      apps: filteredApps,
      lastSyncedAt: guestStore.simulatedScreenTime?.lastSyncedAt || new Date().toISOString()
    };
  });

  // Viewport mode when in Android mode ('phone' 390px vs 'full' fluid)
  const [deviceViewportMode, setDeviceViewportMode] = useState<'phone' | 'full'>('full');

  // Auto-sync tasks to Google Calendar setting (persisted in localStorage)
  const [autoSyncCalendarTasks, setAutoSyncCalendarTasksState] = useState<boolean>(() => {
    return localStorage.getItem('axis_auto_sync_tasks_calendar') === 'true';
  });

  const setAutoSyncCalendarTasks = (enabled: boolean) => {
    setAutoSyncCalendarTasksState(enabled);
    localStorage.setItem('axis_auto_sync_tasks_calendar', enabled ? 'true' : 'false');
  };

  // Helper to persist guest changes locally
  const persistGuestStore = useCallback((updater: (prev: GuestDataStore) => GuestDataStore) => {
    setGuestStore(prev => {
      const next = updater(prev);
      saveGuestData(next);
      return next;
    });
  }, []);

  const openAuthModal = (reason?: string) => {
    setAuthModalReason(reason || null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalReason(null);
  };

  const dismissSyncBanner = () => {
    setShowSyncBanner(false);
    localStorage.setItem('axis_dismiss_sync_banner', 'true');
  };

  const clearSyncConfirmation = () => {
    setSyncConfirmationMsg(null);
  };

  // Execute guest to account merge when a guest signs in
  const handleUserSignedIn = async (currentUser: User) => {
    setLoading(true);
    try {
      const currentGuest = loadGuestData();
      if (hasGuestDataToMerge()) {
        const { habitsMerged, tasksMerged, daysMerged, salahMerged } = await mergeGuestDataToFirestore(
          currentUser.uid,
          currentGuest
        );
        const parts = [
          habitsMerged > 0 ? `${habitsMerged} habits` : '',
          tasksMerged > 0 ? `${tasksMerged} tasks` : '',
          daysMerged > 0 ? `${daysMerged} daily reviews` : '',
          salahMerged > 0 ? `${salahMerged} salah records` : ''
        ].filter(Boolean);
        setSyncConfirmationMsg(parts.length > 0 ? `Synced ${parts.join(', ')} to your account.` : 'Offline data synced to your account.');
        // Auto clear message after 6 seconds
        setTimeout(() => setSyncConfirmationMsg(null), 6000);
      }
    } catch (e) {
      console.error('Error during guest-to-account merge:', e);
    } finally {
      setLoading(false);
    }
  };

  // Auth observer: switch between guest mode and authenticated mode
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAuthMode('authenticated');
        // Merge guest data into Firestore if any exists
        await handleUserSignedIn(currentUser);

        // Subscribe to Firestore for real-time syncing
        const unsubHabits = subscribeToHabits(currentUser.uid, (data) => {
          setHabits(data);
        });
        const unsubTasks = subscribeToTasks(currentUser.uid, (data) => setTasks(data));
        const unsubDays = subscribeToDailyRecords(currentUser.uid, (data) => setDailyRecords(data));
        const unsubEvents = subscribeToCalendarEvents(currentUser.uid, (data) => setCalendarEvents(data));
        const unsubSalah = subscribeToSalahRecords(currentUser.uid, (data) => setSalahRecords(data));

        return () => {
          unsubHabits();
          unsubTasks();
          unsubDays();
          unsubEvents();
          unsubSalah();
        };
      } else {
        // Guest mode: load strictly from local storage
        setUser(null);
        setAuthMode('guest');
        const local = loadGuestData();
        setGuestStore(local);
        setHabits(local.habits || []);
        setTasks(local.tasks || []);
        setDailyRecords(local.dailyRecords || {});
        setCalendarEvents(local.calendarEvents || []);
        setSalahRecords(local.salahRecords || {});
        setSalahAsAnchorHabitState(Boolean(local.salahAsAnchorHabit));
        setHighRiskAppsState(local.highRiskApps || []);
        setScreenTimeData(local.simulatedScreenTime || DEFAULT_SCREEN_TIME);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen for OAuth deep link callbacks on Android (com.axis.app://)
  useEffect(() => {
    const unsubOAuth = initOAuthDeepLinkListener((token) => {
      console.log('Received Google OAuth token via deep link:', token);
    });
    return () => unsubOAuth();
  }, []);

  // Guarantee immediate purge of any legacy preview packages in existing browser sessions
  useEffect(() => {
    setHighRiskAppsState(prev => {
      const cleaned = (prev || []).filter(p => Boolean(p) && !LEGACY_PREVIEW_PACKAGES.has(p));
      return cleaned;
    });
    setScreenTimeData(prev => {
      const filtered = (prev?.apps || []).filter(a => Boolean(a && a.packageName) && !LEGACY_PREVIEW_PACKAGES.has(a.packageName));
      return {
        ...prev,
        totalMinutes: filtered.reduce((acc, a) => acc + (a.durationMinutes || 0), 0),
        highRiskMinutes: filtered.filter(a => a.isHighRisk).reduce((acc, a) => acc + (a.durationMinutes || 0), 0),
        apps: filtered
      };
    });
  }, []);

  // Auth methods
  const loginWithGoogle = async () => {
    try {
      if (isElectronEnvironment()) {
        const token = await startElectronGoogleOAuth();
        if (token) {
          closeAuthModal();
          return;
        }
      }

      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setStoredGCalToken(credential.accessToken);
      }
      closeAuthModal();
    } catch (e: any) {
      console.warn('Google sign-in error:', e?.code, e);
      let friendlyMessage = e?.message || 'Google sign-in could not be completed.';

      if (e?.code === 'auth/unauthorized-domain') {
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
        friendlyMessage = `Unauthorized Domain: Please add "${currentDomain}" to your Firebase Console under Authentication > Settings > Authorized domains.`;
      } else if (e?.code === 'auth/operation-not-allowed') {
        friendlyMessage = 'Google Sign-In is not enabled yet in your Firebase project. Please enable Google in Firebase Console under Authentication > Sign-in method.';
      } else if (e?.code === 'auth/popup-blocked') {
        friendlyMessage = 'Google Sign-In popup was blocked by browser security. Please allow popups or open in an external browser.';
      } else if (e?.code === 'auth/popup-closed-by-user') {
        friendlyMessage = 'Sign-in window was closed before completion. Please try again.';
      } else if (e?.code === 'auth/cancelled-popup-request') {
        friendlyMessage = 'Previous sign-in request cancelled. Please try again.';
      } else if (e?.code === 'auth/network-request-failed') {
        friendlyMessage = 'Network error connecting to Google authentication service.';
      }

      throw new Error(friendlyMessage);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      closeAuthModal();
    } catch (err: any) {
      let msg = err?.message || 'Authentication failed.';
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        msg = 'Invalid email or password. Please verify credentials.';
      } else if (err?.code === 'auth/user-not-found') {
        msg = 'No registered user found with this email. Create an account below.';
      } else if (err?.code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Please wait a moment or reset your password.';
      }
      throw new Error(msg);
    }
  };

  const signupWithEmail = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      closeAuthModal();
    } catch (err: any) {
      let msg = err?.message || 'Account creation failed.';
      if (err?.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please sign in instead.';
      } else if (err?.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      throw new Error(msg);
    }
  };

  const logout = async () => {
    await fbSignOut(auth);
    setAuthMode('guest');
    const freshGuest = loadGuestData();
    setHabits(freshGuest.habits || []);
    setTasks(freshGuest.tasks || []);
    setDailyRecords(freshGuest.dailyRecords || {});
    setCalendarEvents(freshGuest.calendarEvents || []);
  };

  // Data methods: branching based on authMode
  const toggleHabit = async (habitId: string) => {
    if (authMode === 'authenticated' && user) {
      const currentRecord = dailyRecords[selectedDate];
      const completedList = currentRecord?.completedHabitIds || [];
      await toggleHabitForDay(user.uid, selectedDate, habitId, completedList);
    } else {
      // Local Guest operation
      const currentRecord = dailyRecords[selectedDate] || {
        date: selectedDate,
        color: null,
        note: '',
        completedHabitIds: [],
        completedTaskIds: []
      };
      const isCompleted = currentRecord.completedHabitIds.includes(habitId);
      const updated = isCompleted
        ? currentRecord.completedHabitIds.filter(id => id !== habitId)
        : [...currentRecord.completedHabitIds, habitId];

      const newRecords = {
        ...dailyRecords,
        [selectedDate]: { ...currentRecord, completedHabitIds: updated }
      };
      setDailyRecords(newRecords);
      persistGuestStore(s => ({ ...s, dailyRecords: newRecords }));
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;
    const nextStatus = !target.completed;
    const updatedTask: TaskItem = {
      ...target,
      completed: nextStatus,
      completedAt: nextStatus ? new Date().toISOString() : undefined
    };

    // Auto-update calendar event if task is synced
    if (updatedTask.calendarEventId) {
      syncTaskToGoogleCalendar(updatedTask).catch(console.warn);
    }

    if (authMode === 'authenticated' && user) {
      await saveTask(user.uid, updatedTask);

      const currentRecord = dailyRecords[selectedDate];
      const currentCompleted = currentRecord?.completedTaskIds || [];
      const updatedTasks = nextStatus
        ? Array.from(new Set([...currentCompleted, taskId]))
        : currentCompleted.filter(id => id !== taskId);

      const updatedRecord: DailyRecord = {
        ...(currentRecord || { date: selectedDate, color: null, note: '', completedHabitIds: [] }),
        completedTaskIds: updatedTasks
      };
      const { saveDailyRecord } = await import('../services/dataService');
      await saveDailyRecord(user.uid, updatedRecord);
    } else {
      // Local Guest operation
      const updatedTasksList = tasks.map(t => t.id === taskId ? updatedTask : t);
      setTasks(updatedTasksList);

      const currentRecord = dailyRecords[selectedDate] || {
        date: selectedDate,
        color: null,
        note: '',
        completedHabitIds: [],
        completedTaskIds: []
      };
      const updatedTaskIds = nextStatus
        ? Array.from(new Set([...currentRecord.completedTaskIds, taskId]))
        : currentRecord.completedTaskIds.filter(id => id !== taskId);

      const newRecords = {
        ...dailyRecords,
        [selectedDate]: { ...currentRecord, completedTaskIds: updatedTaskIds }
      };
      setDailyRecords(newRecords);
      persistGuestStore(s => ({
        ...s,
        tasks: updatedTasksList,
        dailyRecords: newRecords
      }));
    }
  };

  const addNewHabit = async (habit: Habit) => {
    if (authMode === 'authenticated' && user) {
      await saveHabit(user.uid, habit);
    } else {
      const updated = [habit, ...habits];
      setHabits(updated);
      persistGuestStore(s => ({ ...s, habits: updated }));
    }
  };

  const removeHabit = async (habitId: string) => {
    if (authMode === 'authenticated' && user) {
      await deleteHabit(user.uid, habitId);
    } else {
      const updated = habits.filter(h => h.id !== habitId);
      setHabits(updated);
      persistGuestStore(s => ({ ...s, habits: updated }));
    }
  };

  const addNewTask = async (task: TaskItem) => {
    let taskToSave = { ...task };

    // Calendar sync check: if explicitly requested OR global auto-sync is enabled with due date & time
    const shouldSync = task.addToCalendar || (autoSyncCalendarTasks && task.dueDate && task.dueTime);
    if (shouldSync) {
      taskToSave.addToCalendar = true;
      try {
        const result = await syncTaskToGoogleCalendar(taskToSave);
        if (result.eventId) {
          taskToSave.calendarEventId = result.eventId;
        }
      } catch (e) {
        console.warn('Error during new task calendar sync:', e);
      }
    }

    if (authMode === 'authenticated' && user) {
      await saveTask(user.uid, taskToSave);
    } else {
      const updated = [taskToSave, ...tasks];
      setTasks(updated);
      persistGuestStore(s => ({ ...s, tasks: updated }));
    }
  };

  const updateTask = async (task: TaskItem) => {
    let taskToSave = { ...task };

    // Check if task needs calendar sync update or deletion
    if (taskToSave.addToCalendar) {
      try {
        const result = await syncTaskToGoogleCalendar(taskToSave);
        if (result.eventId) {
          taskToSave.calendarEventId = result.eventId;
        }
      } catch (e) {
        console.warn('Error updating task calendar event:', e);
      }
    } else if (taskToSave.calendarEventId) {
      // Toggle switched OFF after being synced: delete calendar event and clear ID
      deleteGoogleCalendarEvent(taskToSave.calendarEventId).catch(console.warn);
      delete taskToSave.calendarEventId;
    }

    if (authMode === 'authenticated' && user) {
      await saveTask(user.uid, taskToSave);
    } else {
      const updated = tasks.map(t => t.id === taskToSave.id ? taskToSave : t);
      setTasks(updated);
      persistGuestStore(s => ({ ...s, tasks: updated }));
    }
  };

  const removeTask = async (taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (target?.calendarEventId) {
      deleteGoogleCalendarEvent(target.calendarEventId).catch(console.warn);
    }

    if (authMode === 'authenticated' && user) {
      await deleteTask(user.uid, taskId);
    } else {
      const updated = tasks.filter(t => t.id !== taskId);
      setTasks(updated);
      persistGuestStore(s => ({ ...s, tasks: updated }));
    }
  };

  const reorderTasks = async (newTasks: TaskItem[]) => {
    setTasks(newTasks);
    if (authMode === 'authenticated' && user) {
      for (let i = 0; i < newTasks.length; i++) {
        await saveTask(user.uid, { ...newTasks[i], order: i });
      }
    } else {
      persistGuestStore(s => ({ ...s, tasks: newTasks }));
    }
  };

  const recordReview = async (color: DayColor, note: string) => {
    const currentRecord = dailyRecords[selectedDate];
    const completedHabits = currentRecord?.completedHabitIds || [];
    const completedTasks = currentRecord?.completedTaskIds || tasks.filter(t => t.completed && t.dueDate === selectedDate).map(t => t.id);
    const screenTime = platform === 'android' ? screenTimeData : undefined;

    if (authMode === 'authenticated' && user) {
      await submitDailyReview(
        user.uid,
        selectedDate,
        color,
        note,
        completedHabits,
        completedTasks,
        screenTime
      );
    } else {
      const updatedDay: DailyRecord = {
        date: selectedDate,
        color,
        note,
        reviewedAt: new Date().toISOString(),
        completedHabitIds: completedHabits,
        completedTaskIds: completedTasks,
        ...(screenTime ? { screenTime } : {})
      };
      const newRecords = {
        ...dailyRecords,
        [selectedDate]: updatedDay
      };
      setDailyRecords(newRecords);
      persistGuestStore(s => ({ ...s, dailyRecords: newRecords }));
    }

    // Trigger gauge mechanical sweep & calibration settle
    setCalibrationTrigger(Date.now());
  };

  const addEvent = async (event: CalendarEvent) => {
    if (authMode === 'authenticated' && user) {
      await saveCalendarEvent(user.uid, event);
    } else {
      const updated = [event, ...calendarEvents];
      setCalendarEvents(updated);
      persistGuestStore(s => ({ ...s, calendarEvents: updated }));
    }
  };

  const removeEvent = async (eventId: string) => {
    if (authMode === 'authenticated' && user) {
      await deleteCalendarEvent(user.uid, eventId);
    } else {
      const updated = calendarEvents.filter(e => e.id !== eventId);
      setCalendarEvents(updated);
      persistGuestStore(s => ({ ...s, calendarEvents: updated }));
    }
  };

  const setHighRiskApps = (apps: string[]) => {
    setHighRiskAppsState(apps);
    if (authMode === 'guest') {
      persistGuestStore(s => ({ ...s, highRiskApps: apps }));
    }
  };

  const updateSimulatedScreenTime = (data: DailyScreenTimeData) => {
    setScreenTimeData(data);
    if (authMode === 'guest') {
      persistGuestStore(s => ({ ...s, simulatedScreenTime: data }));
    }
  };

  const computeSuggestedColor = (date: string): { color: DayColor; reason: string } => {
    const record = dailyRecords[date];
    const completedIds = record?.completedHabitIds || [];
    const anchorHabits = habits.filter(h => h.isAnchor);
    const completedAnchors = anchorHabits.filter(h => completedIds.includes(h.id));
    const highRiskMins = platform === 'android' ? screenTimeData.highRiskMinutes : 0;
    const failedBreakAnchor = anchorHabits.some(h => h.type === 'break' && !completedIds.includes(h.id));

    // Salah Anchor habit integration
    let salahAnchorComplete = true;
    let salahLoggedCount = 5;
    if (salahAsAnchorHabit) {
      const sRecord = salahRecords[date];
      salahAnchorComplete = isDayAllPrayersLogged(sRecord);
      salahLoggedCount = countLoggedPrayers(sRecord);
    }

    if (highRiskMins >= 180 || (failedBreakAnchor && anchorHabits.length > 0)) {
      return {
        color: 'red',
        reason: highRiskMins >= 180 
          ? `High-risk screen time exceeded 3 hours (${highRiskMins}m).`
          : `Crucial anchor break-habit was broken.`
      };
    }

    if (highRiskMins >= 90) {
      return {
        color: 'yellow',
        reason: `Significant time spent in high-risk apps (${highRiskMins}m).`
      };
    }

    const completedRatio = habits.length > 0 ? completedIds.length / habits.length : 0;
    const habitsAnchorDone = anchorHabits.length === 0 || completedAnchors.length === anchorHabits.length;
    const allAnchorsDone = habitsAnchorDone && (!salahAsAnchorHabit || salahAnchorComplete);

    if (completedRatio >= 0.8 && allAnchorsDone && highRiskMins < 45) {
      return {
        color: 'gold',
        reason: salahAsAnchorHabit
          ? `Outstanding day: 80%+ habits completed, all five prayers performed, and minimal distraction time (${highRiskMins}m).`
          : `Outstanding day: 80%+ habits completed, all anchor habits maintained, and minimal distraction time (${highRiskMins}m).`
      };
    }

    if (completedRatio >= 0.5 && allAnchorsDone && highRiskMins < 75) {
      return {
        color: 'green',
        reason: salahAsAnchorHabit
          ? `Solid progress: Anchor prayers fulfilled and high-risk temptations resisted.`
          : `Solid progress: Anchor habits fulfilled and high-risk temptations resisted.`
      };
    }

    if (salahAsAnchorHabit && !salahAnchorComplete) {
      return {
        color: 'orange',
        reason: `Anchor incomplete: ${salahLoggedCount}/5 daily prayers logged so far.`
      };
    }

    return {
      color: 'orange',
      reason: `Neutral day: Baseline routine maintained with moderate habit execution.`
    };
  };

  const clearAllData = async () => {
    // Reset guest storage completely
    clearGuestData();
    localStorage.removeItem('axis_auto_sync_tasks_calendar');
    localStorage.removeItem('axis_gcal_access_token');
    localStorage.removeItem('axis_guest_initialized');
    localStorage.removeItem('axis_salah_as_anchor_habit');
    
    // Clear in-memory state
    setHabits([]);
    setTasks([]);
    setDailyRecords({});
    setCalendarEvents([]);
    setSalahRecords({});
    setHighRiskAppsState([]);
    setScreenTimeData(DEFAULT_SCREEN_TIME);
    setGuestStore({
      habits: [],
      tasks: [],
      dailyRecords: {},
      calendarEvents: [],
      highRiskApps: [],
      simulatedScreenTime: DEFAULT_SCREEN_TIME,
      salahRecords: {},
      salahAsAnchorHabit: false
    });

    // If authenticated user, delete items from Firestore
    if (authMode === 'authenticated' && user) {
      for (const h of habits) {
        await deleteHabit(user.uid, h.id).catch(console.error);
      }
      for (const t of tasks) {
        await deleteTask(user.uid, t.id).catch(console.error);
      }
      for (const ev of calendarEvents) {
        await deleteCalendarEvent(user.uid, ev.id).catch(console.error);
      }
    }
  };

  // --- NATIVE ANDROID WIDGET TWO-WAY SYNC ---
  // 1. Outgoing sync: Whenever daily record, salah, or habits change, push to native SharedPreferences widgets
  useEffect(() => {
    if (isAndroidCapacitor()) {
      const today = getLocalDateString();
      syncToNativeAndroidWidgets(
        today,
        dailyRecords[today],
        salahRecords[today],
        habits
      );
    }
  }, [dailyRecords, salahRecords, habits]);

  // 2. Incoming sync: On app launch and when resuming into foreground, check for any offline widget interactions
  useEffect(() => {
    const handleWidgetSync = async () => {
      if (!isAndroidCapacitor()) return;
      const updates = await pollPendingWidgetUpdates();
      if (!updates) return;

      const today = getLocalDateString();

      // Check Daily Color update from widget
      if (updates.color && updates.color !== (dailyRecords[today]?.color || '')) {
        await recordReview(updates.color as DayColor, updates.note || dailyRecords[today]?.note || '');
      }

      // Check Salah update from widget
      if (updates.salah) {
        const curSalah = salahRecords[today];
        const prayers: PrayerName[] = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'];
        for (const p of prayers) {
          const wStatus = updates.salah[p] as PrayerStatus;
          if (wStatus && wStatus !== (curSalah?.[p] || 'none')) {
            await updateSalahPrayer(today, p, wStatus);
          }
        }
      }

      // Check Habits toggles from widget
      if (updates.habitsJson) {
        try {
          const widgetHabits = JSON.parse(updates.habitsJson);
          const currentCompleted = dailyRecords[today]?.completedHabitIds || [];
          for (const wh of widgetHabits) {
            const isNowCompleted = Boolean(wh.completed);
            const wasCompleted = currentCompleted.includes(wh.id);
            if (isNowCompleted !== wasCompleted) {
              await toggleHabit(wh.id);
            }
          }
        } catch (e) {
          console.warn('Error applying widget habits:', e);
        }
      }
    };

    handleWidgetSync();

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleWidgetSync();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', handleWidgetSync);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', handleWidgetSync);
    };
  }, [dailyRecords, salahRecords, habits, recordReview, updateSalahPrayer, toggleHabit]);

  return (
    <AppContext.Provider
      value={{
        user,
        authMode,
        loading,
        selectedDate,
        setSelectedDate,
        platform,
        setPlatform,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalReason,
        showSyncBanner,
        dismissSyncBanner,
        syncConfirmationMsg,
        clearSyncConfirmation,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        habits,
        tasks,
        dailyRecords,
        calendarEvents,
        salahRecords,
        toggleHabit,
        toggleTaskCompletion,
        addNewHabit,
        removeHabit,
        addNewTask,
        updateTask,
        removeTask,
        reorderTasks,
        recordReview,
        addEvent,
        removeEvent,
        updateSalahPrayer,
        salahAsAnchorHabit,
        setSalahAsAnchorHabit,
        prayerReminders,
        updatePrayerReminder,
        resetPrayerReminders,
        prayerReminderSettings,
        updatePrayerReminderSettings,
        swipeGestureSettings,
        updateSwipeGestureSettings,
        resetSwipeGestureSettings,
        autoSyncCalendarTasks,
        setAutoSyncCalendarTasks,
        screenTimeSettings: {
          highRiskApps,
          simulatedScreenTime: screenTimeData
        },
        deviceViewportMode,
        setDeviceViewportMode,
        setHighRiskApps,
        updateSimulatedScreenTime,
        computeSuggestedColor,
        calibrationTrigger,
        triggerCalibration,
        clearAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
