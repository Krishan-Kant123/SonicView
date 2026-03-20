"use client";

import { useState } from 'react';
import { usePlaylistStore } from '@/store/playlist.store';
import { YouTubeVideoItem } from '@/services/youtube.service';
import { X, Plus, Library, PlusSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AddToPlaylistModal({ track, onClose }: { track: YouTubeVideoItem, onClose: () => void }) {
  const playlists = usePlaylistStore((state) => state.playlists);
  const createPlaylist = usePlaylistStore((state) => state.createPlaylist);
  const addTrackToPlaylist = usePlaylistStore((state) => state.addTrackToPlaylist);
  
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName);
    setNewPlaylistName('');
  };

  const handleAddToPlaylist = (playlistId: string) => {
    addTrackToPlaylist(playlistId, track);
    onClose();
  };

  const trackId = typeof track.id === 'string' ? track.id : track.id.videoId;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="bg-[#18181b] w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col max-h-[80vh]" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Library className="w-5 h-5 text-purple-400" />
            Add to Playlist
          </h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Track Info */}
        <div className="flex items-center gap-3 bg-black/30 p-3 rounded-2xl mb-6">
          <img src={track.snippet.thumbnails.medium?.url} className="w-12 h-12 rounded-lg object-cover" alt="thumbnail" />
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-white text-sm font-semibold truncate">{track.snippet.title}</span>
            <span className="text-zinc-400 text-xs truncate">{track.snippet.channelTitle}</span>
          </div>
        </div>

        {/* Playlists List */}
        <div className="flex flex-col gap-2 overflow-y-auto mb-6 custom-scrollbar pr-2 flex-1">
          {playlists.length === 0 ? (
            <p className="text-center text-zinc-500 text-sm py-4 italic">No playlists created yet.</p>
          ) : (
            playlists.map(pl => {
              const alreadyAdded = pl.tracks.some(t => (typeof t.id === 'string' ? t.id : t.id.videoId) === trackId);
              return (
                <button 
                  key={pl.id}
                  disabled={alreadyAdded}
                  onClick={() => handleAddToPlaylist(pl.id)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl transition-colors text-left group",
                    alreadyAdded ? "bg-white/5 opacity-50 cursor-not-allowed" : "bg-white/5 hover:bg-white/10 cursor-pointer"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-white font-semibold text-sm">{pl.name}</span>
                    <span className="text-zinc-500 text-xs">{pl.tracks.length} tracks</span>
                  </div>
                  {!alreadyAdded ? (
                    <PlusSquare className="w-5 h-5 text-zinc-400 group-hover:text-purple-400" />
                  ) : (
                    <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">Added</span>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Create New Form */}
        <form onSubmit={handleCreate} className="flex items-center gap-2 mt-auto pt-4 border-t border-white/10">
          <input 
            type="text" 
            placeholder="New playlist name..." 
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            className="flex-1 bg-black/50 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 border border-white/5"
          />
          <button 
            type="submit"
            disabled={!newPlaylistName.trim()}
            className="p-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors shadow-lg shadow-purple-600/30"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
