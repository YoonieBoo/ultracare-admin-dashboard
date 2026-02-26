"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { getAlerts } from "@/services/alerts";
import { Skeleton } from "@/components/ui/skeleton";

const ALERT_TYPE_OPTIONS = [
  { value: "ALL", label: "All Types" },
  { value: "FALL_DETECTED", label: "Fall Detected" },
  { value: "NO_MOVEMENT", label: "No Movement" },
  { value: "UNUSUAL_ACTIVITY", label: "Unusual Activity" },
];

function normalizeAlertType(rawType) {
  const value = String(rawType || "").trim().toUpperCase();
  if (!value) return "UNKNOWN";
  if (value.includes("FALL")) return "FALL_DETECTED";
  if (value.includes("NO_MOVEMENT") || value.includes("NO MOVEMENT")) return "NO_MOVEMENT";
  if (value.includes("UNUSUAL")) return "UNUSUAL_ACTIVITY";
  return value;
}

function formatAlertType(type) {
  if (type === "FALL_DETECTED") return "Fall Detected";
  if (type === "NO_MOVEMENT") return "No Movement";
  if (type === "UNUSUAL_ACTIVITY") return "Unusual Activity";
  return type;
}

function formatTimestamp(alert) {
  const d = new Date(alert.timestampIso || alert.createdAt);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getDeviceKey(alert) {
  if (alert.deviceId) return alert.deviceId;
  if (alert.source) return alert.source;
  if (typeof alert.device === "string") return alert.device;
  if (alert.device && typeof alert.device === "object") {
    return alert.device.deviceId || alert.device.id || "";
  }
  return alert.device_id || "";
}

function getAlertDeviceId(alert) {
  return (
    alert.deviceId ??
    alert.device?.deviceId ??
    alert.device?.id ??
    alert.device_id ??
    ""
  );
}

function getAlertUserId(alert, deviceUserIdByDeviceId) {
  const directUserId =
    alert.userId ??
    alert.householdAdminId ??
    alert.householdId ??
    alert.user?.id;

  if (directUserId !== undefined && directUserId !== null && String(directUserId) !== "") {
    return directUserId;
  }

  const deviceId = getAlertDeviceId(alert);
  if (!deviceId) return "";

  return deviceUserIdByDeviceId.get(String(deviceId)) ?? "";
}

function StatusBadge({ status }) {
  const styles = {
    NEW: "bg-destructive/10 text-destructive",
    ACKNOWLEDGED: "bg-muted text-muted-foreground",
    RESOLVED: "bg-primary/10 text-primary",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${styles[status] || "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}

export default function FallAlertsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [emailByUserId, setEmailByUserId] = useState(new Map());
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    let mounted = true;

    Promise.all([
      getAlerts(),
      api.get("/app/devices").catch(() => ({ data: { devices: [] } })),
      api.get("/household-admins").catch(() => ({ data: { users: [] } })),
    ])
      .then(([alertsPayload, devicesPayload, adminsResponse]) => {
        if (!mounted) return;
        const list = Array.isArray(alertsPayload)
          ? alertsPayload
          : alertsPayload?.alerts ?? [];

        const devicesBody = devicesPayload?.data ?? devicesPayload ?? {};
        const devices = Array.isArray(devicesBody)
          ? devicesBody
          : devicesBody?.devices ?? [];
        const deviceUserIdByDeviceId = new Map(
          (Array.isArray(devices) ? devices : [])
            .filter((d) => d?.deviceId)
            .map((d) => [String(d.deviceId), d.userId])
        );

        const adminsBody = adminsResponse?.data ?? {};
        const admins =
          adminsBody?.users ??
          adminsBody?.householdAdmins ??
          adminsBody?.admins ??
          adminsBody?.data ??
          [];
        const emailLookup = new Map(
          (Array.isArray(admins) ? admins : [])
            .filter((a) => a?.id !== undefined && a?.email)
            .map((a) => [String(a.id), a.email])
        );
        setEmailByUserId(emailLookup);

        const normalized = list
          .map((alert) => ({
            ...alert,
            normalizedType: normalizeAlertType(alert.type || alert.alertType),
            _ts:
              alert.timestampIso ||
              alert.createdAt ||
              alert.timestamp ||
              alert.time ||
              alert.occurredAt ||
              null,
            deviceKey: getDeviceKey(alert),
            householdUserId: getAlertUserId(alert, deviceUserIdByDeviceId),
            displayResident: alert.elderly || alert.room || "Unknown",
            displayStatus: alert.status || "UNKNOWN",
          }))
          .filter((alert) => ["FALL_DETECTED", "NO_MOVEMENT", "UNUSUAL_ACTIVITY"].includes(alert.normalizedType));

        setAlerts(normalized);
      })
      .catch((err) => {
        if (err && err.status === 401) return router.push("/login");
        setError(err.message || "Failed to load alerts");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [router]);

  const filtered = useMemo(() => {
    const byType = typeFilter === "ALL" ? alerts : alerts.filter((alert) => alert.normalizedType === typeFilter);
    return [...byType].sort((a, b) => new Date(b._ts) - new Date(a._ts));
  }, [alerts, typeFilter]);

  const newCount = filtered.filter((a) => String(a.status || "").toUpperCase() === "NEW").length;
  const ackCount = filtered.filter((a) => String(a.status || "").toUpperCase() === "ACKNOWLEDGED").length;
  const resolvedCount = filtered.filter((a) => String(a.status || "").toUpperCase() === "RESOLVED").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Alerts</h1>
          <p className="mt-1 text-sm text-muted-foreground">FALL_DETECTED, NO_MOVEMENT, and UNUSUAL_ACTIVITY events</p>
        </div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Alerts</h1>
        <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Alerts</h1>
        <p className="mt-1 text-sm text-muted-foreground">FALL_DETECTED, NO_MOVEMENT, and UNUSUAL_ACTIVITY events</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label htmlFor="type-filter" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Type
          </label>
          <select
            id="type-filter"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
          >
            {ALERT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            <span className="text-xs font-medium text-foreground">{newCount} New</span>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-muted-foreground" />
            <span className="text-xs font-medium text-foreground">{ackCount} Acknowledged</span>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-xs font-medium text-foreground">{resolvedCount} Resolved</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-card shadow-sm">
        <table className="min-w-[1180px] w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Timestamp</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Alert Type</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Device ID</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Household Email</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Resident</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((alert) => {
              const deviceId = alert.deviceKey || "Unknown";
              const householdUserId = String(alert.householdUserId || "");
              const householdEmail =
                alert.householdEmail ||
                alert.householdAdminEmail ||
                emailByUserId.get(householdUserId) ||
                "Unassigned";

              return (
                <tr key={alert.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/30">
                  <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-foreground">{formatTimestamp(alert)}</td>
                  <td className="px-5 py-3.5 text-foreground">{formatAlertType(alert.normalizedType)}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-muted-foreground">{deviceId}</td>
                  <td className="px-5 py-3.5 text-foreground">{householdEmail}</td>
                  <td className="px-5 py-3.5 text-foreground">{alert.displayResident}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={alert.displayStatus} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
