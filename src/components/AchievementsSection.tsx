import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Achievement, 
  AchievementCategory, 
  getAchievements, 
  computeUserMetrics 
} from '../services/achievementsService';
import { 
  Award, 
  Flame, 
  Zap, 
  Crown, 
  Sparkles, 
  Anchor, 
  Shield, 
  Check, 
  Target, 
  Trophy, 
  CheckCheck, 
  Star, 
  Compass, 
  Lock, 
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AchievementsSectionProps {
  onNavigateToHabits?: () => void;
  onNavigateToTasks?: () => void;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = () => {
  const { habits, tasks, dailyRecords, salahRecords, salahAsAnchorHabit } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [filterCategory, setFilterCategory] = useState<AchievementCategory | 'all' | 'unlocked'>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isLockedAccordionOpen, setIsLockedAccordionOpen] = useState(false);

  // Compute live achievement status
  const achievements = useMemo(() => {
    return getAchievements(habits, tasks, dailyRecords, salahRecords, salahAsAnchorHabit);
  }, [habits, tasks, dailyRecords, salahRecords, salahAsAnchorHabit]);

  const metrics = useMemo(() => {
    return computeUserMetrics(habits, tasks, dailyRecords, salahRecords, salahAsAnchorHabit);
  }, [habits, tasks, dailyRecords, salahRecords, salahAsAnchorHabit]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Filtered badges
  const filteredAchievements = useMemo(() => {
    if (filterCategory === 'all') return achievements;
    if (filterCategory === 'unlocked') return achievements.filter(a => a.unlocked);
    return achievements.filter(a => a.category === filterCategory);
  }, [achievements, filterCategory]);

  // Split and order:
  // 1. In-progress badges (current > 0 and < target), sorted by progress percentage descending (closest to unlocking first)
  // 2. Unlocked badges (current >= target or unlocked)
  // 3. Zero progress badges (current === 0 and !unlocked) - collapsed into accordion at bottom
  const { activeBadges, zeroProgressBadges } = useMemo(() => {
    const inProgress: (Achievement & { progressRatio: number })[] = [];
    const unlocked: (Achievement & { progressRatio: number })[] = [];
    const zeroProgress: (Achievement & { progressRatio: number })[] = [];

    for (const ach of filteredAchievements) {
      const ratio = ach.target > 0 ? ach.current / ach.target : 0;
      const item = { ...ach, progressRatio: ratio };

      if (ach.unlocked || ratio >= 1) {
        unlocked.push(item);
      } else if (ach.current > 0) {
        inProgress.push(item);
      } else {
        zeroProgress.push(item);
      }
    }

    // Sort in-progress by ratio descending (closest to unlocking first)
    inProgress.sort((a, b) => b.progressRatio - a.progressRatio);

    return {
      activeBadges: [...inProgress, ...unlocked],
      zeroProgressBadges: zeroProgress
    };
  }, [filteredAchievements]);

  const getBadgeIcon = (iconName: string, unlocked: boolean, className: string = "w-5 h-5") => {
    switch (iconName) {
      case 'flame': return <Flame className={className} />;
      case 'award': return <Award className={className} />;
      case 'zap': return <Zap className={className} />;
      case 'crown': return <Crown className={className} />;
      case 'sparkles': return <Sparkles className={className} />;
      case 'anchor': return <Anchor className={className} />;
      case 'shield': return <Shield className={className} />;
      case 'check': return <Check className={className} />;
      case 'target': return <Target className={className} />;
      case 'trophy': return <Trophy className={className} />;
      case 'checkcheck': return <CheckCheck className={className} />;
      case 'star': return <Star className={className} />;
      case 'compass': return <Compass className={className} />;
      default: return <Award className={className} />;
    }
  };

  // Neutral grey tier pips and labels (no metallic colors, preserving green/gold/orange/red for day rating)
  const getTierInfo = (tier: Achievement['tier']) => {
    switch (tier) {
      case 'platinum':
        return { label: 'Platinum', pips: '●●●●' };
      case 'gold':
        return { label: 'Gold', pips: '●●●○' };
      case 'silver':
        return { label: 'Silver', pips: '●●○○' };
      case 'bronze':
      default:
        return { label: 'Bronze', pips: '●○○○' };
    }
  };

  const handleCardClick = (ach: Achievement) => {
    setSelectedAchievement(ach);
    if (ach.unlocked) {
      confetti({
        particleCount: 20,
        spread: 45,
        origin: { y: 0.6 }
      });
    }
  };

  // Safe numeric values for stat cards
  const bestStreakVal = Math.max(metrics.currentHabitStreak ?? 0, metrics.maxHabitStreak ?? 0);
  const tasksDoneVal = metrics.totalTasksCompleted ?? 0;
  const anchorStreakVal = metrics.maxAnchorStreak ?? 0;
  const goldDaysVal = metrics.goldDaysCount ?? 0;

  return (
    <section className={`p-3.5 sm:p-4 rounded-lg border space-y-3.5 ${
      isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
    }`}>
      {/* 1. Header with Milestones & Single Thin Mastery Bar underneath */}
      <div className="pb-3 border-b border-inherit border-opacity-10 space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-[#8b7bff]/15 flex items-center justify-center text-[#8b7bff] shrink-0">
              <Trophy className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className={`text-xs sm:text-sm font-semibold font-mono uppercase tracking-wider truncate ${
                  isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
                }`}>
                  Milestones & Badges
                </h2>
                <span className="text-[#7d7a96] text-[10px] font-mono">·</span>
                <span className="text-[11px] font-mono text-[#8b7bff] font-semibold shrink-0">
                  {unlockedCount} / {totalCount} Unlocked
                </span>
              </div>
              <p className="text-[11px] text-[#7d7a96] mt-0.5 truncate hidden sm:block">
                Earn badges as you hit habit streaks, task completions, and daily discipline ratings.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className={`text-xs font-mono font-semibold tabular-nums ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
              {completionPercentage}%
            </span>
          </div>
        </div>

        {/* Mastery bar as a single thin line under the page header */}
        <div className="h-[3px] w-full rounded-full bg-black/15 dark:bg-white/10 overflow-hidden">
          <div 
            className="h-full rounded-full bg-[#8b7bff] transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* 2. Key Metrics Snapshot Bar: 2x2 Grid on Mobile, 4-Cols on Desktop with Guaranteed Numeric Rendering */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className={`p-2.5 rounded-md border ${
          isDark ? 'bg-[#0f1018] border-white/[0.04]' : 'bg-[#fbfaff] border-[#eae7f5]'
        }`}>
          <div className="flex items-center gap-1.5 text-[10px] text-[#7d7a96] uppercase">
            <Flame className="w-3 h-3 text-zinc-400 stroke-[1.75]" />
            <span className="truncate">Best Streak</span>
          </div>
          <div className={`text-lg font-bold mt-1 flex items-baseline gap-1 font-mono ${
            isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
          }`}>
            <span className="tabular-nums font-bold">{bestStreakVal}</span>
            <span className="text-[10px] text-[#7d7a96] font-normal">days</span>
          </div>
        </div>

        <div className={`p-2.5 rounded-md border ${
          isDark ? 'bg-[#0f1018] border-white/[0.04]' : 'bg-[#fbfaff] border-[#eae7f5]'
        }`}>
          <div className="flex items-center gap-1.5 text-[10px] text-[#7d7a96] uppercase">
            <Check className="w-3 h-3 text-zinc-400 stroke-[2]" />
            <span className="truncate">Tasks Done</span>
          </div>
          <div className={`text-lg font-bold mt-1 flex items-baseline gap-1 font-mono ${
            isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
          }`}>
            <span className="tabular-nums font-bold">{tasksDoneVal}</span>
            <span className="text-[10px] text-[#7d7a96] font-normal">items</span>
          </div>
        </div>

        <div className={`p-2.5 rounded-md border ${
          isDark ? 'bg-[#0f1018] border-white/[0.04]' : 'bg-[#fbfaff] border-[#eae7f5]'
        }`}>
          <div className="flex items-center gap-1.5 text-[10px] text-[#7d7a96] uppercase">
            <Anchor className="w-3 h-3 text-zinc-400 stroke-[1.75]" />
            <span className="truncate">Anchor Streak</span>
          </div>
          <div className={`text-lg font-bold mt-1 flex items-baseline gap-1 font-mono ${
            isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
          }`}>
            <span className="tabular-nums font-bold">{anchorStreakVal}</span>
            <span className="text-[10px] text-[#7d7a96] font-normal">days</span>
          </div>
        </div>

        <div className={`p-2.5 rounded-md border ${
          isDark ? 'bg-[#0f1018] border-white/[0.04]' : 'bg-[#fbfaff] border-[#eae7f5]'
        }`}>
          <div className="flex items-center gap-1.5 text-[10px] text-[#7d7a96] uppercase">
            <Star className="w-3 h-3 text-zinc-400 stroke-[1.75]" />
            <span className="truncate">Gold Reviews</span>
          </div>
          <div className={`text-lg font-bold mt-1 flex items-baseline gap-1 font-mono ${
            isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
          }`}>
            <span className="tabular-nums font-bold">{goldDaysVal}</span>
            <span className="text-[10px] text-[#7d7a96] font-normal">days</span>
          </div>
        </div>
      </div>

      {/* 3. Category Filter Tabs: Single Horizontally Scrollable Row that Never Wraps */}
      <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1 pt-0.5 text-[11px] font-mono scrollbar-none">
        {(['all', 'streak', 'habits', 'tasks', 'mastery', 'unlocked'] as const).map((cat) => {
          const isActive = filterCategory === cat;
          const label = 
            cat === 'all' ? 'All Badges' :
            cat === 'streak' ? 'Streaks' :
            cat === 'habits' ? 'Habits' :
            cat === 'tasks' ? 'Tasks' :
            cat === 'mastery' ? 'Mastery' : 'Unlocked';

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer capitalize shrink-0 ${
                isActive
                  ? isDark 
                    ? 'bg-[#8b7bff] text-[#0a0a0f] font-semibold' 
                    : 'bg-[#7c5ef0] text-white font-semibold'
                  : isDark 
                    ? 'bg-white/[0.04] text-[#7d7a96] hover:text-[#ece9fb] hover:bg-white/[0.07]' 
                    : 'bg-[#f3f1fb] text-[#7d7a96] hover:text-[#18172b]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 4A. Mobile View (below 640px): Single-Column List of Compact Rows (~56-64px) */}
      <div className="space-y-2 block sm:hidden">
        {activeBadges.length === 0 && zeroProgressBadges.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#7d7a96] font-mono">
            No badges in this category.
          </div>
        ) : (
          activeBadges.map((ach) => {
            const progressPct = Math.min(100, Math.round((ach.current / ach.target) * 100));

            return (
              <div
                key={ach.id}
                onClick={() => handleCardClick(ach)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isDark ? 'bg-[#151622] border-white/[0.06]' : 'bg-[#f8f7fc] border-[#e6e3f2]'
                } active:bg-white/[0.04]`}
              >
                <div className="flex items-center justify-between gap-2.5">
                  {/* Left: Icon in a small bordered square + Badge Title */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-md border flex items-center justify-center shrink-0 ${
                      ach.unlocked
                        ? isDark ? 'bg-white/[0.08] border-white/20 text-[#ece9fb]' : 'bg-slate-200 border-slate-300 text-[#18172b]'
                        : isDark ? 'bg-white/[0.02] border-white/[0.06] text-zinc-500' : 'bg-slate-100 border-slate-200 text-zinc-400'
                    }`}>
                      {getBadgeIcon(ach.icon, ach.unlocked, "w-4 h-4")}
                    </div>

                    <div className="min-w-0">
                      <h3 className={`text-xs font-medium truncate ${
                        ach.unlocked 
                          ? isDark ? 'text-[#ece9fb]' : 'text-[#18172b]' 
                          : isDark ? 'text-zinc-300' : 'text-zinc-700'
                      }`}>
                        {ach.title}
                      </h3>
                    </div>
                  </div>

                  {/* Right: Progress text right-aligned ("2 / 3 days") */}
                  <div className="text-right shrink-0">
                    <span className={`font-mono text-[11px] tabular-nums ${
                      ach.unlocked
                        ? isDark ? 'text-[#ece9fb] font-medium' : 'text-[#18172b] font-medium'
                        : 'text-[#7d7a96]'
                    }`}>
                      {ach.current} / {ach.target} {ach.unit}
                    </span>
                  </div>
                </div>

                {/* Thin 3px progress bar underneath */}
                <div className="mt-2 h-[3px] w-full rounded-full bg-black/20 dark:bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      ach.unlocked
                        ? isDark ? 'bg-zinc-300' : 'bg-zinc-700'
                        : 'bg-[#8b7bff]'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4B. Desktop View (640px and above): 4-Column Tile Grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {activeBadges.length === 0 && zeroProgressBadges.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-[#7d7a96] font-mono">
            No badges found in this category.
          </div>
        ) : (
          activeBadges.map((ach) => {
            const tier = getTierInfo(ach.tier);
            const progressPct = Math.min(100, Math.round((ach.current / ach.target) * 100));

            return (
              <div
                key={ach.id}
                onClick={() => handleCardClick(ach)}
                className={`p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between ${
                  isDark ? 'bg-[#151622] border-white/[0.06]' : 'bg-[#f8f7fc] border-[#e6e3f2]'
                } ${ach.unlocked ? 'hover:scale-[1.01]' : 'opacity-90 hover:opacity-100'}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      ach.unlocked
                        ? isDark ? 'bg-white/[0.08] border-white/20 text-[#ece9fb]' : 'bg-slate-200 border-slate-300 text-[#18172b]'
                        : isDark ? 'bg-white/[0.02] border-white/[0.06] text-zinc-500' : 'bg-slate-100 border-slate-200 text-zinc-400'
                    }`}>
                      {getBadgeIcon(ach.icon, ach.unlocked, "w-5 h-5")}
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-mono uppercase tracking-wider block text-zinc-400 dark:text-zinc-500">
                        {tier.label} {tier.pips}
                      </span>
                      <span className="text-[10px] font-mono text-[#7d7a96] uppercase flex items-center gap-1 justify-end mt-0.5">
                        {ach.unlocked ? (
                          <span className={`font-semibold flex items-center gap-0.5 ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            UNLOCKED
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" />
                            LOCKED
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <h3 className={`text-xs font-semibold tracking-tight ${
                      ach.unlocked 
                        ? isDark ? 'text-[#ece9fb]' : 'text-[#18172b]' 
                        : isDark ? 'text-zinc-300' : 'text-zinc-700'
                    }`}>
                      {ach.title}
                    </h3>
                    <p className="text-[11px] text-[#7d7a96] mt-0.5 leading-snug line-clamp-2">
                      {ach.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-inherit border-opacity-10">
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className="text-[#7d7a96]">
                      {ach.unlocked ? 'Complete' : 'Progress'}
                    </span>
                    <span className={`font-semibold tabular-nums ${
                      ach.unlocked 
                        ? isDark ? 'text-zinc-200' : 'text-zinc-800' 
                        : isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
                    }`}>
                      {ach.current} / {ach.target} {ach.unit}
                    </span>
                  </div>

                  <div className="h-[3px] w-full rounded-full bg-black/20 dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        ach.unlocked
                          ? isDark ? 'bg-zinc-300' : 'bg-zinc-700'
                          : 'bg-[#8b7bff]'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4C. Collapsible "Locked (N)" Accordion for 0-Progress Badges (Closed by Default) */}
      {zeroProgressBadges.length > 0 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsLockedAccordionOpen(!isLockedAccordionOpen)}
            className={`w-full py-2 px-3 rounded-lg border flex items-center justify-between text-xs font-mono transition-colors cursor-pointer ${
              isDark 
                ? 'bg-white/[0.02] border-white/[0.06] text-[#7d7a96] hover:text-[#ece9fb] hover:bg-white/[0.04]' 
                : 'bg-slate-50 border-slate-200 text-[#7d7a96] hover:text-[#18172b] hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Locked ({zeroProgressBadges.length})</span>
            </div>
            {isLockedAccordionOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {isLockedAccordionOpen && (
            <div className="mt-2 space-y-2 sm:space-y-0">
              {/* Mobile Compact Rows for Accordion */}
              <div className="space-y-2 block sm:hidden">
                {zeroProgressBadges.map((ach) => (
                  <div
                    key={ach.id}
                    onClick={() => handleCardClick(ach)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between opacity-80 hover:opacity-100 ${
                      isDark ? 'bg-[#151622] border-white/[0.06]' : 'bg-[#f8f7fc] border-[#e6e3f2]'
                    } active:bg-white/[0.04]`}
                  >
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-md border flex items-center justify-center shrink-0 ${
                          isDark ? 'bg-white/[0.02] border-white/[0.06] text-zinc-500' : 'bg-slate-100 border-slate-200 text-zinc-400'
                        }`}>
                          {getBadgeIcon(ach.icon, ach.unlocked, "w-4 h-4")}
                        </div>

                        <div className="min-w-0">
                          <h3 className={`text-xs font-medium truncate ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            {ach.title}
                          </h3>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-[11px] tabular-nums text-[#7d7a96]">
                          0 / {ach.target} {ach.unit}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 h-[3px] w-full rounded-full bg-black/20 dark:bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-transparent" style={{ width: '0%' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop 4-col Tile Grid for Accordion */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                {zeroProgressBadges.map((ach) => {
                  const tier = getTierInfo(ach.tier);

                  return (
                    <div
                      key={ach.id}
                      onClick={() => handleCardClick(ach)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between opacity-80 hover:opacity-100 ${
                        isDark ? 'bg-[#151622] border-white/[0.06]' : 'bg-[#f8f7fc] border-[#e6e3f2]'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                            isDark ? 'bg-white/[0.02] border-white/[0.06] text-zinc-500' : 'bg-slate-100 border-slate-200 text-zinc-400'
                          }`}>
                            {getBadgeIcon(ach.icon, ach.unlocked, "w-5 h-5")}
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] font-mono uppercase tracking-wider block text-zinc-400 dark:text-zinc-500">
                              {tier.label} {tier.pips}
                            </span>
                            <span className="text-[10px] font-mono text-[#7d7a96] uppercase flex items-center gap-1 justify-end mt-0.5">
                              <Lock className="w-2.5 h-2.5" />
                              LOCKED
                            </span>
                          </div>
                        </div>

                        <div className="mt-2.5">
                          <h3 className={`text-xs font-semibold tracking-tight ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                            {ach.title}
                          </h3>
                          <p className="text-[11px] text-[#7d7a96] mt-0.5 leading-snug line-clamp-2">
                            {ach.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-inherit border-opacity-10">
                        <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                          <span className="text-[#7d7a96]">Progress</span>
                          <span className="font-semibold tabular-nums text-[#7d7a96]">
                            0 / {ach.target} {ach.unit}
                          </span>
                        </div>

                        <div className="h-[3px] w-full rounded-full bg-black/20 dark:bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-transparent" style={{ width: '0%' }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Mobile Bottom Sheet / Desktop Centered Modal */}
      {selectedAchievement && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedAchievement(null)}
        >
          <div 
            className={`w-full sm:max-w-sm rounded-t-2xl sm:rounded-xl p-5 border-t sm:border space-y-4 shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:fade-in duration-200 ${
              isDark ? 'bg-[#131320] border-white/15 text-[#ece9fb]' : 'bg-white border-[#d8d4ec] text-[#18172b]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile grab handle */}
            <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto -mt-1 mb-2 sm:hidden" />

            <div className="flex items-start justify-between">
              <div className={`w-11 h-11 rounded-lg border flex items-center justify-center ${
                selectedAchievement.unlocked
                  ? isDark ? 'bg-white/[0.08] border-white/20 text-[#ece9fb]' : 'bg-slate-200 border-slate-300 text-[#18172b]'
                  : isDark ? 'bg-white/[0.02] border-white/[0.06] text-zinc-500' : 'bg-slate-100 border-slate-200 text-zinc-400'
              }`}>
                {getBadgeIcon(selectedAchievement.icon, selectedAchievement.unlocked, "w-5 h-5")}
              </div>
              <button
                type="button"
                onClick={() => setSelectedAchievement(null)}
                className="text-[#7d7a96] hover:text-[#ece9fb] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-zinc-400 dark:text-zinc-500">
                  {getTierInfo(selectedAchievement.tier).label} Tier · {getTierInfo(selectedAchievement.tier).pips}
                </span>
                <span className="text-[#7d7a96] text-[10px]">·</span>
                <span className={`text-[10px] font-mono uppercase font-semibold ${
                  selectedAchievement.unlocked 
                    ? isDark ? 'text-zinc-200' : 'text-zinc-800' 
                    : 'text-[#7d7a96]'
                }`}>
                  {selectedAchievement.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>

              <h3 className={`text-base font-bold mt-1 ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                {selectedAchievement.title}
              </h3>
              <p className="text-xs text-[#7d7a96] mt-1 leading-relaxed">
                {selectedAchievement.description}
              </p>
            </div>

            <div className={`p-3 rounded-lg border text-xs space-y-2 font-mono ${
              isDark ? 'bg-[#0a0a0f] border-white/[0.06]' : 'bg-[#f8f7fc] border-[#e7e4f4]'
            }`}>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#7d7a96]">Requirement:</span>
                <span className={isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}>
                  {selectedAchievement.target} {selectedAchievement.unit}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#7d7a96]">Current Progress:</span>
                <span className="font-semibold text-[#8b7bff] tabular-nums">
                  {selectedAchievement.current} {selectedAchievement.unit}
                </span>
              </div>
              {selectedAchievement.rewardText && (
                <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-inherit border-opacity-10">
                  <span className="text-[#7d7a96]">Instrument Signature:</span>
                  <span className={isDark ? 'text-zinc-300 font-semibold' : 'text-zinc-700 font-semibold'}>
                    {selectedAchievement.rewardText}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {selectedAchievement.unlocked ? (
                <button
                  type="button"
                  onClick={() => {
                    confetti({ particleCount: 30, spread: 60, origin: { y: 0.5 } });
                  }}
                  className={`w-full py-2.5 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors ${
                    isDark ? 'bg-[#8b7bff] text-[#0a0a0f] hover:bg-[#9d8fff]' : 'bg-[#7c5ef0] text-white hover:bg-[#6e4ee6]'
                  }`}
                >
                  Celebrate Badge ✨
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedAchievement(null)}
                  className={`w-full py-2.5 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider border cursor-pointer ${
                    isDark ? 'border-white/10 text-[#ece9fb] hover:bg-white/[0.04]' : 'border-[#e7e4f4] text-[#18172b] hover:bg-slate-50'
                  }`}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
