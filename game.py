"""Regras do Arena Quiz Multiplayer (sem Flask, sem banco: só dicionários).

Todo o estado de uma sala vive num dict serializável em JSON. O app.py carrega o
dict do SQLite, chama as funções daqui dentro de uma transação e grava de volta.
Assim a lógica é testável sozinha e segura para vários workers.
"""
import copy
import json
import os
import random
import secrets
import time

HERE = os.path.dirname(os.path.abspath(__file__))

POWERS = ['p5050', 'doubleXp', 'dice', 'hint', 'card', 'trap', 'block', 'seal', 'steal']
SELF_POWERS = ('p5050', 'doubleXp', 'dice', 'hint', 'card')
ATTACK_POWERS = ('trap', 'block', 'seal', 'steal')
THRESHOLDS = dict(p5050=2, doubleXp=3, dice=4, hint=5, card=6, trap=3, block=4, seal=6, steal=7)
SEAL_ROUNDS = 2          # lacre vale para o resto da rodada atual + a próxima
INFINITE = 90            # >= 90 cargas = ilimitado
MAX_PLAYERS = 60
CARD_IDS = ['HINT', 'PVP', 'SHIELD', 'ALLIN']
COLORS = [
    'from-cyan-500 to-blue-600', 'from-purple-500 to-indigo-600', 'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600', 'from-pink-500 to-rose-600', 'from-blue-500 to-cyan-600',
]
CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
BOARD_MODES = ('live', 'reveal', 'end')
THEMES = ('auto', 'neon_pink', 'neon_blue', 'stage', 'prize_blue', 'prize_red',
          'pride', 'diversity', 'kids_incl', 'minds', 'kids', 'gamer', 'corporate', 'inclusive')
NUDGE_KINDS = ('horn', 'scare', 'siren')
REACTIONS = ('😀', '😂', '🤣', 'HAHAHA', '😍', '👏', '🔥', '😮', '😱', '😡', '🤬', '😭', '🤯', '🎉')
HOST_EMOJIS = REACTIONS + ('👋', '⏰', '💪', '🏆', '🙌', '❤️')
HOST_ALL = ('all_5050', 'all_double', 'all_hint', 'all_time', 'all_dice', 'all_card')     # para todos
HOST_TARGET = ('trap', 'block', 'seal')                                                   # contra um jogador
HOST_CARDS = ('HINT', 'SHIELD', 'ALLIN', 'TIME')   # placar: sempre / só após cada pergunta / só no final

with open(os.path.join(HERE, 'default_quiz.json'), encoding='utf-8') as fh:
    DEFAULT_QUIZ = json.load(fh)


class GameError(Exception):
    def __init__(self, code, status=400):
        super().__init__(code)
        self.code = code
        self.status = status


# --------------------------------------------------------------------------
# Criação / configuração
# --------------------------------------------------------------------------
def new_code():
    return ''.join(secrets.choice(CODE_ALPHABET) for _ in range(4))


def normalize_settings(raw, base=None):
    s = dict(base or {})
    raw = raw or {}

    def num(key, lo, hi, default):
        try:
            v = int(raw.get(key, s.get(key, default)))
        except (TypeError, ValueError):
            v = default
        return max(lo, min(hi, v))

    s['timer'] = num('timer', 5, 300, 30)
    s['base_xp'] = num('base_xp', 100, 5000, 500)
    s['multiplier'] = num('multiplier', 1, 5, 2)
    s['charges'] = num('charges', 1, 99, 2)
    s['progressive'] = bool(raw.get('progressive', s.get('progressive', True)))
    s['close_on_first'] = bool(raw.get('close_on_first', s.get('close_on_first', False)))
    mode = raw.get('mode', s.get('mode', 'arena'))
    s['mode'] = mode if mode in ('arena', 'classic') else 'arena'
    s['classic_points'] = num('classic_points', 100, 5000, 1000)
    lang = raw.get('lang', s.get('lang', 'pt'))
    s['lang'] = lang if lang in ('pt', 'en', 'es') else 'pt'
    board = raw.get('board_mode', s.get('board_mode', 'live'))
    s['board_mode'] = board if board in BOARD_MODES else 'live'
    on_raw = raw.get('powers_on') if isinstance(raw.get('powers_on'), dict) else {}
    on_old = s.get('powers_on') or {}
    s['powers_on'] = {k: bool(on_raw.get(k, on_old.get(k, True))) for k in POWERS}
    th_raw = raw.get('thresholds') if isinstance(raw.get('thresholds'), dict) else {}
    th_old = s.get('thresholds') or {}
    th = {}
    for k in POWERS:
        try:
            th[k] = max(0, min(50, int(th_raw.get(k, th_old.get(k, THRESHOLDS[k])))))
        except (TypeError, ValueError):
            th[k] = THRESHOLDS[k]
    s['thresholds'] = th
    vis = raw.get('visibility', s.get('visibility', 'private'))
    s['visibility'] = vis if vis in ('private', 'public') else 'private'
    s['room_name'] = ' '.join(str(raw.get('room_name', s.get('room_name', '')) or '').split())[:40]
    s['auto_next'] = bool(raw.get('auto_next', s.get('auto_next', False)))
    s['auto_delay'] = num('auto_delay', 3, 60, 8)
    order = raw.get('answer_order', s.get('answer_order', 'speed'))
    s['answer_order'] = order if order in ('speed', 'turns') else 'speed'   # mais rápido x por vez
    s['nudge_limit'] = num('nudge_limit', 0, 10, 2)                          # "chamar atenção" por jogador (0 = desligado)
    s['reactions_on'] = bool(raw.get('reactions_on', s.get('reactions_on', True)))
    s['tension_music'] = bool(raw.get('tension_music', s.get('tension_music', True)))
    s['tension_secs'] = num('tension_secs', 3, 30, 10)
    theme = raw.get('theme', s.get('theme', 'auto'))
    s['theme'] = theme if theme in THEMES else 'auto'
    s['theme_variant'] = num('theme_variant', 0, 2, 0)                     # 3 tons de cor por tema
    s['q_limit'] = num('q_limit', 0, 200, 0)                               # escopo: quantas perguntas usar (0 = todas)
    pick = raw.get('q_pick', s.get('q_pick', 'first'))
    s['q_pick'] = pick if pick in ('first', 'random') else 'first'         # na sequência do quiz ou sorteadas
    return s


