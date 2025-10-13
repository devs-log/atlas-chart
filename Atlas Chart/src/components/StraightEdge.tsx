import React, { memo } from 'react';
import { EdgeProps, getStraightPath, EdgeLabelRenderer, Position } from 'reactflow';
import { ArrowRight, ArrowUp, ArrowDown, ArrowLeft } from 'lucide-react';
import { useAtlasStore } from '@/store/useAtlasStore';

import type { SystemEdge } from '@/lib/types';

const getPositionFromHandle = (handleId?: string): Position => {
  if (!handleId) return Position.Top;
  if (handleId.includes('right')) return Position.Right;
  if (handleId.includes('left')) return Position.Left;
  if (handleId.includes('bottom')) return Position.Bottom;
  if (handleId.includes('top')) return Position.Top;
  return Position.Top;
};

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
  const selectedEdgeId = useAtlasStore((state) => state.selectedEdgeId);
  
  // Use handle-specific positions if available, fallback to provided positions
  const effectiveSourcePosition = getPositionFromHandle(data?.sourceHandle) || sourcePosition;
  const effectiveTargetPosition = getPositionFromHandle(data?.targetHandle) || targetPosition;

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
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
  const isEdgeSelected = selectedEdgeId === id;

  return (
    <>
      {/* Invisible wider path for better click detection */}
      <path
        id={`${id}-click-area`}
        style={{
          fill: 'none',
          stroke: 'transparent',
          strokeWidth: 20, // Much wider for easier clicking
          cursor: 'pointer',
        }}
        d={edgePath}
        className="react-flow__edge-path"
      />
      
      {/* Selection effect - subtle highlight */}
      {isEdgeSelected && (
        <path
          id={`${id}-selection`}
          style={{
            fill: 'none',
            stroke: '#64748b',
            strokeWidth: 3,
            opacity: 0.8,
          }}
          d={edgePath}
          className="react-flow__edge-path"
        />
      )}
      
      {/* Visible edge path */}
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

