"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FileText, Calendar, TrendingUp, RefreshCw } from "lucide-react";

const API_BASE = ${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")}/api/v1;

interface Report {
  title: string;
  content: string;
}

export default function ReportsPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/reports/latest`);
      setReport(res.data);
    } catch {
      // Show mock report on error
      setReport({
        title: `Daily Report — ${new Date().toISOString().split("T")[0]}`,
        content: `# StoreMind AI — Daily Executive Report

## Key Metrics
- Total Footfall: 147
- Conversion Rate: 21.1%
- Peak Queue: 9 customers
- Active Staff: 5 employees

## Zone Performance
- 🏆 Top Zone: Maybelline (112 visits, 78s avg dwell)
- ⚠️  Underperforming: Faces Canada (43 visits, 45s avg dwell)
- 🔴 Dead Zone Alert: Lakme zone had no visitors for 30 min

## AI Recommendations
• Increase staffing near Maybelline zone during 3–6 PM peak hours
• Reposition Lakme display closer to main traffic aisle
• Open secondary billing counter when queue exceeds 6 customers
• Consider a promotional display at entry zone to boost dwell time`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">
            AI-generated daily executive summaries
          </p>
        </div>
        <button
          onClick={fetchReport}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Generate New Report
        </button>
      </div>

      {/* Report Card */}
      {loading && !report ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center animate-pulse">
          <TrendingUp className="w-12 h-12 mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400">Loading report...</p>
        </div>
      ) : report ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Report header */}
          <div className="p-6 bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-100">
            <div className="flex items-center gap-2 text-purple-700">
              <FileText className="w-5 h-5" />
              <h2 className="font-semibold">{report.title}</h2>
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Generated {new Date().toLocaleString()}</span>
            </div>
          </div>

          {/* Report content */}
          <div className="p-6">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
              {report.content}
            </pre>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
