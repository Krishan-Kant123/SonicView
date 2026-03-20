"use client";

import { useState, useEffect } from 'react';
import { usePlayerStore } from '@/store/player.store';
import { Play, Pause, SkipForward, SkipBack, Volume2, Repeat, Shuffle, ChevronDown, ListPlus, PlusSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Visualizer } from '@/components/Player/Visualizer';
import { AddToPlaylistModal } from '@/components/Playlists/AddToPlaylistModal';

export function MobileBottomSheet() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const playNext = usePlayerStore((state) => state.playNext);
  const playPrevious = usePlayerStore((state) => state.playPrevious);
  const volume = usePlayerStore((state) => state.volume);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const toggleLoop = usePlayerStore((state) => state.toggleLoop);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const isLoop = usePlayerStore((state) => state.loop);
  const isShuffle = usePlayerStore((state) => state.shuffle);
  
  const quality = usePlayerStore((state) => state.quality);
  const setQuality = usePlayerStore((state) => state.setQuality);

  const cycleQuality = () => {
    const sequence: ('auto' | 'small' | 'medium' | 'hd720')[] = ['auto', 'small', 'medium', 'hd720'];
    const idx = sequence.indexOf(quality as any);
    const next = sequence[(idx + 1) % sequence.length];
    setQuality(next);
  };
  
  const progress = usePlayerStore((state) => state.progress);
  const duration = usePlayerStore((state) => state.duration);
  const triggerSeek = usePlayerStore((state) => state.triggerSeek);
  
  const queue = usePlayerStore((state) => state.queue);
  const moveTrackToNext = usePlayerStore((state) => state.moveTrackToNext);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const clearTrack = usePlayerStore((state) => state.clearTrack);

  if (!currentTrack) return null;

  const currentId = typeof currentTrack.id === 'string' ? currentTrack.id : currentTrack.id.videoId;
  const currentIndex = queue.findIndex((item) => {
    const itemId = typeof item.id === 'string' ? item.id : item.id.videoId;
    return itemId === currentId;
  });
  const upcomingTracks = currentIndex !== -1 ? queue.slice(currentIndex + 1) : [];

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    triggerSeek(Number(e.target.value));
  };

  const highResImg = currentTrack.snippet.thumbnails.high?.url || currentTrack.snippet.thumbnails.medium?.url;

  return (
    <>
      <AnimatePresence>
      {isExpanded ? (
        <motion.div
          key="expanded"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-50 flex flex-col p-6 overflow-y-auto overflow-x-hidden md:p-12 items-center"
          style={{ background: `linear-gradient(180deg, rgb(33,33,33) 0%, #09090b 100%)` }}
        >
          <div className="w-full max-w-md mx-auto flex flex-col h-full relative">
            
            {/* Top Bar */}
            <div className="w-full flex justify-between items-center flex-none mt-2 mb-6">
              <button 
                onClick={() => setIsExpanded(false)} 
                className="p-1 -ml-1 text-zinc-300 hover:text-white transition-colors bg-white/5 rounded-full"
              >
                <ChevronDown className="w-7 h-7" />
              </button>
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Now Playing</span>
              <div className="w-7"></div> {/* Spacer */}
            </div>

            {/* Circular Album Art & Visualizer Ring */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 mx-auto flex-none flex items-center justify-center mb-10 mt-10 shrink-0 z-10">
               {/* Behind the image, radiating outwards */}
               <div className="absolute inset-x-0 inset-y-0 pointer-events-none -z-10">
                 <Visualizer />
               </div>

               {/* The spinning record */}
               <img 
                 src={highResImg} 
                 alt="cover" 
                 className="w-full h-full object-cover rounded-full shadow-[0_0_40px_rgba(0,0,0,1)] border-[8px] border-[#121212] z-20 animate-[spin_20s_linear_infinite]"
                 style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
               />
            </div>

            {/* Music Info */}
            <div className="flex items-center justify-between w-full mb-8 px-4">
              <div className="w-10 shrink-0"></div> {/* Spacer for symmetry */}
              <div className="flex flex-col flex-1 items-center text-center overflow-hidden">
                <h2 className="text-2xl font-bold text-white line-clamp-1 w-full">{currentTrack.snippet.title}</h2>
                <p className="text-md text-zinc-400 line-clamp-1 mt-1 w-full">{currentTrack.snippet.channelTitle}</p>
              </div>
              <button 
                 onClick={(e) => { e.stopPropagation(); setShowPlaylistModal(true); }}
                 className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-transparent hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                 title="Add to Playlist"
              >
                 <PlusSquare className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex flex-col w-full mb-6">
               <div className="relative w-full h-1.5 bg-zinc-800 rounded-full group cursor-pointer">
                 <div 
                   className="absolute top-0 left-0 h-full bg-[#a855f7] rounded-full"
                   style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
                 />
                 <input 
                   type="range" 
                   min="0" 
                   max={duration || 100} 
                   value={progress}
                   onChange={handleSeek}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 />
                 {/* Thumb */}
                 <div 
                   className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#a855f7] rounded-full shadow-md scale-100 transition-transform"
                   style={{ left: `calc(${duration > 0 ? (progress / duration) * 100 : 0}% - 7px)` }}
                 />
               </div>
               <div className="flex justify-between text-xs text-zinc-400 mt-2 font-medium">
                 <span>{formatTime(progress)}</span>
                 <span>{formatTime(duration)}</span>
               </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-between w-full mb-10 px-2">
              <button onClick={toggleShuffle} className={cn("transition-colors", isShuffle ? "text-purple-500" : "text-zinc-400 hover:text-white")}>
                <Shuffle className="w-6 h-6" />
              </button>
              <button onClick={() => playPrevious()} className="text-zinc-100 hover:text-white transition-colors active:scale-95">
                <SkipBack className="w-10 h-10 fill-current" />
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-20 h-20 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-transform shadow-xl"
              >
                {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-2" />}
              </button>
              <button onClick={() => playNext()} className="text-zinc-100 hover:text-white transition-colors active:scale-95">
                <SkipForward className="w-10 h-10 fill-current" />
              </button>
              <button onClick={toggleLoop} className={cn("transition-colors", isLoop ? "text-purple-500" : "text-zinc-400 hover:text-white")}>
                <Repeat className="w-6 h-6" />
              </button>
            </div>

            {/* Volume Slider Overlay */}
            <div className="flex items-center gap-4 w-full justify-center mt-auto mb-8 flex-shrink-0">
               <Volume2 className="w-5 h-5 text-zinc-400" />
               <div className="relative w-48 h-1.5 bg-zinc-800 rounded-full cursor-pointer">
                 <div 
                   className="absolute top-0 left-0 h-full bg-[#a855f7] rounded-full"
                   style={{ width: `${volume}%` }}
                 />
                 <input 
                   type="range" 
                   min="0" max="100" 
                   value={volume}
                   onChange={(e) => setVolume(Number(e.target.value))}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 />
                 <div 
                   className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#a855f7] rounded-full"
                   style={{ left: `calc(${volume}% - 7px)` }}
                 />
               </div>
            </div>

            {/* UP NEXT QUEUE */}
            <div className="w-full mt-auto bg-white/5 backdrop-blur-3xl rounded-3xl p-4 border border-white/5 flex-shrink-0 pb-6">
               <div className="flex justify-between items-center mb-4 px-2">
                 <h3 className="text-lg font-bold text-white tracking-wide">Up Next</h3>
                 {isShuffle && <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest">Shuffled</span>}
               </div>
               <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                 {upcomingTracks.map((track, i) => {
                    const trackId = typeof track.id === 'string' ? track.id : track.id.videoId;
                    return (
                      <div key={trackId + i} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/10 transition-colors group cursor-pointer" onClick={() => playTrack(track)}>
                        <img src={track.snippet.thumbnails.medium?.url} className="w-12 h-12 rounded-xl object-cover shadow-md" />
                        <div className="flex flex-col flex-1 overflow-hidden">
                          <span className="text-white text-sm font-semibold truncate group-hover:text-purple-400 transition-colors">{track.snippet.title}</span>
                          <span className="text-zinc-400 text-xs truncate mt-0.5">{track.snippet.channelTitle}</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); moveTrackToNext(trackId); }}
                          className="p-2 text-zinc-400 hover:text-white hover:bg-black/40 rounded-full transition-all active:scale-95"
                          title="Play Next"
                        >
                          <ListPlus className="w-5 h-5" />
                        </button>
                      </div>
                    );
                 })}
                 {upcomingTracks.length === 0 && <p className="text-zinc-600 text-sm italic px-2 py-4 text-center">End of queue.</p>}
               </div>
            </div>
            
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="minimized"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.7 }}
          onDragEnd={(e, info) => {
            if (info.offset.y > 60 || info.velocity.y > 300) {
              clearTrack();
              setIsExpanded(false);
            }
          }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-[#18181b] p-3 md:p-4 rounded-none shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col gap-4 border-t border-white/5 overflow-hidden cursor-pointer active:cursor-grabbing"
          onClick={(e) => {
             // Only expand if clicking the bar itself, not the buttons
             if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
             setIsExpanded(true);
          }}
        >
          {/* Thin Progress Bar overlaying the top of the action sheet */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/5">
            <div className="h-full bg-purple-500 transition-all duration-1000 ease-linear" style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }} />
          </div>

          <div className="flex items-center justify-between max-w-7xl mx-auto w-full gap-4 relative z-10">
            <div className="flex items-center gap-4 flex-1 overflow-hidden">
              <img 
                src={currentTrack.snippet.thumbnails.medium?.url} 
                alt="cover" 
                className="w-12 h-12 md:w-14 md:h-14 rounded-md object-cover shadow-md shadow-black/50"
              />
              <div className="flex flex-col truncate">
                <span className="text-white font-semibold truncate text-sm md:text-base pr-2">
                  {currentTrack.snippet.title}
                </span>
                <span className="text-zinc-400 text-xs md:text-sm truncate pr-2">
                  {currentTrack.snippet.channelTitle}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); playPrevious(); }} 
                className="p-1 sm:p-2 text-zinc-300 hover:text-white transition-colors active:scale-95"
              >
                <SkipBack className="w-5 h-5 md:w-6 md:h-6 fill-current" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                className="p-1 sm:p-2 bg-transparent text-white rounded-full hover:scale-105 active:scale-95 transition-transform"
              >
                {isPlaying ? <Pause className="w-7 h-7 md:w-8 md:h-8 fill-current" /> : <Play className="w-7 h-7 md:w-8 md:h-8 fill-current ml-0.5" />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); playNext(); }} 
                className="p-2 text-zinc-300 hover:text-white transition-colors active:scale-95"
              >
                <SkipForward className="w-5 h-5 md:w-6 md:h-6 fill-current" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); clearTrack(); }} 
                className="p-2 ml-1 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95"
                title="Dismiss Player"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    {showPlaylistModal && (
        <AddToPlaylistModal 
          track={currentTrack} 
          onClose={() => setShowPlaylistModal(false)} 
        />
      )}
  </>
);
}
