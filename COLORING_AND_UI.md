# Axis — Color System & Frontend UI Architecture

This document defines the complete visual design system, color tokens, typography, component guidelines, and UI architecture for **Axis**.

---

## 1. Core Brand & Accent Colors

Axis uses a deliberate, disciplined color hierarchy centered on a refined electric violet/indigo accent paired with deep obsidian surfaces.

| Role | Token Name | Hex Value | RGB / HSL | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Accent** | `color-accent-primary` | `#8b7bff` | `rgb(139, 123, 255)` | Main brand buttons, active tabs, FAB, focus rings, gauge needles |
| **Accent Hover** | `color-accent-hover` | `#7a68fc` | `rgb(122, 104, 252)` | Button hover states, interactive highlight |
| **Accent Glow** | `color-accent-glow` | `rgba(139, 123, 255, 0.25)` | `rgba(...)` | Box shadows on active controls and FAB button |
| **Accent Subtle Bg**| `color-accent-subtle` | `rgba(139, 123, 255, 0.12)` | `rgba(...)` | Background tint for active icon wrappers and selected pills |

---

## 2. Surface & Theme Color Matrix

Axis features a dual-theme architecture supporting both system preference and manual toggle:

### Dark Mode (Primary Default)
Optimized for high-focus, minimal eye strain, with deep obsidian void tones.

| Element | Hex / Tailwind Token | Notes |
| :--- | :--- | :--- |
| **Canvas Background** | `#0a0a0f` (`bg-[#0a0a0f]`) | Midnight obsidian void background |
| **Card / Surface** | `#131320` (`bg-[#131320]`) | Primary container surface (widgets, modal bodies, task panels) |
| **Elevated Surface** | `#18192a` (`bg-[#18192a]`) | Secondary elevated components, modal headers, list row hovers |
| **Subtle Elevated** | `#181829` / `#252538` | Segmented controls, input fields, dropdown backgrounds |
| **Card Border** | `rgba(255, 255, 255, 0.08)` | Default card border |
| **Emphasized Border**| `rgba(255, 255, 255, 0.14)` | Hover states, active modal frames, focused inputs |
| **Primary Text** | `#ece9fb` | High-contrast, soft-tinted off-white for body and headers |
| **Secondary Text** | `#7d7a96` | Subtitles, labels, metadata, inactive icons |
| **Tertiary Text** | `#524f6e` | Micro-copy, timestamp separators, unselected options |

### Light Mode
Clean, crisp, clinical paper aesthetic with warm lavender undertones.

| Element | Hex / Tailwind Token | Notes |
| :--- | :--- | :--- |
| **Canvas Background** | `#f8f7fc` (`bg-[#f8f7fc]`) | Soft alabaster background |
| **Card / Surface** | `#ffffff` (`bg-white`) | Clean white card surfaces |
| **Elevated Surface** | `#f4f2fb` (`bg-[#f4f2fb]`) | Secondary panels, subtle container fills |
| **Card Border** | `#e7e4f4` (`border-[#e7e4f4]`) | Subtle, low-contrast separation border |
| **Primary Text** | `#18172b` | Deep dark obsidian for crisp legibility |
| **Secondary Text** | `#64748b` | Neutral slate for supporting labels and details |

---

## 3. The 5 Daily Review Rating Colors

Used across the **Daily Color Quick-Log Widget**, **Dashboard Gauges**, **Calendar Heatmap**, and **Android Home Screen Widget**.

```
[ Red ]      [ Orange ]     [ Yellow ]     [ Green ]      [ Gold ]
#ef4444      #f97316        #facc15        #22c55e        #ca8a04
```

| Rating Score | Label | Hex Code | Border / Ring | Semantic Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **1 - Red** | Critical Miss | `#ef4444` | `border-red-500` | Uncalibrated day, discipline breakdown |
| **2 - Orange** | Sub-par | `#f97316` | `border-orange-500` | Moderate friction, key commitments slipped |
| **3 - Yellow** | Baseline | `#facc15` | `border-yellow-400` | Pure vibrant yellow (distinct from orange/gold) |
| **4 - Green** | Strong Execution | `#22c55e` | `border-emerald-500`| High discipline, tasks and habits fulfilled |
| **5 - Gold** | Peak Mastery | `#ca8a04` | `border-amber-600` | Saturated gold-olive tone (distinct from yellow/orange) |

---

## 4. Salah Tracker Color Discipline

In keeping with Axis's **zero visual clutter rule**, colors in the Salah Tracker carry functional meaning and **must never reuse any of the 5 day-rating colors**:

* **Bajamat (With Congregation)**:
  * Indicator: `#8b7bff` (Primary Accent Violet)
  * Background fill: `rgba(139, 123, 255, 0.15)`
  * Border: `rgba(139, 123, 255, 0.40)`
* **Solo (Individual Prayer)**:
  * Indicator: `#7d7a96` (Neutral Slate)
  * Background fill: `rgba(125, 122, 150, 0.15)`
  * Border: `rgba(125, 122, 150, 0.40)`
