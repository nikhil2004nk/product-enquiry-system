"use client";

import { useState, useTransition, useRef } from "react";
import { Lock, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { changePin } from "./actions";

function PinInputGroup({ 
  label, 
  pin, 
  setPin, 
  showPin 
}: { 
  label: string, 
  pin: string[], 
  setPin: (val: string[]) => void, 
  showPin: boolean 
}) {
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePinChange = (index: number, val: string) => {
    const numericVal = val.replace(/\D/g, "").slice(-1);
    const newPin = [...pin];
    newPin[index] = numericVal;
    setPin(newPin);
    if (numericVal && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">{label}</label>
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
  );
}

export default function ChangePinForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPin, setShowPin] = useState(false);

  const [currentPin, setCurrentPin] = useState(["", "", "", ""]);
  const [newPin, setNewPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const currentStr = currentPin.join("");
    const newStr = newPin.join("");
    const confirmStr = confirmPin.join("");

    if (currentStr.length !== 4 || newStr.length !== 4 || confirmStr.length !== 4) {
      setError("Please completely fill out all PINs");
      return;
    }

    const formData = new FormData();
    formData.set("currentPin", currentStr);
    formData.set("newPin", newStr);
    formData.set("confirmPin", confirmStr);

    startTransition(async () => {
      const result = await changePin(formData);
      if (result.success) {
        setMessage("PIN updated successfully!");
        setCurrentPin(["", "", "", ""]);
        setNewPin(["", "", "", ""]);
        setConfirmPin(["", "", "", ""]);
        setTimeout(() => setMessage(""), 4000);
      } else {
        setError(result.error || "Failed to update PIN");
      }
    });
  };

  return (
    <div className="card p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-xl">
            <Lock size={20} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Change PIN</h2>
            <p className="text-xs text-gray-400 mt-0.5">Update your login PIN for the dashboard</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowPin(!showPin)}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg"
        >
          {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
          {showPin ? "Hide" : "Show"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-[280px]">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl animate-fade-up">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 animate-fade-up">
            <CheckCircle2 size={16} />
            {message}
          </div>
        )}

        <PinInputGroup label="Current PIN" pin={currentPin} setPin={setCurrentPin} showPin={showPin} />
        <PinInputGroup label="New PIN" pin={newPin} setPin={setNewPin} showPin={showPin} />
        <PinInputGroup label="Confirm New PIN" pin={confirmPin} setPin={setConfirmPin} showPin={showPin} />

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="btn btn-primary w-full py-3"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Lock size={16} />
            )}
            {isPending ? "Updating..." : "Update PIN"}
          </button>
        </div>
      </form>
    </div>
  );
}
