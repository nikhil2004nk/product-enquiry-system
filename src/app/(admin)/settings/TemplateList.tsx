"use client";

import { useState, useTransition } from "react";
import { createTemplate, updateTemplate, deleteTemplate, setDefaultTemplate } from "./actions";
import { MessageSquare, Save, CheckCircle2, Trash2, Edit2, Plus, Star, ChevronDown, ChevronUp } from "lucide-react";

type Template = {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
};

function TemplateItem({ 
  t, 
  onEdit, 
  onDelete, 
  onSetDefault 
}: { 
  t: Template, 
  onEdit: (t: Template) => void, 
  onDelete: (id: string) => void, 
  onSetDefault: (id: string) => void 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className={`card overflow-hidden transition-all duration-200 ${t.isDefault ? "border-indigo-500 ring-1 ring-indigo-500 shadow-sm" : ""}`}>
      <div 
        className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          <h3 className="font-bold text-gray-900">{t.name}</h3>
          {t.isDefault && <span className="badge badge-new flex items-center gap-1"><Star size={10} className="fill-indigo-600" /> Default</span>}
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {!t.isDefault && (
            <button onClick={() => onSetDefault(t.id)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded transition-colors">Set Default</button>
          )}
          <button onClick={() => onEdit(t)} className="text-gray-400 hover:text-indigo-600 p-1 transition-colors"><Edit2 size={16} /></button>
          <button onClick={() => onDelete(t.id)} className="text-gray-400 hover:text-red-600 p-1 transition-colors"><Trash2 size={16} /></button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-5 pb-5 pt-0 animate-fade-up" style={{ animationDuration: "200ms" }}>
          <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans bg-gray-50 p-4 rounded-xl border border-gray-100 mt-2">{t.content}</pre>
        </div>
      )}
    </div>
  );
}

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
          <TemplateItem 
            key={t.id} 
            t={t} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            onSetDefault={handleSetDefault} 
          />
        ))}
        {templates.length === 0 && !isCreating && (
          <div className="text-center p-8 text-gray-500">No templates found. Create one above!</div>
        )}
      </div>
    </div>
  );
}
