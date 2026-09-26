"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

export default function AssignedToFilter({
  admins,
}: {
  admins: { id: string; name: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("assignedTo") || "";

  const options = [
    { value: "", label: "All Admins" },
    { value: "unassigned", label: "Unassigned" },
    ...admins.map((a) => ({ value: a.id, label: a.name })),
  ];

  const updateFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("assignedTo", value);
    } else {
      params.delete("assignedTo");
    }
    router.push(`/enquiries?${params.toString()}`);
  };

  return (
    <div className="w-full sm:w-44 shrink-0">
      <CustomDropdown
        value={current}
        onChange={updateFilter}
        options={options}
        placeholder="Assigned To"
      />
    </div>
  );
}
