import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { YouTubeVideoItem } from '@/services/youtube.service';

export interface Playlist {
  id: string;
  name: string;
  tracks: YouTubeVideoItem[];
  createdAt: number;
}

interface PlaylistState {
  playlists: Playlist[];
  createPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, track: YouTubeVideoItem) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  syncPlaylistsWithCloud: () => Promise<void>;
  pushPlaylistsToCloud: () => Promise<void>;
}

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set, get) => ({
      playlists: [],
      pushPlaylistsToCloud: async () => {
        try {
          await fetch('/api/playlists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playlists: get().playlists })
          });
        } catch(e) { console.error('Playlist push failed', e) }
      },
      syncPlaylistsWithCloud: async () => {
        try {
          const res = await fetch('/api/playlists');
          if (res.ok) {
            const data = await res.json();
            if (data.playlists && data.playlists.length > 0) {
              set({ playlists: data.playlists });
            }
          }
        } catch (e) { console.error('Playlist sync failed', e) }
      },
      createPlaylist: (name) => {
        set((state) => ({
          playlists: [
             ...state.playlists, 
             { id: Date.now().toString(), name, tracks: [], createdAt: Date.now() }
          ]
        }));
        get().pushPlaylistsToCloud();
      },
      deletePlaylist: (id) => {
        set((state) => ({
          playlists: state.playlists.filter(p => p.id !== id)
        }));
        get().pushPlaylistsToCloud();
      },
      addTrackToPlaylist: (playlistId, track) => {
        set((state) => {
          const playlists = state.playlists.map(p => {
            if (p.id === playlistId) {
              const trackId = typeof track.id === 'string' ? track.id : track.id.videoId;
              if (p.tracks.some(t => (typeof t.id === 'string' ? t.id : t.id.videoId) === trackId)) return p;
              return { ...p, tracks: [...p.tracks, track] };
            }
            return p;
          });
          return { playlists };
        });
        get().pushPlaylistsToCloud();
      },
      removeTrackFromPlaylist: (playlistId, trackId) => {
        set((state) => {
          const playlists = state.playlists.map(p => {
            if (p.id === playlistId) {
              return { ...p, tracks: p.tracks.filter(t => (typeof t.id === 'string' ? t.id : t.id.videoId) !== trackId) };
            }
            return p;
          });
          return { playlists };
        });
        get().pushPlaylistsToCloud();
      }
    }),
    {
      name: 'sonicview-playlists',
    }
  )
);
