import React, { useEffect, useRef } from 'react';
import { ReactFlow, Background, Controls, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';

import { useAtlasStore } from '@/store/useAtlasStore';
import { applySimpleSceneLayout } from '@/lib/simpleLayouts';

import GraphView from '@/components/GraphView';
import EdgeShape from '@/components/EdgeShape';
import StraightEdge from '@/components/StraightEdge';
import StepEdge from '@/components/StepEdge';
import SceneToolbar from '@/components/SceneToolbar';
import Breadcrumbs from '@/components/Breadcrumbs';
import DetailCard from '@/components/DetailCard';
import FullscreenButton from '@/components/FullscreenButton';
import CommandPalette from '@/components/CommandPalette';
import MenuBar from '@/components/MenuBar';

// Define node and edge types outside component to prevent recreation
const nodeTypes = { system: GraphView };
const edgeTypes = {
  systemEdge: EdgeShape,
  straightEdge: StraightEdge,
  stepEdge: StepEdge,
};

export default function Viewer() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();
  
  const {
    systems,
    edges,
    scene,
    focusNodeId,
    selectedNodeId,
    showDetailCard,
    showCommandPalette,
    selectedConnectionType,
    setSystems,
    setFocusNodeId,
    setSelectedNodeId,
    addEdge,
    syncToURL,
    getReactFlowNodes,
    getReactFlowEdges,
  } = useAtlasStore();

  // Apply layout when scene or focus changes
  useEffect(() => {
    if (systems.length === 0) return;

    const applyLayout = async () => {
      const layoutedNodes = await applySimpleSceneLayout(
        scene,
        systems,
        edges,
        focusNodeId,
        { centerX: 0, centerY: 0 }
      );

      setSystems(layoutedNodes);
    };

    applyLayout();
  }, [scene, focusNodeId, edges, setSystems]);

  // Fit view when layout changes
  useEffect(() => {
    if (systems.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.1, duration: 300 });
      }, 350); // After layout animation completes
    }
  }, [scene, focusNodeId, fitView]);

  // Sync URL when state changes
  useEffect(() => {
    syncToURL();
  }, [focusNodeId, scene, syncToURL]);

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
    setSelectedNodeId(node.id);
    setFocusNodeId(node.id);
  };

  const onPaneClick = () => {
    setSelectedNodeId(undefined);
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
    console.log('onConnect triggered in Viewer!', { params, selectedConnectionType });
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


  return (
    <div className="w-full h-full relative">
      <MenuBar />
      <div ref={reactFlowWrapper} className="w-full h-full pt-12">
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
          nodesConnectable={true}
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

      {/* Top UI */}
      <div className="absolute top-16 left-4 right-4 flex items-start justify-between pointer-events-none">
        <div className="flex flex-col gap-2">
          <Breadcrumbs />
        </div>
        
        <div className="flex items-center gap-2">
          <SceneToolbar />
          <FullscreenButton />
        </div>
      </div>

      {/* Detail Card */}
      {showDetailCard && selectedNodeId && (
        <DetailCard nodeId={selectedNodeId} />
      )}

      {/* Command Palette */}
      {showCommandPalette && (
        <CommandPalette />
      )}
    </div>
  );
}
