import { useCallback, useRef, useState } from 'react';

export const useInactivityTimer = (onTimeout: () => void, timeoutDuration = 30000) => {
  const inactivityTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [timeoutWarning, setTimeoutWarning] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    
    setTimeoutWarning(false);
    setCountdown(5);
    
    const warningTimeout = setTimeout(() => {
      setTimeoutWarning(true);
      let count = 5;
      setCountdown(count);
      
      const countdownInterval = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(countdownInterval);
          onTimeout();
        }
      }, 1000);
    }, timeoutDuration - 5000);
    
    inactivityTimeoutRef.current = warningTimeout;
  }, [onTimeout, timeoutDuration]);

  return {
    timeoutWarning,
    countdown,
    resetInactivityTimer,
  };
};