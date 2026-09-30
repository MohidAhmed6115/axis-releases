import React, { useState, useRef, useEffect } from 'react';
import { useApp, getLocalDateString } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { PRAYER_CONFIG, PrayerName, PrayerStatus, createDefaultSalahRecord } from '../types';
import { PrayerToggleGroup, SoloPrayerIcon, BajamatPrayerIcon } from './PrayerIcons';
import { countLoggedPrayers, countBajamatPrayers } from '../services/salahService';
import { ChevronRight, X, Compass, Check } from 'lucide-react';

interface SalahTodayStripProps {
  onNavigateToSalah?: () => void;
}

export const SalahTodayStrip: React.FC<SalahTodayStripProps> = ({ onNavigateToSalah }) => {
  const { 
    salahRecords, 
    updateSalahPrayer, 
    selectedDate 
  } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const todayStr = getLocalDateString();
  const isToday = selectedDate === todayStr;

  const currentRecord = salahRecords[selectedDate] || createDefaultSalahRecord(selectedDate);
  const loggedCount = countLoggedPrayers(currentRecord);
  const bajamatCount = countBajamatPrayers(currentRecord);

  // Popover state for 2-tap logging
  const [activePopoverPrayer, setActivePopoverPrayer] = useState<PrayerName | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActivePopoverPrayer(null);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setActivePopoverPrayer(null);
      }
    }
    if (activePopoverPrayer) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePopoverPrayer]);

  const handleCellClick = (prayerId: PrayerName) => {
    if (activePopoverPrayer === prayerId) {
      setActivePopoverPrayer(null);
    } else {
      setActivePopoverPrayer(prayerId);
    }
  };

  const handleStatusSelect = async (prayerId: PrayerName, status: PrayerStatus) => {
    await updateSalahPrayer(selectedDate, prayerId, status);
    // Automatically close popover after two taps
    setActivePopoverPrayer(null);
  };

  const activePrayerObj = PRAYER_CONFIG.find(p => p.id === activePopoverPrayer);

  return (
    <div className={`p-3 sm:p-3.5 rounded-lg border relative transition-all ${
      isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
    }`}>
      {/* Header of Strip */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded-xs border flex items-center justify-center shrink-0 ${
            isDark ? 'bg-white/[0.06] border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
          }`}>
            <Compass className="w-3 h-3 stroke-[2]" />
          </div>
          <span className={`text-xs font-semibold font-sans tracking-tight ${
            isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
          }`}>
            Salah today
          </span>
          <span className="text-xs font-sans text-[#6b6882] dark:text-[#8d8aab] tabular-nums font-normal">
            ({loggedCount}/5 logged · {bajamatCount} congregation)
          </span>
        </div>

        {onNavigateToSalah && (
          <button
            type="button"
            onClick={onNavigateToSalah}
            className="text-xs font-sans font-medium text-[#6b6882] dark:text-[#8d8aab] hover:text-[#18172b] dark:hover:text-[#ece9fb] inline-flex items-center gap-0.5 cursor-pointer transition-colors"
          >
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 5 Small Cells (Fajr to Isha) */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {PRAYER_CONFIG.map((prayer) => {
          const status = currentRecord[prayer.id];
          const isSelected = activePopoverPrayer === prayer.id;
          const isDone = status !== 'none';

          return (
            <button
              key={prayer.id}
              type="button"
              onClick={() => handleCellClick(prayer.id)}
              aria-label={`Log ${prayer.label}`}
              title={`${prayer.label} (${prayer.period}): ${status === 'none' ? 'Tap to log' : status === 'solo' ? 'Solo' : 'Bajamat'}`}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-md border transition-all cursor-pointer select-none min-h-[58px] ${
                isSelected
                  ? 'border-[#8b7bff] ring-1 ring-[#8b7bff]/40'
                  : isDone
                    ? isDark 
                      ? 'bg-[#181829] border-white/[0.14]' 
                      : 'bg-[#f7f6fc] border-[#dedae9]'
                    : isDark 
                      ? 'bg-transparent border-white/[0.06] hover:border-white/[0.12]' 
                      : 'bg-transparent border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Prayer Abbreviation / Name */}
              <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider truncate mb-1 ${
                isDone
                  ? isDark ? 'text-white' : 'text-[#18172b]'
                  : 'text-[#7d7a96]'
              }`}>
                {prayer.label}
              </span>

              {/* Status Visual: empty / solo icon / bajamat icon */}
              <div className="h-6 flex items-center justify-center">
                {status === 'none' && (
                  <div className="w-5 h-5 rounded-xs border border-dashed border-[#7d7a96]/40 flex items-center justify-center">
                    <span className="w-1 h-1 rounded-full bg-[#7d7a96]/40" />
                  </div>
                )}
                {status === 'solo' && (
                  <div className="p-1 rounded-xs border flex items-center justify-center bg-[#7d7a96] text-white border-[#7d7a96]">
                    <SoloPrayerIcon className="w-4 h-4 shrink-0" />
                  </div>
                )}
                {status === 'bajamat' && (
                  <div className="px-1 py-0.5 rounded-xs border flex items-center justify-center bg-[#8b7bff] text-white border-[#8b7bff] shadow-xs">
                    <BajamatPrayerIcon className="w-6 h-3.5 shrink-0" />
                  </div>
                )}
              </div>

              {/* Subtle state label */}
              <span className="text-[9px] font-mono text-[#7d7a96] mt-0.5 capitalize truncate">
                {status === 'none' ? '—' : status}
              </span>
            </button>
          );
        })}
      </div>

      {/* Popover / Mobile Bottom Sheet for 2-Tap Logging */}
      {activePopoverPrayer && activePrayerObj && (
        <>
          {/* Mobile backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 z-50 sm:hidden backdrop-blur-xs"
            onClick={() => setActivePopoverPrayer(null)}
          />

          {/* Desktop popover & Mobile bottom sheet container */}
          <div
            ref={popoverRef}
            className={`fixed sm:absolute z-50 bottom-0 left-0 right-0 sm:bottom-auto sm:top-full sm:left-auto sm:right-auto sm:mt-1.5 p-3.5 sm:p-3 rounded-t-xl sm:rounded-lg border shadow-xl transition-all sm:w-72 ${
              isDark 
                ? 'bg-[#181829] border-white/[0.15] text-[#ece9fb]' 
                : 'bg-white border-[#dedae9] text-[#18172b]'
            }`}
            style={{
              // Center desktop popover relative to container if on desktop
              maxWidth: '100%'
            }}
          >
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-inherit border-opacity-10 font-sans">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">
                  Log {activePrayerObj.label}
                </span>
                <span className="text-xs text-[#6b6882] dark:text-[#8d8aab]">
                  ({activePrayerObj.period})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActivePopoverPrayer(null)}
                className="p-1 rounded text-[#6b6882] dark:text-[#8d8aab] hover:text-[#18172b] dark:hover:text-[#ece9fb] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-[#7d7a96] mb-3">
              Tap Solo or Congregation to log in one tap.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-2.5">
              {/* Option 1: Solo */}
              <button
                type="button"
                onClick={() => handleStatusSelect(
                  activePopoverPrayer, 
                  currentRecord[activePopoverPrayer] === 'solo' ? 'none' : 'solo'
                )}
                className={`flex flex-col items-center justify-center p-2.5 rounded-md border min-h-[50px] transition-all cursor-pointer ${
                  currentRecord[activePopoverPrayer] === 'solo'
                    ? 'bg-[#7d7a96] text-white border-[#7d7a96] shadow-xs'
                    : isDark 
                      ? 'bg-transparent border-white/[0.08] text-[#7d7a96] hover:border-white/20 hover:text-white' 
                      : 'bg-transparent border-slate-200 text-[#7d7a96] hover:border-slate-300 hover:text-black'
                }`}
              >
                <SoloPrayerIcon className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-mono font-medium">Solo</span>
              </button>

              {/* Option 2: Bajamat */}
              <button
                type="button"
                onClick={() => handleStatusSelect(
                  activePopoverPrayer, 
                  currentRecord[activePopoverPrayer] === 'bajamat' ? 'none' : 'bajamat'
                )}
                className={`flex flex-col items-center justify-center p-2.5 rounded-md border min-h-[50px] transition-all cursor-pointer ${
                  currentRecord[activePopoverPrayer] === 'bajamat'
                    ? 'bg-[#8b7bff] text-white border-[#8b7bff] shadow-xs shadow-[#8b7bff]/20'
                    : isDark 
                      ? 'bg-transparent border-white/[0.08] text-[#7d7a96] hover:border-[#8b7bff]/50 hover:text-[#8b7bff]' 
                      : 'bg-transparent border-slate-200 text-[#7d7a96] hover:border-[#8b7bff]/50 hover:text-[#8b7bff]'
                }`}
              >
                <BajamatPrayerIcon className="w-8 h-6 mb-1" />
                <span className="text-[10px] font-mono font-medium">Congregation</span>
              </button>
            </div>

            {/* Clear / Reset Button if already logged */}
            {currentRecord[activePopoverPrayer] !== 'none' && (
              <button
                type="button"
                onClick={() => handleStatusSelect(activePopoverPrayer, 'none')}
                className="w-full py-1.5 text-center text-[10px] font-mono text-[#7d7a96] hover:text-red-400 cursor-pointer transition-colors border-t border-inherit border-opacity-10 mt-1"
              >
                Clear to Not Prayed
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
