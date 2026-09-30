import React, { useState } from 'react';
import { Habit, TaskItem } from '../types';
import { Calendar, Clock, Repeat, Check, X } from 'lucide-react';

interface InlineTaskEditRowProps {
  task: TaskItem;
  habits: Habit[];
  isDark: boolean;
  onSave: (updatedTask: TaskItem) => Promise<void>;
  onCancel: () => void;
}

export const InlineTaskEditRow: React.FC<InlineTaskEditRowProps> = ({
  task,
  habits,
  isDark,
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [dueTime, setDueTime] = useState(task.dueTime || '');
  const [linkedHabitId, setLinkedHabitId] = useState(task.linkedHabitId || '');
  const [isRecurring, setIsRecurring] = useState(!!task.isRecurring);
  const [addToCalendar, setAddToCalendar] = useState(!!(task.calendarEventId || task.addToCalendar));
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSave({
        ...task,
        title: title.trim(),
        priority,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        linkedHabitId: linkedHabitId || undefined,
        isRecurring,
        addToCalendar: addToCalendar && !!(dueDate && dueTime),
        // If calendar toggle is turned off, calendarEventId will be cleaned up in AppContext updateTask
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <tr className={`${isDark ? 'bg-[#0f141c]' : 'bg-slate-50'} transition-all`}>
      <td colSpan={6} className="p-3 sm:p-4 border-y border-inherit border-opacity-20">
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs max-w-3xl">
          {/* Header indicator */}
          <div className="flex items-center justify-between pb-2 border-b border-inherit border-opacity-10">
            <span className={`text-[11px] font-semibold uppercase tracking-wider font-mono ${
              isDark ? 'text-emerald-400' : 'text-emerald-700'
            }`}>
              Editing Task
            </span>
            <span className="text-[10px] text-zinc-500">
              Press Escape or Cancel to discard changes
            </span>
          </div>

          {/* 1. Title */}
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
                isDark 
                  ? 'bg-[#141b26] text-white border border-white/10 placeholder:text-zinc-600' 
                  : 'bg-white text-slate-900 border border-slate-200 placeholder:text-slate-400'
              }`}
            />
          </div>

          {/* 2. Priority & Routine Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Priority Tier
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className={`w-full rounded-xl px-2.5 py-2 text-xs focus:outline-none ${
                  isDark 
                    ? 'bg-[#141b26] text-zinc-200 border border-white/10' 
                    : 'bg-white text-slate-800 border border-slate-200'
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
                  isDark 
                    ? 'bg-[#141b26] text-zinc-200 border border-white/10' 
                    : 'bg-white text-slate-800 border border-slate-200'
                }`}
              >
                <option value="">Independent (No habit)</option>
                {habits.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Date & Time */}
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
                  isDark 
                    ? 'bg-[#141b26] text-zinc-200 border border-white/10' 
                    : 'bg-white text-slate-800 border border-slate-200'
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
                  isDark 
                    ? 'bg-[#141b26] text-zinc-200 border border-white/10' 
                    : 'bg-white text-slate-800 border border-slate-200'
                }`}
              />
            </div>
          </div>

          {/* 4. Boolean Options: Clean plain rows, NO border lines, toggle switches on the right */}
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

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-inherit border-opacity-10">
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 rounded-xl font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className={`px-4 py-1.5 rounded-xl font-semibold text-xs cursor-pointer transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5 ${
                isDark 
                  ? 'bg-white text-zinc-950 hover:bg-zinc-200' 
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[2.25]" />
              <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
};
