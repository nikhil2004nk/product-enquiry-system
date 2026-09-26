import { getSession } from "@/lib/auth";
import { cookies } from "next/headers";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const role = session?.role || null;
  const cookieStore = await cookies();
  const filterAdminId = cookieStore.get("admin_filter_id")?.value;
  const isViewingAsAdmin = !!filterAdminId;
  
  return <AdminLayoutClient role={role} isViewingAsAdmin={isViewingAsAdmin}>{children}</AdminLayoutClient>;
}
