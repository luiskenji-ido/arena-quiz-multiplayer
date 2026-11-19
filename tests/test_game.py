import os, sys, tempfile, time
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ['QUIZ_DB'] = tempfile.mktemp(suffix='.db')
import pytest
import app as appmod
import game


@pytest.fixture()
def client():
    appmod.app.testing = True
    return appmod.app.test_client()


def mk(client, n=3, **settings):
    r = client.post('/api/room', json={'settings': settings}).get_json()
    code, ht = r['code'], r['host_token']
    players = []
    for i in range(n):
        j = client.post('/api/join', json={'code': code, 'name': f'P{i+1}'}).get_json()
        players.append(j)
    return code, ht, players


def state(client, code, p=None, ht=None):
    if ht:
        return client.get(f'/api/state/{code}?role=host&token={ht}').get_json()
    return client.get(f'/api/state/{code}?pid={p["pid"]}&token={p["token"]}').get_json()


def host(client, code, ht, action, **kw):
    return client.post(f'/api/host/{code}/{action}', json={'token': ht, **kw})


def ans(client, code, p, idx):
    return client.post('/api/answer', json={'code': code, 'pid': p['pid'], 'token': p['token'], 'idx': idx})


def power(client, code, p, power_, **kw):
    return client.post('/api/power', json={'code': code, 'pid': p['pid'], 'token': p['token'], 'power': power_, **kw})


def correct_idx(code):
    room = appmod.with_room(code, lambda r: r)
    return room['questions'][room['qi']]['correct']


def set_room(code, fn):
    appmod.with_room(code, fn)


def test_only_first_correct_scores(client):
    code, ht, (a, b, c) = mk(client)
    assert host(client, code, ht, 'start').status_code == 200
    ci = correct_idx(code)
    assert ans(client, code, a, ci).get_json()['points'] > 0
    rb = ans(client, code, b, ci).get_json()
    assert rb.get('late') and 'points' not in rb
    st = state(client, code, ht=ht)
    sc = {r['name']: r['score'] for r in st['board']}
    assert sc['P1'] > 0 and sc['P2'] == 0
    assert ans(client, code, a, ci).status_code == 400          # já respondeu


def test_wrong_locks_player_and_no_leak(client):
    code, ht, (a, b, c) = mk(client)
    host(client, code, ht, 'start')
    ci = correct_idx(code)
    pv = state(client, code, a)
    assert 'correct' not in pv['question'] and 'correct' not in state(client, code, ht=ht)['question']
    assert ans(client, code, a, (ci + 1) % 4).get_json()['correct'] is False
    assert ans(client, code, a, ci).status_code == 400


def test_timer_closes_automatically(client):
    code, ht, (a, b, c) = mk(client, timer=5)
    host(client, code, ht, 'start')
    set_room(code, lambda r: r['q'].__setitem__('end', time.time() - 1))
    st = state(client, code, a)
    assert st['phase'] == 'reveal' and st['question']['correct'] in range(4)
    r = ans(client, code, a, 0)
    assert r.status_code == 400


def test_auto_close_when_everyone_answered(client):
    code, ht, (a, b, c) = mk(client)
    host(client, code, ht, 'start')
    ci = correct_idx(code)
    for p in (a, b, c):
        ans(client, code, p, (ci + 1) % 4)
    assert state(client, code, ht=ht)['phase'] == 'reveal'


def test_auth(client):
    code, ht, (a, b, c) = mk(client)
    assert client.get(f'/api/state/{code}?role=host&token=x').status_code == 403
    assert client.get(f'/api/state/{code}?pid={a["pid"]}&token=x').status_code == 403
    assert host(client, code, 'bad', 'start').status_code == 403
    assert client.get('/api/state/ZZZZ?role=host&token=x').status_code == 404


def unlock_all(code):
    def fn(r):
        for p in r['players'].values():
            p['correct'] = 99
    set_room(code, fn)


def test_attack_powers(client):
    code, ht, (a, b, c) = mk(client)
    unlock_all(code)
    host(client, code, ht, 'start')
    # bloqueio: b perde a PRÓXIMA pergunta
    assert power(client, code, a, 'block', target=b['pid']).status_code == 200
    assert power(client, code, a, 'block', target=b['pid']).get_json()['error'] == 'used_this_round'
    # lacre em c
    assert power(client, code, a, 'seal', target=c['pid']).status_code == 200
    assert power(client, code, c, 'p5050').get_json()['error'] == 'sealed'
    # armadilha em c, roubo em c
    assert power(client, code, a, 'trap', target=c['pid']).status_code == 200
    r = power(client, code, a, 'steal', target=c['pid'], steal='p5050').get_json()
    assert r['stolen'] == 'p5050'
    me = state(client, code, a)['me']
    assert me['powers']['p5050'] == 3 and me['powers']['block'] == 1
    assert power(client, code, a, 'block', target=a['pid']).status_code == 400   # em si mesmo
    # c erra e cai na armadilha (score 0 -> fica 0, mas armadilha some)
    set_room(code, lambda r: r['players'][c['pid']].__setitem__('score', 5000))
    set_room(code, lambda r: r['players'][c['pid']].__setitem__('sealed', 0))
    ci = correct_idx(code)
    ans(client, code, c, (ci + 1) % 4)
    assert state(client, code, c)['me']['score'] == 4000
    assert state(client, code, c)['me']['trap'] is False
    # próxima pergunta: b está bloqueado; lacre de c ainda vale 1 pergunta?
    host(client, code, ht, 'close')
    host(client, code, ht, 'next')
    assert state(client, code, b)['question']['status'] == 'blocked'
    assert ans(client, code, b, 0).get_json()['error'] == 'blocked'


