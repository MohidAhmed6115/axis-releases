import React, { useState, useEffect } from 'react';
import { Habit, TaskItem } from '../types';
import { Calendar, Clock, Plus, Check, X } from 'lucide-react';

interface InlineNewTaskPanelProps {
  habits: Habit[];
  selectedDate: string;
  defaultCalendarSync: boolean;
  isDark: boolean;
  onSubmit: (taskData: Omit<TaskItem, 'id' | 'order' | 'completed' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
}

export const InlineNewTaskPanel: React.FC<InlineNewTaskPanelProps> = ({
  habits,
  selectedDate,
  defaultCalendarSync,
  isDark,
  onSubmit,
  onCancel
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState(selectedDate);
  const [dueTime, setDueTime] = useState('');
  const [linkedHabitId, setLinkedHabitId] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [addToCalendar, setAddToCalendar] = useState(defaultCalendarSync);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setDueDate(selectedDate);
  }, [selectedDate]);

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
      setTitle('');
      setPriority('medium');
      setDueTime('');
      setLinkedHabitId('');
      setIsRecurring(false);
    } finally {
      setSubmitting(false);
    }
  };

  const brandAccent = isDark ? '#8b7bff' : '#7c5ef0';

  return (
    <div className={`p-3.5 sm:p-4 rounded-lg border transition-all ${
      isDark 
        ? 'bg-[#131320] border-white/[0.08]' 
        : 'bg-white border-[#e7e4f4]'
    }`}>
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-inherit border-opacity-10 mb-3 font-mono">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-md ${isDark ? 'bg-[#8b7bff]/15 text-[#8b7bff]' : 'bg-[#7c5ef0]/15 text-[#7c5ef0]'}`}>
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className={`text-xs sm:text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
              New Action Item
            </h3>
            <p className="text-[10px] text-[#7d7a96] normal-case font-sans">
              Define priority, timing, and calendar synchronization inline.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded-md text-[#7d7a96] hover:text-[#ece9fb] transition-colors cursor-pointer"
          title="Cancel"
          aria-label="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-3 text-xs font-mono">
        {/* 1. Title */}
        <div>
          <label className="block text-[10px] uppercase font-semibold text-[#7d7a96] mb-1">
            Action Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Prepare presentation slides for sync meeting"
            className={`w-full rounded-md px-3 py-1.5 text-xs focus:outline-none placeholder:text-[#7d7a96] ${
              isDark 
                ? 'bg-[#0a0a0f] text-[#ece9fb] border border-white/[0.08] focus:border-[#8b7bff]' 
                : 'bg-[#f9f8fd] text-[#18172b] border border-[#e7e4f4] focus:border-[#7c5ef0]'
            }`}
          />
        </div>

        {/* 2. Priority & Routine Link */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[10px] uppercase font-semibold text-[#7d7a96] mb-1">
              Priority Tier
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className={`w-full rounded-md px-2.5 py-1.5 text-xs focus:outline-none ${
                isDark 
                  ? 'bg-[#0a0a0f] text-[#ece9fb] border border-white/[0.08]' 
                  : 'bg-[#f9f8fd] text-[#18172b] border border-[#e7e4f4]'
              }`}
            >
              <option value="urgent">Urgent (Highest focus)</option>
              <option value="high">High priority</option>
              <option value="medium">Medium standard</option>
              <option value="low">Low background</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-[#7d7a96] mb-1">
              Link to Routine
            </label>
            <select
              value={linkedHabitId}
              onChange={(e) => setLinkedHabitId(e.target.value)}
              className={`w-full rounded-md px-2.5 py-1.5 text-xs focus:outline-none ${
                isDark 
                  ? 'bg-[#0a0a0f] text-[#ece9fb] border border-white/[0.08]' 
                  : 'bg-[#f9f8fd] text-[#18172b] border border-[#e7e4f4]'
              }`}
            >
              <option value="">Independent (No linked habit)</option>
              {habits.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Date & Time */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[10px] uppercase font-semibold text-[#7d7a96] mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#7d7a96]" />
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`w-full rounded-md px-2.5 py-1 text-xs focus:outline-none ${
                isDark 
                  ? 'bg-[#0a0a0f] text-[#ece9fb] border border-white/[0.08]' 
                  : 'bg-[#f9f8fd] text-[#18172b] border border-[#e7e4f4]'
              }`}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-[#7d7a96] mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#7d7a96]" />
              Due Time
            </label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className={`w-full rounded-md px-2.5 py-1 text-xs focus:outline-none ${
                isDark 
                  ? 'bg-[#0a0a0f] text-[#ece9fb] border border-white/[0.08]' 
                  : 'bg-[#f9f8fd] text-[#18172b] border border-[#e7e4f4]'
              }`}
            />
          </div>
        </div>

        {/* 4. Boolean Options: Clean plain rows, NO border lines, toggle switches on the right */}
        <div className="pt-1 space-y-1.5">
          {/* Option 1: Recurring Task */}
          <div className="flex items-center justify-between gap-4 py-1">
            <div className="min-w-0 pr-2">
              <span className={`font-medium text-xs uppercase block ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                Recurring Task
              </span>
              <span className="text-[11px] text-[#7d7a96] mt-0.5 leading-snug block font-sans">
                Automatically renews on your schedule
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isRecurring}
              onClick={() => setIsRecurring(!isRecurring)}
              className={`w-9 h-5 rounded-full p-[2px] transition-colors cursor-pointer shrink-0 relative focus:outline-none ${
                isRecurring ? (isDark ? 'bg-[#8b7bff]' : 'bg-[#7c5ef0]') : (isDark ? 'bg-zinc-700' : 'bg-slate-300')
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out pointer-events-none ${
                  isRecurring ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Option 2: Add to Google Calendar */}
          <div className="flex items-center justify-between gap-4 py-1">
            <div className="min-w-0 pr-2">
              <span className={`font-medium text-xs uppercase block ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                Add to Google Calendar
              </span>
              <span className="text-[11px] text-[#7d7a96] mt-0.5 leading-snug block font-sans">
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
                  ? 'opacity-35 cursor-not-allowed bg-zinc-800'
                  : addToCalendar
                  ? (isDark ? 'bg-[#8b7bff] cursor-pointer' : 'bg-[#7c5ef0] cursor-pointer')
                  : isDark
                  ? 'bg-zinc-700 cursor-pointer'
                  : 'bg-slate-300 cursor-pointer'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out pointer-events-none ${
                  addToCalendar && dueDate && dueTime ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-inherit border-opacity-10">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 rounded-md font-medium text-[#7d7a96] hover:text-[#ece9fb] transition-colors cursor-pointer text-xs uppercase"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className={`px-3.5 py-1 rounded-md font-semibold text-xs cursor-pointer transition-colors uppercase tracking-wider disabled:opacity-50 flex items-center gap-1.5 ${
              isDark 
                ? 'bg-[#8b7bff] text-[#0a0a0f] hover:bg-[#9d8fff]' 
                : 'bg-[#7c5ef0] text-white hover:bg-[#6e4ee6]'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[2.25]" />
            <span>{submitting ? 'Creating...' : 'Create Task'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
