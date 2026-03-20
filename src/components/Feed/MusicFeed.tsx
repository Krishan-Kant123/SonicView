"use client";

import { useEffect, useState } from 'react';
import { getTrendingMusic, searchMusic, YouTubeVideoItem } from '@/services/youtube.service';
import { usePlayerStore } from '@/store/player.store';
import { Play, LayoutGrid, List, PlusSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddToPlaylistModal } from '@/components/Playlists/AddToPlaylistModal';
import { toast } from 'sonner';

export function MusicFeed({ query }: { query?: string }) {
  const [tracks, setTracks] = useState<YouTubeVideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState<YouTubeVideoItem | null>(null);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const quality = usePlayerStore((state) => state.quality);

  const getThumbnailUrl = (track: YouTubeVideoItem) => {
    const t = track.snippet.thumbnails;
    switch(quality) {
      case 'small': return t.default?.url || t.medium?.url;
      case 'medium': return t.medium?.url || t.high?.url;
      case 'hd720': return t.maxres?.url || t.high?.url || t.medium?.url;
      case 'large': return t.high?.url || t.medium?.url;
      case 'auto':
      default: return t.medium?.url || t.high?.url;
    }
  };

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setNextPageToken(null);
      setTracks([]);
      try {
        let response;
        if (query) {
           response = await searchMusic(query);
        } else {
           response = await getTrendingMusic();
        }
        setTracks(response.items);
        setNextPageToken(response.nextPageToken || null);
      } catch (err) {
        console.error(err);
        toast.error("Network error. Could not fetch music tracks.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [query]);

  const handleLoadMore = async () => {
    if (!nextPageToken || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
        const response = query ? await searchMusic(query, nextPageToken) : await getTrendingMusic('US', nextPageToken);
        setTracks(prev => [...prev, ...response.items]);
        setNextPageToken(response.nextPageToken || null);
    } catch (err) {
        console.error(err);
        toast.error("Network error. Failed to load more tracks.");
    } finally {
        setIsLoadingMore(false);
    }
  };

  const handlePlay = (track: YouTubeVideoItem, index: number) => {
    setQueue(tracks);
    playTrack(track);
  };

  const ViewToggle = () => (
    <div className="flex justify-end px-4 mb-2">
      <div className="flex bg-white/5 rounded-lg p-1 shadow-inner shadow-black/20">
        <button 
          onClick={() => setViewMode('grid')} 
          className={cn("p-1.5 rounded-md transition-colors", viewMode === 'grid' ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
          title="Grid View"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setViewMode('list')} 
          className={cn("p-1.5 rounded-md transition-colors", viewMode === 'list' ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
          title="List View"
        >
          <List className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full">
        <ViewToggle />
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse p-4 pt-0">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col space-y-3">
                <div className="bg-zinc-800/40 aspect-video rounded-xl" />
                <div className="bg-zinc-800/40 h-4 w-3/4 rounded" />
                <div className="bg-zinc-800/40 h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 animate-pulse p-4 pt-0">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
               <div key={i} className="flex gap-4 items-center p-2">
                 <div className="bg-zinc-800/40 w-16 h-16 rounded-xl shrink-0" />
                 <div className="flex flex-col gap-2 flex-1">
                   <div className="bg-zinc-800/40 h-4 w-1/3 rounded" />
                   <div className="bg-zinc-800/40 h-3 w-1/4 rounded" />
                 </div>
               </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <ViewToggle />
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 p-4 pt-0">
          {tracks.map((track, idx) => {
            const id = typeof track.id === 'string' ? track.id : track.id.videoId;
            return (
              <div key={id} className="group relative flex flex-col text-left transition-all hover:-translate-y-1">
                <button onClick={() => handlePlay(track, idx)} className="w-full text-left">
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-lg shadow-black/40 mb-3">
                    <img
                      src={getThumbnailUrl(track)}
                      alt={track.snippet.title}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <div className="bg-purple-500 text-white rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform shadow-lg shadow-purple-500/50">
                        <Play className="w-8 h-8 fill-current ml-1" />
                      </div>
                    </div>
                  </div>
                </button>
                <div className="flex items-start justify-between gap-2">
                  <button onClick={() => handlePlay(track, idx)} className="flex flex-col flex-1 text-left">
                    <h3 className="font-semibold text-zinc-100 text-sm md:text-base line-clamp-2 leading-tight mb-1 hover:text-purple-400 transition-colors">
                      {track.snippet.title}
                    </h3>
                    <p className="text-zinc-400 text-xs md:text-sm">{track.snippet.channelTitle}</p>
                    {track.statistics?.viewCount && (
                      <p className="text-zinc-500 text-[10px] mt-1">
                        {parseInt(track.statistics.viewCount).toLocaleString()} views
                      </p>
                    )}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedTrackForPlaylist(track); }}
                    className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0"
                    title="Add to Playlist"
                  >
                    <PlusSquare className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-4 pt-0">
          {tracks.map((track, idx) => {
            const id = typeof track.id === 'string' ? track.id : track.id.videoId;
            return (
              <div key={id} className="group flex flex-row items-center gap-4 text-left p-2 rounded-xl hover:bg-white/5 transition-colors">
                <button onClick={() => handlePlay(track, idx)} className="relative w-24 sm:w-28 aspect-video shrink-0 rounded-lg overflow-hidden shadow-md shadow-black/40">
                  <img
                    src={quality === 'small' ? (track.snippet.thumbnails.default?.url || track.snippet.thumbnails.medium?.url) : track.snippet.thumbnails.medium?.url}
                    alt={track.snippet.title}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="text-white transform scale-75 group-hover:scale-100 transition-transform">
                      <Play className="w-8 h-8 fill-current shadow-black drop-shadow-lg ml-0.5" />
                    </div>
                  </div>
                </button>
                
                <button onClick={() => handlePlay(track, idx)} className="flex flex-col flex-1 overflow-hidden pr-2 justify-center text-left">
                  <h3 className="font-semibold text-zinc-100 text-sm md:text-base line-clamp-1 leading-tight hover:text-purple-400 transition-colors">
                    {track.snippet.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-zinc-400 text-xs md:text-sm truncate">{track.snippet.channelTitle}</p>
                    {track.statistics?.viewCount && (
                      <span className="text-zinc-600 text-[10px] hidden sm:inline-block">
                        • {parseInt(track.statistics.viewCount).toLocaleString()} views
                      </span>
                    )}
                  </div>
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedTrackForPlaylist(track); }}
                  className="p-3 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition-colors mr-2 shrink-0"
                  title="Add to Playlist"
                >
                  <PlusSquare className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Load More */}
      {nextPageToken && (
        <div className="flex justify-center mt-8 mb-4">
          <button 
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-3 rounded-full text-white font-medium transition-colors disabled:opacity-50 shadow-md shadow-black/20"
          >
            {isLoadingMore ? "Loading..." : "Load More Tracks"}
          </button>
        </div>
      )}

      {/* Playlist Modal Integration */}
      {selectedTrackForPlaylist && (
        <AddToPlaylistModal 
          track={selectedTrackForPlaylist} 
          onClose={() => setSelectedTrackForPlaylist(null)} 
        />
      )}
    </div>
  );
}