def test_seal_lasts_two_rounds(client):
    code, ht, (a, b, c) = mk(client)
    unlock_all(code)
    host(client, code, ht, 'start')
    power(client, code, a, 'seal', target=b['pid'])
    host(client, code, ht, 'close')
    assert state(client, code, b)['me']['sealed'] == 1
    host(client, code, ht, 'next')
    host(client, code, ht, 'close')
    assert state(client, code, b)['me']['sealed'] == 0


def test_self_powers_dice_cards_5050(client):
    code, ht, (a, b, c) = mk(client)
    unlock_all(code)
    host(client, code, ht, 'start')
    r = power(client, code, a, 'p5050').get_json()
    assert len(r['eliminated']) == 2
    el = state(client, code, a)['question']['elim']
    assert len(el) == 2 and ans(client, code, a, el[0]).get_json()['error'] == 'eliminated'
    d = power(client, code, b, 'dice').get_json()
    assert 1 <= d['roll'] <= 6
    # carta: abre, escolhe, não vaza antes
    o = power(client, code, c, 'card', stage='open').get_json()
    assert o == {'cards': 4}
    pk = power(client, code, c, 'card', stage='pick', card_idx=1).get_json()
    assert sorted(pk['deck']) == sorted(game.CARD_IDS)
    assert state(client, code, c)['me']['powers']['card'] == 1


def test_all_in_double_and_shield(client):
    code, ht, (a, b, c) = mk(client)
    unlock_all(code)
    host(client, code, ht, 'start')
    def fn(r):
        m = r['q']['mods']
        m[a['pid']] = {'allin': True}
        m[b['pid']] = {'shield': True}
    set_room(code, fn)
    ci = correct_idx(code)
    rb = ans(client, code, b, (ci + 1) % 4).get_json()
    assert rb.get('absorbed')
    pts = ans(client, code, a, ci).get_json()['points']
    assert pts >= 3 * 500 * 2
    assert ans(client, code, b, ci).get_json().get('late')


def test_locked_power_and_progress_unlock(client):
    code, ht, (a, b, c) = mk(client)
    host(client, code, ht, 'start')
    assert power(client, code, a, 'dice').get_json()['error'] == 'locked'
    ci = correct_idx(code)
    ans(client, code, a, ci)
    assert state(client, code, a)['me']['correct'] == 1


def test_full_game_finishes_and_restart(client):
    code, ht, (a, b, c) = mk(client)
    host(client, code, ht, 'start')
    total = state(client, code, ht=ht)['total']
    for _ in range(total):
        host(client, code, ht, 'close')
        host(client, code, ht, 'next')
    assert state(client, code, ht=ht)['phase'] == 'finished'
    host(client, code, ht, 'restart')
    assert state(client, code, ht=ht)['phase'] == 'lobby'


def test_import_quiz_and_validation(client):
    bad = client.post('/api/room', json={'quiz': [{'question': 'x', 'options': ['a'], 'correct': 0}]})
    assert bad.status_code == 400
    ok = client.post('/api/room', json={'quiz': '```json\n[{"question":"q?","options":["a","b"],"correct":1}]\n```'})
    assert ok.status_code == 200


def test_qr_and_pages(client):
    code, ht, _ = mk(client, n=0)
    r = client.get(f'/qr/{code}.svg')
    assert r.status_code == 200 and b'<svg' in r.data
    for path in ('/', '/host', '/play', f'/join?code={code}'):
        assert client.get(path, follow_redirects=True).status_code == 200


def test_duplicate_names(client):
    code, ht, _ = mk(client, n=0)
    names = [client.post('/api/join', json={'code': code, 'name': 'Ana'}).get_json()['name'] for _ in range(3)]
    assert len(set(names)) == 3


# ---------------- modo clássico, templates, quiz ----------------
def test_classic_mode_everyone_scores_by_speed(client):
    code, ht, (a, b, c) = mk(client, mode='classic', classic_points=1000)
    host(client, code, ht, 'start')
    ci = correct_idx(code)
    ra = ans(client, code, a, ci).get_json()
    assert ra == {'accepted': True}                             # não revela acerto antes do fim
    time.sleep(0.05)
    ans(client, code, b, ci)
    ans(client, code, c, (ci + 1) % 4)
    assert state(client, code, ht=ht)['phase'] == 'reveal'     # todos responderam
    pa, pb, pc = (state(client, code, p)['question']['my_points'] for p in (a, b, c))
    assert 500 < pb <= pa <= 1000 and pc == 0                   # os dois acertos pontuam
    st = state(client, code, a)
    assert st['question']['dist'][ci] == 2 and sum(st['question']['dist']) == 3
    assert st['my_rank'] == 1


def test_classic_streak_bonus_and_no_powers(client):
    code, ht, (a, b) = mk(client, n=2, mode='classic')
    host(client, code, ht, 'start')
    assert power(client, code, a, 'dice').get_json()['error'] == 'powers_off'
    ans(client, code, a, correct_idx(code))
    ans(client, code, b, (correct_idx(code) + 1) % 4)
    first = state(client, code, a)['question']['my_points']
    host(client, code, ht, 'next')
    ans(client, code, a, correct_idx(code))
    ans(client, code, b, (correct_idx(code) + 1) % 4)
    second = state(client, code, a)['question']['my_points']
    assert second >= first + 90                                  # +100 de sequência (com leve variação de tempo)


