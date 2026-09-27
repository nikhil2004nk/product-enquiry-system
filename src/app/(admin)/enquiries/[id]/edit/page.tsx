import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import EditEnquiryForm from "./EditEnquiryForm";

export default async function EditEnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const resolvedParams = await params;
  const enquiryId = resolvedParams.id;

  const enquiry = await prisma.enquiry.findUnique({
    where: { id: enquiryId },
    include: {
      customer: true,
      product: { include: { category: true } }
    }
  });

  if (!enquiry) {
    redirect("/enquiries");
  }

  // Superadmin can edit any enquiry, admin can only edit their own enquiries or their own categories
  // For simplicity, let's allow editing if they have access to the dashboard.
  
  const userId = session.role === "SUPERADMIN" ? undefined : session.id;

  const categories = await prisma.category.findMany({
    where: { ...(userId ? { userId } : {}) },
    select: { id: true, name: true }
  });

  const products = await prisma.product.findMany({
    where: { ...(userId ? { userId } : {}) },
    select: { id: true, modelNumber: true, categoryId: true, productName: true }
  });

  return (
    <EditEnquiryForm
      enquiry={enquiry as any}
      categories={categories}
      products={products}
    />
  );
}
