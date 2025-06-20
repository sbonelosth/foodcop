import React from 'react';
import { RotateCcw } from 'lucide-react';

interface CameraControlsProps {
  facingMode: 'environment' | 'user';
  toggleCamera: () => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({ facingMode, toggleCamera }) => (
  <div className="flex justify-start items-center">
    {facingMode === 'user' && (
      <span className="fixed top-0 left-0 right-0 w-full text-sm text-center text-yellow-300 p-2 glass-bg z-10">
        Front camera - may have difficulty scanning
      </span>
    )}
    <div className="flex items-center space-x-4">
      <button
        onClick={toggleCamera}
        className="p-3 bg-black/30 hover:bg-black/50 rounded-full transition-colors backdrop-blur-sm scanner-button"
        title="Switch camera"
      >
        <RotateCcw className="w-6 h-6 text-white" />
      </button>
    </div>
  </div>
);