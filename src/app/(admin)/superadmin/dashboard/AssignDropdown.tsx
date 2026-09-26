"use client";

import { useState } from "react";
import { assignEnquiry } from "../actions";

export function AssignDropdown({
  enquiryId,
  admins
}: {
  enquiryId: string;
  admins: { id: string; name: string }[];
}) {
  const [loading, setLoading] = useState(false);

  async function handleAssign(e: React.ChangeEvent<HTMLSelectElement>) {
    const adminId = e.target.value;
    if (!adminId) return;

    setLoading(true);
    await assignEnquiry(enquiryId, adminId);
    setLoading(false);
  }

  return (
    <div className="relative">
      <select
        className="input !py-1 !text-xs !bg-gray-50 border-gray-200 focus:border-indigo-500 font-semibold cursor-pointer w-32"
        onChange={handleAssign}
        disabled={loading}
        defaultValue=""
      >
        <option value="" disabled>Assign to...</option>
        {admins.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      {loading && <div className="absolute right-2 top-2 w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />}
    </div>
  );
}
