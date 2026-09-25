import { prisma } from "@/lib/prisma";
import EnquiryForm from "./EnquiryForm";

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

  return <EnquiryForm categories={categories} products={products} />;
}
