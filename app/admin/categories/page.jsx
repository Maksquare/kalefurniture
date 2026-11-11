"use client";

import { useState } from "react";
import { useCategories } from "@/context/CategoryContext";
import { useProducts } from "@/context/ProductContext";
import AddCategoryModal from "@/components/admin/AddCategoryModal";
import Link from "next/link";
import { 
  PiFolderPlus, 
  PiPencilSimple, 
  PiTrash, 
  PiArmchair, 
  PiArrowSquareOutLight, 
  PiFolderLight, 
  PiCubeLight,
  PiSparkleFill,
  PiCheckCircleFill,
  PiLockKeyLight
} from "react-icons/pi";
import toast from "react-hot-toast";

export default function AdminCategoriesPage() {
  const { categories, deleteCategory, isLoaded: isCategoriesLoaded } = useCategories();
  const { products, isLoaded: isProductsLoaded } = useProducts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  if (!isCategoriesLoaded || !isProductsLoaded) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3 text-secondary/60">
          <span className="w-8 h-8 border-3 border-gold/40 border-t-gold rounded-full animate-spin" />
          <span className="font-secondary text-[13px] tracking-wide">Loading Categories Taxonomy...</span>
        </div>
      </div>
    );
  }

  // Count products per category
  const getProductCountForCategory = (cat) => {
    return products.filter((p) => {
      const pCat = (p.category || "").toLowerCase();
      return (
        pCat === cat.id.toLowerCase() ||
        pCat === cat.label.toLowerCase() ||
        pCat === cat.slug?.toLowerCase()
      );
    }).length;
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleDelete = async (cat) => {
    const count = getProductCountForCategory(cat);
    if (count > 0) {
      const confirmDelete = window.confirm(
        `Warning: There are ${count} active product(s) in "${cat.label}". If you delete this category, these products will still exist but won't have an active category badge. Are you sure you want to proceed?`
      );
      if (!confirmDelete) return;
    } else {
      const confirmDelete = window.confirm(`Are you sure you want to remove category "${cat.label}"?`);
      if (!confirmDelete) return;
    }

    const res = await deleteCategory(cat.id);
    if (res.success) {
      toast.success(`Category "${cat.label}" deleted.`);
    }
  };

  const totalPieces = products.length;

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="font-secondary text-[11px] font-bold uppercase tracking-[0.2em] text-secondary/50">
              Taxonomy & Code Sequences • Kal Furniture
            </span>
          </div>
          <h1 className="font-primary text-[32px] sm:text-[38px] text-secondary leading-tight mb-1">
            Showroom <em className="text-gold not-italic font-semibold">Categories</em>
          </h1>
          <p className="font-secondary text-[14px] text-secondary/50 max-w-2xl">
            Manage your furniture catalog collections, product code families (e.g. KKC001, KSF001), and showroom classification.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary hover:bg-gold hover:text-primary text-white font-secondary text-[12.5px] font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer hover:shadow-lg active:scale-98"
          >
            <PiFolderPlus className="text-lg" />
            Add New Category
          </button>
        </div>
      </header>

      {/* ── Key Metrics Overview ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-secondary/10 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center shrink-0">
            <PiFolderLight className="text-2xl" />
          </div>
          <div>
            <span className="font-secondary text-[11px] font-bold uppercase tracking-widest text-secondary/50 block">
              Active Categories
            </span>
            <span className="font-primary text-[28px] text-secondary font-bold leading-tight">
              {categories.length}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-secondary/10 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <PiArmchair className="text-2xl" />
          </div>
          <div>
            <span className="font-secondary text-[11px] font-bold uppercase tracking-widest text-secondary/50 block">
              Total Pieces
            </span>
            <span className="font-primary text-[28px] text-secondary font-bold leading-tight">
              {totalPieces}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-secondary/10 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
            <PiCubeLight className="text-2xl" />
          </div>
          <div>
            <span className="font-secondary text-[11px] font-bold uppercase tracking-widest text-secondary/50 block">
              Code Families
            </span>
            <span className="font-primary text-[28px] text-secondary font-bold leading-tight">
              {new Set(categories.map((c) => c.prefix)).size} Active
            </span>
          </div>
        </div>
      </div>

      {/* ── Categories Grid ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-primary text-[22px] text-secondary flex items-center gap-2">
            Showroom Collections & Code Families
          </h2>
          <span className="font-secondary text-[12px] text-secondary/50">
            {categories.length} configured categories
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const productCount = getProductCountForCategory(cat);
            return (
              <div
                key={cat.id}
                className="group p-6 rounded-3xl bg-white border border-secondary/10 hover:border-gold/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
              >
                {/* Subtle luxury top gradient bar */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold/40 via-gold to-gold/40 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-4">
                  {/* Top line with Icon, Badges, and Menu */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] border border-secondary/10 flex items-center justify-center text-3xl shadow-2xs group-hover:scale-105 transition-transform">
                        {cat.icon || "🏷️"}
                      </div>
                      <div>
                        <h3 className="font-primary text-[20px] text-secondary font-bold leading-tight">
                          {cat.label}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded-md bg-primary/8 text-primary font-mono font-bold text-[11px] tracking-wider uppercase border border-primary/10">
                            {cat.prefix}
                          </span>
                          <span className="font-secondary text-[11px] text-secondary/50 font-mono">
                            e.g. {cat.prefix}001
                          </span>
                        </div>
                      </div>
                    </div>

                    {cat.isDefault ? (
                      <span className="px-2 py-0.5 rounded-full bg-secondary/8 text-secondary/70 font-secondary text-[10px] font-semibold tracking-wider uppercase shrink-0 flex items-center gap-1">
                        <PiLockKeyLight size={11} />
                        Core
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-gold/15 text-gold-dark font-secondary text-[10px] font-bold tracking-wider uppercase shrink-0 flex items-center gap-1 border border-gold/30">
                        <PiSparkleFill size={10} className="text-gold" />
                        Custom
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="font-secondary text-[12.5px] text-secondary/60 leading-relaxed min-h-[38px]">
                    {cat.description || "Bespoke handcrafted showroom collection tailored with premium finishes."}
                  </p>

                  {/* Piece count indicator */}
                  <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] border border-secondary/8">
                    <span className="font-secondary text-[11.5px] text-secondary/70 font-medium">
                      Catalogue Pieces:
                    </span>
                    <span className="font-secondary text-[12px] font-bold text-primary">
                      {productCount} {productCount === 1 ? "Piece" : "Pieces"}
                    </span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-secondary/8">
                  <Link
                    href={`/admin/products?category=${encodeURIComponent(cat.id)}`}
                    className="flex items-center gap-1.5 font-secondary text-[12px] font-semibold text-primary hover:text-gold transition-colors"
                  >
                    <PiArrowSquareOutLight size={15} />
                    View Products
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cat)}
                      title="Edit Category"
                      className="p-2 rounded-xl text-secondary/60 hover:text-primary hover:bg-secondary/5 transition-colors cursor-pointer"
                    >
                      <PiPencilSimple size={17} />
                    </button>

                    {!cat.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleDelete(cat)}
                        title="Delete Category"
                        className="p-2 rounded-xl text-red-500/70 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <PiTrash size={17} />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      <AddCategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        initialCategory={editingCategory}
      />

    </div>
  );
}
