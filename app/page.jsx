"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/dashboard/sidebar";
import Overview from "@/components/dashboard/overview";
import HouseholdAdmins from "@/components/dashboard/household-admins";
import SubscriptionsPage from "@/components/dashboard/subscriptions-page";
import DevicesPage from "@/components/dashboard/devices-page";
import AlertsPage from "@/components/dashboard/fall-alerts-page";
import SettingsPage from "@/components/dashboard/settings-page";

import MonthlyFallsChart from "@/components/dashboard/MonthlyFallsChart";

const pages = {
  overview: Overview,
  households: HouseholdAdmins,
  subscriptions: SubscriptionsPage,
  devices: DevicesPage,
  alerts: AlertsPage,
  settings: SettingsPage,
};

function getPageTitle(activePage) {
  if (activePage === "households") return "Household Admins";
  if (activePage === "alerts") return "Alerts";
  return activePage;
}

export default function DashboardPage() {
  const [activePage, setActivePage] = useState("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const ActiveComponent = pages[activePage] || Overview;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <main className="flex-1 lg:ml-60">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-sm sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground lg:hidden"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </button>
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

        <div className="mx-auto w-full max-w-[1400px] px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
          {activePage === "overview" ? (
  <div className="space-y-6">
    <Overview onNavigate={setActivePage} />

    {/* Monthly Falls Chart */}
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">Monthly Fall Events</h2>
      </div>
      <MonthlyFallsChart />
    </section>
  </div>
) : (
  <ActiveComponent />
)}
        </div>
      </main>
    </div>
  );
}
