"""Arena Quiz Multiplayer - servidor Flask (compatível com PythonAnywhere).

* Sem WebSockets: as telas fazem polling (1x por segundo) em /api/state/<codigo>.
* Estado das salas em SQLite (vários workers enxergam o mesmo estado).
* O relógio é do servidor: a pergunta fecha sozinha quando o tempo acaba.
"""
import io
import json
import os
import secrets
import sqlite3
import time

import qrcode
import qrcode.image.svg
from flask import Flask, Response, jsonify, redirect, render_template, request, url_for

import game
import quiz_templates
from game import GameError

app = Flask(__name__)
APP_VERSION = '1.4.1'
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
app.config['JSON_AS_ASCII'] = False
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024

DB_PATH = os.environ.get('QUIZ_DB', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'rooms.sqlite3'))
HOST_PASSWORD = os.environ.get('HOST_PASSWORD', '')       # opcional: protege a criação de salas
ROOM_TTL = 60 * 60 * 24                                    # salas somem após 24h sem uso


def _static_stamp():
    """Data da última alteração dos arquivos estáticos (muda a cada git pull/atualização)."""
    try:
        return int(max(os.stat(os.path.join(STATIC_DIR, f)).st_mtime for f in os.listdir(STATIC_DIR)))
    except (OSError, ValueError):
        return 0


@app.context_processor
def static_versioning():
    """Todo arquivo de /static ganha ?v=<data>: o navegador/celular nunca mistura JS antigo (do cache) com página nova."""
    def versioned_url_for(endpoint, **values):
        if endpoint == 'static' and 'filename' in values:
            try:
                values['v'] = int(os.stat(os.path.join(STATIC_DIR, values['filename'])).st_mtime)
            except OSError:
                pass
        return url_for(endpoint, **values)
    return dict(url_for=versioned_url_for, APP_VERSION=APP_VERSION)


# --------------------------------------------------------------------------
# Banco
# --------------------------------------------------------------------------
def _connect():
    c = sqlite3.connect(DB_PATH, timeout=20, isolation_level=None)
    c.execute('CREATE TABLE IF NOT EXISTS rooms (code TEXT PRIMARY KEY, data TEXT NOT NULL, updated REAL NOT NULL)')
    return c


def with_room(code, fn):
    """Carrega a sala, roda fn(room) dentro de uma transação e grava se mudou."""
    code = (code or '').strip().upper()
    c = _connect()
    try:
        c.execute('BEGIN IMMEDIATE')
        row = c.execute('SELECT data FROM rooms WHERE code=?', (code,)).fetchone()
        if not row:
            raise GameError('room_not_found', 404)
        room = json.loads(row[0])
        try:
            game.check_presence(room)         # sala encerrada / organizador ou participante ausente há mais de 5 min
            result = fn(room)
        except GameError:
            # mesmo com erro, guardamos efeitos do tick (ex.: pergunta fechada)
            _save_if_changed(c, code, room, row[0])
            c.execute('COMMIT')
            raise
        _save_if_changed(c, code, room, row[0])
        c.execute('COMMIT')
        return result
    except BaseException:
        try:
            c.execute('ROLLBACK')
        except sqlite3.Error:
            pass
        raise
    finally:
        c.close()


def _save_if_changed(c, code, room, raw_before):
    room['v'] = room.get('v', 0) + 0
    raw = json.dumps(room, ensure_ascii=False, separators=(',', ':'))
    if raw != raw_before:
        c.execute('UPDATE rooms SET data=?, updated=? WHERE code=?', (raw, time.time(), code))


def create_room_row(room):
    c = _connect()
    try:
        c.execute('DELETE FROM rooms WHERE updated < ?', (time.time() - ROOM_TTL,))
        c.execute('DELETE FROM rooms WHERE data LIKE \'%"closed":"%\' AND updated < ?', (time.time() - 3600,))   # encerradas há +1 h
        c.execute('INSERT INTO rooms (code, data, updated) VALUES (?,?,?)',
                  (room['code'], json.dumps(room, ensure_ascii=False, separators=(',', ':')), time.time()))
    finally:
        c.close()


def room_exists(code):
    c = _connect()
    try:
        return c.execute('SELECT 1 FROM rooms WHERE code=?', ((code or '').upper(),)).fetchone() is not None
    finally:
        c.close()


# --------------------------------------------------------------------------
# Erros e utilidades
# --------------------------------------------------------------------------
@app.errorhandler(GameError)
def handle_game_error(e):
    return jsonify(error=e.code), e.status


