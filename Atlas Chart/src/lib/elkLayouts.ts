// ELK LAYOUTS DISABLED - Using simpleLayouts.ts instead
// This file is kept for reference but all functions are disabled

// import ELK from 'elkjs'; // Removed due to web-worker issues
// import type { SystemNode, SystemEdge, SceneType } from './types';

// const elk = new ELK(); // Disabled due to web-worker issues

// All ELK layout functions have been disabled and moved to simpleLayouts.ts
// This resolves the "Cannot redefine property: File" error and web-worker conflicts

export interface ElkLayoutOptions {
  direction?: 'DOWN' | 'UP' | 'LEFT' | 'RIGHT';
  spacing?: number;
  nodeSize?: { width: number; height: number };
  padding?: number;
}

// All functions below are disabled - see simpleLayouts.ts for working implementations