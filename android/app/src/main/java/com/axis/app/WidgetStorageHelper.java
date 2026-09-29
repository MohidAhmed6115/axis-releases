package com.axis.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class WidgetStorageHelper {

    private static final String PREFS_NAME = "AxisWidgetPrefs";

    // Keys
    private static final String KEY_TODAY_DATE = "today_date";
    private static final String KEY_TODAY_COLOR = "today_color";
    private static final String KEY_TODAY_NOTE = "today_note";

    private static final String KEY_SALAH_FAJR = "salah_fajr";
    private static final String KEY_SALAH_ZUHR = "salah_zuhr";
    private static final String KEY_SALAH_ASR = "salah_asr";
    private static final String KEY_SALAH_MAGHRIB = "salah_maghrib";
    private static final String KEY_SALAH_ISHA = "salah_isha";

    private static final String KEY_HABITS_JSON = "habits_json";
    private static final String KEY_PENDING_SYNC = "pending_sync";

    public static SharedPreferences getPrefs(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public static String getTodayDateString() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        return sdf.format(new Date());
    }

    // --- DAILY EVALUATION RATING ---

    public static String getTodayColor(Context context) {
        SharedPreferences prefs = getPrefs(context);
        String savedDate = prefs.getString(KEY_TODAY_DATE, "");
        String currentDate = getTodayDateString();
        if (!currentDate.equals(savedDate)) {
            return ""; // New day, clear rating until set
        }
        return prefs.getString(KEY_TODAY_COLOR, "");
    }

    public static void setTodayColor(Context context, String color) {
        SharedPreferences prefs = getPrefs(context);
        String currentDate = getTodayDateString();
        prefs.edit()
            .putString(KEY_TODAY_DATE, currentDate)
            .putString(KEY_TODAY_COLOR, color)
            .putBoolean(KEY_PENDING_SYNC, true)
            .apply();

        updateDailyColorWidget(context);
    }

    // --- SALAH TRACKER ---

    public static String getSalahPrayer(Context context, String prayerName) {
        SharedPreferences prefs = getPrefs(context);
        String savedDate = prefs.getString(KEY_TODAY_DATE, "");
        String currentDate = getTodayDateString();
        if (!currentDate.equals(savedDate)) {
            return "none";
        }
        String key = "salah_" + prayerName.toLowerCase();
        return prefs.getString(key, "none");
    }

    public static void toggleSalahPrayer(Context context, String prayerName, String targetStatus) {
        SharedPreferences prefs = getPrefs(context);
        String key = "salah_" + prayerName.toLowerCase();
        String currentStatus = getSalahPrayer(context, prayerName);

        String newStatus;
        if (currentStatus.equals(targetStatus)) {
            newStatus = "none"; // Toggle off if already selected
        } else {
            newStatus = targetStatus;
        }

        prefs.edit()
            .putString(KEY_TODAY_DATE, getTodayDateString())
            .putString(key, newStatus)
            .putBoolean(KEY_PENDING_SYNC, true)
            .apply();

        updateSalahWidget(context);
    }

    public static int getLoggedPrayersCount(Context context) {
        String[] prayers = {"fajr", "zuhr", "asr", "maghrib", "isha"};
        int count = 0;
        for (String p : prayers) {
            String status = getSalahPrayer(context, p);
            if ("solo".equals(status) || "bajamat".equals(status)) {
                count++;
            }
        }
        return count;
    }

    // --- HABITS ---

    public static class WidgetHabitItem {
        public String id;
        public String name;
        public boolean isAnchor;
        public boolean completed;

        public WidgetHabitItem(String id, String name, boolean isAnchor, boolean completed) {
            this.id = id;
            this.name = name;
            this.isAnchor = isAnchor;
            this.completed = completed;
        }
    }

    public static List<WidgetHabitItem> getHabits(Context context) {
        List<WidgetHabitItem> list = new ArrayList<>();
        SharedPreferences prefs = getPrefs(context);
        String jsonStr = prefs.getString(KEY_HABITS_JSON, "[]");
        try {
            JSONArray arr = new JSONArray(jsonStr);
            for (int i = 0; i < arr.length(); i++) {
                JSONObject obj = arr.getJSONObject(i);
                list.add(new WidgetHabitItem(
                    obj.optString("id", ""),
                    obj.optString("name", "Habit"),
                    obj.optBoolean("isAnchor", false),
                    obj.optBoolean("completed", false)
                ));
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return list;
    }

    public static void toggleHabitCompleted(Context context, String habitId) {
        SharedPreferences prefs = getPrefs(context);
        String jsonStr = prefs.getString(KEY_HABITS_JSON, "[]");
        try {
            JSONArray arr = new JSONArray(jsonStr);
            for (int i = 0; i < arr.length(); i++) {
                JSONObject obj = arr.getJSONObject(i);
                if (obj.optString("id", "").equals(habitId)) {
                    boolean current = obj.optBoolean("completed", false);
                    obj.put("completed", !current);
                    break;
                }
            }
            prefs.edit()
                .putString(KEY_HABITS_JSON, arr.toString())
                .putBoolean(KEY_PENDING_SYNC, true)
                .apply();
        } catch (JSONException e) {
            e.printStackTrace();
        }

        updateHabitsWidget(context);
    }

    // --- SYNC STATE ---

    public static boolean hasPendingSync(Context context) {
        return getPrefs(context).getBoolean(KEY_PENDING_SYNC, false);
    }

    public static void clearPendingSync(Context context) {
        getPrefs(context).edit().putBoolean(KEY_PENDING_SYNC, false).apply();
    }

    // --- WIDGET REFRESH BROADCASTS ---

    public static void notifyAllWidgets(Context context) {
        updateDailyColorWidget(context);
        updateSalahWidget(context);
        updateHabitsWidget(context);
    }

    public static void updateDailyColorWidget(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName cn = new ComponentName(context, DailyColorWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(cn);
        if (ids != null && ids.length > 0) {
            DailyColorWidgetProvider.updateAppWidgets(context, manager, ids);
        }
    }

    public static void updateSalahWidget(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName cn = new ComponentName(context, SalahWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(cn);
        if (ids != null && ids.length > 0) {
            SalahWidgetProvider.updateAppWidgets(context, manager, ids);
        }
    }

    public static void updateHabitsWidget(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName cn = new ComponentName(context, HabitsWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(cn);
        if (ids != null && ids.length > 0) {
            manager.notifyAppWidgetViewDataChanged(ids, R.id.habits_list_view);
            HabitsWidgetProvider.updateAppWidgets(context, manager, ids);
        }
    }
}
