/**
 * Synthesized, asset-free audio (GDD §13): a low ambient building tone that
 * never resolves into music, footstep ticks paced by the player controller,
 * and short mechanism sounds for puzzle payoffs. No positional audio nodes
 * are needed yet at this scale (single small wing) — added when Case 002's
 * sound-based puzzle requires it.
 */
export class AudioManager {
  #ctx = null;
  #master = null;
  #ambientGain = null;
  #unlocked = false;

  unlock() {
    if (this.#unlocked) return;
    this.#unlocked = true;
    this.#ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.#master = this.#ctx.createGain();
    this.#master.gain.value = 0.55;
    this.#master.connect(this.#ctx.destination);
    this.#startAmbient();
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

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 180;
    filter.Q.value = 0.7;

    this.#ambientGain = ctx.createGain();
    this.#ambientGain.gain.value = 0.05;

    const hum = ctx.createOscillator();
    hum.type = 'sine';
    hum.frequency.value = 55;
    const humGain = ctx.createGain();
    humGain.gain.value = 0.02;

    noise.connect(filter).connect(this.#ambientGain).connect(this.#master);
    hum.connect(humGain).connect(this.#master);

    noise.start();
    hum.start();
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
    filter.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.value = 0.12;
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
}
