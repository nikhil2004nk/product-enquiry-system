"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { signJwt } from "@/lib/jwt";

export async function loginAdmin(formData: FormData) {
  const mobile = formData.get("mobile")?.toString().trim();
  const pin = formData.get("pin")?.toString().trim();

  if (!mobile || !pin) {
    return { error: "Mobile number and PIN are required" };
  }

  // @ts-ignore
  const user = await prisma.user.findUnique({
    where: { mobile },
  });

  if (!user) {
    return { error: "Invalid credentials" };
  }

  const isValidPin = await bcrypt.compare(pin, user.pinHash);

  if (isValidPin) {
    const token = await signJwt({ 
      id: user.id, 
      role: "ADMIN",
      mobile: user.mobile 
    });

    (await cookies()).set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    
    redirect("/dashboard");
  }

  return { error: "Invalid credentials" };
}

export async function logoutAdmin() {
  (await cookies()).delete("admin_session");
  redirect("/login");
}
