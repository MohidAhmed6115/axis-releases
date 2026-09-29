# Axis — System Specification, Features & Design Architecture

**Version**: `2.4.0`  
**Application**: Axis (Accountability & Daily Productivity)  
**Date**: September 23, 2026  

---

## 1. Overview & Core Philosophy

**Axis** is a cross-platform personal productivity and self-accountability system designed for high-discipline execution. Unlike traditional habit trackers or task apps that treat all days as equal checklist counts, Axis anchors personal performance to a calibrated **Daily Color Rating Matrix** backed by habit rigor, task discipline, milestone tracking, and distraction telemetry.

### Visual & Architectural Directives
- **Dense Analytics Dashboard**: Modeled after Notion and Linear with maximum data density, zero decorative fluff, and clear typographic hierarchy.
- **Persistent Icon-First Sidebar**: Always accessible across all form factors (collapsed icon-only `w-14` by default; expandable to `w-52` on tap/hover).
- **Zero Pill / Anti-AI Slop**: No oversized pill buttons, generic floating gradients, or low-contrast cards. Surfaces use subtle tonal borders (`border-white/[0.06]` on `#0b0f14` dark backgrounds, neutral slates in light mode).
- **Color Discipline**: Accent colors (Red, Orange, Yellow, Green, Gold) are strictly reserved for day performance evaluation, streaks, and risk telemetry. Checkboxes and standard actions remain clean monochrome/slate.

---

## 2. Brand Identity & Logo

- **Symbol**: A compass-cross brandmark featuring four directional arrow arms anchored to a central circular golden hub, systematically mapped to the 5-tier evaluation scale:
  - **North Arm (Red / `#ef4444`)**: Restraint relapse, high friction, emergency reset required.
  - **West Arm (Green / `#10b981`)**: Steady discipline, core habits fulfilled, standard execution.
  - **East Arm (Gold / `#eab308`)**: Pinnacle effort, milestone breakthrough, exceptional performance.
  - **South Arm (Orange / `#f97316`)**: Subpar maintenance, minor habit slippage, correction needed.
  - **Central Hub (Yellow / `#f59e0b` with crisp dark outline)**: Midpoint axis of self-evaluation, hesitation, or uncalibrated baseline.
- **Integration Points**:
  - Browser favicon and Apple Touch Icon (`/axis_logo.png`).
  - Persistent Sidebar brand trigger.
  - Account Sign-in / Cloud sync authentication modal.
  - System Specification Card in Settings.

---

## 3. Navigation Architecture

### 3.1. Desktop Navigation (Collapsible Sidebar)
Desktop viewports (>=768px) feature an icon-first collapsible sidebar:
- **Collapsed Mode (`w-14`)**: Displays vertically stacked tool icons with tooltip hints.
- **Expanded Mode (`w-52`)**: Slides open to reveal full page labels.
- **Primary Routes**:
  1. **Dashboard** (`/`): High-level operational overview, quick-log review, summary tables, and mini trend sparklines.
  2. **Habits** (`/habits`): Full habits directory, streak counts, 30-day mini bars, habit classification filters, inline habit builder, and Recharts Weekly Trend chart.
  3. **Tasks** (`/tasks`): Priority-ranked action items, due times, recurring items, and direct links to habit routines.
  4. **Calendar** (`/calendar`): Month, Week, and Day views with Google Calendar OAuth sync and milestone tracking.
  5. **Daily Review** (`/reviews`): 10-week (70-day) accountability heatmap matrix, streak history, rating distribution, and reflective notes.
  6. **Screen-Time** (`/screentime`): Android-specific distraction telemetry, package registry, duration simulator, and 14-day correlation chart.
  7. **Settings** (`/settings`): Appearance themes (Light, Dark, System), platform simulation mode, guest/cloud sync state, and notification preferences.
