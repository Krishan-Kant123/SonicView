"use client";

import { useEffect, useRef, useState } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import { usePlayerStore } from '@/store/player.store';
import { getRelatedTracks } from '@/services/youtube.service';
import { toast } from 'sonner';
import { playerBridge } from '@/lib/playerBridge';

export function HeadlessYouTubePlayer() {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playNext = usePlayerStore((state) => state.playNext);
  const playPrevious = usePlayerStore((state) => state.playPrevious);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const appendQueue = usePlayerStore((state) => state.appendQueue);
  const volume = usePlayerStore((state) => state.volume);
  const setProgress = usePlayerStore((state) => state.setProgress);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const seekTo = usePlayerStore((state) => state.seekTo);
  const clearSeek = usePlayerStore((state) => state.clearSeek);
  const quality = usePlayerStore((state) => state.quality);

  const playerRef = useRef<YouTubePlayer>(null);
  const silentAudioRef = useRef<HTMLAudioElement>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  // Sync with playerBridge
  useEffect(() => {
    if (playerRef.current) {
      playerBridge.setPlayer(playerRef.current);
    }
  }, [playerRef.current]);

  // FIX 1: When a new track loads, use loadVideoById directly so the player
  // never unloads between songs. This avoids the "re-init of the iframe" problem.
  const prevTrackIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!currentTrack) {
      if (playerRef.current) playerRef.current.stopVideo();
      return;
    }

    const newId = typeof currentTrack.id === 'string' ? currentTrack.id : currentTrack.id.videoId;

    if (!activeVideoId) {
      // First ever load — just set activeVideoId to mount the component
      setActiveVideoId(newId);
    } else if (newId !== prevTrackIdRef.current) {
      // Subsequent track changes: command the existing player directly.
      // This keeps the audio session alive (no iframe teardown), fixing background autoplay.
      if (playerRef.current) {
        playerRef.current.loadVideoById(newId);
      } else {
        setActiveVideoId(newId);
      }
    }

    prevTrackIdRef.current = newId;
  }, [currentTrack]); // eslint-disable-line

  // FIX 2: React to isPlaying changes from the store (Webapp play/pause fix)
  useEffect(() => {
    if (playerRef.current) {
      const state = playerRef.current.getPlayerState();
      if (isPlaying) {
        if (state !== YouTube.PlayerState.PLAYING && state !== YouTube.PlayerState.BUFFERING) {
          playerRef.current.playVideo();
        }
      } else {
        if (state === YouTube.PlayerState.PLAYING || state === YouTube.PlayerState.BUFFERING) {
          playerRef.current.pauseVideo();
        }
      }
    }
    
    // Also sync the silent keep-alive
    if (silentAudioRef.current) {
      if (isPlaying) {
        silentAudioRef.current.play().catch(() => {/* user hasn't interacted yet */});
      } else {
        silentAudioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // FIX 3: Handle visibilitychange — when the app comes back from background,
  // force-resume if we were supposed to be playing.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const state = usePlayerStore.getState();
        if (state.isPlaying && playerRef.current) {
          // Give the browser 200ms to unfreeze, then resume
          setTimeout(() => {
            playerRef.current?.playVideo();
            silentAudioRef.current?.play().catch(() => {});
          }, 200);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Smart Queue Generation
  useEffect(() => {
    if (currentTrack) {
      getRelatedTracks(currentTrack.snippet.channelTitle).then(response => {
        if (response.items && response.items.length > 0) appendQueue(response.items);
      }).catch(err => {
        console.error("Silenced related queue error:", err);
        toast.error("Failed to build Up Next queue.", { description: "You might be hitting active rate limits!" });
      });
    }
  }, [currentTrack, appendQueue]);

  useEffect(() => {
    if (playerRef.current) playerRef.current.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    if (seekTo !== null && playerRef.current) {
      playerRef.current.seekTo(seekTo, true);
      clearSeek();
    }
  }, [seekTo, clearSeek]);

  useEffect(() => {
    if (playerRef.current) {
      try {
        playerRef.current.setPlaybackQuality(quality === 'auto' ? 'default' : quality);
      } catch (e) { /* noop */ }
    }
  }, [quality, currentTrack]);

  // Progress polling + Media Session Position State (Spotify-style notification scrubber)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(async () => {
        if (!playerRef.current) return;
        try {
          const currentTime = await playerRef.current.getCurrentTime();
          const duration = await playerRef.current.getDuration();
          if (currentTime != null) setProgress(currentTime);
          if (duration != null) setDuration(duration);

          // Update the notification bar scrubber
          if ('mediaSession' in navigator && duration > 0) {
            try {
              navigator.mediaSession.setPositionState({
                duration,
                playbackRate: 1,
                position: currentTime,
              });
            } catch (_) { /* some browsers don't support this yet */ }
          }
        } catch (e) {
          // Player might be destroyed or inaccessible
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, setProgress, setDuration]);

  // Media Session metadata + controls
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.snippet.title,
      artist: currentTrack.snippet.channelTitle,
      album: 'SonicView',
      artwork: [
        { src: currentTrack.snippet.thumbnails.medium?.url || '', sizes: '320x180', type: 'image/jpeg' },
        { src: currentTrack.snippet.thumbnails.high?.url || '', sizes: '480x360', type: 'image/jpeg' },
      ],
    });

    // Play/pause handlers call the actual player API directly
    navigator.mediaSession.setActionHandler('play', () => {
      playerBridge.play();
      setIsPlaying(true);
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      playerBridge.pause();
      setIsPlaying(false);
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      usePlayerStore.getState().playPrevious();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      usePlayerStore.getState().playNext();
    });
    // Seek support for the notification scrubber
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime != null && playerRef.current) {
        playerBridge.seek(details.seekTime);
        setProgress(details.seekTime);
      }
    });

    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('seekto', null);
      }
    };
  }, [currentTrack, setIsPlaying, setProgress]);

  const onReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    playerBridge.setPlayer(event.target);
    playerRef.current.setVolume(volume);
    try {
      playerRef.current.setPlaybackQuality(quality === 'auto' ? 'default' : quality);
    } catch (_) { /* noop */ }
    if (isPlaying) playerRef.current.playVideo();
  };

  const onStateChange = (event: YouTubeEvent) => {
    if (event.data === YouTube.PlayerState.PLAYING) {
      if (!isPlaying) setIsPlaying(true);
      silentAudioRef.current?.play().catch(() => {});
    } else if (event.data === YouTube.PlayerState.PAUSED) {
      // Sync store even in background so notification bar doesn't get stuck in "Playing" state
      if (isPlaying) setIsPlaying(false);
      silentAudioRef.current?.pause();
    } else if (event.data === YouTube.PlayerState.ENDED) {
      const { loop } = usePlayerStore.getState();
      if (loop) {
        playerBridge.seek(0);
        playerBridge.play();
        setProgress(0);
      } else {
        playNext();
      }
    }
  };

  if (!activeVideoId) return null;

  const opts = {
    height: '1',
    width: '1',
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      rel: 0,
      iv_load_policy: 3,
      playsinline: 1,
    },
  };

  return (
    <div className="fixed bottom-0 right-0 pointer-events-none z-[-1]" style={{ width: 1, height: 1, overflow: 'hidden' }}>
      <YouTube
        videoId={activeVideoId}
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
        onError={(e) => {
          console.error("YouTube Error:", e);
          const errorType = e.data === 150 ? "Video embedded blocked." : e.data === 101 ? "Video DRM protected." : "Track unplayable on this network.";
          toast.error(errorType, { description: "Auto-skipping to the next track!" });
          playNext();
        }}
      />
      <audio
        ref={silentAudioRef}
        src="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"
        loop
        playsInline
      />
    </div>
  );
}
