/* Núcleo do painel do apresentador (Arena e Clássico): sessão, polling, controles, configurações e quiz.
   A página define PAGE_MODE ('arena' | 'classic'), render() e tickTimer(). */
let H = null, ST = null, offset = 0, polling = false, boardPeek = false, cfgModeSel = 'arena', pollTimer = null;
const HKEY = 'arena_host';
const nowS = () => Date.now() / 1000 + offset;
function show(id, on) { const e = document.getElementById(id); if (e) e.classList.toggle('hidden', !on); }

function hostSession() { try { return JSON.parse(store(HKEY) || 'null'); } catch (e) { return null; } }
function startHost() {
  if (pollTimer) return;
  poll(); pollTimer = setInterval(poll, 1000); setInterval(() => typeof tickTimer === 'function' && tickTimer(), 200);
  mountSoundToggle();
  setInterval(() => { if (ST) tensionTick(ST.phase, ST.question, ST.settings, ST.question ? qRemaining(ST.question) : 0); }, 250);
}
async function poll() {
  if (polling || !H) return; polling = true;
  try {
    const r = await api(`/api/state/${H.code}?role=host&token=${encodeURIComponent(H.token)}`);
    if (!r.ok) {
      if (r.status === 404 || r.status === 403 || r.status === 410) { store(HKEY, null); location.href = r.status === 410 ? '/host?ended=1' : '/host'; }
      return;
    }
    ST = r.data; offset = ST.now - Date.now() / 1000;
    // cada modo tem a sua tela: troca de página se o modo mudou
    if (ST.settings.mode !== PAGE_MODE) { location.replace(ST.settings.mode === 'classic' ? '/host/classic' : '/host'); return; }
    applyTheme(ST.settings);
    render(); renderControls(); renderRequests(); showReactions(ST.reactions);
  } finally { polling = false; }
}

// tempo restante da pergunta (congelado quando pausada)
function qRemaining(q) { return q.paused ? q.remaining : Math.max(0, q.end - nowS()); }
function boardShown() { return !!ST && (ST.board_visible || boardPeek); }
function toggleBoardPeek() { boardPeek = !boardPeek; render(); renderControls(); }

const CONFIRM = { finish: 'confirm_finish', restart: 'confirm_restart' };
async function hostAction(action, pid, rid) {
  if (CONFIRM[action] && !confirm(t(CONFIRM[action]))) return;
  beep('click');
  const r = await api(`/api/host/${H.code}/${action}`, { token: H.token, pid, rid });
  if (!r.ok) toast(errText(r.data.error), false);
  else if (action === 'start' || action === 'next') { beep('start'); boardPeek = false; }
  poll();
}
// Mostra/esconde os botões de controle conforme a fase (ids opcionais em cada página)
function renderControls() {
  if (!ST) return;
  const ph = ST.phase, q = ST.question, paused = !!(q && q.paused);
  show('ctlPause', ph === 'open' && !paused); show('ctlResume', ph === 'open' && paused);
  show('ctlClose', ph === 'open'); show('ctlNext', ph === 'reveal');
  show('ctlFinish', ph === 'open' || ph === 'reveal'); show('ctlRestart', ph !== 'lobby');
  show('ctlBoard', (ph === 'open' || ph === 'reveal') && !ST.board_visible);
  show('ctlConfig', ph !== 'finished'); show('ctlQuiz', ph === 'lobby');
  const lb = document.getElementById('ctlBoardLbl'); if (lb) lb.textContent = t(boardPeek ? 'ctrl_board_hide' : 'ctrl_board_show');
  const nx = document.getElementById('ctlNextLbl'); if (nx) nx.textContent = ST.qi + 1 >= ST.total ? t('final_title') : t('btn_next');
  show('pausedBanner', paused);
  // avanço automático (barra de controles)
  const auto = document.getElementById('ctlAuto'), dl = document.getElementById('ctlAutoDelay');
  if (auto && document.activeElement !== auto) auto.checked = !!ST.settings.auto_next;
  if (dl) { if (!dl.options.length) dl.innerHTML = delayOptions(); if (document.activeElement !== dl) dl.value = String(ST.settings.auto_delay); }
  show('ctlHold', ph === 'reveal' && ST.settings.auto_next && !ST.auto_hold);
  show('ctlRelease', ph === 'reveal' && ST.settings.auto_next && ST.auto_hold);
  updateAutoLabel();
}
const DELAYS = [3, 5, 8, 10, 15, 20, 30, 45, 60];
function delayOptions() { return DELAYS.map(d => `<option value="${d}">${d}s</option>`).join(''); }
function updateAutoLabel() {
  const el = document.getElementById('ctlAutoLbl'); if (!el || !ST) return;
  const q = ST.question;
  if (ST.phase === 'reveal' && q && q.next_at) { el.textContent = t('next_in', { s: Math.max(0, Math.ceil(q.next_at - nowS())) }); el.classList.remove('hidden'); }
  else if (ST.phase === 'reveal' && ST.auto_hold) { el.textContent = t('auto_hold'); el.classList.remove('hidden'); }
  else el.classList.add('hidden');
}
setInterval(updateAutoLabel, 250);
async function setAuto() {
  const on = document.getElementById('ctlAuto').checked, d = +document.getElementById('ctlAutoDelay').value;
  const r = await api(`/api/host/${H.code}/settings`, { token: H.token, settings: { auto_next: on, auto_delay: d } });
  if (!r.ok) toast(errText(r.data.error), false);
  poll();
}

