import React, { memo, useState, useCallback } from 'react';
import { EdgeProps, EdgeLabelRenderer, Position, useReactFlow, BaseEdge } from 'reactflow';
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

// Generate elbow path from source to target with control points
const generateElbowPath = (
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourcePosition: Position,
  targetPosition: Position,
  elbowPoints: Array<{ x: number; y: number }> = []
): { path: string; labelX: number; labelY: number } => {
  // Start with source point
  let path = `M ${sourceX} ${sourceY}`;
  
  // If no elbow points, create a simple L-shaped path
  if (elbowPoints.length === 0) {
    // Determine if we should go horizontal first or vertical first
    const horizontalDistance = Math.abs(targetX - sourceX);
    const verticalDistance = Math.abs(targetY - sourceY);
    
    if (horizontalDistance > verticalDistance) {
      // Go horizontal first, then vertical
      const midX = (sourceX + targetX) / 2;
      path += ` L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
      return { path, labelX: midX, labelY: (sourceY + targetY) / 2 };
    } else {
      // Go vertical first, then horizontal
      const midY = (sourceY + targetY) / 2;
      path += ` L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
      return { path, labelX: (sourceX + targetX) / 2, labelY: midY };
    }
  }
  
  // Sort elbow points by their distance from source to maintain proper path order
  const sortedPoints = [...elbowPoints].sort((a, b) => {
    const distA = Math.sqrt((a.x - sourceX) ** 2 + (a.y - sourceY) ** 2);
    const distB = Math.sqrt((b.x - sourceX) ** 2 + (b.y - sourceY) ** 2);
    return distA - distB;
  });
  
  // Use sorted elbow points
  let currentX = sourceX;
  let currentY = sourceY;
  
  for (const point of sortedPoints) {
    path += ` L ${point.x} ${point.y}`;
    currentX = point.x;
    currentY = point.y;
  }
  
  // Connect to target
  path += ` L ${targetX} ${targetY}`;
  
  // Calculate label position (middle of the path)
  const totalPoints = sortedPoints.length + 2; // source + elbow points + target
  const midIndex = Math.floor(totalPoints / 2);
  
  let labelX: number;
  let labelY: number;
  
  if (midIndex === 0) {
    // Label at source
    labelX = sourceX;
    labelY = sourceY;
  } else if (midIndex === totalPoints - 1) {
    // Label at target
    labelX = targetX;
    labelY = targetY;
  } else if (midIndex === 1 && sortedPoints.length > 0) {
    // Label at first elbow point
    labelX = sortedPoints[0].x;
    labelY = sortedPoints[0].y;
  } else {
    // Label between two points
    const prevPoint = midIndex === 1 ? { x: sourceX, y: sourceY } : sortedPoints[midIndex - 2];
    const nextPoint = midIndex === totalPoints - 1 ? { x: targetX, y: targetY } : sortedPoints[midIndex - 1];
    labelX = (prevPoint.x + nextPoint.x) / 2;
    labelY = (prevPoint.y + nextPoint.y) / 2;
  }
  
  return { path, labelX, labelY };
};

