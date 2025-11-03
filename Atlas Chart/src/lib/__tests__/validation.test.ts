import { describe, it, expect } from 'vitest';
import { 
  validateSystem, 
  validateSystemEdge, 
  validateAtlasData,
  validateInitiative,
  validateWorkItem,
  validateMilestone,
  parseCSVValue,
  csvRowToSystem
} from '../validation';
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
// PHASE 1-5: EXISTING ATLAS FUNCTIONALITY TESTS
// ============================================================================

describe('System Validation (Phases 1-5)', () => {
  it('validates a complete system object', () => {
    const validSystem = {
      id: 'test-system',
      name: 'Test System',
      type: 'service',
      domain: 'Test Domain',
      team: 'Test Team',
      owner: 'Test Owner',
      status: 'live',
      description: 'Test description',
      features: ['Feature 1', 'Feature 2'],
      tags: ['tag1', 'tag2'],
      dependencies: [
        {
          targetId: 'other-system',
          kind: 'sync',
          note: 'Test dependency'
        }
      ],
      links: [
        {
          label: 'Documentation',
          url: 'https://example.com/docs',
          kind: 'docs'
        }
      ]
    };

    const result = validateSystem(validSystem);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('test-system');
      expect(result.data.name).toBe('Test System');
      expect(result.data.type).toBe('service');
      expect(result.data.status).toBe('live');
    }
  });

  it('validates system with Phase 6 fields', () => {
    const systemWithPhase6Fields = {
      id: 'test-system',
      name: 'Test System',
      type: 'service',
      domain: 'Test Domain',
      status: 'live',
      // Phase 6 fields
      activeInitiatives: ['initiative-1', 'initiative-2'],
      workSummary: {
        total: 10,
        done: 5,
        inProgress: 3,
        blocked: 2,
        overdue: 1
      }
    };

    const result = validateSystem(systemWithPhase6Fields);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.activeInitiatives).toEqual(['initiative-1', 'initiative-2']);
      expect(result.data.workSummary?.total).toBe(10);
      expect(result.data.workSummary?.done).toBe(5);
    }
  });

  it('rejects system with missing required fields', () => {
    const invalidSystem = {
      name: 'Test System',
      type: 'service',
      // Missing id and domain
      status: 'live'
    };

    const result = validateSystem(invalidSystem);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('id'))).toBe(true);
      expect(result.errors.some(error => error.includes('domain'))).toBe(true);
    }
  });

  it('rejects system with invalid status', () => {
    const invalidSystem = {
      id: 'test-system',
      name: 'Test System',
      type: 'service',
      domain: 'Test Domain',
      status: 'invalid-status'
    };

    const result = validateSystem(invalidSystem);
    expect(result.success).toBe(false);
  });

  it('rejects system with invalid type', () => {
    const invalidSystem = {
      id: 'test-system',
      name: 'Test System',
      type: 'invalid-type',
      domain: 'Test Domain',
      status: 'live'
    };

    const result = validateSystem(invalidSystem);
    expect(result.success).toBe(false);
  });

  it('validates all system types', () => {
    const systemTypes = ['app', 'service', 'datastore', 'queue', 'external'];
    
    systemTypes.forEach(type => {
      const system = {
        id: `test-${type}`,
        name: `Test ${type}`,
        type,
        domain: 'Test Domain',
        status: 'live'
      };

      const result = validateSystem(system);
      expect(result.success).toBe(true);
    });
  });

  it('validates all status types', () => {
    const statuses = ['planned', 'building', 'live', 'risk'];
    
    statuses.forEach(status => {
      const system = {
        id: `test-${status}`,
        name: `Test ${status}`,
        type: 'service',
        domain: 'Test Domain',
        status
      };

      const result = validateSystem(system);
      expect(result.success).toBe(true);
    });
  });
});

