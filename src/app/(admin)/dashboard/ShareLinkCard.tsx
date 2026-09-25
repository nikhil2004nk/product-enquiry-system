"use client";

import { Link as LinkIcon, Check } from "lucide-react";
import { useState } from "react";

export function ShareLinkCard() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = `${window.location.origin}/enquiry`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="card card-hover flex flex-col items-center justify-center p-6 text-center group border-none outline-none"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${copied ? 'bg-green-100 text-green-600' : 'bg-emerald-50 group-hover:bg-emerald-100 text-emerald-600'}`}>
        {copied ? <Check size={22} /> : <LinkIcon size={22} />}
      </div>
      <span className="font-bold text-gray-900">{copied ? "Copied!" : "Share Link"}</span>
      <span className="text-xs text-gray-400 mt-0.5">Copy public enquiry link</span>
    </button>
  );
}
