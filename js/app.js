// 토닥토닥 — 앱 로직 (화면 전환, 미션, 성장, 저장)

const KEY = 'todottodot.v1';

const MISSIONS = [
  { id: 'mirror', icon: '🪞', mode: 'mirror', xp: 30, gain: { esteem: 6 }, unlock: 1 },
  { id: 'breathe', icon: '🫧', mode: 'timer', mins: 3, xp: 20, gain: { esteem: 2, energy: 4 }, unlock: 1, pose: 'sit', mood: 'calm' },
  { id: 'water', icon: '💧', mode: 'timer', mins: 1, xp: 15, gain: { energy: 3 }, unlock: 1, pose: 'drink', mood: 'smile' },
  { id: 'clean', icon: '🧹', mode: 'timer', mins: 15, xp: 45, gain: { esteem: 8, energy: 5 }, unlock: 1, pose: 'sweep', mood: 'neutral' },
  { id: 'praise', icon: '📓', mode: 'praise', xp: 30, gain: { esteem: 7 }, unlock: 1 },
  { id: 'sun', icon: '🪟', mode: 'timer', mins: 5, xp: 25, gain: { energy: 5, esteem: 2 }, unlock: 2, pose: 'stretch', mood: 'smile', scene: 'window', stageMin: 2 },
  { id: 'stretch', icon: '🤸', mode: 'timer', mins: 5, xp: 25, gain: { energy: 6 }, unlock: 2, pose: 'stretch', mood: 'smile' },
  { id: 'walk', icon: '🚶', mode: 'timer', mins: 10, xp: 40, gain: { energy: 8, connect: 3 }, unlock: 4, pose: 'walk', mood: 'smile', scene: 'walk' },
  { id: 'hello', icon: '💌', mode: 'confirm', xp: 40, gain: { connect: 10, esteem: 3 }, unlock: 5, pose: 'phone', mood: 'smile' },
  { id: 'meetup', icon: '🫶', mode: 'confirm', xp: 80, gain: { connect: 15, esteem: 8 }, unlock: 8, scene: 'meetup', mood: 'big' },
];
const M = Object.fromEntries(MISSIONS.map((m) => [m.id, m]));
const STAGE_MESS = [1, 0.75, 0.4, 0.15, 0];
const STAGE_MOOD = ['sad', 'down', 'smile', 'smile', 'big'];
const FACE_MOODS = ['sad', 'down', 'neutral', 'smile', 'big'];

// ---------- 상태 ----------
function defaultState() {
  return {
    v: 1, lang: 'ko', char: null,
    xp: 0, stats: { esteem: 15, energy: 25, connect: 5 },
    mess: 1, done: {}, praise: [], affirm: [], mood: null,
    total: 0, streak: 0, best: 0, lastDone: null, lastOpen: null, demoLevel: 0,
  };
}
let S;
try { S = Object.assign(defaultState(), JSON.parse(localStorage.getItem(KEY) || 'null') || {}); } catch (e) { S = defaultState(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* 저장 불가 환경 */ } }

const pad = (n) => String(n).padStart(2, '0');
const dkey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => dkey(new Date());
const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dkey(d); };

if (S.lastOpen !== today()) {
  if (S.lastOpen) S.mess = Math.min(1, S.mess + 0.15); // 하루 지나면 방이 살짝 어질러져요
  S.lastOpen = today();
  save();
}
setLang(S.lang);

const need = (L) => ((L - 1) * L / 2) * 50;
const levelFromXp = (xp) => { let L = 1; while (xp >= need(L + 1)) L++; return L; };
const stageOf = (L) => (L >= 8 ? 4 : L >= 6 ? 3 : L >= 4 ? 2 : L >= 2 ? 1 : 0);
const curLevel = () => S.demoLevel || levelFromXp(S.xp);
const curStage = () => stageOf(curLevel());
const curMess = () => (S.demoLevel ? STAGE_MESS[curStage()] : Math.min(S.mess, STAGE_MESS[curStage()]));
const doneToday = () => S.done[today()] || [];
const unlocked = (m) => curLevel() >= m.unlock;
const charName = () => (S.char && S.char.name) || (LANG === 'ko' ? '나' : 'Me');

