"use server";

import { prisma } from "@/lib/prisma";

export async function lookupCustomer(mobile: string, userId: string) {
  if (mobile.length !== 10) return null;
  
  const customer = await prisma.customer.findFirst({
    where: { mobile, userId },
    include: {
      enquiries: {
        take: 1,
        orderBy: { createdAt: "desc" },
        include: { product: true }
      }
    }
  });

  return customer;
}
