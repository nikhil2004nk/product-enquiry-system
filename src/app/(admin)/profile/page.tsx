import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User, Phone, ShieldCheck } from "lucide-react";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
  });

  if (!user) return null;

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Your Profile</h1>
        <p className="text-sm text-gray-500">Manage your account details and preferences</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${user.role === "SUPERADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
              <User size={14} /> Full Name
            </label>
            <p className="text-gray-900 font-medium">{user.name}</p>
          </div>

          <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
              <Phone size={14} /> Mobile Number
            </label>
            <p className="text-gray-900 font-medium">+91 {user.mobile}</p>
          </div>

          <div className="flex flex-col gap-1 pb-2">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
              <ShieldCheck size={14} /> Account Role
            </label>
            <p className="text-gray-900 font-medium">
              {user.role === "SUPERADMIN" ? "Super Administrator" : "Administrator"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
