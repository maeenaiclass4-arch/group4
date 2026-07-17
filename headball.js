(() => {
'use strict';
const $ = id => document.getElementById(id);

let match = null;       // {p1:{name,country,color}, p2:{...}}
let raf = null;
let gameState = null;

function initHeadballUI(){
  const select = $('hb-year-select');
  [...WORLD_CUPS].sort((a,b)=>b.year-a.year).forEach(wc=>{
    const opt = document.createElement('option');
    opt.value = wc.year;
    opt.textContent = `كأس العالم ${wc.year} — نهائي ${wc.host}`;
    select.appendChild(opt);
  });
  select.addEventListener('change', updatePreview);
  updatePreview();

  $('hb-start-btn').addEventListener('click', ()=>{
    setupMatchFromYear(parseInt(select.value,10));
    $('hb-game-wrap').classList.remove('hidden');
    $('hb-result').classList.add('hidden');
    startGame();
    $('hb-game-wrap').scrollIntoView({behavior:'smooth', block:'start'});
  });
  $('hb-restart-btn').addEventListener('click', ()=>{
    $('hb-result').classList.add('hidden');
    startGame();
  });
  $('hb-quit-btn').addEventListener('click', ()=>{
    stopGame();
    $('hb-game-wrap').classList.add('hidden');
  });
}

/* Real-ish look-alike palette for well-known finalists, keyed by the exact
   Arabic name used in data.js finalStars. Falls back to a varied default
   for names not listed. */
const PLAYER_LOOK = {
  'هيكتور كاستро': {skin:'#c98a56', hair:'#1c1410'},
  'غييرمو ستابيلي': {skin:'#c98a56', hair:'#241a12'},
  'جوزيبي مياتزا': {skin:'#d9a879', hair:'#1c1410'},
  'أولدريتش نيدلي': {skin:'#f0c6a0', hair:'#3a2418'},
  'سيلفيو بيولا': {skin:'#d9a879', hair:'#1c1410'},
  'جيولا زنغيلير': {skin:'#f0c6a0', hair:'#4a2f1c'},
  'ألسيدس غيغيا': {skin:'#c98a56', hair:'#1c1410'},
  'زيزينيو': {skin:'#8d5a34', hair:'#111111'},
  'هيلموت رآن': {skin:'#f0c6a0', hair:'#3a2418'},
  'فيرينتس بوشكاش': {skin:'#f0c6a0', hair:'#241a12'},
  'بيليه': {skin:'#5c3a22', hair:'#111111'},
  'نيلز ليدهولم': {skin:'#f0c6a0', hair:'#6b4423'},
  'غارينشا': {skin:'#8d5a34', hair:'#111111'},
  'جوزيف ماسوبوست': {skin:'#f0c6a0', hair:'#3a2418'},
  'بوبي تشارلتون': {skin:'#f0c6a0', hair:'#6b4423'},
  'فرانتس بيكنباور': {skin:'#f0c6a0', hair:'#6b4423'},
  'لويجي ريفا': {skin:'#d9a879', hair:'#1c1410'},
  'غيرد مولر': {skin:'#f0c6a0', hair:'#6b4423'},
  'يوهان كرويف': {skin:'#f0c6a0', hair:'#6b4423'},
  'ماريو كيمبيس': {skin:'#c98a56', hair:'#1c1410'},
  'روب رينسنبرينك': {skin:'#f0c6a0', hair:'#6b4423'},
  'باولو روسي': {skin:'#d9a879', hair:'#1c1410'},
  'كارل هاينز رومينيغه': {skin:'#f0c6a0', hair:'#6b4423'},
  'دييغو مارادونا': {skin:'#c98a56', hair:'#161010'},
  'لوتار ماتيوس': {skin:'#f0c6a0', hair:'#3a2418'},
  'روماريو': {skin:'#8d5a34', hair:'#111111'},
  'روبرتو باجيو': {skin:'#d9a879', hair:'#1c1410'},
  'زين الدين زيدان': {skin:'#d9a879', hair:'#1c1410'},
  'رونالدو': {skin:'#8d5a34', hair:'#111111'},
  'أوليفر كان': {skin:'#f0c6a0', hair:'#3a2418'},
  'فابيو كانافارو': {skin:'#d9a879', hair:'#1c1410'},
  'أندريس إنييستا': {skin:'#d9a879', hair:'#1c1410'},
  'ويسلي سنايدر': {skin:'#f0c6a0', hair:'#6b4423'},
  'ماريو غوتزه': {skin:'#f0c6a0', hair:'#6b4423'},
  'ليونيل ميسي': {skin:'#c98a56', hair:'#241a12'},
  'كيليان مبابي': {skin:'#4a2f1e', hair:'#0c0c0c'},
  'لوكا مودريتش': {skin:'#f0c6a0', hair:'#3a2418'},
};
const DEFAULT_LOOKS = [
  {skin:'#f0c6a0', hair:'#3a2418'}, {skin:'#d9a879', hair:'#1c1410'},
  {skin:'#c98a56', hair:'#241a12'}, {skin:'#8d5a34', hair:'#111111'},
];
function lookFor(name, seed){
  return PLAYER_LOOK[name] || DEFAULT_LOOKS[seed % DEFAULT_LOOKS.length];
}

function setupMatchFromYear(year){
  const wc = WORLD_CUPS.find(w=>w.year===year);
  const [c1a,c1b] = countryColor(wc.finalStars.a.country);
  const [c2a,c2b] = countryColor(wc.finalStars.b.country);
  const lookA = lookFor(wc.finalStars.a.name, 0);
  const lookB = lookFor(wc.finalStars.b.name, 1);
  match = {
    year: wc.year,
    p1:{ name: wc.finalStars.a.name, country: wc.finalStars.a.country, color:c1a, color2:c1b, skin:lookA.skin, hair:lookA.hair },
    p2:{ name: wc.finalStars.b.name, country: wc.finalStars.b.country, color:c2a, color2:c2b, skin:lookB.skin, hair:lookB.hair },
  };
}

function updatePreview(){
  const year = parseInt($('hb-year-select').value,10);
  setupMatchFromYear(year);
  const box = $('hb-vs-preview');
  box.innerHTML = `
    <div class="hb-vs-card"><span class="hb-vs-dot" style="background:${match.p1.color}"></span>${match.p1.name} — ${match.p1.country}</div>
    <div class="hb-vs-mid">VS</div>
    <div class="hb-vs-card"><span class="hb-vs-dot" style="background:${match.p2.color}"></span>${match.p2.name} — ${match.p2.country}</div>
  `;
}

/* ---------------- Game engine ---------------- */
const FIELD_W = 900, FIELD_H = 420, GROUND_Y = 380;
const GOAL_TOP = 230, GOAL_H = 150, GOAL_W = 16;
const GRAVITY = 1500, PLAYER_SPEED = 300, JUMP_V = 620, BALL_R = 14, HEAD_R = 32;

function newPlayerState(side){
  const isLeft = side==='left';
  return {
    x: isLeft ? 200 : 700, y:0, vy:0, vx:0, grounded:true,
    minX: isLeft?60:430, maxX: isLeft?470:840,
    facing: isLeft?1:-1, kickCooldown:0,
    animPhase:0, kickTimer:0, celebrateTimer:0, squash:1, stretch:1,
    aiGuardX: isLeft?200:700,
  };
}

function resetGameState(){
  gameState = {
    running:true, time:60, lastT:performance.now(),
    p1: newPlayerState('left'),
    p2: newPlayerState('right'),
    ball:{x:FIELD_W/2, y:GROUND_Y-60, vx:0, vy:0, spin:0, trail:[]},
    score1:0, score2:0,
    confetti:[], shake:0, flash:0, hitstop:0,
    keys:{},
  };
}

const keyState = {};
window.addEventListener('keydown', e=>{ keyState[e.code]=true; });
window.addEventListener('keyup', e=>{ keyState[e.code]=false; });

/* ---------------- Touch controls (mobile) ---------------- */
function bindHbTouch(id, code){
  const el = $(id);
  if(!el) return;
  const press = e=>{ e.preventDefault(); keyState[code]=true; el.classList.add('pressed'); };
  const release = e=>{ e.preventDefault(); keyState[code]=false; el.classList.remove('pressed'); };
  el.addEventListener('touchstart', press, {passive:false});
  el.addEventListener('touchend', release, {passive:false});
  el.addEventListener('touchcancel', release, {passive:false});
  el.addEventListener('mousedown', press);
  window.addEventListener('mouseup', release);
}
bindHbTouch('hb-t-left', 'KeyA');
bindHbTouch('hb-t-right', 'KeyD');
bindHbTouch('hb-t-jump', 'KeyW');
if('ontouchstart' in window || navigator.maxTouchPoints > 0){
  const tc = $('hb-touch-controls');
  if(tc) tc.classList.add('active');
}

function stopGame(){
  if(raf) cancelAnimationFrame(raf);
  raf = null;
  gameState = null;
}

function startGame(){
  stopGame();
  resetGameState();
  $('hb-p1-name').textContent = match.p1.name;
  $('hb-p2-name').textContent = match.p2.name;
  $('hb-p1-score').textContent = '0';
  $('hb-p2-score').textContent = '0';
  const canvas = $('hb-canvas');
  const ctx = canvas.getContext('2d');
  gameState.lastT = performance.now();
  gameState.timerAcc = 0;

  function tick(now){
    let dt = Math.min((now - gameState.lastT)/1000, 0.033);
    gameState.lastT = now;
    if(gameState.running){
      if(gameState.hitstop > 0){
        gameState.hitstop -= dt;
        dt *= 0.08; // brief slow-motion impact frame instead of a hard freeze
      }
      updatePhysics(dt);
      updateFx(dt);
      gameState.timerAcc += dt;
      if(gameState.timerAcc >= 1){
        gameState.timerAcc -= 1;
        gameState.time -= 1;
        if(gameState.time <= 0){
          gameState.time = 0;
          endGame();
        }
      }
      $('hb-timer').textContent = formatTime(gameState.time);
    }
    render(ctx);
    if(gameState && gameState.running !== null) raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
}

function formatTime(t){
  const m = Math.floor(t/60), s = t%60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function updatePhysics(dt){
  const gs = gameState;
  handlePlayerInput(gs.p1, {left:'KeyA', right:'KeyD', jump:'KeyW'}, dt);
  aiControl(gs.p2, gs.ball, dt);

  [gs.p1, gs.p2].forEach(p=>{
    const wasGrounded = p.grounded;
    p.y += p.vy*dt;
    p.vy += GRAVITY*dt;
    if(p.y >= 0){
      p.y = 0;
      if(!wasGrounded){ p.squash = 1.28; p.stretch = 0.78; } // landing squash
      p.vy = 0; p.grounded = true;
    } else { p.grounded=false; }
    // ease squash/stretch back to neutral
    p.squash += (1-p.squash) * Math.min(1, dt*10);
    p.stretch += (1-p.stretch) * Math.min(1, dt*10);
    p.x = Math.max(p.minX, Math.min(p.maxX, p.x));
    if(p.kickCooldown>0) p.kickCooldown -= dt;
    if(p.kickTimer>0) p.kickTimer -= dt;
    if(p.celebrateTimer>0) p.celebrateTimer -= dt;
    if(p.grounded && Math.abs(p.vx) > 15) p.animPhase += dt * (7 + Math.abs(p.vx)*0.01);
  });

  // ball physics
  const b = gs.ball;
  b.vy += GRAVITY*dt;
  b.x += b.vx*dt;
  b.y += b.vy*dt;
  b.vx *= Math.pow(0.92, dt);          // very light air resistance (framerate-independent)
  b.spin += b.vx*dt*0.045;

  // trail
  const speed = Math.hypot(b.vx,b.vy);
  if(speed > 260){
    b.trail.push({x:b.x,y:b.y,life:1});
  }
  b.trail.forEach(t=> t.life -= dt*4.5);
  b.trail = b.trail.filter(t=>t.life>0).slice(-10);

  // ceiling
  if(b.y < BALL_R){ b.y = BALL_R; b.vy *= -0.5; }

  // ground: real bounce only on real impact speed, gentle rolling friction otherwise.
  // (Bug fix: previously vx was cut by 15% on *every single frame* the ball
  // rested on the ground, so it stopped after moving barely an inch.)
  if(b.y > GROUND_Y - BALL_R){
    b.y = GROUND_Y - BALL_R;
    if(b.vy > 90){
      b.vy *= -0.48;
    } else {
      b.vy = 0;
    }
  }
  if(b.y >= GROUND_Y - BALL_R - 0.5 && b.vy === 0){
    b.vx *= Math.pow(0.5, dt); // rolling friction, framerate-independent
    if(Math.abs(b.vx) < 4) b.vx = 0;
  }

  // side walls / goal detection
  const inGoalHeight = b.y > GOAL_TOP && b.y < GOAL_TOP+GOAL_H;
  if(b.x < BALL_R){
    if(inGoalHeight && b.x < GOAL_W){
      scoreGoal(2);
    } else {
      b.x = BALL_R; b.vx *= -0.7;
    }
  }
  if(b.x > FIELD_W - BALL_R){
    if(inGoalHeight && b.x > FIELD_W-GOAL_W){
      scoreGoal(1);
    } else {
      b.x = FIELD_W - BALL_R; b.vx *= -0.7;
    }
  }

  // player-ball collisions (head + body approximated as circle)
  [gs.p1, gs.p2].forEach(p=>{
    const headY = GROUND_Y - 72 + p.y;
    const dx = b.x - p.x, dy = b.y - headY;
    const d = Math.hypot(dx,dy);
    const minD = HEAD_R + BALL_R - 4;
    if(d < minD && d>0.01){
      const nx = dx/d, ny = dy/d;
      const overlap = minD - d;
      b.x += nx*overlap; b.y += ny*overlap;
      const power = 500 + Math.abs(p.vy)*0.3;
      b.vx = nx*power + p.vx*0.6;
      b.vy = ny*power - 120;
      p.kickTimer = 0.22;
    }
    // body/leg collision (lower box) - simple push
    const bodyY = GROUND_Y - 22 + p.y;
    const dx2 = b.x - p.x, dy2 = b.y - bodyY;
    const d2 = Math.hypot(dx2,dy2);
    const minD2 = 24 + BALL_R;
    if(d2 < minD2 && d2>0.01){
      const nx = dx2/d2, ny = dy2/d2;
      const overlap = minD2-d2;
      b.x += nx*overlap; b.y += ny*overlap;
      b.vx += nx*380; b.vy += ny*380 - 200;
      p.kickTimer = 0.22;
    }
  });
}

function updateFx(dt){
  const gs = gameState;
  gs.shake = Math.max(0, gs.shake - dt*26);
  gs.flash = Math.max(0, gs.flash - dt*2.2);
  gs.confetti.forEach(c=>{
    c.vy += 900*dt;
    c.x += c.vx*dt;
    c.y += c.vy*dt;
    c.rot += c.vrot*dt;
    c.life -= dt*0.7;
  });
  gs.confetti = gs.confetti.filter(c=>c.life>0 && c.y < FIELD_H+20);
}

function handlePlayerInput(p, keys, dt){
  let dir = 0;
  if(keyState[keys.left]) dir -= 1;
  if(keyState[keys.right]) dir += 1;
  p.vx = dir*PLAYER_SPEED;
  p.x += p.vx*dt;
  if(dir!==0) p.facing = dir;
  if(keyState[keys.jump] && p.grounded){ p.vy = -JUMP_V; p.grounded=false; p.squash=0.82; p.stretch=1.22; }
}

/* A proper opponent: predicts where the ball is heading, chases it
   aggressively when it's on its side, jumps to meet incoming balls, and
   falls back to guarding its goal line when the ball is far away. */
function aiControl(p, ball, dt){
  const lookaheadT = 0.18;
  const predictedX = ball.x + ball.vx*lookaheadT;
  const ballOnMySide = ball.x > (p.minX+p.maxX)/2 - 260;
  const guardX = (p.minX+p.maxX)/2 + (p.facing===1 ? -40 : 40);
  const targetX = ballOnMySide
    ? Math.max(p.minX, Math.min(p.maxX, predictedX))
    : Math.max(p.minX, Math.min(p.maxX, guardX + (ball.x-FIELD_W/2)*0.08));

  const diff = targetX - p.x;
  const dir = Math.abs(diff) < 6 ? 0 : Math.sign(diff);
  const speedMul = ballOnMySide ? 1 : 0.6;
  p.vx = dir*PLAYER_SPEED*speedMul;
  p.x += p.vx*dt;
  if(Math.abs(ball.x - p.x) < 40) p.facing = ball.x > p.x ? 1 : -1;
  else if(dir!==0) p.facing = dir;

  const ballClose = Math.abs(ball.x - p.x) < 95;
  const ballAbove = ball.y < GROUND_Y - 30 && ball.y > 30;
  const ballComingDown = ball.vy > -40;
  if(p.grounded && ballClose && ballAbove && ballComingDown && Math.random() < 0.28){
    p.vy = -JUMP_V; p.grounded=false; p.squash=0.82; p.stretch=1.22;
  }
}

function spawnConfetti(gs, x, colors){
  for(let i=0;i<26;i++){
    const ang = -Math.PI/2 + (Math.random()-0.5)*2.2;
    const spd = 220 + Math.random()*260;
    gs.confetti.push({
      x, y: GROUND_Y-70,
      vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd,
      rot: Math.random()*Math.PI*2, vrot:(Math.random()-0.5)*14,
      w: 5+Math.random()*4, h:8+Math.random()*5,
      color: colors[i%colors.length], life:1,
    });
  }
}

function scoreGoal(who){
  const gs = gameState;
  const scorer = who===1 ? gs.p1 : gs.p2;
  if(who===1){ gs.score1++; $('hb-p1-score').textContent = gs.score1; }
  else { gs.score2++; $('hb-p2-score').textContent = gs.score2; }
  scorer.celebrateTimer = 1.1;
  gs.shake = 14; gs.flash = 1; gs.hitstop = 0.12;
  spawnConfetti(gs, scorer.x, [match.p1.color, match.p1.color2, match.p2.color, match.p2.color2, '#ffd23f']);
  gs.ball.x = FIELD_W/2; gs.ball.y = GROUND_Y-60; gs.ball.vx=0; gs.ball.vy=0; gs.ball.trail=[];
  gs.p1.x = 200; gs.p2.x = 700;
}

function endGame(){
  gameState.running = false;
  const r = $('hb-result');
  r.classList.remove('hidden');
  const s1 = gameState.score1, s2 = gameState.score2;
  let msg;
  if(s1>s2) msg = `🏆 ${match.p1.name} فاز ${s1} - ${s2}!`;
  else if(s2>s1) msg = `🏆 ${match.p2.name} فاز ${s2} - ${s1}!`;
  else msg = `🤝 تعادل ${s1} - ${s2}`;
  r.textContent = msg;
}

/* ---------------- Rendering ---------------- */
function darken(hex, amt){
  const c = hex.replace('#','');
  if(c.length!==6) return hex;
  const n = parseInt(c,16);
  let r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  r = Math.max(0, Math.round(r*(1-amt)));
  g = Math.max(0, Math.round(g*(1-amt)));
  b = Math.max(0, Math.round(b*(1-amt)));
  return `rgb(${r},${g},${b})`;
}

function roundRectPath(ctx,x,y,w,h,r){
  if(ctx.roundRect){ ctx.beginPath(); ctx.roundRect(x,y,w,h,r); return; }
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

// Head-Ball-style proportions: a big round head sits almost directly on a
// small jersey, with short stubby legs and oversized boots.
function legPose(p){
  const kicking = p.kickTimer > 0;
  if(!p.grounded){
    const k = kicking ? 1 : 0.5;
    return {
      back: {x:-6*p.facing, y:-4, len:10},
      front:{x:(7+k*11)*p.facing, y:kicking?-10:-1, len:11},
    };
  }
  if(Math.abs(p.vx) > 12){
    const s = Math.sin(p.animPhase);
    return {
      back: {x:-8*s*p.facing, y:0, len:11},
      front:{x:8*s*p.facing, y:0, len:11},
    };
  }
  return { back:{x:-4*p.facing, y:0, len:11}, front:{x:4*p.facing, y:0, len:11} };
}

function drawLeg(ctx, hipX, hipY, leg, shortsColor, bootColor){
  const kneeX = hipX + leg.x*0.5, kneeY = hipY + leg.len*0.5;
  const footX = hipX + leg.x, footY = hipY + leg.len + leg.y;
  ctx.strokeStyle = shortsColor;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(hipX, hipY);
  ctx.quadraticCurveTo(kneeX, kneeY, footX, footY);
  ctx.stroke();
  // big boot (Head Ball style)
  ctx.fillStyle = bootColor;
  ctx.beginPath();
  ctx.ellipse(footX, footY, 9, 6, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.ellipse(footX, footY-1.5, 3, 1.6, 0, 0, Math.PI*2);
  ctx.fill();
}

function drawPlayer(ctx, p, color, color2, skin, hair, name){
  const feetY = GROUND_Y + p.y;
  const celebrating = p.celebrateTimer > 0;

  // shadow (stays on the ground even while jumping)
  ctx.fillStyle='rgba(0,0,0,0.32)';
  ctx.beginPath(); ctx.ellipse(p.x, GROUND_Y+4, 24, 6, 0, 0, Math.PI*2); ctx.fill();

  const shortsColor = darken(color,0.4);
  const bootColor = '#1a1a1a';
  const pose = legPose(p);

  ctx.save();
  ctx.translate(p.x, feetY);
  ctx.scale(p.stretch, p.squash);

  // legs (drawn first so torso overlaps the hip)
  const hipY = -12;
  drawLeg(ctx, 0, hipY, pose.back, shortsColor, bootColor);
  drawLeg(ctx, 0, hipY, pose.front, shortsColor, bootColor);

  // torso (small jersey, Head-Ball proportions)
  const torsoTop = -34, torsoH = 22, torsoW = 34;
  roundRectPath(ctx, -torsoW/2, torsoTop, torsoW, torsoH, 8);
  ctx.fillStyle = color;
  ctx.fill();
  // jersey side trim
  ctx.fillStyle = color2;
  ctx.fillRect(-torsoW/2, torsoTop, 5, torsoH);
  ctx.fillRect(torsoW/2-5, torsoTop, 5, torsoH);
  ctx.fillRect(-torsoW/2, torsoTop+torsoH-5, torsoW, 5);
  // number
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.font = '800 12px Tajawal, Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(p.facing===1 ? '10':'7', 0, torsoTop+torsoH/2+1);

  // arms (short, mostly tucked behind the big head like the reference game)
  ctx.strokeStyle = color;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  const armY = torsoTop+5;
  if(celebrating){
    ctx.beginPath(); ctx.moveTo(-torsoW/2+2, armY); ctx.lineTo(-torsoW/2-11, armY-22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(torsoW/2-2, armY); ctx.lineTo(torsoW/2+11, armY-22); ctx.stroke();
  } else {
    const swing = p.grounded && Math.abs(p.vx)>12 ? Math.sin(p.animPhase+Math.PI)*6 : 1;
    ctx.beginPath(); ctx.moveTo(-torsoW/2+2, armY); ctx.lineTo(-torsoW/2-8, armY+10+swing); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(torsoW/2-2, armY); ctx.lineTo(torsoW/2+8, armY+10-swing); ctx.stroke();
  }

  // big round head sitting almost directly on the jersey (little to no neck)
  const headCY = torsoTop - HEAD_R*0.62;
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.arc(0, headCY, HEAD_R, 0, Math.PI*2); ctx.fill();

  // hair (short crop)
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.arc(0, headCY-3, HEAD_R*1.0, Math.PI*1.04, Math.PI*1.96);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(p.facing*HEAD_R*0.5, headCY-HEAD_R*0.62, HEAD_R*0.46, HEAD_R*0.32, 0, 0, Math.PI*2);
  ctx.fill();

  // ears
  ctx.fillStyle = skin;
  [-1,1].forEach(side=>{
    ctx.beginPath(); ctx.ellipse(side*HEAD_R*0.92, headCY+2, HEAD_R*0.14, HEAD_R*0.2, 0, 0, Math.PI*2); ctx.fill();
  });

  // face
  ctx.fillStyle = '#20140c';
  ctx.beginPath(); ctx.arc(p.facing*9, headCY+2, 2.6, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(p.facing*9-p.facing*11, headCY+2, 2.1, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#20140c'; ctx.lineWidth = 1.6; ctx.lineCap='round';
  if(celebrating){
    ctx.beginPath(); ctx.arc(p.facing*2, headCY+10, 7, 0.1*Math.PI, 0.9*Math.PI); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(p.facing*-3, headCY+11); ctx.lineTo(p.facing*5, headCY+11); ctx.stroke();
  }

  ctx.restore();

  // name tag (kept unscaled so it never looks squashed)
  const headWorldY = feetY + (torsoTop - HEAD_R*0.62)*p.squash;
  ctx.fillStyle='#fff';
  ctx.font='600 12px Tajawal, Segoe UI, sans-serif';
  ctx.textAlign='center';
  ctx.textBaseline='alphabetic';
  ctx.fillText(name, p.x, headWorldY - HEAD_R - 8);
}

function polygonPath(ctx,cx,cy,r,sides,rot){
  ctx.moveTo(cx+r*Math.cos(rot), cy+r*Math.sin(rot));
  for(let i=1;i<=sides;i++){
    const a = rot + i*(Math.PI*2/sides);
    ctx.lineTo(cx+r*Math.cos(a), cy+r*Math.sin(a));
  }
}

function drawBall(ctx, b){
  b.trail.forEach(t=>{
    ctx.fillStyle = `rgba(255,255,255,${t.life*0.18})`;
    ctx.beginPath(); ctx.arc(t.x, t.y, BALL_R*0.85, 0, Math.PI*2); ctx.fill();
  });
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.spin);
  ctx.fillStyle = '#f3f3f0';
  ctx.beginPath(); ctx.arc(0,0,BALL_R,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#161616';
  for(let i=0;i<5;i++){
    const a = i*(Math.PI*2/5) - Math.PI/2;
    const px = Math.cos(a)*BALL_R*0.52, py = Math.sin(a)*BALL_R*0.52;
    ctx.beginPath(); polygonPath(ctx, px, py, BALL_R*0.28, 5, a); ctx.fill();
  }
  ctx.beginPath(); polygonPath(ctx, 0, 0, BALL_R*0.24, 5, Math.PI/2); ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,0.35)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(0,0,BALL_R,0,Math.PI*2); ctx.stroke();
  ctx.restore();
}

// Fixed (seeded-looking but stable) crowd dots so the stadium doesn't flicker every frame
const CROWD_DOTS = (() => {
  const palette = ['#e0c9a6','#caa473','#8a6b4d','#3a3a3a','#5c4a3a','#c2b280','#7a5c3e'];
  const dots = [];
  let seed = 42;
  const rnd = () => { seed = (seed*1103515245+12345)&0x7fffffff; return (seed/0x7fffffff); };
  for(let i=0;i<170;i++){
    dots.push({ x: rnd()*FIELD_W, y: 6+rnd()*40, r: 2+rnd()*2.2, c: palette[Math.floor(rnd()*palette.length)] });
  }
  return dots;
})();

function drawGoalNet(ctx, x0, y0, w, h){
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  for(let i=1;i<6;i++){
    const gx = x0 + (w/6)*i;
    ctx.beginPath(); ctx.moveTo(gx, y0); ctx.lineTo(gx, y0+h); ctx.stroke();
  }
  for(let j=1;j<8;j++){
    const gy = y0 + (h/8)*j;
    ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x0+w, gy); ctx.stroke();
  }
}

function drawStadium(ctx){
  // sky behind the crowd
  const skyGrad = ctx.createLinearGradient(0,0,0,60);
  skyGrad.addColorStop(0,'#0a1c12'); skyGrad.addColorStop(1,'#0e2416');
  ctx.fillStyle = skyGrad; ctx.fillRect(0,0,FIELD_W,60);
  // crowd band
  ctx.fillStyle = '#152a1c';
  ctx.fillRect(0,0,FIELD_W,58);
  CROWD_DOTS.forEach(d=>{ ctx.fillStyle = d.c; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI*2); ctx.fill(); });
  ctx.fillStyle = 'rgba(10,20,14,0.55)';
  ctx.fillRect(0,44,FIELD_W,14);
  // floodlight glows
  [70, FIELD_W-70].forEach(fx=>{
    const g = ctx.createRadialGradient(fx,-10,4,fx,-10,120);
    g.addColorStop(0,'rgba(255,250,210,0.35)');
    g.addColorStop(1,'rgba(255,250,210,0)');
    ctx.fillStyle = g;
    ctx.fillRect(fx-120,-20,240,180);
  });
  // pitch base
  const grad = ctx.createLinearGradient(0,58,0,GROUND_Y);
  grad.addColorStop(0,'#173c22'); grad.addColorStop(1,'#0e2b1a');
  ctx.fillStyle = grad; ctx.fillRect(0,58,FIELD_W,GROUND_Y-58);
  // mow stripes on the ground band
  const stripeW = 46;
  for(let x=0, i=0; x<FIELD_W; x+=stripeW, i++){
    ctx.fillStyle = i%2===0 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.035)';
    ctx.fillRect(x, GROUND_Y, stripeW, FIELD_H-GROUND_Y);
  }
  ctx.fillStyle = '#1c8a4c';
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillRect(0,GROUND_Y,FIELD_W,FIELD_H-GROUND_Y);
  ctx.globalCompositeOperation = 'source-over';
}

function drawConfetti(ctx, gs){
  gs.confetti.forEach(c=>{
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    ctx.globalAlpha = Math.max(0, c.life);
    ctx.fillStyle = c.color;
    ctx.fillRect(-c.w/2, -c.h/2, c.w, c.h);
    ctx.restore();
  });
  ctx.globalAlpha = 1;
}

function render(ctx){
  ctx.clearRect(0,0,FIELD_W,FIELD_H);
  const gs = gameState;
  const shakeX = gs ? (Math.random()-0.5)*gs.shake : 0;
  const shakeY = gs ? (Math.random()-0.5)*gs.shake*0.6 : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  drawStadium(ctx);

  // pitch lines
  ctx.strokeStyle='rgba(255,255,255,0.45)';
  ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(0,GROUND_Y); ctx.lineTo(FIELD_W,GROUND_Y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(FIELD_W/2,58); ctx.lineTo(FIELD_W/2,GROUND_Y); ctx.stroke();
  ctx.beginPath(); ctx.arc(FIELD_W/2,GROUND_Y,50,Math.PI,0); ctx.stroke();

  // goal frames + nets
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(0, GOAL_TOP, GOAL_W, GOAL_H);
  ctx.fillRect(FIELD_W-GOAL_W, GOAL_TOP, GOAL_W, GOAL_H);
  drawGoalNet(ctx, 0, GOAL_TOP, GOAL_W, GOAL_H);
  drawGoalNet(ctx, FIELD_W-GOAL_W, GOAL_TOP, GOAL_W, GOAL_H);
  ctx.strokeStyle='#fff'; ctx.lineWidth=4;
  ctx.strokeRect(0, GOAL_TOP, GOAL_W, GOAL_H);
  ctx.strokeRect(FIELD_W-GOAL_W, GOAL_TOP, GOAL_W, GOAL_H);

  if(gs){
    drawPlayer(ctx, gs.p1, match.p1.color, match.p1.color2, match.p1.skin, match.p1.hair, match.p1.name);
    drawPlayer(ctx, gs.p2, match.p2.color, match.p2.color2, match.p2.skin, match.p2.hair, match.p2.name);
    drawBall(ctx, gs.ball);
    drawConfetti(ctx, gs);
  }

  ctx.restore();

  if(gs && gs.flash > 0){
    ctx.fillStyle = `rgba(255,255,255,${gs.flash*0.35})`;
    ctx.fillRect(0,0,FIELD_W,FIELD_H);
  }
}

window.initHeadballUI = initHeadballUI;
})();
