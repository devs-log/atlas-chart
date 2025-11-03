import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAtlasStore } from '../useAtlasStore';
import type { 
  System, 
  SystemEdge, 
  Initiative, 
  WorkItem,
  ViewMode
} from '../../lib/types';

// ============================================================================
// WORLD-CLASS TESTING PATTERNS & UTILITIES
// ============================================================================

/**
 * Test data factories following the Factory Pattern
 * This is a best practice used by companies like Stripe, GitHub, etc.
 */
class TestDataFactory {
  static createSystem(overrides: Partial<System> = {}): System {
    return {
      id: 'test-system',
      name: 'Test System',
      type: 'service',
      domain: 'Test Domain',
      status: 'live',
      ...overrides
    };
  }

  static createInitiative(overrides: Partial<Initiative> = {}): Initiative {
    return {
      id: 'test-initiative',
      name: 'Test Initiative',
      systems: ['test-system'],
      status: 'planned',
      priority: 'medium',
      ...overrides
    };
  }

  static createWorkItem(overrides: Partial<WorkItem> = {}): WorkItem {
    return {
      id: 'test-workitem',
      title: 'Test Work Item',
      systemId: 'test-system',
      status: 'todo',
      type: 'task',
      priority: 'medium',
      ...overrides
    };
  }

  static createSystemEdge(overrides: Partial<SystemEdge> = {}): SystemEdge {
    return {
      id: 'test-edge',
      source: 'source-system',
      target: 'target-system',
      kind: 'sync',
      ...overrides
    };
  }

  /**
   * Creates multiple test objects with variations
   * Useful for testing different scenarios
   */
  static createMultiple<T>(
    factory: () => T, 
    count: number, 
    variations: Partial<T>[] = []
  ): T[] {
    return Array.from({ length: count }, (_, index) => {
      const base = factory();
      const variation = variations[index % variations.length] || {};
      return { ...base, ...variation };
    });
  }
}

/**
 * Custom matchers for more expressive assertions
 * Following Jest's custom matcher pattern
 */
expect.extend({
  toBeValidSystem(received: any) {
    const pass = received && 
      typeof received.id === 'string' &&
      typeof received.name === 'string' &&
      typeof received.type === 'string' &&
      typeof received.domain === 'string' &&
      typeof received.status === 'string';
    
    return {
      pass,
      message: () => pass 
        ? `Expected ${received} not to be a valid system`
        : `Expected ${received} to be a valid system`
    };
  },

  toHaveValidProgress(received: any) {
    const pass = typeof received === 'number' && 
      received >= 0 && 
      received <= 100;
    
    return {
      pass,
      message: () => pass 
        ? `Expected ${received} not to have valid progress (0-100)`
        : `Expected ${received} to have valid progress (0-100)`
    };
  }
});

// ============================================================================
// ENHANCED STORE TESTS WITH WORLD-CLASS PATTERNS
// ============================================================================