@app.errorhandler(413)
def too_big(_):
    return jsonify(error='quiz_invalid'), 413


def body():
    return request.get_json(silent=True) or {}


def check_host(room, token):
    if not token or not secrets.compare_digest(str(token), room['host_token']):
        raise GameError('bad_auth', 403)


# --------------------------------------------------------------------------
# Páginas
# --------------------------------------------------------------------------
@app.route('/')
def index():
    return render_template('index.html', host_password=bool(HOST_PASSWORD))


@app.route('/host')
def host_page():
    return render_template('host.html', host_password=bool(HOST_PASSWORD))


@app.route('/host/classic')
def host_classic_page():
    return render_template('host_classic.html')


def room_mode(code):
    c = _connect()
    try:
        row = c.execute('SELECT data FROM rooms WHERE code=?', ((code or '').upper(),)).fetchone()
    finally:
        c.close()
    return json.loads(row[0])['settings'].get('mode', 'arena') if row else None


@app.route('/play')
def play_page():
    # a sala decide o visual: Arena (gamer) ou Clássico (corporativo)
    if room_mode(request.args.get('code')) == 'classic':
        return render_template('play_classic.html')
    return render_template('play.html')


@app.route('/join')
def join_redirect():
    code = (request.args.get('code') or '').upper()
    return redirect(f'/play?code={code}')


@app.route('/qr/<code>.svg')
def qr_svg(code):
    code = code.upper()
    if not room_exists(code):
        return Response(status=404)
    url = request.host_url.rstrip('/') + '/join?code=' + code
    img = qrcode.make(url, image_factory=qrcode.image.svg.SvgPathImage, box_size=10, border=2)
    buf = io.BytesIO()
    img.save(buf)
    return Response(buf.getvalue(), mimetype='image/svg+xml', headers={'Cache-Control': 'public, max-age=3600'})


# --------------------------------------------------------------------------
# API
# --------------------------------------------------------------------------
@app.post('/api/room')
def api_create_room():
    b = body()
    if HOST_PASSWORD and not secrets.compare_digest(str(b.get('password', '')), HOST_PASSWORD):
        raise GameError('bad_password', 403)
    quiz = b.get('quiz') or None
    for _ in range(30):
        code = game.new_code()
        if not room_exists(code):
            break
    host_token = secrets.token_urlsafe(16)
    room = game.new_room(code, host_token, b.get('settings'), quiz, b.get('quiz_title'))
    create_room_row(room)
    return jsonify(code=code, host_token=host_token)


@app.post('/api/join')
def api_join():
    b = body()

    def fn(room):
        p = game.add_player(room, b.get('name'))
        return {'pid': p['id'], 'token': p['token'], 'name': p['name']}
    return jsonify(with_room(b.get('code'), fn))


@app.get('/api/state/<code>')
def api_state(code):
    role = request.args.get('role', 'player')
    token = request.args.get('token', '')
    pid = request.args.get('pid', '')

    def fn(room):
        game.tick(room)
        if role == 'host':
            check_host(room, token)
            game.touch_host(room)                               # sala "viva" para a lista pública e contra a expiração
            return game.host_view(room)
        game.get_player(room, pid, token)
        return game.player_view(room, pid)
    return jsonify(with_room(code, fn))


@app.post('/api/host/<code>/<action>')
def api_host_action(code, action):
    b = body()

    def fn(room):
        check_host(room, b.get('token'))
        game.touch_host(room)
        game.tick(room)
        if action == 'settings':
            lobby = room['phase'] == 'lobby'
            game.update_settings(room, b.get('settings'))
            if not lobby:
                if b.get('quiz'):
                    raise GameError('bad_phase')
                return {'ok': True}
            if b.get('quiz'):
                room['questions'] = game.normalize_quiz(b['quiz'])
                room['custom_quiz'] = True
                room['quiz_title'] = str(b.get('quiz_title') or '')[:80]
            elif b.get('reset_quiz') or not room['custom_quiz']:
                room['questions'] = game.normalize_quiz(
                    json.loads(json.dumps(game.DEFAULT_QUIZ[room['settings']['lang']])))
                room['custom_quiz'] = False
                room['quiz_title'] = ''
            for p in room['players'].values():
                p['powers'] = {k: room['settings']['charges'] for k in game.POWERS}
        elif action == 'hostpower':
            return game.host_power(room, b.get('power'), b)
        elif action == 'hostemoji':
            return game.host_emoji(room, b.get('emoji'))
        else:
            game.host_action(room, action, b.get('pid') or b.get('rid'))
        return {'ok': True}
    return jsonify(with_room(code, fn))


