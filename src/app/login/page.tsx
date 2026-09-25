"use client";

import { useTransition, useState } from "react";
import { loginAdmin } from "@/app/login/actions";
import { Zap, Phone, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAdmin(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-sm">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
          >
            <Zap size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Store Assistant</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to access the dashboard</p>
        </div>

        {/* Card */}
        <div className="card p-7">
          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mobile Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="tel"
                  name="mobile"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  inputMode="numeric"
                  required
                  className="input !pl-10"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Secret PIN</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="password"
                  name="pin"
                  placeholder="4-digit PIN"
                  maxLength={4}
                  minLength={4}
                  pattern="[0-9]{4}"
                  inputMode="numeric"
                  required
                  className="input !pl-10"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isPending}
                className="btn btn-primary w-full"
              >
                {isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : "Sign In"}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">Internal system · Authorized access only</p>
      </div>
    </main>
  );
}
