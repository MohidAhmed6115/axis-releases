import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Smartphone, 
  Settings2, 
  Plus, 
  Trash2, 
  Clock,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { COLOR_DEFINITIONS, DayColor } from '../types';
import {
  isAndroidCapacitor,
  isElectronEnvironment,
  checkNativeUsagePermission,
  requestNativeUsagePermission,
  fetchNativeUsageStats
} from '../services/usageStatsService';

export const ScreenTimePage: React.FC = () => {
  const { 
    platform, 
    screenTimeSettings, 
    setHighRiskApps, 
    updateSimulatedScreenTime, 
    selectedDate, 
    dailyRecords,
    setPlatform
  } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [newPackageInput, setNewPackageInput] = useState('');
  const [hasNativePermission, setHasNativePermission] = useState<boolean | null>(null);
  const [isSyncingStats, setIsSyncingStats] = useState(false);

  const isAndroidNative = isAndroidCapacitor();
  const isElectron = isElectronEnvironment();

  // If in Electron desktop environment, Screen-Time module is hidden
  if (isElectron) {
    return (
      <div className={`p-8 text-center rounded-lg border space-y-3 max-w-md mx-auto my-8 ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <Smartphone className="w-10 h-10 mx-auto text-[#7d7a96] stroke-[1.5]" />
        <div>
          <h2 className={`text-sm font-semibold font-mono uppercase tracking-wider ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
            Android-Exclusive Module
          </h2>
          <p className="text-xs text-[#7d7a96] mt-1 font-mono">
            Screen-Time and distraction monitoring use Android's native UsageStatsManager. The desktop application focuses on your tasks, habits, and daily reviews.
          </p>
        </div>
      </div>
    );
  }

  // Check Android native permission on mount
  useEffect(() => {
    if (isAndroidNative) {
      checkNativeUsagePermission().then((granted) => {
        setHasNativePermission(granted);
        if (granted) {
          syncFromNativePlugin();
        }
      });
    }
  }, [isAndroidNative]);

  const syncFromNativePlugin = async () => {
    if (!isAndroidNative) return;
    setIsSyncingStats(true);
    try {
      const stats = await fetchNativeUsageStats();
      if (stats && stats.length > 0) {
        const { highRiskApps } = screenTimeSettings;
        const updatedApps = stats.map((item) => {
          const isHigh = highRiskApps.includes(item.packageName.toLowerCase());
          const friendlyName = item.packageName.split('.').pop() || item.packageName;
          return {
            packageName: item.packageName,
            appName: friendlyName.charAt(0).toUpperCase() + friendlyName.slice(1),
            durationMinutes: item.totalMinutes,
            isHighRisk: isHigh,
          };
        });

        const newTotal = updatedApps.reduce((acc, a) => acc + a.durationMinutes, 0);
        const newHighRisk = updatedApps
          .filter((a) => a.isHighRisk)
          .reduce((acc, a) => acc + a.durationMinutes, 0);

        updateSimulatedScreenTime({
          totalMinutes: newTotal,
          highRiskMinutes: newHighRisk,
          apps: updatedApps,
        });
      }
    } catch (e) {
      console.warn('Could not sync native stats:', e);
    } finally {
      setIsSyncingStats(false);
    }
  };

  const handleRequestPermission = async () => {
    await requestNativeUsagePermission();
    setTimeout(async () => {
      const granted = await checkNativeUsagePermission();
      setHasNativePermission(granted);
      if (granted) {
        syncFromNativePlugin();
      }
    }, 2000);
  };

  if (platform !== 'android') {
    return (
      <div className={`p-8 text-center rounded-lg border space-y-3 max-w-md mx-auto my-8 ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <Smartphone className="w-10 h-10 mx-auto text-[#7d7a96] stroke-[1.5]" />
        <div>
          <h2 className={`text-sm font-semibold font-mono uppercase tracking-wider ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
            Android Telemetry Required
          </h2>
          <p className="text-xs text-[#7d7a96] mt-1 font-mono">
            Screen-Time telemetry and distraction monitoring operate in Android mode.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPlatform('android')}
          className={`px-4 py-2 rounded-md text-xs font-semibold font-mono uppercase tracking-wider cursor-pointer transition-colors ${
            isDark 
              ? 'bg-[#8b7bff] text-[#0a0a0f] hover:bg-[#9d8fff]' 
              : 'bg-[#7c5ef0] text-white hover:bg-[#6e4ee6]'
          }`}
        >
          Enable Android Mode
        </button>
      </div>
    );
  }

  const { highRiskApps, simulatedScreenTime } = screenTimeSettings;
  const { totalMinutes, highRiskMinutes, apps } = simulatedScreenTime;

  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackageInput.trim()) return;
    const pkg = newPackageInput.trim().toLowerCase();
    if (!highRiskApps.includes(pkg)) {
      const updated = [...highRiskApps, pkg];
      setHighRiskApps(updated);
      const updatedApps = apps.map(app => 
        app.packageName === pkg ? { ...app, isHighRisk: true } : app
      );
      const newHighRiskMins = updatedApps
        .filter(a => a.isHighRisk)
        .reduce((acc, curr) => acc + curr.durationMinutes, 0);
      updateSimulatedScreenTime({
        ...simulatedScreenTime,
        highRiskMinutes: newHighRiskMins,
        apps: updatedApps
      });
    }
    setNewPackageInput('');
  };

  const handleRemoveApp = (pkg: string) => {
    const updated = highRiskApps.filter(p => p !== pkg);
    setHighRiskApps(updated);
    const updatedApps = apps.map(app => 
      app.packageName === pkg ? { ...app, isHighRisk: false } : app
    );
    const newHighRiskMins = updatedApps
      .filter(a => a.isHighRisk)
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);
    updateSimulatedScreenTime({
      ...simulatedScreenTime,
      highRiskMinutes: newHighRiskMins,
      apps: updatedApps
    });
  };

  const handleAppDurationChange = (pkg: string, duration: number) => {
    const safeDuration = Math.max(0, duration);
    const updatedApps = apps.map(app => 
      app.packageName === pkg ? { ...app, durationMinutes: safeDuration } : app
    );
    const newTotal = updatedApps.reduce((acc, a) => acc + a.durationMinutes, 0);
    const newHighRisk = updatedApps
      .filter(a => a.isHighRisk)
      .reduce((acc, a) => acc + a.durationMinutes, 0);

    updateSimulatedScreenTime({
      ...simulatedScreenTime,
      totalMinutes: newTotal,
      highRiskMinutes: newHighRisk,
      apps: updatedApps
    });
  };

  const past14DaysTrend = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const rec = dailyRecords[dateStr];
    return {
      date: dateStr,
      displayDate: d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      highRiskMinutes: rec?.screenTime ? rec.screenTime.highRiskMinutes : 0,
      color: rec?.color || null
    };
  });

  const dialTeal = '#2dd4bf';

  return (
    <div className="space-y-3.5 max-w-4xl pb-16">
      {/* 1. Precision Stat cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className={`p-3 rounded-lg border ${
          isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
        }`}>
          <span className="text-[10px] text-[#7d7a96] font-mono uppercase tracking-wider block">
            TOTAL SCREEN TIME
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-wider ${
              isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
            }`}>
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
            </span>
          </div>
          <p className="text-[9px] font-mono text-[#7d7a96] mt-0.5 uppercase">Device telemetry</p>
        </div>

        <div className={`p-3 rounded-lg border ${
          isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
        }`}>
          <span className="text-[10px] text-[#7d7a96] font-mono uppercase tracking-wider block">
            HIGH-RISK PACKAGES
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-wider ${
              highRiskMinutes > 90 ? 'text-amber-400' : isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'
            }`}>
              {Math.floor(highRiskMinutes / 60)}h {highRiskMinutes % 60}m
            </span>
          </div>
          <p className="text-[9px] font-mono text-[#7d7a96] mt-0.5 uppercase">Friction telemetry</p>
        </div>

        <div className={`p-3 rounded-lg border ${
          isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
        }`}>
          <span className="text-[10px] text-[#7d7a96] font-mono uppercase tracking-wider block">
            LIMIT BENCHMARK
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-wider text-[#2dd4bf]">
              &lt;90m
            </span>
            <span className="text-[10px] font-mono text-[#2dd4bf] font-semibold">REF</span>
          </div>
          <p className="text-[9px] font-mono text-[#7d7a96] mt-0.5 uppercase">
            {highRiskMinutes >= 180 ? 'Exceeded' : highRiskMinutes >= 90 ? 'Warning' : 'Within Bounds'}
          </p>
        </div>
      </div>

      {/* 2. Flagged Packages Registry & Configuration */}
      <section className={`p-3.5 sm:p-4 rounded-lg space-y-3 border ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <div className="flex items-center justify-between pb-2 border-b border-inherit border-opacity-10 text-xs font-mono">
          <div>
            <span className={`font-semibold tracking-tight uppercase text-xs ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
              Flagged Distraction Registry
            </span>
            <p className="text-[10px] text-[#7d7a96] mt-0.5 normal-case font-sans">
              Apps registered here count toward high-risk friction and impact the daily color rating.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="text-[11px] uppercase tracking-wider flex items-center gap-1 text-[#7d7a96] hover:text-[#ece9fb] cursor-pointer transition-colors"
          >
            <Settings2 className="w-3 h-3 stroke-[1.75]" />
            <span>{isConfigOpen ? 'Done' : 'Edit Registry'}</span>
          </button>
        </div>

        {isConfigOpen && (
          <form onSubmit={handleAddApp} className="flex gap-2 text-xs">
            <input
              type="text"
              value={newPackageInput}
              onChange={(e) => setNewPackageInput(e.target.value)}
              placeholder="e.g. com.zhiliaoapp.musically, com.instagram.android..."
              className={`flex-1 rounded-md px-3 py-1.5 focus:outline-none placeholder:text-[#7d7a96] ${
                isDark 
                  ? 'bg-[#0a0a0f] text-[#ece9fb] border border-white/[0.08] focus:border-[#8b7bff]' 
                  : 'bg-[#f9f8fd] text-[#18172b] border border-[#e7e4f4] focus:border-[#7c5ef0]'
              }`}
            />
            <button
              type="submit"
              className={`px-3 py-1.5 rounded-md font-semibold font-mono text-[11px] uppercase tracking-wider flex items-center gap-1 cursor-pointer ${
                isDark 
                  ? 'bg-[#8b7bff] text-[#0a0a0f] hover:bg-[#9d8fff]' 
                  : 'bg-[#7c5ef0] text-white hover:bg-[#6e4ee6]'
              }`}
            >
              <Plus className="w-3 h-3 stroke-[2]" />
              <span>Register</span>
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-1.5 pt-1">
          {highRiskApps.length === 0 ? (
            <span className="text-[11px] text-[#7d7a96] font-mono py-1">
              No distraction packages registered. Click "Edit Registry" to register high-risk packages to monitor.
            </span>
          ) : (
            highRiskApps.map((pkg) => (
              <span
                key={pkg}
                className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                  isDark 
                    ? 'bg-[#1c1c2e] border-white/[0.08] text-[#ece9fb]' 
                    : 'bg-[#f3f1fb] border-[#e7e4f4] text-[#18172b]'
                }`}
              >
                <span>{pkg}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveApp(pkg)}
                  className="text-[#7d7a96] hover:text-rose-400 cursor-pointer"
                  title="Remove package"
                >
                  <Trash2 className="w-2.5 h-2.5 stroke-[1.75]" />
                </button>
              </span>
            ))
          )}
        </div>
      </section>

      {/* 3. Per-App Usage Breakdown Table */}
      <section className={`p-3.5 sm:p-4 rounded-lg space-y-2.5 border ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <div className="flex items-center justify-between pb-2 border-b border-inherit border-opacity-10 text-xs font-mono">
          <span className={`font-semibold tracking-tight uppercase text-xs ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
            Per-App Telemetry Today
          </span>
          <span className="text-[10px] text-[#7d7a96] tabular-nums">
            {apps.length} PACKAGES TRACKED
          </span>
        </div>

        <div className="divide-y divide-inherit divide-opacity-5 text-xs">
          {apps.length === 0 ? (
            <div className="py-8 text-center text-[#7d7a96] text-[11px] font-mono">
              No app telemetry recorded today. Apps will appear here once telemetry is recorded or synced.
            </div>
          ) : (
            apps.map((app) => (
              <div
                key={app.packageName}
                className="py-2 flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-1.5 h-3.5 rounded-full shrink-0 ${app.isHighRisk ? 'bg-amber-400' : 'bg-zinc-600'}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-medium truncate ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
                        {app.appName}
                      </span>
                      <span className="text-[#7d7a96] font-mono text-[10px] truncate hidden sm:inline">
                        · {app.packageName}
                      </span>
                    </div>
                    {app.isHighRisk && (
                      <span className="text-[9px] text-amber-400 font-mono font-medium">Flagged High-Risk</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono tabular-nums text-[11px] text-[#ece9fb] dark:text-[#ece9fb] light:text-[#18172b]">
                    {app.durationMinutes}m
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    step="5"
                    value={app.durationMinutes}
                    onChange={(e) => handleAppDurationChange(app.packageName, parseInt(e.target.value, 10))}
                    className="w-20 accent-[#8b7bff] cursor-pointer hidden sm:inline-block"
                    title="Simulate duration"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 4. Flagged-App Trend vs Color Correlation Chart */}
      <section className={`p-3.5 sm:p-4 rounded-lg space-y-2.5 border ${
        isDark ? 'bg-[#131320] border-white/[0.08]' : 'bg-white border-[#e7e4f4]'
      }`}>
        <div className="flex items-center justify-between pb-2 border-b border-inherit border-opacity-10 text-xs font-mono">
          <div>
            <span className={`font-semibold tracking-tight uppercase text-xs ${isDark ? 'text-[#ece9fb]' : 'text-[#18172b]'}`}>
              Distraction vs. Day Quality Correlation
            </span>
            <p className="text-[10px] text-[#7d7a96] mt-0.5 normal-case font-sans">
              Bar height represents distraction minutes; bar color reflects that day's self-evaluation rating.
            </p>
          </div>
        </div>

        <div className="h-20 flex items-end gap-1 bg-black/25 p-2 rounded-md overflow-hidden relative">
          {/* Reference benchmark line for 90m target limit */}
          <div 
            className="absolute left-0 right-0 border-t border-dashed pointer-events-none z-10" 
            style={{ bottom: '50%', borderColor: dialTeal, opacity: 0.5 }}
            title="90-Minute Threshold Reference"
          />

          {past14DaysTrend.map((day, idx) => {
            const heightPercent = Math.min(100, Math.max(15, (day.highRiskMinutes / 180) * 100));
            const colorDef = COLOR_DEFINITIONS[day.color as Exclude<DayColor, null>];

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center h-full justify-end group relative z-20"
              >
                <div
                  className="w-full rounded-xs transition-all group-hover:brightness-125"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: colorDef?.hex || '#71717a'
                  }}
                />
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black/95 text-[#ece9fb] text-[9px] px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-30 font-mono border border-white/10 shadow-md">
                  {day.displayDate}: {day.highRiskMinutes}m ({colorDef?.label})
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[9px] font-mono text-[#7d7a96] pt-1">
          <span>14 DAYS AGO</span>
          <span className="text-[#2dd4bf]">90M REF LIMIT</span>
          <span>TODAY</span>
        </div>
      </section>
    </div>
  );
};
