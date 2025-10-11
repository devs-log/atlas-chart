import { describe, it, expect } from 'vitest';
import { validateSystem, validateSystemEdge } from '../validation';

describe('System Validation', () => {
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
});

describe('SystemEdge Validation', () => {
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
    }
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

describe('CSV Parsing', () => {
  it('parses CSV values correctly', async () => {
    const { parseCSVValue } = await import('../validation');

    // Test JSON parsing
    expect(parseCSVValue('["feature1", "feature2"]')).toEqual(['feature1', 'feature2']);
    
    // Test string parsing
    expect(parseCSVValue('simple string')).toBe('simple string');
    
    // Test empty value
    expect(parseCSVValue('')).toBeUndefined();
  });

  it('converts CSV row to system', async () => {
    const { csvRowToSystem } = await import('../validation');

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
