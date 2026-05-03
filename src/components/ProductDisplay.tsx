import React from "react";
import { Globe } from "lucide-react";
import type { Product } from "../types";
import { DataRow, SafetyBadge } from "./ProductResult";
interface ProductDisplayProps {
  product: Product | null;
  isLoading: boolean;
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({ product, isLoading }) => {
  if (isLoading) {
    return (
      <div className="animate-pulse mt-6 space-y-4">
        <div className="h-48 bg-gray-200"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!product) return null;

  // Safety is determined by GS1 prefix validity, not database presence.
  // isValid = false → unrecognised barcode → potential counterfeit
  // isValid + isFood → Safe; isValid + !isFood → Non-Food
  const showCounterfeitWarning = !product.isValid && !product.found;

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-gray-500 text-[10px] font-medium uppercase tracking-widest mb-1">
            Product
          </p>
          <h3 className="font-semibold text-[15px] leading-snug capitalize">
            {product.product_name}
          </h3>
        </div>
        <SafetyBadge product={product} />
      </div>

      {/* Product image */}
      <div className="relative w-full aspect-square sm:aspect-video bg-gray-200 overflow-hidden">
        {<img
          src={product.image_url || "/assets/placeholder.png"}
          alt={product.product_name || "Unknown Product"}
          className={`w-full aspect-square sm:aspect-video object-cover sm:object-contain bg-gray-200 ${product.image_url ? '' : 'opacity-20'}`}
        />}
      </div>

      {/* Info rows */}
      <div className="overflow-hidden border border-gray-500 mb-3">
        <DataRow label="Manufacturer" value={product.manufacturer_name} color="gray-500"/>
        {product.countryCode && (
          <DataRow
            label="Country"
            value={product.countryName}
            color="gray-500"
          />
        )}
        <DataRow
          label="Allergens"
          value={
            <span className="capitalize">
              {product.allergens || "None listed"}
            </span>
          }
          color="gray-500"
        />
        {product.category && (
          <DataRow
            label="Category"
            value={
              <span className="capitalize">
                {product.category}
              </span>
            }
            color="gray-500"
          />
        )}
      </div>

        {/* Country mismatch advisory */}
        {product.countryMismatch && (
          <div className="mt-4 bg-amber-50 border border-amber-200 p-4 flex items-start gap-2">
            <Globe className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-amber-700 text-sm">
              This barcode is registered in{" "}
              <strong>{product.countryName}</strong>, but you appear to be
              scanning from a different country. This may be a legitimate import
              — verify the product source if unsure.
            </p>
          </div>
        )}

        {showCounterfeitWarning && (
          <div className="mt-4 bg-red-50 border border-red-200 p-4">
            <p className="text-red-700 text-sm">
              Warning: This product's barcode doesn't match GS1 database
              records. It might be counterfeit.
            </p>
          </div>
        )}

        {!product.isValid && product.found && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-yellow-700 text-sm">
              Note: This product was found in the database but its prefix
              doesn't match the expected country of origin. This might indicate
              a parallel import or repackaged product.
            </p>
          </div>
        )}
      </div>
  );
};

export default ProductDisplay;