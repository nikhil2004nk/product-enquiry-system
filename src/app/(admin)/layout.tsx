import { getSession } from "@/lib/auth";
import { cookies } from "next/headers";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const role = session?.role || null;
  const cookieStore = await cookies();
  const filterAdminId = cookieStore.get("admin_filter_id")?.value;
  const isViewingAsAdmin = !!filterAdminId;
  
  // Super admin sees /enquiry (all). Viewing as admin → /enquiry/{adminId}. Regular admin → /enquiry/{ownId}.
  const publicLinkId = role === "SUPERADMIN"
    ? (filterAdminId || "")  // empty = no suffix (all-admin page)
    : (session?.id || "");   // regular admin always sees their own link

  return <AdminLayoutClient role={role} isViewingAsAdmin={isViewingAsAdmin} publicLinkId={publicLinkId}>{children}</AdminLayoutClient>;
}
