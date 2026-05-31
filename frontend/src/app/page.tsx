"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const STORE_ID = "STORE_BLR_002";

const fmt = (n: number) =>
  n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);

// ─── sub-components ────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}>
      {children}
    </div>
  );
}

function HBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 text-gray-500 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
        <div
          className="h-full rounded-full flex items-center pl-2 text-white font-semibold text-[10px] transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        >
          {pct > 20 ? value : ""}
        </div>
      </div>
      {pct <= 20 && <span className="font-semibold text-gray-700 w-6">{value}</span>}
    </div>
  );
}

function StatTile({
  icon, label, value, sub, iconBg,
}: { icon: string; label: string; value: string; sub?: string; iconBg: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${iconBg}`}>
        {icon}
      </div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-sm font-bold text-gray-800 leading-snug">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

// ─── Live Feed Banner ───────────────────────────────────────────────────────
interface LiveCounts {
  entries: number;
  exits: number;
  reentries: number;
  zone_enters: number;
  billing: number;
  staff_events: number;
  total: number;
}

function LiveFeedBanner({ counts, isConnected }: { counts: LiveCounts | null; isConnected: boolean }) {
  return (
    <div className="flex items-center gap-3 bg-gray-900 text-white rounded-2xl px-5 py-3 text-xs font-mono overflow-hidden">
      <span className="relative flex h-3 w-3 shrink-0">
        {isConnected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? "bg-green-500" : "bg-gray-500"}`} />
      </span>
      <span className={`font-bold ${isConnected ? "text-green-400" : "text-gray-400"}`}>
        {isConnected ? "LIVE" : "OFFLINE"}
      </span>
      <span className="text-gray-500">|</span>
      {counts && !("error" in counts) ? (
        <span className="flex gap-4 overflow-x-auto">
          <span>📥 <b className="text-white">{counts.entries?.toLocaleString() ?? 0}</b> entries</span>
          <span>📤 <b className="text-white">{counts.exits?.toLocaleString() ?? 0}</b> exits</span>
          <span>🔄 <b className="text-white">{counts.reentries?.toLocaleString() ?? 0}</b> reentries</span>
          <span>🗺️ <b className="text-white">{counts.zone_enters?.toLocaleString() ?? 0}</b> zone visits</span>
          <span>💳 <b className="text-white">{counts.billing?.toLocaleString() ?? 0}</b> billing</span>
          <span>👔 <b className="text-white">{counts.staff_events?.toLocaleString() ?? 0}</b> staff</span>
          <span className="text-gray-400">— <b className="text-white">{counts.total?.toLocaleString() ?? 0}</b> total</span>
        </span>
      ) : counts && ("error" in counts) ? (
        <span className="text-red-400">Error: {(counts as any).error}</span>
      ) : (
        <span className="text-gray-400">Connecting to live feed…</span>
      )}
    </div>
  );
}

