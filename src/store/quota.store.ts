import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// YouTube Data API v3 quota costs
export const QUOTA_COSTS = {
  search: 100,       // search.list
  videos: 1,         // videos.list (per batch, up to 50 IDs)
  playlistItems: 1,  // playlistItems.list
  channels: 1,       // channels.list
} as const;

export const DAILY_QUOTA_LIMIT = 10_000;

interface QuotaEntry {
  cost: number;
  operation: string;
  timestamp: number;
}

interface QuotaState {
  entries: QuotaEntry[];
  todayUsed: () => number;
  addUsage: (operation: keyof typeof QUOTA_COSTS) => void;
  resetIfNewDay: () => void;
  lastResetDate: string; // YYYY-MM-DD
}

const today = () => new Date().toISOString().slice(0, 10);

export const useQuotaStore = create<QuotaState>()(
  persist(
    (set, get) => ({
      entries: [],
      lastResetDate: today(),

      todayUsed: () => {
        const d = today();
        return get().entries
          .filter(e => new Date(e.timestamp).toISOString().slice(0, 10) === d)
          .reduce((sum, e) => sum + e.cost, 0);
      },

      addUsage: (operation) => {
        get().resetIfNewDay();
        const cost = QUOTA_COSTS[operation];
        set(state => ({
          entries: [...state.entries.slice(-500), { cost, operation, timestamp: Date.now() }]
        }));
      },

      resetIfNewDay: () => {
        const d = today();
        if (get().lastResetDate !== d) {
          set({ entries: [], lastResetDate: d });
        }
      },
    }),
    { name: 'sonicview-quota' }
  )
);
