"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { createPortal } from "react-dom";

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  size?: "sm" | "md";
}

export function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select…",
  disabled = false,
  searchable = true,
  size = "md",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropUp, setDropUp] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const filtered = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  // Calculate position relative to viewport for portal rendering
  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const panelH = Math.min(filtered.length * 38 + (searchable ? 48 : 0) + 12, 260);
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    const goUp = spaceBelow < panelH && spaceAbove > spaceBelow;

    setDropUp(goUp);
    setPanelStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 9999999, // Ensure it's above ResolveModal (999999)
      ...(goUp
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  }, [filtered.length, searchable]);

  const openDropdown = () => {
    if (disabled) return;
    calcPosition();
    setIsOpen(true);
  };

  // Recalculate on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    const update = () => calcPosition();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen, calcPosition]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current && !triggerRef.current.contains(target)) {
        // Check if click is inside the portal panel
        const panel = document.getElementById("dropdown-portal-panel");
        if (panel && panel.contains(target)) return;
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Focus search on open
  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 40);
    }
  }, [isOpen, searchable]);

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
    setSearch("");
  };

  const panel = isOpen && (
    <div
      id="dropdown-portal-panel"
      style={{ ...panelStyle, maxHeight: "300px" }}
      className="bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden animate-dropdown flex flex-col z-[9999999]"
    >
      {/* Search */}
      {searchable && (
        <div className="p-2 border-b border-gray-100 flex items-center gap-1.5 shrink-0 bg-white sticky top-0 z-10">
          <Search size={12} className="text-gray-400 shrink-0 ml-1" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="flex-1 text-xs outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* Options — virtualized scroll */}
      <ul className="overflow-y-auto flex-1">
        {filtered.length === 0 ? (
          <li className="px-4 py-3 text-xs text-gray-400 text-center">No matches</li>
        ) : (
          filtered.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(opt.value); }}
                className={`flex items-center justify-between px-4 cursor-pointer transition-colors select-none ${
                  isSelected
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                style={{ paddingTop: 9, paddingBottom: 9, fontSize: 12.5 }}
              >
                <span className="truncate pr-2">{opt.label}</span>
                {isSelected && <Check size={12} className="text-indigo-600 shrink-0" />}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );


  return (
    <div className="relative w-full">
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => (isOpen ? (setIsOpen(false), setSearch("")) : openDropdown())}
        className={[
          "w-full flex items-center justify-between gap-2 rounded-xl text-left outline-none transition-all duration-150 border-[1.5px]",
          size === "sm" ? "px-2.5 py-1.5" : "px-3.5 py-2.5",
          disabled
            ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
            : isOpen
            ? "bg-white border-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.10)]"
            : "bg-white border-gray-200 hover:border-gray-300 cursor-pointer",
        ].join(" ")}
        style={{ fontSize: 12.5 }}
      >
        <span className={selectedOption ? "text-gray-900 font-medium truncate" : "text-gray-400 truncate"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-indigo-500" : "text-gray-400"}`}
        />
      </button>

      {/* Portal — renders outside any overflow:hidden parent */}
      {typeof document !== "undefined" && panel && createPortal(panel, document.body)}
    </div>
  );
}
