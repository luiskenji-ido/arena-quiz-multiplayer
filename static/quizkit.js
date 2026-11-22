/* Criação de quiz no painel do apresentador: templates, arquivo (JSON/CSV), texto rápido, editor visual e IA/JSON.
   Depende de common.js, i18n_extra.js e (da página) de: H, ST, applyQuiz(quiz, title), toast, t, esc. */

const PROMPTS = {
  pt: 'Atue como um gerador de quiz especialista. Crie 20 perguntas desafiadoras baseadas no conteúdo anexo.\nMUITO IMPORTANTE: Retorne EXCLUSIVAMENTE um ARQUIVO .JSON para download (não imprima o código na tela, gere o arquivo para eu baixar).\nSiga EXATAMENTE esta estrutura de array:\n[\n  {\n    "block": "Nome do Tópico",\n    "topic": "Subtópico Específico",\n    "question": "A pergunta completa?",\n    "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],\n    "correct": 0,\n    "hint": "Uma dica curta que não entrega a resposta",\n    "reference": "Página/Autor",\n    "explanation": "Explicação detalhada do gabarito"\n  }\n]\n("correct" é o índice da alternativa certa, começando em 0. Não inclua o campo "time": o tempo de resposta é definido pela plataforma.)',
  en: 'Act as an expert quiz generator. Create 20 challenging questions based on the attached content.\nVERY IMPORTANT: Return ONLY a downloadable .JSON FILE (do not print the code on screen, generate the file for me to download).\nFollow EXACTLY this array structure:\n[\n  {\n    "block": "Topic Name",\n    "topic": "Specific Subtopic",\n    "question": "The full question?",\n    "options": ["Option A", "Option B", "Option C", "Option D"],\n    "correct": 0,\n    "hint": "A short hint that does not give the answer away",\n    "reference": "Page/Author",\n    "explanation": "Detailed explanation of the answer"\n  }\n]\n("correct" is the index of the right option, starting at 0. Do not include a "time" field: the answer time is set by the platform.)',
  es: 'Actúa como un generador de quiz experto. Crea 20 preguntas desafiantes basadas en el contenido adjunto.\nMUY IMPORTANTE: Devuelve EXCLUSIVAMENTE un ARCHIVO .JSON descargable (no imprimas el código en pantalla, genera el archivo para descargar).\nSigue EXACTAMENTE esta estructura de array:\n[\n  {\n    "block": "Nombre del Tema",\n    "topic": "Subtema Específico",\n    "question": "¿La pregunta completa?",\n    "options": ["Opción A", "Opción B", "Opción C", "Opción D"],\n    "correct": 0,\n    "hint": "Una pista corta que no revele la respuesta",\n    "reference": "Página/Autor",\n    "explanation": "Explicación detallada de la respuesta"\n  }\n]\n("correct" es el índice de la opción correcta, empezando en 0. No incluyas el campo "time": el tiempo de respuesta lo define la plataforma.)'
};

// ---------------------------------------------------------------- utilidades
function copyText(txt) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(txt);
  return new Promise((res, rej) => {
    const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); } ta.remove();
  });
}
function downloadFile(name, text, mime) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: mime || 'text/plain;charset=utf-8' }));
  a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 500);
}
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

