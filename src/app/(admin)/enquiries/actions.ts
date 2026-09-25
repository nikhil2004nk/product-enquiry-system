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
