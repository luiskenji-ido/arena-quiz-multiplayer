// Navegador: Escopo da partida (usar só parte das perguntas do quiz).
const { chromium } = require('playwright');
const B = 'http://localhost:5055';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const mk = async (name, vp) => { const c = await b.newContext({ viewport: vp, locale: 'pt-BR' }); const p = await c.newPage(); p.on('pageerror', e => { if (!/tailwind/.test(e.message)) errs.push(name + ': ' + e.message); }); p.on('dialog', d => d.accept()); return p; };
  const host = await mk('host', { width: 1280, height: 900 });
  await host.goto(B + '/host'); await host.click('text=Criar sala'); await host.waitForSelector('#boxLobby:not(.hidden)');
  const code = (await host.textContent('#bigCode')).trim();
  // carrega um quiz com 120 perguntas
  await host.evaluate(async () => {
    const quiz = Array.from({ length: 120 }, (_, i) => ({ question: `Pergunta ${i + 1}?`, options: ['A', 'B', 'C', 'D'], correct: 0, time: 20 }));
    await api(`/api/host/${H.code}/settings`, { token: H.token, settings: {}, quiz, quiz_title: 'Banco 120' }); await poll();
  });
  const mkP = async n => { const p = await mk(n, { width: 390, height: 800 }); await p.goto(B + '/join?code=' + code); await p.fill('#nameInput', n); await p.click('#joinForm button'); await p.waitForSelector('#boxLobby:not(.hidden)'); return p; };
  const ana = await mkP('Ana'), beto = await mkP('Beto');
  await host.waitForTimeout(1500);
  console.log('lobby antes:', (await host.textContent('#sumQuizN')).trim());
  await host.click('#ctlConfig'); await host.waitForSelector('#cfgModal:not(.hidden)');
  console.log('slider max:', await host.$eval('#sScopeRange', e => e.max), '| badge:', (await host.textContent('#scopeBadge')).trim());
  await host.evaluate(() => { sScopeNum.value = 90; scopeSync('num'); document.querySelector('input[name=sOrder][value=turns]').checked = true; scopeSync(); });
  console.log('badge (por vez):', (await host.textContent('#scopeBadge')).trim());
  console.log('info:', (await host.textContent('#scopeInfo')).trim());
  await host.screenshot({ path: '/tmp/e2e8_scope.png' });
  await host.evaluate(() => { document.querySelector('input[name=sOrder][value=speed]').checked = true; applySettings(); });
  await host.waitForTimeout(1500);
  console.log('lobby depois:', (await host.textContent('#sumQuizN')).trim());
  await host.click('#boxLobby button:has(.fa-play)'); await host.waitForTimeout(1500);
  console.log('telão:', (await host.textContent('#gRound')).trim(), '| celular:', (await ana.textContent('#qRound')).trim());
  // sorteadas + reinício
  await host.click('#ctlRestart'); await host.waitForSelector('#boxLobby:not(.hidden)');
  await host.click('#ctlConfig');
  await host.evaluate(() => { sScopeNum.value = 10; scopeSync('num'); document.querySelector('input[name=sPick][value=random]').checked = true; applySettings(); });
  await host.waitForTimeout(1500);
  console.log('lobby sorteio:', (await host.textContent('#sumQuizN')).trim());
  await host.click('#boxLobby button:has(.fa-play)'); await host.waitForTimeout(1500);
  console.log('1ª sorteada:', await host.evaluate(() => ST.question.question), '| total:', await host.evaluate(() => ST.total));
  // clássico mostra o escopo no lobby
  await host.click('#ctlRestart'); await host.waitForSelector('#boxLobby:not(.hidden)');
  await host.click('#ctlConfig'); await host.evaluate(() => { cfgMode('classic'); applySettings(); });
  await host.waitForURL('**/host/classic'); await host.waitForTimeout(1500);
  console.log('clássico lobby:', (await host.textContent('#lobInfo')).trim());
  console.log('errors', errs);
  await b.close();
})();
