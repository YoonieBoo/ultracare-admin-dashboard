"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { getAdminUsers, updateUserSubscription } from "@/services/api";

const PLAN_OPTIONS = ["FREE", "PRO"];
const STATUS_OPTIONS = ["ACTIVE", "PENDING_PAYMENT"];

function normalizeUsers(payload) {
  const list = payload?.users ?? payload?.data ?? payload ?? [];
  return Array.isArray(list) ? list : [];
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [savingUserId, setSavingUserId] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const payload = await getAdminUsers();
      const normalizedUsers = normalizeUsers(payload);
      setUsers(normalizedUsers);
      setDrafts((prev) => {
        const next = { ...prev };
        normalizedUsers.forEach((user) => {
          const current = next[user.id] || {};
          next[user.id] = {
            plan: current.plan || user.subscription?.plan || "FREE",
            status: current.status || user.subscription?.status || "PENDING_PAYMENT",
          };
        });
        return next;
      });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        router.push("/login");
        return;
      }

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load subscriptions"
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDraftChange = (userId, key, value) => {
    setDrafts((prev) => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {}),
        [key]: value,
      },
    }));
  };

  const handleSave = async (userId) => {
    const draft = drafts[userId] || {};
    const plan = draft.plan || "FREE";
    const status = draft.status || "PENDING_PAYMENT";

    const confirmed = window.confirm("Save subscription changes for this user?");
    if (!confirmed) return;

    try {
      setSavingUserId(userId);
      await updateUserSubscription(userId, { plan, status });
      toast({
        title: "Subscription updated",
        description: "Plan and status saved successfully.",
      });
      await loadUsers();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description:
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Could not update subscription.",
      });
    } finally {
      setSavingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Subscriptions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage user plan and payment status</p>
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
        <p className="mt-1 text-sm text-muted-foreground">Manage user plan and payment status</p>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-card shadow-sm">
        <table className="min-w-[920px] w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Current Plan
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Current Status
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Plan
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-sm text-muted-foreground" colSpan={6}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const draft = drafts[user.id] || {};
                const currentPlan = user.subscription?.plan || "-";
                const currentStatus = user.subscription?.status || "-";
                const isSaving = savingUserId === user.id;

                return (
                  <tr key={user.id ?? user.email} className="border-b border-border last:border-0">
                    <td className="px-5 py-3.5 text-foreground">{user.email || "-"}</td>
                    <td className="px-5 py-3.5 text-foreground">{currentPlan}</td>
                    <td className="px-5 py-3.5 text-foreground">{currentStatus}</td>
                    <td className="px-5 py-3.5">
                      <select
                        value={draft.plan || "FREE"}
                        onChange={(event) => handleDraftChange(user.id, "plan", event.target.value)}
                        className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                      >
                        {PLAN_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={draft.status || "PENDING_PAYMENT"}
                        onChange={(event) => handleDraftChange(user.id, "status", event.target.value)}
                        className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSave(user.id)}
                        className="rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSaving ? "Saving..." : "Save/Update"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
