import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowUpRight, TrendingUp, AlertCircle } from "lucide-react";

const zoneData = [
  { name: "DermDoc", visits: 486, avgDwell: "6m 24s", engagement: 92, conversion: 28, x: 10, y: 15, intensity: 95 },
  { name: "The Face Shop", visits: 412, avgDwell: "5m 18s", engagement: 88, conversion: 24, x: 35, y: 15, intensity: 85 },
  { name: "Minimalist", visits: 524, avgDwell: "7m 12s", engagement: 94, conversion: 31, x: 60, y: 15, intensity: 98 },
  { name: "Aqualogica", visits: 368, avgDwell: "4m 42s", engagement: 76, conversion: 18, x: 10, y: 45, intensity: 70 },
  { name: "Faces Canada", visits: 445, avgDwell: "5m 54s", engagement: 85, conversion: 22, x: 35, y: 45, intensity: 82 },
  { name: "Maybelline", visits: 398, avgDwell: "8m 36s", engagement: 72, conversion: 15, x: 60, y: 45, intensity: 65 },
  { name: "Lakme", visits: 358, avgDwell: "5m 06s", engagement: 80, conversion: 21, x: 20, y: 75, intensity: 75 },
  { name: "Billing Counter", visits: 1124, avgDwell: "3m 18s", engagement: 95, conversion: 63, x: 60, y: 75, intensity: 100 },
];

export function StoreHeatmap() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <Card className="p-6 shadow-sm lg:col-span-3">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Store Heatmap</h3>
            <p className="text-sm text-muted-foreground">Live zone activity visualization</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-8 rounded bg-gradient-to-r from-purple-200 to-purple-900"></div>
              <span className="text-muted-foreground">Low → High Activity</span>
            </div>
          </div>
        </div>

        {/* Store Floor Plan */}
        <div className="relative h-[400px] rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-4">
          <div className="absolute top-4 left-4 text-xs text-muted-foreground">Entry →</div>
          
          {zoneData.map((zone, index) => (
            <div
              key={index}
              className="absolute cursor-pointer transition-transform hover:scale-105 hover:z-10"
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: '22%',
                height: '22%',
              }}
            >
              <div
                className={`h-full rounded-lg border-2 border-white shadow-lg flex flex-col items-center justify-center p-3 transition-all ${
                  zone.intensity > 90
                    ? "bg-purple-900 text-white"
                    : zone.intensity > 75
                    ? "bg-purple-700 text-white"
                    : zone.intensity > 60
                    ? "bg-purple-500 text-white"
                    : "bg-purple-300 text-purple-900"
                }`}
              >
                <p className="text-xs font-bold text-center">{zone.name}</p>
                <p className="text-lg font-bold mt-1">{zone.visits}</p>
                <p className="text-[10px] opacity-90">visitors</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 shadow-sm lg:col-span-2">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Zone Analytics</h3>
          <p className="text-sm text-muted-foreground">Performance by zone</p>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {zoneData
            .sort((a, b) => b.visits - a.visits)
            .map((zone, index) => (
              <div
                key={index}
                className={`rounded-lg border p-3 transition-all hover:shadow-md ${
                  zone.engagement > 85 && zone.conversion < 25
                    ? "border-amber-200 bg-amber-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{zone.name}</span>
                    {zone.engagement > 85 && zone.conversion < 25 && (
                      <Badge variant="outline" className="border-amber-500 text-amber-700 text-[10px] px-1 py-0">
                        High Attention
                      </Badge>
                    )}
                  </div>
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Visits</p>
                    <p className="font-semibold text-gray-900">{zone.visits}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Dwell</p>
                    <p className="font-semibold text-gray-900">{zone.avgDwell}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Engagement</p>
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-gray-900">{zone.engagement}%</p>
                      {zone.engagement > 90 && <TrendingUp className="h-3 w-3 text-green-600" />}
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Conversion</p>
                    <p className={`font-semibold ${zone.conversion > 25 ? 'text-green-600' : 'text-gray-900'}`}>
                      {zone.conversion}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-900">Optimization Opportunity</p>
              <p className="text-xs text-amber-700 mt-1">
                Maybelline shows high dwell time (8m 36s) but low conversion (15%). Consider product placement review.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