describe('SystemEdge Validation (Phases 1-5)', () => {
  it('validates a complete edge object', () => {
    const validEdge = {
      id: 'test-edge',
      source: 'source-system',
      target: 'target-system',
      kind: 'sync',
      note: 'Test connection',
      animated: true
    };

    const result = validateSystemEdge(validEdge);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('test-edge');
      expect(result.data.source).toBe('source-system');
      expect(result.data.target).toBe('target-system');
      expect(result.data.kind).toBe('sync');
    }
  });

  it('validates edge with all connection types', () => {
    const edgeTypes = ['sync', 'async', 'event', 'batch', 'other'];
    
    edgeTypes.forEach(kind => {
      const edge = {
        id: `test-${kind}`,
        source: 'source-system',
        target: 'target-system',
        kind
      };

      const result = validateSystemEdge(edge);
      expect(result.success).toBe(true);
    });
  });

  it('rejects edge with missing required fields', () => {
    const invalidEdge = {
      id: 'test-edge',
      // Missing source and target
      kind: 'sync'
    };

    const result = validateSystemEdge(invalidEdge);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it('rejects edge with invalid kind', () => {
    const invalidEdge = {
      id: 'test-edge',
      source: 'source-system',
      target: 'target-system',
      kind: 'invalid-kind'
    };

    const result = validateSystemEdge(invalidEdge);
    expect(result.success).toBe(false);
  });
});

describe('AtlasData Validation (Phases 1-5)', () => {
  it('validates complete Atlas data', () => {
    const validAtlasData = {
      systems: [
        {
          id: 'system-1',
          name: 'System 1',
          type: 'service',
          domain: 'Domain 1',
          status: 'live'
        }
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'system-1',
          target: 'system-2',
          kind: 'sync'
        }
      ]
    };

    const result = validateAtlasData(validAtlasData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.systems).toHaveLength(1);
      expect(result.data.edges).toHaveLength(1);
    }
  });

  it('validates Atlas data with Phase 6 fields', () => {
    const atlasDataWithPhase6 = {
      systems: [
        {
          id: 'system-1',
          name: 'System 1',
          type: 'service',
          domain: 'Domain 1',
          status: 'live'
        }
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'system-1',
          target: 'system-2',
          kind: 'sync'
        }
      ],
      initiatives: [
        {
          id: 'initiative-1',
          name: 'Test Initiative',
          systems: ['system-1'],
          status: 'in progress',
          priority: 'high'
        }
      ],
      workItems: [
        {
          id: 'workitem-1',
          title: 'Test Work Item',
          systemId: 'system-1',
          status: 'todo',
          type: 'task',
          priority: 'medium'
        }
      ]
    };

    const result = validateAtlasData(atlasDataWithPhase6);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.initiatives).toHaveLength(1);
      expect(result.data.workItems).toHaveLength(1);
    }
  });

  it('validates backward compatibility without Phase 6 fields', () => {
    const legacyAtlasData = {
      systems: [
        {
          id: 'system-1',
          name: 'System 1',
          type: 'service',
          domain: 'Domain 1',
          status: 'live'
        }
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'system-1',
          target: 'system-2',
          kind: 'sync'
        }
      ]
      // No initiatives or workItems - should still be valid
    };

    const result = validateAtlasData(legacyAtlasData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.initiatives).toBeUndefined();
      expect(result.data.workItems).toBeUndefined();
    }
  });
});

describe('CSV Parsing (Phases 1-5)', () => {
  it('parses CSV values correctly', () => {
    // Test JSON parsing
    expect(parseCSVValue('["feature1", "feature2"]')).toEqual(['feature1', 'feature2']);
    
    // Test string parsing
    expect(parseCSVValue('simple string')).toBe('simple string');
    
    // Test empty value
    expect(parseCSVValue('')).toBeUndefined();
    expect(parseCSVValue(undefined)).toBeUndefined();
  });

  it('converts CSV row to system', () => {
    const csvRow = {
      id: 'test-system',
      name: 'Test System',
      type: 'service',
      domain: 'Test Domain',
      status: 'live',
      features: '["Feature 1", "Feature 2"]',
      tags: '["tag1", "tag2"]'
    };

    const system = csvRowToSystem(csvRow);
    expect(system.id).toBe('test-system');
    expect(system.features).toEqual(['Feature 1', 'Feature 2']);
    expect(system.tags).toEqual(['tag1', 'tag2']);
  });
});

