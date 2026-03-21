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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}
         style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
      <div 
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[80vh] border-t sm:border border-white/10" 
        style={{ background: 'var(--surface-container)', borderColor: 'var(--surface-container-high)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5 sm:hidden" style={{ background: 'var(--surface-container-high)' }} />
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-black tracking-tight flex items-center gap-2" style={{ color: 'var(--on-surface)' }}>
            <Library className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            Add to Playlist
          </h2>
          <button onClick={onClose} className="p-2 rounded-full transition-colors"
                  style={{ background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Track Info */}
        <div className="flex items-center gap-3 p-3 rounded-2xl mb-6 shadow-inner border border-white/5"
             style={{ background: 'rgba(0,0,0,0.2)' }}>
          <img src={track.snippet.thumbnails.default?.url || track.snippet.thumbnails.medium?.url} className="w-10 h-10 rounded-lg object-cover" alt="thumbnail" />
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-bold truncate" style={{ color: 'var(--on-surface)' }}>{track.snippet.title}</span>
            <span className="text-[10px] font-medium truncate uppercase tracking-widest mt-0.5" style={{ color: 'var(--on-surface-variant)' }}>{track.snippet.channelTitle}</span>
          </div>
        </div>

        {/* Playlists List */}
        <div className="flex flex-col gap-2 overflow-y-auto mb-6 custom-scrollbar pr-1 flex-1">
          {playlists.length === 0 ? (
            <p className="text-center text-xs py-4 opacity-50" style={{ color: 'var(--on-surface-variant)' }}>No playlists created yet.</p>
          ) : (
            playlists.map(pl => {
              const alreadyAdded = pl.tracks.some(t => (typeof t.id === 'string' ? t.id : t.id.videoId) === trackId);
              return (
                <button 
                  key={pl.id}
                  disabled={alreadyAdded}
                  onClick={() => handleAddToPlaylist(pl.id)}
                  className="flex items-center justify-between p-3 rounded-xl transition-all text-left outline-none"
                  style={{
                    background: alreadyAdded ? 'rgba(0,0,0,0.1)' : 'var(--surface-container-high)',
                    opacity: alreadyAdded ? 0.5 : 1,
                    cursor: alreadyAdded ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => !alreadyAdded && (e.currentTarget.style.filter = 'brightness(1.2)')}
                  onMouseLeave={(e) => !alreadyAdded && (e.currentTarget.style.filter = 'none')}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-sm" style={{ color: 'var(--on-surface)' }}>{pl.name}</span>
                    <span className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--on-surface-variant)' }}>{pl.tracks.length} tracks</span>
                  </div>
                  {!alreadyAdded ? (
                    <PlusSquare className="w-4 h-4" style={{ color: 'var(--on-surface-variant)' }} />
                  ) : (
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--primary)' }}>Added</span>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Create New Form */}
        <form onSubmit={handleCreate} className="flex items-center gap-2 mt-auto pt-4 border-t" style={{ borderColor: 'var(--surface-container-high)' }}>
          <input 
            type="text" 
            placeholder="New playlist name..." 
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            className="flex-1 text-sm rounded-xl px-4 py-3 outline-none transition-all placeholder:text-[11px] placeholder:font-black placeholder:uppercase placeholder:tracking-widest"
            style={{ 
              background: 'rgba(0,0,0,0.2)', 
              color: 'var(--on-surface)',
              border: '1px solid var(--surface-container-high)' 
            }}
          />
          <button 
            type="submit"
            disabled={!newPlaylistName.trim()}
            className="p-3 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
              color: 'var(--on-primary)',
              boxShadow: '0 4px 15px rgba(0,252,67,0.2)'
            }}
          >
            <Plus className="w-4 h-4 fill-current" />
          </button>
        </form>
      </div>
    </div>
  );
}
