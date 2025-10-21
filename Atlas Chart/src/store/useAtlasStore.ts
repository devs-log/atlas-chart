import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { MarkerType } from 'reactflow';
import type { 
  AtlasState, 
  System, 
  SystemEdge, 
  CameraState, 
  Mode, 
  SceneType,
  Breadcrumb,
  ColorScheme
} from '@/lib/types';

interface AtlasStore extends AtlasState {
  // Actions
  setSystems: (systems: System[]) => void;
  setEdges: (edges: SystemEdge[]) => void;
  addSystem: (system: System) => void;
  updateSystem: (id: string, updates: Partial<System>) => void;
  removeSystem: (id: string) => void;
  addEdge: (edge: SystemEdge) => void;
  updateEdge: (id: string, updates: Partial<SystemEdge>) => void;
  removeEdge: (id: string) => void;
  
  // Editing state
  selectedTool: string;
  selectedNodeType: string | null;
  selectedConnectionType: string;
  setSelectedTool: (tool: string) => void;
  setSelectedNodeType: (nodeType: string | null) => void;
  setSelectedConnectionType: (type: string) => void;
  
  // UI actions
  setMode: (mode: Mode) => void;
  setScene: (scene: SceneType) => void;
  setSelectedNodeId: (id?: string) => void;
  setFocusNodeId: (id?: string) => void;
  setCamera: (camera: Partial<CameraState>) => void;
  
  // Panel actions
  setShowDetailCard: (show: boolean) => void;
  setShowCommandPalette: (show: boolean) => void;
  setShowFullscreen: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  
  // Search actions
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: System[]) => void;
  
  // Editing actions
  setEditing: (editing: boolean) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  
  // Utility actions
  resetCamera: () => void;
  fitToView: () => void;
  getSystemById: (id: string) => System | undefined;
  
  // Settings actions
  setColorScheme: (scheme: ColorScheme) => void;
  getEdgesByNodeId: (nodeId: string) => SystemEdge[];
  getInboundEdges: (nodeId: string) => SystemEdge[];
  getOutboundEdges: (nodeId: string) => SystemEdge[];
  getBreadcrumbs: () => Breadcrumb[];
  
  // Connection actions
  setConnecting: (connecting: boolean) => void;
  
  // React Flow helpers
  getReactFlowNodes: () => any[];
  getReactFlowEdges: () => any[];
  
  // URL sync
  syncFromURL: () => void;
  syncToURL: () => void;
  
  // Radial menu actions
  showRadialMenu: (position: { x: number; y: number }, clickPosition: { x: number; y: number }, edgeId?: string, edgeData?: any) => void;
  hideRadialMenu: () => void;
  
  // Edge selection actions
  setSelectedEdgeId: (edgeId?: string) => void;
  
  // Connection editor actions
  addConnectionLabel: (edgeId: string, label: string) => void;
  deleteConnection: (edgeId: string) => void;
  addElbowPoint: (edgeId: string, point: { x: number; y: number }) => void;
  changeConnectionRouting: (edgeId: string, routing: 'direct' | 'around') => void;
  changeConnectionType: (edgeId: string, type: string) => void;
  changeLineStyle: (edgeId: string, style: 'solid' | 'dashed' | 'dotted') => void;
  changeLineWeight: (edgeId: string, weight: 'thin' | 'normal' | 'bold') => void;
  changeLineColor: (edgeId: string, color: string) => void;
}

const defaultCamera: CameraState = {
  x: 0,
  y: 0,
  zoom: 1,
};

const defaultState: AtlasState = {
  systems: [],
  edges: [],
  mode: 'viewing',
  scene: 'overview',
  selectedNodeId: undefined,
  focusNodeId: undefined,
  camera: defaultCamera,
  isEditing: false,
  hasUnsavedChanges: false,
  showDetailCard: false,
  showCommandPalette: false,
  showFullscreen: false,
  showSettings: false,
  searchQuery: '',
  searchResults: [],
  colorScheme: 'default',
  isConnecting: false,
  radialMenu: {
    isVisible: false,
    position: { x: 0, y: 0 },
    clickPosition: { x: 0, y: 0 },
    edgeId: undefined,
    edgeData: undefined,
  },
  selectedEdgeId: undefined,
};

