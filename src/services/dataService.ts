import { 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs,
  onSnapshot, 
  updateDoc, 
  deleteDoc,
  writeBatch 
} from '../lib/firebase';
import { 
  Habit, 
  TaskItem, 
  DailyRecord, 
  CalendarEvent, 
  DayColor,
  DailyScreenTimeData,
  SalahRecord 
} from '../types';
import { GuestDataStore, clearGuestData } from './localGuestStorage';

/**
 * Service to manage all Firestore synced entities scoped under users/{userId}
 * Data model guarantees unified daily timeline keyed by date YYYY-MM-DD
 */

// --- HABITS ---
export function subscribeToHabits(userId: string, callback: (habits: Habit[]) => void) {
  const habitsCol = collection(db, `users/${userId}/habits`);
  return onSnapshot(
    habitsCol, 
    (snapshot) => {
      const habits: Habit[] = [];
      snapshot.forEach((docSnap) => {
        habits.push({ id: docSnap.id, ...(docSnap.data() as Omit<Habit, 'id'>) });
      });
      habits.sort((a, b) => {
        if (a.isAnchor && !b.isAnchor) return -1;
        if (!a.isAnchor && b.isAnchor) return 1;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
      callback(habits);
    },
    (err) => {
      console.warn('Firestore habits subscription notice:', err?.message || err);
    }
  );
}

export async function saveHabit(userId: string, habit: Habit) {
  const docRef = doc(db, `users/${userId}/habits`, habit.id);
  await setDoc(docRef, habit, { merge: true });
}

export async function deleteHabit(userId: string, habitId: string) {
  const docRef = doc(db, `users/${userId}/habits`, habitId);
  await deleteDoc(docRef);
}

// --- TASKS ---
export function subscribeToTasks(userId: string, callback: (tasks: TaskItem[]) => void) {
  const tasksCol = collection(db, `users/${userId}/tasks`);
  return onSnapshot(
    tasksCol, 
    (snapshot) => {
      const tasks: TaskItem[] = [];
      snapshot.forEach((docSnap) => {
        tasks.push({ id: docSnap.id, ...(docSnap.data() as Omit<TaskItem, 'id'>) });
      });
      tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
      callback(tasks);
    },
    (err) => {
      console.warn('Firestore tasks subscription notice:', err?.message || err);
    }
  );
}

export async function saveTask(userId: string, task: TaskItem) {
  const docRef = doc(db, `users/${userId}/tasks`, task.id);
  await setDoc(docRef, task, { merge: true });
}

export async function deleteTask(userId: string, taskId: string) {
  const docRef = doc(db, `users/${userId}/tasks`, taskId);
  await deleteDoc(docRef);
}

// --- DAILY RECORDS (Unified Day Data) ---
export function subscribeToDailyRecords(userId: string, callback: (records: Record<string, DailyRecord>) => void) {
  const daysCol = collection(db, `users/${userId}/days`);
  return onSnapshot(
    daysCol, 
    (snapshot) => {
      const records: Record<string, DailyRecord> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as DailyRecord;
        records[docSnap.id] = { ...data, date: docSnap.id };
      });
      callback(records);
    },
    (err) => {
      console.warn('Firestore daily records subscription notice:', err?.message || err);
    }
  );
}

export async function getDailyRecord(userId: string, date: string): Promise<DailyRecord | null> {
  const docRef = doc(db, `users/${userId}/days`, date);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { ...(snap.data() as DailyRecord), date };
  }
  return null;
}

export async function saveDailyRecord(userId: string, record: DailyRecord) {
  const docRef = doc(db, `users/${userId}/days`, record.date);
  await setDoc(docRef, record, { merge: true });
}

export async function toggleHabitForDay(userId: string, date: string, habitId: string, currentCompleted: string[]) {
  const isCompleted = currentCompleted.includes(habitId);
  const updated = isCompleted 
    ? currentCompleted.filter(id => id !== habitId)
    : [...currentCompleted, habitId];
    
  const docRef = doc(db, `users/${userId}/days`, date);
  await setDoc(docRef, {
    date,
    completedHabitIds: updated,
  }, { merge: true });
}

export async function submitDailyReview(
  userId: string, 
  date: string, 
  color: DayColor, 
  note: string, 
  completedHabitIds: string[], 
  completedTaskIds: string[],
  screenTime?: DailyScreenTimeData
) {
  const docRef = doc(db, `users/${userId}/days`, date);
  const record: DailyRecord = {
    date,
    color,
    note,
    reviewedAt: new Date().toISOString(),
    completedHabitIds,
    completedTaskIds,
    ...(screenTime ? { screenTime } : {})
  };
  await setDoc(docRef, record, { merge: true });
}

