import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AxisLogo } from './AxisLogo';
import { Mail, Lock, X, ArrowRight } from 'lucide-react';

export const AuthScreen: React.FC<{ isModal?: boolean; onClose?: () => void }> = ({ 
  isModal = false, 
  onClose 
}) => {
  const { loginWithGoogle, loginWithEmail, signupWithEmail, authModalReason } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignUp) {
        await signupWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Google sign-in was interrupted.');
    } finally {
      setLoading(false);
    }
  };

  const cardContent = (
    <div className="max-w-md w-full bg-[#131320] border border-white/[0.08] rounded-lg p-5 sm:p-7 relative z-10 text-[#ece9fb]">
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-[#7d7a96] hover:text-[#ece9fb] hover:bg-white/[0.06] transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-4 h-4 stroke-[1.75]" />
        </button>
      )}

      {/* Header */}
      <div className="mb-5 font-mono">
        <AxisLogo className="w-9 h-9 rounded-md mb-2.5" />
        <h2 className="text-lg font-bold tracking-tight uppercase">
          {isSignUp ? 'Create Axis Account' : 'Authenticate Instrument'}
        </h2>
        <p className="text-xs text-[#7d7a96] mt-1 normal-case font-sans">
          {authModalReason || 'Sign in to sync your habits, tasks, daily color reviews, and streaks across all your devices.'}
        </p>
      </div>

      {/* Local Data Notice */}
      <div className="mb-4 p-3 rounded-md bg-[#1c1c2e] border border-white/[0.06] text-xs">
        <span className="font-semibold text-[#8b7bff] font-mono">LOCAL TELEMETRY SAFE: </span>
        <span className="text-[#7d7a96]">All offline habits and calibrations will automatically merge into your cloud profile.</span>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs font-mono space-y-2">
          <div className="leading-relaxed">{error}</div>
          {error.includes('Unauthorized Domain') && (
            <div className="text-[11px] text-zinc-300 pt-1.5 border-t border-rose-500/20 font-sans leading-relaxed">
              <strong className="text-white">Quick Fix:</strong> In your Firebase Console, navigate to <strong>Authentication &rarr; Settings &rarr; Authorized domains</strong>, click <strong>Add domain</strong>, and paste: <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300 font-mono">{typeof window !== 'undefined' ? window.location.hostname : ''}</code>
            </div>
          )}
          {error.includes('not enabled') && (
            <div className="text-[11px] text-zinc-300 pt-1.5 border-t border-rose-500/20 font-sans leading-relaxed">
              <strong className="text-white">Quick Fix:</strong> In your Firebase Console, navigate to <strong>Authentication &rarr; Sign-in method</strong>, click <strong>Google</strong>, toggle <strong>Enable</strong>, select a support email, and click <strong>Save</strong>.
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 font-mono">
        <div>
          <label className="block text-[10px] uppercase font-semibold text-[#7d7a96] mb-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#7d7a96] stroke-[1.75]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full bg-[#0a0a0f] border border-white/[0.08] rounded-md pl-9 pr-3 py-2 text-xs text-[#ece9fb] focus:outline-none focus:border-[#8b7bff] transition-all placeholder:text-[#7d7a96]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-semibold text-[#7d7a96] mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#7d7a96] stroke-[1.75]" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0a0a0f] border border-white/[0.08] rounded-md pl-9 pr-3 py-2 text-xs text-[#ece9fb] focus:outline-none focus:border-[#8b7bff] transition-all placeholder:text-[#7d7a96]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-[#8b7bff] hover:bg-[#9d8fff] text-[#0a0a0f] font-semibold text-xs uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
        >
          {loading ? (
            <span className="w-3.5 h-3.5 border-2 border-[#0a0a0f] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>{isSignUp ? 'Create & Calibrate' : 'Authenticate & Sync'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
            </>
          )}
        </button>
      </form>

      <div className="relative my-3.5 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/[0.06]" />
        </div>
        <span className="relative px-2 bg-[#131320] text-[10px] font-mono uppercase text-[#7d7a96]">
          or continue with
        </span>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full py-2 px-4 bg-[#1c1c2e] hover:bg-white/[0.08] border border-white/[0.08] text-[#ece9fb] font-semibold text-xs font-mono uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Google Account</span>
      </button>

      {/* Switcher */}
      <div className="mt-4 text-center">
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
          }}
          className="text-[11px] font-mono text-[#7d7a96] hover:text-[#8b7bff] transition-colors cursor-pointer"
        >
          {isSignUp ? 'Already have credentials? Sign in' : "New to Axis? Create an account"}
        </button>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md flex justify-center">
          {cardContent}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      {cardContent}
    </div>
  );
};
