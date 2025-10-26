import React, { useState, useEffect, useRef } from 'react';
import { useAtlasStore } from '../store/useAtlasStore';
import { BarChart3, Network, Building2, Layers, ChevronDown, MapPin, FolderKanban, Briefcase, Kanban, Eye, EyeOff, CheckSquare, FolderOpen } from 'lucide-react';

import type { SceneType, ViewMode } from '../lib/types';

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

const viewModeConfig: Record<ViewMode, { name: string; icon: React.ComponentType<any>; description: string }> = {
  architecture: {
    name: 'Architecture',
    icon: MapPin,
    description: 'System architecture view',
  },
  project: {
    name: 'Project',
    icon: FolderKanban,
    description: 'Project management view',
  },
  work: {
    name: 'Work',
    icon: Briefcase,
    description: 'Work item management view',
  },
  kanban: {
    name: 'Kanban',
    icon: Kanban,
    description: 'Kanban board view',
  },
};

const progressDisplayConfig = {
  hidden: {
    name: 'Hidden',
    icon: EyeOff,
    description: 'Hide progress bars',
  },
  tasks: {
    name: 'Tasks',
    icon: CheckSquare,
    description: 'Show progress by tasks',
  },
  features: {
    name: 'Features',
    icon: FolderOpen,
    description: 'Show progress by features',
  },
  'story-points': {
    name: 'Story Points',
    icon: BarChart3,
    description: 'Show progress by story points',
  },
};

export default function SceneToolbar() {
  const scene = useAtlasStore((state) => state.scene);
  const setScene = useAtlasStore((state) => state.setScene);
  const viewMode = useAtlasStore((state) => state.viewMode);
  const setViewMode = useAtlasStore((state) => state.setViewMode);
  const progressDisplayMode = useAtlasStore((state) => state.progressDisplayMode);
  const setProgressDisplayMode = useAtlasStore((state) => state.setProgressDisplayMode);
  
  const [isViewModeOpen, setIsViewModeOpen] = useState(false);
  const [isProgressDisplayOpen, setIsProgressDisplayOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const progressDropdownRef = useRef<HTMLDivElement>(null);

  const currentViewMode = viewModeConfig[viewMode];
  const CurrentIcon = currentViewMode.icon;
  
  const currentProgressDisplay = progressDisplayConfig[progressDisplayMode];
  const CurrentProgressIcon = currentProgressDisplay.icon;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsViewModeOpen(false);
      }
      if (progressDropdownRef.current && !progressDropdownRef.current.contains(event.target as Node)) {
        setIsProgressDisplayOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="panel-glass p-1 flex items-center gap-1 pointer-events-auto">
      {/* View Mode Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsViewModeOpen(!isViewModeOpen)}
          className="
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
            bg-primary text-white shadow-sm hover:bg-primary/90
          "
          title={currentViewMode.description}
        >
          <CurrentIcon className="w-4 h-4" />
          <span>{currentViewMode.name}</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {/* Dropdown Menu */}
        {isViewModeOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[160px]">
            {Object.entries(viewModeConfig).map(([modeKey, config]) => {
              const Icon = config.icon;
              const isActive = viewMode === modeKey;
              
              return (
                <button
                  key={modeKey}
                  onClick={() => {
                    setViewMode(modeKey as ViewMode);
                    setIsViewModeOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-150
                    ${isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-700 hover:bg-gray-50'
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
        )}
      </div>

      {/* Progress Display Dropdown */}
      <div className="relative" ref={progressDropdownRef}>
        <button
          onClick={() => setIsProgressDisplayOpen(!isProgressDisplayOpen)}
          className="
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
            bg-primary text-white shadow-sm hover:bg-primary/90
          "
          title={currentProgressDisplay.description}
        >
          <CurrentProgressIcon className="w-4 h-4" />
          <span>{currentProgressDisplay.name}</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {/* Dropdown Menu */}
        {isProgressDisplayOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[160px]">
            {Object.entries(progressDisplayConfig).map(([modeKey, config]) => {
              const Icon = config.icon;
              const isActive = progressDisplayMode === modeKey;
              
              return (
                <button
                  key={modeKey}
                  onClick={() => {
                    setProgressDisplayMode(modeKey as 'hidden' | 'tasks' | 'features' | 'story-points');
                    setIsProgressDisplayOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-150
                    ${isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-700 hover:bg-gray-50'
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
        )}
      </div>

      {/* Scene Buttons */}
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









