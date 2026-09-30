import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskItem } from '../types';
import { PriorityIndicator } from './PriorityIndicator';
import { 
  Check, 
  Plus, 
  Trash2, 
  Clock, 
  Repeat, 
  X, 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';

export const TodoListModule: React.FC = () => {
  const { 
    tasks, 
    habits, 
    selectedDate, 
    toggleTaskCompletion, 
    addNewTask, 
    removeTask, 
    reorderTasks 
  } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueTime, setDueTime] = useState('');
  const [linkedHabitId, setLinkedHabitId] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<'daily' | 'weekly'>('daily');

  const filteredTasks = tasks.filter(t => !t.dueDate || t.dueDate === selectedDate);
  const pendingTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      priority,
      dueDate: selectedDate,
      dueTime: dueTime || undefined,
      completed: false,
      linkedHabitId: linkedHabitId || undefined,
      isRecurring,
      recurringInterval: isRecurring ? recurringInterval : undefined,
      order: tasks.length,
      createdAt: new Date().toISOString()
    };

    await addNewTask(newTask);
    setTitle('');
    setDueTime('');
    setLinkedHabitId('');
    setIsRecurring(false);
    setIsAdding(false);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const items = [...tasks];
    const temp = items[index - 1];
    items[index - 1] = items[index];
    items[index] = temp;
    reorderTasks(items);
  };

  const moveDown = (index: number) => {
    if (index === tasks.length - 1) return;
    const items = [...tasks];
    const temp = items[index + 1];
    items[index + 1] = items[index];
    items[index] = temp;
    reorderTasks(items);
  };

  return (
    <section className="bg-[#121922] rounded-2xl p-3 sm:p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-semibold text-white tracking-tight">Today's Tasks</h2>
            <span className="text-zinc-600 text-xs">·</span>
            <span className="text-[11px] text-zinc-400 font-mono tabular-nums">
              {completedTasks.length} done, {pendingTasks.length} left
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
            Daily priorities linked to your routines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="text-[11px] flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-zinc-200 transition-colors cursor-pointer font-medium"
        >
          {isAdding ? <X className="w-3 h-3 stroke-[1.75]" /> : <Plus className="w-3 h-3 stroke-[2]" />}
          <span>{isAdding ? 'Cancel' : 'New'}</span>
        </button>
      </div>

      {/* Task Creation Form */}
      {isAdding && (
        <form onSubmit={handleCreateTask} className="my-3 p-3 rounded-xl bg-[#0b0f14] space-y-2.5 text-xs">
          <span className="text-[11px] font-semibold text-zinc-200 block">Create Task</span>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Complete quarterly product review..."
            className="w-full bg-[#121922] rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none placeholder:text-zinc-600"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <div>
              <label className="block text-zinc-500 mb-0.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-[#121922] rounded-lg px-2 py-1 text-zinc-200"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-500 mb-0.5">Due Time (Opt)</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full bg-[#121922] rounded-lg px-2 py-1 text-zinc-200"
              />
            </div>

            <div>
              <label className="block text-zinc-500 mb-0.5">Link Habit (Opt)</label>
              <select
                value={linkedHabitId}
                onChange={(e) => setLinkedHabitId(e.target.value)}
                className="w-full bg-[#121922] rounded-lg px-2 py-1 text-zinc-200"
              >
                <option value="">None (Independent)</option>
                {habits.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-1.5 text-[11px] text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded border-zinc-700 text-white focus:ring-0"
              />
              <span className="flex items-center gap-1 font-medium text-zinc-300">
                <Repeat className="w-3 h-3 text-zinc-400 stroke-[1.75]" />
                Recurring
              </span>
            </label>

            <button
              type="submit"
              className="px-3 py-1 bg-white text-zinc-950 font-semibold text-[11px] rounded-lg hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="mt-2 divide-y divide-white/[0.04]">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-[11px]">
            No tasks scheduled for today. Add tasks to maintain accountability.
          </div>
        ) : (
          filteredTasks.map((task, idx) => {
            const linkedHabit = habits.find(h => h.id === task.linkedHabitId);

            return (
              <div
                key={task.id}
                className="py-2 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Square minimalist checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleTaskCompletion(task.id)}
                    className={`w-4 h-4 rounded flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      task.completed
                        ? 'bg-zinc-700 text-white'
                        : 'border border-white/25 hover:border-white/40 text-transparent'
                    }`}
                  >
                    <Check className={`w-3 h-3 stroke-[2.5] ${task.completed ? 'opacity-100' : 'opacity-0'}`} />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-medium transition-all truncate ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
                        {task.title}
                      </span>
                      <PriorityIndicator priority={task.priority} />
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                      {task.dueTime && (
                        <span className="flex items-center gap-0.5 font-mono tabular-nums">
                          <Clock className="w-2.5 h-2.5 stroke-[1.75]" />
                          {task.dueTime}
                        </span>
                      )}
                      {linkedHabit && (
                        <>
                          <span className="text-zinc-700">·</span>
                          <span className="text-zinc-400 truncate">{linkedHabit.name}</span>
                        </>
                      )}
                      {task.isRecurring && (
                        <>
                          <span className="text-zinc-700">·</span>
                          <span className="text-zinc-400">Recurring</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reorder and Delete controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="hidden sm:flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="p-1 text-zinc-600 hover:text-zinc-300 disabled:opacity-20 cursor-pointer"
                      title="Move up"
                    >
                      <ChevronUp className="w-3 h-3 stroke-[2]" />
                    </button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === filteredTasks.length - 1}
                      className="p-1 text-zinc-600 hover:text-zinc-300 disabled:opacity-20 cursor-pointer"
                      title="Move down"
                    >
                      <ChevronDown className="w-3 h-3 stroke-[2]" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeTask(task.id)}
                    className="p-1 text-zinc-600 hover:text-rose-400 transition-colors cursor-pointer rounded opacity-0 group-hover:opacity-100"
                    title="Delete task"
                  >
                    <Trash2 className="w-3 h-3 stroke-[1.75]" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
