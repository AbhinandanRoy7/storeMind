import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { FileText, Download, Calendar, TrendingUp, Award } from "lucide-react";
import { Badge } from "./ui/badge";

const reports = [
  {
    title: "Daily Summary",
    date: "May 31, 2026",
    type: "Daily",
    icon: FileText,
    highlights: [
      "2,847 visitors today (+12.5%)",
      "24.8% conversion rate (-3.2%)",
      "₹4.2L revenue generated",
    ],
  },
  {
    title: "Weekly Summary",
    date: "May 25 - May 31, 2026",
    type: "Weekly",
    icon: Calendar,
    highlights: [
      "18,240 total visitors",
      "26.3% avg conversion rate",
      "₹28.6L weekly revenue",
    ],
  },
];

const topRecommendations = [
  {
    priority: "high",
    title: "Open Secondary Billing Counter",
    impact: "+₹1.8L daily revenue",
    timeframe: "Immediate",
  },
  {
    priority: "medium",
    title: "Optimize Maybelline Zone",
    impact: "+₹45K daily revenue",
    timeframe: "This Week",
  },
  {
    priority: "medium",
    title: "Staff Training Program",
    impact: "+15% productivity",
    timeframe: "Next Month",
  },
];

export function ExecutiveReports() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Card className="p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Executive Reports</h3>
              <p className="text-sm text-muted-foreground">Auto-generated insights</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {reports.map((report, index) => (
              <div
                key={index}
                className="rounded-lg border bg-gradient-to-br from-purple-50 to-indigo-50 p-4 hover:shadow-md transition-shadow"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600">
                      <report.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{report.title}</h4>
                      <p className="text-xs text-muted-foreground">{report.date}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-purple-200 text-purple-700 text-[10px]">
                    {report.type}
                  </Badge>
                </div>

                <div className="mb-4 space-y-2 rounded-lg border bg-white p-3">
                  <p className="text-xs font-medium text-gray-900 mb-2">Key Highlights</p>
                  {report.highlights.map((highlight, i) => (
                    <div key={i} className="flex gap-2 text-xs text-gray-600">
                      <span className="text-purple-500">•</span>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>

                <Button className="w-full gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 shadow-sm bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
          <div className="mb-4 flex items-center gap-3">
            <Award className="h-8 w-8" />
            <div>
              <h3 className="text-lg font-semibold">Store Performance Score</h3>
              <p className="text-sm opacity-90">Overall rating for today</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg bg-white/10 backdrop-blur-sm p-4">
              <p className="text-xs opacity-75 mb-1">Visitor Traffic</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">A+</p>
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="rounded-lg bg-white/10 backdrop-blur-sm p-4">
              <p className="text-xs opacity-75 mb-1">Conversion</p>
              <p className="text-2xl font-bold">B+</p>
            </div>
            <div className="rounded-lg bg-white/10 backdrop-blur-sm p-4">
              <p className="text-xs opacity-75 mb-1">Staff Efficiency</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">A</p>
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="rounded-lg bg-white/10 backdrop-blur-sm p-4">
              <p className="text-xs opacity-75 mb-1">Security</p>
              <p className="text-2xl font-bold">A+</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Top Recommendations</h3>
          <p className="text-xs text-muted-foreground">Priority actions</p>
        </div>

        <div className="space-y-3">
          {topRecommendations.map((rec, index) => (
            <div
              key={index}
              className={`rounded-lg border p-4 ${
                rec.priority === "high"
                  ? "border-red-200 bg-red-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 ${
                    rec.priority === "high"
                      ? "border-red-500 text-red-700 bg-white"
                      : "border-amber-500 text-amber-700 bg-white"
                  }`}
                >
                  {rec.priority.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground">{rec.timeframe}</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">{rec.title}</h4>
              <p className="text-xs font-medium text-green-700">{rec.impact}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
          <p className="text-xs font-medium text-purple-900 mb-2">Potential Revenue Impact</p>
          <p className="text-3xl font-bold text-purple-700">₹2.3L</p>
          <p className="text-xs text-purple-600 mt-1">Daily revenue opportunity with all optimizations</p>
        </div>

        <Button className="mt-4 w-full gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
          <FileText className="h-4 w-4" />
          Generate Full Report
        </Button>
      </Card>
    </div>
  );
}
