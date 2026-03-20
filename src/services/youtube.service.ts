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

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Cache to save API Quota
const cache = new Map<string, { data: YouTubeResponse, timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function fetchWithCache(url: string, cacheKey: string): Promise<YouTubeResponse> {
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('YouTube API request failed');
  }

  const data = await response.json();
  const result: YouTubeResponse = {
     items: data.items || [],
     nextPageToken: data.nextPageToken
  };

  cache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

export async function getTrendingMusic(regionCode: string = 'US', pageToken?: string): Promise<YouTubeResponse> {
  let url = `${BASE_URL}/videos?part=snippet,statistics&chart=mostPopular&videoCategoryId=10&regionCode=${regionCode}&maxResults=12&key=${API_KEY}`;
  if (pageToken) url += `&pageToken=${pageToken}`;
  return fetchWithCache(url, `trending_${regionCode}_${pageToken || 'first'}`);
}

export async function searchMusic(query: string, pageToken?: string): Promise<YouTubeResponse> {
  // videoCategoryId=10 and topicId=/m/04rlf for strict music filtering
  let url = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&topicId=/m/04rlf&maxResults=12&key=${API_KEY}`;
  if (pageToken) url += `&pageToken=${pageToken}`;
  return fetchWithCache(url, `search_${query}_${pageToken || 'first'}`);
}

export async function getRelatedTracks(channelTitle: string): Promise<YouTubeResponse> {
  // FR-05.1 Fetch 5-10 related videos for the smart queue
  // Since relatedToVideoId is deprecated and throws 400 Bad Request randomly, we safely fallback to an artist query
  const url = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(channelTitle + ' songs')}&type=video&videoCategoryId=10&maxResults=12&key=${API_KEY}`;
  return fetchWithCache(url, `related_${channelTitle}`);
}
