/**
 * Synthesized, asset-free audio (GDD §13): a low ambient building tone that
 * never resolves into music, footstep ticks paced by the player controller,
 * short mechanism sounds for puzzle payoffs, sparse random creaks for a
 * lived-in feel, and a zone-aware ambient tone (the Rotunda reads bigger
 * and more open than the Registry Wing's tighter corridor/room). No
 * positional audio nodes are needed yet at this scale — added when Case
 * 002's sound-based puzzle requires it.
 */

const ZONE_PRESETS = {
  hall: { filterFreq: 190, humFreq: 54, filterQ: 0.6 },
  room: { filterFreq: 420, humFreq: 74, filterQ: 1.1 },
};

export class AudioManager {
  #ctx = null;
  #master = null;
  #ambientGain = null;
  #ambientFilter = null;
  #hum = null;
  #unlocked = false;
  #zone = 'hall';
  #creakTimer = null;

  unlock() {
    if (this.#unlocked) return;
    this.#unlocked = true;
    this.#ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.#master = this.#ctx.createGain();
    this.#master.gain.value = 0.55;
    this.#master.connect(this.#ctx.destination);
    this.#startAmbient();
    this.#scheduleCreak();
  }

  #startAmbient() {
    const ctx = this.#ctx;
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const preset = ZONE_PRESETS[this.#zone];
    this.#ambientFilter = ctx.createBiquadFilter();
    this.#ambientFilter.type = 'lowpass';
    this.#ambientFilter.frequency.value = preset.filterFreq;
    this.#ambientFilter.Q.value = preset.filterQ;

    this.#ambientGain = ctx.createGain();
    this.#ambientGain.gain.value = 0.05;

    this.#hum = ctx.createOscillator();
    this.#hum.type = 'sine';
    this.#hum.frequency.value = preset.humFreq;
    const humGain = ctx.createGain();
    humGain.gain.value = 0.02;

    noise.connect(this.#ambientFilter).connect(this.#ambientGain).connect(this.#master);
    this.#hum.connect(humGain).connect(this.#master);

    noise.start();
    this.#hum.start();
  }

  /** Called as the player crosses from the Rotunda into the Registry Wing and back. */
  setZone(zone) {
    if (zone === this.#zone || !ZONE_PRESETS[zone]) return;
    this.#zone = zone;
    if (!this.#ctx || !this.#ambientFilter || !this.#hum) return;
    const preset = ZONE_PRESETS[zone];
    const t = this.#ctx.currentTime;
    this.#ambientFilter.frequency.setTargetAtTime(preset.filterFreq, t, 1.4);
    this.#ambientFilter.Q.setTargetAtTime(preset.filterQ, t, 1.4);
    this.#hum.frequency.setTargetAtTime(preset.humFreq, t, 1.4);
  }

  #blip({ freq = 440, duration = 0.08, type = 'sine', gain = 0.15, sweep = null }) {
    if (!this.#ctx) return;
    const ctx = this.#ctx;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (sweep) osc.frequency.exponentialRampToValueAtTime(sweep, ctx.currentTime + duration);

    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(g).connect(this.#master);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.02);
  }

  footstep() {
    if (!this.#ctx) return;
    const ctx = this.#ctx;
    const bufferSize = 0.05 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    // Marble Rotunda reads brighter/harder underfoot than the Registry
    // Wing's tighter, more muffled floor — the same zone split as the
    // ambient tone, so a footstep alone hints which room the player is in.
    filter.frequency.value = this.#zone === 'hall' ? 1300 : 750;
    const g = ctx.createGain();
    g.gain.value = this.#zone === 'hall' ? 0.13 : 0.1;
    src.connect(filter).connect(g).connect(this.#master);
    src.start();
  }

  interact() {
    this.#blip({ freq: 320, duration: 0.05, type: 'triangle', gain: 0.08 });
  }

  denied() {
    this.#blip({ freq: 140, duration: 0.14, type: 'sawtooth', gain: 0.06, sweep: 90 });
  }

  mechanismOpen() {
    if (!this.#ctx) return;
    this.#blip({ freq: 90, duration: 0.35, type: 'square', gain: 0.1, sweep: 40 });
    setTimeout(() => this.#blip({ freq: 720, duration: 0.4, type: 'sine', gain: 0.06, sweep: 1200 }), 220);
  }

  pickup() {
    this.#blip({ freq: 660, duration: 0.12, type: 'sine', gain: 0.08, sweep: 900 });
  }

  /** A single, quiet settling-creak — an old building, never a jump scare (GDD §10). */
  #playCreak() {
    if (!this.#ctx) return;
    const ctx = this.#ctx;
    const duration = 0.7 + Math.random() * 0.5;
    const bufferSize = Math.floor(duration * ctx.sampleRate);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.sin((Math.PI * i) / bufferSize); // slow swell and fade, not a percussive hit
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const startFreq = 120 + Math.random() * 180;
    filter.frequency.setValueAtTime(startFreq, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(startFreq * (0.55 + Math.random() * 0.3), ctx.currentTime + duration);
    filter.Q.value = 3.5;

    const g = ctx.createGain();
    g.gain.value = 0.045 + Math.random() * 0.02;

    src.connect(filter).connect(g).connect(this.#master);
    src.start();
  }

  #scheduleCreak() {
    clearTimeout(this.#creakTimer);
    const delay = 16000 + Math.random() * 22000;
    this.#creakTimer = setTimeout(() => {
      this.#playCreak();
      this.#scheduleCreak();
    }, delay);
  }
}
