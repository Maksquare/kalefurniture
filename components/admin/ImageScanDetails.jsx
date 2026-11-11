"use client";

import { useState } from "react";
import { 
  PiSparkleFill, 
  PiWarningCircleBold, 
  PiArrowsClockwiseBold, 
  PiTrash, 
  PiCheckBold, 
  PiCopyBold,
  PiCropLight,
  PiFrameCornersLight,
  PiPaletteLight,
  PiArrowRight
} from "react-icons/pi";
import { resolveImageUrl } from "@/lib/imageUtils";
import toast from "react-hot-toast";

/**
 * ImageScanDetails:
 * Displays scanned image composition, dimensions, dominant color palette,
 * and high-priority duplicate detection alerts with side-by-side comparison.
 */
export default function ImageScanDetails({
  scanData,
  duplicateInfo,
  onApplyColors = null,
  onReuseExisting = null,
  onRemove = null,
  onKeepAnyway = null,
  compact = false,
}) {
  const [copiedHex, setCopiedHex] = useState(null);

  if (!scanData && !duplicateInfo?.isDuplicate) return null;

  const handleCopyHex = (hex) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    toast.success(`Copied color ${hex}`);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="space-y-3 font-secondary animate-fadeIn">
      {/* ── 1. DUPLICATE ALERT CARD ── */}
      {duplicateInfo?.isDuplicate && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-rose-500/10 border-2 border-amber-500/40 shadow-sm space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                <PiWarningCircleBold size={19} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-secondary text-[11px] font-bold uppercase tracking-wider text-amber-900">
                    Duplicate Asset Detected
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-950 font-secondary text-[10px] font-bold">
                    {duplicateInfo.confidence || "Already Uploaded"}
                  </span>
                </div>
                <p className="font-secondary text-[12.5px] text-amber-950/85 mt-0.5 leading-snug">
                  {duplicateInfo.message}
                </p>
              </div>
            </div>

            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                title="Remove duplicate"
                className="p-1.5 rounded-lg text-amber-800 hover:text-red-700 hover:bg-amber-100 transition-colors cursor-pointer shrink-0"
              >
                <PiTrash size={16} />
              </button>
            )}
          </div>

          {/* Side-by-side Asset Comparison */}
          {duplicateInfo.matchedProduct && duplicateInfo.matchedImageUrl && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/80 border border-amber-300/60">
              {/* Existing catalog piece thumbnail */}
              <div className="w-12 h-12 rounded-lg bg-[#F6F3EC] overflow-hidden border border-amber-300 shrink-0">
                <img
                  src={resolveImageUrl(duplicateInfo.matchedImageUrl)}
                  alt="Existing catalog asset"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <span className="font-secondary text-[9.5px] font-bold uppercase tracking-wider text-amber-700/80 block">
                  Already in catalog:
                </span>
                <h5 className="font-primary text-[14px] text-secondary font-semibold truncate">
                  {duplicateInfo.matchedProduct.name || duplicateInfo.matchedProduct.id}
                </h5>
                <span className="font-secondary text-[11px] text-secondary/60">
                  Category: {duplicateInfo.matchedProduct.category || "Inventory"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {duplicateInfo.canReuse && onReuseExisting && (
                  <button
                    type="button"
                    onClick={() => onReuseExisting(duplicateInfo.matchedImageUrl)}
                    className="px-3 py-1.5 rounded-lg bg-primary hover:bg-gold text-white font-secondary text-[11px] font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <PiArrowsClockwiseBold size={12} />
                    <span>Reuse URL</span>
                  </button>
                )}

                {onKeepAnyway && (
                  <button
                    type="button"
                    onClick={onKeepAnyway}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-secondary text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    Keep Anyway
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 2. SCANNED COMPOSITION & PALETTE BREAKDOWN ── */}
      {scanData && (
        <div className={`rounded-2xl border border-secondary/15 bg-[#FAF8F5]/80 p-3.5 space-y-2.5 ${compact ? "text-[11px]" : "text-[12px]"}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            
            {/* Composition Framing Badge */}
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-gold/15 text-gold flex items-center justify-center shrink-0">
                <PiSparkleFill size={13} />
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-secondary">
                    {scanData.composition?.type || "Standard Composition"}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-secondary/8 text-secondary/70 text-[9.5px] font-bold uppercase tracking-wider">
                    {scanData.composition?.badge || "Catalog"}
                  </span>
                </div>
                <span className="text-[11px] text-secondary/55 block">
                  {scanData.composition?.description || "Framed furniture showcase"}
                </span>
              </div>
            </div>

            {/* Dimensions & Aspect Ratio Pill */}
            {scanData.dimensions && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-secondary/10 text-secondary/70 font-semibold text-[11px]">
                <PiFrameCornersLight size={13} className="text-gold" />
                <span>{scanData.dimensions}</span>
                {scanData.aspectRatioLabel && (
                  <span className="text-secondary/40 font-normal">({scanData.aspectRatioLabel})</span>
                )}
              </div>
            )}
          </div>

          {/* Dominant Extracted Palette */}
          {Array.isArray(scanData.dominantColors) && scanData.dominantColors.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-secondary/8">
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-secondary/50 flex items-center gap-1">
                  <PiPaletteLight size={13} />
                  <span>Extracted Tones:</span>
                </span>
                <div className="flex items-center gap-1.5">
                  {scanData.dominantColors.map((hex, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => handleCopyHex(hex)}
                      title={`Click to copy ${hex}`}
                      className="group relative flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-secondary/15 hover:border-gold hover:scale-105 transition-all cursor-pointer shadow-2xs"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-2xs"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="text-[10px] font-mono text-secondary/70 font-medium">
                        {copiedHex === hex ? "Copied!" : hex}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 1-Click Apply to Swatches */}
              {onApplyColors && (
                <button
                  type="button"
                  onClick={() => onApplyColors(scanData.dominantColors)}
                  className="px-2.5 py-1 rounded-lg bg-gold/15 hover:bg-gold hover:text-white text-gold-dark font-secondary text-[10.5px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>+ Auto-Add to Swatches</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
