import React, { useEffect, useRef, useState } from 'react';
import { Type, Trash2, CornerUpRight, ArrowRight, Minus, Link, Bold, Palette, X, Move } from 'lucide-react';

interface ConnectionContextMenuProps {
  isVisible: boolean;
  position: { x: number; y: number };
  clickPosition: { x: number; y: number };
  edgeData?: any; // React Flow Edge object
  onClose: () => void;
  onAction: (action: string) => void;
}

const ConnectionContextMenu: React.FC<ConnectionContextMenuProps> = ({
  isVisible,
  position,
  clickPosition,
  edgeData,
  onClose,
  onAction,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [menuPosition, setMenuPosition] = useState(position);

  // Update menu position when props change
  useEffect(() => {
    setMenuPosition(position);
  }, [position]);



  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        setMenuPosition({
          x: event.clientX - dragOffset.x,
          y: event.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Close menu when pressing Escape or clicking outside
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      // Only close if we're not dragging and the click is outside the menu
      if (!isDragging && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      // Use a slight delay to avoid conflicts with edge click detection
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('click', handleClickOutside);
        clearTimeout(timeoutId);
      };
    }
  }, [isVisible, onClose, isDragging]);

  if (!isVisible) return null;

  const handleDragStart = (event: React.MouseEvent) => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      setDragOffset({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const menuItems = [
    { 
      id: 'add-label', 
      icon: Type, 
      label: 'Add Label',
      shortcut: 'L',
      description: 'Add a text label to this connection'
    },
    { 
      id: 'delete', 
      icon: Trash2, 
      label: 'Delete Connection',
      shortcut: 'Del',
      description: 'Remove this connection',
      destructive: true
    },
    { 
      id: 'add-elbow', 
      icon: CornerUpRight, 
      label: 'Add Elbow Point',
      shortcut: 'E',
      description: 'Add a control point to bend the connection'
    },
    { 
      id: 'routing', 
      icon: ArrowRight, 
      label: 'Change Routing',
      shortcut: 'R',
      description: 'Go under or around nodes'
    },
    { 
      id: 'connection-type', 
      icon: Minus, 
      label: 'Connection Type',
      shortcut: 'T',
      description: 'Straight, curved, or stepped'
    },
    { 
      id: 'line-style', 
      icon: Link, 
      label: 'Line Style',
      shortcut: 'S',
      description: 'Solid, dashed, or dotted'
    },
    { 
      id: 'line-weight', 
      icon: Bold, 
      label: 'Line Weight',
      shortcut: 'W',
      description: 'Thin, normal, or bold'
    },
    { 
      id: 'line-color', 
      icon: Palette, 
      label: 'Line Color',
      shortcut: 'C',
      description: 'Customize connection color'
    },
    { 
      id: 'arrow-markers', 
      icon: ArrowRight, 
      label: 'Arrow Markers',
      shortcut: 'A',
      description: 'Add arrow markers to connection'
    },
  ];

  return (
    <>
      {/* Context Menu */}
      <div
        ref={menuRef}
        style={{
          position: 'absolute',
          left: menuPosition.x,
          top: menuPosition.y,
          zIndex: 1001,
          pointerEvents: 'auto',
          cursor: isDragging ? 'grabbing' : 'default',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '4px',
            minWidth: '240px',
            maxWidth: '280px',
          }}
        >
          {/* Header with drag handle and close button */}
          <div
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid #f3f4f6',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={handleDragStart}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Move 
                size={14} 
                style={{ 
                  color: '#9ca3af',
                  cursor: isDragging ? 'grabbing' : 'grab',
                }} 
              />
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                  margin: 0,
                }}
              >
                Connection Options
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 20,
                height: 20,
                borderRadius: '4px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#9ca3af';
              }}
              title="Close menu"
            >
              <X size={14} />
            </button>
          </div>

          {/* Menu Items */}
          <div style={{ padding: '2px 0' }}>
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onAction(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    transition: 'background-color 0.15s ease',
                    textAlign: 'left',
                    gap: '12px',
                  }}
                  onMouseEnter={(e) => {
                    if (item.destructive) {
                      e.currentTarget.style.backgroundColor = '#fef2f2';
                    } else {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.destructive ? '#dc2626' : '#6b7280',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: item.destructive ? '#dc2626' : '#111827',
                        marginBottom: '2px',
                        lineHeight: '1.2',
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        lineHeight: '1.2',
                      }}
                    >
                      {item.description}
                    </div>
                  </div>
                  
                  {/* Shortcut */}
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#9ca3af',
                      backgroundColor: '#f3f4f6',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      flexShrink: 0,
                    }}
                  >
                    {item.shortcut}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ConnectionContextMenu;