// ============================================================================
// PHASE 6: PROJECT MANAGEMENT FUNCTIONALITY TESTS
// ============================================================================

describe('Initiative Validation (Phase 6)', () => {
  it('validates a complete initiative object', () => {
    const validInitiative = {
      id: 'initiative-1',
      name: 'Test Initiative',
      description: 'Test initiative description',
      owner: 'John Doe',
      systems: ['system-1', 'system-2'],
      edges: ['edge-1'],
      startDate: '2024-01-01',
      targetDate: '2024-06-01',
      status: 'in progress',
      priority: 'high',
      progress: 50,
      color: '#1b5fbf',
      riskLevel: 'medium',
      budget: 100000,
      milestones: [
        {
          id: 'milestone-1',
          name: 'Phase 1 Complete',
          date: '2024-03-01',
          description: 'First phase milestone',
          completed: false
        }
      ]
    };

    const result = validateInitiative(validInitiative);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('initiative-1');
      expect(result.data.name).toBe('Test Initiative');
      expect(result.data.systems).toEqual(['system-1', 'system-2']);
      expect(result.data.priority).toBe('high');
      expect(result.data.milestones).toHaveLength(1);
    }
  });

  it('validates minimal initiative object', () => {
    const minimalInitiative = {
      id: 'initiative-minimal',
      name: 'Minimal Initiative',
      systems: ['system-1'],
      status: 'planned',
      priority: 'medium'
    };

    const result = validateInitiative(minimalInitiative);
    expect(result.success).toBe(true);
  });

  it('validates all initiative statuses', () => {
    const statuses = ['planned', 'in progress', 'delayed', 'done'];
    
    statuses.forEach(status => {
      const initiative = {
        id: `initiative-${status}`,
        name: `Test ${status}`,
        systems: ['system-1'],
        status,
        priority: 'medium'
      };

      const result = validateInitiative(initiative);
      expect(result.success).toBe(true);
    });
  });

  it('validates all priority levels', () => {
    const priorities = ['critical', 'high', 'medium', 'low'];
    
    priorities.forEach(priority => {
      const initiative = {
        id: `initiative-${priority}`,
        name: `Test ${priority}`,
        systems: ['system-1'],
        status: 'planned',
        priority
      };

      const result = validateInitiative(initiative);
      expect(result.success).toBe(true);
    });
  });

  it('validates all risk levels', () => {
    const riskLevels = ['low', 'medium', 'high', 'critical'];
    
    riskLevels.forEach(riskLevel => {
      const initiative = {
        id: `initiative-${riskLevel}`,
        name: `Test ${riskLevel}`,
        systems: ['system-1'],
        status: 'planned',
        priority: 'medium',
        riskLevel
      };

      const result = validateInitiative(initiative);
      expect(result.success).toBe(true);
    });
  });

  it('rejects initiative with missing required fields', () => {
    const invalidInitiative = {
      name: 'Test Initiative',
      // Missing id, systems, status, priority
      description: 'Test description'
    };

    const result = validateInitiative(invalidInitiative);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some(error => error.includes('id'))).toBe(true);
      expect(result.errors.some(error => error.includes('systems'))).toBe(true);
      expect(result.errors.some(error => error.includes('status'))).toBe(true);
      expect(result.errors.some(error => error.includes('priority'))).toBe(true);
    }
  });

  it('rejects initiative with empty systems array', () => {
    const invalidInitiative = {
      id: 'initiative-1',
      name: 'Test Initiative',
      systems: [], // Empty array should fail
      status: 'planned',
      priority: 'medium'
    };

    const result = validateInitiative(invalidInitiative);
    expect(result.success).toBe(false);
  });

  it('rejects initiative with invalid status', () => {
    const invalidInitiative = {
      id: 'initiative-1',
      name: 'Test Initiative',
      systems: ['system-1'],
      status: 'invalid-status',
      priority: 'medium'
    };

    const result = validateInitiative(invalidInitiative);
    expect(result.success).toBe(false);
  });

  it('rejects initiative with invalid priority', () => {
    const invalidInitiative = {
      id: 'initiative-1',
      name: 'Test Initiative',
      systems: ['system-1'],
      status: 'planned',
      priority: 'invalid-priority'
    };

    const result = validateInitiative(invalidInitiative);
    expect(result.success).toBe(false);
  });

  it('rejects initiative with invalid progress', () => {
    const invalidInitiative = {
      id: 'initiative-1',
      name: 'Test Initiative',
      systems: ['system-1'],
      status: 'planned',
      priority: 'medium',
      progress: 150 // Invalid: > 100
    };

    const result = validateInitiative(invalidInitiative);
    expect(result.success).toBe(false);
  });

  it('rejects initiative with negative budget', () => {
    const invalidInitiative = {
      id: 'initiative-1',
      name: 'Test Initiative',
      systems: ['system-1'],
      status: 'planned',
      priority: 'medium',
      budget: -1000 // Invalid: negative budget
    };

    const result = validateInitiative(invalidInitiative);
    expect(result.success).toBe(false);
  });
});

