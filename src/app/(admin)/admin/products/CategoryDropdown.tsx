"use client";

import { useState } from "react";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

export function CategoryDropdown({ categories }: { categories: { id: string; name: string }[] }) {
  const [selected, setSelected] = useState("");

  const options = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <div className="flex-1 min-w-0">
      <CustomDropdown
        options={options}
        value={selected}
        onChange={setSelected}
        placeholder="Select Category"
      />
      <input type="hidden" name="categoryId" value={selected} required />
    </div>
  );
}