// Valida e normaliza um quiz (mesmas regras do servidor). Retorna {quiz, errors[]}
function qkValidate(raw) {
  const errors = [], quiz = [];
  if (!Array.isArray(raw) || !raw.length) return { quiz: [], errors: [t('err_quiz_invalid')] };
  raw.forEach((q, i) => {
    const n = i + 1;
    const opts = Array.isArray(q && q.options) ? q.options.map(o => String(o == null ? '' : o).trim()) : [];
    const filled = opts.filter(Boolean);
    if (!q || !String(q.question || '').trim()) return errors.push(t('ed_err', { n, msg: t('ed_e_empty') }));
    if (filled.length < 2) return errors.push(t('ed_err', { n, msg: t('ed_e_opts') }));
    const poll = !!q.poll;
    let correct = q.correct;
    // remove alternativas vazias mantendo o índice da correta
    const map = []; opts.forEach((o, k) => { if (o) map.push(k); });
    const newIdx = map.indexOf(correct);
    if (!poll && (!Number.isInteger(correct) || newIdx < 0)) return errors.push(t('ed_err', { n, msg: t('ed_e_correct') }));
    const time = Number.isInteger(q.time) && q.time >= 5 && q.time <= 300 ? q.time : undefined;
    const item = { block: q.block || '', topic: q.topic || '', question: String(q.question).trim(), options: filled, correct: poll ? null : newIdx,
      hint: q.hint || '', reference: q.reference || '', explanation: q.explanation || '', time, image: q.image || '' };
    if (poll) item.poll = true;
    quiz.push(item);
  });
  return { quiz, errors };
}

// ---------------------------------------------------------------- CSV
function parseCSV(text) {
  text = text.replace(/^﻿/, '');
  const first = text.split(/\r?\n/)[0] || '';
  const delim = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';' : ',';
  const rows = []; let row = [], cur = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') inQ = false; else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === delim) { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); cur = ''; if (row.some(x => x.trim())) rows.push(row); row = []; }
    else cur += c;
  }
  row.push(cur); if (row.some(x => x.trim())) rows.push(row);
  return rows;
}
const CSV_KEYS = {
  question: ['question', 'pergunta', 'pregunta'], correct: ['correct', 'correta', 'correcta', 'resposta', 'respuesta', 'answer', 'gabarito'],
  explanation: ['explanation', 'explicacao', 'explicacion', 'comentario'], hint: ['hint', 'dica', 'pista'],
  reference: ['reference', 'referencia', 'fonte', 'fuente'], block: ['block', 'bloco', 'tema', 'bloque'], topic: ['topic', 'topico', 'subtema'],
  time: ['time', 'tempo', 'tiempo', 'segundos'], image: ['image', 'imagem', 'imagen'], type: ['type', 'tipo']
};
function csvToQuiz(text) {
  const rows = parseCSV(text);
  if (rows.length < 2) throw new Error('CSV');
  const head = rows[0].map(norm);
  const find = names => head.findIndex(h => names.includes(h));
  const idx = {}; for (const k in CSV_KEYS) idx[k] = find(CSV_KEYS[k]);
  if (idx.question < 0) throw new Error('question/pergunta');
  const optCols = [];
  'abcdef'.split('').forEach((L, k) => {
    const c = head.findIndex(h => [L, 'option_' + L, 'opcao_' + L, 'opcion_' + L, 'alternativa ' + L, 'alternativa_' + L, 'option ' + L, 'opcao ' + L, 'opcion ' + L].includes(h));
    if (c >= 0) optCols.push(c);
  });
  if (optCols.length < 2) throw new Error('a, b, c, d');
  return rows.slice(1).map(r => {
    const cell = k => (idx[k] >= 0 ? (r[idx[k]] || '').trim() : '');
    const opts = optCols.map(c => (r[c] || '').trim());
    let corr = cell('correct'), ci = -1;
    if (/^[a-fA-F]$/.test(corr)) ci = corr.toLowerCase().charCodeAt(0) - 97;
    else if (/^[1-6]$/.test(corr)) ci = parseInt(corr, 10) - 1;
    else ci = opts.findIndex(o => o && norm(o) === norm(corr));
    const time = parseInt(cell('time'), 10);
    const poll = ['poll', 'enquete', 'encuesta'].includes(norm(cell('type')));
    return { poll, question: cell('question'), options: opts, correct: ci, explanation: cell('explanation'), hint: cell('hint'), reference: cell('reference'),
      block: cell('block'), topic: cell('topic'), time: Number.isFinite(time) ? time : undefined, image: cell('image') };
  }).filter(q => q.question || q.options.some(Boolean));
}
function csvEscape(v) { v = String(v == null ? '' : v); return /[",;\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
function quizToCSV(quiz) {
  const head = ['pergunta', 'a', 'b', 'c', 'd', 'correta', 'explicacao', 'dica', 'referencia', 'bloco', 'tempo', 'tipo'];
  const lines = [head.join(',')];
  quiz.forEach(q => {
    const o = q.options.slice(0, 4); while (o.length < 4) o.push('');
    lines.push([q.question, ...o, q.poll ? '' : ('ABCD'[q.correct] || 'A'), q.explanation, q.hint, q.reference, q.block, q.time || '', q.poll ? 'enquete' : ''].map(csvEscape).join(','));
  });
  return '﻿' + lines.join('\n');
}

// ---------------------------------------------------------------- texto rápido
function textToQuiz(text) {
  return text.replace(/\r/g, '').split(/\n\s*\n/).map(b => b.trim()).filter(Boolean).map(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const q = { question: lines[0], options: [], correct: -1, explanation: '' };
    lines.slice(1).forEach(l => {
      if (l.startsWith('>')) { q.explanation = (q.explanation + ' ' + l.slice(1).trim()).trim(); return; }
      let correct = false;
      if (l.startsWith('*') || l.startsWith('✓')) { correct = true; l = l.slice(1).trim(); }
      l = l.replace(/^[A-Fa-f][\).]\s+/, '');
      q.options.push(l);
      if (correct) q.correct = q.options.length - 1;
    });
    return q;
  });
}

