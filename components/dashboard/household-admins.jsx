"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

export default function HouseholdAdmins() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        // IMPORTANT:
        // Change this path if your backend route is different.
        // Example alternatives:
        // "/admin/household-admins"
        // "/households/admins"
        const res = await api.get("/household-admins");

        const body = res.data;

        const list =
          body?.users ??
          body?.householdAdmins ??
          body?.admins ??
          body?.data ??
          [];

        if (!alive) return;
        setUsers(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!alive) return;
        const msg =
          e?.response?.data?.error ||
          e?.response?.data?.message ||
          e?.message ||
          "Failed to load household admins";
        setErr(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

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

      {!loading && !err && (
        <div className="rounded-md border border-border bg-card shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 bg-muted/40 px-4 py-2 text-xs font-medium">
            <div className="col-span-5">Email</div>
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Created</div>
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
                <div className="col-span-5 truncate">{u.email ?? "-"}</div>
                <div className="col-span-3 truncate">{u.name ?? "-"}</div>
                <div className="col-span-3 truncate">
                  {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
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