// --- CALENDAR EVENTS ---
export function subscribeToCalendarEvents(userId: string, callback: (events: CalendarEvent[]) => void) {
  const eventsCol = collection(db, `users/${userId}/calendar_events`);
  return onSnapshot(
    eventsCol, 
    (snapshot) => {
      const events: CalendarEvent[] = [];
      snapshot.forEach((docSnap) => {
        events.push({ id: docSnap.id, ...(docSnap.data() as Omit<CalendarEvent, 'id'>) });
      });
      events.sort((a, b) => a.startTime.localeCompare(b.startTime));
      callback(events);
    },
    (err) => {
      console.warn('Firestore calendar events subscription notice:', err?.message || err);
    }
  );
}

export async function saveCalendarEvent(userId: string, event: CalendarEvent) {
  const docRef = doc(db, `users/${userId}/calendar_events`, event.id);
  await setDoc(docRef, event, { merge: true });
}

export async function deleteCalendarEvent(userId: string, eventId: string) {
  const docRef = doc(db, `users/${userId}/calendar_events`, eventId);
  await deleteDoc(docRef);
}

// --- SALAH (DAILY PRAYERS) ---
export function subscribeToSalahRecords(
  userId: string,
  callback: (records: Record<string, SalahRecord>) => void
) {
  const salahCol = collection(db, `users/${userId}/salah`);
  return onSnapshot(
    salahCol,
    (snapshot) => {
      const records: Record<string, SalahRecord> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as SalahRecord;
        records[docSnap.id] = { ...data, date: docSnap.id };
      });
      callback(records);
    },
    (err) => {
      console.warn('Firestore salah subscription notice:', err?.message || err);
    }
  );
}

export async function saveSalahRecord(userId: string, record: SalahRecord) {
  const docRef = doc(db, `users/${userId}/salah`, record.date);
  await setDoc(docRef, record, { merge: true });
}

export async function deleteSalahRecord(userId: string, date: string) {
  const docRef = doc(db, `users/${userId}/salah`, date);
  await deleteDoc(docRef);
}

/**
 * GUEST → ACCOUNT MERGE ON SIGN-IN
 * - Reads all local Hive data for the guest profile
 * - Merges cleanly into users/{userId} in Firestore
 * - If account already has existing cloud data (second device edge case):
 *    - Keeps union of habits & tasks
 *    - For daily-review entries on the same date, keeps entry created later (based on timestamp),
 *      and flags the older one as archived rather than deleting outright.
 * - Clears local guest profile after completion
 * - Returns summary counts: habitsMerged, tasksMerged, daysMerged
 */
