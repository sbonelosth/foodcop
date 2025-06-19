import React from 'react';

interface TimeoutWarningProps {
  countdown: number;
}

export const TimeoutWarning: React.FC<TimeoutWarningProps> = ({ countdown }) => (
  <div className="absolute top-20 left-4 right-4 z-10 bg-red-500/90 text-white p-3 rounded-lg backdrop-blur-sm">
    <p className="text-center font-medium">
      Scanner will reset in {countdown} seconds due to inactivity
    </p>
  </div>
);