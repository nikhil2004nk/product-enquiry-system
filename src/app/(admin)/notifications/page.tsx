import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Bell, AlertTriangle, Clock, ChevronRight, MessageSquare, Check } from "lucide-react";
import { HistoryFilter } from "./HistoryFilter";
import { ResolveModalButton } from "./ResolveModalButton";

export const dynamic = "force-dynamic";

import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NotificationsPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string; date?: string }>
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const userId = session.id;
  const isSuper = session.role === "SUPERADMIN";

  const params = await searchParams;
  const tab = params?.tab || "active";
  const dateFilter = params?.date || "";

  const now = new Date();
  
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  let activeReminders: any[] = [];
  let historyInteractions: any[] = [];

  if (tab === "active") {
    activeReminders = await prisma.enquiry.findMany({
      where: { 
        isReminderActive: true,
        ...(isSuper ? {} : { userId })
      },
      include: { customer: true, product: true },
      orderBy: { nextReminderDate: "asc" }
    });
  } else {
    // History Tab
    const historyWhere: any = {
      type: "REMINDER_RESOLVED",
      enquiry: { ...(isSuper ? {} : { userId }) }
    };

    if (dateFilter) {
      const d = new Date(dateFilter);
      const start = new Date(d.setHours(0,0,0,0));
      const end = new Date(d.setHours(23,59,59,999));
      historyWhere.createdAt = { gte: start, lte: end };
    }

    historyInteractions = await prisma.interaction.findMany({
      where: historyWhere,
      include: {
        enquiry: {
          include: { customer: true, product: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  // Strict time-based logic!
  const overdue = activeReminders.filter(e => e.nextReminderDate! < now);
  const today = activeReminders.filter(e => e.nextReminderDate! >= now && e.nextReminderDate! <= endOfToday);
  const upcoming = activeReminders.filter(e => e.nextReminderDate! > endOfToday);

  const renderCard = (enq: any, type: 'overdue' | 'today' | 'upcoming') => {
    const borderColor = type === 'overdue' ? 'border-l-red-500' : type === 'today' ? 'border-l-indigo-500' : 'border-l-gray-300';
    const badgeColor = type === 'overdue' ? 'bg-red-50 text-red-600' : type === 'today' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-600';
    
    return (
      <div key={enq.id} className={`card p-5 border-l-4 ${borderColor} group hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3`}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
            {type === 'overdue' ? <AlertTriangle size={20} className="text-red-500" /> : <Bell size={20} className={type === 'today' ? "text-indigo-500" : ""} />}
          </div>
          <div>
            <Link href={`/customers/${enq.customerId}`} className="font-bold text-gray-900 hover:text-indigo-600 transition-colors text-lg flex items-center gap-2">
              {enq.customer.name}
              <ChevronRight size={16} className="text-gray-400" />
            </Link>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-semibold text-gray-700">{enq.product.modelNumber}</span>
              <span className="text-xs text-gray-400">• {enq.customer.mobile}</span>
            </div>
            {enq.nextReminderNote && (
              <p className="text-sm text-gray-600 italic mt-2">"{enq.nextReminderNote}"</p>
            )}
          </div>
        </div>
        
        <div className="flex md:flex-col items-center md:items-end justify-between border-t border-gray-100 md:border-t-0 pt-3 md:pt-0">
          <div className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${badgeColor}`}>
            <Clock size={14} />
            {new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }).format(enq.nextReminderDate)}
          </div>
          <ResolveModalButton enquiryId={enq.id} customerName={enq.customer.name} />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-up">
      <div className="mb-7 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center">
          <Bell size={20} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notifications Inbox</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your upcoming and pending follow-ups.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200 mb-6">
        <Link 
          href="/notifications?tab=active" 
          className={`pb-3 font-bold text-sm border-b-2 transition-colors ${tab === "active" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Active Reminders
        </Link>
        <Link 
          href="/notifications?tab=history" 
          className={`pb-3 font-bold text-sm border-b-2 transition-colors ${tab === "history" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          History Log
        </Link>
      </div>

      {tab === "history" && (
        <HistoryFilter initialDate={dateFilter} />
      )}

      {tab === "active" ? (
        activeReminders.length === 0 ? (
          <div className="card p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <Check size={32} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Inbox Zero!</h3>
            <p className="text-gray-500 text-sm">You have no pending follow-ups. Great job!</p>
          </div>
        ) : (
        <div className="space-y-8">
          {overdue.length > 0 && (
            <section>
              <h3 className="font-bold text-red-600 uppercase tracking-wider text-xs mb-3 flex items-center gap-1.5">
                <AlertTriangle size={14} /> Overdue ({overdue.length})
              </h3>
              {overdue.map(enq => renderCard(enq, 'overdue'))}
            </section>
          )}

          {today.length > 0 && (
            <section>
              <h3 className="font-bold text-indigo-600 uppercase tracking-wider text-xs mb-3 flex items-center gap-1.5">
                <Bell size={14} /> Today ({today.length})
              </h3>
              {today.map(enq => renderCard(enq, 'today'))}
            </section>
          )}

          {upcoming.length > 0 && (
            <section>
              <h3 className="font-bold text-gray-500 uppercase tracking-wider text-xs mb-3 flex items-center gap-1.5">
                <Clock size={14} /> Upcoming ({upcoming.length})
              </h3>
              {upcoming.map(enq => renderCard(enq, 'upcoming'))}
            </section>
          )}
        </div>
        )
      ) : (
        historyInteractions.length === 0 ? (
          <div className="card p-12 text-center text-gray-500 text-sm font-bold">
            No resolved history found for this date.
          </div>
        ) : (
          <div className="space-y-3">
            {historyInteractions.map((intx: any) => (
              <Link key={intx.id} href={`/customers/${intx.enquiry.customerId}`} className="card p-4 flex items-center justify-between group hover:shadow-md transition-shadow">
                <div>
                  <h4 className="font-bold text-gray-900 group-hover:text-indigo-600">{intx.enquiry.customer.name}</h4>
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">
                    {new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }).format(intx.createdAt)} 
                    <span className="mx-2">•</span> 
                    Outcome: <span className="text-indigo-600">{intx.outcome}</span>
                  </p>
                  {intx.notes && <p className="text-sm text-gray-600 italic mt-1">"{intx.notes}"</p>}
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-indigo-600" />
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}
