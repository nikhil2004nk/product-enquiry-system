"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateEnquiryStatus(enquiryId: string, newStatus: string) {
  try {
    await prisma.enquiry.update({
      where: { id: enquiryId },
      data: { status: newStatus },
    });

    await prisma.interaction.create({
      data: {
        enquiryId,
        type: "STATUS_CHANGED",
        notes: `Status changed to ${newStatus}`
      }
    });

    revalidatePath("/enquiries");
    revalidatePath("/customers", "layout");
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

export async function setReminder(enquiryId: string, date: Date, note: string) {
  try {
    await prisma.enquiry.update({
      where: { id: enquiryId },
      data: {
        nextReminderDate: date,
        nextReminderNote: note,
        isReminderActive: true
      }
    });

    await prisma.interaction.create({
      data: {
        enquiryId,
        type: "REMINDER_SET",
        notes: `Reminder set for ${new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }).format(date)}: ${note}`
      }
    });

    revalidatePath("/enquiries");
    revalidatePath("/dashboard");
    revalidatePath("/customers", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to set reminder:", error);
    return { success: false, error: "Failed to set reminder" };
  }
}

export async function resolveReminder(
  enquiryId: string, 
  outcome: string, 
  resolutionNote: string,
  newStatus?: string,
  nextDate?: Date,
  nextNote?: string
) {
  try {
    // 1. Clear current reminder and optionally update status
    const finalNextNote = nextNote || (outcome === "SNOOZED" ? resolutionNote : null);
    
    const updateData: any = {
      nextReminderDate: nextDate || null,
      nextReminderNote: finalNextNote,
      isReminderActive: !!nextDate
    };
    if (newStatus) {
      updateData.status = newStatus;
    }

    await prisma.enquiry.update({
      where: { id: enquiryId },
      data: updateData
    });

    // 2. Log resolution
    await prisma.interaction.create({
      data: {
        enquiryId,
        type: "REMINDER_RESOLVED",
        outcome,
        notes: resolutionNote || outcome
      }
    });

    // 3. Log new status if changed
    if (newStatus) {
      await prisma.interaction.create({
        data: {
          enquiryId,
          type: "STATUS_CHANGED",
          notes: `Status changed to ${newStatus}`
        }
      });
    }

          notes: `Reminder set for ${new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }).format(nextDate)}${finalNextNote ? `: ${finalNextNote}` : ""}`

    revalidatePath("/enquiries");
    revalidatePath("/dashboard");
    revalidatePath("/customers", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to resolve reminder:", error);
    return { success: false, error: "Failed to resolve reminder" };
  }
}

export async function logInteraction(enquiryId: string, type: string, notes: string) {
  try {
    await prisma.interaction.create({
      data: {
        enquiryId,
        type,
        notes
      }
    });
    revalidatePath("/enquiries");
    revalidatePath("/customers", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to log interaction:", error);
    return { success: false, error: "Failed to log interaction" };
  }
}
