import React, { memo, useCallback } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, Position, MarkerType, BaseEdge } from 'reactflow';
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

// React Flow handles markers automatically via markerEnd/markerStart props

const EdgeComponent = memo(({
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
  markerStart,
  markerEnd,
}: EdgeProps<SystemEdge>) => {
  const selectedEdgeId = useAtlasStore((state) => state.selectedEdgeId);
  
  // Use handle-specific positions if available, fallback to provided positions
  const effectiveSourcePosition = getPositionFromHandle(data?.sourceHandle) || sourcePosition;
  const effectiveTargetPosition = getPositionFromHandle(data?.targetHandle) || targetPosition;

  // Calculate curve offset based on routing preference
  const getCurveOffset = (routing?: string) => {
    if (routing === 'around') {
      return 0.3; // Gentle curve that gradually glides around nodes
    }
    return 0; // Default offset for direct routing
  };

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: effectiveSourcePosition,
    targetX,
    targetY,
    targetPosition: effectiveTargetPosition,
    curvature: getCurveOffset(data?.routing),
  });

  // Determine edge style based on kind and custom properties
  const getEdgeStyle = (kind: SystemEdge['kind'], customStyle?: Partial<SystemEdge>) => {
    // Start with base style
    let strokeWidth = 1.5;
    let stroke = 'var(--line)';
    let strokeDasharray = 'none';

    // Apply custom line weight
    if (customStyle?.lineWeight) {
      switch (customStyle.lineWeight) {
        case 'thin': strokeWidth = 1; break;
        case 'normal': strokeWidth = 1.5; break;
        case 'bold': strokeWidth = 3; break;
      }
    }

    // Apply custom line color
    if (customStyle?.lineColor) {
      stroke = customStyle.lineColor;
    }

    // Apply custom line style
    if (customStyle?.lineStyle) {
      switch (customStyle.lineStyle) {
        case 'solid': strokeDasharray = 'none'; break;
        case 'dashed': strokeDasharray = '5,5'; break;
        case 'dotted': strokeDasharray = '2,2'; break;
      }
    } else {
      // Fall back to kind-based styling if no custom style
      switch (kind) {
        case 'sync':
          strokeDasharray = 'none';
          break;
        case 'async':
          strokeDasharray = '5,5';
          break;
        case 'event':
          strokeDasharray = '2,3';
          break;
        case 'batch':
          strokeDasharray = '8,4';
          break;
        case 'other':
        default:
          strokeDasharray = '3,2';
          break;
      }
    }

    return {
      strokeWidth,
      stroke,
      strokeDasharray,
      fill: 'none',
    };
  };

  const edgeStyle = getEdgeStyle(data?.kind || 'sync', data);
  const isSelected = selected || false;
  const isEdgeSelected = selectedEdgeId === id;

  // Manual coordinate conversion function for double-click
  const screenToFlowPosition = (screenPosition: { x: number; y: number }) => {
    // Get the React Flow viewport from the store
    const camera = useAtlasStore.getState().camera;
    const zoom = camera.zoom;
    
    // Convert screen coordinates to flow coordinates
    const flowX = (screenPosition.x - camera.x) / zoom;
    const flowY = (screenPosition.y - camera.y) / zoom;
    
    return { x: flowX, y: flowY };
  };

  // Handle adding elbow points on double-click (convert to elbow type)
  const handleEdgeDoubleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    console.log('🎯 EdgeShape double-click detected on edge:', id);
    console.log('Event details:', { clientX: event.clientX, clientY: event.clientY });
    
    // Convert screen coordinates to flow coordinates
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    
    console.log('Adding elbow point at position:', position);
    
    // First, convert the connection to elbow type if it isn't already
    const currentEdge = useAtlasStore.getState().edges.find(e => e.id === id);
    console.log('Current edge:', currentEdge);
    if (currentEdge && currentEdge.connectionType !== 'elbow') {
      console.log('Converting connection to elbow type');
      useAtlasStore.getState().updateEdge(id, {
        connectionType: 'elbow',
        elbowPoints: []
      });
    }
    
    // Add new elbow point at the exact click position
    const currentPoints = data?.elbowPoints || [];
    const newPoints = [...currentPoints, { x: position.x, y: position.y }];
    
    console.log('New elbow points:', newPoints);
    
    useAtlasStore.getState().updateEdge(id, {
      elbowPoints: newPoints
    });
  }, [id, data?.elbowPoints, screenToFlowPosition]);

  // Handle single click for debugging
  const handleEdgeClick = useCallback((event: React.MouseEvent) => {
    console.log('🔍 EdgeShape single click detected on edge:', id);
  }, [id]);
  
  // React Flow handles markers automatically via markerEnd/markerStart props

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
        onClick={handleEdgeClick}
        onDoubleClick={handleEdgeDoubleClick}
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
      
      {/* Visible edge path with markers */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerStart={markerStart}
        markerEnd={markerEnd}
        style={{
          ...edgeStyle,
          ...style,
          stroke: isSelected ? 'var(--primary)' : edgeStyle.stroke,
          strokeWidth: isSelected ? 2 : edgeStyle.strokeWidth,
        }}
        data-kind={data?.kind || 'sync'}
      />
      
      {/* Edge Label */}
      {(data?.label || data?.note) && (
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
              <span className="truncate" title={data.label || data.note}>
                {data.label || data.note}
              </span>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

EdgeComponent.displayName = 'Edge';

export default EdgeComponent;
