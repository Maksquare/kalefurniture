"use client";

import { useState, useEffect } from "react";
import { useCategories } from "@/context/CategoryContext";
import { generateCategoryPrefix } from "@/lib/catalogIntelligence";
import { 
  PiX, 
  PiFolderPlusLight, 
  PiCheckBold, 
  PiWarningCircleBold, 
  PiSparkleFill, 
  PiTagLight, 
  PiCubeLight 
} from "react-icons/pi";
import toast from "react-hot-toast";

const SUGGESTED_EMOJIS = [
  { emoji: "🛋️", label: "Living / Sofa" },
  { emoji: "🛏️", label: "Bedroom / Bed" },
  { emoji: "🍽️", label: "Dining Area" },
  { emoji: "🍳", label: "Kitchen Cabinet" },
  { emoji: "💼", label: "Home Office" },
  { emoji: "🪑", label: "Accent Chair / Stool" },
  { emoji: "☕", label: "Coffee Table" },
  { emoji: "🌿", label: "Outdoor / Patio" },
  { emoji: "🚪", label: "Wardrobe / Closet" },
  { emoji: "📺", label: "TV Unit / Console" },
  { emoji: "💡", label: "Lighting / Chandelier" },
  { emoji: "🪞", label: "Mirror / Vanity" },
  { emoji: "🧺", label: "Credenza / Storage" },
  { emoji: "✨", label: "Bespoke Signature" },
];

