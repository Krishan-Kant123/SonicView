"use client";

import { usePlaylistStore } from '@/store/playlist.store';
import Link from 'next/link';
import { Library, Music, Trash2, CalendarDays } from 'lucide-react';

export default function PlaylistsPage() {
  const playlists = usePlaylistStore((state) => state.playlists);
  const deletePlaylist = usePlaylistStore((state) => state.deletePlaylist);
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mb-24">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-purple-500/20 p-3 rounded-2xl shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/30">
          <Library className="w-8 h-8 text-purple-400" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">My Library</h1>
      </div>

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/10 text-center shadow-inner shadow-black/20">
          <Music className="w-16 h-16 text-zinc-600 mb-6 drop-shadow-lg" />
          <h2 className="text-xl font-semibold text-white mb-2">It's a bit quiet here...</h2>
          <p className="text-zinc-400 max-w-sm px-4 leading-relaxed">Tap the [+] icon on any track in the feed to create a new playlist and start curating your library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {playlists.map((pl) => (
            <div key={pl.id} className="group relative bg-[#18181b] rounded-2xl border border-white/5 overflow-hidden shadow-lg shadow-black flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-purple-500/10 hover:bg-[#1a1a1f]">
              <Link href={`/playlists/${pl.id}`} className="block relative aspect-square bg-zinc-900 border-b border-white/5 flex items-center justify-center overflow-hidden">
                {pl.tracks.length > 0 ? (
                  <img 
                    src={pl.tracks[0].snippet.thumbnails.high?.url || pl.tracks[0].snippet.thumbnails.medium?.url} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    alt="Cover"
                  />
                ) : (
                  <Music className="w-16 h-16 text-zinc-800" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              </Link>
              
              <div className="flex flex-col p-5 flex-1 z-10">
                <Link href={`/playlists/${pl.id}`} className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors line-clamp-1">{pl.name}</h3>
                  <p className="text-zinc-400 text-sm flex items-center gap-1.5 font-medium">
                    <Music className="w-3.5 h-3.5" /> {pl.tracks.length} tracks
                  </p>
                </Link>
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5 text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {new Date(pl.createdAt).toLocaleDateString()}</span>
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); deletePlaylist(pl.id); }}
                    className="p-2 -mr-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors focus:ring-2 focus:ring-red-500/50 outline-none"
                    title="Delete Playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
