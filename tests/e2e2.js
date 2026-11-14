// Navegador: criação de quiz (upload JSON/CSV, texto rápido, editor, templates).
const { chromium } = require('playwright');
const path = require('path');
const B = 'http://localhost:5055';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const mk = async (name, vp) => { const c = await b.newContext({ viewport: vp, locale: 'pt-BR' }); const p = await c.newPage(); p.on('pageerror', e => { if (!/tailwind/.test(e.message)) errs.push(name + ': ' + e.message); }); return p; };
  const host = await mk('host', { width: 1280, height: 900 });
  await host.goto(B + '/host');
  await host.click('text=Criar sala');
  await host.waitForSelector('#boxLobby:not(.hidden)');
  

  const info = async () => (await host.textContent('#sumQuiz')).trim() + ' | ' + (await host.textContent('#sumQuizN')).trim();
  // 1) upload JSON
  await host.click('#ctlQuiz'); await host.evaluate(() => qkTab('upload'));
  await host.setInputFiles('#fileInput', path.join(__dirname, 'fixtures/quiz.json'));
  await host.waitForSelector('#upPrev .text-emerald-100'); await host.click('#qkUse');
  await host.waitForSelector('#quizModal.hidden', { state: 'attached' }); await host.waitForTimeout(1200);
  console.log('after JSON:', await info());
  // 2) upload CSV (; e A-D / número)
  await host.click('#ctlQuiz'); await host.evaluate(() => qkTab('upload'));
  await host.setInputFiles('#fileInput', path.join(__dirname, 'fixtures/quiz.csv'));
  await host.waitForSelector('#upPrev .text-emerald-100'); console.log('csv preview:', (await host.textContent('#upPrev')).trim().slice(0, 120));
  await host.click('#qkUse'); await host.waitForTimeout(1200);
  console.log('after CSV:', await info());
  // 3) texto rápido
  await host.click('#ctlQuiz'); await host.evaluate(() => qkTab('text'));
  await host.fill('#txArea', 'Qual é a capital da França?\nLondres\n*Paris\nMadri\n> Paris.\n\n2 + 2 = ?\n3\n*4\n5\n\nSem correta\nA\nB');
  await host.waitForSelector('#txPrev .text-rose-200'); console.log('text errors:', (await host.textContent('#txPrev')).trim());
  await host.fill('#txArea', 'Qual é a capital da França?\nLondres\n*Paris\nMadri\n> Paris.\n\n2 + 2 = ?\n3\n*4\n5');
  await host.waitForSelector('#txPrev .text-emerald-100'); await host.click('#qkUse'); await host.waitForTimeout(1200);
  console.log('after text:', await info());
  // 4) template em espanhol, editar no editor, adicionar pergunta e usar
  await host.selectOption('.langSel >> nth=1', 'es');
  await host.click('#ctlQuiz'); await host.evaluate(() => qkTab('templates')); await host.waitForSelector('#tplGrid .rounded-2xl');
  console.log('templates:', await host.$$eval('#tplGrid .rounded-2xl .font-esports', e => e.map(x => x.textContent.trim()).join(', ')));
  await host.click('#tplGrid .rounded-2xl:nth-child(2) button:has-text("Editar")');
  await host.waitForSelector('#edList [data-i]');
  await host.evaluate(() => edAdd());
  const last = host.locator('#edList [data-i]').last();
  await last.locator('[data-f=question]').fill('¿Pregunta nueva?', { force: true });
  await last.locator('[data-f=opt][data-k="0"]').fill('Sí', { force: true }); await last.locator('[data-f=opt][data-k="1"]').fill('No', { force: true });
  await last.locator('[data-f=correct][data-k="1"]').evaluate(e => { e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); });
  await host.waitForSelector('#edPrev .text-emerald-100');
  await host.evaluate(() => edSave()); console.log('drafts:', (await host.textContent('#edMine')).trim().slice(0, 60));
  await host.evaluate(() => document.getElementById('qkUse').click()); await host.waitForTimeout(1200);
  console.log('after editor:', await info());
  await host.screenshot({ path: '/tmp/e2e2_lobby.png' });

  console.log('errors', errs);
  await b.close();
})();
