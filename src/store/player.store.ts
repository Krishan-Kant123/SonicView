import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { YouTubeVideoItem } from '../services/youtube.service';

interface PlayerState {
  currentTrack: YouTubeVideoItem | null;
  recentTracks: YouTubeVideoItem[];
  queue: YouTubeVideoItem[];
  isPlaying: boolean;
  volume: number;
  loop: boolean;
  shuffle: boolean;
  progress: number;
  duration: number;
  seekTo: number | null; // Used to trigger a seek action

  playTrack: (track: YouTubeVideoItem) => void;
  playNext: () => void;
  playPrevious: () => void;
  setQueue: (tracks: YouTubeVideoItem[]) => void;
  appendQueue: (tracks: YouTubeVideoItem[]) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  triggerSeek: (time: number) => void;
  clearSeek: () => void;
  moveTrackToNext: (trackId: string) => void;
  clearTrack: () => void;
  quality: 'auto' | 'small' | 'medium' | 'large' | 'hd720';
  setQuality: (quality: 'auto' | 'small' | 'medium' | 'large' | 'hd720') => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      recentTracks: [],
      queue: [],
      isPlaying: false,
      volume: 100,
      loop: false,
      shuffle: false,
      progress: 0,
      duration: 0,
      seekTo: null,
      quality: 'auto',

      setQuality: (quality) => set({ quality }),
      clearTrack: () => set({ currentTrack: null, isPlaying: false, progress: 0, queue: [] }),

      playTrack: (track) => set((state) => {
        const newRecent = [track]; // keeping only exact latest to securely minimize local storage bloat
        
        return { 
          currentTrack: track, 
          isPlaying: true, 
          progress: 0,
          recentTracks: newRecent 
        };
      }),

  toggleShuffle: () => set((state) => {
    const newShuffle = !state.shuffle;
    if (!newShuffle || !state.currentTrack) return { shuffle: newShuffle };

    // Shuffling the remaining queue
    const currentId = typeof state.currentTrack.id === 'string' ? state.currentTrack.id : state.currentTrack.id.videoId;
    const currentIndex = state.queue.findIndex(item => (typeof item.id === 'string' ? item.id : item.id.videoId) === currentId);
    if (currentIndex === -1) return { shuffle: newShuffle };

    const upcoming = [...state.queue.slice(currentIndex + 1)];
    // Fisher-Yates shuffle
    for (let i = upcoming.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [upcoming[i], upcoming[j]] = [upcoming[j], upcoming[i]];
    }

    const newQueue = [
      ...state.queue.slice(0, currentIndex + 1),
      ...upcoming
    ];

    return { shuffle: newShuffle, queue: newQueue };
  }),

  playNext: () => set((state) => {
    if (state.queue.length === 0 || !state.currentTrack) return state;
    
    const currentId = typeof state.currentTrack.id === 'string' ? state.currentTrack.id : state.currentTrack.id.videoId;
    let currentIndex = state.queue.findIndex(item => {
      const id = typeof item.id === 'string' ? item.id : item.id.videoId;
      return id === currentId;
    });

    if (currentIndex === -1 || currentIndex === state.queue.length - 1) {
      if (state.loop) {
        return { currentTrack: state.queue[0], isPlaying: true, progress: 0 };
      } else {
        return { isPlaying: false, progress: 0 };
      }
    }

    return { currentTrack: state.queue[currentIndex + 1], isPlaying: true, progress: 0 };
  }),

  playPrevious: () => set((state) => {
    if (state.queue.length === 0 || !state.currentTrack) return state;
    
    const currentId = typeof state.currentTrack.id === 'string' ? state.currentTrack.id : state.currentTrack.id.videoId;
    let currentIndex = state.queue.findIndex(item => {
      const id = typeof item.id === 'string' ? item.id : item.id.videoId;
      return id === currentId;
    });

    if (currentIndex <= 0) {
      if (state.loop) {
        return { currentTrack: state.queue[state.queue.length - 1], isPlaying: true, progress: 0 };
      }
      return state; 
    }

    return { currentTrack: state.queue[currentIndex - 1], isPlaying: true, progress: 0 };
  }),

  setQueue: (tracks) => set({ queue: tracks }),
  appendQueue: (tracks) => set((state) => ({ queue: [...state.queue, ...tracks] })),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setVolume: (volume) => set({ volume }),
  toggleLoop: () => set((state) => ({ loop: !state.loop })),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  triggerSeek: (time) => set({ seekTo: time }),
  clearSeek: () => set({ seekTo: null }),
  
  moveTrackToNext: (trackId) => set((state) => {
    if (!state.currentTrack) return state;
    const currentId = typeof state.currentTrack.id === 'string' ? state.currentTrack.id : state.currentTrack.id.videoId;
    const currentIndex = state.queue.findIndex(item => (typeof item.id === 'string' ? item.id : item.id.videoId) === currentId);
    if (currentIndex === -1) return state;

    const trackIndex = state.queue.findIndex(item => (typeof item.id === 'string' ? item.id : item.id.videoId) === trackId);
    if (trackIndex === -1 || trackIndex === currentIndex + 1) return state;

    const newQueue = [...state.queue];
    const [track] = newQueue.splice(trackIndex, 1);
    
    // Insert at currentIndex + 1
    const insertionIndex = trackIndex < currentIndex ? currentIndex : currentIndex + 1;
    newQueue.splice(insertionIndex, 0, track);

    return { queue: newQueue };
  }),
    }),
    {
      name: 'player-storage',
      partialize: (state) => ({ recentTracks: state.recentTracks, quality: state.quality, volume: state.volume }),
    }
  )
);
