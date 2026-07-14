(() => {
'use strict';
const $ = id => document.getElementById(id);

/* ---------------- Tabs ---------------- */
document.querySelectorAll('.nav-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active');
    $('tab-'+btn.dataset.tab).classList.add('active');
    if(btn.dataset.tab!=='editions') resetMascotBg();
  });
});

/* ---------------- Mascot background ---------------- */
function setMascotBg(wc){
  const root = document.documentElement;
  const emoji = wc.mascot.emoji || '⚽';
  const colors = wc.mascot.colors || countryColor(wc.winner);
  root.style.setProperty('--mascot-emoji', `'${emoji}'`);
  root.style.setProperty('--mascot-c1', colors[0]);
  root.style.setProperty('--mascot-c2', colors[1]);
}
function resetMascotBg(){
  const root = document.documentElement;
  root.style.setProperty('--mascot-emoji', "'⚽'");
  root.style.setProperty('--mascot-c1', '#1c8a4c');
  root.style.setProperty('--mascot-c2', '#0b2b18');
}

/* ---------------- Search ---------------- */
function normalize(s){ return (s||'').toString().trim().toLowerCase(); }

function runSearch(q){
  const box = $('search-results');
  box.innerHTML = '';
  const nq = normalize(q);
  if(!nq){ return; }

  // Year search
  const yearMatch = WORLD_CUPS.find(wc => String(wc.year) === nq.trim());
  const playerHits = PLAYER_INDEX.filter(p => normalize(p.name).includes(nq) || normalize(p.country).includes(nq));
  const editionHits = WORLD_CUPS.filter(wc =>
    normalize(wc.host).includes(nq) || normalize(wc.winner).includes(nq) || normalize(wc.runnerUp).includes(nq)
  );

  if(yearMatch){
    box.appendChild(renderEditionHit(yearMatch));
  }
  playerHits.forEach(p => box.appendChild(renderPlayerCard(p)));
  editionHits.forEach(wc => { if(wc!==yearMatch) box.appendChild(renderEditionHit(wc)); });

  if(!yearMatch && playerHits.length===0 && editionHits.length===0){
    const div = document.createElement('div');
    div.className='no-results';
    div.textContent = 'لا توجد نتائج مطابقة. جرّب اسم لاعب مشهور، اسم دولة، أو سنة مثل 2018.';
    box.appendChild(div);
  }
}

function renderPlayerCard(p){
  const card = document.createElement('div');
  card.className='player-card';
  const apps = p.appearances.map(a=>{
    const url = youtubeSearchUrl(`${p.name} أهداف كأس العالم ${a.year}`);
    return `<span class="pc-chip">🏆 ${a.year} — ${a.goals} هدف <a href="${url}" target="_blank" rel="noopener">شاهد المقاطع ▶</a></span>`;
  }).join('');
  card.innerHTML = `
    <h3>${p.name}</h3>
    <div class="pc-meta">${p.country} · إجمالي ${p.totalGoals} هدف في كأس العالم عبر ${p.appearances.length} نسخة</div>
    <div class="pc-appearances">${apps}</div>
  `;
  return card;
}

function renderEditionHit(wc){
  const div = document.createElement('div');
  div.className='edition-hit';
  div.innerHTML = `
    <div>${wc.mascot.emoji} <b>كأس العالم ${wc.year}</b> — ${wc.host}</div>
    <div>🏆 ${wc.winner} <small style="color:var(--muted)">(${wc.score} أمام ${wc.runnerUp})</small></div>
  `;
  div.addEventListener('click', ()=>{
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab==='editions'));
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    $('tab-editions').classList.add('active');
    showEditionDetail(wc.year);
  });
  return div;
}

$('search-btn').addEventListener('click', ()=> runSearch($('search-input').value));
$('search-input').addEventListener('keydown', e => { if(e.key==='Enter') runSearch($('search-input').value); });

/* ---------------- Editions ---------------- */
function renderEditionsGrid(){
  const grid = $('editions-grid');
  grid.innerHTML = '';
  WORLD_CUPS.forEach(wc=>{
    const card = document.createElement('div');
    card.className='edition-card';
    card.innerHTML = `
      <div class="ec-emoji">${wc.mascot.emoji}</div>
      <div class="ec-year">${wc.year}</div>
      <div class="ec-host">${wc.host}</div>
      <div class="ec-winner">🏆 <b>${wc.winner}</b></div>
    `;
    card.addEventListener('click', ()=> showEditionDetail(wc.year));
    grid.appendChild(card);
  });
}

