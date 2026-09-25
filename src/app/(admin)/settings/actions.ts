"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTemplate(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const content = formData.get("content")?.toString().trim();

  if (!name || !content) return { error: "Name and Content are required" };

  const count = await (prisma as any).messageTemplate.count();
  
  await (prisma as any).messageTemplate.create({
    data: { name, content, isDefault: count === 0 },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function updateTemplate(id: string, formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const content = formData.get("content")?.toString().trim();

  if (!name || !content) return { error: "Name and Content are required" };

  await (prisma as any).messageTemplate.update({
    where: { id },
    data: { name, content },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function deleteTemplate(id: string) {
  await (prisma as any).messageTemplate.delete({ where: { id } });
  revalidatePath("/settings");
  return { success: true };
}

export async function setDefaultTemplate(id: string) {
  await prisma.$transaction([
    (prisma as any).messageTemplate.updateMany({ data: { isDefault: false } }),
    (prisma as any).messageTemplate.update({ where: { id }, data: { isDefault: true } }),
  ]);
  
  revalidatePath("/settings");
  return { success: true };
}
