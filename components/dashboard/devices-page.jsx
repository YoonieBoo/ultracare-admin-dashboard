"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getDevices } from "@/services/devices";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatLastActive(iso) {
  if (!iso) return "Never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Never";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function DeviceStatus({ status }) {
  const isOnline = String(status || "").toLowerCase() === "online";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
        isOnline ? "text-primary" : "text-muted-foreground"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-primary" : "bg-muted-foreground/50"}`} />
      {isOnline ? "Online" : "Offline"}
    </span>
  );
}

export default function DevicesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getDevices();

        // Accept both:
        // 1) { ok: true, count: X, devices: [...] }
        // 2) [...] (just in case)
        const rawList = Array.isArray(res) ? res : res?.devices || [];

        // Normalize backend device -> UI device row
        const normalized = rawList.map((d) => {
          const deviceId = d.deviceId ?? d.device_id ?? d.id ?? "-";

          // Backend fields (based on your Postman/prisma):
          // name, room, isActive, lastSeenAt, createdAt, userId
          const name = d.name ?? "-";
          const room = d.room ?? "-";
          const isActive = Boolean(d.isActive);
          const lastSeenAt = d.lastSeenAt ?? null;
          const createdAt = d.createdAt ?? null;
          const userId = d.userId ?? null;

          return {
            id: d.id ?? deviceId, // React key
            deviceId,
            household: userId ?? "Unassigned",
            location: room !== "-" ? room : "-", // use room as location for now
            status: isActive ? "Online" : "Offline",
            registeredDate: formatDate(createdAt),
            lastActive: formatLastActive(lastSeenAt),
            _raw: d,
          };
        });

        if (mounted) setDevices(normalized);
      } catch (err) {
        if (!mounted) return;

        const status = err?.response?.status;
        if (status === 401) return router.push("/login");

        const msg =
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load devices";
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  const onlineCount = useMemo(
    () => devices.filter((d) => String(d.status).toLowerCase() === "online").length,
    [devices]
  );
  const offlineCount = useMemo(
    () => devices.filter((d) => String(d.status).toLowerCase() === "offline").length,
    [devices]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Devices</h1>
          <p className="mt-1 text-sm text-muted-foreground">All registered monitoring devices across households</p>
        </div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Devices</h1>
          <p className="mt-1 text-sm text-muted-foreground">All registered monitoring devices across households</p>
        </div>
        <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Devices</h1>
          <p className="mt-1 text-sm text-muted-foreground">All registered monitoring devices across households</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" />
            {onlineCount} Online
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
            {offlineCount} Offline
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-card shadow-sm">
        <table className="min-w-[900px] w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Device ID</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">User ID</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Location</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Registered</th>
            </tr>
          </thead>

          <tbody>
            {devices.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-sm text-muted-foreground" colSpan={6}>
                  No devices found.
                </td>
              </tr>
            ) : (
              devices.map((device) => (
                <tr key={device.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/30">
                  <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-foreground">{device.deviceId}</td>
                  <td className="px-5 py-3.5 text-foreground">{device.household}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{device.location}</td>
                  <td className="px-5 py-3.5">
                    <DeviceStatus status={device.status} />
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{device.registeredDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
