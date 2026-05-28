"use client";

import { useEffect, useState } from 'react';
import { getDiverseFeed, searchMusic, YouTubeVideoItem } from '@/services/youtube.service';
import { usePlayerStore } from '@/store/player.store';
import { useSettingsStore } from '@/store/settings.store';
import { usePlaylistStore } from '@/store/playlist.store';
import { Play, LayoutGrid, List, PlusSquare, Heart, Share2 } from 'lucide-react';
import { AddToPlaylistModal } from '@/components/Playlists/AddToPlaylistModal';
import { toast } from 'sonner';

export function getThumbnailUrl(track: YouTubeVideoItem, quality: string): string {
  const t = track.snippet.thumbnails;
  switch (quality) {
    case 'small':  return t.default?.url || t.medium?.url || '';
    case 'medium': return t.standard?.url || t.high?.url || t.medium?.url || '';
    default:       return t.maxres?.url || t.standard?.url || t.high?.url || t.medium?.url || '';
  }
}

function shareTrack(track: YouTubeVideoItem) {
  const id = typeof track.id === 'string' ? track.id : track.id.videoId;
  const url = `https://www.youtube.com/watch?v=${id}`;
  navigator.clipboard.writeText(url).then(() => toast.success('Link copied!'));
}

export function MusicFeed({ query }: { query?: string }) {
  const [tracks, setTracks] = useState<YouTubeVideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState<YouTubeVideoItem | null>(null);

  const playTrack = usePlayerStore((s) => s.playTrack);
  const setQueue  = usePlayerStore((s) => s.setQueue);
  const quality   = usePlayerStore((s) => s.quality);
  const viewMode  = useSettingsStore((s) => s.viewMode);
  const setViewMode = useSettingsStore((s) => s.setViewMode);
  const toggleLike = usePlaylistStore((s) => s.toggleLike);
  const isLiked    = usePlaylistStore((s) => s.isLiked);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setNextPageToken(null);
      setTracks([]);
      try {
        const response = query ? await searchMusic(query) : await getDiverseFeed();
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
      const response = query
        ? await searchMusic(query, nextPageToken)
        : await getDiverseFeed();
      setTracks(prev => [...prev, ...response.items]);
      setNextPageToken(response.nextPageToken || null);
    } catch (err) {
      toast.error("Failed to load more tracks.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handlePlay = (track: YouTubeVideoItem) => {
    setQueue(tracks);
    playTrack(track);
  };

  const ViewToggle = () => (
    <div className="flex justify-end px-4 mb-3">
      <div className="flex rounded-lg p-1" style={{ background: 'var(--surface-container)' }}>
        {(['grid', 'list'] as const).map(mode => (
          <button key={mode} onClick={() => setViewMode(mode)}
                  className="p-1.5 rounded-md transition-colors"
                  style={{ background: viewMode === mode ? 'rgba(0,252,67,0.15)' : 'transparent',
                           color: viewMode === mode ? 'var(--primary)' : 'var(--on-surface-variant)' }}>
            {mode === 'grid' ? <LayoutGrid className="w-5 h-5" /> : <List className="w-5 h-5" />}
          </button>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full">
        <ViewToggle />
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse px-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="flex flex-col space-y-3">
                <div className="bg-zinc-800/40 aspect-video rounded-xl" />
                <div className="bg-zinc-800/40 h-4 w-3/4 rounded" />
                <div className="bg-zinc-800/40 h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2 animate-pulse px-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="flex gap-4 items-center p-3 rounded-xl">
                <div className="bg-zinc-800/40 w-14 h-14 rounded-lg shrink-0" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="bg-zinc-800/40 h-4 w-2/3 rounded" />
                  <div className="bg-zinc-800/40 h-3 w-1/3 rounded" />
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4">
          {tracks.map((track) => {
            const id = typeof track.id === 'string' ? track.id : track.id.videoId;
            const liked = isLiked(id);
            return (
              <div key={id} className="group relative flex flex-col text-left transition-all hover:-translate-y-1">
                <button onClick={() => handlePlay(track)} className="w-full text-left">
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl mb-2"
                       style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                    <img src={getThumbnailUrl(track, quality)} alt={track.snippet.title}
                         className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                         style={{ background: 'rgba(0,0,0,0.55)' }}>
                      <div className="rounded-full p-2.5 transform scale-75 group-hover:scale-100 transition-transform"
                           style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-container))', boxShadow: '0 0 20px rgba(0,252,67,0.4)' }}>
                        <Play className="w-5 h-5 fill-current" style={{ color: 'var(--on-primary)' }} />
                      </div>
                    </div>
                  </div>
                </button>
                <div className="flex items-start justify-between gap-1 px-0.5">
                  <button onClick={() => handlePlay(track)} className="flex flex-col flex-1 text-left min-w-0">
                    <h3 className="font-semibold text-xs line-clamp-2 leading-tight mb-0.5" style={{ color: 'var(--on-surface)' }}>
                      {track.snippet.title}
                    </h3>
                    <p className="text-xs truncate" style={{ color: 'var(--primary)', opacity: 0.7 }}>
                      {track.snippet.channelTitle}
                    </p>
                  </button>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                            className="p-1.5 rounded-full transition-colors"
                            style={{ color: liked ? 'var(--primary)' : 'var(--on-surface-variant)' }}
                            title={liked ? 'Unlike' : 'Like'}>
                      <Heart className="w-3.5 h-3.5" fill={liked ? 'currentColor' : 'none'} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); shareTrack(track); }}
                            className="p-1.5 rounded-full transition-colors hover:text-white"
                            style={{ color: 'var(--on-surface-variant)' }} title="Share">
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedTrackForPlaylist(track); }}
                            className="p-1.5 rounded-full transition-colors hover:text-white"
                            style={{ color: 'var(--on-surface-variant)' }} title="Add to Playlist">
                      <PlusSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-1 px-4">
          {tracks.map((track, idx) => {
            const id = typeof track.id === 'string' ? track.id : track.id.videoId;
            const liked = isLiked(id);
            return (
              <div key={id} className="group flex flex-row items-center gap-3 text-left p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                <button onClick={() => handlePlay(track)} className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden shadow-md shadow-black/40">
                  <img src={getThumbnailUrl(track, quality)} alt={track.snippet.title}
                       className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-5 h-5 fill-current text-white" />
                  </div>
                </button>
                <button onClick={() => handlePlay(track)} className="flex flex-col flex-1 overflow-hidden text-left">
                  <span className="font-semibold text-zinc-100 text-sm line-clamp-1 leading-tight">{track.snippet.title}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-zinc-500 text-xs truncate">{track.snippet.channelTitle}</span>
                    {track.statistics?.viewCount && (
                      <span className="text-zinc-600 text-[10px] hidden sm:inline-block">
                        • {parseInt(track.statistics.viewCount).toLocaleString()} views
                      </span>
                    )}
                  </div>
                </button>
                <span className="text-zinc-600 text-xs shrink-0 hidden sm:block">{idx + 1}</span>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                          className="p-2 rounded-full transition-colors"
                          style={{ color: liked ? 'var(--primary)' : 'var(--on-surface-variant)' }}
                          title={liked ? 'Unlike' : 'Like'}>
                    <Heart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); shareTrack(track); }}
                          className="p-2 rounded-full transition-colors hover:text-white"
                          style={{ color: 'var(--on-surface-variant)' }} title="Share">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedTrackForPlaylist(track); }}
                          className="p-2 rounded-full transition-colors hover:text-white"
                          style={{ color: 'var(--on-surface-variant)' }} title="Add to Playlist">
                    <PlusSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {nextPageToken && (
        <div className="flex justify-center mt-8 mb-4">
          <button onClick={handleLoadMore} disabled={isLoadingMore}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-3 rounded-full text-white font-medium transition-colors disabled:opacity-50 shadow-md">
            {isLoadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {selectedTrackForPlaylist && (
        <AddToPlaylistModal track={selectedTrackForPlaylist} onClose={() => setSelectedTrackForPlaylist(null)} />
      )}
    </div>
  );
}
