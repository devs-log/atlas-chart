import { z } from 'zod';
import type { System, SystemEdge, Initiative, WorkItem, Milestone, ExternalRef, WorkSummary } from './types';

// Status and type enums
const StatusSchema = z.enum(['planned', 'building', 'live', 'risk']);
const EdgeKindSchema = z.enum(['sync', 'async', 'event', 'batch', 'other']);
const SystemTypeSchema = z.enum(['app', 'service', 'datastore', 'queue', 'external']);
const LinkKindSchema = z.enum(['docs', 'repo', 'runbook', 'dashboard', 'other']);

// Phase 6 - Project Management schemas
const ViewModeSchema = z.enum(['architecture', 'project', 'work', 'kanban']);
const InitiativeStatusSchema = z.enum(['planned', 'in progress', 'delayed', 'done']);
const WorkItemStatusSchema = z.enum(['todo', 'in progress', 'review', 'done', 'blocked']);
const ExternalRefTypeSchema = z.enum(['jira', 'devops', 'linear', 'other']);
const PrioritySchema = z.enum(['critical', 'high', 'medium', 'low']);
const WorkItemTypeSchema = z.enum(['epic', 'feature', 'user-story', 'task', 'bug', 'test-case']);
const EffortUnitSchema = z.enum(['points', 'hours', 'days', 'weeks']);
const RiskLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);

// Link schema
const LinkSchema = z.object({
  label: z.string().min(1, 'Link label is required'),
  url: z.string().url('Invalid URL format'),
  kind: LinkKindSchema.optional(),
});

// Dependency schema
const DependencySchema = z.object({
  targetId: z.string().min(1, 'Target ID is required'),
  kind: EdgeKindSchema.optional(),
  note: z.string().optional(),
});

// Timeline schema
const TimelineSchema = z.object({
  start: z.string().optional(),
  end: z.string().optional(),
  goLive: z.string().optional(),
});

// Phase 6 - Project Management schemas
const MilestoneSchema = z.object({
  id: z.string().min(1, 'Milestone ID is required'),
  name: z.string().min(1, 'Milestone name is required'),
  date: z.string().min(1, 'Milestone date is required'),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  isOverdue: z.boolean().optional(),
  daysUntil: z.number().optional(),
});

const ExternalRefSchema = z.object({
  type: ExternalRefTypeSchema,
  id: z.string().min(1, 'External ID is required'),
  url: z.string().url('Invalid URL format').optional(),
  title: z.string().optional(),
  state: z.string().optional(),
});

const EffortEstimationSchema = z.object({
  unit: EffortUnitSchema,
  original: z.number().min(0, 'Original effort must be non-negative'),
  remaining: z.number().min(0, 'Remaining effort must be non-negative').optional(),
  completed: z.number().min(0, 'Completed effort must be non-negative').optional(),
  isOverEstimate: z.boolean().optional(),
  accuracy: z.number().min(0).max(100).optional(),
});

const WorkSummarySchema = z.object({
  total: z.number().min(0, 'Total must be non-negative'),
  done: z.number().min(0, 'Done count must be non-negative'),
  inProgress: z.number().min(0, 'In progress count must be non-negative'),
  blocked: z.number().min(0, 'Blocked count must be non-negative'),
  overdue: z.number().min(0, 'Overdue count must be non-negative'),
  completionRate: z.number().min(0).max(100).optional(),
  blockedRate: z.number().min(0).max(100).optional(),
  overdueRate: z.number().min(0).max(100).optional(),
});

const InitiativeSchema = z.object({
  id: z.string().min(1, 'Initiative ID is required'),
  name: z.string().min(1, 'Initiative name is required'),
  description: z.string().optional(),
  owner: z.string().optional(),
  systems: z.array(z.string()).min(1, 'At least one system is required'),
  edges: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  status: InitiativeStatusSchema,
  priority: PrioritySchema,
  progress: z.number().min(0).max(100).optional(),
  color: z.string().optional(),
  milestones: z.array(MilestoneSchema).optional(),
  riskLevel: RiskLevelSchema.optional(),
  budget: z.number().min(0, 'Budget must be non-negative').optional(),
  isOverdue: z.boolean().optional(),
  daysRemaining: z.number().optional(),
  completionRate: z.number().min(0).max(100).optional(),
  blockedCount: z.number().min(0).optional(),
});

