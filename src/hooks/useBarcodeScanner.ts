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
      return true; // Return true for successful detection
    } catch (error) {
      console.error('Error fetching product info:', error);
      return false;
    } finally {
      setIsLoadingProduct(false);
    }
  }, [onScan]);

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
    handleBarcodeDetected,
    resetScanner,
    codeReader, // Expose codeReader for use in the component
  };
};