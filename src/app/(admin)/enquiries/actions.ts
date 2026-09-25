"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateEnquiryStatus(enquiryId: string, newStatus: string) {
  try {
    await prisma.enquiry.update({
      where: { id: enquiryId },
      data: { status: newStatus },
    });
    revalidatePath("/enquiries");
    return { success: true };
  } catch (error) {
    console.error("Failed to update status:", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function deleteEnquiry(enquiryId: string) {
  try {
    const enquiry = await prisma.enquiry.findUnique({
      where: { id: enquiryId },
      select: { customerId: true }
    });

    if (enquiry) {
      // Deleting customer will cascade and delete ALL their enquiries automatically
      await prisma.customer.delete({
        where: { id: enquiry.customerId },
      });
    }

    revalidatePath("/enquiries");
    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete customer and enquiries:", error);
    return { success: false, error: "Failed to delete customer data" };
  }
}
