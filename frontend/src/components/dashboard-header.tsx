import { Search, Bell, ChevronDown, MapPin, Calendar, Activity } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-white">
      <div className="flex h-16 items-center gap-2 sm:gap-4 px-4 sm:px-6">
        {/* Store Selector */}
        <Button variant="outline" className="gap-2 border-gray-200 hidden sm:flex">
          <MapPin className="h-4 w-4 text-[#6B21A8]" />
          <span className="font-medium">Brigade Road Store</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* Mobile: Store Selector Compact */}
        <Button variant="outline" className="gap-2 border-gray-200 sm:hidden ml-12">
          <MapPin className="h-4 w-4 text-[#6B21A8]" />
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* Date Range Picker */}
        <Button variant="outline" className="gap-2 border-gray-200 hidden md:flex">
          <Calendar className="h-4 w-4 text-[#6B21A8]" />
          <span className="font-medium">Today, May 31</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* Search Bar */}
        <div className="relative ml-auto flex-1 max-w-md hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search metrics, zones, or insights..."
            className="pl-9 border-gray-200"
          />
        </div>

        {/* Notifications */}
        <Button variant="outline" size="icon" className="relative border-gray-200 ml-auto lg:ml-0">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
            3
          </span>
        </Button>

        {/* User Profile */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#6B21A8] to-[#7C3AED] text-sm font-semibold text-white cursor-pointer">
          AK
        </div>
      </div>
    </header>
  );
}
