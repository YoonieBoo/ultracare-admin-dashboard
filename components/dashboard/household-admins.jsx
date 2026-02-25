"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { getAdminUsers, setUserDisabled } from "@/services/api";

export default function HouseholdAdmins() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [users, setUsers] = useState([]);
  const [pendingUserId, setPendingUserId] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");

      const body = await getAdminUsers();
      const list = body?.users ?? body?.data ?? body ?? [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) {
        router.push("/login");
        return;
      }
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        "Failed to load users";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleStatus = async (user) => {
    const nextDisabled = !Boolean(user.isDisabled);
    const actionText = nextDisabled ? "disable" : "enable";

    const ok = window.confirm(`Are you sure you want to ${actionText} this account?`);
    if (!ok) return;

    try {
      setPendingUserId(user.id);
      await setUserDisabled(user.id, nextDisabled);
      toast({
        title: "User updated",
        description: `Account ${nextDisabled ? "disabled" : "enabled"} successfully.`,
      });
      await loadUsers();
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description:
          e?.response?.data?.error ||
          e?.response?.data?.message ||
          e?.message ||
          "Could not update account status.",
      });
    } finally {
      setPendingUserId(null);
    }
  };

  function formatDate(dateString) {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Users
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform-wide user accounts and access controls
        </p>
      </div>

      {loading && (
        <div className="rounded-md border border-border bg-card p-6 shadow-sm text-sm text-muted-foreground">
          Loading users...
        </div>
      )}

      {!loading && err && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-6 shadow-sm text-sm text-destructive">
          {err}
          <div className="mt-2 text-xs text-muted-foreground">
            Tip: Open DevTools → Network → click the request and confirm it has
            both <b>Authorization</b> and <b>x-api-key</b>.
          </div>
        </div>
      )}

      {!loading && !err && (
        <div className="overflow-x-auto rounded-md border border-border bg-card shadow-sm">
          <table className="min-w-[980px] w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Email
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Created
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Subscription Plan
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Subscription Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Account Status
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
                  const isDisabled = Boolean(user.isDisabled);
                  const subscription = user.subscription || null;
                  const busy = pendingUserId === user.id;

                  return (
                    <tr key={user.id ?? user.email} className="border-b border-border last:border-0">
                      <td className="px-5 py-3.5 text-foreground">{user.email || "-"}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-foreground">{subscription?.plan || "-"}</td>
                      <td className="px-5 py-3.5 text-foreground">{subscription?.status || "-"}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                            isDisabled
                              ? "bg-destructive/10 text-destructive"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {isDisabled ? "Disabled" : "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleToggleStatus(user)}
                          className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
                            isDisabled
                              ? "border-primary/30 bg-primary/10 text-primary"
                              : "border-destructive/30 bg-destructive/10 text-destructive"
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {busy ? "Updating..." : isDisabled ? "Enable" : "Disable"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
