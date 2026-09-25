"use client";

import { useState, useTransition } from "react";
import { registerUser, deleteUser } from "./actions";
import { Trash2, UserPlus, AlertCircle, CheckCircle2, Shield } from "lucide-react";

type User = { id: string; name: string; mobile: string; createdAt: Date };

export default function UsersClient({ initialUsers }: { initialUsers: User[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await registerUser(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess("User added successfully!");
        form.reset();
        setTimeout(() => setSuccess(""), 3000);
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke access for ${name}?`)) return;
    setError("");
    startTransition(async () => {
      const result = await deleteUser(id);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* ── User List ───────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-3">
        <p className="section-label mb-4">Active Users</p>
        {initialUsers.map((user) => {
          const initials = user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
          return (
            <div key={user.id} className="card p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">{user.mobile}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(user.id, user.name)}
                disabled={isPending || initialUsers.length <= 1}
                className="btn btn-danger p-2.5 shrink-0"
                title="Revoke Access"
              >
                <Trash2 size={17} />
              </button>
            </div>
          );
        })}
        {initialUsers.length <= 1 && (
          <p className="text-xs text-gray-400 italic px-1">At least one admin must exist at all times.</p>
        )}
      </div>

      {/* ── Add User Form ───────────────────────────────── */}
      <div className="lg:col-span-1">
        <div className="card p-6 sticky top-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <UserPlus size={16} className="text-indigo-600" />
            </div>
            <h2 className="font-bold text-gray-900">Add New User</h2>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3.5 py-3">
              <AlertCircle size={15} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3.5 py-3">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <p className="text-sm text-emerald-700 font-medium">{success}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <input type="text" name="name" placeholder="User Name" required className="input" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mobile</label>
              <input type="tel" name="mobile" placeholder="10 digits" maxLength={10} required className="input" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Login PIN</label>
              <div className="relative">
                <Shield size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input type="password" name="pin" placeholder="4-digit PIN" maxLength={4} minLength={4} pattern="[0-9]{4}" inputMode="numeric" required className="input !pl-10" />
              </div>
            </div>
            <button type="submit" disabled={isPending} className="btn btn-primary w-full mt-2">
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <><UserPlus size={15} /> Add User</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