export const useAtlasStore = create<AtlasStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...defaultState,
      
      // Editing state
      selectedTool: 'select',
      selectedNodeType: null,
      selectedConnectionType: 'straight',

      // System actions
      setSystems: (systems) => set((state) => {
        state.systems = systems;
      }),

      setEdges: (edges) => set((state) => {
        state.edges = edges;
      }),

      addSystem: (system) => set((state) => {
        state.systems.push(system);
        state.hasUnsavedChanges = true;
      }),

      updateSystem: (id, updates) => set((state) => {
        const index = state.systems.findIndex((s: any) => s.id === id);
        if (index !== -1) {
          Object.assign(state.systems[index], updates);
          state.hasUnsavedChanges = true;
        }
      }),

      removeSystem: (id) => set((state) => {
        state.systems = state.systems.filter((s: any) => s.id !== id);
        state.edges = state.edges.filter((e: any) => e.source !== id && e.target !== id);
        state.hasUnsavedChanges = true;
      }),

      // Edge actions
      addEdge: (edge) => set((state) => {
        state.edges.push(edge);
        state.hasUnsavedChanges = true;
      }),

      updateEdge: (id, updates) => set((state) => {
        const index = state.edges.findIndex((e: any) => e.id === id);
        if (index !== -1) {
          // Normalize markers to React Flow MarkerType at update time
          const normalizedUpdates = { ...updates };
          
          if (updates.markerStart) {
            normalizedUpdates.markerStart = {
              type: updates.markerStart.type === 'solid' ? 'arrowclosed' : 'arrow',
              color: updates.markerStart.color || '#000000',
              width: updates.markerStart.width || 20,
              height: updates.markerStart.height || 20,
            };
          }
          
          if (updates.markerEnd) {
            normalizedUpdates.markerEnd = {
              type: updates.markerEnd.type === 'solid' ? 'arrowclosed' : 'arrow',
              color: updates.markerEnd.color || '#000000',
              width: updates.markerEnd.width || 20,
              height: updates.markerEnd.height || 20,
            };
          }
          
          Object.assign(state.edges[index], normalizedUpdates);
          state.hasUnsavedChanges = true;
        }
      }),

      removeEdge: (id) => set((state) => {
        state.edges = state.edges.filter((e: any) => e.id !== id);
        state.hasUnsavedChanges = true;
      }),

      // UI actions
      setMode: (mode) => set((state) => {
        state.mode = mode;
        state.isEditing = mode === 'editing';
        if (mode === 'viewing') {
          state.showDetailCard = false;
        }
      }),

      setScene: (scene) => set((state) => {
        state.scene = scene;
        // Reset focus when changing scenes
        state.focusNodeId = undefined;
        state.selectedNodeId = undefined;
      }),

      setSelectedNodeId: (id) => set((state) => {
        state.selectedNodeId = id;
        state.showDetailCard = !!id;
      }),

      setFocusNodeId: (id) => set((state) => {
        state.focusNodeId = id;
        // Auto-select when focusing
        if (id) {
          state.selectedNodeId = id;
          state.showDetailCard = true;
        }
      }),

      setCamera: (camera) => set((state) => {
        Object.assign(state.camera, camera);
      }),

      // Panel actions
      setShowDetailCard: (show) => set((state) => {
        state.showDetailCard = show;
        if (!show) {
          state.selectedNodeId = undefined;
        }
      }),

      setShowCommandPalette: (show) => set((state) => {
        state.showCommandPalette = show;
      }),

      setShowFullscreen: (show) => set((state) => {
        state.showFullscreen = show;
      }),

      setShowSettings: (show) => set((state) => {
        state.showSettings = show;
      }),

      // Search actions
      setSearchQuery: (query) => set((state) => {
        state.searchQuery = query;
      }),

      setSearchResults: (results) => set((state) => {
        state.searchResults = results;
      }),

      // Editing actions
      setEditing: (editing) => set((state) => {
        state.isEditing = editing;
        state.mode = editing ? 'editing' : 'viewing';
      }),

      setHasUnsavedChanges: (hasChanges) => set((state) => {
        state.hasUnsavedChanges = hasChanges;
      }),

      setSelectedTool: (tool) => set((state) => {
        state.selectedTool = tool;
        // Clear node type selection when switching tools
        if (tool !== 'select') {
          state.selectedNodeType = null;
        }
      }),

      setSelectedNodeType: (nodeType) => set((state) => {
        state.selectedNodeType = nodeType;
        if (nodeType) {
          state.selectedTool = 'add-node';
        }
      }),

      setSelectedConnectionType: (type) => set((state) => {
        state.selectedConnectionType = type;
      }),

      // Utility actions
      resetCamera: () => set((state) => {
        state.camera = { ...defaultCamera };
      }),

      fitToView: () => {
        const { systems } = get();
        if (systems.length === 0) return;

        // Calculate bounds of all systems
        const positions = systems
          .filter((s: any) => s.x !== undefined && s.y !== undefined)
          .map((s: any) => ({ x: s.x!, y: s.y!, width: s.width || 200, height: s.height || 100 }));

        if (positions.length === 0) return;

        const minX = Math.min(...positions.map(p => p.x));
        const maxX = Math.max(...positions.map(p => p.x + p.width));
        const minY = Math.min(...positions.map(p => p.y));
        const maxY = Math.max(...positions.map(p => p.y + p.height));

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const width = maxX - minX;
        const height = maxY - minY;

        // Calculate zoom to fit with margin
        const margin = 100;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scaleX = (viewportWidth - margin * 2) / width;
        const scaleY = (viewportHeight - margin * 2) / height;
        const zoom = Math.min(scaleX, scaleY, 2); // Max zoom of 2

        set((state) => {
          state.camera = {
            x: -centerX * zoom + viewportWidth / 2,
            y: -centerY * zoom + viewportHeight / 2,
            zoom,
          };
        });
      },

      getSystemById: (id) => {
        const { systems } = get();
        return systems.find(s => s.id === id);
      },

      getEdgesByNodeId: (nodeId) => {
        const { edges } = get();
        return edges.filter(e => e.source === nodeId || e.target === nodeId);
      },

      getInboundEdges: (nodeId) => {
        const { edges } = get();
        return edges.filter(e => e.target === nodeId);
      },

      getOutboundEdges: (nodeId) => {
        const { edges } = get();
        return edges.filter(e => e.source === nodeId);
      },

      getBreadcrumbs: () => {
        const { focusNodeId, scene, getSystemById } = get();
        const breadcrumbs: Breadcrumb[] = [];

        if (focusNodeId) {
          const system = getSystemById(focusNodeId);
          if (system) {
            breadcrumbs.push({
              id: system.id,
              name: system.name,
              type: 'system',
            });
          }
        }

        breadcrumbs.push({
          id: scene,
          name: getSceneName(scene),
          type: 'scene',
        });

        return breadcrumbs;
      },

      // React Flow helpers
      getReactFlowNodes: () => {
        const { systems } = get();
        return systems.map(system => ({
          id: system.id,
          type: 'system',
          position: { x: (system as any).x || 0, y: (system as any).y || 0 },
          data: system,
          draggable: true,
          selectable: true,
        }));
      },

      getReactFlowEdges: () => {
        const { edges } = get();
        const reactFlowEdges = edges.map(edge => {
          // Determine edge type based on connectionType
          let edgeType = 'systemEdge'; // default to curved/bezier
          if (edge.connectionType === 'straight') {
            edgeType = 'straightEdge';
          } else if (edge.connectionType === 'step') {
            edgeType = 'stepEdge';
          } else if (edge.connectionType === 'elbow') {
            edgeType = 'elbowEdge';
          }
          
          
          const edgeData: any = {
            id: edge.id,
            type: edgeType,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,   // ✅ new
            targetHandle: edge.targetHandle,   // ✅ new
            data: edge,
            animated: edge.animated,
          };

          // Add markers if the edge has them defined - they're already normalized to MarkerType
          if (edge.markerEnd) {
            edgeData.markerEnd = edge.markerEnd;
          }
          if (edge.markerStart) {
            edgeData.markerStart = edge.markerStart;
          }

          return edgeData;
        });
        
        return reactFlowEdges;
      },

      // URL sync
      syncFromURL: () => {
        const params = new URLSearchParams(window.location.search);
        
        set((state) => {
          const focus = params.get('focus');
          const scene = params.get('scene') as SceneType;
          const x = params.get('x');
          const y = params.get('y');
          const z = params.get('z');

          if (focus) state.focusNodeId = focus;
          if (scene && ['overview', 'data-flows', 'by-domain', 'by-status'].includes(scene)) {
            state.scene = scene;
          }
          if (x && y && z) {
            state.camera = {
              x: parseFloat(x),
              y: parseFloat(y),
              zoom: parseFloat(z),
            };
          }
        });
      },

      syncToURL: () => {
        const { focusNodeId, scene, camera } = get();
        const params = new URLSearchParams();

        if (focusNodeId) params.set('focus', focusNodeId);
        if (scene !== 'overview') params.set('scene', scene);
        if (camera.x !== 0 || camera.y !== 0 || camera.zoom !== 1) {
          params.set('x', camera.x.toString());
          params.set('y', camera.y.toString());
          params.set('z', camera.zoom.toString());
        }

        const newUrl = params.toString() 
          ? `${window.location.pathname}?${params.toString()}`
          : window.location.pathname;

        window.history.replaceState({}, '', newUrl);
      },

      setColorScheme: (scheme) => set((state) => {
        state.colorScheme = scheme;
        // Apply the color scheme to the document
        document.documentElement.setAttribute('data-color-scheme', scheme);
      }),

      // Connection actions
      setConnecting: (connecting) => set((state) => {
        state.isConnecting = connecting;
      }),
      
      // Radial menu actions
  showRadialMenu: (position, clickPosition, edgeId, edgeData) => set((state) => {
    state.radialMenu = {
      isVisible: true,
      position,
      clickPosition,
      edgeId,
      edgeData,
    };
  }),
      
      hideRadialMenu: () => set((state) => {
        state.radialMenu = {
          isVisible: false,
          position: { x: 0, y: 0 },
          clickPosition: { x: 0, y: 0 },
          edgeId: undefined,
          edgeData: undefined,
        };
      }),
      
      // Edge selection actions
      setSelectedEdgeId: (edgeId) => set((state) => {
        state.selectedEdgeId = edgeId;
      }),
      
      // Connection editor actions
      addConnectionLabel: (edgeId, label) => set((state) => {
        const index = state.edges.findIndex((e: any) => e.id === edgeId);
        if (index !== -1) {
          state.edges[index].label = label;
          state.hasUnsavedChanges = true;
        }
      }),
      
      deleteConnection: (edgeId) => set((state) => {
        state.edges = state.edges.filter((e: any) => e.id !== edgeId);
        state.hasUnsavedChanges = true;
        // Clear selection if this edge was selected
        if (state.selectedEdgeId === edgeId) {
          state.selectedEdgeId = undefined;
        }
      }),
      
      addElbowPoint: (edgeId, point) => set((state) => {
        console.log('addElbowPoint called:', { edgeId, point });
        const index = state.edges.findIndex((e: any) => e.id === edgeId);
        console.log('Found edge at index:', index);
        if (index !== -1) {
          if (!state.edges[index].elbowPoints) {
            state.edges[index].elbowPoints = [];
          }
          state.edges[index].elbowPoints!.push(point);
          console.log('Added elbow point. New points:', state.edges[index].elbowPoints);
          state.hasUnsavedChanges = true;
        } else {
          console.warn('Edge not found:', edgeId);
        }
      }),
      
      changeConnectionRouting: (edgeId, routing) => set((state) => {
        const index = state.edges.findIndex((e: any) => e.id === edgeId);
        if (index !== -1) {
          state.edges[index].routing = routing;
          state.hasUnsavedChanges = true;
        }
      }),
      
      changeConnectionType: (edgeId, type) => set((state) => {
        const index = state.edges.findIndex((e: any) => e.id === edgeId);
        if (index !== -1) {
          state.edges[index].connectionType = type;
          state.hasUnsavedChanges = true;
        }
      }),
      
      changeLineStyle: (edgeId, style) => set((state) => {
        const index = state.edges.findIndex((e: any) => e.id === edgeId);
        if (index !== -1) {
          state.edges[index].lineStyle = style;
          state.hasUnsavedChanges = true;
        }
      }),
      
      changeLineWeight: (edgeId, weight) => set((state) => {
        const index = state.edges.findIndex((e: any) => e.id === edgeId);
        if (index !== -1) {
          state.edges[index].lineWeight = weight;
          state.hasUnsavedChanges = true;
        }
      }),
      
      changeLineColor: (edgeId, color) => set((state) => {
        const index = state.edges.findIndex((e: any) => e.id === edgeId);
        if (index !== -1) {
          state.edges[index].lineColor = color;
          state.hasUnsavedChanges = true;
        }
      }),
    }))
  )
);

// Helper function
function getSceneName(scene: SceneType): string {
  switch (scene) {
    case 'overview': return 'Overview';
    case 'data-flows': return 'Data Flows';
    case 'by-domain': return 'By Domain';
    case 'by-status': return 'By Status';
    default: return 'Overview';
  }
}

// Subscribe to URL changes
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    useAtlasStore.getState().syncFromURL();
  });

  // Initial URL sync
  useAtlasStore.getState().syncFromURL();
}