const WorkItemSchema = z.object({
  id: z.string().min(1, 'Work item ID is required'),
  title: z.string().min(1, 'Work item title is required'),
  description: z.string().optional(),
  systemId: z.string().min(1, 'System ID is required'),
  assignee: z.string().optional(),
  status: WorkItemStatusSchema,
  type: WorkItemTypeSchema,
  priority: PrioritySchema,
  effort: EffortEstimationSchema.optional(),
  blockers: z.array(z.string()).optional(),
  dueDate: z.string().optional(),
  externalRef: ExternalRefSchema.optional(),
  tags: z.array(z.string()).optional(),
  progress: z.number().min(0).max(100).optional(),
  riskLevel: RiskLevelSchema.optional(),
  areaPath: z.string().optional(),
  iterationPath: z.string().optional(),
  parentId: z.string().optional(),
  children: z.array(z.string()).optional(),
  isOverdue: z.boolean().optional(),
  daysRemaining: z.number().optional(),
  isBlocked: z.boolean().optional(),
  hasChildren: z.boolean().optional(),
  effortRemaining: z.number().min(0).optional(),
});

// System schema
export const SystemSchema: z.ZodSchema<System> = z.object({
  id: z.string().min(1, 'System ID is required'),
  name: z.string().min(1, 'System name is required'),
  type: SystemTypeSchema,
  domain: z.string().min(1, 'Domain is required'),
  team: z.string().optional(),
  owner: z.string().optional(),
  status: StatusSchema,
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  dependencies: z.array(DependencySchema).optional(),
  planned: TimelineSchema.optional(),
  actual: TimelineSchema.optional(),
  links: z.array(LinkSchema).optional(),
  colorOverride: z.string().optional(),
  // Phase 6 - Project Management fields
  activeInitiatives: z.array(z.string()).optional(),
  workSummary: WorkSummarySchema.optional(),
});

// System Edge schema
export const SystemEdgeSchema: z.ZodSchema<SystemEdge> = z.object({
  id: z.string().min(1, 'Edge ID is required'),
  source: z.string().min(1, 'Source ID is required'),
  target: z.string().min(1, 'Target ID is required'),
  kind: EdgeKindSchema,
  note: z.string().optional(),
  animated: z.boolean().optional(),
});

// Atlas data schema (complete dataset)
export const AtlasDataSchema = z.object({
  systems: z.array(SystemSchema),
  edges: z.array(SystemEdgeSchema),
  // Phase 6 - Project Management data (optional for backward compatibility)
  initiatives: z.array(InitiativeSchema).optional(),
  workItems: z.array(WorkItemSchema).optional(),
});

// CSV row schema for import
export const CSVRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: SystemTypeSchema,
  domain: z.string(),
  team: z.string().optional(),
  owner: z.string().optional(),
  status: StatusSchema,
  description: z.string().optional(),
  features: z.string().optional(), // JSON string
  tags: z.string().optional(), // JSON string
  dependencies: z.string().optional(), // JSON string
  links: z.string().optional(), // JSON string
});

// Validation helpers
export function validateSystem(data: unknown): { success: true; data: System } | { success: false; errors: string[] } {
  try {
    const system = SystemSchema.parse(data);
    return { success: true, data: system };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

export function validateSystemEdge(data: unknown): { success: true; data: SystemEdge } | { success: false; errors: string[] } {
  try {
    const edge = SystemEdgeSchema.parse(data);
    return { success: true, data: edge };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

export function validateAtlasData(data: unknown): { success: true; data: { systems: System[]; edges: SystemEdge[]; initiatives?: Initiative[]; workItems?: WorkItem[] } } | { success: false; errors: string[] } {
  try {
    const atlasData = AtlasDataSchema.parse(data);
    return { success: true, data: atlasData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

// Phase 6 - Project Management validation helpers
export function validateInitiative(data: unknown): { success: true; data: Initiative } | { success: false; errors: string[] } {
  try {
    const initiative = InitiativeSchema.parse(data);
    return { success: true, data: initiative };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

export function validateWorkItem(data: unknown): { success: true; data: WorkItem } | { success: false; errors: string[] } {
  try {
    const workItem = WorkItemSchema.parse(data);
    return { success: true, data: workItem };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

export function validateMilestone(data: unknown): { success: true; data: Milestone } | { success: false; errors: string[] } {
  try {
    const milestone = MilestoneSchema.parse(data);
    return { success: true, data: milestone };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

// Parse CSV helper
export function parseCSVValue(value: string | undefined): any {
  if (!value || value.trim() === '') return undefined;
  
  // Try to parse as JSON first
  try {
    return JSON.parse(value);
  } catch {
    // Return as string if not valid JSON
    return value;
  }
}

// Convert CSV row to System
export function csvRowToSystem(row: any): System {
  const features = parseCSVValue(row.features);
  const tags = parseCSVValue(row.tags);
  const dependencies = parseCSVValue(row.dependencies);
  const links = parseCSVValue(row.links);
  
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    domain: row.domain,
    team: row.team,
    owner: row.owner,
    status: row.status,
    description: row.description,
    features: Array.isArray(features) ? features : undefined,
    tags: Array.isArray(tags) ? tags : undefined,
    dependencies: Array.isArray(dependencies) ? dependencies : undefined,
    links: Array.isArray(links) ? links : undefined,
  };
}

