"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  useSiteSettings, 
  defaultHeroSettings, 
  defaultFeaturedCards 
} from "@/context/SiteSettingsContext";
import { useProducts } from "@/context/ProductContext";
import { compressImage, uploadImageFile, resolveImageUrl } from "@/lib/imageUtils";
import { formatPrice } from "@/lib/utils";
import UploadProgressBar from "./UploadProgressBar";
import {
  PiImageLight,
  PiUploadSimple,
  PiSparkleFill,
  PiCheckBold,
  PiArrowSquareOutLight,
  PiArrowsClockwiseLight,
  PiArmchair,
  PiSlidersHorizontalLight,
  PiTagLight,
  PiCoinsLight,
  PiEyeLight,
  PiSquaresFour
} from "react-icons/pi";
import { 
  scanImageFile, 
  scanImageUrl, 
  checkDuplicateWithVisualScan, 
  preloadCatalogHashes 
} from "@/lib/imageScanner";
import ImageScanDetails from "./ImageScanDetails";
import toast from "react-hot-toast";

const CURATED_PRESETS = [
  {
    id: "sunlit-luxury-living-room",
    name: "Kale Furniture: Sunlit Luxury Living Room (Inspo)",
    src: "/assets/img/hero/sunlit-luxury-living-room.png",
    fit: "cover",
  },
  {
    id: "editorial-suite",
    name: "Grand Salon Suite (Inspo 5-Piece)",
    src: "/assets/img/hero/editorial-suite.png",
    fit: "contain",
  },
  {
    id: "beige-chair",
    name: "Beige Accent Chair",
    src: "/assets/img/hero/beige-chair.jpeg",
    fit: "cover",
  },
  {
    id: "green-chair",
    name: "Emerald Green Velvet Chair",
    src: "/assets/img/hero/green-chair.jpeg",
    fit: "cover",
  },
  {
    id: "living-room-1",
    name: "Bouclé Lounge Sofa",
    src: "/assets/img/living-room/living-room-1.jpg",
    fit: "cover",
  },
  {
    id: "wood-chair-cutout",
    name: "Architectural Wood Chair (Studio Cutout)",
    src: "/assets/img/hero/hero.png",
    fit: "contain",
  },
  {
    id: "pink-chair",
    name: "Blush Pink Chair",
    src: "/assets/img/hero/pink-chair.jpeg",
    fit: "cover",
  },
];

