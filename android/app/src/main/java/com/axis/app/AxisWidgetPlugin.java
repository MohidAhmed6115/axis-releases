package com.axis.app;

import android.content.Context;
import android.content.SharedPreferences;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

@CapacitorPlugin(name = "AxisWidget")
public class AxisWidgetPlugin extends Plugin {

    @PluginMethod
    public void syncWidgetData(PluginCall call) {
        try {
            Context context = getContext();
            SharedPreferences prefs = WidgetStorageHelper.getPrefs(context);
            SharedPreferences.Editor editor = prefs.edit();

            // 1. Date
            String date = call.getString("date", WidgetStorageHelper.getTodayDateString());
            editor.putString("today_date", date);

            // 2. Day Color & Note
            if (call.hasOption("color")) {
                String color = call.getString("color", "");
                editor.putString("today_color", color != null ? color : "");
            }
            if (call.hasOption("note")) {
                String note = call.getString("note", "");
                editor.putString("today_note", note != null ? note : "");
            }

            // 3. Salah Prayers
            JSObject salah = call.getObject("salah");
            if (salah != null) {
                editor.putString("salah_fajr", salah.optString("fajr", "none"));
                editor.putString("salah_zuhr", salah.optString("zuhr", "none"));
                editor.putString("salah_asr", salah.optString("asr", "none"));
                editor.putString("salah_maghrib", salah.optString("maghrib", "none"));
                editor.putString("salah_isha", salah.optString("isha", "none"));
            }

            // 4. Habits List
            JSArray habitsArr = call.getArray("habits");
            if (habitsArr != null) {
                editor.putString("habits_json", habitsArr.toString());
            }

            editor.apply();

            // Refresh all 3 home screen widgets immediately
            WidgetStorageHelper.notifyAllWidgets(context);

            JSObject ret = new JSObject();
            ret.put("synced", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Error syncing widget data: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getWidgetData(PluginCall call) {
        try {
            Context context = getContext();
            SharedPreferences prefs = WidgetStorageHelper.getPrefs(context);

            JSObject ret = new JSObject();
            ret.put("todayDate", prefs.getString("today_date", WidgetStorageHelper.getTodayDateString()));
            ret.put("color", prefs.getString("today_color", ""));
            ret.put("note", prefs.getString("today_note", ""));
            ret.put("hasPendingSync", WidgetStorageHelper.hasPendingSync(context));

            // Salah object
            JSObject salahObj = new JSObject();
            salahObj.put("fajr", prefs.getString("salah_fajr", "none"));
            salahObj.put("zuhr", prefs.getString("salah_zuhr", "none"));
            salahObj.put("asr", prefs.getString("salah_asr", "none"));
            salahObj.put("maghrib", prefs.getString("salah_maghrib", "none"));
            salahObj.put("isha", prefs.getString("salah_isha", "none"));
            ret.put("salah", salahObj);

            // Habits array
            String habitsJson = prefs.getString("habits_json", "[]");
            ret.put("habitsJson", habitsJson);

            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Error getting widget data: " + e.getMessage());
        }
    }

    @PluginMethod
    public void clearPendingSync(PluginCall call) {
        WidgetStorageHelper.clearPendingSync(getContext());
        JSObject ret = new JSObject();
        ret.put("cleared", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void notifyWidgets(PluginCall call) {
        WidgetStorageHelper.notifyAllWidgets(getContext());
        JSObject ret = new JSObject();
        ret.put("notified", true);
        call.resolve(ret);
    }
}
