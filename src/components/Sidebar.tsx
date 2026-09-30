import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { AxisLogo } from './AxisLogo';
import { 
  LayoutDashboard, 
  CheckSquare, 
  ListTodo, 
  Calendar as CalendarIcon, 
  History, 
  Smartphone, 
  Settings as SettingsIcon,
  ChevronRight,
  ChevronLeft,
  User as UserIcon,
  LogIn,
  LogOut,
  Monitor,
  Moon,
  Sun,
  Laptop,
  Compass
} from 'lucide-react';
import { COLOR_DEFINITIONS } from '../types';
import { isElectronEnvironment } from '../services/usageStatsService';

export type NavPage = 'dashboard' | 'habits' | 'tasks' | 'calendar' | 'reviews' | 'screentime' | 'settings' | 'salah';

interface SidebarProps {
  currentPage: NavPage;
  onSelectPage: (page: NavPage) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  expanded,
  onToggleExpanded,
  className = ''
}) => {
  const { 
    user, 
    authMode, 
    logout, 
    openAuthModal, 
    platform, 
    setPlatform, 
    selectedDate, 
    dailyRecords 
  } = useApp();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentRecord = dailyRecords[selectedDate];
  const activeColorDef = currentRecord?.color ? COLOR_DEFINITIONS[currentRecord.color] : null;

  const navItems: { id: NavPage; label: string; icon: React.ComponentType<{ className?: string }>; androidOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'salah', label: 'Salah', icon: Compass },
    { id: 'habits', label: 'Habits', icon: CheckSquare },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'reviews', label: 'Daily Review', icon: History },
    { id: 'screentime', label: 'Screen-Time', icon: Smartphone, androidOnly: true },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const visibleNavItems = navItems.filter(item => {
    if (item.androidOnly) {
      return platform === 'android' && !isElectronEnvironment();
    }
    return true;
  });

  const isDark = resolvedTheme === 'dark';

  return (
    <aside
      className={`relative z-30 shrink-0 select-none hidden md:flex flex-col justify-between transition-all duration-200 border-r ${
        isDark 
          ? 'bg-[#131320] border-white/[0.08] text-[#7d7a96]' 
          : 'bg-[#ffffff] border-[#e7e4f4] text-[#7d7a96]'
      } ${expanded ? 'w-52' : 'w-13 sm:w-14'} ${className}`}
      style={{ minHeight: '100vh' }}
    >
      {/* Top Brand & Collapse Toggle */}
      <div>
        <div className="h-12 flex items-center justify-between px-2.5 border-b border-inherit border-opacity-10">
          <button
            onClick={() => onSelectPage('dashboard')}
            className="flex items-center gap-2 overflow-hidden text-left cursor-pointer group"
            title="Axis Dashboard"
          >
            <AxisLogo className="w-7 h-7 rounded-md transition-transform group-hover:scale-105" />
            {expanded && (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`font-semibold tracking-tight text-sm font-sans ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                  Axis
                </span>
                {activeColorDef && (
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: activeColorDef.hex }}
                    title={`Today rated: ${activeColorDef.label}`}
                  />
                )}
              </div>
            )}
          </button>

          {expanded && (
            <button
              onClick={onToggleExpanded}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                isDark ? 'text-[#7d7a96] hover:text-[#ece9fb] hover:bg-white/[0.05]' : 'text-[#7d7a96] hover:text-[#18172b] hover:bg-[#f3f1fb]'
              }`}
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>
          )}
        </div>

        {/* Expand toggle when collapsed */}
        {!expanded && (
          <div className="pt-2 flex justify-center">
            <button
              onClick={onToggleExpanded}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                isDark ? 'text-[#7d7a96] hover:text-[#ece9fb] hover:bg-white/[0.05]' : 'text-[#7d7a96] hover:text-[#18172b] hover:bg-[#f3f1fb]'
              }`}
              title="Expand sidebar"
            >
              <ChevronRight className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>
          </div>
        )}

        {/* Navigation list */}
        <nav className="p-1.5 space-y-1 mt-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer group ${
                  isActive
                    ? isDark
                      ? 'bg-[#1c1c2e] text-[#ece9fb] border border-white/[0.08]'
                      : 'bg-[#f3f1fb] text-[#18172b] border border-[#e7e4f4]'
                    : isDark
                      ? 'text-[#7d7a96] hover:text-[#ece9fb] hover:bg-white/[0.04]'
                      : 'text-[#7d7a96] hover:text-[#18172b] hover:bg-slate-100'
                }`}
                title={!expanded ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 stroke-[1.75] ${isActive ? (isDark ? 'text-[#8b7bff]' : 'text-[#7c5ef0]') : ''}`} />
                {expanded && (
                  <span className="truncate text-[11px] font-medium tracking-tight">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Compact Account / Preferences Menu */}
      <div className="p-1.5 border-t border-inherit border-opacity-10 relative" ref={accountMenuRef}>
        <button
          onClick={() => setAccountMenuOpen(!accountMenuOpen)}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors cursor-pointer ${
            isDark ? 'hover:bg-white/[0.06] text-[#ece9fb]' : 'hover:bg-slate-100 text-[#18172b]'
          }`}
          title="Account and Platform Settings"
        >
          <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
            authMode === 'authenticated'
              ? 'bg-[#8b7bff]/20 text-[#8b7bff] border border-[#8b7bff]/30'
              : isDark ? 'bg-[#1c1c2e] text-[#7d7a96]' : 'bg-slate-200 text-slate-600'
          }`}>
            <UserIcon className="w-3.5 h-3.5 stroke-[1.75]" />
          </div>
          {expanded && (
            <div className="min-w-0 flex-1 text-left">
              <div className={`text-[11px] font-medium truncate ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                {authMode === 'authenticated' ? (user?.displayName || user?.email?.split('@')[0] || 'User') : 'Guest Mode'}
              </div>
              <div className="text-[9px] text-[#7d7a96] truncate flex items-center gap-1 font-mono">
                <span>{authMode === 'authenticated' ? 'Cloud Synced' : 'Offline / Hive'}</span>
                <span>·</span>
                <span className="capitalize">{resolvedTheme}</span>
              </div>
            </div>
          )}
        </button>

        {/* Popover Menu */}
        {accountMenuOpen && (
          <div 
            className={`absolute bottom-full left-1 mb-1.5 w-60 rounded-md p-2.5 border z-50 text-xs space-y-2.5 ${
              isDark 
                ? 'bg-[#1c1c2e] border-white/10 text-[#ece9fb]' 
                : 'bg-white border-[#e7e4f4] text-[#18172b]'
            }`}
          >
            {/* Header info */}
            <div className="pb-2 border-b border-inherit">
              <div className="text-[11px] font-semibold">
                {authMode === 'authenticated' ? (user?.email || 'Account') : 'Local Guest'}
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                {authMode === 'authenticated' 
                  ? 'Real-time Firestore sync enabled' 
                  : 'Data stored locally in browser'}
              </div>
            </div>

            {/* Platform Mode Selector */}
            <div>
              <span className="text-[10px] text-zinc-500 block mb-1 font-medium">Platform Mode</span>
              <div className={`grid grid-cols-2 gap-1 p-0.5 rounded-lg border ${
                isDark ? 'bg-black/30 border-white/[0.06]' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setPlatform('android')}
                  className={`flex items-center justify-center gap-1.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                    platform === 'android'
                      ? isDark ? 'bg-white/10 text-white font-semibold' : 'bg-white text-slate-950 font-semibold shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Smartphone className="w-3 h-3 stroke-[1.75]" />
                  <span>Android</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform('desktop')}
                  className={`flex items-center justify-center gap-1.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                    platform === 'desktop'
                      ? isDark ? 'bg-white/10 text-white font-semibold' : 'bg-white text-slate-950 font-semibold shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Monitor className="w-3 h-3 stroke-[1.75]" />
                  <span>Desktop</span>
                </button>
              </div>
            </div>

            {/* Theme Toggle */}
            <div>
              <span className="text-[10px] text-zinc-500 block mb-1 font-medium">Theme</span>
              <div className={`grid grid-cols-3 gap-1 p-0.5 rounded-lg border ${
                isDark ? 'bg-black/30 border-white/[0.06]' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-center gap-1 py-1 rounded text-[10px] font-medium transition-all cursor-pointer ${
                    theme === 'light'
                      ? isDark ? 'bg-white/10 text-white' : 'bg-white text-slate-950 font-semibold shadow-xs'
                      : 'text-zinc-500'
                  }`}
                >
                  <Sun className="w-2.5 h-2.5 stroke-[2]" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center gap-1 py-1 rounded text-[10px] font-medium transition-all cursor-pointer ${
                    theme === 'dark'
                      ? isDark ? 'bg-white/10 text-white font-semibold' : 'bg-white text-slate-950 font-semibold shadow-xs'
                      : 'text-zinc-500'
                  }`}
                >
                  <Moon className="w-2.5 h-2.5 stroke-[2]" />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`flex items-center justify-center gap-1 py-1 rounded text-[10px] font-medium transition-all cursor-pointer ${
                    theme === 'system'
                      ? isDark ? 'bg-white/10 text-white font-semibold' : 'bg-white text-slate-950 font-semibold shadow-xs'
                      : 'text-zinc-500'
                  }`}
                >
                  <Laptop className="w-2.5 h-2.5 stroke-[2]" />
                  <span>Auto</span>
                </button>
              </div>
            </div>

            {/* Sign in / Sign out */}
            <div className="pt-2 border-t border-inherit">
              {authMode === 'guest' ? (
                <button
                  onClick={() => {
                    setAccountMenuOpen(false);
                    openAuthModal('Sign in to sync your habits, tasks, and daily reviews across devices.');
                  }}
                  className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  <LogIn className="w-3 h-3 stroke-[2]" />
                  <span>Sign in / Sync</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAccountMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1 text-zinc-400 hover:text-rose-400 text-[11px] rounded transition-colors cursor-pointer"
                >
                  <LogOut className="w-3 h-3 stroke-[1.75]" />
                  <span>Sign out</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
