"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api, { setHouseholdAdminDisabled } from "@/services/api";

export default function HouseholdAdmins() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [users, setUsers] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [notice, setNotice] = useState(null);

  const currentUserId = useMemo(() => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("ultracare_admin_token");
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.id ?? payload?.userId ?? payload?.sub ?? null;
    } catch (e) {
      return null;
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await api.get("/household-admins");
      const body = res.data;
      const list =
        body?.users ??
        body?.householdAdmins ??
        body?.admins ??
        body?.data ??
        [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        "Failed to load household admins";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function onToggleStatus(user) {
    const isDisabled = Boolean(user?.isDisabled);
    const nextDisabled = !isDisabled;
    const isSelf = String(user?.id) === String(currentUserId);

    if (isSelf) return;

    const confirmMessage = nextDisabled
      ? "Disable this household admin? They won't be able to use the app."
      : "Enable this household admin?";

    if (!window.confirm(confirmMessage)) return;

    try {
      setUpdatingId(user.id);
      setNotice(null);
      await setHouseholdAdminDisabled(user.id, nextDisabled);
      setNotice({
        type: "success",
        message: nextDisabled ? "Household admin disabled." : "Household admin enabled.",
      });
      await loadUsers();
    } catch (e) {
      setNotice({
        type: "error",
        message:
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "Failed to update status",
      });
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Household Admins
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage all registered household administrators
        </p>
      </div>

      {loading && (
        <div className="rounded-md border border-border bg-card p-6 shadow-sm text-sm text-muted-foreground">
          Loading household admins…
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

      {!loading && !err && notice && (
        <div
          className={`rounded-md border p-3 text-sm ${
            notice.type === "success"
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          {notice.message}
        </div>
      )}

      {!loading && !err && (
        <div className="rounded-md border border-border bg-card shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 bg-muted/40 px-4 py-2 text-xs font-medium">
            <div className="col-span-4">Email</div>
            <div className="col-span-2">Name</div>
            <div className="col-span-2">Created</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Action</div>
            <div className="col-span-1 text-right">ID</div>
          </div>

          {users.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              No household admins found.
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u.id ?? u.email}
                className="grid grid-cols-12 px-4 py-3 text-sm border-t"
              >
                <div className="col-span-4 truncate">{u.email ?? "-"}</div>
                <div className="col-span-2 truncate">{u.name ?? "-"}</div>
                <div className="col-span-2 truncate">
                  {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                </div>
                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                      u.isDisabled
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {u.isDisabled ? "Disabled" : "Active"}
                  </span>
                </div>
                <div className="col-span-1">
                  {String(u.id) === String(currentUserId) ? (
                    <span className="text-[11px] text-muted-foreground">
                      You can't disable yourself
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onToggleStatus(u)}
                      disabled={updatingId === u.id}
                      className={`rounded-md px-2 py-1 text-xs font-medium ${
                        u.isDisabled
                          ? "border border-primary/30 bg-primary/10 text-primary"
                          : "border border-destructive/30 bg-destructive/10 text-destructive"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {updatingId === u.id
                        ? "..."
                        : u.isDisabled
                          ? "Enable"
                          : "Disable"}
                    </button>
                  )}
                </div>
                <div className="col-span-1 text-right">{u.id ?? "-"}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