function showEditionDetail(year){
  const wc = WORLD_CUPS.find(w=>w.year===year);
  if(!wc) return;
  setMascotBg(wc);
  const detail = $('edition-detail');
  detail.classList.remove('hidden');

  const allScorers = [...wc.topScorers, ...wc.otherScorers];
  const scorerRows = allScorers.map(p=>{
    const url = youtubeSearchUrl(`${p.name} أهداف كأس العالم ${wc.year}`);
    return `<div class="scorer-line"><span>${p.name} (${p.country})</span><span>${p.goals} هدف &nbsp; <a href="${url}" target="_blank" rel="noopener">▶ مشاهدة</a></span></div>`;
  }).join('');

  detail.innerHTML = `
    <button class="ed-close" id="ed-close-btn">✕ إغلاق</button>
    <div style="clear:both"></div>
    <div class="ed-header">
      <div class="ed-emoji">${wc.mascot.emoji}</div>
      <div>
        <h2>كأس العالم ${wc.year} — ${wc.host}</h2>
        <div class="ed-sub">المدينة المضيفة للنهائي: ${wc.hostCity} · الحضور الإجمالي التقريبي: ${wc.attendance}</div>
      </div>
    </div>
    <div class="ed-grid">
      <div class="ed-box">
        <h4>نتيجة النهائي</h4>
        <div class="vs-row"><span>🏆 ${wc.winner}</span><span>${wc.score}</span><span>${wc.runnerUp}</span></div>
      </div>
      <div class="ed-box">
        <h4>تميمة النسخة</h4>
        <p><b>${wc.mascot.name}</b> ${wc.mascot.emoji}</p>
        <p>${wc.mascot.desc}</p>
      </div>
      <div class="ed-box">
        <h4>نجما المباراة النهائية</h4>
        <p>⭐ ${wc.finalStars.a.name} — ${wc.finalStars.a.country}</p>
        <p>⭐ ${wc.finalStars.b.name} — ${wc.finalStars.b.country}</p>
      </div>
      <div class="ed-box" style="grid-column: 1 / -1;">
        <h4>أبرز الهدافين (بينهم حامل الحذاء الذهبي)</h4>
        ${scorerRows}
      </div>
      <div class="ed-box">
        <h4>💰 الاستثمار والبنية التحتية</h4>
        <p>${wc.hostReport.investment}</p>
      </div>
      <div class="ed-box">
        <h4>🧳 الأثر السياحي</h4>
        <p>${wc.hostReport.tourism}</p>
      </div>
      <div class="ed-box">
        <h4>📈 الأثر الاقتصادي</h4>
        <p>${wc.hostReport.economy}</p>
      </div>
      <div class="ed-box">
        <h4>🏛️ الإرث</h4>
        <p>${wc.hostReport.legacy}</p>
      </div>
    </div>
  `;
  $('ed-close-btn').addEventListener('click', ()=>{ detail.classList.add('hidden'); resetMascotBg(); });
  detail.scrollIntoView({behavior:'smooth', block:'start'});
}

/* ---------------- Jerseys ---------------- */
function jerseySvg(color1, color2, number){
  return `
  <svg class="jersey-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 10 L10 30 L22 44 L30 38 L30 108 L90 108 L90 38 L98 44 L110 30 L90 10 L75 20 Q60 30 45 20 Z"
      fill="${color1}" stroke="rgba(0,0,0,0.3)" stroke-width="2"/>
    <path d="M45 20 Q60 30 75 20 L75 30 Q60 38 45 30 Z" fill="${color2}"/>
    <text x="60" y="80" font-size="36" font-weight="900" fill="${color2}" text-anchor="middle" font-family="Rajdhani, sans-serif">${number}</text>
  </svg>`;
}

function renderJerseys(){
  const grid = $('jerseys-grid');
  grid.innerHTML = '';
  WORLD_CUPS.forEach(wc=>{
    const top = wc.topScorers[0];
    const [c1,c2] = countryColor(top.country);
    const card = document.createElement('div');
    card.className='jersey-card';
    card.innerHTML = `
      ${jerseySvg(c1,c2, wc.topScorers.length>1?'':'★')}
      <div class="jersey-name">${top.name}</div>
      <div class="jersey-meta">${top.country} · كأس العالم ${wc.year}</div>
      <div class="jersey-goals">⚽ ${top.goals} هدف — حامل الحذاء الذهبي</div>
    `;
    grid.appendChild(card);
  });
}

/* ---------------- Host reports ---------------- */
function renderReports(){
  const list = $('reports-list');
  list.innerHTML = '';
  WORLD_CUPS.forEach(wc=>{
    const det = document.createElement('details');
    det.className='report-card';
    det.innerHTML = `
      <summary>${wc.mascot.emoji} كأس العالم ${wc.year} — ${wc.host} <span class="rc-tag">مضيف</span></summary>
      <div class="report-body">
        <div class="rb-item"><h5>💰 الاستثمار والبنية التحتية</h5><p>${wc.hostReport.investment}</p></div>
        <div class="rb-item"><h5>🧳 الأثر السياحي</h5><p>${wc.hostReport.tourism}</p></div>
        <div class="rb-item"><h5>📈 الأثر الاقتصادي</h5><p>${wc.hostReport.economy}</p></div>
        <div class="rb-item"><h5>🏛️ الإرث</h5><p>${wc.hostReport.legacy}</p></div>
      </div>
    `;
    list.appendChild(det);
  });
}

/* ---------------- Init ---------------- */
renderEditionsGrid();
renderJerseys();
renderReports();
initHeadballUI();
})();