# Configurações que podem mudar com o jogo em andamento (o resto só no lobby)
LIVE_SETTINGS = ('timer', 'board_mode', 'powers_on', 'thresholds', 'progressive', 'close_on_first',
                 'classic_points', 'base_xp', 'multiplier', 'visibility', 'room_name', 'auto_next', 'auto_delay', 'answer_order',
                 'nudge_limit', 'reactions_on', 'tension_music', 'tension_secs', 'theme', 'theme_variant')


def update_settings(room, raw):
    raw = raw or {}
    if room['phase'] != 'lobby':
        raw = {k: v for k, v in raw.items() if k in LIVE_SETTINGS}
    room['settings'] = normalize_settings(raw, room['settings'])


def normalize_quiz(raw):
    if isinstance(raw, str):
        txt = raw.strip()
        if txt.startswith('```'):
            txt = txt.replace('```json', '').replace('```', '').strip()
        try:
            raw = json.loads(txt)
        except ValueError:
            raise GameError('quiz_invalid')
    if not isinstance(raw, list) or not raw:
        raise GameError('quiz_invalid')
    out = []
    for i, q in enumerate(raw):
        if not isinstance(q, dict):
            raise GameError('quiz_invalid')
        opts = q.get('options')
        corr = q.get('correct')
        poll = bool(q.get('poll'))
        if not q.get('question') or not isinstance(opts, list) or len(opts) < 2 or len(opts) > 6:
            raise GameError('quiz_invalid')
        if poll:
            corr = None
        elif not isinstance(corr, int) or isinstance(corr, bool) or not 0 <= corr < len(opts):
            raise GameError('quiz_invalid')
        qtime = q.get('time')
        qtime = qtime if isinstance(qtime, int) and not isinstance(qtime, bool) and 5 <= qtime <= 300 else None
        img = str(q.get('image') or '').strip()
        img = img if img.lower().startswith(('http://', 'https://')) and len(img) < 500 else ''
        out.append({
            'id': i + 1,
            'block': str(q.get('block') or 'Geral'),
            'topic': str(q.get('topic') or ''),
            'question': str(q['question']),
            'options': [str(o) for o in opts],
            'correct': corr,
            'reference': str(q.get('reference') or ''),
            'hint': str(q.get('hint') or ''),
            'explanation': str(q.get('explanation') or ''),
            'time': qtime, 'image': img, 'poll': poll,
        })
    return out[:200]


def new_room(code, host_token, settings=None, quiz=None, title=''):
    st = normalize_settings(settings)
    questions = normalize_quiz(quiz) if quiz else normalize_quiz(copy.deepcopy(DEFAULT_QUIZ[st['lang']]))
    return {
        'code': code, 'created': time.time(), 'host_token': host_token,
        'phase': 'lobby', 'settings': st, 'questions': questions, 'custom_quiz': bool(quiz),
        'quiz_title': str(title or '')[:80],
        'qi': -1, 'players': {}, 'q': None, 'events': [], 'v': 0,
        'pub_id': secrets.token_hex(6), 'requests': {}, 'host_seen': time.time(), 'auto_hold': False,
    }


def _new_player(room, name):
    n = len(room['players'])
    return {
        'id': secrets.token_hex(4), 'token': secrets.token_urlsafe(12), 'name': name,
        'color': COLORS[n % len(COLORS)], 'joined': time.time(),
        'score': 0, 'correct': 0, 'answered': 0, 'streak': 0, 'max_streak': 0,
        'powers': {k: room['settings']['charges'] for k in POWERS},
        'blocked_next': False, 'blocked_now': False, 'sealed': 0, 'trap': None,
        'nudges_used': 0, 'inbox': [], 'last_react': 0,
    }


def add_player(room, name):
    name = ' '.join(str(name or '').split())[:20]
    if not name:
        raise GameError('name_required')
    if len(room['players']) >= MAX_PLAYERS:
        raise GameError('room_full')
    taken = {p['name'].lower() for p in room['players'].values()}
    base, k = name, 2
    while name.lower() in taken:
        name = f'{base[:17]} {k}'
        k += 1
    p = _new_player(room, name)
    room['players'][p['id']] = p
    event(room, 'ev_join', name=p['name'])
    return p


MAX_PENDING_REQUESTS = 30


def request_join(room, name):
    """Pedido de entrada numa sala pública. Retorna o id e o segredo para acompanhar o pedido."""
    if room['settings'].get('visibility') != 'public' or room['phase'] == 'finished':
        raise GameError('room_private', 403)
    name = ' '.join(str(name or '').split())[:20]
    if not name:
        raise GameError('name_required')
    reqs = room.setdefault('requests', {})
    pending = [r for r in reqs.values() if r['status'] == 'pending']
    if len(pending) >= MAX_PENDING_REQUESTS:
        raise GameError('too_many_requests', 429)
    rid, secret = secrets.token_hex(4), secrets.token_urlsafe(12)
    reqs[rid] = {'id': rid, 'secret': secret, 'name': name, 't': time.time(), 'status': 'pending'}
    # guarda só os pedidos recentes
    for old in sorted(reqs.values(), key=lambda r: r['t'])[:-100]:
        reqs.pop(old['id'], None)
    return {'rid': rid, 'secret': secret}


