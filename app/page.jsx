"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/sidebar";
import Overview from "@/components/dashboard/overview";
import HouseholdAdmins from "@/components/dashboard/household-admins";
import SubscriptionsPage from "@/components/dashboard/subscriptions-page";
import DevicesPage from "@/components/dashboard/devices-page";
import AlertsPage from "@/components/dashboard/fall-alerts-page";
import SystemHealth from "@/components/dashboard/system-health";
import SettingsPage from "@/components/dashboard/settings-page";

const pages = {
  overview: Overview,
  households: HouseholdAdmins,
  subscriptions: SubscriptionsPage,
  devices: DevicesPage,
  alerts: AlertsPage,
  health: SystemHealth,
  settings: SettingsPage,
};

function getPageTitle(activePage) {
  if (activePage === "health") return "System Health";
  if (activePage === "households") return "Household Admins";
  if (activePage === "alerts") return "Alerts";
  return activePage;
}

export default function DashboardPage() {
  const [activePage, setActivePage] = useState("overview");
  const ActiveComponent = pages[activePage] || Overview;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="ml-60 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-8 backdrop-blur-sm lg:px-10">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">UltraCare Platform</span>
            <span className="text-xs text-border">/</span>
            <span className="text-xs font-medium capitalize text-foreground">
              {getPageTitle(activePage)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">System Operational</span>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1400px] px-8 py-8 lg:px-10">
          <ActiveComponent />
        </div>
      </main>
    </div>
  );
}
