"use client";

import { useState, useTransition } from "react";
import { createTemplate, updateTemplate, deleteTemplate, setDefaultTemplate } from "./actions";
import { MessageSquare, Save, CheckCircle2, Trash2, Edit2, Plus, Star } from "lucide-react";

type Template = {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
};

export default function TemplateList({ templates }: { templates: Template[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState({ name: "", content: "" });
  const [isPending, startTransition] = useTransition();

  const handleEdit = (t: Template) => {
    setEditingId(t.id);
    setFormData({ name: t.name, content: t.content });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({ name: "", content: "" });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.set("name", formData.name);
    data.set("content", formData.content);

    startTransition(async () => {
      if (isCreating) {
        await createTemplate(data);
      } else if (editingId) {
        await updateTemplate(editingId, data);
      }
      handleCancel();
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      startTransition(() => { deleteTemplate(id); });
    }
  };

  const handleSetDefault = (id: string) => {
    startTransition(() => { setDefaultTemplate(id); });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={handleCreate} className="btn btn-primary btn-sm">
          <Plus size={16} /> New Template
        </button>
      </div>

      {(isCreating || editingId) && (
        <form onSubmit={handleSave} className="card p-5 border border-indigo-200 bg-indigo-50/30">
          <h3 className="font-bold text-gray-900 mb-4">{isCreating ? "Create Template" : "Edit Template"}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Template Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="input w-full"
                required
                placeholder="e.g. Follow-up Message"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Content</label>
              <textarea
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                className="input w-full resize-y font-mono text-sm leading-relaxed p-4"
                rows={8}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={handleCancel} className="btn bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={isPending} className="btn btn-primary">
                {isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {templates.map(t => (
          <div key={t.id} className={`card p-5 ${t.isDefault ? "border-indigo-500 ring-1 ring-indigo-500" : ""}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900">{t.name}</h3>
                {t.isDefault && <span className="badge badge-new flex items-center gap-1"><Star size={10} className="fill-indigo-600" /> Default</span>}
              </div>
              <div className="flex items-center gap-2">
                {!t.isDefault && (
                  <button onClick={() => handleSetDefault(t.id)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded">Set Default</button>
                )}
                <button onClick={() => handleEdit(t)} className="text-gray-400 hover:text-indigo-600 p-1"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
              </div>
            </div>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans bg-gray-50 p-3 rounded-xl border border-gray-100">{t.content}</pre>
          </div>
        ))}
        {templates.length === 0 && !isCreating && (
          <div className="text-center p-8 text-gray-500">No templates found. Create one above!</div>
        )}
      </div>
    </div>
  );
}
