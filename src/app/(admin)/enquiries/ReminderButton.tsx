"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { createPortal } from "react-dom";
import { setReminder } from "./actions";
import { CustomDateTimePicker } from "@/components/ui/CustomDateTimePicker";

export default function ReminderButton({ enquiryId, isActive }: { enquiryId: string, isActive: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    
    setLoading(true);
    await setReminder(enquiryId, date, note);
    setLoading(false);
    setIsOpen(false);
  };

  const modal = isOpen && (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-scale-up">
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-3 rounded-t-2xl">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <Bell size={20} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Set Reminder</h3>
            <p className="text-xs text-gray-500">We will notify you at this exact time.</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date & Time</label>
            <CustomDateTimePicker 
              value={date} 
              onChange={(d) => setDate(d)} 
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Notes (Optional)</label>
            <textarea 
              rows={3}
              placeholder="e.g. Call to finalize price, check stock..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="flex-1 h-11 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 h-11 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Reminder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Set Reminder"
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
          isActive 
            ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200 shadow-sm shadow-indigo-100" 
            : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        }`}
      >
        <Bell size={16} className={isActive ? "fill-indigo-600" : ""} />
      </button>

      {typeof document !== "undefined" && modal && createPortal(modal, document.body)}
    </>
  );
}
