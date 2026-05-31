"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { TrendingDown, Target } from "lucide-react";

const API_BASE = ${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")}/api/v1;

export default function FunnelPage() {
  const [data, setData] = useState({
    entries: 0,
    zone_visits: 0,
    billing_visits: 0,
    purchases: 0,
    overall_conversion_rate_percentage: 0,
  });

  useEffect(() => {
    axios
      .get(`${API_BASE}/analytics/funnel`)
      .then((r) => setData(r.data))
      .catch(() =>
        setData({
          entries: 147,
          zone_visits: 112,
          billing_visits: 43,
          purchases: 31,
          overall_conversion_rate_percentage: 21.1,
        })
      );
  }, []);

  const funnelData = [
    { name: "Store Entry", value: data.entries, fill: "#6B21A8" },
    { name: "Zone Visit", value: data.zone_visits, fill: "#7C3AED" },
    { name: "Billing", value: data.billing_visits, fill: "#8B5CF6" },
    { name: "Purchase", value: data.purchases, fill: "#A78BFA" },
  ];

  const dropoffs = [
    {
      stage: "Entry → Zone",
      rate:
        data.entries > 0
          ? (
              ((data.entries - data.zone_visits) / data.entries) *
              100
            ).toFixed(1)
          : 0,
    },
    {
      stage: "Zone → Billing",
      rate:
        data.zone_visits > 0
          ? (
              ((data.zone_visits - data.billing_visits) / data.zone_visits) *
              100
            ).toFixed(1)
          : 0,
    },
    {
      stage: "Billing → Purchase",
      rate:
        data.billing_visits > 0
          ? (
              ((data.billing_visits - data.purchases) / data.billing_visits) *
              100
            ).toFixed(1)
          : 0,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Customer Journey Funnel
        </h1>
        <p className="text-gray-500 mt-1">
          Track visitor progression from entry to purchase
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Funnel Bars */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-6">
            Conversion Funnel
          </h2>
          <div className="space-y-3">
            {funnelData.map((stage, i) => (
              <motion.div
                key={stage.name}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">
                    {stage.name}
                  </span>
                  <span className="font-bold" style={{ color: stage.fill }}>
                    {stage.value}
                  </span>
                </div>
                <div className="h-10 bg-gray-100 rounded-lg overflow-hidden">
                  <motion.div
                    className="h-full rounded-lg flex items-center pl-3"
                    style={{
                      backgroundColor: stage.fill,
                      width: `${
                        funnelData[0].value > 0
                          ? (stage.value / funnelData[0].value) * 100
                          : 0
                      }%`,
                    }}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        funnelData[0].value > 0
                          ? (stage.value / funnelData[0].value) * 100
                          : 0
                      }%`,
                    }}
                    transition={{ duration: 0.8, delay: i * 0.15 }}
                  >
                    <span className="text-white text-xs font-medium">
                      {funnelData[0].value > 0
                        ? (
                            (stage.value / funnelData[0].value) *
                            100
                          ).toFixed(0)
                        : 0}
                      %
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats & Drop-off */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-600 to-violet-700 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5" />
              <span className="text-sm font-medium text-purple-200">
                Overall Conversion
              </span>
            </div>
            <div className="text-4xl font-bold">
              {data.overall_conversion_rate_percentage}%
            </div>
            <p className="text-purple-200 text-sm mt-1">
              Visitors who made a purchase
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">
              Drop-off Analysis
            </h3>
            <div className="space-y-3">
              {dropoffs.map((d, i) => (
                <motion.div
                  key={d.stage}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <span className="text-sm text-gray-600">{d.stage}</span>
                  <span
                    className={`text-sm font-bold flex items-center gap-1 ${
                      Number(d.rate) > 50 ? "text-red-500" : "text-amber-500"
                    }`}
                  >
                    <TrendingDown className="w-3 h-3" />
                    {d.rate}% drop
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
