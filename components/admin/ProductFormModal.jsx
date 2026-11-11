"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PiX, 
  PiUploadSimple, 
  PiTrash, 
  PiPlus, 
  PiCheckBold, 
  PiPalette,
  PiEyeLight,
  PiPencilSimpleLight,
  PiStarFill,
  PiStarLight,
  PiSparkleLight,
  PiCubeLight,
  PiRulerLight,
  PiHammerBold,
  PiCheckCircleFill,
  PiImagesLight,
  PiWarningCircleBold
} from "react-icons/pi";
import { compressImage, uploadImageFile, resolveImageUrl } from "@/lib/imageUtils";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useProducts } from "@/context/ProductContext";
import { useCategories } from "@/context/CategoryContext";
import AddCategoryModal from "./AddCategoryModal";
import { 
  checkDuplicateName, 
  checkProductCodeSequence, 
  getNextProductCode, 
  checkImageDuplicate 
} from "@/lib/catalogIntelligence";
import { 
  scanImageFile, 
  scanImageUrl, 
  checkDuplicateWithVisualScan, 
  preloadCatalogHashes 
} from "@/lib/imageScanner";
import ImageScanDetails from "./ImageScanDetails";
import UploadProgressBar from "./UploadProgressBar";
import toast from "react-hot-toast";

const PRESET_COLORS = [
  { label: "cream", color: "#F2E3D5" },
  { label: "grand", color: "#836A58" },
  { label: "taupe", color: "#948473" },
  { label: "mocha", color: "#A47F6A" },
  { label: "noir",  color: "#1F1F21" },
  { label: "gold",  color: "#D9B66E" },
  { label: "olive", color: "#556B2F" },
  { label: "navy",  color: "#1B263B" },
];

const QUICK_INSPIRATION_PHRASES = [
  "Solid kiln-dried ash wood frame",
  "High-resilience foam core",
  "Premium textured bouclé fabric",
  "Custom sizing & bespoke fabrics on request",
  "Complimentary white-glove Addis delivery"
];