def resolve_request(room, rid, approve):
    r = room.get('requests', {}).get(rid)
    if not r or r['status'] != 'pending':
        raise GameError('request_not_found', 404)
    if approve:
        p = add_player(room, r['name'])
        r.update(status='approved', pid=p['id'], token=p['token'], name=p['name'])
    else:
        r['status'] = 'denied'


def request_status(room, rid, secret):
    r = room.get('requests', {}).get(rid)
    if not r or not secrets.compare_digest(str(secret or ''), r['secret']):
        raise GameError('request_not_found', 404)
    out = {'status': r['status'], 'name': r['name']}
    if r['status'] == 'approved':
        out.update(code=room['code'], pid=r['pid'], token=r['token'])
    return out


def nudge(room, pid, target_id, kind):
    """Chamar atenção: toca um som alto no celular do rival escolhido (limite por partida)."""
    if room['phase'] == 'finished':
        raise GameError('not_active')
    p = room['players'][pid]
    limit = room['settings'].get('nudge_limit', 2)
    if p.get('nudges_used', 0) >= limit:
        raise GameError('no_nudges')
    target = room['players'].get(target_id)
    if not target or target_id == pid:
        raise GameError('bad_target')
    kind = kind if kind in NUDGE_KINDS else 'horn'
    now = time.time()
    p['nudges_used'] = p.get('nudges_used', 0) + 1
    inbox = [m for m in target.get('inbox', []) if now - m['t'] < 60][-9:]
    inbox.append({'id': secrets.token_hex(4), 'from': p['name'], 'kind': kind, 't': now})
    target['inbox'] = inbox
    event(room, 'ev_nudge', name=p['name'], target=target['name'])
    return {'left': max(0, limit - p['nudges_used'])}


def react(room, pid, emoji):
    """Reação com emoji que aparece flutuando na tela do apresentador."""
    if not room['settings'].get('reactions_on', True):
        raise GameError('reactions_off')
    if emoji not in REACTIONS:
        raise GameError('bad_emoji')
    p, now = room['players'][pid], time.time()
    if now - p.get('last_react', 0) < 0.8:
        raise GameError('slow_down', 429)
    p['last_react'] = now
    reacts = [r for r in room.get('reactions', []) if now - r['t'] < 15][-40:]
    reacts.append({'id': secrets.token_hex(4), 'name': p['name'], 'emoji': emoji, 't': now})
    room['reactions'] = reacts
    return {}


def host_power(room, power, args=None):
    """Arsenal do organizador: efeitos para todos, ataques a um jogador ou cargas de presente (sem gastar cargas)."""
    args = args or {}
    q, arena = room.get('q'), room['settings']['mode'] == 'arena'
    if power in HOST_ALL:
        if room['phase'] != 'open' or not q:
            raise GameError('not_open')
        quest = room['questions'][room['qi']]
        g = q.setdefault('global', {})
        if quest.get('poll') and power != 'all_time':
            raise GameError('poll_question')

        def add_time(sec):
            q['end'] += sec
            q['duration'] = q.get('duration', 0) + sec

        def elim_all(n):
            pool = [i for i in range(len(quest['options'])) if i != quest['correct'] and i not in q.get('elim_all', [])]
            random.shuffle(pool)
            take = pool[:max(0, min(n, len(pool) - 1))]          # sempre sobra 1 errada
            q.setdefault('elim_all', []).extend(take)
            return take

        out = {}
        if power == 'all_5050':
            if not elim_all(2):
                raise GameError('nothing_to_remove')
        elif power == 'all_double':
            g['double'] = True
        elif power == 'all_hint':
            g['hint'] = True
        elif power == 'all_time':
            add_time(15)
        elif power == 'all_dice':
            roll = random.randint(1, 6)
            out['roll'] = roll
            if roll == 1:
                add_time(5)
            elif roll == 2:
                add_time(10)
            elif roll == 3:
                elim_all(1)
            elif roll == 4:
                add_time(15)
            elif roll == 5:
                g['streak_shield'] = True
            else:
                elim_all(2)
                g['double'] = True
            event(room, 'ev_host_dice', roll=roll)
            return out
        elif power == 'all_card':
            card = random.choice(HOST_CARDS)
            out['card'] = card
            if card == 'HINT':
                g['hint'] = True
            elif card == 'SHIELD':
                g['shield'] = True
            elif card == 'ALLIN':
                g['allin'] = True
            else:
                add_time(20)
            event(room, 'ev_host_card', card=card)
            return out
        event(room, 'ev_host_power', hp=power)
        return out

    if not arena:
        raise GameError('powers_off')
    if room['phase'] == 'finished':
        raise GameError('not_active')
    if power in HOST_TARGET:
        t = room['players'].get(args.get('target'))
        if not t:
            raise GameError('bad_target')
        if power == 'block':
            if t['blocked_next']:
                raise GameError('bad_target')
            t['blocked_next'] = True
        elif power == 'seal':
            if t['sealed'] > 0:
                raise GameError('bad_target')
            t['sealed'] = SEAL_ROUNDS
        elif power == 'trap':
            if t['trap']:
                raise GameError('bad_target')
            t['trap'] = {'by': 'host'}
        event(room, 'ev_host_target', hp=power, target=t['name'])
        return {}
    if power == 'give':
        key = args.get('give')
        if key not in POWERS:
            raise GameError('bad_power')
        tid = args.get('target')
        targets = list(room['players'].values()) if tid == 'all' else [room['players'].get(tid)]
        if not targets or None in targets:
            raise GameError('bad_target')
        for t in targets:
            if t['powers'].get(key, 0) < INFINITE:
                t['powers'][key] = t['powers'].get(key, 0) + 1
        event(room, 'ev_host_give', power=key, target='*' if tid == 'all' else targets[0]['name'])
        return {'given': len(targets)}
    raise GameError('bad_power')


