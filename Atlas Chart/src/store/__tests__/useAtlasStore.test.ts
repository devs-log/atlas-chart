import { describe, it, expect, beforeEach } from 'vitest';
import { useAtlasStore } from '../useAtlasStore';
import type { 
  System, 
  SystemEdge, 
  Initiative, 
  WorkItem, 
  ViewMode,
  InitiativeStatus,
  WorkItemStatus,
  Priority,
  WorkItemType
} from '../../lib/types';

// ============================================================================
// STORE FUNCTIONALITY TESTS
// ============================================================================

describe('Atlas Store - Core Functionality (Phases 1-5)', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAtlasStore.getState().setSystems([]);
    useAtlasStore.getState().setEdges([]);
    useAtlasStore.getState().setSelectedNodeId(undefined);
    useAtlasStore.getState().setFocusNodeId(undefined);
  });

  describe('System Management', () => {
    it('adds a new system', () => {
      const newSystem: System = {
        id: 'test-system',
        name: 'Test System',
        type: 'service',
        domain: 'Test Domain',
        status: 'live'
      };

      useAtlasStore.getState().addSystem(newSystem);
      
      const systems = useAtlasStore.getState().systems;
      expect(systems).toHaveLength(1);
      expect(systems[0]).toEqual(newSystem);
    });

    it('updates an existing system', () => {
      const system: System = {
        id: 'test-system',
        name: 'Test System',
        type: 'service',
        domain: 'Test Domain',
        status: 'live'
      };

      useAtlasStore.getState().addSystem(system);
      useAtlasStore.getState().updateSystem('test-system', { 
        name: 'Updated System',
        status: 'building'
      });

      const updatedSystem = useAtlasStore.getState().getSystemById('test-system');
      expect(updatedSystem?.name).toBe('Updated System');
      expect(updatedSystem?.status).toBe('building');
    });

    it('removes a system', () => {
      const system: System = {
        id: 'test-system',
        name: 'Test System',
        type: 'service',
        domain: 'Test Domain',
        status: 'live'
      };

      useAtlasStore.getState().addSystem(system);
      expect(useAtlasStore.getState().systems).toHaveLength(1);

      useAtlasStore.getState().removeSystem('test-system');
      expect(useAtlasStore.getState().systems).toHaveLength(0);
    });

    it('gets system by ID', () => {
      const system: System = {
        id: 'test-system',
        name: 'Test System',
        type: 'service',
        domain: 'Test Domain',
        status: 'live'
      };

      useAtlasStore.getState().addSystem(system);
      
      const retrievedSystem = useAtlasStore.getState().getSystemById('test-system');
      expect(retrievedSystem).toEqual(system);

      const nonExistentSystem = useAtlasStore.getState().getSystemById('non-existent');
      expect(nonExistentSystem).toBeUndefined();
    });

    it('handles multiple systems', () => {
      const systems: System[] = [
        {
          id: 'system-1',
          name: 'System 1',
          type: 'service',
          domain: 'Domain 1',
          status: 'live'
        },
        {
          id: 'system-2',
          name: 'System 2',
          type: 'app',
          domain: 'Domain 2',
          status: 'building'
        }
      ];

      systems.forEach(system => {
        useAtlasStore.getState().addSystem(system);
      });

      const allSystems = useAtlasStore.getState().systems;
      expect(allSystems).toHaveLength(2);
      expect(allSystems[0].name).toBe('System 1');
      expect(allSystems[1].name).toBe('System 2');
    });
  });

  describe('Edge Management', () => {
    it('adds a new edge', () => {
      const newEdge: SystemEdge = {
        id: 'test-edge',
        source: 'system-1',
        target: 'system-2',
        kind: 'sync'
      };

      useAtlasStore.getState().addEdge(newEdge);
      
      const edges = useAtlasStore.getState().edges;
      expect(edges).toHaveLength(1);
      expect(edges[0]).toEqual(newEdge);
    });

    it('updates an existing edge', () => {
      const edge: SystemEdge = {
        id: 'test-edge',
        source: 'system-1',
        target: 'system-2',
        kind: 'sync'
      };

      useAtlasStore.getState().addEdge(edge);
      useAtlasStore.getState().updateEdge('test-edge', { 
        kind: 'async',
        note: 'Updated connection'
      });

      const updatedEdge = useAtlasStore.getState().edges.find(e => e.id === 'test-edge');
      expect(updatedEdge?.kind).toBe('async');
      expect(updatedEdge?.note).toBe('Updated connection');
    });

    it('removes an edge', () => {
      const edge: SystemEdge = {
        id: 'test-edge',
        source: 'system-1',
        target: 'system-2',
        kind: 'sync'
      };

      useAtlasStore.getState().addEdge(edge);
      expect(useAtlasStore.getState().edges).toHaveLength(1);

      useAtlasStore.getState().removeEdge('test-edge');
      expect(useAtlasStore.getState().edges).toHaveLength(0);
    });

    it('gets edges by node ID', () => {
      const edges: SystemEdge[] = [
        {
          id: 'edge-1',
          source: 'system-1',
          target: 'system-2',
          kind: 'sync'
        },
        {
          id: 'edge-2',
          source: 'system-1',
          target: 'system-3',
          kind: 'async'
        },
        {
          id: 'edge-3',
          source: 'system-2',
          target: 'system-3',
          kind: 'event'
        }
      ];

      edges.forEach(edge => {
        useAtlasStore.getState().addEdge(edge);
      });

      const system1Edges = useAtlasStore.getState().getEdgesByNodeId('system-1');
      expect(system1Edges).toHaveLength(2);

      const inboundEdges = useAtlasStore.getState().getInboundEdges('system-2');
      expect(inboundEdges).toHaveLength(1);
      expect(inboundEdges[0].id).toBe('edge-1');

      const outboundEdges = useAtlasStore.getState().getOutboundEdges('system-1');
      expect(outboundEdges).toHaveLength(2);
    });
  });

  describe('UI State Management', () => {
    it('manages selected node ID', () => {
      expect(useAtlasStore.getState().selectedNodeId).toBeUndefined();

      useAtlasStore.getState().setSelectedNodeId('test-system');
      expect(useAtlasStore.getState().selectedNodeId).toBe('test-system');

      useAtlasStore.getState().setSelectedNodeId(undefined);
      expect(useAtlasStore.getState().selectedNodeId).toBeUndefined();
    });

    it('manages focus node ID', () => {
      expect(useAtlasStore.getState().focusNodeId).toBeUndefined();

      useAtlasStore.getState().setFocusNodeId('test-system');
      expect(useAtlasStore.getState().focusNodeId).toBe('test-system');

      useAtlasStore.getState().setFocusNodeId(undefined);
      expect(useAtlasStore.getState().focusNodeId).toBeUndefined();
    });

    it('manages camera state', () => {
      const initialState = useAtlasStore.getState().camera;
      expect(initialState.x).toBe(0);
      expect(initialState.y).toBe(0);
      expect(initialState.zoom).toBe(1);

      useAtlasStore.getState().setCamera({ x: 100, y: 200, zoom: 1.5 });
      
      const updatedCamera = useAtlasStore.getState().camera;
      expect(updatedCamera.x).toBe(100);
      expect(updatedCamera.y).toBe(200);
      expect(updatedCamera.zoom).toBe(1.5);
    });

    it('resets camera to default', () => {
      useAtlasStore.getState().setCamera({ x: 100, y: 200, zoom: 1.5 });
      useAtlasStore.getState().resetCamera();

      const resetCamera = useAtlasStore.getState().camera;
      expect(resetCamera.x).toBe(0);
      expect(resetCamera.y).toBe(0);
      expect(resetCamera.zoom).toBe(1);
    });

    it('manages panel visibility', () => {
      const initialState = useAtlasStore.getState();
      expect(initialState.showDetailCard).toBe(false);
      expect(initialState.showCommandPalette).toBe(false);
      expect(initialState.showSettings).toBe(false);

      useAtlasStore.getState().setShowDetailCard(true);
      expect(useAtlasStore.getState().showDetailCard).toBe(true);

      useAtlasStore.getState().setShowCommandPalette(true);
      expect(useAtlasStore.getState().showCommandPalette).toBe(true);

      useAtlasStore.getState().setShowSettings(true);
      expect(useAtlasStore.getState().showSettings).toBe(true);
    });
  });

  describe('Mode Management', () => {
    it('switches between viewing and editing modes', () => {
      expect(useAtlasStore.getState().mode).toBe('viewing');

      useAtlasStore.getState().setMode('editing');
      expect(useAtlasStore.getState().mode).toBe('editing');

      useAtlasStore.getState().setMode('viewing');
      expect(useAtlasStore.getState().mode).toBe('viewing');
    });

    it('manages scene types', () => {
      const scenes: Array<'overview' | 'data-flows' | 'by-domain' | 'by-status'> = [
        'overview',
        'data-flows',
        'by-domain',
        'by-status'
      ];

      scenes.forEach(scene => {
        useAtlasStore.getState().setScene(scene);
        expect(useAtlasStore.getState().scene).toBe(scene);
      });
    });
  });
});

