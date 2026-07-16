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

  // ---- playback surface ----

  /**
   * Ambient beds and voice logs need real recorded audio, which doesn't
   * exist yet (production hasn't started — GDD §16/§17); those stay
   * stubs. UI sfx is different: a handful of short synthesized tones (no
   * asset files) is enough to make the interface feel responsive, so
   * playSfx() below is real. Swapping these for recorded one-shots later
   * is a body-swap inside #playCue(), not a call-site change.
   */

  /** @param {string} roomId @param {{base?:string, tension?:string, discovery?:string, memoryLayer?:string}} stems */
  playAmbient(roomId, stems) {
    console.info(`[AudioManager] playAmbient("${roomId}") — no audio assets loaded yet.`, stems);
  }

  /** GDD §12.10 — reacts to idle/solve/layer-toggle state; wired by RoomSystem/PuzzleEngine in M2+. */
  setRoomState(roomId, stateFlags) {
    this.#eventBus.emit(EVENTS.AUDIO_ROOM_STATE_CHANGED, { roomId, stateFlags });
  }

  /**
   * Short synthesized UI feedback tones — no asset files required.
   * @param {'click'|'deny'|'success'|'achievement'|'pickup'|'door'|'layer'} sfxId
   */
  playSfx(sfxId) {
    if (!this.#context) return; // not unlocked yet (no user gesture received)
    const now = this.#context.currentTime;
    switch (sfxId) {
      case 'click':
        this.#tone({ freq: 640, start: now, duration: 0.05, type: 'triangle', peak: 0.18 });
        break;
      case 'deny':
        this.#tone({ freq: 150, start: now, duration: 0.16, type: 'square', peak: 0.14 });
        this.#tone({ freq: 110, start: now + 0.06, duration: 0.16, type: 'square', peak: 0.1 });
        break;
      case 'success':
        this.#tone({ freq: 523, start: now, duration: 0.13, type: 'sine', peak: 0.2 });
        this.#tone({ freq: 784, start: now + 0.1, duration: 0.18, type: 'sine', peak: 0.2 });
        break;
      case 'achievement':
        this.#tone({ freq: 523, start: now, duration: 0.12, type: 'triangle', peak: 0.16 });
        this.#tone({ freq: 659, start: now + 0.09, duration: 0.12, type: 'triangle', peak: 0.16 });
        this.#tone({ freq: 880, start: now + 0.18, duration: 0.22, type: 'triangle', peak: 0.18 });
        break;
      case 'pickup':
        this.#sweep({ from: 420, to: 720, start: now, duration: 0.14, type: 'sine', peak: 0.16 });
        break;
      case 'door':
        this.#tone({ freq: 90, start: now, duration: 0.28, type: 'triangle', peak: 0.22 });
        break;
      case 'layer':
        this.#sweep({ from: 300, to: 500, start: now, duration: 0.22, type: 'sine', peak: 0.12 });
        break;
      default:
        console.warn(`[AudioManager] unknown sfx id "${sfxId}"`);
    }
  }

  /** A single tone with a short attack/decay envelope, routed through the sfx bus. */
  #tone({ freq, start, duration, type = 'sine', peak = 0.2 }) {
    const osc = this.#context.createOscillator();
    const gain = this.#context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain);
    gain.connect(this.#buses.audioSfx ?? this.#masterGain);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  /** A pitch-swept tone (rising/falling), used for pickups and the layer toggle. */
  #sweep({ from, to, start, duration, type = 'sine', peak = 0.2 }) {
    const osc = this.#context.createOscillator();
    const gain = this.#context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, start);
    osc.frequency.linearRampToValueAtTime(to, start + duration);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain);
    gain.connect(this.#buses.audioSfx ?? this.#masterGain);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  playVoice(logId) {
    console.info(`[AudioManager] playVoice("${logId}") — no audio assets loaded yet.`);
  }

  stopAll() {
    // No-op until real ambient/voice sources exist to stop.
  }
}
