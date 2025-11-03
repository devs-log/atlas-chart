/**
 * WORLD-CLASS TESTING UTILITIES
 * Following patterns from companies like Stripe, GitHub, Netflix, Google
 */

import { vi, expect } from 'vitest';
import type { 
  System, 
  SystemEdge, 
  Initiative, 
  WorkItem,
  Milestone,
  ExternalRef,
  EffortEstimation,
  WorkSummary
} from '../types';

// ============================================================================
// TEST DATA FACTORIES (Factory Pattern)
// ============================================================================

/**
 * Test Data Factory following the Factory Pattern
 * Used by companies like Stripe, GitHub, Shopify
 */
export class TestDataFactory {
  private static idCounter = 0;
  
  private static generateId(prefix: string): string {
    return `${prefix}-${++this.idCounter}-${Date.now()}`;
  }

  /**
   * Create a system with realistic data
   */
  static createSystem(overrides: Partial<System> = {}): System {
    const id = overrides.id || this.generateId('system');
    return {
      id,
      name: overrides.name || `System ${id}`,
      type: overrides.type || 'service',
      domain: overrides.domain || 'Test Domain',
      status: overrides.status || 'live',
      team: overrides.team || 'Test Team',
      owner: overrides.owner || 'Test Owner',
      description: overrides.description || `Description for ${id}`,
      features: overrides.features || ['Feature 1', 'Feature 2'],
      tags: overrides.tags || ['tag1', 'tag2'],
      dependencies: overrides.dependencies || [],
      planned: overrides.planned || undefined,
      actual: overrides.actual || undefined,
      links: overrides.links || [],
      colorOverride: overrides.colorOverride || undefined,
      activeInitiatives: overrides.activeInitiatives || [],
      workSummary: overrides.workSummary || undefined,
      ...overrides
    };
  }

  /**
   * Create an initiative with realistic data
   */
  static createInitiative(overrides: Partial<Initiative> = {}): Initiative {
    const id = overrides.id || this.generateId('initiative');
    return {
      id,
      name: overrides.name || `Initiative ${id}`,
      description: overrides.description || `Description for ${id}`,
      owner: overrides.owner || 'Test Owner',
      systems: overrides.systems || [this.generateId('system')],
      edges: overrides.edges || [],
      startDate: overrides.startDate || '2024-01-01',
      targetDate: overrides.targetDate || '2024-06-01',
      status: overrides.status || 'planned',
      priority: overrides.priority || 'medium',
      progress: overrides.progress || 0,
      color: overrides.color || '#1b5fbf',
      milestones: overrides.milestones || [],
      riskLevel: overrides.riskLevel || 'low',
      budget: overrides.budget || 100000,
      isOverdue: overrides.isOverdue || false,
      daysRemaining: overrides.daysRemaining || 30,
      completionRate: overrides.completionRate || 0,
      blockedCount: overrides.blockedCount || 0,
      ...overrides
    };
  }

  /**
   * Create a work item with realistic data
   */
  static createWorkItem(overrides: Partial<WorkItem> = {}): WorkItem {
    const id = overrides.id || this.generateId('workitem');
    return {
      id,
      title: overrides.title || `Work Item ${id}`,
      description: overrides.description || `Description for ${id}`,
      systemId: overrides.systemId || this.generateId('system'),
      assignee: overrides.assignee || 'Test Assignee',
      status: overrides.status || 'todo',
      type: overrides.type || 'task',
      priority: overrides.priority || 'medium',
      effort: overrides.effort || {
        unit: 'points',
        original: 8,
        remaining: 8,
        completed: 0
      },
      blockers: overrides.blockers || [],
      dueDate: overrides.dueDate || '2024-03-15',
      externalRef: overrides.externalRef || undefined,
      tags: overrides.tags || ['tag1'],
      progress: overrides.progress || 0,
      riskLevel: overrides.riskLevel || 'low',
      areaPath: overrides.areaPath || 'Test Area',
      iterationPath: overrides.iterationPath || 'Sprint 1',
      parentId: overrides.parentId || undefined,
      children: overrides.children || [],
      isOverdue: overrides.isOverdue || false,
      daysRemaining: overrides.daysRemaining || 30,
      isBlocked: overrides.isBlocked || false,
      hasChildren: overrides.hasChildren || false,
      effortRemaining: overrides.effortRemaining || 8,
      ...overrides
    };
  }

  /**
   * Create a system edge with realistic data
   */
  static createSystemEdge(overrides: Partial<SystemEdge> = {}): SystemEdge {
    const id = overrides.id || this.generateId('edge');
    return {
      id,
      source: overrides.source || this.generateId('system'),
      target: overrides.target || this.generateId('system'),
      kind: overrides.kind || 'sync',
      note: overrides.note || `Connection between systems`,
      animated: overrides.animated || false,
      ...overrides
    };
  }

