import React, { useState, useRef } from 'react';
import { TaskItem, Habit, SWIPE_SENSITIVITY_THRESHOLDS, SwipeTaskAction } from '../types';
import { useApp } from '../context/AppContext';
import { PriorityDot, PriorityIndicator } from './PriorityIndicator';
import { Check, Trash2, Calendar, Repeat, ChevronDown, ChevronUp, Eye, Undo2 } from 'lucide-react';

interface MobileTaskRowProps {
  task: TaskItem;
  habits: Habit[];
  selectedDate: string;
  isDark: boolean;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export function formatCompactDue(dueDate?: string, dueTime?: string, selectedDate?: string): string | null {
  if (!dueDate && !dueTime) return null;

  let timeFormatted = '';
  if (dueTime) {
    try {
      const [hStr, mStr] = dueTime.split(':');
      const h = Number(hStr);
      const m = Number(mStr);
      const period = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      timeFormatted = `${hour12}:${String(m).padStart(2, '0')} ${period}`;
    } catch {
      timeFormatted = dueTime;
    }
  }

  if (!dueDate) {
    return timeFormatted || null;
  }

  // Check today / tomorrow relative to local date
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  let datePrefix = '';
  if (dueDate === todayStr) {
    datePrefix = 'Today';
  } else if (dueDate === tomorrowStr) {
    datePrefix = 'Tmrw';
  } else {
    try {
      const parts = dueDate.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      datePrefix = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      datePrefix = dueDate;
    }
  }

  if (datePrefix && timeFormatted) {
    return `${datePrefix} ${timeFormatted}`;
  }
  return datePrefix || timeFormatted || null;
}

export const MobileTaskRow: React.FC<MobileTaskRowProps> = ({
  task,
  habits,
  selectedDate,
  isDark,
  onToggle,
  onDelete
}) => {
  const { swipeGestureSettings } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [activeSide, setActiveSide] = useState<'left' | 'right' | null>(null);

  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const hasHapticTriggeredRef = useRef(false);

  const dueLabel = formatCompactDue(task.dueDate, task.dueTime, selectedDate);
  const linkedHabit = habits.find(h => h.id === task.linkedHabitId);

  const leftAction = swipeGestureSettings?.enabled ? swipeGestureSettings.leftSwipeAction : 'none';
  const rightAction = swipeGestureSettings?.enabled ? swipeGestureSettings.rightSwipeAction : 'none';
  const sensitivityCfg = SWIPE_SENSITIVITY_THRESHOLDS[swipeGestureSettings?.sensitivity || 'normal'];
  const maxReveal = 74;
  const triggerThreshold = Math.max(28, (sensitivityCfg?.thresholdPx || 60) * 0.65);

  const executeAction = (action: SwipeTaskAction) => {
    handleCloseSwipe();
    if (action === 'delete') {
      onDelete(task.id);
    } else if (action === 'complete') {
      onToggle(task.id);
    } else if (action === 'expand') {
      setIsExpanded(prev => !prev);
    }
  };

  // Touch & Pointer gesture handling
  const handleStart = (clientX: number, clientY?: number) => {
    if (!swipeGestureSettings?.enabled) return;
    startXRef.current = clientX;
    startYRef.current = clientY ?? null;
    isDraggingRef.current = true;
    isHorizontalSwipeRef.current = null;
    hasHapticTriggeredRef.current = false;
  };

  const handleMove = (clientX: number, clientY?: number) => {
    if (!isDraggingRef.current || startXRef.current === null) return;
    const diffX = clientX - startXRef.current;

    // Check vertical scroll lock on touch devices
    if (clientY !== undefined && startYRef.current !== null && isHorizontalSwipeRef.current === null) {
      const diffY = clientY - startYRef.current;
      if (Math.abs(diffY) > 8 && Math.abs(diffY) > Math.abs(diffX)) {
        // Vertical scroll dominant, abort horizontal swipe
        isDraggingRef.current = false;
        return;
      }
      if (Math.abs(diffX) > 8) {
        isHorizontalSwipeRef.current = true;
      }
    }

    if (activeSide === 'left') {
      // Swiping right from left-revealed state (-maxReveal)
      const newOffset = Math.max(-maxReveal, Math.min(0, -maxReveal + diffX));
      setSwipeOffset(newOffset);
    } else if (activeSide === 'right') {
      // Swiping left from right-revealed state (+maxReveal)
      const newOffset = Math.min(maxReveal, Math.max(0, maxReveal + diffX));
      setSwipeOffset(newOffset);
    } else {
      // Swiping from center (0px)
      if (diffX < 0 && leftAction !== 'none') {
        // Dragging left (reveals right action)
        const newOffset = Math.max(-maxReveal, diffX);
        setSwipeOffset(newOffset);
      } else if (diffX > 0 && rightAction !== 'none') {
        // Dragging right (reveals left action)
        const newOffset = Math.min(maxReveal, diffX);
        setSwipeOffset(newOffset);
      }
    }

    // Trigger haptic feedback if threshold crossed
    if (
      swipeGestureSettings?.hapticFeedback &&
      !hasHapticTriggeredRef.current &&
      typeof navigator !== 'undefined' &&
      navigator.vibrate
    ) {
      if (Math.abs(diffX) >= triggerThreshold) {
        try {
          navigator.vibrate(14);
          hasHapticTriggeredRef.current = true;
        } catch {}
      }
    }
  };

  const handleEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (swipeOffset <= -triggerThreshold && leftAction !== 'none') {
      setSwipeOffset(-maxReveal);
      setActiveSide('left');
    } else if (swipeOffset >= triggerThreshold && rightAction !== 'none') {
      setSwipeOffset(maxReveal);
      setActiveSide('right');
    } else {
      setSwipeOffset(0);
      setActiveSide(null);
    }
    startXRef.current = null;
    startYRef.current = null;
    isHorizontalSwipeRef.current = null;
  };

