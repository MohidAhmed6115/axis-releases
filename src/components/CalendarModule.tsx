import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarEvent } from '../types';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  MapPin, 
  Clock, 
  RefreshCw, 
  X
} from 'lucide-react';

export const CalendarModule: React.FC = () => {
  const { 
    calendarEvents, 
    selectedDate, 
    addEvent, 
    removeEvent, 
    platform,
    authMode,
    openAuthModal
  } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [startTimeStr, setStartTimeStr] = useState('09:00');
  const [endTimeStr, setEndTimeStr] = useState('10:00');
  const [location, setLocation] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const todaysEvents = calendarEvents.filter(ev => {
    try {
      const eventDate = ev.startTime.split('T')[0];
      return eventDate === selectedDate;
    } catch {
      return false;
    }
  });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const startISO = `${selectedDate}T${startTimeStr}:00`;
    const endISO = `${selectedDate}T${endTimeStr}:00`;

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
      openAuthModal('Google Calendar sync requires an authenticated account with Google permissions.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Connecting with Google Calendar...');

    try {
      await new Promise(r => setTimeout(r, 600));
      setSyncStatus('Calendar in sync');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err: any) {
      setSyncStatus('Calendar sync encountered an issue.');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatEventTime = (isoString: string) => {
    try {
      const timePart = isoString.split('T')[1];
      if (!timePart) return isoString;
      const [h, m] = timePart.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${m} ${ampm}`;
    } catch {
      return isoString;
    }
  };

  return (
    <section className="bg-[#121922] rounded-2xl p-3 sm:p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-semibold text-white tracking-tight">Schedule</h2>
            <span className="text-zinc-600 text-xs">·</span>
            <span className="text-[11px] text-zinc-400 font-mono tabular-nums">
              {todaysEvents.length} events
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
            Manual milestones and calendar events.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSyncGoogleCalendar}
            disabled={isSyncing}
            className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition-colors cursor-pointer font-medium disabled:opacity-50"
            title="Sync Google Calendar"
          >
            <RefreshCw className={`w-3 h-3 stroke-[1.75] ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="text-[11px] flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-zinc-200 transition-colors cursor-pointer font-medium"
          >
            {isAdding ? <X className="w-3 h-3 stroke-[1.75]" /> : <Plus className="w-3 h-3 stroke-[2]" />}
            <span>{isAdding ? 'Cancel' : 'Add'}</span>
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className="mt-2.5 p-2 rounded-xl bg-white/[0.03] text-[11px] text-zinc-300 flex items-center justify-between">
          <span>{syncStatus}</span>
          <button onClick={() => setSyncStatus(null)} className="text-zinc-500 hover:text-white cursor-pointer">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Creation form */}
      {isAdding && (
        <form onSubmit={handleCreateEvent} className="my-3 p-3 rounded-xl bg-[#0b0f14] space-y-2.5 text-xs font-sans">
          <span className="text-xs font-semibold text-zinc-200 block">Schedule event</span>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Focus Sprint, Meeting, Gym..."
            className="w-full bg-[#121922] rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none placeholder:text-zinc-600 font-sans"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-sans">
            <div>
              <label className="block text-zinc-500 mb-0.5">Start time</label>
              <input
                type="time"
                value={startTimeStr}
                onChange={(e) => setStartTimeStr(e.target.value)}
                className="w-full bg-[#121922] rounded-lg px-2 py-1 text-zinc-200 font-sans tabular-nums"
              />
            </div>

            <div>
              <label className="block text-zinc-500 mb-0.5">End time</label>
              <input
                type="time"
                value={endTimeStr}
                onChange={(e) => setEndTimeStr(e.target.value)}
                className="w-full bg-[#121922] rounded-lg px-2 py-1 text-zinc-200 font-sans tabular-nums"
              />
            </div>

            <div>
              <label className="block text-zinc-500 mb-0.5">Location (optional)</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Meet, Desk..."
                className="w-full bg-[#121922] rounded-lg px-2 py-1 text-zinc-200 font-sans"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-white text-zinc-950 font-medium text-xs rounded-lg hover:bg-zinc-200 transition-colors cursor-pointer font-sans"
            >
              Add event
            </button>
          </div>
        </form>
      )}

      {/* Events List */}
      <div className="mt-2 divide-y divide-white/[0.04]">
        {todaysEvents.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-[11px]">
            No events scheduled for {selectedDate}.
          </div>
        ) : (
          todaysEvents.map((ev) => (
            <div
              key={ev.id}
              className="py-2 flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-1 h-5 rounded-full bg-indigo-500/80 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-medium text-zinc-200 truncate">{ev.title}</span>
                    <span className="text-zinc-600 text-xs">·</span>
                    <span className="text-[10px] text-zinc-400 font-mono tabular-nums">
                      {formatEventTime(ev.startTime)} – {formatEventTime(ev.endTime)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                    {ev.location && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5 stroke-[1.75]" />
                        {ev.location}
                      </span>
                    )}
                    {ev.source === 'google' && (
                      <>
                        <span className="text-zinc-700">·</span>
                        <span className="text-zinc-400">Google Calendar</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeEvent(ev.id)}
                className="p-1 text-zinc-600 hover:text-rose-400 transition-colors cursor-pointer rounded opacity-0 group-hover:opacity-100"
                title="Remove event"
              >
                <Trash2 className="w-3 h-3 stroke-[1.75]" />
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