describe('WorkItem Validation (Phase 6)', () => {
  it('validates a complete work item object', () => {
    const validWorkItem = {
      id: 'workitem-1',
      title: 'Test Work Item',
      description: 'Test work item description',
      systemId: 'system-1',
      assignee: 'Jane Doe',
      status: 'in progress',
      type: 'task',
      priority: 'high',
      effort: {
        unit: 'points',
        original: 8,
        remaining: 5,
        completed: 3
      },
      blockers: ['Waiting for API', 'Need design approval'],
      dueDate: '2024-03-15',
      externalRef: {
        type: 'jira',
        id: 'JIRA-123',
        url: 'https://jira.example.com/JIRA-123',
        title: 'JIRA Task Title',
        state: 'In Progress'
      },
      tags: ['frontend', 'urgent'],
      progress: 60,
      riskLevel: 'low',
      areaPath: 'Frontend/Components',
      iterationPath: 'Sprint 1',
      parentId: 'epic-1',
      children: ['subtask-1', 'subtask-2']
    };

    const result = validateWorkItem(validWorkItem);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('workitem-1');
      expect(result.data.title).toBe('Test Work Item');
      expect(result.data.systemId).toBe('system-1');
      expect(result.data.type).toBe('task');
      expect(result.data.priority).toBe('high');
      expect(result.data.effort?.unit).toBe('points');
      expect(result.data.externalRef?.type).toBe('jira');
    }
  });

  it('validates minimal work item object', () => {
    const minimalWorkItem = {
      id: 'workitem-minimal',
      title: 'Minimal Work Item',
      systemId: 'system-1',
      status: 'todo',
      type: 'task',
      priority: 'medium'
    };

    const result = validateWorkItem(minimalWorkItem);
    expect(result.success).toBe(true);
  });

  it('validates all work item statuses', () => {
    const statuses = ['todo', 'in progress', 'review', 'done', 'blocked'];
    
    statuses.forEach(status => {
      const workItem = {
        id: `workitem-${status}`,
        title: `Test ${status}`,
        systemId: 'system-1',
        status,
        type: 'task',
        priority: 'medium'
      };

      const result = validateWorkItem(workItem);
      expect(result.success).toBe(true);
    });
  });

  it('validates all work item types', () => {
    const types = ['epic', 'feature', 'user-story', 'task', 'bug', 'test-case'];
    
    types.forEach(type => {
      const workItem = {
        id: `workitem-${type}`,
        title: `Test ${type}`,
        systemId: 'system-1',
        status: 'todo',
        type,
        priority: 'medium'
      };

      const result = validateWorkItem(workItem);
      expect(result.success).toBe(true);
    });
  });

  it('validates all effort units', () => {
    const effortUnits = ['points', 'hours', 'days', 'weeks'];
    
    effortUnits.forEach(unit => {
      const workItem = {
        id: `workitem-${unit}`,
        title: `Test ${unit}`,
        systemId: 'system-1',
        status: 'todo',
        type: 'task',
        priority: 'medium',
        effort: {
          unit,
          original: 5
        }
      };

      const result = validateWorkItem(workItem);
      expect(result.success).toBe(true);
    });
  });

  it('validates all external reference types', () => {
    const externalTypes = ['jira', 'devops', 'linear', 'other'];
    
    externalTypes.forEach(type => {
      const workItem = {
        id: `workitem-${type}`,
        title: `Test ${type}`,
        systemId: 'system-1',
        status: 'todo',
        type: 'task',
        priority: 'medium',
        externalRef: {
          type,
          id: `${type.toUpperCase()}-123`
        }
      };

      const result = validateWorkItem(workItem);
      expect(result.success).toBe(true);
    });
  });

  it('rejects work item with missing required fields', () => {
    const invalidWorkItem = {
      title: 'Test Work Item',
      // Missing id, systemId, status, type, priority
      description: 'Test description'
    };

    const result = validateWorkItem(invalidWorkItem);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some(error => error.includes('id'))).toBe(true);
      expect(result.errors.some(error => error.includes('systemId'))).toBe(true);
      expect(result.errors.some(error => error.includes('status'))).toBe(true);
      expect(result.errors.some(error => error.includes('type'))).toBe(true);
      expect(result.errors.some(error => error.includes('priority'))).toBe(true);
    }
  });

  it('rejects work item with invalid status', () => {
    const invalidWorkItem = {
      id: 'workitem-1',
      title: 'Test Work Item',
      systemId: 'system-1',
      status: 'invalid-status',
      type: 'task',
      priority: 'medium'
    };

    const result = validateWorkItem(invalidWorkItem);
    expect(result.success).toBe(false);
  });

  it('rejects work item with invalid type', () => {
    const invalidWorkItem = {
      id: 'workitem-1',
      title: 'Test Work Item',
      systemId: 'system-1',
      status: 'todo',
      type: 'invalid-type',
      priority: 'medium'
    };

    const result = validateWorkItem(invalidWorkItem);
    expect(result.success).toBe(false);
  });

  it('rejects work item with invalid priority', () => {
    const invalidWorkItem = {
      id: 'workitem-1',
      title: 'Test Work Item',
      systemId: 'system-1',
      status: 'todo',
      type: 'task',
      priority: 'invalid-priority'
    };

    const result = validateWorkItem(invalidWorkItem);
    expect(result.success).toBe(false);
  });

  it('rejects work item with invalid progress', () => {
    const invalidWorkItem = {
      id: 'workitem-1',
      title: 'Test Work Item',
      systemId: 'system-1',
      status: 'todo',
      type: 'task',
      priority: 'medium',
      progress: 150 // Invalid: > 100
    };

    const result = validateWorkItem(invalidWorkItem);
    expect(result.success).toBe(false);
  });

  it('rejects work item with negative effort', () => {
    const invalidWorkItem = {
      id: 'workitem-1',
      title: 'Test Work Item',
      systemId: 'system-1',
      status: 'todo',
      type: 'task',
      priority: 'medium',
      effort: {
        unit: 'points',
        original: -5 // Invalid: negative effort
      }
    };

    const result = validateWorkItem(invalidWorkItem);
    expect(result.success).toBe(false);
  });

  it('rejects work item with invalid external reference', () => {
    const invalidWorkItem = {
      id: 'workitem-1',
      title: 'Test Work Item',
      systemId: 'system-1',
      status: 'todo',
      type: 'task',
      priority: 'medium',
      externalRef: {
        type: 'invalid-type',
        id: 'REF-123'
      }
    };

    const result = validateWorkItem(invalidWorkItem);
    expect(result.success).toBe(false);
  });
});