// ---------- 렌더 루프 ----------
let drawers = [];
function loop(t) { drawers.forEach((d) => d(t)); requestAnimationFrame(loop); }
requestAnimationFrame(loop);
function addScene(canvas, cfg) { const s = new Scene(canvas, cfg); drawers.push((t) => s.draw(t)); return s; }

const app = document.getElementById('app');
let cleanup = [];
let tab = 'home';

function go(screen, params) {
  cleanup.forEach((f) => f()); cleanup = []; drawers = [];
  const html = SCREENS[screen](params || {});
  app.innerHTML = `<div class="screen ${screen}">${html}</div><div class="home-ind"></div>`;
  (BIND[screen] || (() => {}))(params || {});
}

function toast(msg) {
  const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
  app.appendChild(el); setTimeout(() => el.remove(), 2600);
}

function sheet(html, bind) {
  const bg = document.createElement('div'); bg.className = 'sheet-bg';
  bg.innerHTML = `<div class="sheet">${html}</div>`;
  bg.addEventListener('click', (e) => { if (e.target === bg) bg.remove(); });
  app.appendChild(bg); bind(bg); return bg;
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- 공통 조각 ----------
function navHTML() {
  const items = [['home', '🏠'], ['missions', '✨'], ['log', '📅'], ['me', '🙂']];
  return `<nav class="nav">${items.map(([k, ic]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}"><span>${ic}</span>${t('tabs.' + k)}</button>`).join('')}</nav>`;
}
function bindNav() {
  app.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; go(tab); }));
}
function statsHTML() {
  const rows = [['💗', 'esteem'], ['⚡', 'energy'], ['🤝', 'connect']];
  return `<div class="stats">${rows.map(([ic, k]) => `
    <div class="stat"><span>${ic}</span><span>${t(k)}</span><div class="bar"><i style="width:${Math.round(S.stats[k])}%"></i></div><span class="pct">${Math.round(S.stats[k])}%</span></div>`).join('')}
  </div>`;
}
function levelHTML(flat) {
  const L = curLevel(), st = t('stages')[stageOf(L)];
  return `<div class="level-row" ${flat ? 'style="margin:4px 0 10px"' : ''}><div class="level-pill"><b>${t('level')} ${L}</b>${esc(st.title)}</div></div>`;
}
function missionCard(m, rec) {
  const done = doneToday().includes(m.id), lock = !unlocked(m);
  const tag = lock ? `🔒 ${t('locked', { n: m.unlock })}` : done ? `✓ ${t('done')}` : m.mins ? t('min', { n: m.mins }) : `+${m.xp}xp`;
  return `<button class="mcard glass ${done ? 'done' : ''} ${lock ? 'lock' : ''} ${rec ? 'rec' : ''}" data-m="${m.id}" ${lock ? 'disabled' : ''}>
    <div class="ic">${m.icon}</div>
    <div><div class="nm">${t('missions.' + m.id + '.name')}</div><div class="ds">${t('missions.' + m.id + '.desc')}</div></div>
    <div class="tag">${tag}</div></button>`;
}
function bindMissionCards() {
  app.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => startMission(b.dataset.m)));
}
function recommend() {
  const done = doneToday();
  const mood = S.mood && S.mood.date === today() ? S.mood.v : 2;
  const pref = [['breathe', 'water', 'praise'], ['water', 'breathe', 'mirror'], ['mirror', 'clean', 'water'], ['clean', 'mirror', 'stretch'], ['walk', 'hello', 'clean', 'mirror']][mood];
  const hour = new Date().getHours();
  if (hour < 11 && !done.includes('mirror') && mood >= 1) pref.unshift('mirror');
  return pref.map((id) => M[id]).find((m) => unlocked(m) && !done.includes(m.id))
    || MISSIONS.find((m) => unlocked(m) && !done.includes(m.id)) || M.clean;
}

// ---------- 화면들 ----------
const SCREENS = {
  intro() {
    return `
      <div class="status"></div>
      <div class="topbar" style="justify-content:flex-end">${langSwitch()}</div>
      <div class="hero">
        <div class="logo">TODOT·TODOT</div>
        <canvas id="introChar"></canvas>
        <h2>${esc(t('introTitle'))}</h2>
        <p>${esc(t('introSub'))}</p>
      </div>
      <button class="px-btn hot" id="start">${esc(t('introCta'))}</button>`;
  },

  create(p) {
    const d = p.draft;
    const chipRow = (key, list, labels) => `<div class="chips">${list.map((v) => `<button class="chip ${d[key] === v ? 'on' : ''}" data-k="${key}" data-v="${v}">${esc(labels[v])}</button>`).join('')}</div>`;
    const sw = (key, colors) => `<div class="swatches">${colors.map((c, i) => `<button class="sw ${d[key] === i ? 'on' : ''}" style="background:${c}" data-k="${key}" data-v="${i}" data-num="1" aria-label="${c}"></button>`).join('')}</div>`;
    return `
      <div class="status"></div>
      <div class="topbar">
        ${p.edit ? '<button class="icon-btn" id="back">←</button>' : '<span style="width:42px"></span>'}
        <h1>${esc(t('createTitle'))}</h1>
        <button class="icon-btn" id="rand" title="${esc(t('randomize'))}">🎲</button>
      </div>
      <div class="scroll creator">
        <div class="preview"><canvas id="pv"></canvas></div>
        <p class="sub">${esc(t('createSub'))}</p>
        <div class="field"><label>${esc(t('name'))}</label><input class="text-in" id="nm" maxlength="12" placeholder="${esc(t('namePh'))}" value="${esc(d.name || '')}"></div>
        <div class="field"><label>${esc(t('pronoun'))}</label>${chipRow('pronoun', ['name', 'they', 'she', 'he', 'custom'], t('pronouns'))}
          ${d.pronoun === 'custom' ? `<input class="text-in" id="pc" style="margin-top:8px" maxlength="16" placeholder="${esc(t('pronounCustomPh'))}" value="${esc(d.pronounCustom || '')}">` : ''}</div>
        <div class="field"><label>${esc(t('skin'))}</label>${sw('skin', PIX.SKIN)}</div>
        <div class="field"><label>${esc(t('hairStyle'))}</label>${chipRow('hair', PIX.HAIRS, t('hairs'))}</div>
        <div class="field"><label>${esc(t('hairColor'))}</label>${sw('hairColor', PIX.HAIR_COLORS)}</div>
        <div class="field"><label>${esc(t('body'))}</label>${chipRow('body', PIX.BODIES, t('bodies'))}</div>
        <div class="field"><label>${esc(t('top'))}</label>${sw('top', PIX.TOPS)}</div>
        <div class="field"><label>${esc(t('extras'))}</label><div class="chips">${PIX.EXTRAS.map((x) => `<button class="chip ${d.extras.includes(x) ? 'on' : ''}" data-x="${x}">${esc(t('extraNames.' + x))}</button>`).join('')}</div></div>
        <button class="px-btn hot" id="done">${esc(t(p.edit ? 'save' : 'createDone'))}</button>
      </div>`;
  },

  home() {
    const L = curLevel(), stg = t('stages')[stageOf(L)];
    const rec = recommend();
    const moodToday = S.mood && S.mood.date === today() ? S.mood.v : null;
    const speech = moodToday != null ? t('moodReply')[moodToday] : t('stageSpeech')[stageOf(L)];
    const list = MISSIONS.filter(unlocked).slice(0, 5);
    const d = doneToday().length;
    const bell = MISSIONS.filter(unlocked).length - d;
    return `
      <div class="status"></div>
      <div class="topbar">
        <button class="icon-btn" data-tab="me">☰</button>
        <h1>${esc(t('appName'))}</h1>
        <button class="icon-btn" id="bell">🔔${bell > 0 ? `<span class="dot">!</span>` : ''}</button>
      </div>
      <div class="scroll">
        <div class="scene-wrap bleed">
          <canvas class="scene" id="sc"></canvas>
          <div class="scene-title outline-text">${esc(stg.title)}<small>${esc(stg.sub)}</small></div>
        </div>
        ${levelHTML()}
        ${statsHTML()}
        <div class="speech glass"><span class="who">${esc(charName())} · ${S.streak ? '🔥 ' + t('streak', { n: S.streak }) : t('tagline')}</span>${esc(speech)}</div>
        <button class="px-btn hot" data-m="${rec.id}">${rec.icon} ${esc(t('missions.' + rec.id + '.cta'))}</button>
        ${moodToday == null ? `
        <div class="mood glass"><h3>${esc(t('todayMood'))}</h3><div class="mood-row">
          ${FACE_MOODS.map((mo, i) => `<button data-mood="${i}"><canvas data-face="${mo}"></canvas>${esc(t('moods')[i])}</button>`).join('')}
        </div></div>` : ''}
        <div class="section-h"><h2>${esc(t('todayMissions'))}</h2><span>${d} / ${MISSIONS.filter(unlocked).length}</span></div>
        <div class="missions">${list.map((m) => missionCard(m, m.id === rec.id)).join('')}</div>
      </div>
      ${navHTML()}`;
  },

  missions() {
    const rec = recommend();
    const open = MISSIONS.filter(unlocked), locked = MISSIONS.filter((m) => !unlocked(m));
    return `
      <div class="status"></div>
      <h2 class="page-h">${esc(t('tabs.missions'))}</h2>
      <div class="scroll">
        ${levelHTML(true)}
        <div class="section-h"><h2>${esc(t('todayMissions'))}</h2><span>${doneToday().length} / ${open.length}</span></div>
        <div class="missions">${open.map((m) => missionCard(m, m.id === rec.id)).join('')}</div>
        ${locked.length ? `<div class="section-h"><h2>🔒</h2></div><div class="missions">${locked.map((m) => missionCard(m)).join('')}</div>` : ''}
      </div>
      ${navHTML()}`;
  },

  run(p) {
    const m = M[p.id];
    const title = t('withMe', { c: charName() });
    let body = '';
    if (m.mode === 'mirror') {
      const list = t('affirmations');
      body = `
        <div class="scene-wrap" id="sw">
          <canvas class="scene" id="sc"></canvas>
          <div class="affirm-big outline-text" id="aff">${esc(p.affirm)}</div>
        </div>
        <div class="count-dots" id="dots" style="margin-top:12px">${[0, 1, 2].map((i) => `<i class="${i < p.count ? 'on' : ''}"></i>`).join('')}</div>
        <div class="heard" id="heard"></div>
        <div class="field" style="margin-top:0"><label>${esc(t('mirrorPick'))}</label>
          <div class="chips">${list.map((a) => `<button class="chip ${a === p.affirm ? 'on' : ''}" data-aff="${esc(a)}">${esc(a)}</button>`).join('')}</div>
          <input class="text-in" id="affIn" style="margin-top:10px" maxlength="40" placeholder="${esc(t('mirrorCustomPh'))}">
        </div>
        <p class="small-note" style="margin-top:12px">${esc(t('mirrorTip'))}</p>
        <div class="run-actions">
          <button class="px-btn ghost" id="cam">📷 ${esc(t('mirrorCam'))}</button>
          ${('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) ? `<button class="px-btn ghost" id="mic">${esc(t('mirrorSpeak'))}</button>` : ''}
        </div>
        <button class="px-btn hot" id="said">🪞 ${esc(t('mirrorSaid'))}</button>`;
    } else if (m.mode === 'praise') {
      body = `
        <div class="scene-wrap"><canvas class="scene" id="sc"></canvas>
          <div class="scene-title outline-text">${esc(t('praiseTitle'))}</div></div>
        <div style="height:14px"></div>
        <div class="praise-in">${t('praisePh').map((ph, i) => `<input class="text-in" data-pr="${i}" maxlength="60" placeholder="${esc(ph)}">`).join('')}</div>
        <button class="px-btn hot" id="savePraise">📓 ${esc(t('praiseSave'))}</button>`;
    } else {
      body = `
        <div class="scene-wrap">
          <canvas class="scene" id="sc"></canvas>
          ${m.mode === 'timer' ? '<div class="timer outline-text" id="tm"></div>' : ''}
          ${m.id === 'breathe' ? '<div class="breath"></div><div class="breath-label outline-text" id="bl"></div>' : ''}
        </div>
        <div style="height:14px"></div>
        ${levelHTML(true)}
        ${m.id === 'clean' ? statsHTML() : ''}
        <div class="speech glass">${esc(t('missions.' + m.id + '.running'))}</div>
        <div class="run-actions">
          ${m.mode === 'timer' ? `<button class="px-btn ghost" id="pause">${esc(t('pause'))}</button>` : ''}
          <button class="px-btn hot" id="finish">${esc(t('finishEarly'))}</button>
        </div>
        <button class="px-btn ghost" id="stop">[ ${esc(t('stop'))} ]</button>`;
    }
    return `
      <div class="status"></div>
      <div class="topbar">
        <span style="width:42px"></span>
        <h1>${esc(m.mode === 'praise' ? t('missions.praise.name') : title)}</h1>
        <button class="icon-btn" id="x">✕</button>
      </div>
      <div class="scroll" style="padding-bottom:30px">${body}</div>`;
  },

  complete(p) {
    const m = M[p.id];
    const stg = t('stages')[stageOf(p.newL)];
    const msg = t('completeMsg')[p.id === 'clean' ? 0 : (p.newL + p.xp) % 3];
    const gains = Object.entries(p.gains).map(([k, v]) => `<span class="gain">${k === 'esteem' ? '💗' : k === 'energy' ? '⚡' : '🤝'} ${t(k)} +${v}%</span>`).join('');
    return `
      <div class="status"></div>
      <div class="topbar">
        <span style="width:42px"></span>
        <h1>${esc(t('missions.' + m.id + '.name'))} ${esc(t('completeTitle'))}</h1>
        <span style="width:42px"></span>
      </div>
      <div class="scroll" style="padding-bottom:30px">
        <div class="scene-wrap"><canvas class="scene" id="sc"></canvas></div>
        <div style="height:14px"></div>
        ${p.newL > p.oldL ? `<div class="lvup outline-text">${esc(t('levelUp'))}${stageOf(p.newL) > stageOf(p.oldL) ? `<small>${esc(t('stageUp'))}</small>` : ''}</div>` : ''}
        <div class="level-row" style="margin:4px 0 6px"><div class="level-pill"><b>${t('level')} ${p.newL}</b>${esc(stg.title)}</div></div>
        <div style="margin:0 26px 12px"><div class="bar xp"><i style="width:${p.xpPct}%"></i></div></div>
        <div class="speech glass">${esc(msg)}</div>
        <div class="gains"><span class="gain">✨ +${p.xp} XP</span>${gains}</div>
        <button class="px-btn hot" id="ok">${esc(t('completeCta'))}</button>
      </div>`;
  },

  log() {
    const days = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d); }
    const praise = S.praise.slice(-10).reverse();
    const aff = S.affirm.slice(-6).reverse();
    return `
      <div class="status"></div>
      <h2 class="page-h">${esc(t('logTitle'))}</h2>
      <div class="scroll">
        <div class="cards2">
          <div class="kpi glass"><small>${esc(t('totalDone'))}</small><b>${esc(t('times', { n: S.total }))}</b></div>
          <div class="kpi glass"><small>${esc(t('bestStreak'))}</small><b>${esc(t('days', { n: S.best }))}</b></div>
        </div>
        <div class="week glass">${days.map((d) => { const n = (S.done[dkey(d)] || []).length; return `<div class="${dkey(d) === today() ? 'today' : ''}">${t('week')[d.getDay()]}<i class="${n >= 4 ? 'l3' : n >= 2 ? 'l2' : n >= 1 ? 'l1' : ''}"></i></div>`; }).join('')}</div>
        <div class="section-h"><h2>📓 ${esc(t('praiseLog'))}</h2></div>
        ${praise.length ? praise.map((e) => `<div class="entry glass"><small>${e.date}</small><ul>${e.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('') : `<p class="empty">${esc(t('praiseEmpty'))}</p>`}
        ${aff.length ? `<div class="section-h"><h2>🪞 ${esc(t('affirmLog'))}</h2></div>${aff.map((e) => `<div class="entry glass"><small>${e.date}</small><p>“${esc(e.text)}”</p></div>`).join('')}` : ''}
      </div>
      ${navHTML()}`;
  },

  me() {
    const c = S.char;
    const pr = c.pronoun === 'custom' ? c.pronounCustom : c.pronoun !== 'name' ? t('pronouns.' + c.pronoun) : '';
    return `
      <div class="status"></div>
      <h2 class="page-h">${esc(t('meTitle'))}</h2>
      <div class="scroll">
        <div class="me-card glass"><canvas id="mc"></canvas><div><h3>${esc(charName())}</h3><p>${esc(pr || '')}</p><p>${t('level')} ${curLevel()} · ${S.xp} XP</p></div></div>
        <button class="px-btn" id="edit">${esc(t('editChar'))}</button>
        <div class="row glass"><span>${esc(t('language'))}</span>${langSwitch()}</div>
        <div class="row glass"><span>${esc(t('reminder'))}<br><small>${esc(t('reminderSoon'))}</small></span><span>🔔 07:30</span></div>
        <div class="row glass"><span>${esc(t('demoLevel'))}<br><small id="dl">${S.demoLevel ? t('level') + ' ' + S.demoLevel : 'OFF'}</small></span><input type="range" min="0" max="10" value="${S.demoLevel}" id="demo"></div>
        <div class="help glass"><b>💜 ${esc(t('help'))}</b>${esc(t('helpText'))}</div>
        <button class="px-btn ghost" id="reset">${esc(t('resetAll'))}</button>
      </div>
      ${navHTML()}`;
  },
};

function langSwitch() {
  return `<div class="lang-switch"><button data-lang="ko" class="${LANG === 'ko' ? 'on' : ''}">한국어</button><button data-lang="en" class="${LANG === 'en' ? 'on' : ''}">EN</button></div>`;
}
function bindLang(screen, params) {
  app.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => { S.lang = b.dataset.lang; setLang(S.lang); save(); go(screen, params); }));
}