def test_per_question_time_image_and_title(client):
    quiz = [{'question': 'q1?', 'options': ['a', 'b'], 'correct': 0, 'time': 12, 'image': 'https://x.test/i.png'},
            {'question': 'q2?', 'options': ['a', 'b'], 'correct': 1, 'time': 3, 'image': 'javascript:alert(1)'}]
    r = client.post('/api/room', json={'quiz': quiz, 'quiz_title': 'Meu quiz'}).get_json()
    code, ht = r['code'], r['host_token']
    lob = state(client, code, ht=ht)
    assert lob['quiz_title'] == 'Meu quiz' and len(lob['quiz']) == 2
    assert lob['quiz'][1]['time'] is None and lob['quiz'][1]['image'] == ''     # tempo inválido e imagem insegura descartados
    j = client.post('/api/join', json={'code': code, 'name': 'Zé'}).get_json()
    host(client, code, ht, 'start')
    q = state(client, code, j)['question']
    assert round(q['end'] - q['start']) == 12 and q['image'].startswith('https://')


def test_templates_api_and_apply(client):
    lst = client.get('/api/templates?lang=en').get_json()
    ids = {t['id'] for t in lst}
    assert {'general', 'tech', 'science', 'geo', 'games', 'blank'} <= ids
    for lang in ('pt', 'en', 'es'):
        for t in client.get(f'/api/templates?lang={lang}').get_json():
            qs = client.get(f'/api/templates/{t["id"]}?lang={lang}').get_json()['questions']
            assert len(qs) == t['count'] and game.normalize_quiz(qs)    # todos válidos
            assert len(qs) >= 5 or t['id'] == 'blank'
    cats = {t['id']: t['category'] for t in lst}
    assert cats['security'] == 'corp' and cats['general'] == 'fun'
    pulse = client.get('/api/templates/pulse?lang=pt').get_json()['questions']
    assert all(q.get('poll') for q in pulse)
    assert client.get('/api/templates/nope').status_code == 404
    code, ht, _ = mk(client, n=0)
    qs = client.get('/api/templates/tech?lang=es').get_json()
    r = host(client, code, ht, 'settings', quiz=qs['questions'], quiz_title=qs['name'], settings={'mode': 'classic'})
    assert r.status_code == 200
    st = state(client, code, ht=ht)
    assert st['settings']['mode'] == 'classic' and st['quiz_title'] == 'Tecnología e Internet' and st['total'] == 8


def test_settings_during_game_are_limited(client):
    code, ht, _ = mk(client)
    host(client, code, ht, 'start')
    assert host(client, code, ht, 'settings', settings={'timer': 10, 'lang': 'en'}).status_code == 200
    s = state(client, code, ht=ht)['settings']
    assert s['timer'] == 10 and s['lang'] == 'pt'                # idioma do quiz só muda no lobby


# ---------------- controles do apresentador, placar, poderes, enquete ----------------
def test_pause_resume_blocks_answers_and_extends_time(client):
    code, ht, (a, b) = mk(client, n=2)
    host(client, code, ht, 'start')
    assert host(client, code, ht, 'pause').status_code == 200
    q = state(client, code, a)['question']
    assert q['paused'] and q['remaining'] > 20
    assert ans(client, code, a, 0).get_json()['error'] == 'paused'
    set_room(code, lambda r: r['q'].__setitem__('paused_at', r['q']['paused_at'] - 100))   # 100 s pausado
    set_room(code, lambda r: r['q'].__setitem__('end', time.time() - 1))                  # tempo "acabou" durante a pausa
    assert state(client, code, a)['phase'] == 'open'                                       # pausa segura o relógio
    host(client, code, ht, 'resume')
    st = state(client, code, a)
    assert st['phase'] == 'open' and st['question']['end'] > time.time() + 90


def test_finish_and_restart(client):
    code, ht, _ = mk(client, n=1)
    assert host(client, code, ht, 'finish').status_code == 400        # não dá para finalizar no lobby
    host(client, code, ht, 'start')
    host(client, code, ht, 'finish')
    assert state(client, code, ht=ht)['phase'] == 'finished'
    host(client, code, ht, 'restart')
    assert state(client, code, ht=ht)['phase'] == 'lobby'


def test_board_modes_hide_scores_from_players(client):
    code, ht, (a, b) = mk(client, n=2, board_mode='end')
    host(client, code, ht, 'start')
    st = state(client, code, a)
    assert st['board'] == [] and st['my_rank'] is None and len(st['targets']) == 2
    assert 'score' not in st['targets'][0]
    assert len(state(client, code, ht=ht)['board']) == 2          # o apresentador sempre recebe
    host(client, code, ht, 'settings', settings={'board_mode': 'reveal'})   # dá para mudar no meio do jogo
    host(client, code, ht, 'close')
    assert len(state(client, code, a)['board']) == 2
    host(client, code, ht, 'finish')
    assert len(state(client, code, b)['board']) == 2


def test_powers_config_disable_and_thresholds(client):
    code, ht, (a, b) = mk(client, n=2, powers_on={'block': False}, thresholds={'p5050': 0, 'dice': 9})
    host(client, code, ht, 'start')
    me = state(client, code, a)['me']
    assert me['unlocked']['p5050'] and not me['unlocked']['dice'] and me['powers_on']['block'] is False
    assert power(client, code, a, 'block', target=b['pid']).get_json()['error'] == 'power_off'
    assert power(client, code, a, 'p5050').status_code == 200
    # mudança no meio do jogo vale; troca de modo/cargas fica para o lobby
    host(client, code, ht, 'settings', settings={'powers_on': {'block': True}, 'mode': 'classic', 'charges': 9})
    s = state(client, code, ht=ht)['settings']
    assert s['powers_on']['block'] and s['mode'] == 'arena' and s['charges'] == 2
    assert host(client, code, ht, 'settings', quiz=[{'question': 'x', 'options': ['a', 'b'], 'correct': 0}]).status_code == 400