def host_emoji(room, emoji):
    """Emoji do organizador: aparece grande no celular de todos e no telão."""
    if emoji not in HOST_EMOJIS:
        raise GameError('bad_emoji')
    now = time.time()
    if now - room.get('last_host_emoji', 0) < 0.35:
        raise GameError('slow_down', 429)
    room['last_host_emoji'] = now
    item = {'id': secrets.token_hex(4), 'emoji': emoji, 't': now, 'host': True, 'name': ''}
    room['broadcasts'] = [b for b in room.get('broadcasts', []) if now - b['t'] < 15][-20:] + [item]
    room['reactions'] = [r for r in room.get('reactions', []) if now - r['t'] < 15][-40:] + [item]
    return {}


def public_info(room):
    s = room['settings']
    return {'id': room['pub_id'], 'name': s.get('room_name') or room.get('quiz_title'),
            'quiz_title': room.get('quiz_title', ''), 'mode': s['mode'], 'lang': s['lang'],
            'players': len(room['players']), 'phase': room['phase'], 'total': game_total(room)}


# --------------------------------------------------------------------------
# Escopo da partida: o quiz carregado é o "banco"; a partida usa só as N escolhidas
# --------------------------------------------------------------------------
def bank_size(room):
    return len(room.get('bank') or room['questions'])


def game_total(room):
    """Perguntas desta partida: no lobby, as que serão usadas; depois, as separadas no início."""
    if room['phase'] != 'lobby':
        return len(room['questions'])
    n, lim = len(room['questions']), room['settings'].get('q_limit', 0)
    return min(lim, n) if lim else n


def _build_round(room):
    """Ao iniciar: guarda o banco completo e separa as perguntas da partida."""
    bank = room['questions']
    n = game_total(room)
    if room['settings'].get('q_pick') == 'random':
        idx = random.sample(range(len(bank)), n)          # sorteadas, em ordem aleatória
    else:
        idx = list(range(n))                              # as primeiras N, na sequência do quiz
    if n == len(bank) and idx == list(range(n)):
        return                                            # partida usa o quiz inteiro, na ordem
    room['bank'] = bank
    room['questions'] = [bank[i] for i in idx]


def _restore_bank(room):
    if room.get('bank'):
        room['questions'] = room.pop('bank')
    room.pop('bank', None)


def event(room, key, **params):
    room['events'].append({'t': time.time(), 'k': key, 'p': params})
    del room['events'][:-40]


def get_player(room, pid, token=None):
    p = room['players'].get(pid)
    if not p:
        raise GameError('bad_auth', 403)
    if token is not None and not secrets.compare_digest(str(token), p['token']):
        raise GameError('bad_auth', 403)
    return p


# --------------------------------------------------------------------------
# Ciclo da partida
# --------------------------------------------------------------------------
def start_question(room):
    room['qi'] += 1
    if room['qi'] >= len(room['questions']):
        room['phase'] = 'finished'
        room['q'] = None
        return
    now = time.time()
    duration = room['questions'][room['qi']].get('time') or room['settings']['timer']
    turns = room['settings'].get('answer_order') == 'turns'
    for p in room['players'].values():
        if turns:                                 # por vez: o bloqueio espera a vez do alvo (ver _next_turn)
            p['blocked_now'] = False
        else:
            p['blocked_now'] = p['blocked_next']
            p['blocked_next'] = False
    room['auto_hold'] = False
    room['q'] = {
        'start': now, 'end': now + duration, 'duration': duration,
        'winner': None, 'win_points': 0, 'answers': {}, 'used': {}, 'elim': {},
        'mods': {}, 'pending': {}, 'turn': None,
    }
    if room['settings'].get('answer_order') == 'turns':
        room['q']['turn'] = _next_turn(room)
        if room['q']['turn']:
            event(room, 'ev_turn', name=room['players'][room['q']['turn']]['name'])
    room['phase'] = 'open'


def turn_order(room):
    """Ordem dos participantes = ordem de entrada na sala."""
    return [p['id'] for p in sorted(room['players'].values(), key=lambda p: p['joined'])]


def _next_turn(room):
    order = turn_order(room)
    if not order:
        return None
    i = room.get('turn_idx', 0) % len(order)
    for _ in range(len(order)):
        p = room['players'][order[i]]
        i = (i + 1) % len(order)
        if p['blocked_next']:                     # Bloqueio: perde a próxima vez (estilo UNO)
            p['blocked_next'] = False
            event(room, 'ev_turn_skip', name=p['name'])
            continue
        room['turn_idx'] = i
        return p['id']
    room['turn_idx'] = i                          # todos bloqueados: segue a ordem mesmo assim
    return order[(i - 1) % len(order)]


def close_question(room):
    if room['phase'] != 'open':
        return
    room['phase'] = 'reveal'
    room['q']['reveal_at'] = time.time()
    tp = room['players'].get(room['q'].get('turn') or '')
    if tp and tp['id'] not in room['q']['answers'] and not room['questions'][room['qi']].get('poll'):
        if not room['q']['mods'].get(tp['id'], {}).get('streak_shield'):
            tp['streak'] = 0
        event(room, 'ev_turn_timeout', name=tp['name'])
    for p in room['players'].values():
        if p['sealed'] > 0:
            p['sealed'] -= 1


