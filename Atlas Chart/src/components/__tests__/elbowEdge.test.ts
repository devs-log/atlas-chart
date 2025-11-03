import { describe, it, expect, vi } from 'vitest';
import { useAtlasStore } from '../../store/useAtlasStore';

describe('Elbow Edge Double-Click Functionality', () => {
  it('should have addElbowPoint method in store', () => {
    const store = useAtlasStore.getState();
    expect(typeof store.addElbowPoint).toBe('function');
  });

  it('should add elbow point when addElbowPoint is called', () => {
    // Reset store
    useAtlasStore.getState().setEdges([]);
    
    // Add a test edge
    const testEdge = {
      id: 'test-edge',
      source: 'node1',
      target: 'node2',
      kind: 'other' as const,
      connectionType: 'elbow',
      elbowPoints: []
    };
    
    useAtlasStore.getState().addEdge(testEdge);
    
    // Add elbow point
    const elbowPoint = { x: 100, y: 200 };
    useAtlasStore.getState().addElbowPoint('test-edge', elbowPoint);
    
    // Check if elbow point was added
    const edges = useAtlasStore.getState().edges;
    const edge = edges.find(e => e.id === 'test-edge');
    
    expect(edge).toBeDefined();
    expect(edge?.elbowPoints).toHaveLength(1);
    expect(edge?.elbowPoints?.[0]).toEqual(elbowPoint);
  });

  it('should update existing elbow points when adding new ones', () => {
    // Reset store
    useAtlasStore.getState().setEdges([]);
    
    // Add a test edge with existing elbow points
    const testEdge = {
      id: 'test-edge-2',
      source: 'node1',
      target: 'node2',
      kind: 'other' as const,
      connectionType: 'elbow',
      elbowPoints: [{ x: 50, y: 100 }]
    };
    
    useAtlasStore.getState().addEdge(testEdge);
    
    // Add another elbow point
    const newElbowPoint = { x: 150, y: 250 };
    useAtlasStore.getState().addElbowPoint('test-edge-2', newElbowPoint);
    
    // Check if elbow point was added to existing ones
    const edges = useAtlasStore.getState().edges;
    const edge = edges.find(e => e.id === 'test-edge-2');
    
    expect(edge).toBeDefined();
    expect(edge?.elbowPoints).toHaveLength(2);
    expect(edge?.elbowPoints?.[0]).toEqual({ x: 50, y: 100 });
    expect(edge?.elbowPoints?.[1]).toEqual(newElbowPoint);
  });
});
