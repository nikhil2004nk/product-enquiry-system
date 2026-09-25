"use client";

import { useState } from "react";
import { MessageSquare, Lock } from "lucide-react";

export default function SettingsTabs({
  templatesTab,
  securityTab
}: {
  templatesTab: React.ReactNode;
  securityTab: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<"templates" | "security">("templates");

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("templates")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all border-b-2 ${
            activeTab === "templates" 
              ? "border-indigo-600 text-indigo-600" 
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <MessageSquare size={16} />
          WhatsApp Templates
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all border-b-2 ${
            activeTab === "security" 
              ? "border-indigo-600 text-indigo-600" 
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <Lock size={16} />
          Security & PIN
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-up">
        {activeTab === "templates" && templatesTab}
        {activeTab === "security" && securityTab}
      </div>
    </div>
  );
}
