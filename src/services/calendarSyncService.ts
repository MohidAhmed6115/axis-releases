import { CalendarEvent } from '../types';

const GCAL_ACCESS_TOKEN_KEY = 'axis_gcal_access_token';

export function getStoredGCalToken(): string | null {
  return localStorage.getItem(GCAL_ACCESS_TOKEN_KEY);
}

export function setStoredGCalToken(token: string | null): void {
  if (token) {
    localStorage.setItem(GCAL_ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(GCAL_ACCESS_TOKEN_KEY);
  }
}

/**
 * Creates, updates, or deletes Google Calendar events using the live Google Calendar API
 * via OAuth Bearer token. Falls back gracefully to local calendar state if token isn't available
 * or expires.
 */
export async function syncTaskToGoogleCalendar(
  task: {
    id: string;
    title: string;
    dueDate?: string;
    dueTime?: string;
    completed: boolean;
    calendarEventId?: string;
  }
): Promise<{ eventId?: string; error?: string }> {
  const token = getStoredGCalToken();

  // If no due date, we cannot place it on the calendar
  if (!task.dueDate) {
    return {};
  }

  // Calculate start/end ISO
  let startObj: { dateTime?: string; date?: string; timeZone?: string } = {};
  let endObj: { dateTime?: string; date?: string; timeZone?: string } = {};

  if (task.dueTime) {
    const startIso = `${task.dueDate}T${task.dueTime}:00`;
    // Default 30-min duration for calendar event
    const startDate = new Date(startIso);
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
    const endIso = endDate.toTimeString().slice(0, 5);
    const endIsoFull = `${task.dueDate}T${endIso}:00`;

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    startObj = { dateTime: new Date(startIso).toISOString(), timeZone: userTimeZone };
    endObj = { dateTime: new Date(endIsoFull).toISOString(), timeZone: userTimeZone };
  } else {
    // All-day event
    startObj = { date: task.dueDate };
    // End date for all-day events in Google Calendar is exclusive (next day)
    const nextDay = new Date(task.dueDate + 'T00:00:00');
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];
    endObj = { date: nextDayStr };
  }

  const eventPayload = {
    summary: task.completed ? `✓ ${task.title}` : task.title,
    description: `Axis Task Item [id: ${task.id}]. Status: ${task.completed ? 'Completed' : 'Pending'}.`,
    start: startObj,
    end: endObj,
  };

  // If we have an active Google OAuth token, make the direct Google Calendar API call
  if (token) {
    try {
      if (task.calendarEventId) {
        // UPDATE existing Google Calendar event
        const res = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(task.calendarEventId)}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventPayload),
          }
        );

        if (res.ok) {
          const data = await res.json();
          return { eventId: data.id || task.calendarEventId };
        } else if (res.status === 404) {
          // Event was deleted directly by user on Google Calendar; recreate it
          return await createNewGCalEvent(token, eventPayload);
        } else if (res.status === 401) {
          console.warn('Google Calendar OAuth token expired');
          setStoredGCalToken(null);
          // Return existing ID so we don't break local state
          return { eventId: task.calendarEventId, error: 'token_expired' };
        }
      } else {
        // CREATE new Google Calendar event
        return await createNewGCalEvent(token, eventPayload);
      }
    } catch (err) {
      console.warn('Google Calendar API network error:', err);
      // Fallback gracefully without blocking task operation
      return { eventId: task.calendarEventId || `axis-gcal-${task.id}` };
    }
  }

  // Graceful fallback when token is not yet connected or in guest/local mode:
  // Generate a consistent pseudo-ID so internal calendar reflects the task event
  return { eventId: task.calendarEventId || `axis-cal-${task.id}` };
}

async function createNewGCalEvent(
  token: string,
  eventPayload: any
): Promise<{ eventId?: string; error?: string }> {
  try {
    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventPayload),
      }
    );

    if (res.ok) {
      const data = await res.json();
      return { eventId: data.id };
    } else if (res.status === 401) {
      setStoredGCalToken(null);
      return { error: 'token_expired' };
    }
  } catch (err) {
    console.warn('Error creating Google Calendar event:', err);
  }
  return {};
}

/**
 * Deletes a Google Calendar event if one exists.
 * Fails gracefully without throwing.
 */
export async function deleteGoogleCalendarEvent(calendarEventId: string): Promise<void> {
  if (!calendarEventId) return;

  const token = getStoredGCalToken();
  if (token && !calendarEventId.startsWith('axis-')) {
    try {
      await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(calendarEventId)}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
    } catch (e) {
      console.warn('Error deleting Google Calendar event:', e);
    }
  }
}