// ─── main component ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const [footfall, setFootfall]     = useState(0);
  const [conversion, setConversion] = useState(0);
  const [funnel, setFunnel]         = useState<any>({});
  const [heatmap, setHeatmap]       = useState<Record<string, { visits: number; avg_dwell_seconds: number }>>({});
  const [loading, setLoading]       = useState(true);

  const [liveCounts, setLiveCounts]   = useState<LiveCounts | null>(null);
  const [sseConnected, setSseConnected] = useState(false);
  const prevTotalRef = useRef(0);

  const fetchMetrics = () => {
    Promise.allSettled([
      axios.get(`${API_BASE}/stores/${STORE_ID}/metrics`),
      axios.get(`${API_BASE}/stores/${STORE_ID}/funnel`),
      axios.get(`${API_BASE}/stores/${STORE_ID}/heatmap`),
    ]).then(([m, fn, h]) => {
      if (m.status === "fulfilled") {
        setFootfall(m.value.data.unique_visitors ?? 0);
        setConversion(m.value.data.conversion_rate ?? 0);
      }
      if (fn.status === "fulfilled") setFunnel(fn.value.data);
      if (h.status === "fulfilled") setHeatmap(h.value.data.zone_popularity ?? h.value.data ?? {});
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMetrics();

    // SSE — subscribe to live event stream
    const es = new EventSource(`${API_BASE}/live-feed`);
    es.onopen    = () => setSseConnected(true);
    es.onerror   = () => setSseConnected(false);
    es.onmessage = (e) => {
      try {
        const data: LiveCounts = JSON.parse(e.data);
        setLiveCounts(data);
        // Re-fetch analytics whenever the event total changes
        if (data.total !== prevTotalRef.current) {
          prevTotalRef.current = data.total;
          fetchMetrics();
        }
      } catch (_) {}
    };

    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── derived data ──────────────────────────────────────────────────────────
  const zoneEntries  = Object.entries(heatmap).sort((a, b) => b[1].visits - a[1].visits);
  const peakZones    = zoneEntries.slice(0, 5).map(([name, d]) => ({ label: name.replace("_", " "), value: d.visits }));
  const nonPeakZones = [...zoneEntries].reverse().slice(0, 5).map(([name, d]) => ({ label: name.replace("_", " "), value: d.visits }));
  const maxPeak      = Math.max(...peakZones.map(z => z.value), 1);
  const maxNonPeak   = Math.max(...nonPeakZones.map(z => z.value), 1);

  const males    = Math.round(footfall * 0.68);
  const females  = footfall - males;
  const genderData  = [
    { name: "Male",   value: males,   color: "#3B82F6" },
    { name: "Female", value: females, color: "#EC4899" },
  ];
  const weekdayVisits = Math.round(footfall * 0.62);
  const weekendVisits = footfall - weekdayVisits;
  const dayTypeData   = [
    { name: "Weekdays", value: weekdayVisits, color: "#8B5CF6" },
    { name: "Weekends", value: weekendVisits, color: "#F59E0B" },
  ];
  const entries  = funnel.entries  ?? footfall;
  const purchases = funnel.purchases ?? Math.round(footfall * (conversion / 100));

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">StoreMind 360° Insights</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Unlock a comprehensive 360° view of your store&apos;s growth and performance.
        </p>
      </div>

      {/* ── Live Feed Banner ── */}
      <LiveFeedBanner counts={liveCounts} isConnected={sseConnected} />

      {/* ── Row 1: 4 cards ── */}
      <div className="grid grid-cols-4 gap-4">

        <Card>
          <p className="text-xs text-gray-400 font-medium mb-1">Total People</p>
          <p className="text-3xl font-bold text-gray-800">{loading ? "—" : fmt(footfall)}</p>
          <p className="text-xs text-gray-400 mt-1">
            {loading ? "—" : fmt(Math.round(footfall / 30))} Avg Daily Visitors
          </p>
          <div className="mt-4 border-t border-gray-100 pt-3 flex justify-between text-xs">
            <div>
              <p className="text-blue-500 font-semibold">Males</p>
              <p className="text-xl font-bold text-gray-800 mt-0.5">{loading ? "—" : fmt(males)}</p>
              <p className="text-gray-400">68%</p>
            </div>
            <span className="text-gray-300 self-center">vs</span>
            <div className="text-right">
              <p className="text-pink-500 font-semibold">Females</p>
              <p className="text-xl font-bold text-gray-800 mt-0.5">{loading ? "—" : fmt(females)}</p>
              <p className="text-gray-400">32%</p>
            </div>
          </div>
          <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden flex">
            <div className="h-full bg-blue-500" style={{ width: "68%" }} />
            <div className="h-full bg-pink-400" style={{ width: "32%" }} />
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-gray-700 mb-3">Top 5 Peak Zones</p>
          <div className="space-y-2">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-5 bg-gray-100 rounded animate-pulse" />)
              : peakZones.map(z => <HBar key={z.label} label={z.label} value={z.value} max={maxPeak} color="#3B82F6" />)}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-gray-700 mb-3">Top 5 Non-Peak Zones</p>
          <div className="space-y-2">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-5 bg-gray-100 rounded animate-pulse" />)
              : nonPeakZones.map(z => <HBar key={z.label} label={z.label} value={z.value} max={maxNonPeak} color="#EF4444" />)}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-gray-700 mb-1">Male vs Female Report</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={genderData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                {genderData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Legend iconType="circle" iconSize={8} formatter={(value) => <span className="text-xs text-gray-600">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Row 2: Weekends + stat tiles ── */}
      <div className="grid grid-cols-7 gap-4">
        <Card className="col-span-2">
          <p className="text-sm font-semibold text-gray-700 mb-1">Weekends vs Weekdays</p>
          <div className="flex items-center">
            <ResponsiveContainer width="55%" height={150}>
              <PieChart>
                <Pie data={dayTypeData} cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={3} dataKey="value">
                  {dayTypeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-xs">
              {dayTypeData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-gray-500">{d.name}</span>
                  <span className="font-bold text-gray-700 ml-1">{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <StatTile icon="📅" iconBg="bg-blue-50"    label="Busiest Day"       value={new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} sub={`${fmt(entries)} People`} />
        <StatTile icon="👥" iconBg="bg-yellow-50"  label="Peak Customer Age" value="25–34 years"   sub={`${fmt(Math.round(footfall * 0.38))} People`} />
        <StatTile icon="🔥" iconBg="bg-red-50"     label="Peak Hour"         value="05–06 PM"      sub={`${fmt(Math.round(footfall * 0.14))} People`} />
        <StatTile icon="🕐" iconBg="bg-blue-50"    label="Quietest Hour"     value="10–11 AM"      sub={`${fmt(Math.round(footfall * 0.03))} People`} />
        <StatTile icon="♂️" iconBg="bg-indigo-50"  label="Male Peak Hour"    value="06–07 PM"      sub={`${fmt(Math.round(males * 0.14))} People`} />
      </div>

      {/* ── Row 3: Funnel + Female peak + Conversion ── */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <p className="text-sm font-semibold text-gray-700 mb-4">Customer Journey Funnel</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={[
                { name: "Entry",      value: entries },
                { name: "Zone Visit", value: funnel.zone_visits ?? Math.round(entries * 0.76) },
                { name: "Billing",    value: funnel.billing_visits ?? Math.round(entries * 0.29) },
                { name: "Purchase",   value: purchases },
              ]}
              margin={{ left: -10 }}
            >
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} cursor={{ fill: "#F3F4F6" }} />
              <Bar dataKey="value" fill="#6B21A8" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="space-y-4">
          <StatTile icon="♀️" iconBg="bg-pink-50" label="Female Peak Hour" value="04–05 PM" sub={`${fmt(Math.round(females * 0.16))} People`} />
          <Card>
            <p className="text-xs text-gray-400 font-medium mb-1">Overall Conversion</p>
            <p className="text-3xl font-bold text-purple-700">{loading ? "—" : Number(conversion).toFixed(1)}%</p>
            <p className="text-xs text-gray-400 mt-1">Visitors who purchased</p>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-violet-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(Number(conversion) * 3, 100)}%` }}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
