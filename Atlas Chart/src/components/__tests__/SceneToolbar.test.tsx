import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useAtlasStore } from '@/store/useAtlasStore';
import SceneToolbar from '../SceneToolbar';

// Mock the store
const mockSetViewMode = vi.fn();
const mockSetScene = vi.fn();

vi.mock('@/store/useAtlasStore', () => ({
  useAtlasStore: vi.fn((selector) => {
    const state = {
      scene: 'overview',
      viewMode: 'architecture',
      setScene: mockSetScene,
      setViewMode: mockSetViewMode,
    };
    return selector(state);
  }),
}));

describe('SceneToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders view mode dropdown with current mode', () => {
    render(<SceneToolbar />);
    
    // Should show current view mode
    expect(screen.getByText('Architecture')).toBeInTheDocument();
    expect(screen.getByTitle('System architecture view')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', () => {
    render(<SceneToolbar />);
    
    const dropdownButton = screen.getByText('Architecture').closest('button');
    fireEvent.click(dropdownButton!);
    
    // Should show all view mode options
    expect(screen.getByText('Project')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Kanban')).toBeInTheDocument();
  });

  it('calls setViewMode when selecting a different mode', () => {
    render(<SceneToolbar />);
    
    const dropdownButton = screen.getByText('Architecture').closest('button');
    fireEvent.click(dropdownButton!);
    
    const projectOption = screen.getByText('Project');
    fireEvent.click(projectOption);
    
    expect(mockSetViewMode).toHaveBeenCalledWith('project');
  });

  it('renders scene buttons', () => {
    render(<SceneToolbar />);
    
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Data Flows')).toBeInTheDocument();
    expect(screen.getByText('By Domain')).toBeInTheDocument();
    expect(screen.getByText('By Status')).toBeInTheDocument();
  });

  it('calls setScene when clicking scene button', () => {
    render(<SceneToolbar />);
    
    const dataFlowsButton = screen.getByText('Data Flows');
    fireEvent.click(dataFlowsButton);
    
    expect(mockSetScene).toHaveBeenCalledWith('data-flows');
  });
});