  const handleCloseSwipe = () => {
    setSwipeOffset(0);
    setActiveSide(null);
  };

  const renderActionContent = (action: SwipeTaskAction) => {
    switch (action) {
      case 'delete':
        return (
          <div className="flex flex-col items-center gap-0.5 text-white">
            <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Delete</span>
          </div>
        );
      case 'complete':
        return (
          <div className="flex flex-col items-center gap-0.5 text-white">
            {task.completed ? <Undo2 className="w-3.5 h-3.5 stroke-[2]" /> : <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span className="text-[9px] font-bold uppercase tracking-wider">{task.completed ? 'Undo' : 'Done'}</span>
          </div>
        );
      case 'expand':
        return (
          <div className="flex flex-col items-center gap-0.5 text-white">
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 stroke-[2]" /> : <Eye className="w-3.5 h-3.5 stroke-[2]" />}
            <span className="text-[9px] font-bold uppercase tracking-wider">{isExpanded ? 'Less' : 'Details'}</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getActionBg = (action: SwipeTaskAction) => {
    switch (action) {
      case 'delete':
        return 'bg-rose-600 active:bg-rose-700';
      case 'complete':
        return 'bg-emerald-600 active:bg-emerald-700';
      case 'expand':
        return 'bg-[#7c5ef0] active:bg-[#6c4ee0]';
      default:
        return 'bg-zinc-700';
    }
  };

  return (
    <div className="relative overflow-hidden select-none border-b border-inherit border-opacity-10 last:border-b-0">
      {/* Background Left Revealed Action (Triggered by Swiping Right) */}
      {rightAction !== 'none' && (
        <div 
          className={`absolute inset-y-0 left-0 w-[74px] ${getActionBg(rightAction)} flex items-center justify-center cursor-pointer transition-colors z-0`}
          onClick={() => executeAction(rightAction)}
          title={`Action: ${rightAction}`}
        >
          {renderActionContent(rightAction)}
        </div>
      )}

      {/* Background Right Revealed Action (Triggered by Swiping Left) */}
      {leftAction !== 'none' && (
        <div 
          className={`absolute inset-y-0 right-0 w-[74px] ${getActionBg(leftAction)} flex items-center justify-center cursor-pointer transition-colors z-0`}
          onClick={() => executeAction(leftAction)}
          title={`Action: ${leftAction}`}
        >
          {renderActionContent(leftAction)}
        </div>
      )}

      {/* Foreground Task Row */}
      <div
        className={`relative z-10 transition-transform duration-150 flex flex-col ${
          isDark 
            ? 'bg-[#121822] hover:bg-[#151c27]' 
            : 'bg-white hover:bg-slate-50'
        }`}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handleEnd}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => isDraggingRef.current && handleMove(e.clientX)}
        onMouseUp={handleEnd}
      >
        {/* Single compact row: 42px height, 5-6 tasks fit easily */}
        <div className="h-10.5 sm:h-11 px-3 flex items-center gap-2.5">
          {/* 1. Checkbox */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task.id);
            }}
            className={`w-4 h-4 rounded shrink-0 flex items-center justify-center transition-all cursor-pointer ${
              task.completed
                ? 'bg-zinc-700 text-white'
                : 'border border-white/30 dark:border-white/20 hover:border-white/50 text-transparent'
            }`}
            aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
          >
            <Check className={`w-3 h-3 stroke-[2.5] ${task.completed ? 'opacity-100' : 'opacity-0'}`} />
          </button>

          {/* 2. Title: single line, truncated with ellipsis, never wraps. Tap to expand. */}
          <div 
            className="flex-1 min-w-0 flex items-center gap-1.5 cursor-pointer overflow-hidden"
            onClick={() => {
              if (activeSide !== null) {
                handleCloseSwipe();
              } else {
                setIsExpanded(!isExpanded);
              }
            }}
          >
            <span 
              className={`text-xs font-medium truncate block whitespace-nowrap ${
                task.completed 
                  ? 'text-zinc-500 line-through' 
                  : isDark ? 'text-zinc-200' : 'text-slate-800'
              }`}
            >
              {task.title}
            </span>

            {task.isRecurring && (
              <span title="Recurring task" className="inline-flex shrink-0">
                <Repeat className="w-2.5 h-2.5 text-zinc-500" />
              </span>
            )}

            {task.calendarEventId && (
              <span title="Synced to Google Calendar" className="inline-flex shrink-0">
                <Calendar className="w-2.5 h-2.5 text-zinc-500" />
              </span>
            )}
          </div>

          {/* 3. Small Priority Dot (not a full badge) */}
          <div className="shrink-0 flex items-center">
            <PriorityDot priority={task.priority} />
          </div>

          {/* 4. Compact Due Date / Time ("Today 9:30 PM", "Tmrw 10:00 AM") */}
          {dueLabel && (
            <span className="text-[10px] font-mono text-zinc-400 shrink-0 whitespace-nowrap pl-0.5">
              {dueLabel}
            </span>
          )}

          {/* Expand chevron toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer shrink-0"
            aria-label={isExpanded ? "Collapse task details" : "Expand task details"}
          >
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Expanded Details Drawer */}
        {isExpanded && (
          <div className={`px-3 pb-3 pt-1.5 text-xs border-t ${
            isDark ? 'border-white/[0.04] bg-black/20 text-zinc-300' : 'border-slate-100 bg-slate-50 text-slate-700'
          }`}>
            <div className="font-semibold text-xs leading-snug break-words">
              {task.title}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                Priority: <PriorityIndicator priority={task.priority} showLabel={true} />
              </span>

              {task.dueDate && (
                <span>
                  Due: <span className="font-mono text-zinc-300">{task.dueDate} {task.dueTime ? `@ ${task.dueTime}` : ''}</span>
                </span>
              )}

              {linkedHabit && (
                <span>
                  Habit: <span className="text-zinc-300 font-medium">{linkedHabit.name}</span>
                </span>
              )}

              {task.calendarEventId && (
                <span className="text-emerald-400/90 font-mono text-[10px] inline-flex items-center gap-1">
                  ✓ GCal Synced
                </span>
              )}
            </div>

            {/* Quick action bar */}
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-inherit border-opacity-10">
              <span className="text-[10px] text-zinc-500 font-mono">
                {swipeGestureSettings?.enabled 
                  ? `Swipe ← for ${leftAction} · Swipe → for ${rightAction}` 
                  : 'Gestures off (enable in Settings)'}
              </span>

              <button
                type="button"
                onClick={() => onDelete(task.id)}
                className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
