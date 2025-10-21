import { MarkerType } from 'reactflow';
import { validateAtlasData, validateSystem, csvRowToSystem } from './validation';
import type { System, SystemEdge, ImportResult, ExportOptions } from './types';

// Load example data
export function loadExampleData(): { systems: System[]; edges: SystemEdge[] } {
  // This would typically load from the example JSON file
  // For now, return a simple example
  return {
    systems: [
      {
        id: 'hub',
        name: 'Customer Hub',
        type: 'app',
        domain: 'Customer Experience',
        team: 'Frontend Team',
        owner: 'Sarah Chen',
        status: 'live',
        description: 'Central customer portal and dashboard',
        features: ['User authentication', 'Dashboard views', 'Profile management'],
        tags: ['frontend', 'portal', 'customer-facing'],
        links: [
          {
            label: 'Production Dashboard',
            url: 'https://hub.company.com',
            kind: 'dashboard'
          }
        ]
      },
      {
        id: 'auth-service',
        name: 'Auth Service',
        type: 'service',
        domain: 'Security & Identity',
        team: 'Platform Team',
        owner: 'Mike Rodriguez',
        status: 'live',
        description: 'Centralized authentication and authorization service',
        features: ['OAuth 2.0', 'JWT tokens', 'RBAC', 'SSO integration'],
        tags: ['backend', 'security', 'identity'],
        dependencies: [
          {
            targetId: 'user-db',
            kind: 'sync',
            note: 'User data lookup'
          }
        ]
      },
      {
        id: 'user-db',
        name: 'User Database',
        type: 'datastore',
        domain: 'Data & Storage',
        team: 'Data Team',
        owner: 'Alex Kim',
        status: 'live',
        description: 'Primary user data storage with high availability',
        features: ['PostgreSQL', 'Read replicas', 'Backup & recovery', 'Encryption at rest'],
        tags: ['database', 'postgresql', 'primary']
      }
    ],
    edges: [
      {
        id: 'hub-auth',
        source: 'hub',
        target: 'auth-service',
        kind: 'sync',
        note: 'User authentication'
      },
      {
        id: 'auth-user-db',
        source: 'auth-service',
        target: 'user-db',
        kind: 'sync',
        note: 'User data lookup',
        markerEnd: {
          type: 'arrow',
          width: 20,
          height: 20,
          color: '#000000'
        }
      }
    ]
  };
}

// Import JSON data
export async function importJSON(file: File): Promise<ImportResult> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    const validation = validateAtlasData(data);
    if (!validation.success) {
      return {
        success: false,
        systems: [],
        edges: [],
        errors: validation.errors,
        warnings: []
      };
    }

    return {
      success: true,
      systems: validation.data.systems,
      edges: validation.data.edges,
      errors: [],
      warnings: []
    };
  } catch (error) {
    return {
      success: false,
      systems: [],
      edges: [],
      errors: [`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: []
    };
  }
}

// Import CSV data
export async function importCSV(file: File): Promise<ImportResult> {
  try {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return {
        success: false,
        systems: [],
        edges: [],
        errors: ['CSV file must have at least a header row and one data row'],
        warnings: []
      };
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim());
    
    // Parse data rows
    const systems: System[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== header.length) {
        warnings.push(`Row ${i + 1}: Column count mismatch, skipping`);
        continue;
      }

      const row: any = {};
      header.forEach((col, index) => {
        row[col] = values[index];
      });

      try {
        const system = csvRowToSystem(row);
        const validation = validateSystem(system);
        
        if (validation.success) {
          systems.push(validation.data);
        } else {
          errors.push(`Row ${i + 1}: ${validation.errors.join(', ')}`);
        }
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: errors.length === 0,
      systems,
      edges: [], // CSV import doesn't handle edges
      errors,
      warnings
    };
  } catch (error) {
    return {
      success: false,
      systems: [],
      edges: [],
      errors: [`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: []
    };
  }
}

// Export JSON data
export function exportJSON(systems: System[], edges: SystemEdge[]): Blob {
  const data = {
    systems,
    edges,
    exportedAt: new Date().toISOString(),
    version: '1.0.0'
  };
  
  const jsonString = JSON.stringify(data, null, 2);
  return new Blob([jsonString], { type: 'application/json' });
}

// Export PNG image
export async function exportPNG(
  element: HTMLElement,
  options: ExportOptions = { format: 'png' }
): Promise<Blob> {
  const htmlToImage = await import('html-to-image');
  
  const defaultOptions = {
    width: options.width || window.innerWidth,
    height: options.height || window.innerHeight,
    backgroundColor: '#ffffff',
    style: {
      transform: 'scale(1)',
      transformOrigin: 'top left',
    }
  };

  try {
    const dataUrl = await htmlToImage.toPng(element, defaultOptions);
    
    // Convert data URL to blob
    const response = await fetch(dataUrl);
    return await response.blob();
  } catch (error) {
    throw new Error(`Failed to export PNG: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Export SVG image
export async function exportSVG(
  element: HTMLElement,
  options: ExportOptions = { format: 'svg' }
): Promise<Blob> {
  const htmlToImage = await import('html-to-image');
  
  const defaultOptions = {
    width: options.width || window.innerWidth,
    height: options.height || window.innerHeight,
    backgroundColor: '#ffffff',
    style: {
      transform: 'scale(1)',
      transformOrigin: 'top left',
    }
  };

  try {
    const dataUrl = await htmlToImage.toSvg(element, defaultOptions);
    
    // Convert data URL to blob
    const response = await fetch(dataUrl);
    return await response.blob();
  } catch (error) {
    throw new Error(`Failed to export SVG: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Export PDF document
export async function exportPDF(
  element: HTMLElement
): Promise<Blob> {
  const html2pdf = (await import('html2pdf.js')).default;
  
  const opt = {
    margin: 1,
    filename: 'atlas-architecture.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true
    },
    jsPDF: { 
      unit: 'in', 
      format: 'letter', 
      orientation: 'landscape' 
    }
  };

  try {
    const pdfBlob = await html2pdf().from(element).set(opt).outputPdf('blob');
    return pdfBlob;
  } catch (error) {
    throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Download file helper
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export with filename generation
export function generateFilename(format: string, includeView: boolean = false): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const suffix = includeView ? '-view' : '';
  return `atlas-${timestamp}${suffix}.${format}`;
}