// ---------------------------------------------------------------- modal / abas
const QK = { tab: 'templates', pending: null, ed: { title: '', qs: [] }, tpls: null, tplLang: null };
const SAMPLE_JSON = [
  { block: 'Tema', topic: 'Subtema', question: 'Qual é a capital da França?', options: ['Londres', 'Paris', 'Madri', 'Roma'], correct: 1, hint: 'Cidade da Torre Eiffel', reference: 'Geografia', explanation: 'Paris é a capital da França.', time: 20 },
  { block: 'Tema', topic: 'Subtema', question: 'Quanto é 2 + 2?', options: ['3', '4', '5', '6'], correct: 1, hint: 'Metade de 8', reference: 'Matemática', explanation: '2 + 2 = 4.' },
  { block: 'Pesquisa', question: 'Como você avalia este treinamento?', options: ['Excelente', 'Bom', 'Regular', 'Ruim'], poll: true, correct: null }
];

function qkOpen(tab) {
  document.getElementById('quizModal').classList.remove('hidden');
  qkTab(tab || QK.tab);
}
function qkClose() { document.getElementById('quizModal').classList.add('hidden'); }
function qkTab(tab) {
  QK.tab = tab; QK.pending = null;
  document.querySelectorAll('#qkTabs button').forEach(b => {
    const on = b.dataset.tab === tab;
    b.className = 'btn px-3 py-2 rounded-lg font-esports text-[11px] font-bold whitespace-nowrap ' + (on ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300');
  });
  const body = document.getElementById('qkBody');
  ({ templates: qkTemplates, upload: qkUpload, text: qkText, editor: qkEditor, ai: qkAi })[tab](body);
}
function qkOnLang() { if (!document.getElementById('quizModal').classList.contains('hidden')) { QK.tpls = null; qkTab(QK.tab); } }

function qkPreview(quiz, errors, readKey) {
  if (errors && errors.length) return `<div class="rounded-xl bg-rose-500/10 border border-rose-500/40 p-3 text-xs text-rose-200 space-y-1">${errors.slice(0, 6).map(e => `<div>${esc(e)}</div>`).join('')}${errors.length > 6 ? '<div>…</div>' : ''}</div>`;
  if (!quiz || !quiz.length) return '';
  return `<div class="rounded-xl bg-emerald-500/10 border border-emerald-500/40 p-3 text-xs text-emerald-100 space-y-1"><div class="font-bold">${t(readKey, { n: quiz.length })}</div>${quiz.slice(0, 3).map((q, i) => `<div class="text-slate-300 truncate">${i + 1}. ${esc(q.question)} <span class="text-emerald-300">→ ${q.poll ? t('poll_label') : esc(q.options[q.correct])}</span></div>`).join('')}${quiz.length > 3 ? '<div class="text-slate-500">…</div>' : ''}</div>`;
}
function qkUseBtn(id) {
  return `<button id="${id}" disabled onclick="qkUsePending()" class="btn px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-esports text-xs font-extrabold uppercase"><i class="fa-solid fa-check"></i> ${t('quiz_use')}</button>`;
}
function qkSetPending(quiz, title) {
  QK.pending = quiz && quiz.length ? { quiz, title: title || '' } : null;
  const b = document.getElementById('qkUse'); if (b) b.disabled = !QK.pending;
}
async function qkUsePending() { if (QK.pending) { await applyQuiz(QK.pending.quiz, QK.pending.title); } }

// ---- templates
async function qkTemplates(body) {
  body.innerHTML = `<p class="text-xs text-slate-400 mb-3">${t('tpl_help', { lang: LANG.toUpperCase() })}</p><div id="tplGrid" class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div class="text-xs text-slate-500">...</div></div>`;
  if (!QK.tpls || QK.tplLang !== LANG) {
    const r = await api('/api/templates?lang=' + LANG);
    if (!r.ok) { toast(errText(r.data.error), false); return; }
    QK.tpls = r.data; QK.tplLang = LANG;
  }
  const TC = { cyan: 'border-cyan-500/50 text-cyan-300', purple: 'border-purple-500/50 text-purple-300', emerald: 'border-emerald-500/50 text-emerald-300', amber: 'border-amber-500/50 text-amber-300', rose: 'border-rose-500/50 text-rose-300', slate: 'border-slate-500/50 text-slate-300' };
  const card = x => `
    <div class="rounded-2xl border bg-slate-900/80 p-4 space-y-2 ${TC[x.color] || TC.slate}">
      <div class="flex items-center gap-3"><i class="fa-solid ${x.icon} text-2xl"></i><div class="min-w-0"><div class="font-esports text-sm font-bold text-white truncate">${esc(x.name)}</div><div class="text-[10px] text-slate-400">${t('tpl_n', { n: x.count })}</div></div></div>
      <p class="text-xs text-slate-300">${esc(x.desc)}</p>
      <div class="flex gap-2"><button onclick="qkUseTemplate('${x.id}',false)" class="btn flex-1 py-2 rounded-lg bg-emerald-500 text-slate-950 font-esports text-[11px] font-extrabold uppercase">${t('quiz_use')}</button>
      <button onclick="qkUseTemplate('${x.id}',true)" class="btn px-3 py-2 rounded-lg bg-slate-800 text-slate-100 font-esports text-[11px] font-bold"><i class="fa-solid fa-pen"></i> ${t('tpl_edit')}</button></div>
    </div>`;
  const section = (cat, icon) => {
    const list = QK.tpls.filter(x => (x.category || 'fun') === cat);
    return list.length ? `<div class="sm:col-span-2 font-esports text-xs font-bold text-amber-300 mt-1"><i class="fa-solid ${icon} mr-1"></i>${t('tpl_cat_' + cat)}</div>` + list.map(card).join('') : '';
  };
  const grid = document.getElementById('tplGrid');
  if (grid) grid.innerHTML = section('corp', 'fa-briefcase') + section('fun', 'fa-gamepad');   // a aba pode ter mudado durante o carregamento
}
async function qkUseTemplate(id, edit) {
  const r = await api(`/api/templates/${id}?lang=${LANG}`);
  if (!r.ok) { toast(errText(r.data.error), false); return; }
  if (edit) { QK.ed = { title: r.data.name, qs: r.data.questions.map(q => ({ ...q })) }; qkTab('editor'); }
  else await applyQuiz(r.data.questions, r.data.name);
}

// ---- arquivo
function qkUpload(body) {
  body.innerHTML = `<p class="text-xs text-slate-400 mb-3">${t('up_help')}</p>
    <label id="dropZone" class="block rounded-2xl border-2 border-dashed border-slate-600 hover:border-cyan-400 bg-slate-900/60 p-8 text-center cursor-pointer transition">
      <i class="fa-solid fa-file-arrow-up text-3xl text-cyan-300 mb-2"></i><div class="text-sm text-slate-200">${t('up_drop')}</div>
      <input id="fileInput" type="file" accept=".json,.csv,.txt,application/json,text/csv" class="hidden"></label>
    <div id="upPrev" class="mt-3"></div>
    <div class="flex flex-wrap items-center justify-between gap-2 mt-4">
      <div class="flex gap-2"><button onclick="qkDownloadJson()" class="btn px-3 py-2 rounded-lg bg-slate-800 text-slate-100 font-esports text-[11px]"><i class="fa-solid fa-download"></i> ${t('up_dl_json')}</button>
      <button onclick="qkDownloadCsv()" class="btn px-3 py-2 rounded-lg bg-slate-800 text-slate-100 font-esports text-[11px]"><i class="fa-solid fa-download"></i> ${t('up_dl_csv')}</button></div>${qkUseBtn('qkUse')}</div>`;
  const dz = document.getElementById('dropZone'), fi = document.getElementById('fileInput');
  fi.onchange = () => fi.files[0] && qkReadFile(fi.files[0]);
  ['dragover', 'dragenter'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('border-cyan-400'); }));
  ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('border-cyan-400'); }));
  dz.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) qkReadFile(f); });
}
function qkReadFile(file) {
  const rd = new FileReader();
  rd.onload = () => {
    let raw, title = file.name.replace(/\.[^.]+$/, '');
    try {
      const txt = String(rd.result);
      raw = /\.csv$/i.test(file.name) ? csvToQuiz(txt) : JSON.parse(txt.replace(/^﻿/, '').replace(/```json|```/g, '').trim());
    } catch (e) { document.getElementById('upPrev').innerHTML = qkPreview(null, [t('up_err', { err: e.message || 'JSON' })]); qkSetPending(null); return; }
    const v = qkValidate(raw);
    document.getElementById('upPrev').innerHTML = qkPreview(v.quiz, v.errors, 'up_read');
    qkSetPending(v.errors.length ? null : v.quiz, title);
  };
  rd.readAsText(file);
}
function qkDownloadJson() { downloadFile('quiz_modelo.json', JSON.stringify(SAMPLE_JSON, null, 2), 'application/json'); }
function qkDownloadCsv() { downloadFile('quiz_modelo.csv', quizToCSV(SAMPLE_JSON), 'text/csv;charset=utf-8'); }

