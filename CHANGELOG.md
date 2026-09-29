# Changelog

All notable changes to the Axis application will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.2.0] - 2026-09-29

### Added
- **Three Native Android Home Screen Widgets** (RemoteViews-based, zero WebView overhead):
  - **Daily Color Quick-Log Widget (2x1 / 2x2)**:
    - Five small circular buttons for Red (`#ef4444`), Orange (`#f97316`), Yellow (`#f59e0b`), Green (`#10b981`), and Gold (`#eab308`).
    - One-tap rating directly from the home screen without launching the app or requiring confirmation.
    - Active rating displays a filled state with high-contrast indicator while dimming the other circles.
    - Accidental un-rating protection (tapping already-selected rating is a no-op).
    - Tap or hold on header opens full Daily Review page to write daily notes.
  - **Salah Tracker Widget (4x2)**:
    - Five compact rows (Fajr, Zuhr, Asr, Maghrib, Isha) each featuring dedicated Solo and Bajamat icon buttons.
    - One-tap logging directly from home screen; tapping active state toggles it off (matches in-app behavior).
    - Tapping any prayer name navigates directly to the Salah Tracker view in-app.
  - **Today's Habits Checklist Widget (4x3)**:
    - Scrollable list powered by Android `RemoteViewsService` and `RemoteViewsFactory`.
    - Live progress title bar tracking "X of Y done".
    - Interactive checkboxes toggle completion immediately; anchor habits display flame indicators.
    - Tapping habit names deep-links to habit details in the app.
  - **Cross-Layer Data Synchronization & Offline Persistence**:
    - Backed by persistent Android `SharedPreferences` (`AxisWidgetPrefs`) ensuring widgets work immediately after device reboots.
    - Two-way Capacitor native plugin (`AxisWidgetPlugin`) and TypeScript service (`nativeWidgetService`) syncing app changes to widgets and merging offline widget updates into Firestore on app launch.
  - **Native Light/Dark Theme Adaptation**:
    - Automatic theme adaptation using Android resource qualifiers (`values/colors.xml` and `values-night/colors.xml`).
  - **Full Manifest & Provider Registrations**:
    - `DailyColorWidgetProvider`, `SalahWidgetProvider`, `HabitsWidgetProvider`, and `HabitsWidgetService` declared in `AndroidManifest.xml` with widget XML metadata.

## [v1.1.0] - 2026-09-29

### Added
- **Configurable Phone Swipe Gestures**:
  - Full-screen horizontal swipe gesture navigation across mobile views (Dashboard ⇄ Salah ⇄ Habits ⇄ Tasks ⇄ Calendar ⇄ Reviews ⇄ Settings).
  - Customizable task swipe actions with separate Left Swipe and Right Swipe configurations:
    - **Delete**: Quick-swipe deletion with rose indicator and confirmation.
    - **Complete / Undo**: Instant checkbox toggle with emerald check indicator.
    - **Expand**: Toggle expanded task details and attributes.
    - **Disabled**: Prevent gestures in specified directions.
  - Three-level gesture sensitivity calibration: **High** (35px), **Normal** (60px), and **Low** (100px).
  - Vertical-scroll conflict protection preventing accidental horizontal triggers when browsing lists.
  - Physical tactile haptic vibration pulse on gesture threshold activation.
  - Interactive **Live Gesture Test Playground** in Settings for immediate tactile testing.
- **Synthesized Alarm Ringtone System for Salah Prayer Reminders**:
  - In-browser Web Audio API synthesizer generating authentic alarm ringtones without external asset downloads.
  - 5 sound profiles: **Classic Alarm** (rhythmic digital beep), **Gentle Bell** (resonant acoustic prayer bell), **Melodic Chime** (ascending acoustic harmonic notes), **Digital Pulse** (crisp radar pulse), and **Singing Chime** (mindfulness bowl).
  - Default **5-minute continuous alarm ringing** with configurable duration presets (1, 2, 3, 5, 10, 15, 30 minutes).
  - Per-prayer overrides allowing custom times and sound profiles for Fajr, Zuhr, Asr, Maghrib, and Isha.
  - **Instant Silence Alarm** control from toast alert with live countdown display (`4:59 left`).
  - Alarm sound preview and full simulation test button in Prayer Reminder settings.
- **GitHub Community & Open-Source Contribution Portal**:
  - In-app **Contribute to Axis** modal with one-click repository clone command, issue reporter, pull request guide, and developer setup instructions.
  - Dedicated **Release Notes & What's New** viewer with cross-platform download links for Android APK and Windows Desktop installers.
  - Header release badge (`v1.1.0`) and repository links throughout Settings and Navigation.
- **Open-Source Documentation**:
  - Comprehensive `CONTRIBUTING.md` guide covering setup, branch workflows, capacitor sync, and PR submission standards.

### Changed
- Elevated `MobileTaskRow` to dynamically honor configured left and right swipe actions, thresholds, and haptic feedback.
- Updated Settings page with dedicated **Phone Swipe Gestures** card and **GitHub & Open Source Release** hub.
- Synchronized release workflow tag defaults to `v1.1.0`.

## [v1.0.0] - 2026-09-25

### Added
- **"Instrument, Not App" Direction**: Comprehensive visual overhaul inspired by compass navigation instruments.
- **CompassDialGauge Component**: Precision circular gauge featuring 5% calibration ticks, signal violet sweep arc, dial teal secondary reference line, and pivoting needle with depth bevel.
- **Signature Motion**: Smooth mechanical settle and calibration animation (~450ms) on logging daily evaluations.
- **Radial Habit Indicators**: Dynamic SVG circular progress rings tracking daily completion status and 30-day consistency momentum.
- **Cross-Platform Release Automation**: GitHub Actions workflow supporting multi-platform artifacts (Android APK, Windows, and Linux).
- **Security Hardening**: Sanitized gitignore rules and environment variable isolation for all Firebase and cloud credentials.

### Changed
- Replaced flat segmented pill tab controls with minimal underline tabs on Tasks and Habits.
- Standardized tactile borders and 6-8px border radius across all cards, dialogs, inputs, and tables.
- Upgraded headline statistics and telemetry digits to tabular JetBrains Mono font.

### Security
- Isolated Firebase API keys and cloud configurations to environment variables.
- Added ignore patterns for `firebase-applet-config.json`, `google-services.json`, and `.env` files.
