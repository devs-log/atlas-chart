import React, { useState } from 'react';
import {
  Building,
  Server,
  Database,
  MessageSquare,
  Globe,
  Plus,
  Square,
  Circle,
  Triangle,
  Move,
  Link,
  Trash2,
  Save,
  Undo,
  Redo,
  Minus,
  CornerUpRight
} from 'lucide-react';
import { useAtlasStore } from '@/store/useAtlasStore';
import type { SystemNode } from '@/lib/types';

const nodeTypes = [
  { id: 'app', icon: Building, label: 'App', color: 'bg-blue-500' },
  { id: 'service', icon: Server, label: 'Service', color: 'bg-green-500' },
  { id: 'datastore', icon: Database, label: 'Data Store', color: 'bg-purple-500' },
  { id: 'queue', icon: MessageSquare, label: 'Queue', color: 'bg-orange-500' },
  { id: 'external', icon: Globe, label: 'External', color: 'bg-gray-500' },
];

const shapes = [
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'triangle', icon: Triangle, label: 'Triangle' },
];

const tools = [
  { id: 'select', icon: Move, label: 'Select' },
  { id: 'connect', icon: Link, label: 'Connect' },
  { id: 'delete', icon: Trash2, label: 'Delete' },
];

const connectionTypes = [
  { id: 'straight', icon: Minus, label: 'Straight' },
  { id: 'step', icon: CornerUpRight, label: 'Right Angle' },
  { id: 'curved', icon: Link, label: 'Curved' },
];

  const actions = [
    { id: 'save', icon: Save, label: 'Save' },
    { id: 'undo', icon: Undo, label: 'Undo' },
    { id: 'redo', icon: Redo, label: 'Redo' },
    { id: 'create-connection', icon: Link, label: 'Create Connection' },
  ];

export default function ToolShelf() {
  const addSystem = useAtlasStore((state) => state.addSystem);
  const addEdge = useAtlasStore((state) => state.addEdge);
  const selectedTool = useAtlasStore((state) => state.selectedTool);
  const selectedNodeType = useAtlasStore((state) => state.selectedNodeType);
  const selectedConnectionType = useAtlasStore((state) => state.selectedConnectionType);
  const setSelectedTool = useAtlasStore((state) => state.setSelectedTool);
  const setSelectedNodeType = useAtlasStore((state) => state.setSelectedNodeType);
  const setSelectedConnectionType = useAtlasStore((state) => state.setSelectedConnectionType);

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
  };

  const handleNodeTypeSelect = (nodeTypeId: string) => {
    setSelectedNodeType(nodeTypeId);
  };

  const handleConnectionTypeSelect = (connectionTypeId: string) => {
    setSelectedConnectionType(connectionTypeId);
  };

  const handleAction = (actionId: string) => {
    if (actionId === 'add' && selectedNodeType) {
      // Create a new node at a fixed position
      const nodeId = `node-${Date.now()}`;
      const newNode: SystemNode = {
        id: nodeId,
        name: `New ${selectedNodeType}`,
        type: selectedNodeType as any,
        domain: 'Default Domain',
        status: 'planned',
        x: 100 + (Date.now() % 500), // Random position to avoid overlap
        y: 100 + (Date.now() % 300),
      };
      
      addSystem(newNode);
      setSelectedNodeType(null);
      setSelectedTool('select');
    } else if (actionId === 'create-connection') { // Handle 'create-connection' action
      // Create a test connection between different node pairs based on connection type
      let source, target;
      if (selectedConnectionType === 'straight') {
        source = 'hub';
        target = 'user-db';
      } else if (selectedConnectionType === 'step') {
        source = 'auth-service';
        target = 'user-db';
      } else {
        source = 'hub';
        target = 'auth-service';
      }
      
      const newEdge = {
        id: `edge-test-${Date.now()}`,
        source,
        target,
        kind: 'other' as const,
        connectionType: selectedConnectionType,
      };
      
      addEdge(newEdge);
      console.log('Created test connection:', newEdge);
    } else {
      console.log('Action:', actionId);
    }
  };

  return (
    <div className="panel-glass w-16 h-full flex flex-col pointer-events-auto">
      {/* Node Types */}
      <div className="p-2 border-b border-[var(--line)]/50">
        <div className="text-xs text-muted mb-2 text-center">Nodes</div>
        <div className="space-y-1">
          {nodeTypes.map((nodeType) => {
            const Icon = nodeType.icon;
            const isSelected = selectedNodeType === nodeType.id;
            
            return (
              <button
                key={nodeType.id}
                onClick={() => handleNodeTypeSelect(nodeType.id)}
                className={`
                  w-full p-2 rounded-lg transition-all duration-200 group relative
                  ${isSelected 
                    ? 'bg-primary text-white' 
                    : 'text-muted hover:text-primary hover:bg-white/50'
                  }
                `}
                title={nodeType.label}
              >
                <Icon className="w-5 h-5 mx-auto" />
                {isSelected && (
                  <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${nodeType.color}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Shapes */}
      <div className="p-2 border-b border-[var(--line)]/50">
        <div className="text-xs text-muted mb-2 text-center">Shapes</div>
        <div className="space-y-1">
          {shapes.map((shape) => {
            const Icon = shape.icon;
            
            return (
              <button
                key={shape.id}
                className="w-full p-2 rounded-lg text-muted hover:text-primary hover:bg-white/50 transition-all duration-200"
                title={shape.label}
              >
                <Icon className="w-5 h-5 mx-auto" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Connection Types */}
      <div className="p-2 border-b border-[var(--line)]/50">
        <div className="text-xs text-muted mb-2 text-center">Connections</div>
        <div className="space-y-1">
          {connectionTypes.map((connectionType) => {
            const Icon = connectionType.icon;
            const isSelected = selectedConnectionType === connectionType.id;
            
            return (
              <button
                key={connectionType.id}
                onClick={() => handleConnectionTypeSelect(connectionType.id)}
                className={`
                  w-full p-2 rounded-lg transition-all duration-200
                  ${isSelected
                    ? 'bg-primary text-white'
                    : 'text-muted hover:text-primary hover:bg-white/50'
                  }
                `}
                title={connectionType.label}
              >
                <Icon className="w-5 h-5 mx-auto" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Tools */}
      <div className="p-2 border-b border-[var(--line)]/50">
        <div className="text-xs text-muted mb-2 text-center">Tools</div>
        <div className="space-y-1">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedTool === tool.id;
            
            return (
              <button
                key={tool.id}
                onClick={() => handleToolSelect(tool.id)}
                className={`
                  w-full p-2 rounded-lg transition-all duration-200
                  ${isSelected 
                    ? 'bg-primary text-white' 
                    : 'text-muted hover:text-primary hover:bg-white/50'
                  }
                `}
                title={tool.label}
              >
                <Icon className="w-5 h-5 mx-auto" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="p-2 border-t border-[var(--line)]/50">
        <div className="text-xs text-muted mb-2 text-center">Actions</div>
        <div className="space-y-1">
          {actions.map((action) => {
            const Icon = action.icon;
            
            return (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                className="w-full p-2 rounded-lg text-muted hover:text-primary hover:bg-white/50 transition-all duration-200"
                title={action.label}
              >
                <Icon className="w-5 h-5 mx-auto" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Node Button */}
      <div className="p-2">
        <button
          onClick={() => handleAction('add')}
          className="w-full p-2 rounded-lg bg-primary text-white hover:bg-primary-foreground transition-all duration-200"
          title="Add Node"
        >
          <Plus className="w-5 h-5 mx-auto" />
        </button>
      </div>
    </div>
  );
}
