import React, { useEffect } from 'react';
import { ReactFlow, Background, Controls, useReactFlow, ConnectionMode, ConnectionLineType, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import '../styles/arrow-animations.css';

import { useAtlasStore } from '@/store/useAtlasStore';
import { applySimpleSceneLayout } from '@/lib/simpleLayouts';

import GraphView from '@/components/GraphView';
import EdgeShape from '@/components/EdgeShape';
import StraightEdge from '@/components/StraightEdge';
import StepEdge from '@/components/StepEdge';
import ElbowEdge from '@/components/ElbowEdge';
import ToolShelf from '@/components/ToolShelf';
import InspectorPanel from '@/components/InspectorPanel';
import FullscreenButton from '@/components/FullscreenButton';
import MenuBar from '@/components/MenuBar';
import ConnectionContextMenu from '@/components/ConnectionContextMenu';
import ConnectionEditor from '@/components/ConnectionEditor';
import ArrowGradients from '@/components/ArrowGradients';

// Define node and edge types outside component to prevent recreation
const nodeTypes = { 
  system: GraphView
};
const edgeTypes = { 
  systemEdge: EdgeShape,
  straightEdge: StraightEdge,
  stepEdge: StepEdge,
  elbowEdge: ElbowEdge,
};

export default function Editor() {
  const { fitView } = useReactFlow();
  
  const {
    systems,
    edges,
    scene,
    camera,
    focusNodeId,
    selectedTool,
    selectedNodeType,
    selectedConnectionType,
    radialMenu,
    selectedEdgeId,
    mode,
    setSystems,
    setCamera,
    setSelectedNodeId,
    addSystem,
    addEdge,
    setSelectedTool,
    setSelectedNodeType,
    syncToURL,
    getReactFlowNodes,
    getReactFlowEdges,
    setConnecting,
    showRadialMenu,
    hideRadialMenu,
    setSelectedEdgeId,
  } = useAtlasStore();

  // State for connection editor
  const [showConnectionEditor, setShowConnectionEditor] = React.useState(false);
  const [editorAction, setEditorAction] = React.useState<string>('');
  const [editorEdgeId, setEditorEdgeId] = React.useState<string>('');
  const [editorEdgeData, setEditorEdgeData] = React.useState<any>(null);

  // Map connection types to React Flow's ConnectionLineType
  const getConnectionLineType = (connectionType: string) => {
    switch (connectionType) {
      case 'straight':
        return ConnectionLineType.Straight;
      case 'step':
        return ConnectionLineType.Step;
      case 'curved':
        return ConnectionLineType.Bezier;
      default:
        return ConnectionLineType.Step;
    }
  };

  // Debug: Check initial selectedTool value at mount time
  console.log('Initial selectedTool:', selectedTool);
  console.log('Selected edge ID:', selectedEdgeId);
  
  // Additional debug info
  console.log('React Flow nodes count:', getReactFlowNodes().length);
  console.log('React Flow edges count:', getReactFlowEdges().length);
  console.log('Systems count:', systems.length);


  // Apply layout only when scene changes, not when mode changes
  useEffect(() => {
    if (systems.length === 0) return;
    
    // Skip layout if nodes already have positions (prevents repositioning during mode switches)
    const hasPositions = systems.every(node => (node as any).x !== undefined && (node as any).y !== undefined);
    if (hasPositions) return;

    const applyLayout = async () => {
      const layoutedNodes = await applySimpleSceneLayout(
        scene,
        systems,
        edges,
        focusNodeId, // Use same focus logic as Viewer
        { centerX: 0, centerY: 0 }
      );

      setSystems(layoutedNodes);
    };

    applyLayout();
  }, [scene, setSystems]); // Only reapply when scene changes

  // Only fit view when scene changes, not when edges change
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
      
      // Don't refit view after fullscreen change to preserve node positions
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []); // Removed fitView from dependency array

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Don't call fitView on resize to preserve node positions
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Removed fitView from dependency array

  const onNodeClick = (event: React.MouseEvent, node: any) => {
    if (selectedTool === 'connect') {
      // Handle connection logic
      return;
    }
    setSelectedNodeId(node.id);
    setSelectedEdgeId(undefined); // Clear edge selection when clicking a node
    hideRadialMenu(); // Close the context menu when clicking a node
  };

  const onPaneClick = (event: React.MouseEvent) => {
    console.log('Canvas clicked!', { selectedTool, selectedNodeType });
    
    if (selectedTool === 'add-node' && selectedNodeType) {
      // Create a new node at the clicked position
      // Simple position calculation for now - will be improved later
      const rect = (event.target as Element).getBoundingClientRect();
      const position = {
        x: event.clientX - rect.left - 100, // Offset to center the node
        y: event.clientY - rect.top - 50,
      };
      
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
      setSelectedEdgeId(undefined);
      hideRadialMenu(); // Close the context menu when clicking on empty canvas
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

  const onEdgeClick = (event: React.MouseEvent, edge: any) => {
    // Check if the click was on an elbow point by looking at the target
    const target = event.target as Element;
    const isElbowPointClick = target.closest('[data-elbow-point]') || 
                             target.closest('circle[style*="cursor: grab"]') ||
                             target.closest('g[style*="cursor: grab"]');
    
    if (isElbowPointClick) {
      console.log('Click was on elbow point, not handling edge click');
      return; // Don't interfere with elbow point interactions
    }
    
    event.stopPropagation();
    
    console.log('Edge clicked:', edge.id, 'type:', edge.type, 'data:', edge.data);
    
    // Set the selected edge
    setSelectedEdgeId(edge.id);
    
    // Only show context menu in edit mode (Editor should always be in edit mode)
    if (mode === 'editing') {
      // Get the click position relative to the viewport
      const reactFlowWrapper = document.querySelector('.react-flow');
      if (!reactFlowWrapper) return;
      
      const rect = reactFlowWrapper.getBoundingClientRect();
      const clickPosition = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      
      // Position the radial menu further to the right from the click point
      const menuPosition = {
        x: clickPosition.x + 60,
        y: clickPosition.y - 20,
      };
      
      showRadialMenu(menuPosition, clickPosition, edge.id, edge);
    }
  };

  const onConnect = (params: any) => {
    console.log('🔗 onConnect fired', params);

    // Only allow connections when connect tool is selected
    if (selectedTool !== 'connect') {
      console.log('Connection blocked - connect tool not selected');
      return;
    }

    if (!params.source || !params.target) return;
    if (params.source === params.target) return;

    // Normalize handle IDs to remove any prefixes React Flow might have added
    const normalizeHandle = (handleId?: string) => {
      if (!handleId) return undefined;
      // Remove any source- or target- prefixes that might exist
      return handleId.replace(/^source-|^target-/, '');
    };

    const newEdge = {
      id: `edge-${Date.now()}`,
      source: params.source,
      target: params.target,
      sourceHandle: normalizeHandle(params.sourceHandle),
      targetHandle: normalizeHandle(params.targetHandle),
      kind: 'other' as const,
      connectionType: selectedConnectionType,
    };

    addEdge(newEdge);
    console.log('Connection created:', newEdge);
  };

  const onMove = (event: any, viewport: any) => {
    // Update camera state when viewport changes
    setCamera({
      x: viewport.x,
      y: viewport.y,
      zoom: viewport.zoom,
    });
  };

  const isValidConnection = (connection: any) => {
    console.log('🔍 isValidConnection called with:', connection);
    // Allow all connections - this enables drag-to-connect functionality
    return true;
  };

  return (
    <div className="w-full h-full relative">
      <MenuBar />
      {/* Main Canvas */}
      <div className="w-full h-full pt-12">
        <ReactFlow
          key="editor-flow"
          nodes={getReactFlowNodes()}
          edges={getReactFlowEdges()}
          onMove={onMove}
          onNodeClick={onNodeClick}
          onNodeDrag={onNodeDrag}
          onPaneClick={onPaneClick}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          onConnectStart={(e, params) => {
            console.log('🟡 onConnectStart', params);
            setConnecting(true);
          }}
          onConnectEnd={(e) => {
            console.log('🟢 onConnectEnd', e.target);
            setConnecting(false);
          }}
          isValidConnection={isValidConnection}
          fitView={false}
          fitViewOptions={{ padding: 0.1 }}
          minZoom={0.1}
          maxZoom={3}
          defaultViewport={{ x: camera.x, y: camera.y, zoom: camera.zoom }}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          className="canvas-grid"
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          connectionMode={ConnectionMode.Loose}
          connectionLineStyle={{ stroke: '#0078ff', strokeWidth: 2 }}
          connectionLineType={getConnectionLineType(selectedConnectionType)}
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
          <ArrowGradients />
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
      
      {/* Connection Context Menu - Only in Edit Mode */}
      {mode === 'editing' && (
        <ConnectionContextMenu
          isVisible={radialMenu.isVisible}
          position={radialMenu.position}
          clickPosition={radialMenu.clickPosition}
          edgeData={radialMenu.edgeData}
          onClose={hideRadialMenu}
          onAction={(action) => {
            console.log('Connection context menu action:', action, 'on edge:', radialMenu.edgeId);
            // Store edge data before hiding the menu
            setEditorEdgeId(radialMenu.edgeId || '');
            setEditorEdgeData(radialMenu.edgeData);
            setEditorAction(action);
            setShowConnectionEditor(true);
            hideRadialMenu();
          }}
        />
      )}
      
      {/* Connection Editor */}
      {showConnectionEditor && editorEdgeId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <ConnectionEditor
            edgeId={editorEdgeId}
            edgeData={editorEdgeData}
            onClose={() => {
              setShowConnectionEditor(false);
              setEditorEdgeId('');
              setEditorEdgeData(null);
            }}
            action={editorAction}
          />
        </div>
      )}
    </div>
  );
}
