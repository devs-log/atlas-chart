import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Upload, 
  Settings, 
  Eye, 
  Edit3,
  File as FileIcon,
  Image as ImageIcon,
  FileDown
} from 'lucide-react';
import { useAtlasStore } from '@/store/useAtlasStore';
import { importJSON, importCSV, exportJSON, exportPNG, exportSVG, exportPDF, downloadFile, generateFilename } from '@/lib/importExport';

export default function MenuBar() {
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const mode = useAtlasStore((state) => state.mode);
  const setMode = useAtlasStore((state) => state.setMode);
  const setShowSettings = useAtlasStore((state) => state.setShowSettings);
  const systems = useAtlasStore((state) => state.systems);
  const edges = useAtlasStore((state) => state.edges);
  const setSystems = useAtlasStore((state) => state.setSystems);
  const setEdges = useAtlasStore((state) => state.setEdges);

  const handleImportJSON = async (file: File) => {
    try {
      const result = await importJSON(file);
      if (result.success) {
        setSystems(result.systems);
        setEdges(result.edges);
        alert(`Successfully imported ${result.systems.length} systems and ${result.edges.length} edges`);
      } else {
        alert(`Import failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleImportCSV = async (file: File) => {
    try {
      const result = await importCSV(file);
      if (result.success) {
        setSystems(result.systems);
        setEdges(result.edges);
        alert(`Successfully imported ${result.systems.length} systems`);
      } else {
        alert(`Import failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'json') {
      handleImportJSON(file);
    } else if (extension === 'csv') {
      handleImportCSV(file);
    } else {
      alert('Please select a JSON or CSV file');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExport = async (format: 'json' | 'png' | 'svg' | 'pdf') => {
    try {
      let blob: Blob;
      let filename: string;

      if (format === 'json') {
        blob = exportJSON(systems, edges);
        filename = generateFilename('json');
      } else {
        // For image/PDF exports, we need to get the canvas element
        const canvasElement = document.querySelector('.react-flow') as HTMLElement;
        if (!canvasElement) {
          alert('Could not find canvas element for export');
          return;
        }

        if (format === 'png') {
          blob = await exportPNG(canvasElement);
          filename = generateFilename('png', true);
        } else if (format === 'svg') {
          blob = await exportSVG(canvasElement);
          filename = generateFilename('svg', true);
        } else if (format === 'pdf') {
          blob = await exportPDF(canvasElement);
          filename = generateFilename('pdf', true);
        } else {
          throw new Error('Unsupported export format');
        }
      }

      downloadFile(blob, filename);
    } catch (error) {
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-b border-[var(--line)]">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left side - File operations */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowImportMenu(!showImportMenu)}
              className="btn btn-ghost flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            
            {showImportMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-[var(--line)] rounded-lg shadow-lg py-1 min-w-[160px] z-50">
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowImportMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  JSON File
                </button>
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowImportMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileIcon className="w-4 h-4" />
                  CSV File
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="btn btn-ghost flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            
            {showExportMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-[var(--line)] rounded-lg shadow-lg py-1 min-w-[160px] z-50">
                <button
                  onClick={() => {
                    handleExport('json');
                    setShowExportMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  JSON Data
                </button>
                <button
                  onClick={() => {
                    handleExport('png');
                    setShowExportMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  PNG Image
                </button>
                <button
                  onClick={() => {
                    handleExport('svg');
                    setShowExportMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  SVG Image
                </button>
                <button
                  onClick={() => {
                    handleExport('pdf');
                    setShowExportMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  PDF Document
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center - Mode toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setMode('viewing')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all ${
              mode === 'viewing'
                ? 'bg-white text-primary shadow-sm'
                : 'text-muted hover:text-primary'
            }`}
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button
            onClick={() => setMode('editing')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all ${
              mode === 'editing'
                ? 'bg-white text-primary shadow-sm'
                : 'text-muted hover:text-primary'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
        </div>

        {/* Right side - Settings */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSettings(true)}
            className="btn btn-ghost"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Click outside to close menus */}
      {(showImportMenu || showExportMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowImportMenu(false);
            setShowExportMenu(false);
          }}
        />
      )}
    </div>
  );
}
