// Navegador: modo Clássico corporativo + controles do apresentador (pausar, placar, finalizar, reiniciar, trocar modo).
const { chromium } = require('playwright');
const B = 'http://localhost:5055';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const mk = async (name, vp) => { const c = await b.newContext({ viewport: vp, locale: 'pt-BR' }); const p = await c.newPage(); p.on('pageerror', e => { if (!/tailwind/.test(e.message)) errs.push(name + ': ' + e.message); }); p.on('dialog', d => d.accept()); return p; };
  const host = await mk('host', { width: 1280, height: 900 });
  await host.goto(B + '/host');
  await host.click('.modeCard[data-mode=classic]');
  await host.click('text=Criar sala');
  await host.waitForURL('**/host/classic');
  await host.waitForSelector('#vLobby:not(.hidden)');
  const code = (await host.textContent('#bigCode')).trim();
  console.log('host classic lobby, PIN', code, '| join host:', await host.textContent('#joinHost'));

  // template corporativo
  await host.click('#ctlQuiz'); await host.evaluate(() => qkTab('templates'));
  await host.waitForSelector('#tplGrid .rounded-2xl');
  console.log('sections:', await host.$$eval('#tplGrid > .font-esports', e => e.map(x => x.textContent.trim()).join(' | ')));
  await host.evaluate(() => qkUseTemplate('security', false)); await host.waitForTimeout(1300);
  console.log('quiz:', (await host.textContent('#lobQuiz')).trim(), '|', (await host.textContent('#lobInfo')).trim());

  // configurações: placar só após cada pergunta
  await host.click('#ctlConfig');
  console.log('powers rows (arena only, hidden in classic):', await host.$eval('#cfgModal .arenaOnly', e => e.classList.contains('hidden')));
  await host.evaluate(() => { document.querySelector('input[name=sBoard][value=reveal]').checked = true; sTimer.value = 40; });
  await host.evaluate(() => applySettings()); await host.waitForTimeout(1200);
  console.log('lobby info after cfg:', (await host.textContent('#lobInfo')).trim());

  const mkP = async n => { const p = await mk(n, { width: 390, height: 800 }); await p.goto(B + '/join?code=' + code); await p.waitForSelector('#sJoin:not(.hidden)'); await p.fill('#nameInput', n); await p.click('#joinForm button'); await p.waitForSelector('#vLobby:not(.hidden)'); return p; };
  const ana = await mkP('Ana'), beto = await mkP('Beto');
  await host.waitForFunction(() => document.getElementById('nPlayers').textContent === '2');
  console.log('chips:', await host.$$eval('#chips .chip', e => e.map(x => x.textContent).join(', ')));
  await host.click('#vLobby button:has(.fa-play)');
  await ana.waitForSelector('#vQuestion:not(.hidden) #tiles button');
  console.log('phone tiles:', await ana.$$eval('#tiles button', e => e.length), '| board hidden during question:', await ana.evaluate(() => ST.board.length === 0));

  // pausa
  await host.click('#ctlPause'); await ana.waitForSelector('#pausedBanner:not(.hidden)');
  console.log('paused: tiles disabled =', await ana.$eval('#tiles button', e => e.disabled), '| host ring =', (await host.textContent('#ring')).trim());
  await host.click('#ctlResume'); await ana.waitForSelector('#pausedBanner.hidden', { state: 'attached' });

  // respostas: pergunta 1 (phishing) correta = índice 1
  await ana.waitForFunction(() => !document.querySelector('#tiles button').disabled);
  await ana.click('#tiles button:nth-child(2)');
  await ana.waitForSelector('#vWait:not(.hidden)'); console.log('ana wait:', (await ana.textContent('#waitTxt')).trim());
  await beto.waitForFunction(() => !document.querySelector('#tiles button').disabled);
  await beto.click('#tiles button:nth-child(1)');
  await ana.waitForSelector('#vResult:not(.hidden)');
  console.log('ana result:', (await ana.textContent('#vResult')).replace(/\s+/g, ' ').trim());
  console.log('beto result:', (await beto.textContent('#vResult')).replace(/\s+/g, ' ').trim());
  await host.waitForSelector('#chart:not(.hidden) .bar'); await host.waitForTimeout(900);
  console.log('host chart nums:', await host.$$eval('#chart .num', e => e.map(x => x.textContent).join(' ')));
  await host.screenshot({ path: '/tmp/e2e3_host_reveal.png' });
  await host.click('#revBoardBtn'); await host.waitForSelector('#vBoard:not(.hidden) .srow');
  console.log('scoreboard:', await host.$$eval('#boardRows .srow', e => e.map(x => x.textContent.replace(/\s+/g, ' ')).join(' | ')));

  // próxima + mudar placar no meio do jogo para "só no final"
  await host.click('#vBoard button'); await ana.waitForSelector('#vQuestion:not(.hidden)');
  await host.click('#ctlConfig'); await host.evaluate(() => { document.querySelector('input[name=sBoard][value=end]').checked = true; });
  console.log('live note shown:', await host.$eval('#cfgLiveNote', e => !e.classList.contains('hidden')), '| mode box hidden:', await host.$eval('#cfgModeBox', e => e.classList.contains('hidden')));
  await host.evaluate(() => applySettings()); await host.waitForTimeout(1200);
  await host.click('#ctlClose'); await ana.waitForSelector('#vResult:not(.hidden)');
  console.log('rank text hidden (board_end):', JSON.stringify((await ana.textContent('#resRank')).trim()), '| host board button:', await host.$eval('#revBar', e => !e.classList.contains('hidden')));

  // finalizar e reiniciar
  await host.click('#ctlFinish'); await host.waitForSelector('#vFinal:not(.hidden) .step');
  await ana.waitForSelector('#vFinal:not(.hidden)');
  console.log('podium:', await host.$$eval('#podium .step', e => e.length), '| ana final:', (await ana.textContent('#finPos')).trim());
  await host.screenshot({ path: '/tmp/e2e3_host_podium.png' });
  await host.click('#ctlRestart'); await host.waitForSelector('#vLobby:not(.hidden)');
  await ana.waitForSelector('#vLobby:not(.hidden)'); console.log('restart -> lobby OK');

  // trocar para Arena no lobby: host e celulares mudam de tela sozinhos
  await host.click('#ctlConfig'); await host.evaluate(() => cfgMode('arena'));
  await host.evaluate(() => applySettings());
  await host.waitForURL(B + '/host', { timeout: 8000 });
  await ana.waitForSelector('#scrMain:not(.hidden) #boxLobby', { timeout: 8000 });
  console.log('switched to arena: host', host.url().replace(B, ''), '| phone has arena lobby:', !!(await ana.$('#boxLobby')));
  console.log('errors', errs);
  await b.close();
})();
