/* =========================================================================
   TURBO RUSH RACER — pseudo-3D high-speed canvas racer
   Single-file game engine: track builder, renderer, physics, AI, audio, UI.
   ========================================================================= */
(() => {
'use strict';

/* ----------------------------- DOM & Canvas ----------------------------- */
const skyCanvas  = document.getElementById('sky');
const gameCanvas = document.getElementById('game');
const skyCtx  = skyCanvas.getContext('2d');
const ctx     = gameCanvas.getContext('2d');

let width = 0, height = 0, dpr = 1;
function resize() {
  const rect = gameCanvas.parentElement.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width  = Math.round(rect.width);
  height = Math.round(rect.height);
  for (const c of [skyCanvas, gameCanvas]) {
    c.width  = width * dpr;
    c.height = height * dpr;
  }
  skyCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

/* -------------------------------- Utils ---------------------------------- */
const Util = {
  clamp: (v, lo, hi) => Math.max(lo, Math.min(hi, v)),
  interpolate: (a, b, p) => a + (b - a) * p,
  easeIn: (a, b, p) => a + (b - a) * p * p,
  easeOut: (a, b, p) => a + (b - a) * (1 - (1 - p) * (1 - p)),
  easeInOut: (a, b, p) => a + (b - a) * ((-Math.cos(p * Math.PI) / 2) + 0.5),
  percentRemaining: (n, total) => (n % total) / total,
  randRange: (a, b) => a + Math.random() * (b - a),
  exponentialFog: (distancePercent, density) =>
    1 / Math.pow(2, distancePercent * distancePercent * density),
  project(p, cameraX, cameraY, cameraZ, cameraDepth, w, h, roadWidth) {
    p.camera.x = (p.world.x || 0) - cameraX;
    p.camera.y = (p.world.y || 0) - cameraY;
    p.camera.z = (p.world.z || 0) - cameraZ;
    p.screen.scale = cameraDepth / p.camera.z;
    p.screen.x = Math.round((w / 2) + (p.screen.scale * p.camera.x * w / 2));
    p.screen.y = Math.round((h / 2) - (p.screen.scale * p.camera.y * h / 2));
    p.screen.w = Math.round(p.screen.scale * roadWidth * w / 2);
  }
};

/* ------------------------------- Palette --------------------------------- */
const PALETTE = {
  road:  { light: '#6b6b76', dark: '#5f5f6a', start: '#ffffff', finish: '#1a1a20' },
  rumble:{ light: '#d94b4b', dark: '#e8e8e8' },
  grass: { light: '#2e7d3a', dark: '#276b32' },
  lane:  '#e8e8e8'
};

/* ------------------------------ Track config ------------------------------ */
const ROAD_W = 2200;
const SEG_LEN = 200;
const RUMBLE_LEN = 3;
const LANES = 3;
const FOV = 100;
const CAM_HEIGHT = 1100;
const DRAW_DIST = 210;
const FOG_DENSITY = 5;
const CAMERA_DEPTH = 1 / Math.tan((FOV / 2) * Math.PI / 180);

const L = { SHORT: 25, MEDIUM: 50, LONG: 100 };
const C = { EASY: 2, MEDIUM: 4, HARD: 6 };
const H = { NONE: 0, LOW: 20, MEDIUM: 40, HIGH: 65 };

let segments = [];
let trackLength = 0;
let heightUnits = 0;

function lastY() { return segments.length === 0 ? 0 : segments[segments.length - 1].p2.world.y; }

function addSegment(curve, y) {
  const n = segments.length;
  segments.push({
    index: n,
    p1: { world: { y: lastY(), z: n * SEG_LEN }, camera: {}, screen: {} },
    p2: { world: { y: y,       z: (n + 1) * SEG_LEN }, camera: {}, screen: {} },
    curve,
    sprites: [],
    cars: [],
    color: Math.floor(n / RUMBLE_LEN) % 2 ? PALETTE.road.dark : PALETTE.road.light,
    rumbleColor: Math.floor(n / RUMBLE_LEN) % 2 ? PALETTE.rumble.dark : PALETTE.rumble.light,
    grassColor: Math.floor(n / RUMBLE_LEN) % 2 ? PALETTE.grass.dark : PALETTE.grass.light,
    special: null
  });
}

function addRoad(enter, hold, leave, curve, y) {
  const startY = lastY();
  const endY = startY + (y * SEG_LEN);
  const total = enter + hold + leave;
  heightUnits += y;
  for (let n = 0; n < enter; n++) addSegment(Util.easeIn(0, curve, n / enter), Util.easeInOut(startY, endY, n / total));
  for (let n = 0; n < hold; n++) addSegment(curve, Util.easeInOut(startY, endY, (enter + n) / total));
  for (let n = 0; n < leave; n++) addSegment(Util.easeInOut(curve, 0, n / leave), Util.easeInOut(startY, endY, (enter + hold + n) / total));
}
function addStraight(num = L.MEDIUM) { addRoad(num, num, num, 0, 0); }
function addCurve(num, curve, height) { addRoad(num, num, num, curve, height); }
function addHillSeg(num, height) { addRoad(num, num, num, 0, height); }
function addSCurves() {
  addRoad(L.MEDIUM, L.MEDIUM, L.MEDIUM, -C.EASY, H.NONE);
  addRoad(L.MEDIUM, L.MEDIUM, L.MEDIUM, C.MEDIUM, H.LOW);
  addRoad(L.MEDIUM, L.MEDIUM, L.MEDIUM, C.EASY, -H.LOW);
  addRoad(L.MEDIUM, L.MEDIUM, L.MEDIUM, -C.EASY, H.LOW);
  addRoad(L.MEDIUM, L.MEDIUM, L.MEDIUM, -C.MEDIUM, -H.LOW);
}
function addBumps() {
  addRoad(10, 10, 10, 0, 5); addRoad(10, 10, 10, 0, -2);
  addRoad(10, 10, 10, 0, -5); addRoad(10, 10, 10, 0, 8);
  addRoad(10, 10, 10, 0, 5); addRoad(10, 10, 10, 0, -7);
}

function addSprite(segIdx, type, offset) {
  segments[segIdx % segments.length].sprites.push({ type, offset });
}

function decorate() {
  for (let n = 0; n < segments.length; n += 1) {
    if (Math.random() < 0.22) {
      const side = Math.random() < 0.5 ? -1 : 1;
      const dist = Util.randRange(1.3, 3.2);
      const type = Math.random() < 0.7 ? 'tree' : (Math.random() < 0.5 ? 'rock' : 'palm');
      addSprite(n, type, side * dist);
    }
  }
  // start / finish banners + checkered zones
  for (let i = 0; i < 3; i++) segments[i].special = 'start';
  for (let i = 0; i < 3; i++) segments[segments.length - 1 - i].special = 'finish';
}

function buildTrack() {
  segments = []; heightUnits = 0;
  addStraight(L.SHORT);
  addCurve(L.MEDIUM, C.EASY, H.LOW);
  addSCurves();
  addCurve(L.MEDIUM, C.MEDIUM, H.LOW);
  addBumps();
  addCurve(L.LONG, -C.MEDIUM, H.MEDIUM);
  addStraight(L.MEDIUM);
  addHillSeg(L.MEDIUM, H.HIGH);
  addSCurves();
  addCurve(L.LONG, C.HARD, H.NONE);
  addHillSeg(L.LONG, -H.MEDIUM);
  addCurve(L.MEDIUM, -C.EASY, H.NONE);
  addStraight(L.MEDIUM);
  addRoad(L.LONG, L.LONG, L.LONG, 0, -heightUnits); // return to baseline for seamless loop
  addStraight(L.SHORT);
  decorate();
  trackLength = segments.length * SEG_LEN;
}
buildTrack();

function findSegment(z) { return segments[Math.floor(z / SEG_LEN) % segments.length]; }

/* -------------------------------- Sprites --------------------------------- */
function drawTree(x, y, scale) {
  const trunkH = 40 * scale, trunkW = 10 * scale;
  ctx.fillStyle = '#5b3a22';
  ctx.fillRect(x - trunkW / 2, y - trunkH, trunkW, trunkH);
  ctx.fillStyle = '#1f5c2c';
  for (let i = 0; i < 3; i++) {
    const r = 55 * scale * (1 - i * 0.22);
    ctx.beginPath();
    ctx.arc(x, y - trunkH - i * 34 * scale, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#2f8f45';
  ctx.beginPath();
  ctx.arc(x - 14 * scale, y - trunkH - 40 * scale, 32 * scale, 0, Math.PI * 2);
  ctx.fill();
}
function drawPalm(x, y, scale) {
  const trunkH = 90 * scale;
  ctx.strokeStyle = '#7a5330';
  ctx.lineWidth = 9 * scale;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + 12 * scale, y - trunkH / 2, x + 4 * scale, y - trunkH);
  ctx.stroke();
  ctx.fillStyle = '#2f8f45';
  const top = { x: x + 4 * scale, y: y - trunkH };
  for (let i = 0; i < 5; i++) {
    const a = (i / 4) * Math.PI - Math.PI * 0.15;
    ctx.beginPath();
    ctx.ellipse(top.x + Math.cos(a) * 26 * scale, top.y - Math.abs(Math.sin(a)) * 20 * scale,
      30 * scale, 11 * scale, a, 0, Math.PI * 2);
    ctx.fill();
  }
}
function drawRock(x, y, scale) {
  ctx.fillStyle = '#7a7a82';
  ctx.beginPath();
  ctx.moveTo(x - 34 * scale, y);
  ctx.lineTo(x - 20 * scale, y - 34 * scale);
  ctx.lineTo(x + 10 * scale, y - 44 * scale);
  ctx.lineTo(x + 34 * scale, y - 10 * scale);
  ctx.lineTo(x + 28 * scale, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#93939c';
  ctx.beginPath();
  ctx.moveTo(x - 20 * scale, y - 34 * scale);
  ctx.lineTo(x + 10 * scale, y - 44 * scale);
  ctx.lineTo(x, y - 20 * scale);
  ctx.closePath();
  ctx.fill();
}
function drawSprite(type, x, y, scale) {
  if (scale < 0.02) return;
  if (type === 'tree') drawTree(x, y, scale);
  else if (type === 'palm') drawPalm(x, y, scale);
  else drawRock(x, y, scale);
}

/* --------------------------------- Cars ----------------------------------- */
const CAR_COLORS = ['#ff4d5a', '#ffd93d', '#3dd6ff', '#7dff5c', '#c07dff', '#ff9d3d'];
function drawCarSprite(x, y, w, colorIdx, tilt = 0, glow = 0) {
  const c = CAR_COLORS[colorIdx % CAR_COLORS.length];
  const h = w * 0.62;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.34, w * 0.48, h * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  if (glow > 0) {
    ctx.save();
    ctx.globalAlpha = glow;
    ctx.fillStyle = '#3dd6ff';
    ctx.beginPath();
    ctx.ellipse(0, h * 0.55, w * 0.22, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // wheels
  ctx.fillStyle = '#111';
  ctx.fillRect(-w * 0.46, -h * 0.08, w * 0.12, h * 0.5);
  ctx.fillRect(w * 0.34, -h * 0.08, w * 0.12, h * 0.5);
  // body
  const grad = ctx.createLinearGradient(0, -h * 0.5, 0, h * 0.3);
  grad.addColorStop(0, '#fff');
  grad.addColorStop(0.18, c);
  grad.addColorStop(1, shade(c, -40));
  ctx.fillStyle = grad;
  roundRectPath(-w * 0.4, -h * 0.5, w * 0.8, h * 0.85, w * 0.16);
  ctx.fill();
  // cabin
  ctx.fillStyle = 'rgba(15,20,35,0.85)';
  roundRectPath(-w * 0.26, -h * 0.4, w * 0.52, h * 0.36, w * 0.12);
  ctx.fill();
  // spoiler
  ctx.fillStyle = shade(c, -55);
  ctx.fillRect(-w * 0.34, h * 0.24, w * 0.68, h * 0.08);
  // headlight glints
  ctx.fillStyle = '#fff9c4';
  ctx.fillRect(-w * 0.34, -h * 0.48, w * 0.14, h * 0.08);
  ctx.fillRect(w * 0.2, -h * 0.48, w * 0.14, h * 0.08);
  ctx.restore();
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 0xff) + amt, b = (n & 0xff) + amt;
  r = Util.clamp(r, 0, 255); g = Util.clamp(g, 0, 255); b = Util.clamp(b, 0, 255);
  return `rgb(${r},${g},${b})`;
}
function roundRectPath(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* -------------------------------- Audio ------------------------------------ */
const Audio1 = (() => {
  let actx = null, master = null, engineOsc = null, engineOsc2 = null, engineGain = null;
  let enabled = true, started = false;
  function init() {
    if (actx) return;
    actx = new (window.AudioContext || window.webkitAudioContext)();
    master = actx.createGain(); master.gain.value = 0.5; master.connect(actx.destination);
  }
  function startEngine() {
    if (started || !enabled) return;
    init();
    engineOsc = actx.createOscillator(); engineOsc.type = 'sawtooth';
    engineOsc2 = actx.createOscillator(); engineOsc2.type = 'square';
    engineGain = actx.createGain(); engineGain.gain.value = 0.0;
    const filter = actx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 900;
    engineOsc.connect(filter); engineOsc2.connect(filter); filter.connect(engineGain); engineGain.connect(master);
    engineOsc.frequency.value = 60; engineOsc2.frequency.value = 90;
    engineOsc.start(); engineOsc2.start();
    started = true;
  }
  function updateEngine(speedPct, boosting) {
    if (!started || !enabled) return;
    const freq = 55 + speedPct * 210 + (boosting ? 60 : 0);
    engineOsc.frequency.setTargetAtTime(freq, actx.currentTime, 0.05);
    engineOsc2.frequency.setTargetAtTime(freq * 1.5, actx.currentTime, 0.05);
    engineGain.gain.setTargetAtTime(0.05 + speedPct * 0.09, actx.currentTime, 0.08);
  }
  function blip(freq, dur, type = 'sine', vol = 0.3) {
    if (!enabled) return; init();
    const o = actx.createOscillator(); const g = actx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
    o.connect(g); g.connect(master);
    o.start(); o.stop(actx.currentTime + dur);
  }
  function crash() {
    if (!enabled) return; init();
    const bufferSize = actx.sampleRate * 0.35;
    const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const src = actx.createBufferSource(); src.buffer = buffer;
    const g = actx.createGain(); g.gain.value = 0.5;
    const filter = actx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 1500;
    src.connect(filter); filter.connect(g); g.connect(master);
    src.start();
  }
  function nitro() { blip(220, 0.4, 'sawtooth', 0.18); }
  function countBeep(high) { blip(high ? 880 : 440, 0.18, 'sine', 0.25); }
  function setEnabled(v) { enabled = v; if (master) master.gain.value = v ? 0.5 : 0; }
  return { startEngine, updateEngine, crash, nitro, countBeep, setEnabled, get enabled() { return enabled; } };
})();

/* -------------------------------- Input ------------------------------------ */
const keys = { left: false, right: false, up: false, down: false, boost: false };
window.addEventListener('keydown', e => {
  switch (e.code) {
    case 'ArrowLeft': case 'KeyA': keys.left = true; break;
    case 'ArrowRight': case 'KeyD': keys.right = true; break;
    case 'ArrowUp': case 'KeyW': keys.up = true; break;
    case 'ArrowDown': case 'KeyS': keys.down = true; break;
    case 'Space': case 'ShiftLeft': case 'ShiftRight': keys.boost = true; e.preventDefault(); break;
    case 'KeyP': togglePause(); break;
    case 'KeyR': restartRace(); break;
  }
});
window.addEventListener('keyup', e => {
  switch (e.code) {
    case 'ArrowLeft': case 'KeyA': keys.left = false; break;
    case 'ArrowRight': case 'KeyD': keys.right = false; break;
    case 'ArrowUp': case 'KeyW': keys.up = false; break;
    case 'ArrowDown': case 'KeyS': keys.down = false; break;
    case 'Space': case 'ShiftLeft': case 'ShiftRight': keys.boost = false; break;
  }
});
function bindTouch(id, onDown, onUp) {
  const el = document.getElementById(id);
  const down = ev => { ev.preventDefault(); onDown(); };
  const up = ev => { ev.preventDefault(); onUp(); };
  el.addEventListener('touchstart', down, { passive: false });
  el.addEventListener('touchend', up, { passive: false });
  el.addEventListener('touchcancel', up, { passive: false });
  el.addEventListener('mousedown', down);
  el.addEventListener('mouseup', up);
  el.addEventListener('mouseleave', up);
}
bindTouch('tLeft', () => keys.left = true, () => keys.left = false);
bindTouch('tRight', () => keys.right = true, () => keys.right = false);
bindTouch('tGas', () => keys.up = true, () => keys.up = false);
bindTouch('tBrake', () => keys.down = true, () => keys.down = false);
bindTouch('tNitro', () => keys.boost = true, () => keys.boost = false);
if ('ontouchstart' in window) document.getElementById('touchControls').classList.remove('hidden');

/* -------------------------------- Game State -------------------------------- */
const MAX_SPEED = SEG_LEN / (1 / 60) * 0.55; // world units / second baseline
const state = {
  running: false, paused: false, countingDown: false,
  position: 0, playerX: 0, speed: 0,
  nitro: 1, nitroActive: false,
  totalLaps: 3, currentLap: 1,
  raceTime: 0, lapStartTime: 0, bestLap: Infinity, topSpeed: 0, crashes: 0,
  crashTimer: 0, shake: 0, difficulty: 1,
  aiCars: [],
  finished: false
};

function spawnTraffic(count) {
  state.aiCars = [];
  for (let i = 0; i < count; i++) {
    state.aiCars.push({
      z: (Math.random() * trackLength),
      offset: [-0.55, 0, 0.55][i % 3] + Util.randRange(-0.15, 0.15),
      speed: MAX_SPEED * Util.randRange(0.35, 0.55) * state.difficulty,
      color: i % CAR_COLORS.length
    });
  }
}

/* -------------------------------- Physics ----------------------------------- */
function updatePlayer(dt) {
  const accel = MAX_SPEED / 2.6;
  const brakeDecel = MAX_SPEED / 1.1;
  const coastDecel = MAX_SPEED / 5.2;
  const offRoadDecel = MAX_SPEED / 2.1;
  const offRoadLimit = MAX_SPEED / 3.2;
  const boostMult = 1.65;

  const playerSeg = findSegment(state.position + 0);
  const speedPercent = state.speed / MAX_SPEED;
  const curMax = MAX_SPEED * (state.nitroActive ? boostMult : 1);

  if (keys.up) state.speed += accel * dt;
  else if (keys.down) state.speed -= brakeDecel * dt;
  else state.speed -= coastDecel * dt;

  state.nitroActive = keys.boost && state.nitro > 0.02;
  if (state.nitroActive) { state.nitro = Util.clamp(state.nitro - dt * 0.42, 0, 1); }
  else { state.nitro = Util.clamp(state.nitro + dt * 0.18, 0, 1); }

  const offRoad = Math.abs(state.playerX) > 1;
  if (offRoad) {
    state.speed -= offRoadDecel * dt;
    if (state.speed > offRoadLimit) state.speed = offRoadLimit;
  }

  state.speed = Util.clamp(state.speed, 0, curMax);

  const dx = dt * 2.6 * (state.speed / MAX_SPEED);
  if (keys.left) state.playerX -= dx;
  if (keys.right) state.playerX += dx;

  state.playerX -= dx * (state.speed / MAX_SPEED) * playerSeg.curve * 0.62; // centrifugal pull
  state.playerX = Util.clamp(state.playerX, -3, 3);

  state.position += state.speed * dt;
  if (state.position >= trackLength) {
    state.position -= trackLength;
    handleLapComplete();
  }
  if (state.speed > state.topSpeed) state.topSpeed = state.speed;

  if (state.crashTimer > 0) state.crashTimer -= dt;
  if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 3.2);

  checkCarCollisions();

  Audio1.updateEngine(Util.clamp(state.speed / MAX_SPEED, 0, 1), state.nitroActive);
}

function checkCarCollisions() {
  for (const car of state.aiCars) {
    let dz = car.z - state.position;
    if (dz < -trackLength / 2) dz += trackLength;
    if (dz > trackLength / 2) dz -= trackLength;
    if (Math.abs(dz) < SEG_LEN * 1.1 && Math.abs(car.offset - state.playerX) < 0.6) {
      if (state.crashTimer <= 0) {
        state.speed *= 0.35;
        state.crashes++;
        state.crashTimer = 0.8;
        state.shake = 1;
        state.playerX += (state.playerX < car.offset ? -0.4 : 0.4);
        Audio1.crash();
        flashCrash();
      }
    }
  }
}

function updateTraffic(dt) {
  for (const car of state.aiCars) {
    car.z = (car.z + car.speed * dt) % trackLength;
    if (car.z < 0) car.z += trackLength;
  }
}

function handleLapComplete() {
  const now = performance.now();
  const lapTime = (now - state.lapStartTime) / 1000;
  if (lapTime < state.bestLap) state.bestLap = lapTime;
  state.lapStartTime = now;
  if (state.currentLap >= state.totalLaps) {
    finishRace();
  } else {
    state.currentLap++;
    Audio1.countBeep(true);
  }
}

/* -------------------------------- Rendering ---------------------------------- */
function renderSky() {
  skyCtx.clearRect(0, 0, width, height);
  const horizon = height * 0.5;
  const sky = skyCtx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, '#1b1042');
  sky.addColorStop(0.45, '#4a2a72');
  sky.addColorStop(0.75, '#ff7a59');
  sky.addColorStop(1, '#ffd08a');
  skyCtx.fillStyle = sky;
  skyCtx.fillRect(0, 0, width, horizon);

  // sun
  const sunX = width * 0.78, sunY = horizon * 0.55;
  const sunGrad = skyCtx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 90);
  sunGrad.addColorStop(0, '#fff7d6');
  sunGrad.addColorStop(0.5, '#ffd93d');
  sunGrad.addColorStop(1, 'rgba(255,140,60,0)');
  skyCtx.fillStyle = sunGrad;
  skyCtx.beginPath(); skyCtx.arc(sunX, sunY, 90, 0, Math.PI * 2); skyCtx.fill();

  // parallax mountains, offset by curve/playerX for a sense of motion
  const parX = -(state.playerX * 40 + state.position * 0.02) % width;
  skyCtx.fillStyle = '#2a1a4a';
  drawMountainRow(parX, horizon, 120, 0.5);
  drawMountainRow(parX * 1.7, horizon, 80, 0.7, '#3a2560');

  // ground below horizon (fills gap before road draws over it)
  skyCtx.fillStyle = '#214d27';
  skyCtx.fillRect(0, horizon, width, height - horizon);
}
function drawMountainRow(offset, horizon, amp, colorAlpha, color) {
  skyCtx.save();
  skyCtx.globalAlpha = colorAlpha;
  if (color) skyCtx.fillStyle = color;
  skyCtx.beginPath();
  skyCtx.moveTo(-width, horizon);
  const step = width / 6;
  for (let x = -width; x <= width * 2; x += step) {
    const px = x + offset;
    const py = horizon - amp * (0.4 + 0.6 * Math.abs(Math.sin(x * 0.0021 + 1.3)));
    skyCtx.lineTo(px, py);
  }
  skyCtx.lineTo(width * 2, horizon);
  skyCtx.closePath();
  skyCtx.fill();
  skyCtx.restore();
}

function renderSegmentPoly(p1x, p1y, p1w, p2x, p2y, p2w, color, rumbleColor, grassColor, fog) {
  const r1 = p1w / 5.5, r2 = p2w / 5.5;
  const l1 = p1w / (LANES * 2.2), l2 = p2w / (LANES * 2.2);

  ctx.fillStyle = grassColor;
  ctx.fillRect(0, p2y, width, p1y - p2y + 1);

  poly(p1x - p1w - r1, p1y, p1x - p1w, p1y, p2x - p2w, p2y, p2x - p2w - r2, p2y, rumbleColor);
  poly(p1x + p1w, p1y, p1x + p1w + r1, p1y, p2x + p2w + r2, p2y, p2x + p2w, p2y, rumbleColor);
  poly(p1x - p1w, p1y, p1x + p1w, p1y, p2x + p2w, p2y, p2x - p2w, p2y, color);

  if (LANES > 1) {
    const laneMarkerColor = PALETTE.lane;
    for (let lane = 1; lane < LANES; lane++) {
      const lx1 = p1x - p1w + (2 * p1w * lane / LANES);
      const lx2 = p2x - p2w + (2 * p2w * lane / LANES);
      poly(lx1 - l1 / 2, p1y, lx1 + l1 / 2, p1y, lx2 + l2 / 2, p2y, lx2 - l2 / 2, p2y, laneMarkerColor);
    }
  }

  if (fog < 1) {
    ctx.fillStyle = `rgba(30,15,50,${1 - fog})`;
    ctx.fillRect(0, p1y, width, p2y - p1y);
  }
}
function poly(x1, y1, x2, y2, x3, y3, x4, y4, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.lineTo(x4, y4);
  ctx.closePath(); ctx.fill();
}

function renderStartFinishBanner(p1, special) {
  if (!special) return;
  const w = p1.screen.w * 2.1;
  const h = w * 0.16;
  const y = p1.screen.y - h;
  const cols = 12;
  const cw = w / cols;
  for (let i = 0; i < cols; i++) {
    ctx.fillStyle = (i % 2 === 0) ? '#111' : '#fff';
    ctx.fillRect(p1.screen.x - w / 2 + i * cw, y, cw, h);
  }
  if (special === 'start') {
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.max(10, h * 0.55)}px Orbitron, sans-serif`;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 12;
    ctx.fillText('START', p1.screen.x, y - 6);
    ctx.shadowBlur = 0;
  }
}

function renderRoad() {
  const baseSegment = findSegment(state.position);
  const basePercent = Util.percentRemaining(state.position, SEG_LEN);
  const playerSegment = findSegment(state.position + 0);
  const playerPercent = Util.percentRemaining(state.position, SEG_LEN);
  const playerY = Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);
  let maxy = height;

  let x = 0;
  let dx = -(baseSegment.curve * basePercent);

  const shakeX = state.shake ? (Math.random() - 0.5) * 14 * state.shake : 0;
  const shakeY = state.shake ? (Math.random() - 0.5) * 8 * state.shake : 0;

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(shakeX, shakeY);

  const camX = state.playerX * ROAD_W;
  const camY = playerY + CAM_HEIGHT;

  for (let n = 0; n < DRAW_DIST; n++) {
    const segment = segments[(baseSegment.index + n) % segments.length];
    segment.looped = segment.index < baseSegment.index;
    segment.fog = Util.exponentialFog(n / DRAW_DIST, FOG_DENSITY);

    Util.project(segment.p1, camX - x, camY, state.position - (segment.looped ? trackLength : 0), CAMERA_DEPTH, width, height, ROAD_W);
    Util.project(segment.p2, camX - x - dx, camY, state.position - (segment.looped ? trackLength : 0), CAMERA_DEPTH, width, height, ROAD_W);

    x += dx;
    dx += segment.curve;

    if ((segment.p1.camera.z <= CAMERA_DEPTH) ||
        (segment.p2.screen.y >= segment.p1.screen.y) ||
        (segment.p2.screen.y >= maxy)) {
      continue;
    }

    renderSegmentPoly(
      segment.p1.screen.x, segment.p1.screen.y, segment.p1.screen.w,
      segment.p2.screen.x, segment.p2.screen.y, segment.p2.screen.w,
      segment.color, segment.rumbleColor, segment.grassColor, segment.fog
    );
    renderStartFinishBanner(segment.p1, segment.special);

    // sprites belonging to this segment
    for (const spr of segment.sprites) {
      const scale = segment.p1.screen.scale;
      const sx = segment.p1.screen.x + scale * spr.offset * ROAD_W * width / 2;
      const sy = segment.p1.screen.y;
      drawSprite(spr.type, sx, sy, Math.max(0, scale * 2.1 * (1 - segment.fog * 0)));
    }
    // cars on this segment
    for (const car of segment.cars) {
      const scale = segment.p1.screen.scale;
      const sx = segment.p1.screen.x + scale * car.offset * ROAD_W * width / 2;
      const sy = segment.p1.screen.y;
      const sw = scale * ROAD_W * width / 2 * 0.34;
      drawCarSprite(sx, sy, Math.max(4, sw), car.color, 0, 0);
    }

    maxy = segment.p1.screen.y;
  }

  renderPlayerCar();
  ctx.restore();
  renderSpeedLines();
}

function renderPlayerCar() {
  const cx = width / 2 + state.playerX * width * 0.24;
  const cy = height - height * 0.09;
  const w = width * 0.16;
  const tilt = Util.clamp((keys.left ? -1 : keys.right ? 1 : 0) * 0.06, -0.08, 0.08)
    + Util.clamp(-state.playerX * 0.05, -0.1, 0.1);
  const bob = state.crashTimer > 0 ? Math.sin(performance.now() * 0.08) * 6 : 0;
  drawCarSprite(cx, cy + bob, w, 2, tilt, state.nitroActive ? 0.85 : 0);
}

function renderSpeedLines() {
  const pct = state.speed / MAX_SPEED;
  if (pct < 0.45) return;
  const n = Math.floor(pct * 14);
  ctx.save();
  ctx.strokeStyle = state.nitroActive ? 'rgba(0,240,255,0.5)' : 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;
  for (let i = 0; i < n; i++) {
    const y = Math.random() * height;
    const len = 40 + Math.random() * 120 * pct;
    const fromLeft = Math.random() < 0.5;
    ctx.beginPath();
    if (fromLeft) { ctx.moveTo(0, y); ctx.lineTo(len, y); }
    else { ctx.moveTo(width, y); ctx.lineTo(width - len, y); }
    ctx.stroke();
  }
  ctx.restore();
}

function distributeCarsToSegments() {
  for (const seg of segments) seg.cars.length = 0;
  for (const car of state.aiCars) {
    let dz = car.z - state.position;
    if (dz < 0) dz += trackLength;
    if (dz > DRAW_DIST * SEG_LEN) continue;
    findSegment(car.z).cars.push(car);
  }
}

/* --------------------------------- HUD --------------------------------------- */
const el = {
  lapCurrent: document.getElementById('lapCurrent'),
  lapTotal: document.getElementById('lapTotal'),
  timeValue: document.getElementById('timeValue'),
  speedValue: document.getElementById('speedValue'),
  speedoFill: document.getElementById('speedoFill'),
  nitroFill: document.getElementById('nitroFill'),
  gearValue: document.getElementById('gearValue'),
  posBadge: document.getElementById('posBadge'),
  crashFlash: document.getElementById('crashFlash'),
  boostFlash: document.getElementById('boostFlash')
};
function fmtTime(sec) {
  if (!isFinite(sec)) return '--:--:--';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 1000);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}
function gearFromSpeed(pct) {
  return Util.clamp(1 + Math.floor(pct * 5.999), 1, 6);
}
function flashCrash() {
  el.crashFlash.style.opacity = 1;
  setTimeout(() => el.crashFlash.style.opacity = 0, 150);
}
function updateHUD() {
  el.lapCurrent.textContent = state.currentLap;
  el.lapTotal.textContent = state.totalLaps;
  el.timeValue.textContent = fmtTime(state.raceTime);
  const kmh = Math.round((state.speed / MAX_SPEED) * 340);
  el.speedValue.textContent = kmh;
  const pct = Util.clamp(state.speed / MAX_SPEED, 0, 1);
  el.speedoFill.style.strokeDashoffset = String(283 - 283 * pct);
  el.speedoFill.style.stroke = state.nitroActive ? '#ff2e63' : '#00f0ff';
  el.nitroFill.style.width = `${state.nitro * 100}%`;
  el.gearValue.textContent = gearFromSpeed(pct);
  el.boostFlash.style.opacity = state.nitroActive ? 0.9 : 0;

  // naive position estimate vs AI: count cars ahead within one lap-ish window
  let ahead = 0;
  for (const car of state.aiCars) {
    let dz = car.z - state.position;
    if (dz < -trackLength / 2) dz += trackLength;
    if (dz > trackLength / 2) dz -= trackLength;
    if (dz > 0 && dz < trackLength * 0.5) ahead++;
  }
  const place = Util.clamp(ahead + 1, 1, 9);
  const sup = place === 1 ? 'st' : place === 2 ? 'nd' : place === 3 ? 'rd' : 'th';
  el.posBadge.innerHTML = `${place}<span class="pos-sup">${sup}</span>`;
}

/* -------------------------------- Game Loop ----------------------------------- */
let lastTs = 0;
function loop(ts) {
  requestAnimationFrame(loop);
  if (!lastTs) lastTs = ts;
  let dt = (ts - lastTs) / 1000;
  lastTs = ts;
  dt = Math.min(dt, 0.05);

  renderSky();

  if (state.running && !state.paused && !state.countingDown) {
    updatePlayer(dt);
    updateTraffic(dt);
    distributeCarsToSegments();
    state.raceTime += dt;
    updateHUD();
  } else {
    distributeCarsToSegments();
  }
  renderRoad();
}
requestAnimationFrame(loop);

/* -------------------------------- UI Wiring ------------------------------------ */
const screens = {
  start: document.getElementById('startScreen'),
  pause: document.getElementById('pauseScreen'),
  finish: document.getElementById('finishScreen'),
  hud: document.getElementById('hud')
};
const BEST_KEY = 'turboRushBestTime';

function loadBest() {
  const v = parseFloat(localStorage.getItem(BEST_KEY));
  return isFinite(v) ? v : Infinity;
}
function saveBestDisplay() {
  const best = loadBest();
  document.getElementById('bestTimeDisplay').textContent =
    'أفضل وقت: ' + (isFinite(best) ? fmtTime(best) : '--:--:--');
}
saveBestDisplay();

document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.difficulty = parseFloat(btn.dataset.diff);
  });
});

const soundBtn = document.getElementById('soundBtn');
soundBtn.addEventListener('click', () => {
  Audio1.setEnabled(!Audio1.enabled);
  soundBtn.textContent = Audio1.enabled ? '🔊 الصوت: يعمل' : '🔇 الصوت: متوقف';
});

function resetRaceState() {
  state.position = 0; state.playerX = 0; state.speed = 0;
  state.nitro = 1; state.nitroActive = false;
  state.currentLap = 1; state.raceTime = 0; state.bestLap = Infinity;
  state.topSpeed = 0; state.crashes = 0; state.crashTimer = 0; state.shake = 0;
  state.finished = false;
  spawnTraffic(8);
  buildTrack();
}

let countdownTimer = null;
function startRace() {
  resetRaceState();
  screens.start.classList.add('hidden');
  screens.finish.classList.add('hidden');
  screens.hud.classList.remove('hidden');
  document.getElementById('pauseHint').classList.remove('hidden');
  Audio1.startEngine();
  runCountdown();
}
function runCountdown() {
  state.countingDown = true;
  state.running = true;
  let n = 3;
  const cdEl = document.createElement('div');
  cdEl.id = 'countdownEl';
  cdEl.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;' +
    'font-family:Orbitron,sans-serif;font-size:8rem;color:#fff;text-shadow:0 0 30px #00f0ff;z-index:60;pointer-events:none;';
  document.getElementById('app').appendChild(cdEl);
  cdEl.textContent = n;
  Audio1.countBeep(false);
  countdownTimer = setInterval(() => {
    n--;
    if (n > 0) { cdEl.textContent = n; Audio1.countBeep(false); }
    else if (n === 0) { cdEl.textContent = 'GO!'; Audio1.countBeep(true); }
    else {
      clearInterval(countdownTimer);
      cdEl.remove();
      state.countingDown = false;
      state.lapStartTime = performance.now();
    }
  }, 800);
}

function togglePause() {
  if (!state.running || state.finished || state.countingDown) return;
  state.paused = !state.paused;
  screens.pause.classList.toggle('hidden', !state.paused);
}
document.getElementById('resumeBtn').addEventListener('click', togglePause);
document.getElementById('restartFromPauseBtn').addEventListener('click', () => { screens.pause.classList.add('hidden'); state.paused = false; startRace(); });
document.getElementById('menuFromPauseBtn').addEventListener('click', () => { screens.pause.classList.add('hidden'); state.paused = false; goToMenu(); });

function goToMenu() {
  state.running = false;
  screens.hud.classList.add('hidden');
  screens.finish.classList.add('hidden');
  screens.pause.classList.add('hidden');
  document.getElementById('pauseHint').classList.add('hidden');
  screens.start.classList.remove('hidden');
  saveBestDisplay();
}
function restartRace() {
  if (screens.start.classList.contains('hidden')) startRace();
}

function finishRace() {
  state.finished = true;
  state.running = false;
  const best = loadBest();
  if (state.raceTime < best) localStorage.setItem(BEST_KEY, String(state.raceTime));
  document.getElementById('finalTime').textContent = fmtTime(state.raceTime);
  document.getElementById('bestLap').textContent = fmtTime(state.bestLap);
  document.getElementById('topSpeed').textContent = Math.round((state.topSpeed / MAX_SPEED) * 340) + ' كم/س';
  document.getElementById('crashCount').textContent = state.crashes;
  document.getElementById('finishTitle').textContent =
    state.raceTime < best ? '🏆 رقم قياسي جديد!' : '🏁 انتهى السباق!';
  screens.hud.classList.add('hidden');
  document.getElementById('pauseHint').classList.add('hidden');
  screens.finish.classList.remove('hidden');
}

document.getElementById('startBtn').addEventListener('click', startRace);
document.getElementById('raceAgainBtn').addEventListener('click', startRace);
document.getElementById('menuFromFinishBtn').addEventListener('click', goToMenu);

})();