// ---------------- pedidos de entrada (salas públicas) ----------------
let knownReq = new Set();
function renderRequests() {
  const list = (ST && ST.requests) || [];
  show('reqDock', list.length > 0);
  const n = document.getElementById('reqN'); if (!n) return;
  n.textContent = list.length;
  document.getElementById('reqList').innerHTML = list.map(r => `<div class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-xs">
    <span class="truncate font-semibold">${esc(r.name)}</span>
    <span class="flex gap-1 flex-none"><button onclick="hostAction('approve', null, '${r.id}')" class="btn px-2 py-1 rounded bg-emerald-500 text-slate-950 font-bold">${t('req_accept')}</button>
    <button onclick="hostAction('deny', null, '${r.id}')" class="btn px-2 py-1 rounded bg-rose-500/30 text-rose-200">${t('req_deny')}</button></span></div>`).join('');
  list.forEach(r => { if (!knownReq.has(r.id)) { knownReq.add(r.id); beep('power'); toast(t('req_new', { name: r.name }), true); } });
}

// ---------------- configurações ----------------
function cfgMode(m) {
  cfgModeSel = m;
  document.querySelectorAll('.cfgCard').forEach(b => {
    const on = b.dataset.cmode === m;
    b.classList.toggle('border-purple-400', on); b.classList.toggle('border-slate-700', !on);
  });
  document.querySelectorAll('#cfgModal .arenaOnly').forEach(e => e.classList.toggle('hidden', m !== 'arena'));
  document.querySelectorAll('#cfgModal .classicOnly').forEach(e => e.classList.toggle('hidden', m !== 'classic'));
}
function openConfig() {
  if (!ST) return;
  const s = ST.settings, lobby = ST.phase === 'lobby';
  sTimer.value = s.timer; sBase.value = s.base_xp; sMult.value = s.multiplier; sCharges.value = s.charges; sClassic.value = s.classic_points;
  sProg.checked = s.progressive; sClose.checked = s.close_on_first; sLang.value = s.lang;
  document.querySelectorAll('input[name=sBoard]').forEach(r => { r.checked = r.value === s.board_mode; });
  document.querySelectorAll('input[name=sVis]').forEach(r => { r.checked = r.value === (s.visibility || 'private'); });
  document.querySelectorAll('input[name=sOrder]').forEach(r => { r.checked = r.value === (s.answer_order || 'speed'); });
  sRoomName.value = s.room_name || ''; sAuto.checked = !!s.auto_next;
  sNudge.value = s.nudge_limit; sReact.checked = !!s.reactions_on; sTension.checked = !!s.tension_music; sTensionSecs.value = String(s.tension_secs);
  document.getElementById('sThemes').innerHTML = themePickerHTML(s.theme || 'auto', s.theme_variant || 0);
  sAutoDelay.innerHTML = delayOptions(); sAutoDelay.value = String(s.auto_delay || 8);
  document.getElementById('cfgPowers').innerHTML = POWER_META.map(m => `
    <label class="flex items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs">
      <span class="flex items-center gap-2"><input id="pwOn_${m.key}" type="checkbox" ${s.powers_on[m.key] ? 'checked' : ''} class="accent-cyan-400">
        <i class="fa-solid ${m.icon} ${PW_STYLE[m.color].split(' ').pop()}"></i> ${t('pwr_' + m.key)}</span>
      <span class="flex items-center gap-1 text-slate-400"><input id="pwTh_${m.key}" type="number" min="0" max="50" value="${s.thresholds[m.key]}" class="w-12 bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-white"> ${t('cfg_power_hits')}</span>
    </label>`).join('');
  scopeInit(s);
  cfgMode(s.mode);
  document.getElementById('cfgModeBox').classList.toggle('hidden', !lobby);
  document.querySelectorAll('#cfgModal .lobbyOnly').forEach(e => e.classList.toggle('hidden', !lobby));
  show('cfgLiveNote', !lobby);
  document.getElementById('setErr').classList.add('hidden');
  document.getElementById('cfgModal').classList.remove('hidden');
}
function closeConfig() { document.getElementById('cfgModal').classList.add('hidden'); }
async function applySettings() {
  const powers_on = {}, thresholds = {};
  POWER_META.forEach(m => { powers_on[m.key] = document.getElementById('pwOn_' + m.key).checked; thresholds[m.key] = +document.getElementById('pwTh_' + m.key).value || 0; });
  const board = document.querySelector('input[name=sBoard]:checked');
  const vis = document.querySelector('input[name=sVis]:checked');
  const order = document.querySelector('input[name=sOrder]:checked');
  const body = { token: H.token, settings: {
    mode: cfgModeSel, timer: +sTimer.value, base_xp: +sBase.value, multiplier: +sMult.value, charges: +sCharges.value,
    classic_points: +sClassic.value, progressive: sProg.checked, close_on_first: sClose.checked, lang: sLang.value,
    board_mode: board ? board.value : 'live', powers_on, thresholds,
    answer_order: order ? order.value : 'speed',
    nudge_limit: +sNudge.value, reactions_on: sReact.checked, tension_music: sTension.checked, tension_secs: +sTensionSecs.value,
    theme: (document.getElementById('sThemeVal') || {}).value || 'auto', theme_variant: +((document.getElementById('sVariantVal') || {}).value || 0), visibility: vis ? vis.value : 'private', room_name: sRoomName.value, auto_next: sAuto.checked, auto_delay: +sAutoDelay.value, ...scopeValue() } };
  const r = await api(`/api/host/${H.code}/settings`, body);
  const err = document.getElementById('setErr');
  if (!r.ok) { err.textContent = errText(r.data.error); err.classList.remove('hidden'); return; }
  closeConfig(); toast(t('cfg_saved'), true); poll();
}
// chamado pelo quizkit.js
async function applyQuiz(quiz, title) {
  const r = await api(`/api/host/${H.code}/settings`, { token: H.token, settings: {}, quiz, quiz_title: title || '' });
  if (!r.ok) { toast(errText(r.data.error), false); return false; }
  qkClose(); toast(t('quiz_applied', { n: quiz.length }), true); poll(); return true;
}
function toggleFs() { if (document.fullscreenElement) document.exitFullscreen(); else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); }
function setupLangSelects() {
  document.querySelectorAll('select[onchange^="setLang"]').forEach(s => { s.classList.add('langSel'); s.removeAttribute('id'); s.value = LANG; });
}
function onLangChange() { document.querySelectorAll('.langSel').forEach(s => s.value = LANG); if (typeof resetSig === 'function') resetSig(); if (ST) { render(); renderControls(); } qkOnLang(); }



