package com.axis.app;

import android.content.Context;
import android.content.Intent;
import android.view.View;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;

import java.util.ArrayList;
import java.util.List;

public class HabitsWidgetService extends RemoteViewsService {
    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        return new HabitsRemoteViewsFactory(this.getApplicationContext(), intent);
    }
}

class HabitsRemoteViewsFactory implements RemoteViewsService.RemoteViewsFactory {

    private final Context context;
    private List<WidgetStorageHelper.WidgetHabitItem> habits = new ArrayList<>();

    public HabitsRemoteViewsFactory(Context context, Intent intent) {
        this.context = context;
    }

    @Override
    public void onCreate() {
        loadData();
    }

    @Override
    public void onDataSetChanged() {
        loadData();
    }

    private void loadData() {
        habits = WidgetStorageHelper.getHabits(context);
    }

    @Override
    public void onDestroy() {
        habits.clear();
    }

    @Override
    public int getCount() {
        return habits.size();
    }

    @Override
    public RemoteViews getViewAt(int position) {
        if (position < 0 || position >= habits.size()) {
            return null;
        }

        WidgetStorageHelper.WidgetHabitItem habit = habits.get(position);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_habit_item);

        // Habit Name
        views.setTextViewText(R.id.tv_habit_name, habit.name);

        // Checkbox image: checked vs unchecked
        if (habit.completed) {
            views.setImageViewResource(R.id.btn_habit_check, R.drawable.ic_widget_check);
        } else {
            views.setImageViewResource(R.id.btn_habit_check, R.drawable.ic_widget_box);
        }

        // Anchor Habit Flame Icon visibility
        if (habit.isAnchor) {
            views.setViewVisibility(R.id.iv_anchor_flame, View.VISIBLE);
        } else {
            views.setViewVisibility(R.id.iv_anchor_flame, View.GONE);
        }

        // 1. Tapping Checkbox -> toggle habit completion
        Intent toggleFillIn = new Intent();
        toggleFillIn.putExtra("item_action", "toggle");
        toggleFillIn.putExtra("habit_id", habit.id);
        views.setOnClickFillInIntent(R.id.btn_habit_check, toggleFillIn);

        // 2. Tapping Habit Name / Row -> opens habit detail in app
        Intent openFillIn = new Intent();
        openFillIn.putExtra("item_action", "open_detail");
        openFillIn.putExtra("habit_id", habit.id);
        openFillIn.putExtra("habit_name", habit.name);
        views.setOnClickFillInIntent(R.id.tv_habit_name, openFillIn);
        views.setOnClickFillInIntent(R.id.habit_item_root, openFillIn);

        return views;
    }

    @Override
    public RemoteViews getLoadingView() {
        return null;
    }

    @Override
    public int getViewTypeCount() {
        return 1;
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    @Override
    public boolean hasStableIds() {
        return true;
    }
}
