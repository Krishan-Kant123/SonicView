"use client";

import { useState, useEffect, useMemo } from "react";
import { MusicFeed } from "@/components/Feed/MusicFeed";
import { usePlayerStore } from "@/store/player.store";
import { getTrendingMusic, YouTubeVideoItem } from "@/services/youtube.service";
import { ChevronRight, Clock, Pause, MoreVertical, Zap, Smile, Music } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Static data — NO JSX at module scope ──────────────────────────────── */

const GENRES = [
  "Trending", "Punjabi", "Bollywood", "English Pop", "Lofi Beats",
  "Hip Hop", "Acoustic", "Electronic", "R&B", "Classical",
  "Jazz", "K-Pop", "Latin", "Rock", "Sufi", "Retro", "Chillstep",
];

const QUICK_TILES = [
  { label: "Mood Booster", iconName: "smile", query: "mood booster upbeat music", accent: "var(--primary)" },
  { label: "Pure Focus",   iconName: "zap",   query: "focus deep work music",     accent: "var(--tertiary)" },
  { label: "Night Drive",  iconName: "music", query: "night drive synthwave music", accent: "#a78bfa" },
  { label: "Chill Out",    iconName: "music", query: "chill lofi beats music",     accent: "#22d3ee" },
];

export const ARTIST_IMAGES: Record<string, string> = {
  "Diljit Dosanjh": "https://upload.wikimedia.org/wikipedia/commons/e/e2/Diljit_Dosanjh.jpg",
  "Arijit Singh": "https://upload.wikimedia.org/wikipedia/commons/b/b7/Arijit_Singh_performance_at_Chandigarh_2025.jpg",
  "The Weeknd": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/The_Weeknd_Portrait_by_Brian_Ziff.jpg/960px-The_Weeknd_Portrait_by_Brian_Ziff.jpg",
  "Karan Aujla": "https://upload.wikimedia.org/wikipedia/commons/7/76/Karan_Aujla_2020.jpg",
  "Taylor Swift": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%283%29.png/960px-Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%283%29.png",
  "AP Dhillon": "https://upload.wikimedia.org/wikipedia/commons/9/95/AP_Dhillon_CA.jpg",
  "Shreya Ghoshal": "https://upload.wikimedia.org/wikipedia/commons/a/a0/Shreya_Ghoshal_Behindwoods_Gold_Icons_Awards_2023_%28cropped%29.jpg",
  "Justin Bieber": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Justin_Bieber_in_2015.jpg/960px-Justin_Bieber_in_2015.jpg",
  "Ed Sheeran": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Ed_Sheeran-6886_%28cropped%29.jpg/960px-Ed_Sheeran-6886_%28cropped%29.jpg",
  "Dua Lipa": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Dua_Lipa-69798_%28cropped%29.jpg/960px-Dua_Lipa-69798_%28cropped%29.jpg",
  "Eminem": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Eminem_2021_Color_Corrected.jpg/960px-Eminem_2021_Color_Corrected.jpg",
  "Atif Aslam": "https://upload.wikimedia.org/wikipedia/commons/2/2d/Atif_Aslam_at_Badlapur_%28cropped%29.jpg",
  "Sonu Nigam": "https://upload.wikimedia.org/wikipedia/commons/7/76/Sonu_Nigam123.jpg",
  "Jubin Nautiyal": "https://upload.wikimedia.org/wikipedia/commons/9/90/Jubin_Nauityal_at_the_Good_Homes_Awards_2015.jpg",
  "Kishore Kumar": "https://upload.wikimedia.org/wikipedia/commons/c/c2/Kishore_Kumar_2016_postcard_of_India_%28cropped%29.jpg",
  "Lata Mangeshkar": "https://upload.wikimedia.org/wikipedia/commons/2/2c/Lata-Mangeshkar.jpg",
  "Neha Kakkar": "https://upload.wikimedia.org/wikipedia/commons/6/6f/Neha_Kakkar_in_January_2020.jpg",
  "Guru Randhawa": "https://upload.wikimedia.org/wikipedia/commons/b/be/Guru_Randhawa_at_the_launch_of_MTV_Unplugged_Season_8_%28cropped%29.jpg",
  "Billie Eilish": "https://upload.wikimedia.org/wikipedia/commons/c/c7/BillieEilishO2140725-39_-_54665577407_%28cropped%29.jpg",
  "Post Malone": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Post_Malone_July_2021_%28cropped%29.jpg/960px-Post_Malone_July_2021_%28cropped%29.jpg",
  "Ariana Grande": "https://upload.wikimedia.org/wikipedia/commons/7/7c/Ariana_Grande_promoting_Wicked_%282024%29.jpg",
  "Bruno Mars": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/BrunoMars24KMagicWorldTourLive_%28cropped%29.jpg/960px-BrunoMars24KMagicWorldTourLive_%28cropped%29.jpg",
  "Coldplay": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/ColdplayWembley120925_%28cropped%29.jpg/960px-ColdplayWembley120925_%28cropped%29.jpg",
  "Imagine Dragons": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Imagine_Dragons_-_Uncasville_CT_-_November_2017_-_2.jpg/960px-Imagine_Dragons_-_Uncasville_CT_-_November_2017_-_2.jpg",
  "Badshah": "https://upload.wikimedia.org/wikipedia/commons/c/cb/Badshah_snapped_promoting_their_song_%28cropped%29.jpg",
  "Drake": "https://upload.wikimedia.org/wikipedia/commons/1/15/Drake_at_The_Carter_Effect_2017_%2836818935200%29_%28cropped%29.jpg",
};