@app.post('/api/answer')
def api_answer():
    b = body()

    def fn(room):
        game.tick(room)
        game.get_player(room, b.get('pid'), b.get('token'))
        return game.answer(room, b['pid'], b.get('idx'))
    return jsonify(with_room(b.get('code'), fn))


@app.post('/api/leave')
def api_leave():
    """Participante clica em Sair: sai da sala na hora (sem esperar os 5 min)."""
    b = body()

    def fn(room):
        game.get_player(room, b.get('pid'), b.get('token'))
        game.leave(room, b['pid'])
        return {'ok': True}
    return jsonify(with_room(b.get('code'), fn))


@app.post('/api/power')
def api_power():
    b = body()

    def fn(room):
        game.tick(room)
        game.get_player(room, b.get('pid'), b.get('token'))
        return game.use_power(room, b['pid'], b.get('power'), b)
    return jsonify(with_room(b.get('code'), fn))


# --------------------------------------------------------------------------
# Salas públicas: lista e pedidos de entrada (o código só é revelado após aprovação)
# --------------------------------------------------------------------------
PUBLIC_ALIVE = 120      # a sala some da lista se o apresentador fechar a tela por mais de 2 min


def _public_rooms():
    c = _connect()
    try:
        rows = c.execute('SELECT code, data FROM rooms WHERE updated > ?', (time.time() - ROOM_TTL,)).fetchall()
    finally:
        c.close()
    out = []
    for code, raw in rows:
        room = json.loads(raw)
        if (room['settings'].get('visibility') == 'public' and room.get('pub_id') and room['phase'] != 'finished'
                and not room.get('closed')
                and time.time() - room.get('host_seen', 0) < PUBLIC_ALIVE):
            out.append((code, room))
    return out


def _code_for_public(pub_id):
    for code, room in _public_rooms():
        if room['pub_id'] == pub_id:
            return code
    raise GameError('room_not_found', 404)


@app.get('/api/public')
def api_public_list():
    rooms = [game.public_info(r) for _, r in _public_rooms()]
    rooms.sort(key=lambda r: (r['phase'] != 'lobby', -r['players']))
    return jsonify(rooms[:50])


@app.post('/api/public/<pub_id>/request')
def api_public_request(pub_id):
    b = body()
    return jsonify(with_room(_code_for_public(pub_id), lambda room: game.request_join(room, b.get('name'))))


@app.get('/api/public/<pub_id>/request/<rid>')
def api_public_request_status(pub_id, rid):
    secret = request.args.get('secret', '')
    c = _connect()
    try:
        rows = c.execute('SELECT code, data FROM rooms').fetchall()
    finally:
        c.close()
    code = next((cd for cd, raw in rows if json.loads(raw).get('pub_id') == pub_id), None)
    if not code:
        raise GameError('request_not_found', 404)
    return jsonify(with_room(code, lambda room: game.request_status(room, rid, secret)))


@app.get('/api/templates')
def api_templates():
    return jsonify(quiz_templates.list_templates(request.args.get('lang', 'pt')))


@app.get('/api/templates/<tid>')
def api_template(tid):
    tpl = quiz_templates.get_template(tid, request.args.get('lang', 'pt'))
    if not tpl:
        raise GameError('template_not_found', 404)
    return jsonify(tpl)


@app.post('/api/nudge')
def api_nudge():
    b = body()

    def fn(room):
        game.get_player(room, b.get('pid'), b.get('token'))
        return game.nudge(room, b['pid'], b.get('target'), b.get('kind'))
    return jsonify(with_room(b.get('code'), fn))


@app.post('/api/react')
def api_react():
    b = body()

    def fn(room):
        game.get_player(room, b.get('pid'), b.get('token'))
        return game.react(room, b['pid'], b.get('emoji'))
    return jsonify(with_room(b.get('code'), fn))


@app.get('/version')
def version():
    """Mostra qual versão está no ar (útil para conferir se a atualização chegou ao servidor)."""
    resp = jsonify(version=APP_VERSION, presence_timeout=game.PRESENCE_TIMEOUT, static_updated=_static_stamp(),
                   features=['arsenal', 'scope', 'presence', 'nudge_always_visible'])
    resp.headers['Cache-Control'] = 'no-store'
    return resp


@app.get('/healthz')
def healthz():
    return 'ok'


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=bool(os.environ.get('DEBUG')))
