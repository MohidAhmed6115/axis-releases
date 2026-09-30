import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  X, 
  Github, 
  ExternalLink, 
  Copy, 
  Check, 
  GitPullRequest, 
  Bug, 
  Star, 
  Download, 
  Terminal, 
  Code2, 
  Heart,
  Smartphone,
  Monitor,
  Share2
} from 'lucide-react';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReleaseNotes?: () => void;
}

export const ContributeModal: React.FC<ContributeModalProps> = ({
  isOpen,
  onClose,
  onOpenReleaseNotes
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [copiedClone, setCopiedClone] = useState(false);
  const repoUrl = 'https://github.com/MohidAhmed6115/axis-releases';
  const cloneCommand = 'git clone https://github.com/MohidAhmed6115/axis-releases.git';

  if (!isOpen) return null;

  const handleCopyClone = () => {
    navigator.clipboard.writeText(cloneCommand);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className={`relative w-full max-w-xl rounded-xl border shadow-2xl overflow-hidden my-6 transition-all z-10 ${
        isDark 
          ? 'bg-[#131320] border-white/[0.12] text-[#ece9fb]' 
          : 'bg-white border-[#e7e4f4] text-[#18172b]'
      }`}>
        {/* Header Bar */}
        <div className={`px-4 sm:px-5 py-4 border-b flex items-center justify-between ${
          isDark ? 'border-white/[0.08] bg-[#18192a]' : 'border-[#e7e4f4] bg-[#f8f7fc]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8b7bff]/15 text-[#8b7bff] flex items-center justify-center shrink-0">
              <Github className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold font-mono uppercase tracking-tight flex items-center gap-2">
                Contribute to Axis
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#8b7bff]/20 text-[#8b7bff] font-mono font-semibold">
                  v1.2.0
                </span>
              </h2>
              <p className="text-[11px] text-[#7d7a96]">
                Open-source self-mastery & discipline instrument on GitHub
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

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Repository Banner Card */}
          <div className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isDark ? 'bg-[#181926] border-white/[0.08]' : 'bg-[#f7f6fc] border-[#e7e4f4]'
          }`}>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-mono text-xs font-semibold truncate text-[#8b7bff]">
                <Code2 className="w-3.5 h-3.5 stroke-[2] shrink-0" />
                <span className="truncate">MohidAhmed6115 / axis-releases</span>
              </div>
              <p className="text-[11px] text-[#7d7a96] mt-0.5">
                Official repository hosting source, CI/CD automated builds, and Android / Windows releases.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-3 py-1.5 rounded-md text-xs font-semibold font-mono uppercase tracking-wider cursor-pointer flex items-center gap-1.5 transition-colors ${
                  isDark 
                    ? 'bg-[#8b7bff] text-[#0a0a0f] hover:bg-[#9d8fff]' 
                    : 'bg-[#7c5ef0] text-white hover:bg-[#6e4ee6]'
                }`}
              >
                <span>View Repo</span>
                <ExternalLink className="w-3 h-3 stroke-[2]" />
              </a>
            </div>
          </div>

          {/* Quick Clone Command */}
          <div>
            <label className="text-[10px] font-mono uppercase font-semibold text-[#7d7a96] block mb-1.5">
              Clone Repository
            </label>
            <div className={`flex items-center justify-between p-2 sm:p-2.5 rounded-md border font-mono text-xs ${
              isDark ? 'bg-[#0d0e17] border-white/[0.08] text-zinc-300' : 'bg-slate-100 border-[#e2dff0] text-slate-800'
            }`}>
              <div className="flex items-center gap-2 truncate pr-2">
                <Terminal className="w-3.5 h-3.5 text-[#8b7bff] shrink-0" />
                <span className="truncate select-all">{cloneCommand}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyClone}
                className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 shrink-0 transition-colors cursor-pointer ${
                  copiedClone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : isDark ? 'bg-white/[0.08] hover:bg-white/[0.15] text-[#ece9fb]' : 'bg-white hover:bg-slate-200 text-slate-800 border border-slate-300'
                }`}
              >
                {copiedClone ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedClone ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Contribution Actions Grid */}
          <div>
            <label className="text-[10px] font-mono uppercase font-semibold text-[#7d7a96] block mb-2">
              Ways to Contribute
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* 1. Pull Requests */}
              <a
                href={`${repoUrl}/pulls`}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all group ${
                  isDark 
                    ? 'bg-[#181926] border-white/[0.06] hover:border-[#8b7bff]/40' 
                    : 'bg-[#f7f6fc] border-[#e7e4f4] hover:border-[#7c5ef0]/40'
                }`}
              >
                <div>
                  <div className="w-7 h-7 rounded-md bg-purple-500/15 text-purple-400 flex items-center justify-center mb-2">
                    <GitPullRequest className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <div className={`text-xs font-semibold font-mono uppercase ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                    Pull Requests
                  </div>
                  <p className="text-[10px] text-[#7d7a96] mt-1 leading-relaxed">
                    Submit bug fixes, swipe enhancements, or audio presets.
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-semibold text-[#8b7bff] flex items-center gap-1 font-mono">
                  <span>Fork & PR</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </div>
              </a>

              {/* 2. Issues & Suggestions */}
              <a
                href={`${repoUrl}/issues/new`}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all group ${
                  isDark 
                    ? 'bg-[#181926] border-white/[0.06] hover:border-[#8b7bff]/40' 
                    : 'bg-[#f7f6fc] border-[#e7e4f4] hover:border-[#7c5ef0]/40'
                }`}
              >
                <div>
                  <div className="w-7 h-7 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center mb-2">
                    <Bug className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <div className={`text-xs font-semibold font-mono uppercase ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                    Report Issues
                  </div>
                  <p className="text-[10px] text-[#7d7a96] mt-1 leading-relaxed">
                    Report gesture bugs, prayer timing nuances, or platform quirks.
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-semibold text-[#8b7bff] flex items-center gap-1 font-mono">
                  <span>Open Issue</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </div>
              </a>

              {/* 3. Star Repository */}
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all group ${
                  isDark 
                    ? 'bg-[#181926] border-white/[0.06] hover:border-[#8b7bff]/40' 
                    : 'bg-[#f7f6fc] border-[#e7e4f4] hover:border-[#7c5ef0]/40'
                }`}
              >
                <div>
                  <div className="w-7 h-7 rounded-md bg-yellow-500/15 text-yellow-400 flex items-center justify-center mb-2">
                    <Star className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <div className={`text-xs font-semibold font-mono uppercase ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                    Star on GitHub
                  </div>
                  <p className="text-[10px] text-[#7d7a96] mt-1 leading-relaxed">
                    Show support to help other builders discover Axis.
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-semibold text-[#8b7bff] flex items-center gap-1 font-mono">
                  <span>Give Star</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </div>
              </a>
            </div>
          </div>

          {/* Development Setup Workflow */}
          <div className={`p-3.5 rounded-lg border text-xs ${
            isDark ? 'bg-[#161725] border-white/[0.06]' : 'bg-[#faf9fe] border-[#e7e4f4]'
          }`}>
            <span className="font-mono text-[11px] uppercase font-semibold text-[#8b7bff] block mb-2">
              🛠️ Local Developer Setup Workflow
            </span>
            <div className="space-y-1.5 font-mono text-[10.5px] text-[#7d7a96]">
              <div className="flex items-start gap-2">
                <span className="text-[#8b7bff] font-bold">1.</span>
                <span>Install dependencies: <code className="text-zinc-300">npm install</code></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#8b7bff] font-bold">2.</span>
                <span>Run dev server: <code className="text-zinc-300">npm run dev</code> (runs on port 3000)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#8b7bff] font-bold">3.</span>
                <span>Sync Android Capacitor project: <code className="text-zinc-300">npx cap sync android</code></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#8b7bff] font-bold">4.</span>
                <span>Build Windows Desktop NSIS package: <code className="text-zinc-300">npm run electron:build</code></span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className={`px-4 sm:px-5 py-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
          isDark ? 'border-white/[0.08] bg-[#18192a]' : 'border-[#e7e4f4] bg-[#f8f7fc]'
        }`}>
          {onOpenReleaseNotes ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReleaseNotes();
              }}
              className="text-xs font-mono text-[#8b7bff] hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <span>See What's New in v1.1.0 Release →</span>
            </button>
          ) : (
            <span className="text-[11px] text-[#7d7a96] font-mono">
              Axis Instrument Open Source Project
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase font-semibold border cursor-pointer transition-colors ${
              isDark 
                ? 'border-white/[0.1] hover:bg-white/[0.06] text-[#ece9fb]' 
                : 'border-slate-300 hover:bg-slate-100 text-slate-800'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
