"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

export default function SourceFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSource = searchParams.get("source") || "";

  const options = [
    { value: "", label: "All Sources" },
    { value: "ADMIN", label: "Admin" },
    { value: "PUBLIC", label: "Public" },
  ];

  const updateFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("source", value);
    } else {
      params.delete("source");
    }
    router.push(`/enquiries?${params.toString()}`);
  };

  return (
    <div className="w-full sm:w-40 shrink-0">
      <CustomDropdown
        value={currentSource}
        onChange={updateFilter}
        options={options}
        placeholder="All Sources"
        searchable={false}
      />
    </div>
  );
}
