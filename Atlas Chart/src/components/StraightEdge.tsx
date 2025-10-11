import React, { memo } from 'react';
import { EdgeProps, getStraightPath, EdgeLabelRenderer } from 'reactflow';
import { ArrowRight, ArrowUp, ArrowDown, ArrowLeft } from 'lucide-react';

import type { SystemEdge } from '@/lib/types';

const StraightEdgeComponent = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  selected,
}: EdgeProps<SystemEdge>) => {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Determine edge style based on kind
  const getEdgeStyle = (kind: SystemEdge['kind']) => {
    const baseStyle = {
      strokeWidth: 2,
      stroke: 'var(--line)',
      fill: 'none',
    };

    switch (kind) {
      case 'sync':
        return {
          ...baseStyle,
          strokeDasharray: 'none',
        };
      case 'async':
        return {
          ...baseStyle,
          strokeDasharray: '5,5',
        };
      case 'event':
        return {
          ...baseStyle,
          strokeDasharray: '2,3',
        };
      case 'batch':
        return {
          ...baseStyle,
          strokeDasharray: '8,4',
        };
      case 'other':
      default:
        return {
          ...baseStyle,
          strokeDasharray: '3,2',
        };
    }
  };

  const edgeStyle = getEdgeStyle(data?.kind || 'sync');
  const isSelected = selected || false;

  return (
    <>
      <path
        id={id}
        style={{
          ...edgeStyle,
          ...style,
          stroke: isSelected ? 'var(--primary)' : edgeStyle.stroke,
          strokeWidth: isSelected ? 3 : edgeStyle.strokeWidth,
        }}
        className="react-flow__edge-path"
        d={edgePath}
        data-kind={data?.kind || 'sync'}
        data-connection-type="straight"
      />
      
      {/* Edge Label */}
      {data?.note && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted border border-[var(--line)] shadow-sm max-w-[200px]"
          >
            <div className="flex items-center gap-1">
              {data.kind === 'sync' && <ArrowRight className="w-3 h-3" />}
              {data.kind === 'async' && <ArrowDown className="w-3 h-3" />}
              {data.kind === 'event' && <ArrowUp className="w-3 h-3" />}
              {data.kind === 'batch' && <ArrowLeft className="w-3 h-3" />}
              <span className="truncate" title={data.note}>
                {data.note}
              </span>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

StraightEdgeComponent.displayName = 'StraightEdge';

export default StraightEdgeComponent;

