// theme/arrowColors.ts
export const ArrowColors = {
  light: {
    base: '#111827',      // gray-900
    accent: '#2563eb',    // blue-600
    subtle: '#6b7280',    // gray-500
    success: '#10b981',   // green-500
    danger: '#ef4444',    // red-500
    warning: '#f59e0b',   // amber-500
    info: '#06b6d4',      // cyan-500
  },
  dark: {
    base: '#f9fafb',      // gray-50
    accent: '#3b82f6',    // blue-500
    subtle: '#9ca3af',    // gray-400
    success: '#34d399',   // green-400
    danger: '#f87171',    // red-400
    warning: '#fbbf24',   // amber-400
    info: '#22d3ee',      // cyan-400
  },
};

export type ArrowColorMode = 'light' | 'dark';

export const getArrowColors = (mode: ArrowColorMode) => ArrowColors[mode];
