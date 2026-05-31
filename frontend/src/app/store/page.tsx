"use client";
import { motion } from "framer-motion";
import { Wifi, WifiOff, Eye, Users, Activity } from "lucide-react";

const API_BASE = "http://localhost:8000";

const cameras = [
  { id: "CAM_1", name: "Main Entrance", status: "online", zone: "Entry" },
  { id: "CAM_2", name: "Maybelline Zone", status: "online", zone: "Cosmetics" },
  { id: "CAM_3", name: "DermDoc Zone", status: "online", zone: "Skincare" },
  { id: "CAM_4", name: "Billing Counter", status: "online", zone: "Checkout" },
  { id: "CAM_5", name: "Lakme Zone", status: "online", zone: "Cosmetics" },
];

export default function StorePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Live Camera Feeds</h1>
        <p className="text-gray-500 mt-1">Brigade Road, Bangalore</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Active Cameras",
            value: "5/5",
            icon: Eye,
            color: "text-purple-600 bg-purple-50",
          },
          {
            label: "AI Processing",
            value: "YOLOv8s",
            icon: Activity,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "System Health",
            value: "99%",
            icon: Activity,
            color: "text-green-600 bg-green-50",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <div
              className={`inline-flex p-3 rounded-xl mb-3 ${
                s.color.split(" ")[1]
              }`}
            >
              <s.icon className={`w-5 h-5 ${s.color.split(" ")[0]}`} />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Real-Time Detections
          </h2>
          <div className="flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            LIVE AI STREAM
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {cameras.map((cam, i) => (
            <motion.div
              key={cam.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-gray-900 rounded-2xl border border-gray-800 shadow-lg overflow-hidden flex flex-col"
            >
              {/* Video Player */}
              <div className="relative w-full aspect-video bg-black">
                {cam.status === "online" ? (
                  <video
                    src={`${API_BASE}/videos/${cam.id}_debug.mp4`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-500 font-medium">OFFLINE</span>
                  </div>
                )}
                
                {/* Overlay Badge */}
                {cam.status === "online" && (
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] text-green-400 font-mono tracking-wider border border-green-500/30 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    REC
                  </div>
                )}
              </div>
              
              {/* Camera Metadata */}
              <div className="p-4 bg-[#1A1A1A] text-gray-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-white">{cam.id} - {cam.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Monitoring Zone: {cam.zone}</p>
                  </div>
                  {cam.status === "online" ? (
                    <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded border border-green-400/20">
                      <Wifi className="w-3 h-3" />
                      Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded border border-red-400/20">
                      <WifiOff className="w-3 h-3" />
                      Offline
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
