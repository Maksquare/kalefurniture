"use client";

import { useState } from "react";
import { useProducts } from "@/context/ProductContext";
import { PiPlus, PiPencilSimple, PiTrash, PiMagnifyingGlassLight } from "react-icons/pi";
import ProductFormModal from "@/components/admin/ProductFormModal";

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct, isLoaded } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  if (!isLoaded) return <div className="p-10 font-secondary text-secondary/60">Loading Products...</div>;

  const filteredProducts = products.filter(p => 
    (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
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

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-10">
        <div>
          <h1 className="font-primary text-[32px] text-secondary leading-tight mb-2">
            Manage <em className="text-gold not-italic font-semibold">Products</em>
          </h1>
          <p className="font-secondary text-[14px] text-secondary/60">
            Add, update, or remove products from your catalog.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <div className="relative group w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary/40">
              <PiMagnifyingGlassLight size={18} />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-[250px] bg-white border border-secondary/20 text-secondary font-secondary text-[13px] rounded-full py-2.5 pl-11 pr-4 focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gold hover:bg-gold-dark text-primary font-secondary text-[11px] font-bold tracking-widest uppercase rounded-full shadow-[0_4px_20px_rgba(217,182,110,0.3)] transition-all whitespace-nowrap"
          >
            <PiPlus size={16} />
            Add Product
          </button>
        </div>
      </header>

      {/* Table & Cards Container */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-secondary/10 shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/5 border-b border-secondary/10 font-secondary text-[10px] font-bold tracking-widest uppercase text-secondary/50">
                <th className="py-5 px-6 font-medium">Product</th>
                <th className="py-5 px-6 font-medium">Category</th>
                <th className="py-5 px-6 font-medium">Price</th>
                <th className="py-5 px-6 font-medium">Status</th>
                <th className="py-5 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/5">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-secondary/[0.02] transition-colors group">
                    <td className="py-4 px-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary/5 overflow-hidden flex-shrink-0">
                        <img 
                          src={product.images[0] || '/assets/img/hero/green-chair.jpeg'} 
                          alt={product.name}
                          className="w-full h-full object-contain mix-blend-multiply p-1"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-primary text-[18px] text-secondary">{product.name}</span>
                        <span className="font-secondary text-[11px] text-secondary/50 truncate max-w-[200px]">{product.id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-secondary text-[12px] bg-secondary/5 px-3 py-1 rounded-full text-secondary/70">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-secondary text-[14px] text-secondary">
                      {(product.price || 0).toLocaleString()} ETB
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        {product.bestSeller && <span className="w-2 h-2 rounded-full bg-gold" title="Best Seller"></span>}
                        {product.isNew && <span className="w-2 h-2 rounded-full bg-primary" title="New Arrival"></span>}
                        {!product.bestSeller && !product.isNew && <span className="w-2 h-2 rounded-full bg-secondary/20" title="Standard"></span>}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-secondary/70 lg:text-secondary/50 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <PiPencilSimple size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-secondary/50 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <PiTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-secondary/50 font-secondary text-[14px]">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="bg-white border border-secondary/10 rounded-2xl p-4 flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-secondary/5 flex-shrink-0 overflow-hidden relative">
                  <img 
                    src={product.images[0] || '/assets/img/hero/green-chair.jpeg'} 
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply p-1"
                  />
                  <div className="absolute top-1 left-1 flex gap-1">
                    {product.bestSeller && <span className="w-2 h-2 rounded-full bg-gold" title="Best Seller"></span>}
                    {product.isNew && <span className="w-2 h-2 rounded-full bg-primary" title="New Arrival"></span>}
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-primary text-[16px] text-secondary leading-tight line-clamp-1">{product.name}</h3>
                    <p className="font-secondary text-[10px] text-secondary/50 uppercase tracking-widest mt-1 bg-secondary/5 inline-block px-2 py-0.5 rounded-full">{product.category}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-secondary text-[13px] font-semibold text-secondary">{(product.price || 0).toLocaleString()} ETB</span>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(product)} className="p-2 text-secondary/70 hover:text-gold bg-secondary/5 rounded-lg">
                        <PiPencilSimple size={16} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500/70 hover:text-red-500 bg-red-500/5 rounded-lg">
                        <PiTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-secondary/50 font-secondary text-[14px]">
              No products found matching your search.
            </div>
          )}
        </div>
      </div>

      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingProduct}
      />
    </div>
  );
}
