import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, MessageCircle, Calendar, Tag } from "lucide-react";
import InteractionTimeline from "./InteractionTimeline";

export default async function CustomerHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  
  const customer = await prisma.customer.findUnique({
    where: { id: resolvedParams.id },
    include: {
      enquiries: {
        include: { 
          product: true,
          interactions: {
            orderBy: { createdAt: "asc" }
          }
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  const initial = customer.name.charAt(0).toUpperCase();

  const statusConfig: Record<string, string> = {
    NEW:       "badge badge-new",
    CONTACTED: "badge badge-contacted",
    FOLLOW_UP: "badge badge-followup",
    CLOSED:    "badge badge-closed",
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-up">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-7">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ── Profile Card ─────────────────────────────────── */}
        <div className="md:col-span-1">
          <div className="card p-6 flex flex-col items-center text-center">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-3xl mb-4 shadow-lg"
              style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
            >
              {initial}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-0.5">{customer.name}</h2>
            <p className="text-sm text-gray-400 font-medium mb-1">+91 {customer.mobile}</p>
            <p className="text-xs text-gray-400 mb-6">
              {customer.enquiries.length} enquir{customer.enquiries.length !== 1 ? "ies" : "y"}
            </p>

            <div className="flex flex-col w-full gap-2">
              <a
                href={`tel:+91${customer.mobile}`}
                className="btn btn-secondary w-full"
              >
                <Phone size={16} />
                Call
              </a>
              <a
                href={`https://wa.me/91${customer.mobile}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-success w-full"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* ── Enquiry History ──────────────────────────────── */}
        <div className="md:col-span-2">
          <p className="section-label mb-4">Enquiry History</p>

          {customer.enquiries.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-gray-400 italic">No past enquiries found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {customer.enquiries.map((enq: any) => {
                const date = new Intl.DateTimeFormat("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }).format(enq.createdAt);

                const statusCls = statusConfig[enq.status] ?? "badge";

                return (
                  <div key={enq.id} className="card p-5 mb-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold shrink-0">
                          PR
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{enq.product.modelNumber}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Calendar size={11} className="text-gray-400" />
                            <p className="text-xs text-gray-400">{date}</p>
                          </div>
                        </div>
                      </div>
                      <span className={statusCls}>{enq.status.replace("_", "-")}</span>
                    </div>

                    {enq.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-500 italic">"{enq.notes}"</p>
                      </div>
                    )}

                    <InteractionTimeline 
                      enquiryId={enq.id} 
                      interactions={enq.interactions} 
                      isActiveReminder={enq.isReminderActive}
                      nextReminderDate={enq.nextReminderDate}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