export default function AddCategoryModal({ isOpen, onClose, onSuccess, initialCategory = null }) {
  const { categories, addCategory, updateCategory } = useCategories();

  const [name, setName] = useState("");
  const [prefix, setPrefix] = useState("");
  const [icon, setIcon] = useState("🏷️");
  const [description, setDescription] = useState("");
  const [isPrefixManuallyEdited, setIsPrefixManuallyEdited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialCategory) {
      setName(initialCategory.label || initialCategory.name || "");
      setPrefix(initialCategory.prefix || "");
      setIcon(initialCategory.icon || "🏷️");
      setDescription(initialCategory.description || "");
      setIsPrefixManuallyEdited(true);
    } else {
      setName("");
      setPrefix("");
      setIcon("🛋️");
      setDescription("");
      setIsPrefixManuallyEdited(false);
    }
  }, [initialCategory, isOpen]);

  if (!isOpen) return null;

  // Auto-suggest prefix as name is typed (unless user explicitly typed a custom prefix)
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!isPrefixManuallyEdited) {
      const generated = generateCategoryPrefix(val);
      setPrefix(generated);
    }
  };

  const handlePrefixChange = (e) => {
    setIsPrefixManuallyEdited(true);
    setPrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4));
  };

  // Check prefix conflicts with other categories
  const normalizedPrefix = (prefix || "").trim().toUpperCase();
  const conflictingCategory = categories.find(
    (c) =>
      c.prefix?.toUpperCase() === normalizedPrefix &&
      (!initialCategory || c.id !== initialCategory.id)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    if (!normalizedPrefix) {
      toast.error("Please provide a product code prefix (e.g. KKC)");
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialCategory) {
        const res = await updateCategory(initialCategory.id, {
          name: name.trim(),
          prefix: normalizedPrefix,
          icon: icon || "🏷️",
          description: description.trim(),
        });
        if (res.success) {
          if (onSuccess) onSuccess(res.category);
          onClose();
        }
      } else {
        const res = await addCategory({
          name: name.trim(),
          prefix: normalizedPrefix,
          icon: icon || "🏷️",
          description: description.trim(),
        });
        if (res.success) {
          if (onSuccess) onSuccess(res.category);
          onClose();
        }
      }
    } catch (err) {
      console.error("Save category error:", err);
      toast.error("Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-primary/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#FAF8F5] border border-secondary/15 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-primary text-white p-6 relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="font-secondary text-[10px] font-bold tracking-[0.2em] text-white/60 uppercase">
              Kal Furniture Taxonomy Studio
            </span>
          </div>
          <h2 className="font-primary text-[26px] text-white leading-tight flex items-center gap-2.5">
            <PiFolderPlusLight className="text-gold text-2xl" />
            {initialCategory ? "Edit Category" : "Add New Category"}
          </h2>
          <p className="font-secondary text-[12.5px] text-white/60 mt-0.5">
            Define a showroom category with automatic sequential catalog coding (e.g. KKC001).
          </p>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <PiX size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Category Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/70 flex items-center gap-1.5">
                <PiTagLight className="text-gold" />
                Category Title <span className="text-red-500">*</span>
              </label>
              <span className="font-secondary text-[10.5px] text-secondary/40 italic">
                e.g. Kitchen Cabinet, Outdoor Patio
              </span>
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Kitchen Cabinet"
              className="w-full bg-white border border-secondary/15 rounded-xl px-4 py-3 font-secondary text-[14px] text-secondary focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all placeholder:text-secondary/35 shadow-2xs"
            />
          </div>

          {/* Product Code Prefix */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/70 flex items-center gap-1.5">
                <PiCubeLight className="text-gold" />
                Catalog Code Prefix <span className="text-red-500">*</span>
              </label>
              <span className="font-secondary text-[10.5px] text-secondary/40 font-mono">
                2-4 letters (e.g. KKC, KSF)
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={prefix}
                onChange={handlePrefixChange}
                maxLength={4}
                placeholder="e.g. KKC"
                className="w-full bg-white border border-secondary/15 rounded-xl px-4 py-3 font-secondary font-mono text-[14px] text-secondary tracking-widest uppercase focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all placeholder:text-secondary/35 shadow-2xs"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-primary/5 text-primary text-[10.5px] font-mono font-bold tracking-wider">
                {prefix ? `${prefix}001` : "KSF001"}
              </span>
            </div>

            {/* Conflicting Prefix Warning */}
            {conflictingCategory && (
              <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 font-secondary text-[11.5px]">
                <PiWarningCircleBold size={15} className="text-amber-600 shrink-0" />
                <span>
                  Notice: Prefix <strong>{normalizedPrefix}</strong> is also used by &quot;{conflictingCategory.label}&quot;. Products will share this code family.
                </span>
              </div>
            )}
            <p className="font-secondary text-[11px] text-secondary/50">
              When adding products to this category, codes will auto-sequence without gaps: <strong>{prefix || "KKC"}001</strong>, <strong>{prefix || "KKC"}002</strong>, etc.
            </p>
          </div>

          {/* Emoji / Icon Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/70">
                Showroom Visual Icon
              </label>
              <span className="font-secondary text-[12px] flex items-center gap-1 font-semibold text-secondary">
                Selected: <span className="text-lg">{icon}</span>
              </span>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-secondary/10 space-y-2.5">
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                {SUGGESTED_EMOJIS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setIcon(item.emoji)}
                    title={item.label}
                    className={`h-9 px-2.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                      icon === item.emoji
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-[#FAF8F5] text-secondary/80 border-secondary/10 hover:border-gold/40 hover:bg-white"
                    }`}
                  >
                    <span className="text-base">{item.emoji}</span>
                    <span className="font-secondary text-[11px] font-medium hidden sm:inline">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom Emoji Input */}
              <div className="flex items-center gap-2 pt-1 border-t border-secondary/8">
                <span className="font-secondary text-[10.5px] text-secondary/50 uppercase tracking-wider">
                  Custom Icon:
                </span>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value.slice(0, 4))}
                  placeholder="🛋️"
                  className="w-16 bg-[#FAF8F5] border border-secondary/15 rounded-lg px-2 py-1 text-center font-secondary text-[13px] text-secondary focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          {/* Optional Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/70">
                Description / Craftsmanship Scope
              </label>
              <span className="font-secondary text-[10.5px] text-secondary/40 italic">Optional</span>
            </div>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Custom European-grade kitchen cabinetry, islands, and architectural millwork."
              className="w-full bg-white border border-secondary/15 rounded-xl px-4 py-2.5 font-secondary text-[13px] text-secondary focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all placeholder:text-secondary/35 resize-none shadow-2xs"
            />
          </div>

          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-[#F5F2EB] border border-gold/30 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-secondary text-[10px] font-bold uppercase tracking-widest text-gold-dark flex items-center gap-1">
                <PiSparkleFill size={11} className="text-gold" />
                Live Preview in Product Form
              </span>
              <span className="font-secondary text-[10px] font-mono text-secondary/40">
                Code Family: [{normalizedPrefix || "KKC"}]
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-xl bg-primary text-white flex items-center gap-2 shadow-sm">
                <span className="text-base">{icon || "🛋️"}</span>
                <span className="font-secondary text-[13px] font-semibold">
                  {name || "Kitchen Cabinet"}
                </span>
              </div>
              <div className="font-secondary text-[11.5px] text-secondary/70">
                Auto codes: <span className="font-mono font-bold text-primary">{normalizedPrefix || "KKC"}001</span>, <span className="font-mono text-secondary/50">{normalizedPrefix || "KKC"}002</span>...
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-secondary/20 font-secondary text-[12.5px] font-medium text-secondary/70 hover:bg-white hover:text-secondary transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-gold hover:text-primary text-white font-secondary text-[12.5px] font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <PiCheckBold size={14} />
                  {initialCategory ? "Update Category" : "Save Category"}
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
