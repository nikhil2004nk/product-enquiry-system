"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, PlusCircle, Clock, Settings, Users, Zap, LogOut, Link as LinkIcon, Check } from "lucide-react";
import { logoutAdmin } from "@/app/login/actions";
import { useTransition, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const handleCopyPublicLink = () => {
    const url = `${window.location.origin}/enquiry`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAdmin();
    });
  };

  const navItems = [
    { href: "/dashboard", icon: <Home size={15} />, label: "Dashboard", match: (p: string) => p === "/dashboard" },
    { href: "/admin-enquiry", icon: <PlusCircle size={15} />, label: "New Enquiry", match: (p: string) => p === "/admin-enquiry" },
    { href: "/enquiries", icon: <Clock size={15} />, label: "History", match: (p: string) => p.startsWith("/enquiries") },
  ];

  const adminItems = [
    { href: "/admin/products", icon: <Settings size={15} />, label: "Manage Products", match: (p: string) => p.startsWith("/admin/products") },
    { href: "/users", icon: <Users size={15} />, label: "User Access", match: (p: string) => p.startsWith("/users") },
  ];

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden" style={{ background: "var(--background)" }}>

      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside
        className="hidden md:flex w-56 flex-col sticky top-0 h-screen shrink-0"
        style={{ background: "var(--sidebar)" }}
      >
        {/* Brand */}
        <div className="flex h-13 items-center gap-2.5 px-5 border-b border-white/10" style={{ height: 52 }}>
          <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center shadow">
            <Zap size={13} className="text-white" />
          </div>
          <span className="text-white font-bold tracking-tight" style={{ fontSize: 13 }}>Enquiry CRM</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-4 flex flex-col gap-0.5 overflow-y-auto">
          <SidebarLabel>Main</SidebarLabel>
          {navItems.map((item) => (
            <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} active={item.match(pathname)} />
          ))}

          <div className="pt-4">
            <SidebarLabel>Admin</SidebarLabel>
          </div>
          {adminItems.map((item) => (
            <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} active={item.match(pathname)} />
          ))}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Copy Public Link */}
          <div className="px-1 mb-2">
            <button
              onClick={handleCopyPublicLink}
              className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 font-bold transition-all duration-150 bg-white/10 hover:bg-white/15 text-white shadow-sm"
              style={{ fontSize: 12.5 }}
            >
              {copied ? <Check size={14} className="text-green-400" /> : <LinkIcon size={14} />}
              {copied ? "Link Copied!" : "Share Public Link"}
            </button>
          </div>

          {/* Logout */}
          <div className="pt-2 border-t border-white/10 mt-2">
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 font-semibold transition-all duration-150 text-white/50 hover:bg-red-500/15 hover:text-red-400 disabled:opacity-50"
              style={{ fontSize: 12.5 }}
            >
              <LogOut size={14} />
              {isPending ? "Signing out…" : "Sign Out"}
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-white/10">
          <p className="text-white/20 text-center" style={{ fontSize: 10 }}>Store CRM · v2.0</p>
        </div>
      </aside>

      {/* ── Main Area ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden">

        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-30 flex h-12 items-center justify-between px-4 bg-white/90 backdrop-blur-md border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="font-bold text-gray-900" style={{ fontSize: 13 }}>Enquiry CRM</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyPublicLink}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-indigo-500 hover:bg-indigo-50 transition-colors"
              title="Copy Public Link"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <LinkIcon size={16} />}
            </button>
            <Link href="/users" className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <Users size={16} />
            </Link>
            <Link href="/admin/products" className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <Settings size={16} />
            </Link>
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 page-pad overflow-y-auto">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Nav ───────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center h-14 bg-white/95 backdrop-blur-md border-t border-gray-100">
        <MobileNavItem href="/dashboard" icon={<Home size={19} />} label="Home" active={pathname === "/dashboard"} />

        {/* Center FAB */}
        <div className="flex flex-col items-center -mt-4">
          <Link
            href="/enquiry"
            className="flex items-center justify-center w-12 h-12 rounded-2xl text-white transition-transform active:scale-95"
            style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow: "0 6px 20px rgba(79,70,229,0.4)" }}
          >
            <PlusCircle size={22} />
          </Link>
          <span className="mt-0.5 font-semibold text-indigo-600" style={{ fontSize: 10 }}>New</span>
        </div>

        <MobileNavItem href="/enquiries" icon={<Clock size={19} />} label="History" active={pathname.startsWith("/enquiries")} />
      </nav>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function SidebarLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-1 pb-1.5 font-bold uppercase tracking-widest text-white/30"
      style={{ fontSize: 9.5 }}>
      {children}
    </p>
  );
}

function NavItem({
  href, icon, label, active,
}: {
  href: string; icon: React.ReactNode; label: string; active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 font-semibold transition-all duration-150 ${active
          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900/30"
          : "text-white/55 hover:bg-white/8 hover:text-white"
        }`}
      style={{ fontSize: 12.5 }}
    >
      <span className={active ? "text-white" : "text-white/45"}>{icon}</span>
      {label}
    </Link>
  );
}

function MobileNavItem({
  href, icon, label, active,
}: {
  href: string; icon: React.ReactNode; label: string; active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-0.5 px-5 h-full transition-colors ${active ? "text-indigo-600" : "text-gray-400 hover:text-gray-700"
        }`}
    >
      {icon}
      <span className="font-semibold" style={{ fontSize: 10 }}>{label}</span>
    </Link>
  );
}
