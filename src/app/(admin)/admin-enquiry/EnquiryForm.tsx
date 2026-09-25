"use client";

import { useState } from "react";
import { lookupCustomer } from "./actions";
import Link from "next/link";
import { CheckCircle2, Search, ArrowLeft, User, Tag, FileText, Send } from "lucide-react";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

type Category = { id: string; name: string; catalogueUrl: string | null };
type Product = { id: string; modelNumber: string; categoryId: string; productName: string | null; pdfUrl: string | null };
type ExistingCustomer = { id: string; name: string; enquiries: any[] } | null;

export default function EnquiryForm({ categories, products }: { categories: Category[], products: Product[] }) {
  const [stage, setStage] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productId, setProductId] = useState("");
  const [notes, setNotes] = useState("");

  // Customer Lookup
  const [existingCustomer, setExistingCustomer] = useState<ExistingCustomer>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Result state
  const [savedData, setSavedData] = useState<any>(null);

  const handleMobileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(val);
    
    if (val.length === 10) {
      setIsLookingUp(true);
      const customer = await lookupCustomer(val);
      if (customer) {
        setExistingCustomer(customer);
        if (!name) setName(customer.name);
      } else {
        setExistingCustomer(null);
      }
      setIsLookingUp(false);
    } else {
      setExistingCustomer(null);
    }
  };

  const handleSaveAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || mobile.length !== 10 || !productId) return;
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: name, mobile, productId, notes }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setSavedData({
          ...data.enquiry,
          whatsappUrl: data.whatsappUrl,
          customerName: name,
          customerMobile: mobile,
          product: products.find(p => p.id === productId),
          category: categories.find(c => c.id === categoryId)
        });
        setStage(2);
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      alert("Failed to save enquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success Screen ─────────────────────────────────────────
  if (stage === 2 && savedData) {
    return (
      <div className="w-full max-w-md mx-auto animate-fade-up">
        <div className="card overflow-hidden">
          {/* Success header */}
          <div className="p-6 text-center" style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Enquiry Saved!</h2>
            <p className="text-emerald-100 text-sm mt-1">Successfully recorded</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Customer */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
              <User size={18} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs section-label mb-1">Customer</p>
                <p className="font-bold text-gray-900">{savedData.customerName}</p>
                <p className="text-sm text-gray-500">+91 {savedData.customerMobile}</p>
              </div>
            </div>

            {/* Product */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
              <Tag size={18} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs section-label mb-1">Product</p>
                <p className="font-bold text-gray-900">{savedData.category?.name}</p>
                <p className="text-sm text-gray-500">{savedData.product?.modelNumber}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              {savedData.category?.catalogueUrl && (
                <a
                  href={savedData.category.catalogueUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary w-full"
                >
                  Open Catalogue
                </a>
              )}
              <a
                href={savedData.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-success w-full"
              >
                <Send size={16} />
                Send on WhatsApp
              </a>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => {
                  setStage(1);
                  setName("");
                  setMobile("");
                  setNotes("");
                  setExistingCustomer(null);
                }}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                ← New Enquiry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categoryProducts = products.filter((p) => p.categoryId === categoryId);

  // ── Form ──────────────────────────────────────────────────
  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">New Enquiry</h1>
          <p className="text-sm text-gray-400">Add customer & product details</p>
        </div>
      </div>

      <form onSubmit={handleSaveAndContinue}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Customer Section ──────────────────────────── */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-bg-indigo-50 flex items-center justify-center">
                <User size={16} className="text-indigo-600" />
              </div>
              <h2 className="font-bold text-gray-900">Customer</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mobile Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="10-digit number"
                    required
                    value={mobile}
                    onChange={handleMobileChange}
                    className="input"
                  />
                  {isLookingUp && (
                    <div className="absolute right-3 top-3">
                      <Search size={18} className="text-gray-400 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>

              {existingCustomer && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <CheckCircle2 size={17} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Existing customer</p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      {existingCustomer.name}
                      {existingCustomer.enquiries.length > 0 &&
                        ` · Last: ${existingCustomer.enquiries[0].product.modelNumber}`
                      }
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Customer Name</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* ── Product & Notes Section ───────────────────── */}
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-bg-violet-50 flex items-center justify-center">
                  <Tag size={16} className="text-violet-600" />
                </div>
                <h2 className="font-bold text-gray-900">Product Interest</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                  <CustomDropdown
                    value={categoryId}
                    onChange={(val: string) => {
                      setCategoryId(val);
                      setProductId("");
                    }}
                    options={categories.map(c => ({ value: c.id, label: c.name }))}
                    placeholder="Select Category"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Model</label>
                  <CustomDropdown
                    value={productId}
                    onChange={(val: string) => setProductId(val)}
                    options={categoryProducts.map(p => ({
                      value: p.id,
                      label: `${p.modelNumber} ${p.productName ? `(${p.productName})` : ""}`
                    }))}
                    placeholder="Select Model"
                    disabled={!categoryId}
                  />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-bg-amber-50 flex items-center justify-center">
                  <FileText size={16} className="text-amber-600" />
                </div>
                <h2 className="font-bold text-gray-900">Notes</h2>
              </div>
              <textarea
                placeholder="Customer interested in price, exchange offer..."
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input resize-none"
                style={{ height: "110px" }}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !name || mobile.length !== 10 || !productId}
            className="btn btn-primary min-w-[200px]"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : "Save & Continue →"}
          </button>
        </div>
      </form>
    </div>
  );
}

