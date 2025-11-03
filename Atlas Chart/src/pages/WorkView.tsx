import React from 'react';
import { useAtlasStore } from '@/store/useAtlasStore';
import WorkItemList from '@/components/WorkItemList';
import WorkToolbar from '@/components/WorkToolbar';

/**
 * WorkView - Main work item management view (Azure DevOps style)
 */
export default function WorkView() {
  const workItems = useAtlasStore((state) => state.workItems);
  const systems = useAtlasStore((state) => state.systems);
  const selectedSystemIdForWorkView = useAtlasStore((state) => state.selectedSystemIdForWorkView);

  const selectedSystem = selectedSystemIdForWorkView 
    ? systems.find(s => s.id === selectedSystemIdForWorkView)
    : null;

  const totalItems = workItems.length;

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <WorkToolbar 
        selectedSystem={selectedSystem} 
        totalItems={totalItems}
      />
      <div className="flex-1 overflow-auto p-4">
        <WorkItemList 
          workItems={workItems} 
          selectedSystemId={selectedSystemIdForWorkView}
        />
      </div>
    </div>
  );
}
