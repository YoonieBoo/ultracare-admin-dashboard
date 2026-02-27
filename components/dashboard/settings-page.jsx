"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { getAdminStats } from "@/services/admin";

export default function SettingsPage() {
  const router = useRouter();
  const [healthData, setHealthData] = useState(null);
  const [statsData, setStatsData] = useState(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      api.get("/health").catch(() => ({ data: null })),
      getAdminStats().catch(() => null),
    ])
      .then(([healthRes, statsRes]) => {
        if (!mounted) return;
        setHealthData(healthRes?.data ?? null);
        setStatsData(statsRes ?? null);
      })
      .catch((err) => {
        if (err?.response?.status === 401) router.push("/login");
      });

    return () => {
      mounted = false;
    };
  }, [router]);

  const adminEmail = useMemo(() => {
    if (typeof window === "undefined") return "admin@ultracare.io";
    const token = localStorage.getItem("ultracare_admin_token");
    if (!token) return "admin@ultracare.io";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.email || payload?.user?.email || "admin@ultracare.io";
    } catch (e) {
      return "admin@ultracare.io";
    }
  }, []);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const apiVersion = healthData?.version || healthData?.apiVersion || "v2.4.1";
  const webhookUrl = healthData?.webhookUrl || `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ultracare-backend-jxny.onrender.com/api"}/alerts`;
  const sensitivity = healthData?.fallDetectionSensitivity || healthData?.alertThreshold || "75%";
  const emailNotificationsEnabled =
    typeof healthData?.emailNotificationsEnabled === "boolean"
      ? healthData.emailNotificationsEnabled
      : true;
  const escalationMinutes = healthData?.autoEscalationMinutes || 15;
  const platformName = healthData?.platformName || "UltraCare";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform configuration and admin preferences</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-md border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-muted/50 px-5 py-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">General</span>
          </div>
          <div className="divide-y divide-border">
            <div className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-medium text-foreground">Platform Name</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Display name shown across the admin console</p>
              </div>
              <span className="text-sm text-foreground">{platformName}</span>
            </div>
            <div className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-medium text-foreground">Admin Email</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Primary contact for system notifications</p>
              </div>
              <span className="text-sm text-muted-foreground">{adminEmail}</span>
            </div>
            <div className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-medium text-foreground">Timezone</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Default timezone for reporting and alerts</p>
              </div>
              <span className="text-sm text-muted-foreground">{timezone}</span>
            </div>
          </div>
        </section>

      </div>

      <section className="rounded-md border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/50 px-5 py-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">API & Integrations</span>
        </div>
        <div className="divide-y divide-border">
          <div className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-medium text-foreground">API Version</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Current API version in production</p>
            </div>
            <span className="font-mono text-sm text-muted-foreground">{apiVersion}</span>
          </div>
          <div className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-medium text-foreground">Webhook URL</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Endpoint for external alert delivery</p>
            </div>
            <span className="max-w-full overflow-hidden text-ellipsis font-mono text-xs text-muted-foreground md:max-w-[420px]">
              {webhookUrl}
            </span>
          </div>
          <div className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-medium text-foreground">Alerts (Today)</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Real-time count from platform stats</p>
            </div>
            <span className="font-mono text-sm text-muted-foreground">{statsData?.alertsToday ?? "-"}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
