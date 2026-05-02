import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { validateBarcode, fetchProductInfo, getUserCountryCode } from '../utils/barcodeUtils';
import type { Product } from '../types';

export const useBarcodeScanner = (onScan: (barcode: string) => void) => {
  const codeReader = new BrowserMultiFormatReader();
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [showShareButton, setShowShareButton] = useState(false);

  // Cache the user's country once on mount — no need to re-fetch per scan
  const userCountryRef = useRef<string>('');
  useEffect(() => {
    getUserCountryCode().then(code => {
      userCountryRef.current = code;
    });
  }, []);

  const handleBarcodeDetected = useCallback(async (barcode: string) => {
    setScannedBarcode(barcode);
    setIsLoadingProduct(true);

    try {
      const { isValid, countryCode, countryName } = validateBarcode(barcode);
      const productInfo = await fetchProductInfo(barcode);

      // Flag a mismatch when the GS1 prefix country differs from the user's
      // detected country. Both must be known for this to be meaningful.
      const userCountry = userCountryRef.current;
      const countryMismatch =
        isValid &&
        !!userCountry &&
        !!countryCode &&
        countryCode !== userCountry;

      const productData: Product = {
        ...productInfo,
        isValid,
        countryCode,
        countryName,
        countryMismatch,
      };

      setProduct(productData);
      setShowShareButton(true);
      onScan(barcode);
      return true;
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
    codeReader,
  };
};