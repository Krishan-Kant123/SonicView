"use client";

import { useState, useEffect } from "react";
import { MusicFeed } from "@/components/Feed/MusicFeed";
import { cn } from "@/lib/utils";
import { TrendingUp, Mic2, Flame, Play, Library, Search } from "lucide-react";
import { usePlayerStore } from "@/store/player.store";

const REGIONS = [
  "Trending", "Punjabi", "Bollywood", "English Pop", "Lofi Beats", "Hip Hop", 
  "Acoustic", "Electronic", "R&B", "Classical", "Jazz", "K-Pop", "Latin", 
  "Rock", "Sufi", "Retro", "Chillstep"
];

const ARTISTS = [
  "Diljit Dosanjh", "Arijit Singh", "The Weeknd", "Karan Aujla", "Taylor Swift", 
  "Badshah", "AP Dhillon", "Shreya Ghoshal", "Justin Bieber", "Ed Sheeran", 
  "Dua Lipa", "Drake", "Eminem", "Atif Aslam", "Sonu Nigam", "Jubin Nautiyal",
  "Kishore Kumar", "Lata Mangeshkar", "Neha Kakkar", "Guru Randhawa", "Billie Eilish",
  "Post Malone", "Ariana Grande", "Bruno Mars", "Coldplay", "Imagine Dragons"
];

const ARTIST_IMAGES: Record<string, string> = {
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
  "Drake": "https://upload.wikimedia.org/wikipedia/commons/1/15/Drake_at_The_Carter_Effect_2017_%2836818935200%29_%28cropped%29.jpg"
};

