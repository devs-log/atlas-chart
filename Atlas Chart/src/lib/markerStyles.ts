// markerStyles.ts
import { MarkerType } from 'reactflow';
import { ArrowColors, getArrowColors, type ArrowColorMode } from './arrowColors';

export const getArrowStyles = (mode: ArrowColorMode = 'light') => {
  const colors = getArrowColors(mode);

  return {
    none: undefined,

    // 🩶 Clean thin hollow arrow (for subtle flow lines)
    hollow: {
      type: MarkerType.Arrow,
      color: colors.subtle,
      width: 16,
      height: 16,
      strokeWidth: 1.5,
      fill: 'none',
    },

    // ⚫️ Solid base arrow (for default strong contrast)
    solid: {
      type: MarkerType.ArrowClosed,
      color: colors.base,
      width: 20,
      height: 20,
      strokeWidth: 1.5,
    },

    // 💎 Accent blue arrow (for primary flows)
    accent: {
      type: MarkerType.ArrowClosed,
      color: colors.accent,
      width: 22,
      height: 22,
      strokeWidth: 1.5,
    },

    // ✅ Success green arrow (for positive flows)
    success: {
      type: MarkerType.ArrowClosed,
      color: colors.success,
      width: 22,
      height: 22,
      strokeWidth: 1.5,
    },

    // ❌ Danger red arrow (for error/critical flows)
    danger: {
      type: MarkerType.ArrowClosed,
      color: colors.danger,
      width: 22,
      height: 22,
      strokeWidth: 1.5,
    },

    // ⚠️ Warning amber arrow (for caution flows)
    warning: {
      type: MarkerType.ArrowClosed,
      color: colors.warning,
      width: 22,
      height: 22,
      strokeWidth: 1.5,
    },

    // ℹ️ Info cyan arrow (for informational flows)
    info: {
      type: MarkerType.ArrowClosed,
      color: colors.info,
      width: 22,
      height: 22,
      strokeWidth: 1.5,
    },

    // 🌈 Gradient arrow (for data flows or highlights)
    gradient: {
      type: MarkerType.ArrowClosed,
      color: 'url(#arrowFlowGradient)',
      width: 24,
      height: 24,
      strokeWidth: 1.5,
    },

    // 🕶 Outline arrow (thin filled border, transparent middle)
    outline: {
      type: MarkerType.ArrowClosed,
      color: colors.base,
      width: 24,
      height: 24,
      strokeWidth: 2,
      fill: mode === 'dark' ? '#1f2937' : '#ffffff',
    },
  };
};

export type ArrowStyleKey = keyof ReturnType<typeof getArrowStyles>;
