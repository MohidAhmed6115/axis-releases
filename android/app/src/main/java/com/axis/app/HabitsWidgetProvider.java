package com.axis.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.widget.RemoteViews;

import java.util.List;

public class HabitsWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_HABIT_CLICK = "com.axis.app.ACTION_HABIT_CLICK";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        updateAppWidgets(context, appWidgetManager, appWidgetIds);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        String action = intent.getAction();

        if (ACTION_HABIT_CLICK.equals(action)) {
            String itemAction = intent.getStringExtra("item_action");
            String habitId = intent.getStringExtra("habit_id");

            if ("toggle".equals(itemAction) && habitId != null) {
                // Tapping checkbox marks habit complete/incomplete immediately
                WidgetStorageHelper.toggleHabitCompleted(context, habitId);
            } else if ("open_detail".equals(itemAction)) {
                // Tapping habit name opens that habit's detail / habits view in the app
                Intent openIntent = new Intent(context, MainActivity.class);
                openIntent.setAction(Intent.ACTION_VIEW);
                openIntent.setData(Uri.parse("com.axis.app://widget?route=habits" + (habitId != null ? "&habitId=" + habitId : "")));
                openIntent.putExtra("route", "habits");
                if (habitId != null) {
                    openIntent.putExtra("habitId", habitId);
                }
                openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                context.startActivity(openIntent);
            }
        }
    }

    public static void updateAppWidgets(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        List<WidgetStorageHelper.WidgetHabitItem> habits = WidgetStorageHelper.getHabits(context);
        int total = habits.size();
        int completed = 0;
        for (WidgetStorageHelper.WidgetHabitItem h : habits) {
            if (h.completed) completed++;
        }

        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_habits);

            // Live progress title bar: "X of Y done"
            views.setTextViewText(R.id.tv_habits_progress, completed + " of " + total + " done");

            // Connect RemoteViewsService for scrollable list
            Intent serviceIntent = new Intent(context, HabitsWidgetService.class);
            serviceIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
            serviceIntent.setData(Uri.parse(serviceIntent.toUri(Intent.URI_INTENT_SCHEME)));
            views.setRemoteAdapter(R.id.habits_list_view, serviceIntent);
            views.setEmptyView(R.id.habits_list_view, R.id.habits_empty_view);

            // PendingIntentTemplate for list items
            Intent itemClickIntent = new Intent(context, HabitsWidgetProvider.class);
            itemClickIntent.setAction(ACTION_HABIT_CLICK);
            itemClickIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);

            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                flags |= PendingIntent.FLAG_MUTABLE; // Mutable required for RemoteViews fillInIntent
            }

            PendingIntent itemClickPending = PendingIntent.getBroadcast(
                context, 
                appWidgetId, 
                itemClickIntent, 
                flags
            );
            views.setPendingIntentTemplate(R.id.habits_list_view, itemClickPending);

            // Header click opens Habits page in app
            Intent headerIntent = new Intent(context, MainActivity.class);
            headerIntent.setAction(Intent.ACTION_VIEW);
            headerIntent.setData(Uri.parse("com.axis.app://widget?route=habits"));
            headerIntent.putExtra("route", "habits");
            headerIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent headerPending = PendingIntent.getActivity(
                context, 
                1601, 
                headerIntent, 
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            views.setOnClickPendingIntent(R.id.widget_habits_header, headerPending);

            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }
}
