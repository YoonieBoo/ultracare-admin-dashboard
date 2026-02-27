"use client";

import {
  LayoutDashboard,
  Users,
  CreditCard,
  Cpu,
  AlertTriangle,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/utils/auth";

const navItems = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "households", label: "Household Admins", icon: Users },
  { key: "subscriptions", label: "Subscriptions", icon: CreditCard },
  { key: "devices", label: "Devices", icon: Cpu },
  { key: "alerts", label: "Alerts", icon: AlertTriangle },
];

export default function Sidebar({ activePage, onNavigate, mobileOpen = false, onClose }) {
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) router.push("/login");
  }, [router]);

  return (
    <>
      {mobileOpen ? (
        <button
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-label="Close navigation menu"
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-60 flex-col border-r border-border bg-card transition-transform lg:z-40 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:flex`}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="UltraCare Logo"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
            <span className="font-semibold text-foreground">UltraCare Admin</span>
          </div>
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground lg:hidden"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" role="navigation" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.key;

            return (
              <button
                key={item.key}
                onClick={() => {
                  onNavigate(item.key);
                  if (onClose) onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
              SA
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">Super Admin</span>
              <span className="text-xs text-muted-foreground">admin@ultracare.io</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