  /**
   * Create a milestone with realistic data
   */
  static createMilestone(overrides: Partial<Milestone> = {}): Milestone {
    const id = overrides.id || this.generateId('milestone');
    return {
      id,
      name: overrides.name || `Milestone ${id}`,
      date: overrides.date || '2024-03-01',
      description: overrides.description || `Description for ${id}`,
      completed: overrides.completed || false,
      isOverdue: overrides.isOverdue || false,
      daysUntil: overrides.daysUntil || 30,
      ...overrides
    };
  }

  /**
   * Create multiple objects with variations
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

  /**
   * Create a realistic dataset with proper relationships
   */
  static createRealisticDataset() {
    const systems = [
      this.createSystem({ id: 'user-service', name: 'User Service', domain: 'Identity' }),
      this.createSystem({ id: 'auth-service', name: 'Auth Service', domain: 'Identity' }),
      this.createSystem({ id: 'payment-service', name: 'Payment Service', domain: 'Finance' }),
      this.createSystem({ id: 'notification-service', name: 'Notification Service', domain: 'Communication' })
    ];

    const edges = [
      this.createSystemEdge({ id: 'user-auth', source: 'user-service', target: 'auth-service' }),
      this.createSystemEdge({ id: 'user-payment', source: 'user-service', target: 'payment-service' }),
      this.createSystemEdge({ id: 'auth-notification', source: 'auth-service', target: 'notification-service' })
    ];

    const initiative = this.createInitiative({
      id: 'identity-overhaul',
      name: 'Identity System Overhaul',
      systems: ['user-service', 'auth-service'],
      edges: ['user-auth']
    });

    const workItems = [
      this.createWorkItem({
        id: 'oauth-implementation',
        systemId: 'auth-service',
        title: 'Implement OAuth 2.0',
        status: 'in progress',
        priority: 'high',
        effort: { unit: 'points', original: 13, remaining: 8, completed: 5 }
      }),
      this.createWorkItem({
        id: 'user-migration',
        systemId: 'user-service',
        title: 'Migrate User Data',
        status: 'todo',
        priority: 'medium',
        effort: { unit: 'points', original: 8, remaining: 8, completed: 0 }
      }),
      this.createWorkItem({
        id: 'testing-task',
        systemId: 'auth-service',
        title: 'Write Integration Tests',
        status: 'review',
        priority: 'low',
        effort: { unit: 'points', original: 5, remaining: 0, completed: 5 }
      })
    ];

    return { systems, edges, initiative, workItems };
  }
}

// ============================================================================
// CUSTOM MATCHERS (Jest-style custom matchers)
// ============================================================================

/**
 * Custom matchers for more expressive assertions
 * Following Jest's custom matcher pattern
 */
export const customMatchers = {
  toBeValidSystem(received: any) {
    const pass = received && 
      typeof received.id === 'string' &&
      typeof received.name === 'string' &&
      typeof received.type === 'string' &&
      typeof received.domain === 'string' &&
      typeof received.status === 'string' &&
      received.id.length > 0 &&
      received.name.length > 0;
    
    return {
      pass,
      message: () => pass 
        ? `Expected ${JSON.stringify(received)} not to be a valid system`
        : `Expected ${JSON.stringify(received)} to be a valid system`
    };
  },

  toHaveValidProgress(received: any) {
    const pass = typeof received === 'number' && 
      received >= 0 && 
      received <= 100 &&
      !isNaN(received);
    
    return {
      pass,
      message: () => pass 
        ? `Expected ${received} not to have valid progress (0-100)`
        : `Expected ${received} to have valid progress (0-100)`
    };
  },

  toBeValidInitiative(received: any) {
    const pass = received &&
      typeof received.id === 'string' &&
      typeof received.name === 'string' &&
      Array.isArray(received.systems) &&
      received.systems.length > 0 &&
      typeof received.status === 'string' &&
      typeof received.priority === 'string';
    
    return {
      pass,
      message: () => pass 
        ? `Expected ${JSON.stringify(received)} not to be a valid initiative`
        : `Expected ${JSON.stringify(received)} to be a valid initiative`
    };
  },

  toBeValidWorkItem(received: any) {
    const pass = received &&
      typeof received.id === 'string' &&
      typeof received.title === 'string' &&
      typeof received.systemId === 'string' &&
      typeof received.status === 'string' &&
      typeof received.type === 'string' &&
      typeof received.priority === 'string';
    
    return {
      pass,
      message: () => pass 
        ? `Expected ${JSON.stringify(received)} not to be a valid work item`
        : `Expected ${JSON.stringify(received)} to be a valid work item`
    };
  }
};

// ============================================================================
// PERFORMANCE TESTING UTILITIES
// ============================================================================

/**
 * Performance testing utilities
 * Following Google's performance testing patterns
 */
export class PerformanceUtils {
  /**
   * Measure execution time of a function
   */
  static measureExecutionTime<T>(fn: () => T): { result: T; duration: number } {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    return { result, duration: endTime - startTime };
  }

  /**
   * Measure memory usage
   */
  static measureMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Benchmark multiple functions
   */
  static benchmark(functions: Array<{ name: string; fn: () => any }>): Array<{ name: string; duration: number }> {
    return functions.map(({ name, fn }) => {
      const { duration } = this.measureExecutionTime(fn);
      return { name, duration };
    });
  }