describe('Milestone Validation (Phase 6)', () => {
  it('validates a complete milestone object', () => {
    const validMilestone = {
      id: 'milestone-1',
      name: 'Phase 1 Complete',
      date: '2024-03-01',
      description: 'First phase milestone',
      completed: false,
      isOverdue: false,
      daysUntil: 30
    };

    const result = validateMilestone(validMilestone);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('milestone-1');
      expect(result.data.name).toBe('Phase 1 Complete');
      expect(result.data.date).toBe('2024-03-01');
      expect(result.data.completed).toBe(false);
    }
  });

  it('validates minimal milestone object', () => {
    const minimalMilestone = {
      id: 'milestone-minimal',
      name: 'Minimal Milestone',
      date: '2024-03-01'
    };

    const result = validateMilestone(minimalMilestone);
    expect(result.success).toBe(true);
  });

  it('rejects milestone with missing required fields', () => {
    const invalidMilestone = {
      name: 'Test Milestone',
      // Missing id and date
      description: 'Test description'
    };

    const result = validateMilestone(invalidMilestone);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some(error => error.includes('id'))).toBe(true);
      expect(result.errors.some(error => error.includes('date'))).toBe(true);
    }
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Data Model Integration Tests', () => {
  it('validates complete Atlas PM data structure', () => {
    const completeAtlasPMData = {
      systems: [
        {
          id: 'system-1',
          name: 'User Service',
          type: 'service',
          domain: 'Identity',
          status: 'live',
          activeInitiatives: ['initiative-1'],
          workSummary: {
            total: 15,
            done: 8,
            inProgress: 4,
            blocked: 2,
            overdue: 1
          }
        }
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'system-1',
          target: 'system-2',
          kind: 'sync'
        }
      ],
      initiatives: [
        {
          id: 'initiative-1',
          name: 'User Authentication Overhaul',
          description: 'Complete rewrite of user authentication',
          owner: 'John Doe',
          systems: ['system-1', 'system-2'],
          status: 'in progress',
          priority: 'high',
          progress: 65,
          riskLevel: 'medium',
          budget: 50000,
          milestones: [
            {
              id: 'milestone-1',
              name: 'Phase 1 Complete',
              date: '2024-03-01',
              completed: true
            }
          ]
        }
      ],
      workItems: [
        {
          id: 'workitem-1',
          title: 'Implement OAuth 2.0',
          description: 'Add OAuth 2.0 support to user service',
          systemId: 'system-1',
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
          externalRef: {
            type: 'jira',
            id: 'JIRA-123',
            url: 'https://jira.example.com/JIRA-123'
          },
          tags: ['authentication', 'oauth'],
          progress: 40,
          riskLevel: 'low',
          areaPath: 'Authentication',
          iterationPath: 'Sprint 1'
        }
      ]
    };

    const result = validateAtlasData(completeAtlasPMData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.systems).toHaveLength(1);
      expect(result.data.edges).toHaveLength(1);
      expect(result.data.initiatives).toHaveLength(1);
      expect(result.data.workItems).toHaveLength(1);
      
      // Verify system has Phase 6 fields
      const system = result.data.systems[0];
      expect(system.activeInitiatives).toEqual(['initiative-1']);
      expect(system.workSummary?.total).toBe(15);
      
      // Verify initiative structure
      const initiative = result.data.initiatives![0];
      expect(initiative.name).toBe('User Authentication Overhaul');
      expect(initiative.priority).toBe('high');
      expect(initiative.milestones).toHaveLength(1);
      
      // Verify work item structure
      const workItem = result.data.workItems![0];
      expect(workItem.title).toBe('Implement OAuth 2.0');
      expect(workItem.type).toBe('feature');
      expect(workItem.effort?.unit).toBe('points');
      expect(workItem.externalRef?.type).toBe('jira');
    }
  });

  it('validates backward compatibility with legacy data', () => {
    const legacyData = {
      systems: [
        {
          id: 'legacy-system',
          name: 'Legacy System',
          type: 'service',
          domain: 'Legacy Domain',
          status: 'live'
        }
      ],
      edges: [
        {
          id: 'legacy-edge',
          source: 'legacy-system',
          target: 'other-system',
          kind: 'sync'
        }
      ]
      // No initiatives or workItems - should still validate
    };

    const result = validateAtlasData(legacyData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.systems).toHaveLength(1);
      expect(result.data.edges).toHaveLength(1);
      expect(result.data.initiatives).toBeUndefined();
      expect(result.data.workItems).toBeUndefined();
    }
  });
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