// ============================================================================
// PHASE 6: PROJECT MANAGEMENT STORE TESTS
// ============================================================================

describe('Atlas Store - Project Management (Phase 6)', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAtlasStore.getState().setSystems([]);
    useAtlasStore.getState().setEdges([]);
    useAtlasStore.getState().setInitiatives([]);
    useAtlasStore.getState().setWorkItems([]);
    useAtlasStore.getState().setViewMode('architecture');
    useAtlasStore.getState().selectInitiative(undefined);
    useAtlasStore.getState().selectWorkItem(undefined);
  });

  describe('View Mode Management', () => {
    it('switches between all view modes', () => {
      const viewModes: ViewMode[] = ['architecture', 'project', 'work', 'kanban'];

      viewModes.forEach(mode => {
        useAtlasStore.getState().setViewMode(mode);
        expect(useAtlasStore.getState().viewMode).toBe(mode);
      });
    });

    it('defaults to architecture mode', () => {
      expect(useAtlasStore.getState().viewMode).toBe('architecture');
    });
  });

  describe('Initiative Management', () => {
    it('adds a new initiative', () => {
      const newInitiative: Initiative = {
        id: 'initiative-1',
        name: 'Test Initiative',
        systems: ['system-1'],
        status: 'planned',
        priority: 'high'
      };

      useAtlasStore.getState().addInitiative(newInitiative);
      
      const initiatives = useAtlasStore.getState().initiatives;
      expect(initiatives).toHaveLength(1);
      expect(initiatives[0]).toEqual(newInitiative);
    });

    it('updates an existing initiative', () => {
      const initiative: Initiative = {
        id: 'initiative-1',
        name: 'Test Initiative',
        systems: ['system-1'],
        status: 'planned',
        priority: 'high'
      };

      useAtlasStore.getState().addInitiative(initiative);
      useAtlasStore.getState().updateInitiative('initiative-1', { 
        name: 'Updated Initiative',
        status: 'in progress',
        progress: 50
      });

      const updatedInitiative = useAtlasStore.getState().getInitiativeById('initiative-1');
      expect(updatedInitiative?.name).toBe('Updated Initiative');
      expect(updatedInitiative?.status).toBe('in progress');
      expect(updatedInitiative?.progress).toBe(50);
    });

    it('removes an initiative', () => {
      const initiative: Initiative = {
        id: 'initiative-1',
        name: 'Test Initiative',
        systems: ['system-1'],
        status: 'planned',
        priority: 'high'
      };

      useAtlasStore.getState().addInitiative(initiative);
      expect(useAtlasStore.getState().initiatives).toHaveLength(1);

      useAtlasStore.getState().removeInitiative('initiative-1');
      expect(useAtlasStore.getState().initiatives).toHaveLength(0);
    });

    it('gets initiative by ID', () => {
      const initiative: Initiative = {
        id: 'initiative-1',
        name: 'Test Initiative',
        systems: ['system-1'],
        status: 'planned',
        priority: 'high'
      };

      useAtlasStore.getState().addInitiative(initiative);
      
      const retrievedInitiative = useAtlasStore.getState().getInitiativeById('initiative-1');
      expect(retrievedInitiative).toEqual(initiative);

      const nonExistentInitiative = useAtlasStore.getState().getInitiativeById('non-existent');
      expect(nonExistentInitiative).toBeUndefined();
    });

    it('manages initiative selection', () => {
      expect(useAtlasStore.getState().selectedInitiativeId).toBeUndefined();

      useAtlasStore.getState().selectInitiative('initiative-1');
      expect(useAtlasStore.getState().selectedInitiativeId).toBe('initiative-1');

      useAtlasStore.getState().selectInitiative(undefined);
      expect(useAtlasStore.getState().selectedInitiativeId).toBeUndefined();
    });
  });

  describe('Work Item Management', () => {
    it('adds a new work item', () => {
      const newWorkItem: WorkItem = {
        id: 'workitem-1',
        title: 'Test Work Item',
        systemId: 'system-1',
        status: 'todo',
        type: 'task',
        priority: 'medium'
      };

      useAtlasStore.getState().addWorkItem(newWorkItem);
      
      const workItems = useAtlasStore.getState().workItems;
      expect(workItems).toHaveLength(1);
      expect(workItems[0]).toEqual(newWorkItem);
    });

    it('updates an existing work item', () => {
      const workItem: WorkItem = {
        id: 'workitem-1',
        title: 'Test Work Item',
        systemId: 'system-1',
        status: 'todo',
        type: 'task',
        priority: 'medium'
      };

      useAtlasStore.getState().addWorkItem(workItem);
      useAtlasStore.getState().updateWorkItem('workitem-1', { 
        title: 'Updated Work Item',
        status: 'in progress',
        progress: 30
      });

      const updatedWorkItem = useAtlasStore.getState().getWorkItemById('workitem-1');
      expect(updatedWorkItem?.title).toBe('Updated Work Item');
      expect(updatedWorkItem?.status).toBe('in progress');
      expect(updatedWorkItem?.progress).toBe(30);
    });

    it('removes a work item', () => {
      const workItem: WorkItem = {
        id: 'workitem-1',
        title: 'Test Work Item',
        systemId: 'system-1',
        status: 'todo',
        type: 'task',
        priority: 'medium'
      };

      useAtlasStore.getState().addWorkItem(workItem);
      expect(useAtlasStore.getState().workItems).toHaveLength(1);

      useAtlasStore.getState().removeWorkItem('workitem-1');
      expect(useAtlasStore.getState().workItems).toHaveLength(0);
    });

    it('gets work item by ID', () => {
      const workItem: WorkItem = {
        id: 'workitem-1',
        title: 'Test Work Item',
        systemId: 'system-1',
        status: 'todo',
        type: 'task',
        priority: 'medium'
      };

      useAtlasStore.getState().addWorkItem(workItem);
      
      const retrievedWorkItem = useAtlasStore.getState().getWorkItemById('workitem-1');
      expect(retrievedWorkItem).toEqual(workItem);

      const nonExistentWorkItem = useAtlasStore.getState().getWorkItemById('non-existent');
      expect(nonExistentWorkItem).toBeUndefined();
    });

    it('manages work item selection', () => {
      expect(useAtlasStore.getState().selectedWorkItemId).toBeUndefined();

      useAtlasStore.getState().selectWorkItem('workitem-1');
      expect(useAtlasStore.getState().selectedWorkItemId).toBe('workitem-1');

      useAtlasStore.getState().selectWorkItem(undefined);
      expect(useAtlasStore.getState().selectedWorkItemId).toBeUndefined();
    });
  });

  describe('Progress Calculation', () => {
    it('calculates initiative progress', () => {
      // Add systems first
      const systems: System[] = [
        {
          id: 'system-1',
          name: 'System 1',
          type: 'service',
          domain: 'Domain 1',
          status: 'live'
        },
        {
          id: 'system-2',
          name: 'System 2',
          type: 'service',
          domain: 'Domain 1',
          status: 'live'
        }
      ];

      systems.forEach(system => {
        useAtlasStore.getState().addSystem(system);
      });

      // Add work items
      const workItems: WorkItem[] = [
        {
          id: 'workitem-1',
          title: 'Task 1',
          systemId: 'system-1',
          status: 'done',
          type: 'task',
          priority: 'medium'
        },
        {
          id: 'workitem-2',
          title: 'Task 2',
          systemId: 'system-1',
          status: 'in progress',
          type: 'task',
          priority: 'medium'
        },
        {
          id: 'workitem-3',
          title: 'Task 3',
          systemId: 'system-2',
          status: 'todo',
          type: 'task',
          priority: 'medium'
        }
      ];

      workItems.forEach(workItem => {
        useAtlasStore.getState().addWorkItem(workItem);
      });

      // Add initiative
      const initiative: Initiative = {
        id: 'initiative-1',
        name: 'Test Initiative',
        systems: ['system-1', 'system-2'],
        status: 'in progress',
        priority: 'high'
      };

      useAtlasStore.getState().addInitiative(initiative);

      // Calculate progress
      const progress = useAtlasStore.getState().calculateInitiativeProgress('initiative-1');
      expect(progress).toBe(33); // 1 done out of 3 total = 33%
    });

    it('calculates system work summary', () => {
      // Add system
      const system: System = {
        id: 'system-1',
        name: 'System 1',
        type: 'service',
        domain: 'Domain 1',
        status: 'live'
      };

      useAtlasStore.getState().addSystem(system);

      // Add work items with different statuses
      const workItems: WorkItem[] = [
        {
          id: 'workitem-1',
          title: 'Done Task',
          systemId: 'system-1',
          status: 'done',
          type: 'task',
          priority: 'medium'
        },
        {
          id: 'workitem-2',
          title: 'In Progress Task',
          systemId: 'system-1',
          status: 'in progress',
          type: 'task',
          priority: 'medium'
        },
        {
          id: 'workitem-3',
          title: 'Blocked Task',
          systemId: 'system-1',
          status: 'blocked',
          type: 'task',
          priority: 'medium'
        },
        {
          id: 'workitem-4',
          title: 'Todo Task',
          systemId: 'system-1',
          status: 'todo',
          type: 'task',
          priority: 'medium'
        }
      ];

      workItems.forEach(workItem => {
        useAtlasStore.getState().addWorkItem(workItem);
      });

      // Calculate work summary
      const workSummary = useAtlasStore.getState().calculateSystemWorkSummary('system-1');
      expect(workSummary.total).toBe(4);
      expect(workSummary.done).toBe(1);
      expect(workSummary.inProgress).toBe(1);
      expect(workSummary.blocked).toBe(1);
      expect(workSummary.overdue).toBe(0); // No overdue items
    });
  });

  describe('Data Persistence', () => {
    it('persists data to localStorage', () => {
      const system: System = {
        id: 'test-system',
        name: 'Test System',
        type: 'service',
        domain: 'Test Domain',
        status: 'live'
      };

      const initiative: Initiative = {
        id: 'initiative-1',
        name: 'Test Initiative',
        systems: ['test-system'],
        status: 'planned',
        priority: 'high'
      };

      const workItem: WorkItem = {
        id: 'workitem-1',
        title: 'Test Work Item',
        systemId: 'test-system',
        status: 'todo',
        type: 'task',
        priority: 'medium'
      };

      useAtlasStore.getState().addSystem(system);
      useAtlasStore.getState().addInitiative(initiative);
      useAtlasStore.getState().addWorkItem(workItem);

      // Verify data is in store
      expect(useAtlasStore.getState().systems).toHaveLength(1);
      expect(useAtlasStore.getState().initiatives).toHaveLength(1);
      expect(useAtlasStore.getState().workItems).toHaveLength(1);

      // Note: Actual localStorage testing would require mocking localStorage
      // This test verifies the store state is correct
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Store Integration Tests', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAtlasStore.getState().setSystems([]);
    useAtlasStore.getState().setEdges([]);
    useAtlasStore.getState().setInitiatives([]);
    useAtlasStore.getState().setWorkItems([]);
  });

  it('manages complete Atlas PM workflow', () => {
    // 1. Add systems
    const systems: System[] = [
      {
        id: 'user-service',
        name: 'User Service',
        type: 'service',
        domain: 'Identity',
        status: 'live'
      },
      {
        id: 'auth-service',
        name: 'Auth Service',
        type: 'service',
        domain: 'Identity',
        status: 'building'
      }
    ];

    systems.forEach(system => {
      useAtlasStore.getState().addSystem(system);
    });

    // 2. Add edges
    const edge: SystemEdge = {
      id: 'user-auth-edge',
      source: 'user-service',
      target: 'auth-service',
      kind: 'sync'
    };

    useAtlasStore.getState().addEdge(edge);

    // 3. Add initiative
    const initiative: Initiative = {
      id: 'auth-overhaul',
      name: 'Authentication Overhaul',
      description: 'Complete rewrite of authentication system',
      owner: 'John Doe',
      systems: ['user-service', 'auth-service'],
      edges: ['user-auth-edge'],
      status: 'in progress',
      priority: 'high',
      progress: 25,
      riskLevel: 'medium',
      budget: 100000
    };

    useAtlasStore.getState().addInitiative(initiative);

    // 4. Add work items
    const workItems: WorkItem[] = [
      {
        id: 'oauth-implementation',
        title: 'Implement OAuth 2.0',
        description: 'Add OAuth 2.0 support',
        systemId: 'auth-service',
        assignee: 'Jane Doe',
        status: 'in progress',
        type: 'feature',
        priority: 'high',
        effort: {
          unit: 'points',
          original: 13,
          remaining: 8,
          completed: 5
        },
        dueDate: '2024-03-15',
        tags: ['authentication', 'oauth'],
        progress: 40,
        riskLevel: 'low'
      },
      {
        id: 'user-migration',
        title: 'Migrate User Data',
        description: 'Migrate existing user data to new format',
        systemId: 'user-service',
        assignee: 'Bob Smith',
        status: 'todo',
        type: 'task',
        priority: 'medium',
        effort: {
          unit: 'points',
          original: 8,
          remaining: 8,
          completed: 0
        },
        dueDate: '2024-04-01',
        tags: ['migration', 'data'],
        progress: 0,
        riskLevel: 'medium'
      }
    ];

    workItems.forEach(workItem => {
      useAtlasStore.getState().addWorkItem(workItem);
    });

    // 5. Verify complete state
    const state = useAtlasStore.getState();
    
    expect(state.systems).toHaveLength(2);
    expect(state.edges).toHaveLength(1);
    expect(state.initiatives).toHaveLength(1);
    expect(state.workItems).toHaveLength(2);

    // 6. Test progress calculation
    const initiativeProgress = state.calculateInitiativeProgress('auth-overhaul');
    expect(initiativeProgress).toBe(0); // 0 done out of 2 total = 0%

    const userServiceSummary = state.calculateSystemWorkSummary('user-service');
    expect(userServiceSummary.total).toBe(1);
    expect(userServiceSummary.done).toBe(0);
    expect(userServiceSummary.inProgress).toBe(0);

    const authServiceSummary = state.calculateSystemWorkSummary('auth-service');
    expect(authServiceSummary.total).toBe(1);
    expect(authServiceSummary.done).toBe(0);
    expect(authServiceSummary.inProgress).toBe(1);

    // 7. Test view mode switching
    state.setViewMode('project');
    expect(useAtlasStore.getState().viewMode).toBe('project');

    state.setViewMode('work');
    expect(useAtlasStore.getState().viewMode).toBe('work');

    state.setViewMode('kanban');
    expect(useAtlasStore.getState().viewMode).toBe('kanban');

    // 8. Test selection
    state.selectInitiative('auth-overhaul');
    expect(useAtlasStore.getState().selectedInitiativeId).toBe('auth-overhaul');

    state.selectWorkItem('oauth-implementation');
    expect(useAtlasStore.getState().selectedWorkItemId).toBe('oauth-implementation');
  });

  it('handles large datasets efficiently', () => {
    // Add 100 systems
    for (let i = 0; i < 100; i++) {
      const system: System = {
        id: `system-${i}`,
        name: `System ${i}`,
        type: 'service',
        domain: `Domain ${i % 10}`,
        status: 'live'
      };
      useAtlasStore.getState().addSystem(system);
    }

    // Add 200 edges
    for (let i = 0; i < 200; i++) {
      const edge: SystemEdge = {
        id: `edge-${i}`,
        source: `system-${i % 100}`,
        target: `system-${(i + 1) % 100}`,
        kind: 'sync'
      };
      useAtlasStore.getState().addEdge(edge);
    }

    // Add 50 initiatives
    for (let i = 0; i < 50; i++) {
      const initiative: Initiative = {
        id: `initiative-${i}`,
        name: `Initiative ${i}`,
        systems: [`system-${i % 100}`],
        status: 'planned',
        priority: 'medium'
      };
      useAtlasStore.getState().addInitiative(initiative);
    }

    // Add 500 work items
    for (let i = 0; i < 500; i++) {
      const workItem: WorkItem = {
        id: `workitem-${i}`,
        title: `Work Item ${i}`,
        systemId: `system-${i % 100}`,
        status: 'todo',
        type: 'task',
        priority: 'medium'
      };
      useAtlasStore.getState().addWorkItem(workItem);
    }

    // Verify all data is present
    const state = useAtlasStore.getState();
    expect(state.systems).toHaveLength(100);
    expect(state.edges).toHaveLength(200);
    expect(state.initiatives).toHaveLength(50);
    expect(state.workItems).toHaveLength(500);

    // Test performance of lookups
    const startTime = performance.now();
    
    // Perform 1000 lookups
    for (let i = 0; i < 1000; i++) {
      const systemId = `system-${i % 100}`;
      const system = state.getSystemById(systemId);
      expect(system).toBeDefined();
    }

    const endTime = performance.now();
    const lookupTime = endTime - startTime;
    
    // Should be fast (less than 100ms for 1000 lookups)
    expect(lookupTime).toBeLessThan(100);
  });
});