// ---------- 이벤트 바인딩 ----------
const BIND = {
  intro() {
    const sample = { skin: 3, hair: 'curly', hairColor: 8, body: 'mid', top: 0, extras: ['pin'] };
    const cv = document.getElementById('introChar');
    drawers.push((tm) => drawPreview(cv, sample, tm, 'smile'));
    bindLang('intro');
    document.getElementById('start').onclick = () => go('create', { draft: { ...randomChar(), name: '', pronoun: 'name' } });
  },

  create(p) {
    const d = p.draft;
    const cv = document.getElementById('pv');
    drawers.push((tm) => drawPreview(cv, d, tm, 'big'));
    app.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => {
      d[b.dataset.k] = b.dataset.num ? Number(b.dataset.v) : b.dataset.v;
      const top = app.querySelector('.scroll').scrollTop;
      go('create', p); app.querySelector('.scroll').scrollTop = top;
    }));
    app.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', () => {
      const x = b.dataset.x; d.extras = d.extras.includes(x) ? d.extras.filter((e) => e !== x) : [...d.extras, x];
      const top = app.querySelector('.scroll').scrollTop;
      go('create', p); app.querySelector('.scroll').scrollTop = top;
    }));
    document.getElementById('nm').oninput = (e) => { d.name = e.target.value.trim(); };
    const pc = document.getElementById('pc'); if (pc) pc.oninput = (e) => { d.pronounCustom = e.target.value.trim(); };
    document.getElementById('rand').onclick = () => { Object.assign(d, randomChar()); go('create', p); };
    const back = document.getElementById('back'); if (back) back.onclick = () => go('me');
    document.getElementById('done').onclick = () => {
      S.char = { ...d, name: d.name || (LANG === 'ko' ? '토닥이' : 'Todot') };
      save(); tab = 'home'; go(p.edit ? 'me' : 'home');
    };
  },

  home() {
    const sc = document.getElementById('sc');
    addScene(sc, () => ({ char: S.char, stage: curStage(), mess: curMess(), mood: STAGE_MOOD[curStage()] }));
    app.querySelectorAll('[data-face]').forEach((c) => drawFaceIcon(c, S.char, c.dataset.face));
    app.querySelectorAll('[data-mood]').forEach((b) => b.addEventListener('click', () => { S.mood = { date: today(), v: Number(b.dataset.mood) }; save(); go('home'); }));
    document.getElementById('bell').onclick = () => {
      const left = MISSIONS.filter((m) => unlocked(m) && !doneToday().includes(m.id));
      toast(left.length ? `${left[0].icon} ${t('missions.' + left[0].id + '.name')}` : '🎉');
    };
    bindMissionCards(); bindNav();
  },

  missions() { bindMissionCards(); bindNav(); },

  run(p) {
    const m = M[p.id];
    const sc = document.getElementById('sc');
    const exit = () => { tab = 'home'; go('home'); };
    document.getElementById('x').onclick = () => (m.mode === 'timer' || m.mode === 'confirm' ? giveUp() : exit());

    if (m.mode === 'mirror') {
      addScene(sc, () => ({ char: S.char, stage: curStage(), scene: 'mirror', mood: p.count ? 'big' : 'smile', mess: curMess(), celebrate: p.count > 0 }));
      const setAff = (a) => { p.affirm = a; document.getElementById('aff').textContent = a; app.querySelectorAll('[data-aff]').forEach((c) => c.classList.toggle('on', c.dataset.aff === a)); };
      app.querySelectorAll('[data-aff]').forEach((c) => c.addEventListener('click', () => setAff(c.dataset.aff)));
      document.getElementById('affIn').oninput = (e) => { if (e.target.value.trim()) setAff(e.target.value.trim()); };
      const bump = () => {
        p.count++;
        document.getElementById('dots').innerHTML = [0, 1, 2].map((i) => `<i class="${i < p.count ? 'on' : ''}"></i>`).join('');
        if (p.count >= 3) {
          S.affirm.push({ date: today(), text: p.affirm }); save();
          setTimeout(() => complete(m.id, 1), 500);
        }
      };
      document.getElementById('said').onclick = bump;
      // 카메라 거울
      let stream = null, video = null;
      const camBtn = document.getElementById('cam');
      const stopCam = () => { if (stream) stream.getTracks().forEach((tr) => tr.stop()); stream = null; if (video) { video.parentElement.querySelector('.cam-frame')?.remove(); video.remove(); video = null; } camBtn.textContent = '📷 ' + t('mirrorCam'); };
      camBtn.onclick = async () => {
        if (stream) return stopCam();
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
          video = document.createElement('video'); video.className = 'cam'; video.autoplay = true; video.playsInline = true; video.muted = true; video.srcObject = stream;
          const wrap = document.getElementById('sw'); wrap.insertBefore(video, wrap.querySelector('.affirm-big'));
          const fr = document.createElement('div'); fr.className = 'cam-frame'; wrap.appendChild(fr);
          camBtn.textContent = '📷 ' + t('mirrorCamOff');
        } catch (e) { toast(t('camDenied')); }
      };
      cleanup.push(stopCam);
      // 음성 인식
      const mic = document.getElementById('mic');
      if (mic) {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        let rec = null;
        mic.onclick = () => {
          if (rec) return;
          rec = new SR(); rec.lang = LANG === 'ko' ? 'ko-KR' : 'en-US'; rec.interimResults = false;
          mic.textContent = t('mirrorListening');
          rec.onresult = (e) => { const txt = e.results[0][0].transcript; document.getElementById('heard').textContent = t('mirrorHeard', { t: txt }); bump(); };
          rec.onend = () => { rec = null; mic.textContent = t('mirrorSpeak'); };
          rec.onerror = () => { rec = null; mic.textContent = t('mirrorSpeak'); };
          rec.start();
        };
        cleanup.push(() => { if (rec) rec.abort(); });
      }
      return;
    }

    if (m.mode === 'praise') {
      addScene(sc, () => ({ char: S.char, stage: curStage(), scene: curStage() >= 4 ? 'room' : undefined, pose: 'stand', mood: 'smile', mess: curMess() }));
      document.getElementById('savePraise').onclick = () => {
        const items = [...app.querySelectorAll('[data-pr]')].map((i) => i.value.trim()).filter(Boolean);
        if (!items.length) { app.querySelector('[data-pr]').focus(); return; }
        S.praise.push({ date: today(), items }); save();
        complete(m.id, items.length / 3);
      };
      return;
    }

    // 타이머 / 확인형 미션
    const startMess = curMess();
    const dur = (m.mins || 0) * 60000;
    let elapsed = 0, last = performance.now(), paused = false;
    const progress = () => (dur ? Math.min(1, elapsed / dur) : 0);
    const scene = m.scene === 'window' ? (curStage() >= 2 ? 'window' : 'room') : m.scene || 'room';
    addScene(sc, () => ({
      char: S.char, stage: m.id === 'sun' ? Math.max(2, curStage()) : Math.min(curStage(), 3), scene,
      pose: m.pose || 'stand', mood: m.mood || 'smile',
      mess: m.id === 'clean' ? startMess * (1 - progress()) : curMess(),
    }));
    const tm = document.getElementById('tm');
    const bl = document.getElementById('bl');
    const tick = () => {
      const now = performance.now();
      if (!paused) elapsed += now - last;
      last = now;
      if (tm) { const left = Math.max(0, dur - elapsed); tm.textContent = `${pad(Math.floor(left / 60000))}:${pad(Math.floor((left % 60000) / 1000))}`; }
      if (bl) bl.textContent = (elapsed % 10000) < 4500 ? (LANG === 'ko' ? '들이쉬고…' : 'Breathe in…') : (LANG === 'ko' ? '내쉬고…' : 'Breathe out…');
      if (dur && elapsed >= dur) { clearInterval(iv); complete(m.id, 1); }
    };
    const iv = setInterval(tick, 250); tick();
    cleanup.push(() => clearInterval(iv));
    const pb = document.getElementById('pause');
    if (pb) pb.onclick = () => { paused = !paused; pb.textContent = t(paused ? 'resume' : 'pause'); };
    document.getElementById('finish').onclick = () => complete(m.id, 1);
    document.getElementById('stop').onclick = giveUp;

    function giveUp() {
      paused = true;
      const bg = sheet(`
        <h3>${esc(t('giveUpTitle'))}</h3><p>${esc(t('giveUpSub'))}</p>
        <button class="px-btn" id="half">${esc(t('giveUpKeep'))}</button>
        <button class="px-btn ghost" id="quit">${esc(t('giveUpQuit'))}</button>`, (el) => {
        el.querySelector('#half').onclick = () => { el.remove(); complete(m.id, 0.5); };
        el.querySelector('#quit').onclick = () => { el.remove(); exit(); };
      });
      bg.addEventListener('click', (e) => { if (e.target === bg) paused = false; });
    }
  },

  complete(p) {
    addScene(document.getElementById('sc'), () => ({
      char: S.char, stage: stageOf(p.newL), scene: stageOf(p.newL) >= 4 ? (p.id === 'meetup' ? 'meetup' : 'outdoor') : 'room',
      pose: 'cheer', mood: 'big', mess: curMess(), celebrate: true,
    }));
    document.getElementById('ok').onclick = () => { tab = 'home'; go('home'); };
  },

  log() { bindNav(); },

  me() {
    const cv = document.getElementById('mc');
    drawers.push((tm) => drawPreview(cv, S.char, tm, STAGE_MOOD[curStage()] === 'sad' ? 'down' : STAGE_MOOD[curStage()]));
    bindLang('me'); bindNav();
    document.getElementById('edit').onclick = () => go('create', { edit: true, draft: JSON.parse(JSON.stringify(S.char)) });
    const demo = document.getElementById('demo');
    demo.oninput = () => { S.demoLevel = Number(demo.value); document.getElementById('dl').textContent = S.demoLevel ? t('level') + ' ' + S.demoLevel : 'OFF'; save(); };
    demo.onchange = () => go('me');
    document.getElementById('reset').onclick = () => {
      if (confirm(t('resetConfirm'))) { const lang = S.lang; S = defaultState(); S.lang = lang; S.lastOpen = today(); save(); go('intro'); }
    };
  },
};

