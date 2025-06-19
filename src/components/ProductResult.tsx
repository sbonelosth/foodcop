import React from 'react';
import { Share2, CheckCircle, AlertTriangle } from 'lucide-react';
import { getFlagEmoji } from '../utils/flagUtils';
import type { Product } from '../types/index';

interface ProductResultProps {
  product: Product | null;
  scannedBarcode: string;
  isLoading: boolean;
  showShareButton: boolean;
  onDismiss: () => void;
  onShare: () => void;
}

export const ProductResult: React.FC<ProductResultProps> = ({
  product,
  scannedBarcode,
  isLoading,
  showShareButton,
  onDismiss,
  onShare,
}) => {
  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
        <p className="text-gray-600">Checking product...</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm mr-4">
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

      <div className="bg-gray-100 p-2 rounded text-center">
        <p className="text-xs text-gray-600 mb-1">Barcode:</p>
        <p className="font-mono text-sm text-gray-900">{scannedBarcode}</p>
      </div>

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

      <div className="flex space-x-2 pt-2">
        <button
          onClick={onDismiss}
          className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded transition-colors"
        >
          Scan Another
        </button>
        {showShareButton && (
          <button
            onClick={onShare}
            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors flex items-center space-x-1"
          >
            <Share2 className="w-3 h-3" />
            <span>Share</span>
          </button>
        )}
      </div>
    </div>
  );
};