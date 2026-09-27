"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  label: string;
  value: string | number;
}

interface CustomSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
}

export function CustomSelect({ options, value, onChange, placeholder = "Select..." }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full sm:w-48" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-10 px-4 flex items-center justify-between rounded-xl bg-white border text-sm font-semibold outline-none transition-all shadow-sm ${
          isOpen ? "border-indigo-500 ring-1 ring-indigo-500 text-indigo-700" : "border-gray-200 text-gray-700 hover:border-gray-300"
        }`}
      >
        <span className="truncate mr-2">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-indigo-500" : "text-gray-400"}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-full min-w-[160px] bg-white border border-gray-100 rounded-xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.15)] z-[100] p-1.5 animate-fade-in origin-top-right">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between transition-colors ${
                  isSelected 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {opt.label}
                {isSelected && <Check size={14} className="text-indigo-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