// ---- texto rápido
function qkText(body) {
  body.innerHTML = `<p class="text-xs text-slate-400 mb-2">${t('tx_help')}</p>
    <textarea id="txArea" rows="12" placeholder="${esc(t('tx_ph'))}" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white"></textarea>
    <div id="txPrev" class="mt-3"></div><div class="text-right mt-3">${qkUseBtn('qkUse')}</div>`;
  const ta = document.getElementById('txArea');
  ta.oninput = () => {
    if (!ta.value.trim()) { document.getElementById('txPrev').innerHTML = ''; return qkSetPending(null); }
    const v = qkValidate(textToQuiz(ta.value));
    document.getElementById('txPrev').innerHTML = qkPreview(v.quiz, v.errors, 'tx_read');
    qkSetPending(v.errors.length ? null : v.quiz, '');
  };
}

// ---- IA / JSON colado
function qkAi(body) {
  body.innerHTML = `<p class="text-xs text-slate-400 mb-2">${t('ai_help')}</p>
    <button onclick="qkCopyPrompt()" class="btn mb-3 px-3 py-2 rounded-lg bg-purple-500/20 border border-purple-500/50 text-purple-200 font-esports text-[11px]"><i class="fa-solid fa-copy"></i> ${t('btn_copy_prompt')}</button>
    <textarea id="aiArea" rows="10" placeholder="${esc(t('ai_ph'))}" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white"></textarea>
    <div id="aiPrev" class="mt-3"></div><div class="text-right mt-3">${qkUseBtn('qkUse')}</div>`;
  const ta = document.getElementById('aiArea');
  ta.oninput = () => {
    if (!ta.value.trim()) { document.getElementById('aiPrev').innerHTML = ''; return qkSetPending(null); }
    let raw; try { raw = JSON.parse(ta.value.replace(/```json|```/g, '').trim()); } catch (e) { document.getElementById('aiPrev').innerHTML = qkPreview(null, [t('err_quiz_invalid')]); return qkSetPending(null); }
    const v = qkValidate(raw);
    document.getElementById('aiPrev').innerHTML = qkPreview(v.quiz, v.errors, 'ai_read');
    qkSetPending(v.errors.length ? null : v.quiz, '');
  };
}
function qkCopyPrompt() { copyText(PROMPTS[LANG] || PROMPTS.pt).then(() => toast(t('ai_prompt_copied'), true)).catch(() => toast('Ctrl+C', false)); }

