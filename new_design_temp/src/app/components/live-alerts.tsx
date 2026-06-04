import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AlertTriangle, AlertCircle, Info, ExternalLink, Clock } from "lucide-react";

const alerts = [
  {
    severity: "critical",
    title: "Billing Queue Spike",
    description: "Queue depth at billing counter increased to 18 customers. Average wait time: 12 minutes.",
    recommendation: "Open secondary billing counter immediately. Reassign staff from low-traffic zones.",
    time: "2 min ago",
    icon: AlertTriangle,
  },
  {
    severity: "warning",
    title: "Camera Feed Delay",
    description: "Camera #3 (Maybelline zone) experiencing 3-second lag in processing.",
    recommendation: "Check network bandwidth. Consider restarting camera feed if delay persists.",
    time: "8 min ago",
    icon: AlertCircle,
  },
  {
    severity: "info",
    title: "Low Engagement Zone Detected",
    description: "Aqualogica zone showing 24% lower foot traffic compared to average.",
    recommendation: "Review product placement and promotional signage. Consider staff deployment for engagement.",
    time: "15 min ago",
    icon: Info,
  },
];

export function LiveAlerts() {
  return (
    <Card className="p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Live Anomalies & Alerts</h3>
          <p className="text-sm text-muted-foreground">Real-time AI-detected issues</p>
        </div>
        <Badge variant="outline" className="border-red-200 text-red-700">
          3 Active
        </Badge>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`rounded-lg border p-4 transition-all hover:shadow-md ${
              alert.severity === "critical"
                ? "border-red-200 bg-red-50"
                : alert.severity === "warning"
                ? "border-amber-200 bg-amber-50"
                : "border-blue-200 bg-blue-50"
            }`}
          >
            <div className="flex gap-3">
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                  alert.severity === "critical"
                    ? "bg-red-100"
                    : alert.severity === "warning"
                    ? "bg-amber-100"
                    : "bg-blue-100"
                }`}
              >
                <alert.icon
                  className={`h-4 w-4 ${
                    alert.severity === "critical"
                      ? "text-red-700"
                      : alert.severity === "warning"
                      ? "text-amber-700"
                      : "text-blue-700"
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-gray-900">{alert.title}</h4>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${
                        alert.severity === "critical"
                          ? "border-red-500 text-red-700 bg-white"
                          : alert.severity === "warning"
                          ? "border-amber-500 text-amber-700 bg-white"
                          : "border-blue-500 text-blue-700 bg-white"
                      }`}
                    >
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>{alert.time}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">{alert.description}</p>

                <div
                  className={`rounded-lg p-3 mb-3 ${
                    alert.severity === "critical"
                      ? "bg-white border border-red-100"
                      : alert.severity === "warning"
                      ? "bg-white border border-amber-100"
                      : "bg-white border border-blue-100"
                  }`}
                >
                  <p className="text-xs font-medium text-gray-900 mb-1">AI Recommendation</p>
                  <p className="text-xs text-gray-600">{alert.recommendation}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className={`h-7 text-xs ${
                      alert.severity === "critical"
                        ? "bg-red-600 hover:bg-red-700"
                        : alert.severity === "warning"
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    Take Action
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                    View Details
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs ml-auto">
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