def tick(room):
    """Fecha a pergunta quando o tempo acaba. Chamado a cada requisição."""
    q = room.get('q')
    if room['phase'] == 'open' and q and not q.get('paused_at') and time.time() >= q['end']:
        close_question(room)
        return True
    nxt = next_at(room)
    if nxt is not None and time.time() >= nxt:          # avanço automático para a próxima pergunta
        start_question(room)
        return True
    return False


def next_at(room):
    """Quando a próxima pergunta começa sozinha (None = espera o apresentador)."""
    s, q = room['settings'], room.get('q')
    if room['phase'] != 'reveal' or not q or not s.get('auto_next') or room.get('auto_hold'):
        return None
    return q.get('reveal_at', time.time()) + s.get('auto_delay', 8)


def host_action(room, action, arg=None):
    ph = room['phase']
    if action == 'start':
        if ph != 'lobby':
            raise GameError('bad_phase')
        if not room['players']:
            raise GameError('no_players')
        _build_round(room)
        start_question(room)
    elif action == 'next':
        if ph != 'reveal':
            raise GameError('bad_phase')
        start_question(room)
    elif action == 'close':
        if ph != 'open':
            raise GameError('bad_phase')
        _unpause(room)
        close_question(room)
    elif action == 'pause':
        if ph == 'reveal':                       # segura o avanço automático
            room['auto_hold'] = True
        elif ph != 'open' or room['q'].get('paused_at'):
            raise GameError('bad_phase')
        else:
            room['q']['paused_at'] = time.time()
    elif action == 'resume':
        if ph == 'reveal':
            room['auto_hold'] = False
            room['q']['reveal_at'] = time.time()
        elif ph != 'open' or not room['q'].get('paused_at'):
            raise GameError('bad_phase')
        else:
            _unpause(room)
    elif action == 'set_turn':
        q = room.get('q')
        if ph != 'open' or not q or not q.get('turn') or arg not in room['players'] or q['answers']:
            raise GameError('bad_phase')
        q['turn'] = arg
        q['start'] = time.time()
        q['end'] = q['start'] + q.get('duration', room['settings']['timer'])
        q['paused_at'] = None
        event(room, 'ev_turn', name=room['players'][arg]['name'])
    elif action in ('approve', 'deny'):
        resolve_request(room, arg, action == 'approve')
    elif action == 'finish':
        if ph == 'lobby':
            raise GameError('bad_phase')
        room['phase'] = 'finished'
        room['q'] = None
    elif action == 'restart':
        _restore_bank(room)                       # volta o quiz completo (novo sorteio na próxima partida)
        room['phase'] = 'lobby'
        room['qi'] = -1
        room['q'] = None
        room['events'] = []
        room['turn_idx'] = 0
        for p in room['players'].values():
            p.update(nudges_used=0, inbox=[])
            p.update(score=0, correct=0, answered=0, streak=0, max_streak=0,
                     blocked_next=False, blocked_now=False, sealed=0, trap=None)
            p['powers'] = {k: room['settings']['charges'] for k in POWERS}
    elif action == 'kick':
        room['players'].pop(arg, None)
    else:
        raise GameError('bad_action')


def _unpause(room):
    q = room.get('q')
    if q and q.get('paused_at'):
        q['end'] += time.time() - q['paused_at']
        q['paused_at'] = None


# --------------------------------------------------------------------------
# Pontuação e respostas
# --------------------------------------------------------------------------
def threshold(room, power):
    return (room['settings'].get('thresholds') or THRESHOLDS).get(power, THRESHOLDS[power])


def power_on(room, power):
    return (room['settings'].get('powers_on') or {}).get(power, True)


def is_unlocked(room, p, power):
    return (not room['settings']['progressive']) or p['correct'] >= threshold(room, power)


def _unit(room):
    s = room['settings']
    return s['base_xp'] * s['multiplier']