const ElbowEdgeComponent = memo(({
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
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  // Manual coordinate conversion function (useReactFlow doesn't work in edge components)
  const screenToFlowPosition = (screenPosition: { x: number; y: number }) => {
    // Get the React Flow viewport from the store
    const camera = useAtlasStore.getState().camera;
    const zoom = camera.zoom;
    
    // Convert screen coordinates to flow coordinates
    const flowX = (screenPosition.x - camera.x) / zoom;
    const flowY = (screenPosition.y - camera.y) / zoom;
    
    return { x: flowX, y: flowY };
  };
  
  console.log('ElbowEdge rendered:', id, 'selected:', selected, 'selectedEdgeId:', selectedEdgeId, 'data:', data);
  
  // Use handle-specific positions if available, fallback to provided positions
  const effectiveSourcePosition = getPositionFromHandle(data?.sourceHandle) || sourcePosition;
  const effectiveTargetPosition = getPositionFromHandle(data?.targetHandle) || targetPosition;

  // Generate the elbow path
  const elbowPoints = data?.elbowPoints || [];
  const { path: edgePath, labelX, labelY } = generateElbowPath(
    sourceX,
    sourceY,
    targetX,
    targetY,
    effectiveSourcePosition,
    effectiveTargetPosition,
    elbowPoints
  );
  
  console.log('ElbowEdge path generation:', {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    elbowPoints,
    path: edgePath
  });

  // Determine edge style based on kind and custom properties
  const getEdgeStyle = (kind: SystemEdge['kind'], customStyle?: Partial<SystemEdge>) => {
    // Start with base style
    let strokeWidth = 2;
    let stroke = 'var(--line)';
    let strokeDasharray = 'none';

    // Apply custom line weight
    if (customStyle?.lineWeight) {
      switch (customStyle.lineWeight) {
        case 'thin': strokeWidth = 1; break;
        case 'normal': strokeWidth = 2; break;
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
  const showElbowPoints = isEdgeSelected && data?.elbowPoints && data.elbowPoints.length > 0;
  
  console.log('ElbowEdge showElbowPoints check:', {
    id,
    isEdgeSelected,
    hasElbowPoints: !!data?.elbowPoints,
    elbowPointsLength: data?.elbowPoints?.length || 0,
    showElbowPoints
  });

  // Handle elbow point dragging
  const handlePointMouseDown = useCallback((event: React.MouseEvent, pointIndex: number) => {
    event.stopPropagation();
    console.log('Starting to drag elbow point:', pointIndex);
    setDraggingPoint(pointIndex);
    
    const handleMouseMove = (e: MouseEvent) => {
      // Convert screen coordinates to flow coordinates
      const position = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });
      
      console.log('Dragging elbow point to:', position);
      
      // Update the store with new position
      useAtlasStore.getState().updateEdge(id, {
        elbowPoints: data?.elbowPoints?.map((point, index) => 
          index === pointIndex ? { x: position.x, y: position.y } : point
        ) || []
      });
    };

    const handleMouseUp = () => {
      console.log('Finished dragging elbow point');
      setDraggingPoint(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [id, data?.elbowPoints]);

  // Handle adding new elbow points on double-click
  const handleEdgeDoubleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    console.log('ElbowEdge double-click detected on edge:', id);
    
    // Convert screen coordinates to flow coordinates
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    
    console.log('Adding elbow point at position:', position);
    
    // Add new elbow point at the exact click position
    const currentPoints = data?.elbowPoints || [];
    const newPoints = [...currentPoints, { x: position.x, y: position.y }];
    
    console.log('New elbow points:', newPoints);
    
    useAtlasStore.getState().updateEdge(id, {
      elbowPoints: newPoints
    });
  }, [id, data?.elbowPoints, screenToFlowPosition]);

  // Handle removing elbow points on right-click
  const handlePointRightClick = useCallback((event: React.MouseEvent, pointIndex: number) => {
    event.stopPropagation();
    event.preventDefault();
    
    const currentPoints = data?.elbowPoints || [];
    const newPoints = currentPoints.filter((_, index) => index !== pointIndex);
    
    useAtlasStore.getState().updateEdge(id, {
      elbowPoints: newPoints
    });
  }, [id, data?.elbowPoints]);

  // Handle single click for debugging
  const handleEdgeClick = useCallback((event: React.MouseEvent) => {
    console.log('ElbowEdge single click detected on edge:', id);
  }, [id]);

  return (
    <>
      {/* Invisible wider path for better click detection */}
      <path
        id={`${id}-click-area`}
        style={{
          fill: 'none',
          stroke: 'transparent',
          strokeWidth: 20, // Much wider for easier clicking
          cursor: isEdgeSelected ? 'crosshair' : 'pointer',
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
          strokeWidth: isSelected ? 3 : edgeStyle.strokeWidth,
        }}
        data-kind={data?.kind || 'sync'}
        data-connection-type="elbow"
      />
      
      {/* Elbow point handles */}
      {showElbowPoints && data?.elbowPoints?.map((point, index) => (
        <g key={`elbow-point-${index}`}>
          {/* Shadow/glow effect when dragging */}
          {draggingPoint === index && (
            <circle
              cx={point.x}
              cy={point.y}
              r={8}
              fill="var(--primary)"
              opacity={0.3}
            />
          )}
          
            {/* Invisible larger circle for easier interaction */}
            <circle
              cx={point.x}
              cy={point.y}
              r={20}
              fill="transparent"
              data-elbow-point="true"
              data-point-index={index}
              style={{ cursor: draggingPoint === index ? 'grabbing' : 'grab' }}
              onMouseDown={(e) => {
                console.log('Mouse down on elbow point:', index);
                handlePointMouseDown(e, index);
              }}
              onMouseEnter={() => setHoveredPoint(index)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
            
            {/* Outer glow ring for better visibility */}
            <circle
              cx={point.x}
              cy={point.y}
              r={draggingPoint === index ? 12 : hoveredPoint === index ? 10 : 8}
              fill="none"
              stroke={draggingPoint === index ? '#3b82f6' : hoveredPoint === index ? '#60a5fa' : 'var(--primary)'}
              strokeWidth={draggingPoint === index ? 3 : hoveredPoint === index ? 2.5 : 2}
              opacity={draggingPoint === index ? 0.8 : hoveredPoint === index ? 0.6 : 0.4}
              data-elbow-point="true"
              data-point-index={index}
              style={{ 
                cursor: draggingPoint === index ? 'grabbing' : 'grab',
                filter: draggingPoint === index ? 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))' : 
                        hoveredPoint === index ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.4))' :
                        'drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))'
              }}
              onMouseDown={(e) => {
                console.log('Mouse down on glow ring:', index);
                handlePointMouseDown(e, index);
              }}
            />
            
            {/* Visible control point */}
            <circle
              cx={point.x}
              cy={point.y}
              r={draggingPoint === index ? 8 : hoveredPoint === index ? 6 : 5}
              fill={draggingPoint === index ? '#3b82f6' : hoveredPoint === index ? '#60a5fa' : 'var(--primary)'}
              stroke="white"
              strokeWidth={draggingPoint === index ? 4 : 3}
              data-elbow-point="true"
              data-point-index={index}
              style={{ 
                cursor: draggingPoint === index ? 'grabbing' : 'grab',
                opacity: draggingPoint === index ? 0.9 : hoveredPoint === index ? 0.95 : 1,
                filter: draggingPoint === index ? 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3))' :
                        hoveredPoint === index ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25))' :
                        'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
              }}
              onMouseDown={(e) => {
                console.log('Mouse down on visible control point:', index);
                handlePointMouseDown(e, index);
              }}
            />
          
        </g>
      ))}
      
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

ElbowEdgeComponent.displayName = 'ElbowEdge';

export default ElbowEdgeComponent;
