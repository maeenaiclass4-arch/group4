import { EVENTS } from './Config.js';

/**
 * AudioManager.js
 * Owns the Web Audio graph: one master gain feeding destination, with
 * music/sfx/voice sub-buses feeding master. Settings sliders control the
 * sub-bus gains directly, so mixing math never has to live in UI code.
 *
 * No audio assets exist yet (production hasn't started — GDD §16/§17), so
 * playback methods are intentionally stubs that log rather than throw:
 * this lets M2+ systems (RoomSystem, TerminalSystem, CinematicSystem) call
 * `audioManager.playAmbient(...)` today and get real playback the moment
 * asset paths are wired in, with no call-site changes.
 *
 * The dynamic, state-reactive ambient mix described in GDD §12.10
 * (base/tension/discovery/memory-layer stems per room) is exposed here as
 * `setRoomState()` so RoomSystem/PuzzleEngine can call it as soon as they
 * exist, without AudioManager's public surface changing later.
 */
export class AudioManager {
  #eventBus;
  #context = null;
  #masterGain = null;
  #buses = {}; // channel -> GainNode
  #volumes = { audioMaster: 0.8, audioMusic: 0.8, audioSfx: 0.9, audioVoice: 1.0 };
  #unlocked = false;

  // Instance-field arrow functions: auto-bound to `this`, and — unlike a
  // private *method* — assignable, so they can be added/removed as the
  // same reference via addEventListener/removeEventListener.
  #onVisibilityChange = () => {
    if (!this.#context) return;
    if (document.hidden) {
      this.#context.suspend();
    } else {
      this.#context.resume();
    }
  };

  /** @param {import('./EventBus.js').EventBus} eventBus */
  constructor(eventBus) {
    this.#eventBus = eventBus;
  }

  /**
   * Browsers block audio until a user gesture. Call this from the first
   * pointerdown/keydown the app receives (main.js wires it to InputManager).
   */
  unlock() {
    if (this.#unlocked) return;
    const AudioContextCtor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextCtor) {
      console.warn('[AudioManager] Web Audio API unavailable in this browser.');
      return;
    }
    this.#context = new AudioContextCtor();
    this.#masterGain = this.#context.createGain();
    this.#masterGain.connect(this.#context.destination);

    for (const channel of ['audioMusic', 'audioSfx', 'audioVoice']) {
      const bus = this.#context.createGain();
      bus.connect(this.#masterGain);
      this.#buses[channel] = bus;
    }

    this.applyVolumes(this.#volumes);
    document.addEventListener('visibilitychange', this.#onVisibilityChange);
    this.#unlocked = true;
  }

  /**
   * Applies a full settings volume snapshot ({ audioMaster, audioMusic, audioSfx, audioVoice }).
   * Called on boot with saved settings and whenever a slider moves.
   */
  applyVolumes(volumes) {
    this.#volumes = { ...this.#volumes, ...volumes };
    if (!this.#context) return; // not unlocked yet; values are retained for when it is

    this.#masterGain.gain.setValueAtTime(this.#volumes.audioMaster, this.#context.currentTime);
    this.#buses.audioMusic?.gain.setValueAtTime(this.#volumes.audioMusic, this.#context.currentTime);
    this.#buses.audioSfx?.gain.setValueAtTime(this.#volumes.audioSfx, this.#context.currentTime);
    this.#buses.audioVoice?.gain.setValueAtTime(this.#volumes.audioVoice, this.#context.currentTime);

    this.#eventBus.emit(EVENTS.AUDIO_VOLUME_CHANGED, { ...this.#volumes });
  }

  setChannelVolume(channel, value) {
    this.applyVolumes({ [channel]: value });
  }

  // ---- playback surface (stubs until §16 audio assets exist) ----

  /** @param {string} roomId @param {{base?:string, tension?:string, discovery?:string, memoryLayer?:string}} stems */
  playAmbient(roomId, stems) {
    console.info(`[AudioManager] playAmbient("${roomId}") — no audio assets loaded yet.`, stems);
  }

  /** GDD §12.10 — reacts to idle/solve/layer-toggle state; wired by RoomSystem/PuzzleEngine in M2+. */
  setRoomState(roomId, stateFlags) {
    this.#eventBus.emit(EVENTS.AUDIO_ROOM_STATE_CHANGED, { roomId, stateFlags });
  }

  playSfx(sfxId) {
    console.info(`[AudioManager] playSfx("${sfxId}") — no audio assets loaded yet.`);
  }

  playVoice(logId) {
    console.info(`[AudioManager] playVoice("${logId}") — no audio assets loaded yet.`);
  }

  stopAll() {
    // No-op until real sources exist to stop.
  }
}
