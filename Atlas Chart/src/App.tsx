import { useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useAtlasStore } from '@/store/useAtlasStore';
import Viewer from '@/pages/Viewer';
import Editor from '@/pages/Editor';
import WorkView from '@/pages/WorkView';
import SettingsPanel from '@/components/SettingsPanel';
import { loadExampleData } from '@/lib/importExport';

function App() {
  const mode = useAtlasStore((state) => state.mode);
  const viewMode = useAtlasStore((state) => state.viewMode);
  const systems = useAtlasStore((state) => state.systems);
  const edges = useAtlasStore((state) => state.edges);
  const setSystems = useAtlasStore((state) => state.setSystems);
  const setEdges = useAtlasStore((state) => state.setEdges);
  const syncFromURL = useAtlasStore((state) => state.syncFromURL);
  const showSettings = useAtlasStore((state) => state.showSettings);
  const setShowSettings = useAtlasStore((state) => state.setShowSettings);
  const colorScheme = useAtlasStore((state) => state.colorScheme);

  // Load example data on first mount
  useEffect(() => {
    // Only load example data if we have no systems AND no edges (fresh start)
    // This prevents overriding user-created connections during hot reloads
    if (systems.length === 0 && edges.length === 0) {
      const exampleData = loadExampleData();
      setSystems(exampleData.systems);
      setEdges(exampleData.edges);
    }
  }, [systems.length, edges.length, setSystems, setEdges]);

  // Sync URL state on mount
  useEffect(() => {
    syncFromURL();
  }, [syncFromURL]);

  // Apply color scheme on mount and when it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-color-scheme', colorScheme);
  }, [colorScheme]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useAtlasStore.getState().setShowCommandPalette(true);
      }

      // Cmd/Ctrl + 1 for fit to view
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        useAtlasStore.getState().fitToView();
      }

      // Cmd/Ctrl + 0 for reset camera
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        useAtlasStore.getState().resetCamera();
      }

      // Escape to close panels
      if (e.key === 'Escape') {
        const store = useAtlasStore.getState();
        if (store.showCommandPalette) {
          store.setShowCommandPalette(false);
        } else if (store.showDetailCard) {
          store.setShowDetailCard(false);
        } else if (store.showSettings) {
          store.setShowSettings(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderMainView = () => {
    if (viewMode === 'work') {
      return <WorkView />;
    }
    return mode === 'viewing' ? <Viewer /> : <Editor />;
  };

  // Only wrap ReactFlowProvider around views that actually use React Flow
  // WorkView doesn't need it and it interferes with @dnd-kit event handling
  const needsReactFlow = viewMode === 'architecture' || viewMode === 'project';

  const content = (
    <div className={`app-shell w-full h-full ${viewMode === 'kanban' ? '' : 'overflow-hidden'}`}>
      {renderMainView()}
      <SettingsPanel 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );

  return needsReactFlow ? (
    <ReactFlowProvider>
      {content}
    </ReactFlowProvider>
  ) : (
    content
  );
}

export default App;
