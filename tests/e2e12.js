// Navegador: o tempo da plataforma manda, mesmo quando o JSON importado traz "time": 30.
const { chromium } = require('playwright');
const B = 'http://localhost:5055';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const mk = async (name, vp) => { const p = await (await b.newContext({ viewport: vp, locale: 'pt-BR' })).newPage(); p.on('pageerror', e => { if (!/tailwind/.test(e.message)) errs.push(name + ': ' + e.message); }); p.on('dialog', d => d.accept()); return p; };
  for (const mode of ['arena', 'classic']) {
    const host = await mk('host', { width: 1280, height: 900 });
    await host.goto(B + '/host'); await host.click('text=Criar sala'); await host.waitForSelector('#boxLobby:not(.hidden)');
    // quiz "gerado pelo prompt": todas as perguntas com time 30
    await host.evaluate(async () => {
      const quiz = Array.from({ length: 4 }, (_, i) => ({ block: 'T', topic: 'S', question: `Pergunta ${i + 1}?`, options: ['A', 'B', 'C', 'D'], correct: 0, hint: 'dica', reference: 'p.1', explanation: 'x', time: 30 }));
      await api(`/api/host/${H.code}/settings`, { token: H.token, settings: {}, quiz, quiz_title: 'Gerado' }); await poll();
    });
    await host.click('#ctlConfig'); await host.waitForSelector('#cfgModal:not(.hidden)');
    console.log(mode, '| opção "Respeitar o tempo do quiz" desligada por padrão:', await host.$eval('#sTimeQuiz', e => !e.checked));
    await host.evaluate(() => { sTimer.value = 75; });
    if (mode === 'classic') await host.evaluate(() => cfgMode('classic'));
    await host.evaluate(() => applySettings());
    if (mode === 'classic') await host.waitForURL('**/host/classic');
    await host.waitForFunction(() => ST.settings.timer === 75);
    const code = await host.evaluate(() => H.code);
    const p = await mk('ana', { width: 390, height: 800 }); await p.goto(B + '/join?code=' + code); await p.fill('#nameInput', 'Ana'); await p.click('#joinForm button'); await p.waitForSelector('#boxLobby, #vLobby');
    await host.waitForFunction(() => ST.order && ST.order.length === 1);
    await host.click('#boxLobby button:has(.fa-play), #vLobby button:has(.fa-play)').catch(async () => { await host.evaluate(() => api(`/api/host/${H.code}/start`, { token: H.token })); });
    await p.waitForFunction(() => ST.phase === 'open', null, { timeout: 8000 });
    const d1 = await p.evaluate(() => ({ dur: ST.question.duration, secs: Math.round(ST.question.end - ST.question.start) }));
    console.log(mode, '| 1ª pergunta -> duração:', d1.dur, 's (esperado 75, não 30)');
    // muda o tempo para 120 com o jogo rolando: vale na próxima pergunta
    await host.evaluate(() => api(`/api/host/${H.code}/settings`, { token: H.token, settings: { timer: 120 } }));
    await host.evaluate(() => api(`/api/host/${H.code}/close`, { token: H.token })); await host.evaluate(() => api(`/api/host/${H.code}/next`, { token: H.token }));
    await p.waitForFunction(() => ST.phase === 'open' && ST.qi === 1, null, { timeout: 8000 });
    console.log(mode, '| 2ª pergunta -> duração:', await p.evaluate(() => ST.question.duration), 's (esperado 120)');
    // ligando "Respeitar o tempo do quiz" volta a valer o 30 do arquivo
    await host.evaluate(() => api(`/api/host/${H.code}/settings`, { token: H.token, settings: { time_source: 'quiz' } }));
    await host.evaluate(() => api(`/api/host/${H.code}/close`, { token: H.token })); await host.evaluate(() => api(`/api/host/${H.code}/next`, { token: H.token }));
    await p.waitForFunction(() => ST.phase === 'open' && ST.qi === 2, null, { timeout: 8000 });
    console.log(mode, '| 3ª pergunta (opção ligada) -> duração:', await p.evaluate(() => ST.question.duration), 's (esperado 30)');
  }
  console.log('errors', errs); await b.close();
})();
