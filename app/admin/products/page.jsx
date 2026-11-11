"use client";

import { useState, useMemo } from "react";
import { useProducts } from "@/context/ProductContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { 
  PiPlus, 
  PiPencilSimple, 
  PiTrash, 
  PiMagnifyingGlassLight,
  PiCubeLight,
  PiCheckCircleFill,
  PiHammerBold,
  PiStarFill,
  PiLightningFill,
  PiSquaresFour,
  PiListDashes,
  PiFunnelLight,
  PiArrowSquareOutLight,
  PiFolderLight
} from "react-icons/pi";
import ProductFormModal from "@/components/admin/ProductFormModal";
import BulkProductUploadModal from "@/components/admin/BulkProductUploadModal";
import { resolveImageUrl } from "@/lib/imageUtils";
import { formatPrice } from "@/lib/utils";
import { efficientSearchProducts } from "@/lib/catalogIntelligence";
import { useCategories } from "@/context/CategoryContext";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct, isLoaded } = useProducts();
  const { heroProductId, updateHeroProduct } = useSiteSettings();
  const { categories } = useCategories();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "inStock" | "outOfStock" | "hero"
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const safeProducts = useMemo(() => (Array.isArray(products) ? products : []), [products]);

  // Best & Efficient Multi-Attribute Search (Code, Name, Category, Finish, Description)
  const searchedProducts = useMemo(() => {
    if (!searchQuery.trim()) return safeProducts;
    return efficientSearchProducts(safeProducts, searchQuery);
  }, [safeProducts, searchQuery]);

  const filteredProducts = useMemo(() => {
    return searchedProducts.filter((p) => {
      // Status Filter
      if (statusFilter === "inStock" && p.outOfStock) return false;
      if (statusFilter === "outOfStock" && !p.outOfStock) return false;
      if (statusFilter === "hero" && !(heroProductId === p.id || Boolean(p.featured))) return false;

      // Category Filter
      if (categoryFilter !== "all") {
        const pCat = (p.category || "").toLowerCase();
        const selected = (categoryFilter || "").toLowerCase();
        const matches =
          pCat === selected ||
          (Array.isArray(categories) &&
            categories.some(
              (c) =>
                (c.id?.toLowerCase() === selected ||
                  c.label?.toLowerCase() === selected ||
                  c.slug?.toLowerCase() === selected) &&
                (pCat === c.id?.toLowerCase() ||
                  pCat === c.label?.toLowerCase() ||
                  pCat === c.slug?.toLowerCase())
            ));
        if (!matches) return false;
      }

      return true;
    });
  }, [searchedProducts, statusFilter, heroProductId, categoryFilter, categories]);

  if (!isLoaded) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3 text-secondary/60">
          <span className="w-8 h-8 border-3 border-gold/40 border-t-gold rounded-full animate-spin" />
          <span className="font-secondary text-[13px] tracking-wide">Loading Luxury Catalog...</span>
        </div>
      </div>
    );
  }

  const totalCount = safeProducts.length;
  const inStockCount = safeProducts.filter((p) => !p.outOfStock).length;
  const madeToOrderCount = safeProducts.filter((p) => p.outOfStock).length;
  const heroCount = safeProducts.filter((p) => heroProductId === p.id || p.featured).length;

  const handleToggleHero = (product) => {
    const isCurrentlyHero = heroProductId === product.id;
    if (isCurrentlyHero) {
      updateHeroProduct(null);
      updateProduct(product.id, { ...product, featured: false });
      toast.success("Removed spotlight piece from Hero");
    } else {
      updateHeroProduct({ ...product, featured: true });
      updateProduct(product.id, { ...product, featured: true });
      toast.success(`Spotlight piece set to ${product.name}`);
    }
  };

  const handleToggleStock = (product) => {
    const nextState = !product.outOfStock;
    updateProduct(product.id, { ...product, outOfStock: nextState });
    toast.success(`${product.name} marked as ${nextState ? "Made to Order" : "In Stock"}`);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to permanently delete this furniture piece?")) {
      deleteProduct(id);
    }
  };

  const handleFormSubmit = (productData) => {
    if (editingProduct) {
      updateProduct(productData.id, productData);
    } else {
      addProduct(productData);
    }
  };

  const handleBatchAdd = async (newProducts) => {
    for (const prod of newProducts) {
      const { tempId, ...cleanProd } = prod;
      await addProduct(cleanProd);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      
      {/* ── Top Header & Actions ── */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-secondary/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="font-secondary text-[11px] font-bold uppercase tracking-[0.2em] text-gold-dark">
              Atelier Inventory Management
            </span>
          </div>
          <h1 className="font-primary text-[32px] sm:text-[40px] text-secondary leading-tight">
            Manage <em className="text-gold not-italic font-semibold">Products</em>
          </h1>
          <p className="font-secondary text-[13.5px] text-secondary/60 mt-0.5">
            Curate pieces, bulk import studio photography, and manage showroom availability.
          </p>
        </div>

        {/* Action Button Group */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Categories Management Link */}
          <Link
            href="/admin/categories"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-secondary/20 hover:border-gold text-secondary font-secondary text-[11px] font-bold tracking-widest uppercase rounded-xl transition-all shadow-2xs whitespace-nowrap"
          >
            <PiFolderLight size={15} />
            <span>Categories</span>
          </Link>

          {/* ⚡ Bulk Upload Trigger Button */}
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold via-gold-light to-gold hover:opacity-95 text-primary font-secondary text-[11px] font-bold tracking-widest uppercase rounded-xl shadow-[0_4px_16px_rgba(217,182,110,0.35)] transition-all cursor-pointer active:scale-95 group"
          >
            <PiLightningFill size={15} className="text-primary group-hover:scale-110 transition-transform" />
            <span>⚡ Bulk Upload (Multi-Photo)</span>
          </button>

          {/* Add Single Product Button */}
          <button
            onClick={handleAddNew}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-[#0c3148] text-white font-secondary text-[11px] font-bold tracking-widest uppercase rounded-xl shadow-md transition-all whitespace-nowrap cursor-pointer active:scale-95"
          >
            <PiPlus size={16} />
            <span>Add Single Piece</span>
          </button>
        </div>
      </header>

      {/* ── Interactive Metrics Cards Bar ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => setStatusFilter("all")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "all"
              ? "bg-white border-gold shadow-md ring-2 ring-gold/30"
              : "bg-white/70 border-secondary/10 hover:border-gold/30 hover:bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-secondary text-[10.5px] font-bold uppercase tracking-wider text-secondary/50">
              Total Catalog
            </span>
            <PiCubeLight className="text-secondary/40 text-lg" />
          </div>
          <span className="font-primary text-2xl font-bold text-secondary">{totalCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter("inStock")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "inStock"
              ? "bg-white border-emerald-600 shadow-md ring-2 ring-emerald-600/30"
              : "bg-white/70 border-secondary/10 hover:border-emerald-600/30 hover:bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-secondary text-[10.5px] font-bold uppercase tracking-wider text-emerald-800">
              In Stock
            </span>
            <PiCheckCircleFill className="text-emerald-600 text-lg" />
          </div>
          <span className="font-primary text-2xl font-bold text-emerald-700">{inStockCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter("outOfStock")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "outOfStock"
              ? "bg-white border-amber-600 shadow-md ring-2 ring-amber-600/30"
              : "bg-white/70 border-secondary/10 hover:border-amber-600/30 hover:bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-secondary text-[10.5px] font-bold uppercase tracking-wider text-amber-800">
              Made To Order
            </span>
            <PiHammerBold className="text-amber-600 text-lg" />
          </div>
          <span className="font-primary text-2xl font-bold text-amber-700">{madeToOrderCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter("hero")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "hero"
              ? "bg-white border-gold shadow-md ring-2 ring-gold/30"
              : "bg-white/70 border-secondary/10 hover:border-gold/30 hover:bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-secondary text-[10.5px] font-bold uppercase tracking-wider text-gold-dark">
              Hero Spotlight
            </span>
            <PiStarFill className="text-gold text-lg" />
          </div>
          <span className="font-primary text-2xl font-bold text-gold-dark">{heroCount}</span>
        </button>
      </div>

      {/* ── Toolbar: Search, Category Filters & View Toggle ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-secondary/10 shadow-xs">
        
        {/* Left: Search Box */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary/40">
            <PiMagnifyingGlassLight size={18} />
          </div>
          <input
            type="text"
            placeholder="Search piece by title, category, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-secondary/15 text-secondary font-secondary text-[13px] rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        {/* Center: Category Filter Dropdown / Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-secondary text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
              categoryFilter === "all"
                ? "bg-primary text-white shadow-xs"
                : "bg-secondary/5 text-secondary/60 hover:text-secondary hover:bg-secondary/10"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const isCatSelected = categoryFilter === cat.id || categoryFilter === cat.label || categoryFilter === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-secondary text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCatSelected
                    ? "bg-primary text-white shadow-xs"
                    : "bg-secondary/5 text-secondary/60 hover:text-secondary hover:bg-secondary/10"
                }`}
              >
                <span>{cat.icon || "🏷️"}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-secondary/15 shrink-0 self-end md:self-auto">
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "table" ? "bg-white text-secondary shadow-xs font-bold" : "text-secondary/40 hover:text-secondary"
            }`}
            title="Table View"
          >
            <PiListDashes size={17} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "grid" ? "bg-white text-secondary shadow-xs font-bold" : "text-secondary/40 hover:text-secondary"
            }`}
            title="Visual Grid View"
          >
            <PiSquaresFour size={17} />
          </button>
        </div>

      </div>

      {/* ── Table & Cards Container ── */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-secondary/10 shadow-sm overflow-hidden">
        
        {/* VIEW 1: Desktop Table */}
        {viewMode === "table" && (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-secondary/10 font-secondary text-[10px] font-bold tracking-widest uppercase text-secondary/50">
                  <th className="py-4 px-6 font-medium min-w-[280px]">Product / Photo</th>
                  <th className="py-4 px-6 font-medium whitespace-nowrap min-w-[150px]">Category</th>
                  <th className="py-4 px-6 font-medium whitespace-nowrap min-w-[140px]">Price (ብር)</th>
                  <th className="py-4 px-6 font-medium whitespace-nowrap min-w-[180px]">Stock Status</th>
                  <th className="py-4 px-6 font-medium whitespace-nowrap text-right min-w-[160px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/5">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product, idx) => {
                    const isHero = heroProductId === product.id || (product.featured && !heroProductId);
                    const imageSrc = resolveImageUrl(product.images?.[0] || product.image || '/assets/img/hero/beige-chair.jpeg');

                    return (
                      <tr key={product.id || `admin-prod-${idx}`} className="hover:bg-[#FAF8F5]/60 transition-colors group">
                        
                        {/* Product Name & Photo */}
                        <td className="py-4 px-6 flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-[#F6F3EC] overflow-hidden flex-shrink-0 border border-secondary/10 shadow-xs relative">
                            <img 
                              src={imageSrc} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-primary text-[19px] text-secondary font-medium leading-tight">
                              {product.name}
                            </span>
                            <span className="font-secondary text-[11px] text-secondary/45 truncate max-w-[260px] mt-0.5">
                              {product.description || product.id}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 font-secondary text-[11.5px] font-medium text-secondary/85 bg-[#FAF8F5] border border-secondary/15 px-2.5 py-1 rounded-[6px] shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                            {product.category || "Living Room"}
                          </span>
                        </td>

                        {/* Price in Amharic Birr */}
                        <td className="py-4 px-6 font-secondary text-[14.5px] font-bold text-primary whitespace-nowrap">
                          {(product.price || 0).toLocaleString()} <span className="font-ethiopic text-[12px] font-normal text-secondary/60">ብር</span>
                        </td>

                        {/* 1-Click Interactive Stock Status Badge */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleStock(product)}
                              className={`inline-flex items-center px-2.5 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                                product.outOfStock
                                  ? "bg-amber-500/10 text-amber-800 border-amber-500/30 hover:bg-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-800 border-emerald-500/30 hover:bg-emerald-500/20"
                              }`}
                              title="Click to toggle stock status"
                            >
                              {product.outOfStock ? "Made to Order" : "In Stock"}
                            </button>

                            {isHero && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[9.5px] font-bold uppercase tracking-wider bg-gold/15 text-gold-dark border border-gold/30">
                                <PiStarFill size={10} /> Hero
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleHero(product)}
                              className={`px-2.5 py-1 rounded-[6px] font-secondary text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 border cursor-pointer ${
                                isHero
                                  ? "bg-gold/15 text-gold-dark border-gold/40 shadow-xs"
                                  : "bg-white text-secondary/50 border-secondary/15 hover:border-gold hover:text-gold"
                              }`}
                              title="Toggle Hero Spotlight"
                            >
                              <PiStarFill size={11} className={isHero ? "text-gold" : "text-secondary/30"} />
                              <span>{isHero ? "Active Hero" : "Set Hero"}</span>
                            </button>

                            <button
                              onClick={() => handleEdit(product)}
                              className="p-2 text-secondary/60 hover:text-gold hover:bg-gold/10 rounded-xl transition-colors cursor-pointer"
                              title="Edit Piece"
                            >
                              <PiPencilSimple size={18} />
                            </button>

                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-secondary/40 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                              title="Delete Piece"
                            >
                              <PiTrash size={18} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-secondary/50 font-secondary text-[14px]">
                      No furniture pieces found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: Visual Grid View */}
        {viewMode === "grid" && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isHero = heroProductId === product.id || (product.featured && !heroProductId);
              const imageSrc = resolveImageUrl(product.images?.[0] || product.image || '/assets/img/hero/beige-chair.jpeg');

              return (
                <div 
                  key={product.id}
                  className="bg-white border border-secondary/10 hover:border-gold rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="relative aspect-square bg-[#F6F3EC] overflow-hidden">
                    <img
                      src={imageSrc}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleStock(product)}
                        className={`px-2 py-0.5 rounded-md font-secondary text-[9px] font-bold uppercase tracking-wider border shadow-xs ${
                          product.outOfStock
                            ? "bg-amber-600 text-white border-amber-600"
                            : "bg-emerald-600 text-white border-emerald-600"
                        }`}
                      >
                        {product.outOfStock ? "Made to Order" : "In Stock"}
                      </button>
                      {isHero && (
                        <span className="px-2 py-0.5 rounded-md font-secondary text-[9px] font-bold uppercase tracking-wider bg-gold text-primary border border-gold shadow-xs">
                          ★ Hero
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="font-secondary text-[10px] uppercase font-bold text-secondary/40 tracking-wider">
                        {product.category || "Living Room"}
                      </span>
                      <h4 className="font-primary text-[17px] text-secondary font-medium leading-tight truncate mt-0.5">
                        {product.name}
                      </h4>
                      <p className="font-secondary text-[14px] font-bold text-primary mt-2">
                        {formatPrice(product.price)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-secondary/5">
                      <button
                        onClick={() => handleToggleHero(product)}
                        className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                          isHero ? "text-gold" : "text-secondary/40 hover:text-gold"
                        }`}
                      >
                        <PiStarFill size={12} />
                        <span>{isHero ? "Active Hero" : "Set Hero"}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1.5 text-secondary/60 hover:text-gold rounded-lg hover:bg-gold/10"
                        >
                          <PiPencilSimple size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-red-500/70 hover:text-red-500 rounded-lg hover:bg-red-50"
                        >
                          <PiTrash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Mobile Cards (shown on small devices) */}
        <div className="md:hidden flex flex-col divide-y divide-secondary/10">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, idx) => {
              const isHero = heroProductId === product.id || (product.featured && !heroProductId);
              const imageSrc = resolveImageUrl(product.images?.[0] || product.image || '/assets/img/hero/beige-chair.jpeg');

              return (
                <div key={product.id || `admin-prod-card-${idx}`} className="p-4 flex gap-4 bg-white">
                  <div className="w-20 h-20 rounded-2xl bg-[#F6F3EC] flex-shrink-0 overflow-hidden relative border border-secondary/10">
                    <img 
                      src={imageSrc} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-primary text-[17px] text-secondary font-medium leading-tight truncate">
                        {product.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="font-secondary text-[10px] font-medium text-secondary/75 bg-[#FAF8F5] px-2 py-0.5 rounded-[5px] border border-secondary/15 inline-flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-gold/75 shrink-0" />
                          {product.category || "Living Room"}
                        </span>
                        <button
                          onClick={() => handleToggleStock(product)}
                          className={`font-secondary text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-[5px] border ${
                            product.outOfStock
                              ? "text-amber-800 bg-amber-500/10 border-amber-500/25"
                              : "text-emerald-800 bg-emerald-500/10 border-emerald-500/25"
                          }`}
                        >
                          {product.outOfStock ? "Made To Order" : "In Stock"}
                        </button>
                        {isHero && (
                          <span className="font-secondary text-[9.5px] text-gold-dark font-bold uppercase bg-gold/15 border border-gold/30 px-2 py-0.5 rounded-[5px] flex items-center gap-0.5">
                            ★ Hero
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-secondary/5">
                      <span className="font-secondary text-[14px] font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleToggleHero(product)}
                          className={`p-1.5 rounded-lg border text-[11px] ${
                            isHero ? "bg-gold/15 text-gold-dark border-gold/40" : "bg-white text-secondary/40 border-secondary/15"
                          }`}
                          title="Toggle Hero"
                        >
                          <PiStarFill size={14} />
                        </button>
                        <button 
                          onClick={() => handleEdit(product)} 
                          className="p-1.5 text-secondary/70 hover:text-gold bg-[#FAF8F5] border border-secondary/10 rounded-lg"
                        >
                          <PiPencilSimple size={15} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)} 
                          className="p-1.5 text-red-500/70 hover:text-red-500 bg-red-500/10 rounded-lg"
                        >
                          <PiTrash size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center text-secondary/50 font-secondary text-[14px]">
              No products found matching your search.
            </div>
          )}
        </div>

      </div>

      {/* Single Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingProduct}
      />

      {/* ⚡ Bulk Product Multi-Image Upload Modal */}
      <BulkProductUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onBatchAdd={handleBatchAdd}
      />
    </div>
  );
}
