/**
 * playerBridge.ts
 * 
 * A singleton that holds a direct reference to the YouTube player API.
 * This lets any component (MobileBottomSheet, notification handlers, etc.)
 * call .playVideo() / .pauseVideo() directly without going through React's
 * render cycle — which is the only reliable way to control playback after
 * the OS has suspended the iframe in the background.
 */

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  loadVideoById: (videoId: string) => void;
  setVolume: (volume: number) => void;
  setPlaybackQuality: (quality: string) => void;
  getCurrentTime: () => Promise<number>;
  getDuration: () => Promise<number>;
  stopVideo: () => void;
};

let _player: YTPlayer | null = null;

export const playerBridge = {
  setPlayer(player: YTPlayer | null) {
    _player = player;
  },
  play() {
    _player?.playVideo();
  },
  pause() {
    _player?.pauseVideo();
  },
  seek(time: number) {
    _player?.seekTo(time, true);
  },
  load(videoId: string) {
    _player?.loadVideoById(videoId);
  },
  hasPlayer() {
    return _player !== null;
  },
};