// =====================================================================
// Barra do organizador: 🧰 Arsenal + emojis para todos os participantes
// =====================================================================
const HOST_EMOJIS = ['👏', '🔥', '😂', '🤣', 'HAHAHA', '😮', '😱', '😡', '🤬', '😍', '🎉', '👋', '⏰', '💪', '🏆', '🙌', '❤️', '😀', '😭', '🤯'];
let dockOpen = store('arena_dock') !== '0';
function mountHostDock() {
  if (document.getElementById('hostDock')) return paintDock();
  const d = document.createElement('div');
  d.id = 'hostDock'; d.className = 'host-dock';
  document.body.appendChild(d);
  d.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.id === 'hdArsenal') return openArsenal();
    if (b.id === 'hdLogout') return hostLogout();
    if (b.id === 'hdToggle') { dockOpen = !dockOpen; store('arena_dock', dockOpen ? '1' : '0'); return paintDock(); }
    if (b.dataset.e) sendHostEmoji(b.dataset.e, b);
  });
  paintDock();
}
function paintDock() {
  const d = document.getElementById('hostDock'); if (!d) return;
  d.innerHTML = `<button id="hdArsenal" class="hd-main" title="${esc(t('host_arsenal_title'))}">🧰 <span>${t('host_arsenal')}</span></button>
    <span class="hd-label">${t('host_emojis')}</span>
    <div class="hd-emojis ${dockOpen ? '' : 'hidden'}">${HOST_EMOJIS.map(e => `<button class="hd-emo" data-e="${e}" title="${esc(t('host_emojis'))}">${e === 'HAHAHA' ? '<b class="hd-ha">HAHAHA</b>' : e}</button>`).join('')}</div>
    <button id="hdLogout" class="hd-out" title="${esc(t('host_leave_title'))}"><i class="fa-solid fa-right-from-bracket"></i> <span>${t('btn_leave')}</span></button>
    <button id="hdToggle" class="hd-tg" title="${esc(t(dockOpen ? 'win_restore' : 'host_emojis'))}">${dockOpen ? '◂' : '😀▸'}</button>`;
}
async function sendHostEmoji(e, btn) {
  if (btn) { btn.classList.add('hd-sent'); setTimeout(() => btn.classList.remove('hd-sent'), 300); }
  const r = await api(`/api/host/${H.code}/hostemoji`, { token: H.token, emoji: e });
  if (!r.ok && r.data.error !== 'slow_down') toast(errText(r.data.error), false);
  poll();
}

