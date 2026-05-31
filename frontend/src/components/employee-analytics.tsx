import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Trophy, TrendingUp, AlertCircle, Lightbulb } from "lucide-react";
import { Progress } from "./ui/progress";

const employeeData = [
  { id: "EMP-001", name: "Priya Sharma", interactions: 47, activeTime: "6h 42m", idleTime: "1h 18m", score: 94 },
  { id: "EMP-002", name: "Rahul Verma", interactions: 52, activeTime: "7h 15m", idleTime: "45m", score: 97 },
  { id: "EMP-003", name: "Anjali Patel", interactions: 38, activeTime: "5h 24m", idleTime: "2h 36m", score: 76 },
  { id: "EMP-004", name: "Karan Singh", interactions: 44, activeTime: "6h 18m", idleTime: "1h 42m", score: 88 },
  { id: "EMP-005", name: "Sneha Reddy", interactions: 49, activeTime: "6h 54m", idleTime: "1h 6m", score: 92 },
];

export function EmployeeAnalytics() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="p-6 shadow-sm lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Employee Productivity</h3>
            <p className="text-sm text-muted-foreground">Real-time performance leaderboard</p>
          </div>
          <Badge variant="outline" className="border-purple-200 text-purple-700">
            5 Staff Active
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-3 font-medium">Staff</th>
                <th className="pb-3 font-medium">Interactions</th>
                <th className="pb-3 font-medium">Active Time</th>
                <th className="pb-3 font-medium">Idle Time</th>
                <th className="pb-3 font-medium">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {employeeData
                .sort((a, b) => b.score - a.score)
                .map((employee, index) => (
                  <tr key={employee.id} className="group hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {index === 0 && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
                            <Trophy className="h-3 w-3 text-amber-600" />
                          </div>
                        )}
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-xs font-semibold text-white">
                          {employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                          <p className="text-xs text-muted-foreground">{employee.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{employee.interactions}</span>
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-sm text-gray-900">{employee.activeTime}</span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-sm ${
                          parseInt(employee.idleTime) > 2 ? "text-red-600 font-medium" : "text-gray-600"
                        }`}
                      >
                        {employee.idleTime}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-20">
                          <Progress value={employee.score} className="h-2" />
                        </div>
                        <span
                          className={`text-sm font-semibold ${
                            employee.score >= 90
                              ? "text-green-600"
                              : employee.score >= 80
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}
                        >
                          {employee.score}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex gap-3">
          <div className="flex-1 rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-green-700" />
              <p className="text-xs font-medium text-green-900">Top Performer</p>
            </div>
            <p className="text-sm font-semibold text-green-900">Rahul Verma</p>
            <p className="text-xs text-green-700">97% productivity score</p>
          </div>
          <div className="flex-1 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-amber-700" />
              <p className="text-xs font-medium text-amber-900">Underutilized</p>
            </div>
            <p className="text-sm font-semibold text-amber-900">Anjali Patel</p>
            <p className="text-xs text-amber-700">High idle time: 2h 36m</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-sm bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600">
            <Lightbulb className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">AI Recommendations</h3>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-900 mb-2">Staff Optimization</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Assign <span className="font-semibold">Anjali Patel (EMP-003)</span> to Maybelline zone during evening hours to improve engagement scores.
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-900 mb-2">Peak Hour Staffing</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Deploy additional staff near billing counter between <span className="font-semibold">5 PM - 7 PM</span> to reduce queue times.
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-900 mb-2">Training Opportunity</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Schedule product knowledge session for staff with interaction scores below 80% to improve conversion rates.
            </p>
          </div>

          <div className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
            <p className="text-xs font-medium mb-1">Expected Improvement</p>
            <p className="text-2xl font-bold">+15%</p>
            <p className="text-xs opacity-90 mt-1">Overall productivity score with optimizations</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
