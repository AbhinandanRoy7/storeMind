import { TrendingUp, TrendingDown, Users, Target, Clock, Activity, Award, Gauge } from "lucide-react";
import { Card } from "./ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Progress } from "./ui/progress";

const sparklineData = [
  { value: 120 },
  { value: 150 },
  { value: 130 },
  { value: 180 },
  { value: 160 },
  { value: 200 },
  { value: 240 },
];

const kpiData = [
  {
    title: "Total Visitors Today",
    value: "2,847",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    comparison: "vs yesterday",
  },
  {
    title: "Conversion Rate",
    value: "24.8%",
    change: "-3.2%",
    trend: "down",
    icon: Target,
    comparison: "vs yesterday",
  },
  {
    title: "Avg Dwell Time",
    value: "8m 42s",
    change: "+1m 15s",
    trend: "up",
    icon: Clock,
    comparison: "vs yesterday",
  },
  {
    title: "Active Queue Depth",
    value: "12",
    change: "+4",
    trend: "up",
    icon: Activity,
    comparison: "real-time",
  },
  {
    title: "Employee Productivity",
    value: "87%",
    change: "+5%",
    trend: "up",
    icon: Award,
    comparison: "vs yesterday",
  },
];

export function KPICards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpiData.map((kpi, index) => (
        <Card key={index} className="p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                <kpi.icon className="h-4 w-4 text-[#6B21A8]" />
              </div>
            </div>
            <div
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                kpi.trend === "up"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {kpi.trend === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{kpi.change}</span>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{kpi.title}</p>
          </div>
          <div className="mt-3">
            <ResponsiveContainer width="100%" height={32}>
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={kpi.trend === "up" ? "#22c55e" : "#ef4444"}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{kpi.comparison}</p>
        </Card>
      ))}

      {/* Store Health Score - Special Card */}
      <Card className="p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
              <Gauge className="h-4 w-4 text-[#6B21A8]" />
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">92%</p>
            <p className="mt-1 text-xs text-muted-foreground">Store Health Score</p>
          </div>
          <div className="relative h-16 w-16">
            <svg className="h-16 w-16 -rotate-90 transform">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#E5E7EB"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#6B21A8"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${92 * 1.76} ${100 * 1.76}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-[#6B21A8]">92</span>
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Excellent</p>
      </Card>
    </div>
  );
}
