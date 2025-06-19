import { useCallback, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { validateBarcode, fetchProductInfo } from '../utils/barcodeUtils';
import type { Product } from '../types';

export const useBarcodeScanner = (onScan: (barcode: string) => void) => {
  const codeReader = new BrowserMultiFormatReader();
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [showShareButton, setShowShareButton] = useState(false);

  const handleBarcodeDetected = useCallback(async (barcode: string) => {
    setScannedBarcode(barcode);
    setIsLoadingProduct(true);
    
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
      onScan(barcode);
    } catch (error) {
      console.error('Error fetching product info:', error);
    } finally {
      setIsLoadingProduct(false);
    }
  }, [onScan]);

  const scanForBarcode = useCallback(async (webcamRef: React.RefObject<any>, isFrozen: boolean, showResult: boolean) => {
    if (isFrozen || !webcamRef.current || showResult) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      try {
        const result = await codeReader.decodeFromImage(undefined, imageSrc);
        if (result) {
          const barcode = result.getText();
          await handleBarcodeDetected(barcode);
          return true;
        }
      } catch (error) {
        // Continue scanning if no barcode is detected
      }
    }
    return false;
  }, [codeReader, handleBarcodeDetected]);

  const resetScanner = useCallback(() => {
    setScannedBarcode('');
    setProduct(null);
    setShowShareButton(false);
    setIsLoadingProduct(false);
  }, []);

  return {
    scannedBarcode,
    product,
    isLoadingProduct,
    showShareButton,
    scanForBarcode,
    resetScanner,
    handleBarcodeDetected,
  };
};