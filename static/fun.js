/* Interações divertidas e aparência: som (mudo), chamar atenção, música de tensão, reações e temas.
   Carregar depois de common.js e i18n_extra.js. */

// ---------------- áudio: desbloqueio no 1º toque + botão de mudo ----------------
let MUTED = store('arena_muted') === '1';
function audioCtx() {
  _ac = _ac || new (window.AudioContext || window.webkitAudioContext)();
  if (_ac.state === 'suspended') _ac.resume();
  return _ac;
}
['pointerdown', 'keydown', 'touchstart'].forEach(ev => document.addEventListener(ev, () => { try { audioCtx(); } catch (e) {} }, { once: true, passive: true }));
const _beepOrig = beep;
beep = function (type) { if (!MUTED) _beepOrig(type); };   // respeita o mudo em todos os sons curtos
function mountSoundToggle() {
  if (document.getElementById('soundToggle')) return;
  const b = document.createElement('button');
  b.id = 'soundToggle';
  b.className = 'fixed bottom-3 left-3 z-[70] w-10 h-10 rounded-full bg-slate-900/90 border border-slate-600 text-slate-100 shadow-lg';
  const paint = () => { b.innerHTML = MUTED ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>'; b.title = t(MUTED ? 'sound_off' : 'sound_on'); };
  b.onclick = () => { MUTED = !MUTED; store('arena_muted', MUTED ? '1' : '0'); paint(); if (MUTED) Tension.stop(); };
  paint(); document.body.appendChild(b);
}

// ---------------- sons altos do "chamar atenção" ----------------
function loudSound(kind) {
  if (MUTED) return;
  try {
    const ctx = audioCtx(), now = ctx.currentTime;
    const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    const comp = ctx.createDynamicsCompressor(); comp.connect(master);
    const tone = (type, f0, f1, start, dur, vol) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, now + start);
      if (f1) o.frequency.exponentialRampToValueAtTime(f1, now + start + dur);
      g.gain.setValueAtTime(0.0001, now + start); g.gain.exponentialRampToValueAtTime(vol, now + start + 0.02);
      g.gain.setValueAtTime(vol, now + start + dur - 0.05); g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      o.connect(g); g.connect(comp); o.start(now + start); o.stop(now + start + dur + 0.02);
    };
    if (kind === 'scare') {                         // 😱 susto: ruído + grito descendo
      const len = ctx.sampleRate * 0.9, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const n = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
      bp.type = 'bandpass'; bp.frequency.setValueAtTime(3000, now); bp.frequency.exponentialRampToValueAtTime(500, now + 0.9);
      g.gain.value = 0.9; n.buffer = buf; n.connect(bp); bp.connect(g); g.connect(comp); n.start(now);
      tone('square', 1400, 280, 0, 0.9, 0.5); tone('sawtooth', 1900, 350, 0.02, 0.85, 0.35);
    } else if (kind === 'siren') {                  // 🚨 sirene
      for (let i = 0; i < 3; i++) { tone('sawtooth', 650, 1300, i * 0.5, 0.25, 0.45); tone('sawtooth', 1300, 650, i * 0.5 + 0.25, 0.25, 0.45); }
    } else {                                        // 📯 buzina (3 toques)
      [0, 0.4, 0.8].forEach(st => [233, 294, 349].forEach(f => tone('sawtooth', f, null, st, 0.32, 0.3)));
    }
  } catch (e) {}
}
const NUDGE_META = { horn: '📯', scare: '😱', siren: '🚨' };
let seenNudges = null;
// chamado a cada poll do celular: toca e mostra o que chegou de novo
function handleInbox(inbox) {
  inbox = inbox || [];
  if (seenNudges === null) { seenNudges = new Set(inbox.map(m => m.id)); return; }   // não toca mensagens antigas ao abrir a página
  inbox.forEach(m => {
    if (seenNudges.has(m.id)) return;
    seenNudges.add(m.id);
    loudSound(m.kind);
    if (navigator.vibrate) navigator.vibrate([400, 120, 400, 120, 600]);
    const o = document.createElement('div');
    o.className = 'nudge-flash';
    o.innerHTML = `<div class="nudge-box"><div class="text-6xl">${NUDGE_META[m.kind] || '📢'}</div><div class="text-2xl font-black mt-2">${esc(t('nudge_got', { name: m.host ? t('host_label') : m.from }))}</div></div>`;
    document.body.appendChild(o); document.body.classList.add('shake');
    setTimeout(() => { o.remove(); document.body.classList.remove('shake'); }, 1800);
  });
}
// janela para escolher o rival e o tipo de som
function openNudge(players, myId, left, sendFn) {
  let m = document.getElementById('nudgeModal');
  if (!m) { m = document.createElement('div'); m.id = 'nudgeModal'; m.className = 'modal hidden'; document.body.appendChild(m); }
  let kind = 'horn';
  const others = players.filter(p => p.id !== myId);
  const draw = () => {
    m.innerHTML = `<div class="panel neon-gold max-w-sm w-full p-5 space-y-3 text-slate-100">
      <div class="flex items-center justify-between"><h3 class="font-esports text-base font-black text-amber-300">📢 ${t('nudge_title')}</h3>
        <button data-x class="w-9 h-9 rounded-xl bg-slate-800 text-slate-300"><i class="fa-solid fa-xmark"></i></button></div>
      <p class="text-xs text-slate-400">${t('nudge_desc', { n: left })}</p>
      <div class="grid grid-cols-3 gap-2">${Object.keys(NUDGE_META).map(k => `<button data-k="${k}" class="btn rounded-xl py-2 border ${k === kind ? 'border-amber-400 bg-amber-500/20' : 'border-slate-700 bg-slate-900'}"><div class="text-2xl">${NUDGE_META[k]}</div><div class="text-[10px] font-bold">${t('nudge_' + k)}</div></button>`).join('')}</div>
      <div class="space-y-1.5 max-h-60 overflow-y-auto">${others.length ? others.map(p => `<button data-p="${p.id}" class="btn w-full text-left px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 font-semibold">${esc(p.name)}</button>`).join('') : `<p class="text-xs text-slate-500">${t('waiting_players')}</p>`}</div>
    </div>`;
  };
  draw(); m.classList.remove('hidden');
  m.onclick = async e => {
    const el = e.target.closest('button');
    if (e.target === m || (el && el.dataset.x !== undefined)) { m.classList.add('hidden'); return; }
    if (!el) return;
    if (el.dataset.k) { kind = el.dataset.k; draw(); return; }
    if (el.dataset.p) { m.classList.add('hidden'); await sendFn(el.dataset.p, kind); }
  };
}

