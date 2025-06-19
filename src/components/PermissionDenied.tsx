import React from 'react';

interface PermissionDeniedProps {
  onRetry: () => void;
}

export const PermissionDenied: React.FC<PermissionDeniedProps> = ({ onRetry }) => (
  <div className="flex-1 flex items-center justify-center bg-gray-900 text-white p-8">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-400 rounded-full flex items-center justify-center">
        <span className="text-2xl">📷</span>
      </div>
      <h3 className="text-xl font-semibold mb-2">Camera Access Denied</h3>
      <p className="text-gray-300 mb-4">
        Please allow camera access to scan barcodes
      </p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
      >
        Retry
      </button>
    </div>
  </div>
);