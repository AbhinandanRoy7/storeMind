import { Card } from "./ui/card";
import { CheckCircle2, Circle, Database, Cpu, Sparkles, Cloud, Network } from "lucide-react";

const systemServices = [
  { name: "YOLO Detection", status: "operational", icon: Cpu, color: "text-green-600" },
  { name: "ByteTrack", status: "operational", icon: Network, color: "text-green-600" },
  { name: "API Status", status: "operational", icon: Cloud, color: "text-green-600" },
  { name: "Supabase", status: "operational", icon: Database, color: "text-green-600" },
  { name: "Qdrant", status: "operational", icon: Database, color: "text-green-600" },
  { name: "Gemini", status: "operational", icon: Sparkles, color: "text-green-600" },
];

export function SystemStatus() {
  return (
    <Card className="p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">System Health</h3>
        <p className="text-xs text-muted-foreground">All systems operational</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {systemServices.map((service, index) => (
          <div
            key={index}
            className="rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 p-3 hover:shadow-sm transition-shadow"
          >
            <div className="mb-2 flex items-center justify-between">
              <service.icon className={`h-4 w-4 ${service.color}`} />
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            </div>
            <p className="text-xs font-semibold text-gray-900 mb-1">{service.name}</p>
            <div className="flex items-center gap-1">
              <Circle className="h-1.5 w-1.5 fill-green-500 text-green-500" />
              <span className="text-[10px] text-green-700">Online</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-xs font-medium text-green-900">All Systems Operational</span>
        </div>
        <span className="text-xs text-green-700">99.9% uptime</span>
      </div>
    </Card>
  );
}