export async function mergeGuestDataToFirestore(
  userId: string, 
  guestData: GuestDataStore
): Promise<{ habitsMerged: number; tasksMerged: number; daysMerged: number; salahMerged: number }> {
  let habitsMerged = 0;
  let tasksMerged = 0;
  let daysMerged = 0;

  // 1. Fetch existing cloud habits to perform union merge
  const habitsCol = collection(db, `users/${userId}/habits`);
  const existingHabitNames = new Set<string>();
  try {
    const existingHabitsSnap = await getDocs(habitsCol);
    existingHabitsSnap.forEach(d => {
      const data = d.data();
      if (data.name) existingHabitNames.add(data.name.toLowerCase().trim());
    });
  } catch (err) {
    console.warn('Proceeding with offline habit merge:', err);
  }

  for (const habit of guestData.habits || []) {
    // Union check: avoid exact duplicate names if user already had them in cloud
    if (!existingHabitNames.has(habit.name.toLowerCase().trim())) {
      await saveHabit(userId, habit);
      habitsMerged++;
    }
  }

  // 2. Fetch existing cloud tasks to perform union merge
  const tasksCol = collection(db, `users/${userId}/tasks`);
  const existingTaskTitles = new Set<string>();
  try {
    const existingTasksSnap = await getDocs(tasksCol);
    existingTasksSnap.forEach(d => {
      const data = d.data();
      if (data.title) existingTaskTitles.add(data.title.toLowerCase().trim());
    });
  } catch (err) {
    console.warn('Proceeding with offline task merge:', err);
  }

  for (const task of guestData.tasks || []) {
    if (!existingTaskTitles.has(task.title.toLowerCase().trim())) {
      await saveTask(userId, task);
      tasksMerged++;
    }
  }

  // 3. Merge daily reviews: same date conflict resolution
  const daysCol = collection(db, `users/${userId}/days`);
  const existingDaysMap: Record<string, DailyRecord> = {};
  try {
    const existingDaysSnap = await getDocs(daysCol);
    existingDaysSnap.forEach(d => {
      existingDaysMap[d.id] = d.data() as DailyRecord;
    });
  } catch (err) {
    console.warn('Proceeding with offline reviews merge:', err);
  }

  const guestDays = guestData.dailyRecords || {};
  for (const dateKey of Object.keys(guestDays)) {
    const guestDay = guestDays[dateKey];
    const cloudDay = existingDaysMap[dateKey];

    if (!cloudDay) {
      // No conflict, straight write
      await saveDailyRecord(userId, guestDay);
      daysMerged++;
    } else {
      // Conflict resolution: compare timestamp
      const guestTime = guestDay.reviewedAt ? new Date(guestDay.reviewedAt).getTime() : 0;
      const cloudTime = cloudDay.reviewedAt ? new Date(cloudDay.reviewedAt).getTime() : 0;

      if (guestTime >= cloudTime) {
        // Guest entry is newer: write guest entry, archive older cloud note into metadata
        const mergedRecord: DailyRecord = {
          ...guestDay,
          completedHabitIds: Array.from(new Set([...(cloudDay.completedHabitIds || []), ...(guestDay.completedHabitIds || [])])),
          completedTaskIds: Array.from(new Set([...(cloudDay.completedTaskIds || []), ...(guestDay.completedTaskIds || [])]))
        };
        // Preserve previous note in archived array if different
        if (cloudDay.note && cloudDay.note !== guestDay.note) {
          (mergedRecord as any).archivedNotes = [
            ...((cloudDay as any).archivedNotes || []),
            { note: cloudDay.note, color: cloudDay.color, archivedAt: new Date().toISOString() }
          ];
        }
        await saveDailyRecord(userId, mergedRecord);
        daysMerged++;
      } else {
        // Cloud entry is newer: keep cloud entry, but archive older guest note
        if (guestDay.note && guestDay.note !== cloudDay.note) {
          const updatedCloud = {
            ...cloudDay,
            completedHabitIds: Array.from(new Set([...(cloudDay.completedHabitIds || []), ...(guestDay.completedHabitIds || [])])),
            completedTaskIds: Array.from(new Set([...(cloudDay.completedTaskIds || []), ...(guestDay.completedTaskIds || [])])),
            archivedNotes: [
              ...((cloudDay as any).archivedNotes || []),
              { note: guestDay.note, color: guestDay.color, archivedAt: new Date().toISOString(), source: 'guest_import' }
            ]
          };
          await saveDailyRecord(userId, updatedCloud as any);
        }
      }
    }
  }

  // 4. Merge calendar events
  for (const ev of guestData.calendarEvents || []) {
    await saveCalendarEvent(userId, ev);
  }

  // 5. Merge Salah records: union by date; if same date exists in both, keep record with later updatedAt
  let salahMerged = 0;
  const guestSalah = guestData.salahRecords || {};
  const guestSalahDates = Object.keys(guestSalah);
  if (guestSalahDates.length > 0) {
    const salahCol = collection(db, `users/${userId}/salah`);
    const existingSalahMap: Record<string, SalahRecord> = {};
    try {
      const existingSalahSnap = await getDocs(salahCol);
      existingSalahSnap.forEach(d => {
        existingSalahMap[d.id] = d.data() as SalahRecord;
      });
    } catch (err) {
      console.warn('Proceeding with offline salah merge:', err);
    }

    for (const dateKey of guestSalahDates) {
      const guestRec = guestSalah[dateKey];
      const cloudRec = existingSalahMap[dateKey];
      if (!cloudRec) {
        await saveSalahRecord(userId, guestRec);
        salahMerged++;
      } else {
        const guestTime = guestRec.updatedAt ? new Date(guestRec.updatedAt).getTime() : 0;
        const cloudTime = cloudRec.updatedAt ? new Date(cloudRec.updatedAt).getTime() : 0;
        if (guestTime >= cloudTime) {
          await saveSalahRecord(userId, guestRec);
          salahMerged++;
        }
      }
    }
  }

  // 6. Clear local guest profile so future writes go directly to Firestore
  clearGuestData();

  return { habitsMerged, tasksMerged, daysMerged, salahMerged };
}

// Clean slate initialization: no preview or dummy data is injected when a user starts
export async function seedInitialUserData(_userId: string, _dateStr: string) {
  // Deliberately no-op: new users start with an empty, clean profile
  return;
}
