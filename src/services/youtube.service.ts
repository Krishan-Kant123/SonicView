import { useSettingsStore } from '@/store/settings.store';

export interface YouTubeVideoSnippet {
  title: string;
  channelTitle: string;
  thumbnails: {
    default?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    high?: { url: string; width: number; height: number };
    standard?: { url: string; width: number; height: number };
    maxres?: { url: string; width: number; height: number };
  };
}

export interface YouTubeVideoItem {
  id: string | { videoId: string };
  snippet: YouTubeVideoSnippet;
  statistics?: {
    viewCount?: string;
  };
}

export interface YouTubeResponse {
  items: YouTubeVideoItem[];
  nextPageToken?: string;
}

const getApiKey = () => {
  if (typeof window === 'undefined') return '';
  return useSettingsStore.getState().apiKey || '';
};

// Lazy-load quota store to avoid circular deps
const trackQuota = (op: 'search' | 'videos' | 'playlistItems' | 'channels') => {
  if (typeof window === 'undefined') return;
  import('@/store/quota.store').then(({ useQuotaStore }) => {
    useQuotaStore.getState().addUsage(op);
  });
};

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const cache = new Map<string, { data: YouTubeResponse; timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function fetchWithCache(url: string, cacheKey: string, op: 'search' | 'videos' | 'playlistItems' | 'channels'): Promise<YouTubeResponse> {
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.data; // cache hit — no quota used
  }
  // Cache miss — actual API call
  trackQuota(op);
  const response = await fetch(url);
  if (!response.ok) throw new Error('YouTube API request failed');
  const data = await response.json();
  const result: YouTubeResponse = { items: data.items || [], nextPageToken: data.nextPageToken };
  cache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

export async function getTrendingMusic(regionCode: string = 'US', pageToken?: string): Promise<YouTubeResponse> {
  const API_KEY = getApiKey();
  if (!API_KEY) throw new Error('YouTube API key not configured');
  let url = `${BASE_URL}/videos?part=snippet,statistics&chart=mostPopular&videoCategoryId=10&regionCode=${regionCode}&maxResults=50&key=${API_KEY}`;
  if (pageToken) url += `&pageToken=${pageToken}`;
  return fetchWithCache(url, `trending_${regionCode}_${pageToken || 'first'}`, 'videos');
}

export async function searchMusic(query: string, pageToken?: string): Promise<YouTubeResponse> {
  const API_KEY = getApiKey();
  if (!API_KEY) throw new Error('YouTube API key not configured');
  let url = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&topicId=/m/04rlf&maxResults=50&key=${API_KEY}`;
  if (pageToken) url += `&pageToken=${pageToken}`;
  return fetchWithCache(url, `search_${query}_${pageToken || 'first'}`, 'search');
}

export async function getRelatedTracks(channelTitle: string): Promise<YouTubeResponse> {
  const API_KEY = getApiKey();
  if (!API_KEY) throw new Error('YouTube API key not configured');
  const url = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(channelTitle + ' songs')}&type=video&videoCategoryId=10&maxResults=12&key=${API_KEY}`;
  return fetchWithCache(url, `related_${channelTitle}`, 'search');
}

/**
 * Smart recommendations: fetch a channel's uploads playlist (1 unit) instead of search (100 units).
 * Steps:
 *  1. channels.list to get uploadsPlaylistId (1 unit) — cached per channel
 *  2. playlistItems.list to get up to 50 videos (1 unit)
 * Total: 2 units vs 100 units for search.list
 */
export async function getChannelUploads(channelTitle: string): Promise<YouTubeResponse> {
  const API_KEY = getApiKey();
  if (!API_KEY) throw new Error('YouTube API key not configured');

  // Step 1: resolve channel → uploadsPlaylistId
  const channelCacheKey = `channel_${channelTitle}`;
  let uploadsPlaylistId: string | null = null;

  if (cache.has(channelCacheKey)) {
    const cached = cache.get(channelCacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      // We stored the playlist ID in a synthetic item's id field
      uploadsPlaylistId = cached.data.items[0]?.id as string ?? null;
    }
  }

  if (!uploadsPlaylistId) {
    const chUrl = `${BASE_URL}/channels?part=contentDetails&forHandle=${encodeURIComponent(channelTitle)}&key=${API_KEY}`;
    const chCacheKey = `channel_handle_${channelTitle}`;
    // channels.list is cheap (1 unit) — use fetchWithCache directly
    const chCached = cache.has(chCacheKey) && (Date.now() - cache.get(chCacheKey)!.timestamp < CACHE_TTL_MS);
    if (!chCached) trackQuota('channels');
    const chRes = await fetch(chUrl);
    if (chRes.ok) {
      const chData = await chRes.json();
      uploadsPlaylistId = chData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null;
    }
    if (uploadsPlaylistId) {
      cache.set(channelCacheKey, { data: { items: [{ id: uploadsPlaylistId, snippet: { title: '', channelTitle: '', thumbnails: {} } }] }, timestamp: Date.now() });
    }
  }

  if (!uploadsPlaylistId) return getRelatedTracks(channelTitle);

  // Step 2: fetch playlist items (1 unit, cached)
  const plUrl = `${BASE_URL}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${API_KEY}`;
  const plCacheKey = `uploads_${uploadsPlaylistId}`;

  if (cache.has(plCacheKey)) {
    const cached = cache.get(plCacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.data;
  }

  trackQuota('playlistItems');
  const plRes = await fetch(plUrl);
  if (!plRes.ok) return getRelatedTracks(channelTitle);
  const plData = await plRes.json();

  // playlistItems returns snippet.resourceId.videoId — normalize to YouTubeVideoItem shape
  const items: YouTubeVideoItem[] = (plData.items || [])
    .filter((item: any) => item.snippet?.resourceId?.kind === 'youtube#video')
    .map((item: any) => ({
      id: { videoId: item.snippet.resourceId.videoId },
      snippet: {
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle || item.snippet.videoOwnerChannelTitle || channelTitle,
        thumbnails: item.snippet.thumbnails,
      },
    }));

  const result: YouTubeResponse = { items, nextPageToken: plData.nextPageToken };
  cache.set(plCacheKey, { data: result, timestamp: Date.now() });
  return result;
}

/**
 * Diverse feed: mix trending + uploads from a few popular channels.
 * Uses: 1 (trending) + N×2 (channels) units — far cheaper than N×100 search calls.
 */
const DIVERSE_CHANNELS = [
  'Diljit Dosanjh', 'Arijit Singh', 'The Weeknd', 'Taylor Swift', 'AP Dhillon',
];

export async function getDiverseFeed(regionCode: string = 'US'): Promise<YouTubeResponse> {
  const API_KEY = getApiKey();
  if (!API_KEY) throw new Error('YouTube API key not configured');

  // Pick 2 random channels to keep variety without burning quota
  const picks = [...DIVERSE_CHANNELS].sort(() => Math.random() - 0.5).slice(0, 2);

  const [trending, ...channelResults] = await Promise.allSettled([
    getTrendingMusic(regionCode),
    ...picks.map(ch => getChannelUploads(ch)),
  ]);

  const trendingItems = trending.status === 'fulfilled' ? trending.value.items : [];
  const channelItems = channelResults
    .filter((r): r is PromiseFulfilledResult<YouTubeResponse> => r.status === 'fulfilled')
    .flatMap(r => r.value.items);

  // Interleave: trending[0], channel[0], trending[1], channel[1], ...
  const merged: YouTubeVideoItem[] = [];
  const maxLen = Math.max(trendingItems.length, channelItems.length);
  for (let i = 0; i < maxLen; i++) {
    if (trendingItems[i]) merged.push(trendingItems[i]);
    if (channelItems[i]) merged.push(channelItems[i]);
  }

  // Deduplicate by video ID
  const seen = new Set<string>();
  const deduped = merged.filter(item => {
    const id = typeof item.id === 'string' ? item.id : item.id.videoId;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  return { items: deduped };
}