def test_poll_question(client):
    quiz = [{'question': 'Como foi?', 'options': ['Bom', 'Ruim'], 'poll': True},
            {'question': 'q', 'options': ['a', 'b'], 'correct': 0}]
    for mode in ('arena', 'classic'):
        r = client.post('/api/room', json={'quiz': quiz, 'settings': {'mode': mode}}).get_json()
        code, ht = r['code'], r['host_token']
        a = client.post('/api/join', json={'code': code, 'name': 'A'}).get_json()
        b = client.post('/api/join', json={'code': code, 'name': 'B'}).get_json()
        set_room(code, lambda r: [p.update(correct=99) for p in r['players'].values()])
        host(client, code, ht, 'start')
        assert state(client, code, a)['question']['poll'] is True
        if mode == 'arena':
            assert power(client, code, a, 'p5050').get_json()['error'] == 'poll_question'
        assert ans(client, code, a, 0).get_json() == {'accepted': True}
        assert state(client, code, a)['question']['status'] == 'voted'
        ans(client, code, b, 0)
        st = state(client, code, ht=ht)
        assert st['phase'] == 'reveal' and st['question']['dist'] == [2, 0] and st['question']['correct'] is None
        assert all(r['score'] == 0 for r in st['board'])


def test_play_page_follows_room_mode(client):
    r = client.post('/api/room', json={'settings': {'mode': 'classic'}}).get_json()
    assert b'play_classic' in client.get('/play?code=' + r['code']).data
    r2 = client.post('/api/room', json={}).get_json()
    assert b'play_classic' not in client.get('/play?code=' + r2['code']).data
    assert client.get('/host/classic').status_code == 200


# ---------------- salas públicas e avanço automático ----------------
def test_private_room_is_not_listed_and_rejects_requests(client):
    code, ht, _ = mk(client, n=0)
    assert all(r['name'] != 'Privada X' for r in client.get('/api/public').get_json())
    st = state(client, code, ht=ht)
    assert st['settings']['visibility'] == 'private'
    room = appmod.with_room(code, lambda r: r)
    assert client.post(f"/api/public/{room['pub_id']}/request", json={'name': 'Zé'}).status_code == 404


def test_public_room_request_approve_and_deny(client):
    code, ht, _ = mk(client, n=0, visibility='public', room_name='Treinamento RH')
    state(client, code, ht=ht)
    lst = client.get('/api/public').get_json()
    me = next(r for r in lst if r['name'] == 'Treinamento RH')
    assert 'code' not in me and me['players'] == 0 and me['phase'] == 'lobby'   # o código não vaza na lista
    r1 = client.post(f"/api/public/{me['id']}/request", json={'name': 'Ana'}).get_json()
    r2 = client.post(f"/api/public/{me['id']}/request", json={'name': 'Beto'}).get_json()
    pend = state(client, code, ht=ht)['requests']
    assert [p['name'] for p in pend] == ['Ana', 'Beto']
    s1 = client.get(f"/api/public/{me['id']}/request/{r1['rid']}?secret={r1['secret']}").get_json()
    assert s1['status'] == 'pending' and 'code' not in s1
    assert client.get(f"/api/public/{me['id']}/request/{r1['rid']}?secret=errado").status_code == 404
    host(client, code, ht, 'approve', rid=r1['rid'])
    host(client, code, ht, 'deny', rid=r2['rid'])
    s1 = client.get(f"/api/public/{me['id']}/request/{r1['rid']}?secret={r1['secret']}").get_json()
    s2 = client.get(f"/api/public/{me['id']}/request/{r2['rid']}?secret={r2['secret']}").get_json()
    assert s1['status'] == 'approved' and s1['code'] == code and s2['status'] == 'denied' and 'code' not in s2
    assert state(client, code, {'pid': s1['pid'], 'token': s1['token']})['me']['name'] == 'Ana'   # já entra na sala
    assert state(client, code, ht=ht)['requests'] == []
    assert host(client, code, ht, 'approve', rid=r1['rid']).status_code == 404               # não aprova duas vezes
    # virou privada -> some da lista e não aceita novos pedidos
    host(client, code, ht, 'settings', settings={'visibility': 'private'})
    assert all(r['id'] != me['id'] for r in client.get('/api/public').get_json())


def test_public_room_hidden_when_host_is_gone(client):
    code, ht, _ = mk(client, n=0, visibility='public', room_name='Sumiu')
    set_room(code, lambda r: r.__setitem__('host_seen', time.time() - 999))
    assert all(r['name'] != 'Sumiu' for r in client.get('/api/public').get_json())


