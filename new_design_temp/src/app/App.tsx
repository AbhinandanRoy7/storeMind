import { DashboardSidebar } from "./components/dashboard-sidebar";
import { DashboardHeader } from "./components/dashboard-header";
import { LiveStatusBar } from "./components/live-status-bar";
import { KPICards } from "./components/kpi-cards";
import { ConversionFunnel } from "./components/conversion-funnel";
import { StoreHeatmap } from "./components/store-heatmap";
import { LiveAlerts } from "./components/live-alerts";
import { EmployeeAnalytics } from "./components/employee-analytics";
import { QueueIntelligence } from "./components/queue-intelligence";
import { SecurityRisk } from "./components/security-risk";
import { AICopilot } from "./components/ai-copilot";
import { ExecutiveReports } from "./components/executive-reports";
import { SystemStatus } from "./components/system-status";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./components/ui/button";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white shadow-lg hover:bg-gray-100"
        >
          {sidebarOpen ? <X className="h-5 w-5 text-gray-900" /> : <Menu className="h-5 w-5 text-gray-900" />}
        </Button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <DashboardSidebar />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <DashboardHeader />

        {/* Live Status Bar */}
        <LiveStatusBar />

        {/* Dashboard Content */}
        <main className="space-y-6 p-4 sm:p-6">
          {/* Section 1: KPI Cards */}
          <section>
            <KPICards />
          </section>

          {/* Section 2: Conversion Funnel */}
          <section>
            <ConversionFunnel />
          </section>

          {/* Section 3: Store Heatmap */}
          <section>
            <StoreHeatmap />
          </section>

          {/* Section 4: Live Alerts */}
          <section>
            <LiveAlerts />
          </section>

          {/* Section 5: Employee Analytics */}
          <section>
            <EmployeeAnalytics />
          </section>

          {/* Section 6: Queue Intelligence */}
          <section>
            <QueueIntelligence />
          </section>

          {/* Section 7: Security & Risk */}
          <section>
            <SecurityRisk />
          </section>

          {/* Section 8: AI Copilot */}
          <section>
            <AICopilot />
          </section>

          {/* Section 9: Executive Reports */}
          <section>
            <ExecutiveReports />
          </section>

          {/* Section 10: System Status */}
          <section>
            <SystemStatus />
          </section>

          {/* Footer */}
          <footer className="pb-6 pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              StoreMind AI © 2026 Purplle. All systems operational. Last updated: May 31, 2026 at 7:42 PM IST
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}