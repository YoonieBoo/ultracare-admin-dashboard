"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { getHouseholdAdmins } from "@/services/householdAdmins";

const PLAN_OPTIONS = ["FREE", "PRO"];
const STATUS_OPTIONS = ["ACTIVE", "PENDING_PAYMENT"];

function inferPlan(user) {
  const raw = String(user?.plan || "").toUpperCase();
  if (raw === "PRO" || raw === "FREE") return raw;
  return "FREE";
}

function inferStatus(user) {
  const raw = String(user?.subscriptionStatus || user?.status || "").toUpperCase();
  if (raw === "ACTIVE" || raw === "PENDING_PAYMENT") return raw;
  return "ACTIVE";
}

function inferDeviceLimit(plan) {
  return plan === "PRO" ? 5 : 1;
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [originalSubscriptions, setOriginalSubscriptions] = useState([]);
  const [editedByUserId, setEditedByUserId] = useState({});
  const [mockMessage, setMockMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    getHouseholdAdmins()
      .then((res) => {
        if (!mounted) return;
        const users = Array.isArray(res?.users) ? res.users : [];

        const rows = users.map((u, index) => {
          const plan = inferPlan(u);
          const status = inferStatus(u);
          return {
            id: String(u.id ?? u.email ?? `row-${index}`),
            userLabel: u.email || `User #${u.id}`,
            plan,
            status,
            deviceLimit: inferDeviceLimit(plan),
          };
        });

        setOriginalSubscriptions(rows);
      })
      .catch((err) => {
        if (!mounted) return;
        if (err && err.status === 401) return router.push("/login");
        setError(err.message || "Failed to load household admins");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [router]);

  const rows = useMemo(
    () =>
      originalSubscriptions.map((row) => {
        const edited = editedByUserId[row.id] || {};
        const plan = edited.plan || row.plan;
        const status = edited.status || row.status;
        const isChanged = plan !== row.plan || status !== row.status;
        return {
          ...row,
          plan,
          status,
          deviceLimit: inferDeviceLimit(plan),
          isChanged,
        };
      }),
    [originalSubscriptions, editedByUserId]
  );

  const handleEdit = (rowId, field, value) => {
    setEditedByUserId((prev) => ({
      ...prev,
      [rowId]: {
        ...(prev[rowId] || {}),
        [field]: value,
      },
    }));
    setMockMessage("");
  };

  const handleReset = (rowId) => {
    setEditedByUserId((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
    setMockMessage("");
  };

  const handleApply = (row) => {
    setMockMessage(`Mock: Payment updated for ${row.userLabel}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Subscriptions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Admin payment controls for all household admins</p>
        </div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Subscriptions</h1>
        <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Subscriptions</h1>
        <p className="mt-1 text-sm text-muted-foreground">Admin payment controls for all household admins</p>
      </div>

      <div className="rounded-md border border-primary/30 bg-primary/10 p-4">
        <p className="text-sm font-medium text-primary">Payment Control (Mock Mode)</p>
      </div>

      {mockMessage ? (
        <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          {mockMessage}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-md border border-border bg-card shadow-sm">
        <table className="min-w-[980px] w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Household Admin</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Plan</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Device Limit</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Payment Control</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-sm text-muted-foreground" colSpan={5}>
                  No household admins found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3.5 text-foreground">{row.userLabel}</td>
                  <td className="px-5 py-3.5 text-foreground">{row.plan}</td>
                  <td className="px-5 py-3.5 text-foreground">{row.status}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-foreground">{row.deviceLimit}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={row.plan}
                        onChange={(e) => handleEdit(row.id, "plan", e.target.value)}
                        className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground"
                      >
                        {PLAN_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <select
                        value={row.status}
                        onChange={(e) => handleEdit(row.id, "status", e.target.value)}
                        className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleApply(row)}
                        disabled={!row.isChanged}
                        className="rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Apply
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReset(row.id)}
                        className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground"
                      >
                        Reset
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
