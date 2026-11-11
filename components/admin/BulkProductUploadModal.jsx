"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiXLight,
  PiUploadSimple,
  PiCheckBold,
  PiTrash,
  PiSparkleFill,
  PiLightningFill,
  PiImagesLight,
  PiArrowRight,
  PiPencilSimple,
  PiCubeLight,
  PiCheckCircleFill,
  PiWarningCircleBold
} from "react-icons/pi";
import { uploadImageFile } from "@/lib/imageUtils";
import { formatPrice } from "@/lib/utils";
import { useProducts } from "@/context/ProductContext";
import { useCategories } from "@/context/CategoryContext";
import AddCategoryModal from "./AddCategoryModal";
import { 
  checkDuplicateName, 
  checkProductCodeSequence, 
  getNextProductCode, 
  getUsedNumbersForPrefix,
  CATEGORY_DEFAULT_PREFIXES 
} from "@/lib/catalogIntelligence";
import { 
  scanImageFile, 
  checkDuplicateWithVisualScan, 
  preloadCatalogHashes 
} from "@/lib/imageScanner";
import ImageScanDetails from "./ImageScanDetails";
import toast from "react-hot-toast";

const LUXURY_NAMES_SUGGESTIONS = [
  "Bespoke Sculpted Armchair",
  "Nordic Oak Dining Table",
  "Tailored Bouclé Accent Chair",
  "Artisan Minimalist Coffee Table",
  "Contemporary Low-Slung Sofa",
  "Handcrafted Walnut Credenza",
  "Floating Minimalist Nightstand",
  "Curved Velvet Lounge Chair",
  "Bespoke Upholstered Headboard",
  "Solid Ash Dining Chair",
  "Architectural Marble Side Table",
  "Sculptural Organic Stool"
];

