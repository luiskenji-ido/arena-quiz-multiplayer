"""Renumera os IDs dos marcadores (bookmarks) do sumário: a biblioteca docx repete w:id."""
import re
import sys
import zipfile
import shutil
import tempfile


def fix(path):
    tmp = tempfile.mktemp(suffix='.docx')
    with zipfile.ZipFile(path) as zin, zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename == 'word/document.xml':
                xml = data.decode('utf-8')
                counter = {'n': 0}

                def start(m):
                    counter['n'] += 1
                    return re.sub(r'w:id="\d+"', f'w:id="{counter["n"]}"', m.group(0))

                def end(m):           # cada marcador fica num único parágrafo: o fim segue o último início
                    return re.sub(r'w:id="\d+"', f'w:id="{counter["n"]}"', m.group(0))

                xml = re.sub(r'<w:bookmarkStart\b[^>]*>|<w:bookmarkEnd\b[^>]*>',
                             lambda m: start(m) if m.group(0).startswith('<w:bookmarkStart') else end(m), xml)
                data = xml.encode('utf-8')
            if not item.filename.endswith('/'):
                zout.writestr(item, data)
    shutil.move(tmp, path)
    print('marcadores corrigidos:', path)


for p in sys.argv[1:]:
    fix(p)
