import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  apiKey: string;
  hasSeenApiKeyModal: boolean;
  viewMode: 'grid' | 'list';
  setApiKey: (key: string) => Promise<void>;
  clearApiKey: () => void;
  setHasSeenApiKeyModal: (seen: boolean) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  syncApiKeyWithCloud: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: '',
      hasSeenApiKeyModal: false,
      viewMode: 'grid',

      setApiKey: async (key) => {
        set({ apiKey: key, hasSeenApiKeyModal: true });
        try {
          await fetch('/api/user/keys', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey: key })
          });
        } catch (e) { console.error('Cloud sync failed', e) }
      },
      clearApiKey: () => set({ apiKey: '' }),
      setHasSeenApiKeyModal: (seen) => set({ hasSeenApiKeyModal: seen }),
      setViewMode: (mode) => set({ viewMode: mode }),
      syncApiKeyWithCloud: async () => {
        try {
          const res = await fetch('/api/user/keys');
          if (res.ok) {
            const data = await res.json();
            if (data.apiKey) set({ apiKey: data.apiKey, hasSeenApiKeyModal: true });
          }
        } catch (e) { console.error('Cloud pull failed', e) }
      }
    }),
    {
      name: 'sonicview-settings',
    }
  )
);