export default function BulkProductUploadModal({ isOpen, onClose, onBatchAdd }) {
  const { products } = useProducts();
  const { categories, getCategoryPrefix } = useCategories();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [defaultCategory, setDefaultCategory] = useState("Living Room");
  const [defaultPrice, setDefaultPrice] = useState("45000");
  const [defaultStatus, setDefaultStatus] = useState("inStock"); // "inStock" | "outOfStock"
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [inspectingFileId, setInspectingFileId] = useState(null);
  
  const [step, setStep] = useState("select"); // "select" | "uploading" | "review"
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, percent: 0 });
  const [stagedProducts, setStagedProducts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null);

  // Preload catalog hashes for instant visual matching
  useEffect(() => {
    if (isOpen && Array.isArray(products) && products.length > 0) {
      preloadCatalogHashes(products);
    }
  }, [isOpen, products]);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Filter only images
    const imageFiles = files.filter(f => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast.error("Please select valid image files (JPG, PNG, WebP)");
      return;
    }

    let duplicateCount = 0;
    const newEntries = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const scanData = await scanImageFile(file);
      const dupCheck = checkDuplicateWithVisualScan(scanData, products, null, [...selectedFiles, ...newEntries]);
      if (dupCheck.isDuplicate) duplicateCount++;

      newEntries.push({
        file,
        id: `file-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        previewUrl: URL.createObjectURL(file),
        scanData,
        isDuplicate: dupCheck.isDuplicate,
        duplicateMatchedProduct: dupCheck.matchedProduct?.name || "Existing piece",
        duplicateConfidence: dupCheck.confidence,
        duplicateMessage: dupCheck.message,
        duplicateMatchedImage: dupCheck.matchedImageUrl,
        canReuse: dupCheck.canReuse,
      });
    }

    if (duplicateCount > 0) {
      toast.error(
        `⚠️ Warning: ${duplicateCount} of the selected image(s) already exist in your catalog!`,
        { duration: 5000 }
      );
    }

    setSelectedFiles((prev) => [...prev, ...newEntries]);
    e.target.value = "";
  };

  const handleRemoveFile = (id) => {
    setSelectedFiles((prev) => {
      const target = prev.find(f => f.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleRemoveAllDuplicates = () => {
    setSelectedFiles((prev) => {
      prev.forEach(f => {
        if (f.isDuplicate && f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
      return prev.filter(f => !f.isDuplicate);
    });
    toast.success("Removed all duplicate images from queue");
  };

  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please add at least one image to upload");
      return;
    }

    setStep("uploading");
    const total = selectedFiles.length;
    const generated = [];

    // Calculate starting sequential product code for this category
    const prefix = getCategoryPrefix(defaultCategory);
    const usedNumbers = getUsedNumbersForPrefix(prefix, products);
    const startNum = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 1;

    for (let i = 0; i < total; i++) {
      const entry = selectedFiles[i];
      setUploadProgress({
        current: i + 1,
        total,
        percent: Math.round(((i + 1) / total) * 100),
      });

      // Sequential code without gaps
      const itemCode = `${prefix}${String(startNum + i).padStart(3, "0")}`;

      try {
        // Upload image file via our robust cPanel/local upload handler
        const uploadedUrl = await uploadImageFile(entry.file, "products", {
          maxWidth: 1600,
          maxHeight: 1600,
          quality: 0.85,
        });

        // Generate smart dummy data based on code + filename or curated luxury list
        const cleanNameFromFile = entry.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        
        const fallbackName = LUXURY_NAMES_SUGGESTIONS[i % LUXURY_NAMES_SUGGESTIONS.length];
        const pieceTitle = cleanNameFromFile.length > 3 ? cleanNameFromFile : fallbackName;
        const generatedName = `${itemCode} - ${pieceTitle}`;

        const autoSwatches = (entry.scanData?.dominantColors || []).map((hex, sIdx) => ({
          id: `swatch-${sIdx}`,
          label: `Tone ${sIdx + 1}`,
          color: hex,
        }));

        const prodItem = {
          tempId: `bulk-${Date.now()}-${i}`,
          code: itemCode,
          name: generatedName,
          category: defaultCategory,
          price: Number(defaultPrice) || 35000,
          description: "Artisan furniture crafted with kiln-dried solid timber, precision joinery, and tailored luxury finish.",
          images: [uploadedUrl],
          scanData: entry.scanData || null,
          swatches: autoSwatches,
          colors: autoSwatches,
          outOfStock: defaultStatus === "outOfStock",
          featured: false,
          allowcustomcolor: true,
          dimensions: entry.scanData?.dimensions || "",
          finish: entry.scanData?.composition?.badge || "",
          warranty: "",
        };

        generated.push(prodItem);
      } catch (err) {
        console.error(`Failed to upload ${entry.name}:`, err);
        toast.error(`Error uploading ${entry.name}, using local preview`);
        
        generated.push({
          tempId: `bulk-${Date.now()}-${i}`,
          code: itemCode,
          name: `${itemCode} - ${entry.name.replace(/\.[^/.]+$/, "")}`,
          category: defaultCategory,
          price: Number(defaultPrice) || 35000,
          description: "Artisan handcrafted furniture piece.",
          images: [entry.previewUrl],
          outOfStock: defaultStatus === "outOfStock",
          featured: false,
          allowcustomcolor: true,
        });
      }
    }

    setStagedProducts(generated);
    setStep("review");
    toast.success(`Successfully uploaded ${total} images! Review and finalize below.`);
  };

  const handleUpdateStagedField = (tempId, field, value) => {
    setStagedProducts((prev) =>
      prev.map((item) =>
        item.tempId === tempId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemoveStaged = (tempId) => {
    setStagedProducts((prev) => prev.filter(p => p.tempId !== tempId));
  };

  const handleFinalSubmit = async () => {
    if (stagedProducts.length === 0) {
      toast.error("No products staged to add");
      return;
    }

    setIsSaving(true);
    try {
      await onBatchAdd(stagedProducts);
      toast.success(`🎉 Added ${stagedProducts.length} new products to the catalog!`);
      handleClose();
    } catch (e) {
      toast.error("Failed to save some products: " + (e.message || "Please check network"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // Revoke object URLs to free memory
    selectedFiles.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    setSelectedFiles([]);
    setStagedProducts([]);
    setStep("select");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-6 bg-primary/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.35)] border border-secondary/10 flex flex-col"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-5 border-b border-secondary/10 bg-[#FAF8F5] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="font-secondary text-[10.5px] font-bold uppercase tracking-[0.2em] text-gold-dark flex items-center gap-1.5">
                <PiLightningFill className="text-gold" />
                Rapid Catalog Ingestion
              </span>
            </div>
            <h2 className="font-primary text-[24px] sm:text-[28px] text-secondary leading-tight">
              Bulk Product <em className="text-gold not-italic font-semibold">Upload</em>
            </h2>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-secondary/50 hover:text-secondary hover:bg-secondary/10 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <PiXLight size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* ── STEP 1: Select Files & Defaults ── */}
          {step === "select" && (
            <div className="space-y-6">
              
              {/* Batch Defaults Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-secondary/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-secondary text-[11px] font-bold uppercase tracking-wider text-secondary/60">
                      Batch Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddCatModalOpen(true)}
                      className="text-[10px] text-gold-dark hover:text-primary font-secondary font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      + Add New
                    </button>
                  </div>
                  <select
                    value={defaultCategory}
                    onChange={(e) => setDefaultCategory(e.target.value)}
                    className="w-full bg-white border border-secondary/20 rounded-xl px-3 py-2 font-secondary text-[13px] text-secondary focus:outline-none focus:border-gold"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon || "🏷️"} {cat.label} ({cat.prefix})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-secondary text-[11px] font-bold uppercase tracking-wider text-secondary/60 block mb-1.5">
                    Default Price (ብር)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={defaultPrice}
                      onChange={(e) => setDefaultPrice(e.target.value)}
                      placeholder="e.g. 45000"
                      className="w-full bg-white border border-secondary/20 rounded-xl px-3 py-2 font-secondary text-[13px] text-secondary focus:outline-none focus:border-gold pr-12"
                    />
                    <span className="absolute right-3 top-2.5 font-ethiopic text-[11px] text-secondary/50">
                      ብር
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-secondary text-[11px] font-bold uppercase tracking-wider text-secondary/60 block mb-1.5">
                    Initial Stock Status
                  </label>
                  <select
                    value={defaultStatus}
                    onChange={(e) => setDefaultStatus(e.target.value)}
                    className="w-full bg-white border border-secondary/20 rounded-xl px-3 py-2 font-secondary text-[13px] text-secondary focus:outline-none focus:border-gold"
                  >
                    <option value="inStock">In Stock</option>
                    <option value="outOfStock">Made to Order</option>
                  </select>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-secondary/25 hover:border-gold rounded-3xl p-8 sm:p-12 text-center bg-white hover:bg-gold/5 transition-all cursor-pointer group flex flex-col items-center justify-center gap-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-2xl bg-gold/15 text-gold flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PiImagesLight size={32} />
                </div>
                <h3 className="font-primary text-[20px] sm:text-[22px] text-secondary font-medium">
                  Drop multiple furniture photos here, or <span className="text-gold underline">browse</span>
                </h3>
                <p className="font-secondary text-[13px] text-secondary/50 max-w-md">
                  Upload 5, 10, or more images. We'll automatically upload them, create draft product records with default dummy data, and present them for fast review!
                </p>
                <div className="flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-secondary/5 border border-secondary/10 text-secondary/60 font-secondary text-[11px]">
                  <span>Supports JPG, PNG, WebP up to 10MB each</span>
                </div>
              </div>

              {/* Selected Files Preview Grid */}
              {selectedFiles.length > 0 && (
                <div className="space-y-3">
                  {/* Duplicate Image Notice Banner */}
                  {selectedFiles.some(f => f.isDuplicate) && (
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 font-secondary text-[12px] flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <PiWarningCircleBold size={16} className="text-amber-600 shrink-0" />
                        <span>
                          <strong>Duplicate Notice:</strong> {selectedFiles.filter(f => f.isDuplicate).length} of {selectedFiles.length} photos already exist in your catalog!
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveAllDuplicates}
                        className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-secondary text-[11px] font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                      >
                        Remove Duplicates
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-secondary text-[12px] font-bold uppercase tracking-wider text-secondary/70">
                      Selected Photos ({selectedFiles.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles([])}
                      className="font-secondary text-[11px] text-red-500 hover:underline cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-60 overflow-y-auto custom-scrollbar p-1">
                    {selectedFiles.map((fileEntry) => {
                      const isInspecting = inspectingFileId === fileEntry.id;
                      return (
                        <div
                          key={fileEntry.id}
                          onClick={() => setInspectingFileId(isInspecting ? null : fileEntry.id)}
                          className={`relative group rounded-xl overflow-hidden bg-[#F6F3EC] border aspect-square cursor-pointer transition-all ${
                            isInspecting
                              ? "ring-2 ring-gold border-gold shadow-md"
                              : fileEntry.isDuplicate
                              ? "border-amber-400 ring-2 ring-amber-300/60"
                              : "border-secondary/15 hover:border-gold/40"
                          }`}
                        >
                          <img
                            src={fileEntry.previewUrl}
                            alt={fileEntry.name}
                            className="w-full h-full object-cover"
                          />

                          {/* Composition Badge */}
                          {fileEntry.scanData?.composition?.badge && (
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/65 text-white font-secondary text-[8px] font-bold uppercase tracking-wider backdrop-blur-xs z-10">
                              {fileEntry.scanData.composition.badge}
                            </span>
                          )}

                          {/* Duplicate Badge */}
                          {fileEntry.isDuplicate && (
                            <div 
                              className="absolute top-6 left-1.5 max-w-[85%] bg-amber-600 text-white rounded px-1.5 py-0.5 text-[8px] font-secondary font-bold uppercase tracking-wider shadow-xs truncate z-10"
                              title={fileEntry.duplicateMessage}
                            >
                              In catalog ({fileEntry.duplicateMatchedProduct})
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(fileEntry.id);
                              if (inspectingFileId === fileEntry.id) setInspectingFileId(null);
                            }}
                            className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity shadow z-10 cursor-pointer"
                            title="Remove file"
                          >
                            <PiTrash size={12} />
                          </button>

                          {/* Overlay with Extracted Color Dots & Name */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-1.5 flex flex-col gap-0.5">
                            <span className="text-[9px] text-white font-secondary truncate">
                              {fileEntry.name}
                            </span>
                            {fileEntry.scanData?.dominantColors?.length > 0 && (
                              <div className="flex items-center gap-1">
                                {fileEntry.scanData.dominantColors.slice(0, 4).map((hex, cIdx) => (
                                  <span
                                    key={cIdx}
                                    className="w-2 h-2 rounded-full border border-white/40 shadow-2xs"
                                    style={{ backgroundColor: hex }}
                                    title={hex}
                                  />
                                ))}
                                {fileEntry.scanData.dimensions && (
                                  <span className="text-[8px] text-white/70 font-mono ml-auto">
                                    {fileEntry.scanData.dimensions.split(" ")[0]}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Inspected File Scan Breakdown */}
                  {inspectingFileId && (
                    <div className="pt-2 animate-fadeIn">
                      {(() => {
                        const target = selectedFiles.find(f => f.id === inspectingFileId);
                        if (!target) return null;
                        return (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-secondary text-[11px] font-bold uppercase tracking-wider text-secondary/60">
                                Visual Analysis: {target.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => setInspectingFileId(null)}
                                className="text-[10.5px] text-secondary/50 hover:text-secondary underline"
                              >
                                Close details
                              </button>
                            </div>
                            <ImageScanDetails
                              scanData={target.scanData}
                              duplicateInfo={target.isDuplicate ? {
                                isDuplicate: true,
                                confidence: target.duplicateConfidence,
                                message: target.duplicateMessage,
                                matchedProduct: { name: target.duplicateMatchedProduct },
                                matchedImageUrl: target.duplicateMatchedImage,
                                canReuse: target.canReuse,
                              } : null}
                              onRemove={() => {
                                handleRemoveFile(target.id);
                                setInspectingFileId(null);
                              }}
                            />
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* ── STEP 2: Uploading Progress ── */}
          {step === "uploading" && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-5">
              <div className="w-16 h-16 rounded-full border-4 border-gold/30 border-t-gold animate-spin flex items-center justify-center" />
              <div className="space-y-1">
                <h3 className="font-primary text-[24px] text-secondary">
                  Uploading & Creating Products...
                </h3>
                <p className="font-secondary text-[13px] text-secondary/60">
                  Processing image {uploadProgress.current} of {uploadProgress.total} ({uploadProgress.percent}%)
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-md h-2.5 bg-secondary/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gold rounded-full"
                  animate={{ width: `${uploadProgress.percent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* ── STEP 3: Review & Inline Quick Edit Table ── */}
          {step === "review" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-secondary text-[12px] flex flex-wrap items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <PiCheckCircleFill size={16} className="text-emerald-600 shrink-0" />
                  All {stagedProducts.length} images processed! Review or adjust codes & prices before saving.
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const prefix = CATEGORY_DEFAULT_PREFIXES[defaultCategory] || "KSF";
                      const used = getUsedNumbersForPrefix(prefix, products);
                      const start = used.length > 0 ? Math.max(...used) + 1 : 1;
                      setStagedProducts(prev => prev.map((p, pIdx) => {
                        const code = `${prefix}${String(start + pIdx).padStart(3, "0")}`;
                        const rawTitle = p.name.replace(/^[A-Za-z]{2,6}\d+\s*[-_]?\s*/, "");
                        return { ...p, code, name: `${code} - ${rawTitle || 'Artisan Furniture'}` };
                      }));
                      toast.success(`Re-indexed all items under continuous ${prefix} sequence!`);
                    }}
                    className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-secondary text-[10.5px] font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                  >
                    Auto Re-Index Codes
                  </button>
                  <span className="font-bold text-emerald-950">{stagedProducts.length} Staged</span>
                </div>
              </div>

              {/* Editable Staged Table */}
              <div className="border border-secondary/10 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-secondary/10 font-secondary text-[10px] font-bold tracking-widest uppercase text-secondary/50">
                      <th className="py-3 px-4 min-w-[70px]">Image</th>
                      <th className="py-3 px-4 min-w-[240px]">Product Name & Code</th>
                      <th className="py-3 px-4 min-w-[140px]">Category</th>
                      <th className="py-3 px-4 min-w-[130px]">Price (ብር)</th>
                      <th className="py-3 px-4 min-w-[120px]">Status</th>
                      <th className="py-3 px-3 text-right">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary/5">
                    {stagedProducts.map((item, idx) => {
                      const dupNameCheck = checkDuplicateName(item.name, products);
                      const isBatchDuplicate = stagedProducts.some((other, oIdx) => oIdx !== idx && other.name.trim().toLowerCase() === item.name.trim().toLowerCase());
                      const seqCheck = checkProductCodeSequence(item.name, products);

                      return (
                        <tr key={item.tempId} className={`transition-colors ${
                          dupNameCheck.isDuplicate || isBatchDuplicate || seqCheck.hasGap ? "bg-amber-50/30" : "hover:bg-[#FAF8F5]/60"
                        }`}>
                          {/* Thumbnail & Composition Info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="relative w-12 h-12 rounded-xl bg-[#F6F3EC] overflow-hidden border border-secondary/10 shrink-0">
                                <img
                                  src={item.images[0]}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              {item.scanData && (
                                <div className="hidden sm:flex flex-col gap-1">
                                  <span className="px-1.5 py-0.5 rounded bg-secondary/8 text-secondary/70 font-secondary text-[8.5px] font-bold uppercase tracking-wider w-fit">
                                    {item.scanData.composition?.badge || "Piece"}
                                  </span>
                                  {item.scanData.dominantColors?.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      {item.scanData.dominantColors.slice(0, 3).map((hex, hIdx) => (
                                        <span
                                          key={hIdx}
                                          className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-2xs"
                                          style={{ backgroundColor: hex }}
                                          title={hex}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Title Input with Live Sequence & Duplicate Feedback */}
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) =>
                                handleUpdateStagedField(item.tempId, "name", e.target.value)
                              }
                              className={`w-full bg-white border rounded-lg px-2.5 py-1.5 font-primary text-[15px] font-medium text-secondary focus:outline-none ${
                                dupNameCheck.isDuplicate || isBatchDuplicate
                                  ? "border-red-400 focus:border-red-500"
                                  : seqCheck.hasGap
                                  ? "border-amber-400 focus:border-amber-500"
                                  : "border-secondary/20 focus:border-gold"
                              }`}
                            />

                            {/* Duplicate Name Alert */}
                            {(dupNameCheck.isDuplicate || isBatchDuplicate) && (
                              <span className="text-[10px] text-red-600 font-semibold block mt-0.5">
                                ⚠️ Name already in use {dupNameCheck.isDuplicate ? `(${dupNameCheck.matchedProduct?.category || 'Catalog'})` : '(Duplicate in Batch)'}
                              </span>
                            )}

                            {/* Sequence Gap Alert with 1-Click Fix */}
                            {seqCheck.hasGap && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] text-amber-800 font-semibold">
                                  ⚠️ Jumped! (Skipped {seqCheck.skippedCodes?.[0] || seqCheck.expectedNextCode})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const fixCode = seqCheck.suggestedFixCode || seqCheck.expectedNextCode;
                                    const newName = item.name.replace(/\b[A-Za-z]{2,6}\d+\b/, fixCode);
                                    handleUpdateStagedField(item.tempId, "name", newName);
                                  }}
                                  className="text-[9.5px] px-1.5 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold uppercase transition-colors shadow-2xs"
                                >
                                  Use {seqCheck.suggestedFixCode || seqCheck.expectedNextCode}
                                </button>
                              </div>
                            )}

                            {/* Verified Sequence Code */}
                            {seqCheck.type === "valid" && !dupNameCheck.isDuplicate && !isBatchDuplicate && (
                              <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
                                ✓ Verified code: {seqCheck.formattedCode}
                              </span>
                            )}
                          </td>

                        {/* Category Selector */}
                        <td className="py-3 px-4">
                          <select
                            value={item.category}
                            onChange={(e) =>
                              handleUpdateStagedField(item.tempId, "category", e.target.value)
                            }
                            className="w-full bg-white border border-secondary/20 rounded-lg px-2.5 py-1.5 font-secondary text-[12px] text-secondary focus:outline-none focus:border-gold"
                          >
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.icon || "🏷️"} {cat.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Price Input */}
                        <td className="py-3 px-4">
                          <div className="relative">
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) =>
                                handleUpdateStagedField(item.tempId, "price", Number(e.target.value))
                              }
                              className="w-full bg-white border border-secondary/20 rounded-lg px-2.5 py-1.5 font-secondary text-[12px] font-bold text-primary focus:outline-none focus:border-gold pr-8"
                            />
                            <span className="absolute right-2 top-2 font-ethiopic text-[10px] text-secondary/40">
                              ብር
                            </span>
                          </div>
                        </td>

                        {/* Stock Toggle */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateStagedField(
                                item.tempId,
                                "outOfStock",
                                !item.outOfStock
                              )
                            }
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border ${
                              item.outOfStock
                                ? "bg-amber-500/10 text-amber-800 border-amber-500/30"
                                : "bg-emerald-500/10 text-emerald-800 border-emerald-500/30"
                            }`}
                          >
                            {item.outOfStock ? "Made to Order" : "In Stock"}
                          </button>
                        </td>

                        {/* Remove */}
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveStaged(item.tempId)}
                            className="p-1.5 text-secondary/40 hover:text-red-500 transition-colors"
                          >
                            <PiTrash size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Sticky Bottom Actions */}
        <div className="px-6 py-4 border-t border-secondary/10 bg-[#FAF8F5] flex items-center justify-between">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 rounded-full border border-secondary/20 text-secondary/70 hover:text-secondary font-secondary text-[11px] font-bold uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>

          {step === "select" && (
            <button
              type="button"
              onClick={handleStartUpload}
              disabled={selectedFiles.length === 0}
              className="px-7 py-2.5 rounded-full bg-gold hover:bg-gold-dark text-primary font-secondary text-[11px] font-bold uppercase tracking-widest transition-all shadow-[0_4px_16px_rgba(217,182,110,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Upload {selectedFiles.length > 0 ? `(${selectedFiles.length}) Photos` : ""}</span>
              <PiArrowRight size={14} />
            </button>
          )}

          {step === "review" && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep("select")}
                className="px-4 py-2 font-secondary text-[11px] text-secondary/60 hover:text-secondary"
              >
                + Add More Photos
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSaving || stagedProducts.length === 0}
                className="px-7 py-2.5 rounded-full bg-primary hover:bg-gold text-white hover:text-primary font-secondary text-[11px] font-bold uppercase tracking-widest transition-all shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Catalog...</span>
                  </>
                ) : (
                  <>
                    <PiCheckBold size={14} />
                    <span>Confirm & Add {stagedProducts.length} Products</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

      </motion.div>

      <AddCategoryModal
        isOpen={isAddCatModalOpen}
        onClose={() => setIsAddCatModalOpen(false)}
        onSuccess={(newCat) => {
          if (newCat) setDefaultCategory(newCat.id);
        }}
      />
    </div>
  );
}
