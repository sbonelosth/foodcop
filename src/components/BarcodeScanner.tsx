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
import { isDevMock } from '../utils/mockData';

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

  const { timeoutWarning, countdown, resetInactivityTimer } = useInactivityTimer(() => {
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

    const safetyLabel = product.isValid
      ? (product.isFood ? 'Safe (Food)' : 'Non-Food')
      : 'Not Safe';

    const shareData = {
      title: 'FoodCop – Scanned Product',
      text: `Product: ${product.product_name}\nBarcode: ${scannedBarcode}\nCountry: ${product.countryName}\nSafety: ${safetyLabel}`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          shareData.text + `\nScanned with FoodCop: ${window.location.href}`
        );
        alert('Product information copied to clipboard!');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(
          shareData.text + `\nScanned with FoodCop: ${window.location.href}`
        );
        alert('Product information copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
      }
    }
    resetInactivityTimer();
  }, [scannedBarcode, product, resetInactivityTimer]);

  const dismissResult = useCallback(() => {
    setShowResult(false);
    setIsFrozen(false);
    setFrozenImage('');
    resetScanner();
    resetInactivityTimer();
  }, [resetInactivityTimer, resetScanner]);

  const scanForBarcode = useCallback(async () => {
    if (isFrozen || !webcamRef.current || showResult) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      const result = await codeReader.decodeFromImage(undefined, imageSrc);
      if (result) {
        const barcode = result.getText();
        const success = await handleBarcodeDetected(barcode);
        if (success) setShowResult(true);
      }
    } catch {
      // No barcode found in frame — keep scanning
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

  useEffect(() => {
    if (isOpen && !isFrozen && !permissionDenied && !showResult) {
      scanIntervalRef.current = setInterval(scanForBarcode, 500);
    } else {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    }
    return () => { if (scanIntervalRef.current) clearInterval(scanIntervalRef.current); };
  }, [isOpen, isFrozen, permissionDenied, showResult, scanForBarcode]);

  useEffect(() => {
    if (isOpen) resetInactivityTimer();
    return () => { if (scanIntervalRef.current) clearInterval(scanIntervalRef.current); };
  }, [isOpen, resetInactivityTimer]);

  if (!isOpen) return null;

  const videoConstraints = {
    facingMode,
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
  };

  // Whether there's a product image ready to display
  const hasProductImage = showResult && !isLoadingProduct && product?.image_url;

  return (
    <>
      <style>{`
        @keyframes bc-fadeIn {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }
        .bc-product-img { animation: bc-fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }

        @keyframes bc-spin {
          to { transform: rotate(360deg); }
        }
        .bc-spinner {
          animation: bc-spin 0.9s linear infinite;
        }
      `}</style>

      <div className="fixed inset-0 bg-black flex flex-col">
        {timeoutWarning && <TimeoutWarning countdown={countdown} />}

        {isDevMock() && (
          <div className="absolute top-0 inset-x-0 z-50 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest text-center py-1">
            Dev Mock Mode — Not Production
          </div>
        )}

        {/* ── Camera / product-image area ─────────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden">
          {permissionDenied ? (
            <PermissionDenied onRetry={() => window.location.reload()} />
          ) : (
            <>
              {/* Webcam — always mounted so the stream stays alive. Hidden when
                  frozen so we can overlay the frozen frame instead. */}
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                onUserMedia={handleUserMedia}
                onUserMediaError={handleUserMediaError}
                className="w-full h-full object-cover"
                style={{
                  display: isFrozen ? 'none' : 'block',
                  opacity: showResult ? 0.15 : 1,
                  transition: 'opacity 0.4s ease',
                }}
              />

              {/* Frozen frame */}
              {isFrozen && frozenImage && (
                <img
                  src={frozenImage}
                  alt="Frozen frame"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    opacity: showResult ? 0.15 : 1,
                    transition: 'opacity 0.4s ease',
                  }}
                />
              )}

              {/* Product image — replaces the camera view once result is ready */}
              {hasProductImage && (
                <div className="bc-product-img absolute inset-0 flex items-center justify-center p-8">
                  <img
                    src={product!.image_url || ""}
                    alt={product!.product_name || "Product image"}
                    className="max-h-full max-w-full object-cover"
                    style={{
                      filter: 'drop-shadow(0 8px 48px rgba(0,0,0,0.9))',
                    }}
                  />
                </div>
              )}

              {/* Loading indicator — shown while fetch is in progress */}
              {showResult && isLoadingProduct && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <svg className="bc-spinner w-10 h-10" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="17" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                    <path
                      d="M20 3 A17 17 0 0 1 37 20"
                      stroke="#00874c"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p className="text-white/50 text-sm tracking-wide">Identifying product…</p>
                </div>
              )}

              {/* Scanning frame — only while actively scanning */}
              {!showResult && <ScanningFrame isFrozen={isFrozen} />}
            </>
          )}
        </div>

        {/* ── Bottom sheet result ─────────────────────────────────────────── */}
        {showResult && (
          <ProductResult
            product={product}
            scannedBarcode={scannedBarcode}
            isLoading={isLoadingProduct}
            showShareButton={showShareButton}
            onDismiss={dismissResult}
            onShare={handleShare}
          />
        )}

        {/* ── Camera controls — hidden when result is shown ───────────────── */}
        {!permissionDenied && !showResult && (
          <div className="absolute bottom-0 left-0 right-0 p-6 pb-16 bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex items-center justify-around">
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
            {isDevMock() && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={async () => {
                    const success = await handleBarcodeDetected("6001275000003");
                    if (success) setShowResult(true);
                  }}
                  className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold rounded-full transition-colors backdrop-blur-sm"
                >
                  Mock Scan
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default BarcodeScanner;