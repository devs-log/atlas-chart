import React from 'react';
import { 
  Settings, 
  Type, 
  Tag, 
  Users, 
  Link as LinkIcon,
  Trash2,
  Copy
} from 'lucide-react';
import { useAtlasStore } from '@/store/useAtlasStore';

export default function InspectorPanel() {
  const selectedNodeId = useAtlasStore((state) => state.selectedNodeId);
  const getSystemById = useAtlasStore((state) => state.getSystemById);
  const updateSystem = useAtlasStore((state) => state.updateSystem);
  const removeSystem = useAtlasStore((state) => state.removeSystem);

  const system = selectedNodeId ? getSystemById(selectedNodeId) : null;

  if (!system) {
    return (
      <div className="panel-glass w-80 h-full pointer-events-auto">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-muted" />
            <h3 className="font-semibold text-primary">Inspector</h3>
          </div>
          <div className="text-sm text-muted text-center py-8">
            Select a node to inspect its properties
          </div>
        </div>
      </div>
    );
  }

  const handlePropertyChange = (property: string, value: any) => {
    updateSystem(system.id, { [property]: value });
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${system.name}"?`)) {
      removeSystem(system.id);
    }
  };

  const handleDuplicate = () => {
    // TODO: Implement duplicate functionality
    console.log('Duplicate system:', system.id);
  };

  return (
    <div className="panel-glass w-80 h-full overflow-y-auto custom-scrollbar pointer-events-auto">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-muted" />
            <h3 className="font-semibold text-primary">Inspector</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleDuplicate}
              className="p-1 text-muted hover:text-primary transition-colors"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-muted hover:text-red-600 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Properties */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-muted" />
              <h4 className="font-medium text-primary">Basic Properties</h4>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={system.name}
                  onChange={(e) => handlePropertyChange('name', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Type
                </label>
                <select
                  value={system.type}
                  onChange={(e) => handlePropertyChange('type', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="app">App</option>
                  <option value="service">Service</option>
                  <option value="datastore">Data Store</option>
                  <option value="queue">Queue</option>
                  <option value="external">External</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Domain
                </label>
                <input
                  type="text"
                  value={system.domain}
                  onChange={(e) => handlePropertyChange('domain', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Status
                </label>
                <select
                  value={system.status}
                  onChange={(e) => handlePropertyChange('status', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="planned">Planned</option>
                  <option value="building">Building</option>
                  <option value="live">Live</option>
                  <option value="risk">At Risk</option>
                </select>
              </div>
            </div>
          </div>

          {/* Team & Owner */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-muted" />
              <h4 className="font-medium text-primary">Team & Owner</h4>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Team
                </label>
                <input
                  type="text"
                  value={system.team || ''}
                  onChange={(e) => handlePropertyChange('team', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Owner
                </label>
                <input
                  type="text"
                  value={system.owner || ''}
                  onChange={(e) => handlePropertyChange('owner', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Description
            </label>
            <textarea
              value={system.description || ''}
              onChange={(e) => handlePropertyChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              placeholder="Describe the system's purpose and functionality..."
            />
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-muted" />
              <h4 className="font-medium text-primary">Tags</h4>
            </div>
            
            <div>
              <input
                type="text"
                value={system.tags?.join(', ') || ''}
                onChange={(e) => {
                  const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                  handlePropertyChange('tags', tags);
                }}
                className="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter tags separated by commas..."
              />
              <div className="text-xs text-muted mt-1">
                Separate tags with commas
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LinkIcon className="w-4 h-4 text-muted" />
              <h4 className="font-medium text-primary">Links</h4>
            </div>
            
            <div className="space-y-2">
              {system.links?.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => {
                      const newLinks = [...(system.links || [])];
                      newLinks[index] = { ...link, label: e.target.value };
                      handlePropertyChange('links', newLinks);
                    }}
                    className="flex-1 px-2 py-1 text-sm border border-[var(--line)] rounded focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                    placeholder="Link label"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...(system.links || [])];
                      newLinks[index] = { ...link, url: e.target.value };
                      handlePropertyChange('links', newLinks);
                    }}
                    className="flex-1 px-2 py-1 text-sm border border-[var(--line)] rounded focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                    placeholder="URL"
                  />
                </div>
              ))}
              
              <button
                onClick={() => {
                  const newLinks = [...(system.links || []), { label: '', url: '' }];
                  handlePropertyChange('links', newLinks);
                }}
                className="w-full px-3 py-2 text-sm text-muted border border-dashed border-[var(--line)] rounded-lg hover:border-primary hover:text-primary transition-colors"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