- **Account & System Popover (Sidebar Bottom)**:
  - User status indicator (Guest / Authenticated Google User).
  - Quick sign-in trigger with non-destructive local data merge.
  - Quick platform switch (Android / Desktop).
  - Quick theme switch (Dark / Light).

### 3.2. Mobile Navigation (Bottom Tab Bar)
Mobile viewports (<768px) use **only** the 5-tab bottom bar (`hidden md:flex` hides sidebar):
- **5 High-Priority Tabs**:
  1. **Home** (Dashboard)
  2. **Habits**
  3. **Tasks**
  4. **Calendar**
  5. **More** (opens a clean bottom sheet with Daily Review, Screen-Time, Settings, and Account sign-in/profile management)
- **Active State**: Monochrome neutral highlight pill (`bg-white/[0.12]` in dark, `bg-slate-200` in light) — strictly avoids red/orange/yellow/green/gold rating colors.
- **Form Factor**: 56–60px standard height with safe-area padding (`env(safe-area-inset-bottom)`).

---

## 4. Feature Specifications

### 4.1. Dashboard (Command Center)
- **Top Metric Cards**:
  - **Habit Completion**: Real-time percentage of today's active habits marked complete.
  - **Task Completion**: Percentage and ratio of pending vs. completed tasks for the selected date.
  - **Streak Counter**: Consecutive green and gold days running count with active flame styling.
  - **7-Day Quality Score**: Micro bar chart displaying performance colors for the last 7 calendar days.
  - **Upcoming Events**: Immediate count of scheduled milestones and synchronized calendar entries.
- **Quick-Log Self-Review Widget**:
  - Horizontal selector with 5 distinct color tokens (Red, Orange, Yellow, Green, Gold).
  - Intelligent auto-suggestion based on current habit completion:
    - `< 50%` habits &rarr; Yellow / Orange suggested.
    - `100%` habits &rarr; Green / Gold suggested.
  - Selected rating badge with descriptive evaluation criteria (e.g., *"Strong execution, core habits fulfilled, minimal distraction"*).
  - Single-line reflection note input (`"Key takeaway or win..."`).
  - Single-click immediate save to local storage and Firestore.
- **Compact Summary Tables**:
  - **Today's Habits**: Single-tap toggle checkboxes, streak counter, and direct navigation link to full habits view.
  - **Today's Tasks**: Priority indicator dots, due time tags, and completion strikethrough.
  - **Upcoming Milestones**: Chronological agenda list with time markers.
- **Mini Trends & Sparklines**:
  - 7-day and 30-day interactive sparkline toggles for habit adherence percentage.
  - Stacked distribution chart detailing historical allocation of Gold, Green, Yellow, Orange, and Red days.

### 4.2. Habits Management (`/habits`)
- **Classification**:
  - `build` habits: Target routines to establish (e.g., *Deep Work, Morning Workout, Reading*).
  - `break` habits: Negative routines to eliminate (e.g., *Late Night Doomscrolling, Sugar Spikes*).
  - `anchor` habits: Foundational non-negotiable keystones (e.g., *Sleep Schedule, Daily Review*).
- **Time-of-Day Categorization**: Morning, Afternoon, Evening, Anytime.
- **Analytics & History**:
  - Current streak and best streak counters per habit.
  - 30-day completion progress bar with completion rate percentages.
  - **Weekly Trend Area Chart (Recharts)**:
    - Interactive 7-day rolling completion rate curve with subtle emerald gradient fill (`AreaChart`).
    - Metric chips displaying 7-Day Average rate, Best Day with crown badge, and Today's completion rate.
    - Custom glassmorphism dark/light tooltip detailing day, percentage, and exact completed vs. total count.
- **Controls**:
  - Filter tabs: `All`, `Build`, `Break`, `Anchor`, `Archived`.
  - Inline habit creation modal with frequency configuration (`daily`, `weekdays`, `weekends`, or specific days of week).
  - Habit archiving and permanent deletion.

