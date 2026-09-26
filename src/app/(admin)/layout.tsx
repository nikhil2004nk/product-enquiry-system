import { getSession } from "@/lib/auth";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const role = session?.role || null;
  
  return <AdminLayoutClient role={role}>{children}</AdminLayoutClient>;
}