def test_auto_next_with_delay_and_hold(client):
    code, ht, (a,) = mk(client, n=1, auto_next=True, auto_delay=5)
    host(client, code, ht, 'start')
    host(client, code, ht, 'close')
    q = state(client, code, a)['question']
    assert 4.5 < q['next_at'] - q['start'] - (time.time() - q['start']) <= 5.1        # próxima em ~5 s
    set_room(code, lambda r: r['q'].__setitem__('reveal_at', time.time() - 6))
    st = state(client, code, ht=ht)
    assert st['phase'] == 'open' and st['qi'] == 1                                      # avançou sozinho
    host(client, code, ht, 'close')
    host(client, code, ht, 'pause')                                                     # segura o avanço
    set_room(code, lambda r: r['q'].__setitem__('reveal_at', time.time() - 60))
    st = state(client, code, ht=ht)
    assert st['phase'] == 'reveal' and st['auto_hold'] and 'next_at' not in st['question']
    host(client, code, ht, 'resume')
    assert 'next_at' in state(client, code, ht=ht)['question']
    host(client, code, ht, 'settings', settings={'auto_next': False})                   # dá para desligar no meio
    assert 'next_at' not in state(client, code, ht=ht)['question']


# ---------------- por vez (ordem dos participantes) ----------------
def test_turns_rotate_only_turn_player_answers(client):
    code, ht, (a, b, c) = mk(client, answer_order='turns')
    host(client, code, ht, 'start')
    q = state(client, code, b)['question']
    assert q['turn']['id'] == a['pid'] and q['status'] == 'spectator' and q['eligible'] == 1
    assert ans(client, code, b, 0).get_json()['error'] == 'not_your_turn'
    ci = correct_idx(code)
    assert ans(client, code, a, (ci + 1) % 4).get_json()['correct'] is False
    st = state(client, code, c)                                  # resposta da vez fecha a pergunta
    assert st['phase'] == 'reveal' and st['question']['turn_pick'] == (ci + 1) % 4
    host(client, code, ht, 'next')
    assert state(client, code, a)['question']['turn']['id'] == b['pid']
    assert state(client, code, a)['question']['status'] == 'spectator'
    host(client, code, ht, 'close'); host(client, code, ht, 'next')
    assert state(client, code, a)['question']['turn']['id'] == c['pid']
    host(client, code, ht, 'close'); host(client, code, ht, 'next')
    assert state(client, code, a)['question']['turn']['id'] == a['pid']       # volta para o primeiro


def test_turns_block_skips_turn_and_powers_only_on_own_turn(client):
    code, ht, (a, b, c) = mk(client, answer_order='turns')
    unlock_all(code)
    host(client, code, ht, 'start')                       # vez de A
    assert power(client, code, b, 'p5050').get_json()['error'] == 'not_your_turn'
    assert power(client, code, b, 'block', target=c['pid']).status_code == 200   # ataque vale fora da vez
    r = power(client, code, a, 'p5050').get_json()
    assert len(state(client, code, c)['question']['turn_elim']) == 2             # quem assiste vê o 50/50
    host(client, code, ht, 'close'); host(client, code, ht, 'next')               # vez de B
    host(client, code, ht, 'close'); host(client, code, ht, 'next')               # C bloqueado -> pula para A
    assert state(client, code, a)['question']['turn']['id'] == a['pid']
    assert any(e['k'] == 'ev_turn_skip' for e in state(client, code, ht=ht)['events'])


def test_turns_classic_scoring_and_host_set_turn(client):
    code, ht, (a, b) = mk(client, n=2, mode='classic', answer_order='turns')
    host(client, code, ht, 'start')
    assert host(client, code, ht, 'set_turn', pid=b['pid']).status_code == 200   # apresentador passa a vez
    assert state(client, code, a)['question']['turn']['id'] == b['pid']
    ans(client, code, b, correct_idx(code))
    st = state(client, code, b)
    assert st['phase'] == 'reveal' and st['question']['my_points'] > 0
    assert state(client, code, a)['question']['my_points'] == 0


def test_turn_timeout_resets_streak(client):
    code, ht, (a, b) = mk(client, n=2, answer_order='turns')
    set_room(code, lambda r: r['players'][a['pid']].__setitem__('streak', 4))
    host(client, code, ht, 'start')
    set_room(code, lambda r: r['q'].__setitem__('end', time.time() - 1))
    st = state(client, code, a)
    assert st['phase'] == 'reveal' and st['me']['streak'] == 0
    assert state(client, code, ht=ht)['order'][0]['name'] == 'P1'


# ---------------- chamar atenção, reações, música, temas ----------------
def nudge(client, code, p, target, kind='horn'):
    return client.post('/api/nudge', json={'code': code, 'pid': p['pid'], 'token': p['token'], 'target': target, 'kind': kind})


def react(client, code, p, emoji):
    return client.post('/api/react', json={'code': code, 'pid': p['pid'], 'token': p['token'], 'emoji': emoji})


def test_nudge_limit_and_inbox(client):
    code, ht, (a, b) = mk(client, n=2)
    assert nudge(client, code, a, a['pid']).status_code == 400            # em si mesmo, não
    assert nudge(client, code, a, b['pid'], 'scare').get_json() == {'left': 1}
    assert nudge(client, code, a, b['pid'], 'siren').get_json() == {'left': 0}
    assert nudge(client, code, a, b['pid']).get_json()['error'] == 'no_nudges'
    inbox = state(client, code, b)['me']['inbox']
    assert [m['kind'] for m in inbox] == ['scare', 'siren'] and inbox[0]['from'] == 'P1'
    assert state(client, code, a)['me']['nudges_left'] == 0
    assert any(e['k'] == 'ev_nudge' for e in state(client, code, ht=ht)['events'])
    host(client, code, ht, 'settings', settings={'nudge_limit': 3})       # organizador aumenta o limite
    assert state(client, code, a)['me']['nudges_left'] == 1
    host(client, code, ht, 'settings', settings={'nudge_limit': 0})       # ou desliga
    assert nudge(client, code, b, a['pid']).get_json()['error'] == 'no_nudges'


