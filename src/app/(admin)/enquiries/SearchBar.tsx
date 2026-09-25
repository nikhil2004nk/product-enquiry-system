"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export default function SearchBar({ filterStatus }: { filterStatus: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pushSearch = useCallback(
    (q: string) => {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (q.length >= 3) params.set("q", q);
      router.push(`/enquiries${params.size ? `?${params.toString()}` : ""}`);
    },
    [router, filterStatus]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (v.length === 0) {
      // Clear immediately
      pushSearch("");
      return;
    }

    if (v.length < 3) return; // don't search until 3 chars

    debounceRef.current = setTimeout(() => pushSearch(v), 350);
  };

  const handleClear = () => {
    setValue("");
    pushSearch("");
    inputRef.current?.focus();
  };

  // Sync if status filter changes externally
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, [filterStatus]);

  return (
    <div className="relative">
      {/* Search icon */}
      <Search
        size={17}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search name, mobile or model… (min 3 chars)"
        className="input !pl-10 !pr-10"
      />

      {/* Clear button */}
      {value.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
          aria-label="Clear search"
        >
          <X size={11} className="text-gray-600" />
        </button>
      )}

      {/* Hint when typing but < 3 chars */}
      {value.length > 0 && value.length < 3 && (
        <p className="absolute -bottom-5 left-0 text-[11px] text-gray-400">
          Type {3 - value.length} more character{3 - value.length !== 1 ? "s" : ""} to search
        </p>
      )}
    </div>
  );
}
