"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiX, PiUploadSimple, PiTrash } from "react-icons/pi";
import { compressImage } from "@/lib/imageUtils";

export default function ProductFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: "",
    description: "",
    category: "Living Room",
    type: "Furniture",
    color: "Neutral",
    images: [],
    bestSeller: false,
    isNew: false,
    featured: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        price: initialData.price.toString(),
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
        color: "Neutral",
        images: [],
        bestSeller: false,
        isNew: false,
        featured: false,
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Parse the form data back into the expected object structure
    const submitData = {
      ...formData,
      price: Number(formData.price) || 0,
      images: formData.images,
    };

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
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
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
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
              
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
                <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60">Description</label>
                <textarea
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-[#FDFBF7] border border-secondary/20 rounded-xl px-4 py-3 font-secondary text-[14px] focus:outline-none focus:border-gold transition-colors resize-none"
                  placeholder="Product description..."
                />
              </div>

              <div className="space-y-4">
                <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60">Product Images</label>
                
                {/* Image Previews */}
                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-4 mb-4">
                    {formData.images.map((imgUrl, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-xl border border-secondary/20 overflow-hidden group">
                        <img src={imgUrl} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
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
                    <span className="font-secondary text-[11px]">JPG, PNG, WEBP (Max 5MB total in LocalStorage)</span>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-secondary/10">
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
