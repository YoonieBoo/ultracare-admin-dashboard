"use client";

import { Users, CreditCard, Cpu, AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminStats } from "@/services/admin";

const SUPPORTED_ALERT_TYPES = ["FALL_DETECTED", "NO_MOVEMENT", "UNUSUAL_ACTIVITY"];

function normalizeAlertType(rawType) {
  const value = String(rawType || "")
    .trim()
    .toUpperCase();
  if (!value) return null;
  if (value.includes("FALL")) return "FALL_DETECTED";
  if (value.includes("NO_MOVEMENT") || value.includes("NO MOVEMENT")) return "NO_MOVEMENT";
  if (value.includes("UNUSUAL")) return "UNUSUAL_ACTIVITY";
  return value;
}

function formatTimestamp(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function StatusBadge({ status }) {
  const s = String(status || "").toUpperCase();
  const styles = {
    NEW: "bg-destructive/10 text-destructive",
    ACKNOWLEDGED: "bg-muted text-muted-foreground",
    RESOLVED: "bg-primary/10 text-primary",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
        styles[s] || "bg-muted text-muted-foreground"
      }`}
    >
      {s || "UNKNOWN"}
    </span>
  );
}

export default function Overview() {
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminStats();

        if (!mounted) return;
        setStats(data);
      } catch (err) {
        if (!mounted) return;

        const status = err?.response?.status;
        if (status === 401) {
          router.push("/login");
          return;
        }

        const msg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load platform stats";
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  const totalHouseholdAdmins = stats?.totalHouseholdAdmins ?? 0;
  const activeProSubscriptions = stats?.activeProSubscriptions ?? 0;
  const totalDevices = stats?.totalDevices ?? 0;
  const alertsToday = stats?.alertsToday ?? 0;

  const recentAlerts = useMemo(() => {
    const raw = Array.isArray(stats?.recentAlerts) ? stats.recentAlerts : [];

    return raw
      .map((a) => {
        // support multiple possible backend field names (safe)
        const ts = a.timestamp || a.createdAt || a.time || a.occurredAt;
        const type = normalizeAlertType(a.type || a.alertType || a.eventType);
        return { ...a, _ts: ts, _type: type };
      })
      .filter((a) => SUPPORTED_ALERT_TYPES.includes(a._type))
      .sort((a, b) => new Date(b._ts) - new Date(a._ts));
  }, [stats]);

  const metrics = [
    {
      label: "Total Household Admins",
      value: totalHouseholdAdmins,
      icon: Users,
      description: "Registered households",
    },
    {
      label: "Active PRO Subscriptions",
      value: activeProSubscriptions,
      icon: CreditCard,
      description: "Paid active plans",
    },
    {
      label: "Total Registered Devices",
      value: totalDevices,
      icon: Cpu,
      description: "Across all households",
    },
    {
      label: "Alerts (Today)",
      value: alertsToday,
      icon: AlertTriangle,
      description: "FALL/NO_MOVEMENT/UNUSUAL",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform-wide summary and recent activity
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>

        <div className="rounded-md border border-border bg-card p-6 shadow-sm">
          <Skeleton className="h-5 w-40" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Overview</h1>
        <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform-wide summary and recent activity</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="flex min-h-28 flex-col justify-between rounded-md border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {metric.label}
                </span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-semibold tracking-tight text-foreground">
                  {metric.value}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">{metric.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Alerts</h2>
          <p className="text-sm text-muted-foreground">Latest safety events across all households</p>
        </div>

        <div className="overflow-x-auto rounded-md border border-border bg-card shadow-sm">
          <table className="min-w-[1080px] w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Timestamp
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Device ID
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Household
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Resident
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Type
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Confidence
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {recentAlerts.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-sm text-muted-foreground" colSpan={8}>
                    No alerts yet.
                  </td>
                </tr>
              ) : (
                recentAlerts.map((alert) => {
                  const id = alert.id ?? `${alert.deviceId || "device"}-${alert._ts || "time"}`;
                  const confidenceRaw = alert.confidence ?? alert.score ?? null;
                  const confidence =
                    confidenceRaw === null || confidenceRaw === undefined ? "-" : `${confidenceRaw}%`;

                  return (
                    <tr
                      key={id}
                      className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                    >
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-foreground">
                        {formatTimestamp(alert._ts)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-muted-foreground">
                        {alert.deviceId || "-"}
                      </td>
                      <td className="px-5 py-3.5 text-foreground">{alert.householdName || "-"}</td>
                      <td className="px-5 py-3.5 text-foreground">{alert.residentName || "-"}</td>
                      <td className="px-5 py-3.5 text-foreground">{alert._type || "-"}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-foreground">{confidence}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={alert.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <button className="text-xs font-medium text-primary hover:underline">
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}