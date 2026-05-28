import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { YouTubeVideoItem } from '@/services/youtube.service';

export const LIKED_PLAYLIST_ID = 'liked-songs';

export interface Playlist {
  id: string;
  name: string;
  tracks: YouTubeVideoItem[];
  createdAt: number;
  isDefault?: boolean;
}

interface PlaylistState {
  playlists: Playlist[];
  createPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, track: YouTubeVideoItem) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  toggleLike: (track: YouTubeVideoItem) => void;
  isLiked: (trackId: string) => boolean;
  syncPlaylistsWithCloud: () => Promise<void>;
  pushPlaylistsToCloud: () => Promise<void>;
}

const ensureLikedPlaylist = (playlists: Playlist[]): Playlist[] => {
  if (playlists.some(p => p.id === LIKED_PLAYLIST_ID)) return playlists;
  return [{ id: LIKED_PLAYLIST_ID, name: 'Liked Songs', tracks: [], createdAt: Date.now(), isDefault: true }, ...playlists];
};

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set, get) => ({
      playlists: [{ id: LIKED_PLAYLIST_ID, name: 'Liked Songs', tracks: [], createdAt: Date.now(), isDefault: true }],

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
              const normalized = data.playlists.map((pl: any) => ({
                ...pl,
                createdAt: pl.createdAt || (pl.updated_at ? new Date(pl.updated_at).getTime() : Date.now()),
              }));
              set({ playlists: ensureLikedPlaylist(normalized) });
            }
          }
        } catch (e) { console.error('Playlist sync failed', e) }
      },

      createPlaylist: (name) => {
        set((state) => ({
          playlists: [...state.playlists, { id: Date.now().toString(), name, tracks: [], createdAt: Date.now() }]
        }));
        get().pushPlaylistsToCloud();
      },

      deletePlaylist: (id) => {
        if (id === LIKED_PLAYLIST_ID) return;
        set((state) => ({ playlists: state.playlists.filter(p => p.id !== id) }));
        // DELETE from DB — don't upsert remaining playlists (that never removes the deleted one)
        fetch('/api/playlists', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        }).catch(e => console.error('Playlist delete failed', e));
      },

      addTrackToPlaylist: (playlistId, track) => {
        let updated: Playlist | null = null;
        set((state) => {
          const playlists = state.playlists.map(p => {
            if (p.id !== playlistId) return p;
            const trackId = typeof track.id === 'string' ? track.id : track.id.videoId;
            if (p.tracks.some(t => (typeof t.id === 'string' ? t.id : t.id.videoId) === trackId)) return p;
            updated = { ...p, tracks: [...p.tracks, track], createdAt: Date.now() };
            return updated;
          });
          return { playlists };
        });
        if (updated) {
          fetch('/api/playlists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playlists: [updated] })
          }).catch(e => console.error('Playlist upsert failed', e));
        }
      },

      removeTrackFromPlaylist: (playlistId, trackId) => {
        let updated: Playlist | null = null;
        set((state) => {
          const playlists = state.playlists.map(p => {
            if (p.id !== playlistId) return p;
            updated = { ...p, tracks: p.tracks.filter(t => (typeof t.id === 'string' ? t.id : t.id.videoId) !== trackId), createdAt: Date.now() };
            return updated;
          });
          return { playlists };
        });
        if (updated) {
          fetch('/api/playlists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playlists: [updated] })
          }).catch(e => console.error('Playlist upsert failed', e));
        }
      },

      toggleLike: (track) => {
        const trackId = typeof track.id === 'string' ? track.id : track.id.videoId;
        const liked = get().playlists.find(p => p.id === LIKED_PLAYLIST_ID);
        if (liked?.tracks.some(t => (typeof t.id === 'string' ? t.id : t.id.videoId) === trackId)) {
          get().removeTrackFromPlaylist(LIKED_PLAYLIST_ID, trackId);
        } else {
          get().addTrackToPlaylist(LIKED_PLAYLIST_ID, track);
        }
      },

      isLiked: (trackId) => {
        const liked = get().playlists.find(p => p.id === LIKED_PLAYLIST_ID);
        return liked?.tracks.some(t => (typeof t.id === 'string' ? t.id : t.id.videoId) === trackId) ?? false;
      },
    }),
    {
      name: 'sonicview-playlists',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.playlists = ensureLikedPlaylist(state.playlists);
        }
      },
    }
  )
);
