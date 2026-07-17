(() => {
'use strict';
const $ = id => document.getElementById(id);

/* ---------------- Color helpers ---------------- */
function lighten(hex, amt){
  const c = (hex||'#1c8a4c').replace('#','');
  if(c.length!==6) return hex;
  const n = parseInt(c,16);
  let r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  r = Math.min(255, Math.round(r + (255-r)*amt));
  g = Math.min(255, Math.round(g + (255-g)*amt));
  b = Math.min(255, Math.round(b + (255-b)*amt));
  return `rgb(${r},${g},${b})`;
}
function darken(hex, amt){
  const c = (hex||'#1c8a4c').replace('#','');
  if(c.length!==6) return hex;
  const n = parseInt(c,16);
  let r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  r = Math.max(0, Math.round(r*(1-amt)));
  g = Math.max(0, Math.round(g*(1-amt)));
  b = Math.max(0, Math.round(b*(1-amt)));
  return `rgb(${r},${g},${b})`;
}

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

/* ---------------- Site-wide re-theme + mascot background ---------------- */
function svgDataUri(svg){
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
function setMascotBg(wc){
  const root = document.documentElement;
  const colors = wc.mascot.colors || countryColor(wc.winner);
  const [c1,c2] = colors;
  root.style.setProperty('--mascot-c1', c1);
  root.style.setProperty('--mascot-c2', c2);
  root.style.setProperty('--green', lighten(c1,0.06));
  root.style.setProperty('--green-light', lighten(c1,0.34));
  const goldBase = (c2==='#ffffff' || c2==='#000000') ? c1 : c2;
  root.style.setProperty('--gold', lighten(goldBase, c2==='#ffffff'?0.4:0.22));

  const svg = mascotIllustration(wc);
  const uri = svgDataUri(svg);
  $('mb-a').style.backgroundImage = uri;
  $('mb-b').style.backgroundImage = uri;
}
function resetMascotBg(){
  const root = document.documentElement;
  root.style.setProperty('--mascot-c1', '#1c8a4c');
  root.style.setProperty('--mascot-c2', '#0b2b18');
  root.style.setProperty('--green', '#1c8a4c');
  root.style.setProperty('--green-light', '#2fbf6e');
  root.style.setProperty('--gold', '#ffd23f');
  $('mb-a').style.backgroundImage = '';
  $('mb-b').style.backgroundImage = '';
}

/* ---------------- Mascot illustrations (original artwork, not photos of the
   real trademarked mascots) — one hand-built SVG per edition, used instead
   of any emoji. ---------------- */
function eyesSvg(cx,cy,eyeDx,eyeR,color){
  color = color || '#20140c';
  return `<circle cx="${cx-eyeDx}" cy="${cy}" r="${eyeR}" fill="${color}"/><circle cx="${cx+eyeDx}" cy="${cy}" r="${eyeR}" fill="${color}"/>`;
}
function faceSvg(cx,cy,eyeDx,eyeDy,eyeR,mouthY,mouthW,color){
  color = color || '#20140c';
  return `
    ${eyesSvg(cx,cy-eyeDy,eyeDx,eyeR,color)}
    <path d="M${cx-mouthW} ${mouthY} Q${cx} ${mouthY+mouthW*0.7} ${cx+mouthW} ${mouthY}" stroke="${color}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  `;
}
function lionSvg(fur, mane){
  return `
    <circle cx="50" cy="56" r="33" fill="${mane}"/>
    ${[0,40,80,120,160,200,240,280,320].map(a=>`<rect x="47" y="16" width="6" height="18" rx="3" fill="${mane}" transform="rotate(${a} 50 56)"/>`).join('')}
    <circle cx="50" cy="56" r="25" fill="${fur}"/>
    <ellipse cx="50" cy="66" rx="12" ry="9" fill="#fbe3ad"/>
    ${faceSvg(50,54,9,2,3.4,68,7,'#2a1c10')}
    <path d="M46 68 Q50 72 54 68" stroke="#2a1c10" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <circle cx="50" cy="63" r="2.4" fill="#2a1c10"/>
  `;
}
function boySvg(hatPath, hatFill, bandFill, skin){
  skin = skin || '#e8b892';
  return `
    ${hatPath}
    <circle cx="50" cy="58" r="24" fill="${skin}"/>
    ${faceSvg(50,56,8,1,3,66,6,'#20140c')}
    <path d="M42 68 Q50 73 58 68" stroke="#20140c" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  `;
}
function mascotIllustration(wc){
  const colors = wc.mascot.colors || countryColor(wc.winner);
  const [c1,c2] = colors;
  const year = wc.year;
  let body;

  if(!wc.mascot.colors){
    // Editions before official mascots existed: an original vintage-ball illustration.
    body = `
      <circle cx="50" cy="54" r="30" fill="#ece4cf" stroke="#8a7f63" stroke-width="2.5"/>
      <path d="M50 26 L64 36 L59 53 L41 53 L36 36 Z" fill="#5a5240"/>
      <path d="M50 26 L50 14 M64 36 L78 30 M59 53 L68 68 M41 53 L32 68 M36 36 L22 30" stroke="#8a7f63" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M14 54 A36 36 0 0 1 22 30" stroke="#8a7f63" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M86 54 A36 36 0 0 0 78 30" stroke="#8a7f63" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      ${faceSvg(50,66,8,0,2.6,74,6,'#8a7f63')}
    `;
  } else if(year===1966 || year===2006){
    body = lionSvg(year===1966 ? '#e8b34a' : '#e3a63c', year===1966 ? '#c07a1e' : darken(c1,0.1));
  } else if(year===1970){
    body = boySvg(
      `<ellipse cx="50" cy="34" rx="33" ry="7.5" fill="${darken(c1,0.15)}"/><ellipse cx="50" cy="31" rx="15" ry="6" fill="${c1}"/><rect x="35" y="29" width="30" height="4" fill="${c2}"/>`,
      c1, c2
    );
  } else if(year===1974){
    body = boySvg(
      `<path d="M32 42 Q50 18 68 42 Z" fill="${c1}"/><circle cx="50" cy="38" r="4" fill="${c2}"/>`,
      c1, c2
    ) + `<circle cx="74" cy="72" r="7" fill="#f3f3f0" stroke="#161616" stroke-width="1.4"/>`;
  } else if(year===1978){
    body = boySvg(
      `<path d="M22 36 Q50 14 78 36 Q64 30 50 30 Q36 30 22 36 Z" fill="#8a6a3e"/>`,
      '#8a6a3e', c1
    ) + `<path d="M40 74 L50 84 L60 74 Z" fill="${c1}"/>`;
  } else if(year===1982){
    body = `
      <ellipse cx="50" cy="60" rx="28" ry="26" fill="#ff9433"/>
      <path d="M50 34 Q40 20 28 24 Q38 30 44 36 Z" fill="#3c9a52"/>
      <rect x="33" y="66" width="34" height="14" rx="6" fill="${c1}"/>
      ${faceSvg(50,54,8,1,3.2,64,7,'#7a3a10')}
      <path d="M42 66 Q50 71 58 66" stroke="#7a3a10" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    `;
  } else if(year===1986){
    body = `
      <path d="M50 22 Q32 30 32 52 Q32 74 50 82 Q68 74 68 52 Q68 30 50 22 Z" fill="#4a9a34"/>
      <rect x="46" y="14" width="8" height="12" rx="3" fill="#2f7a22"/>
      <path d="M38 58 Q50 66 62 58" stroke="#20140c" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      ${eyesSvg(50,48,8,3,'#20140c')}
      <rect x="33" y="70" width="34" height="12" rx="5" fill="${c1}"/>
    `;
  } else if(year===1990){
    body = `
      <path d="M50 20 A30 30 0 0 1 50 80 Z" fill="${c1}"/>
      <path d="M50 20 A30 30 0 0 0 50 80 Z" fill="#ffffff"/>
      <circle cx="50" cy="50" r="30" fill="none" stroke="${c2}" stroke-width="4"/>
      <rect x="20" y="46" width="60" height="8" fill="${c2}"/>
      ${eyesSvg(50,44,8,3,'#161616')}
    `;
  } else if(year===1994){
    body = `
      <ellipse cx="26" cy="46" rx="9" ry="16" fill="#8a6a3e" transform="rotate(-18 26 46)"/>
      <ellipse cx="74" cy="46" rx="9" ry="16" fill="#8a6a3e" transform="rotate(18 74 46)"/>
      <circle cx="50" cy="56" r="26" fill="#caa06a"/>
      <ellipse cx="50" cy="66" rx="11" ry="8" fill="#e8c99a"/>
      ${faceSvg(50,54,8,1,3,66,6,'#2a1c10')}
      <ellipse cx="50" cy="70" rx="2.4" ry="1.8" fill="#2a1c10"/>
      <rect x="36" y="78" width="28" height="7" rx="3.5" fill="${c1}"/>
    `;
  } else if(year===1998){
    body = `
      <path d="M50 18 L44 30 L56 30 Z" fill="#e0332f"/>
      <path d="M40 22 L36 34 L46 32 Z" fill="#e0332f"/>
      <path d="M60 22 L64 34 L54 32 Z" fill="#e0332f"/>
      <circle cx="50" cy="54" r="26" fill="${c1}"/>
      <path d="M50 54 L70 58 L50 62 Z" fill="#f2a30f"/>
      ${eyesSvg(50,50,8,3.2,'#161616')}
    `;
  } else if(year===2002){
    body = `
      <ellipse cx="50" cy="58" rx="24" ry="28" fill="${c1}"/>
      <circle cx="50" cy="48" r="14" fill="#fff"/>
      <circle cx="50" cy="48" r="7" fill="#161616"/>
      <line x1="50" y1="20" x2="42" y2="8" stroke="${c2}" stroke-width="3" stroke-linecap="round"/>
      <line x1="50" y1="20" x2="58" y2="8" stroke="${c2}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="42" cy="8" r="4" fill="${c2}"/><circle cx="58" cy="8" r="4" fill="${c2}"/>
    `;
  } else if(year===2010){
    body = `
      <circle cx="50" cy="56" r="27" fill="#e8b34a"/>
      ${Array.from({length:10}).map((_,i)=>`<circle cx="${30+(i%5)*10}" cy="${44+Math.floor(i/5)*18}" r="2.4" fill="#2a1c10"/>`).join('')}
      <path d="M40 24 Q50 10 60 24 Q50 20 40 24 Z" fill="${c1}"/>
      ${faceSvg(50,54,8,1,3,64,6,'#2a1c10')}
      <path d="M42 66 Q50 71 58 66" stroke="#2a1c10" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    `;
  } else if(year===2014){
    body = `
      <path d="M50 24 A28 28 0 0 1 78 52 L22 52 A28 28 0 0 1 50 24 Z" fill="#d99a55"/>
      <rect x="22" y="52" width="56" height="18" rx="9" fill="#e8b06a"/>
      <path d="M30 32 A24 20 0 0 1 70 32" stroke="#8a5a2e" stroke-width="3" fill="none"/>
      <path d="M34 24 A20 16 0 0 1 66 24" stroke="#8a5a2e" stroke-width="3" fill="none"/>
      <ellipse cx="50" cy="70" rx="9" ry="6" fill="#f0c99a"/>
      ${eyesSvg(50,59,7,2.6,'#2a1c10')}
      <rect x="36" y="76" width="28" height="7" rx="3.5" fill="${c1}"/>
    `;
  } else if(year===2018){
    body = `
      <path d="M26 40 L14 20 L34 32 Z" fill="#eef0f0"/>
      <path d="M74 40 L86 20 L66 32 Z" fill="#eef0f0"/>
      <circle cx="50" cy="58" r="27" fill="#eef0f0"/>
      <path d="M50 74 L38 90 L62 90 Z" fill="#eef0f0"/>
      <ellipse cx="50" cy="68" rx="10" ry="8" fill="#c7cbd1"/>
      ${eyesSvg(50,55,8,3,'#161616')}
      <rect x="30" y="74" width="40" height="9" rx="4.5" fill="${c1}"/>
      <circle cx="70" cy="78" r="4" fill="${c2}"/>
    `;
  } else if(year===2022){
    body = `
      <path d="M50 16 C30 16 22 34 22 54 C22 70 30 82 30 82 L36 70 L44 84 L50 72 L56 84 L64 70 L70 82 C70 82 78 70 78 54 C78 34 70 16 50 16 Z" fill="${c1}"/>
      <path d="M28 46 Q50 34 72 46" stroke="${c2}" stroke-width="2.5" fill="none" opacity="0.7"/>
      ${faceSvg(50,50,8,0,3.4,60,6,'#ffffff')}
    `;
  } else {
    body = `<circle cx="50" cy="55" r="28" fill="${c1}"/>${faceSvg(50,53,8,1,3,63,6,'#ffffff')}`;
  }

  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${wc.mascot.name}">${body}</svg>`;
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
  div.setAttribute('role','button');
  div.tabIndex = 0;
  div.innerHTML = `
    <div class="eh-row"><span class="eh-icon">${mascotIllustration(wc)}</span> <b>كأس العالم ${wc.year}</b> — ${wc.host}</div>
    <div>🏆 ${wc.winner} <small style="color:var(--muted)">(${wc.score} أمام ${wc.runnerUp})</small></div>
  `;
  const go = ()=>{
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab==='editions'));
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    $('tab-editions').classList.add('active');
    showEditionDetail(wc.year);
  };
  div.addEventListener('click', go);
  div.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(); } });
  return div;
}

