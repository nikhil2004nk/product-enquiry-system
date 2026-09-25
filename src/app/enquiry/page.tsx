import { prisma } from "@/lib/prisma";
import PublicEnquiryForm from "./PublicEnquiryForm";
import { Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PublicEnquiryPage() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { modelNumber: "asc" },
  });

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg"
            style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
          >
            <Zap size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Store Enquiry</h1>
          <p className="text-sm text-gray-400 mt-1">Fill in your details and we'll get back to you shortly</p>
        </div>

        {/* Form Card */}
        <div className="card p-6 md:p-8">
          <PublicEnquiryForm categories={categories} products={products} />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">Your information is safe with us.</p>
      </div>
    </main>
  );
}
