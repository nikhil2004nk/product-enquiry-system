"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function setAdminFilter(adminId: string) {
  const session = await getSession();
  if (session?.role !== "SUPERADMIN") return;

  if (adminId) {
    (await cookies()).set("admin_filter_id", adminId, { path: "/" });
  } else {
    (await cookies()).delete("admin_filter_id");
  }
}

export async function getAdmins() {
  const session = await getSession();
  if (session?.role !== "SUPERADMIN") return [];

  return await (prisma as any).user.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });
}