// ---------------- música de tensão (últimos segundos) ----------------
const Tension = {
  on: false, timer: null, drone: null, droneGain: null, ratio: 1, beat: 0,
  update(left, windowSecs) {
    if (MUTED || left <= 0 || left > windowSecs) return this.stop();
    this.ratio = Math.max(0, Math.min(1, left / windowSecs));
    if (!this.on) { this.on = true; this.startDrone(); this.loop(); }
    this.tuneDrone();
  },
  startDrone() {
    try {
      const ctx = audioCtx(), o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = 'sawtooth'; lp.type = 'lowpass'; lp.frequency.value = 500; g.gain.value = 0.0001;
      o.connect(lp); lp.connect(g); g.connect(ctx.destination); o.start();
      this.drone = o; this.droneGain = g;
    } catch (e) {}
  },
  tuneDrone() {
    if (!this.drone) return;
    const ctx = audioCtx(), r = this.ratio;
    this.drone.frequency.setTargetAtTime(55 + (1 - r) * 70, ctx.currentTime, 0.3);     // sobe o tom
    this.droneGain.gain.setTargetAtTime(0.02 + (1 - r) * 0.07, ctx.currentTime, 0.3);   // e o volume
  },
  loop() {
    if (!this.on) return;
    try {
      const ctx = audioCtx(), now = ctx.currentTime, r = this.ratio;
      const tick = (f, dur, vol, type) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, now); g.gain.exponentialRampToValueAtTime(0.0001, now + dur); o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now + dur); };
      tick(this.beat % 2 ? 900 : 1200, 0.05, 0.12, 'square');                    // tique-taque
      if (this.beat % 2 === 0) { tick(62, 0.18, 0.5, 'sine'); }                     // batida de coração
      this.beat++;
    } catch (e) {}
    this.timer = setTimeout(() => this.loop(), 150 + 450 * this.ratio);            // acelera no fim
  },
  stop() {
    this.on = false; clearTimeout(this.timer);
    if (this.drone) { try { this.drone.stop(); } catch (e) {} this.drone = null; }
  }
};
// helper: chama a cada tick do relógio da pergunta
function tensionTick(phase, question, settings, remaining) {
  if (phase === 'open' && question && !question.paused && settings && settings.tension_music) Tension.update(remaining, settings.tension_secs || 10);
  else Tension.stop();
}

