// Navegador: o organizador chama a atenção de um participante (ou de todos) pelo Arsenal.
const { chromium } = require('playwright');
const B = 'http://localhost:5055';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const mk = async (name, vp) => { const p = await (await b.newContext({ viewport: vp, locale: 'pt-BR' })).newPage(); p.on('pageerror', e => { if (!/tailwind/.test(e.message)) errs.push(name + ': ' + e.message); }); p.on('dialog', d => d.accept()); return p; };
  for (const mode of ['arena', 'classic']) {
    const host = await mk('host', { width: 1280, height: 900 });
    await host.goto(B + '/host'); await host.click('text=Criar sala'); await host.waitForSelector('#boxLobby:not(.hidden)');
    if (mode === 'classic') { await host.click('#ctlConfig'); await host.evaluate(() => { cfgMode('classic'); applySettings(); }); await host.waitForURL('**/host/classic'); await host.waitForSelector('#hostDock'); }
    const code = await host.evaluate(() => H.code);
    const mkP = async n => { const p = await mk(n, { width: 390, height: 800 }); await p.goto(B + '/join?code=' + code); await p.fill('#nameInput', n); await p.click('#joinForm button'); await p.waitForSelector('#boxLobby, #vLobby'); return p; };
    const ana = await mkP('Ana'), beto = await mkP('Beto');
    for (const p of [ana, beto]) await p.evaluate(() => { const o = loudSound; window.__sounds = []; loudSound = k => { window.__sounds.push(k); o(k); }; });
    await host.waitForFunction(() => ST.order && ST.order.length === 2, null, { timeout: 8000 });
    await host.$eval('#hdArsenal', e => e.click()); await host.waitForSelector('#arsenalModal:not(.hidden)');
    console.log(mode, '| seção no Arsenal:', (await host.textContent('#arsBody')).includes('Chamar atenção (som alto no celular)'));
    // 1) só a Ana
    await host.evaluate(() => { const s = document.getElementById('arsNudgeT'); s.value = [...s.options].find(o => o.textContent === 'Ana').value; });
    await host.evaluate(() => hostNudge('siren'));
    await ana.waitForSelector('.nudge-flash', { timeout: 6000 });
    console.log(mode, '| Ana recebeu:', (await ana.textContent('.nudge-flash')).trim(), '| som:', await ana.evaluate(() => window.__sounds.join(',')));
    console.log(mode, '| Beto não recebeu:', (await beto.$$('.nudge-flash')).length === 0 && (await beto.evaluate(() => window.__sounds.length)) === 0);
    // 2) todos
    await host.waitForTimeout(1200);
    await host.evaluate(() => { document.getElementById('arsNudgeT').value = 'all'; hostNudge('horn'); });
    await beto.waitForSelector('.nudge-flash', { timeout: 6000 });
    console.log(mode, '| Beto recebeu (todos):', (await beto.textContent('.nudge-flash')).trim(), '| som:', await beto.evaluate(() => window.__sounds.join(',')));
    await host.waitForTimeout(800);
    console.log(mode, '| feed:', await host.evaluate(() => ST.events.map(eventText).filter(x => /chamou a atenção/.test(x)).join(' / ')));
  }
  console.log('errors', errs); await b.close();
})();
