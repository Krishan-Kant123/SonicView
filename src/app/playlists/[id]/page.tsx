"use client";

import { useState, useRef, useEffect } from 'react';
import { usePlaylistStore, LIKED_PLAYLIST_ID } from '@/store/playlist.store';
import { usePlayerStore } from '@/store/player.store';
import { useParams, useRouter } from 'next/navigation';
import { Play, ArrowLeft, Music, Library, MoreVertical, Trash2, Share2, Heart } from 'lucide-react';
import { toast } from 'sonner';

function TrackMenu({ onRemove, onShare }: { onRemove: () => void; onShare: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
              className="p-2 rounded-full transition-colors opacity-100 md:opacity-100 md:group-hover:opacity-100"
              style={{ color: 'var(--on-surface-variant)' }}>
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-20 min-w-[140px]"
             style={{ background: 'var(--surface-container-high)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.7)' }}>
          <button onClick={e => { e.stopPropagation(); onShare(); setOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:brightness-110 transition-all text-left"
                  style={{ color: 'var(--on-surface)' }}>
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button onClick={e => { e.stopPropagation(); onRemove(); setOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:brightness-110 transition-all text-left"
                  style={{ color: 'var(--error)' }}>
            <Trash2 className="w-4 h-4" /> Remove
          </button>
        </div>
      )}
    </div>
  );
}

export default function PlaylistDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const playlists = usePlaylistStore((s) => s.playlists);
  const removeTrackFromPlaylist = usePlaylistStore((s) => s.removeTrackFromPlaylist);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const setQueue  = usePlayerStore((s) => s.setQueue);

  const playlist = playlists.find(p => p.id === id);

  if (!playlist) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center" style={{ color: 'var(--on-surface-variant)' }}>
        <Library className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-sm font-bold">Playlist not found.</p>
        <button onClick={() => router.push('/playlists')} className="mt-4 text-xs font-black uppercase tracking-widest hover:opacity-80 transition-opacity" style={{ color: 'var(--primary)' }}>
          Return to Library
        </button>
      </div>
    );
  }

  const isLikedPlaylist = playlist.id === LIKED_PLAYLIST_ID;

  const handlePlayAll = () => {
    if (playlist.tracks.length === 0) return;
    setQueue(playlist.tracks);
    playTrack(playlist.tracks[0]);
  };

  const handleShare = (track: any) => {
    const vid = typeof track.id === 'string' ? track.id : track.id.videoId;
    navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${vid}`)
      .then(() => toast.success('Link copied!'));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 mb-24">
      <button onClick={() => router.push('/playlists')}
              className="group flex items-center gap-2 mb-6 w-fit transition-opacity hover:opacity-80 rounded-full pr-4"
              style={{ color: 'var(--on-surface-variant)' }}>
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest">Library</span>
      </button>

      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-8 items-center md:items-end text-center md:text-left">
        <div className="w-40 md:w-56 shrink-0 relative">
          <div className="absolute inset-0 rounded-3xl blur-2xl" style={{ background: isLikedPlaylist ? 'var(--primary)' : 'var(--primary)', opacity: 0.15 }} />
          <div className="w-full aspect-square rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden border relative z-10"
               style={{ background: 'var(--surface-container-high)', borderColor: 'rgba(255,255,255,0.05)' }}>
            {isLikedPlaylist ? (
              <Heart className="w-20 h-20" style={{ color: 'var(--primary)' }} fill="currentColor" />
            ) : playlist.tracks.length > 0 ? (
              <img src={playlist.tracks[0].snippet.thumbnails.high?.url || playlist.tracks[0].snippet.thumbnails.medium?.url}
                   className="w-full h-full object-cover" alt="Playlist Cover" />
            ) : (
              <Music className="w-16 h-16 opacity-50" style={{ color: 'var(--on-surface-variant)' }} />
            )}
          </div>
        </div>
        <div className="flex flex-col justify-end pb-2 flex-1 relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: isLikedPlaylist ? 'var(--primary)' : 'var(--primary)' }}>
            {isLikedPlaylist ? 'Default Playlist' : 'Playlist'}
          </p>
          <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight drop-shadow-md line-clamp-2" style={{ color: 'var(--on-surface)' }}>
            {playlist.name}
          </h1>
          <div className="flex items-center justify-center md:justify-start gap-3 mt-1 text-xs font-medium" style={{ color: 'var(--on-surface-variant)' }}>
            <span className="px-3 py-1 rounded-full border" style={{ background: 'var(--surface-container)', borderColor: 'var(--surface-container-high)' }}>
              {playlist.tracks.length} tracks
            </span>
            <span className="opacity-50">•</span>
            <span>Created {playlist.createdAt ? new Date(playlist.createdAt).toLocaleDateString() : '—'}</span>
          </div>
          <div className="mt-6 flex justify-center md:justify-start">
            <button onClick={handlePlayAll} disabled={playlist.tracks.length === 0}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
                             color: 'var(--on-primary)', boxShadow: '0 4px 20px rgba(0,252,67,0.25)' }}>
              <Play className="w-4 h-4 fill-current" />
              Play All
            </button>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="flex flex-col gap-1.5 relative border-t pt-4" style={{ borderColor: 'var(--surface-container-high)' }}>
        {playlist.tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 rounded-2xl border text-center"
               style={{ background: 'var(--surface-container)', borderColor: 'var(--surface-container-high)' }}>
            <p className="text-xs max-w-xs leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
              {isLikedPlaylist ? 'Like songs from the feed to see them here.' : 'No tracks yet. Browse the feed and click [+] to add some!'}
            </p>
          </div>
        ) : (
          playlist.tracks.map((track, idx) => {
            const trackId = typeof track.id === 'string' ? track.id : track.id.videoId;
            return (
              <div key={trackId + idx}
                   className="group flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer"
                   onClick={() => { setQueue(playlist.tracks); playTrack(track); }}
                   onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container)'}
                   onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="w-6 text-center text-[10px] font-black group-hover:hidden" style={{ color: 'var(--on-surface-variant)' }}>{idx + 1}</div>
                <button className="w-6 text-center hidden group-hover:block" style={{ color: 'var(--on-surface)' }}>
                  <Play className="w-3.5 h-3.5 fill-current mx-auto" />
                </button>
                <img src={track.snippet.thumbnails.default?.url || track.snippet.thumbnails.medium?.url}
                     className="w-10 h-10 rounded object-cover shadow-sm" alt={track.snippet.title} />
                <div className="flex-1 overflow-hidden pr-2">
                  <h3 className="text-sm font-bold truncate transition-colors group-hover:text-primary" style={{ color: 'var(--on-surface)' }}>
                    {track.snippet.title}
                  </h3>
                  <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--on-surface-variant)' }}>{track.snippet.channelTitle}</p>
                </div>
                <TrackMenu
                  onRemove={() => removeTrackFromPlaylist(playlist.id, trackId)}
                  onShare={() => handleShare(track)}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
