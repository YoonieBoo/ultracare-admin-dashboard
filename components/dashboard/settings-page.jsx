"use client";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform configuration and admin preferences</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-md border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-muted/50 px-5 py-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">General</span>
          </div>
          <div className="divide-y divide-border">
            <div className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-medium text-foreground">Platform Name</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Display name shown across the admin console</p>
              </div>
              <span className="text-sm text-foreground">UltraCare</span>
            </div>
            <div className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-medium text-foreground">Admin Email</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Primary contact for system notifications</p>
              </div>
              <span className="text-sm text-muted-foreground">admin@ultracare.io</span>
            </div>
            <div className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-medium text-foreground">Timezone</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Default timezone for reporting and alerts</p>
              </div>
              <span className="text-sm text-muted-foreground">America/New_York (EST)</span>
            </div>
          </div>
        </section>

        <section className="rounded-md border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-muted/50 px-5 py-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Alert Configuration</span>
          </div>
          <div className="divide-y divide-border">
            <div className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-medium text-foreground">Fall Detection Sensitivity</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Minimum confidence threshold for fall alerts</p>
              </div>
              <span className="font-mono text-sm text-foreground">75%</span>
            </div>
            <div className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-medium text-foreground">Email Notifications</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Send email alerts for new safety events</p>
              </div>
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Enabled</span>
            </div>
            <div className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-medium text-foreground">Auto-Escalation</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Escalate unacknowledged alerts after timeout</p>
              </div>
              <span className="text-sm text-muted-foreground">After 15 minutes</span>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-md border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/50 px-5 py-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">API & Integrations</span>
        </div>
        <div className="divide-y divide-border">
          <div className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-medium text-foreground">API Version</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Current API version in production</p>
            </div>
            <span className="font-mono text-sm text-muted-foreground">v2.4.1</span>
          </div>
          <div className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-medium text-foreground">Webhook URL</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Endpoint for external alert delivery</p>
            </div>
            <span className="max-w-full overflow-hidden text-ellipsis font-mono text-xs text-muted-foreground md:max-w-[420px]">
              https://hooks.ultracare.io/v2/alerts
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
