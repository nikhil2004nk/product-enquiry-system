"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { createCategory, editCategory, deleteCategory, createProduct, editProduct, deleteProduct, toggleProductStatus, bulkImportProducts, bulkDeleteProducts, bulkDeleteCategories } from "./actions";
import { PlusCircle, Tag, Package, Edit2, Trash2, X, Check, Eye, Download, Upload, CheckSquare, AlertTriangle } from "lucide-react";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import * as XLSX from "xlsx";

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

export default function ProductManager({ categories, isSuper = false }: { categories: Category[], isSuper?: boolean }) {
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

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Bulk selection state
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  // Custom Notifications & Modals
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: "", type: "success" });
  const [confirmModal, setConfirmModal] = useState<{ show: boolean, message: string, onConfirm: () => void }>({ show: false, message: "", onConfirm: () => {} });

  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handlers for Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.set("name", categoryName);
    data.set("catalogueUrl", categoryUrl);
    startTransition(async () => {
      if (editingCategory) {
        const res = await editCategory(editingCategory.id, data);
        if (res.error) showToast(res.error, "error");
        else {
          showToast("Category updated successfully", "success");
          setEditingCategory(null);
        }
      } else {
        const res = await createCategory(data);
        if (res.error) showToast(res.error, "error");
        else {
          showToast("Category created successfully", "success");
          setShowAddCategory(false);
          setCategoryName("");
          setCategoryUrl("");
        }
      }
    });
  };

  const handleDeleteCategory = (id: string) => {
    setConfirmModal({
      show: true,
      message: "Are you sure you want to delete this category?",
      onConfirm: () => {
        startTransition(async () => {
          const res = await deleteCategory(id);
          if (res.error) showToast(res.error, "error");
          else {
            showToast("Category deleted", "success");
            setSelectedCategories(prev => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
          }
        });
      }
    });
  };

  const handleBulkDeleteCategories = () => {
    if (selectedCategories.size === 0) return;
    setConfirmModal({
      show: true,
      message: `Are you sure you want to delete ${selectedCategories.size} selected categories?`,
      onConfirm: () => {
        startTransition(async () => {
          const res = await bulkDeleteCategories(Array.from(selectedCategories));
          if (res.error) showToast(res.error, "error");
          else {
            showToast(`${selectedCategories.size} categories deleted`, "success");
            setSelectedCategories(new Set());
          }
        });
      }
    });
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
        if (res.error) showToast(res.error, "error");
        else {
          showToast("Product updated successfully", "success");
          setEditingProduct(null);
        }
      } else {
        const res = await createProduct(data);
        if (res.error) showToast(res.error, "error");
        else {
          showToast("Product created successfully", "success");
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
    setConfirmModal({
      show: true,
      message: "Are you sure you want to delete this product?",
      onConfirm: () => {
        startTransition(async () => {
          const res = await deleteProduct(id);
          if (res.error) showToast(res.error, "error");
          else {
            showToast("Product deleted", "success");
            setSelectedProducts(prev => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
          }
        });
      }
    });
  };

  const handleBulkDeleteProducts = () => {
    if (selectedProducts.size === 0) return;
    setConfirmModal({
      show: true,
      message: `Are you sure you want to delete ${selectedProducts.size} selected items?`,
      onConfirm: () => {
        startTransition(async () => {
          const res = await bulkDeleteProducts(Array.from(selectedProducts));
          if (res.error) showToast(res.error, "error");
          else {
            showToast(`${selectedProducts.size} products deleted`, "success");
            setSelectedProducts(new Set());
          }
        });
      }
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = categories.flatMap(c => 
      c.products.map(p => ({
        Category: c.name,
        "Item Code": p.modelNumber,
        "Item Name": p.productName || "",
        "PDF URL": p.pdfUrl || "",
        Status: p.active ? "Active" : "Inactive"
      }))
    );
    
    if (data.length === 0) {
      showToast("No items to export.", "error");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Catalog Items");
    XLSX.writeFile(wb, "catalog.xlsx");
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        Category: "Services",
        "Item Code": "SVC-001",
        "Item Name": "Premium Consultation",
        "PDF URL": "https://example.com/details.pdf",
        Status: "Active"
      },
      {
        Category: "Products",
        "Item Code": "PRD-001",
        "Item Name": "Starter Kit",
        "PDF URL": "",
        Status: "Inactive"
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    
    // Set column widths for better readability
    ws['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 40 }, { wch: 10 }];

    XLSX.writeFile(wb, "catalog_template.xlsx");
  };

  const processExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const parsedData = data.map((row: any) => ({
          categoryName: row["Category"]?.toString().trim() || "Uncategorized",
          modelNumber: (row["Item Code"] || row["Model Number"])?.toString().trim(),
          productName: (row["Item Name"] || row["Product Name"])?.toString().trim() || null,
          pdfUrl: row["PDF URL"]?.toString().trim() || null,
          active: row["Status"] !== "Inactive"
        })).filter((item: any) => item.modelNumber);

        if (parsedData.length === 0) {
          showToast("No valid items found in Excel file. Ensure it has an 'Item Code' column.", "error");
          return;
        }

        startTransition(async () => {
          const res = await bulkImportProducts(parsedData);
          if (res.error) showToast(res.error, "error");
          else {
            showToast(`Successfully imported ${res.count} items!`, "success");
            setShowImportModal(false);
          }
          if (fileInputRef.current) fileInputRef.current.value = "";
        });
      } catch (err) {
        showToast("Error parsing Excel file. Ensure it matches the export format.", "error");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processExcelFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processExcelFile(file);
  };


  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-px">
        <button
          onClick={() => { setTab("products"); setSelectedCategories(new Set()); }}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            tab === "products" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Manage Catalog Items
        </button>
        <button
          onClick={() => { setTab("categories"); setSelectedProducts(new Set()); }}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            tab === "categories" ? "border-violet-600 text-violet-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          All Categories
        </button>
      </div>

      {/* ── PRODUCTS TAB ────────────────────────────────────────── */}
      {tab === "products" && (() => {
        const allProductIds = categories.flatMap(c => c.products.map(p => p.id));
        const allSelected = allProductIds.length > 0 && selectedProducts.size === allProductIds.length;
        const someSelected = selectedProducts.size > 0 && selectedProducts.size < allProductIds.length;

        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-gray-900">Catalog Items ({allProductIds.length})</h2>
                {isSuper && allProductIds.length > 0 && (
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                      checked={allSelected}
                      ref={el => { if (el) el.indeterminate = someSelected; }}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedProducts(new Set(allProductIds));
                        else setSelectedProducts(new Set());
                      }}
                    />
                    Select All
                  </label>
                )}
              </div>
              <div className="flex items-center gap-2">
              {isSuper && selectedProducts.size > 0 && (
                <button onClick={handleBulkDeleteProducts} disabled={isPending} className="btn btn-danger btn-sm font-semibold flex gap-1.5 items-center">
                  <Trash2 size={14} /> Delete Selected ({selectedProducts.size})
                </button>
              )}
              <button onClick={handleExport} className="btn bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 btn-sm font-semibold flex gap-1.5 items-center">
                <Download size={14} /> Export
              </button>
              <button onClick={() => setShowImportModal(true)} className="btn bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 btn-sm font-semibold flex gap-1.5 items-center">
                <Upload size={14} /> Import
              </button>
              {!showAddProduct && (
                <button onClick={() => { setShowAddProduct(true); setEditingProduct(null); setProductCategoryId(categories[0]?.id || ""); }} className="btn btn-primary btn-sm ml-2">
                  <PlusCircle size={16} /> Add Item
                </button>
              )}
            </div>
          </div>

          {(showAddProduct || editingProduct) && (
            <div className="card p-5 border border-indigo-200 bg-indigo-50/30">
              <h3 className="font-bold text-gray-900 mb-4">{editingProduct ? "Edit Item" : "Add New Item"}</h3>
              <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Category</label>
                    <CustomDropdown
                      value={productCategoryId}
                      onChange={(val) => setProductCategoryId(val)}
                      options={categories.map(c => ({ value: c.id, label: c.name }))}
                      placeholder="Select Category"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Item Code / Reference</label>
                    <input type="text" required value={productModel} onChange={e => setProductModel(e.target.value)} className="input w-full bg-white" placeholder="e.g. 55C3" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Item Name / Title (Optional)</label>
                    <input type="text" value={productName} onChange={e => setProductName(e.target.value)} className="input w-full bg-white" placeholder="e.g. OLED Evo" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">PDF URL (Optional)</label>
                    <input type="url" value={productPdf} onChange={e => setProductPdf(e.target.value)} className="input w-full bg-white" placeholder="https://..." />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => { setShowAddProduct(false); setEditingProduct(null); }} className="btn bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={isPending} className="btn btn-primary">{isPending ? "Saving..." : "Save Item"}</button>
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
                    <div key={product.id} className={`flex items-center justify-between p-4 transition-colors ${isSuper && selectedProducts.has(product.id) ? 'bg-indigo-50/50' : 'hover:bg-gray-50/50'}`}>
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        {isSuper && (
                          <div className="flex items-center h-full mr-1">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                              checked={selectedProducts.has(product.id)}
                              onChange={(e) => {
                                setSelectedProducts(prev => {
                                  const next = new Set(prev);
                                  if (e.target.checked) next.add(product.id);
                                  else next.delete(product.id);
                                  return next;
                                });
                              }}
                            />
                          </div>
                        )}
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
              <div className="text-center p-8 text-gray-500 card">No items found. Add your first item!</div>
            )}
          </div>
        </div>
        );
      })()}

      {/* ── CATEGORIES TAB ──────────────────────────────────────── */}
      {tab === "categories" && (() => {
        const allCategoryIds = categories.map(c => c.id);
        const allSelected = allCategoryIds.length > 0 && selectedCategories.size === allCategoryIds.length;
        const someSelected = selectedCategories.size > 0 && selectedCategories.size < allCategoryIds.length;

        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-gray-900">Categories ({categories.length})</h2>
                {isSuper && categories.length > 0 && (
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-600 cursor-pointer"
                      checked={allSelected}
                      ref={el => { if (el) el.indeterminate = someSelected; }}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedCategories(new Set(allCategoryIds));
                        else setSelectedCategories(new Set());
                      }}
                    />
                    Select All
                  </label>
                )}
              </div>
              <div className="flex items-center gap-2">
              {isSuper && selectedCategories.size > 0 && (
                <button onClick={handleBulkDeleteCategories} disabled={isPending} className="btn btn-danger btn-sm font-semibold flex gap-1.5 items-center">
                  <Trash2 size={14} /> Delete Selected ({selectedCategories.size})
                </button>
              )}
              {!showAddCategory && (
                <button onClick={() => { setShowAddCategory(true); setEditingCategory(null); }} className="btn btn-primary btn-sm bg-violet-600 hover:bg-violet-700">
                  <PlusCircle size={16} /> Add Category
                </button>
              )}
            </div>
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
              <div key={category.id} className={`card p-5 flex flex-col justify-between transition-colors ${isSuper && selectedCategories.has(category.id) ? 'ring-2 ring-violet-500 bg-violet-50/30' : ''}`}>
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      {isSuper && (
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-600 cursor-pointer"
                          checked={selectedCategories.has(category.id)}
                          onChange={(e) => {
                            setSelectedCategories(prev => {
                              const next = new Set(prev);
                              if (e.target.checked) next.add(category.id);
                              else next.delete(category.id);
                              return next;
                            });
                          }}
                        />
                      )}
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
        );
      })()}

      {/* Import Modal */}
      {showImportModal && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in" style={{ position: "fixed" }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[95vh] flex flex-col relative">
            <button onClick={() => setShowImportModal(false)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors z-10">
              <X size={18} />
            </button>
            <div className="p-6 overflow-y-auto flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2 pr-6">Import Catalog</h2>
              <p className="text-sm text-gray-500 mb-5">Upload an Excel file (.xlsx) to bulk create or update your catalog items.</p>
              
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors ${isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-400 hover:bg-gray-50"}`}
              >
                <Upload size={28} className={`mb-2 ${isDragging ? "text-indigo-600" : "text-gray-400"}`} />
                <p className="text-sm font-medium text-gray-700 mb-1">Drag and drop your Excel file here</p>
                <p className="text-xs text-gray-400 mb-3">or click to browse from your computer</p>
                <label className="btn bg-indigo-600 hover:bg-indigo-700 text-white btn-sm cursor-pointer shadow-sm relative overflow-hidden">
                  Browse Files
                  <input type="file" accept=".xlsx,.xls" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" ref={fileInputRef} onChange={handleImport} />
                </label>
              </div>

              <div className="mt-5 flex flex-col items-center border-t border-gray-100 pt-5">
                <p className="text-sm text-gray-600 mb-2">Need a template to get started?</p>
                <button onClick={handleDownloadTemplate} className="btn bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 btn-sm shadow-sm flex items-center gap-2">
                  <Download size={16} className="text-gray-400" /> Download Excel Template
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Custom Toast Notification */}
      {mounted && createPortal(
        <div className={`fixed top-4 right-4 z-[200] max-w-sm w-full transition-all duration-300 transform ${toast.show ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"}`}>
          <div className={`flex items-center gap-3 p-4 rounded-xl shadow-xl border ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {toast.type === 'success' ? <Check size={20} className="text-emerald-600" /> : <AlertTriangle size={20} className="text-red-600" />}
            <p className="text-sm font-semibold flex-1">{toast.message}</p>
            <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className={`p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity ${toast.type === 'success' ? 'hover:bg-emerald-200' : 'hover:bg-red-200'}`}>
              <X size={16} />
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal.show && mounted && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Action</h3>
              <p className="text-sm text-gray-500">{confirmModal.message}</p>
            </div>
            <div className="flex border-t border-gray-100 bg-gray-50/50">
              <button 
                onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))} 
                className="flex-1 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors border-r border-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, show: false }));
                }} 
                className="flex-1 py-3.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
