// Smoke test de navegador: 1 host + 2 celulares jogando uma partida completa.
const { chromium } = require('playwright');
const B = 'http://localhost:5055';
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const mk = async (name, vp) => { const c = await b.newContext({ viewport: vp, locale: 'pt-BR' }); const p = await c.newPage(); p.on('pageerror', e => { if (!/tailwind/.test(e.message)) errs.push(name + ': ' + e.message); }); return p; };
  const host = await mk('host', { width: 1280, height: 900 });
  await host.goto(B + '/host');
  await host.click('text=Criar sala');
  await host.waitForSelector('#boxLobby:not(.hidden)');
  const code = await host.textContent('#bigCode');
  console.log('code', code);
  const qr = await host.evaluate(() => fetch(document.getElementById('qrImg').src).then(r => r.headers.get('content-type')));
  console.log('qr', qr);

  const phones = [];
  for (const n of ['Ana', 'Beto']) {
    const p = await mk(n, { width: 390, height: 800 });
    await p.goto(B + '/join?code=' + code);          // simula o QR code
    await p.fill('#nameInput', n);
    await p.click('#joinForm button');
    await p.waitForSelector('#boxLobby:not(.hidden)');
    phones.push(p);
  }
  await host.waitForFunction(() => document.getElementById('lobbyN').textContent === '2');
  await host.screenshot({ path: '/tmp/e2e_host_lobby.png' });
  await host.click('text=Iniciar jogo');
  for (const p of phones) await p.waitForSelector('#boxQuestion:not(.hidden)');
  await host.waitForSelector('#boxGame:not(.hidden)');

  // descobre a resposta certa pelo banco (teste) e Ana responde primeiro
  const correct = await host.evaluate(async code => (await (await fetch('/_t/' + code)).json()).correct).catch(() => null);
  const [ana, beto] = phones;
  // sem endpoint de teste: tenta as opções até acertar (cada jogador tem 1 tentativa => usa Ana com 0..3 em salas novas é inviável) -> usa a explicação ao final
  await ana.click('#qOptions button:nth-child(1)');
  await beto.click('#qOptions button:nth-child(2)');
  await host.waitForSelector('#gWinner:not(.hidden)', { timeout: 8000 });   // todos responderam -> fecha sozinho
  console.log('winner banner:', (await host.textContent('#gWinner')).trim());
  console.log('ana status:', (await ana.textContent('#qStatus')).trim());
  await ana.screenshot({ path: '/tmp/e2e_phone_reveal.png' });
  await host.screenshot({ path: '/tmp/e2e_host_reveal.png' });

  // libera poderes e testa dado + carta + ataque pela UI
  const { execSync } = require('child_process');
  const unlock = () => execSync(`python3 -c "import sqlite3,json;c=sqlite3.connect('/tmp/e2e.db');r=json.loads(c.execute('select data from rooms where code=?',('${code}',)).fetchone()[0]);[p.update(correct=99) for p in r['players'].values()];c.execute('update rooms set data=? where code=?',(json.dumps(r),'${code}'));c.commit()"`);
  unlock();
  await host.click('#ctlNext');
  for (const p of phones) await p.waitForFunction(() => document.getElementById('qOptions').children.length > 0 && !document.querySelector('#qOptions button').disabled || false, null, { timeout: 8000 }).catch(()=>{});
  await ana.waitForTimeout(1300);
  // dado pela UI
  await ana.click('#powerGrid button:nth-child(3)');
  await ana.click('#diceBtn');
  await ana.waitForSelector('#diceResult:not(.hidden)', { timeout: 6000 });
  console.log('dice:', (await ana.textContent('#diceResTitle')).trim(), '|', (await ana.textContent('#diceResDesc')).trim());
  await ana.screenshot({ path: '/tmp/e2e_dice.png' });
  await ana.click('text=Fechar');
  // carta
  await ana.click('#powerGrid button:nth-child(5)');
  await ana.waitForSelector('#cardGrid .flip-card-inner');
  await ana.click('#cardGrid > div:nth-child(2)');
  await ana.waitForSelector('#cardGrid .flipped', { timeout: 4000 });
  await ana.waitForTimeout(1200);
  console.log('cards flipped:', await ana.$$eval('#cardGrid .flipped', e => e.length));
  await ana.screenshot({ path: '/tmp/e2e_cards.png' });
  await ana.waitForSelector('#cardModal.hidden', { state: 'attached', timeout: 5000 });
  // bloqueio em Beto, depois roubo
  await ana.click('#powerGrid button:nth-child(7)');
  await ana.click('#atkList button');
  await beto.waitForTimeout(1500);
  console.log('beto notice:', (await beto.textContent('#notices')).trim());
  await ana.click('#powerGrid button:nth-child(9)');
  await ana.click('#atkList button');
  await ana.waitForSelector('#atkList button');
  await ana.screenshot({ path: '/tmp/e2e_steal.png' });
  await ana.click('#atkList button');
  await ana.waitForTimeout(1300);
  console.log('ana 5050 charges badge:', (await ana.textContent('#powerGrid button:nth-child(1) .n')).trim(), '| beto feed:', (await beto.textContent('#feed li:first-child')).trim());
  console.log('errors', errs);
  await b.close();
})();
