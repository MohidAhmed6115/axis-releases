/**
 * Axis Design System & Color Tokens
 * 
 * Programmatic tokens for use across components, charts, canvas, and styles.
 */

export const COLOR_TOKENS = {
  // Brand & Accent
  accent: {
    primary: '#8b7bff',
    hover: '#7a68fc',
    glow: 'rgba(139, 123, 255, 0.25)',
    subtle: 'rgba(139, 123, 255, 0.12)'
  },

  // Dark Theme Surfaces
  dark: {
    bg: '#0a0a0f',
    surface: '#131320',
    surfaceElevated: '#18192a',
    surfaceSubtle: '#181829',
    surfaceInput: '#252538',
    border: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(255, 255, 255, 0.14)',
    textPrimary: '#ece9fb',
    textSecondary: '#7d7a96',
    textMuted: '#524f6e'
  },

  // Light Theme Surfaces
  light: {
    bg: '#f8f7fc',
    surface: '#ffffff',
    surfaceElevated: '#f4f2fb',
    border: '#e7e4f4',
    textPrimary: '#18172b',
    textSecondary: '#64748b'
  },

  // 5-Color Daily Review Spectrum (Single Source of Truth)
  // Red: #ef4444 | Orange: #f97316 | Yellow: #facc15 | Green: #22c55e | Gold: #ca8a04
  rating: {
    red: '#ef4444',
    orange: '#f97316',
    yellow: '#facc15',
    green: '#22c55e',
    gold: '#ca8a04'
  },

  // Salah Tracker States:
  // Must NOT reuse any of the 5 day-rating colors.
  // Bajamat: Primary Accent Violet (#8b7bff) | Solo: Neutral Slate (#7d7a96)
  salah: {
    bajamat: '#8b7bff',
    solo: '#7d7a96',
    unlogged: '#524f6e',
    anchorAccent: '#8b7bff'
  },

  // Task Priority Indicators:
  // Strictly Grayscale/Neutral intensity scale.
  // NEVER use the 5 day-rating colors (red/orange/yellow/green/gold) or blue here.
  priority: {
    low: {
      text: '#71717a', // zinc-500
      bg: 'rgba(255, 255, 255, 0.03)',
      border: 'rgba(255, 255, 255, 0.08)'
    },
    medium: {
      text: '#a1a1aa', // zinc-400
      bg: 'rgba(255, 255, 255, 0.06)',
      border: 'rgba(255, 255, 255, 0.12)'
    },
    high: {
      text: '#e4e4e7', // zinc-200
      bg: 'rgba(255, 255, 255, 0.10)',
      border: 'rgba(255, 255, 255, 0.20)'
    },
    urgent: {
      text: '#ffffff', // pure white
      bg: 'rgba(255, 255, 255, 0.18)',
      border: 'rgba(255, 255, 255, 0.35)'
    }
  },

  // Habits
  habit: {
    build: '#10b981',
    break: '#f43f5e',
    anchor: '#8b7bff',
    streak: '#f97316'
  }
} as const;

export type ColorTokenKey = keyof typeof COLOR_TOKENS;
