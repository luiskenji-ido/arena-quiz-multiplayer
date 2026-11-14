// Navegador: sala pública (lista, pedido, aceitar/recusar) + avanço automático.
const { chromium } = require('playwright');
const B = 'http://localhost:5055';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const mk = async (name, vp) => { const c = await b.newContext({ viewport: vp, locale: 'pt-BR' }); const p = await c.newPage(); p.on('pageerror', e => { if (!/tailwind/.test(e.message)) errs.push(name + ': ' + e.message); }); p.on('dialog', d => d.accept()); return p; };
  const host = await mk('host', { width: 1280, height: 900 });
  await host.goto(B + '/host'); await host.click('text=Criar sala');
  await host.waitForSelector('#boxLobby:not(.hidden)');
  // configurar: sala pública com nome + automático 3s
  await host.click('#ctlConfig');
  await host.evaluate(() => { sRoomName.value = 'Treinamento Vendas'; document.querySelector('input[name=sVis][value=public]').checked = true; sAuto.checked = true; sAutoDelay.value = '3'; applySettings(); });
  await host.waitForTimeout(1300);
  console.log('host summary:', (await host.textContent('#sumSettings')).replace(/\s+/g, ' ').trim());

  // visitante vê a lista e pede para entrar
  const ana = await mk('ana', { width: 390, height: 800 });
  await ana.goto(B + '/');
  await ana.waitForSelector('#rooms button');
  console.log('public list:', (await ana.textContent('#rooms')).replace(/\s+/g, ' ').trim());
  await ana.click('#rooms button'); await ana.fill('#reqName', 'Ana'); await ana.click('#stName button');
  await ana.waitForSelector('#stWait:not(.hidden)');
  await host.waitForSelector('#reqDock:not(.hidden)');
  console.log('host requests:', (await host.textContent('#reqList')).replace(/\s+/g, ' ').trim());
  await host.click('#reqList button:has-text("Aceitar")');
  await ana.waitForSelector('#stOk:not(.hidden)', { timeout: 6000 });
  console.log('ana approved, code shown:', (await ana.textContent('#okCode')).trim(), '| qr:', await ana.$eval('#okQr', e => e.getAttribute('src')));
  await ana.click('#okEnter');
  await ana.waitForSelector('#boxLobby:not(.hidden)');
  console.log('ana inside without typing name again:', (await ana.textContent('#meName')).trim());

  // segundo visitante é recusado
  const beto = await mk('beto', { width: 390, height: 800 });
  await beto.goto(B + '/'); await beto.waitForSelector('#rooms button');
  await beto.click('#rooms button'); await beto.fill('#reqName', 'Beto'); await beto.click('#stName button');
  await host.waitForSelector('#reqList button:has-text("Recusar")');
  await host.click('#reqList button:has-text("Recusar")');
  await beto.waitForSelector('#stNo:not(.hidden)', { timeout: 6000 });
  console.log('beto denied:', (await beto.textContent('#stNo')).trim());

  // jogo com avanço automático
  await host.click('#boxLobby button:has(.fa-play)');
  await ana.waitForSelector('#qOptions button:not([disabled])');
  await ana.click('#qOptions button:nth-child(1)');
  await host.waitForSelector('#ctlAutoLbl:not(.hidden)', { timeout: 6000 });
  console.log('host countdown:', (await host.textContent('#ctlAutoLbl')).trim(), '| ana:', (await ana.textContent('#qTimer')).trim());
  await host.waitForFunction(() => ST && ST.qi === 1 && ST.phase === 'open', null, { timeout: 8000 });
  console.log('advanced automatically to question', await host.evaluate(() => ST.qi + 1));
  // segurar o avanço
  await ana.click('#qOptions button:nth-child(1)');
  await host.waitForSelector('#ctlHold:not(.hidden)');
  await host.click('#ctlHold'); await host.waitForTimeout(4500);
  console.log('held:', await host.evaluate(() => ST.phase + ' / auto_hold=' + ST.auto_hold), '|', (await host.textContent('#ctlAutoLbl')).trim());
  await host.click('#ctlRelease');
  await host.waitForFunction(() => ST && ST.qi === 2, null, { timeout: 8000 });
  console.log('released -> question', await host.evaluate(() => ST.qi + 1));
  // desligar automático pela barra
  await host.uncheck('#ctlAuto'); await host.waitForTimeout(1200);
  console.log('auto off:', await host.evaluate(() => ST.settings.auto_next));
  console.log('errors', errs);
  await b.close();
})();
