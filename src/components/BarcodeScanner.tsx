import React, { useCallback, useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';
import { X, Camera, Share2, RotateCcw, CheckCircle, AlertTriangle } from 'lucide-react';
import { validateBarcode, fetchProductInfo } from '../utils/barcodeUtils';
import type { Product } from '../types';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, isOpen, onClose }) => {
  const webcamRef = useRef<Webcam>(null);
  const codeReader = new BrowserMultiFormatReader();
  const inactivityTimeoutRef = useRef<NodeJS.Timeout>();
  const scanIntervalRef = useRef<NodeJS.Timeout>();
  const countdownIntervalRef = useRef<NodeJS.Timeout>();
  
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isFrozen, setIsFrozen] = useState(false);
  const [frozenImage, setFrozenImage] = useState<string>('');
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [showShareButton, setShowShareButton] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [timeoutWarning, setTimeoutWarning] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [scanResult, setScanResult] = useState<string>('');
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const resetInactivityTimer = useCallback(() => {
    // Clear existing timers
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    setTimeoutWarning(false);
    setCountdown(30);
    
    // Start countdown at 25 seconds (5 seconds warning)
    const warningTimeout = setTimeout(() => {
      setTimeoutWarning(true);
      let count = 5;
      setCountdown(count);
      
      countdownIntervalRef.current = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(countdownIntervalRef.current!);
          onClose();
        }
      }, 1000);
    }, 25000);
    
    inactivityTimeoutRef.current = warningTimeout;
  }, [onClose]);

  const toggleCamera = useCallback(() => {
    setFacingMode(current => current === 'environment' ? 'user' : 'environment');
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const toggleFreeze = useCallback(() => {
    if (!isFrozen) {
      // Freeze: Take a screenshot
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        setFrozenImage(imageSrc);
        setIsFrozen(true);
      }
    } else {
      // Unfreeze: Resume live feed
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
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.text + `\nScanned with FoodCop: ${window.location.href}`);
        alert('Product information copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: copy to clipboard
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
    setProduct(null);
    setScannedBarcode('');
    setScanResult('');
    setShowShareButton(false);
    setIsLoadingProduct(false);
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const handleBarcodeDetected = useCallback(async (barcode: string) => {
    setScannedBarcode(barcode);
    setScanResult(barcode);
    setIsLoadingProduct(true);
    setShowResult(true);
    
    // Reset timer to 30 seconds upon successful scan
    resetInactivityTimer();
    
    try {
      const { isValid, countryCode, countryName } = validateBarcode(barcode);
      const productInfo = await fetchProductInfo(barcode);
      
      const productData: Product = {
        ...productInfo,
        isValid,
        countryCode,
        countryName,
      };
      
      setProduct(productData);
      setShowShareButton(true);
      
      // Call parent's onScan but don't close the camera
      onScan(barcode);
    } catch (error) {
      console.error('Error fetching product info:', error);
    } finally {
      setIsLoadingProduct(false);
    }
  }, [onScan, resetInactivityTimer]);

  const scanForBarcode = useCallback(async () => {
    if (isFrozen || !webcamRef.current || showResult) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      try {
        const result = await codeReader.decodeFromImage(undefined, imageSrc);
        if (result) {
          const barcode = result.getText();
          await handleBarcodeDetected(barcode);
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
      setScannedBarcode('');
      setScanResult('');
      setShowShareButton(false);
      setIsFrozen(false);
      setFrozenImage('');
      setShowResult(false);
      setProduct(null);
      setIsLoadingProduct(false);
    }
    
    return () => {
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
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
        
        <button
          onClick={onClose}
          className="p-3 bg-black/30 hover:bg-black/50 rounded-full transition-colors backdrop-blur-sm scanner-button"
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
            {/* Live Camera Feed or Frozen Image */}
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
            
            {/* Scanning Frame or Result Display */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                {!showResult ? (
                  <>
                    {/* Instructions */}
                    <div className="w-full absolute -top-16 left-1/2 transform -translate-x-1/2 text-center">
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
                      {!isFrozen && (
                        <div className="absolute inset-0 overflow-hidden rounded-lg">
                          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan"></div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Product Result Display */
                  <div className="fixed bg-white/95 backdrop-blur-sm rounded-lg p-6 max-w-sm mx-4 pointer-events-auto shadow-2xl">
                    {isLoadingProduct ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                        <p className="text-gray-600">Checking product...</p>
                      </div>
                    ) : product ? (
                      <div className="space-y-3">
                        {/* Header with safety status */}
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {product.name !== "Non-food Product" ? product.name : "Unknown Product"}
                          </h3>
                          {product.isValid && product.found && product.name !== "Non-food Product" ? (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-xs font-medium text-green-600">Safe</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              <span className="text-xs font-medium text-red-600">Not Safe</span>
                            </div>
                          )}
                        </div>

                        {/* Product details */}
                        {product.name !== "Non-food Product" && (
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Manufacturer:</span>
                              <span className="text-gray-900 font-medium">{product.manufacturer}</span>
                            </div>
                            
                            {product.countryCode && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Country:</span>
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm">{getFlagEmoji(product.countryCode)}</span>
                                  <span className="text-gray-900 font-medium">{product.countryName}</span>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Allergens:</span>
                              <span className="text-gray-900 font-medium">{product.allergens || "Unknown"}</span>
                            </div>
                          </div>
                        )}

                        {/* Barcode */}
                        <div className="bg-gray-100 p-2 rounded text-center">
                          <p className="text-xs text-gray-600 mb-1">Barcode:</p>
                          <p className="font-mono text-sm text-gray-900">{scannedBarcode}</p>
                        </div>

                        {/* Warning messages */}
                        {!product.isValid && !product.found && (
                          <div className="bg-red-50 border border-red-200 rounded p-2">
                            <p className="text-red-700 text-xs">
                              Warning: This product's barcode doesn't match GS1 database records. It might be counterfeit.
                            </p>
                          </div>
                        )}

                        {!product.isValid && product.found && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                            <p className="text-yellow-700 text-xs">
                              Note: This product was found but its prefix doesn't match the expected country of origin.
                            </p>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={dismissResult}
                            className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded transition-colors"
                          >
                            Scan Another
                          </button>
                          {showShareButton && (
                            <button
                              onClick={handleShare}
                              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors flex items-center space-x-1"
                            >
                              <Share2 className="w-3 h-3" />
                              <span>Share</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls */}
      {!permissionDenied && !showResult && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center justify-center">
            {/* Capture Button */}
            <button
              onClick={toggleFreeze}
              className={`p-3 rounded-full transition-all scanner-button shadow-lg ${
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