export default function ProductFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [activeTab, setActiveTab] = useState("form"); // "form" | "preview"
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: "",
    description: "",
    category: "Living Room",
    type: "Furniture",
    structure: "",
    finish: "",
    dimensions: "",
    color: "Neutral",
    swatches: [],
    allowCustomColor: true,
    allowcustomcolor: true,
    allow_custom_color: true,
    isNew: false,
    featured: false,
    bestSeller: false,
    showInHero: false,
    outOfStock: false,
    images: [],
  });

  const [uploadProgress, setUploadProgress] = useState({
    active: false,
    percent: 0,
    stage: "idle",
    stageText: "",
    fileName: "",
    loadedBytes: 0,
    totalBytes: 0,
    totalFiles: 0,
    completedFiles: 0,
    error: null,
  });

  const abortControllerRef = useRef(null);
  const [newColorLabel, setNewColorLabel] = useState("");
  const [newColorHex, setNewColorHex] = useState("#836A58");

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || "",
        name: initialData.name || "",
        price: initialData.price ? initialData.price.toString() : "",
        description: initialData.description || "",
        category: initialData.category || "Living Room",
        type: initialData.type || "Furniture",
        structure: initialData.structure || "",
        finish: initialData.finish || "",
        dimensions: initialData.dimensions || "",
        color: initialData.color || "Neutral",
        swatches: initialData.swatches || initialData.colors || [],
        allowCustomColor: initialData.allowCustomColor ?? initialData.allowcustomcolor ?? initialData.allow_custom_color ?? true,
        allowcustomcolor: initialData.allowCustomColor ?? initialData.allowcustomcolor ?? initialData.allow_custom_color ?? true,
        allow_custom_color: initialData.allowCustomColor ?? initialData.allowcustomcolor ?? initialData.allow_custom_color ?? true,
        isNew: initialData.isNew || false,
        featured: initialData.featured || false,
        bestSeller: initialData.bestSeller || false,
        showInHero: initialData.showInHero || initialData.id === heroProductId || false,
        outOfStock: initialData.outOfStock || false,
        images: initialData.images || [],
      });
    } else {
      setFormData({
        id: `prod-${Date.now()}`,
        name: "",
        price: "",
        description: "",
        category: "Living Room",
        type: "Furniture",
        structure: "",
        finish: "",
        dimensions: "",
        color: "Neutral",
        swatches: [],
        allowCustomColor: true,
        allowcustomcolor: true,
        allow_custom_color: true,
        images: [],
        isNew: false,
        featured: false,
        bestSeller: false,
        showInHero: false,
        outOfStock: false,
      });
    }
    setActiveTab("form");
  }, [initialData, isOpen]);

  const { heroProductId, updateHeroProduct } = useSiteSettings();
  const { products } = useProducts();
  const { categories, prefixMap } = useCategories();
  const [duplicateImageAlerts, setDuplicateImageAlerts] = useState([]);
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [activeImageScan, setActiveImageScan] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Preload catalog hashes for instant visual matching
  useEffect(() => {
    if (isOpen && Array.isArray(products) && products.length > 0) {
      preloadCatalogHashes(products);
    }
  }, [isOpen, products]);

  // Scan currently selected image for composition and palette
  useEffect(() => {
    const currentImg = formData.images[selectedImageIndex] || formData.images[0];
    if (currentImg) {
      scanImageUrl(resolveImageUrl(currentImg)).then(res => {
        if (res) setActiveImageScan(res);
      });
    } else {
      setActiveImageScan(null);
    }
  }, [formData.images, selectedImageIndex]);

  // 1-Click apply scanned dominant colors to finishes & swatches
  const handleAutoAddSwatches = (hexColors) => {
    if (!Array.isArray(hexColors) || hexColors.length === 0) return;
    const addedCount = hexColors.length;
    setFormData(prev => {
      const existing = Array.isArray(prev.swatches) ? prev.swatches : [];
      const newItems = hexColors.map((hex, i) => ({
        id: `swatch-${Date.now()}-${i}`,
        label: `Tone ${existing.length + i + 1}`,
        color: hex,
      }));
      return {
        ...prev,
        allowCustomColor: true,
        allowcustomcolor: true,
        allow_custom_color: true,
        swatches: [...existing, ...newItems],
      };
    });
    toast.success(`✨ Added ${addedCount} palette tones to finish swatches!`);
  };

  // 1-Click reuse existing uploaded image URL without duplicating bytes
  const handleReuseExistingAsset = (matchedImageUrl, duplicateAlertId) => {
    if (!matchedImageUrl) return;
    setFormData(prev => ({
      ...prev,
      images: prev.images.includes(matchedImageUrl) ? prev.images : [...prev.images, matchedImageUrl],
    }));
    setDuplicateImageAlerts(prev => prev.filter(a => a.id !== duplicateAlertId));
    toast.success("Linked existing catalog image asset without re-uploading!");
  };

  // Live duplicate name check
  const duplicateNameCheck = checkDuplicateName(formData.name, products, formData.id);

  // Live product code sequence gap check (e.g. KSF001, KKC001 vs KKC002)
  const codeSequenceCheck = checkProductCodeSequence(formData.name, products, formData.id);

  // Suggested next sequential code for current category
  const suggestedNextCode = getNextProductCode(formData.category, products, prefixMap);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Verification: Description is the only strictly mandatory field
    if (!formData.description.trim()) {
      alert("Please enter a Product Description. It is the only required field.");
      return;
    }

    // Name Duplicate Confirmation
    if (duplicateNameCheck.isDuplicate) {
      const proceed = confirm(
        `⚠️ Duplicate Name Notice:\n${duplicateNameCheck.message}\n\nDo you want to continue saving this piece with a duplicate name?`
      );
      if (!proceed) return;
    }

    // Code Sequence Jump Warning
    if (codeSequenceCheck.hasGap) {
      const proceed = confirm(
        `⚠️ Sequence Gap Notice:\n${codeSequenceCheck.message}\n\nDo you want to proceed anyway?`
      );
      if (!proceed) return;
    }

    const isAllowColor = Boolean(formData.allowCustomColor);
    const finalSwatches = isAllowColor ? (formData.swatches || []) : [];

    // Smart default for Name if admin left it blank
    const autoCode = `KSF-${Date.now().toString().slice(-4)}`;
    const finalName = formData.name.trim() || autoCode;
    const finalPrice = formData.price ? Number(formData.price) : 0;

    const submitData = {
      ...formData,
      name: finalName,
      price: finalPrice,
      swatches: finalSwatches,
      colors: finalSwatches,
      allowCustomColor: isAllowColor,
      allowcustomcolor: isAllowColor,
      allow_custom_color: isAllowColor,
      images: formData.images,
    };

    if (formData.showInHero) {
      submitData.featured = true;
      updateHeroProduct({ ...submitData });
    } else if (heroProductId === submitData.id) {
      updateHeroProduct(null);
    }

    delete submitData.showInHero;

    onSubmit(submitData);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleAddInspiration = (phrase) => {
    setFormData(prev => ({
      ...prev,
      description: prev.description 
        ? `${prev.description.trim()}. ${phrase}`
        : phrase
    }));
  };

  const handleAddSwatch = (label, color) => {
    const cleanLabel = String(label || "").trim();
    if (!cleanLabel) return;
    const swatch = {
      id: `swatch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      label: cleanLabel.toLowerCase(),
      color: color || "#836A58",
    };
    setFormData(prev => ({
      ...prev,
      swatches: [
        ...(Array.isArray(prev.swatches) ? prev.swatches : []).filter(s => 
          (typeof s === "string" ? s : s?.label) !== swatch.label
        ), 
        swatch
      ]
    }));
    setNewColorLabel("");
  };

  const handleRemoveSwatch = (idOrLabel) => {
    setFormData(prev => ({
      ...prev,
      swatches: (Array.isArray(prev.swatches) ? prev.swatches : []).filter(s => {
        if (typeof s === "string") return s !== idOrLabel;
        return s.id !== idOrLabel && s.label !== idOrLabel;
      })
    }));
  };

  const handleImageFiles = async (filesList) => {
    const files = Array.from(filesList);
    if (!files.length) return;

    // 1. Scan image content, composition, and check for duplicates across catalog & batch
    const dupAlerts = [];
    const scannedBatch = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const scanned = await scanImageFile(f);
      if (scanned) {
        scannedBatch.push(scanned);
        const dup = checkDuplicateWithVisualScan(scanned, products, formData.id, scannedBatch);
        if (dup.isDuplicate) {
          dupAlerts.push({
            id: `dup-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
            file: f,
            fileName: f.name,
            scanData: scanned,
            duplicateInfo: dup,
          });
        }
      }
    }

    if (dupAlerts.length > 0) {
      setDuplicateImageAlerts(prev => [...prev, ...dupAlerts]);
      const warningText = dupAlerts.map(d => `• "${d.fileName}": ${d.duplicateInfo.message}`).join("\n");
      const shouldContinue = confirm(
        `⚠️ Duplicate Image Notice:\n${warningText}\n\nDo you want to continue uploading anyway?`
      );
      if (!shouldContinue) return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsUploadingImages(true);
    const totalFiles = files.length;
    const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);

    setUploadProgress({
      active: true,
      percent: 5,
      stage: "compressing",
      stageText: `Preparing ${totalFiles} image${totalFiles > 1 ? "s" : ""} for upload...`,
      fileName: files[0].name,
      loadedBytes: 0,
      totalBytes: totalSize,
      totalFiles,
      completedFiles: 0,
      error: null,
    });

    try {
      const uploadedUrls = [];

      for (let i = 0; i < files.length; i++) {
        if (controller.signal.aborted) break;
        const file = files[i];

        setUploadProgress(prev => ({
          ...prev,
          fileName: file.name,
          stage: "uploading",
          stageText: `Transferring file ${i + 1} of ${totalFiles}...`,
        }));

        const url = await uploadImageFile(file, "products", {
          maxWidth: 1600,
          maxHeight: 1600,
          quality: 0.85,
          signal: controller.signal,
          onProgress: (p) => {
            const basePct = (i / totalFiles) * 100;
            const itemPct = (p.percent / 100) * (100 / totalFiles);
            const overallPct = Math.round(basePct + itemPct);

            setUploadProgress(prev => ({
              ...prev,
              percent: Math.min(99, overallPct),
              stage: p.stage,
              stageText: `File ${i + 1}/${totalFiles}: ${p.stageText}`,
              fileName: file.name,
              loadedBytes: Math.round((totalSize * overallPct) / 100),
              totalBytes: totalSize,
            }));
          },
        });

        uploadedUrls.push(url);
        setUploadProgress(prev => ({
          ...prev,
          completedFiles: i + 1,
        }));
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));

      setUploadProgress(prev => ({
        ...prev,
        percent: 100,
        stage: "done",
        stageText: `All ${totalFiles} images uploaded to cPanel storage!`,
        completedFiles: totalFiles,
      }));

      setTimeout(() => {
        setUploadProgress(prev => ({ ...prev, active: false }));
      }, 2500);
    } catch (error) {
      if (error.name !== "AbortError" && !error.message?.includes("aborted")) {
        console.error("Error uploading images to cPanel storage:", error);
        setUploadProgress(prev => ({
          ...prev,
          stage: "error",
          error: error?.message || "Failed to upload images",
        }));
      } else {
        setUploadProgress(prev => ({ ...prev, active: false }));
      }
    } finally {
      setIsUploadingImages(false);
      abortControllerRef.current = null;
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const setCoverImage = (indexToCover) => {
    setFormData(prev => {
      const selected = prev.images[indexToCover];
      const rest = prev.images.filter((_, idx) => idx !== indexToCover);
      return {
        ...prev,
        images: [selected, ...rest]
      };
    });
  };

  const previewImage = Array.isArray(formData?.images) && formData.images[0] ? resolveImageUrl(formData.images[0]) : "/assets/img/hero/beige-chair.jpeg";
  const displayPrice = formData?.price ? Number(formData.price).toLocaleString() : "0";
  const displayName = String(formData?.name || "").trim() || "KSF-(Auto Code)";

  return (
    <>
      <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8">
          
          {/* Backdrop */}
          <motion.div
            key="product-form-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-primary/45 backdrop-blur-md"
          />

          {/* Modal Window */}
          <motion.div
            key="product-form-window"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-5xl bg-white rounded-3xl sm:rounded-[2.25rem] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.35)] border border-secondary/10 overflow-hidden flex flex-col max-h-[92vh]"
          >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-secondary/10 bg-[#FAF8F5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
                <PiSparkleLight size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-primary text-[22px] sm:text-[24px] text-secondary font-semibold">
                    {initialData ? "Edit" : "Create"} <em className="text-gold not-italic">Product</em>
                  </h2>
                  <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-[5px] bg-emerald-600/10 text-emerald-800 text-[10px] font-secondary font-bold uppercase tracking-wider border border-emerald-600/20">
                    Smart Editor
                  </span>
                </div>
                <p className="font-secondary text-[11.5px] text-secondary/55">
                  <strong className="text-gold">Description is mandatory</strong> · All other fields are optional.
                </p>
              </div>
            </div>

            {/* View Switcher Tabs & Close */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white p-1 rounded-xl border border-secondary/15 shadow-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("form")}
                  className={`px-3.5 py-1.5 rounded-lg font-secondary text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "form" 
                      ? "bg-primary text-white shadow-xs" 
                      : "text-secondary/60 hover:text-secondary"
                  }`}
                >
                  <PiPencilSimpleLight size={13} />
                  <span>Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-3.5 py-1.5 rounded-lg font-secondary text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "preview" 
                      ? "bg-gold text-primary shadow-xs" 
                      : "text-secondary/60 hover:text-secondary"
                  }`}
                >
                  <PiEyeLight size={14} />
                  <span>Live Preview</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-gold hover:text-white text-secondary/60 transition-all border border-secondary/10 shadow-xs cursor-pointer"
                aria-label="Close"
              >
                <PiX size={18} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">
            
            {activeTab === "preview" ? (
              /* ── LIVE STORE PREVIEW MODE ── */
              <div className="space-y-8 max-w-3xl mx-auto py-2">
                <div className="text-center mb-6">
                  <span className="font-secondary text-[11px] font-bold uppercase tracking-[0.2em] text-gold block mb-1">
                    Storefront Appearance
                  </span>
                  <p className="font-secondary text-[13px] text-secondary/60">
                    This is how customers will experience this piece in the catalogue and details modal.
                  </p>
                </div>

                {/* Card Preview */}
                <div className="flex flex-col sm:flex-row gap-8 items-start justify-center">
                  <div className="w-full max-w-[300px] mx-auto bg-white rounded-3xl overflow-hidden border border-secondary/10 shadow-[0_15px_40px_rgba(0,0,0,0.06)] flex flex-col">
                    <div className="relative w-full aspect-square bg-[#F6F3EC] flex items-center justify-center overflow-hidden">
                      <img 
                        src={previewImage} 
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                      {formData.outOfStock ? (
                        <div className="absolute top-3 left-3 px-2.5 py-0.5 bg-amber-600 text-white rounded-full font-secondary text-[9px] font-bold tracking-wider uppercase">
                          Made To Order
                        </div>
                      ) : formData.featured && (
                        <div className="absolute top-3 left-3 px-2.5 py-0.5 bg-primary text-white rounded-full font-secondary text-[9px] font-bold tracking-wider uppercase">
                          Signature
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t border-secondary/10 bg-white">
                      <span className="font-secondary text-[10px] font-bold uppercase tracking-wider text-secondary/40 block mb-0.5">
                        {formData.category}
                      </span>
                      <h4 className="font-primary text-[18px] text-secondary font-medium truncate mb-1">
                        {displayName}
                      </h4>
                      <p className="font-secondary text-[12px] text-secondary/65 line-clamp-2 mb-3">
                        {formData.description || "Description preview will appear here..."}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-secondary/5">
                        <span className="font-secondary text-[15px] font-bold text-primary">
                          {displayPrice} <span className="font-ethiopic text-[12px] font-normal text-secondary/60">ብር</span>
                        </span>
                        <span className="font-secondary text-[10px] font-bold uppercase tracking-wider bg-secondary/5 px-2.5 py-1 rounded-full text-secondary">
                          {formData.outOfStock ? "Order" : "Add to Cart"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick specs preview notes */}
                  <div className="flex-1 bg-[#FAF8F5] rounded-3xl p-6 border border-secondary/10 space-y-4">
                    <h3 className="font-primary text-[20px] text-secondary">Store Configuration Summary</h3>
                    
                    <div className="space-y-2 text-[12.5px] font-secondary text-secondary/75">
                      <p>• <strong>Primary Image:</strong> {(Array.isArray(formData.images) && formData.images.length > 0) ? `${formData.images.length} photo(s) attached` : "Placeholder applied"}</p>
                      <p>• <strong>Color Swatches:</strong> {(Array.isArray(formData.swatches) && formData.swatches.length > 0) ? `${formData.swatches.length} swatch(es) enabled` : "Swatches disabled"}</p>
                      <p>• <strong>Custom Color Orders:</strong> {formData.allowCustomColor ? "Allowed (+ Custom Color Button Active)" : "Disabled"}</p>
                      <p>• <strong>Structure:</strong> {String(formData.structure || "").trim() || "Defaults to solid hardwood"}</p>
                      <p>• <strong>Dimensions:</strong> {String(formData.dimensions || "").trim() || "Defaults to bespoke standard"}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("form")}
                      className="mt-4 px-5 py-2 rounded-full bg-primary text-white font-secondary text-[11px] font-bold uppercase tracking-wider hover:bg-gold transition-colors"
                    >
                      ← Return to Edit Fields
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ── MAIN FORM EDITOR ── */
              <form id="product-form" onSubmit={handleSubmit} className="space-y-7">
                
                {/* 1. DESCRIPTION (The ONLY Mandatory Field!) */}
                <div className="p-5 sm:p-6 rounded-3xl bg-[#FAF8F5] border border-gold/40 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-secondary text-[11.5px] font-bold tracking-[0.18em] uppercase text-secondary flex items-center gap-1.5">
                      <span className="text-gold text-base">✦</span>
                      <span>Product Description</span>
                      <span className="px-2 py-0.5 rounded-[4px] bg-gold/15 text-gold-dark text-[9.5px] font-bold uppercase tracking-wider border border-gold/30 ml-1">
                        Mandatory
                      </span>
                    </label>
                    <span className="font-secondary text-[11px] text-secondary/40 italic">
                      {formData.description.length} characters
                    </span>
                  </div>

                  <textarea
                    required
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-white border border-secondary/20 rounded-2xl p-4 font-secondary text-[14px] text-secondary focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all resize-y placeholder:text-secondary/35 leading-relaxed"
                    placeholder="Enter the product story, craftsmanship notes, or client invitation (e.g. 'A masterfully sculpted living room sofa handcrafted with solid ash wood and high-resilience bouclé upholstery.')..."
                  />

                  {/* Quick Inspiration Chips */}
                  <div className="pt-1">
                    <span className="font-secondary text-[10px] font-bold uppercase tracking-wider text-secondary/40 block mb-1.5">
                      Quick Add Phrases (Click to append):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_INSPIRATION_PHRASES.map((phrase, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => handleAddInspiration(phrase)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-secondary/15 text-secondary/70 hover:border-gold hover:text-gold font-secondary text-[11px] transition-colors cursor-pointer"
                        >
                          + {phrase}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. CORE INFORMATION (Optional) */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-secondary/10 space-y-5">
                  <div className="flex items-center justify-between border-b border-secondary/8 pb-3">
                    <h3 className="font-primary text-[18px] text-secondary flex items-center gap-2">
                      <PiCubeLight className="text-gold text-lg" />
                      Essential Information
                    </h3>
                    <span className="font-secondary text-[10.5px] text-secondary/40 uppercase tracking-wider font-semibold">
                      Optional
                    </span>
                  </div>

                  {/* Name & Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60">
                          Product Code / Name
                        </label>
                        <span className="font-secondary text-[10px] text-secondary/40 italic">Optional</span>
                      </div>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full bg-[#FAF8F5] border rounded-xl px-4 py-2.5 font-secondary text-[14px] text-secondary focus:outline-none transition-all placeholder:text-secondary/35 ${
                          duplicateNameCheck.isDuplicate || codeSequenceCheck.isDuplicate
                            ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                            : codeSequenceCheck.hasGap
                            ? "border-amber-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                            : "border-secondary/15 focus:border-gold focus:ring-1 focus:ring-gold/30"
                        }`}
                        placeholder={`e.g. ${suggestedNextCode} or Royal Lumina Sofa`}
                      />

                      {/* Duplicate Name Feedback */}
                      {duplicateNameCheck.isDuplicate && (
                        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-secondary text-[11.5px]">
                          <PiWarningCircleBold size={16} className="text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Name Already in Use:</span> {duplicateNameCheck.message}
                          </div>
                        </div>
                      )}

                      {/* Duplicate Code Feedback */}
                      {codeSequenceCheck.isDuplicate && (
                        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-secondary text-[11.5px]">
                          <PiWarningCircleBold size={16} className="text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Code Already Used:</span> {codeSequenceCheck.message}
                          </div>
                        </div>
                      )}

                      {/* Sequence Gap Feedback with 1-Click Fix */}
                      {codeSequenceCheck.hasGap && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-secondary text-[11.5px] space-y-1.5">
                          <div className="flex items-start gap-2">
                            <PiWarningCircleBold size={16} className="text-amber-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <span className="font-bold">Sequence Jump Warning:</span> {codeSequenceCheck.message}
                            </div>
                          </div>
                          {(codeSequenceCheck.suggestedFixCode || codeSequenceCheck.expectedNextCode) && (
                            <div className="flex items-center gap-2 pt-1 pl-6">
                              <span className="text-[10.5px] text-amber-800">1-Click Auto-Fix:</span>
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ 
                                  ...prev, 
                                  name: codeSequenceCheck.suggestedFixCode || codeSequenceCheck.expectedNextCode 
                                }))}
                                className="px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-secondary text-[10px] font-bold uppercase tracking-wider transition-colors shadow-xs"
                              >
                                Use {codeSequenceCheck.suggestedFixCode || codeSequenceCheck.expectedNextCode}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Valid sequence badge */}
                      {codeSequenceCheck.type === "valid" && !duplicateNameCheck.isDuplicate && (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-secondary text-[11px] pt-0.5">
                          <PiCheckCircleFill size={13} className="text-emerald-600" />
                          <span>Code sequence verified ({codeSequenceCheck.formattedCode})</span>
                        </div>
                      )}

                      {/* Next Code Helper when blank */}
                      {!formData.name && (
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="font-secondary text-[10.5px] text-secondary/50">Suggested next code:</span>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, name: suggestedNextCode }))}
                            className="px-2 py-0.5 rounded-md bg-gold/15 text-gold-dark hover:bg-gold/25 font-secondary text-[10.5px] font-bold tracking-wider transition-colors cursor-pointer"
                          >
                            + {suggestedNextCode}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60">
                          Price in ብር
                        </label>
                        <span className="font-secondary text-[10px] text-secondary/40 italic">Optional (Defaults to 0)</span>
                      </div>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full bg-[#FAF8F5] border border-secondary/15 rounded-xl px-4 py-2.5 font-secondary text-[14px] text-secondary focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all placeholder:text-secondary/35"
                        placeholder="e.g. 80000"
                      />
                    </div>
                  </div>

                  {/* Interactive Category Selector */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60">
                          Select Category
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsAddCatModalOpen(true)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gold/15 hover:bg-gold text-gold-dark hover:text-primary font-secondary text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border border-gold/30 active:scale-98"
                        >
                          + New Category
                        </button>
                      </div>
                      <span className="font-secondary text-[11px] font-semibold text-gold">{formData.category}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {categories.map(cat => {
                        const isSelected = formData.category === cat.id || formData.category === cat.label;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, category: cat.id }))}
                            className={`p-3 rounded-2xl border transition-all text-left flex items-center gap-2.5 cursor-pointer ${
                              isSelected
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-[#FAF8F5] text-secondary/70 border-secondary/10 hover:border-gold/40 hover:bg-white"
                            }`}
                          >
                            <span className="text-xl shrink-0">{cat.icon || "🏷️"}</span>
                            <div className="flex flex-col min-w-0">
                              <span className="font-secondary text-[12px] font-semibold truncate leading-tight">
                                {cat.label}
                              </span>
                              <span className={`font-mono text-[9.5px] uppercase tracking-wider mt-0.5 ${
                                isSelected ? "text-gold" : "text-secondary/40"
                              }`}>
                                [{cat.prefix}]
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. STUDIO PHOTOGRAPHY & UPLOADS (Optional) */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-secondary/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-secondary/8 pb-3">
                    <div>
                      <h3 className="font-primary text-[18px] text-secondary flex items-center gap-2">
                        <PiImagesLight className="text-gold text-lg" />
                        Studio Product Images
                      </h3>
                      <p className="font-secondary text-[11px] text-secondary/50 mt-0.5">
                        Upload full-bleed 1:1 or studio photos. First image is used as the catalogue cover.
                      </p>
                    </div>
                    <span className="font-secondary text-[10.5px] text-secondary/40 uppercase tracking-wider font-semibold">
                      Optional
                    </span>
                  </div>

                  {/* Previews Grid */}
                  {formData.images.length > 0 && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3 pt-1">
                        {formData.images.map((imgUrl, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`relative aspect-square rounded-2xl overflow-hidden group border transition-all cursor-pointer ${
                              selectedImageIndex === idx
                                ? "ring-2 ring-primary border-transparent shadow-md scale-[1.02]"
                                : idx === 0
                                ? "ring-1 ring-gold/80 border-gold/40 shadow-xs"
                                : "border-secondary/15 hover:border-gold/50"
                            }`}
                          >
                            <img 
                              src={resolveImageUrl(imgUrl)} 
                              alt={`Preview ${idx}`} 
                              className="w-full h-full object-cover" 
                            />
                            
                            {/* Star for Cover image */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCoverImage(idx);
                              }}
                              title={idx === 0 ? "Current Cover Image" : "Make Cover Image"}
                              className={`absolute top-1.5 left-1.5 p-1 rounded-full backdrop-blur-md transition-colors ${
                                idx === 0 ? "bg-gold text-white" : "bg-black/40 text-white/70 hover:text-white"
                              }`}
                            >
                              {idx === 0 ? <PiStarFill size={13} /> : <PiStarLight size={13} />}
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(idx);
                              }}
                              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600/80 hover:bg-red-600 text-white transition-colors"
                              title="Remove image"
                            >
                              <PiTrash size={13} />
                            </button>

                            {idx === 0 && (
                              <span className="absolute bottom-1 inset-x-1 text-center font-secondary text-[9px] font-bold uppercase tracking-wider bg-black/60 text-white py-0.5 rounded-md backdrop-blur-xs pointer-events-none">
                                Cover
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Photo Content, Composition & Extracted Palette Intelligence */}
                      {activeImageScan && (
                        <div className="pt-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-secondary text-[10.5px] font-bold uppercase tracking-wider text-secondary/50">
                              Composition & Palette Scan (Image #{selectedImageIndex + 1})
                            </span>
                            <span className="text-[10px] text-secondary/40 italic">
                              Click any thumbnail above to inspect framing & colors
                            </span>
                          </div>
                          <ImageScanDetails
                            scanData={activeImageScan}
                            onApplyColors={handleAutoAddSwatches}
                            compact={false}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Duplicate Image Warning Alert with Side-by-Side Comparison */}
                  {duplicateImageAlerts.length > 0 && (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="font-secondary text-[11px] font-bold uppercase tracking-wider text-amber-900">
                          Duplicate Asset Notices ({duplicateImageAlerts.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => setDuplicateImageAlerts([])}
                          className="text-[11px] text-amber-800 hover:text-amber-950 underline cursor-pointer"
                        >
                          Dismiss All
                        </button>
                      </div>
                      {duplicateImageAlerts.map((dup) => (
                        <ImageScanDetails
                          key={dup.id}
                          scanData={dup.scanData}
                          duplicateInfo={dup.duplicateInfo}
                          onReuseExisting={(url) => handleReuseExistingAsset(url, dup.id)}
                          onRemove={() => setDuplicateImageAlerts(prev => prev.filter(d => d.id !== dup.id))}
                          onKeepAnyway={() => setDuplicateImageAlerts(prev => prev.filter(d => d.id !== dup.id))}
                        />
                      ))}
                    </div>
                  )}

                  {/* Drag & Drop Upload Zone */}
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      if (e.dataTransfer.files?.length) {
                        handleImageFiles(e.dataTransfer.files);
                      }
                    }}
                    className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      isDragOver 
                        ? "border-gold bg-gold/10" 
                        : "border-secondary/20 bg-[#FAF8F5] hover:bg-white hover:border-gold/40"
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageFiles(e.target.files)}
                      disabled={isUploadingImages}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                    />

                    {isUploadingImages ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <span className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                        <span className="font-secondary text-[12.5px] font-semibold text-secondary">
                          Optimizing & uploading to storage...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                          <PiUploadSimple size={22} />
                        </div>
                        <p className="font-secondary text-[13px] font-semibold text-secondary text-center">
                          Drag & drop photos here, or <span className="text-gold underline">browse files</span>
                        </p>
                        <span className="font-secondary text-[11px] text-secondary/45">
                          High-res WebP, JPG, or PNG • Multiple uploads supported
                        </span>
                      </>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {uploadProgress.active && (
                    <UploadProgressBar
                      progress={uploadProgress.percent}
                      stage={uploadProgress.stage}
                      stageText={uploadProgress.stageText}
                      fileName={uploadProgress.fileName}
                      loadedBytes={uploadProgress.loadedBytes}
                      totalBytes={uploadProgress.totalBytes}
                      totalFiles={uploadProgress.totalFiles}
                      completedFiles={uploadProgress.completedFiles}
                      onCancel={() => abortControllerRef.current?.abort()}
                      onDismiss={() => setUploadProgress(p => ({ ...p, active: false }))}
                      error={uploadProgress.error}
                      inline={true}
                    />
                  )}
                </div>

                {/* 4. SPECIFICATIONS & CRAFTSMANSHIP (Optional) */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-secondary/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-secondary/8 pb-3">
                    <div>
                      <h3 className="font-primary text-[18px] text-secondary flex items-center gap-2">
                        <PiRulerLight className="text-gold text-lg" />
                        Architectural Specifications
                      </h3>
                      <p className="font-secondary text-[11px] text-secondary/50 mt-0.5">
                        Optional. If left blank, the website automatically applies curated Kal Furniture craftsmanship standards.
                      </p>
                    </div>
                    <span className="font-secondary text-[10.5px] text-secondary/40 uppercase tracking-wider font-semibold">
                      Optional
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-secondary text-[10.5px] font-bold tracking-widest uppercase text-secondary/55">
                        Structure / Core
                      </label>
                      <input
                        name="structure"
                        value={formData.structure}
                        onChange={handleChange}
                        className="w-full bg-[#FAF8F5] border border-secondary/15 rounded-xl px-3.5 py-2.5 font-secondary text-[13px] focus:outline-none focus:border-gold transition-colors placeholder:text-secondary/35"
                        placeholder="e.g. Solid ash wood"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-secondary text-[10.5px] font-bold tracking-widest uppercase text-secondary/55">
                        Finish / Fabric
                      </label>
                      <input
                        name="finish"
                        value={formData.finish}
                        onChange={handleChange}
                        className="w-full bg-[#FAF8F5] border border-secondary/15 rounded-xl px-3.5 py-2.5 font-secondary text-[13px] focus:outline-none focus:border-gold transition-colors placeholder:text-secondary/35"
                        placeholder="e.g. Premium bouclé"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-secondary text-[10.5px] font-bold tracking-widest uppercase text-secondary/55">
                        Dimensions
                      </label>
                      <input
                        name="dimensions"
                        value={formData.dimensions}
                        onChange={handleChange}
                        className="w-full bg-[#FAF8F5] border border-secondary/15 rounded-xl px-3.5 py-2.5 font-secondary text-[13px] focus:outline-none focus:border-gold transition-colors placeholder:text-secondary/35"
                        placeholder="e.g. W:80cm D:85cm H:97cm"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. FINISHES & SWATCHES (Optional) */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-secondary/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-secondary/8 pb-3">
                    <div>
                      <h3 className="font-primary text-[18px] text-secondary flex items-center gap-2">
                        <PiPalette className="text-gold text-lg" />
                        Finishes & Color Swatches
                      </h3>
                      <p className="font-secondary text-[11px] text-secondary/50 mt-0.5">
                        Optional. If empty, the color swatch selector automatically hides on the store.
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={Boolean(formData.allowCustomColor)}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFormData(prev => {
                          const nextVal = !prev.allowCustomColor;
                          return {
                            ...prev,
                            allowCustomColor: nextVal,
                            allowcustomcolor: nextVal,
                            allow_custom_color: nextVal,
                          };
                        });
                      }}
                      className="flex items-center gap-2.5 cursor-pointer bg-[#FAF8F5] px-3.5 py-1.5 rounded-full border border-secondary/15 hover:border-gold/50 transition-all select-none"
                    >
                      <div className={`w-8 h-4 rounded-full transition-colors relative pointer-events-none ${formData.allowCustomColor ? 'bg-gold' : 'bg-secondary/20'}`}>
                        <div className={`absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${formData.allowCustomColor ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                      <span className="font-secondary text-[11px] font-semibold text-secondary whitespace-nowrap pointer-events-none">
                        Allow Custom Color Orders
                      </span>
                    </button>
                  </div>

                  {/* Preset Pills */}
                  <div>
                    <span className="font-secondary text-[10px] font-bold tracking-widest uppercase text-secondary/40 block mb-2">
                      1-Click Preset Colors:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map(preset => {
                        const isAdded = (Array.isArray(formData.swatches) ? formData.swatches : []).some(s => 
                          (typeof s === "string" ? s : s?.label) === preset.label
                        );
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => isAdded ? handleRemoveSwatch(preset.label) : handleAddSwatch(preset.label, preset.color)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-secondary text-[11px] font-medium border transition-all cursor-pointer ${
                              isAdded
                                ? "bg-gold/15 border-gold text-gold font-bold shadow-xs"
                                : "bg-[#FAF8F5] border-secondary/15 text-secondary/70 hover:border-gold hover:text-gold"
                            }`}
                          >
                            <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: preset.color }} />
                            <span className="capitalize">{preset.label}</span>
                            {isAdded && <PiCheckBold size={11} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Color Input */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center gap-2 bg-[#FAF8F5] border border-secondary/15 rounded-xl px-3 py-2 flex-1">
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-6 h-6 rounded-full border-0 cursor-pointer p-0 shrink-0"
                      />
                      <input
                        type="text"
                        value={newColorLabel}
                        onChange={(e) => setNewColorLabel(e.target.value)}
                        placeholder="e.g. Royal Emerald, Terracotta"
                        className="w-full bg-transparent font-secondary text-[13px] text-secondary focus:outline-none placeholder:text-secondary/35"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddSwatch(newColorLabel, newColorHex)}
                      disabled={!newColorLabel.trim()}
                      className="px-5 py-2.5 bg-secondary text-white hover:bg-gold hover:text-primary rounded-xl font-secondary text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-30 cursor-pointer shrink-0"
                    >
                      + Add Swatch
                    </button>
                  </div>

                  {/* Active Swatches */}
                  {(Array.isArray(formData.swatches) && formData.swatches.length > 0) && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-secondary/8">
                      {formData.swatches.map((swatch, idx) => {
                        const label = typeof swatch === "string" ? swatch : swatch?.label || `Color ${idx + 1}`;
                        const color = typeof swatch === "string" ? "#836A58" : swatch?.color || "#836A58";
                        const id = typeof swatch === "object" && swatch?.id ? swatch.id : label;
                        return (
                          <div
                            key={id || idx}
                            className="flex items-center gap-2 bg-[#FAF8F5] px-3 py-1.5 rounded-full border border-secondary/15 shadow-xs"
                          >
                            <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                            <span className="font-secondary text-[11.5px] font-semibold text-secondary capitalize">{label}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSwatch(id)}
                              className="text-secondary/35 hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                            >
                              <PiX size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 6. STATUS & VISIBILITY BADGES (Optional) */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-secondary/10">
                  <span className="font-secondary text-[10.5px] font-bold uppercase tracking-wider text-secondary/40 block mb-3">
                    Visibility & Badges (Optional)
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    
                    {/* Made to Order */}
                    <label className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      formData.outOfStock ? "bg-amber-500/10 border-amber-500/30 text-amber-800" : "bg-[#FAF8F5] border-secondary/10 text-secondary/70"
                    }`}>
                      <div className="flex items-center gap-2">
                        <PiHammerBold size={16} className={formData.outOfStock ? "text-amber-700" : "text-secondary/40"} />
                        <span className="font-secondary text-[12px] font-bold uppercase tracking-wider">Made To Order</span>
                      </div>
                      <input 
                        type="checkbox" 
                        name="outOfStock" 
                        checked={formData.outOfStock} 
                        onChange={handleChange} 
                        className="rounded accent-amber-600" 
                      />
                    </label>

                    {/* Hero Spotlight */}
                    <label className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      formData.showInHero ? "bg-gold/15 border-gold/40 text-gold-dark" : "bg-[#FAF8F5] border-secondary/10 text-secondary/70"
                    }`}>
                      <div className="flex items-center gap-2">
                        <PiStarFill size={16} className={formData.showInHero ? "text-gold" : "text-secondary/40"} />
                        <span className="font-secondary text-[12px] font-bold uppercase tracking-wider">Hero Spotlight</span>
                      </div>
                      <input 
                        type="checkbox" 
                        name="showInHero" 
                        checked={formData.showInHero} 
                        onChange={handleChange} 
                        className="rounded accent-gold" 
                      />
                    </label>

                    {/* Featured */}
                    <label className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      formData.featured ? "bg-primary/10 border-primary/30 text-primary" : "bg-[#FAF8F5] border-secondary/10 text-secondary/70"
                    }`}>
                      <span className="font-secondary text-[12px] font-bold uppercase tracking-wider">Featured</span>
                      <input 
                        type="checkbox" 
                        name="featured" 
                        checked={formData.featured} 
                        onChange={handleChange} 
                        className="rounded accent-primary" 
                      />
                    </label>

                    {/* New Arrival */}
                    <label className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      formData.isNew ? "bg-primary/10 border-primary/30 text-primary" : "bg-[#FAF8F5] border-secondary/10 text-secondary/70"
                    }`}>
                      <span className="font-secondary text-[12px] font-bold uppercase tracking-wider">New Arrival</span>
                      <input 
                        type="checkbox" 
                        name="isNew" 
                        checked={formData.isNew} 
                        onChange={handleChange} 
                        className="rounded accent-primary" 
                      />
                    </label>

                  </div>
                </div>

              </form>
            )}

          </div>

          {/* Sticky Footer Actions */}
          <div className="px-6 sm:px-8 py-4 border-t border-secondary/10 bg-[#FAF8F5] flex items-center justify-between gap-4">
            <span className="font-secondary text-[11.5px] text-secondary/50 hidden sm:inline">
              * Description is required • Click Save to publish immediately.
            </span>

            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={onClose}
                type="button"
                className="px-6 py-2.5 rounded-xl font-secondary text-[11.5px] font-bold tracking-widest uppercase border border-secondary/20 text-secondary/60 hover:text-secondary hover:border-secondary transition-all cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                form="product-form"
                className="px-7 py-2.5 rounded-xl font-secondary text-[11.5px] font-bold tracking-widest uppercase bg-gold text-primary shadow-[0_4px_16px_rgba(217,182,110,0.3)] hover:shadow-[0_6px_22px_rgba(217,182,110,0.45)] transition-all cursor-pointer active:scale-98"
              >
                {initialData ? "Update Product" : "Publish Product"}
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    )}
  </AnimatePresence>

  <AddCategoryModal
    isOpen={isAddCatModalOpen}
    onClose={() => setIsAddCatModalOpen(false)}
    onSuccess={(newCat) => {
      if (newCat) {
        setFormData(p => ({ ...p, category: newCat.id }));
      }
    }}
  />
</>
);
}