describe('Atlas Store - Enhanced Testing Patterns', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    // Reset store state before each test
    useAtlasStore.getState().setSystems([]);
    useAtlasStore.getState().setEdges([]);
    useAtlasStore.getState().setInitiatives([]);
    useAtlasStore.getState().setWorkItems([]);
    useAtlasStore.getState().setViewMode('architecture');
    
    // Setup user event for interaction testing
    user = userEvent.setup();
  });

  afterEach(() => {
    // Cleanup after each test
    vi.clearAllMocks();
  });

  describe('Store State Management - AAA Pattern', () => {
    it('should add system following AAA pattern', () => {
      // ARRANGE
      const newSystem = TestDataFactory.createSystem({
        id: 'auth-service',
        name: 'Authentication Service',
        type: 'service',
        domain: 'Identity'
      });

      // ACT
      useAtlasStore.getState().addSystem(newSystem);

      // ASSERT
      const systems = useAtlasStore.getState().systems;
      expect(systems).toHaveLength(1);
      expect(systems[0]).toBeValidSystem();
      expect(systems[0].name).toBe('Authentication Service');
    });

    it('should handle concurrent system additions', async () => {
      // ARRANGE
      const systems = TestDataFactory.createMultiple(
        () => TestDataFactory.createSystem(),
        10,
        Array.from({ length: 10 }, (_, i) => ({ id: `system-${i}` }))
      );

      // ACT - Simulate concurrent additions
      const promises = systems.map(system => 
        Promise.resolve(useAtlasStore.getState().addSystem(system))
      );
      await Promise.all(promises);

      // ASSERT
      const storeSystems = useAtlasStore.getState().systems;
      expect(storeSystems).toHaveLength(10);
      storeSystems.forEach(system => {
        expect(system).toBeValidSystem();
      });
    });
  });

  describe('Business Logic Testing - Domain-Driven Design', () => {
    it('should calculate initiative progress correctly', () => {
      // ARRANGE - Setup realistic business scenario
      const systems = [
        TestDataFactory.createSystem({ id: 'user-service' }),
        TestDataFactory.createSystem({ id: 'auth-service' })
      ];
      
      const initiative = TestDataFactory.createInitiative({
        id: 'auth-overhaul',
        name: 'Authentication Overhaul',
        systems: ['user-service', 'auth-service']
      });

      const workItems = [
        TestDataFactory.createWorkItem({
          id: 'oauth-task',
          systemId: 'auth-service',
          status: 'done',
          title: 'Implement OAuth 2.0'
        }),
        TestDataFactory.createWorkItem({
          id: 'migration-task',
          systemId: 'user-service',
          status: 'in progress',
          title: 'Migrate User Data'
        }),
        TestDataFactory.createWorkItem({
          id: 'testing-task',
          systemId: 'auth-service',
          status: 'todo',
          title: 'Write Tests'
        })
      ];

      // Setup store
      systems.forEach(system => useAtlasStore.getState().addSystem(system));
      useAtlasStore.getState().addInitiative(initiative);
      workItems.forEach(workItem => useAtlasStore.getState().addWorkItem(workItem));

      // ACT
      const progress = useAtlasStore.getState().calculateInitiativeProgress('auth-overhaul');

      // ASSERT
      expect(progress).toBe(33); // 1 done out of 3 total
      expect(progress).toHaveValidProgress();
    });

    it('should handle work item status transitions', () => {
      // ARRANGE
      const workItem = TestDataFactory.createWorkItem({
        id: 'feature-task',
        status: 'todo',
        title: 'New Feature Implementation'
      });

      useAtlasStore.getState().addWorkItem(workItem);

      // ACT & ASSERT - Test state machine transitions
      const validTransitions = [
        { from: 'todo', to: 'in progress' },
        { from: 'in progress', to: 'review' },
        { from: 'review', to: 'done' },
        { from: 'in progress', to: 'blocked' },
        { from: 'blocked', to: 'in progress' }
      ];

      validTransitions.forEach(({ from, to }) => {
        // Reset to initial state
        useAtlasStore.getState().updateWorkItem('feature-task', { status: from });
        
        // Transition to new state
        useAtlasStore.getState().updateWorkItem('feature-task', { status: to });
        
        const updatedItem = useAtlasStore.getState().getWorkItemById('feature-task');
        expect(updatedItem?.status).toBe(to);
      });
    });
  });

  describe('Performance Testing - Load Testing Patterns', () => {
    it('should handle large dataset operations efficiently', () => {
      // ARRANGE - Create large dataset
      const largeSystems = TestDataFactory.createMultiple(
        () => TestDataFactory.createSystem(),
        1000,
        Array.from({ length: 1000 }, (_, i) => ({ id: `system-${i}` }))
      );

      const largeWorkItems = TestDataFactory.createMultiple(
        () => TestDataFactory.createWorkItem(),
        5000,
        Array.from({ length: 5000 }, (_, i) => ({ 
          id: `workitem-${i}`,
          systemId: `system-${i % 1000}`
        }))
      );

      // ACT - Measure performance
      const startTime = performance.now();
      
      largeSystems.forEach(system => useAtlasStore.getState().addSystem(system));
      largeWorkItems.forEach(workItem => useAtlasStore.getState().addWorkItem(workItem));
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // ASSERT
      expect(executionTime).toBeLessThan(100); // Should complete in <100ms
      expect(useAtlasStore.getState().systems).toHaveLength(1000);
      expect(useAtlasStore.getState().workItems).toHaveLength(5000);
    });

    it('should maintain performance during frequent updates', () => {
      // ARRANGE
      const workItem = TestDataFactory.createWorkItem({ id: 'performance-test' });
      useAtlasStore.getState().addWorkItem(workItem);

      // ACT - Simulate rapid updates
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        useAtlasStore.getState().updateWorkItem('performance-test', {
          progress: i % 100,
          status: ['todo', 'in progress', 'review', 'done'][i % 4] as any
        });
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // ASSERT
      expect(executionTime).toBeLessThan(50); // Should complete in <50ms
    });
  });

  describe('Error Handling & Edge Cases - Robustness Testing', () => {
    it('should handle malformed data gracefully', () => {
      // ARRANGE - Malformed data scenarios
      const malformedData = [
        { id: '', name: 'Empty ID' }, // Empty ID
        { id: 'valid-id', name: '', type: 'service' }, // Empty name
        { id: 'valid-id', name: 'Valid Name', type: 'invalid-type' }, // Invalid type
        { id: 'valid-id', name: 'Valid Name', type: 'service', domain: '' }, // Empty domain
        { id: 'valid-id', name: 'Valid Name', type: 'service', domain: 'Domain', status: 'invalid-status' } // Invalid status
      ];

      // ACT & ASSERT
      malformedData.forEach((data, index) => {
        expect(() => {
          useAtlasStore.getState().addSystem(data as any);
        }).toThrow(); // Should throw validation error
      });
    });

    it('should handle concurrent modifications safely', async () => {
      // ARRANGE
      const system = TestDataFactory.createSystem({ id: 'concurrent-test' });
      useAtlasStore.getState().addSystem(system);

      // ACT - Simulate concurrent modifications
      const promises = Array.from({ length: 10 }, (_, i) => 
        Promise.resolve(
          useAtlasStore.getState().updateSystem('concurrent-test', {
            name: `Updated Name ${i}`,
            status: ['live', 'building', 'planned'][i % 3] as any
          })
        )
      );

      await Promise.all(promises);

      // ASSERT - Should not crash and maintain data integrity
      const updatedSystem = useAtlasStore.getState().getSystemById('concurrent-test');
      expect(updatedSystem).toBeDefined();
      expect(updatedSystem?.name).toMatch(/Updated Name \d+/);
    });
  });

  describe('Integration Testing - End-to-End Scenarios', () => {
    it('should handle complete Atlas PM workflow', () => {
      // ARRANGE - Complete business scenario
      const systems = [
        TestDataFactory.createSystem({ id: 'frontend', name: 'Frontend App', domain: 'UI' }),
        TestDataFactory.createSystem({ id: 'backend', name: 'Backend API', domain: 'API' }),
        TestDataFactory.createSystem({ id: 'database', name: 'Database', domain: 'Data' })
      ];

      const edges = [
        TestDataFactory.createSystemEdge({ id: 'fe-be', source: 'frontend', target: 'backend' }),
        TestDataFactory.createSystemEdge({ id: 'be-db', source: 'backend', target: 'database' })
      ];

      const initiative = TestDataFactory.createInitiative({
        id: 'full-stack-feature',
        name: 'Full Stack Feature',
        systems: ['frontend', 'backend', 'database'],
        edges: ['fe-be', 'be-db']
      });

      const workItems = [
        TestDataFactory.createWorkItem({
          id: 'ui-task',
          systemId: 'frontend',
          title: 'Design UI Components',
          status: 'done'
        }),
        TestDataFactory.createWorkItem({
          id: 'api-task',
          systemId: 'backend',
          title: 'Implement API Endpoints',
          status: 'in progress'
        }),
        TestDataFactory.createWorkItem({
          id: 'db-task',
          systemId: 'database',
          title: 'Design Database Schema',
          status: 'todo'
        })
      ];

      // ACT - Execute complete workflow
      systems.forEach(system => useAtlasStore.getState().addSystem(system));
      edges.forEach(edge => useAtlasStore.getState().addEdge(edge));
      useAtlasStore.getState().addInitiative(initiative);
      workItems.forEach(workItem => useAtlasStore.getState().addWorkItem(workItem));

      // Switch to project view
      useAtlasStore.getState().setViewMode('project');
      useAtlasStore.getState().selectInitiative('full-stack-feature');

      // Update work item status
      useAtlasStore.getState().updateWorkItem('api-task', { status: 'done' });

      // ASSERT - Verify complete state
      const state = useAtlasStore.getState();
      expect(state.viewMode).toBe('project');
      expect(state.selectedInitiativeId).toBe('full-stack-feature');
      expect(state.systems).toHaveLength(3);
      expect(state.edges).toHaveLength(2);
      expect(state.initiatives).toHaveLength(1);
      expect(state.workItems).toHaveLength(3);

      // Verify progress calculation
      const progress = state.calculateInitiativeProgress('full-stack-feature');
      expect(progress).toBe(67); // 2 done out of 3 total
    });
  });

  describe('Mocking & Isolation Testing', () => {
    it('should isolate store operations from external dependencies', () => {
      // ARRANGE - Mock external dependencies
      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      };

      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      });

      // ACT
      const system = TestDataFactory.createSystem();
      useAtlasStore.getState().addSystem(system);

      // ASSERT - Verify store operation without external side effects
      expect(useAtlasStore.getState().systems).toHaveLength(1);
      expect(mockLocalStorage.setItem).toHaveBeenCalled(); // Verify persistence
    });
  });
});

