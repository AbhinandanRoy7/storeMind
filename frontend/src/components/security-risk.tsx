import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Shield, AlertTriangle, Eye, Clock, TrendingDown } from "lucide-react";
import { Progress } from "./ui/progress";

const securityMetrics = [
  {
    title: "Theft Risk Score",
    value: 12,
    max: 100,
    status: "normal",
    description: "Low risk threshold",
  },
  {
    title: "Suspicious Sessions",
    value: 3,
    status: "warning",
    description: "Under investigation",
  },
  {
    title: "Restricted Area Violations",
    value: 0,
    status: "normal",
    description: "No violations today",
  },
  {
    title: "Unusual Dwell Events",
    value: 7,
    status: "warning",
    description: "Prolonged loitering detected",
  },
];

const suspiciousEvents = [
  {
    time: "6:42 PM",
    zone: "Minimalist",
    type: "Unusual Dwell",
    duration: "18m 24s",
    severity: "medium",
    description: "Customer spent extended time without product interaction",
  },
  {
    time: "5:18 PM",
    zone: "Lakme",
    type: "Suspicious Behavior",
    duration: "12m 06s",
    severity: "high",
    description: "Repeated visits to same shelf, no purchase activity",
  },
  {
    time: "3:45 PM",
    zone: "The Face Shop",
    type: "Unusual Dwell",
    duration: "22m 15s",
    severity: "low",
    description: "Extended browsing near high-value items",
  },
];

export function SecurityRisk() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="p-6 shadow-sm lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Security & Risk Dashboard</h3>
            <p className="text-sm text-muted-foreground">AI-powered threat detection</p>
          </div>
          <Badge variant="outline" className="border-green-200 text-green-700">
            <Shield className="h-3 w-3 mr-1" />
            Secure
          </Badge>
        </div>

        {/* Security Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {securityMetrics.map((metric, index) => (
            <div
              key={index}
              className={`rounded-lg border p-4 ${
                metric.status === "normal"
                  ? "bg-green-50 border-green-200"
                  : metric.status === "warning"
                  ? "bg-amber-50 border-amber-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-gray-900">{metric.title}</p>
                <div
                  className={`h-2 w-2 rounded-full ${
                    metric.status === "normal"
                      ? "bg-green-500"
                      : metric.status === "warning"
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                />
              </div>
              <p
                className={`text-2xl font-bold mb-1 ${
                  metric.status === "normal"
                    ? "text-green-700"
                    : metric.status === "warning"
                    ? "text-amber-700"
                    : "text-red-700"
                }`}
              >
                {metric.value}
                {metric.max && `/${metric.max}`}
              </p>
              {metric.max && (
                <Progress
                  value={metric.value}
                  className={`h-1.5 mb-2 ${
                    metric.status === "normal" ? "[&>div]:bg-green-500" : "[&>div]:bg-amber-500"
                  }`}
                />
              )}
              <p
                className={`text-xs ${
                  metric.status === "normal"
                    ? "text-green-600"
                    : metric.status === "warning"
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {metric.description}
              </p>
            </div>
          ))}
        </div>

        {/* Suspicious Events */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Suspicious Events</h4>
          <div className="space-y-3">
            {suspiciousEvents.map((event, index) => (
              <div
                key={index}
                className={`rounded-lg border p-4 ${
                  event.severity === "high"
                    ? "border-red-200 bg-red-50"
                    : event.severity === "medium"
                    ? "border-amber-200 bg-amber-50"
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${
                        event.severity === "high"
                          ? "border-red-500 text-red-700 bg-white"
                          : event.severity === "medium"
                          ? "border-amber-500 text-amber-700 bg-white"
                          : "border-blue-500 text-blue-700 bg-white"
                      }`}
                    >
                      {event.type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${
                        event.severity === "high"
                          ? "border-red-500 text-red-700 bg-red-100"
                          : event.severity === "medium"
                          ? "border-amber-500 text-amber-700 bg-amber-100"
                          : "border-blue-500 text-blue-700 bg-blue-100"
                      }`}
                    >
                      {event.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{event.time}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Zone</p>
                    <p className="text-sm font-semibold text-gray-900">{event.zone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-semibold text-gray-900">{event.duration}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Risk Analysis</h3>
          <p className="text-xs text-muted-foreground">AI-generated insights</p>
        </div>

        <div className="space-y-4">
          {/* Overall Risk Score */}
          <div className="rounded-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <p className="text-xs font-medium text-green-900">Overall Risk Level</p>
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="relative h-24 w-24">
                <svg className="h-24 w-24 -rotate-90 transform">
                  <circle cx="48" cy="48" r="40" stroke="#dcfce7" strokeWidth="8" fill="none" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#22c55e"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${12 * 2.51} ${100 * 2.51}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-700">12</p>
                    <p className="text-[10px] text-green-600">LOW</p>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-green-700 mb-1">Store operating within normal risk parameters</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingDown className="h-3 w-3" />
                  <span>-8% from yesterday</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Monitoring */}
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-4 w-4 text-purple-600" />
              <p className="text-xs font-medium text-gray-900">Active Monitoring</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">CCTV Cameras</span>
                <span className="font-semibold text-green-600">5/5 Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">AI Detection</span>
                <span className="font-semibold text-green-600">Running</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Face Recognition</span>
                <span className="font-semibold text-green-600">Enabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Alert System</span>
                <span className="font-semibold text-green-600">Online</span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-medium text-blue-900 mb-2">Security Recommendations</p>
            <ul className="space-y-2 text-xs text-blue-700">
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Maintain current security protocols</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Review footage for 3 suspicious sessions</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Deploy staff to monitor Lakme zone</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Continue AI threat detection monitoring</span>
              </li>
            </ul>
          </div>

          {/* Incident History */}
          <div className="rounded-lg border bg-white p-4">
            <p className="text-xs font-medium text-gray-900 mb-3">Last 7 Days Summary</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground mb-1">Total Incidents</p>
                <p className="text-lg font-semibold text-gray-900">24</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Resolved</p>
                <p className="text-lg font-semibold text-green-600">24</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">False Positives</p>
                <p className="text-sm font-semibold text-gray-600">18 (75%)</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">True Threats</p>
                <p className="text-sm font-semibold text-red-600">6 (25%)</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
