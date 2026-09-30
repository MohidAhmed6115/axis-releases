import React, { useState, useEffect } from 'react';
import { Habit, TaskItem } from '../types';
import { X, Calendar, Clock, Repeat, ArrowRight } from 'lucide-react';

interface TaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Omit<TaskItem, 'id' | 'order' | 'completed' | 'createdAt'>) => Promise<void>;
  habits: Habit[];
  defaultDate: string;
  defaultCalendarSync: boolean;
  isDark: boolean;
  isMobile: boolean;
}

export const TaskDrawer: React.FC<TaskDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  habits,
  defaultDate,
  defaultCalendarSync,
  isDark,
  isMobile
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState(defaultDate);
  const [dueTime, setDueTime] = useState('');
  const [linkedHabitId, setLinkedHabitId] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [addToCalendar, setAddToCalendar] = useState(defaultCalendarSync);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setPriority('medium');
      setDueDate(defaultDate);
      setDueTime('');
      setLinkedHabitId('');
      setIsRecurring(false);
      setAddToCalendar(defaultCalendarSync);
      setSubmitting(false);
    }
  }, [isOpen, defaultDate, defaultCalendarSync]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        priority,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        linkedHabitId: linkedHabitId || undefined,
        isRecurring,
        addToCalendar: addToCalendar && !!(dueDate && dueTime)
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Non-blocking backdrop: task list remains visible and dimmed behind it */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-[0.5px] transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Container: Mobile Bottom Sheet (<640px or isMobile) vs Desktop Right Slide-in Side Panel */}
      <div
        className={`fixed z-50 flex flex-col transition-all duration-200 ease-out shadow-2xl ${
          isMobile
            ? 'bottom-0 left-0 right-0 w-full max-h-[88vh] rounded-t-2xl border-t'
            : 'top-0 right-0 bottom-0 w-full sm:w-[440px] md:w-[460px] h-full border-l'
        } ${
          isDark 
            ? 'bg-[#0f141c] border-white/10 text-zinc-200' 
            : 'bg-white border-slate-200 text-slate-800'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-task-drawer-title"
      >
        {/* Mobile drag handle bar */}
        {isMobile && (
          <div className="w-10 h-1 bg-zinc-600/40 rounded-full mx-auto my-2.5 shrink-0" />
        )}

        {/* Panel Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-inherit border-opacity-10 shrink-0">
          <div>
            <h2 id="new-task-drawer-title" className={`text-sm sm:text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              New Task Item
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Specify priority, timing, and routine linkage.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white transition-colors cursor-pointer"
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Finalize quarterly financial review"
              className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-white/30 transition-all ${
                isDark ? 'bg-[#141b26] text-white border border-white/10 placeholder:text-zinc-600' : 'bg-slate-100 text-slate-900 border border-slate-200 placeholder:text-slate-400'
              }`}
            />
          </div>

          {/* Priority & Routine Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Priority Tier
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className={`w-full rounded-xl px-2.5 py-2 text-xs focus:outline-none ${
                  isDark ? 'bg-[#141b26] text-zinc-200 border border-white/10' : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                <option value="urgent">Urgent (Highest focus)</option>
                <option value="high">High priority</option>
                <option value="medium">Medium standard</option>
                <option value="low">Low background</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Link to Habit
              </label>
              <select
                value={linkedHabitId}
                onChange={(e) => setLinkedHabitId(e.target.value)}
                className={`w-full rounded-xl px-2.5 py-2 text-xs focus:outline-none ${
                  isDark ? 'bg-[#141b26] text-zinc-200 border border-white/10' : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                <option value="">Independent (No habit)</option>
                {habits.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-zinc-500" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full rounded-xl px-2.5 py-1.5 text-xs focus:outline-none ${
                  isDark ? 'bg-[#141b26] text-zinc-200 border border-white/10' : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-500" />
                Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className={`w-full rounded-xl px-2.5 py-1.5 text-xs focus:outline-none ${
                  isDark ? 'bg-[#141b26] text-zinc-200 border border-white/10' : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              />
            </div>
          </div>

          {/* 3. Boolean Options: Clean plain rows, NO border lines, toggle switches on the right */}
          <div className="pt-1 space-y-2">
            {/* Option 1: Recurring Task */}
            <div className="flex items-center justify-between gap-4 py-1">
              <div className="min-w-0 pr-2">
                <span className={`font-medium text-xs block ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                  Recurring Task
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5 leading-snug block">
                  Automatically renews on your schedule
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isRecurring}
                onClick={() => setIsRecurring(!isRecurring)}
                className={`w-9 h-5 rounded-full p-[2px] transition-colors cursor-pointer shrink-0 relative focus:outline-none ${
                  isRecurring ? 'bg-emerald-500' : isDark ? 'bg-zinc-700' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out pointer-events-none ${
                    isRecurring ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Option 2: Add to Google Calendar */}
            <div className="flex items-center justify-between gap-4 py-1">
              <div className="min-w-0 pr-2">
                <span className={`font-medium text-xs block ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                  Add to Google Calendar
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5 leading-snug block">
                  {dueDate && dueTime
                    ? 'Synchronizes as a 30m event on your calendar'
                    : 'Requires both Due Date and Due Time to synchronize'}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={addToCalendar}
                disabled={!dueDate || !dueTime}
                onClick={() => {
                  if (dueDate && dueTime) {
                    setAddToCalendar(!addToCalendar);
                  }
                }}
                className={`w-9 h-5 rounded-full p-[2px] transition-colors shrink-0 relative focus:outline-none ${
                  !dueDate || !dueTime
                    ? 'opacity-40 cursor-not-allowed bg-zinc-800'
                    : addToCalendar
                    ? 'bg-emerald-500 cursor-pointer'
                    : isDark
                    ? 'bg-zinc-700 cursor-pointer'
                    : 'bg-slate-300 cursor-pointer'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out pointer-events-none ${
                    addToCalendar && dueDate && dueTime ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-inherit border-opacity-10">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className={`px-4 py-1.5 rounded-xl font-semibold text-xs cursor-pointer transition-colors shadow-sm disabled:opacity-50 ${
                isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
