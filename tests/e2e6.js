// Navegador: chamar atenção, reações no telão, música de tensão e temas.
const { chromium } = require('playwright');
const B = 'http://localhost:5055';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const mk = async (name, vp) => { const c = await b.newContext({ viewport: vp, locale: 'pt-BR' }); const p = await c.newPage(); p.on('pageerror', e => { if (!/tailwind/.test(e.message)) errs.push(name + ': ' + e.message); }); p.on('dialog', d => d.accept()); return p; };
  const host = await mk('host', { width: 1280, height: 900 });
  await host.goto(B + '/host'); await host.click('text=Criar sala'); await host.waitForSelector('#boxLobby:not(.hidden)');
  await host.click('#ctlConfig');
  console.log('theme cards:', await host.$$eval('#sThemes .theme-card', e => e.map(x => x.textContent.trim()).join(' | ')));
  await host.evaluate(() => { sThemeVal.value = 'neon_pink'; sTimer.value = 8; sTensionSecs.value = '10'; applySettings(); });
  await host.waitForFunction(() => document.documentElement.dataset.theme === 'neon_pink');
  console.log('host theme:', await host.evaluate(() => document.documentElement.dataset.theme), '| body bg:', await host.evaluate(() => getComputedStyle(document.body).backgroundColor));
  const code = (await host.textContent('#bigCode')).trim();
  const mkP = async n => { const p = await mk(n, { width: 390, height: 800 }); await p.goto(B + '/join?code=' + code); await p.fill('#nameInput', n); await p.click('#joinForm button'); await p.waitForSelector('#boxLobby:not(.hidden)'); return p; };
  const ana = await mkP('Ana'), beto = await mkP('Beto');
  await ana.waitForFunction(() => document.documentElement.dataset.theme === 'neon_pink');
  console.log('phone theme:', await ana.evaluate(() => document.documentElement.dataset.theme), '| sound toggle:', !!(await ana.$('#soundToggle')));
  // chamar atenção: Ana -> Beto (som Susto)
  await ana.waitForSelector('#nudgeBtn:not(.hidden)'); await ana.waitForFunction(() => ST.targets.length >= 2);   // espera o rival aparecer
  console.log('nudge button:', (await ana.textContent('#nudgeBtn')).trim());
  await ana.evaluate(() => { window.__sounds = []; }); await beto.evaluate(() => { const o = loudSound; window.__sounds = []; loudSound = k => { window.__sounds.push(k); o(k); }; });
  await ana.click('#nudgeBtn'); await ana.waitForSelector('#nudgeModal:not(.hidden)');
  await ana.click('#nudgeModal [data-k=scare]'); await ana.click('#nudgeModal [data-p]');
  await beto.waitForSelector('.nudge-flash', { timeout: 5000 });
  console.log('beto flash:', (await beto.textContent('.nudge-flash')).trim(), '| sound played:', await beto.evaluate(() => window.__sounds.join(',')));
  await ana.waitForTimeout(1200);
  console.log('ana nudges left:', (await ana.textContent('#nudgeLeft')).trim());
  await ana.click('#nudgeBtn'); await ana.click('#nudgeModal [data-p]'); await ana.waitForTimeout(1200);
  console.log('after 2 uses -> disabled:', await ana.$eval('#nudgeBtn', e => e.disabled));
  // reações: aparecem flutuando na tela do organizador
  await ana.click('#reactBar button:nth-child(3)'); await beto.click('#reactBar button:nth-child(4)');
  await host.waitForSelector('#reactLayer .react-float', { timeout: 5000 });
  await host.waitForTimeout(1200);
  console.log('host reactions:', await host.$$eval('#reactLayer .react-float', e => e.map(x => x.textContent.trim()).join(' | ')));
  await host.screenshot({ path: '/tmp/e2e6_host_react.png' });
  // música de tensão: pergunta de 8 s com janela de 10 s -> toca já
  await host.click('#boxLobby button:has(.fa-play)');
  await ana.waitForFunction(() => Tension.on, null, { timeout: 5000 });
  console.log('tension on (phone/host):', await ana.evaluate(() => Tension.on), await host.evaluate(() => Tension.on));
  await host.click('#ctlPause'); await host.waitForTimeout(1200);
  console.log('paused -> tension off:', await host.evaluate(() => !Tension.on), await ana.evaluate(() => !Tension.on));
  await ana.click('#soundToggle'); console.log('phone muted:', await ana.evaluate(() => MUTED));
  // classic + tema inclusivo
  await host.click('#ctlRestart'); await host.waitForSelector('#boxLobby:not(.hidden)');
  await host.click('#ctlConfig'); await host.evaluate(() => { cfgMode('classic'); sThemeVal.value = 'inclusive'; applySettings(); });
  await host.waitForURL('**/host/classic'); await beto.waitForSelector('#vLobby:not(.hidden)', { timeout: 8000 });
  await beto.waitForFunction(() => document.documentElement.dataset.theme === 'inclusive');
  console.log('classic phone theme:', await beto.evaluate(() => document.documentElement.dataset.theme), '| font-size:', await beto.evaluate(() => getComputedStyle(document.documentElement).fontSize), '| accent:', await beto.evaluate(() => getComputedStyle(document.body).getPropertyValue('--c-accent').trim()));
  await beto.click('#reactBar button:nth-child(1)');
  await host.waitForSelector('#reactLayer .react-float', { timeout: 5000 });
  console.log('classic host got reaction: true');
  console.log('errors', errs);
  await b.close();
})();
