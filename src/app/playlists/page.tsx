"use client";

import { useState, useRef, useEffect } from 'react';
import { usePlaylistStore, LIKED_PLAYLIST_ID } from '@/store/playlist.store';
import Link from 'next/link';
import { Library, Music, Trash2, CalendarDays, MoreVertical, Heart } from 'lucide-react';

function PlaylistMenu({ onDelete, isDefault }: { onDelete: () => void; isDefault?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (isDefault) return null;

  return (
    <div ref={ref} className="relative" onClick={e => e.preventDefault()}>
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
              className="p-1.5 -mr-1.5 rounded-full transition-colors hover:brightness-110"
              style={{ color: 'var(--on-surface-variant)' }}>
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 bottom-full mb-1 rounded-xl overflow-hidden z-20 min-w-[130px]"
             style={{ background: 'var(--surface-container-high)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.7)' }}>
          <button onClick={e => { e.stopPropagation(); onDelete(); setOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:brightness-110 transition-all text-left"
                  style={{ color: 'var(--error)' }}>
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function PlaylistsPage() {
  const playlists = usePlaylistStore((s) => s.playlists);
  const deletePlaylist = usePlaylistStore((s) => s.deletePlaylist);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mb-24">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-2xl shadow-lg ring-1"
             style={{ background: 'rgba(0,252,67,0.1)', '--tw-ring-color': 'rgba(0,252,67,0.3)', boxShadow: '0 4px 15px rgba(0,252,67,0.1)' } as React.CSSProperties}>
          <Library className="w-7 h-7" style={{ color: 'var(--primary)' }} />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">My Library</h1>
      </div>

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-3xl border text-center shadow-inner"
             style={{ background: 'var(--surface-container)', borderColor: 'var(--surface-container-high)' }}>
          <Music className="w-16 h-16 mb-4 drop-shadow-lg" style={{ color: 'var(--on-surface-variant)' }} />
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--on-surface)' }}>It's a bit quiet here...</h2>
          <p className="max-w-xs px-4 text-sm leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
            Tap the [+] icon on any track in the feed to create a new playlist and start curating your library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playlists.map((pl) => {
            const isLiked = pl.id === LIKED_PLAYLIST_ID;
            return (
              <div key={pl.id}
                   className="group relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
                   style={{ background: 'var(--surface-container)', border: `1px solid ${isLiked ? 'rgba(0,252,67,0.2)' : 'var(--surface-container-high)'}`, boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                <Link href={`/playlists/${pl.id}`}
                      className="block relative aspect-square flex items-center justify-center overflow-hidden"
                      style={{ background: isLiked ? 'rgba(0,252,67,0.1)' : 'var(--surface-container-high)' }}>
                  {isLiked ? (
                    <Heart className="w-16 h-16" style={{ color: 'var(--primary)' }} fill="currentColor" />
                  ) : pl.tracks.length > 0 ? (
                    <img src={pl.tracks[0].snippet.thumbnails.high?.url || pl.tracks[0].snippet.thumbnails.medium?.url}
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" alt="Cover" />
                  ) : (
                    <Music className="w-16 h-16 text-zinc-800" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                </Link>

                <div className="flex flex-col p-3 flex-1 z-10" style={{ background: 'var(--surface-container)' }}>
                  <Link href={`/playlists/${pl.id}`} className="flex-1">
                    <h3 className="text-sm font-bold mb-0.5 line-clamp-1 transition-colors"
                        style={{ color: isLiked ? 'var(--primary)' : 'var(--on-surface)' }}>
                      {pl.name}
                    </h3>
                    <p className="text-xs flex items-center gap-1 font-medium" style={{ color: 'var(--on-surface-variant)' }}>
                      <Music className="w-3 h-3" /> {pl.tracks.length} tracks
                    </p>
                  </Link>
                  <div className="flex items-center justify-between mt-3 pt-3 text-[10px]"
                       style={{ borderTop: '1px solid var(--surface-container-high)', color: 'var(--on-surface-variant)' }}>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" /> {pl.createdAt ? new Date(pl.createdAt).toLocaleDateString() : '—'}
                    </span>
                    <PlaylistMenu onDelete={() => deletePlaylist(pl.id)} isDefault={isLiked} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
