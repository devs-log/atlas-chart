import React from 'react';
import { Settings, Palette, Monitor, Moon, Contrast, Minus } from 'lucide-react';
import { useAtlasStore } from '@/store/useAtlasStore';
import type { ColorScheme } from '@/lib/types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const colorSchemes: { value: ColorScheme; label: string; icon: React.ComponentType<any>; description: string }[] = [
  { value: 'default', label: 'Default', icon: Monitor, description: 'Forbion-inspired blue theme' },
  { value: 'high-contrast', label: 'High Contrast', icon: Contrast, description: 'Maximum visibility and accessibility' },
  { value: 'dark', label: 'Dark Mode', icon: Moon, description: 'Easy on the eyes in low light' },
  { value: 'minimal', label: 'Minimal', icon: Minus, description: 'Clean and subtle design' },
];

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const colorScheme = useAtlasStore((state) => state.colorScheme);
  const setColorScheme = useAtlasStore((state) => state.setColorScheme);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-25"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
              <p className="text-sm text-gray-500">Customize your Atlas experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Color Scheme Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-gray-600" />
              <h3 className="text-base font-medium text-gray-900">Color Scheme</h3>
            </div>
            
            <div className="space-y-3">
              {colorSchemes.map((scheme) => {
                const Icon = scheme.icon;
                const isSelected = colorScheme === scheme.value;
                
                return (
                  <button
                    key={scheme.value}
                    onClick={() => setColorScheme(scheme.value)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {scheme.label}
                        </div>
                        <div className={`text-sm ${
                          isSelected ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                          {scheme.description}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-base font-medium text-gray-900 mb-3">Preview</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-600">Live System</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm text-gray-600">Building System</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="text-sm text-gray-600">Planned System</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-sm text-gray-600">At Risk System</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="text-sm text-gray-500">
            Changes are applied immediately. Your preferences are saved locally.
          </div>
        </div>
      </div>
    </div>
  );
}
