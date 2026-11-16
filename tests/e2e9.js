// Navegador: botão Sair e expiração da sessão (5 min sem conexão).
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const B = 'http://localhost:5055', DB = '/tmp/e2e.db';
const patch = (code, expr) => execFileSync('python3', ['-c', `import sqlite3,json,time;c=sqlite3.connect('${DB}');r=json.loads(c.execute('select data from rooms where code=?',('${code}',)).fetchone()[0]);${expr};c.execute('update rooms set data=? where code=?',(json.dumps(r,separators=(',',':')),'${code}'));c.commit()`]);
(async () => {
  const b = await chromium.launch(); const errs = [];
  const mk = async (name, vp) => { const c = await b.newContext({ viewport: vp, locale: 'pt-BR' }); const p = await c.newPage(); p.on('pageerror', e => { if (!/tailwind/.test(e.message)) errs.push(name + ': ' + e.message); }); p.on('dialog', d => d.accept()); return p; };
  const mkRoom = async (host) => { await host.goto(B + '/host'); await host.click('text=Criar sala'); await host.waitForSelector('#boxLobby:not(.hidden)'); return (await host.textContent('#bigCode')).trim(); };
  const mkP = async (code, n) => { const p = await mk(n, { width: 390, height: 800 }); await p.goto(B + '/join?code=' + code); await p.fill('#nameInput', n); await p.click('#joinForm button'); await p.waitForSelector('#boxLobby:not(.hidden)'); return p; };

  // 1) participante clica em Sair
  const host = await mk('host', { width: 1280, height: 900 });
  const code = await mkRoom(host);
  console.log('botão Sair no telão:', (await host.textContent('#hdLogout')).trim());
  const ana = await mkP(code, 'Ana'), beto = await mkP(code, 'Beto');
  console.log('botão Sair no celular:', (await beto.textContent('#leaveBtn')).trim());
  await beto.$eval('#leaveBtn', e => e.click());
  await beto.waitForURL(B + '/', { timeout: 8000 });
  console.log('Beto voltou para a entrada; sessão apagada:', await beto.evaluate((c) => localStorage.getItem('arena_player_' + c) === null, code));
  await host.waitForTimeout(1600);
  console.log('telão -> jogadores:', await host.evaluate(() => ST.board.map(x => x.name).join(',')), '| feed:', await host.evaluate(() => ST.events.map(eventText).find(x => /saiu/.test(x))));

  // 2) Ana fica 6 min sem conexão (simulado no banco) -> é desconectada
  patch(code, "r['players'][list(r['players'])[0]]['seen']=time.time()-360");
  await ana.waitForSelector('body:has-text("5 minutos sem conexão")', { timeout: 8000 });
  console.log('Ana vê:', (await ana.textContent('body')).trim().slice(0, 95), '...');
  await host.waitForTimeout(1500);
  console.log('telão -> jogadores:', await host.evaluate(() => ST.board.length), '| feed:', await host.evaluate(() => ST.events.map(eventText).find(x => /sem conexão/.test(x))));

  // 3) organizador clica em Sair: encerra a sala para todos
  const host2 = await mk('host2', { width: 1280, height: 900 });
  const code2 = await mkRoom(host2);
  const caio = await mkP(code2, 'Caio');
  await host2.$eval('#hdLogout', e => e.click());
  await host2.waitForURL(B + '/', { timeout: 8000 });
  console.log('organizador voltou para a entrada; sessão apagada:', await host2.evaluate(() => localStorage.getItem('arena_host') === null));
  await caio.waitForSelector('body:has-text("sala foi encerrada")', { timeout: 8000 });
  console.log('Caio vê:', (await caio.textContent('body')).trim().slice(0, 90));

  // 4) organizador some por 6 min -> ao voltar, a sala já foi encerrada
  const host3 = await mk('host3', { width: 1280, height: 900 });
  const code3 = await mkRoom(host3);
  const dani = await mkP(code3, 'Dani');
  patch(code3, "r['host_seen']=time.time()-360");
  await dani.waitForSelector('body:has-text("sala foi encerrada")', { timeout: 8000 });
  await host3.waitForURL('**/host?ended=1', { timeout: 8000 });
  console.log('organizador ausente: redirecionado para criar nova sala; aviso visível:', await host3.$eval('#endedNote', e => !e.classList.contains('hidden')));
  console.log('Dani vê:', (await dani.textContent('body')).trim().slice(0, 90));

  // 5) voltar dentro de 5 min mantém a sessão
  const host4 = await mk('host4', { width: 1280, height: 900 });
  const code4 = await mkRoom(host4);
  const eva = await mkP(code4, 'Eva');
  patch(code4, "r['host_seen']=time.time()-240;r['players'][list(r['players'])[0]]['seen']=time.time()-240");
  await host4.reload(); await host4.waitForSelector('#boxLobby:not(.hidden)'); await eva.reload(); await eva.waitForSelector('#boxLobby:not(.hidden)');
  console.log('voltou em 4 min: organizador e Eva seguem na sala:', await host4.evaluate(() => ST.board.map(x => x.name).join(',')));
  console.log('errors', errs);
  await b.close();
})();
