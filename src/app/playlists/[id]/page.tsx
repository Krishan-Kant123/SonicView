"use client";

import { usePlaylistStore } from '@/store/playlist.store';
import { usePlayerStore } from '@/store/player.store';
import { useParams, useRouter } from 'next/navigation';
import { Play, ArrowLeft, Trash2, PlayCircle, Music, Library } from 'lucide-react';

export default function PlaylistDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const playlists = usePlaylistStore((state) => state.playlists);
  const removeTrackFromPlaylist = usePlaylistStore((state) => state.removeTrackFromPlaylist);
  
  const playTrack = usePlayerStore((state) => state.playTrack);
  const setQueue = usePlayerStore((state) => state.setQueue);

  const playlist = playlists.find(p => p.id === id);

  if (!playlist) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-zinc-400">
        <Library className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
        <p className="text-lg">Playlist not found.</p>
        <button onClick={() => router.push('/playlists')} className="mt-4 text-purple-400 hover:text-purple-300 transition-colors font-medium">Return to Library</button>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (playlist.tracks.length === 0) return;
    setQueue(playlist.tracks);
    playTrack(playlist.tracks[0]);
  };

  const handlePlayTrack = (track: any, index: number) => {
    setQueue(playlist.tracks);
    playTrack(track);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mb-24">
      <button onClick={() => router.push('/playlists')} className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 pb-2 border-b border-transparent hover:border-white/10 w-fit pr-4">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold uppercase tracking-widest">Library</span>
      </button>

      {/* Playlist Hero Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-10 items-end">
        <div className="w-48 md:w-64 shrink-0 mx-auto md:mx-0">
           <div className="w-full aspect-square bg-zinc-900 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden border border-white/5 ring-1 ring-white/10">
              {playlist.tracks.length > 0 ? (
                <img src={playlist.tracks[0].snippet.thumbnails.high?.url || playlist.tracks[0].snippet.thumbnails.medium?.url} className="w-full h-full object-cover" alt="Playlist Cover" />
              ) : (
                <Music className="w-20 h-20 text-zinc-800" />
              )}
           </div>
        </div>
        <div className="flex flex-col justify-end pb-2 flex-1 text-center md:text-left">
          <p className="text-purple-400 text-sm font-bold uppercase tracking-[0.2em] mb-3">Playlist</p>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-md">{playlist.name}</h1>
          <div className="flex items-center justify-center md:justify-start gap-4 text-zinc-400 text-sm font-medium">
            <span className="bg-white/5 px-3 py-1 rounded-full">{playlist.tracks.length} tracks</span>
            <span>•</span>
            <span>Created {new Date(playlist.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="mt-8 flex justify-center md:justify-start">
            <button 
              onClick={handlePlayAll}
              disabled={playlist.tracks.length === 0}
              className="flex items-center gap-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:scale-100 text-white px-8 py-3.5 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-600/30"
            >
              <Play className="w-5 h-5 fill-current" />
              Play All
            </button>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="flex flex-col gap-1.5 relative border-t border-white/5 pt-6">
        {playlist.tracks.length === 0 ? (
           <p className="text-zinc-500 italic p-8 text-center bg-white/5 rounded-2xl border border-white/[0.02]">No tracks in this playlist yet. Browse the feed and click the [+] icon to add some!</p>
        ) : (
          playlist.tracks.map((track, idx) => {
            const trackId = typeof track.id === 'string' ? track.id : track.id.videoId;
            return (
              <div key={trackId + idx} className="group flex items-center gap-4 p-2.5 rounded-2xl hover:bg-white/5 transition-colors bg-transparent border border-transparent hover:border-white/5 cursor-pointer" onClick={() => handlePlayTrack(track, idx)}>
                <div className="w-8 text-center text-zinc-500 font-semibold group-hover:hidden text-sm">{idx + 1}</div>
                <button 
                  className="w-8 text-center text-white hidden group-hover:block"
                >
                  <Play className="w-4 h-4 fill-white animate-pulse mx-auto" />
                </button>
                <img src={track.snippet.thumbnails.medium?.url} className="w-12 h-12 rounded-lg object-cover shadow-md" alt={track.snippet.title} />
                <div className="flex-1 overflow-hidden pr-4">
                  <h3 className="text-white text-sm font-semibold truncate group-hover:text-purple-400 transition-colors">{track.snippet.title}</h3>
                  <p className="text-zinc-500 text-xs truncate mt-0.5">{track.snippet.channelTitle}</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeTrackFromPlaylist(playlist.id, trackId); }}
                  className="p-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  title="Remove track"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
