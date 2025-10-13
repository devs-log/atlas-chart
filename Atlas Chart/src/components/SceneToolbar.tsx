import React from 'react';
import { useAtlasStore } from '@/store/useAtlasStore';
import { BarChart3, Network, Building2, Layers } from 'lucide-react';

import type { SceneType } from '@/lib/types';

const sceneConfig: Record<SceneType, { name: string; icon: React.ComponentType<any>; description: string }> = {
  overview: {
    name: 'Overview',
    icon: Network,
    description: 'Focus-centric radial layout',
  },
  'data-flows': {
    name: 'Data Flows',
    icon: BarChart3,
    description: 'Left-to-right data flow visualization',
  },
  'by-domain': {
    name: 'By Domain',
    icon: Building2,
    description: 'Grouped by business domain',
  },
  'by-status': {
    name: 'By Status',
    icon: Layers,
    description: 'Swimlanes by system status',
  },
};

export default function SceneToolbar() {
  const scene = useAtlasStore((state) => state.scene);
  const setScene = useAtlasStore((state) => state.setScene);

  return (
    <div className="panel-glass p-1 flex items-center gap-1 pointer-events-auto">
      {Object.entries(sceneConfig).map(([sceneKey, config]) => {
        const Icon = config.icon;
        const isActive = scene === sceneKey;
        
        return (
          <button
            key={sceneKey}
            onClick={() => setScene(sceneKey as SceneType)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-muted hover:text-primary hover:bg-white/50'
              }
            `}
            title={config.description}
          >
            <Icon className="w-4 h-4" />
            <span>{config.name}</span>
          </button>
        );
      })}
    </div>
  );
}



