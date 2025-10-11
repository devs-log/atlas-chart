import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, Building, Server, Database, MessageSquare, Globe } from 'lucide-react';
import Fuse from 'fuse.js';
import { useAtlasStore } from '@/store/useAtlasStore';

const typeIcons = {
  app: Building,
  service: Server,
  datastore: Database,
  queue: MessageSquare,
  external: Globe,
};

export default function CommandPalette() {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const systems = useAtlasStore((state) => state.systems);
  const setShowCommandPalette = useAtlasStore((state) => state.setShowCommandPalette);
  const setFocusNodeId = useAtlasStore((state) => state.setFocusNodeId);

  // Initialize Fuse.js for fuzzy search
  const fuse = useRef(new Fuse(systems, {
    keys: [
      { name: 'name', weight: 0.7 },
      { name: 'description', weight: 0.3 },
      { name: 'domain', weight: 0.5 },
      { name: 'team', weight: 0.4 },
      { name: 'owner', weight: 0.4 },
      { name: 'tags', weight: 0.2 },
      { name: 'features', weight: 0.1 },
    ],
    threshold: 0.3,
    includeScore: true,
  }));

  // Update Fuse when systems change
  useEffect(() => {
    fuse.current = new Fuse(systems, {
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'description', weight: 0.3 },
        { name: 'domain', weight: 0.5 },
        { name: 'team', weight: 0.4 },
        { name: 'owner', weight: 0.4 },
        { name: 'tags', weight: 0.2 },
        { name: 'features', weight: 0.1 },
      ],
      threshold: 0.3,
      includeScore: true,
    });
  }, [systems]);

  // Get search results
  const searchResults = query.trim() 
    ? fuse.current.search(query).map(result => result.item)
    : systems.slice(0, 10); // Show first 10 systems when no query

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          handleSelect(searchResults[selectedIndex].id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowCommandPalette(false);
        break;
    }
  };

  // Handle system selection
  const handleSelect = (systemId: string) => {
    setFocusNodeId(systemId);
    setShowCommandPalette(false);
  };

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = listRef.current?.children[selectedIndex] as HTMLElement;
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="panel w-full max-w-2xl mx-4">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-[var(--line)]">
          <Search className="w-5 h-5 text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search systems, domains, teams..."
            className="flex-1 text-lg bg-transparent outline-none placeholder:text-muted"
          />
          <div className="text-sm text-muted">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="max-h-96 overflow-y-auto custom-scrollbar"
        >
          {searchResults.length === 0 ? (
            <div className="p-4 text-center text-muted">
              No systems found
            </div>
          ) : (
            searchResults.map((system, index) => {
              const TypeIcon = typeIcons[system.type];
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={system.id}
                  onClick={() => handleSelect(system.id)}
                  className={`
                    w-full flex items-center gap-3 p-4 text-left transition-colors
                    ${isSelected ? 'bg-primary/10' : 'hover:bg-gray-50'}
                  `}
                >
                  <TypeIcon className="w-5 h-5 text-primary flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-primary truncate">
                      {system.name}
                    </div>
                    <div className="text-sm text-muted truncate">
                      {system.type} • {system.domain}
                    </div>
                    {system.description && (
                      <div className="text-xs text-muted mt-1 line-clamp-2">
                        {system.description}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {system.team && (
                      <div className="text-xs text-muted bg-gray-100 px-2 py-1 rounded">
                        {system.team}
                      </div>
                    )}
                    <ArrowRight className="w-4 h-4 text-muted" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--line)] bg-gray-50/50">
          <div className="flex items-center justify-between text-xs text-muted">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
            <div>
              Cmd/Ctrl + K to open
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
