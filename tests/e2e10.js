// Navegador: "chamar atenção" nos dois modos, inclusive quando o único rival sai por inatividade.
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const B = 'http://localhost:5055', DB = '/tmp/e2e.db';
const post = (u, d) => fetch(B + u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json());
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const mode of ['arena', 'classic']) {
    const room = await post('/api/room', { settings: { mode } });
    const ps = []; for (const n of ['Ana', 'Beto']) ps.push(await post('/api/join', { code: room.code, name: n }));
    const phone = async (pl) => {
      const p = await (await b.newContext({ viewport: { width: 390, height: 800 }, locale: 'pt-BR' })).newPage();
      p.on('pageerror', e => { if (!/tailwind/.test(e.message)) errs.push(mode + ': ' + e.message); });
      await p.addInitScript(([k, v]) => localStorage.setItem(k, v), ['arena_player_' + room.code, JSON.stringify({ pid: pl.pid, token: pl.token })]);
      await p.goto(`${B}/play?code=${room.code}`); await p.waitForSelector('#nudgeBtn:not(.hidden)', { timeout: 8000 }); return p;
    };
    const ana = await phone(ps[0]), beto = await phone(ps[1]);
    await ana.$eval('#nudgeBtn', e => e.click()); await ana.waitForSelector('#nudgeModal:not(.hidden)');
    await ana.$eval('#nudgeModal [data-p]', e => e.click());
    await beto.waitForSelector('.nudge-flash', { timeout: 6000 });
    console.log(mode, '| com 2 jogadores, Beto recebeu:', (await beto.textContent('.nudge-flash')).trim());
    // Beto fica 6 min sem conexão (simulado no banco) e sai da sala
    execFileSync('python3', ['-c', `import sqlite3,json,time;c=sqlite3.connect('${DB}');r=json.loads(c.execute('select data from rooms where code=?',('${room.code}',)).fetchone()[0]);[p.update(seen=time.time()-400) for p in r['players'].values() if p['name']=='Beto'];c.execute('update rooms set data=? where code=?',(json.dumps(r,separators=(',',':')),'${room.code}'));c.commit()`]);
    await ana.waitForFunction(() => ST.targets.length === 1, null, { timeout: 8000 });
    console.log(mode, '| sem rival -> botão visível:', await ana.$eval('#nudgeBtn', e => !e.classList.contains('hidden')), '| esmaecido:', await ana.$eval('#nudgeBtn', e => e.classList.contains('opacity-50')));
    await ana.evaluate(() => doNudge()); await ana.waitForTimeout(400);
    console.log(mode, '| aviso:', (await ana.evaluate(() => document.body.innerText)).includes('Precisa de outro participante'));
    await beto.waitForSelector('body:has-text("5 minutos sem conexão")', { timeout: 8000 });
    console.log(mode, '| Beto vê o aviso de sessão encerrada');
  }
  console.log('errors', errs); await b.close();
})();
