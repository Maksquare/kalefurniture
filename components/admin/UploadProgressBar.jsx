"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  PiCheckCircleFill, 
  PiCloudArrowUpFill, 
  PiLightningFill, 
  PiX, 
  PiWarningCircleFill
} from "react-icons/pi";

/**
 * Format bytes to readable string (e.g., "420 KB", "1.8 MB")
 */
function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Smart & Interactive Progress Bar for Kal Furniture Admin Uploads
 * 
 * Props:
 * - progress: number (0 - 100)
 * - stage: 'idle' | 'compressing' | 'uploading' | 'syncing' | 'done' | 'error'
 * - stageText: custom status message
 * - fileName: string
 * - loadedBytes: number
 * - totalBytes: number
 * - totalFiles: number (for batch uploads)
 * - completedFiles: number (for batch uploads)
 * - onCancel: function (optional)
 * - onDismiss: function (optional)
 * - error: string (optional)
 * - inline: boolean (whether to render inline or floating)
 */
export default function UploadProgressBar({
  progress = 0,
  stage = "uploading",
  stageText = "",
  fileName = "",
  loadedBytes = 0,
  totalBytes = 0,
  totalFiles = 1,
  completedFiles = 0,
  onCancel = null,
  onDismiss = null,
  error = null,
  inline = false,
  className = "",
}) {
  const isDone = stage === "done" || progress >= 100;
  const isError = stage === "error" || Boolean(error);
  const isCompressing = stage === "compressing";
  const isSyncing = stage === "syncing";
  const isUploading = stage === "uploading";

  // Dynamic status text if not explicitly provided
  const getStatusMessage = () => {
    if (stageText) return stageText;
    if (isError) return error || "Upload failed. Please retry.";
    if (isDone) return "Successfully uploaded to cPanel cloud storage!";
    if (isSyncing) return "Synchronizing with cPanel storage & generating CDN link...";
    if (isCompressing) return "Optimizing & converting image to ultra-fast WebP...";
    if (isUploading) {
      if (totalFiles > 1) {
        return `Transferring file ${Math.min(completedFiles + 1, totalFiles)} of ${totalFiles} to server...`;
      }
      return "Transferring image to cPanel storage...";
    }
    return "Processing...";
  };

  // Stage steps visual indicator
  const stages = [
    { key: "compressing", label: "WebP Optimize", icon: PiLightningFill },
    { key: "uploading", label: "cPanel Transfer", icon: PiCloudArrowUpFill },
    { key: "syncing", label: "Storage Sync", icon: PiCloudArrowUpFill },
    { key: "done", label: "Ready", icon: PiCheckCircleFill },
  ];

  const currentStageIndex = isError 
    ? -1 
    : isDone 
      ? 3 
      : isSyncing 
        ? 2 
        : isUploading 
          ? 1 
          : 0;

  const content = (
    <div className="w-full bg-[#1A1817] text-white rounded-2xl p-4 shadow-2xl border border-gold/30 backdrop-blur-md relative overflow-hidden">
      {/* Background subtle animated gradient glow */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-gold/10 via-primary/10 to-gold/5 pointer-events-none opacity-50"
      />

      {/* Top row: File details & Controls */}
      <div className="relative z-10 flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
            isError 
              ? "bg-red-500/20 text-red-400 border border-red-500/30" 
              : isDone 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                : "bg-gold/20 text-gold border border-gold/30"
          }`}>
            {isError ? (
              <PiWarningCircleFill size={18} />
            ) : isDone ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <PiCheckCircleFill size={20} />
              </motion.div>
            ) : isCompressing ? (
              <PiLightningFill size={18} className="animate-pulse text-amber-300" />
            ) : (
              <PiCloudArrowUpFill size={18} className="animate-bounce" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-secondary text-[13px] font-semibold text-white/95 truncate">
                {fileName || "Uploading image..."}
              </span>
              {totalFiles > 1 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold/20 text-gold border border-gold/30">
                  {completedFiles}/{totalFiles}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[11px] font-medium flex items-center gap-1.5 ${
                isError ? "text-red-400" : isDone ? "text-emerald-400 font-semibold" : "text-gold/90"
              }`}>
                {!isDone && !isError && (
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
                )}
                {getStatusMessage()}
              </span>

              {totalBytes > 0 && !isDone && (
                <span className="text-[10px] text-white/40 border-l border-white/10 pl-2">
                  {formatBytes(loadedBytes)} / {formatBytes(totalBytes)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right action & percentage */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`font-secondary text-[14px] font-bold tabular-nums ${
            isError ? "text-red-400" : isDone ? "text-emerald-400" : "text-gold"
          }`}>
            {isError ? "Failed" : `${Math.round(progress)}%`}
          </span>

          {onCancel && !isDone && !isError && (
            <button
              type="button"
              onClick={onCancel}
              title="Cancel upload"
              className="w-7 h-7 rounded-lg bg-white/10 text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-colors flex items-center justify-center cursor-pointer"
            >
              <PiX size={14} />
            </button>
          )}

          {onDismiss && (isDone || isError) && (
            <button
              type="button"
              onClick={onDismiss}
              title="Dismiss"
              className="w-7 h-7 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
            >
              <PiX size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Track & Bar */}
      <div className="relative z-10 w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
        <motion.div
          className={`h-full rounded-full transition-all duration-300 relative ${
            isError 
              ? "bg-red-500" 
              : isDone 
                ? "bg-emerald-500" 
                : "bg-gradient-to-r from-amber-600 via-gold to-yellow-300 shadow-[0_0_12px_rgba(197,168,128,0.6)]"
          }`}
          style={{ width: `${Math.max(4, Math.min(100, progress))}%` }}
          initial={{ width: "0%" }}
          animate={{ width: `${Math.max(4, Math.min(100, progress))}%` }}
        />
      </div>

      {/* Smart Stages Stepper Bar */}
      <div className="relative z-10 grid grid-cols-4 gap-1 pt-1 border-t border-white/5">
        {stages.map((stg, idx) => {
          const StageIcon = stg.icon;
          const isPassed = currentStageIndex > idx;
          const isCurrent = currentStageIndex === idx;

          return (
            <div 
              key={stg.key}
              className={`flex items-center justify-center gap-1 py-1 px-1 rounded-md text-[10px] transition-colors ${
                isPassed 
                  ? "text-emerald-400 bg-emerald-500/10 font-semibold"
                  : isCurrent 
                    ? "text-gold bg-gold/15 font-bold ring-1 ring-gold/30"
                    : "text-white/30"
              }`}
            >
              <StageIcon size={12} className={isCurrent ? "animate-pulse" : ""} />
              <span className="truncate hidden sm:inline">{stg.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className={`w-full my-3 ${className}`}>
        {content}
      </div>
    );
  }

  // Floating modal/dock mode
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className={`fixed bottom-6 right-6 z-50 w-[92vw] max-w-md ${className}`}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}
