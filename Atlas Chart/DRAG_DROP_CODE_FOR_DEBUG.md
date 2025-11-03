# Drag and Drop Implementation Code - For Debugging

## Issue Description
Cards are not draggable - when clicking on a card, text selection happens instead of drag starting. The `@dnd-kit/core` library is being used but drag events don't fire.

## Dependencies
```json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2",
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

---

## 1. KanbanView.tsx - Main DndContext Setup

```tsx
import React, { useMemo, useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

export default function KanbanView() {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure drag sensors - allow immediate dragging
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 0, // Start dragging immediately on mouse down
      },
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    console.log('✅ Drag started!', {
      activeId: event.active.id,
      activeData: event.active.data.current,
    });
    setActiveId(event.active.id as string);
  };

  // Handle drag end - update work item status
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('Drag ended:', { active: active.id, over: over?.id });
    setActiveId(null);

    if (!over) {
      console.log('No drop target');
      return;
    }

    const workItemId = active.id as string;
    const newStatus = over.id as WorkItemStatus;

    // Validate and update work item status
    const validStatuses: WorkItemStatus[] = ['todo', 'in progress', 'review', 'blocked', 'done'];
    if (!validStatuses.includes(newStatus)) {
      return;
    }

    const workItem = workItems.find(w => w.id === workItemId);
    if (workItem && workItem.status !== newStatus) {
      updateWorkItem(workItemId, { status: newStatus });
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 relative">
      <div className="flex-1 overflow-hidden" style={{ position: 'relative' }}>
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => {
            console.log('Drag cancelled');
            setActiveId(null);
          }}
          onDragOver={(event) => {
            if (event.over) {
              console.log('Drag over:', event.over.id);
            }
          }}
        >
          <div className="h-full overflow-x-auto">
            <div className="flex gap-4 p-4 h-full min-w-max">
              {statusColumns.map(column => (
                <KanbanColumn
                  key={column.key}
                  status={column.key}
                  label={column.label}
                  color={column.color}
                >
                  {itemsByStatus[column.key].map(item => (
                    <KanbanCard key={item.id} workItem={item} />
                  ))}
                </KanbanColumn>
              ))}
            </div>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeItem ? (
              <div className="opacity-90 rotate-2">
                <KanbanCard workItem={activeItem} isDraggingOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
```

---

## 2. KanbanCard.tsx - Draggable Card Component

```tsx
import React, { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface KanbanCardProps {
  workItem: WorkItem;
  isDraggingOverlay?: boolean;
}

export default function KanbanCard({ workItem, isDraggingOverlay }: KanbanCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: workItem.id,
    disabled: isEditing || isDraggingOverlay,
    data: {
      type: 'workItem',
      workItem,
    },
  });

  const style: React.CSSProperties = {
    ...(transform ? { transform: CSS.Translate.toString(transform) } : {}),
    ...(isDragging ? { opacity: 0.5 } : {}),
  };

  // Debug: log listener structure
  useEffect(() => {
    console.log('KanbanCard useEffect - listeners check:', {
      id: workItem.id,
      isEditing,
      hasListeners: !!listeners,
      listenerKeys: listeners ? Object.keys(listeners) : [],
      listeners: listeners,
    });
  }, [listeners, isEditing, workItem.id]);

  // Apply listeners only when not editing
  const dragProps = isEditing ? {} : {
    ...attributes,
    ...listeners,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
      {...dragProps}
      className={`
        bg-white rounded-lg border border-gray-200 p-3
        hover:shadow-md transition-all duration-200 hover:border-blue-300
        ${isDragging ? 'shadow-xl scale-105 cursor-grabbing z-50' : isEditing ? 'cursor-default' : 'cursor-grab'}
        relative
        select-none
      `}
      onDoubleClick={(e) => {
        if (!isEditing) {
          e.stopPropagation();
          setIsEditing(true);
        }
      }}
      onSelectStart={(e) => {
        // Prevent text selection on drag
        if (!isEditing) {
          e.preventDefault();
        }
      }}
      onDragStart={(e) => {
        // Prevent native HTML drag
        if (!isEditing) {
          e.preventDefault();
        }
      }}
      onMouseDown={(e) => {
        if (!isEditing && listeners) {
          console.log('Card mouse down - checking listeners:', {
            id: workItem.id,
            hasListeners: !!listeners,
            listenerKeys: Object.keys(listeners),
            listeners: listeners,
          });
        }
      }}
    >
      {/* Card Content */}
      <div className="flex items-start justify-between gap-2 mb-2 group">
        <h4 className="font-medium text-sm text-gray-900 flex-1 line-clamp-2">
          {workItem.title}
        </h4>
        {!isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
          >
            <Edit2 className="w-3 h-3 text-gray-400" />
          </button>
        )}
      </div>

      {/* Description - pointer-events-none to let drag through */}
      {workItem.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2 pointer-events-none">
          {workItem.description}
        </p>
      )}

      {/* Other content with pointer-events-none */}
      {/* ... */}
    </div>
  );
}
```

---

## 3. KanbanColumn.tsx - Droppable Column

```tsx
import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export default function KanbanColumn({ status, label, color, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const itemCount = React.Children.count(children);

  return (
    <div className={`flex flex-col bg-gray-50 rounded-lg border-2 min-w-[320px] max-w-[400px] h-full transition-colors duration-200 ${isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}>
      {/* Column Header */}
      <div className={`px-4 py-3 border-b border-gray-200 rounded-t-lg ${color}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-900">{label}</h3>
          <span className="text-xs text-gray-600 bg-white/50 px-2 py-1 rounded font-medium">
            {itemCount}
          </span>
        </div>
      </div>

      {/* Column Content - This is the drop zone */}
      <div 
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px]"
      >
        {itemCount === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Drop items here
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
```

---

## Current Issue

**Symptom:** When clicking on a card to drag, text gets selected instead of drag starting. No drag events fire in console.

**What should happen:**
1. User clicks and holds on card
2. `handleDragStart` should fire and log "✅ Drag started!"
3. Card should become draggable
4. Card should move when mouse moves

**What actually happens:**
1. User clicks on card
2. Text gets selected (browser default behavior)
3. No drag events fire
4. Console shows "Card mouse down" log but no "Drag started" log

**Debug Info:**
- Console logs show `listeners` object exists but might be empty
- `listenerKeys` array shows what event handlers are in the listeners object
- Cards have `cursor-grab` class applied
- `userSelect: 'none'` is set in inline styles

---

## Questions to Debug

1. Are the `listeners` from `useDraggable` actually populated with event handlers?
2. Is the `PointerSensor` properly configured with `distance: 0`?
3. Are child elements blocking the drag events with their own handlers?
4. Is there a React version mismatch causing hook issues?
5. Should we use `MouseSensor` instead of `PointerSensor`?
6. Is the `disabled` prop on `useDraggable` somehow causing issues?
7. Are the `pointer-events-none` classes interfering with drag detection?

