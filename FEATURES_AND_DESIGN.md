# Axis — Current Features & Design Architecture Specification

**Version**: `2.5.0`  
**Application**: Axis (Accountability & Daily Productivity)  
**Date**: September 24, 2026  

---

## 1. Executive Summary & Product Architecture

**Axis** is a personal productivity, habit rigor, and self-accountability operating system designed for high-discipline execution. Unlike traditional habit trackers or task management applications that treat every day as an undifferentiated checklist count, Axis anchors personal performance to an objective **Daily Color Rating Matrix** backed by habit rigor, priority-ranked task execution, milestone tracking, and distraction telemetry.

The system operates across all viewports seamlessly:
- **Mobile Experience**: Tailored for fast one-handed mobile interactions with a 5-tab bottom navigation bar, high-density compact task rows with swipe gestures, and pull-up drawers.
- **Desktop Experience**: Information-dense dashboard reminiscent of Notion and Linear, featuring an icon-first collapsible sidebar (`w-14` to `w-52`), multi-column responsive grids, and full data tables.

---

## 2. Design Philosophy & Constitution

### 2.1. Anti-AI Slop & Zero Pill Discipline
- **Subtle Tonal Borders**: Surfaces use micro-tonal borders (`border-white/[0.06]` on dark surfaces, `border-slate-200` in light mode). No oversized floating card drop-shadows or generic gradient borders.
- **No Boxed Borders on Boolean Options**: Form options (such as "Recurring Task" and "Add to Google Calendar") are rendered as clean, plain rows with the label and explanatory microcopy on the left and a smooth toggle switch on the right, separated by thin 1px dividers or subtle spacing.
- **Toggle Switch Precision**: Switches feature a compact `w-9 h-5` track with a 16px circular thumb (`w-4 h-4`) encased in `p-[2px]`. The thumb travels smoothly by `translate-x-4` (16px), achieving an exact 2px margin on both the left (when OFF) and right (when ON) without stranded gaps or clipped edges.

### 2.2. Strict Color Discipline & Moral Scoring
Accent colors are strictly reserved for performance evaluation, streak heatmaps, and telemetry indicators:
- **Gold (`#eab308`)**: Pinnacle effort, breakthrough execution, milestone achievement.
- **Green (`#10b981`)**: Steady discipline, core habits fulfilled, standard execution.
- **Yellow (`#f59e0b`)**: Hesitation, acceptable tasks completed with habit slippage.
- **Orange (`#f97316`)**: Subpar maintenance, multiple habits missed, high distraction.
- **Red (`#ef4444`)**: Emergency reset required, restraint relapse, zero compliance.

**Monochrome Restraint for UI Controls**:
Standard UI checkboxes, selection tabs, priority dot indicators, and buttons strictly avoid using the day-rating color palette so they never compete with or dilute the daily moral score.

### 2.3. Typography & Hierarchy
- **Primary UI Font**: *Plus Jakarta Sans* (geometric sans-serif providing clarity and modern precision for headings, labels, and copy).
- **Telemetry & Monospace**: *JetBrains Mono* (used for timestamps, streak day counters, percentages, and metrics).

### 2.4. Surface Depth & Theming
- **Dark Mode (Default)**: Deep OLED background (`#070a0e` / `#0b0f14`), linear elevated surfaces (`#121822`), borders in `border-white/[0.08]`.
- **Light Mode**: High-contrast, clean slate background (`#f8fafc`), white card surfaces (`#ffffff`), borders in `border-slate-200`, text in slate-800/900.
- **System Mode**: Automatically follows `prefers-color-scheme`.

---

## 3. Navigation Architecture

### 3.1. Mobile Navigation (Bottom Tab Bar)
- **Exclusivity**: Used exclusively on mobile viewports (<768px). The sidebar is completely hidden on mobile (`hidden md:flex`).
- **5 High-Priority Tabs**:
  1. **Home / Dashboard**: Direct access to daily glanceable metrics, quick-log review, and summary checklists.
  2. **Habits**: Habit tracking, cadence filters, and weekly trend Recharts analytics.
  3. **Tasks**: Priority action items with swipe-to-delete and mobile floating action button (FAB).
  4. **Calendar**: Agenda view, week/day schedules, and Google Calendar events.
  5. **More**: Opens a bottom sheet menu providing secondary routes:
     - **Daily Review** (70-day accountability heatmap)
     - **Screen-Time** (distraction telemetry & app limits)
     - **Settings** (theme, calendar auto-sync preferences, notifications)
     - **Account Status**: Guest indicator or authenticated Google profile with one-tap sign-in/logout.
- **Active Tab Styling**: Filled icon with neutral monochrome highlight pill (`bg-white/[0.12]` in dark, `bg-slate-200` in light). Never uses colored day-rating tones.
- **Safe Area Support**: Standard 56–60px height with `pb-[max(0.5rem,env(safe-area-inset-bottom))]` for modern bezel-less phones.

