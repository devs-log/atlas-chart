import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, X } from 'lucide-react';
import { useAtlasStore } from '@/store/useAtlasStore';
import type { System } from '@/lib/types';

interface WorkToolbarProps {
  selectedSystem?: System | null;
  totalItems: number;
}

/**
 * WorkToolbar - Toolbar for WorkView with search, filters, and back navigation
 */
export default function WorkToolbar({ selectedSystem, totalItems }: WorkToolbarProps) {
  const setViewMode = useAtlasStore((state) => state.setViewMode);
  const setSelectedSystemIdForWorkView = useAtlasStore((state) => state.setSelectedSystemIdForWorkView);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Update global search state
  React.useEffect(() => {
    useAtlasStore.getState().setWorkViewSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleBack = () => {
    // Clear system filter when going back
    setSelectedSystemIdForWorkView(undefined);
    setViewMode('architecture');
  };

  const handleClearSystemFilter = () => {
    setSelectedSystemIdForWorkView(undefined);
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Back button and title */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="Back to Architecture view"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Work Items
            </h1>
            {selectedSystem && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">
                  Filtered by: <span className="font-medium text-gray-700">{selectedSystem.name}</span>
                </span>
                <button
                  onClick={handleClearSystemFilter}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Clear system filter"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Search and filters */}
        <div className="flex items-center gap-3 flex-1 max-w-2xl justify-end">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search work items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Item count */}
          <div className="text-sm text-gray-500 whitespace-nowrap">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </div>
        </div>
      </div>
    </div>
  );
}


