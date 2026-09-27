"use client";

import { useState } from "react";
import { updateEnquiry } from "./actions";
import { User, Tag, FileText, ArrowLeft } from "lucide-react";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };
type Product = { id: string; modelNumber: string; categoryId: string; productName: string | null };
type EnquiryData = {
  id: string;
  notes: string | null;
  productId: string;
  customer: { name: string; mobile: string };
  product: { categoryId: string };
};

export default function EditEnquiryForm({
  enquiry,
  categories,
  products,
}: {
  enquiry: EnquiryData;
  categories: Category[];
  products: Product[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [name, setName] = useState(enquiry.customer.name);
  const [mobile, setMobile] = useState(enquiry.customer.mobile);
  const [categoryId, setCategoryId] = useState(enquiry.product.categoryId);
  const [productId, setProductId] = useState(enquiry.productId);
  const [notes, setNotes] = useState(enquiry.notes || "");

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(val);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || mobile.length !== 10 || !productId) return;
    
    setIsSubmitting(true);
    try {
      const res = await updateEnquiry(enquiry.id, {
        customerName: name,
        mobile,
        productId,
        notes,
      });
      if (res?.success) {
        router.push("/enquiries");
      }
    } catch (err) {
      alert("Failed to update enquiry");
      setIsSubmitting(false);
    }
  };

  const categoryProducts = products.filter((p) => p.categoryId === categoryId);

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/enquiries"
          className="p-2 -ml-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Enquiry</h1>
          <p className="text-sm text-gray-400">Update customer & offering details</p>
        </div>
      </div>

      <form onSubmit={handleUpdate}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Section */}
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
                <input
                  type="tel"
                  placeholder="10-digit number"
                  required
                  value={mobile}
                  onChange={handleMobileChange}
                  className="input"
                />
              </div>

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

          {/* Product & Notes Section */}
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-bg-violet-50 flex items-center justify-center">
                  <Tag size={16} className="text-violet-600" />
                </div>
                <h2 className="font-bold text-gray-900">Offering Interest</h2>
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
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-bg-amber-50 flex items-center justify-center">
                  <FileText size={16} className="text-amber-600" />
                </div>
                <h2 className="font-bold text-gray-900">Notes & Message</h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Notes</label>
                <textarea
                  placeholder="Customer interested in price, exchange offer..."
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input resize-none w-full"
                  style={{ height: "110px" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6 flex justify-end gap-3">
          <Link href="/enquiries" className="btn btn-secondary min-w-[100px]">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !name || mobile.length !== 10 || !productId}
            className="btn btn-primary min-w-[200px]"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </>
            ) : "Update Enquiry"}
          </button>
        </div>
      </form>
    </div>
  );
}
