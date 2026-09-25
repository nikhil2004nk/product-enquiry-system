import { prisma } from "@/lib/prisma";
import Link from "next/link";
import StatusDropdown from "./StatusDropdown";
import SearchBar from "./SearchBar";
import WhatsappButton from "./WhatsappButton";
import { ArrowLeft, MessageSquare, Inbox } from "lucide-react";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function EnquiriesPage(props: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const q = searchParams?.q || "";
  const filterStatus = searchParams?.status || "";

  const enquiries = await prisma.enquiry.findMany({
    where: {
      ...(filterStatus ? { status: filterStatus as any } : {}),
      ...(q
        ? {
            OR: [
              { customer: { name: { contains: q, mode: "insensitive" } } },
              { customer: { mobile: { contains: q } } },
              { product: { modelNumber: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: { customer: true, product: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });

  const templates = await (prisma as any).messageTemplate.findMany({
    orderBy: { createdAt: "asc" }
  });

  const statusConfig: Record<string, { label: string; cls: string }> = {
    NEW:       { label: "New",       cls: "badge badge-new" },
    CONTACTED: { label: "Contacted", cls: "badge badge-contacted" },
    FOLLOW_UP: { label: "Follow-Up", cls: "badge badge-followup" },
    CLOSED:    { label: "Closed",    cls: "badge badge-closed" },
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-up">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Enquiries</h1>
          <p className="text-sm text-gray-400">
            {enquiries.length} record{enquiries.length !== 1 ? "s" : ""}
            {q ? ` for "${q}"` : ""}
          </p>
        </div>
      </div>

      {/* ── Search & Filters ──────────────────────────────── */}
      <div className="mb-6 space-y-3">
        {/* Smart search bar (client component) */}
        <Suspense fallback={
          <div className="input !pl-10 text-gray-400">Loading search…</div>
        }>
          <SearchBar filterStatus={filterStatus} />
        </Suspense>

        {/* Status filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { label: "All",        value: "" },
            { label: "New",        value: "NEW" },
            { label: "Contacted",  value: "CONTACTED" },
            { label: "Follow-Up",  value: "FOLLOW_UP" },
            { label: "Closed",     value: "CLOSED" },
          ].map((tab) => (
            <Link
              key={tab.value}
              href={`/enquiries${tab.value ? `?status=${tab.value}` : ""}${q ? `${tab.value ? "&" : "?"}q=${q}` : ""}`}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                filterStatus === tab.value
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Enquiries Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {enquiries.length === 0 ? (
          <div className="card col-span-full p-12 text-center">
            <Inbox size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-semibold">No enquiries found</p>
            <p className="text-sm text-gray-400 mt-1">
              {q ? `No results for "${q}". Try a different search.` : "Try adjusting the filters above."}
            </p>
          </div>
        ) : (
          enquiries.map((enq) => {
            const sc = statusConfig[enq.status] ?? { label: enq.status, cls: "badge" };
            return (
              <div key={enq.id} className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/customers/${enq.customerId}`}
                      className="font-bold text-gray-900 hover:text-indigo-600 transition-colors text-base leading-tight truncate block"
                    >
                      {enq.customer.name}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">{enq.customer.mobile}</p>
                  </div>
                  <span className={sc.cls}>{sc.label}</span>
                </div>

                {/* Product info */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold shrink-0">
                    LG
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{enq.product.modelNumber}</p>
                    <p className="text-xs text-gray-400 truncate">{enq.product.category.name}</p>
                  </div>
                  {(enq as any).source === "PUBLIC" && (
                    <span className="badge badge-public ml-auto shrink-0">Public</span>
                  )}
                </div>

                {/* Date */}
                <p className="text-xs text-gray-400">
                  {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "numeric" }).format(new Date(enq.createdAt))}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-3">
                  <div className="flex-1 min-w-0">
                    <StatusDropdown enquiryId={enq.id} currentStatus={enq.status} />
                  </div>
                  <WhatsappButton 
                    enquiryId={enq.id} 
                    mobile={enq.customer.mobile} 
                    templates={templates} 
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
