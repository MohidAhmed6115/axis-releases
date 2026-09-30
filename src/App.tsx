import React, { useState, useRef, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { useTheme } from './context/ThemeContext';
import { Sidebar, NavPage } from './components/Sidebar';
import { MobileTabBar } from './components/MobileTabBar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { HabitsPage } from './components/HabitsPage';
import { TasksPage } from './components/TasksPage';
import { CalendarPage } from './components/CalendarPage';
import { DailyReviewHistoryPage } from './components/DailyReviewHistoryPage';
import { ScreenTimePage } from './components/ScreenTimePage';
import { SettingsPage } from './components/SettingsPage';
import { SalahPage } from './components/SalahPage';
import { SyncBanner } from './components/SyncBanner';
import { AuthScreen } from './components/AuthScreen';
import { SalahReminderToast } from './components/SalahReminderToast';
import { ContributeModal } from './components/ContributeModal';
import { ReleaseNotesModal } from './components/ReleaseNotesModal';
import { SWIPE_SENSITIVITY_THRESHOLDS } from './types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_ORDER: NavPage[] = [
  'dashboard', 
  'salah', 
  'habits', 
  'tasks', 
  'calendar', 
  'reviews', 
  'screentime', 
  'settings'
];

export default function App() {
  const { 
    isAuthModalOpen, 
    closeAuthModal,
    swipeGestureSettings
  } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Navigation state
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  // Sidebar defaults to collapsed (icon-only), expandable on tap
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);

  // Global modals
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [isReleaseNotesModalOpen, setIsReleaseNotesModalOpen] = useState(false);

  // Swipe Navigation HUD Feedback
  const [swipeNavIndicator, setSwipeNavIndicator] = useState<{ direction: 'prev' | 'next'; label: string } | null>(null);

  // Deep link listener for native widget taps
  useEffect(() => {
    import('@capacitor/app').then(({ App: CapApp }) => {
      const handle = CapApp.addListener('appUrlOpen', (event) => {
        try {
          if (event.url.includes('route=reviews')) {
            setCurrentPage('reviews');
          } else if (event.url.includes('route=salah')) {
            setCurrentPage('salah');
          } else if (event.url.includes('route=habits')) {
            setCurrentPage('habits');
          }
        } catch (e) {
          console.warn('Error handling deep link route:', e);
        }
      });
      return () => {
        handle.then(h => h.remove()).catch(() => {});
      };
    }).catch(() => {});
  }, []);

  // Touch gesture refs for screen navigation
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchValidRef = useRef<boolean>(false);

  const pageTitles: Record<NavPage, string> = {
    dashboard: 'Dashboard',
    salah: 'Salah Tracker',
    habits: 'Habits & Streaks',
    tasks: 'Tasks & Action Items',
    calendar: 'Calendar & Milestones',
    reviews: 'Daily Review & Heatmap',
    screentime: 'Screen-Time Telemetry',
    settings: 'Settings & Preferences'
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!swipeGestureSettings?.enabled || !swipeGestureSettings?.enablePageNavigation) {
      touchValidRef.current = false;
      return;
    }

    const target = e.target as HTMLElement;
    // Ignore swipe navigation when touch originates in interactive controls or task swipe rows
    if (target.closest('input, textarea, select, button, [role="slider"], [role="switch"], [data-gesture-ignore], .cursor-grab, .cursor-pointer')) {
      touchValidRef.current = false;
      return;
    }

    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    touchValidRef.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchValidRef.current || touchStartXRef.current === null || touchStartYRef.current === null) {
      return;
    }

    const touch = e.changedTouches[0];
    const diffX = touch.clientX - touchStartXRef.current;
    const diffY = touch.clientY - touchStartYRef.current;

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchValidRef.current = false;

    // Horizontal gesture must dominate vertical scrolling
    if (Math.abs(diffX) <= Math.abs(diffY) * 1.3) {
      return;
    }

    const sensitivityCfg = SWIPE_SENSITIVITY_THRESHOLDS[swipeGestureSettings?.sensitivity || 'normal'];
    const threshold = sensitivityCfg?.thresholdPx || 60;

    const currentIndex = PAGE_ORDER.indexOf(currentPage);
    if (currentIndex === -1) return;

    if (diffX < -threshold) {
      // Swiping Left -> Advance to next page
      if (currentIndex < PAGE_ORDER.length - 1) {
        const nextPage = PAGE_ORDER[currentIndex + 1];
        setCurrentPage(nextPage);
        setSwipeNavIndicator({ direction: 'next', label: pageTitles[nextPage] });
        setTimeout(() => setSwipeNavIndicator(null), 850);
        if (swipeGestureSettings?.hapticFeedback && typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(18); } catch {}
        }
      }
    } else if (diffX > threshold) {
      // Swiping Right -> Retreat to previous page
      if (currentIndex > 0) {
        const prevPage = PAGE_ORDER[currentIndex - 1];
        setCurrentPage(prevPage);
        setSwipeNavIndicator({ direction: 'prev', label: pageTitles[prevPage] });
        setTimeout(() => setSwipeNavIndicator(null), 850);
        if (swipeGestureSettings?.hapticFeedback && typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(18); } catch {}
        }
      }
    }
  };

  return (
    <div 
      className={`min-h-screen flex selection:bg-[#8b7bff] selection:text-[#0a0a0f] ${
        isDark ? 'bg-[#0a0a0f] text-[#ece9fb]' : 'bg-[#f9f8fd] text-[#18172b]'
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe Navigation Visual Indicator HUD */}
      {swipeNavIndicator && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className={`px-3 py-1.5 rounded-full shadow-lg border backdrop-blur-md flex items-center gap-1.5 text-xs font-mono font-semibold ${
            isDark ? 'bg-[#18192a]/90 border-white/10 text-white' : 'bg-white/90 border-[#e7e4f4] text-slate-900'
          }`}>
            {swipeNavIndicator.direction === 'prev' ? (
              <ChevronLeft className="w-3.5 h-3.5 text-[#8b7bff]" />
            ) : null}
            <span>{swipeNavIndicator.label}</span>
            {swipeNavIndicator.direction === 'next' ? (
              <ChevronRight className="w-3.5 h-3.5 text-[#8b7bff]" />
            ) : null}
          </div>
        </div>
      )}

      {/* 1. Desktop keeps the sidebar (hidden on mobile via hidden md:flex) */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={(page) => setCurrentPage(page)}
        expanded={sidebarExpanded}
        onToggleExpanded={() => setSidebarExpanded(!sidebarExpanded)}
      />

      {/* 2. Main Layout Area with Header + Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          pageTitle={pageTitles[currentPage]}
          onOpenContribute={() => setIsContributeModalOpen(true)}
          onOpenReleaseNotes={() => setIsReleaseNotesModalOpen(true)}
        />

        {/* Dynamic Content Container - fluid, native edge-to-edge on mobile, max-w on desktop.
            pb-36 on mobile (FAB height 48px + bottom 80px + clearance 16px) and pb-28 on desktop (FAB 56px + bottom 32px + 16px clearance) */}
        <div className="flex-1 w-full overflow-y-auto px-3.5 py-3 sm:px-6 sm:py-5 pb-36 md:pb-28">
          <main className="w-full max-w-5xl mx-auto">
            {/* Non-blocking sync banner if guest has offline data */}
            <SyncBanner />

            {/* PAGE ROUTING */}
            {currentPage === 'dashboard' && (
              <DashboardView onNavigate={(p) => setCurrentPage(p)} />
            )}

            {currentPage === 'salah' && (
              <SalahPage />
            )}

            {currentPage === 'habits' && (
              <HabitsPage />
            )}

            {currentPage === 'tasks' && (
              <TasksPage />
            )}

            {currentPage === 'calendar' && (
              <CalendarPage />
            )}

            {currentPage === 'reviews' && (
              <DailyReviewHistoryPage />
            )}

            {currentPage === 'screentime' && (
              <ScreenTimePage />
            )}

            {currentPage === 'settings' && (
              <SettingsPage />
            )}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar on mobile viewports (hidden on desktop screens >= 768px via md:hidden) */}
      <MobileTabBar
        currentPage={currentPage}
        onSelectPage={(p) => setCurrentPage(p)}
      />

      {/* Subtle, non-blocking daily Salah reminder if active past 2:00 PM without prayers logged */}
      <SalahReminderToast
        onNavigateToSalah={() => setCurrentPage('salah')}
      />

      {/* Non-blocking Sign-In Modal */}
      {isAuthModalOpen && (
        <AuthScreen isModal={true} onClose={closeAuthModal} />
      )}

      {/* Contribute on GitHub Modal */}
      <ContributeModal
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
        onOpenReleaseNotes={() => {
          setIsContributeModalOpen(false);
          setIsReleaseNotesModalOpen(true);
        }}
      />

      {/* What's New & Release Notes Modal */}
      <ReleaseNotesModal
        isOpen={isReleaseNotesModalOpen}
        onClose={() => setIsReleaseNotesModalOpen(false)}
        onOpenContribute={() => {
          setIsReleaseNotesModalOpen(false);
          setIsContributeModalOpen(true);
        }}
      />
    </div>
  );
}