// ---- editor visual
const BLANK_Q = () => ({ question: '', options: ['', '', '', ''], correct: 0, poll: false, hint: '', explanation: '', time: '', image: '' });
function drafts() { try { return JSON.parse(store('arena_quizzes') || '[]'); } catch (e) { return []; } }
function qkEditor(body) {
  if (!QK.ed.qs.length) QK.ed.qs = [BLANK_Q()];
  body.innerHTML = `
    <div class="flex flex-wrap gap-2 items-center mb-3">
      <input id="edTitle" value="${esc(QK.ed.title)}" placeholder="${esc(t('ed_name_ph'))}" class="flex-1 min-w-[10rem] bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
      <button onclick="edNew()" class="btn px-3 py-2 rounded-lg bg-slate-800 text-slate-100 font-esports text-[11px]"><i class="fa-solid fa-file"></i> ${t('ed_new')}</button>
      ${ST && ST.quiz ? `<button onclick="edFromCurrent()" class="btn px-3 py-2 rounded-lg bg-slate-800 text-slate-100 font-esports text-[11px]"><i class="fa-solid fa-rotate"></i> ${t('ed_current')}</button>` : ''}
    </div>
    <div id="edList" class="space-y-3"></div>
    <button onclick="edAdd()" class="btn mt-3 w-full py-2.5 rounded-xl border border-dashed border-cyan-500/60 text-cyan-300 font-esports text-xs font-bold"><i class="fa-solid fa-plus"></i> ${t('ed_add')}</button>
    <div id="edPrev" class="mt-3"></div>
    <div class="flex flex-wrap items-center justify-between gap-2 mt-3">
      <div class="flex gap-2"><button onclick="edSave()" class="btn px-3 py-2 rounded-lg bg-slate-800 text-slate-100 font-esports text-[11px]"><i class="fa-solid fa-floppy-disk"></i> ${t('ed_save')}</button>
      <button onclick="edExport()" class="btn px-3 py-2 rounded-lg bg-slate-800 text-slate-100 font-esports text-[11px]"><i class="fa-solid fa-file-export"></i> ${t('ed_export')}</button></div>
      ${qkUseBtn('qkUse')}</div>
    <div class="mt-5"><h4 class="font-esports text-xs font-bold text-amber-300 mb-2">${t('ed_mine')}</h4><div id="edMine" class="space-y-1.5"></div></div>`;
  document.getElementById('edTitle').oninput = e => { QK.ed.title = e.target.value; };
  edRender(); edMine();
}
function edRender() {
  const L = document.getElementById('edList'); if (!L) return;
  L.innerHTML = QK.ed.qs.map((q, i) => `
    <div class="rounded-2xl border border-slate-700 bg-slate-900/80 p-3 space-y-2" data-i="${i}">
      <div class="flex items-center justify-between gap-2"><span class="font-esports text-xs text-cyan-300">#${i + 1}</span>
        <div class="flex gap-1 text-[11px]">
          <button onclick="edMove(${i},-1)" title="${t('ed_up')}" class="btn px-2 py-1 rounded bg-slate-800"><i class="fa-solid fa-arrow-up"></i></button>
          <button onclick="edMove(${i},1)" title="${t('ed_down')}" class="btn px-2 py-1 rounded bg-slate-800"><i class="fa-solid fa-arrow-down"></i></button>
          <button onclick="edDup(${i})" title="${t('ed_dup')}" class="btn px-2 py-1 rounded bg-slate-800"><i class="fa-solid fa-copy"></i></button>
          <button onclick="edDel(${i})" title="${t('ed_del')}" class="btn px-2 py-1 rounded bg-rose-500/30 text-rose-200"><i class="fa-solid fa-trash"></i></button></div></div>
      <textarea rows="2" data-f="question" placeholder="${esc(t('ed_q'))}" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">${esc(q.question)}</textarea>
      <label class="flex items-center gap-2 text-[11px] text-purple-200"><input type="checkbox" data-f="poll" ${q.poll ? 'checked' : ''} class="accent-purple-400"> ${t('ed_poll')}</label>
      <div class="space-y-1.5">${q.options.map((o, k) => `
        <div class="flex items-center gap-2"><input type="radio" name="corr${i}" data-f="correct" data-k="${k}" ${q.correct === k && !q.poll ? 'checked' : ''} ${q.poll ? 'disabled' : ''} class="accent-emerald-400" title="${t('ed_correct')}">
          <input data-f="opt" data-k="${k}" value="${esc(o)}" placeholder="${esc(t('ed_opt'))} ${'ABCDEF'[k]}" class="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white">
          ${q.options.length > 2 ? `<button onclick="edDelOpt(${i},${k})" class="text-rose-300 text-xs px-1"><i class="fa-solid fa-xmark"></i></button>` : ''}</div>`).join('')}
        ${q.options.length < 6 ? `<button onclick="edAddOpt(${i})" class="text-[11px] text-cyan-300">${t('ed_add_opt')}</button>` : ''}</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input data-f="hint" value="${esc(q.hint)}" placeholder="${esc(t('ed_hint'))}" class="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white">
        <input data-f="time" type="number" min="5" max="300" value="${esc(q.time)}" placeholder="${esc(t('ed_time'))}" class="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white">
        <input data-f="explanation" value="${esc(q.explanation)}" placeholder="${esc(t('ed_expl'))}" class="sm:col-span-2 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white">
        <input data-f="image" value="${esc(q.image || '')}" placeholder="${esc(t('ed_image'))}" class="sm:col-span-2 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"></div>
    </div>`).join('');
}
document.addEventListener('input', e => {
  const el = e.target, card = el.closest && el.closest('#edList [data-i]'); if (!card) return;
  const q = QK.ed.qs[+card.dataset.i], f = el.dataset.f; if (!q) return;
  if (f === 'poll' || f === 'correct') return;
  if (f === 'opt') q.options[+el.dataset.k] = el.value;
  else if (f === 'time') q.time = el.value === '' ? '' : parseInt(el.value, 10);
  else if (f) q[f] = el.value;
  edValidateLive();
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset && el.dataset.f === 'correct') { const card = el.closest('[data-i]'); QK.ed.qs[+card.dataset.i].correct = +el.dataset.k; edValidateLive(); }
  if (el.dataset && el.dataset.f === 'poll') {
    const q = QK.ed.qs[+el.closest('[data-i]').dataset.i];
    q.poll = el.checked; if (!q.poll && !Number.isInteger(q.correct)) q.correct = 0;
    edRender(); edValidateLive();
  }
});
function edToRaw() { return QK.ed.qs.map(q => ({ ...q, time: q.time === '' ? undefined : q.time })); }
function edValidateLive() {
  const v = qkValidate(edToRaw());
  const p = document.getElementById('edPrev'); if (p) p.innerHTML = QK.ed.qs.some(q => q.question || q.options.some(Boolean)) ? qkPreview(v.quiz, v.errors, 'tx_read') : '';
  qkSetPending(v.errors.length ? null : v.quiz, QK.ed.title);
}
function edAdd() { QK.ed.qs.push(BLANK_Q()); edRender(); edValidateLive(); }
function edDel(i) { QK.ed.qs.splice(i, 1); if (!QK.ed.qs.length) QK.ed.qs.push(BLANK_Q()); edRender(); edValidateLive(); }
function edDup(i) { QK.ed.qs.splice(i + 1, 0, JSON.parse(JSON.stringify(QK.ed.qs[i]))); edRender(); edValidateLive(); }
function edMove(i, d) { const j = i + d; if (j < 0 || j >= QK.ed.qs.length) return; [QK.ed.qs[i], QK.ed.qs[j]] = [QK.ed.qs[j], QK.ed.qs[i]]; edRender(); }
function edAddOpt(i) { QK.ed.qs[i].options.push(''); edRender(); }
function edDelOpt(i, k) { const q = QK.ed.qs[i]; q.options.splice(k, 1); if (q.correct >= q.options.length) q.correct = 0; else if (q.correct > k) q.correct--; edRender(); edValidateLive(); }
function edNew() { QK.ed = { title: '', qs: [BLANK_Q()] }; qkEditor(document.getElementById('qkBody')); }
function edFromCurrent() { QK.ed = { title: ST.quiz_title || '', qs: ST.quiz.map(q => ({ ...q, correct: q.poll ? 0 : q.correct, time: q.time || '' })) }; qkEditor(document.getElementById('qkBody')); edValidateLive(); }
function edSave() {
  const v = qkValidate(edToRaw());
  if (v.errors.length) { document.getElementById('edPrev').innerHTML = qkPreview(null, v.errors); return; }
  const list = drafts(), title = (QK.ed.title || '').trim() || ('Quiz ' + new Date().toLocaleString());
  const i = list.findIndex(d => d.title === title);
  const rec = { id: i >= 0 ? list[i].id : Date.now(), title, qs: v.quiz, saved: Date.now() };
  if (i >= 0) list[i] = rec; else list.unshift(rec);
  store('arena_quizzes', JSON.stringify(list.slice(0, 30)));
  QK.ed.title = title; document.getElementById('edTitle').value = title; toast(t('ed_saved'), true); edMine();
}
function edMine() {
  const L = document.getElementById('edMine'); if (!L) return;
  const list = drafts();
  L.innerHTML = list.length ? list.map(d => `<div class="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-800 text-xs"><span class="truncate">${esc(d.title)} <span class="text-slate-500">· ${t('quiz_n', { n: d.qs.length })}</span></span><span class="flex gap-1 flex-none"><button onclick="edOpenDraft(${d.id})" class="btn px-2 py-1 rounded bg-cyan-500/20 text-cyan-200">${t('ed_load')}</button><button onclick="edDelDraft(${d.id})" class="btn px-2 py-1 rounded bg-rose-500/30 text-rose-200"><i class="fa-solid fa-trash"></i></button></span></div>`).join('') : `<div class="text-xs text-slate-500">${t('ed_none')}</div>`;
}
function edOpenDraft(id) { const d = drafts().find(x => x.id === id); if (!d) return; QK.ed = { title: d.title, qs: d.qs.map(q => ({ ...q, time: q.time || '' })) }; qkEditor(document.getElementById('qkBody')); edValidateLive(); }
function edDelDraft(id) { store('arena_quizzes', JSON.stringify(drafts().filter(d => d.id !== id))); edMine(); }
function edExport() {
  const v = qkValidate(edToRaw());
  if (v.errors.length) { document.getElementById('edPrev').innerHTML = qkPreview(null, v.errors); return; }
  downloadFile((QK.ed.title || 'quiz').replace(/[^\w\-]+/g, '_') + '.json', JSON.stringify(v.quiz, null, 2), 'application/json');
}
