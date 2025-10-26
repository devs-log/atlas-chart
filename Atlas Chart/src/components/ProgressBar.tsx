import React from 'react';
import { useAtlasStore } from '@/store/useAtlasStore';

interface ProgressBarProps {
  systemId: string;
  onClick?: () => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ systemId, onClick }) => {
  const workItems = useAtlasStore((state) => state.workItems);
  const progressDisplayMode = useAtlasStore((state) => state.progressDisplayMode);
  
  // Don't show progress bar if mode is 'hidden'
  if (progressDisplayMode === 'hidden') {
    return null;
  }
  
  // Filter work items for this system
  const systemWorkItems = workItems.filter(item => item.systemId === systemId);
  
  if (systemWorkItems.length === 0) {
    return null;
  }
  
  // Calculate progress based on display mode
  let completed = 0;
  let total = 0;
  let displayText = '';
  
  switch (progressDisplayMode) {
    case 'tasks':
      completed = systemWorkItems.filter(item => item.status === 'done').length;
      total = systemWorkItems.length;
      displayText = `${completed}/${total} tasks`;
      break;
      
    case 'features':
      // Group by feature and count completed features
      const features = new Set(systemWorkItems.map(item => item.areaPath || 'Unassigned'));
      const completedFeatures = new Set(
        systemWorkItems
          .filter(item => item.status === 'done')
          .map(item => item.areaPath || 'Unassigned')
      );
      completed = completedFeatures.size;
      total = features.size;
      displayText = `${completed}/${total} features`;
      break;
      
    case 'story-points':
      // Sum story points (using effort estimation)
      completed = systemWorkItems
        .filter(item => item.status === 'done')
        .reduce((sum, item) => sum + (item.effort?.completed || 0), 0);
      total = systemWorkItems.reduce((sum, item) => sum + (item.effort?.original || 0), 0);
      displayText = `${completed}/${total} points`;
      break;
      
    default:
      return null;
  }
  
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return (
    <div 
      className="w-full mt-2 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={onClick}
    >
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
        <span className="font-medium">{percentage}% Completed</span>
        <span className="text-gray-500">({displayText})</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
