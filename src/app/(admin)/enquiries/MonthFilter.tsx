"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function MonthFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentMonthParam = searchParams.get("month") || "";
  
  const [isOpen, setIsOpen] = useState(false);
  
  // For the calendar UI state
  const [viewYear, setViewYear] = useState(() => {
    if (currentMonthParam) {
      return parseInt(currentMonthParam.split("-")[0], 10);
    }
    return new Date().getFullYear();
  });

  const popoverRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({ left: 0, right: 'auto' });

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle smart positioning to prevent screen overflow
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      // Reset first to get natural measurement
      setDropdownStyle({ left: 0, right: 'auto' });
      
      requestAnimationFrame(() => {
        if (dropdownRef.current) {
          const rect = dropdownRef.current.getBoundingClientRect();
          const windowWidth = window.innerWidth;
          
          // If it overflows the right side of the screen
          if (rect.right > windowWidth - 16) {
            setDropdownStyle({ right: 0, left: 'auto' });
          }
        }
      });
    }
  }, [isOpen]);

  const handleSelectMonth = (monthIndex: number) => {
    const year = viewYear;
    const month = String(monthIndex + 1).padStart(2, "0");
    const val = `${year}-${month}`;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", val);
    router.push(`/enquiries?${params.toString()}`);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    const params = new URLSearchParams(searchParams.toString());
    params.delete("month");
    router.push(`/enquiries?${params.toString()}`);
    setIsOpen(false);
  };

  // Format display text
  let displayText = "Filter by Month";
  if (currentMonthParam) {
    const [y, m] = currentMonthParam.split("-");
    const date = new Date(parseInt(y), parseInt(m) - 1, 1);
    displayText = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
  }

  return (
    <div className="relative w-full sm:w-48" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-10 px-3 flex items-center justify-between rounded-xl border bg-white text-sm outline-none transition-all shadow-sm ${
          isOpen ? "border-indigo-500 ring-1 ring-indigo-500" : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="flex items-center gap-2">
          <Calendar size={16} className={currentMonthParam ? "text-indigo-600" : "text-gray-400"} />
          <span className={currentMonthParam ? "font-semibold text-gray-900" : "text-gray-500"}>
            {displayText}
          </span>
        </div>
      </button>

      {isOpen && (
        <div 
          ref={dropdownRef}
          style={dropdownStyle}
          className="absolute top-full mt-2 w-[calc(100vw-2rem)] sm:w-[320px] max-w-[320px] bg-white border border-gray-100 rounded-2xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.15)] z-[100] p-4 sm:p-5 animate-fade-in origin-top"
        >
          {/* Year Navigation */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => setViewYear(y => y - 1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-bold text-gray-900 text-lg tracking-tight">{viewYear}</span>
            <button
              onClick={() => setViewYear(y => y + 1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Months Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {MONTHS.map((m, idx) => {
              const isSelected = currentMonthParam === `${viewYear}-${String(idx + 1).padStart(2, "0")}`;
              return (
                <button
                  key={m}
                  onClick={() => handleSelectMonth(idx)}
                  className={`py-2 rounded-xl text-sm font-medium transition-all ${
                    isSelected 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>

          {currentMonthParam && (
            <div className="mt-4 pt-3 border-t border-gray-100 text-center">
              <button
                onClick={handleClear}
                className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