### 4.3. Tasks & Action Items (`/tasks`)
- **Responsive Architecture**:
  - **Mobile Layout (<640px)**:
    - High-density compact task rows fitting 5-6 tasks on screen without scrolling.
    - Single-line title with ellipsis truncation, tap to expand full details drawer and metadata.
    - Compact priority dot indicator (without verbose badge on mobile view).
    - Compact due date/time format (`Today 9:30pm`, `Tmrw 10:00am`, `9/24 2:00pm`).
    - Touch gesture: Swipe left to reveal red delete button, eliminating persistent column clutter.
    - Bottom right Floating Action Button (FAB `+`) opening the task creation bottom sheet / modal.
  - **Desktop Layout (>=640px)**:
    - Retains original dedicated inline "New Task Item" creation form with priority selector, due date, time, linked habit dropdown, and "Add to Google Calendar" toggle.
    - Full desktop filter toolbar with segmented tabs (Status, Date Scope, Priority) and reset action.
    - Comprehensive data table with status checkboxes, title, priority pill badges, monospace due dates, habit references, and action column.
- **Priority Tiering (Neutral Grayscale Dot Scale)**:
  - Strict Color Discipline: Color tokens (Red, Orange, Yellow, Green, Gold) are strictly prohibited in task rows so they never visually compete with the daily evaluation ratings.
  - Priority levels utilize a 4-tier grayscale density and dot hierarchy:
    - `urgent` (3 solid dots, high-contrast pure white pill / deep slate outline, bold monospace)
    - `high` (2 solid dots, 1 hollow dot, zinc-200 / slate-700)
    - `medium` (1 solid dot, 2 hollow dots, zinc-400 / slate-500)
    - `low` (3 hollow/outlined dots, muted zinc-600 / slate-400)
- **Google Calendar Task Auto-Sync**:
  - Per-task "Add to Calendar" toggle in the Task Creation Modal / Bottom Sheet.
  - Global user preference in Settings: *"Automatically add new tasks to Calendar"* (defaults to false).
  - Sync requires both due date and due time to map cleanly to calendar schedule (defaults to 30-minute event block).
  - Bidirectional lifecycle sync:
    - Automatic creation on Google Calendar using stored `calendarEventId`.
    - Real-time updates when title, due date, due time, or completion status changes.
    - Automatic event deletion on Google Calendar when the task is deleted or the calendar sync toggle is turned off.
    - Graceful non-blocking error handling if OAuth token is expired or event was deleted externally.
    - Integrated with Calendar view, displaying synced task events across month, week, and day views.
- **Routine Integration**:
  - Link individual tasks to parent habits (e.g., link *"Draft Q3 Deck"* to *"Deep Work"* habit).
- **Recurrence & Scheduling**:
  - Optional due date and due time (24h format).
  - Recurring flags (`daily`, `weekly`).

### 4.4. Calendar & Milestones (`/calendar`)
- **Multi-View Modes**:
  - **Month View**: Traditional calendar grid with event dots and milestone badges.
  - **Week View**: 7-day column layout for hour-by-hour planning.
  - **Day View**: Single-day agenda with milestone times.
- **Google Calendar Integration**:
  - Direct 1P OAuth integration to pull live events from Google Calendar.
  - Synchronized badge displays and link-back references.
- **Local Milestones**:
  - Create color-coded milestones (deadlines, exams, launches) stored locally or synced to Firestore.

### 4.5. Daily Review History & Matrix (`/reviews`)
- **Accountability Heatmap**:
  - 10-week (70-day) grid matrix rendering full historical performance.
  - Visual color tokens mapped directly to user evaluations.
- **Quantitative Analytics**:
  - Win Rate calculation: `(Green + Gold days) / Total reviewed days * 100`.
  - Current streak and All-Time Best streak tracking.
  - Breakdown breakdown statistics (Total count and percentage for each color tier).
- **Reflection Notes Archive**:
  - Chronological audit log showing user-written daily reflections and wins.

