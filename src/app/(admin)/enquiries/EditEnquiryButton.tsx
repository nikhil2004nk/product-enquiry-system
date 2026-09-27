import Link from "next/link";
import { Edit2 } from "lucide-react";

export default function EditEnquiryButton({ enquiryId }: { enquiryId: string }) {
  return (
    <Link
      href={`/enquiries/${enquiryId}/edit`}
      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shrink-0"
      title="Edit Enquiry"
    >
      <Edit2 size={16} />
    </Link>
  );
}
