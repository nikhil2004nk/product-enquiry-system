"use client";

import { useState } from "react";
import { CheckCircle2, User, Tag, FileText } from "lucide-react";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

type Category = { id: string; name: string; catalogueUrl: string | null };
type Product = { id: string; modelNumber: string; categoryId: string; productName: string | null; pdfUrl: string | null };

export default function PublicEnquiryForm({ categories, products }: { categories: Category[], products: Product[] }) {
  const [stage, setStage] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productId, setProductId] = useState("");
  const [notes, setNotes] = useState("");

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        setStage(2);
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      alert("Failed to submit enquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success Screen ───────────────────────────────────────
  if (stage === 2) {
    return (
      <div className="text-center py-8 animate-fade-up">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enquiry Submitted!</h2>
        <p className="text-gray-500 mb-8 leading-relaxed max-w-sm mx-auto">
          Thank you, <strong>{name}</strong>. Our team will review your enquiry and get back to you on{" "}
          <strong>+91 {mobile}</strong> very soon.
        </p>
        <button
          onClick={() => {
            setStage(1);
            setName("");
            setMobile("");
            setNotes("");
            setCategoryId("");
            setProductId("");
          }}
          className="btn btn-primary"
        >
          Submit Another Enquiry
        </button>
      </div>
    );
  }

  const categoryProducts = products.filter((p) => p.categoryId === categoryId);

  // ── Form ─────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-up">
      {/* Customer Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <User size={15} className="text-indigo-600" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Details</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mobile Number</label>
          <input
            type="tel"
            placeholder="10-digit mobile number"
            required
            value={mobile}
            onChange={handleMobileChange}
            className="input"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
          <input
            type="text"
            placeholder="Your full name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Product Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Tag size={15} className="text-violet-600" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Service / Product of Interest</p>
        </div>

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
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Option / Item</label>
          <CustomDropdown
            value={productId}
            onChange={(val: string) => setProductId(val)}
            options={categoryProducts.map(p => ({
              value: p.id,
              label: `${p.modelNumber} ${p.productName ? `(${p.productName})` : ""}`
            }))}
            placeholder="Select Option"
            disabled={!categoryId}
          />
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Notes */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText size={15} className="text-amber-600" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Additional Notes (Optional)</p>
        </div>
        <textarea
          placeholder="Any specific requirements, price query, exchange offer..."
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input resize-none"
          style={{ height: "100px" }}
        />
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !name || mobile.length !== 10 || !productId}
          className="btn btn-primary w-full"
          style={{ padding: "14px 24px", fontSize: "15px" }}
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </>
          ) : "Submit Enquiry"}
        </button>
      </div>
    </form>
  );
}
