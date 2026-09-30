import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { NavPage } from './Sidebar';
import { 
  Home, 
  CheckSquare, 
  ListTodo, 
  Calendar as CalendarIcon, 
  MoreHorizontal,
  History,
  Smartphone,
  Settings as SettingsIcon,
  X,
  ChevronRight,
  User as UserIcon,
  LogIn,
  LogOut,
  Compass
} from 'lucide-react';
import { isElectronEnvironment } from '../services/usageStatsService';

interface MobileTabBarProps {
  currentPage: NavPage;
  onSelectPage: (page: NavPage) => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  currentPage,
  onSelectPage
}) => {
  const { 
    user, 
    authMode, 
    openAuthModal, 
    logout,
    platform, 
    setPlatform 
  } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  // Close sheet on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreSheetOpen(false);
      }
    };
    if (moreSheetOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moreSheetOpen]);

  // Is "More" active?
  const isMorePage = ['salah', 'reviews', 'screentime', 'settings'].includes(currentPage);
  const isMoreActive = isMorePage || moreSheetOpen;

  const handleTabClick = (page: NavPage | 'more') => {
    if (page === 'more') {
      setMoreSheetOpen(!moreSheetOpen);
    } else {
      setMoreSheetOpen(false);
      onSelectPage(page);
    }
  };

  const handleSelectMoreOption = (page: NavPage) => {
    onSelectPage(page);
    setMoreSheetOpen(false);
  };

  return (
    <>
      {/* 1. Mobile Bottom Tab Bar */}
      <nav
        role="navigation"
        aria-label="Mobile Navigation Bar"
        className={`fixed bottom-0 left-0 right-0 z-40 md:hidden select-none border-t ${
          isDark 
            ? 'bg-[#0a0a0f]/95 border-white/[0.08] backdrop-blur-md' 
            : 'bg-[#ffffff]/95 border-[#e7e4f4] backdrop-blur-md'
        }`}
        style={{
          paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom, 8px))'
        }}
      >
        <div className="grid grid-cols-5 h-13 sm:h-14 items-center px-1 max-w-lg mx-auto">
          {/* Tab 1: Dashboard (Home) */}
          <button
            type="button"
            onClick={() => handleTabClick('dashboard')}
            className={`flex flex-col items-center justify-center py-1 px-1 transition-colors cursor-pointer group ${
              currentPage === 'dashboard'
                ? isDark ? 'text-[#8b7bff]' : 'text-[#7c5ef0]'
                : isDark ? 'text-[#7d7a96] hover:text-[#ece9fb]' : 'text-[#7d7a96] hover:text-[#18172b]'
            }`}
            title="Home"
          >
            <Home 
              className="w-5 h-5 transition-transform group-active:scale-95"
              fill={currentPage === 'dashboard' ? 'currentColor' : 'none'}
              strokeWidth={currentPage === 'dashboard' ? 1.75 : 1.75}
            />
            <span className="text-[11px] sm:text-xs font-sans font-medium mt-0.5 truncate leading-tight">
              Home
            </span>
          </button>

          {/* Tab 2: Habits */}
          <button
            type="button"
            onClick={() => handleTabClick('habits')}
            className={`flex flex-col items-center justify-center py-1 px-1 transition-colors cursor-pointer group ${
              currentPage === 'habits'
                ? isDark ? 'text-[#8b7bff]' : 'text-[#7c5ef0]'
                : isDark ? 'text-[#7d7a96] hover:text-[#ece9fb]' : 'text-[#7d7a96] hover:text-[#18172b]'
            }`}
            title="Habits"
          >
            <CheckSquare 
              className="w-5 h-5 transition-transform group-active:scale-95"
              fill={currentPage === 'habits' ? 'currentColor' : 'none'}
              strokeWidth={currentPage === 'habits' ? 1.75 : 1.75}
            />
            <span className="text-[11px] sm:text-xs font-sans font-medium mt-0.5 truncate leading-tight">
              Habits
            </span>
          </button>

          {/* Tab 3: Tasks */}
          <button
            type="button"
            onClick={() => handleTabClick('tasks')}
            className={`flex flex-col items-center justify-center py-1 px-1 transition-colors cursor-pointer group ${
              currentPage === 'tasks'
                ? isDark ? 'text-[#8b7bff]' : 'text-[#7c5ef0]'
                : isDark ? 'text-[#7d7a96] hover:text-[#ece9fb]' : 'text-[#7d7a96] hover:text-[#18172b]'
            }`}
            title="Tasks"
          >
            <ListTodo 
              className="w-5 h-5 transition-transform group-active:scale-95"
              fill={currentPage === 'tasks' ? 'currentColor' : 'none'}
              strokeWidth={currentPage === 'tasks' ? 1.75 : 1.75}
            />
            <span className="text-[11px] sm:text-xs font-sans font-medium mt-0.5 truncate leading-tight">
              Tasks
            </span>
          </button>

          {/* Tab 4: Calendar */}
          <button
            type="button"
            onClick={() => handleTabClick('calendar')}
            className={`flex flex-col items-center justify-center py-1 px-1 transition-colors cursor-pointer group ${
              currentPage === 'calendar'
                ? isDark ? 'text-[#8b7bff]' : 'text-[#7c5ef0]'
                : isDark ? 'text-[#7d7a96] hover:text-[#ece9fb]' : 'text-[#7d7a96] hover:text-[#18172b]'
            }`}
            title="Calendar"
          >
            <CalendarIcon 
              className="w-5 h-5 transition-transform group-active:scale-95"
              fill={currentPage === 'calendar' ? 'currentColor' : 'none'}
              strokeWidth={currentPage === 'calendar' ? 1.75 : 1.75}
            />
            <span className="text-[11px] sm:text-xs font-sans font-medium mt-0.5 truncate leading-tight">
              Calendar
            </span>
          </button>

          {/* Tab 5: More */}
          <button
            type="button"
            onClick={() => handleTabClick('more')}
            className={`flex flex-col items-center justify-center py-1 px-1 transition-colors cursor-pointer group ${
              isMoreActive
                ? isDark ? 'text-[#8b7bff]' : 'text-[#7c5ef0]'
                : isDark ? 'text-[#7d7a96] hover:text-[#ece9fb]' : 'text-[#7d7a96] hover:text-[#18172b]'
            }`}
            title="More Modules"
          >
            <MoreHorizontal 
              className="w-5 h-5 transition-transform group-active:scale-95"
              fill={isMoreActive ? 'currentColor' : 'none'}
              strokeWidth={isMoreActive ? 2 : 1.75}
            />
            <span className="text-[11px] sm:text-xs font-sans font-medium mt-0.5 truncate leading-tight">
              More
            </span>
          </button>
        </div>
      </nav>

      {/* 2. "More" Bottom Sheet / Menu Overlay */}
      {moreSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          {/* Dimmed backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMoreSheetOpen(false)}
          />

          {/* Slide-in Sheet Container */}
          <div 
            className={`relative w-full rounded-t-lg border-t p-4 transition-transform animate-in slide-in-from-bottom duration-200 ${
              isDark 
                ? 'bg-[#131320] border-white/10 text-[#ece9fb]' 
                : 'bg-white border-[#e7e4f4] text-[#18172b]'
            }`}
            style={{
              paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 16px))'
            }}
          >
            {/* Grab Handle */}
            <div className="w-10 h-1 bg-zinc-500/40 rounded-full mx-auto mb-3" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-inherit border-opacity-10 mb-2">
              <span className="text-xs font-semibold font-sans text-zinc-400">
                More modules
              </span>
              <button
                type="button"
                onClick={() => setMoreSheetOpen(false)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isDark ? 'text-zinc-400 hover:text-white hover:bg-white/[0.08]' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                }`}
                title="Close"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            {/* Menu items listing */}
            <div className="space-y-1">
              {/* Option 0: Salah Tracker */}
              <button
                type="button"
                onClick={() => handleSelectMoreOption('salah')}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer text-left ${
                  currentPage === 'salah'
                    ? isDark ? 'bg-white/[0.1] text-white shadow-xs' : 'bg-slate-100 text-slate-950 shadow-xs'
                    : isDark ? 'hover:bg-white/[0.04] text-zinc-200' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  currentPage === 'salah'
                    ? isDark ? 'bg-white/15 text-white' : 'bg-slate-200 text-slate-950'
                    : isDark ? 'bg-zinc-800/80 text-zinc-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Compass className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold tracking-tight">Salah Tracker</div>
                  <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                    Five daily prayers, solo & congregation logging
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0 stroke-[1.75]" />
              </button>

              {/* Option 1: Daily Review */}
              <button
                type="button"
                onClick={() => handleSelectMoreOption('reviews')}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer text-left ${
                  currentPage === 'reviews'
                    ? isDark ? 'bg-white/[0.1] text-white shadow-xs' : 'bg-slate-100 text-slate-950 shadow-xs'
                    : isDark ? 'hover:bg-white/[0.04] text-zinc-200' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  currentPage === 'reviews'
                    ? isDark ? 'bg-white/15 text-white' : 'bg-slate-200 text-slate-950'
                    : isDark ? 'bg-zinc-800/80 text-zinc-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  <History className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold tracking-tight">Daily Review</div>
                  <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                    Heatmap, day ratings & reflective history
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0 stroke-[1.75]" />
              </button>

              {/* Option 2: Screen-Time (Android only, hidden on Electron desktop) */}
              {!isElectronEnvironment() && (
                <button
                  type="button"
                  onClick={() => {
                    if (platform !== 'android') {
                      setPlatform('android');
                    }
                    handleSelectMoreOption('screentime');
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer text-left ${
                    currentPage === 'screentime'
                      ? isDark ? 'bg-white/[0.1] text-white shadow-xs' : 'bg-slate-100 text-slate-950 shadow-xs'
                      : isDark ? 'hover:bg-white/[0.04] text-zinc-200' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    currentPage === 'screentime'
                      ? isDark ? 'bg-white/15 text-white' : 'bg-slate-200 text-slate-950'
                      : isDark ? 'bg-zinc-800/80 text-zinc-300' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Smartphone className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold tracking-tight">Screen-Time</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-500/20 text-zinc-400 font-mono">
                        Android
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                      App telemetry, wellbeing & focus limits
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0 stroke-[1.75]" />
                </button>
              )}

              {/* Option 3: Settings */}
              <button
                type="button"
                onClick={() => handleSelectMoreOption('settings')}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer text-left ${
                  currentPage === 'settings'
                    ? isDark ? 'bg-white/[0.1] text-white shadow-xs' : 'bg-slate-100 text-slate-950 shadow-xs'
                    : isDark ? 'hover:bg-white/[0.04] text-zinc-200' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  currentPage === 'settings'
                    ? isDark ? 'bg-white/15 text-white' : 'bg-slate-200 text-slate-950'
                    : isDark ? 'bg-zinc-800/80 text-zinc-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  <SettingsIcon className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold tracking-tight">Settings</div>
                  <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                    Preferences, appearance, themes & calendar sync
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0 stroke-[1.75]" />
              </button>
            </div>

            {/* Account / Session Quick Info */}
            <div className="mt-3 pt-3 border-t border-inherit border-opacity-10 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                  authMode === 'authenticated'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-200 text-slate-600'
                }`}>
                  <UserIcon className="w-3.5 h-3.5 stroke-[1.75]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-medium truncate">
                    {authMode === 'authenticated' ? (user?.displayName || user?.email?.split('@')[0]) : 'Local Guest'}
                  </div>
                  <div className="text-[9px] text-zinc-500 truncate">
                    {authMode === 'authenticated' ? 'Synced with cloud' : 'Stored locally'}
                  </div>
                </div>
              </div>

              {authMode === 'authenticated' ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMoreSheetOpen(false);
                  }}
                  className={`text-[10px] font-medium px-2 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                    isDark ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <LogOut className="w-3 h-3 stroke-[1.75]" />
                  <span>Log out</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMoreSheetOpen(false);
                    openAuthModal('Sign in to sync your data across devices');
                  }}
                  className={`text-[10px] font-medium px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                    isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                  }`}
                >
                  <LogIn className="w-3 h-3 stroke-[1.75]" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