// ============================================================================
// COMPONENT TESTING PATTERNS (for when we add UI tests)
// ============================================================================

describe('Component Testing Patterns - Future UI Tests', () => {
  // These are patterns we'll use when testing React components
  
  it('should follow user-centric testing approach', async () => {
    // ARRANGE - Setup user-centric test data
    const user = userEvent.setup();
    
    // This would be used for testing components like:
    // - SystemNode component
    // - InitiativePanel component  
    // - WorkItemCard component
    
    // ACT - Simulate user interactions
    // await user.click(screen.getByRole('button', { name: /add system/i }));
    // await user.type(screen.getByLabelText(/system name/i), 'New System');
    // await user.click(screen.getByRole('button', { name: /save/i }));
    
    // ASSERT - Verify user-visible outcomes
    // expect(screen.getByText('New System')).toBeInTheDocument();
  });

  it('should test accessibility requirements', () => {
    // ARRANGE - Setup accessible component
    
    // ACT - Render component
    
    // ASSERT - Verify accessibility
    // expect(screen.getByRole('button')).toHaveAccessibleName();
    // expect(screen.getByRole('textbox')).toHaveAccessibleDescription();
  });
});

// ============================================================================
// TEST UTILITIES & HELPERS
// ============================================================================

/**
 * Custom test utilities following industry best practices
 */
