"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Users, Music, List, Disc, Play, MoreVertical, ChevronRight } from "lucide-react";
import { searchMusic, YouTubeVideoItem } from "@/services/youtube.service";
import { usePlayerStore } from "@/store/player.store";
import { ARTIST_IMAGES } from "@/app/page";
import { toast } from "sonner";

type Filter = "TRACKS" | "ARTISTS" | "PLAYLISTS" | "ALBUMS";
const FILTERS: Filter[] = ["TRACKS", "ARTISTS", "PLAYLISTS", "ALBUMS"];

export default function SearchPage() {
  const [query,        setQuery]        = useState("");
  const [filter,       setFilter]       = useState<Filter>("TRACKS");
  const [tracks,       setTracks]       = useState<YouTubeVideoItem[]>([]);
  const [isLoading,    setIsLoading]    = useState(false);
  const [resultLimit,  setResultLimit]  = useState(12);
  const inputRef = useRef<HTMLInputElement>(null);

  const playTrack     = usePlayerStore((s) => s.playTrack);
  const setQueue      = usePlayerStore((s) => s.setQueue);
  const currentTrack  = usePlayerStore((s) => s.currentTrack);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!query.trim()) { setTracks([]); return; }
    setResultLimit(12);
    const id = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await searchMusic(query.trim());
        setTracks(res.items);
      } catch { toast.error("Search failed. Check your API key in Settings."); }
      finally { setIsLoading(false); }
    }, 1500);
    return () => clearTimeout(id);
  }, [query]);

  const getId = (t: YouTubeVideoItem) => typeof t.id === "string" ? t.id : t.id.videoId;

  const isActive = (t: YouTubeVideoItem) => {
    if (!currentTrack) return false;
    return getId(currentTrack) === getId(t);
  };

  const handlePlay = (track: YouTubeVideoItem) => {
    setQueue(tracks);
    playTrack(track);
  };

  const featured = tracks[0] ?? null;
  const list     = tracks.slice(1);

  return (
    <main className="min-h-screen pb-36" style={{ background: 'var(--background)' }}>

      {/* ── Search Bar ─────────────────────────────────────────────── */}
      <div className="px-4 pt-2 pb-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--on-surface-variant)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for artists, tracks…"
            className="w-full h-12 pl-10 pr-10 text-sm rounded-2xl outline-none transition-all"
            style={{
              background: 'var(--surface-container)',
              color: 'var(--on-surface)',
              border: '1px solid rgba(60,73,78,0.2)',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,252,67,0.4)'; }}
            onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(60,73,78,0.2)'; }}
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    style={{ color: 'var(--on-surface-variant)' }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Filter Pills ─────────────────────────────────────────────── */}
      <div className="flex gap-2 px-4 mb-5 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider shrink-0 transition-all"
            style={{
              background: filter === f ? 'rgba(0,252,67,0.12)' : 'var(--surface-container)',
              color:      filter === f ? 'var(--primary)'       : 'var(--on-surface-variant)',
              border:     filter === f ? '1px solid rgba(0,252,67,0.35)' : '1px solid rgba(60,73,78,0.15)',
              boxShadow:  filter === f ? '0 0 12px rgba(0,252,67,0.15)' : 'none',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Empty state ─────────────────────────────────────────────── */}
      {!query.trim() && (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
               style={{ background: 'rgba(0,252,67,0.08)' }}>
            <Search className="w-7 h-7" style={{ color: 'rgba(0,252,67,0.4)' }} />
          </div>
          <p className="font-bold text-lg" style={{ color: 'var(--on-surface)' }}>Find Your Sound</p>
          <p className="text-sm mt-1" style={{ color: 'var(--on-surface-variant)' }}>
            Search for artists, tracks, and more.
          </p>
        </div>
      )}

      {/* ── Loading ─────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex flex-col gap-3 px-4 animate-pulse">
          <div className="w-full h-52 rounded-2xl" style={{ background: 'var(--surface-container)' }} />
          {[1,2,3,4].map(i => (
            <div key={i} className="flex gap-3 items-center p-3">
              <div className="w-14 h-14 rounded-xl shrink-0" style={{ background: 'var(--surface-container)' }} />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded" style={{ background: 'var(--surface-container)' }} />
                <div className="h-3 w-1/3 rounded" style={{ background: 'var(--surface-container)' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────── */}
      {!isLoading && query && tracks.length > 0 && (
        <>
          {/* Featured artist card */}
          {filter !== "ARTISTS" && featured && (
            <div className="px-4 mb-6">
              <button
                onClick={() => handlePlay(featured)}
                 className="relative w-full h-56 rounded-2xl overflow-hidden block text-left group"
              >
                <img
                  src={featured.snippet.thumbnails.high?.url || featured.snippet.thumbnails.medium?.url}
                  alt={featured.snippet.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0"
                     style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)' }} />

                {/* Badge */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full"
                     style={{ background: 'rgba(0,252,67,0.15)', border: '1px solid rgba(0,252,67,0.4)' }}>
                  <span className="text-[9px] font-black uppercase tracking-widest"
                        style={{ color: 'var(--primary)' }}>Featured</span>
                </div>

                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center"
                       style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                boxShadow: '0 0 30px rgba(0,252,67,0.4)' }}>
                    <Play className="w-7 h-7 fill-current ml-1" style={{ color: 'var(--on-primary)' }} />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-[10px] font-black uppercase tracking-widest"
                        style={{ color: 'var(--on-surface-variant)' }}>Featured Artist</span>
                  <h2 className="text-2xl font-black leading-tight line-clamp-1 mt-0.5"
                      style={{ color: 'var(--on-surface)' }}>
                    {featured.snippet.channelTitle}
                  </h2>
                  <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--on-surface-variant)' }}>
                    {featured.snippet.title}
                  </p>
                </div>
              </button>

              {/* Artist bio + Wikipedia */}
              <div className="mt-3">
                <p className="text-xs leading-relaxed line-clamp-2"
                   style={{ color: 'var(--on-surface-variant)' }}>
                  {featured.snippet.channelTitle} is a music artist discovered via SonicView.
                  Play their latest tracks or explore their full catalogue below.
                </p>
                <a
                  href={`https://en.wikipedia.org/wiki/${encodeURIComponent(featured.snippet.channelTitle)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold mt-2 hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--primary)' }}
                >
                  Read Full Bio on Wikipedia <ChevronRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* ARTISTS FILTER VIEW */}
          {filter === "ARTISTS" && (
            <div className="px-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(ARTIST_IMAGES)
                  .filter(name => name.toLowerCase().includes(query.toLowerCase()))
                  .map(name => (
                    <button key={name} className="flex flex-col items-center gap-3 group text-center"
                            onClick={() => { setQuery(name); setFilter("TRACKS"); }}>
                      <div className="w-24 h-24 rounded-full overflow-hidden transition-all group-hover:ring-2"
                           style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.6)', '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}>
                        <img src={ARTIST_IMAGES[name]} alt={name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-sm line-clamp-1 group-hover:opacity-80 transition-opacity"
                           style={{ color: 'var(--on-surface)' }}>{name}</p>
                        <p className="text-[10px] tracking-wider uppercase mt-0.5"
                           style={{ color: 'var(--on-surface-variant)' }}>Artist</p>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Essential Tracks */}
          {filter !== "ARTISTS" && list.length > 0 && (
            <div className="px-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-black uppercase tracking-widest"
                    style={{ color: 'var(--on-surface-variant)' }}>Essential Tracks</h3>
                <button className="text-[11px] font-bold" style={{ color: 'var(--primary)' }}>See All</button>
              </div>

              <div className="obsidian-glass rounded-2xl overflow-hidden mb-4">
                {list.slice(0, resultLimit).map((track, idx) => {
                  const thumb = track.snippet.thumbnails.medium?.url;
                  const active = isActive(track);
                  return (
                    <div key={getId(track)}>
                      {idx > 0 && <div className="mx-4" style={{ height: 1, background: 'rgba(60,73,78,0.12)' }} />}
                      <div
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer group transition-colors"
                        style={{ background: active ? 'rgba(0,252,67,0.06)' : 'transparent' }}
                        onClick={() => handlePlay(track)}
                      >
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0">
                          <img src={thumb} alt={track.snippet.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                               style={{ background: 'rgba(0,0,0,0.5)' }}>
                            <Play className="w-4 h-4 fill-current" style={{ color: 'var(--primary)' }} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm line-clamp-1"
                             style={{ color: active ? 'var(--primary)' : 'var(--on-surface)' }}>
                            {track.snippet.title}
                          </p>
                          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--on-surface-variant)' }}>
                            {track.snippet.channelTitle}
                          </p>
                        </div>
                        <button className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ color: 'var(--on-surface-variant)' }}
                                onClick={e => e.stopPropagation()}>
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {list.length > resultLimit && (
                <div className="flex justify-center mb-6">
                  <button 
                    onClick={() => setResultLimit(prev => prev + 12)}
                    className="px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all hover:opacity-80 active:scale-95"
                    style={{ background: 'var(--surface-container-high)', color: 'var(--on-surface)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    Load More Results
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Fans Also Like */}
          {filter !== "ARTISTS" && list.length > 3 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3 px-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest"
                    style={{ color: 'var(--on-surface-variant)' }}>Fans Also Like</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto px-4 pb-1">
                {list.slice(0, 7).map((track) => (
                  <button key={getId(track)} onClick={() => handlePlay(track)}
                          className="flex flex-col items-center gap-2 shrink-0 w-20 group">
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-transparent
                                    group-hover:ring-green-400 transition-all"
                         style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
                      <img src={track.snippet.thumbnails.medium?.url}
                           alt={track.snippet.channelTitle}
                           className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] text-center leading-tight line-clamp-2 group-hover:opacity-100 transition-colors"
                          style={{ color: 'var(--on-surface-variant)' }}>
                      {track.snippet.channelTitle}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!isLoading && query && tracks.length === 0 && (
        <div className="text-center py-16 px-4">
          <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>
            No results for &ldquo;{query}&rdquo;
          </p>
        </div>
      )}
    </main>
  );
}
