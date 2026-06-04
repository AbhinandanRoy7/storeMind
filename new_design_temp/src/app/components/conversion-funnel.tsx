import { Card } from "./ui/card";
import { ChevronDown, Lightbulb, TrendingDown } from "lucide-react";
import { Badge } from "./ui/badge";

const funnelStages = [
  { stage: "Entry", count: 2847, percentage: 100, color: "bg-purple-600" },
  { stage: "Zone Browsing", count: 2456, percentage: 86, color: "bg-purple-500", dropOff: 14 },
  { stage: "Product Interest", count: 1823, percentage: 64, color: "bg-purple-400", dropOff: 26 },
  { stage: "Billing Visit", count: 1124, percentage: 39, color: "bg-purple-300", dropOff: 38 },
  { stage: "Purchase", count: 706, percentage: 25, color: "bg-purple-200", dropOff: 37 },
];

export function ConversionFunnel() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="p-6 shadow-sm lg:col-span-2">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Customer Conversion Funnel</h3>
            <p className="text-sm text-muted-foreground">Today's customer journey analysis</p>
          </div>
          <Badge variant="outline" className="border-purple-200 text-purple-700">
            Live Data
          </Badge>
        </div>

        <div className="space-y-4">
          {funnelStages.map((stage, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                  {stage.dropOff && (
                    <span className="text-xs text-red-600 font-medium">
                      -{stage.dropOff}% drop-off
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-900">{stage.count.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground w-12 text-right">{stage.percentage}%</span>
                </div>
              </div>
              <div className="relative h-12 rounded-lg bg-gray-100 overflow-hidden">
                <div
                  className={`h-full ${stage.color} transition-all duration-500 flex items-center justify-between px-4`}
                  style={{ width: `${stage.percentage}%` }}
                >
                  <span className="text-xs font-medium text-white">{stage.count.toLocaleString()} visitors</span>
                  {stage.percentage > 30 && (
                    <span className="text-xs font-medium text-white">{stage.percentage}%</span>
                  )}
                </div>
              </div>
              {index < funnelStages.length - 1 && (
                <div className="flex justify-center py-1">
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-3">
            <TrendingDown className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">Revenue Opportunity Loss</p>
              <p className="mt-1 text-xs text-amber-700">
                Potential revenue loss of ₹2,14,100 from 418 drop-offs between Product Interest and Purchase
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Insight Card */}
      <Card className="p-6 shadow-sm bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6B21A8] to-[#7C3AED]">
            <Lightbulb className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">AI Insight</h3>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-900 mb-2">Conversion Drop Alert</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Conversion rate dropped <span className="font-semibold text-red-600">18%</span> today compared to yesterday.
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-900 mb-2">Primary Cause</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Queue spike near billing counter between <span className="font-semibold">5 PM and 7 PM</span> causing customer abandonment.
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-900 mb-2">Recommendation</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              • Open secondary billing counter during peak hours<br />
              • Deploy additional staff at 4:30 PM<br />
              • Consider express checkout lane
            </p>
          </div>

          <div className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
            <p className="text-sm font-medium mb-1">Potential Impact</p>
            <p className="text-2xl font-bold">+₹1.8L</p>
            <p className="text-xs opacity-90 mt-1">Estimated daily revenue recovery</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
