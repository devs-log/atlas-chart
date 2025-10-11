import type { SystemNode, SystemEdge, SceneType } from './types';

export interface LayoutOptions {
  centerX?: number;
  centerY?: number;
  spacing?: number;
  nodeWidth?: number;
  nodeHeight?: number;
}

const defaultOptions: Required<LayoutOptions> = {
  centerX: 0,
  centerY: 0,
  spacing: 200,
  nodeWidth: 200,
  nodeHeight: 100,
};

// Simple grid layout for overview
export function layoutOverview(
  nodes: SystemNode[],
  edges: SystemEdge[],
  focusNodeId?: string,
  options: LayoutOptions = {}
): SystemNode[] {
  const opts = { ...defaultOptions, ...options };
  
  // Find focus node or use first node
  const focusNode = nodes.find(n => n.id === focusNodeId) || nodes[0];
  if (!focusNode) return nodes;

  // Place focus node in center
  const result: SystemNode[] = nodes.map(node => {
    if (node.id === focusNode.id) {
      return {
        ...node,
        x: opts.centerX,
        y: opts.centerY,
        width: opts.nodeWidth,
        height: opts.nodeHeight,
      };
    }

    // Place other nodes in a simple grid around center
    const index = nodes.indexOf(node);
    const gridSize = Math.ceil(Math.sqrt(nodes.length - 1));
    const row = Math.floor((index - 1) / gridSize);
    const col = (index - 1) % gridSize;
    
    return {
      ...node,
      x: opts.centerX + (col - gridSize / 2) * opts.spacing,
      y: opts.centerY + (row - gridSize / 2) * opts.spacing,
      width: opts.nodeWidth,
      height: opts.nodeHeight,
    };
  });

  return result;
}

// Simple column layout by domain
export function layoutByDomain(
  nodes: SystemNode[],
  edges: SystemEdge[],
  options: LayoutOptions = {}
): SystemNode[] {
  const opts = { ...defaultOptions, ...options };
  
  // Group by domain
  const domainGroups = new Map<string, SystemNode[]>();
  for (const node of nodes) {
    if (!domainGroups.has(node.domain)) {
      domainGroups.set(node.domain, []);
    }
    domainGroups.get(node.domain)!.push(node);
  }

  const result: SystemNode[] = [];
  let columnX = opts.centerX - (domainGroups.size * opts.spacing) / 2;

  for (const [, domainNodes] of domainGroups) {
    let nodeY = opts.centerY - (domainNodes.length * opts.spacing) / 2;

    for (const node of domainNodes) {
      result.push({
        ...node,
        x: columnX,
        y: nodeY,
        width: opts.nodeWidth,
        height: opts.nodeHeight,
      });
      nodeY += opts.spacing;
    }

    columnX += opts.spacing;
  }

  return result;
}

// Simple row layout by status
export function layoutByStatus(
  nodes: SystemNode[],
  edges: SystemEdge[],
  options: LayoutOptions = {}
): SystemNode[] {
  const opts = { ...defaultOptions, ...options };
  
  // Group by status
  const statusGroups = new Map<string, SystemNode[]>();
  for (const node of nodes) {
    if (!statusGroups.has(node.status)) {
      statusGroups.set(node.status, []);
    }
    statusGroups.get(node.status)!.push(node);
  }

  const result: SystemNode[] = [];
  const statusOrder = ['live', 'building', 'planned', 'risk'];
  let rowY = opts.centerY - (statusOrder.length * opts.spacing) / 2;

  for (const status of statusOrder) {
    const statusNodes = statusGroups.get(status);
    if (!statusNodes || statusNodes.length === 0) {
      rowY += opts.spacing;
      continue;
    }

    let nodeX = opts.centerX - (statusNodes.length * opts.spacing) / 2;

    for (const node of statusNodes) {
      result.push({
        ...node,
        x: nodeX,
        y: rowY,
        width: opts.nodeWidth,
        height: opts.nodeHeight,
      });
      nodeX += opts.spacing;
    }

    rowY += opts.spacing;
  }

  return result;
}

// Simple left-to-right layout for data flows
export function layoutDataFlows(
  nodes: SystemNode[],
  edges: SystemEdge[],
  options: LayoutOptions = {}
): SystemNode[] {
  const opts = { ...defaultOptions, ...options };
  
  // Simple left-to-right arrangement
  const result: SystemNode[] = [];
  const nodeWidth = opts.spacing;
  let x = opts.centerX - (nodes.length * nodeWidth) / 2;

  for (const node of nodes) {
    result.push({
      ...node,
      x,
      y: opts.centerY + (Math.random() - 0.5) * opts.spacing, // Add some vertical variation
      width: opts.nodeWidth,
      height: opts.nodeHeight,
    });
    x += nodeWidth;
  }

  return result;
}

export async function applySimpleSceneLayout(
  scene: SceneType,
  nodes: SystemNode[],
  edges: SystemEdge[],
  focusNodeId?: string,
  options: LayoutOptions = {}
): Promise<SystemNode[]> {
  switch (scene) {
    case 'overview':
      return layoutOverview(nodes, edges, focusNodeId, options);
    case 'by-domain':
      return layoutByDomain(nodes, edges, options);
    case 'by-status':
      return layoutByStatus(nodes, edges, options);
    case 'data-flows':
      return layoutDataFlows(nodes, edges, options);
    default:
      return nodes;
  }
}

