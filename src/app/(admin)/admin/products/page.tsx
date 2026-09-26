import { prisma } from "@/lib/prisma";
import ProductManager from "./ProductManager";

import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const userId = session.id;
  const isSuper = session.role === "SUPERADMIN";

  const cookieStore = await cookies();
  const filterAdminId = cookieStore.get("admin_filter_id")?.value || "";
  
  const userCondition = isSuper ? (filterAdminId ? { userId: filterAdminId } : {}) : { userId };

  const categories = await prisma.category.findMany({
    where: userCondition,
    include: { products: { orderBy: { modelNumber: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-up">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Catalog</h1>
          <p className="text-sm text-gray-400">Add, edit, and manage products and categories</p>
        </div>
      </div>

      <ProductManager categories={categories} isSuper={isSuper} />
    </div>
  );
}

