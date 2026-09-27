"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateEnquiry(
  enquiryId: string,
  data: {
    customerName: string;
    mobile: string;
    productId: string;
    notes: string;
  }
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  
  // Find the enquiry and its associated customer
  const enquiry = await prisma.enquiry.findUnique({
    where: { id: enquiryId },
    include: { customer: true }
  });

  if (!enquiry) {
    throw new Error("Enquiry not found");
  }

  // Check if we need to update the customer or if the mobile has changed
  if (enquiry.customer.mobile !== data.mobile) {
    // Check if another customer exists with this new mobile
    const existingCustomer = await prisma.customer.findUnique({
      where: { mobile: data.mobile }
    });

    if (existingCustomer) {
      // Switch the enquiry to this existing customer
      await prisma.enquiry.update({
        where: { id: enquiryId },
        data: {
          customerId: existingCustomer.id,
          productId: data.productId,
          notes: data.notes
        }
      });
      // Optionally update the existing customer's name if needed, but let's keep it simple
      await prisma.customer.update({
        where: { id: existingCustomer.id },
        data: { name: data.customerName }
      });
    } else {
      // Update the current customer's mobile and name
      await prisma.customer.update({
        where: { id: enquiry.customerId },
        data: {
          mobile: data.mobile,
          name: data.customerName
        }
      });
      // Update the enquiry product and notes
      await prisma.enquiry.update({
        where: { id: enquiryId },
        data: {
          productId: data.productId,
          notes: data.notes
        }
      });
    }
  } else {
    // Mobile is same, just update name, product, notes
    await prisma.customer.update({
      where: { id: enquiry.customerId },
      data: { name: data.customerName }
    });

    await prisma.enquiry.update({
      where: { id: enquiryId },
      data: {
        productId: data.productId,
        notes: data.notes
      }
    });
  }

  revalidatePath("/enquiries");
  redirect("/enquiries");
}
