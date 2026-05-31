import { Activity, Camera, Zap, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export function LiveStatusBar() {
  return (
    <div className="border-b bg-gradient-to-r from-emerald-50 to-green-50 px-4 sm:px-6 py-3 overflow-x-auto">
      <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm min-w-max">
        {/* Live Badge */}
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-2 w-2 rounded-full bg-green-500"
          />
          <span className="font-semibold text-green-700">LIVE</span>
        </div>

        <div className="h-4 w-px bg-gray-300" />

        {/* Last Update */}
        <div className="flex items-center gap-2 text-gray-600">
          <Activity className="h-4 w-4" />
          <span>Last CCTV update: 2 seconds ago</span>
        </div>

        <div className="h-4 w-px bg-gray-300" />

        {/* Cameras Online */}
        <div className="flex items-center gap-2 text-gray-600">
          <Camera className="h-4 w-4 text-green-600" />
          <span>Cameras: <span className="font-semibold text-green-700">5/5</span> Online</span>
        </div>

        <div className="h-4 w-px bg-gray-300" />

        {/* Processing FPS */}
        <div className="flex items-center gap-2 text-gray-600">
          <Zap className="h-4 w-4 text-amber-600" />
          <span>Processing: <span className="font-semibold text-amber-700">24 FPS</span></span>
        </div>

        <div className="h-4 w-px bg-gray-300" />

        {/* Active Alerts */}
        <div className="flex items-center gap-2 text-gray-600">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span>Active Alerts: <span className="font-semibold text-red-700">3</span></span>
        </div>
      </div>
    </div>
  );
}