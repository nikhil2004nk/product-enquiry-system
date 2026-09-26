import { prisma } from "@/lib/prisma";
import PublicEnquiryForm from "./PublicEnquiryForm";
import { Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PublicEnquiryPage(props: { params: Promise<{ adminId?: string[] }> }) {
  const params = await props.params;
  const adminId = params.adminId?.[0] || undefined;

  // If adminId given, load only that admin's products/categories; else load all
  const categories = await prisma.category.findMany({
    where: {
      active: true,
      ...(adminId ? { userId: adminId } : {}),
    },
    orderBy: { name: "asc" },
  });

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(adminId ? { userId: adminId } : {}),
    },
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">New Enquiry</h1>
          <p className="text-sm text-gray-400 mt-1">Fill in your details and we&apos;ll get back to you shortly</p>
        </div>

        {/* Form Card */}
        <div className="card p-6 md:p-8">
          <PublicEnquiryForm categories={categories} products={products} adminId={adminId} />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">Your information is safe with us.</p>
      </div>
    </main>
  );
}
