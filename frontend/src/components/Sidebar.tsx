"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Building2,
  Map,
  Filter,
  Users,
  Clock,
  Shield,
  Bot,
  FileText,
  Sparkles,
} from "lucide-react";

const navLinks = [
  { name: "Dashboard", icon: Home, href: "/" },
  { name: "Store Overview", icon: Building2, href: "/store" },
  { name: "Heatmaps", icon: Map, href: "/heatmaps" },
  { name: "Funnel", icon: Filter, href: "/funnel" },
  { name: "Employees", icon: Users, href: "/employees" },
  { name: "Queue", icon: Clock, href: "/queue" },
  { name: "Security", icon: Shield, href: "/security" },
  { name: "AI Copilot", icon: Bot, href: "/copilot" },
  { name: "Reports", icon: FileText, href: "/reports" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#1A0A2E] h-screen flex flex-col fixed left-0 top-0 z-50 shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-purple-900/50 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-purple-100 leading-tight">StoreMind AI</h1>
          <p className="text-[10px] text-purple-400">Retail Intelligence</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
                isActive
                  ? "bg-purple-700/40 text-purple-100 border-l-2 border-purple-400 pl-[10px]"
                  : "text-purple-300 hover:bg-purple-800/30 hover:text-purple-100 border-l-2 border-transparent"
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? "text-purple-300" : "text-purple-500 group-hover:text-purple-300"
                }`}
              />
              <span>{link.name}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Store Badge */}
      <div className="p-4 border-t border-purple-900/50">
        <div className="bg-purple-900/40 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-purple-400 font-medium uppercase tracking-widest">
              Live
            </span>
          </div>
          <p className="text-sm font-semibold text-purple-100 mt-1">
            Brigade Road, BLR
          </p>
          <p className="text-[10px] text-purple-500 mt-0.5">Store ID: BRG-001</p>
        </div>
      </div>
    </aside>
  );
}
