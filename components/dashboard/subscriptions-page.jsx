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

  useEffect(() => {
    let mounted = true;

    getMySubscription()
      .then((res) => {
        if (!mounted) return;

        const normalized = res?.subscription ?? res ?? null;
        setSubscription(normalized);
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
    </div>
  );
}
