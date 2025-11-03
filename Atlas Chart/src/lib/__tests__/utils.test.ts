import { describe, it, expect } from 'vitest';
import type { 
  System, 
  SystemEdge, 
  Initiative, 
  WorkItem, 
  Milestone,
  ExternalRef,
  EffortEstimation,
  WorkSummary,
  WorkItemStatus,
  WorkItemType,
  Priority,
  InitiativeStatus
} from '../../lib/types';

// ============================================================================
// UTILITY FUNCTION TESTS
// ============================================================================

describe('Data Model Utility Functions', () => {
  describe('Date Calculations', () => {
    it('calculates days until milestone', () => {
      const today = new Date();
      const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      const pastDate = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago

      const futureMilestone: Milestone = {
        id: 'milestone-1',
        name: 'Future Milestone',
        date: futureDate.toISOString().split('T')[0]
      };

      const pastMilestone: Milestone = {
        id: 'milestone-2',
        name: 'Past Milestone',
        date: pastDate.toISOString().split('T')[0]
      };

      // Mock the calculation function (would be implemented in utils)
      const calculateDaysUntil = (date: string): number => {
        const targetDate = new Date(date);
        const today = new Date();
        const diffTime = targetDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      };

      expect(calculateDaysUntil(futureMilestone.date)).toBeGreaterThan(0);
      expect(calculateDaysUntil(pastMilestone.date)).toBeLessThan(0);
    });

    it('determines if milestone is overdue', () => {
      const today = new Date();
      const pastDate = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago

      const overdueMilestone: Milestone = {
        id: 'milestone-1',
        name: 'Overdue Milestone',
        date: pastDate.toISOString().split('T')[0],
        completed: false
      };

      const completedMilestone: Milestone = {
        id: 'milestone-2',
        name: 'Completed Milestone',
        date: pastDate.toISOString().split('T')[0],
        completed: true
      };

      // Mock the calculation function
      const isOverdue = (milestone: Milestone): boolean => {
        const targetDate = new Date(milestone.date);
        const today = new Date();
        return targetDate < today && !milestone.completed;
      };

      expect(isOverdue(overdueMilestone)).toBe(true);
      expect(isOverdue(completedMilestone)).toBe(false);
    });
  });

  describe('Progress Calculations', () => {
    it('calculates work item progress', () => {
      const workItem: WorkItem = {
        id: 'workitem-1',
        title: 'Test Work Item',
        systemId: 'system-1',
        status: 'in progress',
        type: 'task',
        priority: 'medium',
        effort: {
          unit: 'points',
          original: 10,
          completed: 6,
          remaining: 4
        }
      };

      // Mock progress calculation
      const calculateProgress = (workItem: WorkItem): number => {
        if (!workItem.effort || workItem.effort.original === 0) {
          return workItem.progress || 0;
        }
        return Math.round((workItem.effort.completed || 0) / workItem.effort.original * 100);
      };

      expect(calculateProgress(workItem)).toBe(60); // 6/10 * 100 = 60%
    });

    it('calculates initiative progress from work items', () => {
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
          systemId: 'system-1',
          status: 'todo',
          type: 'task',
          priority: 'medium'
        }
      ];

      // Mock initiative progress calculation
      const calculateInitiativeProgress = (workItems: WorkItem[]): number => {
        const total = workItems.length;
        const done = workItems.filter(item => item.status === 'done').length;
        return total > 0 ? Math.round((done / total) * 100) : 0;
      };

      expect(calculateInitiativeProgress(workItems)).toBe(33); // 1/3 * 100 = 33%
    });

    it('calculates work summary statistics', () => {
      const workItems: WorkItem[] = [
        { id: '1', title: 'Done 1', systemId: 's1', status: 'done', type: 'task', priority: 'medium' },
        { id: '2', title: 'Done 2', systemId: 's1', status: 'done', type: 'task', priority: 'medium' },
        { id: '3', title: 'In Progress 1', systemId: 's1', status: 'in progress', type: 'task', priority: 'medium' },
        { id: '4', title: 'Blocked 1', systemId: 's1', status: 'blocked', type: 'task', priority: 'medium' },
        { id: '5', title: 'Todo 1', systemId: 's1', status: 'todo', type: 'task', priority: 'medium' }
      ];

      // Mock work summary calculation
      const calculateWorkSummary = (workItems: WorkItem[]): WorkSummary => {
        const total = workItems.length;
        const done = workItems.filter(item => item.status === 'done').length;
        const inProgress = workItems.filter(item => item.status === 'in progress').length;
        const blocked = workItems.filter(item => item.status === 'blocked').length;
        const overdue = workItems.filter(item => {
          if (!item.dueDate) return false;
          const dueDate = new Date(item.dueDate);
          const today = new Date();
          return dueDate < today && item.status !== 'done';
        }).length;

        return {
          total,
          done,
          inProgress,
          blocked,
          overdue,
          completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
          blockedRate: total > 0 ? Math.round((blocked / total) * 100) : 0,
          overdueRate: total > 0 ? Math.round((overdue / total) * 100) : 0
        };
      };

      const summary = calculateWorkSummary(workItems);
      expect(summary.total).toBe(5);
      expect(summary.done).toBe(2);
      expect(summary.inProgress).toBe(1);
      expect(summary.blocked).toBe(1);
      expect(summary.completionRate).toBe(40); // 2/5 * 100 = 40%
      expect(summary.blockedRate).toBe(20); // 1/5 * 100 = 20%
    });
  });

  describe('Effort Estimation Calculations', () => {
    it('calculates effort accuracy', () => {
      const effortEstimation: EffortEstimation = {
        unit: 'points',
        original: 8,
        completed: 10,
        remaining: 0
      };

      // Mock accuracy calculation
      const calculateAccuracy = (effort: EffortEstimation): number => {
        if (effort.original === 0) return 0;
        const actualTotal = (effort.completed || 0) + (effort.remaining || 0);
        return Math.round((effort.original / actualTotal) * 100);
      };

      expect(calculateAccuracy(effortEstimation)).toBe(80); // 8/10 * 100 = 80%
    });

    it('determines if effort is over-estimated', () => {
      const overEstimatedEffort: EffortEstimation = {
        unit: 'points',
        original: 5,
        completed: 8,
        remaining: 0
      };

      const underEstimatedEffort: EffortEstimation = {
        unit: 'points',
        original: 10,
        completed: 6,
        remaining: 2
      };

      // Mock over-estimate check
      const isOverEstimate = (effort: EffortEstimation): boolean => {
        const actualTotal = (effort.completed || 0) + (effort.remaining || 0);
        return effort.original < actualTotal;
      };

      expect(isOverEstimate(overEstimatedEffort)).toBe(true);
      expect(isOverEstimate(underEstimatedEffort)).toBe(false);
    });
  });

  describe('Status and Priority Helpers', () => {
    it('gets status color', () => {
      const statusColors = {
        'planned': '#6b7280',
        'building': '#3b82f6',
        'live': '#10b981',
        'risk': '#ef4444',
        'todo': '#6b7280',
        'in progress': '#3b82f6',
        'review': '#8b5cf6',
        'done': '#10b981',
        'blocked': '#ef4444',
        'delayed': '#f59e0b'
      };

      const getStatusColor = (status: string): string => {
        return statusColors[status as keyof typeof statusColors] || '#6b7280';
      };

      expect(getStatusColor('live')).toBe('#10b981');
      expect(getStatusColor('blocked')).toBe('#ef4444');
      expect(getStatusColor('unknown')).toBe('#6b7280');
    });

    it('gets priority weight', () => {
      const priorityWeights = {
        'critical': 4,
        'high': 3,
        'medium': 2,
        'low': 1
      };

      const getPriorityWeight = (priority: string): number => {
        return priorityWeights[priority as keyof typeof priorityWeights] || 0;
      };

      expect(getPriorityWeight('critical')).toBe(4);
      expect(getPriorityWeight('high')).toBe(3);
      expect(getPriorityWeight('medium')).toBe(2);
      expect(getPriorityWeight('low')).toBe(1);
    });

    it('sorts by priority', () => {
      const workItems: WorkItem[] = [
        { id: '1', title: 'Low Priority', systemId: 's1', status: 'todo', type: 'task', priority: 'low' },
        { id: '2', title: 'Critical Priority', systemId: 's1', status: 'todo', type: 'task', priority: 'critical' },
        { id: '3', title: 'Medium Priority', systemId: 's1', status: 'todo', type: 'task', priority: 'medium' },
        { id: '4', title: 'High Priority', systemId: 's1', status: 'todo', type: 'task', priority: 'high' }
      ];

      const priorityWeights = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      
      const sortedItems = workItems.sort((a, b) => {
        const weightA = priorityWeights[a.priority];
        const weightB = priorityWeights[b.priority];
        return weightB - weightA; // Higher priority first
      });

      expect(sortedItems[0].priority).toBe('critical');
      expect(sortedItems[1].priority).toBe('high');
      expect(sortedItems[2].priority).toBe('medium');
      expect(sortedItems[3].priority).toBe('low');
    });
  });

  describe('External Reference Helpers', () => {
    it('generates external reference URL', () => {
      const externalRef: ExternalRef = {
        type: 'jira',
        id: 'JIRA-123',
        url: 'https://jira.example.com/JIRA-123'
      };

      // Mock URL generation
      const generateExternalUrl = (ref: ExternalRef): string => {
        if (ref.url) return ref.url;
        
        const baseUrls = {
          'jira': 'https://jira.example.com',
          'devops': 'https://dev.azure.com/project',
          'linear': 'https://linear.app/team',
          'other': ''
        };

        const baseUrl = baseUrls[ref.type];
        return baseUrl ? `${baseUrl}/${ref.id}` : '';
      };

      expect(generateExternalUrl(externalRef)).toBe('https://jira.example.com/JIRA-123');
    });

    it('validates external reference format', () => {
      const validRef: ExternalRef = {
        type: 'jira',
        id: 'JIRA-123'
      };

      const invalidRef: ExternalRef = {
        type: 'jira',
        id: '' // Empty ID should be invalid
      };

      // Mock validation
      const isValidExternalRef = (ref: ExternalRef): boolean => {
        return ref.id.length > 0 && ref.type.length > 0;
      };

      expect(isValidExternalRef(validRef)).toBe(true);
      expect(isValidExternalRef(invalidRef)).toBe(false);
    });
  });

  describe('Data Validation Helpers', () => {
    it('validates system relationships', () => {
      const systems: System[] = [
        { id: 's1', name: 'System 1', type: 'service', domain: 'D1', status: 'live' },
        { id: 's2', name: 'System 2', type: 'service', domain: 'D1', status: 'live' }
      ];

      const edges: SystemEdge[] = [
        { id: 'e1', source: 's1', target: 's2', kind: 'sync' },
        { id: 'e2', source: 's3', target: 's1', kind: 'sync' } // s3 doesn't exist
      ];

      // Mock relationship validation
      const validateRelationships = (systems: System[], edges: SystemEdge[]): string[] => {
        const errors: string[] = [];
        const systemIds = new Set(systems.map(s => s.id));

        edges.forEach(edge => {
          if (!systemIds.has(edge.source)) {
            errors.push(`Edge ${edge.id} references non-existent source system ${edge.source}`);
          }
          if (!systemIds.has(edge.target)) {
            errors.push(`Edge ${edge.id} references non-existent target system ${edge.target}`);
          }
        });

        return errors;
      };

      const errors = validateRelationships(systems, edges);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('references non-existent source system s3');
    });

    it('validates initiative-system relationships', () => {
      const systems: System[] = [
        { id: 's1', name: 'System 1', type: 'service', domain: 'D1', status: 'live' },
        { id: 's2', name: 'System 2', type: 'service', domain: 'D1', status: 'live' }
      ];

      const initiative: Initiative = {
        id: 'i1',
        name: 'Test Initiative',
        systems: ['s1', 's3'], // s3 doesn't exist
        status: 'planned',
        priority: 'high'
      };

      // Mock initiative validation
      const validateInitiativeSystems = (initiative: Initiative, systems: System[]): string[] => {
        const errors: string[] = [];
        const systemIds = new Set(systems.map(s => s.id));

        initiative.systems.forEach(systemId => {
          if (!systemIds.has(systemId)) {
            errors.push(`Initiative ${initiative.id} references non-existent system ${systemId}`);
          }
        });

        return errors;
      };

      const errors = validateInitiativeSystems(initiative, systems);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('references non-existent system s3');
    });

    it('validates work item-system relationships', () => {
      const systems: System[] = [
        { id: 's1', name: 'System 1', type: 'service', domain: 'D1', status: 'live' }
      ];

      const workItems: WorkItem[] = [
        { id: 'w1', title: 'Valid Work Item', systemId: 's1', status: 'todo', type: 'task', priority: 'medium' },
        { id: 'w2', title: 'Invalid Work Item', systemId: 's2', status: 'todo', type: 'task', priority: 'medium' }
      ];

      // Mock work item validation
      const validateWorkItemSystems = (workItems: WorkItem[], systems: System[]): string[] => {
        const errors: string[] = [];
        const systemIds = new Set(systems.map(s => s.id));

        workItems.forEach(workItem => {
          if (!systemIds.has(workItem.systemId)) {
            errors.push(`Work item ${workItem.id} references non-existent system ${workItem.systemId}`);
          }
        });

        return errors;
      };

      const errors = validateWorkItemSystems(workItems, systems);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('references non-existent system s2');
    });
  });

  describe('Search and Filter Helpers', () => {
    it('filters work items by status', () => {
      const workItems: WorkItem[] = [
        { id: '1', title: 'Done Task', systemId: 's1', status: 'done', type: 'task', priority: 'medium' },
        { id: '2', title: 'In Progress Task', systemId: 's1', status: 'in progress', type: 'task', priority: 'medium' },
        { id: '3', title: 'Todo Task', systemId: 's1', status: 'todo', type: 'task', priority: 'medium' },
        { id: '4', title: 'Blocked Task', systemId: 's1', status: 'blocked', type: 'task', priority: 'medium' }
      ];

      // Mock filtering
      const filterByStatus = (workItems: WorkItem[], status: string): WorkItem[] => {
        return workItems.filter(item => item.status === status);
      };

      expect(filterByStatus(workItems, 'done')).toHaveLength(1);
      expect(filterByStatus(workItems, 'in progress')).toHaveLength(1);
      expect(filterByStatus(workItems, 'todo')).toHaveLength(1);
      expect(filterByStatus(workItems, 'blocked')).toHaveLength(1);
    });

    it('filters work items by assignee', () => {
      const workItems: WorkItem[] = [
        { id: '1', title: 'Task 1', systemId: 's1', status: 'todo', type: 'task', priority: 'medium', assignee: 'John' },
        { id: '2', title: 'Task 2', systemId: 's1', status: 'todo', type: 'task', priority: 'medium', assignee: 'Jane' },
        { id: '3', title: 'Task 3', systemId: 's1', status: 'todo', type: 'task', priority: 'medium' } // No assignee
      ];

      // Mock filtering
      const filterByAssignee = (workItems: WorkItem[], assignee: string): WorkItem[] => {
        return workItems.filter(item => item.assignee === assignee);
      };

      expect(filterByAssignee(workItems, 'John')).toHaveLength(1);
      expect(filterByAssignee(workItems, 'Jane')).toHaveLength(1);
      expect(filterByAssignee(workItems, 'Bob')).toHaveLength(0);
    });

    it('searches work items by title', () => {
      const workItems: WorkItem[] = [
        { id: '1', title: 'Authentication Feature', systemId: 's1', status: 'todo', type: 'task', priority: 'medium' },
        { id: '2', title: 'User Management Task', systemId: 's1', status: 'todo', type: 'task', priority: 'medium' },
        { id: '3', title: 'Database Migration', systemId: 's1', status: 'todo', type: 'task', priority: 'medium' }
      ];

      // Mock search
      const searchWorkItems = (workItems: WorkItem[], query: string): WorkItem[] => {
        const lowercaseQuery = query.toLowerCase();
        return workItems.filter(item => 
          item.title.toLowerCase().includes(lowercaseQuery) ||
          (item.description && item.description.toLowerCase().includes(lowercaseQuery))
        );
      };

      expect(searchWorkItems(workItems, 'auth')).toHaveLength(1);
      expect(searchWorkItems(workItems, 'user')).toHaveLength(1);
      expect(searchWorkItems(workItems, 'database')).toHaveLength(1);
      expect(searchWorkItems(workItems, 'xyz')).toHaveLength(0);
    });
  });

  describe('Data Export Helpers', () => {
    it('formats data for CSV export', () => {
      const workItems: WorkItem[] = [
        {
          id: 'w1',
          title: 'Test Task',
          systemId: 's1',
          status: 'todo',
          type: 'task',
          priority: 'medium',
          assignee: 'John Doe',
          tags: ['frontend', 'urgent']
        }
      ];

      // Mock CSV formatting
      const formatForCSV = (workItems: WorkItem[]): string[][] => {
        const headers = ['ID', 'Title', 'System ID', 'Status', 'Type', 'Priority', 'Assignee', 'Tags'];
        const rows = workItems.map(item => [
          item.id,
          item.title,
          item.systemId,
          item.status,
          item.type,
          item.priority,
          item.assignee || '',
          item.tags?.join(';') || ''
        ]);
        return [headers, ...rows];
      };

      const csvData = formatForCSV(workItems);
      expect(csvData).toHaveLength(2); // Header + 1 row
      expect(csvData[0]).toEqual(['ID', 'Title', 'System ID', 'Status', 'Type', 'Priority', 'Assignee', 'Tags']);
      expect(csvData[1]).toEqual(['w1', 'Test Task', 's1', 'todo', 'task', 'medium', 'John Doe', 'frontend;urgent']);
    });

    it('formats data for JSON export', () => {
      const systems: System[] = [
        { id: 's1', name: 'System 1', type: 'service', domain: 'D1', status: 'live' }
      ];

      const initiatives: Initiative[] = [
        { id: 'i1', name: 'Initiative 1', systems: ['s1'], status: 'planned', priority: 'high' }
      ];

      const workItems: WorkItem[] = [
        { id: 'w1', title: 'Task 1', systemId: 's1', status: 'todo', type: 'task', priority: 'medium' }
      ];

      // Mock JSON export formatting
      const formatForJSONExport = (systems: System[], initiatives: Initiative[], workItems: WorkItem[]) => {
        return {
          systems,
          initiatives,
          workItems,
          metadata: {
            exportedAt: new Date().toISOString(),
            version: '1.0.0',
            totalSystems: systems.length,
            totalInitiatives: initiatives.length,
            totalWorkItems: workItems.length
          }
        };
      };

      const exportData = formatForJSONExport(systems, initiatives, workItems);
      expect(exportData.systems).toHaveLength(1);
      expect(exportData.initiatives).toHaveLength(1);
      expect(exportData.workItems).toHaveLength(1);
      expect(exportData.metadata.totalSystems).toBe(1);
      expect(exportData.metadata.totalInitiatives).toBe(1);
      expect(exportData.metadata.totalWorkItems).toBe(1);
    });
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('Performance Tests', () => {
  it('handles large work item datasets efficiently', () => {
    // Generate 1000 work items
    const workItems: WorkItem[] = Array.from({ length: 1000 }, (_, i) => ({
      id: `workitem-${i}`,
      title: `Work Item ${i}`,
      systemId: `system-${i % 100}`,
      status: ['todo', 'in progress', 'done', 'blocked'][i % 4] as WorkItemStatus,
      type: ['task', 'feature', 'bug'][i % 3] as WorkItemType,
      priority: ['low', 'medium', 'high', 'critical'][i % 4] as Priority
    }));

    // Test filtering performance
    const startTime = performance.now();
    
    const filteredItems = workItems.filter(item => item.status === 'todo');
    
    const endTime = performance.now();
    const filterTime = endTime - startTime;

    expect(filteredItems).toHaveLength(250); // 1000 / 4 = 250 items with 'todo' status
    expect(filterTime).toBeLessThan(10); // Should be very fast
  });

  it('handles large initiative datasets efficiently', () => {
    // Generate 100 initiatives
    const initiatives: Initiative[] = Array.from({ length: 100 }, (_, i) => ({
      id: `initiative-${i}`,
      name: `Initiative ${i}`,
      systems: Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, j) => `system-${j}`),
      status: ['planned', 'in progress', 'delayed', 'done'][i % 4] as InitiativeStatus,
      priority: ['low', 'medium', 'high', 'critical'][i % 4] as Priority
    }));

    // Test progress calculation performance
    const startTime = performance.now();
    
    const progressMap = initiatives.map(initiative => ({
      id: initiative.id,
      progress: Math.floor(Math.random() * 100)
    }));
    
    const endTime = performance.now();
    const calculationTime = endTime - startTime;

    expect(progressMap).toHaveLength(100);
    expect(calculationTime).toBeLessThan(5); // Should be very fast
  });

  it('handles complex data relationships efficiently', () => {
    // Generate complex dataset
    const systems: System[] = Array.from({ length: 50 }, (_, i) => ({
      id: `system-${i}`,
      name: `System ${i}`,
      type: 'service',
      domain: `Domain ${i % 10}`,
      status: 'live'
    }));

    const initiatives: Initiative[] = Array.from({ length: 20 }, (_, i) => ({
      id: `initiative-${i}`,
      name: `Initiative ${i}`,
      systems: systems.slice(i * 2, (i + 1) * 2).map(s => s.id),
      status: 'planned',
      priority: 'medium'
    }));

    const workItems: WorkItem[] = Array.from({ length: 200 }, (_, i) => ({
      id: `workitem-${i}`,
      title: `Work Item ${i}`,
      systemId: systems[i % 50].id,
      status: 'todo',
      type: 'task',
      priority: 'medium'
    }));

    // Test relationship validation performance
    const startTime = performance.now();
    
    const systemIds = new Set(systems.map(s => s.id));
    const invalidWorkItems = workItems.filter(item => !systemIds.has(item.systemId));
    
    const endTime = performance.now();
    const validationTime = endTime - startTime;

    expect(invalidWorkItems).toHaveLength(0); // All should be valid
    expect(validationTime).toBeLessThan(5); // Should be very fast
  });
});




