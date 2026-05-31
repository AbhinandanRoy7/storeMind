import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

interface DashboardState {
  events: any[];
  addEvent: (event: any) => void;
  initializeRealtime: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  events: [],
  addEvent: (event) => set((state) => ({ events: [event, ...state.events].slice(0, 100) })), // Keep last 100
  initializeRealtime: () => {
    supabase
      .channel('public:events')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'events' },
        (payload) => {
          set((state) => ({ events: [payload.new, ...state.events].slice(0, 100) }));
        }
      )
      .subscribe();
  },
}));
