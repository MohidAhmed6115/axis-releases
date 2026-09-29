import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  X, 
  Sparkles, 
  Sliders, 
  Bell, 
  Github, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Smartphone, 
  Compass, 
  Zap,
  ArrowRight
} from 'lucide-react';

interface ReleaseNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContribute?: () => void;
}

export const ReleaseNotesModal: React.FC<ReleaseNotesModalProps> = ({
  isOpen,
  onClose,
  onOpenContribute
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  if (!isOpen) return null;

  const repoReleasesUrl = 'https://github.com/MohidAhmed6115/axis-releases/releases';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className={`relative w-full max-w-2xl rounded-xl border shadow-2xl overflow-hidden my-6 transition-all z-10 ${
        isDark 
          ? 'bg-[#131320] border-white/[0.12] text-[#ece9fb]' 
          : 'bg-white border-[#e7e4f4] text-[#18172b]'
      }`}>
        {/* Header */}
        <div className={`px-4 sm:px-6 py-4.5 border-b flex items-center justify-between ${
          isDark ? 'border-white/[0.08] bg-[#18192a]' : 'border-[#e7e4f4] bg-[#f8f7fc]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#8b7bff]/20 text-[#8b7bff] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold font-mono uppercase tracking-tight">
                  Axis Release v1.2.0
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  LATEST UPDATE
                </span>
              </div>
              <p className="text-[11px] text-[#7d7a96] mt-0.5">
                Native Android Home Screen Widgets, Swipe Gestures & Alarm Synthesizer
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-[#7d7a96] hover:text-white hover:bg-white/[0.08]' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
            }`}
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          {/* Release Highlights Hero */}
          <div className={`p-4 rounded-lg border ${
            isDark 
              ? 'bg-gradient-to-r from-[#18192c] to-[#141525] border-[#8b7bff]/25' 
              : 'bg-gradient-to-r from-[#f5f3fe] to-[#fcfbff] border-[#7c5ef0]/25'
          }`}>
            <span className="text-[10px] font-mono uppercase font-bold text-[#8b7bff] tracking-wider block mb-1">
              📱 Major Native Android Update: Home Screen Widgets
            </span>
            <p className="text-xs leading-relaxed text-[#7d7a96]">
              Axis v1.2.0 introduces three native Android home screen widgets built strictly with Android RemoteViews and AppWidgetProvider components (no WebViews). All three widgets share persisted local data with the app via SharedPreferences and auto-sync with Firestore upon opening the app.
            </p>
          </div>

          {/* Feature 0: Three Native Android Widgets */}
          <div className={`p-4 rounded-lg border ${
            isDark ? 'bg-[#181926] border-white/[0.06]' : 'bg-[#f7f6fc] border-[#e7e4f4]'
          }`}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="flex-1">
                <h3 className={`text-xs sm:text-sm font-semibold font-mono uppercase tracking-tight ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                  1. Three Native Android Home Screen Widgets
                </h3>
                <p className="text-[11px] text-[#7d7a96] mt-1 leading-relaxed">
                  Fast, battery-efficient home screen companions with automatic system dark/light mode:
                </p>

                <ul className="mt-2.5 space-y-2 text-xs text-[#7d7a96] font-sans">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>Daily Color Quick-Log (2x1 / 2x2):</strong> Five circular rating buttons (Red, Orange, Yellow, Green, Gold). One-tap logging directly from the home screen; active rating is highlighted while others dim. Tap/hold opens the full Daily Review screen to add written notes.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>Salah Tracker (4x2):</strong> Five compact rows (Fajr through Isha) with dedicated Solo and Bajamat icon buttons. Tap to log immediately or toggle off; tap prayer names to open the in-app Salah page.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>Today's Habits Checklist (4x3):</strong> Scrollable checklist powered by RemoteViewsService. Interactive checkboxes with live "X of Y done" progress and anchor habit flame badges.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>Reboot Proof & Firestore Sync:</strong> Backed by native SharedPreferences, working even after device reboots before opening the app. Syncs automatically to Firestore when signed in.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Feature 1: Configurable Swipe Gestures */}
          <div className={`p-4 rounded-lg border ${
            isDark ? 'bg-[#181926] border-white/[0.06]' : 'bg-[#f7f6fc] border-[#e7e4f4]'
          }`}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#8b7bff]/15 text-[#8b7bff] flex items-center justify-center shrink-0 mt-0.5">
                <Sliders className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="flex-1">
                <h3 className={`text-xs sm:text-sm font-semibold font-mono uppercase tracking-tight ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                  1. Configurable Phone Swipe Gestures
                </h3>
                <p className="text-[11px] text-[#7d7a96] mt-1 leading-relaxed">
                  Tailor mobile gestures to your exact muscle memory:
                </p>

                <ul className="mt-2.5 space-y-1.5 text-xs text-[#7d7a96] font-sans">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>Screen View Swiping:</strong> Swipe left or right anywhere across your screen on phone to smoothly switch between Dashboard, Salah, Habits, Tasks, Calendar, and Reviews.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>Customizable Task Actions:</strong> Configure what happens on Left Swipe (Delete, Complete, Expand, or Disabled) and Right Swipe independently.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>3 Sensitivity Presets:</strong> Choose between High (35px), Normal (60px), and Low (100px) thresholds with vertical scroll-locking prevention.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>Tactile Haptic Feedback:</strong> Device vibrates gently on gesture trigger for confident, tactile activation.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Feature 2: Synthesized Alarm Ringtones */}
          <div className={`p-4 rounded-lg border ${
            isDark ? 'bg-[#181926] border-white/[0.06]' : 'bg-[#f7f6fc] border-[#e7e4f4]'
          }`}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="flex-1">
                <h3 className={`text-xs sm:text-sm font-semibold font-mono uppercase tracking-tight ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                  2. Prayer Alarms & Configurable Ring Duration
                </h3>
                <p className="text-[11px] text-[#7d7a96] mt-1 leading-relaxed">
                  Reminders now feature alarm-grade ringtones powered by the Web Audio API:
                </p>

                <ul className="mt-2.5 space-y-1.5 text-xs text-[#7d7a96] font-sans">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>Default 5-Minute Ringing:</strong> Alarms loop persistently for 5 minutes by default (or user-chosen 1, 2, 3, 10, 15, or 30 minutes) until logged or silenced.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>5 High-Fidelity Synthesizer Tones:</strong> Classic Alarm, Gentle Bell, Melodic Chime, Digital Pulse, and Singing Chime synthesized directly in-browser.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>One-Click Silence Alarm:</strong> Mute sound immediately from the toast while keeping quick logging options active.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Feature 3: GitHub Community & Builds */}
          <div className={`p-4 rounded-lg border ${
            isDark ? 'bg-[#181926] border-white/[0.06]' : 'bg-[#f7f6fc] border-[#e7e4f4]'
          }`}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/15 text-yellow-400 flex items-center justify-center shrink-0 mt-0.5">
                <Github className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="flex-1">
                <h3 className={`text-xs sm:text-sm font-semibold font-mono uppercase tracking-tight ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                  3. Community GitHub Contribution & Downloads
                </h3>
                <p className="text-[11px] text-[#7d7a96] mt-1 leading-relaxed">
                  Join our open-source self-mastery community:
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={repoReleasesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold font-mono uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download APK & Windows .exe</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {onOpenContribute && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenContribute();
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold font-mono uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isDark 
                          ? 'bg-[#8b7bff] text-[#0a0a0f] hover:bg-[#9d8fff]' 
                          : 'bg-[#7c5ef0] text-white hover:bg-[#6e4ee6]'
                      }`}
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Contribute on GitHub</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-4 sm:px-6 py-3.5 border-t flex items-center justify-between ${
          isDark ? 'border-white/[0.08] bg-[#18192a]' : 'border-[#e7e4f4] bg-[#f8f7fc]'
        }`}>
          <span className="text-[11px] font-mono text-[#7d7a96]">
            September 29, 2026 · Axis v1.1.0
          </span>

          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-md text-xs font-mono uppercase font-semibold border cursor-pointer transition-colors ${
              isDark 
                ? 'border-white/[0.1] hover:bg-white/[0.06] text-[#ece9fb]' 
                : 'border-slate-300 hover:bg-slate-100 text-slate-800'
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
