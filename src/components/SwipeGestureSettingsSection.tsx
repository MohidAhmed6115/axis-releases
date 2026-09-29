import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Sliders, 
  Smartphone, 
  Trash2, 
  Check, 
  Eye, 
  RotateCcw, 
  Vibrate, 
  ArrowLeftRight, 
  CheckCircle2,
  Sparkles,
  Undo2,
  ChevronUp
} from 'lucide-react';
import { 
  SwipeTaskAction, 
  SwipeSensitivity, 
  SWIPE_SENSITIVITY_THRESHOLDS 
} from '../types';

export const SwipeGestureSettingsSection: React.FC = () => {
  const { 
    swipeGestureSettings, 
    updateSwipeGestureSettings, 
    resetSwipeGestureSettings 
  } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Live Playground State
  const [testTaskCompleted, setTestTaskCompleted] = useState(false);
  const [testTaskExpanded, setTestTaskExpanded] = useState(false);
  const [testSwipeOffset, setTestSwipeOffset] = useState(0);
  const [testActiveSide, setTestActiveSide] = useState<'left' | 'right' | null>(null);
  const [testFeedbackMsg, setTestFeedbackMsg] = useState<string | null>(null);

  const testStartXRef = useRef<number | null>(null);
  const testDraggingRef = useRef(false);
  const testHapticTriggeredRef = useRef(false);

  const sensitivityCfg = SWIPE_SENSITIVITY_THRESHOLDS[swipeGestureSettings.sensitivity];
  const maxReveal = 74;
  const triggerThreshold = Math.max(28, sensitivityCfg.thresholdPx * 0.65);

  const showFeedback = (msg: string) => {
    setTestFeedbackMsg(msg);
    setTimeout(() => setTestFeedbackMsg(null), 2500);
  };

  const handleTestStart = (clientX: number) => {
    if (!swipeGestureSettings.enabled) return;
    testStartXRef.current = clientX;
    testDraggingRef.current = true;
    testHapticTriggeredRef.current = false;
  };

  const handleTestMove = (clientX: number) => {
    if (!testDraggingRef.current || testStartXRef.current === null) return;
    const diff = clientX - testStartXRef.current;

    if (testActiveSide === 'left') {
      const newOffset = Math.max(-maxReveal, Math.min(0, -maxReveal + diff));
      setTestSwipeOffset(newOffset);
    } else if (testActiveSide === 'right') {
      const newOffset = Math.min(maxReveal, Math.max(0, maxReveal + diff));
      setTestSwipeOffset(newOffset);
    } else {
      if (diff < 0 && swipeGestureSettings.leftSwipeAction !== 'none') {
        setTestSwipeOffset(Math.max(-maxReveal, diff));
      } else if (diff > 0 && swipeGestureSettings.rightSwipeAction !== 'none') {
        setTestSwipeOffset(Math.min(maxReveal, diff));
      }
    }

    if (
      swipeGestureSettings.hapticFeedback &&
      !testHapticTriggeredRef.current &&
      typeof navigator !== 'undefined' &&
      navigator.vibrate
    ) {
      if (Math.abs(diff) >= triggerThreshold) {
        try {
          navigator.vibrate(14);
          testHapticTriggeredRef.current = true;
        } catch {}
      }
    }
  };

  const handleTestEnd = () => {
    if (!testDraggingRef.current) return;
    testDraggingRef.current = false;

    if (testSwipeOffset <= -triggerThreshold && swipeGestureSettings.leftSwipeAction !== 'none') {
      setTestSwipeOffset(-maxReveal);
      setTestActiveSide('left');
    } else if (testSwipeOffset >= triggerThreshold && swipeGestureSettings.rightSwipeAction !== 'none') {
      setTestSwipeOffset(maxReveal);
      setTestActiveSide('right');
    } else {
      setTestSwipeOffset(0);
      setTestActiveSide(null);
    }
    testStartXRef.current = null;
  };

  const executeTestAction = (action: SwipeTaskAction) => {
    setTestSwipeOffset(0);
    setTestActiveSide(null);
    if (action === 'delete') {
      showFeedback('Executed: Deleted test task');
    } else if (action === 'complete') {
      setTestTaskCompleted(prev => !prev);
      showFeedback(testTaskCompleted ? 'Executed: Marked incomplete' : 'Executed: Marked complete');
    } else if (action === 'expand') {
      setTestTaskExpanded(prev => !prev);
      showFeedback(testTaskExpanded ? 'Executed: Collapsed details' : 'Executed: Expanded details');
    }
  };

  const actionOptions: { id: SwipeTaskAction; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'delete', label: 'Delete', desc: 'Reveals red delete button', icon: Trash2 },
    { id: 'complete', label: 'Complete / Undo', desc: 'Toggles task completion', icon: Check },
    { id: 'expand', label: 'Expand Details', desc: 'Opens task drawer drawer', icon: Eye },
    { id: 'none', label: 'Disabled', desc: 'No swipe action in this direction', icon: RotateCcw }
  ];

  return (
    <section className={`rounded-lg p-3.5 sm:p-4 border ${
      isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
    }`}>
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#8b7bff]/15 text-[#8b7bff] flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 stroke-[1.75]" />
          </div>
          <div>
            <h2 className={`text-xs sm:text-sm font-semibold font-mono uppercase tracking-tight flex items-center gap-2 ${
              isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
            }`}>
              Phone Swipe Gestures
              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-[#8b7bff]/20 text-[#8b7bff] font-semibold">
                MOBILE & TOUCH
              </span>
            </h2>
            <p className="text-[11px] text-[#7d7a96] mt-0.5">
              Configure screen transition swiping and customizable task row gesture actions.
            </p>
          </div>
        </div>

        {/* Master Switch */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-[11px] font-mono text-[#7d7a96]">
            {swipeGestureSettings.enabled ? 'ACTIVE' : 'DISABLED'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={swipeGestureSettings.enabled}
            onClick={() => updateSwipeGestureSettings({ enabled: !swipeGestureSettings.enabled })}
            className={`w-9 h-5 rounded-full p-[2px] transition-colors cursor-pointer shrink-0 relative focus:outline-none ${
              swipeGestureSettings.enabled 
                ? (isDark ? 'bg-[#8b7bff]' : 'bg-[#7c5ef0]') 
                : (isDark ? 'bg-zinc-700' : 'bg-slate-300')
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                swipeGestureSettings.enabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {swipeGestureSettings.enabled && (
        <div className="mt-4 pt-3 border-t border-inherit border-opacity-10 space-y-4 animate-in fade-in duration-200">
          {/* 1. Screen / Tab View Navigation Swiping */}
          <div className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${
            isDark ? 'bg-[#181926] border-white/[0.06]' : 'bg-[#f7f6fc] border-[#e7e4f4]'
          }`}>
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-md bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                <ArrowLeftRight className="w-3.5 h-3.5 stroke-[1.75]" />
              </div>
              <div>
                <span className={`text-xs font-semibold uppercase block ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                  Swipe to Switch Screens
                </span>
                <span className="text-[11px] text-[#7d7a96] block mt-0.5">
                  Swipe horizontally on phone viewports to transition between Dashboard, Salah, Habits, Tasks, Calendar, and Reviews.
                </span>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={swipeGestureSettings.enablePageNavigation}
              onClick={() => updateSwipeGestureSettings({ enablePageNavigation: !swipeGestureSettings.enablePageNavigation })}
              className={`w-9 h-5 rounded-full p-[2px] transition-colors cursor-pointer shrink-0 relative focus:outline-none ${
                swipeGestureSettings.enablePageNavigation 
                  ? (isDark ? 'bg-[#8b7bff]' : 'bg-[#7c5ef0]') 
                  : (isDark ? 'bg-zinc-700' : 'bg-slate-300')
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  swipeGestureSettings.enablePageNavigation ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 2. Task Row Actions (Left & Right Swipe Configuration) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Left Swipe Action */}
            <div className={`p-3 rounded-lg border ${
              isDark ? 'bg-[#181926] border-white/[0.06]' : 'bg-[#f7f6fc] border-[#e7e4f4]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold font-mono uppercase ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                  Swipe Left Action (←)
                </span>
                <span className="text-[10px] font-mono text-[#7d7a96]">
                  On Task Rows
                </span>
              </div>

              <div className="space-y-1.5">
                {actionOptions.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = swipeGestureSettings.leftSwipeAction === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateSwipeGestureSettings({ leftSwipeAction: opt.id })}
                      className={`w-full p-2 rounded-md border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? isDark 
                            ? 'bg-[#8b7bff]/15 border-[#8b7bff] text-white' 
                            : 'bg-[#7c5ef0]/10 border-[#7c5ef0] text-[#18172b]'
                          : isDark ? 'border-white/[0.04] hover:bg-white/[0.04] text-zinc-300' : 'border-[#e7e4f4] hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? (isDark ? 'text-[#8b7bff]' : 'text-[#7c5ef0]') : 'text-[#7d7a96]'}`} />
                        <div>
                          <div className="text-xs font-medium">{opt.label}</div>
                          <div className="text-[9.5px] text-[#7d7a96]">{opt.desc}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#8b7bff]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Swipe Action */}
            <div className={`p-3 rounded-lg border ${
              isDark ? 'bg-[#181926] border-white/[0.06]' : 'bg-[#f7f6fc] border-[#e7e4f4]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold font-mono uppercase ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                  Swipe Right Action (→)
                </span>
                <span className="text-[10px] font-mono text-[#7d7a96]">
                  On Task Rows
                </span>
              </div>

              <div className="space-y-1.5">
                {actionOptions.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = swipeGestureSettings.rightSwipeAction === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateSwipeGestureSettings({ rightSwipeAction: opt.id })}
                      className={`w-full p-2 rounded-md border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? isDark 
                            ? 'bg-[#8b7bff]/15 border-[#8b7bff] text-white' 
                            : 'bg-[#7c5ef0]/10 border-[#7c5ef0] text-[#18172b]'
                          : isDark ? 'border-white/[0.04] hover:bg-white/[0.04] text-zinc-300' : 'border-[#e7e4f4] hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? (isDark ? 'text-[#8b7bff]' : 'text-[#7c5ef0]') : 'text-[#7d7a96]'}`} />
                        <div>
                          <div className="text-xs font-medium">{opt.label}</div>
                          <div className="text-[9.5px] text-[#7d7a96]">{opt.desc}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#8b7bff]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Sensitivity & Haptic Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            {/* Sensitivity */}
            <div className={`p-3 rounded-lg border ${
              isDark ? 'bg-[#181926] border-white/[0.06]' : 'bg-[#f7f6fc] border-[#e7e4f4]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold uppercase">Gesture Sensitivity</span>
                <span className="text-[10px] text-[#7d7a96]">{sensitivityCfg.thresholdPx}px threshold</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['high', 'normal', 'low'] as SwipeSensitivity[]).map(lvl => {
                  const cfg = SWIPE_SENSITIVITY_THRESHOLDS[lvl];
                  const isSelected = swipeGestureSettings.sensitivity === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => updateSwipeGestureSettings({ sensitivity: lvl })}
                      className={`py-2 px-2 rounded border text-center transition-all cursor-pointer ${
                        isSelected
                          ? isDark 
                            ? 'bg-[#8b7bff] text-[#0a0a0f] font-bold border-[#8b7bff]' 
                            : 'bg-[#7c5ef0] text-white font-bold border-[#7c5ef0]'
                          : isDark ? 'border-white/[0.06] hover:bg-white/[0.04] text-zinc-300' : 'border-[#e7e4f4] hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="text-[11px] uppercase">{cfg.label}</div>
                      <div className="text-[9px] opacity-80">{cfg.thresholdPx}px</div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-[#7d7a96] font-sans mt-2">
                {sensitivityCfg.desc}. Prevents accidental activations while scrolling vertically.
              </p>
            </div>

            {/* Haptic Feedback */}
            <div className={`p-3 rounded-lg border flex flex-col justify-between ${
              isDark ? 'bg-[#181926] border-white/[0.06]' : 'bg-[#f7f6fc] border-[#e7e4f4]'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold uppercase">
                    <Vibrate className="w-3.5 h-3.5 text-[#8b7bff]" />
                    <span>Tactile Haptic Pulse</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={swipeGestureSettings.hapticFeedback}
                    onClick={() => updateSwipeGestureSettings({ hapticFeedback: !swipeGestureSettings.hapticFeedback })}
                    className={`w-9 h-5 rounded-full p-[2px] transition-colors cursor-pointer shrink-0 relative focus:outline-none ${
                      swipeGestureSettings.hapticFeedback 
                        ? (isDark ? 'bg-[#8b7bff]' : 'bg-[#7c5ef0]') 
                        : (isDark ? 'bg-zinc-700' : 'bg-slate-300')
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        swipeGestureSettings.hapticFeedback ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[10px] text-[#7d7a96] font-sans mt-2 leading-relaxed">
                  Triggers subtle physical device vibration when the swipe reaches trigger distance on mobile.
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-inherit border-opacity-10 flex items-center justify-between">
                <span className="text-[10px] text-[#7d7a96]">Restore defaults</span>
                <button
                  type="button"
                  onClick={resetSwipeGestureSettings}
                  className="text-[10px] font-mono uppercase text-[#8b7bff] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Gestures</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. Live Interactive Gesture Test Playground */}
          <div className={`p-3 sm:p-3.5 rounded-lg border ${
            isDark ? 'bg-[#161725] border-white/[0.08]' : 'bg-[#f5f4fb] border-[#e2dff0]'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase font-semibold text-[#8b7bff] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
                Live Gesture Test Playground
              </span>
              <span className="text-[10px] font-mono text-[#7d7a96]">
                Swipe left or right below to test
              </span>
            </div>

            {testFeedbackMsg && (
              <div className="mb-2 p-1.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10.5px] font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>{testFeedbackMsg}</span>
              </div>
            )}

            {/* Simulated Interactive Task Row */}
            <div className="relative overflow-hidden rounded-md border border-inherit border-opacity-30 bg-black/20 select-none">
              {/* Background Right Action (Triggered by swiping right) */}
              {swipeGestureSettings.rightSwipeAction !== 'none' && (
                <div 
                  className={`absolute inset-y-0 left-0 w-[74px] flex items-center justify-center text-white cursor-pointer ${
                    swipeGestureSettings.rightSwipeAction === 'delete' ? 'bg-rose-600' :
                    swipeGestureSettings.rightSwipeAction === 'complete' ? 'bg-emerald-600' : 'bg-[#7c5ef0]'
                  }`}
                  onClick={() => executeTestAction(swipeGestureSettings.rightSwipeAction)}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    {swipeGestureSettings.rightSwipeAction === 'delete' && <Trash2 className="w-3.5 h-3.5" />}
                    {swipeGestureSettings.rightSwipeAction === 'complete' && <Check className="w-3.5 h-3.5" />}
                    {swipeGestureSettings.rightSwipeAction === 'expand' && <Eye className="w-3.5 h-3.5" />}
                    <span className="text-[9px] font-bold uppercase">{swipeGestureSettings.rightSwipeAction}</span>
                  </div>
                </div>
              )}

              {/* Background Left Action (Triggered by swiping left) */}
              {swipeGestureSettings.leftSwipeAction !== 'none' && (
                <div 
                  className={`absolute inset-y-0 right-0 w-[74px] flex items-center justify-center text-white cursor-pointer ${
                    swipeGestureSettings.leftSwipeAction === 'delete' ? 'bg-rose-600' :
                    swipeGestureSettings.leftSwipeAction === 'complete' ? 'bg-emerald-600' : 'bg-[#7c5ef0]'
                  }`}
                  onClick={() => executeTestAction(swipeGestureSettings.leftSwipeAction)}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    {swipeGestureSettings.leftSwipeAction === 'delete' && <Trash2 className="w-3.5 h-3.5" />}
                    {swipeGestureSettings.leftSwipeAction === 'complete' && <Check className="w-3.5 h-3.5" />}
                    {swipeGestureSettings.leftSwipeAction === 'expand' && <Eye className="w-3.5 h-3.5" />}
                    <span className="text-[9px] font-bold uppercase">{swipeGestureSettings.leftSwipeAction}</span>
                  </div>
                </div>
              )}

              {/* Foreground Card */}
              <div
                className={`relative z-10 transition-transform duration-150 p-2.5 flex items-center justify-between gap-3 cursor-grab active:cursor-grabbing ${
                  isDark ? 'bg-[#1a1b2b] text-[#ece9fb]' : 'bg-white text-[#18172b]'
                }`}
                style={{ transform: `translateX(${testSwipeOffset}px)` }}
                onTouchStart={(e) => handleTestStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleTestMove(e.touches[0].clientX)}
                onTouchEnd={handleTestEnd}
                onMouseDown={(e) => handleTestStart(e.clientX)}
                onMouseMove={(e) => testDraggingRef.current && handleTestMove(e.clientX)}
                onMouseUp={handleTestEnd}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-4 h-4 rounded shrink-0 flex items-center justify-center border ${
                    testTaskCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-500 text-transparent'
                  }`}>
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className={`text-xs font-medium truncate ${testTaskCompleted ? 'line-through text-[#7d7a96]' : ''}`}>
                    Interactive Test Task (Try swiping left or right)
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-zinc-500/20 text-[#7d7a96]">
                    High Priority
                  </span>
                  <span className="text-[10px] font-mono text-[#8b7bff]">
                    Today
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-1.5 text-center text-[10px] text-[#7d7a96] font-mono">
              ← Swipe Left: <strong>{swipeGestureSettings.leftSwipeAction}</strong> · Swipe Right: <strong>{swipeGestureSettings.rightSwipeAction}</strong> →
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
