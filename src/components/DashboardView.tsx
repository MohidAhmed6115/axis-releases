import React, { useState } from 'react';
import { useApp, getLocalDateString } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { DashboardStatCards } from './DashboardStatCards';
import { SalahTodayStrip } from './SalahTodayStrip';
import { QuickLogWidget } from './QuickLogWidget';
import { DashboardLists } from './DashboardLists';
import { AchievementsSection } from './AchievementsSection';
import { DashboardMiniTrends } from './DashboardMiniTrends';
import { DashboardQuickAddFAB } from './DashboardQuickAddFAB';
import { NavPage } from './Sidebar';
import { checkMissedAnchorTwoDaysInARow } from '../services/salahService';
import { Compass, X } from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (page: NavPage) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { salahRecords, salahAsAnchorHabit } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [dismissedAnchorReminder, setDismissedAnchorReminder] = useState(false);

  const todayStr = getLocalDateString();
  const missedTwoDays = salahAsAnchorHabit && checkMissedAnchorTwoDaysInARow(salahRecords, todayStr);
  const showMissedReminder = missedTwoDays && !dismissedAnchorReminder;

  return (
    <div className="space-y-3.5 max-w-5xl">
      {/* Gentle, non-blocking reminder if anchor is missed two days in a row (neutral tone, strictly no red) */}
      {showMissedReminder && (
        <div className={`p-3 sm:p-3.5 rounded-lg border flex items-center justify-between gap-3 transition-colors ${
          isDark 
            ? 'bg-[#181829] border-white/[0.08] text-[#c9c6de]' 
            : 'bg-[#f4f2fb] border-[#e7e4f4] text-[#474464]'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <Compass className="w-4 h-4 text-[#8b7bff] shrink-0 stroke-[1.75]" />
            <p className="text-xs leading-relaxed font-sans">
              <span className="font-semibold text-xs block sm:inline sm:mr-1.5 opacity-90">
                Anchor habit notice:
              </span>
              Salah was not fully logged over the past two days. Grounding today with your daily prayers restores your calibration.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('salah')}
              className={`text-xs font-sans font-medium px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${
                isDark 
                  ? 'bg-white/[0.06] border-white/10 hover:bg-white/10 text-white' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
              }`}
            >
              Log Salah
            </button>
            <button
              type="button"
              onClick={() => setDismissedAnchorReminder(true)}
              aria-label="Dismiss notice"
              title="Dismiss notice"
              className="p-1 rounded text-[#7d7a96] hover:text-[#ece9fb] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Top row: compact stat CARDS */}
      <DashboardStatCards />

      {/* 2. Compact Salah Today 5-Cell Strip */}
      <SalahTodayStrip onNavigateToSalah={() => onNavigate('salah')} />

      {/* 3. Daily Self-Review QUICK-LOG WIDGET */}
      <QuickLogWidget />

      {/* 4. Tables/lists (today's habits, today's tasks, next calendar events) */}
      <DashboardLists onNavigate={onNavigate} />

      {/* 5. Achievements & Milestone Visual Badges */}
      <AchievementsSection 
        onNavigateToHabits={() => onNavigate('habits')}
        onNavigateToTasks={() => onNavigate('tasks')}
      />

      {/* 6. Trends section: sparkline / mini bar charts showing 7/30-day trend */}
      <DashboardMiniTrends />

      {/* Floating Action Button for rapid Task / Habit creation without navigating away */}
      <DashboardQuickAddFAB 
        onNavigateToHabits={() => onNavigate('habits')}
        onNavigateToTasks={() => onNavigate('tasks')}
      />
    </div>
  );
};

