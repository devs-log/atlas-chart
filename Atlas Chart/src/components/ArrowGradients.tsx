// ArrowGradients.tsx - Animated gradient definitions for arrow markers
import React from 'react';

const ArrowGradients: React.FC = () => {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        {/* 🌈 Animated flow gradient for active data movement */}
        <linearGradient id="arrowFlowGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3b82f6">
            <animate
              attributeName="offset"
              values="0;1;0"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="#34d399">
            <animate
              attributeName="offset"
              values="1;0;1"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>

        {/* 🎨 Success flow gradient */}
        <linearGradient id="arrowSuccessGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#10b981">
            <animate
              attributeName="offset"
              values="0;1;0"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="#34d399">
            <animate
              attributeName="offset"
              values="1;0;1"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>

        {/* ⚠️ Warning flow gradient */}
        <linearGradient id="arrowWarningGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f59e0b">
            <animate
              attributeName="offset"
              values="0;1;0"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="#fbbf24">
            <animate
              attributeName="offset"
              values="1;0;1"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>

        {/* ❌ Danger flow gradient */}
        <linearGradient id="arrowDangerGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ef4444">
            <animate
              attributeName="offset"
              values="0;1;0"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="#f87171">
            <animate
              attributeName="offset"
              values="1;0;1"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
      </defs>
    </svg>
  );
};

export default ArrowGradients;
