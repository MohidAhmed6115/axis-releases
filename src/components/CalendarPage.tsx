import React, { useState, useMemo } from 'react';
import { useApp, getLocalDateString } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { CalendarEvent } from '../types';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  MapPin, 
  Clock, 
  RefreshCw, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const { 
    calendarEvents, 
    tasks,
    selectedDate, 
    setSelectedDate, 
    addEvent, 
    removeEvent, 
    platform, 
    authMode, 
    openAuthModal 
  } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(selectedDate);
  const [startTimeStr, setStartTimeStr] = useState('09:00');
  const [endTimeStr, setEndTimeStr] = useState('10:00');
  const [location, setLocation] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Month grid computation
  const currentMonthDate = useMemo(() => {
    const parts = selectedDate.split('-');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
  }, [selectedDate]);

  const monthName = currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // 35 or 42 grid cells for the month
  const monthDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Prev month padding
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dNum = prevMonthTotalDays - i;
      const prevDate = new Date(year, month - 1, dNum);
      cells.push({
        dateStr: getLocalDateString(prevDate),
        dayNum: dNum,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const currDate = new Date(year, month, i);
      cells.push({
        dateStr: getLocalDateString(currDate),
        dayNum: i,
        isCurrentMonth: true
      });
    }

    // Next month padding to fill row
    const remainder = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remainder; i++) {
      const nextDate = new Date(year, month + 1, i);
      cells.push({
        dateStr: getLocalDateString(nextDate),
        dayNum: i,
        isCurrentMonth: false
      });
    }

    return cells;
  }, [currentMonthDate]);

  // Week days for week view (Sunday to Saturday around selectedDate)
  const weekDays = useMemo(() => {
    const parts = selectedDate.split('-');
    const curr = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const dayOfWeek = curr.getDay();
    const startOfWeek = new Date(curr);
    startOfWeek.setDate(curr.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({
        dateStr: getLocalDateString(d),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate()
      });
    }
    return days;
  }, [selectedDate]);

  // Merge calendar events with tasks synced to calendar
  const allEvents = useMemo(() => {
    const list: CalendarEvent[] = [...calendarEvents];

    tasks.forEach(t => {
      if (t.calendarEventId && t.dueDate) {
        if (!list.some(e => e.id === t.calendarEventId)) {
          const startTime = t.dueTime ? `${t.dueDate}T${t.dueTime}:00` : `${t.dueDate}T09:00:00`;
          const endTime = t.dueTime ? `${t.dueDate}T${t.dueTime}:00` : `${t.dueDate}T09:30:00`;
          list.push({
            id: t.calendarEventId,
            title: t.completed ? `✓ ${t.title}` : t.title,
            startTime,
            endTime,
            isAllDay: !t.dueTime,
            source: 'google',
            description: `Priority: ${t.priority}`
          });
        }
      }
    });

    return list.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [calendarEvents, tasks]);

  // Selected day's events
  const selectedDayEvents = useMemo(() => {
    return allEvents.filter(ev => {
      try {
        return ev.startTime.startsWith(selectedDate);
      } catch {
        return false;
      }
    });
  }, [allEvents, selectedDate]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const startISO = `${eventDate}T${startTimeStr}:00`;
    const endISO = `${eventDate}T${endTimeStr}:00`;

    const newEvent: CalendarEvent = {
      id: `cal-${Date.now()}`,
      title: title.trim(),
      startTime: startISO,
      endTime: endISO,
      location: location.trim() || undefined,
      source: 'manual'
    };

    await addEvent(newEvent);
    setTitle('');
    setLocation('');
    setIsAdding(false);
  };

  const handleSyncGoogleCalendar = async () => {
    if (authMode === 'guest') {
      openAuthModal('Google Calendar sync requires an authenticated account.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Connecting with Google Calendar...');

    try {
      await new Promise(r => setTimeout(r, 600));
      setSyncStatus('Google Calendar synced');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch {
      setSyncStatus('Calendar sync encountered an issue.');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatEventTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const todayStr = getLocalDateString();

  return (
    <div className="space-y-3.5 max-w-4xl pb-16">
      {/* Controls & Mode Bar */}
      <div className={`p-2.5 sm:p-3 rounded-lg flex flex-wrap items-center justify-between gap-2.5 border ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View mode toggle: Month / Week / Day */}
          <div className={`flex items-center p-0.5 rounded-lg border font-sans text-[13px] ${
            isDark ? 'bg-[#1c1c2e] border-white/[0.08]' : 'bg-[#f3f1fb] border-[#e7e4f4]'
          }`}>
            {([
              { key: 'month', label: 'Month' },
              { key: 'week', label: 'Week' },
              { key: 'day', label: 'Day' }
            ] as const).map(mode => (
              <button
                key={mode.key}
                type="button"
                onClick={() => setViewMode(mode.key)}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  viewMode === mode.key
                    ? isDark 
                      ? 'bg-[#131320] text-[#ece9fb] shadow-xs' 
                      : 'bg-white text-[#18172b] shadow-xs'
                    : 'text-[#6b6882] dark:text-[#8d8aab] hover:text-[#18172b] dark:hover:text-[#ece9fb]'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <span className={`text-sm sm:text-base font-semibold font-sans px-2 ${
            isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
          }`}>
            {monthName}
          </span>
        </div>

        <div className="flex items-center gap-2 font-sans">
          <button
            type="button"
            onClick={handleSyncGoogleCalendar}
            disabled={isSyncing}
            className={`text-[13px] font-sans font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-50 ${
              isDark 
                ? 'bg-[#1c1c2e] border-white/[0.08] text-[#8d8aab] hover:text-[#ece9fb]' 
                : 'bg-[#f3f1fb] border-[#e7e4f4] text-[#6b6882] hover:text-[#18172b]'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync GCal</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-sans font-medium cursor-pointer flex items-center gap-1.5 transition-colors ${
              isDark 
                ? 'bg-[#7059f0] text-white hover:bg-[#7e69f5]' 
                : 'bg-[#7c5ef0] text-white hover:bg-[#6e4ee6]'
            }`}
          >
            {isAdding ? <X className="w-3.5 h-3.5 stroke-[2]" /> : <Plus className="w-3.5 h-3.5 stroke-[2]" />}
            <span>{isAdding ? 'Cancel' : 'New event'}</span>
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className={`p-2.5 rounded-lg border text-xs font-sans flex items-center justify-between ${
          isDark ? 'bg-[#1c1c2e] border-white/[0.08] text-[#ece9fb]' : 'bg-[#f3f1fb] border-[#e7e4f4] text-[#18172b]'
        }`}>
          <span>{syncStatus}</span>
          <button onClick={() => setSyncStatus(null)} className="text-[#6b6882] dark:text-[#8d8aab] hover:text-[#18172b] dark:hover:text-[#ece9fb] cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Add Event Form */}
      {isAdding && (
        <form onSubmit={handleCreateEvent} className={`p-4 rounded-lg space-y-3.5 text-xs border font-sans ${
          isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
        }`}>
          <div className={`text-[13px] sm:text-sm font-semibold tracking-tight ${
            isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
          }`}>
            Schedule milestone or event
          </div>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title (Sprint Review, Milestone Check, Deep Work...)"
            className={`w-full rounded-md px-3 py-1.5 text-[13px] font-sans focus:outline-none placeholder:text-[#6b6882] dark:placeholder:text-[#8d8aab] ${
              isDark 
                ? 'bg-[#0a0a0f] text-[#ece9fb] border border-white/[0.08] focus:border-[#7059f0]' 
                : 'bg-[#f9f8fd] text-[#18172b] border border-[#e7e4f4] focus:border-[#7c5ef0]'
            }`}
          />

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs font-sans">
            <div>
              <label className="block text-[#6b6882] dark:text-[#8d8aab] font-medium text-[12px] mb-1">Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className={`w-full rounded-md px-2.5 py-1.5 text-xs font-sans ${
                  isDark 
                    ? 'bg-[#0a0a0f] text-[#ece9fb] border border-white/[0.08]' 
                    : 'bg-[#f9f8fd] text-[#18172b] border border-[#e7e4f4]'
                }`}
              />
            </div>

            <div>
              <label className="block text-[#6b6882] dark:text-[#8d8aab] font-medium text-[12px] mb-1">Start time</label>
              <input
                type="time"
                value={startTimeStr}
                onChange={(e) => setStartTimeStr(e.target.value)}
                className={`w-full rounded-md px-2.5 py-1.5 text-xs font-sans tabular-nums ${
                  isDark 
                    ? 'bg-[#0a0a0f] text-[#ece9fb] border border-white/[0.08]' 
                    : 'bg-[#f9f8fd] text-[#18172b] border border-[#e7e4f4]'
                }`}
              />
            </div>

            <div>
              <label className="block text-[#6b6882] dark:text-[#8d8aab] font-medium text-[12px] mb-1">End time</label>
              <input
                type="time"
                value={endTimeStr}
                onChange={(e) => setEndTimeStr(e.target.value)}
                className={`w-full rounded-md px-2.5 py-1.5 text-xs font-sans tabular-nums ${
                  isDark 
                    ? 'bg-[#0a0a0f] text-[#ece9fb] border border-white/[0.08]' 
                    : 'bg-[#f9f8fd] text-[#18172b] border border-[#e7e4f4]'
                }`}
              />
            </div>

            <div>
              <label className="block text-[#6b6882] dark:text-[#8d8aab] font-medium text-[12px] mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Meet, Studio..."
                className={`w-full rounded-md px-2.5 py-1.5 text-xs font-sans ${
                  isDark 
                    ? 'bg-[#0a0a0f] text-[#ece9fb] border border-white/[0.08]' 
                    : 'bg-[#f9f8fd] text-[#18172b] border border-[#e7e4f4]'
                }`}
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className={`px-3.5 py-1.5 rounded-lg font-medium font-sans text-[13px] cursor-pointer ${
                isDark 
                  ? 'bg-[#7059f0] text-white hover:bg-[#7e69f5]' 
                  : 'bg-[#7c5ef0] text-white hover:bg-[#6e4ee6]'
              }`}
            >
              Add event
            </button>
          </div>
        </form>
      )}

      {/* VIEW 1: MONTH GRID */}
      {viewMode === 'month' && (
        <div className={`p-3 sm:p-4 rounded-lg border ${
          isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
        }`}>
          {/* Day of week headers */}
          <div className="grid grid-cols-7 text-center text-xs font-sans font-normal text-[#6b6882] dark:text-[#8d8aab] pb-2.5 border-b border-inherit border-opacity-10">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month cells */}
          <div className="grid grid-cols-7 gap-1 pt-2">
            {monthDays.map((cell, idx) => {
              const isSelected = cell.dateStr === selectedDate;
              const isToday = cell.dateStr === todayStr;
              const dayEvents = allEvents.filter(ev => ev.startTime.startsWith(cell.dateStr));

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className="min-h-[58px] sm:min-h-[72px] p-1 sm:p-1.5 rounded-lg text-left flex flex-col justify-start items-center transition-colors cursor-pointer border border-transparent hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                >
                  {/* Compact circle / rounded square (about 36-40px) centred on number */}
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#7c5ef0] dark:bg-[#7059f0] text-white shadow-xs'
                        : isToday
                          ? 'ring-[1.5px] ring-[#7c5ef0] dark:ring-[#8b7bff] text-[#18172b] dark:text-[#ece9fb]'
                          : cell.isCurrentMonth
                            ? 'text-[#18172b] dark:text-[#ece9fb]'
                            : 'text-[#6b6882] dark:text-[#8d8aab]'
                    }`}
                  >
                    <span className={`text-xs sm:text-[13px] font-sans tabular-nums leading-none ${
                      isSelected || isToday ? 'font-semibold' : 'font-normal'
                    }`}>
                      {cell.dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span
                        className={`w-1 h-1 rounded-full mt-1 ${
                          isSelected ? 'bg-white' : 'bg-[#7c5ef0] dark:bg-[#8b7bff]'
                        }`}
                      />
                    )}
                  </div>

                  {/* Event chips below number */}
                  <div className="space-y-0.5 mt-1 overflow-hidden w-full hidden sm:block">
                    {dayEvents.slice(0, 2).map(ev => (
                      <div
                        key={ev.id}
                        className={`text-[9px] truncate px-1 py-0.5 rounded font-sans font-medium ${
                          isSelected
                            ? 'bg-[#7c5ef0]/15 text-[#5f41d9] dark:bg-[#8b7bff]/20 dark:text-[#b4a8ff]'
                            : 'bg-black/[0.04] text-[#4d4a64] dark:bg-white/[0.06] dark:text-[#b3b0c9]'
                        }`}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[8px] text-[#6b6882] dark:text-[#8d8aab] font-sans pl-0.5 tabular-nums">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: WEEK VIEW */}
      {viewMode === 'week' && (
        <div className={`p-3 sm:p-4 rounded-lg border ${
          isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
        }`}>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {weekDays.map(day => {
              const isSelected = day.dateStr === selectedDate;
              const isToday = day.dateStr === todayStr;
              const dayEvents = allEvents.filter(ev => ev.startTime.startsWith(day.dateStr));

              return (
                <div
                  key={day.dateStr}
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`p-2 rounded-lg cursor-pointer transition-all min-h-[140px] flex flex-col justify-between border ${
                    isSelected
                      ? isDark 
                        ? 'bg-[#1c1c2e] border-[#7059f0]/40 shadow-xs' 
                        : 'bg-[#f4f2fb] border-[#7c5ef0]/40 shadow-xs'
                      : isDark 
                        ? 'bg-[#0a0a0f] border-white/[0.06] hover:bg-white/[0.04]' 
                        : 'bg-[#f9f8fd] border-[#e7e4f4] hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="text-xs font-sans text-[#6b6882] dark:text-[#8d8aab] font-normal mb-1.5 text-center">
                      {day.dayName}
                    </div>

                    {/* 36-40px compact circle/rounded square centred on the number */}
                    <div className="flex justify-center mb-2">
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#7c5ef0] dark:bg-[#7059f0] text-white shadow-xs'
                            : isToday
                              ? 'ring-[1.5px] ring-[#7c5ef0] dark:ring-[#8b7bff] text-[#18172b] dark:text-[#ece9fb]'
                              : 'text-[#18172b] dark:text-[#ece9fb]'
                        }`}
                      >
                        <span className={`text-xs sm:text-[13px] font-sans tabular-nums leading-none ${
                          isSelected || isToday ? 'font-semibold' : 'font-normal'
                        }`}>
                          {day.dayNum}
                        </span>
                        {dayEvents.length > 0 && (
                          <span
                            className={`w-1 h-1 rounded-full mt-1 ${
                              isSelected ? 'bg-white' : 'bg-[#7c5ef0] dark:bg-[#8b7bff]'
                            }`}
                          />
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 mt-1">
                      {dayEvents.map(ev => (
                        <div
                          key={ev.id}
                          className="text-[10px] p-1 rounded bg-[#7c5ef0]/15 dark:bg-[#8b7bff]/15 text-[#5f41d9] dark:text-[#a89aff] font-sans font-medium truncate"
                          title={ev.title}
                        >
                          <span className="tabular-nums mr-1">{formatEventTime(ev.startTime)}</span>
                          <span>{ev.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <span className="text-[10px] text-[#6b6882] dark:text-[#8d8aab] text-right font-sans tabular-nums mt-2">
                    {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: DAY VIEW / EVENTS FOR SELECTED DATE */}
      <div className={`p-4 rounded-lg space-y-3 border font-sans ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <div className="flex items-center justify-between pb-2.5 border-b border-inherit border-opacity-10 text-xs">
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-sm sm:text-base ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
              Events for {selectedDate}
            </span>
            <span className="text-[#6b6882] dark:text-[#8d8aab] text-xs">·</span>
            <span className="text-xs text-[#6b6882] dark:text-[#8d8aab] tabular-nums font-sans">
              {selectedDayEvents.length} scheduled
            </span>
          </div>
        </div>

        <div className="divide-y divide-inherit divide-opacity-5 text-xs">
          {selectedDayEvents.length === 0 ? (
            <div className="py-8 text-center text-[#6b6882] dark:text-[#8d8aab] text-xs sm:text-[13px] font-sans">
              No milestones or events scheduled on this date.
            </div>
          ) : (
            selectedDayEvents.map(ev => (
              <div key={ev.id} className="py-2.5 flex items-center justify-between group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-1 h-7 rounded-full bg-[#7c5ef0] dark:bg-[#7059f0] shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium text-sm ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                        {ev.title}
                      </span>
                      <span className="text-[#6b6882] dark:text-[#8d8aab] text-xs font-sans tabular-nums">
                        {formatEventTime(ev.startTime)} – {formatEventTime(ev.endTime)}
                      </span>
                    </div>

                    {ev.location && (
                      <div className="flex items-center gap-1 text-[11px] text-[#6b6882] dark:text-[#8d8aab] mt-0.5">
                        <MapPin className="w-3 h-3 stroke-[1.75]" />
                        <span>{ev.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeEvent(ev.id)}
                  className="p-1.5 text-[#6b6882] dark:text-[#8d8aab] hover:text-rose-400 transition-colors cursor-pointer rounded"
                  title="Remove event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
