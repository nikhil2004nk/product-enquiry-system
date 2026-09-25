import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { createCategory, createProduct, toggleProductStatus } from "./actions";
import { ArrowLeft, PlusCircle, Tag, Package } from "lucide-react";
import { CategoryDropdown } from "./CategoryDropdown";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const categories = await prisma.category.findMany({
    include: { products: { orderBy: { modelNumber: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-up">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-7">
        <Link
          href="/dashboard"
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Products</h1>
          <p className="text-sm text-gray-400">Add categories and models</p>
        </div>
      </div>

      {/* ── Add Category ─────────────────────────────────── */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
            <Tag size={16} className="text-violet-600" />
          </div>
          <h2 className="font-bold text-gray-900">Add New Category</h2>
        </div>
        <form
          action={async (formData) => { "use server"; await createCategory(formData); }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            name="name"
            placeholder="Category name (e.g. OLED TV)"
            required
            className="input flex-1"
          />
          <input
            type="url"
            name="catalogueUrl"
            placeholder="Catalogue URL (Optional)"
            className="input flex-1"
          />
          <button type="submit" className="btn btn-primary shrink-0">
            <PlusCircle size={16} /> Add
          </button>
        </form>
      </div>

      {/* ── Add Model ────────────────────────────────────── */}
      <div className="card p-6 mb-8">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Package size={16} className="text-indigo-600" />
          </div>
          <h2 className="font-bold text-gray-900">Add New Model</h2>
        </div>
        <form
          action={async (formData) => { "use server"; await createProduct(formData); }}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <CategoryDropdown categories={categories} />
            <input
              type="text"
              name="modelNumber"
              placeholder="Model # (e.g. 55C3)"
              required
              className="input flex-1"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              name="productName"
              placeholder="Marketing Name (Optional)"
              className="input flex-1"
            />
            <input
              type="url"
              name="pdfUrl"
              placeholder="PDF URL (Optional)"
              className="input flex-1"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary">
              <PlusCircle size={16} /> Add Model
            </button>
          </div>
        </form>
      </div>

      {/* ── Categories & Products List ────────────────────── */}
      <p className="section-label mb-3">All Categories</p>
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Tag size={13} className="text-violet-600" />
                </div>
                <h3 className="font-bold text-gray-900">{category.name}</h3>
              </div>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                {category.products.length} model{category.products.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="p-4">
              {category.products.length === 0 ? (
                <p className="text-sm text-gray-400 py-2 px-2">No models yet. Add one above.</p>
              ) : (
                <div className="space-y-2">
                  {category.products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{product.modelNumber}</p>
                        {product.productName && (
                          <p className="text-xs text-gray-400 mt-0.5">{product.productName}</p>
                        )}
                      </div>
                      <form
                        action={async () => {
                          "use server";
                          await toggleProductStatus(product.id, product.active);
                        }}
                      >
                        <button
                          type="submit"
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                            product.active
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          {product.active ? "● Active" : "○ Inactive"}
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

