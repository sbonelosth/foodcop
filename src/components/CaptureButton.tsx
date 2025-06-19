import React from 'react';

interface CaptureButtonProps {
  isFrozen: boolean;
  onClick: () => void;
}

export const CaptureButton: React.FC<CaptureButtonProps> = ({ isFrozen, onClick }) => (
  <button
    onClick={onClick}
    className={`p-4 rounded-full transition-all scanner-button shadow-lg ${
      isFrozen 
        ? 'bg-red-500 hover:bg-red-600' 
        : 'bg-white hover:bg-gray-100'
    }`}
  >
    <div className={`w-8 h-8 rounded-full ${
      isFrozen ? 'bg-white' : 'bg-red-500'
    }`}></div>
  </button>
);