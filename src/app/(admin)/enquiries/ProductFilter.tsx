"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

type Product = { id: string; modelNumber: string; categoryId: string };
type Category = { id: string; name: string; products: Product[] };

export default function ProductFilter({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategoryId = searchParams.get("categoryId") || "";
  const currentProductId = searchParams.get("productId") || "";

  // Prepare category options
  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map(c => ({ value: c.id, label: c.name }))
  ];

  // Prepare product options based on selected category (if any)
  const products = currentCategoryId 
    ? categories.find(c => c.id === currentCategoryId)?.products || []
    : categories.flatMap(c => c.products);

  const productOptions = [
    { value: "", label: "All Models" },
    ...products.map(p => ({ value: p.id, label: p.modelNumber }))
  ];

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset product if category changes
    if (key === "categoryId") {
      params.delete("productId");
    }

    router.push(`/enquiries?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <div className="w-full sm:w-48">
        <CustomDropdown
          value={currentCategoryId}
          onChange={(val) => updateFilters("categoryId", val)}
          options={categoryOptions}
          placeholder="All Categories"
        />
      </div>
      <div className="w-full sm:w-48">
        <CustomDropdown
          value={currentProductId}
          onChange={(val) => updateFilters("productId", val)}
          options={productOptions}
          placeholder="All Models"
          disabled={products.length === 0}
        />
      </div>
    </div>
  );
}
