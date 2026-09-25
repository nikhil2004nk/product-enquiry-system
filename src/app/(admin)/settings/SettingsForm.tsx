"use client";

import { useState, useTransition } from "react";
import { saveWhatsappTemplate } from "./actions";
import { MessageSquare, Save, CheckCircle2 } from "lucide-react";

export default function SettingsForm({ initialTemplate }: { initialTemplate: string }) {
  const [template, setTemplate] = useState(initialTemplate);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const formData = new FormData();
    formData.set("template", template);

    startTransition(async () => {
      const result = await saveWhatsappTemplate(formData);
      if (result.success) {
        setMessage("Template saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else if (result.error) {
        alert(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-3">
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="input w-full resize-y font-mono text-sm leading-relaxed p-4"
            rows={15}
            required
            placeholder="Enter your WhatsApp message template..."
          />
          
          <div className="flex items-center gap-4">
            <button 
              type="submit" 
              disabled={isPending}
              className="btn btn-primary"
            >
              {isPending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isPending ? "Saving..." : "Save Template"}
            </button>
            
            {message && (
              <span className="text-emerald-600 text-sm font-bold flex items-center gap-1.5 animate-fade-up">
                <CheckCircle2 size={16} />
                {message}
              </span>
            )}
          </div>
        </div>

        <div className="w-full md:w-72 shrink-0">
          <div className="card p-5 bg-indigo-50/50 border-indigo-100">
            <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
              <MessageSquare size={16} className="text-indigo-600" />
              Available Variables
            </h3>
            <p className="text-xs text-indigo-700/70 mb-4">
              Use these placeholders in your template. They will be replaced dynamically when an enquiry is generated.
            </p>
            <ul className="space-y-2 text-sm font-mono text-indigo-800 bg-white p-3 rounded-lg border border-indigo-100">
              <li>{`{{customer_name}}`}</li>
              <li>{`{{model_number}}`}</li>
              <li>{`{{catalogue_url}}`}</li>
              <li>{`{{admin_name}}`}</li>
              <li>{`{{admin_mobile}}`}</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}
