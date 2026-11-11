"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProducts } from "@/context/ProductContext";
import { usePackages } from "@/context/PackageContext";
import { useCategories } from "@/context/CategoryContext";
import { PiPackage, PiTag, PiMoney, PiShoppingBagLight, PiPlus, PiPencilSimple, PiTrash, PiFolderLight, PiFolderPlus, PiPaperPlaneTilt } from "react-icons/pi";
import PackageFormModal from "@/components/admin/PackageFormModal";
import AddCategoryModal from "@/components/admin/AddCategoryModal";
import SalesReport from "@/components/admin/SalesReport";
import { fetchSalesReport } from "@/app/actions/admin";

import PromoBannerEditor from "@/components/admin/PromoBannerEditor";
import HeroImageEditor from "@/components/admin/HeroImageEditor";

export default function AdminDashboard() {
  const { products, isLoaded: isProductsLoaded } = useProducts();
  const { packages, addPackage, updatePackage, deletePackage, isLoaded: isPackagesLoaded } = usePackages();
  const { categories, isLoaded: isCategoriesLoaded } = useCategories();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [totalInquiries, setTotalInquiries] = useState(null);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);

  useEffect(() => {
    async function loadInquiriesCount() {
      const res = await fetchSalesReport();
      if (res.success && res.data) {
        setTotalInquiries(res.data.totalOrders);
      }
    }
    loadInquiriesCount();
  }, []);

  if (!isProductsLoaded || !isPackagesLoaded || !isCategoriesLoaded) {
    return (
      <div className="p-10 flex items-center gap-3 font-secondary text-secondary/50">
        <span className="w-4 h-4 border-2 border-gold/50 border-t-gold rounded-full animate-spin" />
        Loading Dashboard…
      </div>
    );
  }

  const safeProducts = Array.isArray(products) ? products : [];
  const safePackages = Array.isArray(packages) ? packages : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const totalProducts = safeProducts.length;
  const avgPrice = totalProducts > 0
    ? safeProducts.reduce((acc, p) => acc + (p?.price || 0), 0) / totalProducts
    : 0;

  const stats = [
    { title: "Total Products", value: totalProducts, icon: PiPackage },
    { title: "Categories",     value: `${safeCategories.length} Families`, icon: PiFolderLight },
    { title: "Packages",       value: safePackages.length, icon: PiTag },
    { title: "Avg. Price",     value: `${Math.round(avgPrice).toLocaleString()} ብር`, icon: PiMoney },
    { 
      title: "Total Inquiries", 
      value: totalInquiries !== null ? totalInquiries : "—", 
      icon: PiShoppingBagLight, 
      highlight: totalInquiries !== null && totalInquiries > 0 
    },
  ];

  const handleAddNew = () => { setEditingPackage(null); setIsModalOpen(true); };
  const handleEdit   = (pkg) => { setEditingPackage(pkg); setIsModalOpen(true); };
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this package?")) deletePackage(id);
  };
  const handleFormSubmit = (packageData) => {
    if (editingPackage) updatePackage(packageData.id, packageData);
    else addPackage(packageData);
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-8">

      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-secondary text-[11px] font-bold uppercase tracking-[0.2em] text-secondary/50">
              Showroom Control Center • Addis Ababa
            </span>
          </div>
          <h1 className="font-primary text-[32px] sm:text-[38px] text-secondary leading-tight mb-1">
            Dashboard <em className="text-gold not-italic font-semibold">Overview</em>
          </h1>
          <p className="font-secondary text-[14px] text-secondary/50">
            Welcome back to the Kal Furniture administrative command studio.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAddCategoryModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold/15 hover:bg-gold text-gold-dark hover:text-primary border border-gold/30 font-secondary text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-2xs cursor-pointer active:scale-98"
          >
            <PiFolderPlus size={15} />
            + Add Category
          </button>
          <a
            href="/admin/categories"
            className="px-4 py-2 bg-white border border-secondary/20 hover:border-gold text-secondary font-secondary text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all"
          >
            Categories ({safeCategories.length})
          </a>
          <a
            href="/admin/products"
            className="px-4 py-2 bg-primary text-white hover:bg-gold hover:text-primary font-secondary text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
          >
            Manage Products
          </a>
          <a
            href="/admin/hero"
            className="px-4 py-2 bg-white border border-secondary/20 hover:border-gold text-secondary font-secondary text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all"
          >
            Hero & Featured
          </a>
          <Link
            href="/admin/telegram"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-500/10 hover:bg-sky-500 text-sky-700 hover:text-white border border-sky-400/30 font-secondary text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-2xs"
          >
            <PiPaperPlaneTilt size={14} />
            Telegram Admins
          </Link>
        </div>
      </header>

      {/* ── Quick-stat grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white border border-secondary/10 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.highlight ? "bg-gold/10 text-gold" : "bg-secondary/5 text-secondary/60"}`}>
                  <Icon className="text-2xl" />
                </div>
              </div>
              <h3 className="font-secondary text-[12px] font-bold tracking-widest uppercase text-secondary/50 mb-1">
                {stat.title}
              </h3>
              <p className="font-primary text-[28px] font-medium text-secondary">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Manage Packages ── */}
      <div className="bg-white border border-secondary/10 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="font-primary text-[20px] md:text-[24px] text-secondary">Manage Packages</h2>
          <button
            onClick={handleAddNew}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gold hover:bg-gold-dark text-primary font-secondary text-[11px] font-bold tracking-widest uppercase rounded-xl shadow-[0_4px_16px_rgba(217,182,110,0.3)] transition-all cursor-pointer active:scale-98"
          >
            <PiPlus size={16} /> Add Package
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/5 border-b border-secondary/10 font-secondary text-[10px] font-bold tracking-widest uppercase text-secondary/50">
                <th className="py-4 px-6 font-medium">Image</th>
                <th className="py-4 px-6 font-medium">Name & Collection</th>
                <th className="py-4 px-6 font-medium">Price</th>
                <th className="py-4 px-6 font-medium">Items</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/5">
              {safePackages.length > 0 ? (
                safePackages.map((pkg, idx) => (
                  <tr key={pkg.id || pkg.name || `pkg-${idx}`} className="hover:bg-secondary/[0.02] transition-colors group">
                    <td className="py-4 px-6">
                      <div className="w-16 h-16 rounded-2xl bg-[#F6F3EC] overflow-hidden flex-shrink-0 border border-secondary/10">
                        {pkg.mainImage ? (
                          <img src={pkg.mainImage} alt={pkg.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-secondary/30 text-[10px]">No Img</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-primary text-[18px] text-secondary block">{pkg.name}</span>
                      <span className="font-secondary text-[11px] text-secondary/50 uppercase tracking-widest">{pkg.collection}</span>
                    </td>
                    <td className="py-4 px-6 font-secondary text-[14px] text-secondary whitespace-nowrap">
                      {(pkg.price || 0).toLocaleString()} <span className="font-ethiopic text-[12px] font-normal text-secondary/60">ብር</span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 font-secondary text-[11.5px] font-medium text-secondary/85 bg-[#FAF8F5] border border-secondary/15 px-2.5 py-1 rounded-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold/75 shrink-0" />
                        {pkg.items?.length || 0} items
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(pkg)} className="p-2 text-secondary/50 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors cursor-pointer" title="Edit">
                          <PiPencilSimple size={18} />
                        </button>
                        <button onClick={() => handleDelete(pkg.id)} className="p-2 text-secondary/50 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                          <PiTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-secondary/40 font-secondary text-[14px]">
                    No packages created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden flex flex-col gap-4">
          {safePackages.length > 0 ? (
            safePackages.map((pkg, idx) => (
              <div key={pkg.id || pkg.name || `pkg-card-${idx}`} className="bg-white border border-secondary/10 rounded-2xl p-4 flex gap-4">
                <div className="w-20 h-20 rounded-2xl bg-[#F6F3EC] flex-shrink-0 overflow-hidden border border-secondary/10">
                  {pkg.mainImage ? (
                    <img src={pkg.mainImage} alt={pkg.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-secondary/30 text-[10px]">No Img</div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-primary text-[16px] text-secondary leading-tight">{pkg.name}</h3>
                    <p className="font-secondary text-[10px] text-secondary/50 uppercase tracking-widest mt-1">{pkg.collection}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col">
                      <span className="font-secondary text-[13px] font-semibold text-secondary">
                        {(pkg.price || 0).toLocaleString()} <span className="font-ethiopic text-[11px] font-normal text-secondary/60">ብር</span>
                      </span>
                      <span className="font-secondary text-[11px] text-gold font-medium">{pkg.items?.length || 0} items</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(pkg)} className="p-2 text-secondary/70 hover:text-gold bg-secondary/5 rounded-lg">
                        <PiPencilSimple size={16} />
                      </button>
                      <button onClick={() => handleDelete(pkg.id)} className="p-2 text-red-500/70 hover:text-red-500 bg-red-500/5 rounded-lg">
                        <PiTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-secondary/40 font-secondary text-[14px]">
              No packages created yet.
            </div>
          )}
        </div>
      </div>

      {/* ── Sales Report Section ── */}
      <SalesReport />

      {/* ── Landing Page Top Hero Showcase & Image Editor ── */}
      <div id="hero-section">
        <HeroImageEditor />
      </div>

      {/* ── Telegram Bot & Admin Access Quick-Bar ── */}
      <div className="bg-gradient-to-r from-sky-50 via-[#FAF8F5] to-white border border-sky-200/60 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20">
            <PiPaperPlaneTilt size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-secondary text-[10.5px] font-bold uppercase tracking-wider text-sky-800/60">
                Connected Bot • @KalFurnitureAdminBot
              </span>
            </div>
            <h3 className="font-primary text-[20px] md:text-[22px] text-secondary font-semibold">
              Telegram Bot <em className="text-gold not-italic">Admin Team</em>
            </h3>
            <p className="font-secondary text-[13px] text-secondary/60 max-w-xl mt-0.5">
              Authorize staff members by their Telegram ID to manage showroom inventory, update prices, and control website promo announcements directly from their phones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <Link
            href="/admin/telegram"
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white hover:bg-gold hover:text-primary rounded-xl font-secondary text-[11.5px] font-bold uppercase tracking-wider transition-all shadow-sm"
          >
            <PiPaperPlaneTilt size={16} />
            Manage Admins
          </Link>
        </div>
      </div>

      {/* ── Landing Page Bottom Ad Banner Editor ── */}
      <PromoBannerEditor />

      <PackageFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingPackage}
      />

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
      />
    </div>
  );
}
