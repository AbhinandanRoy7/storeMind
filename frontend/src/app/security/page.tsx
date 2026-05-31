"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Info, AlertCircle } from "lucide-react";

const API_BASE = "http://localhost:8000/api/v1";

type Severity = "CRITICAL" | "WARN" | "INFO";

interface Anomaly {
  id: number | string;
  anomaly_type: string;
  description: string;
  severity: Severity;
  timestamp: string;
}

const severityConfig: Record<
  Severity,
  { color: string; icon: typeof Shield; bg: string; border: string }
> = {
  CRITICAL: {
    color: "text-red-600",
    icon: AlertCircle,
    bg: "bg-red-50",
    border: "border-red-400",
  },
  WARN: {
    color: "text-amber-600",
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-400",
  },
  INFO: {
    color: "text-blue-600",
    icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-400",
  },
};

export default function SecurityPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [riskScore, setRiskScore] = useState(12);

  useEffect(() => {
    axios
      .get(`${API_BASE}/anomalies`)
      .then((r) => {
        const data: Anomaly[] = Array.isArray(r.data)
          ? r.data
          : r.data.anomalies || [];
        setAnomalies(data);
        setRiskScore(
          data.filter((a) => a.severity === "CRITICAL").length * 30 +
            data.filter((a) => a.severity === "WARN").length * 10
        );
      })
      .catch(() =>
        setAnomalies([
          {
            id: 1,
            anomaly_type: "Queue Spike",
            description: "Queue length exceeded 8 customers",
            severity: "WARN",
            timestamp: new Date().toISOString(),
          },
          {
            id: 2,
            anomaly_type: "Dead Zone",
            description: "Lakme zone had no visitors for 30 min",
            severity: "INFO",
            timestamp: new Date().toISOString(),
          },
        ])
      );
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Security Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Anomaly detection and risk monitoring
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Risk Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-1 bg-gradient-to-br from-purple-700 to-violet-800 rounded-2xl p-6 text-white"
        >
          <Shield className="w-8 h-8 mb-3 text-purple-300" />
          <div className="text-4xl font-bold">{Math.min(riskScore, 100)}</div>
          <div className="text-purple-200 text-sm mt-1">Risk Score / 100</div>
          <div className="mt-4 h-2 bg-purple-900/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-purple-300 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(riskScore, 100)}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </motion.div>

        {/* Severity Counts */}
        <div className="col-span-2 grid grid-cols-3 gap-4">
          {(["CRITICAL", "WARN", "INFO"] as Severity[]).map((sev, i) => (
            <motion.div
              key={sev}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center"
            >
              <div
                className={`text-3xl font-bold ${severityConfig[sev].color}`}
              >
                {anomalies.filter((a) => a.severity === sev).length}
              </div>
              <div className="text-sm text-gray-500 mt-1 font-medium">
                {sev}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Active Incidents</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Real-time anomaly feed
          </p>
        </div>
        {anomalies.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="font-medium">No active incidents. All clear.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {anomalies.map((a, i) => {
              const cfg = severityConfig[a.severity] || severityConfig.INFO;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={a.id ?? i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex items-start gap-4 p-4 border-l-4 ${cfg.border} ${cfg.bg}`}
                >
                  <Icon className={`w-5 h-5 mt-0.5 ${cfg.color} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-medium text-sm">
                        {a.anomaly_type}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cfg.bg} ${cfg.color} border ${cfg.border}`}
                      >
                        {a.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {a.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(a.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