// ---------- janela do Arsenal ----------
const HOST_ALL_META = [
  { k: 'all_5050', icon: 'fa-scissors', c: 'amber' }, { k: 'all_double', icon: 'fa-fire', c: 'purple' },
  { k: 'all_hint', icon: 'fa-lightbulb', c: 'cyan' }, { k: 'all_time', icon: 'fa-stopwatch', c: 'emerald' },
  { k: 'all_dice', icon: 'fa-dice', c: 'rose' }, { k: 'all_card', icon: 'fa-clone', c: 'pink' }];
const HOST_TARGET_META = [{ k: 'trap', icon: 'fa-skull-crossbones', c: 'red' }, { k: 'block', icon: 'fa-ban', c: 'rose' }, { k: 'seal', icon: 'fa-user-lock', c: 'orange' }];
function arsenalModal() {
  let m = document.getElementById('arsenalModal');
  if (m) return m;
  m = document.createElement('div'); m.id = 'arsenalModal'; m.className = 'modal hidden';
  m.innerHTML = `<div class="panel neon-gold max-w-2xl w-full max-h-[92vh] overflow-y-auto space-y-4 p-5 text-slate-100">
    <div class="flex items-center justify-between"><h3 class="font-esports text-lg font-bold text-amber-300">🧰 <span id="arsTitle"></span></h3>
      <button onclick="closeArsenal()" class="w-9 h-9 rounded-xl bg-slate-800 text-slate-300"><i class="fa-solid fa-xmark"></i></button></div>
    <div id="arsBody"></div></div>`;
  document.body.appendChild(m);
  m.addEventListener('click', e => { if (e.target === m) closeArsenal(); });
  enhanceModals(document.body);
  return m;
}
function openArsenal() { const m = arsenalModal(); renderArsenal(true); m.classList.remove('hidden'); beep('click'); }
function closeArsenal() { const m = document.getElementById('arsenalModal'); if (m) m.classList.add('hidden'); }
let arsSig = '';
function renderArsenal(force) {
  const m = document.getElementById('arsenalModal'); if (!m || !ST) return;
  if (!force && m.classList.contains('hidden')) return;
  const open = ST.phase === 'open', arena = ST.settings.mode === 'arena', poll = !!(ST.question && ST.question.poll);
  const players = (ST.order || []).map(o => o.name);
  const sig = [ST.phase, ST.qi, arena, poll, players.join(','), LANG].join('|');
  if (!force && sig === arsSig) return;
  arsSig = sig;
  const keepN = (document.getElementById('arsNudgeT') || {}).value;
  const keepT = (document.getElementById('arsTarget') || {}).value, keepG = (document.getElementById('arsGiveT') || {}).value, keepP = (document.getElementById('arsGiveP') || {}).value;
  document.getElementById('arsTitle').textContent = t('host_arsenal_title');
  const btn = (meta, onclick, disabled) => `<button ${disabled ? 'disabled' : ''} onclick="${onclick}" class="pw btn ${PW_STYLE[meta.c] || PW_STYLE.amber}" style="padding:.7rem .3rem"><i class="fa-solid ${meta.icon}"></i><span>${t('ha_' + meta.k)}</span></button>`;
  const opts = (ST.order || []).map(o => `<option value="${o.id}">${esc(o.name)}</option>`).join('');
  document.getElementById('arsBody').innerHTML = `
    <p class="text-xs text-slate-400">${t('ha_desc')}</p>
    <div class="space-y-2"><div class="text-[11px] font-esports uppercase text-purple-300">${t('ha_all')}</div>
      <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">${HOST_ALL_META.map(mt => btn(mt, `useHostPower('${mt.k}')`, !open || (poll && mt.k !== 'all_time'))).join('')}</div>
      ${open ? '' : `<p class="text-[11px] text-amber-300">${t('ha_only_open')}</p>`}
      <div id="arsFx" class="hidden rounded-xl bg-slate-900 border border-amber-400/50 p-3 flex items-center gap-4"></div></div>
    <div class="space-y-2"><div class="text-[11px] font-esports uppercase text-purple-300">${t('ha_nudge')}</div>
      <div class="flex flex-wrap items-center gap-2"><select id="arsNudgeT" class="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-sm" ${players.length ? '' : 'disabled'}><option value="all">${t('ha_everyone')}</option>${opts}</select>
        ${Object.keys(NUDGE_META).map(k => `<button ${players.length ? '' : 'disabled'} onclick="hostNudge('${k}')" class="btn px-3 py-2 rounded-lg border border-amber-500/60 bg-amber-500/15 text-amber-200 font-esports text-[11px] font-bold">${NUDGE_META[k]} ${t('nudge_' + k)}</button>`).join('')}</div>
      <p class="text-[11px] text-slate-400">${t('ha_nudge_d')}</p></div>
    <div class="space-y-2 ${arena ? '' : 'opacity-50'}"><div class="text-[11px] font-esports uppercase text-purple-300">${t('ha_target')}</div>
      <div class="flex flex-wrap items-center gap-2"><select id="arsTarget" class="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-sm" ${arena ? '' : 'disabled'}>${opts}</select>
        ${HOST_TARGET_META.map(mt => `<button ${arena && players.length ? '' : 'disabled'} onclick="useHostPower('${mt.k}', { target: document.getElementById('arsTarget').value })" class="btn px-3 py-2 rounded-lg border font-esports text-[11px] font-bold ${PW_STYLE[mt.c]}"><i class="fa-solid ${mt.icon}"></i> ${t('ha_' + mt.k)}</button>`).join('')}</div></div>
    <div class="space-y-2 ${arena ? '' : 'opacity-50'}"><div class="text-[11px] font-esports uppercase text-purple-300">${t('ha_give')}</div>
      <div class="flex flex-wrap items-center gap-2"><select id="arsGiveT" class="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-sm" ${arena ? '' : 'disabled'}><option value="all">${t('ha_everyone')}</option>${opts}</select>
        <select id="arsGiveP" class="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-sm" ${arena ? '' : 'disabled'}>${POWER_META.map(p => `<option value="${p.key}">${t('pwr_' + p.key)}</option>`).join('')}</select>
        <button ${arena && players.length ? '' : 'disabled'} onclick="useHostPower('give', { target: document.getElementById('arsGiveT').value, give: document.getElementById('arsGiveP').value })" class="btn px-3 py-2 rounded-lg bg-emerald-500 text-slate-950 font-esports text-[11px] font-extrabold"><i class="fa-solid fa-gift"></i> ${t('ha_give_btn')}</button></div>
      ${arena ? '' : `<p class="text-[11px] text-slate-400">${t('ha_arena_only')}</p>`}</div>
    <div class="space-y-2"><div class="text-[11px] font-esports uppercase text-purple-300">${t('host_emojis')}</div>
      <div class="flex flex-wrap gap-1.5">${HOST_EMOJIS.map(e => `<button class="react-btn" onclick="sendHostEmoji('${e}')">${e === 'HAHAHA' ? '<b class="hd-ha">HAHAHA</b>' : e}</button>`).join('')}</div></div>`;
  if (keepN && document.querySelector(`#arsNudgeT option[value="${keepN}"]`)) document.getElementById('arsNudgeT').value = keepN;
  if (keepT && document.querySelector(`#arsTarget option[value="${keepT}"]`)) document.getElementById('arsTarget').value = keepT;
  if (keepG && document.querySelector(`#arsGiveT option[value="${keepG}"]`)) document.getElementById('arsGiveT').value = keepG;
  if (keepP) document.getElementById('arsGiveP').value = keepP;
}
async function hostNudge(kind) {
  const sel = document.getElementById('arsNudgeT');
  const r = await api(`/api/host/${H.code}/hostnudge`, { token: H.token, target: sel ? sel.value : 'all', kind });
  if (r.ok) { beep('power'); toast(t('ha_nudge_sent', { n: r.data.sent }), true); }
  else if (r.data.error !== 'slow_down') toast(errText(r.data.error), false);
  poll();
}
let hpBusy = false;
async function useHostPower(power, extra) {
  if (hpBusy) return; hpBusy = true;
  const fx = document.getElementById('arsFx');
  try {
    if (power === 'all_dice') {
      fx.classList.remove('hidden');
      fx.innerHTML = `<div class="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/30 to-purple-600/30 border-2 border-cyan-400 flex items-center justify-center text-4xl dice-rolling"><i id="arsDie" class="fa-solid fa-dice-six"></i></div><div id="arsFxTxt" class="font-esports text-sm text-amber-300">${t('dice_rolling')}</div>`;
      const faces = ['fa-dice-one', 'fa-dice-two', 'fa-dice-three', 'fa-dice-four', 'fa-dice-five', 'fa-dice-six'];
      let i = 0; const anim = setInterval(() => { const d = document.getElementById('arsDie'); if (d) d.className = 'fa-solid ' + faces[i++ % 6]; }, 80);
      beep('power');
      const [r] = await Promise.all([api(`/api/host/${H.code}/hostpower`, { token: H.token, power }), new Promise(res => setTimeout(res, 900))]);
      clearInterval(anim);
      fx.querySelector('.dice-rolling') && fx.querySelector('.dice-rolling').classList.remove('dice-rolling');
      if (!r.ok) { fx.classList.add('hidden'); toast(errText(r.data.error), false); return; }
      document.getElementById('arsDie').className = 'fa-solid ' + faces[r.data.roll - 1];
      document.getElementById('arsFxTxt').textContent = `🎲 ${r.data.roll} — ${t('hdice_' + r.data.roll)}`;
      beep(r.data.roll === 6 ? 'fanfare' : 'correct');
    } else if (power === 'all_card') {
      fx.classList.remove('hidden');
      fx.innerHTML = `<div class="perspective-1000 w-40"><div id="arsCard" class="flip-card-inner" style="height:150px"><div class="flip-card-front"><i class="fa-solid fa-question text-3xl text-purple-300"></i></div><div class="flip-card-back" id="arsCardBack"></div></div></div><div id="arsFxTxt" class="font-esports text-sm text-amber-300"></div>`;
      const r = await api(`/api/host/${H.code}/hostpower`, { token: H.token, power });
      if (!r.ok) { fx.classList.add('hidden'); toast(errText(r.data.error), false); return; }
      const c = r.data.card, ICON = { HINT: 'fa-user-graduate', SHIELD: 'fa-shield-halved', ALLIN: 'fa-fire-flame-curved', TIME: 'fa-stopwatch' };
      document.getElementById('arsCardBack').innerHTML = `<i class="fa-solid ${ICON[c]} text-2xl text-amber-300 mb-1"></i><div class="font-esports text-[11px] font-bold text-amber-300 uppercase">${t('card_' + c + '_t')}</div>`;
      setTimeout(() => document.getElementById('arsCard').classList.add('flipped'), 60);
      document.getElementById('arsFxTxt').textContent = t('card_' + c + '_t') + ': ' + t(c === 'TIME' ? 'card_TIME_d' : c === 'HINT' ? 'ha_all_hint' : c === 'SHIELD' ? 'ha_card_shield' : 'ha_card_allin');
      beep('fanfare');
    } else {
      const r = await api(`/api/host/${H.code}/hostpower`, Object.assign({ token: H.token, power }, extra || {}));
      if (!r.ok) { toast(errText(r.data.error), false); return; }
      beep('power');
      toast(t('ha_done', { power: t('ha_' + (power === 'give' ? 'give_btn' : power)) }), true);
    }
  } finally { hpBusy = false; poll(); }
}
// atualiza a janela do Arsenal a cada polling (fase, jogadores)
const _renderControlsOrig = renderControls;
renderControls = function () { _renderControlsOrig(); mountHostDock(); renderArsenal(false); };
const _onLangHost = onLangChange;
onLangChange = function () { _onLangHost(); paintDock(); renderArsenal(true); };


