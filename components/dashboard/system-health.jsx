"use client";

import { systemHealth } from "@/lib/mock-data";

export default function SystemHealth() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          System Health
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time status of platform infrastructure services
        </p>
      </div>

      <div className="rounded-md border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-3 bg-muted/50">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Service Status
          </span>
        </div>
        <div className="divide-y divide-border">
          {systemHealth.map((item) => (
            <div
              key={item.service}
              className="flex items-center justify-between px-5 py-4"
            >
              <span className="text-sm font-medium text-foreground">
                {item.service}
              </span>
              <span className="flex items-center gap-2 text-sm text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Last system check
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              All services are operational. Next check in 60 seconds.
            </p>
          </div>
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            All Systems Operational
          </span>
        </div>
      </div>
    </div>
  );
}
