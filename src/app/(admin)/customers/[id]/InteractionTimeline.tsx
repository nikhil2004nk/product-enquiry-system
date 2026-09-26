"use client";

import { useState } from "react";
import { MessageSquare, Bell, CheckCircle, Clock, Plus, Tag } from "lucide-react";
import { logInteraction, resolveReminder } from "../../enquiries/actions";
import { useRouter } from "next/navigation";
import { CustomDateTimePicker } from "@/components/ui/CustomDateTimePicker";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

export default function InteractionTimeline({
  enquiryId,
  interactions,
  isActiveReminder,
  nextReminderDate
}: {
  enquiryId: string,
  interactions: any[],
  isActiveReminder: boolean,
  nextReminderDate?: Date
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResolve, setShowResolve] = useState(false);

  // Resolve states
  const [resolveOutcome, setResolveOutcome] = useState("WON");
  const [resolveNote, setResolveNote] = useState("");
  const [nextDate, setNextDate] = useState<Date | undefined>(undefined);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note) return;
    setLoading(true);
    await logInteraction(enquiryId, "NOTE", note);
    setNote("");
    setLoading(false);
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let statusUpdate = "";
    if (resolveOutcome === "WON") statusUpdate = "CLOSED";
    if (resolveOutcome === "LOST") statusUpdate = "CLOSED";

    await resolveReminder(
      enquiryId,
      resolveOutcome,
      resolveNote,
      statusUpdate || undefined,
      nextDate,
      undefined
    );

    setShowResolve(false);
    setLoading(false);
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">

      {/* Active Reminder Banner */}
      {isActiveReminder && nextReminderDate && !showResolve && (
        <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-indigo-600 animate-pulse" />
            <div>
              <p className="text-xs font-bold text-indigo-900">Reminder Set</p>
              <p className="text-xs text-indigo-700 mt-0.5">
                {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(nextReminderDate))}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowResolve(true)}
            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Resolve
          </button>
        </div>
      )}

      {/* Resolve Form */}
      {showResolve && (
        <form onSubmit={handleResolve} className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-900">Resolve Reminder</h4>
            <button type="button" onClick={() => setShowResolve(false)} className="text-gray-400 hover:text-gray-600">
              <Plus size={16} className="rotate-45" />
            </button>
          </div>

          <CustomDropdown
            value={resolveOutcome}
            onChange={val => setResolveOutcome(val)}
            options={[
              { value: "WON", label: "✅ Deal Closed / Won" },
              { value: "SNOOZED", label: "📅 Snooze / Call Later" },
              { value: "WAITING", label: "⏳ Waiting on Customer" },
              { value: "LOST", label: "❌ Not Interested" }
            ]}
            searchable={false}
          />

          {resolveOutcome === "SNOOZED" && (
            <CustomDateTimePicker
              value={nextDate}
              onChange={d => setNextDate(d)}
            />
          )}

          <input
            type="text"
            placeholder="Outcome notes..."
            value={resolveNote}
            onChange={e => setResolveNote(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-indigo-600 text-white font-bold rounded-lg text-sm disabled:opacity-50"
          >
            {loading ? "Saving..." : "Complete Action"}
          </button>
        </form>
      )}

      {/* Timeline */}
      <div className="max-h-[400px] overflow-y-auto pr-2 pb-4 -mr-2">
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
          {interactions.map((interaction) => {

            let icon = <MessageSquare size={14} className="text-gray-500" />;
            let color = "bg-gray-100 border-gray-200";
            let noteBg = "bg-slate-50 border-slate-100 text-slate-700";

            if (interaction.type === "REMINDER_SET") {
              icon = <Clock size={14} className="text-amber-600" />;
              color = "bg-amber-50 border-amber-200";
              noteBg = "bg-amber-50/50 border-amber-100 text-amber-900";
            } else if (interaction.type === "REMINDER_RESOLVED") {
              icon = <CheckCircle size={14} className="text-emerald-600" />;
              color = "bg-emerald-50 border-emerald-200";
              noteBg = "bg-emerald-50/50 border-emerald-100 text-emerald-900";
            } else if (interaction.type === "WHATSAPP_SENT") {
              icon = <MessageSquare size={14} className="text-emerald-600" />;
              color = "bg-emerald-50 border-emerald-200";
              noteBg = "bg-emerald-50/50 border-emerald-100 text-emerald-900";
            } else if (interaction.type === "STATUS_CHANGED") {
              icon = <Tag size={14} className="text-indigo-600" />;
              color = "bg-indigo-50 border-indigo-200";
              noteBg = "bg-indigo-50/50 border-indigo-100 text-indigo-900";
            }

            return (
              <div key={interaction.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${color.replace('bg-', 'border-').split(' ')[0]}`}>
                  {icon}
                </div>

                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border shadow-sm bg-white border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">{interaction.type.replace("_", " ")}</span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(interaction.createdAt))}
                    </span>
                  </div>
                  {interaction.outcome && (
                    <span className="inline-block px-2 py-0.5 mb-2 rounded bg-slate-100 text-[10px] font-bold text-slate-600">
                      Outcome: {interaction.outcome}
                    </span>
                  )}
                  {interaction.notes && (
                    <div className={`mt-2 p-2.5 rounded-xl border text-sm font-medium ${noteBg}`}>
                      {interaction.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Note */}
      <form onSubmit={handleAddNote} className="flex gap-2">
        <input
          type="text"
          placeholder="Type a quick note..."
          value={note}
          onChange={e => setNote(e.target.value)}
          className="flex-1 h-10 px-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-500 bg-gray-50/50"
        />
        <button
          type="submit"
          disabled={loading || !note}
          className="h-10 px-4 bg-gray-900 text-white font-bold rounded-xl text-sm disabled:opacity-50 hover:bg-gray-800 transition-colors"
        >
          Add Note
        </button>
      </form>
    </div>
  );
}
