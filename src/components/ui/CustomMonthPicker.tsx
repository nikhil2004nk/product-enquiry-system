"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

interface CustomMonthPickerProps {
  value: string; // format: "YYYY-MM"
  onChange: (val: string) => void;
}

export function CustomMonthPicker({ value, onChange }: CustomMonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // For the calendar UI state
  const [viewYear, setViewYear] = useState(() => {
    if (value) {
      return parseInt(value.split("-")[0], 10);
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

  // Smart positioning
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      setDropdownStyle({ left: 0, right: 'auto' });
      requestAnimationFrame(() => {
        if (dropdownRef.current) {
          const rect = dropdownRef.current.getBoundingClientRect();
          if (rect.right > window.innerWidth - 16) {
            setDropdownStyle({ right: 0, left: 'auto' });
          }
        }
      });
    }
  }, [isOpen]);

  const handleSelectMonth = (monthIndex: number) => {
    const year = viewYear;
    const month = String(monthIndex + 1).padStart(2, "0");
    onChange(`${year}-${month}`);
    setIsOpen(false);
  };

  // Format display text
  let displayText = "Select Month";
  if (value) {
    const [y, m] = value.split("-");
    const date = new Date(parseInt(y), parseInt(m) - 1, 1);
    displayText = new Intl.DateTimeFormat("en-US", { timeZone: 'Asia/Kolkata', month: "long", year: "numeric" }).format(date);
  }

  return (
    <div className="relative w-full sm:w-48" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-10 px-3 flex items-center justify-between rounded-xl bg-white text-sm outline-none transition-all ${
          isOpen ? "text-indigo-600" : "text-gray-700 hover:text-gray-900"
        }`}
      >
        <div className="flex items-center gap-2">
          <Calendar size={16} className={value ? "text-indigo-600" : "text-gray-400"} />
          <span className={value ? "font-bold text-gray-900" : "text-gray-500"}>
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
              const isSelected = value === `${viewYear}-${String(idx + 1).padStart(2, "0")}`;
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
        </div>
      )}
    </div>
  );
}
