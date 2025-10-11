import React, { useState, useEffect, useRef } from 'react';
import { 
  ExternalLink, 
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Play,
  ChevronDown,
  ChevronUp,
  Users,
  Tag,
  Link as LinkIcon,
  Database,
  Server,
  Globe,
  MessageSquare,
  Building
} from 'lucide-react';
import { useAtlasStore } from '@/store/useAtlasStore';
import { format } from 'date-fns';

interface DetailCardProps {
  nodeId: string;
}

const typeIcons = {
  app: Building,
  service: Server,
  datastore: Database,
  queue: MessageSquare,
  external: Globe,
};

const statusConfig = {
  live: { color: 'var(--ring-live)', icon: CheckCircle, label: 'Live' },
  building: { color: 'var(--ring-building)', icon: Play, label: 'Building' },
  planned: { color: 'var(--ring-planned)', icon: Clock, label: 'Planned' },
  risk: { color: 'var(--ring-risk)', icon: AlertTriangle, label: 'At Risk' },
};

export default function DetailCard({ nodeId }: DetailCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  
  const getSystemById = useAtlasStore((state) => state.getSystemById);
  const getInboundEdges = useAtlasStore((state) => state.getInboundEdges);
  const getOutboundEdges = useAtlasStore((state) => state.getOutboundEdges);
  
  const system = getSystemById(nodeId);
  const inboundEdges = getInboundEdges(nodeId);
  const outboundEdges = getOutboundEdges(nodeId);

  // Position the card near the selected node
  useEffect(() => {
    if (!system || !cardRef.current) return;

    const nodeElement = document.querySelector(`[data-id="${nodeId}"]`) as HTMLElement;
    if (!nodeElement) return;

    const rect = nodeElement.getBoundingClientRect();
    const cardWidth = 320; // Approximate card width
    const cardHeight = 400; // Approximate card height
    
    let x = rect.right + 20; // Default: to the right
    let y = rect.top;

    // Adjust if card would go off-screen
    if (x + cardWidth > window.innerWidth) {
      x = rect.left - cardWidth - 20; // Move to the left
    }
    
    if (y + cardHeight > window.innerHeight) {
      y = window.innerHeight - cardHeight - 20;
    }

    setPosition({ x, y });
  }, [nodeId, system]);

  if (!system) return null;

  const TypeIcon = typeIcons[system.type];
  const statusInfo = statusConfig[system.status];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not set';
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  const isOverdue = system.planned?.end && !system.actual?.goLive && 
    new Date(system.planned.end) < new Date();

  return (
    <div
      ref={cardRef}
      className="panel absolute z-50 w-80 max-h-[80vh] overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="p-4 border-b border-[var(--line)]">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <TypeIcon className="w-6 h-6 text-primary flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-primary truncate" title={system.name}>
                {system.name}
              </h3>
              <div className="text-sm text-muted capitalize">
                {system.type} • {system.domain}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <div 
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
              style={{ 
                backgroundColor: `${statusInfo.color}20`,
                color: statusInfo.color 
              }}
            >
              <statusInfo.icon className="w-3 h-3" />
              {statusInfo.label}
            </div>
          </div>
        </div>

        {/* Description */}
        {system.description && (
          <p className="text-sm text-muted leading-relaxed">
            {system.description}
          </p>
        )}
      </div>

      <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
        {/* Owner/Team */}
        {(system.owner || system.team) && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted" />
              <span className="text-sm font-medium text-primary">Team</span>
            </div>
            <div className="text-sm text-muted space-y-1">
              {system.owner && (
                <div>Owner: {system.owner}</div>
              )}
              {system.team && (
                <div>Team: {system.team}</div>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        {(system.planned || system.actual) && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-muted" />
              <span className="text-sm font-medium text-primary">Timeline</span>
            </div>
            <div className="text-sm text-muted space-y-1">
              {system.planned && (
                <div>
                  <div>Planned: {formatDate(system.planned.start)} → {formatDate(system.planned.end)}</div>
                  {isOverdue && (
                    <div className="text-red-600 font-medium">⚠️ Overdue</div>
                  )}
                </div>
              )}
              {system.actual && (
                <div>
                  <div>Started: {formatDate(system.actual.start)}</div>
                  {system.actual.goLive && (
                    <div>Live: {formatDate(system.actual.goLive)}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        {system.features && system.features.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-muted" />
              <span className="text-sm font-medium text-primary">Key Features</span>
            </div>
            <div className="text-sm text-muted space-y-1">
              {system.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dependencies */}
        {(inboundEdges.length > 0 || outboundEdges.length > 0) && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-muted" />
              <span className="text-sm font-medium text-primary">Dependencies</span>
            </div>
            <div className="text-sm text-muted space-y-2">
              {inboundEdges.length > 0 && (
                <div>
                  <div className="font-medium">Inbound ({inboundEdges.length})</div>
                  <div className="space-y-1">
                    {inboundEdges.slice(0, 3).map((edge) => (
                      <div key={edge.id} className="flex items-center gap-2">
                        <span className="text-primary">←</span>
                        <span className="truncate">{edge.note || 'Connected'}</span>
                      </div>
                    ))}
                    {inboundEdges.length > 3 && (
                      <div className="text-xs">+{inboundEdges.length - 3} more</div>
                    )}
                  </div>
                </div>
              )}
              
              {outboundEdges.length > 0 && (
                <div>
                  <div className="font-medium">Outbound ({outboundEdges.length})</div>
                  <div className="space-y-1">
                    {outboundEdges.slice(0, 3).map((edge) => (
                      <div key={edge.id} className="flex items-center gap-2">
                        <span className="text-primary">→</span>
                        <span className="truncate">{edge.note || 'Connected'}</span>
                      </div>
                    ))}
                    {outboundEdges.length > 3 && (
                      <div className="text-xs">+{outboundEdges.length - 3} more</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Links */}
        {system.links && system.links.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon className="w-4 h-4 text-muted" />
              <span className="text-sm font-medium text-primary">Links</span>
            </div>
            <div className="space-y-2">
              {system.links.slice(0, expanded ? undefined : 3).map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary-foreground transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span className="truncate">{link.label}</span>
                </a>
              ))}
              {system.links.length > 3 && !expanded && (
                <button
                  onClick={() => setExpanded(true)}
                  className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
                >
                  <ChevronDown className="w-3 h-3" />
                  Show {system.links.length - 3} more
                </button>
              )}
              {expanded && system.links.length > 3 && (
                <button
                  onClick={() => setExpanded(false)}
                  className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
                >
                  <ChevronUp className="w-3 h-3" />
                  Show less
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
