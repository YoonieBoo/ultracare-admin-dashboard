"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMySubscription } from "@/services/subscription";
import { Skeleton } from "@/components/ui/skeleton";

function PlanBadge({ plan }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
        String(plan || "").toUpperCase() === "PRO"
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {plan || "-"}
    </span>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  const styles = {
    active: "bg-primary/10 text-primary",
    suspended: "bg-destructive/10 text-destructive",
    inactive: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${styles[normalized] || "bg-muted text-muted-foreground"}`}
    >
      {status || "-"}
    </span>
  );
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [originalSubscriptions, setOriginalSubscriptions] = useState([]);
  const [editedByUserId, setEditedByUserId] = useState({});
  const [mockMessage, setMockMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    getMySubscription()
      .then((res) => {
        if (!mounted) return;

        const normalized = res?.subscription ?? res ?? null;
        setSubscription(normalized);
        if (normalized) {
          const rowId = String(normalized.userId ?? normalized.id ?? "current-account");
          setOriginalSubscriptions([
            {
              id: rowId,
              userLabel: normalized.email || "Current Account",
              plan: normalized.plan || "FREE",
              status: normalized.status || "PENDING_PAYMENT",
              deviceLimit:
                normalized.deviceLimit ??
                normalized.devicesLimit ??
                normalized.limit ??
                "-",
            },
          ]);
        } else {
          setOriginalSubscriptions([]);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        if (err && err.status === 401) return router.push("/login");
        setError(err.message || "Failed to load subscription");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Subscriptions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Current account subscription details</p>
        </div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-48" />
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

  if (!subscription) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Subscriptions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Current account subscription details</p>
        </div>

        <div className="rounded-md border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">No subscription yet</p>
        </div>
      </div>
    );
  }

  const deviceLimit =
    subscription.deviceLimit ??
    subscription.devicesLimit ??
    subscription.limit ??
    "-";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Subscriptions</h1>
        <p className="mt-1 text-sm text-muted-foreground">Current account subscription details</p>
      </div>

      <div className="rounded-md border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/50 px-5 py-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Subscription</span>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Plan</p>
            <div className="mt-2">
              <PlanBadge plan={subscription.plan} />
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
            <div className="mt-2">
              <StatusBadge status={subscription.status} />
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Device Limit</p>
            <p className="mt-2 font-mono text-sm text-foreground">{deviceLimit}</p>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-primary/30 bg-primary/10 p-4">
        <p className="text-sm font-medium text-primary">Payment Control (Mock Mode)</p>
        <p className="mt-1 text-xs text-muted-foreground">Actions are UI-only (no backend update yet).</p>
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
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Account</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Plan</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Device Limit</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Payment Control</th>
            </tr>
          </thead>
          <tbody>
            {originalSubscriptions.map((row) => {
              const edited = editedByUserId[row.id] || {};
              const plan = edited.plan || row.plan;
              const status = edited.status || row.status;
              const isChanged = plan !== row.plan || status !== row.status;

              return (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3.5 text-foreground">{row.userLabel}</td>
                  <td className="px-5 py-3.5 text-foreground">{plan}</td>
                  <td className="px-5 py-3.5 text-foreground">{status}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-foreground">{row.deviceLimit}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={plan}
                        onChange={(e) => handleEdit(row.id, "plan", e.target.value)}
                        className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground"
                      >
                        <option value="FREE">FREE</option>
                        <option value="PRO">PRO</option>
                      </select>
                      <select
                        value={status}
                        onChange={(e) => handleEdit(row.id, "status", e.target.value)}
                        className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleApply(row)}
                        disabled={!isChanged}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
