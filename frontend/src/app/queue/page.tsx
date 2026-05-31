"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Clock, TrendingUp, AlertTriangle, XCircle } from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1";

const mockHistory = Array.from({ length: 12 }, (_, i) => ({
  time: `${8 + i}:00`,
  queue: Math.floor(Math.random() * 8 + 1),
}));

interface QueueData {
  current_queue_length: number;
  avg_wait_seconds: number;
  peak_queue_length: number;
  abandoned_count: number;
}

export default function QueuePage() {
  const [data, setData] = useState<QueueData | null>(null);

  useEffect(() => {
    axios
      .get(`${API_BASE}/analytics/queue`)
      .then((r) => setData(r.data))
      .catch(() =>
        setData({
          current_queue_length: 4,
          avg_wait_seconds: 180,
          peak_queue_length: 9,
          abandoned_count: 2,
        })
      );
  }, []);

  if (!data)
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-1/4" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse"
            >
              <div className="w-12 h-12 bg-gray-200 rounded-xl mb-3" />
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );

  const stats = [
    {
      label: "Current Queue",
      value: data.current_queue_length,
      icon: Clock,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Avg Wait (s)",
      value: data.avg_wait_seconds,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Peak Today",
      value: data.peak_queue_length,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Abandoned",
      value: data.abandoned_count,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Queue Analytics</h1>
        <p className="text-gray-500 mt-1">
          Billing counter performance and wait times
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <div className={`inline-flex p-3 rounded-xl mb-3 ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
      >
        <h2 className="font-semibold text-gray-800 mb-6">
          Queue Length Over Time
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={mockHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="queue"
              stroke="#6B21A8"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#6B21A8" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
