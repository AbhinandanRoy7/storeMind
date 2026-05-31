"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Eye, Clock, BarChart2,
  FileSpreadsheet, Bell, CreditCard, Bot
} from "lucide-react";

const tabs = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "360° Insights", href: "/insights", icon: Eye },
  { label: "Heatmaps", href: "/heatmaps", icon: BarChart2 },
  { label: "Funnel", href: "/funnel", icon: BarChart2 },
  { label: "Employees", href: "/employees", icon: Eye },
  { label: "Queue", href: "/queue", icon: Clock },
  { label: "Security", href: "/security", icon: Bell },
  { label: "AI Copilot", href: "/copilot", icon: Bot },
  { label: "Reports", href: "/reports", icon: FileSpreadsheet },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-0 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 py-3 pr-6 border-r border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-violet-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">SM</span>
            </div>
            <span className="font-bold text-gray-800 text-sm">StoreMind AI</span>
          </div>

          {/* Tabs */}
          <nav className="flex items-center flex-1 px-4 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-1.5 px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? "border-blue-500 text-blue-600 bg-blue-50/50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          {/* Store selector */}
          <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
            <button className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
              Store 1
            </button>
            <button className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full hover:bg-gray-200 transition-colors">
              Overall
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
