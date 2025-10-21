import React, { useState, useEffect } from 'react';
import { MarkerType } from 'reactflow';
import { useAtlasStore } from '@/store/useAtlasStore';
import { 
  Type, 
  Trash2, 
  CornerUpRight, 
  ArrowRight, 
  Minus, 
  Link, 
  Bold, 
  Palette,
  Check,
  X,
  Zap
} from 'lucide-react';

interface ConnectionEditorProps {
  edgeId: string;
  edgeData: any;
  onClose: () => void;
  action: string;
}

const ConnectionEditor: React.FC<ConnectionEditorProps> = ({
  edgeId,
  edgeData,
  onClose,
  action
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [arrowStyle, setArrowStyle] = useState<string>('none');
  const [arrowLocation, setArrowLocation] = useState<string>('end');
  
  const {
    addConnectionLabel,
    deleteConnection,
    addElbowPoint,
    changeConnectionRouting,
    changeConnectionType,
    changeLineStyle,
    changeLineWeight,
    changeLineColor,
  } = useAtlasStore();

  useEffect(() => {
    // Initialize input values based on current edge data
    switch (action) {
      case 'add-label':
        setInputValue(edgeData?.label || edgeData?.note || '');
        break;
      case 'connection-type':
        setSelectedOption(edgeData?.connectionType || 'curved');
        break;
      case 'line-style':
        setSelectedOption(edgeData?.lineStyle || 'solid');
        break;
      case 'line-weight':
        setSelectedOption(edgeData?.lineWeight || 'normal');
        break;
      case 'line-color':
        setInputValue(edgeData?.lineColor || '#6b7280');
        break;
      case 'routing':
        setSelectedOption(edgeData?.routing || 'direct');
        break;
      case 'arrow-markers':
        // Initialize based on current edge marker state
        if (edgeData?.markerEnd) {
          setArrowStyle(edgeData.markerEnd.type === MarkerType.ArrowClosed ? 'solid' : 'hollow');
          setArrowLocation('end');
        } else if (edgeData?.markerStart) {
          setArrowStyle(edgeData.markerStart.type === MarkerType.ArrowClosed ? 'solid' : 'hollow');
          setArrowLocation('start');
        } else {
          setArrowStyle('none');
          setArrowLocation('end');
        }
        break;
    }
  }, [action, edgeData]);

  const handleSubmit = () => {
    switch (action) {
      case 'add-label':
        if (inputValue.trim()) {
          addConnectionLabel(edgeId, inputValue.trim());
        }
        break;
      case 'delete':
        deleteConnection(edgeId);
        break;
      case 'add-elbow':
        // First, ensure the connection is of type 'elbow'
        if (edgeData?.connectionType !== 'elbow') {
          changeConnectionType(edgeId, 'elbow');
        }
        // Add an elbow point at the midpoint of the connection
        // We need to calculate this based on the edge geometry
        const sourceNode = useAtlasStore.getState().getSystemById(edgeData?.source);
        const targetNode = useAtlasStore.getState().getSystemById(edgeData?.target);
        
        if (sourceNode && targetNode) {
          const sourceX = (sourceNode as any).x || 0;
          const sourceY = (sourceNode as any).y || 0;
          const targetX = (targetNode as any).x || 0;
          const targetY = (targetNode as any).y || 0;
          
          // Calculate midpoint
          const midX = (sourceX + targetX) / 2;
          const midY = (sourceY + targetY) / 2;
          
          console.log('Adding elbow point at midpoint:', { midX, midY });
          addElbowPoint(edgeId, { x: midX, y: midY });
        } else {
          console.warn('Could not find source or target node for edge:', edgeId);
        }
        break;
      case 'routing':
        changeConnectionRouting(edgeId, selectedOption as 'direct' | 'around');
        break;
      case 'connection-type':
        changeConnectionType(edgeId, selectedOption);
        break;
      case 'line-style':
        changeLineStyle(edgeId, selectedOption as 'solid' | 'dashed' | 'dotted');
        break;
      case 'line-weight':
        changeLineWeight(edgeId, selectedOption as 'thin' | 'normal' | 'bold');
        break;
      case 'line-color':
        changeLineColor(edgeId, inputValue);
        break;
      case 'arrow-markers':
        // Apply the selected arrow style and location to this specific edge
        const marker = arrowStyle === 'none' 
          ? undefined 
          : { type: arrowStyle }; // 'solid' or 'hollow' - store will normalize to MarkerType

        const start = arrowLocation === 'start' || arrowLocation === 'both' ? marker : undefined;
        const end = arrowLocation === 'end' || arrowLocation === 'both' ? marker : undefined;

        useAtlasStore.getState().updateEdge(edgeId, {
          markerStart: start,
          markerEnd: end,
        });
        break;
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const renderContent = () => {
    switch (action) {
      case 'add-label':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connection Label
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter connection label..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>
        );

      case 'delete':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <Trash2 className="w-5 h-5" />
              <span className="font-medium">Delete Connection</span>
            </div>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this connection? This action cannot be undone.
            </p>
          </div>
        );

      case 'connection-type':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Connection Type
              </label>
              <div className="space-y-2">
                {[
                  { value: 'curved', label: 'Curved', icon: Link },
                  { value: 'straight', label: 'Straight', icon: Minus },
                  { value: 'step', label: 'Step', icon: CornerUpRight },
                  { value: 'elbow', label: 'Elbow', icon: Zap },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSelectedOption(option.value)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md border transition-colors ${
                        selectedOption === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{option.label}</span>
                      {selectedOption === option.value && (
                        <Check className="w-4 h-4 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'line-style':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Line Style
              </label>
              <div className="space-y-2">
                {[
                  { value: 'solid', label: 'Solid' },
                  { value: 'dashed', label: 'Dashed' },
                  { value: 'dotted', label: 'Dotted' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedOption(option.value)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md border transition-colors ${
                      selectedOption === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-6 h-0.5 border-t-2 ${
                      option.value === 'solid' ? 'border-t-2 border-solid' :
                      option.value === 'dashed' ? 'border-t-2 border-dashed' :
                      'border-t-2 border-dotted'
                    }`} />
                    <span>{option.label}</span>
                    {selectedOption === option.value && (
                      <Check className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'line-weight':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Line Weight
              </label>
              <div className="space-y-2">
                {[
                  { value: 'thin', label: 'Thin', weight: 1 },
                  { value: 'normal', label: 'Normal', weight: 2 },
                  { value: 'bold', label: 'Bold', weight: 3 },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedOption(option.value)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md border transition-colors ${
                      selectedOption === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="w-6 h-0.5 bg-gray-600"
                      style={{ height: `${option.weight}px` }}
                    />
                    <span>{option.label}</span>
                    {selectedOption === option.value && (
                      <Check className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'line-color':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Line Color
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="#6b7280"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-6 gap-2 mt-3">
                {[
                  '#6b7280', '#dc2626', '#ea580c', '#d97706', 
                  '#059669', '#0891b2', '#7c3aed', '#be185d'
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => setInputValue(color)}
                    className={`w-8 h-8 rounded border-2 ${
                      inputValue === color ? 'border-blue-500' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'routing':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Connection Routing
              </label>
              <div className="space-y-2">
                {[
                  { value: 'direct', label: 'Direct', description: 'Go straight between nodes' },
                  { value: 'around', label: 'Around', description: 'Route around other nodes' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedOption(option.value)}
                    className={`w-full flex flex-col items-start gap-1 px-3 py-2 rounded-md border transition-colors ${
                      selectedOption === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-gray-500">{option.description}</span>
                    {selectedOption === option.value && (
                      <Check className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'add-elbow':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <Zap className="w-5 h-5" />
              <span className="font-medium">Elbow Points</span>
            </div>
            <p className="text-sm text-gray-600">
              Manage elbow points for custom connection routing. Double-click on the connection to add points, right-click points to remove them.
            </p>
            {edgeData?.elbowPoints && edgeData.elbowPoints.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Current Points:</div>
                <div className="space-y-1">
                  {edgeData.elbowPoints.map((point: any, index: number) => (
                    <div key={index} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md">
                      <span className="text-sm text-gray-600">
                        Point {index + 1}: ({Math.round(point.x)}, {Math.round(point.y)})
                      </span>
                      <button
                        onClick={() => {
                          const newPoints = edgeData.elbowPoints.filter((_: any, i: number) => i !== index);
                          useAtlasStore.getState().updateEdge(edgeId, { elbowPoints: newPoints });
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="text-xs text-gray-500">
              💡 Tip: Select the connection and double-click anywhere on it to add a new elbow point at that location.
            </div>
          </div>
        );

      case 'arrow-markers':
        return (
          <div className="space-y-6">
            {/* Arrow Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Arrow Style
              </label>
              <div className="space-y-2">
                {[
                  { value: 'none', label: 'None', description: 'No arrow marker' },
                  { value: 'hollow', label: 'Hollow', description: 'Clean outline arrow' },
                  { value: 'solid', label: 'Solid', description: 'Filled arrow' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setArrowStyle(option.value)}
                    className={`w-full flex items-center justify-between p-3 rounded-md border transition-colors ${
                      arrowStyle === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                    {arrowStyle === option.value && (
                      <Check className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Arrow Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Arrow Location
              </label>
              <div className="space-y-2">
                {[
                  { value: 'start', label: 'Start', description: 'Arrow at connection start' },
                  { value: 'end', label: 'End', description: 'Arrow at connection end' },
                  { value: 'both', label: 'Both', description: 'Arrows at both ends' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setArrowLocation(option.value)}
                    className={`w-full flex items-center justify-between p-3 rounded-md border transition-colors ${
                      arrowLocation === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                    {arrowLocation === option.value && (
                      <Check className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (action) {
      case 'add-label': return 'Add Label';
      case 'delete': return 'Delete Connection';
      case 'add-elbow': return 'Elbow Points';
      case 'routing': return 'Change Routing';
      case 'connection-type': return 'Connection Type';
      case 'line-style': return 'Line Style';
      case 'line-weight': return 'Line Weight';
      case 'line-color': return 'Line Color';
      case 'arrow-markers': return 'Arrow Markers';
      default: return 'Connection Options';
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[300px] max-w-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{getTitle()}</h3>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
            action === 'delete' 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {action === 'delete' ? 'Delete' : 'Apply'}
        </button>
      </div>
    </div>
  );
};

export default ConnectionEditor;
