import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useAtlasStore } from '@/store/useAtlasStore';
// Simple narration helper
function getFocusNarration(focusNode: any, distances: any[]): string {
  if (!focusNode) return 'Select a system to explore its connections';
  
  const ring1Count = distances.filter(d => d.distance === 1).length;
  const ring2Count = distances.filter(d => d.distance === 2).length;
  const totalConnected = distances.length - 1; // Exclude focus node
  
  return `${focusNode.name} connects to ${totalConnected} systems: ${ring1Count} direct dependencies and ${ring2Count} secondary connections.`;
}

export default function Breadcrumbs() {
  const breadcrumbs = useAtlasStore((state) => state.getBreadcrumbs());
  const focusNodeId = useAtlasStore((state) => state.focusNodeId);
  const getSystemById = useAtlasStore((state) => state.getSystemById);

  const focusNode = focusNodeId ? getSystemById(focusNodeId) : null;
  const narration = getFocusNarration(focusNode, []);

  return (
    <div className="panel-glass p-3 pointer-events-auto max-w-md">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 text-sm text-muted mb-2">
        <Home className="w-4 h-4" />
        {breadcrumbs.map((breadcrumb) => (
          <React.Fragment key={breadcrumb.id}>
            <ChevronRight className="w-3 h-3" />
            <span className="truncate" title={breadcrumb.name}>
              {breadcrumb.name}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Narration */}
      <div className="text-sm text-primary leading-relaxed">
        {narration}
      </div>
    </div>
  );
}
