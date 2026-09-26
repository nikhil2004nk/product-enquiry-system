"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CustomDateTimePicker } from "@/components/ui/CustomDateTimePicker";

export function HistoryFilter({ initialDate }: { initialDate: string }) {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(initialDate ? new Date(initialDate) : undefined);

  const handleApply = () => {
    if (date) {
       // Extract just the YYYY-MM-DD part safely
       const dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
       router.push(`/notifications?tab=history&date=${dateString}`);
    }
  };

  return (
    <div className="mb-6 flex gap-3 items-center flex-wrap">
      <div className="w-full sm:w-[260px]">
        <CustomDateTimePicker 
          value={date} 
          onChange={setDate} 
          placeholder="Select Filter Date" 
        />
      </div>
      
      <button 
        onClick={handleApply}
        className="h-11 px-6 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
      >
        Apply Filter
      </button>

      {initialDate && (
        <Link 
          href="/notifications?tab=history" 
          className="h-11 px-4 flex items-center justify-center text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
        >
          Clear Filter
        </Link>
      )}
    </div>
  );
}