const getInitials = (name: string) => {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("Trending");
  const [artistSearch, setArtistSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const recentTracks = usePlayerStore((state) => state.recentTracks);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const quality = usePlayerStore((state) => state.quality);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine the actual API query based on the active tab
  const activeQuery = activeTab === "Trending" ? undefined : `${activeTab} music`;

  const handleArtistSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (artistSearch.trim()) {
      setActiveTab(artistSearch.trim());
    }
  };

  const filteredArtists = ARTISTS.filter(a => a.toLowerCase().includes(artistSearch.toLowerCase()));
  const featuredTrack = mounted && recentTracks && recentTracks.length > 0 ? recentTracks[0] : null;

  const getThumbnailUrl = (track: any) => {
    if (!track) return '';
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

  // Build Carousel Slides
  const slides = [];

  // Slide 1: Original Featured Experience
  slides.push(
    <div className="relative z-10 max-w-2xl px-2" key="s1">
      <span className="bg-teal-500/20 text-teal-300 text-xs font-bold px-3 py-1.5 rounded-full tracking-widest uppercase mb-6 inline-block shadow-inner shadow-teal-500/20">Featured Experience</span>
      <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-lg">Vibe Shift</h1>
      <p className="text-zinc-300 text-sm md:text-lg mb-8 max-w-md leading-relaxed drop-shadow font-medium">Experience the next evolution of sound. A cinematic journey through the neon-soaked streets of tomorrow.</p>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setActiveTab('Synthwave Neon Music')} 
          className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-white/20"
        >
          <Play className="w-5 h-5 fill-current text-black" /> Watch Now
        </button>
      </div>
    </div>
  );

  // Slide 2: Recently Played Track
  if (featuredTrack) {
    slides.push(
      <div className="relative z-10 max-w-4xl flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left px-2" key="s2">
        <img 
           src={getThumbnailUrl(featuredTrack)} 
           className="w-40 h-40 md:w-56 md:h-56 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] object-cover ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-700" 
           alt="Featured Track" 
        />
        <div className="flex flex-col flex-1 justify-center align-center md:align-start mt-4 md:mt-2">
          <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1.5 rounded-full tracking-widest uppercase mb-4 w-fit shadow-inner shadow-purple-500/20 mx-auto md:mx-0">Recently Played</span>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-lg line-clamp-2 md:leading-tight">{featuredTrack.snippet.title}</h1>
          <p className="text-zinc-300 text-sm md:text-md mb-6 max-w-md leading-relaxed drop-shadow font-medium line-clamp-2">{featuredTrack.snippet.channelTitle}</p>
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <button 
              onClick={() => { setQueue([featuredTrack]); playTrack(featuredTrack); }} 
              className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-white/20"
            >
              <Play className="w-5 h-5 fill-current text-black" /> Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Slide 3: Trending Chart Promotion
  slides.push(
    <div className="relative z-10 max-w-2xl px-2" key="s3">
      <span className="bg-orange-500/20 text-orange-300 text-xs font-bold px-3 py-1.5 rounded-full tracking-widest uppercase mb-6 inline-block shadow-inner shadow-orange-500/20">Global Top Charts</span>
      <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-lg">Trending Now</h1>
      <p className="text-zinc-300 text-sm md:text-lg mb-8 max-w-md leading-relaxed drop-shadow font-medium">Discover the tracks completely dominating the airwaves across the planet right now.</p>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setActiveTab('Trending')} 
          className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-orange-500/30"
        >
          <Flame className="w-5 h-5 fill-current" /> Explore Charts
        </button>
      </div>
    </div>
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <main className="min-h-screen pb-32">
      <section className="max-w-7xl mx-auto pt-6 px-4">
        
        {/* Carousel Hero Banner */}
        <div className="w-full rounded-3xl bg-gradient-to-br from-[#1a0b2e] via-[#2d1155] to-[#120428] p-8 md:p-12 mb-10 overflow-hidden relative shadow-2xl border border-white/5 group min-h-[460px] md:min-h-[400px] flex md:items-center">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 group-hover:bg-purple-500/30 transition-colors duration-700" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
          
          <div className="relative w-full transition-opacity duration-1000 ease-in-out animate-in fade-in zoom-in-95" key={currentSlide}>
            {slides[currentSlide]}
          </div>

          {/* Carousel Pagination Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {slides.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentSlide(i)} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500 hover:bg-white", 
                  currentSlide === i ? "w-8 bg-purple-400 shadow-[0_0_10px_purple]" : "w-2 bg-white/20"
                )} 
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Categories / Genres */}
        <div className="mb-10 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" /> Discover Modes
            </h2>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] whitespace-nowrap mask-gradient-x">
            {REGIONS.map(region => (
              <button
                key={region}
                onClick={() => setActiveTab(region)}
                className={cn(
                  "px-5 py-2.5 rounded-full font-semibold text-sm transition-all shadow-md shrink-0",
                  activeTab === region 
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/20 shadow-lg" 
                    : "bg-[#18181b] hover:bg-[#27272a] text-zinc-300 border border-white/5 hover:border-white/10"
                )}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Top Artists Segment */}
        <div className="mb-10 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Mic2 className="w-5 h-5 text-indigo-400" /> Top Artists
            </h2>
            <form onSubmit={handleArtistSearchSubmit} className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text"
                placeholder="Search any artist..."
                value={artistSearch}
                onChange={(e) => setArtistSearch(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 text-white text-sm rounded-full pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-zinc-500"
              />
              <button type="submit" className="hidden" />
            </form>
          </div>
          
          <div className="flex items-center gap-6 overflow-x-auto pb-6 pt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mask-gradient-x">
            {(artistSearch.trim() ? filteredArtists : ARTISTS).map(artist => (
              <button
                 key={artist}
                 onClick={() => setActiveTab(artist)}
                 className={cn(
                   "flex flex-col items-center gap-3 shrink-0 group w-[90px] transition-opacity",
                   activeTab === artist ? "opacity-100" : "hover:opacity-100"
                 )}
              >
                 <div className={cn(
                   "w-20 h-20 md:w-24 md:h-24 rounded-full shadow-2xl overflow-hidden flex items-center justify-center p-[2px] transition-all",
                   activeTab === artist 
                     ? "bg-gradient-to-br from-purple-500 to-indigo-600 shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-105" 
                     : "bg-[#27272a] border border-white/5 group-hover:border-white/20 group-hover:scale-105"
                 )}>
                    {ARTIST_IMAGES[artist] ? (
                      <img 
                        src={ARTIST_IMAGES[artist]} 
                        alt={artist} 
                        className="w-full h-full rounded-full object-cover shadow-inner"
                        loading="lazy"
                      />
                    ) : (
                      <div className={cn(
                        "relative w-full h-full rounded-full flex flex-col items-center justify-center text-center shadow-inner",
                        activeTab === artist ? "bg-[#18181b]" : "bg-[#121212] group-hover:bg-[#18181b] transition-colors"
                      )}>
                        <Mic2 className={cn("absolute inset-0 m-auto w-10 h-10 opacity-[0.07]", activeTab === artist ? "text-purple-400" : "text-zinc-400")} />
                        <span className={cn(
                          "relative z-10 text-xl md:text-2xl font-black drop-shadow-md tracking-tighter",
                          activeTab === artist ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                        )}>
                          {getInitials(artist)}
                        </span>
                      </div>
                    )}
                 </div>
                 <span className={cn(
                   "text-xs md:text-sm font-bold text-center truncate w-full transition-colors",
                   activeTab === artist ? "text-purple-400" : "text-zinc-300 group-hover:text-white"
                 )}>
                   {artist}
                 </span>
              </button>
            ))}
            {artistSearch.trim() && filteredArtists.length === 0 && (
              <div className="flex items-center justify-center w-full py-8 text-zinc-500 text-sm">
                Press Enter to globally search for "{artistSearch}"
              </div>
            )}
          </div>
        </div>

      </section>

      {/* Main Music Feed Grid/List */}
      <section className="max-w-7xl mx-auto py-2">
        <div className="px-4 mb-2 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2 drop-shadow-md tracking-tight">
            <Flame className="w-6 h-6 text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.5)] fill-orange-400/20" />
            {activeTab === "Trending" ? "Trending Now" : `${activeTab}`}
          </h2>
        </div>
        <MusicFeed query={activeQuery} />
      </section>
    </main>
  );
}
