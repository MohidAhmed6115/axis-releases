package com.axis.app;

import android.app.AppOpsManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
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

    private boolean checkUsagePermission() {
        Context context = getContext();
        AppOpsManager appOps = (AppOpsManager) context.getSystemService(Context.APP_OPS_SERVICE);
        if (appOps == null) {
            return false;
        }
        int mode = appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            Process.myUid(),
            context.getPackageName()
        );
        return mode == AppOpsManager.MODE_ALLOWED;
    }

    @PluginMethod
    public void hasUsagePermission(PluginCall call) {
        boolean hasPermission = checkUsagePermission();
        JSObject ret = new JSObject();
        ret.put("granted", hasPermission);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestUsagePermission(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            JSObject ret = new JSObject();
            ret.put("requested", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to open usage access settings: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getUsageStats(PluginCall call) {
        if (!checkUsagePermission()) {
            call.reject("Permission not granted", "PERMISSION_DENIED");
            return;
        }

        try {
            Context context = getContext();
            UsageStatsManager usageStatsManager = (UsageStatsManager) context.getSystemService(Context.USAGE_STATS_SERVICE);
            if (usageStatsManager == null) {
                call.reject("UsageStatsManager not available");
                return;
            }

            // Defaults: Start of today (00:00:00) to now
            Calendar cal = Calendar.getInstance();
            long endTime = call.getLong("endDate", cal.getTimeInMillis());

            cal.set(Calendar.HOUR_OF_DAY, 0);
            cal.set(Calendar.MINUTE, 0);
            cal.set(Calendar.SECOND, 0);
            cal.set(Calendar.MILLISECOND, 0);
            long startTime = call.getLong("startDate", cal.getTimeInMillis());

            List<UsageStats> statsList = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime,
                endTime
            );

            JSArray resultStats = new JSArray();
            if (statsList != null) {
                for (UsageStats stat : statsList) {
                    long totalTimeInForeground = stat.getTotalTimeInForeground();
                    if (totalTimeInForeground > 0) {
                        JSObject obj = new JSObject();
                        obj.put("packageName", stat.getPackageName());
                        obj.put("totalTimeInForegroundMs", totalTimeInForeground);
                        obj.put("totalMinutes", totalTimeInForeground / 60000);
                        obj.put("lastTimeUsed", stat.getLastTimeUsed());
                        resultStats.put(obj);
                    }
                }
            }

            JSObject ret = new JSObject();
            ret.put("stats", resultStats);
            ret.put("startTime", startTime);
            ret.put("endTime", endTime);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Error querying usage stats: " + e.getMessage());
        }
    }
}
