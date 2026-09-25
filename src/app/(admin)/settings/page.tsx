import { prisma } from "@/lib/prisma";
import TemplateList from "./TemplateList";
import ChangePinForm from "./ChangePinForm";
import SettingsTabs from "./SettingsTabs";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const templates = await (prisma as any).messageTemplate.findMany({
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-up">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Global Settings</h1>
          <p className="text-sm text-gray-400">Manage system configurations and templates</p>
        </div>
      </div>

      <SettingsTabs 
        templatesTab={
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <TemplateList templates={templates} />
            </div>

            <div className="w-full md:w-72 shrink-0">
              <div className="card p-5 bg-indigo-50/50 border-indigo-100">
                <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                  <MessageSquare size={16} className="text-indigo-600" />
                  Available Variables
                </h3>
                <p className="text-xs text-indigo-700/70 mb-4">
                  Use these placeholders in your templates. They will be replaced dynamically when an enquiry is generated.
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
        }
        securityTab={
          <div className="max-w-2xl">
            <ChangePinForm />
          </div>
        }
      />
    </div>
  );
}