export class TestUtils {
  /**
   * Wait for store state to update
   */
  static async waitForStoreUpdate(condition: () => boolean, timeout = 1000) {
    const startTime = Date.now();
    while (!condition() && Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    expect(condition()).toBe(true);
  }

  /**
   * Create test data with realistic relationships
   */
  static createRealisticDataset() {
    const systems = [
      TestDataFactory.createSystem({ id: 'user-service', name: 'User Service', domain: 'Identity' }),
      TestDataFactory.createSystem({ id: 'auth-service', name: 'Auth Service', domain: 'Identity' }),
      TestDataFactory.createSystem({ id: 'payment-service', name: 'Payment Service', domain: 'Finance' })
    ];

    const edges = [
      TestDataFactory.createSystemEdge({ id: 'user-auth', source: 'user-service', target: 'auth-service' }),
      TestDataFactory.createSystemEdge({ id: 'user-payment', source: 'user-service', target: 'payment-service' })
    ];

    const initiative = TestDataFactory.createInitiative({
      id: 'identity-overhaul',
      name: 'Identity System Overhaul',
      systems: ['user-service', 'auth-service']
    });

    const workItems = [
      TestDataFactory.createWorkItem({
        id: 'oauth-implementation',
        systemId: 'auth-service',
        title: 'Implement OAuth 2.0',
        status: 'in progress',
        priority: 'high'
      }),
      TestDataFactory.createWorkItem({
        id: 'user-migration',
        systemId: 'user-service',
        title: 'Migrate User Data',
        status: 'todo',
        priority: 'medium'
      })
    ];

    return { systems, edges, initiative, workItems };
  }

  /**
   * Performance testing helper
   */
  static measurePerformance<T>(fn: () => T): { result: T; duration: number } {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    return { result, duration: endTime - startTime };
  }
}




