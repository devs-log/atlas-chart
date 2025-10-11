import { z } from 'zod';
import type { System, SystemEdge } from './types';

// Status and type enums
const StatusSchema = z.enum(['planned', 'building', 'live', 'risk']);
const EdgeKindSchema = z.enum(['sync', 'async', 'event', 'batch', 'other']);
const SystemTypeSchema = z.enum(['app', 'service', 'datastore', 'queue', 'external']);
const LinkKindSchema = z.enum(['docs', 'repo', 'runbook', 'dashboard', 'other']);

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

export function validateAtlasData(data: unknown): { success: true; data: { systems: System[]; edges: SystemEdge[] } } | { success: false; errors: string[] } {
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

