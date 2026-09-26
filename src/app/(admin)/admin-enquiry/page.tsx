import { prisma } from "@/lib/prisma";
import EnquiryForm from "./EnquiryForm";
import { getSession } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function EnquiryPage() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { modelNumber: "asc" },
  });

  const session = await getSession();
  const cookieStore = await cookies();
  const filterAdminId = cookieStore.get("admin_filter_id")?.value;
  const userId = session?.role === "SUPERADMIN" && filterAdminId ? filterAdminId : session?.id;

  const allTemplates = await (prisma as any).messageTemplate.findMany({
    where: {
      OR: [
        { userId },
        { userId: null }
      ]
    },
    orderBy: { createdAt: "asc" },
  });

  const templates = [
    ...allTemplates.filter((t: any) => t.userId === userId),
    ...allTemplates.filter((t: any) => t.userId === null)
  ];

  return <EnquiryForm categories={categories} products={products} templates={templates} />;
}
