import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Habit, TaskItem } from '../types';
import { 
  Plus, 
  X, 
  CheckSquare, 
  Flame, 
  Calendar, 
  Clock, 
  Repeat, 
  Tag, 
  ArrowRight, 
  Sparkles,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DashboardQuickAddFABProps {
  onNavigateToHabits?: () => void;
  onNavigateToTasks?: () => void;
}

export const DashboardQuickAddFAB: React.FC<DashboardQuickAddFABProps> = () => {
  const { 
    habits, 
    selectedDate, 
    addNewTask, 
    addNewHabit, 
    autoSyncCalendarTasks,
    tasks 
  } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'task' | 'habit'>('task');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [taskDueDate, setTaskDueDate] = useState(selectedDate);
  const [taskDueTime, setTaskDueTime] = useState('');
  const [taskLinkedHabitId, setTaskLinkedHabitId] = useState('');
  const [taskAddToCalendar, setTaskAddToCalendar] = useState(autoSyncCalendarTasks);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Habit form state
  const [habitName, setHabitName] = useState('');
  const [habitType, setHabitType] = useState<'build' | 'break'>('build');
  const [habitFrequency, setHabitFrequency] = useState<'daily' | 'weekdays' | 'weekends' | 'weekly'>('daily');
  const [habitCategory, setHabitCategory] = useState('Productivity');
  const [habitIsAnchor, setHabitIsAnchor] = useState(false);
  const [isSubmittingHabit, setIsSubmittingHabit] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input whenever popover opens or tab switches
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
    }
  }, [isOpen, activeTab]);

  // Keep due date synced with selectedDate if untouched
  useEffect(() => {
    if (!isOpen) {
      setTaskDueDate(selectedDate);
    }
  }, [selectedDate, isOpen]);

  // Global keyboard shortcut ('q' or 'n' to open, Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        return;
      }

      // Check if user is currently typing in an input/textarea/select
      const activeElement = document.activeElement;
      const isInput = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.tagName === 'SELECT' ||
        (activeElement as HTMLElement).isContentEditable
      );

      if (!isInput && !isOpen) {
        if (e.key === 'q' || e.key === 'Q') {
          e.preventDefault();
          setIsOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || isSubmittingTask) return;

    setIsSubmittingTask(true);
    try {
      const newTask: TaskItem = {
        id: `task-${Date.now()}`,
        title: taskTitle.trim(),
        priority: taskPriority,
        dueDate: taskDueDate || undefined,
        dueTime: taskDueTime || undefined,
        linkedHabitId: taskLinkedHabitId || undefined,
        isRecurring: false,
        addToCalendar: taskAddToCalendar,
        completed: false,
        order: tasks.length,
        createdAt: new Date().toISOString()
      };

      await addNewTask(newTask);

      // Reset fields
      setTaskTitle('');
      setTaskDueTime('');
      setTaskLinkedHabitId('');
      setTaskPriority('medium');
      setIsOpen(false);

      setSuccessToast(`Task "${newTask.title}" added to Dashboard`);
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err) {
      console.error('Failed to quick add task:', err);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim() || isSubmittingHabit) return;

    setIsSubmittingHabit(true);
    try {
      const newHabit: Habit = {
        id: `habit-${Date.now()}`,
        name: habitName.trim(),
        type: habitType,
        frequency: habitFrequency,
        isAnchor: habitIsAnchor,
        category: habitCategory,
        createdAt: new Date().toISOString()
      };

      await addNewHabit(newHabit);
      confetti({ particleCount: 20, spread: 45, origin: { y: 0.85, x: 0.9 } });

      // Reset fields
      setHabitName('');
      setHabitIsAnchor(false);
      setHabitFrequency('daily');
      setIsOpen(false);

      setSuccessToast(`Habit "${newHabit.name}" added to Dashboard`);
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err) {
      console.error('Failed to quick add habit:', err);
    } finally {
      setIsSubmittingHabit(false);
    }
  };

  const categories = ['Productivity', 'Health', 'Mindfulness', 'Learning', 'Fitness', 'Routine'];

  return (
    <>
      {/* Toast Notice */}
      {successToast && (
        <div className={`fixed bottom-24 sm:bottom-10 right-4 sm:right-24 z-50 flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg shadow-xl border text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200 ${
          isDark 
            ? 'bg-[#181926] border-emerald-500/30 text-emerald-400' 
            : 'bg-white border-emerald-500/30 text-emerald-700 shadow-emerald-500/5'
        }`}>
          <Check className="w-4 h-4 stroke-[2.5] text-emerald-500 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-40 flex items-center gap-2">
        {/* Subtle keyboard hint for desktop */}
        {!isOpen && (
          <span className={`hidden md:inline-flex items-center px-2 py-0.5 text-[10px] font-mono rounded border shadow-sm transition-opacity pointer-events-none ${
            isDark 
              ? 'bg-[#18192a] border-white/10 text-zinc-400' 
              : 'bg-white border-slate-200 text-slate-500'
          }`}>
            Press <kbd className="font-semibold text-inherit ml-1">Q</kbd>
          </span>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close Quick Add" : "Quick Add Task or Habit"}
          title={isOpen ? "Close" : "Quick Add (Q)"}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8b7bff] focus-visible:ring-offset-2 ${
            isOpen 
              ? isDark 
                ? 'bg-[#252538] text-white border border-white/20 rotate-45 shadow-black/40' 
                : 'bg-slate-200 text-slate-800 border border-slate-300 rotate-45'
              : 'bg-[#8b7bff] hover:bg-[#7a68fc] text-white shadow-[#8b7bff]/25 hover:shadow-[#8b7bff]/40'
          }`}
        >
          <Plus className="w-6 h-6 stroke-[2.25] transition-transform duration-200" />
        </button>
      </div>

      {/* Quick Add Popover / Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <div className={`relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-xl border shadow-2xl overflow-hidden z-10 animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200 ${
            isDark 
              ? 'bg-[#131320] border-white/[0.12] text-[#ece9fb]' 
              : 'bg-white border-[#e7e4f4] text-[#18172b]'
          }`}>
            {/* Header & Tabs */}
            <div className={`px-4 sm:px-5 py-3.5 border-b flex items-center justify-between ${
              isDark ? 'border-white/[0.08] bg-[#18192a]' : 'border-[#e7e4f4] bg-[#f8f7fc]'
            }`}>
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-black/10 dark:bg-white/5 border border-inherit">
                <button
                  type="button"
                  onClick={() => setActiveTab('task')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                    activeTab === 'task'
                      ? isDark 
                        ? 'bg-[#8b7bff] text-white shadow-xs' 
                        : 'bg-white text-slate-900 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5 stroke-[2]" />
                  <span>New Task</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('habit')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                    activeTab === 'habit'
                      ? isDark 
                        ? 'bg-[#8b7bff] text-white shadow-xs' 
                        : 'bg-white text-slate-900 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 stroke-[2]" />
                  <span>New Habit</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-500">
                  Dashboard Quick Input
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                    isDark ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                  aria-label="Close"
                >
                  <X className="w-4 h-4 stroke-[2]" />
                </button>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-4 sm:p-5">
              {activeTab === 'task' ? (
                /* TASK RAPID INPUT FORM */
                <form onSubmit={handleCreateTask} className="space-y-3.5">
                  <div>
                    <label className={`block text-xs font-medium uppercase font-mono tracking-wider mb-1.5 ${
                      isDark ? 'text-zinc-400' : 'text-slate-500'
                    }`}>
                      Task Title
                    </label>
                    <input
                      ref={inputRef}
                      type="text"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="e.g., Complete quarterly review notes"
                      className={`w-full px-3.5 py-2 rounded-lg text-sm border focus:outline-none focus:ring-1 transition-colors ${
                        isDark 
                          ? 'bg-[#181926] border-white/10 text-white placeholder-zinc-500 focus:ring-[#8b7bff] focus:border-[#8b7bff]' 
                          : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-[#8b7bff] focus:border-[#8b7bff]'
                      }`}
                      required
                    />
                  </div>

                  {/* Priority Selector (Grayscale intensity scale - NEVER use day-rating colors) */}
                  <div>
                    <label className={`block text-xs font-medium uppercase font-mono tracking-wider mb-1.5 ${
                      isDark ? 'text-zinc-400' : 'text-slate-500'
                    }`}>
                      Priority
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['low', 'medium', 'high', 'urgent'] as const).map((p) => {
                        const isSelected = taskPriority === p;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setTaskPriority(p)}
                            className={`py-1.5 px-2 text-xs font-mono font-medium capitalize rounded-md border text-center cursor-pointer transition-all ${
                              isSelected
                                ? p === 'urgent'
                                  ? isDark
                                    ? 'bg-zinc-100 text-zinc-950 border-white font-bold shadow-xs'
                                    : 'bg-zinc-900 text-white border-zinc-900 font-bold shadow-xs'
                                  : p === 'high'
                                    ? isDark
                                      ? 'bg-white/15 text-zinc-100 border-white/30 font-semibold'
                                      : 'bg-zinc-700 text-white border-zinc-700 font-semibold'
                                    : p === 'medium'
                                      ? isDark
                                        ? 'bg-white/[0.08] text-zinc-300 border-white/20'
                                        : 'bg-zinc-200 text-zinc-900 border-zinc-300'
                                      : isDark
                                        ? 'bg-white/[0.04] text-zinc-400 border-white/10'
                                        : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                                : isDark
                                  ? 'bg-[#181926] border-white/5 text-zinc-500 hover:border-white/15 hover:text-zinc-300'
                                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Date & Time Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-medium uppercase font-mono tracking-wider mb-1.5 flex items-center gap-1.5 ${
                        isDark ? 'text-zinc-400' : 'text-slate-500'
                      }`}>
                        <Calendar className="w-3.5 h-3.5 stroke-[1.75]" />
                        <span>Due Date</span>
                      </label>
                      <input
                        type="date"
                        value={taskDueDate}
                        onChange={(e) => setTaskDueDate(e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-lg text-xs border focus:outline-none focus:ring-1 ${
                          isDark 
                            ? 'bg-[#181926] border-white/10 text-white focus:ring-[#8b7bff]' 
                            : 'bg-white border-slate-200 text-slate-900 focus:ring-[#8b7bff]'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium uppercase font-mono tracking-wider mb-1.5 flex items-center gap-1.5 ${
                        isDark ? 'text-zinc-400' : 'text-slate-500'
                      }`}>
                        <Clock className="w-3.5 h-3.5 stroke-[1.75]" />
                        <span>Due Time (Optional)</span>
                      </label>
                      <input
                        type="time"
                        value={taskDueTime}
                        onChange={(e) => setTaskDueTime(e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-lg text-xs border focus:outline-none focus:ring-1 ${
                          isDark 
                            ? 'bg-[#181926] border-white/10 text-white focus:ring-[#8b7bff]' 
                            : 'bg-white border-slate-200 text-slate-900 focus:ring-[#8b7bff]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Linked Habit & Calendar Sync */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {habits.length > 0 && (
                      <div>
                        <label className={`block text-xs font-medium uppercase font-mono tracking-wider mb-1.5 flex items-center gap-1.5 ${
                          isDark ? 'text-zinc-400' : 'text-slate-500'
                        }`}>
                          <Flame className="w-3.5 h-3.5 stroke-[1.75] text-[#8b7bff]" />
                          <span>Link Habit (Optional)</span>
                        </label>
                        <select
                          value={taskLinkedHabitId}
                          onChange={(e) => setTaskLinkedHabitId(e.target.value)}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none ${
                            isDark 
                              ? 'bg-[#181926] border-white/10 text-white' 
                              : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        >
                          <option value="">None (Independent task)</option>
                          {habits.map((h) => (
                            <option key={h.id} value={h.id}>
                              {h.name} {h.isAnchor ? '⚓' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-4 sm:pt-6">
                      <input
                        type="checkbox"
                        id="quick_task_calendar"
                        checked={taskAddToCalendar}
                        onChange={(e) => setTaskAddToCalendar(e.target.checked)}
                        className="rounded border-slate-300 text-[#8b7bff] focus:ring-[#8b7bff] w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="quick_task_calendar" className="text-xs cursor-pointer select-none">
                        Sync to Calendar
                      </label>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-inherit border-opacity-10">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className={`px-3 py-1.5 text-xs rounded-md border cursor-pointer transition-colors ${
                        isDark 
                          ? 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/5' 
                          : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!taskTitle.trim() || isSubmittingTask}
                      className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[#8b7bff] hover:bg-[#7a68fc] text-white cursor-pointer transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <span>{isSubmittingTask ? 'Adding...' : 'Add Task'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              ) : (
                /* HABIT RAPID INPUT FORM */
                <form onSubmit={handleCreateHabit} className="space-y-3.5">
                  <div>
                    <label className={`block text-xs font-medium uppercase font-mono tracking-wider mb-1.5 ${
                      isDark ? 'text-zinc-400' : 'text-slate-500'
                    }`}>
                      Habit Name
                    </label>
                    <input
                      ref={inputRef}
                      type="text"
                      value={habitName}
                      onChange={(e) => setHabitName(e.target.value)}
                      placeholder="e.g., Morning hydration & 20 min deep reading"
                      className={`w-full px-3.5 py-2 rounded-lg text-sm border focus:outline-none focus:ring-1 transition-colors ${
                        isDark 
                          ? 'bg-[#181926] border-white/10 text-white placeholder-zinc-500 focus:ring-[#8b7bff] focus:border-[#8b7bff]' 
                          : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-[#8b7bff] focus:border-[#8b7bff]'
                      }`}
                      required
                    />
                  </div>

                  {/* Habit Type & Frequency */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-medium uppercase font-mono tracking-wider mb-1.5 ${
                        isDark ? 'text-zinc-400' : 'text-slate-500'
                      }`}>
                        Habit Type
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setHabitType('build')}
                          className={`py-1.5 px-2 text-xs font-medium rounded-md border text-center cursor-pointer transition-all ${
                            habitType === 'build'
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500 dark:text-emerald-400'
                              : isDark
                                ? 'bg-[#181926] border-white/5 text-zinc-400'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          Build (+)
                        </button>
                        <button
                          type="button"
                          onClick={() => setHabitType('break')}
                          className={`py-1.5 px-2 text-xs font-medium rounded-md border text-center cursor-pointer transition-all ${
                            habitType === 'break'
                              ? 'bg-rose-500/15 border-rose-500/40 text-rose-500 dark:text-rose-400'
                              : isDark
                                ? 'bg-[#181926] border-white/5 text-zinc-400'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          Break (-)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-medium uppercase font-mono tracking-wider mb-1.5 flex items-center gap-1.5 ${
                        isDark ? 'text-zinc-400' : 'text-slate-500'
                      }`}>
                        <Repeat className="w-3.5 h-3.5 stroke-[1.75]" />
                        <span>Frequency</span>
                      </label>
                      <select
                        value={habitFrequency}
                        onChange={(e) => setHabitFrequency(e.target.value as any)}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none ${
                          isDark 
                            ? 'bg-[#181926] border-white/10 text-white' 
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      >
                        <option value="daily">Every Day (7/7)</option>
                        <option value="weekdays">Weekdays (Mon-Fri)</option>
                        <option value="weekends">Weekends only</option>
                        <option value="weekly">Weekly once</option>
                      </select>
                    </div>
                  </div>

                  {/* Category & Anchor Habit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className={`block text-xs font-medium uppercase font-mono tracking-wider mb-1.5 flex items-center gap-1.5 ${
                        isDark ? 'text-zinc-400' : 'text-slate-500'
                      }`}>
                        <Tag className="w-3.5 h-3.5 stroke-[1.75]" />
                        <span>Category</span>
                      </label>
                      <select
                        value={habitCategory}
                        onChange={(e) => setHabitCategory(e.target.value)}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none ${
                          isDark 
                            ? 'bg-[#181926] border-white/10 text-white' 
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-4 sm:pt-6">
                      <input
                        type="checkbox"
                        id="quick_habit_anchor"
                        checked={habitIsAnchor}
                        onChange={(e) => setHabitIsAnchor(e.target.checked)}
                        className="rounded border-slate-300 text-[#8b7bff] focus:ring-[#8b7bff] w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="quick_habit_anchor" className="text-xs cursor-pointer select-none flex items-center gap-1">
                        <span>Set as Anchor Habit</span>
                        <span className="text-[10px] text-zinc-500 font-mono">(Key foundational routine)</span>
                      </label>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-inherit border-opacity-10">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className={`px-3 py-1.5 text-xs rounded-md border cursor-pointer transition-colors ${
                        isDark 
                          ? 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/5' 
                          : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!habitName.trim() || isSubmittingHabit}
                      className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[#8b7bff] hover:bg-[#7a68fc] text-white cursor-pointer transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <span>{isSubmittingHabit ? 'Adding...' : 'Add Habit'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
