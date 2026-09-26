"use client";

import { useState } from "react";
import { assignEnquiry } from "../actions";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

export function AssignDropdown({
  enquiryId,
  admins,
  initialValue = ""
}: {
  enquiryId: string;
  admins: { id: string; name: string }[];
  initialValue?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [assigned, setAssigned] = useState(initialValue);

  async function handleAssign(adminId: string) {
    if (!adminId) return;

    setLoading(true);
    await assignEnquiry(enquiryId, adminId);
    setAssigned(adminId);
    setLoading(false);
  }

  return (
    <div className="relative w-36 text-left">
      <CustomDropdown
        value={assigned}
        size="sm"
        onChange={handleAssign}
        options={admins.map(a => ({ value: a.id, label: a.name }))}
        placeholder="Assign to..."
      />
      {loading && <div className="absolute right-9 top-3 w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin pointer-events-none" />}
    </div>
  );
}
