import React from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { useAtlasStore } from '@/store/useAtlasStore';

export default function FullscreenButton() {
  const showFullscreen = useAtlasStore((state) => state.showFullscreen);
  const setShowFullscreen = useAtlasStore((state) => state.setShowFullscreen);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setShowFullscreen(true);
      } else {
        await document.exitFullscreen();
        setShowFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
    }
  };

  return (
    <button
      onClick={toggleFullscreen}
      className="btn btn-secondary flex items-center gap-2 pointer-events-auto"
      title={showFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      {showFullscreen ? (
        <Minimize className="w-4 h-4" />
      ) : (
        <Maximize className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">
        {showFullscreen ? 'Exit' : 'Fullscreen'}
      </span>
    </button>
  );
}



