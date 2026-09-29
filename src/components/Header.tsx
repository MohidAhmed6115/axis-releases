import React from 'react';
import { useApp, getLocalDateString } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Smartphone,
  Eye,
  Maximize2,
  Calendar as CalendarIcon,
  Github,
  Sparkles
} from 'lucide-react';
import { COLOR_DEFINITIONS } from '../types';

interface HeaderProps {
  pageTitle: string;
  deviceViewportMode?: 'phone' | 'full';
  setDeviceViewportMode?: (m: 'phone' | 'full') => void;
  onOpenContribute?: () => void;
  onOpenReleaseNotes?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  onOpenContribute,
  onOpenReleaseNotes
}) => {
  const { 
    selectedDate, 
    setSelectedDate, 
    dailyRecords, 
    platform 
  } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

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
    <header className={`h-12 border-b shrink-0 px-3 sm:px-4 flex items-center justify-between gap-2 z-20 ${
      isDark 
        ? 'bg-[#0a0a0f]/90 border-white/[0.08] text-[#ece9fb]' 
        : 'bg-[#ffffff]/90 border-[#e7e4f4] text-[#18172b]'
    } backdrop-blur-md sticky top-0`}>
      {/* Left: Page Title */}
      <div className="flex items-center gap-2 min-w-0">
        <h1 className={`text-base sm:text-[17px] font-semibold font-sans tracking-tight truncate ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
          {pageTitle}
        </h1>
        {activeColorDef && (
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: activeColorDef.hex }}
            title={`Day rating: ${activeColorDef.label}`}
          />
        )}
      </div>

      {/* Right controls: Date Picker */}
      <div className="flex items-center gap-2">
        {/* Date Navigator */}
        <div className={`flex items-center gap-0.5 px-1.5 py-1 rounded-md border ${
          isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-[#f3f1fb] border-[#e7e4f4]'
        }`}>
          <button
            type="button"
            onClick={handlePrevDay}
            className="p-1 rounded text-[#6b6882] dark:text-[#8d8aab] hover:text-[#18172b] dark:hover:text-[#ece9fb] transition-colors cursor-pointer"
            title="Previous day"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-3.5 h-3.5 stroke-[1.75]" />
          </button>

          <span className="text-xs sm:text-[13px] font-sans font-medium tabular-nums px-1.5 select-none min-w-[90px] sm:min-w-[110px] text-center truncate text-[#18172b] dark:text-[#ece9fb]">
            {formattedDate}
          </span>

          <button
            type="button"
            onClick={handleNextDay}
            className="p-1 rounded text-[#6b6882] dark:text-[#8d8aab] hover:text-[#18172b] dark:hover:text-[#ece9fb] transition-colors cursor-pointer"
            title="Next day"
            aria-label="Next day"
          >
            <ChevronRight className="w-3.5 h-3.5 stroke-[1.75]" />
          </button>

          {!isToday && (
            <button
              type="button"
              onClick={handleToday}
              className={`text-xs font-sans font-medium px-2 py-0.5 rounded cursor-pointer ml-1 transition-colors ring-[1.5px] ${
                isDark 
                  ? 'ring-[#8b7bff] text-[#8b7bff] hover:bg-[#8b7bff]/15' 
                  : 'ring-[#7c5ef0] text-[#7c5ef0] hover:bg-[#7c5ef0]/10'
              }`}
            >
              Today
            </button>
          )}
        </div>

        {/* Release Notes Badge */}
        {onOpenReleaseNotes && (
          <button
            type="button"
            onClick={onOpenReleaseNotes}
            className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono border transition-all cursor-pointer ${
              isDark 
                ? 'bg-[#131320] border-white/[0.08] hover:border-[#8b7bff]/50 text-[#ece9fb]' 
                : 'bg-[#f3f1fb] border-[#e7e4f4] hover:border-[#7c5ef0]/50 text-[#18172b]'
            }`}
            title="Axis v1.2.0 Updates & Release Notes"
          >
            <Sparkles className="w-3 h-3 text-[#8b7bff]" />
            <span className="font-semibold">v1.2.0</span>
          </button>
        )}

        {/* Contribute on GitHub Button */}
        {onOpenContribute && (
          <button
            type="button"
            onClick={onOpenContribute}
            className={`p-1.5 rounded-md border transition-all cursor-pointer ${
              isDark 
                ? 'bg-[#131320] border-white/[0.08] hover:border-[#8b7bff]/50 text-[#ece9fb]' 
                : 'bg-[#f3f1fb] border-[#e7e4f4] hover:border-[#7c5ef0]/50 text-[#18172b]'
            }`}
            title="Contribute to Axis on GitHub"
            aria-label="Contribute to Axis on GitHub"
          >
            <Github className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
