// markerStyles.ts
import { MarkerType } from 'reactflow';
import { ArrowColors, getArrowColors, type ArrowColorMode } from './arrowColors';

export const getArrowStyles = (mode: ArrowColorMode = 'light') => {
  const colors = getArrowColors(mode);

  return {
    none: undefined,

    // 🩶 Hollow arrow
    hollow: {
      type: MarkerType.Arrow,
      color: colors.base,
      width: 18,
      height: 18,
      strokeWidth: 1.5,
      fill: 'none',
    },

    // ⚫️ Solid arrow
    solid: {
      type: MarkerType.ArrowClosed,
      color: colors.base,
      width: 20,
      height: 20,
      strokeWidth: 1.5,
    },
  };
};

export type ArrowStyleKey = keyof ReturnType<typeof getArrowStyles>;