// ---------------- reações com emoji ----------------
const REACTIONS = ['😀', '😂', '🤣', 'HAHAHA', '😍', '👏', '🔥', '😮', '😱', '😡', '🤬', '😭', '🤯', '🎉'];
function reactionBarHTML(onclickName) {
  return REACTIONS.map(e => `<button onclick="${onclickName}('${e}')" class="react-btn">${e === 'HAHAHA' ? '<span class="text-[11px] font-black">HAHAHA</span>' : e}</button>`).join('');
}
let seenReacts = null;
function showReactions(list) {               // tela do apresentador: emojis sobem flutuando
  list = list || [];
  if (seenReacts === null) { seenReacts = new Set(list.map(r => r.id)); return; }
  let layer = document.getElementById('reactLayer');
  if (!layer) { layer = document.createElement('div'); layer.id = 'reactLayer'; layer.className = 'react-layer'; document.body.appendChild(layer); }
  list.forEach(r => {
    if (seenReacts.has(r.id)) return;
    seenReacts.add(r.id);
    const el = document.createElement('div');
    el.className = 'react-float' + (r.host ? ' host' : '');
    el.style.left = (5 + Math.random() * 85) + '%';
    el.style.animationDuration = (3.2 + Math.random() * 1.6) + 's';
    el.innerHTML = `<div class="${r.emoji === 'HAHAHA' ? 'react-text' : 'react-emoji'}">${esc(r.emoji)}</div><div class="react-name">${r.host ? '🎤 ' + esc(t('host_label')) : esc(r.name)}</div>`;
    layer.appendChild(el); setTimeout(() => el.remove(), 5200);
  });
}

