"use client";

import { useState } from "react";
import { useProducts } from "@/context/ProductContext";
import { usePackages } from "@/context/PackageContext";
import { PiPackage, PiTag, PiMoney, PiChartLineUp, PiPlus, PiPencilSimple, PiTrash } from "react-icons/pi";
import PackageFormModal from "@/components/admin/PackageFormModal";

export default function AdminDashboard() {
  const { products, isLoaded: isProductsLoaded } = useProducts();
  const { packages, addPackage, updatePackage, deletePackage, isLoaded: isPackagesLoaded } = usePackages();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  if (!isProductsLoaded || !isPackagesLoaded) return <div className="p-10 font-secondary text-secondary/60">Loading Dashboard...</div>;

  const totalProducts = products.length;
  
  // Calculate average price
  const avgPrice = totalProducts > 0 
    ? products.reduce((acc, p) => acc + (p.price || 0), 0) / totalProducts
    : 0;

  // Count unique categories
  const categories = [...new Set(products.map(p => p.category))].length;

  const stats = [
    { title: "Total Products", value: totalProducts, icon: PiPackage },
    { title: "Packages", value: packages.length, icon: PiTag },
    { title: "Avg. Price", value: `${Math.round(avgPrice).toLocaleString()} ETB`, icon: PiMoney },
    { title: "Sales Growth", value: "+12.5%", icon: PiChartLineUp, highlight: true },
  ];

  const handleAddNew = () => {
    setEditingPackage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this package?")) {
      deletePackage(id);
    }
  };

  const handleFormSubmit = (packageData) => {
    if (editingPackage) {
      updatePackage(packageData.id, packageData);
    } else {
      addPackage(packageData);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">
      <header className="mb-8 md:mb-10">
        <h1 className="font-primary text-[32px] text-secondary leading-tight mb-2">
          Dashboard <em className="text-gold not-italic font-semibold">Overview</em>
        </h1>
        <p className="font-secondary text-[14px] text-secondary/60">
          Welcome back to the Kal Furniture admin panel.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white border border-secondary/10 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.highlight ? 'bg-gold/10 text-gold' : 'bg-secondary/5 text-secondary/60'}`}>
                  <Icon className="text-2xl" />
                </div>
              </div>
              <h3 className="font-secondary text-[12px] font-bold tracking-widest uppercase text-secondary/50 mb-1">
                {stat.title}
              </h3>
              <p className="font-primary text-[28px] text-secondary font-medium">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-secondary/10 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="font-primary text-[20px] md:text-[24px] text-secondary">Manage Packages</h2>
          <button onClick={handleAddNew} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gold hover:bg-gold-dark text-primary font-secondary text-[11px] font-bold tracking-widest uppercase rounded-full shadow-[0_4px_20px_rgba(217,182,110,0.3)] transition-all">
            <PiPlus size={16} /> Add Package
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/5 border-b border-secondary/10 font-secondary text-[10px] font-bold tracking-widest uppercase text-secondary/50">
                <th className="py-4 px-6 font-medium">Package Image</th>
                <th className="py-4 px-6 font-medium">Name & Collection</th>
                <th className="py-4 px-6 font-medium">Price</th>
                <th className="py-4 px-6 font-medium">Items</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/5">
              {packages.length > 0 ? (
                packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-secondary/[0.02] transition-colors group">
                    <td className="py-4 px-6">
                      <div className="w-16 h-16 rounded-xl bg-secondary/5 overflow-hidden flex-shrink-0">
                        {pkg.mainImage ? (
                          <img src={pkg.mainImage} alt={pkg.name} className="w-full h-full object-contain mix-blend-multiply p-1" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-secondary/30">No Img</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-primary text-[18px] text-secondary">{pkg.name}</span>
                        <span className="font-secondary text-[11px] text-secondary/50 uppercase tracking-widest">{pkg.collection}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-secondary text-[14px] text-secondary">
                      {(pkg.price || 0).toLocaleString()} ETB
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-secondary text-[12px] bg-secondary/5 px-3 py-1 rounded-full text-secondary/70">
                        {pkg.items?.length || 0} items
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(pkg)} className="p-2 text-secondary/70 lg:text-secondary/50 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors" title="Edit">
                          <PiPencilSimple size={18} />
                        </button>
                        <button onClick={() => handleDelete(pkg.id)} className="p-2 text-secondary/50 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <PiTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-secondary/50 font-secondary text-[14px]">
                    No packages created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col gap-4">
          {packages.length > 0 ? (
            packages.map((pkg) => (
              <div key={pkg.id} className="bg-white border border-secondary/10 rounded-2xl p-4 flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-secondary/5 flex-shrink-0 overflow-hidden">
                  {pkg.mainImage ? (
                    <img src={pkg.mainImage} alt={pkg.name} className="w-full h-full object-contain mix-blend-multiply p-1" />
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
                      <span className="font-secondary text-[13px] font-semibold text-secondary">{(pkg.price || 0).toLocaleString()} ETB</span>
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
            <div className="py-12 text-center text-secondary/50 font-secondary text-[14px]">
              No packages created yet.
            </div>
          )}
        </div>
      </div>

      <PackageFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingPackage}
      />
    </div>
  );
}
