import React, { useState } from 'react';
import { useApp, getLocalDateString } from '../context/AppContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Smartphone, 
  Monitor, 
  LogOut, 
  LogIn,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { COLOR_DEFINITIONS } from '../types';

export const TopBar: React.FC = () => {
  const { 
    user, 
    authMode, 
    logout, 
    openAuthModal, 
    selectedDate, 
    setSelectedDate, 
    platform, 
    setPlatform,
    dailyRecords
  } = useApp();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handlePrevDay = () => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() - 1);
    setSelectedDate(getLocalDateString(current));
  };

  const handleNextDay = () => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + 1);
    setSelectedDate(getLocalDateString(current));
  };

  const handleToday = () => {
    setSelectedDate(getLocalDateString());
  };

  const isToday = selectedDate === getLocalDateString();
  const currentRecord = dailyRecords[selectedDate];
  const activeColorDef = currentRecord?.color ? COLOR_DEFINITIONS[currentRecord.color] : null;

  const formattedDate = (() => {
    try {
      const parts = selectedDate.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return selectedDate;
    }
  })();

  return (
    <header className="sticky top-0 z-40 bg-[#0b0f14]/95 backdrop-blur-md border-b border-white/[0.06] px-3 py-2">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Left: App Brand & current rated dot */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/10 flex items-center justify-center font-bold text-white text-[11px] tracking-wider">
            AX
          </div>
          <span className="font-bold tracking-tight text-white text-xs sm:text-sm">Axis</span>
          {activeColorDef && (
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: activeColorDef.hex }}
              title={`Rated: ${activeColorDef.label}`}
            />
          )}
        </div>

        {/* Center: Single-row Compact Date Navigator */}
        <div className="flex items-center gap-0.5 bg-white/[0.03] border border-white/[0.06] px-1.5 py-1 rounded-lg">
          <button
            onClick={handlePrevDay}
            className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Previous day"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-3.5 h-3.5 stroke-[1.75]" />
          </button>

          <span className="text-xs sm:text-[13px] font-sans font-medium tabular-nums text-zinc-200 px-1.5 select-none min-w-[95px] text-center truncate">
            {formattedDate}
          </span>

          <button
            onClick={handleNextDay}
            className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Next day"
            aria-label="Next day"
          >
            <ChevronRight className="w-3.5 h-3.5 stroke-[1.75]" />
          </button>

          {!isToday && (
            <button
              onClick={handleToday}
              className="text-xs font-sans font-medium px-2 py-0.5 rounded cursor-pointer ml-1 transition-colors ring-[1.5px] ring-[#8b7bff] text-[#8b7bff] hover:bg-[#8b7bff]/15"
            >
              Today
            </button>
          )}
        </div>

        {/* Right: Settings & Profile Trigger Menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center gap-1.5"
            title="Settings and Profile"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
          </button>

          {/* Settings & Profile Dropdown */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#121922] border border-white/10 rounded-2xl p-3 shadow-2xl z-50 text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <span className="text-[11px] font-semibold text-zinc-300">Preferences</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 stroke-[1.75]" />
                </button>
              </div>

              {/* Mode Switcher */}
              <div>
                <span className="text-[10px] text-zinc-400 block mb-1.5">Platform Mode</span>
                <div className="flex items-center bg-black/40 p-0.5 rounded-lg border border-white/[0.08]">
                  <button
                    onClick={() => { setPlatform('android'); setIsMenuOpen(false); }}
                    className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-all ${
                      platform === 'android' ? 'bg-white/10 text-white font-semibold' : 'text-zinc-400'
                    }`}
                  >
                    <Smartphone className="w-3 h-3 stroke-[1.75]" />
                    <span>Android</span>
                  </button>
                  <button
                    onClick={() => { setPlatform('desktop'); setIsMenuOpen(false); }}
                    className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-all ${
                      platform === 'desktop' ? 'bg-white/10 text-white font-semibold' : 'text-zinc-400'
                    }`}
                  >
                    <Monitor className="w-3 h-3 stroke-[1.75]" />
                    <span>Desktop</span>
                  </button>
                </div>
              </div>

              {/* Account Status */}
              <div className="pt-2 border-t border-white/[0.06]">
                <span className="text-[10px] text-zinc-400 block mb-1.5">Account Sync</span>
                {authMode === 'guest' ? (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      openAuthModal('Sign in to sync your habits, tasks, and daily reviews.');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white text-zinc-950 font-semibold text-[11px] rounded-lg hover:bg-zinc-200 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3 h-3 stroke-[2]" />
                    <span>Sign in / Sync</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="text-[11px] text-zinc-300 truncate">
                      {user?.displayName || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <button
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="w-full flex items-center justify-center gap-1.5 py-1 text-zinc-400 hover:text-rose-400 text-[11px] rounded bg-white/[0.03] hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3 h-3 stroke-[1.75]" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