def answer(room, pid, idx):
    if room['phase'] != 'open':
        raise GameError('not_open')
    q = room['q']
    if q.get('paused_at'):
        raise GameError('paused')
    if time.time() > q['end'] + 0.3:
        raise GameError('closed')
    p = room['players'][pid]
    if q.get('turn') and q['turn'] != pid:
        raise GameError('not_your_turn')
    if p['blocked_now']:
        raise GameError('blocked')
    if pid in q['answers']:
        raise GameError('already')
    quest = room['questions'][room['qi']]
    if not isinstance(idx, int) or isinstance(idx, bool) or not 0 <= idx < len(quest['options']):
        raise GameError('bad_idx')
    if idx in _elim_of(q, pid):
        raise GameError('eliminated')

    s = room['settings']
    mods = q['mods'].setdefault(pid, {})
    eff = _mods_of(q, pid)                           # efeitos do jogador + do organizador
    now = time.time()

    if quest.get('poll'):                            # enquete: só registra o voto
        q['answers'][pid] = {'idx': idx, 't': now, 'correct': None, 'points': 0}
        _maybe_auto_close(room)
        return {'accepted': True}

    correct = idx == quest['correct']
    res = {'correct': correct}

    if not correct and eff.get('shield'):            # Seguro (carta do jogador ou do organizador)
        if mods.get('shield'):
            mods['shield'] = False
        else:
            q.setdefault('gshield_used', []).append(pid)
        q['elim'].setdefault(pid, []).append(idx)
        event(room, 'ev_shield_hit', name=p['name'])
        res['absorbed'] = True
        return res

    if s['mode'] == 'classic':
        return _answer_classic(room, p, idx, correct, now, res, eff)

    if not correct:
        q['answers'][pid] = {'idx': idx, 't': now, 'correct': False}
        p['answered'] += 1
        if not eff.get('streak_shield'):
            p['streak'] = 0
        penalty = 0
        if eff.get('double'):                       # aposta do 2x perdida
            penalty += round(_unit(room) * 0.5)
        if p['trap']:                                # armadilha disparada
            tp = _unit(room)
            penalty += tp
            event(room, 'ev_trap_hit', name=p['name'], pts=tp)
            p['trap'] = None
        p['score'] = max(0, p['score'] - penalty)
        res['penalty'] = penalty
        _maybe_auto_close(room)
        return res

    # acerto
    q['answers'][pid] = {'idx': idx, 't': now, 'correct': True}
    p['answered'] += 1
    if p['trap']:
        p['trap'] = None
        event(room, 'ev_trap_defused', name=p['name'])

    if q['winner'] is not None:                      # acertou, mas não foi o primeiro
        res['late'] = True
        _maybe_auto_close(room)
        return res

    # primeiro a acertar leva pontos e progresso de poderes
    q['winner'] = pid
    prev = p['correct']
    p['correct'] += 1
    p['streak'] += 1
    p['max_streak'] = max(p['max_streak'], p['streak'])
    ratio = max(0.0, min(1.0, (q['end'] - now) / max(1, q['end'] - q['start'])))
    speed = round(300 * ratio)
    streak_mult = min(2.5, 1 + (p['streak'] - 1) * 0.25)
    pts = round((s['base_xp'] + speed) * s['multiplier'] * streak_mult
                * (2 if eff.get('double') else 1) * (3 if eff.get('allin') else 1))
    if eff.get('pvp'):
        pts += 150
        others = [o for o in room['players'].values() if o['id'] != pid]
        if others:
            leader = max(others, key=lambda o: o['score'])
            if leader['score'] >= 50 and leader['score'] >= p['score']:
                leader['score'] -= 50
                event(room, 'ev_pvp_drain', name=p['name'], leader=leader['name'])
    p['score'] += pts
    q['win_points'] = pts
    q['win_time'] = round(now - q['start'], 2)
    res['points'] = pts
    event(room, 'ev_win', name=p['name'], pts=pts)
    if s['progressive']:
        for key in POWERS:
            if power_on(room, key) and prev < threshold(room, key) <= p['correct']:
                event(room, 'ev_unlock', name=p['name'], power=key)
    if s['close_on_first']:
        close_question(room)
    else:
        _maybe_auto_close(room)
    return res


def _elim_of(q, pid):
    """Alternativas eliminadas para o jogador: as dele + as eliminadas para todos pelo organizador."""
    return list(dict.fromkeys(q.get('elim_all', []) + q['elim'].get(pid, [])))


def _mods_of(q, pid):
    """Efeitos ativos do jogador somados aos efeitos que o organizador deu para todos."""
    m = dict(q['mods'].get(pid, {}))
    g = q.get('global') or {}
    for k in ('double', 'allin', 'hint', 'streak_shield'):
        if g.get(k):
            m[k] = True
    if g.get('shield') and pid not in q.get('gshield_used', []):
        m['shield'] = True
    return m


def _answer_classic(room, p, idx, correct, now, res, eff=None):
    """Modo clássico: todo acerto pontua, mais rápido = mais pontos."""
    q, s = room['q'], room['settings']
    p['answered'] += 1
    pts = 0
    if correct:
        p['correct'] += 1
        p['streak'] += 1
        p['max_streak'] = max(p['max_streak'], p['streak'])
        dur = max(1.0, q['end'] - q['start'])
        rt = max(0.0, min(dur, now - q['start']))
        pts = round(s['classic_points'] * (1 - (rt / dur) / 2))
        pts += min(500, 100 * (p['streak'] - 1))          # bônus de sequência de acertos
        eff = eff or {}
        pts *= (2 if eff.get('double') else 1) * (3 if eff.get('allin') else 1)   # efeitos do organizador
        p['score'] += pts
        if q['winner'] is None:
            q['winner'] = p['id']
    elif not (eff or {}).get('streak_shield'):
        p['streak'] = 0
    q['answers'][p['id']] = {'idx': idx, 't': now, 'correct': correct, 'points': pts}
    _maybe_auto_close(room)
    return {'accepted': True}      # sem revelar acerto/erro: só no fim da pergunta


def _maybe_auto_close(room):
    """Fecha antes do fim se todo mundo que podia responder já respondeu."""
    if room['phase'] != 'open':
        return
    q = room['q']
    if q.get('turn'):
        eligible = [room['players'][q['turn']]] if q['turn'] in room['players'] else []
    else:
        eligible = [p for p in room['players'].values() if not p['blocked_now']]
    if eligible and all(p['id'] in q['answers'] for p in eligible):
        close_question(room)


# --------------------------------------------------------------------------
# Poderes
# --------------------------------------------------------------------------
def _remaining_wrong(room, pid):
    quest = room['questions'][room['qi']]
    elim = _elim_of(room['q'], pid)
    return [i for i in range(len(quest['options'])) if i != quest['correct'] and i not in elim]


def _eliminate(room, pid, n):
    pool = _remaining_wrong(room, pid)
    random.shuffle(pool)
    take = pool[:max(0, min(n, len(pool) - 1))]     # sempre sobra 1 errada
    room['q']['elim'].setdefault(pid, []).extend(take)
    return take


def stealable(p):
    return [k for k in POWERS if 0 < p['powers'].get(k, 0) < INFINITE]


