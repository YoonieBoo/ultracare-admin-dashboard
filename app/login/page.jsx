"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/services/auth";
import { saveToken } from "@/utils/auth";

function extractToken(payload) {
  return (
    payload?.token ||
    payload?.accessToken ||
    payload?.data?.token ||
    payload?.data?.accessToken ||
    null
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await loginAdmin(email, password);
      const token = extractToken(response);

      if (!token) {
        throw new Error("No token returned from /api/auth/login");
      }

      saveToken(token);
      router.push("/");
    } catch (err) {
      setError(err?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-md border border-border bg-card p-8 shadow">
        <h1 className="mb-2 text-2xl font-semibold">Admin Login</h1>
        <p className="mb-6 text-sm text-muted-foreground">Sign in with your admin credentials</p>

        {error && (
          <div className="mb-4 rounded-md border border-destructive bg-destructive/10 p-3 text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2 text-white"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