const ARTIST_NAMES = Object.keys(ARTIST_IMAGES);

/* ─── Helpers & Sub-components ───────────────────────────────────────────── */

const getInitials = (name: string) =>
  name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

function formatTime(s: number) {
  if (!s || isNaN(s)) return "";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

function TileIcon({ name, style }: { name: string; style: React.CSSProperties }) {
  if (name === "smile") return <Smile className="w-6 h-6" style={style} />;
  if (name === "zap")   return <Zap   className="w-6 h-6" style={style} />;
  return                       <Music className="w-6 h-6" style={style} />;
}

/* ─── Home Page ─────────────────────────────────────────────────────────── */

export default function Home() {
  const [activeTab, setActiveTab] = useState("Trending");
  const [mounted,   setMounted]   = useState(false);
  const [trendingTracks, setTrendingTracks] = useState<YouTubeVideoItem[]>([]);
  const [trendingLimit, setTrendingLimit] = useState(12);

  const recentTracks = usePlayerStore((s) => s.recentTracks);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying    = usePlayerStore((s) => s.isPlaying);
  const duration     = usePlayerStore((s) => s.duration);
  const playTrack    = usePlayerStore((s) => s.playTrack);
  const setQueue     = usePlayerStore((s) => s.setQueue);

  useEffect(() => {
    setMounted(true);
    getTrendingMusic('IN')
      .then(res => setTrendingTracks(res.items))
      .catch(e => console.error("Error fetching trending header:", e));
  }, []);

  const activeQuery   = activeTab === "Trending" ? undefined : `${activeTab} music`;
  const featuredCards = mounted && trendingTracks.length > 0 ? trendingTracks.slice(0, trendingLimit) : [];
  console.log(trendingTracks)

  const getId = (t: any) => typeof t.id === "string" ? t.id : t.id.videoId;

  // Rotating spotlight — picks a random real artist on each mount
  const spotlight = useMemo(() => {
    const idx = Math.floor(Math.random() * ARTIST_NAMES.length);
    const name = ARTIST_NAMES[idx];
    return { name, image: ARTIST_IMAGES[name] };
  }, []);

  return (
    <main className="min-h-screen pb-36" style={{ background: 'var(--background)' }}>

      {/* ══ 1. GLOBAL TRENDING HEADER ═══════════════════════════════════════ */}
      <section className="px-4 pt-1 pb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-1"
           style={{ color: 'var(--on-surface-variant)' }}>
          Global Trending
        </p>
        <div className="flex items-end justify-between">
          <h1 className="text-[2rem] font-black leading-none tracking-tight"
              style={{ color: 'var(--on-surface)' }}>
            Top 50 Hits
          </h1>
          <button
            onClick={() => setTrendingLimit(prev => prev === 12 ? 50 : 12)}
            className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity"
            style={{ color: 'var(--primary)' }}
          >
            {trendingLimit === 12 ? "Load More" : "Show Less"} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ══ 2. FEATURED ALBUM CAROUSEL ══════════════════════════════════════ */}
      {featuredCards.length > 0 && (
        <section className="mb-7">
          <div className="flex gap-3 overflow-x-auto px-4 pb-1" style={{ scrollSnapType: 'x mandatory' }}>
            {featuredCards.map((track, i) => {
              const thumb = track.snippet.thumbnails.high?.url || track.snippet.thumbnails.medium?.url;
              const id = getId(track);
              const curId = currentTrack ? getId(currentTrack) : null;
              const active = curId === id;

              return (
                <button
                  key={id}
                  onClick={() => { setQueue(trendingTracks); playTrack(track); }}
                  className="relative shrink-0 rounded-2xl overflow-hidden text-left group w-36 sm:w-40 md:w-48 aspect-[4/5]"
                  style={{
                    scrollSnapAlign: 'start',
                    boxShadow: active ? `0 0 0 2px var(--primary)` : 'none',
                  }}
                >
                  <img src={thumb} alt={track.snippet.title}
                       className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0" style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)'
                  }} />
                  <span className="absolute bottom-16 left-3 text-6xl font-black leading-none select-none"
                        style={{ color: 'rgba(255,255,255,0.18)', fontVariantNumeric: 'tabular-nums' }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {active && isPlaying && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                         style={{ background: 'var(--primary)' }}>
                      <Pause className="w-3 h-3 fill-current" style={{ color: 'var(--on-primary)' }} />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="font-bold text-sm line-clamp-2 leading-tight" style={{ color: 'var(--on-surface)' }}>
                      {track.snippet.title}
                    </p>
                    <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: 'var(--primary)' }}>
                      {track.snippet.channelTitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ══ 3. RECENTLY PLAYED ══════════════════════════════════════════════ */}
      {mounted && recentTracks.length > 0 && (
        <section className="px-4 mb-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black" style={{ color: 'var(--on-surface)' }}>Recently Played</h2>
            <Clock className="w-4 h-4" style={{ color: 'var(--on-surface-variant)' }} />
          </div>
          <div className="obsidian-glass rounded-2xl overflow-hidden">
            {recentTracks.slice(0, 5).map((track, idx) => {
              const id = getId(track);
              const thumb = track.snippet.thumbnails.medium?.url || track.snippet.thumbnails.default?.url;
              const curId = currentTrack ? getId(currentTrack) : null;
              const active = curId === id;
              return (
                <div key={id}>
                  {idx > 0 && <div className="mx-4" style={{ height: 1, background: 'rgba(60,73,78,0.15)' }} />}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer group transition-colors"
                    style={{ background: active ? 'rgba(0,252,67,0.06)' : 'transparent' }}
                    onClick={() => { setQueue(recentTracks); playTrack(track); }}
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0"
                         style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                      <img src={thumb} alt={track.snippet.title} className="w-full h-full object-cover" />
                      {active && isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center"
                             style={{ background: 'rgba(0,0,0,0.5)' }}>
                          <Pause className="w-4 h-4 fill-current" style={{ color: 'var(--primary)' }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-clamp-1"
                         style={{ color: active ? 'var(--primary)' : 'var(--on-surface)' }}>
                        {track.snippet.title}
                      </p>
                      <p className="text-xs truncate mt-0.5"
                         style={{ color: 'var(--primary)', opacity: active ? 1 : 0.7 }}>
                        {track.snippet.channelTitle}
                      </p>
                    </div>
                    <span className="text-xs font-mono shrink-0" style={{ color: 'var(--on-surface-variant)' }}>
                      {active && duration > 0 ? formatTime(duration) : ""}
                    </span>
                    <button className="p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--on-surface-variant)' }} onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ══ 4. TOP ARTISTS — horizontal scroll ══════════════════════════════ */}
      <section className="mb-7">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-base font-black" style={{ color: 'var(--on-surface)' }}>Top Artists</h2>
          {/* <button className="text-[11px] font-bold" style={{ color: 'var(--primary)' }}>See All</button> */}
        </div>
        <div className="flex gap-4 overflow-x-auto px-4 pb-1">
          {ARTIST_NAMES.map((name) => (
            <button
              key={name}
              onClick={() => setActiveTab(name)}
              className="flex flex-col items-center gap-2 shrink-0 w-[72px] group"
            >
              <div
                className="w-16 h-16 rounded-full overflow-hidden transition-all group-hover:ring-2"
                style={{
                  boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  // ringColor: 'var(--primary)',
                }}
              >
                <img src={ARTIST_IMAGES[name]} alt={name}
                     className="w-full h-full object-cover"
                     onError={(e) => {
                       (e.target as HTMLImageElement).style.display = 'none';
                       (e.target as HTMLImageElement).parentElement!.innerHTML =
                         `<div class="w-full h-full flex items-center justify-center text-xs font-black" style="background:var(--surface-container-high);color:var(--on-surface-variant)">${getInitials(name)}</div>`;
                     }}
                />
              </div>
              <span className="text-[10px] text-center leading-tight line-clamp-2 group-hover:brightness-125 transition-all"
                    style={{ color: 'var(--on-surface-variant)' }}>
                {name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ══ 5. QUICK DISCOVERY ═══════════════════════════════════════════════ */}
      <section className="px-4 mb-7">
        <h2 className="text-base font-black mb-3" style={{ color: 'var(--on-surface)' }}>Quick Discovery</h2>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_TILES.map((tile) => {
            const active = activeTab === tile.query;
            return (
              <button
                key={tile.label}
                onClick={() => setActiveTab(tile.query)}
                className="relative flex flex-col justify-end p-4 rounded-2xl text-left h-[110px] overflow-hidden transition-all active:scale-[0.97]"
                style={{
                  background: active ? 'rgba(0,252,67,0.12)' : 'var(--surface-container)',
                  border: active ? '1px solid rgba(0,252,67,0.35)' : '1px solid rgba(60,73,78,0.15)',
                  boxShadow: active ? '0 0 20px rgba(0,252,67,0.1)' : 'none',
                }}
              >
                <TileIcon name={tile.iconName} style={{ color: tile.accent }} />
                <span className="text-sm font-black mt-2 leading-tight" style={{ color: 'var(--on-surface)' }}>
                  {tile.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ══ 6. ARTIST SPOTLIGHT — real rotating artist ════════════════════════ */}
      <section className="px-4 mb-7">
        <div
          className="flex items-center gap-4 p-4 rounded-2xl relative overflow-hidden"
          style={{ background: 'var(--surface-container)', border: '1px solid rgba(60,73,78,0.15)' }}
        >
          <div className="absolute -left-4 top-0 bottom-0 w-24 rounded-full blur-3xl opacity-20"
               style={{ background: 'var(--primary)' }} />
          <img
            src={spotlight.image}
            alt={spotlight.name}
            className="w-14 h-14 rounded-full object-cover shrink-0 relative z-10"
            style={{ boxShadow: '0 0 0 2px rgba(0,252,67,0.3)' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="flex-1 min-w-0 relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
                Spotlight
              </span>
            </div>
            <p className="font-black text-sm truncate" style={{ color: 'var(--on-surface)' }}>{spotlight.name}</p>
            <p className="text-xs" style={{ color: 'var(--on-surface-variant)' }}>Artist on SonicView</p>
          </div>
          <button
            onClick={() => setActiveTab(spotlight.name)}
            className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border transition-all hover:opacity-80 shrink-0 relative z-10"
            style={{ borderColor: 'var(--on-surface-variant)', color: 'var(--on-surface)' }}
          >
            Play
          </button>
        </div>
      </section>

      {/* ══ 7. GENRE PILLS ═══════════════════════════════════════════════════ */}
      <section className="mb-5">
        <div className="flex gap-2 overflow-x-auto px-4 pb-1">
          {GENRES.map((g) => {
            const active = activeTab === g || (g === "Trending" && activeTab === "Trending");
            return (
              <button
                key={g}
                onClick={() => setActiveTab(g)}
                className="px-4 py-2 rounded-full text-[11px] font-bold shrink-0 transition-all"
                style={{
                  background: active ? 'var(--primary)' : 'var(--surface-container)',
                  color:      active ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                  border:     active ? 'none' : '1px solid rgba(60,73,78,0.2)',
                  boxShadow:  active ? '0 0 14px rgba(0,252,67,0.35)' : 'none',
                }}
              >
                {g}
              </button>
            );
          })}
        </div>
      </section>

      {/* ══ 8. FEED ══════════════════════════════════════════════════════════ */}
      <section>
        <div className="px-4 mb-3">
          <h2 className="text-base font-black" style={{ color: 'var(--on-surface)' }}>
            {activeTab === "Trending"
              ? "Trending Now"
              : activeTab.replace(/ (music|beats)$/, "")}
          </h2>
        </div>
        <MusicFeed query={activeQuery} />
      </section>
    </main>
  );
}
