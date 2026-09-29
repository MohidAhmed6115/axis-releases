import React from 'react';
import { PrayerStatus } from '../types';

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Solo Prayer Icon
 * Original single-weight outline SVG of ONE person standing in prayer posture (Qiyam),
 * hands folded across the front.
 */
export const SoloPrayerIcon: React.FC<IconProps> = ({ 
  className = 'w-6 h-6',
  size 
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size || 24}
      height={size || 24}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Head */}
      <circle cx="12" cy="4.5" r="2.2" />
      {/* Shoulders */}
      <path d="M 8.5 9.5 C 9.5 8.5 14.5 8.5 15.5 9.5" />
      {/* Upper Arms */}
      <path d="M 8.5 9.5 L 8 13" />
      <path d="M 15.5 9.5 L 16 13" />
      {/* Hands folded across front in Qiyam */}
      <path d="M 8 13 L 11 13.5" />
      <path d="M 16 13 L 13 13.5" />
      <path d="M 10 13.5 L 14 13.5" />
      {/* Robe / Body extending to floor */}
      <path d="M 8.75 13.5 L 8.25 21" />
      <path d="M 15.25 13.5 L 15.75 21" />
      {/* Hem */}
      <path d="M 8.25 21 L 15.75 21" />
    </svg>
  );
};

/**
 * Bajamat Prayer Icon
 * Original single-weight outline SVG of THREE people praying side by side,
 * with the imam in the centre slightly ahead (larger and lower in perspective),
 * and two followers on either side slightly behind.
 * Drawn on a 40x24 viewBox and rendered >= 28px wide.
 */
export const BajamatPrayerIcon: React.FC<IconProps> = ({ 
  className = 'w-8 h-6',
  size 
}) => {
  return (
    <svg
      viewBox="0 0 40 24"
      width={size ? (size * 40) / 24 : 34}
      height={size || 22}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Left Follower (Muqtadi) - slightly behind & higher */}
      <circle cx="8.5" cy="4" r="1.8" />
      <path d="M 5.5 8 C 6.5 7.2 10.5 7.2 11.5 8" />
      <path d="M 5.5 8 L 5 11.5" />
      <path d="M 11.5 8 L 12 11.5" />
      <path d="M 5 11.5 L 12 11.5" />
      <path d="M 6 11.5 L 5.5 18" />
      <path d="M 11 11.5 L 11.5 18" />
      <path d="M 5.5 18 L 11.5 18" />

      {/* Right Follower (Muqtadi) - slightly behind & higher */}
      <circle cx="31.5" cy="4" r="1.8" />
      <path d="M 28.5 8 C 29.5 7.2 33.5 7.2 34.5 8" />
      <path d="M 28.5 8 L 28 11.5" />
      <path d="M 34.5 8 L 35 11.5" />
      <path d="M 28 11.5 L 35 11.5" />
      <path d="M 29 11.5 L 28.5 18" />
      <path d="M 34 11.5 L 34.5 18" />
      <path d="M 28.5 18 L 34.5 18" />

      {/* Imam (Centre) - slightly ahead, lower and larger */}
      <circle cx="20" cy="5.5" r="2.2" />
      <path d="M 16.5 10.5 C 17.5 9.5 22.5 9.5 23.5 10.5" />
      <path d="M 16.5 10.5 L 16 14" />
      <path d="M 23.5 10.5 L 24 14" />
      <path d="M 16 14 L 18.5 14.5" />
      <path d="M 24 14 L 21.5 14.5" />
      <path d="M 18 14.5 L 22 14.5" />
      <path d="M 17 14.5 L 16.5 22" />
      <path d="M 23 14.5 L 23.5 22" />
      <path d="M 16.5 22 L 23.5 22" />
    </svg>
  );
};

interface PrayerToggleGroupProps {
  status: PrayerStatus;
  onChange: (nextStatus: PrayerStatus) => void;
  disabled?: boolean;
  className?: string;
  size?: 'normal' | 'compact';
}

/**
 * Mutually exclusive Solo / Bajamat toggle pair.
 * Follows Axis design system: neutral surface styling, monochrome outline,
 * inverted neutral fill when selected, touch target >= 44px on mobile.
 */
export const PrayerToggleGroup: React.FC<PrayerToggleGroupProps> = ({
  status,
  onChange,
  disabled = false,
  className = '',
  size = 'normal'
}) => {
  const isSolo = status === 'solo';
  const isBajamat = status === 'bajamat';

  const handleSoloClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(isSolo ? 'none' : 'solo');
  };

  const handleBajamatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(isBajamat ? 'none' : 'bajamat');
  };

  const padClass = size === 'compact' 
    ? 'min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] p-1.5' 
    : 'min-w-[44px] min-h-[44px] sm:min-w-[42px] sm:min-h-[42px] px-2.5 py-1.5';

  return (
    <div className={`inline-flex items-center gap-1.5 sm:gap-2 ${className}`}>
      {/* Solo Toggle */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleSoloClick}
        aria-label="Prayed alone (solo)"
        title="Prayed alone (solo)"
        aria-pressed={isSolo}
        className={`flex items-center justify-center rounded-md border transition-all cursor-pointer select-none ${padClass} ${
          isSolo
            ? 'bg-[#18172b] text-[#ffffff] border-[#18172b] dark:bg-[#ece9fb] dark:text-[#0a0a0f] dark:border-[#ece9fb] shadow-xs'
            : 'bg-transparent text-[#7d7a96] border-[#e7e4f4] dark:border-white/[0.08] hover:text-[#18172b] dark:hover:text-[#ece9fb] hover:border-[#8b7bff]/40'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        <SoloPrayerIcon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
      </button>

      {/* Bajamat Toggle */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleBajamatClick}
        aria-label="Prayed in congregation (bajamat)"
        title="Prayed in congregation (bajamat)"
        aria-pressed={isBajamat}
        className={`flex items-center justify-center rounded-md border transition-all cursor-pointer select-none ${padClass} ${
          isBajamat
            ? 'bg-[#18172b] text-[#ffffff] border-[#18172b] dark:bg-[#ece9fb] dark:text-[#0a0a0f] dark:border-[#ece9fb] shadow-xs'
            : 'bg-transparent text-[#7d7a96] border-[#e7e4f4] dark:border-white/[0.08] hover:text-[#18172b] dark:hover:text-[#ece9fb] hover:border-[#8b7bff]/40'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        <BajamatPrayerIcon className="w-7 h-5 sm:w-8 sm:h-5 shrink-0" />
      </button>
    </div>
  );
};
