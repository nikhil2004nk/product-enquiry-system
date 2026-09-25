"use client";

import { useState, useTransition } from "react";
import { createCategory, editCategory, deleteCategory, createProduct, editProduct, deleteProduct, toggleProductStatus } from "./actions";
import { PlusCircle, Tag, Package, Edit2, Trash2, X, Check, Eye } from "lucide-react";

type Product = {
  id: string;
  categoryId: string;
  modelNumber: string;
  productName: string | null;
  pdfUrl: string | null;
  active: boolean;
};

type Category = {
  id: string;
  name: string;
  catalogueUrl: string | null;
  products: Product[];
};

export default function ProductManager({ categories }: { categories: Category[] }) {
  const [tab, setTab] = useState<"categories" | "products">("products");
  const [isPending, startTransition] = useTransition();

  // Category Edit State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryUrl, setCategoryUrl] = useState("");

  // Product Edit State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productModel, setProductModel] = useState("");
  const [productName, setProductName] = useState("");
  const [productPdf, setProductPdf] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");

  // Create forms visibility
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Handlers for Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.set("name", categoryName);
    data.set("catalogueUrl", categoryUrl);
    startTransition(async () => {
      if (editingCategory) {
        const res = await editCategory(editingCategory.id, data);
        if (res.error) alert(res.error);
        else setEditingCategory(null);
      } else {
        const res = await createCategory(data);
        if (res.error) alert(res.error);
        else {
          setShowAddCategory(false);
          setCategoryName("");
          setCategoryUrl("");
        }
      }
    });
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("Delete this category?")) {
      startTransition(async () => {
        const res = await deleteCategory(id);
        if (res.error) alert(res.error);
      });
    }
  };

  // Handlers for Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.set("modelNumber", productModel);
    data.set("productName", productName);
    data.set("pdfUrl", productPdf);
    data.set("categoryId", productCategoryId);
    
    startTransition(async () => {
      if (editingProduct) {
        const res = await editProduct(editingProduct.id, data);
        if (res.error) alert(res.error);
        else setEditingProduct(null);
      } else {
        const res = await createProduct(data);
        if (res.error) alert(res.error);
        else {
          setShowAddProduct(false);
          setProductModel("");
          setProductName("");
          setProductPdf("");
          setProductCategoryId("");
        }
      }
    });
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Delete this product?")) {
      startTransition(async () => {
        const res = await deleteProduct(id);
        if (res.error) alert(res.error);
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-px">
        <button
          onClick={() => setTab("products")}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            tab === "products" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Manage Products
        </button>
        <button
          onClick={() => setTab("categories")}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            tab === "categories" ? "border-violet-600 text-violet-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          All Categories
        </button>
      </div>

      {/* ── PRODUCTS TAB ────────────────────────────────────────── */}
      {tab === "products" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Products ({categories.reduce((acc, c) => acc + c.products.length, 0)})</h2>
            {!showAddProduct && (
              <button onClick={() => { setShowAddProduct(true); setEditingProduct(null); setProductCategoryId(categories[0]?.id || ""); }} className="btn btn-primary btn-sm">
                <PlusCircle size={16} /> Add Product
              </button>
            )}
          </div>

          {(showAddProduct || editingProduct) && (
            <div className="card p-5 border border-indigo-200 bg-indigo-50/30">
              <h3 className="font-bold text-gray-900 mb-4">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
              <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Category</label>
                    <select
                      required
                      value={productCategoryId}
                      onChange={e => setProductCategoryId(e.target.value)}
                      className="input w-full bg-white"
                    >
                      <option value="" disabled>Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Model Number</label>
                    <input type="text" required value={productModel} onChange={e => setProductModel(e.target.value)} className="input w-full bg-white" placeholder="e.g. 55C3" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Marketing Name (Optional)</label>
                    <input type="text" value={productName} onChange={e => setProductName(e.target.value)} className="input w-full bg-white" placeholder="e.g. OLED Evo" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">PDF URL (Optional)</label>
                    <input type="url" value={productPdf} onChange={e => setProductPdf(e.target.value)} className="input w-full bg-white" placeholder="https://..." />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => { setShowAddProduct(false); setEditingProduct(null); }} className="btn bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={isPending} className="btn btn-primary">{isPending ? "Saving..." : "Save Product"}</button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {categories.map(category => category.products.length > 0 && (
              <div key={category.id} className="card overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center gap-2">
                  <Tag size={14} className="text-gray-400" />
                  <span className="font-bold text-gray-700 text-sm">{category.name}</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {category.products.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                          <Package size={14} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            {product.modelNumber}
                            {!product.active && <span className="text-[10px] uppercase tracking-wider font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Inactive</span>}
                          </p>
                          {product.productName && <p className="text-xs text-gray-500 mt-0.5">{product.productName}</p>}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0 ml-4">
                        <button
                          onClick={() => {
                            startTransition(() => {
                              toggleProductStatus(product.id, product.active);
                            });
                          }}
                          className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors ${
                            product.active ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100" : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                          }`}
                        >
                          {product.active ? "Active" : "Activate"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setProductModel(product.modelNumber);
                            setProductName(product.productName || "");
                            setProductPdf(product.pdfUrl || "");
                            setProductCategoryId(product.categoryId);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {categories.every(c => c.products.length === 0) && !showAddProduct && (
              <div className="text-center p-8 text-gray-500 card">No products found. Add your first model!</div>
            )}
          </div>
        </div>
      )}

      {/* ── CATEGORIES TAB ──────────────────────────────────────── */}
      {tab === "categories" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Categories ({categories.length})</h2>
            {!showAddCategory && (
              <button onClick={() => { setShowAddCategory(true); setEditingCategory(null); }} className="btn btn-primary btn-sm bg-violet-600 hover:bg-violet-700">
                <PlusCircle size={16} /> Add Category
              </button>
            )}
          </div>

          {(showAddCategory || editingCategory) && (
            <div className="card p-5 border border-violet-200 bg-violet-50/30">
              <h3 className="font-bold text-gray-900 mb-4">{editingCategory ? "Edit Category" : "Add New Category"}</h3>
              <form onSubmit={handleSaveCategory} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Category Name</label>
                    <input type="text" required value={categoryName} onChange={e => setCategoryName(e.target.value)} className="input w-full bg-white" placeholder="e.g. OLED TV" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Catalogue URL (Optional)</label>
                    <input type="url" value={categoryUrl} onChange={e => setCategoryUrl(e.target.value)} className="input w-full bg-white" placeholder="https://..." />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => { setShowAddCategory(false); setEditingCategory(null); }} className="btn bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={isPending} className="btn btn-primary bg-violet-600 hover:bg-violet-700">{isPending ? "Saving..." : "Save Category"}</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(category => (
              <div key={category.id} className="card p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                        <Tag size={14} className="text-violet-600" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-base">{category.name}</h3>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setCategoryName(category.name);
                          setCategoryUrl(category.catalogueUrl || "");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 pl-10">
                    {category.products.length} product{category.products.length !== 1 ? "s" : ""}
                  </p>
                </div>
                {category.catalogueUrl && (
                  <div className="mt-4 pt-3 border-t border-gray-100 pl-10">
                    <a href={category.catalogueUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1">
                      <Eye size={12} /> View Catalogue
                    </a>
                  </div>
                )}
              </div>
            ))}
            {categories.length === 0 && !showAddCategory && (
              <div className="col-span-full text-center p-8 text-gray-500 card">No categories found. Create one first!</div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
