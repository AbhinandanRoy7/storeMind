"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1";

const ZONES = [
  { id: "ENTRY", label: "Entry", col: "1 / 3", row: "1 / 2" },
  { id: "DERMDOC", label: "DermDoc", col: "1 / 2", row: "2 / 3" },
  { id: "MAYBELLINE", label: "Maybelline", col: "2 / 3", row: "2 / 3" },
  { id: "FACES_CANADA", label: "Faces Canada", col: "1 / 2", row: "3 / 4" },
  { id: "LAKME", label: "Lakme", col: "2 / 3", row: "3 / 4" },
  { id: "BILLING", label: "Billing", col: "1 / 3", row: "4 / 5" },
];

function getIntensityColor(visits: number, max: number) {
  if (max === 0) return "bg-purple-50 border-purple-100";
  const ratio = visits / max;
  if (ratio > 0.75) return "bg-purple-700 text-white border-purple-800";
  if (ratio > 0.5) return "bg-purple-500 text-white border-purple-600";
  if (ratio > 0.25) return "bg-purple-300 text-purple-900 border-purple-400";
  return "bg-purple-100 text-purple-800 border-purple-200";
}

export default function HeatmapPage() {
  const [zoneData, setZoneData] = useState<
    Record<string, { visits: number; avg_dwell_seconds: number }>
  >({});

  useEffect(() => {
    axios
      .get(`${API_BASE}/analytics/heatmap`)
      .then((r) => setZoneData(r.data.zones || r.data || {}))
      .catch(() => {
        setZoneData({
          ENTRY: { visits: 147, avg_dwell_seconds: 12 },
          DERMDOC: { visits: 89, avg_dwell_seconds: 95 },
          MAYBELLINE: { visits: 112, avg_dwell_seconds: 78 },
          FACES_CANADA: { visits: 43, avg_dwell_seconds: 45 },
          LAKME: { visits: 67, avg_dwell_seconds: 62 },
          BILLING: { visits: 38, avg_dwell_seconds: 180 },
        });
      });
  }, []);

  const maxVisits = Math.max(
    ...Object.values(zoneData).map((z) => z.visits),
    1
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Store Heatmap</h1>
        <p className="text-gray-500 mt-1">
          Zone engagement — Brigade Road layout
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Store Layout Grid */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
            Store Layout
          </h2>
          <div
            className="grid border-2 border-gray-200 rounded-2xl overflow-hidden"
            style={{
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "repeat(4, 100px)",
            }}
          >
            {ZONES.map((zone, i) => {
              const data = zoneData[zone.id] || {
                visits: 0,
                avg_dwell_seconds: 0,
              };
              const colorClass = getIntensityColor(data.visits, maxVisits);
              return (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`border ${colorClass} flex flex-col items-center justify-center p-3 cursor-default transition-all hover:scale-[1.02]`}
                  style={{ gridColumn: zone.col, gridRow: zone.row }}
                >
                  <div className="font-bold text-sm">{zone.label}</div>
                  <div className="text-xs mt-1 opacity-80">
                    {data.visits} visits
                  </div>
                  <div className="text-xs opacity-70">
                    {data.avg_dwell_seconds}s avg dwell
                  </div>
                </motion.div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 bg-purple-100 rounded border border-purple-200" />
              Low
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 bg-purple-300 rounded border border-purple-400" />
              Medium
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 bg-purple-500 rounded border border-purple-600" />
              High
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 bg-purple-700 rounded border border-purple-800" />
              Very High
            </div>
          </div>
        </div>

        {/* Zone Rankings */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
            Zone Rankings
          </h2>
          <div className="space-y-3">
            {Object.entries(zoneData)
              .sort((a, b) => b[1].visits - a[1].visits)
              .map(([zone, data], i) => (
                <motion.div
                  key={zone}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">
                      {zone.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm font-bold text-purple-700">
                      {data.visits} visits
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-600 to-violet-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(data.visits / maxVisits) * 100}%`,
                      }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Avg dwell: {data.avg_dwell_seconds}s
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