* **Unlogged / Incomplete**:
  * Indicator: `#524f6e` (Muted Slate / Outline)
  * Background fill: Transparent / `rgba(255, 255, 255, 0.03)`
* **Anchor Habit Reminder**:
  * Strictly neutral/gentle (`#8b7bff` with slate copy) — **never aggressive red**, preserving psychological safety.

---

## 5. Task Priority Indicators

Priority dots and indicators strictly use a **4-tier grayscale/neutral intensity scale** (NEVER the 5 day-rating colors or blue):

| Priority | Dot Count / Level | Text / Dot Color | Background Fill (Subtle) |
| :--- | :--- | :--- | :--- |
| **Low** | 1 hollow outline circle | `text-zinc-500` (`#71717a`) | Transparent / `rgba(255, 255, 255, 0.03)` |
| **Medium** | 1 solid dot + 2 outlines | `text-zinc-400` (`#a1a1aa`) | Subtle zinc fill |
| **High** | 2 solid dots + 1 outline | `text-zinc-200` (`#e4e4e7`) | Medium zinc fill |
| **Urgent** | 3 solid dots (filled) | `text-white` (`#ffffff`) | Prominent zinc/white fill |

---

## 6. Habit Types & Streaks

* **Build Habit (+)**: `#10b981` (Emerald) — Positive reinforcement.
* **Break Habit (-)**: `#f43f5e` (Rose) — Friction awareness.
* **Anchor Habit (⚓)**: `#8b7bff` (Violet) — Key keystone habit with flame icon (`#f59e0b`).
* **Active Streak Flame**: `#f97316` / `#f59e0b` gradient.

---

## 7. Typography System

| Role | Font Family | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| **Primary UI Body** | `Inter`, sans-serif | `font-sans` | All standard UI text, dialogs, buttons, paragraphs |
| **Metrics & Numbers** | `JetBrains Mono`, monospace | `font-mono` | Stat cards, percentages, streak counters, tabular data |
| **Timestamps & Codes**| `JetBrains Mono`, monospace | `font-mono text-xs` | Times (`05:30 AM`), shortcuts, version badges |

### Micro-Typography Discipline
* **Tabular Numbers**: `[data-tabular]` and `font-variant-numeric: tabular-nums` are enforced to avoid layout jitter during live counter increments.
* **Tracking**: `-0.011em` for body typography to provide dense, crisp, modern rendering.
* **Uppercase Labels**: Small section titles (`text-[10px] uppercase tracking-wider font-mono text-[#7d7a96]`).

---

## 8. Frontend UI Component Architecture

```
src/
├── components/
│   ├── DashboardView.tsx          # Main high-density overview canvas
│   ├── DashboardQuickAddFAB.tsx   # Floating Action Button (FAB) + Rapid input modal
│   ├── QuickLogWidget.tsx         # Direct 5-color daily review logger
│   ├── SalahTodayStrip.tsx        # 5-cell prayer status strip
│   ├── DashboardStatCards.tsx     # 4 core metric cards with trend indicators
│   ├── DashboardLists.tsx         # Today's active habits, tasks, and calendar events
│   ├── DashboardMiniTrends.tsx    # Sparklines and 7/30-day velocity charts
│   ├── CompassDialGauge.tsx       # Physics-calibrated mechanical needle dial
│   ├── MobileTaskRow.tsx          # Touch-optimized task row with swipe actions
│   ├── MobileTabBar.tsx           # Floating mobile navigation bar with bottom sheet
│   ├── Sidebar.tsx                # Desktop collapsible navigation rail
│   └── Header.tsx                 # Date picker, today shortcut, GitHub & version controls
```

### Key UI Features & Micro-Interactions

1. **Quick Add FAB (`DashboardQuickAddFAB.tsx`)**:
   * Desktop shortcut: Press <kbd>Q</kbd> anywhere on Dashboard to trigger rapid entry.
   * Dual-mode segmented tab switch: **New Task** $\leftrightarrow$ **New Habit**.
   * Autofocus inputs and <kbd>Enter</kbd> submission.
   * Confetti burst on habit creation; toast banner confirmation.

2. **Mechanical Compass Dial Needle (`CompassDialGauge.tsx`)**:
   * Uses spring cubic-bezier animation: `cubic-bezier(0.34, 1.56, 0.64, 1)`.
   * Simulates an analog precision gauge settling onto today's discipline rating.

3. **Configurable Mobile Swipe Rows (`MobileTaskRow.tsx`)**:
   * Customizable left/right actions: **Delete** (`#f43f5e`), **Complete** (`#22c55e`), **Expand**, or **None**.
   * 3-level sensitivity threshold calibration with tactile vibration feedback (`navigator.vibrate`).

4. **Android Native RemoteViews Widgets**:
   * Color-matched XML drawables (`res/drawable/widget_circle_*.xml`).
   * Automatic system day/night support via `res/values/colors.xml` and `res/values-night/colors.xml`.
