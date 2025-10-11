import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ReactFlowProvider } from 'reactflow';
import GraphView from '../GraphView';
import type { SystemNode } from '@/lib/types';

const mockSystem: SystemNode = {
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
  x: 100,
  y: 100,
  width: 200,
  height: 100,
};

// Helper function to render GraphView with ReactFlowProvider
const renderGraphView = (props: any) => {
  return render(
    <ReactFlowProvider>
      <GraphView {...props} />
    </ReactFlowProvider>
  );
};

describe('GraphView', () => {
  it('renders system name', () => {
    renderGraphView({ 
      id: "test-system",
      type: "system",
      data: mockSystem, 
      selected: false,
      zIndex: 1,
      isConnectable: true,
      xPos: 100,
      yPos: 100,
      dragging: false
    });
    expect(screen.getByText('Test System')).toBeInTheDocument();
  });

  it('renders system type and domain', () => {
    renderGraphView({ 
      id: "test-system",
      type: "system",
      data: mockSystem, 
      selected: false,
      zIndex: 1,
      isConnectable: true,
      xPos: 100,
      yPos: 100,
      dragging: false
    });
    expect(screen.getByText('service')).toBeInTheDocument();
    expect(screen.getByText('Test Domain')).toBeInTheDocument();
  });

  it('renders team and owner information', () => {
    renderGraphView({ 
      id: "test-system",
      type: "system",
      data: mockSystem, 
      selected: false,
      zIndex: 1,
      isConnectable: true,
      xPos: 100,
      yPos: 100,
      dragging: false
    });
    expect(screen.getByText('Test Owner')).toBeInTheDocument();
    expect(screen.getByText('Test Team')).toBeInTheDocument();
  });

  it('renders features', () => {
    renderGraphView({ 
      id: "test-system",
      type: "system",
      data: mockSystem, 
      selected: false,
      zIndex: 1,
      isConnectable: true,
      xPos: 100,
      yPos: 100,
      dragging: false
    });
    expect(screen.getByText('• Feature 1')).toBeInTheDocument();
    expect(screen.getByText('• Feature 2')).toBeInTheDocument();
  });

  it('renders tags', () => {
    renderGraphView({ 
      id: "test-system",
      type: "system",
      data: mockSystem, 
      selected: false,
      zIndex: 1,
      isConnectable: true,
      xPos: 100,
      yPos: 100,
      dragging: false
    });
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });

  it('applies selected styling when selected', () => {
    renderGraphView({ 
      id: "test-system",
      type: "system",
      data: mockSystem, 
      selected: true,
      zIndex: 1,
      isConnectable: true,
      xPos: 100,
      yPos: 100,
      dragging: false
    });
    const node = screen.getByText('Test System').closest('.node');
    expect(node).toHaveClass('selected');
  });

  it('shows correct status indicator', () => {
    renderGraphView({ 
      id: "test-system",
      type: "system",
      data: mockSystem, 
      selected: false,
      zIndex: 1,
      isConnectable: true,
      xPos: 100,
      yPos: 100,
      dragging: false
    });
    // Should have live status styling
    const node = screen.getByText('Test System').closest('.node');
    expect(node).toHaveAttribute('data-status', 'live');
  });
});
