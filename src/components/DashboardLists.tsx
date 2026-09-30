import React from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Habit, TaskItem, CalendarEvent } from '../types';
import { PriorityIndicator } from './PriorityIndicator';
import { Check, Flame, Anchor, Clock, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { NavPage } from './Sidebar';

interface DashboardListsProps {
  onNavigate: (page: NavPage) => void;
}

export const DashboardLists: React.FC<DashboardListsProps> = ({ onNavigate }) => {
  const { 
    habits, 
    tasks, 
    calendarEvents, 
    selectedDate, 
    dailyRecords, 
    toggleHabit, 
    toggleTaskCompletion 
  } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const currentRecord = dailyRecords[selectedDate];
  const completedHabitIds = currentRecord?.completedHabitIds || [];

  const handleToggleHabit = async (habitId: string) => {
    const willComplete = !completedHabitIds.includes(habitId);
    await toggleHabit(habitId);
    if (willComplete) {
      confetti({ particleCount: 15, spread: 30, origin: { y: 0.7 } });
    }
  };

  // Today's tasks (due today or unassigned date)
  const todaysTasks = tasks.filter(t => !t.dueDate || t.dueDate === selectedDate);

  // Next 3-5 calendar events
  const upcomingEvents = calendarEvents
    .filter(ev => {
      try {
        const evStart = new Date(ev.startTime);
        return evStart >= new Date() || ev.startTime.startsWith(selectedDate);
      } catch {
        return true;
      }
    })
    .slice(0, 4);

  const formatEventTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const brandAccent = isDark ? '#8b7bff' : '#7c5ef0';

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-2.5">
      {/* 1. Today's Habit Checklist */}
      <div className={`p-3 sm:p-3.5 rounded-lg flex flex-col justify-between border ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-inherit border-opacity-10">
            <div className="flex items-center gap-1.5 font-mono">
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                Today's Habits
              </span>
              <span className="text-[#7d7a96] text-[10px]">·</span>
              <span className="text-[10px] text-[#7d7a96] tabular-nums">
                {completedHabitIds.length}/{habits.length}
              </span>
            </div>

            <button
              onClick={() => onNavigate('habits')}
              className="text-[10px] font-mono uppercase text-[#7d7a96] hover:text-[#ece9fb] flex items-center gap-0.5 cursor-pointer transition-colors"
            >
              <span>Manage</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="mt-1 divide-y divide-inherit divide-opacity-5">
            {habits.length === 0 ? (
              <div className="py-6 text-center text-[#7d7a96] text-[11px] font-mono">
                No active routines.
              </div>
            ) : (
              habits.slice(0, 6).map((habit) => {
                const isCompleted = completedHabitIds.includes(habit.id);
                return (
                  <div
                    key={habit.id}
                    className="py-1.5 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleHabit(habit.id)}
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          isCompleted
                            ? 'bg-[#8b7bff] text-[#0a0a0f]'
                            : 'border border-white/25 hover:border-white/40 text-transparent'
                        }`}
                        title={isCompleted ? 'Completed' : 'Mark done'}
                      >
                        <Check className={`w-2.5 h-2.5 stroke-[2.5] ${isCompleted ? 'opacity-100' : 'opacity-0'}`} />
                      </button>

                      <span className={`text-[11px] truncate ${
                        isCompleted ? 'text-[#7d7a96] line-through' : isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
                      }`}>
                        {habit.name}
                      </span>
                    </div>

                    {habit.isAnchor && (
                      <span className="text-[9px] font-semibold text-amber-400 flex items-center gap-0.5 shrink-0 font-mono">
                        <Anchor className="w-2.5 h-2.5" />
                        Anchor
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {habits.length > 6 && (
          <div className="pt-2 text-center border-t border-inherit border-opacity-10">
            <button
              onClick={() => onNavigate('habits')}
              className="text-[10px] font-mono text-[#7d7a96] hover:text-[#ece9fb] cursor-pointer"
            >
              +{habits.length - 6} more in Habits
            </button>
          </div>
        )}
      </div>

      {/* 2. Today's Tasks */}
      <div className={`p-3 sm:p-3.5 rounded-lg flex flex-col justify-between border ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-inherit border-opacity-10">
            <div className="flex items-center gap-1.5 font-mono">
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                Today's Tasks
              </span>
              <span className="text-[#7d7a96] text-[10px]">·</span>
              <span className="text-[10px] text-[#7d7a96] tabular-nums">
                {todaysTasks.filter(t => t.completed).length}/{todaysTasks.length}
              </span>
            </div>

            <button
              onClick={() => onNavigate('tasks')}
              className="text-[10px] font-mono uppercase text-[#7d7a96] hover:text-[#ece9fb] flex items-center gap-0.5 cursor-pointer transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="mt-1 divide-y divide-inherit divide-opacity-5">
            {todaysTasks.length === 0 ? (
              <div className="py-6 text-center text-[#7d7a96] text-[11px] font-mono">
                No tasks scheduled today.
              </div>
            ) : (
              todaysTasks.slice(0, 6).map((task) => (
                <div
                  key={task.id}
                  className="py-1.5 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleTaskCompletion(task.id)}
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        task.completed
                          ? 'bg-[#8b7bff] text-[#0a0a0f]'
                          : 'border border-white/25 hover:border-white/40 text-transparent'
                      }`}
                      title={task.completed ? 'Completed' : 'Complete task'}
                    >
                      <Check className={`w-2.5 h-2.5 stroke-[2.5] ${task.completed ? 'opacity-100' : 'opacity-0'}`} />
                    </button>

                    <span className={`text-[11px] truncate ${
                      task.completed ? 'text-[#7d7a96] line-through' : isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
                    }`}>
                      {task.title}
                    </span>
                  </div>

                  <PriorityIndicator priority={task.priority} />
                </div>
              ))
            )}
          </div>
        </div>

        {todaysTasks.length > 6 && (
          <div className="pt-2 text-center border-t border-inherit border-opacity-10">
            <button
              onClick={() => onNavigate('tasks')}
              className="text-[10px] font-mono text-[#7d7a96] hover:text-[#ece9fb] cursor-pointer"
            >
              +{todaysTasks.length - 6} more in Tasks
            </button>
          </div>
        )}
      </div>

      {/* 3. Next Calendar Events */}
      <div className={`p-3 sm:p-3.5 rounded-lg flex flex-col justify-between border ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-inherit border-opacity-10">
            <div className="flex items-center gap-1.5 font-mono">
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                Upcoming Schedule
              </span>
              <span className="text-[#7d7a96] text-[10px]">·</span>
              <span className="text-[10px] text-[#7d7a96] tabular-nums">
                {upcomingEvents.length} events
              </span>
            </div>

            <button
              onClick={() => onNavigate('calendar')}
              className="text-[10px] font-mono uppercase text-[#7d7a96] hover:text-[#ece9fb] flex items-center gap-0.5 cursor-pointer transition-colors"
            >
              <span>Calendar</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="mt-1 divide-y divide-inherit divide-opacity-5">
            {upcomingEvents.length === 0 ? (
              <div className="py-6 text-center text-[#7d7a96] text-[11px] font-mono">
                No upcoming events.
              </div>
            ) : (
              upcomingEvents.map((ev) => (
                <div key={ev.id} className="py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-1 h-3 rounded-full bg-[#8b7bff] shrink-0" />
                    <span className={`text-[11px] truncate ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                      {ev.title}
                    </span>
                  </div>

                  <span className="text-[10px] text-[#7d7a96] font-mono tabular-nums shrink-0 ml-2">
                    {formatEventTime(ev.startTime)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-2 text-center border-t border-inherit border-opacity-10">
          <button
            onClick={() => onNavigate('calendar')}
            className="text-[10px] font-mono text-[#7d7a96] hover:text-[#ece9fb] cursor-pointer"
          >
            Open Full Calendar
          </button>
        </div>
      </div>
    </div>
  );
};
