"use client";

import { useTransition, useState, useRef } from "react";
import { loginAdmin } from "@/app/login/actions";
import { Zap, Phone, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [pin, setPin] = useState(["", "", "", ""]);
  const [showPin, setShowPin] = useState(false);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePinChange = (index: number, val: string) => {
    // Only allow numbers
    const numericVal = val.replace(/\D/g, "").slice(-1);
    
    const newPin = [...pin];
    newPin[index] = numericVal;
    setPin(newPin);

    // Auto-focus next if a digit was entered
    if (numericVal && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const pinString = pin.join("");
    
    if (pinString.length !== 4) {
      setError("Please enter a valid 4-digit PIN.");
      return;
    }
    
    formData.set("pin", pinString);

    startTransition(async () => {
      const result = await loginAdmin(formData);
      if (result?.error) {
        setError(result.error);
        // Optional: clear PIN on error
        setPin(["", "", "", ""]);
        pinRefs.current[0]?.focus();
      }
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-sm animate-fade-up">
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
            <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 animate-fade-up" style={{ animationDuration: "200ms" }}>
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
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
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Secret PIN</label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showPin ? "Hide" : "Show"}
                </button>
              </div>
              <div className="flex gap-3 justify-between">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      pinRefs.current[index] = el;
                    }}
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={pin[index]}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(index, e)}
                    className="w-14 h-14 text-center text-xl font-black rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                    required
                  />
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="btn btn-primary w-full shadow-lg shadow-indigo-500/25 py-3"
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

        <p className="text-center text-xs text-gray-400 mt-6 font-medium tracking-wide">Internal system · Authorized access only</p>
      </div>
    </main>
  );
}
