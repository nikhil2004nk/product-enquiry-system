import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Inbox, ChevronRight, ShieldCheck, Users, Briefcase } from "lucide-react";
import { AssignDropdown } from "./AssignDropdown";

export const dynamic = "force-dynamic";

export default async function SuperAdminDashboard() {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") redirect("/login");

  // Fetch all admins
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, name: true }
  });

  // Fetch unassigned enquiries
  const unassignedEnquiries = await prisma.enquiry.findMany({
    where: { userId: null },
    include: {
      customer: true,
      product: { include: { category: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  // Fetch some quick stats
  const totalAdmins = await prisma.user.count({ where: { role: "ADMIN" } });
  const totalEnquiries = await prisma.enquiry.count();
  const totalProducts = await prisma.product.count();

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-up space-y-6">
      
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
          <ShieldCheck size={24} className="text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Super Admin Portal</h1>
          <p className="text-gray-500">Global overview and enquiry dispatch</p>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <h3 className="text-indigo-100 font-semibold mb-1">Total Enquiries</h3>
          <p className="text-4xl font-black">{totalEnquiries}</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-2 text-gray-500 mb-1 font-semibold">
            <Users size={16} /> Active Admins
          </div>
          <p className="text-3xl font-black text-gray-900">{totalAdmins}</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-2 text-gray-500 mb-1 font-semibold">
            <Briefcase size={16} /> Total Products
          </div>
          <p className="text-3xl font-black text-gray-900">{totalProducts}</p>
        </div>
      </div>

      {/* ── Unassigned Enquiries ──────────────────────────── */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Inbox size={20} className="text-red-500" />
              Unassigned Public Enquiries
            </h2>
            <p className="text-sm text-gray-500 mt-1">These enquiries came from the public portal and need to be assigned to an admin.</p>
          </div>
          <div className="badge badge-new">{unassignedEnquiries.length} Pending</div>
        </div>

        {unassignedEnquiries.length === 0 ? (
          <div className="text-center p-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Inbox size={32} className="mx-auto mb-3 text-gray-300" />
            <h3 className="font-bold text-gray-900">All Caught Up!</h3>
            <p className="text-sm text-gray-500 mt-1">There are no unassigned enquiries right now.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50/50 text-gray-500 font-bold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">Customer</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right rounded-r-xl">Assign To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {unassignedEnquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-bold text-gray-900">{enq.customer.name}</div>
                        <div className="text-xs text-gray-500">{enq.customer.mobile}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-gray-800">{enq.product.modelNumber}</div>
                        <div className="text-xs text-gray-400">{enq.product.category.name}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-gray-500">
                          {new Intl.DateTimeFormat("en-IN", { timeZone: 'Asia/Kolkata', day: "numeric", month: "short", hour: "numeric", minute: "numeric" }).format(enq.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-4 flex justify-end">
                        <AssignDropdown enquiryId={enq.id} admins={admins} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 mt-2">
              {unassignedEnquiries.map((enq) => (
                <div key={enq.id} className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{enq.customer.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{enq.customer.mobile}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800 text-sm">{enq.product.modelNumber}</div>
                      <div className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">{enq.product.category.name}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-1">
                    <span className="text-xs text-gray-400">
                      {new Intl.DateTimeFormat("en-IN", { timeZone: 'Asia/Kolkata', day: "numeric", month: "short" }).format(enq.createdAt)}
                    </span>
                    <AssignDropdown enquiryId={enq.id} admins={admins} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
