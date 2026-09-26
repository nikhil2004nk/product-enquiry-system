"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import bcrypt from "bcryptjs";


export async function createTemplate(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const content = formData.get("content")?.toString().trim();
  const userId = formData.get("userId")?.toString() || null; // null = global (Super Admin)

  if (!name || !content) return { error: "Name and Content are required" };

  // First template for this user becomes their default
  const count = await (prisma as any).messageTemplate.count({ where: { userId } });
  
  await (prisma as any).messageTemplate.create({
    data: { name, content, isDefault: count === 0, userId },
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

export async function setDefaultTemplate(id: string, userId: string | null) {
  // Only unset default for same user's templates (userId scoping)
  await prisma.$transaction([
    (prisma as any).messageTemplate.updateMany({
      where: { userId },
      data: { isDefault: false }
    }),
    (prisma as any).messageTemplate.update({ where: { id }, data: { isDefault: true } }),
  ]);
  
  revalidatePath("/settings");
  return { success: true };
}

export async function saveWhatsappTemplate(formData: FormData): Promise<{ success: boolean; error?: string }> {
  // Dummy function for unused SettingsForm
  return { success: true };
}

export async function changePin(formData: FormData) {
  const currentPin = formData.get("currentPin")?.toString().trim();
  const newPin = formData.get("newPin")?.toString().trim();
  const confirmPin = formData.get("confirmPin")?.toString().trim();

  if (!currentPin || !newPin || !confirmPin) {
    return { success: false, error: "All fields are required" };
  }

  if (newPin !== confirmPin) {
    return { success: false, error: "New PINs do not match" };
  }

  if (newPin.length !== 4) {
    return { success: false, error: "New PIN must be exactly 4 digits" };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return { success: false, error: "Not authenticated" };

  try {
    const payload = await verifyJwt(token);
    if (!payload?.id) return { success: false, error: "Invalid session" };

    const user = await (prisma as any).user.findUnique({
      where: { id: payload.id }
    });

    if (!user) return { success: false, error: "User not found" };

    const isValid = await bcrypt.compare(currentPin, user.pinHash);
    if (!isValid) return { success: false, error: "Current PIN is incorrect" };

    const hashedPin = await bcrypt.hash(newPin, 10);
    await (prisma as any).user.update({
      where: { id: payload.id },
      data: { pinHash: hashedPin }
    });

    return { success: true };
  } catch (err) {
    console.error("Change PIN error:", err);
    return { success: false, error: "Failed to update PIN" };
  }
}
