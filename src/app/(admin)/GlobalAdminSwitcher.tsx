"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { getAdmins, setAdminFilter } from "./actions";
import { Users, ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export function GlobalAdminSwitcher() {
  const [admins, setAdmins] = useState<{ id: string; name: string }[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Read from localStorage for immediate client-side UI sync
    const saved = localStorage.getItem("admin_filter_id");
    if (saved) setCurrentAdmin(saved);
    else {
      // Fallback to cookie
      const match = document.cookie.match(/(^| )admin_filter_id=([^;]+)/);
      if (match) {
        setCurrentAdmin(match[2]);
        localStorage.setItem("admin_filter_id", match[2]);
      }
    }

    getAdmins().then(setAdmins);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <div className="mb-5">
      <p className="px-3 pt-1 pb-1.5 font-bold uppercase tracking-widest text-white/30" style={{ fontSize: 9.5 }}>
        Viewing As
      </p>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isPending}
          className="w-full flex items-center justify-between bg-white/10 hover:bg-white/15 transition-colors text-white border-0 rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-50"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Users size={14} className="text-indigo-300 shrink-0" />
            <span className="truncate">
              {currentAdmin === "" 
                ? "All Admins (Mixed)" 
                : admins.find(a => a.id === currentAdmin)?.name || "Loading..."}
            </span>
          </div>
          {isPending ? (
            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <ChevronDown size={14} className={`text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </button>

        {isOpen && (
          <div className="absolute top-full mt-1 w-full z-50 bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <button
              onClick={() => {
                setIsOpen(false);
                setCurrentAdmin("");
                localStorage.removeItem("admin_filter_id");
                startTransition(async () => {
                  await setAdminFilter("");
                  router.refresh(); // Soft refresh Next.js cache
                  setTimeout(() => window.location.reload(), 100); // Hard refresh to ensure everything syncs
                });
              }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center justify-between transition-colors text-gray-900"
            >
              <span className={currentAdmin === "" ? "font-bold text-indigo-600" : "font-medium"}>All Admins (Mixed)</span>
              {currentAdmin === "" && <Check size={14} className="text-indigo-600" />}
            </button>
            {admins.map((admin) => (
              <button
                key={admin.id}
                onClick={() => {
                  setIsOpen(false);
                  setCurrentAdmin(admin.id);
                  localStorage.setItem("admin_filter_id", admin.id);
                  startTransition(async () => {
                    await setAdminFilter(admin.id);
                    router.refresh();
                    setTimeout(() => window.location.reload(), 100);
                  });
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center justify-between transition-colors text-gray-900"
              >
                <span className={currentAdmin === admin.id ? "font-bold text-indigo-600" : "font-medium"}>{admin.name}</span>
                {currentAdmin === admin.id && <Check size={14} className="text-indigo-600" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
