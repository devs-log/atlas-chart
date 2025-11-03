import React, { useMemo } from 'react';
import { useAtlasStore } from '@/store/useAtlasStore';
import WorkItemRow from './WorkItemRow';
import type { WorkItem } from '@/lib/types';

interface WorkItemListProps {
  workItems: WorkItem[];
  selectedSystemId?: string;
}

/**
 * WorkItemList - Organizes work items by status columns (Azure DevOps style)
 */
export default function WorkItemList({ workItems, selectedSystemId }: WorkItemListProps) {
  const workViewSearchQuery = useAtlasStore((state) => state.workViewSearchQuery);
  const systems = useAtlasStore((state) => state.systems);

  // Filter work items
  const filteredItems = useMemo(() => {
    let filtered = workItems;

    // Filter by system if selected
    if (selectedSystemId) {
      filtered = filtered.filter(item => item.systemId === selectedSystemId);
    }

    // Filter by search query
    if (workViewSearchQuery.trim()) {
      const query = workViewSearchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(query);
        const descMatch = item.description?.toLowerCase().includes(query) || false;
        const assigneeMatch = item.assignee?.toLowerCase().includes(query) || false;
        const tagMatch = item.tags?.some(tag => tag.toLowerCase().includes(query)) || false;
        const systemName = systems.find(s => s.id === item.systemId)?.name.toLowerCase() || '';
        const systemMatch = systemName.includes(query);
        
        return titleMatch || descMatch || assigneeMatch || tagMatch || systemMatch;
      });
    }

    return filtered;
  }, [workItems, selectedSystemId, workViewSearchQuery, systems]);

  // Group by status
  const itemsByStatus = useMemo(() => {
    const grouped: Record<string, WorkItem[]> = {
      todo: [],
      'in progress': [],
      review: [],
      blocked: [],
      done: [],
    };

    filteredItems.forEach(item => {
      const status = item.status;
      if (grouped[status]) {
        grouped[status].push(item);
      }
    });

    return grouped;
  }, [filteredItems]);

  const statusColumns = [
    { key: 'todo', label: 'To Do', count: itemsByStatus.todo.length },
    { key: 'in progress', label: 'In Progress', count: itemsByStatus['in progress'].length },
    { key: 'review', label: 'Review', count: itemsByStatus.review.length },
    { key: 'blocked', label: 'Blocked', count: itemsByStatus.blocked.length },
    { key: 'done', label: 'Done', count: itemsByStatus.done.length },
  ];

  if (filteredItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500 text-lg">No work items found</p>
          {selectedSystemId && (
            <p className="text-gray-400 text-sm mt-2">
              Try removing the system filter or search query
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-x-auto">
      <div className="flex gap-4 p-4 h-full min-w-max">
        {statusColumns.map(column => (
          <div
            key={column.key}
            className="flex flex-col bg-gray-50 rounded-lg border border-gray-200 min-w-[320px] max-w-[400px]"
          >
            {/* Column Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-gray-900">{column.label}</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {column.count}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {itemsByStatus[column.key as keyof typeof itemsByStatus].map(item => (
                <WorkItemRow key={item.id} workItem={item} />
              ))}
              {itemsByStatus[column.key as keyof typeof itemsByStatus].length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No items
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


