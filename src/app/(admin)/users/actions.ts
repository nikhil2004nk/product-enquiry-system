"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const mobile = formData.get("mobile")?.toString().trim();
  const pin = formData.get("pin")?.toString().trim();

  if (!name || !mobile || !pin) {
    return { error: "All fields are required" };
  }

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return { error: "Invalid mobile number" };
  }

  if (pin.length < 4) {
    return { error: "PIN must be at least 4 digits" };
  }

  try {
    const existingUser = await (prisma as any).user.findUnique({
      where: { mobile },
    });

    if (existingUser) {
      return { error: "Mobile number already registered" };
    }

    const pinHash = await bcrypt.hash(pin, 10);

    await (prisma as any).user.create({
      data: {
        name,
        mobile,
        pinHash,
      },
    });
    
    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to register user:", error);
    return { error: "Registration failed" };
  }
}

export async function deleteUser(id: string) {
  try {
    const count = await (prisma as any).user.count();
    if (count <= 1) {
      return { error: "Cannot delete the only admin." };
    }

    await (prisma as any).user.delete({
      where: { id },
    });
    
    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { error: "Deletion failed" };
  }
}