  /**
   * Stress test with increasing load
   */
  static stressTest<T>(
    operation: (load: number) => T,
    maxLoad: number = 1000,
    step: number = 100
  ): Array<{ load: number; duration: number }> {
    const results: Array<{ load: number; duration: number }> = [];
    
    for (let load = step; load <= maxLoad; load += step) {
      const { duration } = this.measureExecutionTime(() => operation(load));
      results.push({ load, duration });
    }
    
    return results;
  }
}

// ============================================================================
// MOCKING UTILITIES
// ============================================================================

/**
 * Advanced mocking utilities
 * Following patterns from companies like Stripe, GitHub
 */
export class MockUtils {
  /**
   * Create a mock store with realistic data
   */
  static createMockStore() {
    const mockStore = {
      systems: TestDataFactory.createMultiple(() => TestDataFactory.createSystem(), 5),
      edges: TestDataFactory.createMultiple(() => TestDataFactory.createSystemEdge(), 3),
      initiatives: TestDataFactory.createMultiple(() => TestDataFactory.createInitiative(), 2),
      workItems: TestDataFactory.createMultiple(() => TestDataFactory.createWorkItem(), 10),
      viewMode: 'architecture' as const,
      selectedNodeId: undefined,
      selectedInitiativeId: undefined,
      selectedWorkItemId: undefined,
      
      // Mock methods
      addSystem: vi.fn(),
      updateSystem: vi.fn(),
      removeSystem: vi.fn(),
      addEdge: vi.fn(),
      updateEdge: vi.fn(),
      removeEdge: vi.fn(),
      addInitiative: vi.fn(),
      updateInitiative: vi.fn(),
      removeInitiative: vi.fn(),
      addWorkItem: vi.fn(),
      updateWorkItem: vi.fn(),
      removeWorkItem: vi.fn(),
      setViewMode: vi.fn(),
      selectInitiative: vi.fn(),
      selectWorkItem: vi.fn(),
      calculateInitiativeProgress: vi.fn(),
      calculateSystemWorkSummary: vi.fn()
    };
    
    return mockStore;
  }

  /**
   * Create a mock localStorage
   */
  static createMockLocalStorage() {
    const store: Record<string, string> = {};
    
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
      clear: vi.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
      length: Object.keys(store).length
    };
  }

  /**
   * Create a mock fetch response
   */
  static createMockFetchResponse(data: any, status: number = 200) {
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: vi.fn().mockResolvedValue(data),
      text: vi.fn().mockResolvedValue(JSON.stringify(data)),
      headers: new Headers()
    };
  }
}

// ============================================================================
// TEST HELPERS
// ============================================================================

/**
 * General test helpers
 */
export class TestHelpers {
  /**
   * Wait for a condition to be true
   */
  static async waitFor(
    condition: () => boolean, 
    timeout: number = 1000, 
    interval: number = 10
  ): Promise<void> {
    const startTime = Date.now();
    
    while (!condition() && Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    if (!condition()) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }
  }

  /**
   * Create a test user event
   */
  static createTestUser() {
    return {
      name: 'Test User',
      email: 'test@example.com',
      id: 'test-user-id',
      role: 'admin'
    };
  }

  /**
   * Generate test data with specific patterns
   */
  static generateTestData<T>(
    generator: (index: number) => T,
    count: number
  ): T[] {
    return Array.from({ length: count }, (_, index) => generator(index));
  }

  /**
   * Create a test environment
   */
  static createTestEnvironment() {
    return {
      NODE_ENV: 'test',
      VITEST: 'true',
      TEST_TIMEOUT: '10000',
      TEST_RETRIES: '2'
    };
  }
}

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Custom assertion helpers
 */
export class AssertionHelpers {
  /**
   * Assert that a value is within a range
   */
  static assertInRange(value: number, min: number, max: number, message?: string) {
    expect(value).toBeGreaterThanOrEqual(min);
    expect(value).toBeLessThanOrEqual(max);
  }

  /**
   * Assert that an array contains unique items
   */
  static assertUnique<T>(array: T[], keySelector?: (item: T) => any) {
    const items = keySelector ? array.map(keySelector) : array;
    const uniqueItems = new Set(items);
    expect(uniqueItems.size).toBe(array.length);
  }

  /**
   * Assert that two objects have the same structure
   */
  static assertSameStructure(obj1: any, obj2: any) {
    const keys1 = Object.keys(obj1).sort();
    const keys2 = Object.keys(obj2).sort();
    expect(keys1).toEqual(keys2);
  }

  /**
   * Assert that a function throws with a specific message
   */
  static assertThrowsWithMessage(
    fn: () => void, 
    expectedMessage: string | RegExp
  ) {
    expect(() => fn()).toThrow(expectedMessage);
  }
}

// ============================================================================
// EXPORT ALL UTILITIES
// ============================================================================

export {
  TestDataFactory as Factory,
  PerformanceUtils as Perf,
  MockUtils as Mock,
  TestHelpers as Helpers,
  AssertionHelpers as Assert
};




