import { prisma } from "@/lib/prisma";
import Link from "next/link";
import StatusDropdown from "./StatusDropdown";
import SearchBar from "./SearchBar";
import WhatsappButton from "./WhatsappButton";
import ProductFilter from "./ProductFilter";
import SourceFilter from "./SourceFilter";
import DeleteEnquiryButton from "./DeleteEnquiryButton";
import { ArrowLeft, MessageSquare, Inbox } from "lucide-react";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function EnquiriesPage(props: {
  searchParams: Promise<{ q?: string; status?: string; categoryId?: string; productId?: string; source?: string }>;
}) {
  const searchParams = await props.searchParams;
  const q = searchParams?.q || "";
  const filterStatus = searchParams?.status || "";
  const filterCategoryId = searchParams?.categoryId || "";
  const filterProductId = searchParams?.productId || "";
  const filterSource = searchParams?.source || "";

  const enquiries = await prisma.enquiry.findMany({
    where: {
      ...(filterStatus ? { status: filterStatus as any } : {}),
      ...(filterSource ? { source: filterSource } : {}),
      ...(filterProductId 
        ? { productId: filterProductId } 
        : filterCategoryId 
          ? { product: { categoryId: filterCategoryId } } 
          : {}),
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

  const categories = await prisma.category.findMany({
    include: { products: true },
    orderBy: { name: "asc" }
  });

  const statusConfig: Record<string, { label: string; cls: string }> = {
    NEW:       { label: "New",       cls: "badge badge-new" },
    CONTACTED: { label: "Contacted", cls: "badge badge-contacted" },
    FOLLOW_UP: { label: "Follow-Up", cls: "badge badge-followup" },
    CLOSED:    { label: "Closed",    cls: "badge badge-closed" },
  };

  const hasFilters = q !== "" || filterStatus !== "" || filterCategoryId !== "" || filterProductId !== "" || filterSource !== "";

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
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 w-full">
            <Suspense fallback={<div className="input !pl-10 text-gray-400">Loading search…</div>}>
              <SearchBar filterStatus={filterStatus} />
            </Suspense>
          </div>
          <div className="w-full md:w-auto">
            <Suspense fallback={<div>Loading filters...</div>}>
              <ProductFilter categories={categories} />
            </Suspense>
          </div>
          <div className="w-full md:w-auto">
            <Suspense fallback={<div>Loading filters...</div>}>
              <SourceFilter />
            </Suspense>
          </div>
          {hasFilters && (
            <Link 
              href="/enquiries"
              className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl text-[13px] transition-colors shrink-0 w-full md:w-auto h-10 md:h-[42px]"
            >
              Clear Filters
            </Link>
          )}
        </div>

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

      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Product Interest</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Inbox size={36} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-semibold">No enquiries found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {q ? `No results for "${q}". Try a different search.` : "Try adjusting the filters above."}
                    </p>
                  </td>
                </tr>
              ) : (
                enquiries.map((enq: any) => (
                  <tr key={enq.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <Link
                          href={`/customers/${enq.customerId}`}
                          className="font-bold text-gray-900 hover:text-indigo-600 transition-colors text-sm leading-tight"
                        >
                          {enq.customer.name}
                        </Link>
                        <span className="text-xs text-gray-500 mt-0.5">{enq.customer.mobile}</span>
                      </div>
                    </td>

                    {/* Product */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-800">{enq.product.modelNumber}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-gray-400">{enq.product.category.name}</span>
                          {(enq as any).source === "PUBLIC" && (
                            <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-1.5 rounded">Public</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="w-32">
                        <StatusDropdown enquiryId={enq.id} currentStatus={enq.status} />
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500">
                        {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "numeric" }).format(new Date(enq.createdAt))}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <WhatsappButton 
                          enquiryId={enq.id} 
                          mobile={enq.customer.mobile} 
                          templates={templates} 
                        />
                        <DeleteEnquiryButton enquiryId={enq.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MOBILE VIEW: CARDS ────────────────────────────── */}
      <div className="md:hidden space-y-4">
        {enquiries.length === 0 ? (
          <div className="card p-12 text-center">
            <Inbox size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-semibold">No enquiries found</p>
          </div>
        ) : (
          enquiries.map((enq: any) => (
            <div key={enq.id} className="card p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/customers/${enq.customerId}`}
                    className="font-bold text-gray-900 text-sm"
                  >
                    {enq.customer.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">{enq.customer.mobile}</p>
                </div>
                <div className="w-28 shrink-0">
                  <StatusDropdown enquiryId={enq.id} currentStatus={enq.status} />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-50 pt-2">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{enq.product.modelNumber}</p>
                  <p className="text-xs text-gray-400">{enq.product.category.name}</p>
                </div>
                <p className="text-xs text-gray-400 text-right">
                  {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(enq.createdAt))}
                </p>
              </div>

              <div className="border-t border-gray-50 pt-2 flex items-center justify-end">
                <WhatsappButton 
                  enquiryId={enq.id} 
                  mobile={enq.customer.mobile} 
                  templates={templates} 
                />
                <DeleteEnquiryButton enquiryId={enq.id} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
