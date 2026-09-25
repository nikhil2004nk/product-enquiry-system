"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";

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
    <div className="flex flex-col gap-2 shrink-0 max-w-[130px]">
      {templates.length > 0 && (
        <select 
          className="text-[10px] p-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 w-full outline-none focus:border-emerald-400"
          value={templateId} 
          onChange={e => setTemplateId(e.target.value)}
        >
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      )}
      <button
        onClick={handleSend}
        disabled={loading}
        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 transition-colors w-full"
      >
        {loading ? <span className="w-3 h-3 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" /> : <MessageSquare size={13} />}
        {loading ? "..." : "WhatsApp"}
      </button>
    </div>
  );
}
