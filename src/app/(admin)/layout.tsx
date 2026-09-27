import { getSession } from "@/lib/auth";
import { cookies } from "next/headers";
import AdminLayoutClient from "./AdminLayoutClient";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const role = session?.role || null;
  const cookieStore = await cookies();
  const filterAdminId = cookieStore.get("admin_filter_id")?.value;
  const isViewingAsAdmin = !!filterAdminId;
  
  let userName = "Admin";
  let userMobile = "";
  if (session?.id) {
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (user) {
      userName = user.name;
      userMobile = user.mobile;
    }
  }
  
  // Super admin sees /enquiry (all). Viewing as admin → /enquiry/{adminId}. Regular admin → /enquiry/{ownId}.
  const publicLinkId = role === "SUPERADMIN"
    ? (filterAdminId || "")  // empty = no suffix (all-admin page)
    : (session?.id || "");   // regular admin always sees their own link

  return <AdminLayoutClient role={role} userName={userName} userMobile={userMobile} isViewingAsAdmin={isViewingAsAdmin} publicLinkId={publicLinkId}>{children}</AdminLayoutClient>;
}
