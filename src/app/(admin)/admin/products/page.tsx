import { prisma } from "@/lib/prisma";
import ProductManager from "./ProductManager";

import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const userId = session.id;
  const isSuper = session.role === "SUPERADMIN";

  const categories = await prisma.category.findMany({
    where: { ...(isSuper ? {} : { userId }) },
    include: { products: { orderBy: { modelNumber: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-up">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Catalog</h1>
          <p className="text-sm text-gray-400">Add, edit, and manage products and categories</p>
        </div>
      </div>

      <ProductManager categories={categories} />
    </div>
  );
}

