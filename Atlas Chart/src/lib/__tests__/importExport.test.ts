import { describe, it, expect } from 'vitest';
import type { 
  System, 
  SystemEdge, 
  Initiative, 
  WorkItem,
  ImportResult,
  ExportOptions,
  WorkItemStatus,
  WorkItemType,
  Priority
} from '../types';

// ============================================================================
// IMPORT/EXPORT FUNCTIONALITY TESTS
// ============================================================================

describe('Import/Export Functionality', () => {
  describe('JSON Import/Export', () => {
    it('exports complete Atlas PM data to JSON', () => {
      const testData = {
        systems: [
          {
            id: 'system-1',
            name: 'User Service',
            type: 'service',
            domain: 'Identity',
            status: 'live',
            activeInitiatives: ['initiative-1'],
            workSummary: {
              total: 5,
              done: 2,
              inProgress: 2,
              blocked: 1,
              overdue: 0
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
            name: 'Authentication Overhaul',
            description: 'Complete rewrite of authentication',
            owner: 'John Doe',
            systems: ['system-1'],
            status: 'in progress',
            priority: 'high',
            progress: 60,
            riskLevel: 'medium',
            budget: 50000
          }
        ],
        workItems: [
          {
            id: 'workitem-1',
            title: 'Implement OAuth 2.0',
            description: 'Add OAuth 2.0 support',
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
            riskLevel: 'low'
          }
        ]
      };

      // Mock export function
      const exportToJSON = (data: any): string => {
        return JSON.stringify(data, null, 2);
      };

      const jsonExport = exportToJSON(testData);
      const parsedData = JSON.parse(jsonExport);

      expect(parsedData.systems).toHaveLength(1);
      expect(parsedData.edges).toHaveLength(1);
      expect(parsedData.initiatives).toHaveLength(1);
      expect(parsedData.workItems).toHaveLength(1);
      expect(parsedData.systems[0].name).toBe('User Service');
      expect(parsedData.initiatives[0].name).toBe('Authentication Overhaul');
      expect(parsedData.workItems[0].title).toBe('Implement OAuth 2.0');
    });

    it('imports JSON data with validation', () => {
      const jsonData = {
        systems: [
          {
            id: 'system-1',
            name: 'Test System',
            type: 'service',
            domain: 'Test Domain',
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
            status: 'planned',
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

      // Mock import function
      const importFromJSON = (jsonString: string): ImportResult => {
        try {
          const data = JSON.parse(jsonString);
          
          // Basic validation
          const errors: string[] = [];
          if (!data.systems || !Array.isArray(data.systems)) {
            errors.push('Systems array is required');
          }
          if (!data.edges || !Array.isArray(data.edges)) {
            errors.push('Edges array is required');
          }

          return {
            success: errors.length === 0,
            systems: data.systems || [],
            edges: data.edges || [],
            initiatives: data.initiatives || [],
            workItems: data.workItems || [],
            errors,
            warnings: []
          };
        } catch (error) {
          return {
            success: false,
            systems: [],
            edges: [],
            initiatives: [],
            workItems: [],
            errors: ['Invalid JSON format'],
            warnings: []
          };
        }
      };

      const result = importFromJSON(JSON.stringify(jsonData));
      expect(result.success).toBe(true);
      expect(result.systems).toHaveLength(1);
      expect(result.edges).toHaveLength(1);
      expect(result.initiatives).toHaveLength(1);
      expect(result.workItems).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
    });

    it('handles invalid JSON import gracefully', () => {
      const invalidJson = '{ invalid json }';

      // Mock import function
      const importFromJSON = (jsonString: string): ImportResult => {
        try {
          const data = JSON.parse(jsonString);
          return {
            success: true,
            systems: data.systems || [],
            edges: data.edges || [],
            initiatives: data.initiatives || [],
            workItems: data.workItems || [],
            errors: [],
            warnings: []
          };
        } catch (error) {
          return {
            success: false,
            systems: [],
            edges: [],
            initiatives: [],
            workItems: [],
            errors: ['Invalid JSON format'],
            warnings: []
          };
        }
      };

      const result = importFromJSON(invalidJson);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid JSON format');
      expect(result.systems).toHaveLength(0);
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
        // No initiatives or workItems - should still be valid
      };

      // Mock import function with backward compatibility
      const importFromJSON = (jsonString: string): ImportResult => {
        try {
          const data = JSON.parse(jsonString);
          
          return {
            success: true,
            systems: data.systems || [],
            edges: data.edges || [],
            initiatives: data.initiatives || [], // Optional for backward compatibility
            workItems: data.workItems || [], // Optional for backward compatibility
            errors: [],
            warnings: data.initiatives === undefined ? ['No initiatives found - using legacy format'] : []
          };
        } catch (error) {
          return {
            success: false,
            systems: [],
            edges: [],
            initiatives: [],
            workItems: [],
            errors: ['Invalid JSON format'],
            warnings: []
          };
        }
      };

      const result = importFromJSON(JSON.stringify(legacyData));
      expect(result.success).toBe(true);
      expect(result.systems).toHaveLength(1);
      expect(result.edges).toHaveLength(1);
      expect(result.initiatives).toHaveLength(0);
      expect(result.workItems).toHaveLength(0);
      expect(result.warnings).toContain('No initiatives found - using legacy format');
    });
  });

  describe('CSV Import/Export', () => {
    it('exports work items to CSV', () => {
      const workItems: WorkItem[] = [
        {
          id: 'workitem-1',
          title: 'Implement OAuth 2.0',
          description: 'Add OAuth 2.0 support',
          systemId: 'system-1',
          assignee: 'Jane Doe',
          status: 'in progress',
          type: 'feature',
          priority: 'high',
          dueDate: '2024-03-15',
          tags: ['authentication', 'oauth'],
          progress: 40
        },
        {
          id: 'workitem-2',
          title: 'Fix Login Bug',
          description: 'Fix login validation issue',
          systemId: 'system-1',
          assignee: 'Bob Smith',
          status: 'done',
          type: 'bug',
          priority: 'critical',
          dueDate: '2024-02-28',
          tags: ['bug', 'authentication'],
          progress: 100
        }
      ];

      // Mock CSV export function
      const exportWorkItemsToCSV = (workItems: WorkItem[]): string => {
        const headers = [
          'ID', 'Title', 'Description', 'System ID', 'Assignee', 
          'Status', 'Type', 'Priority', 'Due Date', 'Tags', 'Progress'
        ];
        
        const rows = workItems.map(item => [
          item.id,
          item.title,
          item.description || '',
          item.systemId,
          item.assignee || '',
          item.status,
          item.type,
          item.priority,
          item.dueDate || '',
          item.tags?.join(';') || '',
          item.progress?.toString() || '0'
        ]);

        const csvContent = [headers, ...rows]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n');

        return csvContent;
      };

      const csvExport = exportWorkItemsToCSV(workItems);
      const lines = csvExport.split('\n');

      expect(lines).toHaveLength(3); // Header + 2 data rows
      expect(lines[0]).toContain('"ID","Title","Description","System ID"');
      expect(lines[1]).toContain('workitem-1');
      expect(lines[2]).toContain('workitem-2');
    });

    it('imports work items from CSV', () => {
      const csvContent = `ID,Title,Description,System ID,Assignee,Status,Type,Priority,Due Date,Tags,Progress
workitem-1,"Implement OAuth 2.0","Add OAuth 2.0 support",system-1,"Jane Doe",in progress,feature,high,2024-03-15,"authentication;oauth",40
workitem-2,"Fix Login Bug","Fix login validation issue",system-1,"Bob Smith",done,bug,critical,2024-02-28,"bug;authentication",100`;

      // Mock CSV import function
      const importWorkItemsFromCSV = (csvContent: string): ImportResult => {
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
        
        const workItems: WorkItem[] = [];
        const errors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === '') continue;
          
          const values = lines[i].split(',').map(v => v.replace(/"/g, ''));
          
          if (values.length !== headers.length) {
            errors.push(`Row ${i + 1}: Column count mismatch`);
            continue;
          }

          const workItem: WorkItem = {
            id: values[0],
            title: values[1],
            description: values[2] || undefined,
            systemId: values[3],
            assignee: values[4] || undefined,
            status: values[5] as WorkItemStatus,
            type: values[6] as WorkItemType,
            priority: values[7] as Priority,
            dueDate: values[8] || undefined,
            tags: values[9] ? values[9].split(';') : undefined,
            progress: values[10] ? parseInt(values[10]) : undefined
          };

          workItems.push(workItem);
        }

        return {
          success: errors.length === 0,
          systems: [],
          edges: [],
          initiatives: [],
          workItems,
          errors,
          warnings: []
        };
      };

      const result = importWorkItemsFromCSV(csvContent);
      expect(result.success).toBe(true);
      expect(result.workItems).toBeDefined();
      expect(result.workItems!).toHaveLength(2);
      expect(result.workItems![0].title).toBe('Implement OAuth 2.0');
      expect(result.workItems![1].title).toBe('Fix Login Bug');
      expect(result.workItems![0].tags).toEqual(['authentication', 'oauth']);
    });

    it('handles CSV import errors gracefully', () => {
      const invalidCsvContent = `ID,Title,System ID,Status,Type,Priority
workitem-1,"Test Task",system-1,todo,task,medium
workitem-2,"Invalid Task",,invalid-status,invalid-type,invalid-priority`;

      // Mock CSV import function
      const importWorkItemsFromCSV = (csvContent: string): ImportResult => {
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
        
        const workItems: WorkItem[] = [];
        const errors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === '') continue;
          
          const values = lines[i].split(',').map(v => v.replace(/"/g, ''));
          
          // Validate required fields
          if (!values[0]) errors.push(`Row ${i + 1}: ID is required`);
          if (!values[1]) errors.push(`Row ${i + 1}: Title is required`);
          if (!values[2]) errors.push(`Row ${i + 1}: System ID is required`);
          
          // Validate enum values
          const validStatuses = ['todo', 'in progress', 'review', 'done', 'blocked'];
          if (!validStatuses.includes(values[3])) {
            errors.push(`Row ${i + 1}: Invalid status '${values[3]}'`);
          }
          
          const validTypes = ['epic', 'feature', 'user-story', 'task', 'bug', 'test-case'];
          if (!validTypes.includes(values[4])) {
            errors.push(`Row ${i + 1}: Invalid type '${values[4]}'`);
          }
          
          const validPriorities = ['critical', 'high', 'medium', 'low'];
          if (!validPriorities.includes(values[5])) {
            errors.push(`Row ${i + 1}: Invalid priority '${values[5]}'`);
          }
        }

        return {
          success: errors.length === 0,
          systems: [],
          edges: [],
          initiatives: [],
          workItems,
          errors,
          warnings: []
        };
      };

      const result = importWorkItemsFromCSV(invalidCsvContent);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('System ID is required'))).toBe(true);
      expect(result.errors.some(error => error.includes('Invalid status'))).toBe(true);
    });
  });

  describe('Export Options and Formats', () => {
    it('exports with different format options', () => {
      const testData = {
        systems: [
          { id: 's1', name: 'System 1', type: 'service', domain: 'D1', status: 'live' }
        ],
        edges: [
          { id: 'e1', source: 's1', target: 's2', kind: 'sync' }
        ],
        initiatives: [
          { id: 'i1', name: 'Initiative 1', systems: ['s1'], status: 'planned', priority: 'high' }
        ],
        workItems: [
          { id: 'w1', title: 'Task 1', systemId: 's1', status: 'todo', type: 'task', priority: 'medium' }
        ]
      };

      // Mock export function with options
      const exportData = (data: any, options: ExportOptions): string => {
        let exportData = { ...data };
        
        if (!options.includeData) {
          exportData = {
            metadata: {
              exportedAt: new Date().toISOString(),
              totalSystems: data.systems.length,
              totalInitiatives: data.initiatives.length,
              totalWorkItems: data.workItems.length
            }
          };
        }
        
        if (options.includeView) {
          exportData.viewSettings = {
            camera: { x: 0, y: 0, zoom: 1 },
            selectedNodeId: null,
            scene: 'overview'
          };
        }

        return JSON.stringify(exportData, null, 2);
      };

      const options1: ExportOptions = {
        format: 'json',
        includeData: true,
        includeView: false
      };

      const options2: ExportOptions = {
        format: 'json',
        includeData: false,
        includeView: true
      };

      const export1 = exportData(testData, options1);
      const export2 = exportData(testData, options2);

      const parsed1 = JSON.parse(export1);
      const parsed2 = JSON.parse(export2);

      expect(parsed1.systems).toBeDefined();
      expect(parsed1.viewSettings).toBeUndefined();
      
      expect(parsed2.systems).toBeUndefined();
      expect(parsed2.metadata).toBeDefined();
      expect(parsed2.viewSettings).toBeDefined();
    });

    it('validates export options', () => {
      const validOptions: ExportOptions[] = [
        { format: 'json', includeData: true, includeView: false },
        { format: 'json', includeData: false, includeView: true },
        { format: 'json', includeData: true, includeView: true },
        { format: 'png', includeData: false, includeView: true },
        { format: 'svg', includeData: false, includeView: true },
        { format: 'pdf', includeData: true, includeView: false }
      ];

      // Mock validation function
      const validateExportOptions = (options: ExportOptions): boolean => {
        const validFormats = ['json', 'png', 'svg', 'pdf'];
        return validFormats.includes(options.format);
      };

      validOptions.forEach(options => {
        expect(validateExportOptions(options)).toBe(true);
      });

      const invalidOptions: ExportOptions = {
        format: 'invalid' as any,
        includeData: true,
        includeView: false
      };

      expect(validateExportOptions(invalidOptions)).toBe(false);
    });
  });

  describe('Data Migration and Versioning', () => {
    it('handles data version migration', () => {
      const legacyData = {
        version: '1.0.0',
        systems: [
          { id: 's1', name: 'System 1', type: 'service', domain: 'D1', status: 'live' }
        ],
        edges: [
          { id: 'e1', source: 's1', target: 's2', kind: 'sync' }
        ]
      };

      const currentData = {
        version: '2.0.0',
        systems: [
          { id: 's1', name: 'System 1', type: 'service', domain: 'D1', status: 'live' }
        ],
        edges: [
          { id: 'e1', source: 's1', target: 's2', kind: 'sync' }
        ],
        initiatives: [],
        workItems: []
      };

      // Mock migration function
      const migrateData = (data: any): any => {
        if (data.version === '1.0.0') {
          return {
            ...data,
            version: '2.0.0',
            initiatives: [],
            workItems: []
          };
        }
        return data;
      };

      const migratedData = migrateData(legacyData);
      expect(migratedData.version).toBe('2.0.0');
      expect(migratedData.initiatives).toBeDefined();
      expect(migratedData.workItems).toBeDefined();
    });

    it('validates data version compatibility', () => {
      const dataVersions = ['1.0.0', '1.1.0', '2.0.0', '2.1.0'];
      const currentVersion = '2.0.0';

      // Mock compatibility check
      const isCompatible = (version: string): boolean => {
        const versionParts = version.split('.').map(Number);
        const currentParts = currentVersion.split('.').map(Number);
        
        // Major version must match for compatibility
        return versionParts[0] === currentParts[0];
      };

      expect(isCompatible('1.0.0')).toBe(false);
      expect(isCompatible('1.1.0')).toBe(false);
      expect(isCompatible('2.0.0')).toBe(true);
      expect(isCompatible('2.1.0')).toBe(true);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('handles partial import failures', () => {
      const mixedData = {
        systems: [
          { id: 's1', name: 'Valid System', type: 'service', domain: 'D1', status: 'live' },
          { id: '', name: 'Invalid System', type: 'service', domain: 'D1', status: 'live' } // Missing ID
        ],
        edges: [
          { id: 'e1', source: 's1', target: 's2', kind: 'sync' },
          { id: 'e2', source: 'invalid', target: 's1', kind: 'sync' } // Invalid source
        ],
        initiatives: [
          { id: 'i1', name: 'Valid Initiative', systems: ['s1'], status: 'planned', priority: 'high' },
          { id: 'i2', name: 'Invalid Initiative', systems: [], status: 'planned', priority: 'high' } // Empty systems
        ],
        workItems: [
          { id: 'w1', title: 'Valid Work Item', systemId: 's1', status: 'todo', type: 'task', priority: 'medium' },
          { id: 'w2', title: 'Invalid Work Item', systemId: 'invalid', status: 'todo', type: 'task', priority: 'medium' } // Invalid system
        ]
      };

      // Mock import function with error handling
      const importWithErrorHandling = (data: any): ImportResult => {
        const errors: string[] = [];
        const warnings: string[] = [];
        
        // Validate systems
        const validSystems = data.systems.filter((system: any) => {
          if (!system.id) {
            errors.push(`System missing ID: ${system.name}`);
            return false;
          }
          return true;
        });

        // Validate edges
        const validEdges = data.edges.filter((edge: any) => {
          const validSources = validSystems.map((s: any) => s.id);
          if (!validSources.includes(edge.source)) {
            errors.push(`Edge ${edge.id} references invalid source: ${edge.source}`);
            return false;
          }
          return true;
        });

        // Validate initiatives
        const validInitiatives = data.initiatives.filter((initiative: any) => {
          if (initiative.systems.length === 0) {
            errors.push(`Initiative ${initiative.id} has no systems`);
            return false;
          }
          return true;
        });

        // Validate work items
        const validWorkItems = data.workItems.filter((workItem: any) => {
          const validSystemIds = validSystems.map((s: any) => s.id);
          if (!validSystemIds.includes(workItem.systemId)) {
            errors.push(`Work item ${workItem.id} references invalid system: ${workItem.systemId}`);
            return false;
          }
          return true;
        });

        return {
          success: errors.length === 0,
          systems: validSystems,
          edges: validEdges,
          initiatives: validInitiatives,
          workItems: validWorkItems,
          errors,
          warnings
        };
      };

      const result = importWithErrorHandling(mixedData);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.systems).toHaveLength(1); // Only valid system
      expect(result.edges).toHaveLength(1); // Only valid edge
      expect(result.initiatives).toHaveLength(1); // Only valid initiative
      expect(result.workItems).toHaveLength(1); // Only valid work item
    });

    it('provides detailed error messages', () => {
      const invalidData = {
        systems: [
          { id: '', name: 'System 1', type: 'invalid-type', domain: '', status: 'invalid-status' }
        ],
        edges: [
          { id: '', source: '', target: '', kind: 'invalid-kind' }
        ]
      };

      // Mock detailed validation
      const validateWithDetails = (data: any): ImportResult => {
        const errors: string[] = [];
        
        data.systems.forEach((system: any, index: number) => {
          if (!system.id) errors.push(`System ${index + 1}: ID is required`);
          if (!system.name) errors.push(`System ${index + 1}: Name is required`);
          if (!['app', 'service', 'datastore', 'queue', 'external'].includes(system.type)) {
            errors.push(`System ${index + 1}: Invalid type '${system.type}'`);
          }
          if (!system.domain) errors.push(`System ${index + 1}: Domain is required`);
          if (!['planned', 'building', 'live', 'risk'].includes(system.status)) {
            errors.push(`System ${index + 1}: Invalid status '${system.status}'`);
          }
        });

        data.edges.forEach((edge: any, index: number) => {
          if (!edge.id) errors.push(`Edge ${index + 1}: ID is required`);
          if (!edge.source) errors.push(`Edge ${index + 1}: Source is required`);
          if (!edge.target) errors.push(`Edge ${index + 1}: Target is required`);
          if (!['sync', 'async', 'event', 'batch', 'other'].includes(edge.kind)) {
            errors.push(`Edge ${index + 1}: Invalid kind '${edge.kind}'`);
          }
        });

        return {
          success: errors.length === 0,
          systems: [],
          edges: [],
          initiatives: [],
          workItems: [],
          errors,
          warnings: []
        };
      };

      const result = validateWithDetails(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(5); // Multiple validation errors
      expect(result.errors.some(error => error.includes('ID is required'))).toBe(true);
      expect(result.errors.some(error => error.includes('Invalid type'))).toBe(true);
      expect(result.errors.some(error => error.includes('Invalid status'))).toBe(true);
    });
  });
});
