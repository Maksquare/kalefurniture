"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiX, PiUploadSimple, PiTrash, PiPlus, PiCheckBold, PiPalette } from "react-icons/pi";
import { compressImage } from "@/lib/imageUtils";
import { useSiteSettings } from "@/context/SiteSettingsContext";

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

export default function ProductFormModal({ isOpen, onClose, onSubmit, initialData }) {
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
    images: [],
    bestSeller: false,
    isNew: false,
    featured: false,
    showInHero: false,
    outOfStock: false,
  });

  const [newColorLabel, setNewColorLabel] = useState("");
  const [newColorHex, setNewColorHex] = useState("#836A58");

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        price: initialData.price ? initialData.price.toString() : "",
        images: initialData.images || [],
        structure: initialData.structure || "",
        finish: initialData.finish || "",
        dimensions: initialData.dimensions || "",
        type: initialData.type || "Furniture",
        swatches: initialData.swatches || initialData.colors || [],
        allowCustomColor: initialData.allowCustomColor !== undefined ? initialData.allowCustomColor : true,
        showInHero: initialData.showInHero || false,
        outOfStock: initialData.outOfStock || false,
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
        images: [],
        bestSeller: false,
        isNew: false,
        featured: false,
        showInHero: false,
        outOfStock: false,
      });
    }
  }, [initialData, isOpen]);

  const { heroProductId, updateHeroProduct } = useSiteSettings();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      price: Number(formData.price) || 0,
      images: formData.images,
      colors: formData.swatches, // alias for backwards compatibility
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

  const handleAddSwatch = (label, color) => {
    if (!label.trim()) return;
    const swatch = {
      id: `swatch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      label: label.trim().toLowerCase(),
      color: color || "#836A58",
    };
    setFormData(prev => ({
      ...prev,
      swatches: [...(prev.swatches || []).filter(s => s.label !== swatch.label), swatch]
    }));
    setNewColorLabel("");
  };

  const handleRemoveSwatch = (idOrLabel) => {
    setFormData(prev => ({
      ...prev,
      swatches: (prev.swatches || []).filter(s => s.id !== idOrLabel && s.label !== idOrLabel)
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      const compressedImages = await Promise.all(
        files.map(file => compressImage(file))
      );
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...compressedImages]
      }));
    } catch (error) {
      console.error("Error compressing images:", error);
      alert("Failed to process some images. Please try again.");
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary/10 bg-[#FDFBF7]">
            <h2 className="font-primary text-[24px] text-secondary">
              {initialData ? "Edit" : "Add"} <em className="text-gold not-italic font-semibold">Product</em>
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary/5 text-secondary/50 hover:bg-gold hover:text-white transition-colors"
            >
              <PiX size={20} />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
            <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Name & Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60">Product Name</label>
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-[#FDFBF7] border border-secondary/20 rounded-xl px-4 py-3 font-secondary text-[14px] focus:outline-none focus:border-gold transition-colors"
                    placeholder="e.g. Lumina Sofa"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60">Price (ETB)</label>
                  <input
                    required
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full bg-[#FDFBF7] border border-secondary/20 rounded-xl px-4 py-3 font-secondary text-[14px] focus:outline-none focus:border-gold transition-colors"
                    placeholder="e.g. 150000"
                  />
                </div>
              </div>

              {/* Category & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-[#FDFBF7] border border-secondary/20 rounded-xl px-4 py-3 font-secondary text-[14px] focus:outline-none focus:border-gold transition-colors"
                  >
                    <option value="Living Room">Living Room</option>
                    <option value="Bedroom">Bedroom</option>
                    <option value="Dining Area">Dining Area</option>
                    <option value="Home Office">Home Office</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60">Product Type</label>
                  <input
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full bg-[#FDFBF7] border border-secondary/20 rounded-xl px-4 py-3 font-secondary text-[14px] focus:outline-none focus:border-gold transition-colors"
                    placeholder="e.g. Furniture, Lighting, Seating"
                  />
                </div>
              </div>

              {/* Specs: Structure, Finish, Dimensions */}
              <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-secondary/10 space-y-4">
                <h3 className="font-primary text-[16px] text-secondary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold" />
                  Product Specifications & Materials
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-secondary text-[10px] font-bold tracking-widest uppercase text-secondary/50">Structure / Material</label>
                    <textarea
                      name="structure"
                      value={formData.structure}
                      onChange={handleChange}
                      rows={2}
                      className="w-full bg-white border border-secondary/15 rounded-xl px-3 py-2 font-secondary text-[12px] focus:outline-none focus:border-gold transition-colors resize-none"
                      placeholder="e.g. Solid ash wood&#10;high-resilience sponge"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-secondary text-[10px] font-bold tracking-widest uppercase text-secondary/50">Finish / Upholstery</label>
                    <textarea
                      name="finish"
                      value={formData.finish}
                      onChange={handleChange}
                      rows={2}
                      className="w-full bg-white border border-secondary/15 rounded-xl px-3 py-2 font-secondary text-[12px] focus:outline-none focus:border-gold transition-colors resize-none"
                      placeholder="e.g. Premium bouclé fabric&#10;Top-grain leather"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-secondary text-[10px] font-bold tracking-widest uppercase text-secondary/50">Dimensions</label>
                    <textarea
                      name="dimensions"
                      value={formData.dimensions}
                      onChange={handleChange}
                      rows={2}
                      className="w-full bg-white border border-secondary/15 rounded-xl px-3 py-2 font-secondary text-[12px] focus:outline-none focus:border-gold transition-colors resize-none"
                      placeholder="e.g. W:80cm&#10;D:85cm&#10;H:97cm"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60">Description</label>
                <textarea
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-[#FDFBF7] border border-secondary/20 rounded-xl px-4 py-3 font-secondary text-[14px] focus:outline-none focus:border-gold transition-colors resize-none"
                  placeholder="Detailed product description..."
                />
              </div>

              {/* 🎨 Luxurious Color Options & Custom Color Swatch Builder */}
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-gold/20 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-secondary/8 pb-3">
                  <div>
                    <h3 className="font-primary text-[18px] text-secondary flex items-center gap-2">
                      <PiPalette className="text-gold text-lg" />
                      Color Swatches & Finish Options
                    </h3>
                    <p className="font-secondary text-[11px] text-secondary/50 mt-0.5">
                      Add available color swatches. If empty, the color selector will automatically hide on the store.
                    </p>
                  </div>

                  {/* Allow Custom Color Toggle */}
                  <label className="flex items-center gap-2.5 cursor-pointer bg-white px-3 py-1.5 rounded-full border border-secondary/15">
                    <input
                      type="checkbox"
                      name="allowCustomColor"
                      checked={formData.allowCustomColor}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${formData.allowCustomColor ? 'bg-gold' : 'bg-secondary/20'}`}>
                      <div className={`absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${formData.allowCustomColor ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                    <span className="font-secondary text-[11px] font-semibold text-secondary whitespace-nowrap">
                      Allow Custom Color Order
                    </span>
                  </label>
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="font-secondary text-[10px] font-bold tracking-widest uppercase text-secondary/40 block mb-2">
                    Quick Preset Swatches
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map(preset => {
                      const isAdded = (formData.swatches || []).some(s => s.label === preset.label);
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => isAdded ? handleRemoveSwatch(preset.label) : handleAddSwatch(preset.label, preset.color)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-secondary text-[11px] font-medium border transition-all ${
                            isAdded
                              ? "bg-gold/15 border-gold text-gold font-bold shadow-sm"
                              : "bg-white border-secondary/15 text-secondary/70 hover:border-gold hover:text-gold"
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: preset.color }} />
                          <span className="capitalize">{preset.label}</span>
                          {isAdded && <PiCheckBold size={11} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Input */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <div className="flex items-center gap-2 bg-white border border-secondary/20 rounded-xl px-3 py-2 flex-1">
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
                      placeholder="e.g. Royal Emerald, Emerald Velvet"
                      className="w-full bg-transparent font-secondary text-[13px] text-secondary focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddSwatch(newColorLabel, newColorHex)}
                    disabled={!newColorLabel.trim()}
                    className="px-5 py-2.5 bg-secondary text-white hover:bg-gold hover:text-primary rounded-xl font-secondary text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-30 flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <PiPlus size={14} /> Add Color
                  </button>
                </div>

                {/* Active Swatches List */}
                {(formData.swatches || []).length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-secondary/8">
                    <span className="font-secondary text-[10px] font-bold tracking-widest uppercase text-secondary/40 block">
                      Active Color Swatches ({(formData.swatches || []).length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {formData.swatches.map((swatch, idx) => (
                        <div
                          key={(swatch.id && String(swatch.id).trim()) || (swatch.label && String(swatch.label).trim()) || `swatch-${idx}`}
                          className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-secondary/15 shadow-sm group"
                        >
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: swatch.color || "#836A58" }} />
                          <span className="font-secondary text-[12px] font-medium text-secondary capitalize">{swatch.label}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSwatch(swatch.id || swatch.label)}
                            className="text-secondary/30 hover:text-red-500 transition-colors p-0.5"
                            title="Remove swatch"
                          >
                            <PiX size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Images Upload */}
              <div className="space-y-4">
                <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60">Product Images</label>
                
                {/* Image Previews */}
                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-4 mb-4">
                    {formData.images.map((imgUrl, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-xl border border-secondary/20 overflow-hidden group">
                        <img src={imgUrl} alt={`Preview ${idx}`} className="w-full h-full object-contain p-1" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-red-500/20 text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                        >
                          <PiTrash size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full border-2 border-dashed border-secondary/20 rounded-xl px-4 py-8 flex flex-col items-center justify-center gap-2 bg-[#FDFBF7] text-secondary/50 hover:bg-gold/5 hover:border-gold/30 hover:text-gold transition-colors">
                    <PiUploadSimple size={24} />
                    <span className="font-secondary text-[13px] font-medium">Click to upload images</span>
                    <span className="font-secondary text-[11px]">JPG, PNG, WEBP</span>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-secondary/10">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" name="bestSeller" checked={formData.bestSeller} onChange={handleChange} className="sr-only" />
                    <div className={`w-10 h-6 rounded-full transition-colors ${formData.bestSeller ? 'bg-gold' : 'bg-secondary/20'}`}></div>
                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.bestSeller ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="font-secondary text-[12px] font-medium text-secondary/80 group-hover:text-secondary">Best Seller</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleChange} className="sr-only" />
                    <div className={`w-10 h-6 rounded-full transition-colors ${formData.isNew ? 'bg-gold' : 'bg-secondary/20'}`}></div>
                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isNew ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="font-secondary text-[12px] font-medium text-secondary/80 group-hover:text-secondary">New Arrival</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="sr-only" />
                    <div className={`w-10 h-6 rounded-full transition-colors ${formData.featured ? 'bg-gold' : 'bg-secondary/20'}`}></div>
                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.featured ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="font-secondary text-[12px] font-medium text-secondary/80 group-hover:text-secondary">Featured</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group col-span-2 sm:col-span-1">
                  <div className="relative">
                    <input type="checkbox" name="showInHero" checked={formData.showInHero} onChange={handleChange} className="sr-only" />
                    <div className={`w-10 h-6 rounded-full transition-colors ${formData.showInHero ? 'bg-gold' : 'bg-secondary/20'}`}></div>
                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.showInHero ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="font-secondary text-[12px] font-bold text-gold group-hover:text-secondary flex items-center gap-1">
                    Hero Spotlight ⭐
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" name="outOfStock" checked={formData.outOfStock} onChange={handleChange} className="sr-only" />
                    <div className={`w-10 h-6 rounded-full transition-colors ${formData.outOfStock ? 'bg-amber-600' : 'bg-secondary/20'}`}></div>
                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.outOfStock ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="font-secondary text-[12px] font-medium text-amber-700 font-semibold group-hover:text-amber-800 flex items-center gap-1">
                    Made To Order
                  </span>
                </label>
              </div>

            </form>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-secondary/10 bg-[#FDFBF7] flex justify-end gap-4">
            <button
              onClick={onClose}
              type="button"
              className="px-6 py-2.5 rounded-full font-secondary text-[11px] font-bold tracking-widest uppercase border border-secondary/20 text-secondary/60 hover:text-secondary hover:border-secondary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="product-form"
              className="px-6 py-2.5 rounded-full font-secondary text-[11px] font-bold tracking-widest uppercase bg-gold text-primary shadow-[0_4px_20px_rgba(217,182,110,0.3)] hover:shadow-[0_6px_25px_rgba(217,182,110,0.4)] transition-all"
            >
              Save Product
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
