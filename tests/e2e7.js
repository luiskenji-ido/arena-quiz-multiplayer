// Navegador: Arsenal e emojis do organizador enviados para todos os participantes.
const { chromium } = require('playwright');
const B = 'http://localhost:5055';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const mk = async (name, vp) => { const c = await b.newContext({ viewport: vp, locale: 'pt-BR' }); const p = await c.newPage(); p.on('pageerror', e => { if (!/tailwind/.test(e.message)) errs.push(name + ': ' + e.message); }); p.on('dialog', d => d.accept()); return p; };
  const host = await mk('host', { width: 1280, height: 900 });
  await host.goto(B + '/host'); await host.click('text=Criar sala'); await host.waitForSelector('#boxLobby:not(.hidden)');
  await host.waitForSelector('#hostDock');
  console.log('dock:', (await host.textContent('#hdArsenal')).trim(), '| emojis:', await host.$$eval('#hostDock .hd-emo', e => e.length));
  const code = (await host.textContent('#bigCode')).trim();
  const mkP = async n => { const p = await mk(n, { width: 390, height: 800 }); await p.goto(B + '/join?code=' + code); await p.fill('#nameInput', n); await p.click('#joinForm button'); await p.waitForSelector('#boxLobby:not(.hidden)'); return p; };
  const ana = await mkP('Ana'), beto = await mkP('Beto');
  await ana.waitForTimeout(1500);
  // emoji do organizador -> aparece grande nos celulares
  await host.$eval('#hostDock .hd-emo[data-e="🔥"]', e => e.click());
  await ana.waitForSelector('.bc-flash', { timeout: 5000 }); await beto.waitForSelector('.bc-flash', { timeout: 5000 });
  console.log('ana got:', (await ana.textContent('.bc-flash')).trim(), '| beto got:', (await beto.textContent('.bc-flash')).trim());
  await host.waitForSelector('#reactLayer .react-float.host', { timeout: 5000 });
  console.log('host screen shows own emoji:', (await host.textContent('#reactLayer .react-float.host')).trim());
  await ana.screenshot({ path: '/tmp/e2e7_phone_emoji.png' });
  // arsenal no lobby: "para todos" desabilitado
  await host.$eval('#hdArsenal', e => e.click()); await host.waitForSelector('#arsenalModal:not(.hidden)');
  console.log('lobby: all-buttons disabled =', await host.$$eval('#arsBody .pw', e => e.every(x => x.disabled)));
  // dar carga para todos
  await host.evaluate(() => { arsGiveT.value = 'all'; arsGiveP.value = 'block'; });
  await host.$eval('#arsBody .fa-gift', e => e.closest('button').click());
  await ana.waitForTimeout(2200);
  console.log('ana toast(s):', await ana.$$eval('#toast, .toast', e => e.map(x => x.textContent.trim()).join(' | ')));
  // abre pergunta e usa dado / carta / 50-50
  await host.$eval('#arsenalModal', e => e.classList.add('hidden'));
  await host.click('#boxLobby button:has(.fa-play)'); await host.waitForTimeout(1500);
  await host.$eval('#hdArsenal', e => e.click()); await host.waitForTimeout(300);
  console.log('open: all-buttons enabled =', await host.$$eval('#arsBody .pw', e => e.filter(x => !x.disabled).length));
  await host.evaluate(() => useHostPower('all_dice')); await host.waitForTimeout(1600);
  console.log('dice result:', (await host.textContent('#arsFxTxt')).trim());
  await host.screenshot({ path: '/tmp/e2e7_host_dice.png' });
  await host.evaluate(() => useHostPower('all_5050')); await host.waitForTimeout(400);
  await host.evaluate(() => useHostPower('all_card')); await host.waitForTimeout(800);
  console.log('card result:', (await host.textContent('#arsFxTxt')).trim());
  await host.evaluate(() => useHostPower('trap', { target: arsTarget.value }));
  await ana.waitForTimeout(2000);
  const st = await ana.evaluate(() => ({ elim: ST.question && ST.question.elim, events: ST.events.filter(e => /^ev_host/.test(e.k)).map(eventText) }));
  console.log('ana eliminated options:', JSON.stringify(st.elim)); console.log('events:\n  ' + st.events.join('\n  '));
  await ana.screenshot({ path: '/tmp/e2e7_phone.png' });
  // clássico: arsenal com seções Arena desabilitadas
  await host.$eval('#arsenalModal', e => e.classList.add('hidden'));
  await host.click('#ctlRestart'); await host.waitForSelector('#boxLobby:not(.hidden)');
  await host.click('#ctlConfig'); await host.evaluate(() => { cfgMode('classic'); applySettings(); });
  await host.waitForURL('**/host/classic'); await host.waitForSelector('#hostDock');
  await host.$eval('#hdArsenal', e => e.click()); await host.waitForSelector('#arsenalModal:not(.hidden)');
  console.log('classic: target select disabled =', await host.$eval('#arsTarget', e => e.disabled));
  await beto.waitForSelector('#vLobby:not(.hidden)', { timeout: 8000 }); await beto.waitForTimeout(1500);
  await host.$eval('#hostDock .hd-emo[data-e="🏆"]', e => e.click());
  await beto.waitForSelector('.bc-flash', { timeout: 6000 });
  console.log('classic phone got emoji:', (await beto.textContent('.bc-flash')).trim());
  await host.screenshot({ path: '/tmp/e2e7_classic_arsenal.png' });
  console.log('errors', errs);
  await b.close();
})();
