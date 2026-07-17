(() => {
'use strict';

/* ===================== Utils ===================== */
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const lerp = (a,b,t) => a + (b-a)*t;
const dist = (a,b) => Math.hypot(a.x-b.x, a.y-b.y);
const norm = (a) => { const l = Math.hypot(a.x,a.y) || 1; return {x:a.x/l, y:a.y/l}; };
const TAU = Math.PI*2;
function angleDiff(a,b){ let d=(b-a)%TAU; if(d>Math.PI)d-=TAU; if(d<-Math.PI)d+=TAU; return d; }

function catmullRom(p0,p1,p2,p3,t){
  const t2=t*t, t3=t2*t;
  const x = 0.5*((2*p1.x)+(-p0.x+p2.x)*t+(2*p0.x-5*p1.x+4*p2.x-p3.x)*t2+(-p0.x+3*p1.x-3*p2.x+p3.x)*t3);
  const y = 0.5*((2*p1.y)+(-p0.y+p2.y)*t+(2*p0.y-5*p1.y+4*p2.y-p3.y)*t2+(-p0.y+3*p1.y-3*p2.y+p3.y)*t3);
  return {x,y};
}

/* ===================== Track ===================== */
const CONTROL_POINTS = [
  {x:420,y:1180},{x:250,y:940},{x:230,y:600},{x:420,y:340},
  {x:760,y:280},{x:960,y:440},{x:860,y:640},{x:1040,y:800},
  {x:1380,y:800},{x:1560,y:610},{x:1500,y:360},{x:1740,y:190},
  {x:2080,y:330},{x:2160,y:660},{x:1980,y:900},{x:2020,y:1220},
  {x:1720,y:1400},{x:1220,y:1400},{x:900,y:1300},{x:620,y:1400},
];
const ROAD_HALF_WIDTH = 115;
const SAMPLES_PER_SEG = 18;

function buildTrack(){
  const n = CONTROL_POINTS.length;
  const centerline = [];
  for(let i=0;i<n;i++){
    const p0 = CONTROL_POINTS[(i-1+n)%n];
    const p1 = CONTROL_POINTS[i];
    const p2 = CONTROL_POINTS[(i+1)%n];
    const p3 = CONTROL_POINTS[(i+2)%n];
    for(let s=0;s<SAMPLES_PER_SEG;s++){
      centerline.push(catmullRom(p0,p1,p2,p3, s/SAMPLES_PER_SEG));
    }
  }
  // cumulative distance + tangents/normals
  let total = 0;
  const dists = [0];
  for(let i=1;i<centerline.length;i++){
    total += dist(centerline[i-1], centerline[i]);
    dists.push(total);
  }
  total += dist(centerline[centerline.length-1], centerline[0]);
  const len = centerline.length;
  const tangents = centerline.map((p,i)=>{
    const a = centerline[(i-1+len)%len], b = centerline[(i+1)%len];
    return norm({x:b.x-a.x, y:b.y-a.y});
  });
  const normals = tangents.map(t => ({x:-t.y, y:t.x}));
  return {centerline, dists, tangents, normals, totalLength: total};
}

function decorate(track){
  const trees = [];
  const bounds = {minX:0,minY:0,maxX:2400,maxY:1650};
  let attempts=0;
  while(trees.length < 130 && attempts < 4000){
    attempts++;
    const x = Math.random()*bounds.maxX, y = Math.random()*bounds.maxY;
    let minD = Infinity;
    for(let i=0;i<track.centerline.length;i+=6){
      const d = dist({x,y}, track.centerline[i]);
      if(d<minD) minD=d;
    }
    if(minD > ROAD_HALF_WIDTH+70 && minD < ROAD_HALF_WIDTH+420){
      trees.push({x,y,r:14+Math.random()*16, kind: Math.random()<0.75?'tree':'rock'});
    }
  }
  return trees;
}

/* ===================== Car ===================== */
const CAR_COLORS = ['#00e5ff','#ff3b5c','#7cffb2','#ffd23f','#ff8a3d','#c084fc'];

class Car {
  constructor(id, name, color, isPlayer){
    this.id=id; this.name=name; this.color=color; this.isPlayer=isPlayer;
    this.x=0; this.y=0; this.angle=0;
    this.vx=0; this.vy=0;
    this.maxSpeed = 620; this.accel = 480; this.brakePower = 620; this.turnRate = 3.0;
    this.width=26; this.height=46;
    this.progressIndex = 0; this.lap = 1; this.finished=false; this.finishTime=0;
    this.lapProgress = 0;
    this.offTrack=false;
    this.driftSlide = 0;
    this.nitro = 100; this.nitroActive=false;
    this.smoke = [];
    this.aiTargetOffset = (Math.random()-0.5) * 60;
    this.aiSkill = 1;
    this.rank = 1;
  }
}

/* ===================== Game ===================== */
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const mmCanvas = document.getElementById('minimap');
const mmCtx = mmCanvas.getContext('2d');

let W=0,H=0;
function resize(){
  W = canvas.width = window.innerWidth * devicePixelRatio;
  H = canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = window.innerWidth+'px';
  canvas.style.height = window.innerHeight+'px';
  mmCanvas.width = 170*devicePixelRatio; mmCanvas.height = 170*devicePixelRatio;
}
window.addEventListener('resize', resize);
resize();

const track = buildTrack();
const decorations = decorate(track);

const state = {
  screen: 'menu', // menu, how, countdown, racing, paused, results
  laps: 3,
  difficulty: 'normal',
  playerColor: CAR_COLORS[0],
  cars: [],
  raceTime: 0,
  countdown: 3,
  muted: false,
};

/* ---------- Input ---------- */
const keys = {};
const input = {steer:0, throttle:false, brake:false, drift:false, nitro:false};
window.addEventListener('keydown', e => {
  keys[e.code]=true;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
  if(e.code==='KeyP' || e.code==='Escape'){
    if(state.screen==='racing') pauseGame();
    else if(state.screen==='paused') resumeGame();
  }
});
window.addEventListener('keyup', e => { keys[e.code]=false; });

function readInput(){
  input.throttle = keys['ArrowUp']||keys['KeyW']||touchState.gas;
  input.brake = keys['ArrowDown']||keys['KeyS']||touchState.brake;
  input.drift = keys['Space']||touchState.drift;
  input.nitro = keys['ShiftLeft']||keys['ShiftRight']||touchState.nitro;
  let steer = 0;
  if(keys['ArrowLeft']||keys['KeyA']||touchState.left) steer -= 1;
  if(keys['ArrowRight']||keys['KeyD']||touchState.right) steer += 1;
  input.steer = steer;
}

const touchState = {left:false,right:false,gas:false,brake:false,drift:false,nitro:false};
function bindTouch(id, key){
  const el = document.getElementById(id);
  if(!el) return;
  const on = (e)=>{ e.preventDefault(); touchState[key]=true; };
  const off = (e)=>{ e.preventDefault(); touchState[key]=false; };
  el.addEventListener('touchstart', on, {passive:false});
  el.addEventListener('touchend', off, {passive:false});
  el.addEventListener('touchcancel', off, {passive:false});
  el.addEventListener('mousedown', on);
  window.addEventListener('mouseup', off);
}
bindTouch('t-left','left'); bindTouch('t-right','right'); bindTouch('t-gas','gas');
bindTouch('t-brake','brake'); bindTouch('t-drift','drift'); bindTouch('t-nitro','nitro');
if('ontouchstart' in window || navigator.maxTouchPoints>0){
  document.getElementById('touch-controls').classList.remove('hidden');
}

/* ---------- Audio ---------- */
let actx=null, engineOsc=null, engineGain=null;
function initAudio(){
  if(actx) return;
  actx = new (window.AudioContext||window.webkitAudioContext)();
  engineOsc = actx.createOscillator();
  engineGain = actx.createGain();
  engineOsc.type='sawtooth';
  engineOsc.frequency.value=60;
  engineGain.gain.value=0;
  engineOsc.connect(engineGain).connect(actx.destination);
  engineOsc.start();
}
function beep(freq, dur, type='sine', vol=0.2){
  if(!actx || state.muted) return;
  const o=actx.createOscillator(), g=actx.createGain();
  o.type=type; o.frequency.value=freq;
  g.gain.value=vol;
  o.connect(g).connect(actx.destination);
  g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime+dur);
  o.start(); o.stop(actx.currentTime+dur);
}
function updateEngineSound(speedRatio){
  if(!actx || !engineGain) return;
  const g = state.muted ? 0 : clamp(0.03+speedRatio*0.09,0,0.14);
  engineGain.gain.setTargetAtTime(g, actx.currentTime, 0.05);
  engineOsc.frequency.setTargetAtTime(60+speedRatio*260, actx.currentTime, 0.05);
}

/* ---------- Track helpers ---------- */
function nearestIndex(pos, hint){
  const cl = track.centerline;
  const len = cl.length;
  if(hint==null){
    let best=0,bd=Infinity;
    for(let i=0;i<len;i+=4){ const d=dist(pos,cl[i]); if(d<bd){bd=d;best=i;} }
    return best;
  }
  let best=hint,bd=dist(pos,cl[hint]);
  const range=40;
  for(let o=-range;o<=range;o++){
    const i=((hint+o)%len+len)%len;
    const d=dist(pos,cl[i]);
    if(d<bd){bd=d;best=i;}
  }
  return best;
}
function signedOffset(pos, idx){
  const c = track.centerline[idx], nrm = track.normals[idx];
  return (pos.x-c.x)*nrm.x + (pos.y-c.y)*nrm.y;
}

/* ---------- Race setup ---------- */
function setupRace(){
  state.cars = [];
  const names = ['أنت','صقر','برق','عاصفة'];
  const startIdx = 0;
  const base = track.centerline[startIdx];
  const tangent = track.tangents[startIdx];
  const normal = track.normals[startIdx];
  const behind = {x:-tangent.x, y:-tangent.y};

  for(let i=0;i<4;i++){
    const isPlayer = i===0;
    const color = isPlayer ? state.playerColor : CAR_COLORS[(CAR_COLORS.indexOf(state.playerColor)+i+1)%CAR_COLORS.length];
    const car = new Car(i, names[i], color, isPlayer);
    const row = Math.floor(i/2), col = i%2;
    const off = (col===0?-1:1) * 34;
    const back = row*54 + 20;
    car.x = base.x + normal.x*off + behind.x*back;
    car.y = base.y + normal.y*off + behind.y*back;
    car.angle = Math.atan2(tangent.y, tangent.x);
    car.progressIndex = startIdx;
    if(!isPlayer){
      const diffMul = state.difficulty==='easy'?0.86: state.difficulty==='hard'?1.06:0.96;
      car.aiSkill = diffMul + (Math.random()*0.06-0.03);
    }
    state.cars.push(car);
  }
  state.raceTime = 0;
  state.finishedOrder = [];
}

/* ---------- AI ---------- */
function updateAI(car, dt){
  const cl = track.centerline;
  const len = cl.length;
  const lookAhead = clamp(70 + Math.hypot(car.vx,car.vy)*0.28, 70, 260);
  const curIdx = nearestIndex(car, car.progressIndex);
  const steps = Math.round(lookAhead/ (track.totalLength/len));
  const targetIdx = (curIdx+steps)%len;
  const t = cl[targetIdx];
  const nrm = track.normals[targetIdx];
  const targetX = t.x + nrm.x*car.aiTargetOffset;
  const targetY = t.y + nrm.y*car.aiTargetOffset;
  const desiredAngle = Math.atan2(targetY-car.y, targetX-car.x);
  const diff = angleDiff(car.angle, desiredAngle);

  const aiInput = {throttle:true, brake:false, drift:false, nitro:false, steer:clamp(diff*2.2,-1,1)};

  // check curvature ahead to brake into corners
  const farIdx = (curIdx + Math.round(steps*2.2))%len;
  const farAngle = Math.atan2(cl[farIdx].y-t.y, cl[farIdx].x-t.x);
  const curTangentAngle = Math.atan2(track.tangents[curIdx].y, track.tangents[curIdx].x);
  const curveSharpness = Math.abs(angleDiff(curTangentAngle, farAngle));
  const speed = Math.hypot(car.vx,car.vy);
  const speedLimit = car.maxSpeed * car.aiSkill * clamp(1 - curveSharpness*0.9, 0.35, 1);
  if(speed > speedLimit){ aiInput.brake = true; aiInput.throttle=false; }
  if(Math.abs(diff) > 0.5 && speed>260) aiInput.drift = true;
  if(curveSharpness < 0.15 && speed < car.maxSpeed*car.aiSkill*0.9) aiInput.nitro = Math.random()<0.02 ? true : car.nitroActive;

  car.progressIndex = curIdx;
  applyCarPhysics(car, dt, aiInput);
}

/* ---------- Physics ---------- */
function applyCarPhysics(car, dt, inp){
  const f = {x:Math.cos(car.angle), y:Math.sin(car.angle)};

  const nitroBoost = (inp.nitro && car.nitro>0);
  car.nitroActive = nitroBoost;
  if(nitroBoost){ car.nitro = clamp(car.nitro-38*dt,0,100); }
  else { car.nitro = clamp(car.nitro+9*dt,0,100); }
  const accelPower = car.accel * (nitroBoost?1.7:1);
  const topSpeed = car.maxSpeed * (nitroBoost?1.28:1) * (car.offTrack?0.55:1);

  if(inp.throttle){ car.vx += f.x*accelPower*dt; car.vy += f.y*accelPower*dt; }
  if(inp.brake){
    const speed=Math.hypot(car.vx,car.vy);
    const fwd = car.vx*f.x+car.vy*f.y;
    if(fwd>10){ car.vx -= f.x*car.brakePower*dt; car.vy -= f.y*car.brakePower*dt; }
    else { car.vx -= f.x*car.accel*0.6*dt; car.vy -= f.y*car.accel*0.6*dt; }
  }

  const speedNow = Math.hypot(car.vx,car.vy);
  const fwdSpeed = car.vx*f.x + car.vy*f.y;
  let steerFactor = clamp(Math.abs(fwdSpeed)/car.maxSpeed, 0.18, 1);
  if(fwdSpeed < -5) steerFactor *= -1;
  car.angle += inp.steer * car.turnRate * dt * steerFactor;

  const f2 = {x:Math.cos(car.angle), y:Math.sin(car.angle)};
  const r2 = {x:-f2.y, y:f2.x};
  let vF = car.vx*f2.x + car.vy*f2.y;
  let vL = car.vx*r2.x + car.vy*r2.y;

  const gripLateral = inp.drift ? 0.965 : (car.offTrack?0.80:0.86);
  vL *= Math.pow(gripLateral, dt*60);
  vF *= Math.pow(car.offTrack?0.965:0.994, dt*60);
  car.driftSlide = clamp(Math.abs(vL)/240, 0, 1);

  car.vx = f2.x*vF + r2.x*vL;
  car.vy = f2.y*vF + r2.y*vL;

  const sp = Math.hypot(car.vx,car.vy);
  if(sp>topSpeed){ const k=topSpeed/sp; car.vx*=k; car.vy*=k; }

  car.x += car.vx*dt;
  car.y += car.vy*dt;

  const idx = nearestIndex(car, car.progressIndex);
  const off = signedOffset(car, idx);
  car.offTrack = Math.abs(off) > ROAD_HALF_WIDTH;
  const maxOff = ROAD_HALF_WIDTH + 340;
  if(Math.abs(off) > maxOff){
    const nrm = track.normals[idx], c = track.centerline[idx];
    const sign = Math.sign(off)||1;
    car.x = c.x + nrm.x*maxOff*sign;
    car.y = c.y + nrm.y*maxOff*sign;
    car.vx*=0.3; car.vy*=0.3;
  }

  // lap / progress tracking
  const prevIdx = car.progressIndex;
  const len = track.centerline.length;
  let fwdDelta = idx - prevIdx;
  if(fwdDelta < -len/2) fwdDelta += len;
  if(fwdDelta > len/2) fwdDelta -= len;
  car.progressIndex = idx;
  car.lapProgress = Math.max(0, car.lapProgress + fwdDelta);
  if(prevIdx > len*0.85 && idx < len*0.15 && !car.finished){
    if(car.lapProgress > len*0.6){
      car.lap += 1;
      car.lapProgress = 0;
      if(car.lap > state.laps){
        car.finished = true;
        car.finishTime = state.raceTime;
        state.finishedOrder.push(car.id);
        if(car.isPlayer) onPlayerFinish(car);
      } else if(car.isPlayer){
        beep(660,0.15,'triangle',0.15);
      }
    }
  }
  car.wrongWay = fwdDelta < -2 && Math.hypot(car.vx,car.vy) > 40;

  // smoke particles
  if((car.driftSlide>0.4 || car.offTrack) && Math.hypot(car.vx,car.vy)>60){
    car.smoke.push({x:car.x - f2.x*car.height*0.4, y:car.y - f2.y*car.height*0.4, life:1, r:6+Math.random()*6});
  }
  car.smoke.forEach(s=>{ s.life -= dt*1.4; s.x += (Math.random()-0.5)*10*dt; s.y += (Math.random()-0.5)*10*dt; s.r += dt*14; });
  car.smoke = car.smoke.filter(s=>s.life>0);
}

function onPlayerFinish(car){
  beep(880,0.3,'sawtooth',0.2);
}

/* ---------- Ranking ---------- */
function computeRanking(){
  state.cars.forEach(c=>{
    c._score = (c.finished? 999999 + (100000-c.finishTime) : c.lap*100000 + c.lapProgress);
  });
  const sorted = [...state.cars].sort((a,b)=>b._score-a._score);
  sorted.forEach((c,i)=> c.rank = i+1);
}

/* ---------- Camera / Rendering ---------- */
let camZoom = 0.62;
function worldToScreen(x,y,cam){
  return { x: (x-cam.x)*cam.zoom + W/2, y: (y-cam.y)*cam.zoom + H/2 };
}

function drawTrack(){
  const cl = track.centerline;
  ctx.save();
  // asphalt curb border
  ctx.beginPath();
  cl.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
  ctx.closePath();
  ctx.lineWidth = ROAD_HALF_WIDTH*2+22;
  ctx.lineJoin='round'; ctx.lineCap='round';
  ctx.setLineDash([44,44]);
  ctx.strokeStyle = '#e2e2e2';
  ctx.stroke();
  ctx.strokeStyle = '#d1394a';
  ctx.lineDashOffset = 44;
  ctx.stroke();
  ctx.setLineDash([]);

  // asphalt
  ctx.beginPath();
  cl.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
  ctx.closePath();
  ctx.lineWidth = ROAD_HALF_WIDTH*2;
  const grad = ctx.createLinearGradient(0,0,2400,1650);
  grad.addColorStop(0,'#3a3f47'); grad.addColorStop(1,'#2b2f36');
  ctx.strokeStyle = grad;
  ctx.stroke();

  // edge lines
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  cl.forEach((p,i)=>{
    const n = track.normals[i];
    const ex = p.x+n.x*(ROAD_HALF_WIDTH-8), ey=p.y+n.y*(ROAD_HALF_WIDTH-8);
    i===0?ctx.moveTo(ex,ey):ctx.lineTo(ex,ey);
  });
  ctx.closePath(); ctx.stroke();
  ctx.beginPath();
  cl.forEach((p,i)=>{
    const n = track.normals[i];
    const ex = p.x-n.x*(ROAD_HALF_WIDTH-8), ey=p.y-n.y*(ROAD_HALF_WIDTH-8);
    i===0?ctx.moveTo(ex,ey):ctx.lineTo(ex,ey);
  });
  ctx.closePath(); ctx.stroke();

  // center dashed line
  ctx.setLineDash([26,26]);
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255,214,0,0.75)';
  ctx.beginPath();
  cl.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
  ctx.closePath(); ctx.stroke();
  ctx.setLineDash([]);

  // finish line
  const p0 = cl[0], n0 = track.normals[0];
  const size = 10, count = Math.round(ROAD_HALF_WIDTH*2/size);
  for(let i=0;i<count;i++){
    const t=(i/count-0.5)*2*ROAD_HALF_WIDTH;
    ctx.fillStyle = (i%2===0)?'#fff':'#111';
    ctx.fillRect(p0.x+n0.x*t-5, p0.y+n0.y*t-5, 10,10);
  }
  ctx.restore();
}

