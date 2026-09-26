"use client";

import { useState } from "react";
import { resolveReminder } from "@/app/(admin)/enquiries/actions";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { CustomDateTimePicker } from "@/components/ui/CustomDateTimePicker";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface ResolveModalProps {
  enquiryId: string;
  customerName: string;
}

export function ResolveModalButton({ enquiryId, customerName }: ResolveModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Resolve states
  const [outcome, setOutcome] = useState("WON");
  const [note, setNote] = useState("");
  const [nextDate, setNextDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let statusUpdate = "";
    if (outcome === "WON") statusUpdate = "CLOSED";
    if (outcome === "LOST") statusUpdate = "CLOSED";

    await resolveReminder(
      enquiryId,
      outcome,
      note,
      statusUpdate || undefined,
      nextDate,
      undefined
    );

    setIsOpen(false);
    setLoading(false);
    
    // reset form
    setOutcome("WON");
    setNote("");
    setNextDate(undefined);
  };

  return (
    <>
      <button 
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
        className="mt-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors"
      >
        Resolve Now
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 md:p-6 animate-scale-up">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Resolve Reminder</h2>
                <p className="text-sm text-gray-500 mt-0.5">For {customerName}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Outcome</label>
                <CustomDropdown 
                  value={outcome}
                  onChange={setOutcome}
                  options={[
                    { value: "WON", label: "Won (Purchased)" },
                    { value: "LOST", label: "Lost (Not Interested)" },
                    { value: "SNOOZED", label: "Snoozed (Call Later)" },
                    { value: "NO_ANSWER", label: "No Answer" },
                  ]}
                />
              </div>

              {outcome === "SNOOZED" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Next Reminder</label>
                  <CustomDateTimePicker 
                    value={nextDate} 
                    onChange={setNextDate} 
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Outcome Notes</label>
                <input 
                  type="text"
                  placeholder="What happened during this call?"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={loading || (outcome === "SNOOZED" && !nextDate)}
                  className="w-full h-12 bg-indigo-600 text-white font-bold rounded-xl text-sm disabled:opacity-50 hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  {loading ? "Saving..." : "Mark as Resolved"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
