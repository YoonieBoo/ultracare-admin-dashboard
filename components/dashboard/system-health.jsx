"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

function normalizeServices(healthData) {
  if (Array.isArray(healthData?.services)) {
    return healthData.services.map((item) => ({
      service: item?.service || item?.name || "Service",
      status: item?.status || (item?.ok ? "Operational" : "Issue"),
      ok:
        typeof item?.ok === "boolean"
          ? item.ok
          : String(item?.status || "").toLowerCase() !== "down",
    }));
  }

  if (healthData && typeof healthData === "object") {
    const reserved = new Set(["ok", "status", "message", "services", "timestamp", "checkedAt"]);
    const entries = Object.entries(healthData).filter(([key, value]) => {
      if (reserved.has(key)) return false;
      return value && (typeof value === "string" || typeof value === "boolean" || typeof value === "object");
    });

    if (entries.length > 0) {
      return entries.map(([key, value]) => {
        if (value && typeof value === "object") {
          const status = value.status || (value.ok ? "Operational" : "Issue");
          const ok =
            typeof value.ok === "boolean"
              ? value.ok
              : String(status || "").toLowerCase() !== "down";
          return { service: key, status: status || "Operational", ok };
        }
        const ok = typeof value === "boolean" ? value : String(value).toLowerCase() !== "down";
        return { service: key, status: ok ? "Operational" : "Issue", ok };
      });
    }
  }

  return [];
}

export default function SystemHealth() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [healthData, setHealthData] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/health");
        if (!mounted) return;
        setHealthData(res?.data ?? null);
      } catch (err) {
        if (!mounted) return;
        if (err?.response?.status === 401) return router.push("/login");
        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            err?.message ||
            "Failed to load system health"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  const services = useMemo(() => normalizeServices(healthData), [healthData]);
  const allHealthy = services.length > 0 ? services.every((s) => s.ok) : Boolean(healthData?.ok);
  const lastCheckedAt = healthData?.checkedAt || healthData?.timestamp || null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          System Health
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time status of platform infrastructure services
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="rounded-md border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-3 bg-muted/50">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Service Status
          </span>
        </div>
        <div className="divide-y divide-border">
          {loading ? (
            <div className="px-5 py-4 text-sm text-muted-foreground">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="px-5 py-4 text-sm text-muted-foreground">No service status returned.</div>
          ) : (
            services.map((item) => (
              <div
                key={item.service}
                className="flex items-center justify-between px-5 py-4"
              >
                <span className="text-sm font-medium text-foreground">
                  {item.service}
                </span>
                <span className={`flex items-center gap-2 text-sm ${item.ok ? "text-primary" : "text-destructive"}`}>
                  <span className={`h-2 w-2 rounded-full ${item.ok ? "bg-primary" : "bg-destructive"}`} />
                  {item.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Last system check
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {lastCheckedAt
                ? `Last reported at ${new Date(lastCheckedAt).toLocaleString()}`
                : "Live health data loaded from backend."}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
              allHealthy
                ? "bg-primary/10 text-primary"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {allHealthy ? "All Systems Operational" : "System Attention Needed"}
          </span>
        </div>
      </div>
    </div>
  );
}
