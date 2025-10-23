import { SystemEdge } from './types';

export type ArrowStyle = 'solid' | 'hollow' | 'open' | 'none';
export type ArrowDirection = 'source' | 'target' | 'both' | 'none';
export type ArrowSize = 'small' | 'medium' | 'large';

export interface ArrowConfig {
  style: ArrowStyle;
  direction: ArrowDirection;
  size: ArrowSize;
  color?: string;
}

// Arrow size configurations
const ARROW_SIZES = {
  small: { width: 8, height: 8 },
  medium: { width: 12, height: 12 },
  large: { width: 16, height: 16 }
};

// Generate SVG arrow marker definitions
export const generateArrowMarkers = (edges: SystemEdge[]): string => {
  const markers = new Set<string>();
  
  console.log('generateArrowMarkers called with edges:', edges.length);
  
  edges.forEach(edge => {
    const config = getArrowConfig(edge);
    console.log('Edge config:', { edgeId: edge.id, config });
    if (config.style !== 'none') {
      const markerId = generateMarkerId(config);
      markers.add(markerId);
      console.log('Added marker:', markerId);
    }
  });
  
  const markerSVGs = Array.from(markers).map(markerId => {
    const config = parseMarkerId(markerId);
    const svg = generateMarkerSVG(markerId, config);
    console.log('Generated SVG for marker:', markerId, svg);
    return svg;
  }).join('\n');
  
  console.log('Total markers generated:', markers.size);
  console.log('Generated SVG:', markerSVGs);
  
  return markerSVGs;
};

// Get arrow configuration from edge
export const getArrowConfig = (edge: SystemEdge): ArrowConfig => ({
  style: edge.arrowStyle || 'solid',
  direction: edge.arrowDirection || 'target',
  size: edge.arrowSize || 'medium',
  color: edge.lineColor || '#3b82f6'
});

// Generate unique marker ID
const generateMarkerId = (config: ArrowConfig): string => {
  return `arrow-${config.style}-${config.direction}-${config.size}-${config.color?.replace('#', '') || 'default'}`;
};

// Parse marker ID back to config
const parseMarkerId = (markerId: string): ArrowConfig => {
  const parts = markerId.split('-');
  return {
    style: parts[1] as ArrowStyle,
    direction: parts[2] as ArrowDirection,
    size: parts[3] as ArrowSize,
    color: parts[4] && parts[4] !== 'default' ? `#${parts[4]}` : undefined
  };
};

// Generate SVG marker element
const generateMarkerSVG = (markerId: string, config: ArrowConfig): string => {
  const { style, direction, size, color } = config;
  const { width, height } = ARROW_SIZES[size];
  
  if (style === 'none') return '';
  
  const markerWidth = width;
  const markerHeight = height;
  const refX = direction === 'source' ? markerWidth : 0;
  const refY = markerHeight / 2;
  
  let path = '';
  
  switch (style) {
    case 'solid':
      path = `M 0 0 L ${markerWidth} ${markerHeight/2} L 0 ${markerHeight} Z`;
      break;
    case 'hollow':
      path = `M 0 0 L ${markerWidth} ${markerHeight/2} L 0 ${markerHeight} Z M 2 2 L ${markerWidth-2} ${markerHeight/2} L 2 ${markerHeight-2} Z`;
      break;
    case 'open':
      path = `M 0 0 L ${markerWidth} ${markerHeight/2} L 0 ${markerHeight}`;
      break;
  }
  
  return `
    <marker
      id="${markerId}"
      markerWidth="${markerWidth}"
      markerHeight="${markerHeight}"
      refX="${refX}"
      refY="${refY}"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <path
        d="${path}"
        fill="${color || '#3b82f6'}"
        stroke="${color || '#3b82f6'}"
        stroke-width="${style === 'open' ? '2' : '0'}"
        fill-rule="evenodd"
      />
    </marker>
  `;
};

// Get marker reference for an edge
export const getEdgeMarkerEnd = (edge: SystemEdge): string => {
  const config = getArrowConfig(edge);
  console.log('getEdgeMarkerEnd:', { edge: edge.id, config });
  if (config.style === 'none' || config.direction === 'source' || config.direction === 'none') {
    return '';
  }
  const markerId = generateMarkerId(config);
  console.log('markerEnd ID:', markerId);
  return `url(#${markerId})`;
};

export const getEdgeMarkerStart = (edge: SystemEdge): string => {
  const config = getArrowConfig(edge);
  console.log('getEdgeMarkerStart:', { edge: edge.id, config });
  if (config.style === 'none' || config.direction === 'target' || config.direction === 'none') {
    return '';
  }
  const markerId = generateMarkerId(config);
  console.log('markerStart ID:', markerId);
  return `url(#${markerId})`;
};
