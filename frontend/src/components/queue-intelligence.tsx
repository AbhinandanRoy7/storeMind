import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Clock, TrendingUp, Users, Lightbulb } from "lucide-react";

const queueLengthData = [
  { time: "10 AM", length: 3 },
  { time: "11 AM", length: 5 },
  { time: "12 PM", length: 8 },
  { time: "1 PM", length: 12 },
  { time: "2 PM", length: 7 },
  { time: "3 PM", length: 6 },
  { time: "4 PM", length: 9 },
  { time: "5 PM", length: 15 },
  { time: "6 PM", length: 18 },
  { time: "7 PM", length: 14 },
  { time: "Now", length: 12 },
];

const waitTimeData = [
  { time: "10 AM", wait: 2 },
  { time: "11 AM", wait: 3 },
  { time: "12 PM", wait: 5 },
  { time: "1 PM", wait: 8 },
  { time: "2 PM", wait: 4 },
  { time: "3 PM", wait: 4 },
  { time: "4 PM", wait: 6 },
  { time: "5 PM", wait: 10 },
  { time: "6 PM", wait: 12 },
  { time: "7 PM", wait: 9 },
  { time: "Now", wait: 8 },
];

const abandonmentData = [
  { hour: "10-11", rate: 2 },
  { hour: "11-12", rate: 3 },
  { hour: "12-1", rate: 5 },
  { hour: "1-2", rate: 8 },
  { hour: "2-3", rate: 4 },
  { hour: "3-4", rate: 3 },
  { hour: "4-5", rate: 6 },
  { hour: "5-6", rate: 14 },
  { hour: "6-7", rate: 18 },
  { hour: "7-8", rate: 12 },
];

export function QueueIntelligence() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="p-6 shadow-sm lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Queue Intelligence</h3>
            <p className="text-sm text-muted-foreground">Real-time queue monitoring</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-purple-200 text-purple-700">
              Live Tracking
            </Badge>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-lg border bg-gradient-to-br from-red-50 to-orange-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-red-600" />
              <p className="text-xs font-medium text-red-900">Current Queue</p>
            </div>
            <p className="text-2xl font-bold text-red-700">12</p>
            <p className="text-xs text-red-600 mt-1">customers waiting</p>
          </div>
          <div className="rounded-lg border bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <p className="text-xs font-medium text-amber-900">Avg Wait Time</p>
            </div>
            <p className="text-2xl font-bold text-amber-700">8m</p>
            <p className="text-xs text-amber-600 mt-1">above target (5m)</p>
          </div>
          <div className="rounded-lg border bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <p className="text-xs font-medium text-purple-900">Peak Today</p>
            </div>
            <p className="text-2xl font-bold text-purple-700">18</p>
            <p className="text-xs text-purple-600 mt-1">at 6 PM</p>
          </div>
        </div>

        {/* Queue Length Chart */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Queue Length Over Time</h4>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={queueLengthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="length" stroke="#6B21A8" fill="#7C3AED" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Wait Time Chart */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Average Wait Time</h4>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={waitTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" label={{ value: "Minutes", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line type="monotone" dataKey="wait" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Abandonment Rate Chart */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Queue Abandonment Rate (%)</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={abandonmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="rate" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6 shadow-sm bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600">
            <Lightbulb className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">AI Recommendations</h3>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg bg-white p-4 shadow-sm border-l-4 border-red-500">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-red-500 text-red-700 text-[10px]">
                URGENT
              </Badge>
            </div>
            <p className="text-xs font-medium text-gray-900 mb-2">Immediate Action Required</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Open <span className="font-semibold">secondary billing counter</span> immediately. Current queue exceeds critical threshold.
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-900 mb-2">Peak Hour Preparation</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Schedule additional staff at <span className="font-semibold">4:30 PM</span> to handle expected surge between 5-7 PM.
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-900 mb-2">Process Optimization</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Implement express checkout lane for customers with 3 or fewer items to reduce average wait time.
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-900 mb-2">Queue Management</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Deploy queue assistant to pre-screen and prepare customer payments, reducing service time by 25%.
            </p>
          </div>

          <div className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
            <p className="text-xs font-medium mb-1">Expected Impact</p>
            <p className="text-2xl font-bold">-42%</p>
            <p className="text-xs opacity-90 mt-1">Reduction in queue abandonment with optimizations</p>
          </div>

          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-xs font-medium text-green-900 mb-1">Revenue Protection</p>
            <p className="text-sm font-semibold text-green-700">₹85,400</p>
            <p className="text-xs text-green-600 mt-1">Daily revenue saved by reducing queue abandonment</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