$('search-btn').addEventListener('click', ()=> runSearch($('search-input').value));
$('search-input').addEventListener('keydown', e => { if(e.key==='Enter') runSearch($('search-input').value); });

/* ---------------- Editions ---------------- */
function renderEditionsGrid(){
  const grid = $('editions-grid');
  grid.innerHTML = '';
  WORLD_CUPS.forEach(wc=>{
    const card = document.createElement('button');
    card.className='edition-card';
    card.innerHTML = `
      <div class="ec-emoji">${mascotIllustration(wc)}</div>
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
      <div class="ed-emoji">${mascotIllustration(wc)}</div>
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
        <div class="mascot-box-icon">${mascotIllustration(wc)}</div>
        <p style="text-align:center"><b>${wc.mascot.name}</b></p>
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
function jerseySvg(color1, color2, goals){
  const trim = darken(color2==='#ffffff' ? color1 : color2, color2==='#ffffff' ? 0.15 : 0);
  return `
  <svg class="jersey-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <path d="M40 8 L14 27 L26 44 L37 35 L37 112 L83 112 L83 35 L94 44 L106 27 L80 8
             C77 18 69 24 60 24 C51 24 43 18 40 8 Z"
      fill="${color1}" stroke="rgba(0,0,0,0.25)" stroke-width="2"/>
    <path d="M43 10 C46 19 52 25 60 25 C68 25 74 19 77 10 L74 15 C70 21 65 24 60 24 C55 24 50 21 46 15 Z" fill="${color2}"/>
    <path d="M14 27 L26 44 L33 38 L22 21 Z" fill="${trim}"/>
    <path d="M106 27 L94 44 L87 38 L98 21 Z" fill="${trim}"/>
    <rect x="37" y="103" width="46" height="9" fill="${trim}"/>
    <text x="60" y="82" font-size="34" font-weight="900" fill="${color2}" text-anchor="middle" font-family="Rajdhani, Segoe UI, sans-serif">${goals}</text>
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
      ${jerseySvg(c1,c2, top.goals)}
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
      <summary>
        <span class="rc-title"><span class="rc-icon">${mascotIllustration(wc)}</span> كأس العالم ${wc.year} — ${wc.host}</span>
        <span class="rc-tag">مضيف</span>
      </summary>
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
