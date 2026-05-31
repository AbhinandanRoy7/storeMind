import { 
  LayoutDashboard, 
  Store, 
  Map, 
  TrendingDown, 
  Users, 
  Clock, 
  Shield, 
  Bot, 
  FileText, 
  Settings 
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Store, label: "Store Overview" },
  { icon: Map, label: "Heatmaps" },
  { icon: TrendingDown, label: "Customer Funnel" },
  { icon: Users, label: "Employee Analytics" },
  { icon: Clock, label: "Queue Intelligence" },
  { icon: Shield, label: "Security & Risk" },
  { icon: Bot, label: "AI Copilot" },
  { icon: FileText, label: "Reports" },
  { icon: Settings, label: "Settings" },
];

export function DashboardSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white shadow-lg lg:shadow-none">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6B21A8] to-[#7C3AED]">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-[#6B21A8]">StoreMind AI</h1>
              <p className="text-[10px] text-muted-foreground">Retail Intelligence</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                item.active
                  ? "bg-[#6B21A8] text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#6B21A8] to-[#7C3AED] text-sm font-semibold text-white">
              AK
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Admin User</p>
              <p className="text-xs text-muted-foreground truncate">admin@purplle.com</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