def use_power(room, pid, power, args):
    args = args or {}
    if power not in POWERS:
        raise GameError('bad_power')
    if room['settings']['mode'] == 'classic':
        raise GameError('powers_off')
    if not power_on(room, power):
        raise GameError('power_off')
    p = room['players'][pid]
    if room['phase'] not in ('open', 'reveal'):
        raise GameError('not_active')
    if room['phase'] == 'open' and room['q'].get('paused_at'):
        raise GameError('paused')
    if power in SELF_POWERS and room['phase'] != 'open':
        raise GameError('not_open')
    if p['sealed'] > 0:
        raise GameError('sealed')
    if not is_unlocked(room, p, power):
        raise GameError('locked')
    if p['powers'][power] <= 0:
        raise GameError('no_charges')
    q = room['q']
    mods = q['mods'].setdefault(pid, {})
    used = q['used'].setdefault(pid, [])
    if power in used:
        raise GameError('used_this_round')
    if power in SELF_POWERS:
        if q.get('turn') and q['turn'] != pid:
            raise GameError('not_your_turn')
        if p['blocked_now']:
            raise GameError('blocked')
        if pid in q['answers']:
            raise GameError('already')
        if room['questions'][room['qi']].get('poll'):
            raise GameError('poll_question')

    def spend():
        if p['powers'][power] < INFINITE:
            p['powers'][power] -= 1
        used.append(power)

    unit10 = round(_unit(room) / 10)

    if power == 'p5050':
        if len(_remaining_wrong(room, pid)) <= 1:
            raise GameError('nothing_to_remove')
        spend()
        removed = _eliminate(room, pid, 2)
        event(room, 'ev_5050', name=p['name'])
        return {'eliminated': removed}

    if power == 'doubleXp':
        if mods.get('double'):
            raise GameError('used_this_round')
        spend()
        mods['double'] = True
        event(room, 'ev_double', name=p['name'])
        return {}

    if power == 'hint':
        spend()
        mods['hint'] = True
        event(room, 'ev_hint', name=p['name'])
        return {}

    if power == 'dice':
        spend()
        roll = random.randint(1, 6)
        info = {'roll': roll}
        if roll == 1:
            p['score'] += unit10
        elif roll == 2:
            p['score'] += unit10 * 2
        elif roll == 3:
            p['score'] += unit10
            _eliminate(room, pid, 1)
        elif roll == 4:
            p['score'] += unit10 * 3
        elif roll == 5:
            p['score'] += unit10
            mods['streak_shield'] = True
        else:
            _eliminate(room, pid, 2)
            mods['double'] = True
        info['xp'] = {1: 1, 2: 2, 3: 1, 4: 3, 5: 1, 6: 0}[roll] * unit10
        event(room, 'ev_dice', name=p['name'], roll=roll)
        return info

    if power == 'card':
        stage = args.get('stage', 'open')
        if stage == 'open':
            if pid not in q['pending']:
                deck = CARD_IDS[:]
                random.shuffle(deck)
                q['pending'][pid] = deck
            return {'cards': 4}
        deck = q['pending'].get(pid)
        try:
            pick = int(args.get('card_idx'))
        except (TypeError, ValueError):
            raise GameError('bad_idx')
        if not deck or not 0 <= pick < len(deck):
            raise GameError('bad_idx')
        spend()
        del q['pending'][pid]
        effect = deck[pick]
        if effect == 'HINT':
            mods['hint'] = True
        elif effect == 'PVP':
            mods['pvp'] = True
        elif effect == 'SHIELD':
            mods['shield'] = True
        else:
            mods['allin'] = True
        event(room, 'ev_card', name=p['name'], card=effect)
        return {'deck': deck, 'picked': pick, 'effect': effect}

    # ---- poderes de ataque ----
    tid = args.get('target')
    target = room['players'].get(tid)
    if not target or tid == pid:
        raise GameError('bad_target')

    if power == 'block':
        if target['blocked_next']:
            raise GameError('bad_target')
        spend()
        target['blocked_next'] = True
        event(room, 'ev_block', name=p['name'], target=target['name'])
    elif power == 'seal':
        if target['sealed'] > 0:
            raise GameError('bad_target')
        spend()
        target['sealed'] = SEAL_ROUNDS
        event(room, 'ev_seal', name=p['name'], target=target['name'])
    elif power == 'trap':
        if target['trap']:
            raise GameError('bad_target')
        spend()
        target['trap'] = {'by': p['name']}
        event(room, 'ev_trap_set', name=p['name'], target=target['name'])
    elif power == 'steal':
        key = args.get('steal')
        if key not in POWERS or key not in stealable(target):
            raise GameError('bad_target')
        spend()
        target['powers'][key] -= 1
        if p['powers'][key] < INFINITE:
            p['powers'][key] += 1
        event(room, 'ev_steal', name=p['name'], target=target['name'], power=key)
        return {'stolen': key}
    return {}


# --------------------------------------------------------------------------
# Visões (o que cada tela pode ver)
# --------------------------------------------------------------------------
def _board(room):
    rows = []
    for p in room['players'].values():
        rows.append({
            'id': p['id'], 'name': p['name'], 'color': p['color'], 'score': p['score'],
            'correct': p['correct'], 'streak': p['streak'], 'blocked': p['blocked_now'] or p['blocked_next'],
            'sealed': p['sealed'], 'trap': bool(p['trap']),
            'stealable': stealable(p),
        })
    rows.sort(key=lambda r: (-r['score'], r['name'].lower()))
    return rows


