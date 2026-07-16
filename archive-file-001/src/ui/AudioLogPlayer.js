/**
 * AudioLogPlayer.js — SCAFFOLDING, filled in at Milestone 2 (GDD §5, §17).
 * Diegetic tape/reel UI with a physical-style scrub bar; ducks the ambient
 * bed to -18dB while playing (coordinates with AudioManager.setRoomState).
 */
export class AudioLogPlayer {
  constructor(eventBus, audioManager) {
    this.eventBus = eventBus;
    this.audioManager = audioManager;
  }

  /** @param {string} logId */
  play(logId) {
    console.warn(`[AudioLogPlayer] play("${logId}") — no audio log content yet (Milestone 2+).`);
  }
}
