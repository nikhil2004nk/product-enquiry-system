import { prisma } from "@/lib/prisma";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await (prisma as any).user.findMany({
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-up">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>
        <p className="text-gray-400 text-sm mt-0.5">Manage dashboard access and administrators.</p>
      </div>
      <UsersClient initialUsers={users} />
    </div>
  );
}