// ---------------- temas ----------------
// Cada tema tem 3 variações de cor (v = cor mostrada no seletor). Grupos: auditório, inclusão, básicos.
const THEMES = {
  neon_pink:  { g: 'show', icon: '💜', font: 'Monoton&family=Poppins:wght@500;700;800', v: ['#ff3df0', '#ff2e88', '#f9a8d4'] },
  neon_blue:  { g: 'show', icon: '💙', font: 'Poppins:wght@500;700;800', v: ['#4fd1ff', '#3b82f6', '#818cf8'] },
  stage:      { g: 'show', icon: '🎤', font: 'Poppins:wght@600;800;900', v: ['#2563eb', '#7c3aed', '#dc2626'] },
  prize_blue: { g: 'show', icon: '🏆', font: 'Poppins:wght@600;800;900', v: ['#29a8e0', '#2563eb', '#1e3a8a'] },
  prize_red:  { g: 'show', icon: '💰', font: 'Poppins:wght@600;800;900', v: ['#d90016', '#991b1b', '#ef4444'] },
  pride:      { g: 'incl', icon: '🏳️‍🌈', font: 'Pacifico&family=Poppins:wght@500;700;800;900', v: ['#8b2cf5', '#6d28d9', '#c026d3'] },
  diversity:  { g: 'incl', icon: '🌍', font: 'Poppins:wght@500;700;800;900', v: ['#000000', '#0f172a', '#292524'] },
  kids_incl:  { g: 'incl', icon: '🌂', font: 'Fredoka:wght@500;600;700', v: ['#fdf6e3', '#e0f2fe', '#fde2e4'] },
  minds:      { g: 'incl', icon: '🧠', font: 'Poppins:wght@500;700;800;900', v: ['#ffffff', '#fef9c3', '#f3e8ff'] },
  kids:       { g: 'kids', icon: '🧸', font: 'Fredoka:wght@500;600;700&family=Baloo+2:wght@600;800', v: ['#fffdf7', '#7fcdc1', '#ffd600'], vn: ['kids_v0', 'kids_v1', 'kids_v2'] },
  gamer:      { g: 'base', icon: '🎮', font: null, v: ['#06b6d4', '#a855f7', '#22c55e'] },
  corporate:  { g: 'base', icon: '💼', font: 'Montserrat:wght@500;700;800;900', v: ['#1e3a8a', '#0f766e', '#334155'] },
  inclusive:  { g: 'base', icon: '🔳', font: 'Atkinson+Hyperlegible:wght@400;700', v: ['#ffd400', '#ffffff', '#000000'] }
};
const SHOW_THEMES = ['neon_pink', 'neon_blue', 'stage', 'prize_blue', 'prize_red', 'pride', 'diversity', 'kids_incl', 'minds', 'kids'];
const LIGHT_THEMES = ['kids_incl', 'minds', 'kids'];       // temas de fundo claro (texto escuro)
function resolveTheme(settings) {
  const th = settings && settings.theme;
  if (th && th !== 'auto' && THEMES[th]) return th;
  return settings && settings.mode === 'classic' ? 'corporate' : 'gamer';
}
let currentTheme = null;
function applyTheme(settings) {
  const th = resolveTheme(settings), v = String((settings && settings.theme_variant) || 0);
  if (th + v === currentTheme) return;
  currentTheme = th + v;
  const root = document.documentElement;
  root.dataset.theme = th; root.dataset.variant = v;
  root.classList.toggle('show-theme', SHOW_THEMES.includes(th));
  root.classList.toggle('show-dark', SHOW_THEMES.includes(th) && !LIGHT_THEMES.includes(th));
  root.classList.toggle('show-light', LIGHT_THEMES.includes(th));
  const f = THEMES[th].font;
  if (f && !document.getElementById('font-' + th)) {
    const l = document.createElement('link'); l.id = 'font-' + th; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + f + '&display=swap'; document.head.appendChild(l);
  }
}
// Seletor: cartão por tema com 3 bolinhas de cor (variações). Clicar numa bolinha escolhe tema + tom.
function themePickerHTML(selected, variant) {
  const card = k => {
    const sel = k === selected;
    const dots = k === 'auto' ? '<span class="text-[10px] opacity-70">Arena: 🎮 · Clássico: 💼</span>'
      : THEMES[k].v.map((c, i) => `<button type="button" class="theme-dot ${sel && i === +variant ? 'on' : ''}" data-t="${k}" data-v="${i}" title="${esc(t('theme_' + k))} · ${THEMES[k].vn ? t(THEMES[k].vn[i]) : t('variant_n', { n: i + 1 })}" style="background:${c}"></button>`).join('');
    return `<div class="theme-card ${sel ? 'sel' : ''}" data-t="${k}" data-v="0">
      <span class="text-[11px] font-bold">${k === 'auto' ? '✨' : THEMES[k].icon} ${t('theme_' + k)}</span>
      <span class="flex gap-1.5 items-center">${dots}</span></div>`;
  };
  const group = (g, label) => `<div class="col-span-full text-[10px] font-esports uppercase text-purple-300 mt-1">${t(label)}</div>` +
    Object.keys(THEMES).filter(k => THEMES[k].g === g).map(card).join('');
  return card('auto') + group('show', 'theme_group_show') + group('incl', 'theme_group_incl') + group('kids', 'theme_group_kids') + group('base', 'theme_group_base') +
    `<input type="hidden" id="sThemeVal" value="${selected}"><input type="hidden" id="sVariantVal" value="${variant || 0}">`;
}
document.addEventListener('click', e => {
  const el = e.target.closest && e.target.closest('#sThemes [data-t]');
  if (!el) return;
  const k = el.dataset.t, v = el.classList.contains('theme-card') && !el.classList.contains('sel') ? 0 : +el.dataset.v;
  if (el.classList.contains('theme-card') && el.classList.contains('sel')) return;   // clique no cartão já escolhido não muda o tom
  document.getElementById('sThemes').innerHTML = themePickerHTML(k, v);
});