### 4.6. Screen-Time & Distraction Telemetry (`/screentime`)
- **Android Platform Exclusive**: Accessible when platform is set to `android`.
- **Package Telemetry Registry**:
  - Pre-populated high-risk apps (e.g., TikTok, Instagram, Twitter/X, YouTube).
  - Add / remove custom Android package IDs.
- **Usage Breakdown**:
  - Total screen time vs. Flagged high-risk minutes.
  - Threshold alerts: `< 90m` Optimal (Green), `90-180m` Warning (Amber), `> 180m` Exceeded (Red).
  - Interactive simulator slider for per-app duration adjustments.
- **Correlation Chart**:
  - 14-day bar chart plotting flagged usage minutes against daily performance color ratings.

### 4.7. Settings & Preferences (`/settings`)
- **Appearance & Theme**:
  - **Light Mode**: High-contrast, clean slate background (`#f8fafc`) with dark slate typography.
  - **Dark Mode**: Deep OLED/Linear dark background (`#0b0f14`, surfaces `#121822`) with neutral zinc accents.
  - **System Default**: Automatically reacts to `window.matchMedia('(prefers-color-scheme: dark)')`.
- **Platform Experience**:
  - Switch between **Android** (screen-time enabled, 390px mobile viewport toggle available) and **Desktop** (clean expansive layout).
- **Account & Cloud Sync**:
  - Guest mode indicator with local-storage persistence.
  - Firebase Authentication (Email/Password or Google Sign-In).
  - Seamless automatic merge: Guest habits, tasks, and daily reviews are imported into Firestore on login without data loss.
- **Notification Preferences**:
  - Daily review reminder time setting (default `21:00`).
  - Do Not Disturb focus session muting.

---

## 5. Technology Stack & Data Model

| Layer | Technologies |
|---|---|
| **Framework** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS v4, Lucide React Icons |
| **Fonts** | Plus Jakarta Sans (UI Headings & Body), JetBrains Mono (Telemetry & Metrics) |
| **Storage (Guest)** | Browser `localStorage` with JSON serialization |
| **Storage (Cloud)** | Google Cloud Firestore (provisioned database `ai-studio-a40bab5b-897c-468d-a352-369a7b44d7a1`) |
| **Authentication** | Firebase Auth (Google Auth & Email/Password) |
| **External Integrations**| Google Calendar API via OAuth scopes |

### Data Entities
1. **`Habit`**: `id`, `name`, `category`, `type` (`build` | `break` | `anchor`), `timeOfDay`, `streak`, `bestStreak`, `frequency`, `completionHistory` (`{ [date: string]: boolean }`), `archived`.
2. **`TaskItem`**: `id`, `title`, `priority` (`low` | `medium` | `high` | `urgent`), `dueDate`, `dueTime`, `completed`, `linkedHabitId`, `isRecurring`, `recurringInterval`.
3. **`DailyRecord`**: `date`, `color` (`red` | `orange` | `yellow` | `green` | `gold`), `note`, `screenTime` (`{ totalMinutes, highRiskMinutes }`).
4. **`ScreenTimeSettings`**: `highRiskApps` (`string[]`), `simulatedScreenTime` (`{ totalMinutes, highRiskMinutes, apps }`).

---

## 6. Color Evaluation Criteria

| Rating | Color | Hex | Definition |
|---|---|---|---|
| **Gold** | Gold | `#eab308` | Exceptional execution, all core habits completed, zero high-risk distractions, significant milestone progress. |
| **Green** | Emerald | `#10b981` | Solid standard performance, habit adherence satisfied, controlled screen-time. |
| **Yellow** | Amber | `#f59e0b` | Marginal day, acceptable tasks done but significant habit slippage or procrastination observed. |
| **Orange** | Orange | `#f97316` | Subpar day, multiple habits missed, high distraction time, corrective action needed. |
| **Red** | Rose | `#ef4444` | Off-track day, zero habit compliance, excessive distraction, urgent reset required tomorrow. |
