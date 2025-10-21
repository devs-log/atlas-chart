// theme/arrowColors.ts
export const ArrowColors = {
  light: {
    base: '#111827',      // gray-900 (black)
  },
  dark: {
    base: '#f9fafb',      // gray-50 (white)
  },
};

export type ArrowColorMode = 'light' | 'dark';

export const getArrowColors = (mode: ArrowColorMode) => ArrowColors[mode];
