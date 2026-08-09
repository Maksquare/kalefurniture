"use client";

import { useState, useEffect } from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { compressImage } from "@/lib/imageUtils";
import {
  PiMegaphoneSimpleLight,
  PiPencilSimpleLight,
  PiUploadSimple,
  PiCheckBold,
  PiEye,
  PiEyeClosed,
  PiLinkLight,
} from "react-icons/pi";
import toast from "react-hot-toast";

export default function PromoBannerEditor() {
  const { promoSettings, updatePromoSettings } = useSiteSettings();
  const [form, setForm] = useState(promoSettings);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setForm(promoSettings);
  }, [promoSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setForm((prev) => ({ ...prev, image: compressed }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to process banner image.");
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    updatePromoSettings(form);
    setIsSaved(true);
    toast.success("Bottom Ad Banner settings saved!");
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="bg-white border border-secondary/10 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm mt-8 md:mt-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 border-b border-secondary/8 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-secondary text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              Footer Ad Section
            </span>
            <span
              className={`px-2 py-0.5 rounded-full font-secondary text-[9px] font-bold uppercase tracking-wider ${
                form.enabled
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-secondary/5 text-secondary/40"
              }`}
            >
              {form.enabled ? "Active on Landing Page" : "Hidden"}
            </span>
          </div>
          <h2 className="font-primary text-[22px] md:text-[26px] text-secondary">
            Bottom Promo Banner <em className="text-gold not-italic font-semibold">Settings</em>
          </h2>
        </div>

        {/* Master Toggle Switch */}
        <label className="flex items-center gap-3 cursor-pointer self-start sm:self-auto bg-[#FAF8F5] px-4 py-2 rounded-full border border-secondary/15">
          <div className="relative">
            <input
              type="checkbox"
              name="enabled"
              checked={form.enabled}
              onChange={handleChange}
              className="sr-only"
            />
            <div
              className={`w-10 h-5 rounded-full transition-colors ${
                form.enabled ? "bg-gold" : "bg-secondary/20"
              }`}
            />
            <div
              className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                form.enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
          <span className="font-secondary text-[12px] font-semibold text-secondary flex items-center gap-1.5">
            {form.enabled ? <PiEye size={16} className="text-gold" /> : <PiEyeClosed size={16} className="text-secondary/40" />}
            {form.enabled ? "Banner Enabled" : "Banner Hidden"}
          </span>
        </label>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Form Fields */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60 block mb-1.5">
                Headline Title
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full bg-[#FAF8F5] border border-secondary/20 rounded-xl px-4 py-3 font-primary text-[18px] text-secondary focus:outline-none focus:border-gold transition-colors"
                placeholder="e.g. Complete your home with Curated Packages"
              />
            </div>

            <div>
              <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60 block mb-1.5">
                Subtitle Description
              </label>
              <textarea
                name="subtitle"
                value={form.subtitle}
                onChange={handleChange}
                rows={3}
                required
                className="w-full bg-[#FAF8F5] border border-secondary/20 rounded-xl px-4 py-3 font-secondary text-[13px] text-secondary focus:outline-none focus:border-gold transition-colors resize-none"
                placeholder="Description text displayed below headline..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60 block mb-1.5">
                  Button Text
                </label>
                <input
                  type="text"
                  name="buttonText"
                  value={form.buttonText}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#FAF8F5] border border-secondary/20 rounded-xl px-4 py-2.5 font-secondary text-[13px] text-secondary focus:outline-none focus:border-gold transition-colors"
                  placeholder="e.g. Explore Packages"
                />
              </div>

              <div>
                <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60 block mb-1.5 flex items-center gap-1">
                  <PiLinkLight size={14} /> Button Link
                </label>
                <input
                  type="text"
                  name="buttonLink"
                  value={form.buttonLink}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#FAF8F5] border border-secondary/20 rounded-xl px-4 py-2.5 font-secondary text-[13px] text-secondary focus:outline-none focus:border-gold transition-colors"
                  placeholder="e.g. /packages"
                />
              </div>
            </div>

            {/* Banner Image Upload */}
            <div>
              <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60 block mb-1.5">
                Featured Banner Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border border-dashed border-secondary/20 rounded-xl p-4 flex items-center gap-3 bg-[#FAF8F5] hover:border-gold transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 text-gold flex items-center justify-center shrink-0">
                    <PiUploadSimple size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-secondary text-[12px] font-semibold text-secondary truncate">
                      Click to upload new banner photo
                    </p>
                    <p className="font-secondary text-[10px] text-secondary/40">
                      Supports JPG, PNG, WEBP
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Card Preview */}
          <div className="lg:col-span-5 flex flex-col">
            <span className="font-secondary text-[10px] font-bold tracking-widest uppercase text-secondary/40 mb-2">
              Live Preview
            </span>

            <div
              className={`rounded-2xl p-5 border overflow-hidden flex flex-col justify-between relative transition-opacity duration-300 ${
                form.enabled ? "opacity-100 border-secondary/15" : "opacity-40 border-dashed border-secondary/20"
              }`}
              style={{ backgroundColor: form.bgColor || "#DFD2C1" }}
            >
              <div className="relative z-10">
                <h4 className="font-primary text-[20px] font-semibold text-secondary leading-tight mb-2">
                  {form.title || "Your Banner Headline"}
                </h4>
                <p className="font-secondary text-[11px] text-secondary/80 mb-4 line-clamp-3">
                  {form.subtitle || "Your subtitle text..."}
                </p>
                <div className="inline-flex items-center gap-2 bg-primary text-white rounded-full px-4 py-2 font-secondary text-[10px] font-bold tracking-widest uppercase">
                  {form.buttonText || "Button"}
                </div>
              </div>

              {form.image && (
                <div className="mt-4 flex justify-end">
                  <img
                    src={form.image}
                    alt="Preview"
                    className="h-24 object-contain mix-blend-multiply drop-shadow-md"
                  />
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-secondary/8">
          <button
            type="submit"
            className={`px-8 py-3 rounded-full font-secondary text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-md ${
              isSaved
                ? "bg-emerald-600 text-white"
                : "bg-gold hover:bg-gold-dark text-primary shadow-[0_4px_20px_rgba(217,182,110,0.35)] active:scale-95"
            }`}
          >
            {isSaved ? (
              <>
                <PiCheckBold size={16} /> Saved!
              </>
            ) : (
              <>
                <PiMegaphoneSimpleLight size={16} /> Save Banner Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
