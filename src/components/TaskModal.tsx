import React, { useState, useEffect } from 'react';
import { Habit, TaskItem } from '../types';
import { X, Calendar, Clock, Repeat, Flame } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Omit<TaskItem, 'id' | 'order' | 'completed' | 'createdAt'>) => Promise<void>;
  habits: Habit[];
  defaultDate: string;
  defaultCalendarSync: boolean;
  isDark: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  habits,
  defaultDate,
  defaultCalendarSync,
  isDark
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal / Bottom Sheet Card */}
      <div 
        className={`relative z-10 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 sm:p-5 transition-all max-h-[90vh] overflow-y-auto ${
          isDark ? 'bg-[#0f141c] border border-white/10 text-zinc-200' : 'bg-white border border-slate-200 text-slate-800'
        }`}
      >
        {/* Bottom sheet drag bar for mobile */}
        <div className="w-10 h-1 bg-zinc-600/40 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-inherit border-opacity-10 mb-3">
          <div>
            <h3 className={`text-sm sm:text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              New Task Item
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Define priority, timing, and calendar synchronization.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-white cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
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
              placeholder="e.g. Finalize Q3 quarterly revenue report"
              className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-white/30 ${
                isDark ? 'bg-[#141b26] text-white border border-white/10' : 'bg-slate-100 text-slate-900 border border-slate-200'
              }`}
            />
          </div>

          {/* Priority & Habit Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none ${
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
                Link to Habit Routine
              </label>
              <select
                value={linkedHabitId}
                onChange={(e) => setLinkedHabitId(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none ${
                  isDark ? 'bg-[#141b26] text-zinc-200 border border-white/10' : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                <option value="">Independent (No habit linked)</option>
                {habits.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2.5">
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

          {/* Options: Recurring & Google Calendar Auto-sync (Plain rows, NO border lines, toggle switch on right) */}
          <div className="pt-1 space-y-2">
            {/* Recurring toggle */}
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

            {/* Google Calendar sync toggle */}
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

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-inherit border-opacity-10">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer text-xs"
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
              {submitting ? 'Adding...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
