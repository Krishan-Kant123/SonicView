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
}

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set) => ({
      playlists: [],
      createPlaylist: (name) => set((state) => ({
        playlists: [
           ...state.playlists, 
           { id: Date.now().toString(), name, tracks: [], createdAt: Date.now() }
        ]
      })),
      deletePlaylist: (id) => set((state) => ({
        playlists: state.playlists.filter(p => p.id !== id)
      })),
      addTrackToPlaylist: (playlistId, track) => set((state) => {
        const playlists = state.playlists.map(p => {
          if (p.id === playlistId) {
            const trackId = typeof track.id === 'string' ? track.id : track.id.videoId;
            if (p.tracks.some(t => (typeof t.id === 'string' ? t.id : t.id.videoId) === trackId)) return p;
            return { ...p, tracks: [...p.tracks, track] };
          }
          return p;
        });
        return { playlists };
      }),
      removeTrackFromPlaylist: (playlistId, trackId) => set((state) => {
        const playlists = state.playlists.map(p => {
          if (p.id === playlistId) {
            return { ...p, tracks: p.tracks.filter(t => (typeof t.id === 'string' ? t.id : t.id.videoId) !== trackId) };
          }
          return p;
        });
        return { playlists };
      })
    }),
    {
      name: 'sonicview-playlists',
    }
  )
);