// ---------- Escopo da partida: quantas perguntas do quiz serão usadas ----------
function scopeBank() { return (ST && (ST.bank_total || ST.total)) || 1; }
function scopeInit(s) {
  const bank = scopeBank(), lim = s.q_limit || 0;
  const r = document.getElementById('sScopeRange'), n = document.getElementById('sScopeNum');
  r.max = bank; n.max = bank;
  r.value = n.value = lim && lim < bank ? lim : bank;
  document.querySelectorAll('input[name=sPick]').forEach(x => { x.checked = x.value === (s.q_pick || 'first'); });
  document.querySelectorAll('input[name=sOrder], input[name=sPick], #sTimer, #sAuto, #sAutoDelay').forEach(x => { x.onchange = () => scopeSync(); });
  scopeSync();
}
function scopeSync(src) {
  const bank = scopeBank(), r = document.getElementById('sScopeRange'), n = document.getElementById('sScopeNum');
  if (!r) return;
  if (src === 'all') r.value = n.value = bank;
  else if (src === 'range') n.value = r.value;
  else if (src === 'num') { const v = Math.max(1, Math.min(bank, +n.value || 1)); r.value = v; if (+n.value > bank) n.value = bank; }
  const q = Math.max(1, Math.min(bank, +r.value || bank));
  const players = Math.max(1, ((ST && ST.order) || []).length);
  const turns = (document.querySelector('input[name=sOrder]:checked') || {}).value === 'turns';
  // estimativa: tempo de cada pergunta + ~8 s de resultado (ou o tempo do avanço automático)
  const quiz = (ST && ST.quiz) || [], timer = +document.getElementById('sTimer').value || 30;
  const reveal = document.getElementById('sAuto').checked ? (+document.getElementById('sAutoDelay').value || 8) : 8;
  const avg = quiz.length ? quiz.reduce((a, x) => a + (x.time || timer), 0) / quiz.length : timer;
  const mins = Math.max(1, Math.round(q * (avg + reveal) / 60));
  document.getElementById('scopeBadge').textContent = t('scope_badge', { n: q }) + (turns ? ' ' + t('scope_per_player', { n: Math.max(1, Math.round(q / players)) }) : '');
  document.getElementById('scopeInfo').textContent = t('scope_info', { n: q, total: bank, min: mins });
}
function scopeValue() {
  const r = document.getElementById('sScopeRange');
  if (!r) return {};
  const q = +r.value, bank = scopeBank();
  const pick = (document.querySelector('input[name=sPick]:checked') || {}).value || 'first';
  return { q_limit: q >= bank ? 0 : q, q_pick: pick };
}
function quizCountText() {
  const bank = ST.bank_total || ST.total;
  if (ST.total >= bank) return t('quiz_n', { n: ST.total }) + (ST.settings.q_pick === 'random' ? ' · ' + t('scope_random_short') : '');
  return t('quiz_n_of', { n: ST.total, total: bank }) + (ST.settings.q_pick === 'random' ? ' · ' + t('scope_random_short') : '');
}

// ---------- Sair (logout do organizador): encerra a sala para todos ----------
async function hostLogout() {
  if (!H || !confirm(t('host_leave_confirm'))) return;
  try { await api(`/api/host/${H.code}/end_room`, { token: H.token }); } catch (e) {}
  store(HKEY, null); location.href = '/';
}
(function () {   // aviso na tela de criar sala depois de a sessão expirar
  const n = document.getElementById('endedNote');
  if (n && /[?&]ended=1/.test(location.search)) n.classList.remove('hidden');
})();
