import { prisma } from "@/lib/prisma";
import TemplateList from "./TemplateList";
import ChangePinForm from "./ChangePinForm";
import SettingsTabs from "./SettingsTabs";
import { MessageSquare } from "lucide-react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const isSuper = session.role === "SUPERADMIN";

  const cookieStore = await cookies();
  const filterAdminId = cookieStore.get("admin_filter_id")?.value;
  const userId = isSuper && filterAdminId ? filterAdminId : session.id;

  // Each user sees only their own templates
  const templates = await (prisma as any).messageTemplate.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  // All users see global templates (userId: null) — Super Admin can edit, others read-only
  const globalTemplates = await (prisma as any).messageTemplate.findMany({
    where: { userId: null },
    orderBy: { createdAt: "asc" },
  });

  const variablesSidebar = (
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
  );

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-up">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-sm text-gray-400">Manage your templates and account security</p>
        </div>
      </div>

      <SettingsTabs
        templatesTab={
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-6">
              {/* My personal templates */}
              <TemplateList
                templates={templates}
                userId={userId}
                label="My Templates"
              />

              {/* Global default templates — editable by Super Admin, read-only for others */}
              {globalTemplates.length > 0 && (
                <TemplateList
                  templates={globalTemplates}
                  userId={null}
                  label="Global Defaults"
                  sublabel={isSuper
                    ? "These templates are used as fallback for admins who haven't set their own"
                    : "Default templates set by Super Admin (read-only)"}
                  readOnly={!isSuper}
                />
              )}
              {isSuper && globalTemplates.length === 0 && (
                <TemplateList
                  templates={[]}
                  userId={null}
                  label="Global Defaults"
                  sublabel="These templates are used as fallback for admins who haven't set their own"
                />
              )}
            </div>

            {variablesSidebar}
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
