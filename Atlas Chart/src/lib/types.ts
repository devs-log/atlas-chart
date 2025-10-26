export type Status = "planned" | "building" | "live" | "risk";
export type EdgeKind = "sync" | "async" | "event" | "batch" | "other";
export type SystemType = "app" | "service" | "datastore" | "queue" | "external";
export type SceneType = "overview" | "data-flows" | "by-domain" | "by-status";
export type Mode = "viewing" | "editing";
export type ColorScheme = "default" | "high-contrast" | "dark" | "minimal";

// Phase 6 - Project Management Types
export type ViewMode = "architecture" | "project" | "work" | "kanban";
export type InitiativeStatus = "planned" | "in progress" | "delayed" | "done";
export type WorkItemStatus = "todo" | "in progress" | "review" | "done" | "blocked";
export type ExternalRefType = "jira" | "devops" | "linear" | "other";
export type Priority = "critical" | "high" | "medium" | "low";
export type WorkItemType = "epic" | "feature" | "user-story" | "task" | "bug" | "test-case";
export type EffortUnit = "points" | "hours" | "days" | "weeks";
export type RiskLevel = "low" | "medium" | "high" | "critical";

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
  // Phase 6 - Project Management fields
  activeInitiatives?: string[];  // Array of initiative IDs
  workSummary?: WorkSummary;     // Aggregated work statistics
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
  sourceHandle?: string;   // NEW
  targetHandle?: string;   // NEW
  kind: EdgeKind;
  note?: string;
  animated?: boolean;
  connectionType?: string;
  
  // Connection editor properties
  label?: string;          // Custom label text
  lineStyle?: 'solid' | 'dashed' | 'dotted';  // Line style
  lineWeight?: 'thin' | 'normal' | 'bold';     // Line weight
  lineColor?: string;      // Custom line color
  elbowPoints?: Array<{ x: number; y: number }>; // Control points for elbow connections
  routing?: 'direct' | 'around'; // Routing preference
  
  // React Flow native marker properties (using EdgeMarker type)
  markerEnd?: {
    type: any; // Will be MarkerType.Arrow or MarkerType.ArrowClosed
    color?: string;
    width?: number;
    height?: number;
  };
  markerStart?: {
    type: any; // Will be MarkerType.Arrow or MarkerType.ArrowClosed
    color?: string;
    width?: number;
    height?: number;
  };
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
  
  // Connection state
  isConnecting: boolean;
  
  // Radial menu state
  radialMenu: {
    isVisible: boolean;
    position: { x: number; y: number };
    clickPosition: { x: number; y: number };
    edgeId?: string;
    edgeData?: any; // React Flow Edge object
  };
  
  // Edge selection state
  selectedEdgeId?: string;
  
  // Phase 6 - Project Management state
  viewMode: ViewMode;                    // Current view mode
  initiatives: Initiative[];              // All initiatives
  workItems: WorkItem[];                 // All work items
  selectedInitiativeId?: string;         // Currently selected initiative
  selectedWorkItemId?: string;           // Currently selected work item
  
  // Progress display settings
  progressDisplayMode: 'hidden' | 'tasks' | 'features' | 'story-points';
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
  initiatives?: Initiative[];  // Phase 6 - Optional for backward compatibility
  workItems?: WorkItem[];      // Phase 6 - Optional for backward compatibility
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

// Phase 6 - Project Management Interfaces

export interface Milestone {
  id: string;
  name: string;
  date: string;              // ISO date string
  description?: string;
  completed?: boolean;       // Defaults to false
  // Computed fields
  isOverdue?: boolean;       // Computed: date < today && !completed
  daysUntil?: number;        // Computed: days until milestone
}

export interface ExternalRef {
  type: ExternalRefType;
  id: string;               // External system ID
  url?: string;             // Direct link to external item
  title?: string;           // Title from external system
  state?: string;           // State from external system
}

export interface Initiative {
  id: string;
  name: string;
  description?: string;
  owner?: string;
  systems: string[];           // Array of system IDs
  edges?: string[];           // Array of edge IDs (optional)
  startDate?: string;         // ISO date string
  targetDate?: string;        // ISO date string
  status: InitiativeStatus;
  priority: Priority;         // Required priority
  progress?: number;          // 0-100 percentage (computed)
  color?: string;            // Hex color for visual distinction
  milestones?: Milestone[];   // Optional milestone tracking
  riskLevel?: RiskLevel;     // Risk assessment
  budget?: number;           // Budget allocation
  // Computed fields
  isOverdue?: boolean;       // Computed: targetDate < today && status !== 'done'
  daysRemaining?: number;    // Computed: days until targetDate
  completionRate?: number;   // Computed: progress over time
  blockedCount?: number;     // Computed: number of blocked work items
}

export interface WorkItem {
  id: string;
  title: string;
  description?: string;
  systemId: string;          // Required - must belong to a system
  assignee?: string;         // Person responsible
  status: WorkItemStatus;
  type: WorkItemType;        // Required work item type
  priority: Priority;        // Required priority
  effort?: EffortEstimation;  // Effort estimation
  blockers?: string[];       // Array of blocker descriptions
  dueDate?: string;          // ISO date string
  externalRef?: ExternalRef; // Link to external systems
  tags?: string[];           // For categorization
  progress?: number;         // 0-100 percentage
  riskLevel?: RiskLevel;     // Risk assessment
  // Azure DevOps inspired fields
  areaPath?: string;         // Area path (like Azure DevOps)
  iterationPath?: string;    // Sprint/iteration path
  parentId?: string;         // Parent work item (for hierarchy)
  children?: string[];       // Child work item IDs
  // Computed fields
  isOverdue?: boolean;      // Computed: dueDate < today && status !== 'done'
  daysRemaining?: number;   // Computed: days until dueDate
  isBlocked?: boolean;      // Computed: blockers.length > 0
  hasChildren?: boolean;    // Computed: children.length > 0
  effortRemaining?: number; // Computed: effort - completed effort
}

export interface EffortEstimation {
  unit: EffortUnit;         // Points, hours, days, weeks
  original: number;         // Original estimate
  remaining?: number;       // Remaining effort
  completed?: number;       // Completed effort
  // Computed fields
  isOverEstimate?: boolean; // Computed: completed > original
  accuracy?: number;        // Computed: accuracy percentage
}

export interface WorkSummary {
  total: number;           // Total work items
  done: number;            // Completed work items
  inProgress: number;      // Work items in progress
  blocked: number;         // Blocked work items
  overdue: number;         // Overdue work items
  // Computed fields
  completionRate?: number;  // Computed: done / total
  blockedRate?: number;    // Computed: blocked / total
  overdueRate?: number;    // Computed: overdue / total
}