### 3.2. Desktop Navigation (Collapsible Sidebar)
- **Default State**: Compact icon-only sidebar (`w-14`) with hover tooltip indicators.
- **Expanded State**: On hover or click, smoothly animates to `w-52` revealing full text labels.
- **Routes Directly Visible**: Dashboard, Habits, Tasks, Calendar, Daily Review, Screen-Time, Settings.
- **Pinned Account Popover**: Pinned at the bottom with theme switch, platform switch, and cloud sync status.

---

## 4. Current Core Features in Detail

### 4.1. Dashboard Command Center
- **Top Metric Cards**:
  - **Habit Completion**: Real-time percentage of today's habits marked complete.
  - **Task Completion**: Percentage and ratio of pending vs. completed tasks for the selected date.
  - **Current Streak**: Consecutive green and gold days running count with active flame styling.
  - **7-Day Quality Score**: Micro bar chart displaying performance colors for the last 7 calendar days.
  - **Upcoming Events**: Immediate count of scheduled milestones and synchronized calendar entries.
- **Quick-Log Self-Review Widget**:
  - Horizontal selector with 5 distinct color tokens (Red, Orange, Yellow, Green, Gold).
  - Intelligent auto-suggestion based on habit completion percentage (<50% suggests Yellow/Orange; 100% suggests Green/Gold).
  - Descriptive criteria text for each rating tier.
  - Single-line reflection note input ("Key takeaway or win...").
  - Single-tap immediate save to local storage and Firestore.
- **Compact Summary Tables**:
  - Today's Habits checklist with single-tap completion and streak counter.
  - Today's Tasks checklist with priority dots and due times.
  - Next 3–5 Upcoming Schedule milestones.
- **Glanceable Trends**:
  - 7-day and 30-day interactive sparkline toggles for habit adherence percentage.
  - Stacked distribution bar showing proportional historical distribution of Gold, Green, Yellow, Orange, and Red days.

### 4.2. Habits Management & Weekly Trend Analytics (`/habits`)
- **Classification System**:
  - `build` habits: Target routines to establish (e.g., Deep Work, Morning Workout, Reading).
  - `break` habits: Negative routines to eliminate (e.g., Late Night Doomscrolling, Sugar Spikes).
  - `anchor` habits: Foundational non-negotiable keystones that weigh heavily in the daily moral score.
- **Cadence & Filters**: Daily, Weekdays, Weekends, Weekly, and category tagging. Filter tabs: `All`, `Build`, `Break`, `Anchor`, `Archived`.
- **Habits Weekly Trend Chart (Recharts)**:
  - Interactive ResponsiveContainer AreaChart showing daily habit completion percentages over the rolling past 7 days.
  - Emerald-500 gradient fill with smooth monotone spline curve.
  - Key KPI summary chips: 7-Day Average completion rate, Best Day with crown icon, and Today's completion rate.
  - Custom glassmorphism tooltip showing date, weekday, percentage, and exact completed/total habit counts.
- **Habit Streaks & 30-Day Completion Rate**:
  - Real-time streak tracking per habit.
  - 30-day completion progress bar with completion rate percentages.
  - Confetti burst animation upon completing habits.

### 4.3. Tasks & Action Items (`/tasks`)
- **Mobile High-Density Layout (<640px)**:
  - Compact task rows fitting 5–6 tasks on screen without scrolling.
  - Ellipsis-truncated titles with expandable detail drawer.
  - Swipe-left touch gesture revealing a red delete action.
  - Floating Action Button (FAB `+`) anchored at bottom-right for rapid task creation.
- **Desktop Table Layout (>=640px)**:
  - Clean table with status checkboxes, task titles, priority dot indicators, monospace due dates, linked habits, and action buttons.
  - Slide-in side drawer for new task creation.
- **Priority Indicator (Neutral Grayscale Dot Scale)**:
  - `urgent`: 3 solid white dots inside a high-contrast dark badge.
  - `high`: 2 solid dots + 1 hollow dot.
  - `medium`: 1 solid dot + 2 hollow dots.
  - `low`: 3 hollow/outline dots.
  - Adheres strictly to the color discipline: no colored badges to prevent visual confusion with moral day ratings.
- **Routine Integration**:
  - Optional linkage of tasks to parent habits (e.g., linking "Draft report" to "Deep Work").

### 4.4. Google Calendar Task Auto-Sync
- **Task-Level Toggle**: "Add to Google Calendar" toggle available in task creation drawer and edit dialogs.
- **Global User Setting**: "Automatically add new tasks to Calendar" toggle in Settings (defaults to off). When enabled, newly created tasks with due date and time automatically sync without manual toggling.
- **Timing Requirements**:
  - Requires both Due Date and Due Time for precise 30-minute calendar block scheduling.
  - If time is omitted, tasks default to full-day calendar events.
