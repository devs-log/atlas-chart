import React from 'react';
import { Calendar, AlertTriangle, ExternalLink, Tag } from 'lucide-react';
import { useAtlasStore } from '@/store/useAtlasStore';
import { format, isPast, isToday, differenceInDays } from 'date-fns';
import type { WorkItem } from '@/lib/types';

interface WorkItemRowProps {
  workItem: WorkItem;
}

/**
 * WorkItemRow - Individual work item card component
 */
export default function WorkItemRow({ workItem }: WorkItemRowProps) {
  const systems = useAtlasStore((state) => state.systems);
  const selectWorkItem = useAtlasStore((state) => state.selectWorkItem);

  const system = systems.find(s => s.id === workItem.systemId);

  // Status colors
  const statusColors: Record<string, string> = {
    todo: 'bg-gray-100 text-gray-700',
    'in progress': 'bg-blue-100 text-blue-700',
    review: 'bg-yellow-100 text-yellow-700',
    blocked: 'bg-red-100 text-red-700',
    done: 'bg-green-100 text-green-700',
  };

  // Priority colors
  const priorityColors: Record<string, string> = {
    critical: 'text-red-600',
    high: 'text-orange-600',
    medium: 'text-yellow-600',
    low: 'text-gray-600',
  };

  // Get assignee initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Format due date with status indicator
  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    
    if (isPast(date) && !isToday(date) && workItem.status !== 'done') {
      const daysOverdue = differenceInDays(today, date);
      return { text: format(date, 'MMM d'), isOverdue: true, daysOverdue };
    }
    if (isToday(date)) {
      return { text: 'Today', isOverdue: false, isToday: true };
    }
    return { text: format(date, 'MMM d'), isOverdue: false };
  };

  const dueDateInfo = formatDueDate(workItem.dueDate);

  const handleClick = () => {
    selectWorkItem(workItem.id);
    // TODO: Open work item detail panel/modal
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow hover:border-blue-300"
    >
      {/* Header: Title and Status */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm text-gray-900 flex-1 line-clamp-2">
          {workItem.title}
        </h4>
        <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${statusColors[workItem.status] || statusColors.todo}`}>
          {workItem.status}
        </span>
      </div>

      {/* System Badge */}
      {system && (
        <div className="mb-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
            {system.name}
          </span>
        </div>
      )}

      {/* Assignee and Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        {workItem.assignee && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
              {getInitials(workItem.assignee)}
            </div>
            <span className="text-xs text-gray-600 truncate">{workItem.assignee}</span>
          </div>
        )}
        {workItem.priority && (
          <span className={`text-xs font-medium ${priorityColors[workItem.priority] || priorityColors.medium}`}>
            {workItem.priority}
          </span>
        )}
      </div>

      {/* Tags */}
      {workItem.tags && workItem.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {workItem.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
          {workItem.tags.length > 3 && (
            <span className="text-xs text-gray-400">+{workItem.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer: Due Date and External Ref */}
      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-4">
          {dueDateInfo && (
            <div className={`flex items-center gap-1 text-xs ${dueDateInfo.isOverdue ? 'text-red-600' : dueDateInfo.isToday ? 'text-blue-600' : 'text-gray-500'}`}>
              <Calendar className="w-3 h-3" />
              <span>{dueDateInfo.text}</span>
              {dueDateInfo.isOverdue && (
                <span className="ml-1">({dueDateInfo.daysOverdue}d overdue)</span>
              )}
            </div>
          )}
          {workItem.blockers && workItem.blockers.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-red-600">
              <AlertTriangle className="w-3 h-3" />
              <span>{workItem.blockers.length} blocker{workItem.blockers.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        {workItem.externalRef && (
          <a
            href={workItem.externalRef.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-gray-400 hover:text-blue-600 transition-colors"
            title={`Open in ${workItem.externalRef.type}`}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Progress Bar */}
      {workItem.progress !== undefined && workItem.progress > 0 && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${workItem.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