def _question_view(room, pid=None):
    q, quest = room['q'], room['questions'][room['qi']]
    out = {
        'block': quest['block'], 'topic': quest['topic'], 'question': quest['question'],
        'options': quest['options'], 'start': q['start'], 'end': q['end'],
        'answered': len(q['answers']),
        'eligible': sum(1 for p in room['players'].values() if not p['blocked_now']),
    }
    turn = room['players'].get(q.get('turn') or '')
    if turn:
        # por vez: todos acompanham a jogada de quem está respondendo
        out['turn'] = {'id': turn['id'], 'name': turn['name'], 'color': turn['color']}
        out['eligible'] = 1
        out['turn_elim'] = _elim_of(q, turn['id'])
        ta = q['answers'].get(turn['id'])
        if ta:
            out['turn_pick'] = ta['idx']
    if quest.get('time'):
        out['duration'] = quest['time']
    if quest.get('image'):
        out['image'] = quest['image']
    if quest.get('poll'):
        out['poll'] = True
    if q.get('paused_at'):
        out['paused'] = True
        out['remaining'] = max(0.0, q['end'] - q['paused_at'])
    if room['phase'] == 'reveal':
        nxt = next_at(room)
        if nxt is not None:
            out['next_at'] = nxt
        dist = [0] * len(quest['options'])
        for a in q['answers'].values():
            dist[a['idx']] += 1
        out['dist'] = dist
        w = room['players'].get(q['winner']) if q['winner'] else None
        out.update(correct=quest['correct'], explanation=quest['explanation'], reference=quest['reference'],
                   winner={'id': w['id'], 'name': w['name'], 'points': q['win_points'],
                           'time': q.get('win_time')} if w else None)
    return out


def board_visible(room):
    mode, ph = room['settings'].get('board_mode', 'live'), room['phase']
    return ph == 'finished' or mode == 'live' or (mode == 'reveal' and ph == 'reveal')


def _targets(room):
    """Lista de rivais para os poderes de ataque (sem pontuação, para não vazar o placar)."""
    return [{'id': r['id'], 'name': r['name'], 'color': r['color'], 'blocked': r['blocked'],
             'sealed': r['sealed'], 'trap': r['trap'], 'stealable': r['stealable']}
            for r in sorted(_board(room), key=lambda r: r['name'].lower())]


def public_events(room, limit=15):
    return room['events'][-limit:][::-1]


def host_view(room):
    v = {
        'role': 'host', 'code': room['code'], 'phase': room['phase'], 'settings': room['settings'],
        'qi': room['qi'], 'total': game_total(room), 'bank_total': bank_size(room), 'board': _board(room),
        'events': public_events(room), 'now': time.time(), 'custom_quiz': room['custom_quiz'],
        'thresholds': room['settings'].get('thresholds', THRESHOLDS), 'quiz_title': room.get('quiz_title', ''),
        'board_visible': board_visible(room), 'auto_hold': room.get('auto_hold', False),
        'order': [{'id': i, 'name': room['players'][i]['name']} for i in turn_order(room)],
        'reactions': [r for r in room.get('reactions', []) if time.time() - r['t'] < 10],
        'requests': [{'id': r['id'], 'name': r['name'], 't': r['t']}
                     for r in room.get('requests', {}).values() if r['status'] == 'pending'],
    }
    if room['phase'] == 'lobby':
        v['quiz'] = room['questions']             # só o apresentador vê (inclui gabarito)
    if room['phase'] in ('open', 'reveal'):
        v['question'] = _question_view(room)
    return v


def player_view(room, pid):
    p = room['players'][pid]
    v = {
        'role': 'player', 'code': room['code'], 'phase': room['phase'], 'settings': room['settings'],
        'qi': room['qi'], 'total': game_total(room), 'bank_total': bank_size(room), 'board': _board(room),
        'events': public_events(room), 'now': time.time(), 'thresholds': room['settings'].get('thresholds', THRESHOLDS),
        'quiz_title': room.get('quiz_title', ''), 'targets': _targets(room), 'board_visible': board_visible(room),
        'me': {
            'id': p['id'], 'name': p['name'], 'color': p['color'], 'score': p['score'],
            'correct': p['correct'], 'streak': p['streak'], 'powers': p['powers'],
            'unlocked': {k: is_unlocked(room, p, k) for k in POWERS},
            'powers_on': {k: power_on(room, k) for k in POWERS},
            'blocked_now': p['blocked_now'], 'blocked_next': p['blocked_next'],
            'sealed': p['sealed'], 'trap': bool(p['trap']),
            'nudges_left': max(0, room['settings'].get('nudge_limit', 2) - p.get('nudges_used', 0)),
            'inbox': [m for m in p.get('inbox', []) if time.time() - m['t'] < 30],
            'broadcasts': [b for b in room.get('broadcasts', []) if time.time() - b['t'] < 10],
        },
    }
    v['my_rank'] = next((i + 1 for i, r in enumerate(v['board']) if r['id'] == pid), None)
    if not v['board_visible']:
        v['board'] = []
        v['my_rank'] = None
    if room['phase'] in ('open', 'reveal'):
        q = room['q']
        qv = _question_view(room, pid)
        mods = q['mods'].get(pid, {})
        ans = q['answers'].get(pid)
        if q.get('turn') and q['turn'] != pid:
            status = 'spectator'
        elif p['blocked_now']:
            status = 'blocked'
        elif q['winner'] == pid:
            status = 'winner'
        elif ans and ans['correct'] is None:
            status = 'voted'
        elif ans and ans['correct']:
            status = 'late'
        elif ans:
            status = 'wrong'
        else:
            status = 'none'
        mods = _mods_of(q, pid)
        qv.update(
            elim=_elim_of(q, pid), status=status, used=q['used'].get(pid, []),
            mods={k: bool(mods.get(k)) for k in ('double', 'allin', 'pvp', 'shield', 'streak_shield', 'hint')},
            pending_card=pid in q['pending'],
            my_pick=ans['idx'] if ans else None,
            my_points=ans.get('points', 0) if ans else 0,
        )
        if mods.get('hint'):
            quest = room['questions'][room['qi']]
            qv['hint'] = quest['hint'] or quest['reference'] or quest['topic']
        v['question'] = qv
    return v
