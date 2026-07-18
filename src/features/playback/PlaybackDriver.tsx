import { useEffect } from 'react';
import { startPlaybackEngine, stopPlaybackEngine } from './engine';

/** Mounts the global animation-frame loop that advances the timeline and computes active-event progress. */
export function PlaybackDriver() {
  useEffect(() => {
    startPlaybackEngine();
    return () => stopPlaybackEngine();
  }, []);
  return null;
}
