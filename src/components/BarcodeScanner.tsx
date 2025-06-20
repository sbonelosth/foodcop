import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { CameraControls } from './CameraControls';
import { TimeoutWarning } from './TimeoutWarning';
import { PermissionDenied } from './PermissionDenied';
import { ScanningFrame } from './ScanningFrame';
import { ProductResult } from './ProductResult';
import { CaptureButton } from './CaptureButton';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { useInactivityTimer } from '../hooks/useInactivityTimer';
import type { BarcodeScannerProps } from '../types';
import { Keyboard } from 'lucide-react';

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, isOpen, setShowManualInput }) => {
  const webcamRef = useRef<Webcam>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval>>();

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isFrozen, setIsFrozen] = useState(false);
  const [frozenImage, setFrozenImage] = useState<string>('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const {
    scannedBarcode,
    product,
    isLoadingProduct,
    showShareButton,
    handleBarcodeDetected,
    resetScanner,
    codeReader,
  } = useBarcodeScanner(onScan);

  const {
    timeoutWarning,
    countdown,
    resetInactivityTimer,
  } = useInactivityTimer(() => {
    setShowResult(false);
    resetScanner();
  }, 30000);

  const toggleCamera = useCallback(() => {
    setFacingMode(current => current === 'environment' ? 'user' : 'environment');
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const toggleFreeze = useCallback(() => {
    if (!isFrozen) {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        setFrozenImage(imageSrc);
        setIsFrozen(true);
      }
    } else {
      setIsFrozen(false);
      setFrozenImage('');
    }
    resetInactivityTimer();
  }, [isFrozen, resetInactivityTimer]);

  const handleShare = useCallback(async () => {
    if (!scannedBarcode || !product) return;

    const shareData = {
      title: 'FoodCop - Scanned Product',
      text: `Product: ${product.name}\nBarcode: ${scannedBarcode}\nCountry: ${product.countryName}\nSafety: ${product.isValid && product.found ? 'Safe' : 'Not Safe'}`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text + `\nScanned with FoodCop: ${window.location.href}`);
        alert('Product information copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      try {
        await navigator.clipboard.writeText(shareData.text + `\nScanned with FoodCop: ${window.location.href}`);
        alert('Product information copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
      }
    }
    resetInactivityTimer();
  }, [scannedBarcode, product, resetInactivityTimer]);

  const dismissResult = useCallback(() => {
    setShowResult(false);
    resetScanner();
    resetInactivityTimer();
  }, [resetInactivityTimer, resetScanner]);

  const scanForBarcode = useCallback(async () => {
    if (isFrozen || !webcamRef.current || showResult) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      try {
        const result = await codeReader.decodeFromImage(undefined, imageSrc);
        if (result) {
          const barcode = result.getText();
          const success = await handleBarcodeDetected(barcode);
          if (success) {
            setShowResult(true);
          }
        }
      } catch (error) {
        // Continue scanning if no barcode is detected
      }
    }
  }, [codeReader, isFrozen, showResult, handleBarcodeDetected]);

  const handleUserMedia = useCallback(() => {
    setPermissionDenied(false);
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    console.error('Camera error:', error);
    setPermissionDenied(true);
  }, []);

  // Scanning interval effect
  useEffect(() => {
    if (isOpen && !isFrozen && !permissionDenied && !showResult) {
      scanIntervalRef.current = setInterval(scanForBarcode, 500);
    } else {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    }

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [isOpen, isFrozen, permissionDenied, showResult, scanForBarcode]);

  // Cleanup effect
  useEffect(() => {
    if (isOpen) {
      resetInactivityTimer();
    }

    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [isOpen, resetInactivityTimer]);

  if (!isOpen) return null;

  const videoConstraints = {
    facingMode,
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {timeoutWarning && <TimeoutWarning countdown={countdown} />}

      <div className="flex-1 relative overflow-hidden">
        {permissionDenied ? (
          <PermissionDenied onRetry={() => window.location.reload()} />
        ) : (
          <>
            {isFrozen && frozenImage ? (
              <img
                src={frozenImage}
                alt="Frozen frame"
                className="w-full h-full object-cover camera-transition"
              />
            ) : (
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover camera-transition"
                videoConstraints={videoConstraints}
                onUserMedia={handleUserMedia}
                onUserMediaError={handleUserMediaError}
              />
            )}
          </>
        )}
      </div>

      {/* Result overlay */}
      {showResult && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 max-w-sm mx-4 shadow-2xl">
            <ProductResult
              product={product}
              scannedBarcode={scannedBarcode}
              isLoading={isLoadingProduct}
              showShareButton={showShareButton}
              onDismiss={dismissResult}
              onShare={handleShare}
            />
          </div>
        </div>
      )}

      {/* Scanning frame */}
      {!showResult && !permissionDenied && (
          <ScanningFrame isFrozen={isFrozen} />
      )}

      {/* Bottom controls */}
      {!permissionDenied && !showResult && (
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-16 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center justify-around">
            {/* Manual input button */}
            <button
              onClick={() => setShowManualInput(true)}
              className="p-3 bg-black/30 hover:bg-black/50 rounded-full transition-colors backdrop-blur-sm"
              title="Manual input"
            >
              <Keyboard className="w-6 h-6 text-white" />
            </button>
            <CaptureButton isFrozen={isFrozen} onClick={toggleFreeze} />
            <CameraControls facingMode={facingMode} toggleCamera={toggleCamera} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;