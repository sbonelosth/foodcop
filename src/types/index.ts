export interface Product {
  product_name: string | null;
  manufacturer_name: string | null;
  quantity: string | null;
  country_of_origin: string | null;
  category: string | null;
  allergens: string | null;
  image_url: string | null;
  // Barcode metadata (set by frontend)
  countryCode: string;
  countryName: string;
  isValid: boolean;
  found: boolean;
  isFood?: boolean;
  countryMismatch?: boolean;
}

export interface ScanResult {
	text: string;
	format: string;
}

export interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isOpen: boolean;
  setShowManualInput: (show: boolean) => void;
}