def test_reactions_whitelist_rate_limit_and_toggle(client):
    code, ht, (a, b) = mk(client, n=2)
    assert react(client, code, a, '🤣').status_code == 200
    assert react(client, code, a, '😡').status_code == 429                # rápido demais
    assert react(client, code, b, '<script>').status_code == 400          # só emojis da lista
    assert react(client, code, b, 'HAHAHA').status_code == 200
    rs = state(client, code, ht=ht)['reactions']
    assert [(r['name'], r['emoji']) for r in rs] == [('P1', '🤣'), ('P2', 'HAHAHA')]
    host(client, code, ht, 'settings', settings={'reactions_on': False})
    time.sleep(0.85)
    assert react(client, code, a, '😀').get_json()['error'] == 'reactions_off'


def test_theme_and_tension_settings(client):
    code, ht, _ = mk(client, n=0, theme='prize_blue', tension_music=False, tension_secs=15)
    s = state(client, code, ht=ht)['settings']
    assert s['theme'] == 'prize_blue' and s['tension_music'] is False and s['tension_secs'] == 15
    host(client, code, ht, 'settings', settings={'theme': 'hacker'})       # tema inválido -> padrão
    assert state(client, code, ht=ht)['settings']['theme'] == 'auto'


# ---------------- arsenal e emojis do organizador ----------------
def hp(client, code, ht, power_, **kw):
    return client.post(f'/api/host/{code}/hostpower', json={'token': ht, 'power': power_, **kw})


def test_host_arsenal_all_players(client):
    code, ht, (a, b) = mk(client, n=2)
    assert hp(client, code, ht, 'all_5050').get_json()['error'] == 'not_open'      # só com pergunta aberta
    host(client, code, ht, 'start')
    end0 = state(client, code, a)['question']['end']
    assert hp(client, code, ht, 'all_5050').status_code == 200
    qa, qb = state(client, code, a)['question'], state(client, code, b)['question']
    assert len(qa['elim']) == 2 and qa['elim'] == qb['elim']                        # mesmas opções para todos
    assert hp(client, code, ht, 'all_5050').get_json()['error'] == 'nothing_to_remove'
    hp(client, code, ht, 'all_time')
    assert state(client, code, a)['question']['end'] == pytest.approx(end0 + 15, abs=0.01)
    hp(client, code, ht, 'all_hint'); hp(client, code, ht, 'all_double')
    q = state(client, code, b)['question']
    assert q['hint'] and q['mods']['double'] and q['mods']['hint']
    ci = correct_idx(code)
    pts = ans(client, code, a, ci).get_json()['points']
    assert pts >= 2 * 500 * 2                                                       # dobro do organizador vale
    r = hp(client, code, ht, 'all_dice').get_json(); assert 1 <= r['roll'] <= 6
    host(client, code, ht, 'close'); host(client, code, ht, 'next')
    r = hp(client, code, ht, 'all_card').get_json(); assert r['card'] in game.HOST_CARDS
    ev = [e['k'] for e in state(client, code, ht=ht)['events']]
    assert 'ev_host_power' in ev and 'ev_host_dice' in ev and 'ev_host_card' in ev


def test_host_shield_for_everyone_once_each(client):
    code, ht, (a, b) = mk(client, n=2)
    host(client, code, ht, 'start')
    set_room(code, lambda r: r['q'].setdefault('global', {}).__setitem__('shield', True))
    ci = correct_idx(code); wrong = [i for i in range(4) if i != ci]
    assert ans(client, code, a, wrong[0]).get_json().get('absorbed')
    assert ans(client, code, b, wrong[0]).get_json().get('absorbed')               # vale para cada jogador
    assert ans(client, code, a, wrong[1]).get_json()['correct'] is False            # só uma vez por jogador


def test_host_target_and_give_charges(client):
    code, ht, (a, b) = mk(client, n=2)
    assert hp(client, code, ht, 'block', target=b['pid']).status_code == 200        # funciona até no lobby
    assert hp(client, code, ht, 'block', target=b['pid']).get_json()['error'] == 'bad_target'
    hp(client, code, ht, 'seal', target=a['pid']); hp(client, code, ht, 'trap', target=a['pid'])
    me = state(client, code, a)['me']
    assert me['sealed'] == 2 and me['trap']
    assert hp(client, code, ht, 'give', give='dice', target='all').get_json() == {'given': 2}
    hp(client, code, ht, 'give', give='p5050', target=b['pid'])
    assert state(client, code, a)['me']['powers']['dice'] == 3 and state(client, code, b)['me']['powers']['p5050'] == 3
    assert hp(client, code, ht, 'give', give='nope', target='all').get_json()['error'] == 'bad_power'


def test_host_arsenal_classic_mode(client):
    code, ht, (a,) = mk(client, n=1, mode='classic')
    assert hp(client, code, ht, 'block', target=a['pid']).get_json()['error'] == 'powers_off'
    host(client, code, ht, 'start')
    hp(client, code, ht, 'all_double')
    ans(client, code, a, correct_idx(code))
    assert state(client, code, a)['question']['my_points'] >= 1000                  # dobro também no Clássico