// ---------------- modo acessível (por aparelho, combina com qualquer tema) ----------------
let A11Y = store('arena_a11y') === '1';
document.documentElement.classList.toggle('a11y', A11Y);
function mountA11yToggle() {
  if (document.getElementById('a11yToggle')) return;
  const b = document.createElement('button');
  b.id = 'a11yToggle';
  b.className = 'fixed bottom-3 left-14 z-[70] w-10 h-10 rounded-full bg-slate-900/90 border border-slate-600 text-slate-100 shadow-lg text-lg';
  b.textContent = '♿';
  const paint = () => { b.setAttribute('aria-pressed', A11Y); b.title = t(A11Y ? 'a11y_on' : 'a11y_off'); b.classList.toggle('ring-4', A11Y); b.classList.toggle('ring-yellow-300', A11Y); };
  const font = () => { if (A11Y && !document.getElementById('font-a11y')) { const l = document.createElement('link'); l.id = 'font-a11y'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap'; document.head.appendChild(l); } };
  font();
  b.onclick = () => { A11Y = !A11Y; font(); store('arena_a11y', A11Y ? '1' : '0'); document.documentElement.classList.toggle('a11y', A11Y); paint(); toast(t(A11Y ? 'a11y_on' : 'a11y_off'), true); };
  paint(); document.body.appendChild(b);
}
const _mountSound = mountSoundToggle;
mountSoundToggle = function () { _mountSound(); mountA11yToggle(); };

// ---------------- palco da pergunta (telão) para os temas de auditório ----------------
function stageOn(settings) { return SHOW_THEMES.includes(resolveTheme(settings)); }
let stageSig = '';
function renderStage(box, st) {
  const q = st.question, ph = st.phase, th = resolveTheme(st.settings), reveal = ph === 'reveal';
  if (!q) return;
  const sig = [th, st.qi, ph, q.dist, q.turn_elim, q.turn_pick, q.answered, q.eligible, q.winner && q.winner.id, LANG].join('|');
  if (sig === stageSig && box.innerHTML) return;
  stageSig = sig;
  const numbered = th === 'prize_red';
  const n = q.options.length, rows = Math.ceil(n / (numbered ? 1 : 2));
  const opts = q.options.map((o, i) => {
    let cls = 'stage-opt';
    if (reveal && !q.poll) cls += i === q.correct ? ' right' : (q.turn && i === q.turn_pick ? ' wrong' : ' dim');
    else if (!reveal && (q.turn_elim || []).includes(i)) cls += ' dim';
    if (q.turn && i === q.turn_pick && !reveal) cls += ' picked';
    const letter = numbered ? `<span class="stage-let">${i + 1}</span>` : `<span class="stage-let">${'ABCDEF'[i]}:</span>`;
    const cnt = reveal && q.dist ? `<span class="stage-cnt">${q.dist[i]}</span>` : '';
    return `<div class="${cls}">${letter}<span>${esc(o)}</span>${cnt}</div>`;
  }).join('');
  let result = '', expl = '';
  if (reveal) {
    if (q.poll) result = t('poll_result');
    else if (q.turn) result = turnResultText(q);
    else if (st.settings.mode === 'classic') result = '✅ ' + t('stage_correct_n', { n: q.dist ? q.dist[q.correct] : 0 });
    else result = q.winner ? t('winner_banner', { name: q.winner.name, pts: q.winner.points }) : t('nobody_won');
    if (!q.poll && (q.explanation || q.reference)) expl = esc(q.explanation || '') + (q.reference ? ` <span style="opacity:.7">· ${esc(q.reference)}</span>` : '');
  }
  const chips = [
    `<span class="stage-chip">${esc(t('stage_question', { n: st.qi + 1, total: st.total }))}</span>`,
    q.turn ? `<span class="stage-chip">🎯 ${esc(t('turn_of', { name: q.turn.name }))}</span>` : '',
    q.poll ? `<span class="stage-chip">${t('poll_badge')}</span>` : '',
    `<span class="stage-chip">${esc(t('answered_count', { n: q.answered, total: q.eligible }))}</span>`
  ].join('');
  box.innerHTML = `<div class="stage">
    <div class="stage-mark">?</div>
    <div class="stage-top"><div class="stage-chips">${chips}</div><div id="stageTimer" class="stage-timer">--</div></div>
    <div class="stage-title" aria-hidden="true"><span>Q</span><span>U</span><span>I</span><span>Z</span></div>
    <div class="stage-heading">${esc(t('stage_heading', { n: String(st.qi + 1).padStart(2, '0') }))}</div>
    <div class="stage-q"><div class="stage-qbox"><span class="stage-num">${st.qi + 1}</span><span class="stage-qtext">${esc(q.question)}</span></div></div>
    ${q.image ? `<img class="stage-img" src="${esc(q.image)}" alt="">` : ''}
    <div class="stage-optwrap rows${Math.min(3, rows)}"><div class="stage-opts ${numbered ? 'one' : ''}">${opts}</div></div>
    ${result ? `<div class="stage-result pop-in">${esc(result)}</div>` : ''}
    ${expl ? `<div class="stage-expl">${expl}</div>` : ''}
  </div>`;
}
function stageTick(st, remaining) {
  const el = document.getElementById('stageTimer'); if (!el || !st || !st.question) return;
  const q = st.question;
  if (st.phase !== 'open') { el.textContent = q.next_at ? Math.max(0, Math.ceil(q.next_at - nowS())) : '✓'; el.classList.remove('low'); return; }
  el.textContent = q.paused ? '⏸' : Math.ceil(remaining);
  el.classList.toggle('low', remaining <= 5 && !q.paused);
}

// ---------------- maximizar janelas e tela cheia ----------------
function enhanceModals(root) {
  (root || document).querySelectorAll('.modal').forEach(m => {
    const panel = m.querySelector('.panel'); if (!panel || panel.dataset.maxReady) return;
    const close = panel.querySelector('button i.fa-xmark'); if (!close) return;
    panel.dataset.maxReady = '1';
    const key = 'arena_max_' + (m.id || 'modal');
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'maxbtn';
    const paint = () => { const on = panel.classList.contains('maxi'); b.innerHTML = `<i class="fa-solid ${on ? 'fa-compress' : 'fa-expand'}"></i>`; b.title = t(on ? 'win_restore' : 'win_max'); };
    b.onclick = e => { e.stopPropagation(); panel.classList.toggle('maxi'); store(key, panel.classList.contains('maxi') ? '1' : '0'); paint(); };
    if (store(key) === '1') panel.classList.add('maxi');
    const btn = close.closest('button');
    const wrap = document.createElement('span'); wrap.className = 'flex items-center gap-2 flex-none';
    btn.parentNode.insertBefore(wrap, btn); wrap.appendChild(b); wrap.appendChild(btn);
    paint();
  });
}
document.addEventListener('DOMContentLoaded', () => enhanceModals());
if (document.readyState !== 'loading') setTimeout(() => enhanceModals(), 0);
function mountFsToggle() {
  if (document.getElementById('fsToggle') || !(document.fullscreenEnabled || document.webkitFullscreenEnabled)) return;
  const b = document.createElement('button');
  b.id = 'fsToggle';
  b.className = 'fixed bottom-3 left-[6.25rem] z-[70] w-10 h-10 rounded-full bg-slate-900/90 border border-slate-600 text-slate-100 shadow-lg';
  b.style.left = '6.25rem';
  const paint = () => { const on = !!(document.fullscreenElement || document.webkitFullscreenElement); b.innerHTML = `<i class="fa-solid ${on ? 'fa-compress' : 'fa-expand'}"></i>`; b.title = t(on ? 'fs_exit' : 'fs_enter'); };
  b.onclick = () => {
    const d = document.documentElement;
    if (document.fullscreenElement || document.webkitFullscreenElement) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else (d.requestFullscreen || d.webkitRequestFullscreen).call(d);
  };
  document.addEventListener('fullscreenchange', paint); document.addEventListener('webkitfullscreenchange', paint);
  paint(); document.body.appendChild(b);
}
const _mountSound2 = mountSoundToggle;
mountSoundToggle = function () { _mountSound2(); mountFsToggle(); };

// ---------------- recebidos do organizador (celulares) ----------------
let seenBroadcasts = null;
function handleBroadcasts(list) {
  list = list || [];
  if (seenBroadcasts === null) { seenBroadcasts = new Set(list.map(b => b.id)); return; }
  list.forEach(b => {
    if (seenBroadcasts.has(b.id)) return;
    seenBroadcasts.add(b.id);
    beep('power');
    const o = document.createElement('div');
    o.className = 'bc-flash';
    o.innerHTML = `<div class="bc-emoji ${b.emoji === 'HAHAHA' ? 'txt' : ''}">${esc(b.emoji)}</div><div class="bc-cap">🎤 ${esc(t('host_label'))}</div>`;
    document.body.appendChild(o); setTimeout(() => o.remove(), 2000);
  });
}
let lastHostEventT = null;
function hostEventToasts(events) {
  events = events || [];
  const maxT = events.reduce((m, e) => Math.max(m, e.t), 0);
  if (lastHostEventT === null) { lastHostEventT = maxT; return; }
  events.filter(e => e.t > lastHostEventT && /^ev_host_/.test(e.k)).reverse().forEach(e => { toast(eventText(e), true); beep('power'); });
  lastHostEventT = Math.max(lastHostEventT, maxT);
}

// ---------------- botão Sair (celulares) ----------------
function mountLeaveButton() {
  if (document.getElementById('leaveBtn') || typeof leaveRoom !== 'function') return;
  const b = document.createElement('button');
  b.id = 'leaveBtn';
  // fica na mesma fileira dos outros botões do canto esquerdo (som, acessível, tela cheia), longe dos botões do jogo
  b.className = 'fixed bottom-3 z-[70] h-10 px-3 rounded-full bg-slate-900/90 border border-slate-600 text-slate-100 text-xs font-bold shadow-lg';
  b.style.left = (document.fullscreenEnabled || document.webkitFullscreenEnabled) ? '9.25rem' : '6.25rem';
  b.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> <span data-i18n="btn_leave"></span>';
  b.querySelector('span').textContent = t('btn_leave');
  b.onclick = () => leaveRoom();
  document.body.appendChild(b);
}
const _mountSound3 = mountSoundToggle;
mountSoundToggle = function () { _mountSound3(); mountLeaveButton(); };
