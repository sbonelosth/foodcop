import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';
import { X, RotateCcw } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, isOpen, onClose }) => {
  const webcamRef = useRef<Webcam>(null);
  const codeReader = new BrowserMultiFormatReader();
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const toggleCamera = () => {
    setFacingMode(current => current === 'environment' ? 'user' : 'environment');
  };

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      try {
        const result = await codeReader.decodeFromImage(undefined, imageSrc);
        if (result) {
          onScan(result.getText());
          onClose();
        }
      } catch (error) {
        // Continue scanning if no barcode is detected
      }
    }
  }, [codeReader, onScan, onClose]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen) {
      interval = setInterval(capture, 500);
    }
    return () => {
      clearInterval(interval);
      codeReader.reset();
    };
  }, [isOpen, capture, codeReader]);

  if (!isOpen) return null;

  const videoConstraints = {
    facingMode,
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scan Barcode</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleCamera}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Toggle camera"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="relative">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full rounded-lg"
            videoConstraints={videoConstraints}
          />
          <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none"></div>
        </div>
        <p className="text-sm text-gray-600 mt-4 text-center">
          Position the barcode within the frame
          {facingMode === 'user' && (
            <span className="block text-xs text-yellow-600 mt-1">
              Note: Front camera may have difficulty scanning barcodes
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default BarcodeScanner;