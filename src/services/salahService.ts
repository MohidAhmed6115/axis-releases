import { SalahRecord, PrayerName, PrayerStatus, createDefaultSalahRecord } from '../types';

export interface SalahDayStats {
  prayersLoggedToday: number;
  bajamatCountToday: number;
  totalPossibleToday: number;
  bajamatRate7Days: number;
  totalLogged7Days: number;
  bajamatCount7Days: number;
  bajamatRate30Days: number;
  totalLogged30Days: number;
  bajamatCount30Days: number;
  currentStreak: number;
  bestStreak: number;
}

export interface DayGridCell {
  date: string;
  dayName: string;
  dayNumber: string;
  isToday: boolean;
  fajr: PrayerStatus;
  zuhr: PrayerStatus;
  asr: PrayerStatus;
  maghrib: PrayerStatus;
  isha: PrayerStatus;
  completedCount: number;
  allCompleted: boolean;
}

const PRAYERS: PrayerName[] = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'];

/**
 * Checks if all 5 prayers were logged for a given day (solo or bajamat)
 */
export function isDayAllPrayersLogged(record?: SalahRecord | null): boolean {
  if (!record) return false;
  return PRAYERS.every(p => record[p] === 'solo' || record[p] === 'bajamat');
}

/**
 * Count how many prayers were logged on a given date (0-5)
 */
export function countLoggedPrayers(record?: SalahRecord | null): number {
  if (!record) return 0;
  return PRAYERS.filter(p => record[p] === 'solo' || record[p] === 'bajamat').length;
}

/**
 * Count how many prayers were in congregation (bajamat) on a given date (0-5)
 */
export function countBajamatPrayers(record?: SalahRecord | null): number {
  if (!record) return 0;
  return PRAYERS.filter(p => record[p] === 'bajamat').length;
}

/**
 * Computes comprehensive stats for Salah module
 */
export function computeSalahStats(
  records: Record<string, SalahRecord>,
  todayStr: string
): SalahDayStats {
  const todayRecord = records[todayStr];
  const prayersLoggedToday = countLoggedPrayers(todayRecord);
  const bajamatCountToday = countBajamatPrayers(todayRecord);

  // Parse today's date
  const [ty, tm, td] = todayStr.split('-').map(Number);
  const baseDate = new Date(ty, tm - 1, td);

  // 1. Last 7 Days (D-6 to today)
  let totalLogged7Days = 0;
  let bajamatCount7Days = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const rec = records[dStr];
    totalLogged7Days += countLoggedPrayers(rec);
    bajamatCount7Days += countBajamatPrayers(rec);
  }
  const bajamatRate7Days = totalLogged7Days > 0 
    ? Math.round((bajamatCount7Days / totalLogged7Days) * 100) 
    : 0;

  // 2. Last 30 Days (D-29 to today)
  let totalLogged30Days = 0;
  let bajamatCount30Days = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const rec = records[dStr];
    totalLogged30Days += countLoggedPrayers(rec);
    bajamatCount30Days += countBajamatPrayers(rec);
  }
  const bajamatRate30Days = totalLogged30Days > 0 
    ? Math.round((bajamatCount30Days / totalLogged30Days) * 100) 
    : 0;

  // 3. Current streak of days with all five prayers logged
  let currentStreak = 0;
  const yesterday = new Date(baseDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  let checkDate = new Date(baseDate);
  // If today isn't all 5 prayers yet, but yesterday was, we don't break streak; we count back from yesterday
  if (!isDayAllPrayersLogged(todayRecord) && isDayAllPrayersLogged(records[yesterdayStr])) {
    checkDate = new Date(yesterday);
  }

  while (true) {
    const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (isDayAllPrayersLogged(records[dStr])) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // 4. Best all-time streak of days with all 5 prayers logged
  const allCompleteDates = Object.keys(records)
    .filter(k => isDayAllPrayersLogged(records[k]))
    .sort();

  let bestStreak = 0;
  let tempStreak = 0;
  let prevD: Date | null = null;

  for (const dateStr of allCompleteDates) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const curr = new Date(y, m - 1, d);
    if (prevD) {
      const diff = Math.round((curr.getTime() - prevD.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }

    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
    prevD = curr;
  }

  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
  }

  return {
    prayersLoggedToday,
    bajamatCountToday,
    totalPossibleToday: 5,
    bajamatRate7Days,
    totalLogged7Days,
    bajamatCount7Days,
    bajamatRate30Days,
    totalLogged30Days,
    bajamatCount30Days,
    currentStreak,
    bestStreak
  };
}

/**
 * Prepares the 7-day grid view columns (D-6 to today)
 */
export function getPast7DaysSalahGrid(
  records: Record<string, SalahRecord>,
  baseDateStr: string
): DayGridCell[] {
  const [y, m, d] = baseDateStr.split('-').map(Number);
  const base = new Date(y, m - 1, d);

  const cells: DayGridCell[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const cur = new Date(base);
    cur.setDate(cur.getDate() - i);
    const curStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
    const rec = records[curStr] || createDefaultSalahRecord(curStr);

    cells.push({
      date: curStr,
      dayName: dayNames[cur.getDay()],
      dayNumber: String(cur.getDate()),
      isToday: i === 0,
      fajr: rec.fajr,
      zuhr: rec.zuhr,
      asr: rec.asr,
      maghrib: rec.maghrib,
      isha: rec.isha,
      completedCount: countLoggedPrayers(rec),
      allCompleted: isDayAllPrayersLogged(rec)
    });
  }

  return cells;
}

/**
 * Checks if the anchor was missed two days in a row (yesterday and day before yesterday)
 */
export function checkMissedAnchorTwoDaysInARow(
  records: Record<string, SalahRecord>,
  todayStr: string
): boolean {
  const [y, m, d] = todayStr.split('-').map(Number);
  const today = new Date(y, m - 1, d);

  const dMinus1 = new Date(today);
  dMinus1.setDate(dMinus1.getDate() - 1);
  const dMinus1Str = `${dMinus1.getFullYear()}-${String(dMinus1.getMonth() + 1).padStart(2, '0')}-${String(dMinus1.getDate()).padStart(2, '0')}`;

  const dMinus2 = new Date(today);
  dMinus2.setDate(dMinus2.getDate() - 2);
  const dMinus2Str = `${dMinus2.getFullYear()}-${String(dMinus2.getMonth() + 1).padStart(2, '0')}-${String(dMinus2.getDate()).padStart(2, '0')}`;

  const missedDMinus1 = !isDayAllPrayersLogged(records[dMinus1Str]);
  const missedDMinus2 = !isDayAllPrayersLogged(records[dMinus2Str]);

  return missedDMinus1 && missedDMinus2;
}
