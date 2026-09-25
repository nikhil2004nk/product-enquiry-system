"use client";

import { useTransition } from "react";
import { updateEnquiryStatus } from "./actions";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

export default function StatusDropdown({
  enquiryId,
  currentStatus,
}: {
  enquiryId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  const options = [
    { value: "NEW", label: "NEW" },
    { value: "CONTACTED", label: "CONTACTED" },
    { value: "FOLLOW_UP", label: "FOLLOW-UP" },
    { value: "CLOSED", label: "CLOSED" },
  ];

  return (
    <div className={isPending ? "opacity-50" : ""}>
      <CustomDropdown
        value={currentStatus}
        searchable={false}
        size="sm"
        onChange={(val) => {
          if (val !== currentStatus) {
            startTransition(async () => {
              await updateEnquiryStatus(enquiryId, val as any);
            });
          }
        }}
        options={options}
      />
    </div>
  );
}
