"use client";

import { useState, useMemo } from 'react';
import { usePlayerStore } from '@/store/player.store';
import {
  Play, Pause, SkipForward, SkipBack, Repeat, Shuffle as ShuffleIcon,
  ChevronDown, PlusSquare, X, Heart, ListMusic, Radio, Share2, ArrowUpToLine
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AddToPlaylistModal } from '@/components/Playlists/AddToPlaylistModal';
import { playerBridge } from '@/lib/playerBridge';

export function MobileBottomSheet() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [liked, setLiked] = useState(false);

  const currentTrack  = usePlayerStore((s) => s.currentTrack);
  const isPlaying     = usePlayerStore((s) => s.isPlaying);
  const setIsPlaying  = usePlayerStore((s) => s.setIsPlaying);
  const playNext      = usePlayerStore((s) => s.playNext);
  const playPrevious  = usePlayerStore((s) => s.playPrevious);
  const toggleLoop    = usePlayerStore((s) => s.toggleLoop);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const isLoop        = usePlayerStore((s) => s.loop);
  const isShuffle     = usePlayerStore((s) => s.shuffle);
  const progress      = usePlayerStore((s) => s.progress);
  const duration      = usePlayerStore((s) => s.duration);
  const triggerSeek   = usePlayerStore((s) => s.triggerSeek);
  const queue         = usePlayerStore((s) => s.queue);
  const setQueue      = usePlayerStore((s) => s.setQueue);
  const clearTrack    = usePlayerStore((s) => s.clearTrack);
  const moveTrackToNext = usePlayerStore((s) => s.moveTrackToNext);

  /* ── Visualizer Configuration ── */
  const NUM_BARS = 64;
  const visualizerBars = useMemo(() => {
    return Array.from({ length: NUM_BARS }).map((_, i) => ({
      angle: (360 / NUM_BARS) * i,
      duration: 0.4 + Math.random() * 0.8,
      delay: -(Math.random() * 2),
      // Give some natural variation to base height
      baseScale: 0.5 + Math.random() * 0.5
    }));
  }, []);

  if (!currentTrack) return null;

  const fmt = (t: number) => {
    if (!t || isNaN(t)) return '0:00';
    return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  };

  const thumb = currentTrack.snippet.thumbnails.high?.url || currentTrack.snippet.thumbnails.medium?.url;
  const mini  = currentTrack.snippet.thumbnails.medium?.url || thumb;
  const progPct = duration > 0 ? (progress / duration) * 100 : 0;

  const togglePlay = () => {
    if (isPlaying) { playerBridge.pause(); setIsPlaying(false); }
    else           { playerBridge.play();  setIsPlaying(true);  }
  };

  /* ── Play/Pause button — the signature green circle ── */
  const PlayBtn = ({ size = 64 }: { size?: number }) => (
    <button
      onClick={togglePlay}
      className="flex items-center justify-center rounded-full transition-transform active:scale-90 hover:scale-105"
      style={{
        width: size, height: size,
        background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
        boxShadow: '0 0 30px rgba(0,252,67,0.45)',
        color: 'var(--on-primary)',
      }}
    >
      {isPlaying
        ? <Pause  className="fill-current" style={{ width: size * 0.38, height: size * 0.38 }} />
        : <Play   className="fill-current ml-1" style={{ width: size * 0.38, height: size * 0.38 }} />
      }
    </button>
  );

  return (
    <>
      <AnimatePresence mode="wait">
        {isExpanded ? (
          /* ══════════════════ EXPANDED FULL-SCREEN PLAYER ══════════════════ */
          <motion.div
            key="expanded"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 34 }}
            className="fixed inset-0 z-50 overflow-y-auto"
            style={{ background: 'linear-gradient(180deg, #111a12 0%, var(--background) 100%)' }}
          >
            <div className="w-full max-w-md mx-auto flex flex-col min-h-screen px-6 pt-5 pb-8 ">

              {/* Top bar */}
              <div className="flex justify-between items-center mb-6 shrink-0">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full"
                  style={{ background: 'var(--surface-container-high)' }}
                >
                  <ChevronDown className="w-5 h-5" style={{ color: 'var(--on-surface-variant)' }} />
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-black uppercase tracking-[0.22em]"
                        style={{ color: 'var(--on-surface-variant)' }}>
                    Playing from Queue
                  </span>
                  <span className="text-sm font-bold mt-0.5 line-clamp-1 max-w-[160px] text-center"
                        style={{ color: 'var(--on-surface)' }}>
                    {queue.length > 0 ? 'Current Queue' : 'SonicView'}
                  </span>
                </div>
                <button className="w-9 h-9 flex items-center justify-center rounded-full"
                        style={{ background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)' }}>
                  <span className="text-lg leading-none">⋮</span>
                </button>
              </div>

              {/* Album art */}
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto shrink-0 mb-14 mt-10"
                   style={{ }}>
                {/* Ambient glow ring */}
                <div className="absolute inset-0 rounded-full blur-3xl transition-opacity duration-1000"
                     style={{
                       background: 'radial-gradient(circle, rgba(0,252,67,0.2) 0%, transparent 70%)',
                       opacity: isPlaying ? 1 : 0.4
                     }} />

                {/* Audio Visualizer Radial Bars */}
                {isPlaying && (
                  <div className="absolute inset-0 pointer-events-none z-0">
                    <style>{`
                      @keyframes visualizer-bounce {
                        0% { transform: scaleY(calc(0.2 * var(--base-scale))); opacity: 0.3; }
                        50% { transform: scaleY(calc(1 * var(--base-scale))); opacity: 0.7; }
                        100% { transform: scaleY(calc(1.8 * var(--base-scale))); opacity: 1; filter: brightness(1.5); }
                      }
                    `}</style>
                    {visualizerBars.map((bar, i) => (
                      <div
                        key={i}
                        className="absolute left-1/2 top-1/2"
                        // W-56 = 224px. Radius = 112px. We push bars out by 125px so they frame the vinyl.
                        // On SM screens, W-64 = 256px. Radius = 128px. We push out by 140px.
                        style={{
                          transform: `translate(-50%, -50%) rotate(${bar.angle}deg) translateY(-135px)`,
                        }}
                      >
                        <div
                          className="w-1 sm:w-[6px] rounded-full"
                          style={{
                            background: 'linear-gradient(to top, var(--primary), #a3ffa3)',
                            height: '24px',
                            transformOrigin: 'bottom',
                            animation: `visualizer-bounce ${bar.duration}s infinite alternate ease-in-out`,
                            animationDelay: `${bar.delay}s`,
                            '--base-scale': bar.baseScale,
                            boxShadow: '0 0 10px rgba(0,252,67,0.3)'
                          } as React.CSSProperties}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <img
                  src={thumb}
                  alt="cover"
                  className="w-full h-full object-cover rounded-full border-[6px] relative z-10"
                  style={{
                    borderColor: 'var(--background)',
                    boxShadow: '0 0 50px rgba(0,0,0,0.9)',
                    animationName: 'spin-record',
                    animationDuration: '20s',
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                    animationPlayState: isPlaying ? 'running' : 'paused',
                  }}
                />
                {/* Center hole */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full z-20"
                     style={{ background: 'var(--background)', border: '2px solid var(--surface-container-high)' }} />
              </div>

              {/* Track info + actions */}
              <div className="flex items-center gap-3 mb-5 shrink-0">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-black line-clamp-1" style={{ color: 'var(--on-surface)' }}>
                    {currentTrack.snippet.title}
                  </h2>
                  <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--primary)' }}>
                    {currentTrack.snippet.channelTitle}
                  </p>
                </div>
                <button
                  onClick={() => setLiked(!liked)}
                  className="w-10 h-10 flex items-center justify-center rounded-full transition-all"
                  style={{ color: liked ? 'var(--primary)' : 'rgba(255,255,255,0.3)' }}
                >
                  <Heart className="w-6 h-6" style={{ fill: liked ? 'var(--primary)' : 'none' }} />
                </button>
                <button
                  onClick={() => setShowPlaylistModal(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-full transition-all"
                  style={{ background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)' }}
                >
                  <PlusSquare className="w-5 h-5" />
                </button>
              </div>

              {/* Progress */}
              <div className="w-full mb-5 shrink-0">
                <div className="relative w-full h-1.5 rounded-full overflow-hidden cursor-pointer"
                     style={{ background: 'rgba(53,52,52,0.6)' }}>
                  <div className="absolute top-0 left-0 h-full rounded-full"
                       style={{
                         width: `${progPct}%`,
                         background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                       }} />
                  <input
                    type="range" min={0} max={duration || 100} value={progress}
                    onChange={(e) => triggerSeek(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {/* Playhead */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full z-10"
                       style={{
                         left: `calc(${progPct}% - 7px)`,
                         background: 'var(--on-surface)',
                         boxShadow: '0 0 8px rgba(0,252,67,0.6)',
                       }} />
                </div>
                <div className="flex justify-between mt-2 text-[11px] font-mono"
                     style={{ color: 'var(--on-surface-variant)' }}>
                  <span>{fmt(progress)}</span>
                  <span>{fmt(duration)}</span>
                </div>
              </div>

              {/* Controls pill */}
              <div className="flex items-center justify-between shrink-0 rounded-2xl px-2 py-3 mb-6"
                   style={{ background: 'var(--surface-container)' }}>
                <button onClick={toggleShuffle} className="p-2 rounded-full transition-colors"
                        style={{ color: isShuffle ? 'var(--primary)' : 'rgba(255,255,255,0.3)' }}>
                  <ShuffleIcon className="w-5 h-5" style={{ filter: isShuffle ? 'drop-shadow(0 0 5px rgba(0,252,67,0.7))' : 'none' }} />
                </button>
                <button onClick={playPrevious} className="p-2 transition-colors active:scale-90"
                        style={{ color: 'var(--on-surface)' }}>
                  <SkipBack className="w-8 h-8 fill-current" />
                </button>
                <PlayBtn size={64} />
                <button onClick={playNext} className="p-2 transition-colors active:scale-90"
                        style={{ color: 'var(--on-surface)' }}>
                  <SkipForward className="w-8 h-8 fill-current" />
                </button>
                <button onClick={toggleLoop} className="p-2 rounded-full transition-colors"
                        style={{ color: isLoop ? 'var(--primary)' : 'rgba(255,255,255,0.3)' }}>
                  <Repeat className="w-5 h-5" style={{ filter: isLoop ? 'drop-shadow(0 0 5px rgba(0,252,67,0.7))' : 'none' }} />
                </button>
              </div>

              <div className="flex items-center justify-around shrink-0 mb-8" style={{ marginTop: 'auto' }}>
                {[
                  { icon: <Radio className="w-5 h-5" />,     label: 'Devices', onClick: () => {} },
                  { icon: <ListMusic className="w-5 h-5" />, label: 'Up Next', onClick: () => document.getElementById('up-next-section')?.scrollIntoView({ behavior: 'smooth' }) },
                  { icon: <Share2 className="w-5 h-5" />,    label: 'Share',   onClick: () => {} },
                ].map(({ icon, label, onClick }) => (
                  <button key={label} onClick={onClick}
                          className="flex flex-col items-center gap-1 p-2 transition-colors hover:opacity-80"
                          style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {icon}
                    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
                  </button>
                ))}
              </div>

              {/* Swipe hint */}
              <div className="flex flex-col items-center gap-2 shrink-0 mb-8 opacity-50">
                <div className="w-10 h-1 rounded-full" style={{ background: 'var(--surface-container-high)' }} />
                <span className="text-[9px] font-black uppercase tracking-[0.25em]"
                      style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Swipe down to minimize
                </span>
              </div>

              {/* Up Next List */}
              {queue.length > 0 && (
                <div className="mt-4 shrink-0 pb-12" id="up-next-section">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--on-surface-variant)' }}>
                      Up Next in Queue
                    </h3>
                    <button onClick={() => toggleShuffle()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors"
                            style={{ background: 'rgba(255,255,255,0.05)', color: isShuffle ? 'var(--primary)' : 'var(--on-surface-variant)' }}>
                      <ShuffleIcon className="w-3.5 h-3.5" /> {isShuffle ? 'Shuffled' : 'Shuffle'}
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {queue.slice(Math.max(0, queue.findIndex(t => (typeof t.id === 'string' ? t.id : t.id.videoId) === (typeof currentTrack.id === 'string' ? currentTrack.id : currentTrack.id.videoId)) + 1)).map((track, i) => {
                      const trackId = typeof track.id === 'string' ? track.id : track.id.videoId;
                      return (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer group transition-all"
                             style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}
                             onClick={() => { playerBridge.play(); usePlayerStore.getState().playTrack(track); }}>
                          <img src={track.snippet.thumbnails.default?.url} alt="thumb" className="w-12 h-12 rounded-lg object-cover relative z-10 shadow-md" />
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="text-sm font-bold truncate group-hover:text-primary transition-colors" style={{ color: 'var(--on-surface)' }}>{track.snippet.title}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--on-surface-variant)' }}>{track.snippet.channelTitle}</p>
                          </div>
                          
                          {/* Queue Controls */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button 
                              onClick={(e) => { e.stopPropagation(); moveTrackToNext(trackId); }}
                              className="p-2 lg:opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-white/10"
                              style={{ color: 'var(--on-surface-variant)' }}
                              title="Play Next"
                            >
                              <ArrowUpToLine className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setQueue(queue.filter(t => (typeof t.id === 'string' ? t.id : t.id.videoId) !== trackId));
                              }}
                              className="p-2 lg:opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-500/20 hover:text-red-400"
                              style={{ color: 'var(--on-surface-variant)' }}
                              title="Remove from queue"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                    {queue.length === 1 || queue.findIndex(t => (typeof t.id === 'string' ? t.id : t.id.videoId) === (typeof currentTrack.id === 'string' ? currentTrack.id : currentTrack.id.videoId)) === queue.length - 1 ? (
                      <p className="text-xs mt-4 italic text-center" style={{ color: 'var(--on-surface-variant)' }}>End of queue.</p>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* ══════════════════ MINI BAR ══════════════════════════════════════ */
          <motion.div
            key="mini"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 34 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 60 || info.velocity.y > 350) clearTrack();
            }}
            className="fixed bottom-[60px] left-2 right-2 z-40 mb-2 rounded-2xl overflow-hidden cursor-pointer active:cursor-grabbing"
            style={{
              background: 'var(--surface-container)',
              border: '1px solid rgba(0,252,67,0.12)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
            }}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
              setIsExpanded(true);
            }}
          >
            {/* Green progress bar at top */}
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'var(--surface-container-high)' }}>
              <div className="h-full rounded-full transition-all duration-1000 ease-linear"
                   style={{ width: `${progPct}%`, background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }} />
            </div>

            <div className="flex items-center gap-3 px-3 py-2.5">
              <img src={mini} alt="cover" className="w-11 h-11 rounded-xl object-cover shrink-0"
                   style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }} />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-sm truncate block" style={{ color: 'var(--on-surface)' }}>
                  {currentTrack.snippet.title}
                </span>
                <span className="text-xs truncate block" style={{ color: 'var(--primary)' }}>
                  {currentTrack.snippet.channelTitle}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={(e) => { e.stopPropagation(); playPrevious(); }}
                        className="p-1.5 transition-colors" style={{ color: 'var(--on-surface-variant)' }}>
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>
                <PlayBtn size={40} />
                <button onClick={(e) => { e.stopPropagation(); playNext(); }}
                        className="p-1.5 transition-colors" style={{ color: 'var(--on-surface-variant)' }}>
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); clearTrack(); }}
                        className="p-1.5 ml-1 rounded-full transition-all"
                        style={{ color: 'rgba(255,255,255,0.25)' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showPlaylistModal && (
        <AddToPlaylistModal track={currentTrack} onClose={() => setShowPlaylistModal(false)} />
      )}
    </>
  );
}
