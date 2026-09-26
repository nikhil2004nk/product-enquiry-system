"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";

interface CustomDateTimePickerProps {
  value: Date | undefined;
  onChange: (date: Date) => void;
  placeholder?: string;
}

export function CustomDateTimePicker({ value, onChange, placeholder = "Select Date & Time" }: CustomDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  // Local state for the calendar view (what month we are looking at)
  const [viewDate, setViewDate] = useState(() => value ? new Date(value) : new Date());
  
  // Local state for the time inputs
  const defaultHour = new Date().getHours() % 12 || 12;
  const defaultMin = String(new Date().getMinutes()).padStart(2, "0");
  const defaultAmPm = new Date().getHours() >= 12 ? "PM" : "AM";
  
  const [hour, setHour] = useState(value ? String(value.getHours() % 12 || 12).padStart(2, "0") : String(defaultHour).padStart(2, "0"));
  const [minute, setMinute] = useState(value ? String(value.getMinutes()).padStart(2, "0") : defaultMin);
  const [ampm, setAmpm] = useState(value ? (value.getHours() >= 12 ? "PM" : "AM") : defaultAmPm);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    let finalHour = parseInt(hour, 10) || 12;
    if (ampm === "PM" && finalHour < 12) finalHour += 12;
    if (ampm === "AM" && finalHour === 12) finalHour = 0;
    
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, finalHour, parseInt(minute, 10) || 0);
    onChange(newDate);
    // Don't close automatically so they can adjust time if needed, or close it if we want it quick.
    // Let's keep it open so they can verify time.
  };

  // Sync time changes to actual value if date is selected
  useEffect(() => {
    if (!value) return;
    let finalHour = parseInt(hour, 10) || 12;
    if (ampm === "PM" && finalHour < 12) finalHour += 12;
    if (ampm === "AM" && finalHour === 12) finalHour = 0;
    
    const newDate = new Date(value.getFullYear(), value.getMonth(), value.getDate(), finalHour, parseInt(minute, 10) || 0);
    if (newDate.getTime() !== value.getTime()) {
      onChange(newDate);
    }
  }, [hour, minute, ampm]);

  // Render Calendar Grid
  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);
  for (let d = 1; d <= daysInMonth; d++) {
    const isSelected = value && value.getDate() === d && value.getMonth() === viewDate.getMonth() && value.getFullYear() === viewDate.getFullYear();
    const isToday = new Date().getDate() === d && new Date().getMonth() === viewDate.getMonth() && new Date().getFullYear() === viewDate.getFullYear();
    
    days.push(
      <button
        key={d}
        type="button"
        onClick={(e) => { e.preventDefault(); handleDayClick(d); }}
        className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all ${
          isSelected 
            ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200" 
            : isToday 
              ? "bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-100" 
              : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        {d}
      </button>
    );
  }

  const formattedValue = value ? new Intl.DateTimeFormat("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "numeric", hour12: true
  }).format(value) : "";

  const panel = isOpen && (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" 
        onClick={() => setIsOpen(false)} 
      />
      <div
        className="relative w-full max-w-[320px] bg-white rounded-2xl border border-gray-100 shadow-2xl p-4 sm:p-5 animate-scale-up"
      >
        {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={handlePrevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <span className="font-bold text-gray-900 text-sm tracking-tight">
          {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(viewDate)}
        </span>
        <button type="button" onClick={handleNextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
          <div key={d} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{d}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4 justify-items-center">
        {days}
      </div>

      {/* Time Picker */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 justify-center">
          <Clock size={14} className="text-gray-400" />
          <input 
            type="number" 
            value={hour} 
            onChange={e => setHour(e.target.value)}
            onBlur={() => setHour(h => String(Math.max(1, Math.min(12, parseInt(h) || 12))).padStart(2, "0"))}
            className="w-12 h-9 text-center rounded-lg border border-gray-200 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
          />
          <span className="text-gray-400 font-bold">:</span>
          <input 
            type="number" 
            value={minute} 
            onChange={e => setMinute(e.target.value)}
            onBlur={() => setMinute(m => String(Math.max(0, Math.min(59, parseInt(m) || 0))).padStart(2, "0"))}
            className="w-12 h-9 text-center rounded-lg border border-gray-200 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
          />
          <div className="flex bg-gray-100 rounded-lg p-0.5 ml-2">
            <button 
              type="button" 
              onClick={(e) => { e.preventDefault(); setAmpm("AM"); }}
              className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${ampm === "AM" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              AM
            </button>
            <button 
              type="button" 
              onClick={(e) => { e.preventDefault(); setAmpm("PM"); }}
              className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${ampm === "PM" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              PM
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer / Confirm */}
      <div className="mt-4 pt-3 border-t border-gray-100 text-center">
        <button
          type="button"
          onClick={() => {
            if (!value) {
              let finalHour = parseInt(hour, 10) || 12;
              if (ampm === "PM" && finalHour < 12) finalHour += 12;
              if (ampm === "AM" && finalHour === 12) finalHour = 0;
              const now = new Date();
              onChange(new Date(now.getFullYear(), now.getMonth(), now.getDate(), finalHour, parseInt(minute, 10) || 0));
            }
            setIsOpen(false);
          }}
          className="w-full h-9 bg-indigo-600 text-white font-bold rounded-lg text-sm hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Confirm
        </button>
      </div>
    </div>
    </div>
  );

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 px-3 flex items-center justify-between rounded-xl border bg-white text-sm outline-none transition-all shadow-sm ${
          isOpen ? "border-indigo-500 ring-1 ring-indigo-500" : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <CalendarIcon size={16} className={value ? "text-indigo-600 shrink-0" : "text-gray-400 shrink-0"} />
          <span className={value ? "font-semibold text-gray-900 truncate" : "text-gray-400 truncate"}>
            {value ? formattedValue : placeholder}
          </span>
        </div>
      </button>

      {typeof document !== "undefined" && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
