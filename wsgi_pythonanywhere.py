# Conteúdo para colar no arquivo WSGI da aba "Web" do PythonAnywhere
# (troque SEU_USUARIO pelo seu usuário e defina uma senha de apresentador).
import os
import sys

path = '/home/SEU_USUARIO/arena_multiplayer'
if path not in sys.path:
    sys.path.insert(0, path)

os.environ['HOST_PASSWORD'] = 'troque-esta-senha'   # opcional: protege a criação de salas
# os.environ['QUIZ_DB'] = '/home/SEU_USUARIO/arena_rooms.sqlite3'   # opcional

from app import app as application  # noqa: E402