def test_host_emoji_broadcast(client):
    code, ht, (a, b) = mk(client, n=2)
    r = client.post(f'/api/host/{code}/hostemoji', json={'token': ht, 'emoji': '🏆'})
    assert r.status_code == 200
    assert client.post(f'/api/host/{code}/hostemoji', json={'token': ht, 'emoji': '🏆'}).status_code == 429
    assert [x['emoji'] for x in state(client, code, b)['me']['broadcasts']] == ['🏆']
    assert any(x.get('host') for x in state(client, code, ht=ht)['reactions'])
    time.sleep(0.4)
    assert client.post(f'/api/host/{code}/hostemoji', json={'token': ht, 'emoji': 'xx'}).status_code == 400
    assert client.post(f'/api/host/{code}/hostemoji', json={'token': 'bad', 'emoji': '🏆'}).status_code == 403


# ---------------- Escopo da partida (quantidade de perguntas) ----------------
def _bank(n):
    return [{'question': f'Q{i}?', 'options': ['a', 'b', 'c', 'd'], 'correct': 0} for i in range(n)]


def _load(client, code, ht, n, **settings):
    return host(client, code, ht, 'settings', settings=settings, quiz=_bank(n), quiz_title='Banco')


def test_scope_first_n_questions(client):
    code, ht, ps = mk(client, 2)
    assert _load(client, code, ht, 120, q_limit=90).status_code == 200
    s = state(client, code, ht=ht)
    assert s['total'] == 90 and s['bank_total'] == 120 and len(s['quiz']) == 120   # lobby mostra o banco inteiro
    host(client, code, ht, 'start')
    s = state(client, code, ht=ht)
    assert s['total'] == 90 and s['question']['question'] == 'Q0?'
    assert state(client, code, ps[0])['total'] == 90
    for i in range(89):                     # vai até a última pergunta e termina no pódio
        host(client, code, ht, 'close'); host(client, code, ht, 'next')
    assert state(client, code, ht=ht)['question']['question'] == 'Q89?'
    host(client, code, ht, 'close'); host(client, code, ht, 'next')
    assert state(client, code, ht=ht)['phase'] == 'finished'


def test_scope_random_pick_and_restart_restores_bank(client):
    code, ht, ps = mk(client, 1)
    _load(client, code, ht, 30, q_limit=10, q_pick='random')
    host(client, code, ht, 'start')
    seen = []
    for _ in range(10):
        seen.append(state(client, code, ht=ht)['question']['question'])
        host(client, code, ht, 'close'); host(client, code, ht, 'next')
    assert len(set(seen)) == 10 and all(q.startswith('Q') for q in seen)   # sem repetir
    host(client, code, ht, 'restart')
    s = state(client, code, ht=ht)
    assert s['phase'] == 'lobby' and s['bank_total'] == 30 and len(s['quiz']) == 30 and s['total'] == 10


def test_scope_limit_bigger_than_quiz_and_all(client):
    code, ht, ps = mk(client, 1)
    _load(client, code, ht, 8, q_limit=50)
    assert state(client, code, ht=ht)['total'] == 8
    host(client, code, ht, 'settings', settings={'q_limit': 0})
    assert state(client, code, ht=ht)['total'] == 8


def test_scope_cannot_change_during_game(client):
    code, ht, ps = mk(client, 1)
    _load(client, code, ht, 20, q_limit=5)
    host(client, code, ht, 'start')
    host(client, code, ht, 'settings', settings={'q_limit': 15, 'timer': 40})
    s = state(client, code, ht=ht)
    assert s['total'] == 5 and s['settings']['q_limit'] == 5 and s['settings']['timer'] == 40


# ---------------- Presença: sair e expirar após 5 min sem conexão ----------------
def _ago(code, pid, secs):
    set_room(code, lambda r: r['players'][pid].__setitem__('seen', time.time() - secs))


def test_idle_player_is_dropped_after_5_min_and_unblocks_round(client):
    code, ht, (a, b) = mk(client, 2)
    host(client, code, ht, 'start')
    ans(client, code, a, 0)
    assert state(client, code, ht=ht)['phase'] == 'open'            # falta o Beto responder
    _ago(code, b['pid'], 200)                                       # 3 min: ainda conectado
    assert len(state(client, code, ht=ht)['board']) == 2
    _ago(code, b['pid'], 400)                                       # > 5 min: some
    s = state(client, code, ht=ht)
    assert [x['name'] for x in s['board']] == ['P1']
    assert s['phase'] == 'reveal'                                   # todos (que restam) responderam -> fechou
    assert any(e['k'] == 'ev_left_idle' for e in s['events'])
    assert client.get(f'/api/state/{code}?pid={b["pid"]}&token={b["token"]}').status_code == 403
    assert state(client, code, a)['phase'] == 'reveal'              # quem estava ativo continua


def test_polling_keeps_the_session_alive(client):
    code, ht, (a,) = mk(client, 1)
    _ago(code, a['pid'], 100)
    state(client, code, a)                                          # polling renova o "visto"
    assert appmod.with_room(code, lambda r: time.time() - r['players'][a['pid']]['seen']) < 5
    _ago(code, a['pid'], 290)
    assert state(client, code, ht=ht)['board'][0]['name'] == 'P1'


def test_host_gone_for_5_min_closes_room(client):
    code, ht, (a,) = mk(client, 1)
    set_room(code, lambda r: r.__setitem__('host_seen', time.time() - 400))
    assert client.get(f'/api/state/{code}?pid={a["pid"]}&token={a["token"]}').status_code == 410
    assert client.get(f'/api/state/{code}?role=host&token={ht}').status_code == 410
    assert client.post('/api/join', json={'code': code, 'name': 'Novo'}).status_code == 410
    assert ans(client, code, a, 0).status_code == 410


