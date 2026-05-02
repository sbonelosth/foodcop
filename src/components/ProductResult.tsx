import React from 'react';
import { Share2, CheckCircle, AlertTriangle, Globe, Package } from 'lucide-react';
import { getFlagEmoji } from '../utils/flagUtils';
import type { Product } from '../types';

interface ProductResultProps {
  product: Product | null;
  scannedBarcode: string;
  isLoading: boolean;
  showShareButton: boolean;
  onDismiss: () => void;
  onShare: () => void;
}

// ─── Safety helpers ──────────────────────────────────────────────────────────
// Safety is determined by GS1 prefix validity (isValid), not database presence.
// isValid = false → barcode unrecognised → potential counterfeit (red)
// isValid = true  → legitimate product
//   isFood = true  → Safe (green)
//   isFood = false → Non-Food (amber)
// countryMismatch is a soft advisory, shown separately.

function SafetyBadge({ product }: { product: Product }) {
  if (!product.isValid) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/20">
        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
        <span className="text-xs font-semibold text-red-400">Not Safe</span>
      </div>
    );
  }
  if (product.isFood) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8cc342]/15 border border-[#8cc342]/20">
        <CheckCircle className="w-3.5 h-3.5 text-[#8cc342]" />
        <span className="text-xs font-semibold text-[#8cc342]">Safe</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/20">
      <Package className="w-3.5 h-3.5 text-amber-400" />
      <span className="text-xs font-semibold text-amber-400">Non-Food</span>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] last:border-b-0">
      <span className="text-white/40 text-xs tracking-wide">{label}</span>
      <span className="text-white/80 text-xs font-medium text-right max-w-[58%] leading-relaxed">
        {value}
      </span>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function LoadingSheet() {
  return (
    <div className="bg-[#0e0e0e] border-t border-white/[0.06] rounded-t-[28px] px-5 pt-3 pb-8">
      <div className="w-9 h-[3px] bg-white/15 rounded-full mx-auto mb-5" />
      <div className="animate-pulse space-y-3">
        <div className="h-3 bg-white/10 rounded-full w-1/4" />
        <div className="h-5 bg-white/10 rounded-xl w-3/4" />
        <div className="mt-4 rounded-2xl overflow-hidden border border-white/[0.05]">
          <div className="h-10 bg-white/[0.06]" />
          <div className="h-10 bg-white/[0.04]" />
          <div className="h-10 bg-white/[0.06]" />
        </div>
        <div className="h-11 bg-[#8cc342]/20 rounded-2xl mt-4" />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export const ProductResult: React.FC<ProductResultProps> = ({
  product,
  scannedBarcode,
  isLoading,
  showShareButton,
  onDismiss,
  onShare,
}) => {
  return (
    <>
      <style>{`
        @keyframes pr-slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .pr-sheet {
          animation: pr-slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>

      <div className="pr-sheet">
        {isLoading || !product ? (
          <LoadingSheet />
        ) : (
          <div className="bg-[#0e0e0e] border-t border-white/[0.06] rounded-t-[28px] px-5 pt-3 pb-8">
            {/* Drag handle */}
            <div className="w-9 h-[3px] bg-white/15 rounded-full mx-auto mb-5" />

            {/* Header: product name + safety badge */}
            <div className="flex items-start justify-between mb-4 gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-white/35 text-[10px] font-medium uppercase tracking-widest mb-1">
                  Product
                </p>
                <h3 className="text-white font-semibold text-[15px] leading-snug capitalize">
                  {product.name}
                </h3>
              </div>
              <SafetyBadge product={product} />
            </div>

            {/* Info rows */}
            <div className="rounded-2xl overflow-hidden border border-white/[0.06] mb-3">
              <DataRow label="Manufacturer" value={product.manufacturer} />
              {product.countryCode && (
                <DataRow
                  label="Registered in"
                  value={
                    <span className="flex items-center gap-1.5 justify-end">
                      <span className="text-base leading-none">
                        {getFlagEmoji(product.countryCode)}
                      </span>
                      {product.countryName}
                    </span>
                  }
                />
              )}
              <DataRow
                label="Allergens"
                value={
                  <span className="capitalize">
                    {product.allergens || "None listed"}
                  </span>
                }
              />
            </div>

            {/* Country mismatch advisory */}
            {product.countryMismatch && (
              <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 mb-3">
                <Globe className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-amber-300/90 text-xs leading-relaxed">
                  Barcode registered in{" "}
                  <span className="font-semibold text-amber-300">
                    {product.countryName}
                  </span>{" "}
                  but you appear to be in a different country. This may be a
                  legitimate import — verify if unsure.
                </p>
              </div>
            )}

            {/* Counterfeit warning */}
            {!product.isValid && !product.found && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-2xl p-3.5 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-300/90 text-xs leading-relaxed">
                  Barcode not found in GS1 records. This product may be
                  counterfeit — do not consume.
                </p>
              </div>
            )}

            {/* Prefix/found mismatch note */}
            {!product.isValid && product.found && (
              <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-amber-300/90 text-xs leading-relaxed">
                  Product found in database but its barcode prefix doesn't match
                  the registered origin. May be a parallel import or repackaged
                  product.
                </p>
              </div>
            )}

            {/* Barcode chip */}
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl py-2.5 px-4 mb-4 flex items-center justify-between">
              <span className="text-white/30 text-[10px] uppercase tracking-widest">
                Barcode
              </span>
              <span className="font-mono text-white/55 text-sm tracking-wider">
                {scannedBarcode}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onDismiss}
                className="flex-1 bg-[#8cc342] hover:bg-[#7db535] active:opacity-80 text-white font-semibold text-sm rounded-2xl py-3.5 transition-colors"
              >
                Scan Another
              </button>
              {showShareButton && (
                <button
                  onClick={onShare}
                  className="bg-white/[0.08] hover:bg-white/[0.13] active:bg-white/[0.06] text-white rounded-2xl px-4 py-3.5 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};