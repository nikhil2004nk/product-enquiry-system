import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, Clock, ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ShareLinkCard } from "./ShareLinkCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const [todayEnquiriesCount, yesterdayEnquiriesCount, recentEnquiries] = await Promise.all([
    prisma.enquiry.count({ where: { createdAt: { gte: today } } }),
    prisma.enquiry.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
    prisma.enquiry.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { customer: true, product: { include: { category: true } } },
    }),
  ]);

  const diff = todayEnquiriesCount - yesterdayEnquiriesCount;

  const timeGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-up">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{timeGreeting()} 👋</h1>
        <p className="text-sm text-gray-400 mt-0.5">Here's what's happening in your business today.</p>
      </div>

      {/* ── Hero Stat Card ───────────────────────────────── */}
      <div
        className="mb-8 rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #6d28d9 100%)", boxShadow: "0 12px 40px rgba(79,70,229,0.35)" }}
      >
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -right-4 top-16 w-24 h-24 rounded-full bg-white/5" />

        <div className="relative">
          <p className="text-sm font-bold text-white/80 uppercase tracking-widest mb-1">Today's Enquiries</p>
          <p className="text-7xl font-black mt-1 mb-3 tracking-tight text-white drop-shadow-md">
            {todayEnquiriesCount}
          </p>
          <div className="flex items-center gap-1.5 font-medium">
            {diff > 0
              ? <TrendingUp size={16} className="text-green-300" />
              : diff < 0
              ? <TrendingDown size={16} className="text-red-300" />
              : <Minus size={16} className="text-white/60" />
            }
            <p className="text-sm text-white/90">
              {diff > 0 ? `+${diff}` : diff} from yesterday
            </p>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────── */}
      <p className="section-label mb-3">Quick Actions</p>
      <div className="mb-8 grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link
          href="/enquiry"
          className="card card-hover flex flex-col items-center justify-center p-6 text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
            <PlusCircle size={22} className="text-indigo-600" />
          </div>
          <span className="font-bold text-gray-900">New Enquiry</span>
          <span className="text-xs text-gray-400 mt-0.5">Add a customer enquiry</span>
        </Link>

        <Link
          href="/enquiries"
          className="card card-hover flex flex-col items-center justify-center p-6 text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-colors">
            <Clock size={22} className="text-gray-600" />
          </div>
          <span className="font-bold text-gray-900">View History</span>
          <span className="text-xs text-gray-400 mt-0.5">Browse all enquiries</span>
        </Link>

        <ShareLinkCard />
      </div>

      {/* ── Recent Enquiries ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <p className="section-label">Recent Enquiries</p>
        <Link href="/enquiries" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {recentEnquiries.length === 0 ? (
          <div className="card col-span-full p-8 text-center">
            <p className="text-gray-400 text-sm">No enquiries yet. Start by adding one!</p>
          </div>
        ) : (
          recentEnquiries.map((enq: any) => (
            <Link
              key={enq.id}
              href={`/customers/${enq.customerId}`}
              className="card card-hover p-4 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                  {enq.customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{enq.customer.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {enq.product.modelNumber} · {enq.product.category.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" }).format(new Date(enq.createdAt))}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0 ml-2" />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}


