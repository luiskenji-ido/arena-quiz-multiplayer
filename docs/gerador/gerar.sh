#!/usr/bin/env bash
# Gera PRD, PTD e DTD (.docx) a partir dos diagramas em docs/diagramas/*.png
set -e
cd "$(dirname "$0")/.."
for d in prd ptd dtd; do node gerador/$d.js; done
python3 gerador/corrigir_bookmarks.py PRD_Arena_Quiz_Multiplayer.docx PTD_Arena_Quiz_Multiplayer.docx DTD_Arena_Quiz_Multiplayer.docx