- **Bidirectional Lifecycle**:
  - Stores returned Google Calendar `calendarEventId` on the `TaskItem`.
  - On edit to title, date, or time: automatically updates the existing event via PATCH using stored `calendarEventId`. Never creates duplicate events.
  - If toggle is switched OFF: automatically deletes the event from Google Calendar and clears `calendarEventId`.
  - If task is deleted: automatically deletes the calendar event.
  - Graceful non-blocking error handling: if OAuth token is expired or event was deleted externally, local save always succeeds and stale IDs are cleared.
  - Uses existing Google Calendar OAuth token (`axis_gcal_access_token`) shared with the Calendar page.

### 4.5. Calendar & Milestones (`/calendar`)
- **Multi-View Modes**:
  - **Month View**: Traditional calendar grid with event dots and milestone badges.
  - **Week View**: 7-day column layout for hour-by-hour planning.
  - **Day View**: Single-day agenda with milestone times.
- **1P Google Calendar Integration**:
  - Pulls live events directly via Google Calendar REST API using OAuth token.
  - Synchronized badge displays and task integration.
- **Local Milestones**:
  - Create color-coded milestones (deadlines, releases, exams) stored in local storage and synced to Firestore.

### 4.6. Daily Review History & Matrix (`/reviews`)
- **10-Week (70-Day) Accountability Matrix**:
  - Visual grid matrix rendering complete historical day ratings mapped to moral color tokens.
- **Quantitative Analytics**:
  - Win Rate calculation: `(Green + Gold days) / Total reviewed days * 100`.
  - Current streak and All-Time Best streak tracking.
  - Breakdown counts and percentages for each color tier.
- **Reflection Notes Archive**:
  - Chronological audit log of user-written daily reflections and wins.

### 4.7. Screen-Time & Distraction Telemetry (`/screentime`)
- **Platform Specificity**: Designed for Android telemetry simulation.
- **Package Telemetry Registry**:
  - Pre-populated high-risk apps (TikTok, Instagram, Twitter/X, YouTube).
  - Add and remove custom Android package IDs.
- **Telemetry Thresholds**:
  - `< 90m`: Optimal (Green)
  - `90-180m`: Warning (Amber)
  - `> 180m`: Exceeded (Red)
- **Interactive Simulator**:
  - Adjust simulated app durations via sliders to observe impacts on daily scores.
- **14-Day Correlation Chart**:
  - Plots flagged distraction usage minutes against daily performance color ratings.

### 4.8. Settings, Appearance & Cloud Sync (`/settings`)
- **Appearance & Themes**: Light, Dark, and System Default.
- **Platform Experience**: Toggle between Android and Desktop modes.
- **Account & Cloud Sync**:
  - Guest mode with instantaneous local storage persistence.
  - Firebase Authentication (Google Sign-In & Email/Password).
  - Non-destructive automatic merge: guest habits, tasks, and daily reviews are imported into Firestore on sign-in without data loss.
- **Notification Preferences**:
  - Configurable daily review reminder prompt time (default `21:00`).
  - Do Not Disturb focus hours toggle.

---

## 5. Technology Stack & Data Model

| Layer | Technologies |
|---|---|
| **Framework** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS v4, Lucide React Icons |
| **Charts & Visualizations** | Recharts (ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip) |
| **Fonts** | Plus Jakarta Sans (Headings/Body), JetBrains Mono (Numbers/Metrics) |
| **Storage (Guest)** | Browser `localStorage` with JSON serialization |
| **Storage (Cloud)** | Google Cloud Firestore (`ai-studio-a40bab5b-897c-468d-a352-369a7b44d7a1`) |
| **Authentication** | Firebase Auth (Google Auth & Email/Password) |
| **External Integrations** | Google Calendar API via OAuth Bearer token |

### Data Entities

```typescript
export interface Habit {
  id: string;
  name: string;
  type: 'build' | 'break';
  frequency: 'daily' | 'weekdays' | 'weekends' | 'weekly';
  isAnchor?: boolean;
  category: string;
  archived?: boolean;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  dueTime?: string;
  completed: boolean;
  completedAt?: string;
  linkedHabitId?: string;
  isRecurring?: boolean;
  recurringInterval?: 'daily' | 'weekly';
  addToCalendar?: boolean;
  calendarEventId?: string;
  order?: number;
  createdAt?: string;
}

export type DayColor = 'red' | 'orange' | 'yellow' | 'green' | 'gold' | null;

export interface DailyRecord {
  date: string;
  color: DayColor;
  note: string;
  reviewedAt?: string;
  completedHabitIds: string[];
  completedTaskIds: string[];
  screenTime?: {
    totalMinutes: number;
    highRiskMinutes: number;
  };
}
```
