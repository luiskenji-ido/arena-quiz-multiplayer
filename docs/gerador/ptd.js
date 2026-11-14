// PTD – Product Technical Document
const { build } = require('./docgen');
const path = require('path');

build({
  kind: 'PTD – Product Technical Document',
  title: 'Arena Quiz Multiplayer',
  subtitle: 'Visão técnica da solução: arquitetura, componentes, sincronização, segurança, implantação e qualidade',
  version: '1.2', date: '14/11/2026', status: 'Atualizado com o escopo da partida',
  blocks: [
    ['h1', '1. Objetivo do documento'],
    ['p', 'Este documento descreve **como** o Arena Quiz Multiplayer foi construído, no nível de produto. É para quem vai manter, hospedar ou evoluir a plataforma. Os requisitos de negócio estão no PRD, e os detalhes de implementação (campos, rotas, algoritmos) estão no DTD.'],
    ['table', { title: 'Histórico de versões', widths: [1, 2, 5], header: ['Versão', 'Data', 'Descrição'], rows: [
      ['1.0', '14/11/2026', 'Documento inicial baseado no protótipo v9.']] }],

    ['h1', '2. Visão geral da solução'],
    ['p', 'A plataforma é uma aplicação web **Flask** (Python) com páginas renderizadas por **Jinja** e lógica de interface em **JavaScript puro**, sem framework. Cada sala de jogo é um documento JSON guardado numa linha de uma tabela **SQLite**. As telas (telão e celulares) consultam o servidor a cada segundo (**polling**). O relógio oficial é o do servidor, e as telas apenas exibem o tempo restante.'],
    ['h2', '2.1 Decisões de arquitetura'],
    ['table', { title: 'Decisões principais', widths: [3, 5], header: ['Decisão', 'Motivo'], rows: [
      ['Polling HTTP (1 s) em vez de WebSockets', 'O PythonAnywhere só executa aplicações WSGI. Polling funciona em qualquer hospedagem e é suficiente para o ritmo de um quiz.'],
      ['Estado da sala em SQLite (JSON por sala)', 'Hospedagens WSGI podem rodar vários processos, que não compartilham memória. O SQLite garante uma única fonte da verdade e transações atômicas.'],
      ['Transação BEGIN IMMEDIATE por requisição', 'Serializa as escritas: o primeiro acerto, as cargas de poderes e os pedidos de entrada nunca entram em condição de corrida.'],
      ['"tick" preguiçoso a cada requisição', 'Fecha perguntas e avança automaticamente sem threads em segundo plano, que não são permitidas em hospedagens simples.'],
      ['Regras isoladas em game.py', 'Testáveis sem servidor; app.py só cuida de HTTP e banco.'],
      ['Visões filtradas por papel', 'O apresentador e cada jogador recebem só o que podem ver: o gabarito nunca vai para o celular antes do fim da pergunta.'],
      ['Temas em CSS/SVG puro', 'Sem imagens externas: leve, sem direitos de imagem, adaptável a qualquer tela.']] }],
    ['img', '01_arquitetura.png', 'Arquitetura geral'],

    ['h2', '2.2 Pilha tecnológica'],
    ['table', { title: 'Tecnologias', widths: [2, 2, 4], header: ['Camada', 'Tecnologia', 'Uso'], rows: [
      ['Servidor', 'Python 3.10+ e Flask ≥ 2.3', 'Rotas, API JSON, renderização Jinja.'],
      ['QR code', 'qrcode ≥ 7.4 (SVG)', 'QR code da sala apontando para /join?code=XXXX.'],
      ['Banco', 'SQLite (módulo sqlite3)', 'Tabela rooms(code, data JSON, updated).'],
      ['Interface', 'HTML + JavaScript puro', 'Telas, polling, animações (dado, cartas), sons com Web Audio API.'],
      ['Estilo', 'Tailwind CSS (CDN) + CSS próprio', 'Layout utilitário; temas em style.css, corp.css, themes.css, showthemes.css, inclusion.css, kids.css.'],
      ['Ícones e fontes', 'Font Awesome 6.5 + Google Fonts', 'Orbitron, Inter, Montserrat, Poppins, Fredoka, Atkinson Hyperlegible e outras.'],
      ['Testes', 'pytest + Playwright (Chromium)', '36 testes de regras/API e 6 roteiros de navegador.'],
      ['Hospedagem', 'PythonAnywhere (WSGI)', 'Também roda localmente com python app.py.']] }],

    ['h1', '3. Componentes e módulos'],
    ['img', '12_modulos.png', 'Módulos do backend, páginas e recursos estáticos'],
    ['table', { title: 'Responsabilidade dos arquivos', widths: [2, 6], header: ['Arquivo', 'Responsabilidade'], rows: [
      ['app.py', 'Rotas de páginas e API, conexão SQLite, transação por sala (with_room), QR code, salas públicas e templates.'],
      ['game.py', 'Regras: criação de sala e jogadores, configurações, ciclo da pergunta, pontuação Arena/Clássico, poderes, modo por vez, pedidos de entrada, chamar atenção, reações e visões por papel.'],
      ['quiz_templates.py', 'Templates de quiz (PT/EN/ES) em formato compacto; corporativos e diversão.'],
      ['default_quiz.json', 'Quiz padrão de exemplo (4 perguntas por idioma).'],
      ['templates/index.html', 'Entrada por código e lista de salas públicas com pedido de entrada.'],
      ['templates/host.html / host_classic.html', 'Telão do apresentador nos modos Arena e Clássico.'],
      ['templates/play.html / play_classic.html', 'Tela do celular nos modos Arena e Clássico.'],
      ['templates/_host_modals.html', 'Janelas compartilhadas: Configurar Jogo, Carregar Quiz, Como Jogar e pedidos de entrada.'],
      ['static/common.js', 'Dicionário de idiomas, chamadas à API, sons curtos, patentes, manual.'],
      ['static/i18n_extra.js', 'Textos adicionais (modos, controles, temas, inclusão etc.).'],
      ['static/host_core.js', 'Sessão do apresentador, polling, barra de controles, configurações, aplicação do quiz e pedidos.'],
      ['static/quizkit.js', 'Criação de quiz: templates, arquivo JSON/CSV, texto rápido, editor visual, IA.'],
      ['static/fun.js', 'Temas e tons, palco do telão, modo acessível, mudo, chamar atenção, reações, música de tensão, maximizar e tela cheia.'],
      ['static/*.css', 'Estilos base (style.css), Clássico (corp.css) e temas (themes, showthemes, inclusion, kids).']] }],

    ['h1', '4. Comunicação e sincronização'],
    ['p', 'Todas as telas chamam `GET /api/state/<código>` a cada segundo. Em cada chamada o servidor abre uma transação, executa `tick()` e devolve a visão adequada ao papel. A gravação só acontece se o estado mudou, o que mantém as leituras baratas. A diferença entre o relógio do servidor e o do aparelho (offset) é calculada em cada resposta, e a contagem regressiva é desenhada localmente a cada 200 ms.'],
    ['img', '04_polling_tick.png', 'Polling, tick e gravação condicional'],
    ['bullets', [
      '**Fechamento automático**: ao fim do tempo (sem pausa), quando todos responderam ou, no modo por vez, quando o jogador da vez respondeu.',
      '**Avanço automático**: após o resultado, a próxima pergunta começa quando `reveal_at + auto_delay` é atingido, salvo se o apresentador segurar.',
      '**Pausa**: guarda `paused_at`. Ao retomar, o fim da pergunta é empurrado pelo tempo pausado.',
      '**Ações** (responder, poderes, controles) usam POST e retornam imediatamente. A tela faz um novo polling logo em seguida.']],
    ['img', '03_ciclo_partida.png', 'Estados da partida'],

    ['h1', '5. Persistência'],
    ['bullets', [
      'Tabela única `rooms(code TEXT PRIMARY KEY, data TEXT, updated REAL)`; caminho configurável por `QUIZ_DB`.',
      'Cada requisição abre a conexão com timeout de 20 s, faz `BEGIN IMMEDIATE`, lê, executa a regra e só regrava se o JSON mudou.',
      'Mesmo quando a regra devolve erro, as mudanças do tick (ex.: pergunta fechada) são gravadas.',
      'Salas sem atualização há mais de 24 h são apagadas na criação de novas salas.',
      'Salas públicas só aparecem na lista se o telão do apresentador consultou o servidor nos últimos 2 minutos (`host_seen`, atualizado no máximo a cada 30 s).']],
    ['img', '11_modelo_dados.png', 'Modelo de dados da sala'],

    ['h1', '6. Regras do jogo (visão técnica)'],
    ['h2', '6.1 Modos e respostas'],
    ['p', 'O servidor decide o primeiro acerto pela ordem de chegada das requisições, dentro da transação, e nunca pelo relógio do aparelho. No modo Clássico a resposta devolve apenas `{accepted: true}` para não revelar o acerto antes da hora.'],
    ['img', '05_resposta_arena.png', 'Resposta no modo Arena'],
    ['img', '06_resposta_classico.png', 'Resposta no modo Clássico'],
    ['img', '07_modo_por_vez.png', 'Modo "Por vez"'],
    ['h2', '6.2 Poderes'],
    ['p', 'Os poderes valem só no modo Arena. Cada um tem meta de desbloqueio, cargas por partida, limite de 1 uso por pergunta e pode ser ligado ou desligado pelo organizador. Poderes próprios exigem pergunta aberta e que o jogador ainda não tenha respondido, e no modo por vez exigem que seja a vez dele. Poderes de ataque funcionam durante a pergunta e no resultado.'],
    ['img', '08_poderes.png', 'Poderes'],
    ['h2', '6.3 Escopo da partida'],
    ['p', 'O quiz carregado funciona como um **banco**. As configurações `q_limit` (0 = todas, ou 1 a 200) e `q_pick` (`first` ou `random`) só podem mudar no lobby. Ao iniciar (`start`), `_build_round()` guarda o quiz completo em `room.bank` e coloca em `room.questions` apenas as perguntas da partida; assim todo o restante do motor (tempo, respostas, placar, pódio) continua igual. Ao reiniciar (`restart`), `_restore_bank()` devolve o quiz completo, e um novo sorteio acontece no próximo início.'],
    ['img', '18_escopo_partida.png', 'Escopo da partida'],
    ['bullets', [
      '`total` nas visões passa a ser `game_total()`: no lobby, as perguntas que serão usadas; durante o jogo, as separadas no início. A visão do apresentador também envia `bank_total` (tamanho do quiz completo).',
      'A janela Configurar Jogo calcula, só no navegador, quantas perguntas cada jogador responde no modo Por vez e a duração estimada: N × (tempo médio da pergunta + tempo de resultado).',
      'Escolher todas as perguntas grava `q_limit = 0`, para que um quiz maior carregado depois continue sendo usado por inteiro.']],

    ['h1', '7. Salas públicas e interações'],
    ['img', '09_sala_publica.png', 'Pedido de entrada em sala pública'],
    ['img', '14_interacoes.png', 'Chamar atenção e reações'],
    ['bullets', [
      'A lista pública mostra nome, modo, idioma, número de jogadores e fase, sem o código da sala.',
      'O pedido usa um id e um segredo. Só quem tem o segredo consulta o status. Na aprovação o servidor já cria o jogador e entrega token e código.',
      'Chamar atenção: o alvo recebe a mensagem numa caixa de entrada (inbox), lida no polling, e o som é gerado no próprio aparelho pela Web Audio API.',
      'Reações: emojis de uma lista fixa, no máximo um a cada 0,8 s por jogador, e o telão mostra os dos últimos 10 s.']],

    ['h2', '7.1 Arsenal e emojis do organizador'],
    ['p', 'A barra flutuante do organizador (`mountHostDock()` em host_core.js) existe nas duas telas de apresentador. O botão 🧰 Arsenal abre uma janela que chama `POST /api/host/<código>/hostpower`; os emojis chamam `POST /api/host/<código>/hostemoji`. Ambas as rotas exigem o token do apresentador.'],
    ['img', '17_arsenal_organizador.png', 'Arsenal e emojis do organizador'],
    ['bullets', [
      '**Efeitos para todos** ficam no estado da pergunta, não em cada jogador: `q.global` (double, allin, hint, streak_shield, shield), `q.elim_all` (alternativas eliminadas para todos) e `q.gshield_used` (quem já gastou o Seguro geral). As funções `_mods_of()` e `_elim_of()` somam esses efeitos aos do próprio jogador, então pontuação, escudo e visão do celular funcionam igual nos modos Arena e Clássico.',
      '**Tempo extra** (+15 s, dado e carta) aumenta `q.end` e `q.duration`; o relógio de todos se ajusta no próximo polling.',
      '**Alvo e cargas** reutilizam os mesmos campos dos poderes dos jogadores (`blocked_next`, `sealed`, `trap`, `powers`) e por isso só valem no Arena.',
      '**Emojis**: lista branca `HOST_EMOJIS`, limite de 1 a cada 0,35 s; cada item vai para `room.broadcasts` (celulares, via `me.broadcasts` dos últimos 10 s) e para `room.reactions` (telão, marcado `host: true`). O celular usa um conjunto de ids já vistos para tocar cada emoji uma única vez.',
      '**Avisos**: cada ação gera um evento `ev_host_*`; o celular mostra como aviso 🎤 os eventos mais novos que o último visto.']],

    ['h1', '8. Interface, temas e acessibilidade'],
    ['p', 'A tela é escolhida pelo modo da sala: `/play` entrega a versão Arena ou Clássico conforme a sala, e o telão troca de página sozinho se o organizador mudar o modo. Os temas são aplicados por atributos no elemento raiz (`data-theme`, `data-variant`) e por classes (`show-theme`, `show-dark`, `show-light`). Nos temas de auditório, inclusão e infantil, a pergunta no telão é desenhada como um **palco** em tela cheia por `renderStage()`.'],
    ['img', '15_temas.png', 'Temas, tons e acessibilidade'],
    ['bullets', [
      '**Modo acessível** (por aparelho, guardado no navegador): fonte Atkinson Hyperlegible, 118% de tamanho, animações cortadas, foco destacado, alvos de 44 px.',
      '**Sinais além da cor**: ✓ na resposta certa e ✗ na errada em todos os temas; formas ▲ ◆ ● ■ no Clássico.',
      '**Idiomas**: dicionários PT/EN/ES; seletor em todas as telas; o quiz padrão segue o idioma escolhido pelo organizador.',
      '**Som**: desbloqueado no primeiro toque; botão de mudo por aparelho; música de tensão gerada em tempo real (sem arquivos de áudio).']],

    ['h1', '9. Segurança'],
    ['table', { title: 'Controles de segurança', widths: [3, 5], header: ['Tema', 'Como é tratado'], rows: [
      ['Autenticação do apresentador', 'Token aleatório (secrets.token_urlsafe) criado com a sala; comparação em tempo constante.'],
      ['Autenticação do jogador', 'pid + token por jogador; toda ação verifica os dois.'],
      ['Criação de salas', 'Senha opcional por variável de ambiente HOST_PASSWORD.'],
      ['Vazamento de gabarito', 'Visões por papel; resposta certa só aparece no resultado; Clássico não revela acerto ao responder.'],
      ['Sala pública', 'Código não aparece na lista; status do pedido exige segredo; limite de 30 pedidos pendentes.'],
      ['Entrada de dados', 'Quiz validado no servidor (2–6 alternativas, tempo 5–300 s, imagem só http/https, máx. 200 perguntas, corpo até 1 MB); nomes até 20 caracteres.'],
      ['Abuso', 'Limite de reações (0,8 s) e de emojis do organizador (0,35 s), limite de chamadas de atenção, emojis em lista branca, arsenal só com token do apresentador, máx. 60 jogadores.'],
      ['XSS', 'Todo texto vindo do usuário é escapado (esc()) antes de ir para o HTML.']] }],

    ['h1', '10. Implantação'],
    ['img', '13_deploy.png', 'Implantação no PythonAnywhere'],
    ['numbered', [
      'Enviar o projeto para /home/USUARIO/arena_multiplayer (git clone ou upload do .zip).',
      'Criar o ambiente: `mkvirtualenv arena --python=python3.10` e `pip install -r requirements.txt`.',
      'Aba Web → Add a new web app → Manual configuration → mesma versão do Python.',
      'Informar o virtualenv e colar `wsgi_pythonanywhere.py` no arquivo WSGI (ajustar usuário e HOST_PASSWORD).',
      'Opcional: mapear /static/ para a pasta static do projeto.',
      'Reload. Endereço: https://USUARIO.pythonanywhere.com.']],
    ['table', { title: 'Variáveis de ambiente', widths: [2, 2, 4], header: ['Variável', 'Padrão', 'Descrição'], rows: [
      ['HOST_PASSWORD', '(vazia)', 'Se definida, exige senha para criar salas.'],
      ['QUIZ_DB', 'rooms.sqlite3 na pasta do app', 'Caminho do banco SQLite.'],
      ['PORT', '5000', 'Porta ao rodar localmente com python app.py.'],
      ['DEBUG', '(vazia)', 'Se definida, ativa o modo debug do Flask (recarrega ao salvar).']] }],

    ['h1', '11. Qualidade e testes'],
    ['table', { title: 'Suítes de teste', widths: [2, 2, 4], header: ['Suíte', 'Ferramenta', 'Cobertura'], rows: [
      ['tests/test_game.py', 'pytest', '45 testes: pontuação, autenticação, tempo, pausa, placar oculto, poderes, enquete, Clássico, por vez, salas públicas, avanço automático, chamar atenção, reações, temas, arsenal e emojis do organizador.'],
      ['tests/e2e.js', 'Playwright', 'Partida Arena com 2 celulares, dado, cartas, bloqueio e roubo.'],
      ['tests/e2e2.js', 'Playwright', 'Criação de quiz: JSON, CSV, texto rápido, editor e templates.'],
      ['tests/e2e3.js', 'Playwright', 'Clássico corporativo, pausa, placar, finalizar, reiniciar e troca de modo.'],
      ['tests/e2e4.js', 'Playwright', 'Sala pública (aceitar/recusar) e avanço automático.'],
      ['tests/e2e5.js', 'Playwright', 'Modo por vez nos modos Arena e Clássico.'],
      ['tests/e2e6.js', 'Playwright', 'Chamar atenção, reações, música de tensão e temas.'],
      ['tests/e2e7.js', 'Playwright', 'Arsenal e emojis do organizador nos modos Arena e Clássico.'],
      ['tests/e2e8.js', 'Playwright', 'Escopo da partida: 90 de 120 perguntas, sorteio, reinício e modo Clássico.']] }],
    ['code', 'pip install pytest\npytest -q tests\nQUIZ_DB=/tmp/e2e.db PORT=5055 python app.py   # em outro terminal\nnode tests/e2e.js'],

    ['h1', '12. Limitações conhecidas e evolução'],
    ['table', { title: 'Limitações', widths: [3, 5], header: ['Limitação', 'Caminho de evolução'], rows: [
      ['Polling consome CPU proporcional ao número de telas', 'Aumentar o intervalo, usar plano pago, ou migrar para WebSockets/SSE em hospedagem que suporte.'],
      ['Estilos dependem de CDNs', 'Compilar o Tailwind e servir fontes localmente.'],
      ['Sem contas e sem histórico', 'Adicionar autenticação de organizador e armazenamento de quizzes e resultados.'],
      ['Código de sala pública pode ser repassado', 'Exigir aprovação também na entrada por código.'],
      ['iPhone (Safari) não permite tela cheia em páginas', 'Usar "Adicionar à Tela de Início" (PWA) no futuro.']] }]
  ]
}, path.join(__dirname, '..', 'PTD_Arena_Quiz_Multiplayer.docx'));
