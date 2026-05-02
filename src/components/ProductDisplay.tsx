import React from "react";
import { AlertTriangle, CheckCircle, Globe, Package } from "lucide-react";
import type { Product } from "../types";

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
      <div className="flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-semibold capitalize">
          {product.name || "Unknown Product"}
        </h2>

        {/* {product.isValid ? (
          product.isFood ? (
            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium text-green-600">Safe</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium text-yellow-600">Non-Food</span>
              <Package className="w-4 h-4 text-yellow-500" />
            </div>
          )
        ) : (
          <div className="flex items-center space-x-1">
            <span className="text-xs font-medium text-red-600">Not Safe</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
        )} */}
      </div>

      {/* Product image */}
      <div className="relative w-full aspect-square sm:aspect-video bg-gray-200 overflow-hidden">
        <div className="absolute w-full flex justify-end bg-white sm:bg-transparent top-0 right-0 px-3 py-1.5">
          {product.isValid ? (
            product.isFood ? (
              <div className="flex items-center space-x-1">
                <span className="text-xs font-medium text-green-600">Safe</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <span className="text-xs font-medium text-yellow-600">Non-Food</span>
                <Package className="w-4 h-4 text-yellow-500" />
              </div>
            )
          ) : (
            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium text-red-600">Not Safe</span>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
          )}
        </div>
        {<img
          src={product.image || "/assets/placeholder.png"}
          alt={product.name}
          className={`w-full aspect-square sm:aspect-video object-cover sm:object-contain bg-gray-200 ${product.image ? '' : 'opacity-20'}`}
        />}
      </div>

      <div className="overflow-x-auto">
        <table className="table-fixed w-full min-w-[300px] border-collapse border border-gray-300">
          <tbody>
            <tr>
              <td className="td-label">Manufacturer</td>
              <td className="td-data">{product.manufacturer}</td>
            </tr>
            <tr>
              <td className="td-label">Country</td>
              <td className="td-data">{product.countryName}</td>
            </tr>
            <tr>
              <td className="td-label">Allergens</td>
              <td className="td-data">{product.allergens || "None listed"}</td>
            </tr>
            {product.category && (
              <tr>
                <td className="td-label">Category</td>
                <td className="td-data">{product.category}</td>
              </tr>
            )}
          </tbody>
        </table>
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