describe('Edge Case Tests', () => {
  it('handles empty arrays correctly', () => {
    const dataWithEmptyArrays = {
      systems: [],
      edges: [],
      initiatives: [],
      workItems: []
    };

    const result = validateAtlasData(dataWithEmptyArrays);
    expect(result.success).toBe(true);
  });

  it('handles undefined optional fields', () => {
    const systemWithUndefinedFields = {
      id: 'test-system',
      name: 'Test System',
      type: 'service',
      domain: 'Test Domain',
      status: 'live',
      team: undefined,
      owner: undefined,
      description: undefined,
      features: undefined,
      tags: undefined,
      dependencies: undefined,
      planned: undefined,
      actual: undefined,
      links: undefined,
      colorOverride: undefined,
      activeInitiatives: undefined,
      workSummary: undefined
    };

    const result = validateSystem(systemWithUndefinedFields);
    expect(result.success).toBe(true);
  });

  it('handles null values gracefully', () => {
    const systemWithNulls = {
      id: 'test-system',
      name: 'Test System',
      type: 'service',
      domain: 'Test Domain',
      status: 'live',
      team: null,
      owner: null,
      description: null
    };

    const result = validateSystem(systemWithNulls);
    // Note: Zod by default doesn't accept null values for optional fields
    // This test documents the current behavior - null values are not accepted
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it('validates large datasets', () => {
    const largeDataset = {
      systems: Array.from({ length: 100 }, (_, i) => ({
        id: `system-${i}`,
        name: `System ${i}`,
        type: 'service',
        domain: `Domain ${i % 10}`,
        status: 'live'
      })),
      edges: Array.from({ length: 200 }, (_, i) => ({
        id: `edge-${i}`,
        source: `system-${i % 100}`,
        target: `system-${(i + 1) % 100}`,
        kind: 'sync'
      })),
      initiatives: Array.from({ length: 50 }, (_, i) => ({
        id: `initiative-${i}`,
        name: `Initiative ${i}`,
        systems: [`system-${i % 100}`],
        status: 'planned',
        priority: 'medium'
      })),
      workItems: Array.from({ length: 500 }, (_, i) => ({
        id: `workitem-${i}`,
        title: `Work Item ${i}`,
        systemId: `system-${i % 100}`,
        status: 'todo',
        type: 'task',
        priority: 'medium'
      }))
    };

    const result = validateAtlasData(largeDataset);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.systems).toHaveLength(100);
      expect(result.data.edges).toHaveLength(200);
      expect(result.data.initiatives).toHaveLength(50);
      expect(result.data.workItems).toHaveLength(500);
    }
  });
});
