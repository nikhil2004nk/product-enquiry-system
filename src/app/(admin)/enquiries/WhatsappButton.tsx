"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { logInteraction } from "./actions";

type Template = {
  id: string;
  name: string;
  isDefault: boolean;
};

export default function WhatsappButton({ 
  enquiryId, 
  mobile, 
  templates 
}: { 
  enquiryId: string, 
  mobile: string, 
  templates: Template[] 
}) {
  const defaultTemplate = templates.find(t => t.isDefault)?.id || (templates.length > 0 ? templates[0].id : "");
  const [templateId, setTemplateId] = useState(defaultTemplate);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      const templateName = templates.find(t => t.id === templateId)?.name || "Message";
      await logInteraction(enquiryId, "WHATSAPP_SENT", `WhatsApp sent (Template: ${templateName})`);

      const res = await fetch(`/api/enquiries/${enquiryId}/whatsapp?templateId=${templateId}`);
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (e) {
      window.open(`https://wa.me/91${mobile}`, "_blank");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {templates.length > 0 && (
        <div className="w-[180px]">
          <CustomDropdown
            value={templateId}
            onChange={(val) => setTemplateId(val)}
            options={templates.map(t => ({ value: t.id, label: t.name }))}
            searchable={false}
            size="sm"
          />
        </div>
      )}
      <button
        onClick={handleSend}
        disabled={loading}
        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 transition-colors whitespace-nowrap border-[1.5px] border-emerald-100/50"
      >
        {loading ? <span className="w-3 h-3 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" /> : <MessageSquare size={13} />}
        {loading ? "..." : "WhatsApp"}
      </button>
    </div>
  );
}
