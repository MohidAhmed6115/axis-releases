package com.axis.app;

import android.app.AppOpsManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Process;
import android.provider.Settings;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Calendar;
import java.util.List;

@CapacitorPlugin(name = "UsageStats")
public class UsageStatsPlugin extends Plugin {

    @PluginMethod
    public void hasUsagePermission(PluginCall call) {
        boolean granted = checkUsageStatsPermission();
        JSObject ret = new JSObject();
        ret.put("granted", granted);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestUsagePermission(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            JSObject ret = new JSObject();
            ret.put("opened", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Could not open Usage Access settings: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getUsageStats(PluginCall call) {
        if (!checkUsageStatsPermission()) {
            call.reject("Usage Access permission not granted. Call requestUsagePermission() first.");
            return;
        }

        long startTime = call.getLong("startTime", 0L);
        long endTime = call.getLong("endTime", 0L);

        // Default to beginning of today up to now if not specified
        if (startTime <= 0L || endTime <= 0L || endTime <= startTime) {
            Calendar cal = Calendar.getInstance();
            endTime = cal.getTimeInMillis();
            cal.set(Calendar.HOUR_OF_DAY, 0);
            cal.set(Calendar.MINUTE, 0);
            cal.set(Calendar.SECOND, 0);
            cal.set(Calendar.MILLISECOND, 0);
            startTime = cal.getTimeInMillis();
        }

        try {
            UsageStatsManager usageStatsManager = (UsageStatsManager) getContext().getSystemService(Context.USAGE_STATS_SERVICE);
            if (usageStatsManager == null) {
                call.reject("UsageStatsManager service not available on this device");
                return;
            }

            List<UsageStats> statsList = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime,
                endTime
            );

            JSArray resultArr = new JSArray();
            if (statsList != null) {
                for (UsageStats stats : statsList) {
                    long totalTimeMs = stats.getTotalTimeInForeground();
                    if (totalTimeMs > 0) {
                        JSObject item = new JSObject();
                        item.put("packageName", stats.getPackageName());
                        item.put("totalTimeForegroundMs", totalTimeMs);
                        item.put("totalMinutes", totalTimeMs / (1000 * 60));
                        item.put("lastTimeUsed", stats.getLastTimeUsed());
                        item.put("firstTimeStamp", stats.getFirstTimeStamp());
                        item.put("lastTimeStamp", stats.getLastTimeStamp());
                        resultArr.put(item);
                    }
                }
            }

            JSObject ret = new JSObject();
            ret.put("usageStats", resultArr);
            ret.put("startTime", startTime);
            ret.put("endTime", endTime);
            call.resolve(ret);

        } catch (Exception e) {
            call.reject("Failed to query UsageStats: " + e.getMessage());
        }
    }

    private boolean checkUsageStatsPermission() {
        try {
            AppOpsManager appOps = (AppOpsManager) getContext().getSystemService(Context.APP_OPS_SERVICE);
            if (appOps == null) return false;

            int mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                getContext().getPackageName()
            );

            return mode == AppOpsManager.MODE_ALLOWED;
        } catch (Exception e) {
            return false;
        }
    }
}
