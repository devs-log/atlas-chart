export type Status = "planned" | "building" | "live" | "risk";
export type EdgeKind = "sync" | "async" | "event" | "batch" | "other";
export type SystemType = "app" | "service" | "datastore" | "queue" | "external";
export type SceneType = "overview" | "data-flows" | "by-domain" | "by-status";
export type Mode = "viewing" | "editing";
export type ColorScheme = "default" | "high-contrast" | "dark" | "minimal";

export interface Link {
  label: string;
  url: string;
  kind?: "docs" | "repo" | "runbook" | "dashboard" | "other";
}

export interface Dependency {
  targetId: string;
  kind?: EdgeKind;
  note?: string;
}

export interface Timeline {
  start?: string;
  end?: string;
  goLive?: string;
}

export interface System {
  id: string;
  name: string;
  type: SystemType;
  domain: string;
  team?: string;
  owner?: string;
  status: Status;
  description?: string;
  features?: string[];
  tags?: string[];
  dependencies?: Dependency[];
  planned?: Timeline;
  actual?: Timeline;
  links?: Link[];
  colorOverride?: string;
}

export interface SystemNode extends System {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  distance?: number;
}

export interface SystemEdge {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
  note?: string;
  animated?: boolean;
  connectionType?: string;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

export interface AtlasState {
  // Core data
  systems: System[];
  edges: SystemEdge[];
  
  // UI state
  mode: Mode;
  scene: SceneType;
  selectedNodeId?: string;
  focusNodeId?: string;
  camera: CameraState;
  
  // Editing state
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  
  // UI panels
  showDetailCard: boolean;
  showCommandPalette: boolean;
  showFullscreen: boolean;
  showSettings: boolean;
  
  // Search
  searchQuery: string;
  searchResults: System[];
  
  // Settings
  colorScheme: ColorScheme;
}

export interface SceneLayout {
  type: SceneType;
  name: string;
  description: string;
  layout: (nodes: SystemNode[], edges: SystemEdge[], focusId?: string) => Promise<SystemNode[]>;
}

export interface ImportResult {
  success: boolean;
  systems: System[];
  edges: SystemEdge[];
  errors: string[];
  warnings: string[];
}

export interface ExportOptions {
  format: 'json' | 'png' | 'svg' | 'pdf';
  includeView?: boolean;
  includeData?: boolean;
  width?: number;
  height?: number;
}

export interface Breadcrumb {
  id: string;
  name: string;
  type: 'system' | 'domain' | 'scene';
}

export interface Command {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  action: () => void;
  keywords?: string[];
}
