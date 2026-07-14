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

function setupMatchFromYear(year){
  const wc = WORLD_CUPS.find(w=>w.year===year);
  const [c1a,c1b] = countryColor(wc.finalStars.a.country);
  const [c2a,c2b] = countryColor(wc.finalStars.b.country);
  match = {
    year: wc.year,
    p1:{ name: wc.finalStars.a.name, country: wc.finalStars.a.country, color:c1a, color2:c1b },
    p2:{ name: wc.finalStars.b.name, country: wc.finalStars.b.country, color:c2a, color2:c2b },
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
const GRAVITY = 1500, PLAYER_SPEED = 300, JUMP_V = 620, BALL_R = 14, HEAD_R = 26;

function newPlayerState(side){
  const isLeft = side==='left';
  return {
    x: isLeft ? 200 : 700, y:0, vy:0, vx:0, grounded:true,
    minX: isLeft?60:470, maxX: isLeft?430:840,
    facing: isLeft?1:-1, kickCooldown:0,
  };
}

function resetGameState(){
  gameState = {
    running:true, time:60, lastT:performance.now(),
    p1: newPlayerState('left'), p2: newPlayerState('right'),
    ball:{x:FIELD_W/2, y:GROUND_Y-60, vx:0, vy:0},
    score1:0, score2:0,
    keys:{},
  };
}

const keyState = {};
window.addEventListener('keydown', e=>{ keyState[e.code]=true; });
window.addEventListener('keyup', e=>{ keyState[e.code]=false; });

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
    const dt = Math.min((now - gameState.lastT)/1000, 0.033);
    gameState.lastT = now;
    if(gameState.running){
      updatePhysics(dt);
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
    p.y += p.vy*dt;
    p.vy += GRAVITY*dt;
    if(p.y >= 0){ p.y = 0; p.vy = 0; p.grounded = true; } else { p.grounded=false; }
    p.x = Math.max(p.minX, Math.min(p.maxX, p.x));
    if(p.kickCooldown>0) p.kickCooldown -= dt;
  });

  // ball physics
  const b = gs.ball;
  b.vy += GRAVITY*dt;
  b.x += b.vx*dt;
  b.y += b.vy*dt;
  b.vx *= 0.995;

  // ground bounce
  if(b.y > GROUND_Y - BALL_R){
    b.y = GROUND_Y - BALL_R;
    b.vy *= -0.55;
    b.vx *= 0.85;
    if(Math.abs(b.vy) < 40) b.vy = 0;
  }
  // ceiling
  if(b.y < BALL_R){ b.y = BALL_R; b.vy *= -0.5; }

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
    const headY = GROUND_Y - 70 + p.y;
    const dx = b.x - p.x, dy = b.y - headY;
    const d = Math.hypot(dx,dy);
    const minD = HEAD_R + BALL_R;
    if(d < minD && d>0.01){
      const nx = dx/d, ny = dy/d;
      const overlap = minD - d;
      b.x += nx*overlap; b.y += ny*overlap;
      const power = 480 + Math.abs(p.vy)*0.3;
      b.vx = nx*power + p.vx*0.6;
      b.vy = ny*power - 120;
    }
    // body collision (lower box) - simple push
    const bodyY = GROUND_Y - 20 + p.y;
    const dx2 = b.x - p.x, dy2 = b.y - bodyY;
    const d2 = Math.hypot(dx2,dy2);
    const minD2 = 34 + BALL_R;
    if(d2 < minD2 && d2>0.01){
      const nx = dx2/d2, ny = dy2/d2;
      const overlap = minD2-d2;
      b.x += nx*overlap; b.y += ny*overlap;
      b.vx += nx*380; b.vy += ny*380 - 200;
    }
  });
}

function handlePlayerInput(p, keys, dt){
  let dir = 0;
  if(keyState[keys.left]) dir -= 1;
  if(keyState[keys.right]) dir += 1;
  p.vx = dir*PLAYER_SPEED;
  p.x += p.vx*dt;
  if(dir!==0) p.facing = dir;
  if(keyState[keys.jump] && p.grounded){ p.vy = -JUMP_V; p.grounded=false; }
}