function drawDecorations(cam){
  decorations.forEach(t=>{
    const s = worldToScreen(t.x,t.y,cam);
    const r = t.r*cam.zoom;
    if(s.x<-50||s.x>W+50||s.y<-50||s.y>H+50) return;
    if(t.kind==='tree'){
      ctx.fillStyle='rgba(0,0,0,0.25)';
      ctx.beginPath(); ctx.ellipse(s.x, s.y+r*0.6, r*0.9, r*0.35, 0,0,TAU); ctx.fill();
      ctx.fillStyle='#5b3a24'; ctx.fillRect(s.x-r*0.08, s.y-r*0.1, r*0.16, r*0.7);
      ctx.fillStyle='#2e7d4f';
      ctx.beginPath(); ctx.arc(s.x, s.y-r*0.4, r, 0, TAU); ctx.fill();
      ctx.fillStyle='#3c9a63';
      ctx.beginPath(); ctx.arc(s.x-r*0.3, s.y-r*0.6, r*0.7, 0, TAU); ctx.fill();
    } else {
      ctx.fillStyle='#6b6f76';
      ctx.beginPath(); ctx.arc(s.x,s.y,r*0.6,0,TAU); ctx.fill();
    }
  });
}

function drawCar(car, cam){
  const s = worldToScreen(car.x, car.y, cam);
  const z = cam.zoom;
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(car.angle);
  const w = car.width*z, h = car.height*z;

  ctx.fillStyle='rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(2*z,3*z, w*0.62, h*0.58,0,0,TAU); ctx.fill();

  ctx.fillStyle = '#111';
  [[-w*0.42,-h*0.32],[w*0.42,-h*0.32],[-w*0.42,h*0.32],[w*0.42,h*0.32]].forEach(([dx,dy])=>{
    ctx.fillRect(dx-2*z, dy-5*z, 4*z, 10*z);
  });

  ctx.fillStyle = car.color;
  roundRect(ctx, -w/2, -h/2, w, h, 7*z);
  ctx.fill();

  ctx.fillStyle='rgba(255,255,255,0.85)';
  roundRect(ctx, -w*0.36, -h*0.06, w*0.72, h*0.4, 5*z);
  ctx.fill();

  ctx.fillStyle='#fffbe0';
  ctx.fillRect(-w*0.38,-h/2, w*0.24, 5*z);
  ctx.fillRect(w*0.14,-h/2, w*0.24, 5*z);
  ctx.fillStyle='#ff3b5c';
  ctx.fillRect(-w*0.38,h/2-5*z, w*0.24, 5*z);
  ctx.fillRect(w*0.14,h/2-5*z, w*0.24, 5*z);

  if(car.nitroActive){
    ctx.fillStyle='rgba(0,229,255,0.85)';
    ctx.beginPath();
    ctx.moveTo(-w*0.2, h/2);
    ctx.lineTo(w*0.2, h/2);
    ctx.lineTo(0, h/2+18*z+Math.random()*10*z);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // smoke
  car.smoke.forEach(sm=>{
    const sp = worldToScreen(sm.x, sm.y, cam);
    ctx.fillStyle = `rgba(200,200,200,${sm.life*0.35})`;
    ctx.beginPath(); ctx.arc(sp.x,sp.y, sm.r*z, 0, TAU); ctx.fill();
  });

  if(!car.isPlayer){
    ctx.fillStyle='rgba(255,255,255,0.8)';
    ctx.font=`${12*Math.max(z,0.5)}px Tajawal`;
    ctx.textAlign='center';
    ctx.fillText(car.name, s.x, s.y - h*0.9 - 4);
  }
}

function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

function drawMinimap(){
  const w = mmCanvas.width, h = mmCanvas.height;
  mmCtx.clearRect(0,0,w,h);
  const pad = 10;
  const scale = Math.min((w-pad*2)/2400, (h-pad*2)/1650);
  mmCtx.save();
  mmCtx.translate(pad,pad);
  mmCtx.scale(scale,scale);
  mmCtx.strokeStyle='rgba(255,255,255,0.5)';
  mmCtx.lineWidth = ROAD_HALF_WIDTH*0.5;
  mmCtx.beginPath();
  track.centerline.forEach((p,i)=> i%3===0 && (i===0?mmCtx.moveTo(p.x,p.y):mmCtx.lineTo(p.x,p.y)));
  mmCtx.closePath(); mmCtx.stroke();
  state.cars.forEach(c=>{
    mmCtx.fillStyle = c.color;
    mmCtx.beginPath(); mmCtx.arc(c.x,c.y, c.isPlayer?32:24, 0, TAU); mmCtx.fill();
    if(c.isPlayer){ mmCtx.strokeStyle='#fff'; mmCtx.lineWidth=8; mmCtx.stroke(); }
  });
  mmCtx.restore();
}

/* ---------- HUD update ---------- */
const el = id => document.getElementById(id);
const lapValueEl = el('lap-value'), timeValueEl = el('time-value'), posValueEl = el('pos-value');
const speedValueEl = el('speed-value'), speedoFillEl = el('speedo-fill'), nitroFillEl = el('nitro-fill');
const wrongwayEl = el('wrongway');

function formatTime(t){
  const m = Math.floor(t/60), s = Math.floor(t%60), ms = Math.floor((t*100)%100);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(2,'0')}`;
}

function updateHUD(player){
  const speed = Math.hypot(player.vx,player.vy);
  const kmh = Math.round(speed*0.22);
  speedValueEl.textContent = kmh;
  const ratio = clamp(speed/(player.maxSpeed*1.28),0,1);
  const arcLen = 400*ratio;
  speedoFillEl.setAttribute('stroke-dasharray', `${arcLen} 400`);
  nitroFillEl.style.width = player.nitro+'%';
  lapValueEl.textContent = `${Math.min(player.lap,state.laps)}/${state.laps}`;
  timeValueEl.textContent = formatTime(state.raceTime);
  posValueEl.textContent = `${player.rank}/${state.cars.length}`;
  wrongwayEl.classList.toggle('hidden', !player.wrongWay);
  updateEngineSound(ratio);
}

/* ---------- Main loop ---------- */
let lastT = performance.now();
function loop(now){
  const dt = Math.min((now-lastT)/1000, 0.033);
  lastT = now;
  readInput();

  if(state.screen==='racing'){
    state.raceTime += dt;
    const player = state.cars[0];
    applyCarPhysics(player, dt, input);
    for(let i=1;i<state.cars.length;i++){
      if(!state.cars[i].finished) updateAI(state.cars[i], dt);
    }
    computeRanking();
    updateHUD(player);
    checkRaceEnd();
  }

  render();
  requestAnimationFrame(loop);
}

function checkRaceEnd(){
  const player = state.cars[0];
  if(player.finished && state.screen==='racing'){
    setTimeout(()=>{ if(state.screen==='racing') showResults(); }, 900);
    state.screen='finishing';
  }
}

function render(){
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
  W = window.innerWidth; H = window.innerHeight;

  const grad = ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0,'#173a20'); grad.addColorStop(1,'#0d2313');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,W,H);

  let cam = {x:1200,y:825,zoom:camZoom};
  if(state.cars.length){
    const player = state.cars[0];
    const speedRatio = clamp(Math.hypot(player.vx,player.vy)/player.maxSpeed,0,1);
    camZoom = lerp(camZoom, 0.78 - speedRatio*0.22, 0.06);
    cam = {x:player.x, y:player.y, zoom:camZoom};
  }

  ctx.save();
  ctx.translate(W/2,H/2);
  ctx.scale(cam.zoom, cam.zoom);
  ctx.translate(-cam.x,-cam.y);
  drawTrack();
  ctx.restore();

  drawDecorations(cam);

  if(state.cars.length){
    [...state.cars].sort((a,b)=>a.y-b.y).forEach(c=>drawCar(c,cam));
    drawMinimap();
  }
}

/* ---------- Screen management ---------- */
const screens = ['menu-screen','how-screen','pause-screen','results-screen'];
function showScreen(id){
  screens.forEach(s=> el(s).classList.toggle('hidden', s!==id));
}
function hideAllScreens(){ screens.forEach(s=> el(s).classList.add('hidden')); }

function goMenu(){
  state.screen='menu';
  hideAllScreens(); showScreen('menu-screen');
  el('hud').classList.add('hidden');
  document.getElementById('touch-controls').classList.add('hidden-x');
}

function startCountdown(){
  hideAllScreens();
  setupRace();
  el('hud').classList.remove('hidden');
  if('ontouchstart' in window || navigator.maxTouchPoints>0) el('touch-controls').classList.remove('hidden');
  state.screen='countdown';
  state.countdown = 3;
  const cd = el('countdown'), cdText = el('countdown-text');
  cd.classList.remove('hidden');
  const tick = ()=>{
    if(state.countdown<=0){
      cdText.textContent='انطلق!';
      beep(1000,0.25,'square',0.25);
      setTimeout(()=>{ cd.classList.add('hidden'); state.screen='racing'; }, 500);
      return;
    }
    cdText.textContent = state.countdown;
    beep(500,0.15,'sine',0.2);
    cdText.style.animation='none'; void cdText.offsetWidth; cdText.style.animation='countPop 1s ease';
    state.countdown--;
    setTimeout(tick, 800);
  };
  tick();
}

function pauseGame(){ state.screen='paused'; showScreen('pause-screen'); }
function resumeGame(){ state.screen='racing'; hideAllScreens(); }

function showResults(){
  state.screen='results';
  computeRanking();
  hideAllScreens(); showScreen('results-screen');
  const table = el('results-table');
  table.innerHTML='';
  const sorted = [...state.cars].sort((a,b)=>a.rank-b.rank);
  sorted.forEach(c=>{
    const row = document.createElement('div');
    row.className = 'result-row'+(c.isPlayer?' me':'');
    row.innerHTML = `<span class="rpos">${c.rank}</span><span class="rname" style="color:${c.color}">${c.name}</span><span class="rtime">${c.finished?formatTime(c.finishTime):'—'}</span>`;
    table.appendChild(row);
  });
  const player = state.cars[0];
  el('results-title').textContent = player.rank===1 ? '🏆 فزت بالسباق!' : `انتهى السباق — المركز ${player.rank}`;
}

/* ---------- UI wiring ---------- */
const colorPicker = el('color-picker');
CAR_COLORS.forEach((c,i)=>{
  const sw = document.createElement('div');
  sw.className='color-swatch'+(i===0?' active':'');
  sw.style.background=c;
  sw.addEventListener('click', ()=>{
    state.playerColor=c;
    [...colorPicker.children].forEach(x=>x.classList.remove('active'));
    sw.classList.add('active');
  });
  colorPicker.appendChild(sw);
});

document.querySelectorAll('#lap-picker .chip').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('#lap-picker .chip').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    state.laps = parseInt(btn.dataset.laps,10);
  });
});
document.querySelectorAll('#diff-picker .chip').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('#diff-picker .chip').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    state.difficulty = btn.dataset.diff;
  });
});

el('start-btn').addEventListener('click', ()=>{ initAudio(); startCountdown(); });
el('how-btn').addEventListener('click', ()=>{ hideAllScreens(); showScreen('how-screen'); });
el('back-btn').addEventListener('click', goMenu);
el('mute-btn').addEventListener('click', ()=>{
  state.muted = !state.muted;
  el('mute-btn').textContent = state.muted ? '🔇 الصوت: متوقف' : '🔊 الصوت: مفعّل';
});
el('pause-btn').addEventListener('click', pauseGame);
el('resume-btn').addEventListener('click', resumeGame);
el('restart-btn').addEventListener('click', startCountdown);
el('quit-btn').addEventListener('click', goMenu);
el('again-btn').addEventListener('click', startCountdown);
el('menu-btn').addEventListener('click', goMenu);

goMenu();
requestAnimationFrame(loop);
})();
