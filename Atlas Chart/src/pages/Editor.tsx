import React, { useEffect } from 'react';
import { ReactFlow, Background, Controls, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';

import { useAtlasStore } from '@/store/useAtlasStore';
import { applySimpleSceneLayout } from '@/lib/simpleLayouts';

import GraphView from '@/components/GraphView';
import EdgeShape from '@/components/EdgeShape';
import StraightEdge from '@/components/StraightEdge';
import StepEdge from '@/components/StepEdge';
import ToolShelf from '@/components/ToolShelf';
import InspectorPanel from '@/components/InspectorPanel';
import FullscreenButton from '@/components/FullscreenButton';
import MenuBar from '@/components/MenuBar';

// Define node and edge types outside component to prevent recreation
const nodeTypes = { system: GraphView };
const edgeTypes = { 
  systemEdge: EdgeShape,
  straightEdge: StraightEdge,
  stepEdge: StepEdge,
};

export default function Editor() {
  const { fitView, screenToFlowPosition } = useReactFlow();
  
  const {
    systems,
    edges,
    scene,
    selectedTool,
    selectedNodeType,
    selectedConnectionType,
    setSystems,
    setSelectedNodeId,
    addSystem,
    addEdge,
    setSelectedTool,
    setSelectedNodeType,
    syncToURL,
    getReactFlowNodes,
    getReactFlowEdges,
  } = useAtlasStore();

  // Apply layout when scene changes
  useEffect(() => {
    if (systems.length === 0) return;

    const applyLayout = async () => {
      const layoutedNodes = await applySimpleSceneLayout(
        scene,
        systems,
        edges,
        undefined, // No focus in editing mode
        { centerX: 0, centerY: 0 }
      );

      setSystems(layoutedNodes);
    };

    applyLayout();
  }, [scene, edges, setSystems]);

  // Fit view when layout changes
  useEffect(() => {
    if (systems.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.1, duration: 300 });
      }, 350); // After layout animation completes
    }
  }, [scene, fitView]);

  // Sync URL when state changes
  useEffect(() => {
    syncToURL();
  }, [scene, syncToURL]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      useAtlasStore.getState().setShowFullscreen(isFullscreen);
      
      // Refit view after fullscreen change
      setTimeout(() => {
        fitView({ padding: 0.1, duration: 200 });
      }, 100);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [fitView]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        fitView({ padding: 0.1, duration: 200 });
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitView]);

  const onNodeClick = (event: React.MouseEvent, node: any) => {
    if (selectedTool === 'connect') {
      // Handle connection logic
      return;
    }
    setSelectedNodeId(node.id);
  };

  const onPaneClick = (event: React.MouseEvent) => {
    console.log('Canvas clicked!', { selectedTool, selectedNodeType });
    
    if (selectedTool === 'add-node' && selectedNodeType) {
      // Create a new node at the clicked position
      // Use React Flow's screenToFlowPosition to convert screen coordinates to flow coordinates
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      console.log('Creating new node at position:', position);
      
      const nodeId = `node-${Date.now()}`;
      const newNode = {
        id: nodeId,
        name: `New ${selectedNodeType}`,
        type: selectedNodeType as any,
        domain: 'Default Domain',
        status: 'planned' as const,
        x: position.x,
        y: position.y,
      };
      
      console.log('New node:', newNode);
      addSystem(newNode);
      setSelectedNodeType(null);
      setSelectedTool('select');
    } else {
      setSelectedNodeId(undefined);
    }
  };

  const onNodeDrag = (event: React.MouseEvent, node: any) => {
    // Update node position in store
    setSystems(systems.map(s => 
      s.id === node.id 
        ? { ...s, x: node.position.x, y: node.position.y }
        : s
    ));
  };

  const onConnect = (params: any) => {
    console.log('onConnect triggered!', { params, selectedConnectionType, selectedTool });
    const newEdge = {
      id: `edge-${Date.now()}`,
      source: params.source,
      target: params.target,
      kind: 'other' as const,
      connectionType: selectedConnectionType,
    };
    addEdge(newEdge);
    console.log('Connection created:', newEdge);
  };

  // Debug logging for connection state
  console.log('Editor render:', { selectedTool, selectedConnectionType, nodesConnectable: selectedTool === 'connect' });

  return (
    <div className="w-full h-full relative">
      <MenuBar />
      {/* Main Canvas */}
      <div className="w-full h-full pt-12">
        <ReactFlow
          nodes={getReactFlowNodes()}
          edges={getReactFlowEdges()}
          onNodeClick={onNodeClick}
          onNodeDrag={onNodeDrag}
          onPaneClick={onPaneClick}
          onConnect={onConnect}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          minZoom={0.1}
          maxZoom={3}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          className="canvas-grid"
          nodesDraggable={true}
          nodesConnectable={selectedTool === 'connect'}
          elementsSelectable={true}
        >
          <Background 
            color="var(--line)" 
            size={1} 
            gap={20}
            className="canvas-grid"
          />
          <Controls 
            className="bg-white/80 backdrop-blur-sm border border-[var(--line)] rounded-lg shadow-sm"
            position="bottom-left"
          />
        </ReactFlow>
      </div>

      {/* Tool Shelf */}
      <div className="absolute left-4 top-16 bottom-4 pointer-events-none">
        <ToolShelf />
      </div>

      {/* Inspector Panel */}
      <div className="absolute right-4 top-16 bottom-4 pointer-events-none">
        <InspectorPanel />
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-16 right-4 flex items-center gap-2 pointer-events-none">
        <FullscreenButton />
      </div>
    </div>
  );
}
