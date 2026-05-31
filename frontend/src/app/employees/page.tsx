"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Award, UserCheck, AlertCircle, MapPin } from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1";

interface Employee {
  employee_id: string;
  interactions: number;
  zone: string;
  productivity: number;
}

interface EmployeeData {
  total_employees: number;
  active_employees: number;
  idle_count: number;
  leaderboard: Employee[];
}

export default function EmployeesPage() {
  const [data, setData] = useState<EmployeeData | null>(null);

  useEffect(() => {
    axios
      .get(`${API_BASE}/analytics/employees`)
      .then((r) => setData(r.data))
      .catch(() =>
        setData({
          total_employees: 5,
          active_employees: 4,
          idle_count: 1,
          leaderboard: [
            {
              employee_id: "EMP001",
              interactions: 34,
              zone: "Maybelline",
              productivity: 94,
            },
            {
              employee_id: "EMP002",
              interactions: 28,
              zone: "DermDoc",
              productivity: 82,
            },
            {
              employee_id: "EMP003",
              interactions: 21,
              zone: "Billing",
              productivity: 71,
            },
            {
              employee_id: "EMP004",
              interactions: 15,
              zone: "Lakme",
              productivity: 55,
            },
            {
              employee_id: "EMP005",
              interactions: 6,
              zone: "Entry",
              productivity: 22,
            },
          ],
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
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse"
            >
              <div className="w-12 h-12 bg-gray-200 rounded-xl mb-3" />
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Employee Analytics
        </h1>
        <p className="text-gray-500 mt-1">
          Staff productivity and coverage insights
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Staff",
            value: data.total_employees,
            icon: UserCheck,
            color: "text-purple-600 bg-purple-50",
          },
          {
            label: "Active Now",
            value: data.active_employees,
            icon: Award,
            color: "text-green-600 bg-green-50",
          },
          {
            label: "Idle",
            value: data.idle_count,
            icon: AlertCircle,
            color: "text-amber-600 bg-amber-50",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <div className={`inline-flex p-3 rounded-xl mb-3 ${s.color.split(" ")[1]}`}>
              <s.icon className={`w-5 h-5 ${s.color.split(" ")[0]}`} />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Staff Leaderboard</h2>
          <p className="text-sm text-gray-400">
            Ranked by customer interactions
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          {(data.leaderboard || []).map((emp, i) => (
            <motion.div
              key={emp.employee_id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  i === 0
                    ? "bg-yellow-100 text-yellow-700"
                    : i === 1
                    ? "bg-gray-100 text-gray-600"
                    : i === 2
                    ? "bg-orange-100 text-orange-600"
                    : "bg-purple-50 text-purple-600"
                }`}
              >
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{emp.employee_id}</span>
                  <span className="text-sm font-bold text-purple-700">
                    {emp.interactions} interactions
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-400">{emp.zone}</span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-600 to-violet-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${emp.productivity}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Productivity: {emp.productivity}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
