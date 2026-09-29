# Contributing to Axis

Thank you for your interest in contributing to **Axis** — an instrument for daily self-mastery, spiritual discipline, and habit calibration.

We welcome contributions from developers, designers, and testers of all skill levels. Whether you are fixing a typo, adding a new swipe gesture, optimizing audio synthesis, or proposing major features, your help is appreciated.

---

## 🧭 Repository Information

- **Repository**: [MohidAhmed6115/axis-releases](https://github.com/MohidAhmed6115/axis-releases)
- **Releases & Binary Downloads**: [Releases](https://github.com/MohidAhmed6115/axis-releases/releases)
- **Issue Tracker**: [GitHub Issues](https://github.com/MohidAhmed6115/axis-releases/issues)

---

## 🛠️ Getting Started & Local Setup

### 1. Prerequisites
- **Node.js**: Version 20 or 22+
- **npm**: Version 9+
- **Git**
- *(Optional for Android)*: Android Studio & JDK 21
- *(Optional for Windows Desktop)*: Electron development tools

### 2. Fork and Clone
```bash
# 1. Clone your fork
git clone https://github.com/MohidAhmed6115/axis-releases.git

# 2. Enter project directory
cd axis-releases

# 3. Install dependencies
npm install
```

### 3. Running the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Code Quality & Type Checking
```bash
npm run lint
```
Axis enforces strict TypeScript checking without any compilation errors.

---

## 📱 Mobile & Desktop Workflows

### Android Mobile (Capacitor)
Axis uses Capacitor to bridge native Android capabilities (UsageStats, Haptics, Local Notifications, Offline Storage):
```bash
# Build web assets and sync to native Android wrapper
npm run build
npx cap sync android

# Open in Android Studio
npx cap open android
```
You can also run Gradle build commands directly:
```bash
cd android
./gradlew assembleDebug
```

### Windows Desktop (Electron)
Axis packages as a native Windows NSIS desktop app:
```bash
# Start Electron locally
npm run electron:start

# Build installer executable (.exe)
npm run electron:build
```

---

## 🚀 Contribution Guidelines

### 1. Creating a Feature Branch
Always work on a descriptive branch, not on `main`:
```bash
git checkout -b feature/configurable-swipe-gestures
# or
git checkout -b fix/alarm-audio-safari-unlock
```

### 2. Commit Message Conventions
We follow conventional commit standards:
- `feat:` for a new user-facing capability (e.g. `feat(gestures): add custom swipe right action for tasks`)
- `fix:` for a bug fix (e.g. `fix(audio): unlock AudioContext on initial touch event`)
- `docs:` for documentation updates (e.g. `docs: update release notes in CHANGELOG.md`)
- `refactor:` for code cleanups without functional change
- `style:` for UI alignment and theme calibrations

### 3. Making Pull Requests
1. Push your branch to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Navigate to [MohidAhmed6115/axis-releases](https://github.com/MohidAhmed6115/axis-releases) and click **New Pull Request**.
3. Fill out the PR description with:
   - What problem does this solve?
   - How was it tested (Desktop, Android, Mobile viewport)?
   - Any screenshots or screen recordings.

---

## 💡 Ideas for Contributions

- **Swipe Gesture Extensions**: Add support for diagonal swipes or velocity-based quick actions.
- **Prayer Timing Calculations**: Add astronomical calculation methods (MWL, ISNA, Egypt, Makkah, Karachi) with automatic location geocoding.
- **Synthesizer Profiles**: Add subtle morning adhan audio chimes or soothing ambient soundscapes to the Web Audio engine.
- **Screen-Time Telemetry**: Add deeper per-app category insights or focus session blocking.
- **Translations & Localization**: Add Arabic, Urdu, Turkish, Malay, and Spanish language packs.

---

## 📜 Code of Conduct

Axis is built on principles of accountability, discipline, and respect. Please keep discussions constructive, kind, and supportive.

Thank you for contributing to Axis!
