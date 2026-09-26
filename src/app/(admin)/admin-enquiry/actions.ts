"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function lookupCustomer(mobile: string) {
  if (mobile.length !== 10) return null;
  
  const session = await getSession();
  if (!session) return null;

  const cookieStore = await cookies();
  const filterAdminId = cookieStore.get("admin_filter_id")?.value;
  const userId = session.role === "SUPERADMIN" && filterAdminId ? filterAdminId : session.id;

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
