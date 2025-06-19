import React from 'react';
import { RotateCcw } from 'lucide-react';

interface CameraControlsProps {
  facingMode: 'environment' | 'user';
  toggleCamera: () => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({ facingMode, toggleCamera }) => (
  <div className="absolute top-4 left-4 right-16 z-10 flex justify-start items-center">
    <div className="flex items-center space-x-4">
      <button
        onClick={toggleCamera}
        className="p-3 bg-black/30 hover:bg-black/50 rounded-full transition-colors backdrop-blur-sm scanner-button"
        title="Switch camera"
      >
        <RotateCcw className="w-6 h-6 text-white" />
      </button>
      {facingMode === 'user' && (
        <span className="text-xs text-yellow-300 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
          Front camera - may have difficulty scanning
        </span>
      )}
    </div>
  </div>
);