// ---------- 미션 시작 / 완료 ----------
function startMission(id) {
  const m = M[id];
  if (!unlocked(m)) return;
  go('run', { id, count: 0, affirm: t('affirmations')[0] });
}

function complete(id, factor) {
  const m = M[id];
  const oldL = curLevel();
  const xp = Math.round(m.xp * factor);
  const gains = {};
  Object.entries(m.gain).forEach(([k, v]) => {
    const g = Math.max(1, Math.round(v * factor));
    gains[k] = Math.min(g, 100 - Math.round(S.stats[k]));
    S.stats[k] = Math.min(100, S.stats[k] + g);
    if (gains[k] <= 0) delete gains[k];
  });
  S.xp += xp;
  if (id === 'clean') S.mess = Math.max(0, S.mess - 0.45 * factor);
  const td = today();
  S.done[td] = S.done[td] || [];
  if (!S.done[td].includes(id)) S.done[td].push(id);
  S.total++;
  if (S.lastDone !== td) { S.streak = S.lastDone === yesterday() ? S.streak + 1 : 1; S.lastDone = td; }
  S.best = Math.max(S.best, S.streak);
  save();
  const newL = curLevel();
  const L = levelFromXp(S.xp);
  const xpPct = Math.round(((S.xp - need(L)) / (need(L + 1) - need(L))) * 100);
  go('complete', { id, xp, gains, oldL, newL, xpPct });
}

// ---------- 시작 ----------
go(S.char ? 'home' : 'intro');
