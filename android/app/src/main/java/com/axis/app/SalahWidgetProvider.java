package com.axis.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

public class SalahWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_TOGGLE_SALAH = "com.axis.app.ACTION_TOGGLE_SALAH";
    public static final String EXTRA_PRAYER = "extra_prayer";
    public static final String EXTRA_STATUS = "extra_status";

    private static final String[] PRAYERS = {"fajr", "zuhr", "asr", "maghrib", "isha"};

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        updateAppWidgets(context, appWidgetManager, appWidgetIds);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        String action = intent.getAction();
        if (ACTION_TOGGLE_SALAH.equals(action)) {
            String prayer = intent.getStringExtra(EXTRA_PRAYER);
            String status = intent.getStringExtra(EXTRA_STATUS);
            if (prayer != null && status != null) {
                WidgetStorageHelper.toggleSalahPrayer(context, prayer, status);
            }
        }
    }

    public static void updateAppWidgets(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        int loggedCount = WidgetStorageHelper.getLoggedPrayersCount(context);

        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_salah_tracker);

            // Set summary counter in header
            views.setTextViewText(R.id.tv_salah_summary, loggedCount + "/5 Done");

            // Configure each of the 5 prayer rows
            configurePrayerRow(context, views, "fajr", R.id.tv_name_fajr, R.id.btn_fajr_solo, R.id.btn_fajr_bajamat, 1101, 1102, 1103);
            configurePrayerRow(context, views, "zuhr", R.id.tv_name_zuhr, R.id.btn_zuhr_solo, R.id.btn_zuhr_bajamat, 1201, 1202, 1203);
            configurePrayerRow(context, views, "asr", R.id.tv_name_asr, R.id.btn_asr_solo, R.id.btn_asr_bajamat, 1301, 1302, 1303);
            configurePrayerRow(context, views, "maghrib", R.id.tv_name_maghrib, R.id.btn_maghrib_solo, R.id.btn_maghrib_bajamat, 1401, 1402, 1403);
            configurePrayerRow(context, views, "isha", R.id.tv_name_isha, R.id.btn_isha_solo, R.id.btn_isha_bajamat, 1501, 1502, 1503);

            // Header click opens app directly to Salah Tracker
            Intent openSalahIntent = new Intent(context, MainActivity.class);
            openSalahIntent.setAction(Intent.ACTION_VIEW);
            openSalahIntent.setData(android.net.Uri.parse("com.axis.app://widget?route=salah"));
            openSalahIntent.putExtra("route", "salah");
            openSalahIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

            PendingIntent headerPending = PendingIntent.getActivity(
                context, 
                1099, 
                openSalahIntent, 
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            views.setOnClickPendingIntent(R.id.widget_salah_header, headerPending);

            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }

    private static void configurePrayerRow(
        Context context, 
        RemoteViews views, 
        String prayerName, 
        int nameViewId, 
        int soloBtnId, 
        int bajamatBtnId,
        int reqCodeName,
        int reqCodeSolo,
        int reqCodeBajamat
    ) {
        String status = WidgetStorageHelper.getSalahPrayer(context, prayerName);

        // Highlight active status
        if ("solo".equalsIgnoreCase(status)) {
            views.setImageViewResource(soloBtnId, R.drawable.widget_salah_btn_solo_selected);
            views.setImageViewResource(bajamatBtnId, R.drawable.widget_salah_btn_unselected);
        } else if ("bajamat".equalsIgnoreCase(status)) {
            views.setImageViewResource(soloBtnId, R.drawable.widget_salah_btn_unselected);
            views.setImageViewResource(bajamatBtnId, R.drawable.widget_salah_btn_bajamat_selected);
        } else {
            views.setImageViewResource(soloBtnId, R.drawable.widget_salah_btn_unselected);
            views.setImageViewResource(bajamatBtnId, R.drawable.widget_salah_btn_unselected);
        }

        // Tapping Solo button
        Intent soloIntent = new Intent(context, SalahWidgetProvider.class);
        soloIntent.setAction(ACTION_TOGGLE_SALAH);
        soloIntent.putExtra(EXTRA_PRAYER, prayerName);
        soloIntent.putExtra(EXTRA_STATUS, "solo");
        PendingIntent soloPending = PendingIntent.getBroadcast(
            context, 
            reqCodeSolo, 
            soloIntent, 
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(soloBtnId, soloPending);

        // Tapping Bajamat button
        Intent bajamatIntent = new Intent(context, SalahWidgetProvider.class);
        bajamatIntent.setAction(ACTION_TOGGLE_SALAH);
        bajamatIntent.putExtra(EXTRA_PRAYER, prayerName);
        bajamatIntent.putExtra(EXTRA_STATUS, "bajamat");
        PendingIntent bajamatPending = PendingIntent.getBroadcast(
            context, 
            reqCodeBajamat, 
            bajamatIntent, 
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(bajamatBtnId, bajamatPending);

        // Tapping the prayer name opens the app's Salah Tracker page directly
        Intent nameIntent = new Intent(context, MainActivity.class);
        nameIntent.setAction(Intent.ACTION_VIEW);
        nameIntent.setData(android.net.Uri.parse("com.axis.app://widget?route=salah&prayer=" + prayerName));
        nameIntent.putExtra("route", "salah");
        nameIntent.putExtra("prayer", prayerName);
        nameIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent namePending = PendingIntent.getActivity(
            context, 
            reqCodeName, 
            nameIntent, 
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(nameViewId, namePending);
    }
}
