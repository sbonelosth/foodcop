import React from 'react';

interface ScanningFrameProps {
  isFrozen: boolean;
}

export const ScanningFrame: React.FC<ScanningFrameProps> = ({ isFrozen }) => (
  <>
    <div className="w-full absolute -top-16 left-1/2 transform -translate-x-1/2 text-center">
      <p className="text-white text-sm bg-black/50 px-3 py-1 rounded backdrop-blur-sm">
        {isFrozen ? 'Frame frozen - tap capture to resume' : 'Position barcode within frame'}
      </p>
    </div>
    
    <div className="w-64 h-40 border-2 border-white/70 rounded-lg relative">
      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
      
      {!isFrozen && (
        <div className="absolute inset-0 overflow-hidden rounded-lg animate-scan">
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
        </div>
      )}
    </div>
  </>
);