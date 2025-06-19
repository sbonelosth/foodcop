import React, { useCallback, useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';
import { X, Camera, Share2, RotateCcw } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, isOpen, onClose }) => {
  const webcamRef = useRef<Webcam>(null);
  const codeReader = new BrowserMultiFormatReader();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const inactivityTimeoutRef = useRef<NodeJS.Timeout>();
  
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isScanning, setIsScanning] = useState(true);
  const [isFrozen, setIsFrozen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [showShareButton, setShowShareButton] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [timeoutWarning, setTimeoutWarning] = useState(false);
  const [countdown, setCountdown] = useState(20);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    
    setTimeoutWarning(false);
    setCountdown(20);
    
    // Start countdown at 15 seconds (5 seconds warning)
    const warningTimeout = setTimeout(() => {
      setTimeoutWarning(true);
      let count = 5;
      setCountdown(count);
      
      const countdownInterval = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(countdownInterval);
          onClose();
        }
      }, 1000);
    }, 15000);
    
    inactivityTimeoutRef.current = warningTimeout;
  }, [onClose]);

  const toggleCamera = useCallback(() => {
    setFacingMode(current => current === 'environment' ? 'user' : 'environment');
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const toggleFreeze = useCallback(() => {
    setIsFrozen(prev => !prev);
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const handleShare = useCallback(async () => {
    if (!scannedBarcode) return;
    
    const shareData = {
      title: 'FoodCop - Scanned Product',
      text: `I scanned a product with barcode: ${scannedBarcode}`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`Product barcode: ${scannedBarcode}\nScanned with FoodCop: ${window.location.href}`);
        alert('Barcode information copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`Product barcode: ${scannedBarcode}\nScanned with FoodCop: ${window.location.href}`);
        alert('Barcode information copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
      }
    }
    resetInactivityTimer();
  }, [scannedBarcode, resetInactivityTimer]);

  const capture = useCallback(async () => {
    if (!isScanning || isFrozen) return;
    
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      try {
        const result = await codeReader.decodeFromImage(undefined, imageSrc);
        if (result) {
          const barcode = result.getText();
          setScannedBarcode(barcode);
          setShowShareButton(true);
          setIsScanning(false);
          onScan(barcode);
          
          // Auto-close after successful scan
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } catch (error) {
        // Continue scanning if no barcode is detected
      }
    }
  }, [codeReader, onScan, onClose, isScanning, isFrozen]);

  const handleUserMedia = useCallback(() => {
    setPermissionDenied(false);
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    console.error('Camera error:', error);
    setPermissionDenied(true);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && isScanning && !isFrozen) {
      interval = setInterval(capture, 300); // Faster scanning
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, capture, isScanning, isFrozen]);

  useEffect(() => {
    if (isOpen) {
      resetInactivityTimer();
    }
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      codeReader.reset();
    };
  }, [isOpen, resetInactivityTimer, codeReader]);

  if (!isOpen) return null;

  const videoConstraints = {
    facingMode,
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleCamera}
            className="p-3 bg-black/30 hover:bg-black/50 rounded-full transition-colors backdrop-blur-sm"
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
        
        <button
          onClick={onClose}
          className="p-3 bg-black/30 hover:bg-black/50 rounded-full transition-colors backdrop-blur-sm"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Timeout Warning */}
      {timeoutWarning && (
        <div className="absolute top-20 left-4 right-4 z-10 bg-red-500/90 text-white p-3 rounded-lg backdrop-blur-sm">
          <p className="text-center font-medium">
            Camera will close in {countdown} seconds due to inactivity
          </p>
        </div>
      )}

      {/* Camera Feed */}
      <div className="flex-1 relative overflow-hidden">
        {permissionDenied ? (
          <div className="flex-1 flex items-center justify-center bg-gray-900 text-white p-8">
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Camera Access Denied</h3>
              <p className="text-gray-300 mb-4">
                Please allow camera access to scan barcodes
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={videoConstraints}
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              style={{ filter: isFrozen ? 'brightness(0.7)' : 'none' }}
            />
            
            {/* Scanning Frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                {/* Instructions */}
                <div className="mt-4 text-center pb-4">
                  <p className="text-white text-sm bg-black/50 px-3 py-1 rounded backdrop-blur-sm">
                    {isFrozen ? 'Frame frozen - tap capture to resume' : 'Position barcode within frame'}
                  </p>
                </div>
                {/* Main scanning frame */}
                <div className="w-64 h-40 border-2 border-white/70 rounded-lg relative">
                  {/* Corner indicators */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
                  
                  {/* Scanning line animation */}
                  {isScanning && !isFrozen && (
                    <div className="absolute inset-0 overflow-hidden rounded-lg">
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Success Overlay */}
            {scannedBarcode && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-white/90 p-6 rounded-lg text-center max-w-sm mx-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Barcode Detected!</h3>
                  <p className="text-sm text-gray-600 font-mono">{scannedBarcode}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Controls */}
      {!permissionDenied && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center justify-center space-x-8">
            {/* Share Button */}
            {showShareButton && (
              <button
                onClick={handleShare}
                className="p-4 bg-blue-500 hover:bg-blue-600 rounded-full transition-all transform hover:scale-105 shadow-lg"
              >
                <Share2 className="w-6 h-6 text-white" />
              </button>
            )}
            
            {/* Capture Button */}
            <button
              onClick={toggleFreeze}
              className={`p-3 rounded-full transition-all transform hover:scale-105 shadow-lg ${
                isFrozen 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              <div className={`w-6 h-6 rounded-full ${
                isFrozen ? 'bg-white' : 'bg-red-500'
              }`}></div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;