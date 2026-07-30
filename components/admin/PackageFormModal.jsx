"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiX, PiUploadSimple, PiTrash, PiPlus } from "react-icons/pi";
import { compressImage } from "@/lib/imageUtils";

export default function PackageFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    collection: "COMPLETE HOME BUNDLE",
    description: "",
    mainImage: "",
    bgColor: "#FAF8F5",
    accentColor: "#6B2B31",
    price: "",
    items: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        price: initialData.price.toString(),
        items: initialData.items || []
      });
    } else {
      setFormData({
        id: `pkg-${Date.now()}`,
        name: "",
        collection: "COMPLETE HOME BUNDLE",
        description: "",
        mainImage: "",
        bgColor: "#FAF8F5",
        accentColor: "#6B2B31",
        price: "",
        items: []
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      price: Number(formData.price) || 0,
    };
    onSubmit(submitData);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressedImage = await compressImage(file);
      setFormData(prev => ({ ...prev, mainImage: compressedImage }));
    } catch (error) {
      console.error("Error compressing image:", error);
      alert("Failed to process image.");
    }
  };

  const handleItemImageUpload = async (e, itemIndex) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressedImage = await compressImage(file);
      const newItems = [...formData.items];
      newItems[itemIndex].image = compressedImage;
      setFormData(prev => ({ ...prev, items: newItems }));
    } catch (error) {
      console.error("Error compressing image:", error);
      alert("Failed to process image.");
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: "", image: "", specs: {} }]
    }));
  };

  const removeItem = (idx) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  const updateItemName = (idx, value) => {
    const newItems = [...formData.items];
    newItems[idx].name = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  // Minimal spec editor: parse a simple comma-separated string like "Width: 200cm, Height: 100cm"
  const handleSpecsChange = (idx, value) => {
    const newItems = [...formData.items];
    const specs = {};
    value.split(',').forEach(part => {
      const [k, v] = part.split(':');
      if (k && v) specs[k.trim()] = v.trim();
    });
    newItems[idx]._rawSpecs = value;
    newItems[idx].specs = specs;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary/10 bg-[#FDFBF7]">
            <h2 className="font-primary text-[24px] text-secondary">
              {initialData ? "Edit" : "Add"} <em className="text-gold not-italic font-semibold">Package</em>
            </h2>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary/5 text-secondary/50 hover:bg-gold hover:text-white transition-colors">
              <PiX size={20} />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <form id="package-form" onSubmit={handleSubmit} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60">Package Name</label>
                  <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#FDFBF7] border border-secondary/20 rounded-xl px-4 py-3 font-secondary text-[14px] focus:outline-none focus:border-gold transition-colors" placeholder="e.g. KAL SIGNATURE" />
                </div>
                <div className="space-y-2">
                  <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60">Collection</label>
                  <input required name="collection" value={formData.collection} onChange={handleChange} className="w-full bg-[#FDFBF7] border border-secondary/20 rounded-xl px-4 py-3 font-secondary text-[14px] focus:outline-none focus:border-gold transition-colors" placeholder="e.g. COMPLETE HOME BUNDLE" />
                </div>
                <div className="space-y-2">
                  <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60">Price (ETB)</label>
                  <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full bg-[#FDFBF7] border border-secondary/20 rounded-xl px-4 py-3 font-secondary text-[14px] focus:outline-none focus:border-gold transition-colors" placeholder="e.g. 200000" />
                </div>
                <div className="space-y-2 flex gap-4">
                  <div className="flex-1">
                    <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60">BG Color</label>
                    <input type="color" name="bgColor" value={formData.bgColor} onChange={handleChange} className="w-full h-11 bg-[#FDFBF7] border border-secondary/20 rounded-xl px-2 py-1" />
                  </div>
                  <div className="flex-1">
                    <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60">Accent Color</label>
                    <input type="color" name="accentColor" value={formData.accentColor} onChange={handleChange} className="w-full h-11 bg-[#FDFBF7] border border-secondary/20 rounded-xl px-2 py-1" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60">Description</label>
                <textarea required name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full bg-[#FDFBF7] border border-secondary/20 rounded-xl px-4 py-3 font-secondary text-[14px] focus:outline-none focus:border-gold transition-colors resize-none" placeholder="Package description..." />
              </div>

              <div className="space-y-4">
                <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60">Main Package Image</label>
                <div className="flex items-center gap-4">
                  {formData.mainImage && (
                    <div className="w-32 h-32 rounded-xl border border-secondary/20 overflow-hidden relative group">
                      <img src={formData.mainImage} alt="Main Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="relative flex-1">
                    <input type="file" accept="image/*" onChange={handleMainImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="w-full border-2 border-dashed border-secondary/20 rounded-xl px-4 py-6 flex flex-col items-center justify-center gap-2 bg-[#FDFBF7] text-secondary/50 hover:bg-gold/5 hover:border-gold/30 hover:text-gold transition-colors">
                      <PiUploadSimple size={24} />
                      <span className="font-secondary text-[13px] font-medium">Upload Main Image</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-secondary/10">
                <div className="flex items-center justify-between">
                  <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60">Package Items</label>
                  <button type="button" onClick={addItem} className="flex items-center gap-2 text-[11px] font-bold uppercase text-gold hover:text-gold-dark transition-colors">
                    <PiPlus /> Add Item
                  </button>
                </div>
                
                {formData.items.map((item, idx) => (
                  <div key={idx} className="p-4 bg-secondary/5 rounded-xl border border-secondary/10 relative">
                    <button type="button" onClick={() => removeItem(idx)} className="absolute top-4 right-4 text-secondary/40 hover:text-red-500 transition-colors">
                      <PiTrash size={18} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                      <div className="space-y-2">
                        <label className="font-secondary text-[10px] uppercase text-secondary/50">Item Name</label>
                        <input required value={item.name} onChange={(e) => updateItemName(idx, e.target.value)} className="w-full bg-white border border-secondary/10 rounded-lg px-3 py-2 text-[13px]" placeholder="e.g. LIVING ROOM SOFA" />
                      </div>
                      <div className="space-y-2">
                        <label className="font-secondary text-[10px] uppercase text-secondary/50">Specs (Comma separated pairs e.g., Width: 200cm, Height: 50cm)</label>
                        <input required value={item._rawSpecs || Object.entries(item.specs || {}).map(([k, v]) => `${k}: ${v}`).join(', ')} onChange={(e) => handleSpecsChange(idx, e.target.value)} className="w-full bg-white border border-secondary/10 rounded-lg px-3 py-2 text-[13px]" placeholder="Width: 200cm, Material: Oak" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-secondary text-[10px] uppercase text-secondary/50">Item Image</label>
                      <div className="flex items-center gap-4">
                        {item.image && (
                          <div className="w-16 h-16 rounded-lg border border-secondary/10 overflow-hidden relative">
                            <img src={item.image} alt="Item" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="relative flex-1">
                          <input type="file" accept="image/*" onChange={(e) => handleItemImageUpload(e, idx)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div className="w-full border border-dashed border-secondary/20 rounded-lg px-4 py-3 flex items-center justify-center gap-2 bg-white text-secondary/50 hover:bg-gold/5 hover:text-gold transition-colors">
                            <PiUploadSimple size={18} />
                            <span className="font-secondary text-[11px]">Upload Item Image</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {formData.items.length === 0 && (
                  <p className="text-secondary/40 text-[12px] italic text-center py-4">No items added to this package yet.</p>
                )}
              </div>

            </form>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-secondary/10 bg-[#FDFBF7] flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-full font-secondary text-[11px] font-bold tracking-widest uppercase border border-secondary/20 text-secondary/60 hover:text-secondary hover:border-secondary transition-all">
              Cancel
            </button>
            <button type="submit" form="package-form" className="px-6 py-2.5 rounded-full font-secondary text-[11px] font-bold tracking-widest uppercase bg-gold text-primary shadow-[0_4px_20px_rgba(217,182,110,0.3)] hover:shadow-[0_6px_25px_rgba(217,182,110,0.4)] transition-all">
              Save Package
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
