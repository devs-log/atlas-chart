import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useAtlasStore } from '../store/useAtlasStore';
import { 
  Database, 
  Server, 
  Globe, 
  MessageSquare, 
  Building,
  Clock,
  AlertTriangle,
  CheckCircle,
  Play
} from 'lucide-react';

import type { SystemNode } from '../lib/types';
import ProgressBar from './ProgressBar';
// Simple opacity and scale helpers - MAKE ALL NODES FULLY VISIBLE
function getNodeOpacity(distance: number): number {
  // Always return 1.0 for full visibility
  return 1.0;
}

function getNodeScale(distance: number): number {
  if (distance === 0) return 1.2;
  if (distance === 1) return 1.0;
  if (distance === 2) return 0.9;
  return 0.8;
}

// Icon mapping for system types
const typeIcons = {
  app: Building,
  service: Server,
  datastore: Database,
  queue: MessageSquare,
  external: Globe,
};

// Status colors and icons
const statusConfig = {
  live: { color: 'var(--ring-live)', icon: CheckCircle },
  building: { color: 'var(--ring-building)', icon: Play },
  planned: { color: 'var(--ring-planned)', icon: Clock },
  risk: { color: 'var(--ring-risk)', icon: AlertTriangle },
};

const SystemNodeComponent = memo(({ data, selected }: NodeProps<SystemNode>) => {
  // Get connection state from the store
  const selectedTool = useAtlasStore((state) => state.selectedTool);
  const isConnecting = useAtlasStore((state) => state.isConnecting);
  
  // Determine handle types based on connection mode and state
  const isConnectMode = selectedTool === 'connect';
  
  // Always allow both source and target connections, but change visual appearance
  // When in connect mode and not connecting: all handles appear as source (blue)
  // When in connect mode and connecting: all handles appear as target (green) 
  // When not in connect mode: all handles appear as target (green)
  const handleType = 'source'; // Always source, but we'll control visibility with color
  const handleColor = isConnectMode && !isConnecting ? '#3b82f6' : '#10b981';

  const TypeIcon = typeIcons[data.type] || Building;
  const StatusIcon = statusConfig[data.status].icon;
  const statusColor = statusConfig[data.status].color;

  return (
    <div
      className={`node group relative rounded-xl border-0 min-w-[200px] min-h-[100px] p-4 transition-all duration-200 ease-out ${
        selected ? 'selected' : ''
      }`}
      data-status={data.status}
      data-type={data.type}
      data-domain={data.domain}
      style={{
        opacity: getNodeOpacity(data.distance || 0),
        transform: `scale(${getNodeScale(data.distance || 0)})`,
        backgroundColor: data.colorOverride || '#ffffff',
        borderColor: data.domain ? '#000000' : 'transparent',
        borderWidth: data.domain ? '2px' : '0',
      }}
    >
      {/* Status Ring */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          boxShadow: `inset 0 0 0 2px ${statusColor}`,
        }}
      />

      {/* Domain Tint - REMOVED to prevent whitewashing */}

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <TypeIcon className="w-4 h-4 flex-shrink-0" style={{ color: '#000000' }} />
            <span className="font-medium text-sm truncate" style={{ color: '#000000' }}>
              {data.name}
            </span>
          </div>
          <StatusIcon 
            className="w-4 h-4 flex-shrink-0" 
            style={{ color: statusColor }}
          />
        </div>

        {/* Progress Bar */}
        <ProgressBar 
          systemId={data.id} 
          onClick={() => {
            // Switch to work mode and filter by this system
            const store = useAtlasStore.getState();
            store.setSelectedSystemIdForWorkView(data.id);
            store.setViewMode('work');
          }}
        />

        {/* Type and Domain */}
        <div className="text-xs mb-2" style={{ color: '#333333' }}>
          <div className="capitalize">{data.type}</div>
          {data.domain && (
            <div className="truncate" title={data.domain}>
              {data.domain}
            </div>
          )}
        </div>

        {/* Team/Owner */}
        {(data.team || data.owner) && (
          <div className="text-xs mb-2" style={{ color: '#333333' }}>
            {data.owner && (
              <div className="truncate" title={data.owner}>
                {data.owner}
              </div>
            )}
            {data.team && (
              <div className="truncate" title={data.team}>
                {data.team}
              </div>
            )}
          </div>
        )}

        {/* Features (first 2) */}
        {data.features && data.features.length > 0 && (
          <div className="flex-1">
            <div className="text-xs space-y-1" style={{ color: '#333333' }}>
              {data.features.slice(0, 2).map((feature, index) => (
                <div key={index} className="truncate" title={feature}>
                  • {feature}
                </div>
              ))}
              {data.features.length > 2 && (
                <div className="text-xs font-medium" style={{ color: '#000000' }}>
                  +{data.features.length - 2} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {data.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
            {data.tags.length > 3 && (
              <span className="text-xs" style={{ color: '#333333' }}>
                +{data.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Connection Handles - Only visible when connection tool is selected */}
      {/* Source handles (for initiating connections) */}
      <Handle
        id="top"
        type="source"
        position={Position.Top}
        className={`w-4 h-4 border-2 border-white transition-all cursor-crosshair z-10 ${
          isConnectMode && !isConnecting ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ top: -8, backgroundColor: '#3b82f6' }}
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className={`w-4 h-4 border-2 border-white transition-all cursor-crosshair z-10 ${
          isConnectMode && !isConnecting ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ right: -8, backgroundColor: '#3b82f6' }}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className={`w-4 h-4 border-2 border-white transition-all cursor-crosshair z-10 ${
          isConnectMode && !isConnecting ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ bottom: -8, backgroundColor: '#3b82f6' }}
      />
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        className={`w-4 h-4 border-2 border-white transition-all cursor-crosshair z-10 ${
          isConnectMode && !isConnecting ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ left: -8, backgroundColor: '#3b82f6' }}
      />

      {/* Target handles (for receiving connections) */}
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className={`w-4 h-4 border-2 border-white transition-all cursor-crosshair z-10 ${
          isConnectMode && isConnecting ? 'opacity-70 hover:opacity-100 group-hover:opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ top: -8, backgroundColor: '#10b981' }}
      />
      <Handle
        id="right"
        type="target"
        position={Position.Right}
        className={`w-4 h-4 border-2 border-white transition-all cursor-crosshair z-10 ${
          isConnectMode && isConnecting ? 'opacity-70 hover:opacity-100 group-hover:opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ right: -8, backgroundColor: '#10b981' }}
      />
      <Handle
        id="bottom"
        type="target"
        position={Position.Bottom}
        className={`w-4 h-4 border-2 border-white transition-all cursor-crosshair z-10 ${
          isConnectMode && isConnecting ? 'opacity-70 hover:opacity-100 group-hover:opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ bottom: -8, backgroundColor: '#10b981' }}
      />
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        className={`w-4 h-4 border-2 border-white transition-all cursor-crosshair z-10 ${
          isConnectMode && isConnecting ? 'opacity-70 hover:opacity-100 group-hover:opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ left: -8, backgroundColor: '#10b981' }}
      />
    </div>
  );
});

SystemNodeComponent.displayName = 'SystemNode';

export default SystemNodeComponent;
