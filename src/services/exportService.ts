import { Habit, TaskItem, DailyRecord, CalendarEvent, SalahRecord } from '../types';
import { computeUserMetrics, UserAchievementMetrics } from './achievementsService';

/**
 * Utility to safely trigger browser download of generated file blobs
 */
export function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escapes a cell value for standard CSV formatting (RFC 4180)
 */
function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Calculate individual habit stats from historical daily records
 */
export function calculateHabitStats(habitId: string, dailyRecords: Record<string, DailyRecord>) {
  const sortedDates = Object.keys(dailyRecords).sort();
  let totalCompletions = 0;
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const rec = dailyRecords[dateStr];
    const isDone = rec?.completedHabitIds?.includes(habitId);
    if (isDone) {
      totalCompletions++;
      const [y, m, d] = dateStr.split('-').map(Number);
      const curr = new Date(y, m - 1, d);

      if (prevDate) {
        const diffDays = Math.round((curr.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }

      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }
      prevDate = curr;
    }
  }

  // Current streak up to today or yesterday
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  let checkDate = new Date(now);
  const todayDone = dailyRecords[todayStr]?.completedHabitIds?.includes(habitId);
  const yesterdayDone = dailyRecords[yesterdayStr]?.completedHabitIds?.includes(habitId);

  if (!todayDone && yesterdayDone) {
    checkDate = new Date(yesterday);
  }

  while (true) {
    const y = checkDate.getFullYear();
    const m = String(checkDate.getMonth() + 1).padStart(2, '0');
    const d = String(checkDate.getDate()).padStart(2, '0');
    const dStr = `${y}-${m}-${d}`;
    if (dailyRecords[dStr]?.completedHabitIds?.includes(habitId)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return { totalCompletions, currentStreak, maxStreak };
}

/**
 * Builds complete JSON data archive
 */
export function generateJSONExport(
  habits: Habit[],
  tasks: TaskItem[],
  dailyRecords: Record<string, DailyRecord>,
  calendarEvents: CalendarEvent[],
  userEmail: string | null,
  platform: string,
  salahRecords?: Record<string, SalahRecord>
): string {
  const metrics: UserAchievementMetrics = computeUserMetrics(habits, tasks, dailyRecords, salahRecords);

  const habitsWithStats = habits.map(h => {
    const stats = calculateHabitStats(h.id, dailyRecords);
    return {
      ...h,
      stats
    };
  });

  const exportPayload = {
    exportVersion: '1.0',
    exportedAt: new Date().toISOString(),
    account: {
      email: userEmail || 'guest',
      platform,
    },
    metricsSummary: {
      currentHabitStreakDays: metrics.currentHabitStreak,
      maxHabitStreakDays: metrics.maxHabitStreak,
      anchorHabitStreakDays: metrics.maxAnchorStreak,
      totalHabitCompletions: metrics.totalHabitCompletions,
      totalTasksCompleted: metrics.totalTasksCompleted,
      highPriorityTasksCompleted: metrics.highPriorityTasksCompleted,
      flawlessExecutionDays: metrics.flawlessDaysCount,
      goldEvaluationDays: metrics.goldDaysCount,
      unbrokenCleanReviewStreak: metrics.redFreeReviewStreak,
    },
    habits: habitsWithStats,
    tasks,
    dailyRecords,
    calendarEvents,
    salahRecords: salahRecords || {}
  };

  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Builds CSV for habits including streak metrics
 */
export function generateHabitsCSV(
  habits: Habit[],
  dailyRecords: Record<string, DailyRecord>
): string {
  const headers = [
    'ID',
    'Habit Name',
    'Type',
    'Frequency',
    'Is Anchor',
    'Category',
    'Current Streak (Days)',
    'Best Streak (Days)',
    'Total Lifetime Completions',
    'Created Date'
  ];

  const rows = habits.map(h => {
    const stats = calculateHabitStats(h.id, dailyRecords);
    return [
      escapeCSV(h.id),
      escapeCSV(h.name),
      escapeCSV(h.type),
      escapeCSV(h.frequency),
      escapeCSV(h.isAnchor ? 'Yes' : 'No'),
      escapeCSV(h.category || 'General'),
      escapeCSV(stats.currentStreak),
      escapeCSV(stats.maxStreak),
      escapeCSV(stats.totalCompletions),
      escapeCSV(h.createdAt ? h.createdAt.split('T')[0] : '')
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Builds CSV for task action history
 */
export function generateTasksCSV(tasks: TaskItem[]): string {
  const headers = [
    'ID',
    'Task Title',
    'Priority',
    'Status',
    'Due Date',
    'Due Time',
    'Recurring',
    'Recurring Interval',
    'Linked Habit ID',
    'Created Timestamp'
  ];

  const rows = tasks.map(t => [
    escapeCSV(t.id),
    escapeCSV(t.title),
    escapeCSV(t.priority.toUpperCase()),
    escapeCSV(t.completed ? 'COMPLETED' : 'PENDING'),
    escapeCSV(t.dueDate || 'Unscheduled'),
    escapeCSV(t.dueTime || ''),
    escapeCSV(t.isRecurring ? 'Yes' : 'No'),
    escapeCSV(t.recurringInterval || ''),
    escapeCSV(t.linkedHabitId || ''),
    escapeCSV(t.createdAt || '')
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Builds CSV for daily review reflections and color evaluations
 */
export function generateDailyReviewsCSV(
  dailyRecords: Record<string, DailyRecord>
): string {
  const headers = [
    'Date',
    'Day Color Rating',
    'Reflection Note',
    'Habits Completed Count',
    'Tasks Completed Count',
    'High Risk Screen Time (Mins)',
    'Total Screen Time (Mins)',
    'Reviewed At Timestamp'
  ];

  const sortedDates = Object.keys(dailyRecords).sort().reverse();

  const rows = sortedDates.map(dateStr => {
    const rec = dailyRecords[dateStr];
    const colorLabel = rec.color ? rec.color.toUpperCase() : 'UNRATED';
    const habitsCount = rec.completedHabitIds?.length || 0;
    const tasksCount = rec.completedTaskIds?.length || 0;
    const highRiskMins = rec.screenTime?.highRiskMinutes ?? 0;
    const totalScreenMins = rec.screenTime?.totalMinutes ?? 0;

    return [
      escapeCSV(dateStr),
      escapeCSV(colorLabel),
      escapeCSV(rec.note || ''),
      escapeCSV(habitsCount),
      escapeCSV(tasksCount),
      escapeCSV(highRiskMins),
      escapeCSV(totalScreenMins),
      escapeCSV(rec.reviewedAt || '')
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
