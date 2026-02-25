"use client";

import { Users, CreditCard, Cpu, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminStats } from "@/services/admin";

export default function Overview({ onNavigate }) {
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

  const metrics = [
    {
      label: "Total Household Admins",
      value: totalHouseholdAdmins,
      icon: Users,
      description: "Registered households",
      target: "households",
    },
    {
      label: "Active PRO Subscriptions",
      value: activeProSubscriptions,
      icon: CreditCard,
      description: "Paid active plans",
      target: "subscriptions",
    },
    {
      label: "Total Registered Devices",
      value: totalDevices,
      icon: Cpu,
      description: "Across all households",
      target: "devices",
    },
    {
      label: "Alerts (Today)",
      value: alertsToday,
      icon: AlertTriangle,
      description: "FALL/NO_MOVEMENT/UNUSUAL",
      target: "alerts",
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
            <button
              type="button"
              key={metric.label}
              onClick={() => onNavigate?.(metric.target)}
              className="flex min-h-28 w-full cursor-pointer flex-col justify-between rounded-md border border-border bg-card p-5 text-left shadow-sm transition-colors hover:bg-muted/20"
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
