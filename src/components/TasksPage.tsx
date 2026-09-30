import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { TaskItem } from '../types';
import { PriorityIndicator } from './PriorityIndicator';
import { MobileTaskRow } from './MobileTaskRow';
import { TaskDrawer } from './TaskDrawer';
import { InlineTaskEditRow } from './InlineTaskEditRow';
import { InlineNewTaskPanel } from './InlineNewTaskPanel';
import { 
  Check, 
  Plus, 
  Trash2, 
  Repeat, 
  Calendar as CalendarIcon,
  RotateCcw,
  Pencil,
  ChevronDown,
  X
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { 
    tasks, 
    habits, 
    selectedDate, 
    toggleTaskCompletion, 
    addNewTask, 
    updateTask,
    removeTask,
    autoSyncCalendarTasks,
    platform,
    deviceViewportMode
  } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Responsive container observer
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(() => 
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Strict mobile detection: container < 680px, or android phone simulator mode (390px), or screen < 768px
  const isMobile = (platform === 'android' && deviceViewportMode === 'phone') || containerWidth < 680;

  // Filters state
  const [filterCompletion, setFilterCompletion] = useState<'pending' | 'completed' | 'all'>('pending');
  const [filterDateScope, setFilterDateScope] = useState<'today' | 'upcoming' | 'all'>('today');
  const [filterPriority, setFilterPriority] = useState<'all' | 'urgent' | 'high' | 'medium' | 'low'>('all');
  
  // Filter popover state
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const filterPopoverRef = useRef<HTMLDivElement>(null);

  // Drawer (Desktop slide-in panel / Mobile bottom sheet) state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Desktop inline editing state (only one row at a time)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  
  // Desktop inline adding state (no popup, no drawer)
  const [isInlineAdding, setIsInlineAdding] = useState(false);

  // Collapse inline edit or add on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingTaskId) setEditingTaskId(null);
        if (isInlineAdding) setIsInlineAdding(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingTaskId, isInlineAdding]);

  // Close filter popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterPopoverRef.current && !filterPopoverRef.current.contains(event.target as Node)) {
        setIsFilterPopoverOpen(false);
      }
    };
    if (isFilterPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterPopoverOpen]);

  // Is a non-default filter active?
  const hasActiveFilters = filterCompletion !== 'pending' || filterDateScope !== 'today' || filterPriority !== 'all';

  const resetFilters = () => {
    setFilterCompletion('pending');
    setFilterDateScope('today');
    setFilterPriority('all');
    setIsFilterPopoverOpen(false);
  };

  const handleCreateTask = async (taskData: Omit<TaskItem, 'id' | 'order' | 'completed' | 'createdAt'>) => {
    const newTask: TaskItem = {
      ...taskData,
      id: `task-${Date.now()}`,
      completed: false,
      order: tasks.length,
      createdAt: new Date().toISOString()
    };
    await addNewTask(newTask);
  };

  const handleSaveInlineTask = async (updatedTask: TaskItem) => {
    await updateTask(updatedTask);
    setEditingTaskId(null);
    setHighlightedTaskId(updatedTask.id);
    setTimeout(() => {
      setHighlightedTaskId(null);
    }, 1500);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Completion filter
      if (filterCompletion === 'pending' && task.completed) return false;
      if (filterCompletion === 'completed' && !task.completed) return false;

      // Priority filter
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;

      // Date scope filter
      if (filterDateScope === 'today') {
        if (task.dueDate && task.dueDate !== selectedDate) return false;
      } else if (filterDateScope === 'upcoming') {
        if (!task.dueDate || task.dueDate <= selectedDate) return false;
      }

      return true;
    });
  }, [tasks, filterCompletion, filterPriority, filterDateScope, selectedDate]);

  return (
    <div ref={containerRef} className="space-y-3.5 max-w-4xl relative pb-20 sm:pb-8">
      {/* 1. Redesigned Filter Bar: Plain Underline Text Tabs + Lightweight Date Scope + Desktop '+ New Task' */}
      <div className={`flex items-center justify-between gap-3 border-b ${
        isDark ? 'border-white/[0.08]' : 'border-[#e7e4f4]'
      } pb-0 mb-3.5`}>
        {/* Left side: Plain underline text tabs + Lightweight date scope */}
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          {/* Pending / Completed / All rendered as plain underline text tabs */}
          <div className="flex items-center gap-4 sm:gap-6">
            {(['pending', 'completed', 'all'] as const).map(s => {
              const isActive = filterCompletion === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterCompletion(s)}
                  className={`pb-2.5 text-xs sm:text-sm capitalize font-mono transition-colors cursor-pointer border-b-2 ${
                    isActive
                      ? isDark
                        ? 'border-[#8b7bff] text-[#ece9fb] font-semibold'
                        : 'border-[#7c5ef0] text-[#18172b] font-semibold'
                      : isDark
                        ? 'border-transparent text-[#7d7a96] hover:text-[#ece9fb]'
                        : 'border-transparent text-[#7d7a96] hover:text-[#18172b]'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {/* Lightweight Date-scope & Priority dropdown to the right of tabs (No boxed border, monochrome restraint) */}
          <div className="relative shrink-0 pb-2" ref={filterPopoverRef}>
            <button
              type="button"
              onClick={() => setIsFilterPopoverOpen(!isFilterPopoverOpen)}
              className={`text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-1.5 rounded-md ${
                isDark
                  ? 'text-[#7d7a96] hover:text-[#ece9fb]'
                  : 'text-[#7d7a96] hover:text-[#18172b]'
              }`}
              title="Filter by date range and priority"
              aria-label="Filter options"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#7d7a96]" />
              <span className="text-[11px] uppercase">
                {filterDateScope === 'all' ? 'All Dates' : filterDateScope === 'upcoming' ? 'Upcoming' : 'Today'}
                {filterPriority !== 'all' ? ` · ${filterPriority}` : ''}
              </span>
              <ChevronDown className="w-3 h-3 text-[#7d7a96]" />
            </button>

            {/* Filter Dropdown Popover */}
            {isFilterPopoverOpen && (
              <div className={`absolute top-full left-0 mt-1 w-56 p-3 rounded-lg shadow-none z-30 border text-xs space-y-3 ${
                isDark ? 'bg-[#131320] border-white/10 text-[#ece9fb]' : 'bg-white border-[#e7e4f4] text-[#18172b]'
              }`}>
                {/* Date Scope */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-[#7d7a96] mb-1.5">
                    Date Scope
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['today', 'upcoming', 'all'] as const).map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setFilterDateScope(d)}
                        className={`py-1 text-[11px] rounded-md font-mono capitalize font-medium cursor-pointer transition-all ${
                          filterDateScope === d
                            ? isDark ? 'bg-white/10 text-white font-semibold' : 'bg-slate-100 text-slate-900 font-semibold'
                            : isDark ? 'text-[#7d7a96] hover:text-white' : 'text-[#7d7a96] hover:text-slate-800'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-[#7d7a96] mb-1.5">
                    Priority Tier
                  </label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as any)}
                    className={`w-full rounded-md px-2 py-1.5 text-xs font-mono focus:outline-none ${
                      isDark ? 'bg-[#0a0a0f] text-[#ece9fb] border border-white/10' : 'bg-[#f9f8fd] text-[#18172b] border border-[#e7e4f4]'
                    }`}
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-inherit border-opacity-10">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-[11px] font-mono text-[#7d7a96] hover:text-white cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFilterPopoverOpen(false)}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-md font-medium cursor-pointer ${
                      isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                    }`}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset button if active */}
          {hasActiveFilters && (
            <div className="pb-2">
              <button
                type="button"
                onClick={resetFilters}
                className="text-[11px] font-mono text-[#7d7a96] hover:text-[#ece9fb] flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                title="Clear active filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">RESET</span>
              </button>
            </div>
          )}
        </div>

        {/* Desktop "+ New Task" trigger button: toggles inline form */}
        {!isMobile && (
          <div className="pb-2">
            <button
              type="button"
              onClick={() => {
                setIsInlineAdding(!isInlineAdding);
                setEditingTaskId(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold font-mono cursor-pointer flex items-center gap-1.5 transition-colors shrink-0 ${
                isInlineAdding
                  ? isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                  : isDark ? 'bg-[#8b7bff] text-[#0a0a0f] hover:bg-[#9d8fff]' : 'bg-[#7c5ef0] text-white hover:bg-[#6e4ee6]'
              }`}
            >
              {isInlineAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 stroke-[2]" />}
              <span>{isInlineAdding ? 'CANCEL' : 'NEW TASK'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Desktop Inline "New Task" Panel (No pop-up, no drawer) */}
      {!isMobile && isInlineAdding && (
        <InlineNewTaskPanel
          habits={habits}
          selectedDate={selectedDate}
          defaultCalendarSync={autoSyncCalendarTasks}
          isDark={isDark}
          onSubmit={async (taskData) => {
            const newId = `task-${Date.now()}`;
            const newTask: TaskItem = {
              ...taskData,
              id: newId,
              completed: false,
              order: tasks.length,
              createdAt: new Date().toISOString()
            };
            await addNewTask(newTask);
            setIsInlineAdding(false);
            setHighlightedTaskId(newId);
            setTimeout(() => setHighlightedTaskId(null), 1500);
          }}
          onCancel={() => setIsInlineAdding(false)}
        />
      )}

      {/* 2. Content: Conditional Rendering to guarantee NO TABLE HEADERS ON MOBILE */}
      {isMobile ? (
        /* Mobile Compact List Rows (No column headers, 5-6 tasks visible) */
        <div className={`rounded-lg overflow-hidden divide-y divide-inherit divide-opacity-10 border ${
          isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
        }`}>
          {filteredTasks.length === 0 ? (
            <div className="py-8 text-center text-[#7d7a96] text-xs font-mono px-4">
              NO TASKS MATCHING CRITERIA
            </div>
          ) : (
            filteredTasks.map((task) => (
              <MobileTaskRow
                key={task.id}
                task={task}
                habits={habits}
                selectedDate={selectedDate}
                isDark={isDark}
                onToggle={toggleTaskCompletion}
                onDelete={removeTask}
              />
            ))
          )}
        </div>
      ) : (
        /* Desktop Table View (Only when wide screen) */
        <div className={`rounded-lg overflow-hidden border ${
          isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b text-[10px] uppercase font-mono tracking-wider ${
                  isDark ? 'border-white/[0.08] text-[#7d7a96] bg-[#0a0a0f]' : 'border-[#e7e4f4] text-[#7d7a96] bg-[#f9f8fd]'
                }`}>
                  <th className="py-2.5 px-3 w-8">Status</th>
                  <th className="py-2.5 px-3">Task Title</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Linked Habit</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit divide-opacity-5">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#7d7a96] text-[11px] font-mono">
                      NO TASKS MATCHING CRITERIA
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    if (editingTaskId === task.id) {
                      return (
                        <InlineTaskEditRow
                          key={task.id}
                          task={task}
                          habits={habits}
                          isDark={isDark}
                          onSave={handleSaveInlineTask}
                          onCancel={() => setEditingTaskId(null)}
                        />
                      );
                    }

                    const linkedHabit = habits.find(h => h.id === task.linkedHabitId);
                    const isHighlighted = highlightedTaskId === task.id;

                    return (
                      <tr 
                        key={task.id} 
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setIsInlineAdding(false);
                        }}
                        className={`group transition-all duration-300 cursor-pointer ${
                          isHighlighted 
                            ? isDark 
                              ? 'bg-[#8b7bff]/15 ring-1 ring-[#8b7bff]/40' 
                              : 'bg-[#7c5ef0]/10 ring-1 ring-[#7c5ef0]/40' 
                            : 'hover:bg-white/[0.03]'
                        }`}
                        title="Click to edit task"
                      >
                        <td className="py-2 px-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskCompletion(task.id);
                            }}
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-all cursor-pointer ${
                              task.completed
                                ? isDark ? 'bg-[#8b7bff] text-[#0a0a0f]' : 'bg-[#7c5ef0] text-white'
                                : 'border border-white/25 hover:border-white/50 text-transparent'
                            }`}
                          >
                            <Check className={`w-2.5 h-2.5 stroke-[2.5] ${task.completed ? 'opacity-100' : 'opacity-0'}`} />
                          </button>
                        </td>

                        <td className="py-2 px-3">
                          <span className={`font-medium ${task.completed ? 'text-[#7d7a96] line-through' : isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                            {task.title}
                          </span>
                          {task.isRecurring && (
                            <span className="ml-1.5 text-[9px] text-[#7d7a96] inline-flex items-center gap-0.5" title="Recurring">
                              <Repeat className="w-2.5 h-2.5" />
                            </span>
                          )}
                          {task.calendarEventId && (
                            <span className="ml-1.5 text-[9px] text-[#7d7a96] inline-flex items-center gap-0.5" title="Google Calendar synced">
                              <CalendarIcon className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </td>

                        <td className="py-2 px-3">
                          <PriorityIndicator priority={task.priority} />
                        </td>

                        <td className="py-2 px-3 text-[#7d7a96] font-mono text-[11px] tabular-nums">
                          {task.dueDate || 'Unscheduled'}
                          {task.dueTime && <span className="text-[#7d7a96] ml-1">@{task.dueTime}</span>}
                        </td>

                        <td className="py-2 px-3 text-[#7d7a96] text-[11px] truncate max-w-[140px]">
                          {linkedHabit ? linkedHabit.name : '—'}
                        </td>

                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTaskId(task.id);
                                setIsInlineAdding(false);
                              }}
                              className="p-1 text-[#7d7a96] hover:text-[#ece9fb] transition-colors cursor-pointer rounded"
                              title="Edit task inline"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTask(task.id);
                              }}
                              className="p-1 text-[#7d7a96] hover:text-rose-400 transition-colors cursor-pointer rounded"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) on mobile: The ONE fully circular element with subtle radial glow in brand accent */}
      {isMobile && (
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className={`fixed bottom-18 right-4 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-all z-40 ${
            isDark
              ? 'bg-[#8b7bff] text-[#0a0a0f] shadow-[0_0_24px_rgba(139,123,255,0.45)]'
              : 'bg-[#7c5ef0] text-white shadow-[0_0_24px_rgba(124,94,240,0.4)]'
          }`}
          aria-label="Add New Task"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {/* Mobile Bottom Sheet (FAB trigger on mobile only - Desktop uses inline forms exclusively) */}
      {isMobile && (
        <TaskDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onSubmit={handleCreateTask}
          habits={habits}
          defaultDate={selectedDate}
          defaultCalendarSync={autoSyncCalendarTasks}
          isDark={isDark}
          isMobile={true}
        />
      )}
    </div>
  );
};
