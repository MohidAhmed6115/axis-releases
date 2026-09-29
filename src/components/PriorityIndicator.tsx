import React from 'react';

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

interface PriorityIndicatorProps {
  priority: TaskPriority;
  showLabel?: boolean;
  className?: string;
}

/**
 * Neutral Task Priority Indicator:
 * Adheres strictly to the Color Discipline Principle:
 * Red, Orange, Yellow, Green, and Gold are reserved exclusively for Day Evaluation & Streaks.
 * Task Priority uses a 4-level grayscale density & dot indicator:
 * - Urgent: 3 solid dots, high-contrast pure white/slate-950 font & filled background
 * - High: 2 solid dots, prominent zinc-200/slate-700
 * - Medium: 1 solid dot, balanced zinc-400/slate-500
 * - Low: Outlined hollow circle, subtle muted zinc-600/slate-400
 */
export const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({ 
  priority, 
  showLabel = true,
  className = ""
}) => {
  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider uppercase border select-none ${
        priority === 'urgent'
          ? 'bg-zinc-200 text-zinc-950 border-zinc-300 font-bold dark:bg-zinc-100 dark:text-zinc-950 dark:border-white'
          : priority === 'high'
          ? 'bg-zinc-800 text-zinc-200 border-zinc-700 font-semibold dark:bg-white/10 dark:text-zinc-200 dark:border-white/20'
          : priority === 'medium'
          ? 'bg-zinc-900/60 text-zinc-400 border-zinc-800 font-medium dark:bg-white/[0.04] dark:text-zinc-400 dark:border-white/10'
          : 'bg-transparent text-zinc-500 border-zinc-800/80 font-normal dark:text-zinc-500 dark:border-white/[0.06]'
      } ${className}`}
      title={`Priority: ${priority}`}
    >
      {/* Visual Dot Levels */}
      <span className="flex items-center gap-0.5 shrink-0" aria-hidden="true">
        {priority === 'urgent' && (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
          </>
        )}
        {priority === 'high' && (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full border border-current opacity-30" />
          </>
        )}
        {priority === 'medium' && (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full border border-current opacity-30" />
            <span className="w-1.5 h-1.5 rounded-full border border-current opacity-30" />
          </>
        )}
        {priority === 'low' && (
          <>
            <span className="w-1.5 h-1.5 rounded-full border border-current opacity-50" />
            <span className="w-1.5 h-1.5 rounded-full border border-current opacity-20" />
            <span className="w-1.5 h-1.5 rounded-full border border-current opacity-20" />
          </>
        )}
      </span>

      {showLabel && <span>{priority}</span>}
    </span>
  );
};

/**
 * Clean Unboxed Priority Dot for compact mobile rows:
 * Adheres to Zero Pill / Anti-AI Slop discipline:
 * Renders pure neutral dot indicators without border enclosures or badge capsules.
 */
export const PriorityDot: React.FC<{ priority: TaskPriority; className?: string }> = ({
  priority,
  className = ""
}) => {
  return (
    <span 
      className={`inline-flex items-center gap-0.5 shrink-0 select-none ${className}`}
      title={`Priority: ${priority}`}
      aria-label={`Priority: ${priority}`}
    >
      {priority === 'urgent' && (
        <span className="flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-white" />
          <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-white" />
          <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-white" />
        </span>
      )}
      {priority === 'high' && (
        <span className="flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-300" />
          <span className="w-1.5 h-1.5 rounded-full border border-zinc-500/40" />
        </span>
      )}
      {priority === 'medium' && (
        <span className="flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-400" />
          <span className="w-1.5 h-1.5 rounded-full border border-zinc-500/30" />
          <span className="w-1.5 h-1.5 rounded-full border border-zinc-500/30" />
        </span>
      )}
      {priority === 'low' && (
        <span className="flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full border border-zinc-500/60 dark:border-zinc-500/70" />
          <span className="w-1.5 h-1.5 rounded-full border border-zinc-500/20" />
          <span className="w-1.5 h-1.5 rounded-full border border-zinc-500/20" />
        </span>
      )}
    </span>
  );
};