function aiControl(p, ball, dt){
  const targetX = Math.max(p.minX, Math.min(p.maxX, ball.x));
  const diff = targetX - p.x;
  const dir = Math.abs(diff)<8 ? 0 : Math.sign(diff);
  p.vx = dir*PLAYER_SPEED*0.92;
  p.x += p.vx*dt;
  if(dir!==0) p.facing = dir;
  const ballNear = Math.abs(ball.x - p.x) < 90;
  const ballAbove = ball.y < GROUND_Y - 40;
  if(p.grounded && ballNear && ballAbove && Math.random()<0.12){
    p.vy = -JUMP_V; p.grounded=false;
  }
}

function scoreGoal(who){
  const gs = gameState;
  if(who===1){ gs.score1++; $('hb-p1-score').textContent = gs.score1; }
  else { gs.score2++; $('hb-p2-score').textContent = gs.score2; }
  gs.ball.x = FIELD_W/2; gs.ball.y = GROUND_Y-60; gs.ball.vx=0; gs.ball.vy=0;
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
function drawPlayer(ctx, p, color, color2, name, flip){
  const bodyY = GROUND_Y - 20 + p.y;
  const headY = GROUND_Y - 70 + p.y;
  ctx.save();
  // shadow
  ctx.fillStyle='rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(p.x, GROUND_Y+6, 30, 8, 0, 0, Math.PI*2); ctx.fill();
  // body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(p.x-20, bodyY-34, 40, 54, 12) : ctx.rect(p.x-20, bodyY-34, 40, 54);
  ctx.fill();
  // head
  ctx.fillStyle = '#ffd9b3';
  ctx.beginPath(); ctx.arc(p.x, headY, HEAD_R, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = color2;
  ctx.beginPath(); ctx.arc(p.x, headY-10, HEAD_R*0.9, Math.PI, 0); ctx.fill();
  // eyes
  ctx.fillStyle='#222';
  ctx.beginPath(); ctx.arc(p.x + p.facing*7, headY+2, 3, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  ctx.fillStyle='#fff';
  ctx.font='13px Tajawal';
  ctx.textAlign='center';
  ctx.fillText(name, p.x, headY - HEAD_R - 10);
}

function render(ctx){
  ctx.clearRect(0,0,FIELD_W,FIELD_H);
  // sky
  const grad = ctx.createLinearGradient(0,0,0,GROUND_Y);
  grad.addColorStop(0,'#123a24'); grad.addColorStop(1,'#0e2b1a');
  ctx.fillStyle = grad; ctx.fillRect(0,0,FIELD_W,GROUND_Y);
  // ground
  ctx.fillStyle = '#1c8a4c';
  ctx.fillRect(0,GROUND_Y,FIELD_W,FIELD_H-GROUND_Y);
  ctx.strokeStyle='rgba(255,255,255,0.4)';
  ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(0,GROUND_Y); ctx.lineTo(FIELD_W,GROUND_Y); ctx.stroke();
  // center line
  ctx.beginPath(); ctx.moveTo(FIELD_W/2,0); ctx.lineTo(FIELD_W/2,GROUND_Y); ctx.stroke();
  ctx.beginPath(); ctx.arc(FIELD_W/2,GROUND_Y,50,Math.PI,0); ctx.stroke();

  // goals
  ctx.strokeStyle='#fff'; ctx.lineWidth=4;
  ctx.strokeRect(0, GOAL_TOP, GOAL_W, GOAL_H);
  ctx.strokeRect(FIELD_W-GOAL_W, GOAL_TOP, GOAL_W, GOAL_H);

  if(!gameState) return;
  const gs = gameState;
  drawPlayer(ctx, gs.p1, match.p1.color, match.p1.color2, match.p1.name, 1);
  drawPlayer(ctx, gs.p2, match.p2.color, match.p2.color2, match.p2.name, -1);

  // ball
  ctx.save();
  ctx.fillStyle='#fff';
  ctx.beginPath(); ctx.arc(gs.ball.x, gs.ball.y, BALL_R, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle='#222'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.restore();
}

window.initHeadballUI = initHeadballUI;
})();
