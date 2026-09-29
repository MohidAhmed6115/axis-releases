import { Habit, TaskItem, DailyRecord, SalahRecord } from '../types';
import { isDayAllPrayersLogged } from './salahService';

export type AchievementCategory = 'streak' | 'habits' | 'tasks' | 'mastery';
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string;
  target: number;
  current: number;
  unlocked: boolean;
  unit: string;
  rewardText?: string;
}

export interface UserAchievementMetrics {
  currentHabitStreak: number;
  maxHabitStreak: number;
  totalHabitCompletions: number;
  maxAnchorStreak: number;
  totalTasksCompleted: number;
  highPriorityTasksCompleted: number;
  flawlessDaysCount: number;
  goldDaysCount: number;
  redFreeReviewStreak: number;
}

/**
 * Computes all milestone metrics from user habits, tasks, and daily historical records.
 */
export function computeUserMetrics(
  habits: Habit[],
  tasks: TaskItem[],
  dailyRecords: Record<string, DailyRecord>,
  salahRecords?: Record<string, SalahRecord>,
  salahAsAnchorHabit?: boolean
): UserAchievementMetrics {
  const anchorHabitIds = new Set(habits.filter(h => h.isAnchor).map(h => h.id));

  // 1. Calculate Habit Streaks across sorted chronological dates
  const allDatesSet = new Set<string>(Object.keys(dailyRecords));
  if (salahRecords && salahAsAnchorHabit) {
    Object.keys(salahRecords).forEach(d => allDatesSet.add(d));
  }
  const sortedDates = Array.from(allDatesSet).sort();
  
  let currentHabitStreak = 0;
  let maxHabitStreak = 0;
  let currentAnchorStreak = 0;
  let maxAnchorStreak = 0;
  let totalHabitCompletions = 0;
  let goldDaysCount = 0;
  let currentRedFree = 0;
  let redFreeReviewStreak = 0;

  // Track dates with habit completions
  const habitCompletionDates = new Set<string>();
  const anchorCompletionDates = new Set<string>();

  for (const dateKey of sortedDates) {
    const rec = dailyRecords[dateKey];
    const completedHabits = rec?.completedHabitIds || [];
    totalHabitCompletions += completedHabits.length;

    if (completedHabits.length > 0) {
      habitCompletionDates.add(dateKey);
    }

    let dayAnchorComplete = false;
    if (salahAsAnchorHabit) {
      const isSalahAllLogged = isDayAllPrayersLogged(salahRecords?.[dateKey]);
      const hasHabitAnchors = anchorHabitIds.size === 0 || completedHabits.some(id => anchorHabitIds.has(id));
      dayAnchorComplete = isSalahAllLogged && hasHabitAnchors;
    } else {
      dayAnchorComplete = completedHabits.some(id => anchorHabitIds.has(id));
    }

    if (dayAnchorComplete) {
      anchorCompletionDates.add(dateKey);
    }

    if (rec?.color === 'gold') {
      goldDaysCount++;
    }

    if (rec?.color && rec.color !== 'red') {
      currentRedFree++;
      if (currentRedFree > redFreeReviewStreak) {
        redFreeReviewStreak = currentRedFree;
      }
    } else if (rec?.color === 'red') {
      currentRedFree = 0;
    }
  }

  // Calculate maximum consecutive day streak for habit completions
  let tempStreak = 0;
  let prevDate: Date | null = null;

  const sortedHabitDates = Array.from(habitCompletionDates).sort();
  for (const dateStr of sortedHabitDates) {
    const parts = dateStr.split('-').map(Number);
    const currentDate = new Date(parts[0], parts[1] - 1, parts[2]);

    if (prevDate) {
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }

    if (tempStreak > maxHabitStreak) {
      maxHabitStreak = tempStreak;
    }
    prevDate = currentDate;
  }

  // Calculate current active streak up to today or yesterday
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  let checkDate = new Date(now);
  if (!habitCompletionDates.has(todayStr) && habitCompletionDates.has(yesterdayStr)) {
    checkDate = new Date(yesterday);
  }

  while (true) {
    const y = checkDate.getFullYear();
    const m = String(checkDate.getMonth() + 1).padStart(2, '0');
    const d = String(checkDate.getDate()).padStart(2, '0');
    const dStr = `${y}-${m}-${d}`;
    if (habitCompletionDates.has(dStr)) {
      currentHabitStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate Anchor streak
  let tempAnchorStreak = 0;
  let prevAnchorDate: Date | null = null;
  const sortedAnchorDates = Array.from(anchorCompletionDates).sort();
  for (const dateStr of sortedAnchorDates) {
    const parts = dateStr.split('-').map(Number);
    const curr = new Date(parts[0], parts[1] - 1, parts[2]);
    if (prevAnchorDate) {
      const diffDays = Math.round((curr.getTime() - prevAnchorDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempAnchorStreak++;
      } else {
        tempAnchorStreak = 1;
      }
    } else {
      tempAnchorStreak = 1;
    }
    if (tempAnchorStreak > maxAnchorStreak) {
      maxAnchorStreak = tempAnchorStreak;
    }
    prevAnchorDate = curr;
  }

  // 2. Calculate Task completion statistics
  const completedTasks = tasks.filter(t => t.completed);
  const totalTasksCompleted = completedTasks.length;

  const highPriorityTasksCompleted = completedTasks.filter(
    t => t.priority === 'high' || t.priority === 'urgent'
  ).length;

  // Flawless Days: days with at least 3 tasks where 100% of tasks due on that date were completed
  const tasksByDueDate: Record<string, TaskItem[]> = {};
  for (const t of tasks) {
    if (t.dueDate) {
      if (!tasksByDueDate[t.dueDate]) tasksByDueDate[t.dueDate] = [];
      tasksByDueDate[t.dueDate].push(t);
    }
  }

  let flawlessDaysCount = 0;
  for (const dueDate in tasksByDueDate) {
    const dayTasks = tasksByDueDate[dueDate];
    if (dayTasks.length >= 3 && dayTasks.every(t => t.completed)) {
      flawlessDaysCount++;
    }
  }

  return {
    currentHabitStreak,
    maxHabitStreak,
    totalHabitCompletions,
    maxAnchorStreak,
    totalTasksCompleted,
    highPriorityTasksCompleted,
    flawlessDaysCount,
    goldDaysCount,
    redFreeReviewStreak
  };
}

/**
 * Returns the list of all structured achievements with their real-time completion state.
 */
export function getAchievements(
  habits: Habit[],
  tasks: TaskItem[],
  dailyRecords: Record<string, DailyRecord>,
  salahRecords?: Record<string, SalahRecord>,
  salahAsAnchorHabit?: boolean
): Achievement[] {
  const m = computeUserMetrics(habits, tasks, dailyRecords, salahRecords, salahAsAnchorHabit);

  const bestStreak = Math.max(m.currentHabitStreak, m.maxHabitStreak);

  return [
    // Streak Milestones
    {
      id: 'streak-kickoff-3',
      title: 'Discipline Spark',
      description: 'Maintain a 3-day consecutive habit streak.',
      category: 'streak',
      tier: 'bronze',
      icon: 'flame',
      target: 3,
      current: bestStreak,
      unlocked: bestStreak >= 3,
      unit: 'days',
      rewardText: '+50 XP Calibration'
    },
    {
      id: 'streak-ironclad-7',
      title: '7-Day Ironclad',
      description: 'Reach a full 7-day unbroken habit streak without slipping.',
      category: 'streak',
      tier: 'silver',
      icon: 'award',
      target: 7,
      current: bestStreak,
      unlocked: bestStreak >= 7,
      unit: 'days',
      rewardText: 'Silver Crucible Pin'
    },
    {
      id: 'streak-fortnight-14',
      title: 'Fortnight Fortitude',
      description: 'Forge an unshakeable 14-day consecutive habit chain.',
      category: 'streak',
      tier: 'gold',
      icon: 'zap',
      target: 14,
      current: bestStreak,
      unlocked: bestStreak >= 14,
      unit: 'days',
      rewardText: 'Gold Vanguard Sigil'
    },
    {
      id: 'streak-monument-30',
      title: 'Monthly Monument',
      description: 'Sustain 30 days of continuous habit mastery.',
      category: 'streak',
      tier: 'platinum',
      icon: 'crown',
      target: 30,
      current: bestStreak,
      unlocked: bestStreak >= 30,
      unit: 'days',
      rewardText: 'Platinum Axis Master'
    },

    // Habit Completions
    {
      id: 'habit-first-spark',
      title: 'First Vector',
      description: 'Check off your first habit completion.',
      category: 'habits',
      tier: 'bronze',
      icon: 'sparkles',
      target: 1,
      current: m.totalHabitCompletions,
      unlocked: m.totalHabitCompletions >= 1,
      unit: 'habits',
      rewardText: 'Instrument Primed'
    },
    {
      id: 'habit-anchor-master-7',
      title: 'Anchor Lock',
      description: 'Fulfill an Anchor habit 7 days in a row.',
      category: 'habits',
      tier: 'silver',
      icon: 'anchor',
      target: 7,
      current: m.maxAnchorStreak,
      unlocked: m.maxAnchorStreak >= 7,
      unit: 'days',
      rewardText: 'Anchor Seal'
    },
    {
      id: 'habit-centurion-50',
      title: 'Habit Centurion',
      description: 'Execute 50 total habit repetitions across history.',
      category: 'habits',
      tier: 'gold',
      icon: 'shield',
      target: 50,
      current: m.totalHabitCompletions,
      unlocked: m.totalHabitCompletions >= 50,
      unit: 'completions',
      rewardText: 'Centurion Insignia'
    },

    // Task Completions
    {
      id: 'task-first-action',
      title: 'Task Initiate',
      description: 'Complete your first action item task.',
      category: 'tasks',
      tier: 'bronze',
      icon: 'check',
      target: 1,
      current: m.totalTasksCompleted,
      unlocked: m.totalTasksCompleted >= 1,
      unit: 'tasks',
      rewardText: 'Task Engine Online'
    },
    {
      id: 'task-decisive-10',
      title: 'Decisive Vector',
      description: 'Complete 10 total action tasks.',
      category: 'tasks',
      tier: 'silver',
      icon: 'target',
      target: 10,
      current: m.totalTasksCompleted,
      unlocked: m.totalTasksCompleted >= 10,
      unit: 'tasks',
      rewardText: 'Execution Badge'
    },
    {
      id: 'task-vanguard-high-5',
      title: 'High-Priority Vanguard',
      description: 'Conquer 5 High or Urgent priority tasks.',
      category: 'tasks',
      tier: 'silver',
      icon: 'flame',
      target: 5,
      current: m.highPriorityTasksCompleted,
      unlocked: m.highPriorityTasksCompleted >= 5,
      unit: 'tasks',
      rewardText: 'Vanguard Crest'
    },
    {
      id: 'task-century-50',
      title: 'Task Century',
      description: 'Crush 50 total completed tasks.',
      category: 'tasks',
      tier: 'gold',
      icon: 'trophy',
      target: 50,
      current: m.totalTasksCompleted,
      unlocked: m.totalTasksCompleted >= 50,
      unit: 'tasks',
      rewardText: 'Century Wreath'
    },
    {
      id: 'task-flawless-day',
      title: 'Flawless Execution',
      description: 'Complete all scheduled tasks for a day (min. 3 tasks).',
      category: 'tasks',
      tier: 'gold',
      icon: 'checkcheck',
      target: 1,
      current: m.flawlessDaysCount,
      unlocked: m.flawlessDaysCount >= 1,
      unit: 'days',
      rewardText: 'Flawless Day Star'
    },

    // Mastery & Review
    {
      id: 'mastery-gold-standard',
      title: 'Gold Standard',
      description: 'Earn your first Gold rating on your daily self-evaluation review.',
      category: 'mastery',
      tier: 'gold',
      icon: 'star',
      target: 1,
      current: m.goldDaysCount,
      unlocked: m.goldDaysCount >= 1,
      unit: 'reviews',
      rewardText: 'Gold Standard Laurel'
    },
    {
      id: 'mastery-red-free-7',
      title: 'Pure Discipline',
      description: 'Log 7 consecutive reviews with zero Red days.',
      category: 'mastery',
      tier: 'silver',
      icon: 'compass',
      target: 7,
      current: m.redFreeReviewStreak,
      unlocked: m.redFreeReviewStreak >= 7,
      unit: 'days',
      rewardText: 'Pure Compass Sigil'
    }
  ];
}
