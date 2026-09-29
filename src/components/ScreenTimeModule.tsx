import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Smartphone, 
  AlertTriangle, 
  CheckCircle, 
  Settings2, 
  Plus, 
  Trash2, 
  BarChart, 
  TrendingUp, 
  Info,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { COLOR_DEFINITIONS, DayColor } from '../types';
import { 
  isAndroidCapacitor, 
  isElectronEnvironment, 
  checkNativeUsagePermission, 
  requestNativeUsagePermission, 
  fetchNativeUsageStats 
} from '../services/usageStatsService';

export const ScreenTimeModule: React.FC = () => {
  const { 
    platform, 
    screenTimeSettings, 
    setHighRiskApps, 
    updateSimulatedScreenTime, 
    selectedDate, 
    dailyRecords 
  } = useApp();

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [newPackageInput, setNewPackageInput] = useState('');
  const [hasNativePermission, setHasNativePermission] = useState<boolean | null>(null);
  const [isSyncingStats, setIsSyncingStats] = useState(false);

  const isAndroidNative = isAndroidCapacitor();
  const isElectron = isElectronEnvironment();

  // Hide entirely if not in Android mode or if running inside Electron desktop shell
  if (platform !== 'android' || isElectron) {
    return null;
  }

  const { highRiskApps, simulatedScreenTime } = screenTimeSettings;
  const { totalMinutes, highRiskMinutes, apps } = simulatedScreenTime;

  // Check Android native permission status on mount
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
        // Map native packages to screen-time data
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

  const highRiskPercentage = totalMinutes > 0 ? Math.round((highRiskMinutes / totalMinutes) * 100) : 0;

  const past30DaysTrend = Array.from({ length: 14 }).map((_, i) => {
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

  return (
    <section className="bg-[#121922] rounded-2xl p-3 sm:p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-semibold text-white tracking-tight">Screen Time</h2>
            <span className="text-zinc-600 text-xs">·</span>
            <span className="text-[11px] text-zinc-400 font-mono tabular-nums">
              Telemetry
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
            Auto-detects high-risk app usage.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {isAndroidNative && (
            hasNativePermission === false ? (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="text-[11px] flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors cursor-pointer font-medium"
                title="Open system Usage Access settings"
              >
                <ShieldCheck className="w-3 h-3 stroke-[2]" />
                <span>Grant Usage Access</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={syncFromNativePlugin}
                disabled={isSyncingStats}
                className="text-[11px] flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors cursor-pointer font-medium disabled:opacity-50"
                title="Sync from Android UsageStatsManager"
              >
                <RefreshCw className={`w-3 h-3 stroke-[2] ${isSyncingStats ? 'animate-spin' : ''}`} />
                <span>Sync Native</span>
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="text-[11px] flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-zinc-200 transition-colors cursor-pointer font-medium"
          >
            <Settings2 className="w-3 h-3 stroke-[1.75]" />
            <span>{isConfigOpen ? 'Hide' : 'Filter'}</span>
          </button>
        </div>
      </div>

      {/* Top metrics summary cards */}
      <div className="grid grid-cols-3 gap-2 my-2.5">
        <div className="p-2 sm:p-2.5 rounded-xl bg-[#0b0f14]">
          <span className="text-[10px] text-zinc-500 font-medium block">Total</span>
          <div className="text-xs sm:text-sm font-bold text-white font-mono tabular-nums mt-0.5">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </div>
        </div>

        <div className="p-2 sm:p-2.5 rounded-xl bg-[#0b0f14]">
          <span className="text-[10px] text-zinc-500 font-medium block">High-Risk</span>
          <div className={`text-xs sm:text-sm font-bold font-mono tabular-nums mt-0.5 ${highRiskMinutes > 90 ? 'text-amber-400' : 'text-zinc-200'}`}>
            {Math.floor(highRiskMinutes / 60)}h {highRiskMinutes % 60}m
          </div>
        </div>

        <div className="p-2 sm:p-2.5 rounded-xl bg-[#0b0f14]">
          <span className="text-[10px] text-zinc-500 font-medium block">Status</span>
          <div className="text-[11px] font-semibold text-zinc-300 mt-0.5 truncate">
            {highRiskMinutes >= 180 ? 'Exceeded' : highRiskMinutes >= 90 ? 'Caution' : 'Optimal'}
          </div>
        </div>
      </div>

      {/* Flagged Apps Configuration */}
      {isConfigOpen && (
        <div className="my-2.5 p-2.5 rounded-xl bg-[#0b0f14] space-y-2 text-xs">
          <span className="text-[11px] font-semibold text-zinc-200 block">Flagged Package Registry</span>

          <form onSubmit={handleAddApp} className="flex gap-2">
            <input
              type="text"
              value={newPackageInput}
              onChange={(e) => setNewPackageInput(e.target.value)}
              placeholder="e.g. com.snapchat.android..."
              className="flex-1 bg-[#121922] rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none placeholder:text-zinc-600"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-white text-zinc-950 font-semibold text-[11px] rounded-lg hover:bg-zinc-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3 h-3 stroke-[2]" />
              <span>Add</span>
            </button>
          </form>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {highRiskApps.length === 0 ? (
              <span className="text-[10px] text-zinc-500 font-mono py-1">
                No distraction packages registered.
              </span>
            ) : (
              highRiskApps.map((pkg) => (
                <span
                  key={pkg}
                  className="inline-flex items-center gap-1.5 text-[10px] font-mono text-zinc-300 bg-white/[0.04] px-2 py-0.5 rounded-md"
                >
                  <span>{pkg}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveApp(pkg)}
                    className="text-zinc-500 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-2.5 h-2.5 stroke-[1.75]" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
      )}

      {/* Per-App Duration Breakdown Table */}
      <div className="mt-3 space-y-1.5">
        <span className="text-[11px] font-semibold text-zinc-400 block">Today's App Breakdown</span>
        <div className="divide-y divide-white/[0.04]">
          {apps.length === 0 ? (
            <div className="py-4 text-center text-zinc-500 text-[11px] font-mono">
              No app telemetry recorded today.
            </div>
          ) : (
            apps.map((app) => (
              <div
                key={app.packageName}
                className="py-2 flex items-center justify-between text-xs group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-1.5 h-3 rounded-full shrink-0 ${app.isHighRisk ? 'bg-amber-400' : 'bg-zinc-600'}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-zinc-200 text-xs truncate">{app.appName}</span>
                      <span className="text-zinc-600 text-[10px]">·</span>
                      <span className="text-zinc-500 font-mono text-[10px] truncate">{app.packageName}</span>
                    </div>
                    {app.isHighRisk && (
                      <span className="text-[9px] text-amber-400/90 font-medium">Flagged</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono tabular-nums text-zinc-300 text-[11px]">
                    {app.durationMinutes}m
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    step="5"
                    value={app.durationMinutes}
                    onChange={(e) => handleAppDurationChange(app.packageName, parseInt(e.target.value, 10))}
                    className="w-16 accent-emerald-500 cursor-pointer hidden sm:inline-block"
                    title="Simulate telemetry"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 14-Day Micro Correlation Trend */}
      <div className="mt-3 pt-3 border-t border-white/[0.04]">
        <div className="flex items-center justify-between mb-2 text-[11px]">
          <span className="font-semibold text-zinc-300">14-Day Trend</span>
          <span className="text-zinc-500 text-[10px]">High-risk vs color score</span>
        </div>

        <div className="flex items-center gap-1 h-14 items-end bg-[#0b0f14] p-2 rounded-xl overflow-hidden">
          {past30DaysTrend.map((day, idx) => {
            const heightPercent = Math.min(100, Math.max(15, (day.highRiskMinutes / 180) * 100));
            const colorDef = COLOR_DEFINITIONS[day.color as Exclude<DayColor, null>];

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center h-full justify-end group relative"
              >
                <div
                  className="w-full rounded-t-xs transition-all group-hover:brightness-125"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: colorDef?.hex || '#71717a'
                  }}
                />
                {/* Tooltip on hover */}
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 border border-white/20 text-[9px] text-white px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-20 shadow-lg">
                  {day.displayDate}: {day.highRiskMinutes}m
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-1 text-[9px] text-zinc-500">
          <span>14d ago</span>
          <span>Today</span>
        </div>
      </div>
    </section>
  );
};
