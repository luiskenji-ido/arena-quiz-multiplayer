// Navegador: modo "Por vez" (Arena e Clássico): só quem está na vez responde, os outros acompanham.
const { chromium } = require('playwright');
const B = 'http://localhost:5055';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const mk = async (name, vp) => { const c = await b.newContext({ viewport: vp, locale: 'pt-BR' }); const p = await c.newPage(); p.on('pageerror', e => { if (!/tailwind/.test(e.message)) errs.push(name + ': ' + e.message); }); p.on('dialog', d => d.accept()); return p; };
  const host = await mk('host', { width: 1280, height: 900 });
  await host.goto(B + '/host'); await host.click('text=Criar sala'); await host.waitForSelector('#boxLobby:not(.hidden)');
  await host.click('#ctlConfig');
  await host.evaluate(() => { document.querySelector('input[name=sOrder][value=turns]').checked = true; sProg.checked = false; applySettings(); });
  await host.waitForTimeout(1200);
  const code = (await host.textContent('#bigCode')).trim();
  const mkP = async n => { const p = await mk(n, { width: 390, height: 800 }); await p.goto(B + '/join?code=' + code); await p.fill('#nameInput', n); await p.click('#joinForm button'); await p.waitForSelector('#boxLobby:not(.hidden)'); return p; };
  const ana = await mkP('Ana'), beto = await mkP('Beto');
  await host.waitForFunction(() => ST && ST.order.length === 2);
  console.log('lobby order:', (await host.textContent('#lobbyPlayers')).replace(/\s+/g, ' ').trim(), '|', (await host.textContent('#sumSettings')).match(/Quem responde: [^0-9]+/)[0].trim());
  await host.click('#boxLobby button:has(.fa-play)');
  await ana.waitForSelector('#qOptions button');
  await beto.waitForFunction(() => ST && ST.phase === 'open');
  console.log('ana status:', (await ana.textContent('#qStatus')).trim(), '| beto status:', (await beto.textContent('#qStatus')).trim());
  console.log('beto options disabled:', await beto.$$eval('#qOptions button', e => e.every(x => x.disabled)), '| beto 50/50 disabled:', await beto.$eval('#powerGrid button', e => e.disabled));
  console.log('host turn banner:', (await host.textContent('#gTurn')).replace(/\s+/g, ' ').trim());
  // Ana usa 50/50: Beto vê as eliminadas
  await ana.click('#powerGrid button:nth-child(1)');
  await beto.waitForFunction(() => document.querySelectorAll('#qOptions .elim').length === 2, null, { timeout: 5000 });
  console.log('beto sees 2 eliminated options: true');
  // Beto bloqueia... a si? não: Beto usa ataque fora da vez (Armadilha em Ana)
  const ok = await beto.evaluate(async () => (await api('/api/power', { code: CODE, pid: ME.pid, token: ME.token, power: 'trap', target: ST.targets.find(x => x.name === 'Ana').id })).ok);
  console.log('beto attack outside his turn ok:', ok);
  // Ana responde (opção A = "World Wide Web"? quiz padrão: pergunta 1 correta = 0)
  await ana.click('#qOptions button:not([disabled])');
  await beto.waitForFunction(() => ST && ST.phase === 'reveal', null, { timeout: 5000 });
  console.log('beto sees:', (await beto.textContent('#qStatus')).trim());
  console.log('host sees:', (await host.textContent('#gWinner')).trim());
  await host.click('#ctlNext');
  await beto.waitForFunction(() => ST && ST.phase === 'open' && ST.qi === 1);
  console.log('Q2 -> beto status:', (await beto.textContent('#qStatus')).trim(), '| ana status:', (await ana.textContent('#qStatus')).trim());
  // Clássico + por vez: mesmo jogadores, trocar modo no lobby
  await host.click('#ctlRestart'); await host.waitForSelector('#boxLobby:not(.hidden)');
  await host.click('#ctlConfig'); await host.evaluate(() => { cfgMode('classic'); applySettings(); });
  await host.waitForURL('**/host/classic');
  await ana.waitForSelector('#vLobby:not(.hidden)', { timeout: 8000 }); await beto.waitForSelector('#vLobby:not(.hidden)', { timeout: 8000 });
  await host.waitForSelector('#vLobby:not(.hidden)');
  console.log('classic chips:', await host.$$eval('#chips .chip', e => e.map(x => x.textContent).join(', ')));
  await host.click('#vLobby button:has(.fa-play)');
  await beto.waitForSelector('#vQuestion:not(.hidden) #qTurn:not(.hidden)');
  console.log('classic beto:', (await beto.textContent('#qTurn')).trim(), '| tiles disabled:', await beto.$$eval('#tiles button', e => e.every(x => x.disabled)));
  console.log('classic ana:', (await ana.textContent('#qTurn')).trim());
  console.log('host classic:', (await host.textContent('#qTurn')).trim());
  await ana.click('#tiles button:nth-child(2)');
  await beto.waitForSelector('#vResult:not(.hidden)');
  console.log('classic beto result:', (await beto.textContent('#vResult')).replace(/\s+/g, ' ').trim());
  console.log('errors', errs);
  await b.close();
})();
