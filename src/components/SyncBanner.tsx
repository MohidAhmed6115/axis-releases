import React from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Cloud, ArrowRight, X, Sparkles } from 'lucide-react';

export const SyncBanner: React.FC = () => {
  const { 
    authMode, 
    showSyncBanner, 
    dismissSyncBanner, 
    openAuthModal, 
    syncConfirmationMsg, 
    clearSyncConfirmation 
  } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  if (syncConfirmationMsg) {
    return (
      <div className={`border rounded-lg px-3.5 py-2.5 flex items-center justify-between text-xs mb-3 ${
        isDark 
          ? 'bg-[#131320] border-emerald-500/30 text-emerald-300' 
          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
      }`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[1.75]" />
          <span className="font-mono">{syncConfirmationMsg}</span>
        </div>
        <button
          onClick={clearSyncConfirmation}
          className="p-1 rounded-md text-[#7d7a96] hover:text-[#ece9fb] cursor-pointer"
        >
          <X className="w-3.5 h-3.5 stroke-[1.75]" />
        </button>
      </div>
    );
  }

  if (authMode !== 'guest' || !showSyncBanner) {
    return null;
  }

  return (
    <div className={`border rounded-lg p-3 sm:p-3.5 mb-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
      isDark 
        ? 'bg-[#131320] border-white/[0.08] text-[#ece9fb]' 
        : 'bg-white border-[#e7e4f4] text-[#18172b]'
    }`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
          isDark 
            ? 'bg-[#1c1c2e] border-white/[0.08] text-[#8b7bff]' 
            : 'bg-[#f3f1fb] border-[#e7e4f4] text-[#7c5ef0]'
        }`}>
          <Cloud className="w-4 h-4 stroke-[1.75]" />
        </div>
        <div>
          <span className="font-semibold font-sans text-xs sm:text-[13px]">
            Guest mode.{' '}
          </span>
          <span className="text-[#6b6882] dark:text-[#8d8aab] text-xs sm:text-[13px] font-sans">
            Telemetry stored locally. Sign in anytime to sync across devices.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0 font-sans">
        <button
          onClick={() => openAuthModal('Sign in to sync your habits, tasks, and daily color reviews across all your devices.')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer text-[13px] font-sans ${
            isDark 
              ? 'bg-[#7059f0] text-white hover:bg-[#7e69f5]' 
              : 'bg-[#7c5ef0] text-white hover:bg-[#6e4ee6]'
          }`}
        >
          <span>Sign in</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
        </button>
        <button
          onClick={dismissSyncBanner}
          className="p-1.5 text-[#6b6882] dark:text-[#8d8aab] hover:text-[#18172b] dark:hover:text-[#ece9fb] rounded-md transition-colors cursor-pointer"
          title="Dismiss banner"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5 stroke-[1.75]" />
        </button>
      </div>
    </div>
  );
};