def test_host_back_within_5_min_keeps_room(client):
    code, ht, (a,) = mk(client, 1)
    set_room(code, lambda r: r.__setitem__('host_seen', time.time() - 250))
    assert client.get(f'/api/state/{code}?role=host&token={ht}').status_code == 200
    assert client.get(f'/api/state/{code}?pid={a["pid"]}&token={a["token"]}').status_code == 200


def test_host_logout_ends_room_for_everyone(client):
    code, ht, (a,) = mk(client, 1, visibility='public', room_name='Fecha')
    assert host(client, code, ht, 'end_room').status_code == 200
    assert client.get(f'/api/state/{code}?pid={a["pid"]}&token={a["token"]}').status_code == 410
    assert client.get(f'/api/state/{code}?role=host&token={ht}').status_code == 410
    assert all(r['name'] != 'Fecha' for r in client.get('/api/public').get_json())
    assert client.post(f'/api/host/{code}/end_room', json={'token': 'errado'}).status_code in (403, 410)


def test_player_leave_removes_immediately_and_turn_moves_on(client):
    code, ht, (a, b) = mk(client, 2, answer_order='turns')
    host(client, code, ht, 'start')
    s = state(client, code, ht=ht)
    turn_pid = s['question']['turn']['id']
    leaver = a if a['pid'] == turn_pid else b
    r = client.post('/api/leave', json={'code': code, 'pid': leaver['pid'], 'token': leaver['token']})
    assert r.status_code == 200
    s = state(client, code, ht=ht)
    assert len(s['board']) == 1 and s['phase'] == 'reveal'          # a vez dele terminou
    assert client.post('/api/leave', json={'code': code, 'pid': leaver['pid'], 'token': leaver['token']}).status_code == 403


def test_leave_at_podium_keeps_final_ranking(client):
    code, ht, (a, b) = mk(client, 2)
    host(client, code, ht, 'start')
    host(client, code, ht, 'finish')
    assert state(client, code, ht=ht)['phase'] == 'finished'
    assert client.post('/api/leave', json={'code': code, 'pid': a['pid'], 'token': a['token']}).status_code == 200
    assert len(state(client, code, ht=ht)['board']) == 2            # pódio preservado
    _ago(code, b['pid'], 9999)
    set_room(code, lambda r: r.__setitem__('host_seen', time.time() - 9999))
    assert state(client, code, ht=ht)['phase'] == 'finished'        # no pódio ninguém expira


# ---------------- Versão e cache dos arquivos estáticos ----------------
def test_version_endpoint_and_static_files_are_versioned(client):
    import re
    v = client.get('/version').get_json()
    assert v['version'] and v['presence_timeout'] == game.PRESENCE_TIMEOUT and 'nudge_always_visible' in v['features']
    assert client.get('/version').headers['Cache-Control'] == 'no-store'
    for page in ('/play', '/host', '/host/classic', '/'):
        html = client.get(page).get_data(as_text=True)
        assert re.search(r'/static/\w+\.(js|css)\?v=\d+', html), page            # ?v=<data>: o celular nunca usa JS antigo do cache


# ---------------- Chamar atenção do organizador ----------------
def _hostnudge(client, code, ht, target, kind='scare'):
    return client.post(f'/api/host/{code}/hostnudge', json={'token': ht, 'target': target, 'kind': kind})


def test_host_nudge_one_participant_and_everyone(client):
    code, ht, (a, b, c) = mk(client, 3)
    r = _hostnudge(client, code, ht, b['pid'], 'siren')
    assert r.status_code == 200 and r.get_json() == {'sent': 1}
    inbox_b = state(client, code, b)['me']['inbox']
    assert len(inbox_b) == 1 and inbox_b[0]['host'] is True and inbox_b[0]['kind'] == 'siren'
    assert state(client, code, a)['me']['inbox'] == []                      # só o escolhido recebe
    time.sleep(1.05)
    assert _hostnudge(client, code, ht, 'all', 'horn').get_json() == {'sent': 3}
    for p in (a, b, c):
        assert any(m['host'] and m['kind'] == 'horn' for m in state(client, code, p)['me']['inbox'])
    assert any(e['k'] == 'ev_host_nudge' and e['p']['target'] == '*' for e in state(client, code, ht=ht)['events'])


def test_host_nudge_validation_and_limits(client):
    code, ht, (a,) = mk(client, 1)
    assert _hostnudge(client, code, ht, 'inexistente').status_code == 400          # bad_target
    assert client.post(f'/api/host/{code}/hostnudge', json={'token': 'errado', 'target': 'all'}).status_code == 403
    assert _hostnudge(client, code, ht, a['pid'], 'qualquer-coisa').status_code == 200   # tipo inválido vira buzina
    assert state(client, code, a)['me']['inbox'][-1]['kind'] == 'horn'
    assert _hostnudge(client, code, ht, a['pid']).status_code == 429                # no máximo 1 por segundo
    time.sleep(1.05)
    assert _hostnudge(client, code, ht, 'all').status_code == 200                   # sem limite de usos


def test_host_nudge_works_in_classic_and_empty_room_and_podium(client):
    code, ht, ps = mk(client, 0, mode='classic')
    assert _hostnudge(client, code, ht, 'all').status_code == 400                   # sala vazia
    j = client.post('/api/join', json={'code': code, 'name': 'Ana'}).get_json()
    assert _hostnudge(client, code, ht, j['pid']).status_code == 200                # vale também no Clássico
    host(client, code, ht, 'start'); host(client, code, ht, 'finish')
    time.sleep(1.05)
    assert _hostnudge(client, code, ht, 'all').status_code == 400                   # no pódio não