export default function HeroImageEditor() {
  const { heroSettings, updateHeroSettings } = useSiteSettings();
  const { products } = useProducts();
  const [activeTab, setActiveTab] = useState("hero"); // "hero" | "featured"
  const [form, setForm] = useState(() => ({
    ...defaultHeroSettings,
    ...(heroSettings || {}),
    featuredCards: (heroSettings?.featuredCards && Array.isArray(heroSettings.featuredCards) && heroSettings.featuredCards.length > 0)
      ? heroSettings.featuredCards
      : defaultFeaturedCards,
  }));
  const [isSaved, setIsSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cardUploadingIndex, setCardUploadingIndex] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({
    active: false,
    percent: 0,
    stage: "idle",
    stageText: "",
    fileName: "",
    loadedBytes: 0,
    totalBytes: 0,
    error: null,
  });
  const abortControllerRef = useRef(null);
  const [heroScanData, setHeroScanData] = useState(null);
  const [heroDuplicateInfo, setHeroDuplicateInfo] = useState(null);

  // Preload catalog hashes for instant visual matching
  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      preloadCatalogHashes(products);
    }
  }, [products]);

  // Scan current hero image for composition and duplicate checks
  useEffect(() => {
    if (form.imageUrl) {
      scanImageUrl(resolveImageUrl(form.imageUrl)).then((res) => {
        if (res) {
          setHeroScanData(res);
          const dup = checkDuplicateWithVisualScan(res, products);
          setHeroDuplicateInfo(dup.isDuplicate ? dup : null);
        } else {
          setHeroScanData(null);
          setHeroDuplicateInfo(null);
        }
      });
    } else {
      setHeroScanData(null);
      setHeroDuplicateInfo(null);
    }
  }, [form.imageUrl, products]);

  useEffect(() => {
    if (heroSettings) {
      setForm((prev) => ({
        ...defaultHeroSettings,
        ...heroSettings,
        featuredCards: (heroSettings.featuredCards && Array.isArray(heroSettings.featuredCards) && heroSettings.featuredCards.length > 0)
          ? heroSettings.featuredCards
          : (prev.featuredCards || defaultFeaturedCards),
      }));
    }
  }, [heroSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ── Hero Image Upload ──
  const handleHeroImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Scan visual composition & check duplicates immediately
    const scanned = await scanImageFile(file);
    if (scanned) {
      setHeroScanData(scanned);
      const dup = checkDuplicateWithVisualScan(scanned, products);
      setHeroDuplicateInfo(dup.isDuplicate ? dup : null);
      if (dup.isDuplicate) {
        toast.error(`⚠️ Notice: This image is already used by "${dup.matchedProduct?.name || 'catalog piece'}"!`, { duration: 5000 });
      }
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsUploading(true);
    setUploadProgress({
      active: true,
      percent: 8,
      stage: "compressing",
      stageText: "Optimizing image dimensions & converting to WebP...",
      fileName: file.name,
      loadedBytes: 0,
      totalBytes: file.size,
      error: null,
    });

    try {
      const uploadedUrl = await uploadImageFile(file, "hero", {
        maxWidth: 1800,
        maxHeight: 1800,
        quality: 0.88,
        signal: controller.signal,
        onProgress: (p) => {
          setUploadProgress((prev) => ({
            ...prev,
            percent: p.percent,
            stage: p.stage,
            stageText: p.stageText,
            fileName: p.fileName || file.name,
            loadedBytes: p.loadedBytes || 0,
            totalBytes: p.totalBytes || file.size,
            error: p.error || null,
          }));
        },
      });

      setForm((prev) => ({
        ...prev,
        imageUrl: uploadedUrl,
        mode: "custom",
      }));
      toast.success("Hero image uploaded and optimized!");
      setTimeout(() => {
        setUploadProgress((prev) => ({ ...prev, active: false }));
      }, 2000);
    } catch (err) {
      if (err.name !== "AbortError" && !err.message?.includes("aborted")) {
        console.error(err);
        toast.error("Failed to upload image: " + (err?.message || "Please try another file."));
        setUploadProgress((prev) => ({
          ...prev,
          stage: "error",
          error: err?.message || "Upload failed",
        }));
      } else {
        toast("Upload cancelled");
        setUploadProgress((prev) => ({ ...prev, active: false }));
      }
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
      e.target.value = "";
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleSelectPreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      imageUrl: preset.src,
      imageFit: preset.fit,
      mode: "custom",
    }));
    toast.success(`Selected ${preset.name}`);
  };

  const handleSelectProduct = (productId) => {
    if (!productId) {
      setForm((prev) => ({
        ...prev,
        productId: null,
      }));
      return;
    }

    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setForm((prev) => ({
        ...prev,
        productId: prod.id,
        imageUrl: prod.images?.[0] || prod.image || prev.imageUrl,
        title: prod.name,
        accentWord: "FURNITURE",
        badge: prod.category || prev.badge,
        subtitle: prod.description || prev.subtitle,
        showOfferTag: true,
        offerPrice: String(prod.price || ""),
      }));
    }
  };

  // ── Featured Cards Controls ──
  const handleCardChange = (cardIndex, field, value) => {
    setForm((prev) => {
      const nextCards = [...(prev.featuredCards || defaultFeaturedCards)];
      nextCards[cardIndex] = {
        ...nextCards[cardIndex],
        [field]: value,
      };
      return { ...prev, featuredCards: nextCards };
    });
  };

  const handleCardImageUpload = async (e, cardIndex) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCardUploadingIndex(cardIndex);
    try {
      const uploadedUrl = await uploadImageFile(file, "featured", {
        maxWidth: 1200,
        maxHeight: 1600,
        quality: 0.88,
      });

      setForm((prev) => {
        const nextCards = [...(prev.featuredCards || defaultFeaturedCards)];
        nextCards[cardIndex] = {
          ...nextCards[cardIndex],
          image: uploadedUrl,
        };
        return { ...prev, featuredCards: nextCards };
      });
      toast.success(`Card ${cardIndex + 1} image uploaded successfully!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload card image: " + (err?.message || "Please try again."));
    } finally {
      setCardUploadingIndex(null);
      e.target.value = "";
    }
  };

  const handleCardProductSelect = (cardIndex, productId) => {
    if (!productId) return;
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setForm((prev) => {
      const nextCards = [...(prev.featuredCards || defaultFeaturedCards)];
      nextCards[cardIndex] = {
        ...nextCards[cardIndex],
        name: prod.name,
        title: prod.name.toUpperCase(),
        price: prod.price || nextCards[cardIndex].price,
        image: prod.images?.[0] || prod.image || nextCards[cardIndex].image,
        description: prod.description || nextCards[cardIndex].description,
        dimensions: prod.dimensions || nextCards[cardIndex].dimensions,
        finish: prod.finish || nextCards[cardIndex].finish,
        structure: prod.structure || nextCards[cardIndex].structure,
        warranty: prod.warranty || nextCards[cardIndex].warranty,
      };
      return { ...prev, featuredCards: nextCards };
    });
    toast.success(`Card ${cardIndex + 1} linked to "${prod.name}"`);
  };

  const handleResetCardsDefault = () => {
    if (confirm("Reset the 3 Featured Arched Cards back to initial defaults?")) {
      setForm((prev) => ({
        ...prev,
        featuredCards: defaultFeaturedCards,
      }));
      toast.success("Featured cards reset to defaults.");
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateHeroSettings(form);
    setIsSaved(true);
    toast.success("Hero & Featured Showcase settings saved live!");
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetDefault = () => {
    if (confirm("Reset entire Hero & Featured settings back to original defaults?")) {
      setForm(defaultHeroSettings);
      updateHeroSettings(defaultHeroSettings);
      toast.success("Reset to default settings.");
    }
  };

  const currentCards = form.featuredCards && form.featuredCards.length > 0
    ? form.featuredCards
    : defaultFeaturedCards;

  return (
    <div className="bg-white border border-secondary/10 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm mt-4 md:mt-8">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 border-b border-secondary/8 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-secondary text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              Storefront Customization
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-secondary text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Real-Time Sync
            </span>
          </div>
          <h2 className="font-primary text-[24px] md:text-[28px] text-secondary">
            Hero & Featured <em className="text-gold not-italic font-semibold">Visual Studio</em>
          </h2>
          <p className="font-secondary text-[13px] text-secondary/50 mt-1">
            Manage your primary Hero Showcase image and customize the 3 tall arched Featured cards.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 bg-secondary/5 hover:bg-secondary/10 text-secondary font-secondary text-[11px] font-semibold rounded-full transition-colors"
          >
            <span>Preview Storefront</span>
            <PiArrowSquareOutLight size={14} />
          </Link>
          <button
            type="button"
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 px-3.5 py-2 text-secondary/40 hover:text-secondary font-secondary text-[11px] font-medium rounded-full transition-colors cursor-pointer"
            title="Reset to default original"
          >
            <PiArrowsClockwiseLight size={14} />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-[#FAF8F5] border border-secondary/10 w-fit mb-8">
        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-secondary text-[12px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "hero"
              ? "bg-primary text-white shadow-sm"
              : "text-secondary/60 hover:text-secondary hover:bg-white/50"
          }`}
        >
          <PiImageLight size={16} />
          <span>Hero Stage Showcase</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("featured")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-secondary text-[12px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "featured"
              ? "bg-gold text-primary shadow-sm"
              : "text-secondary/60 hover:text-secondary hover:bg-white/50"
          }`}
        >
          <PiSquaresFour size={16} />
          <span>3 Arched Featured Cards</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* ═════════════════════════════════════════════════════════════
            TAB 1: HERO STAGE SHOWCASE EDITOR
        ═════════════════════════════════════════════════════════════ */}
        {activeTab === "hero" && (
          <div className="space-y-8">
            {/* Mode Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-secondary/10">
              <div>
                <span className="font-secondary text-[12px] font-bold text-secondary block">
                  Hero Source Mode
                </span>
                <span className="font-secondary text-[11px] text-secondary/50">
                  Upload a custom hero image or spotlight a piece from your catalog.
                </span>
              </div>
              <div className="inline-flex rounded-xl bg-white p-1 border border-secondary/15 shadow-sm">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, mode: "custom" }))}
                  className={`px-4 py-2 rounded-lg font-secondary text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    form.mode === "custom"
                      ? "bg-primary text-white shadow-sm"
                      : "text-secondary/60 hover:text-secondary"
                  }`}
                >
                  Custom Upload
                </button>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, mode: "product" }))}
                  className={`px-4 py-2 rounded-lg font-secondary text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    form.mode === "product"
                      ? "bg-gold text-primary shadow-sm"
                      : "text-secondary/60 hover:text-secondary"
                  }`}
                >
                  Catalog Product
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Image Controls & Content (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Upload Dropzone */}
                <div className="p-5 rounded-2xl border border-secondary/10 bg-[#FAF8F5] space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/70 flex items-center gap-1.5">
                      <PiImageLight size={15} className="text-gold" />
                      Hero Image Upload
                    </label>
                    <span className="font-secondary text-[10px] text-secondary/40">
                      PNG, JPG, WEBP (Supports Studio Lighting)
                    </span>
                  </div>

                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroImageUpload}
                      disabled={isUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                    />
                    <div className="border-2 border-dashed border-secondary/20 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4 bg-white group-hover:border-gold group-hover:bg-gold/5 transition-all">
                      <div className="w-12 h-12 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0 shadow-inner">
                        {isUploading ? (
                          <span className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <PiUploadSimple size={22} />
                        )}
                      </div>
                      <div className="text-center sm:text-left min-w-0 flex-1">
                        <p className="font-secondary text-[13px] font-semibold text-secondary">
                          {isUploading ? "Optimizing & uploading image..." : "Click or drag to upload new Hero Image"}
                        </p>
                        <p className="font-secondary text-[11px] text-secondary/40 mt-0.5">
                          Automatically compresses and saves to public storage for instant loading
                        </p>
                      </div>
                    </div>
                  </div>

                  {uploadProgress.active && (
                    <UploadProgressBar
                      progress={uploadProgress.percent}
                      stage={uploadProgress.stage}
                      stageText={uploadProgress.stageText}
                      fileName={uploadProgress.fileName}
                      loadedBytes={uploadProgress.loadedBytes}
                      totalBytes={uploadProgress.totalBytes}
                      onCancel={handleCancelUpload}
                      onDismiss={() => setUploadProgress((p) => ({ ...p, active: false }))}
                      error={uploadProgress.error}
                      inline={true}
                    />
                  )}

                  {/* Manual URL Input */}
                  <div>
                    <label className="font-secondary text-[10px] font-bold uppercase tracking-wider text-secondary/50 block mb-1">
                      Direct Image Path / URL:
                    </label>
                    <input
                      type="text"
                      name="imageUrl"
                      value={form.imageUrl}
                      onChange={handleChange}
                      placeholder="/assets/img/hero/editorial-suite.png"
                      className="w-full bg-white border border-secondary/20 rounded-xl px-3.5 py-2 font-secondary text-[12px] text-secondary focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>

                  {/* Scanned Hero Image Composition & Duplicate Alert */}
                  {(heroScanData || heroDuplicateInfo) && (
                    <div className="pt-1">
                      <ImageScanDetails
                        scanData={heroScanData}
                        duplicateInfo={heroDuplicateInfo}
                        compact={false}
                      />
                    </div>
                  )}
                </div>

                {/* 2. Curated Presets */}
                <div className="p-5 rounded-2xl border border-secondary/10 bg-[#FAF8F5] space-y-3">
                  <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/70 block">
                    Curated Studio Presets
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {CURATED_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                          form.imageUrl === preset.src
                            ? "bg-white border-gold ring-2 ring-gold/20 shadow-xs"
                            : "bg-white/70 border-secondary/10 hover:border-gold hover:bg-white"
                        }`}
                      >
                        <div className="w-full aspect-[4/3] rounded-lg bg-[#F6F4F0] overflow-hidden mb-2 flex items-center justify-center p-1">
                          <img
                            src={preset.src}
                            alt={preset.name}
                            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <span className="font-secondary text-[11px] font-semibold text-secondary leading-tight truncate block">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Catalog Product Link */}
                {form.mode === "product" && (
                  <div className="p-5 rounded-2xl border border-secondary/10 bg-[#FAF8F5] space-y-3">
                    <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/70 flex items-center gap-1.5">
                      <PiArmchair size={15} className="text-gold" />
                      Select Catalog Piece to Spotlight
                    </label>
                    <select
                      value={form.productId || ""}
                      onChange={(e) => handleSelectProduct(e.target.value)}
                      className="w-full bg-white border border-secondary/20 rounded-xl px-3.5 py-2.5 font-secondary text-[12.5px] text-secondary focus:outline-none focus:border-gold"
                    >
                      <option value="">-- Choose a Catalog Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.category || "General"}) — {formatPrice(p.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 4. Display Headline & Typography Content */}
                <div className="p-5 rounded-2xl border border-secondary/10 bg-[#FAF8F5] space-y-4">
                  <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/70 block">
                    Display Headline & Button
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-secondary text-[10px] font-bold tracking-widest uppercase text-secondary/60 block mb-1">
                        Top Headline Word
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="DESIGN"
                        className="w-full bg-white border border-secondary/20 rounded-xl px-3.5 py-2 font-primary text-[18px] text-secondary focus:outline-none focus:border-gold uppercase"
                      />
                    </div>

                    <div>
                      <label className="font-secondary text-[10px] font-bold tracking-widest uppercase text-secondary/60 block mb-1">
                        Bottom Headline Word
                      </label>
                      <input
                        type="text"
                        name="accentWord"
                        value={form.accentWord}
                        onChange={handleChange}
                        placeholder="FURNITURE"
                        className="w-full bg-white border border-secondary/20 rounded-xl px-3.5 py-2 font-primary text-[18px] text-secondary focus:outline-none focus:border-gold uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-secondary text-[10px] font-bold tracking-widest uppercase text-secondary/60 block mb-1">
                        Pill Button Text
                      </label>
                      <input
                        type="text"
                        name="primaryButtonText"
                        value={form.primaryButtonText}
                        onChange={handleChange}
                        placeholder="EXPLORE COLLECTION"
                        className="w-full bg-white border border-secondary/20 rounded-xl px-3.5 py-2 font-secondary text-[12px] text-secondary focus:outline-none focus:border-gold uppercase"
                      />
                    </div>

                    <div>
                      <label className="font-secondary text-[10px] font-bold tracking-widest uppercase text-secondary/60 block mb-1">
                        Button Link
                      </label>
                      <input
                        type="text"
                        name="primaryButtonLink"
                        value={form.primaryButtonLink}
                        onChange={handleChange}
                        placeholder="/collections"
                        className="w-full bg-white border border-secondary/20 rounded-xl px-3.5 py-2 font-secondary text-[12px] text-secondary focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Hero Live Stage Mockup (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="sticky top-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-secondary text-[10px] font-bold tracking-widest uppercase text-secondary/40">
                      Live Studio Stage Preview
                    </span>
                    <span className="font-secondary text-[10px] text-gold font-bold uppercase tracking-wider">
                      Dark Studio Theme
                    </span>
                  </div>

                  {/* Dark Studio Preview Canvas */}
                  <div 
                    className="rounded-3xl p-6 shadow-xl overflow-hidden relative min-h-[460px] flex flex-col justify-between items-center text-center select-none"
                    style={{
                      background: "radial-gradient(ellipse at 50% 34%, #3B302A 0%, #251D1A 60%, #161210 100%)"
                    }}
                  >
                    {/* Architectural Grid pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

                    {/* Headline Mockup */}
                    <div className="relative z-10 pt-2">
                      <h4 className="font-primary text-[36px] sm:text-[44px] font-light leading-[0.88] tracking-tight uppercase text-white drop-shadow-md">
                        <span className="block">{form.title || "DESIGN"}</span>
                        <span className="block mt-1">{form.accentWord || "FURNITURE"}</span>
                      </h4>
                    </div>

                    {/* Hero Image Preview with Floor Shadow */}
                    <div className="relative z-10 my-4 w-full h-52 flex items-center justify-center">
                      <div className="absolute bottom-2 w-3/4 h-8 bg-black/60 blur-xl rounded-full" />
                      <img
                        src={resolveImageUrl(form.imageUrl)}
                        alt="Hero Preview"
                        className="max-w-full max-h-full object-contain drop-shadow-2xl"
                      />
                    </div>

                    {/* Frosted Pill Button Mockup */}
                    <div className="relative z-10 pb-2">
                      <div className="px-6 py-2.5 rounded-full border border-white/40 bg-white/10 text-white font-secondary text-[10px] font-bold tracking-[0.2em] uppercase shadow-md flex items-center gap-2">
                        <span>{form.primaryButtonText || "EXPLORE COLLECTION"}</span>
                        <span className="text-white/60">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            TAB 2: 3 ARCHED FEATURED CARDS (Matching User Reference Image)
        ═════════════════════════════════════════════════════════════ */}
        {activeTab === "featured" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-secondary/10">
              <div>
                <span className="font-secondary text-[12px] font-bold text-secondary block">
                  3 Arched Capsule Showcase Cards
                </span>
                <span className="font-secondary text-[11px] text-secondary/50">
                  Control the images, titles, prices, and badges for the 3 tall arched cards displayed directly below the Hero.
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetCardsDefault}
                className="px-3.5 py-1.5 rounded-full border border-secondary/20 hover:border-gold hover:text-gold text-secondary font-secondary text-[11px] font-semibold transition-colors cursor-pointer bg-white"
              >
                Reset Cards to Defaults
              </button>
            </div>

            {/* 3 Cards Editorial Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {currentCards.map((card, idx) => {
                const isCardUploading = cardUploadingIndex === idx;

                return (
                  <div
                    key={card.id || idx}
                    className="p-5 rounded-3xl bg-[#FAF8F5] border border-secondary/15 flex flex-col justify-between space-y-5 shadow-xs hover:border-gold/50 transition-colors"
                  >
                    {/* Card Header & Badge */}
                    <div className="flex items-center justify-between">
                      <span className="font-secondary text-[11px] font-bold uppercase tracking-[0.2em] text-gold-dark flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-gold/15 text-gold flex items-center justify-center text-[10px]">
                          0{idx + 1}
                        </span>
                        Arched Card {idx + 1}
                      </span>

                      {card.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-[#1A1A1A] text-white font-secondary text-[9px] font-bold uppercase tracking-wider">
                          {card.badge}
                        </span>
                      )}
                    </div>

                    {/* Arched Capsule Live Card Preview */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-36 aspect-[10/16] rounded-[55px] overflow-hidden bg-[#ECE7DE] border border-secondary/10 shadow-sm flex items-center justify-center group">
                        <img
                          src={resolveImageUrl(card.image)}
                          alt={card.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {card.badge && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-secondary text-[8px] font-bold tracking-wider uppercase shadow">
                            {card.badge}
                          </div>
                        )}
                      </div>

                      <div className="text-center pt-3">
                        <span className="block font-secondary text-[11px] font-bold uppercase tracking-wider text-secondary">
                          {card.title || card.name}
                        </span>
                        <span className="block font-secondary text-[12px] font-semibold text-secondary/60 mt-0.5">
                          {formatPrice(card.price)}
                        </span>
                      </div>
                    </div>

                    {/* Card Form Controls */}
                    <div className="space-y-3 pt-3 border-t border-secondary/10">
                      
                      {/* Upload or change Image */}
                      <div>
                        <label className="font-secondary text-[10px] font-bold uppercase tracking-wider text-secondary/50 block mb-1">
                          Card Image:
                        </label>
                        
                        <div className="flex items-center gap-2">
                          <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-secondary/20 hover:border-gold rounded-xl cursor-pointer font-secondary text-[11px] font-semibold text-secondary transition-colors">
                            {isCardUploading ? (
                              <span className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <PiUploadSimple size={14} className="text-gold" />
                            )}
                            <span>{isCardUploading ? "Uploading..." : "Upload New Image"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isCardUploading}
                              onChange={(e) => handleCardImageUpload(e, idx)}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Direct Image Path */}
                        <input
                          type="text"
                          value={card.image}
                          onChange={(e) => handleCardChange(idx, "image", e.target.value)}
                          placeholder="/assets/img/hero/beige-chair.jpeg"
                          className="mt-1.5 w-full bg-white border border-secondary/20 rounded-lg px-2.5 py-1.5 font-secondary text-[11px] text-secondary focus:outline-none focus:border-gold"
                        />
                      </div>

                      {/* Pick from Catalog */}
                      <div>
                        <label className="font-secondary text-[10px] font-bold uppercase tracking-wider text-secondary/50 block mb-1">
                          Or Link Catalog Product:
                        </label>
                        <select
                          onChange={(e) => handleCardProductSelect(idx, e.target.value)}
                          defaultValue=""
                          className="w-full bg-white border border-secondary/20 rounded-lg px-2.5 py-1.5 font-secondary text-[11px] text-secondary focus:outline-none focus:border-gold"
                        >
                          <option value="">-- Choose Catalog Product --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({formatPrice(p.price)})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Card Display Name / Title */}
                      <div>
                        <label className="font-secondary text-[10px] font-bold uppercase tracking-wider text-secondary/50 block mb-1">
                          Piece Name (Title):
                        </label>
                        <input
                          type="text"
                          value={card.name || ""}
                          onChange={(e) => {
                            handleCardChange(idx, "name", e.target.value);
                            handleCardChange(idx, "title", e.target.value.toUpperCase());
                          }}
                          placeholder="Modern Chair"
                          className="w-full bg-white border border-secondary/20 rounded-lg px-2.5 py-1.5 font-secondary text-[12px] font-medium text-secondary focus:outline-none focus:border-gold"
                        />
                      </div>

                      {/* Price in Birr */}
                      <div>
                        <label className="font-secondary text-[10px] font-bold uppercase tracking-wider text-secondary/50 block mb-1">
                          Price in Ethiopian Birr (ብር):
                        </label>
                        <input
                          type="number"
                          value={card.price || 0}
                          onChange={(e) => handleCardChange(idx, "price", Number(e.target.value))}
                          placeholder="249000"
                          className="w-full bg-white border border-secondary/20 rounded-lg px-2.5 py-1.5 font-secondary text-[12px] font-bold text-secondary focus:outline-none focus:border-gold"
                        />
                      </div>

                      {/* Badge (e.g. NEW) */}
                      <div>
                        <label className="font-secondary text-[10px] font-bold uppercase tracking-wider text-secondary/50 block mb-1">
                          Badge (e.g. "NEW", "HOT", or blank):
                        </label>
                        <input
                          type="text"
                          value={card.badge || ""}
                          onChange={(e) => handleCardChange(idx, "badge", e.target.value)}
                          placeholder="NEW"
                          className="w-full bg-white border border-secondary/20 rounded-lg px-2.5 py-1.5 font-secondary text-[11px] text-secondary focus:outline-none focus:border-gold uppercase"
                        />
                      </div>

                      {/* Description for Modal view */}
                      <div>
                        <label className="font-secondary text-[10px] font-bold uppercase tracking-wider text-secondary/50 block mb-1">
                          Modal Description:
                        </label>
                        <textarea
                          rows={2}
                          value={card.description || ""}
                          onChange={(e) => handleCardChange(idx, "description", e.target.value)}
                          placeholder="Piece details shown in modal..."
                          className="w-full bg-white border border-secondary/20 rounded-lg px-2.5 py-1.5 font-secondary text-[11px] text-secondary focus:outline-none focus:border-gold resize-none"
                        />
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Fixed Submit Save Row ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-secondary/10">
          <p className="font-secondary text-[11.5px] text-secondary/50 text-center sm:text-left">
            Saved changes sync immediately to live storefront tabs and save to Supabase settings.
          </p>

          <button
            type="submit"
            className={`w-full sm:w-auto px-9 py-3.5 rounded-full font-secondary text-[12px] font-bold uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer ${
              isSaved
                ? "bg-emerald-600 text-white shadow-emerald-600/30"
                : "bg-gold hover:bg-gold-dark text-primary shadow-[0_4px_20px_rgba(217,182,110,0.35)] active:scale-95"
            }`}
          >
            {isSaved ? (
              <>
                <PiCheckBold size={17} /> Settings Saved & Synced Live!
              </>
            ) : (
              <>
                <PiSparkleFill size={16} /> Save Hero & Featured Showcase
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
