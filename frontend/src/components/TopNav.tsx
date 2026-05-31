import { Bell, Search } from 'lucide-react';
import { Input } from './ui/input';

export function TopNav() {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex-1 flex items-center gap-4">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search insights..." 
            className="pl-9 bg-background border-none shadow-none focus-visible:ring-1"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
        </button>
        <div className="flex items-center gap-2 border-l border-border pl-4">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-secondary-foreground">
            AD
          </div>
          <div className="text-sm hidden md:block">
            <p className="font-medium leading-none">Admin User</p>
            <p className="text-xs text-muted-foreground">Store Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
}
