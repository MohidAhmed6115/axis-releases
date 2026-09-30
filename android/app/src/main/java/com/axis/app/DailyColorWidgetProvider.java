package com.axis.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

public class DailyColorWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_SET_COLOR_RED = "com.axis.app.ACTION_SET_COLOR_RED";
    public static final String ACTION_SET_COLOR_ORANGE = "com.axis.app.ACTION_SET_COLOR_ORANGE";
    public static final String ACTION_SET_COLOR_YELLOW = "com.axis.app.ACTION_SET_COLOR_YELLOW";
    public static final String ACTION_SET_COLOR_GREEN = "com.axis.app.ACTION_SET_COLOR_GREEN";
    public static final String ACTION_SET_COLOR_GOLD = "com.axis.app.ACTION_SET_COLOR_GOLD";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        updateAppWidgets(context, appWidgetManager, appWidgetIds);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        String action = intent.getAction();
        if (action == null) return;

        String targetColor = null;
        if (ACTION_SET_COLOR_RED.equals(action)) {
            targetColor = "red";
        } else if (ACTION_SET_COLOR_ORANGE.equals(action)) {
            targetColor = "orange";
        } else if (ACTION_SET_COLOR_YELLOW.equals(action)) {
            targetColor = "yellow";
        } else if (ACTION_SET_COLOR_GREEN.equals(action)) {
            targetColor = "green";
        } else if (ACTION_SET_COLOR_GOLD.equals(action)) {
            targetColor = "gold";
        }

        if (targetColor != null) {
            String currentColor = WidgetStorageHelper.getTodayColor(context);
            // Requirement: Tapping already-selected circle does nothing (prevents accidental un-rating)
            if (!targetColor.equalsIgnoreCase(currentColor)) {
                WidgetStorageHelper.setTodayColor(context, targetColor);
            }
        }
    }

    public static void updateAppWidgets(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        String currentColor = WidgetStorageHelper.getTodayColor(context);

        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_daily_color);

            // Configure circle drawables based on whether a rating is currently active
            if (currentColor == null || currentColor.isEmpty()) {
                // No rating set today: show all 5 in vibrant initial state
                views.setImageViewResource(R.id.btn_color_red, R.drawable.widget_circle_red);
                views.setImageViewResource(R.id.btn_color_orange, R.drawable.widget_circle_orange);
                views.setImageViewResource(R.id.btn_color_yellow, R.drawable.widget_circle_yellow);
                views.setImageViewResource(R.id.btn_color_green, R.drawable.widget_circle_green);
                views.setImageViewResource(R.id.btn_color_gold, R.drawable.widget_circle_gold);
                views.setTextViewText(R.id.tv_today_status, "Tap to log");
            } else {
                // A rating is selected: highlight the selected circle and dim all other 4
                views.setImageViewResource(
                    R.id.btn_color_red, 
                    "red".equalsIgnoreCase(currentColor) ? R.drawable.widget_circle_red_selected : R.drawable.widget_circle_dimmed
                );
                views.setImageViewResource(
                    R.id.btn_color_orange, 
                    "orange".equalsIgnoreCase(currentColor) ? R.drawable.widget_circle_orange_selected : R.drawable.widget_circle_dimmed
                );
                views.setImageViewResource(
                    R.id.btn_color_yellow, 
                    "yellow".equalsIgnoreCase(currentColor) ? R.drawable.widget_circle_yellow_selected : R.drawable.widget_circle_dimmed
                );
                views.setImageViewResource(
                    R.id.btn_color_green, 
                    "green".equalsIgnoreCase(currentColor) ? R.drawable.widget_circle_green_selected : R.drawable.widget_circle_dimmed
                );
                views.setImageViewResource(
                    R.id.btn_color_gold, 
                    "gold".equalsIgnoreCase(currentColor) ? R.drawable.widget_circle_gold_selected : R.drawable.widget_circle_dimmed
                );
                views.setTextViewText(R.id.tv_today_status, "Rated: " + currentColor.toUpperCase());
            }

            // Set tap PendingIntents for each circle
            views.setOnClickPendingIntent(R.id.btn_color_red, getBroadcastIntent(context, ACTION_SET_COLOR_RED));
            views.setOnClickPendingIntent(R.id.btn_color_orange, getBroadcastIntent(context, ACTION_SET_COLOR_ORANGE));
            views.setOnClickPendingIntent(R.id.btn_color_yellow, getBroadcastIntent(context, ACTION_SET_COLOR_YELLOW));
            views.setOnClickPendingIntent(R.id.btn_color_green, getBroadcastIntent(context, ACTION_SET_COLOR_GREEN));
            views.setOnClickPendingIntent(R.id.btn_color_gold, getBroadcastIntent(context, ACTION_SET_COLOR_GOLD));

            // Tap on header / background opens the full Daily Review screen in the app
            Intent appIntent = new Intent(context, MainActivity.class);
            appIntent.setAction(Intent.ACTION_VIEW);
            appIntent.setData(android.net.Uri.parse("com.axis.app://widget?route=reviews&date=" + WidgetStorageHelper.getTodayDateString()));
            appIntent.putExtra("route", "reviews");
            appIntent.putExtra("date", WidgetStorageHelper.getTodayDateString());
            appIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

            PendingIntent openAppPending = PendingIntent.getActivity(
                context, 
                1001, 
                appIntent, 
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            views.setOnClickPendingIntent(R.id.widget_daily_header, openAppPending);
            views.setOnClickPendingIntent(R.id.tv_daily_hint, openAppPending);

            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }

    private static PendingIntent getBroadcastIntent(Context context, String action) {
        Intent intent = new Intent(context, DailyColorWidgetProvider.class);
        intent.setAction(action);
        return PendingIntent.getBroadcast(
            context, 
            action.hashCode(), 
            intent, 
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }
}
