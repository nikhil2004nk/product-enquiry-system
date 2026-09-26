"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function assignEnquiry(enquiryId: string, adminId: string) {
  try {
    // We update the enquiry's userId.
    // (We also update the customer's userId to match, so the Admin owns the customer too!)
    const enquiry = await prisma.enquiry.update({
      where: { id: enquiryId },
      data: { userId: adminId },
    });

    await prisma.customer.update({
      where: { id: enquiry.customerId },
      data: { userId: adminId },
    });

    revalidatePath("/superadmin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to assign enquiry:", error);
    return { error: "Failed to assign enquiry" };
  }
}
