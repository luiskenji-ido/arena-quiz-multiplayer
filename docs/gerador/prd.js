// PRD – Product Requirements Document
const { build } = require('./docgen');
const path = require('path');

const RF = (id, desc, prio, crit) => [id, desc, prio, crit];

build({
  kind: 'PRD – Product Requirements Document',
  title: 'Arena Quiz Multiplayer',
  subtitle: 'Requisitos de produto da plataforma de quiz ao vivo para eventos, salas de aula e treinamentos',
  version: '1.1', date: '14/11/2026', status: 'Versão inicial para validação',
  blocks: [
    ['h1', '1. Controle do documento'],
    ['table', { title: 'Histórico de versões', widths: [1, 2, 5], header: ['Versão', 'Data', 'Descrição'], rows: [
      ['1.0', '14/11/2026', 'Primeira versão consolidada a partir das entregas v1 a v9 do protótipo (Arena, Clássico, salas públicas, modo por vez, interações, temas e acessibilidade).'],
      ['1.1', '14/11/2026', 'Arsenal e emojis do organizador (RF-39 a RF-43): efeitos para todos, poderes contra um participante, dar cargas e emojis enviados a todos os celulares.']] }],
    ['table', { title: 'Documentos relacionados', widths: [2, 5], header: ['Documento', 'Conteúdo'], rows: [
      ['PTD – Product Technical Document', 'Visão técnica da solução: arquitetura, componentes, segurança e implantação.'],
      ['DTD – Detail Technical Document', 'Detalhamento: modelo de dados, API, máquina de estados, algoritmos e códigos de erro.'],
      ['README.md', 'Guia rápido de instalação, uso e publicação no PythonAnywhere.']] }],

    ['h1', '2. Visão geral do produto'],
    ['h2', '2.1 Contexto e problema'],
    ['p', 'Quizzes ao vivo são usados em salas de aula, treinamentos corporativos, eventos e encontros de equipe para engajar o público e fixar conteúdo. As soluções conhecidas costumam exigir cadastro, oferecer pouca personalização visual, não ter mecânicas de jogo mais competitivas e não permitir hospedagem própria.'],
    ['p', 'O protótipo original era uma página única, em que os jogadores respondiam por vez num único computador. O objetivo agora é levar essa experiência para **vários celulares ao mesmo tempo**, mantendo o telão do apresentador como centro do jogo.'],
    ['h2', '2.2 Objetivo'],
    ['p', 'Oferecer uma plataforma web de quiz multiplayer em que o **organizador projeta o jogo** e os **participantes jogam pelo celular**, entrando por QR code, sem instalar aplicativo e sem criar conta. O produto atende a dois estilos de uso:'],
    ['bullets', [
      '**Arena**: competitivo e "gamer". Só o primeiro a acertar pontua, e os acertos destravam poderes táticos.',
      '**Clássico**: estilo corporativo e de sala de aula. Todos pontuam pela velocidade, sem poderes, com gráfico de respostas e pódio.']],
    ['h2', '2.3 Proposta de valor'],
    ['bullets', [
      'Entrada em segundos: o participante escaneia o QR code, digita o nome e já está na sala.',
      'Cinco formas de criar o quiz: templates prontos, arquivo JSON ou CSV, texto rápido, editor visual e prompt pronto para IA.',
      'Controle total do organizador: pausar, encerrar, avançar sozinho, finalizar, reiniciar, placar visível ou oculto e poderes configuráveis.',
      'Personalização visual com 16 temas (3 tons cada), incluindo temas de diversidade e inclusão e um modo acessível por aparelho.',
      'Três idiomas (português, inglês e espanhol) e hospedagem própria simples (PythonAnywhere).']],

    ['h1', '3. Público-alvo e personas'],
    ['table', { title: 'Personas', widths: [2, 3, 3], header: ['Persona', 'Necessidades', 'Como o produto atende'], rows: [
      ['**Facilitador corporativo** (RH, T&D, líderes)', 'Engajar equipes em treinamentos, onboarding e reuniões; medir entendimento; visual profissional.', 'Modo Clássico, templates corporativos (Segurança da Informação, Gestão, Atendimento, Onboarding, Pesquisa de clima), tema Corporativo, enquetes.'],
      ['**Professor / educador**', 'Revisar conteúdo de forma lúdica; turma com celulares; inclusão de todos os alunos.', 'Tema Infantil (3 estilos), temas de inclusão, modo acessível, importação por IA e CSV, modo Por vez.'],
      ['**Animador de eventos / gamer**', 'Competição intensa, reações da plateia, efeitos de palco.', 'Modo Arena com 9 poderes, temas de programa de auditório, chamar atenção, reações no telão, música de tensão.'],
      ['**Participante**', 'Entrar rápido, entender a vez, ver o próprio desempenho.', 'QR code, tela simples no celular, feedback imediato, ranking e pódio.']] }],
    ['img', '16_jornada.png', 'Jornada de uma partida (organizador e jogadores)'],

    ['h1', '4. Escopo'],
    ['h2', '4.1 Dentro do escopo (versão 1.0)'],
    ['bullets', [
      'Salas com código de 4 caracteres e QR code; salas privadas ou públicas com pedido de entrada.',
      'Modos de jogo Arena e Clássico; quem responde: "o mais rápido" ou "por vez".',
      'Poderes (Arena), placar configurável, controles do apresentador e avanço automático.',
      'Criação de quiz por 5 formas; perguntas com tempo, imagem por URL, dica e enquete.',
      'Interações: chamar atenção, reações com emoji, música de tensão.',
      'Temas visuais com 3 tons, palco em tela cheia no telão, modo acessível, botões de maximizar e de tela cheia.',
      'Interface em português, inglês e espanhol.']],
    ['h2', '4.2 Fora do escopo (nesta versão)'],
    ['bullets', [
      'Contas de usuário, login e histórico de partidas entre sessões.',
      'Relatórios exportáveis de desempenho (CSV/PDF) e painel analítico.',
      'Comunicação em tempo real por WebSockets (o PythonAnywhere não suporta; usa-se polling).',
      'Upload de imagens para o servidor (as imagens das perguntas são por URL).',
      'Aplicativo nativo para celular.']],

    ['h1', '5. Requisitos funcionais'],
    ['p', 'Prioridade: **M** = obrigatório (Must), **S** = importante (Should), **C** = desejável (Could). Todos os requisitos abaixo estão implementados no protótipo v9.'],
    ['h2', '5.1 Salas e entrada'],
    ['table', { title: 'Requisitos de salas e entrada', widths: [1, 5, 1, 4], header: ['ID', 'Requisito', 'Prior.', 'Critério de aceite'], rows: [
      RF('RF-01', 'O organizador cria uma sala escolhendo o modo (Arena ou Clássico).', 'M', 'Gera código único de 4 caracteres e QR code exibido no telão.'),
      RF('RF-02', 'O participante entra escaneando o QR code e digitando o nome.', 'M', 'Entra sem cadastro; nomes repetidos recebem sufixo numérico; limite de 60 jogadores.'),
      RF('RF-03', 'Sessão do jogador e do organizador persiste ao recarregar a página.', 'M', 'Tokens guardados no navegador; recarregar não cria novo jogador.'),
      RF('RF-04', 'Senha opcional para criar salas.', 'S', 'Com HOST_PASSWORD definido, criação sem senha é recusada.'),
      RF('RF-05', 'Sala privada ou pública.', 'S', 'Privada não aparece em listas; pública aparece na página inicial sem expor o código.'),
      RF('RF-06', 'Pedido de entrada em sala pública.', 'S', 'Organizador aceita/recusa; aceito recebe QR code e botão "Entrar agora" já com o nome.'),
      RF('RF-07', 'Remover jogador da sala.', 'S', 'O organizador remove pelo lobby.')] }],
    ['img', '02_entrada_qrcode.png', 'Criação da sala e entrada pelo QR code'],
    ['img', '09_sala_publica.png', 'Sala pública: lista e pedido de entrada'],

    ['h2', '5.2 Modos de jogo e pontuação'],
    ['table', { title: 'Requisitos de modos de jogo', widths: [1, 5, 1, 4], header: ['ID', 'Requisito', 'Prior.', 'Critério de aceite'], rows: [
      RF('RF-08', 'Modo Arena: só o primeiro a acertar pontua.', 'M', 'XP = (base + bônus de velocidade) × multiplicador × combo; acertos tardios valem 0.'),
      RF('RF-09', 'Modo Clássico: todo acerto pontua pela velocidade.', 'M', 'Pontos de 50% a 100% do valor máximo + bônus de sequência (até +500); resultado só no fim da pergunta.'),
      RF('RF-10', 'Quem responde: "o mais rápido" ou "por vez".', 'M', 'Por vez: rodízio pela ordem de entrada; só o jogador da vez responde; os outros acompanham a jogada.'),
      RF('RF-11', 'Uma tentativa por pergunta.', 'M', 'Após responder, o jogador não pode alterar (exceto carta Seguro).'),
      RF('RF-12', 'Fechamento automático da pergunta.', 'M', 'Fecha ao acabar o tempo ou quando todos (ou o jogador da vez) responderam.'),
      RF('RF-13', 'Enquetes (sem resposta certa).', 'S', 'Todos votam, ninguém pontua, o resultado aparece em gráfico.'),
      RF('RF-14', 'Tempo e imagem por pergunta.', 'S', 'Tempo de 5 a 300 s sobrescreve o padrão; imagem por URL http/https.')] }],
    ['img', '03_ciclo_partida.png', 'Ciclo de vida da partida'],
    ['img', '06_resposta_classico.png', 'Fluxo de resposta no modo Clássico'],
    ['img', '07_modo_por_vez.png', 'Modo "Por vez" (ordem dos participantes)'],

    ['h2', '5.3 Poderes (modo Arena)'],
    ['table', { title: 'Requisitos de poderes', widths: [1, 5, 1, 4], header: ['ID', 'Requisito', 'Prior.', 'Critério de aceite'], rows: [
      RF('RF-15', 'Nove poderes: 50/50, Dobro, Dado D6, Dica, Carta, Armadilha, Bloqueio, Lacre e Roubo.', 'M', 'Cada poder tem efeito descrito no manual e funciona conforme a seção 6 do DTD.'),
      RF('RF-16', 'Desbloqueio progressivo por acertos.', 'M', 'Metas padrão: 50/50 = 2, Dobro = 3, Dado = 4, Dica = 5, Carta = 6, Armadilha = 3, Bloqueio = 4, Lacre = 6, Roubo = 7.'),
      RF('RF-17', 'Cargas limitadas por partida e 1 uso por pergunta.', 'M', 'Padrão 2 cargas; 99 = ilimitado.'),
      RF('RF-18', 'O organizador liga/desliga cada poder e ajusta a meta.', 'S', 'Poderes desligados somem do celular e são recusados no servidor.'),
      RF('RF-19', 'Animações do Dado e das Cartas.', 'S', 'Dado gira antes do resultado; cartas viram em 3D e revelam as demais.')] }],
    ['img', '08_poderes.png', 'Mapa dos poderes'],
    ['img', '05_resposta_arena.png', 'Fluxo de resposta no modo Arena'],

    ['h2', '5.4 Controles do apresentador e placar'],
    ['table', { title: 'Requisitos de controle', widths: [1, 5, 1, 4], header: ['ID', 'Requisito', 'Prior.', 'Critério de aceite'], rows: [
      RF('RF-20', 'Pausar e retomar a pergunta.', 'M', 'Relógio congela; respostas e poderes são recusados durante a pausa.'),
      RF('RF-21', 'Encerrar pergunta, próxima, finalizar jogo e reiniciar partida.', 'M', 'Finalizar e reiniciar pedem confirmação.'),
      RF('RF-22', 'Avanço automático com tempo configurável.', 'S', '3 a 60 s após o resultado; contagem visível; "Segurar/Continuar".'),
      RF('RF-23', 'Placar ao vivo, só após cada pergunta ou só no final.', 'S', 'Quando oculto, o servidor não envia posições aos celulares.'),
      RF('RF-24', 'Configurações durante o jogo.', 'S', 'Tempo, pontos, placar, poderes, interação e tema podem mudar com o jogo rolando.'),
      RF('RF-25', 'Dar a vez a outro participante (modo Por vez).', 'C', 'Disponível antes de alguém responder.')] }],

    ['h2', '5.5 Criação de quiz'],
    ['table', { title: 'Requisitos de criação de quiz', widths: [1, 5, 1, 4], header: ['ID', 'Requisito', 'Prior.', 'Critério de aceite'], rows: [
      RF('RF-26', 'Templates prontos (PT/EN/ES).', 'M', 'Corporativos: Segurança da Informação, Gestão & Comunicação, Atendimento, Onboarding editável, Pesquisa de clima. Diversão: Conhecimentos Gerais, Tecnologia, Ciência, Geografia, Games.'),
      RF('RF-27', 'Importar arquivo JSON ou CSV.', 'M', 'Arrastar e soltar; prévia; modelos para download; CSV com "," ou ";".'),
      RF('RF-28', 'Texto rápido.', 'S', 'Blocos separados por linha em branco; "*" marca a correta; ">" é a explicação.'),
      RF('RF-29', 'Editor visual com rascunhos.', 'S', '2 a 6 alternativas, dica, explicação, tempo, imagem, enquete; salvar no navegador; exportar JSON.'),
      RF('RF-30', 'Prompt pronto para IA.', 'S', 'Copiar prompt e colar o JSON gerado.'),
      RF('RF-31', 'Validação com mensagens claras.', 'M', 'Erros indicam o número da pergunta e o problema.')] }],
    ['img', '10_criacao_quiz.png', 'Formas de criar o quiz'],

    ['h2', '5.6 Interação, aparência e acessibilidade'],
    ['table', { title: 'Requisitos de interação e aparência', widths: [1, 5, 1, 4], header: ['ID', 'Requisito', 'Prior.', 'Critério de aceite'], rows: [
      RF('RF-32', 'Chamar atenção de um rival.', 'S', 'Som alto (buzina, susto ou sirene), vibração e tela piscando no celular do alvo; padrão 2 usos.'),
      RF('RF-33', 'Reações com emoji no telão.', 'S', 'Lista fixa de emojis; flutuam com o nome do jogador; limite de 1 a cada 0,8 s.'),
      RF('RF-34', 'Música de tensão no fim do tempo.', 'C', 'Toca nos últimos 5/10/15/20 s; para na pausa; botão de mudo por aparelho.'),
      RF('RF-35', 'Temas visuais com 3 tons.', 'S', '16 temas em 4 grupos; palco em tela cheia no telão para temas de auditório, inclusão e infantil.'),
      RF('RF-36', 'Modo acessível por aparelho.', 'M', 'Letra maior (Atkinson Hyperlegible), mais contraste, menos animação, foco visível; ✓/✗ além da cor.'),
      RF('RF-37', 'Maximizar janelas e tela cheia.', 'C', 'Botão ⤢ nas janelas e ⛶ de tela cheia em todos os aparelhos.'),
      RF('RF-38', 'Três idiomas.', 'M', 'Português, inglês e espanhol em todas as telas e no manual "Como Jogar".')] }],
    ['img', '14_interacoes.png', 'Chamar atenção e reações'],

    ['h2', '5.7 Arsenal e emojis do organizador'],
    ['p', 'Na tela do organizador (Arena e Clássico) fica uma barra flutuante com o botão 🧰 Arsenal e uma fileira de emojis. O organizador não gasta cargas: o arsenal é ilimitado e cada ação aparece como aviso 🎤 nos celulares e no feed de eventos.'],
    ['table', { title: 'Requisitos do arsenal do organizador', widths: [1, 5, 1, 4], header: ['ID', 'Requisito', 'Prior.', 'Critério de aceite'], rows: [
      RF('RF-39', 'Efeitos "Para todos" na pergunta aberta: 50/50 geral, XP/pontos em dobro, Dica, +15 s, Dado da sorte e Carta surpresa.', 'M', 'Só com a pergunta aberta (botões desabilitados no lobby/resultado); em enquete só +15 s; valem nos modos Arena e Clássico.'),
      RF('RF-40', 'Dado da sorte (D6) e Carta surpresa com animação na tela do organizador.', 'S', 'Dado: 1 = +5 s, 2 = +10 s, 3 = some 1 errada, 4 = +15 s, 5 = escudo de sequência, 6 = somem 2 erradas + dobro. Carta: Mentoria, Seguro (2ª chance, 1 vez por participante), All-In 3x ou Tempo Extra (+20 s).'),
      RF('RF-41', 'Poderes contra um participante: Armadilha, Bloqueio e Lacre.', 'S', 'Só no modo Arena; o organizador escolhe o alvo numa lista.'),
      RF('RF-42', 'Dar +1 carga de qualquer poder a um participante ou a todos.', 'S', 'Só no modo Arena; o celular mostra o aviso e o contador de cargas atualiza.'),
      RF('RF-43', 'Emojis do organizador para todos os participantes.', 'M', '20 emojis (inclui HAHAHA, 👋, ⏰, 💪, 🏆); aparecem grandes no celular com "🎤 Organizador" e no telão; limite de 1 a cada 0,35 s.')] }],
    ['img', '17_arsenal_organizador.png', 'Arsenal e emojis do organizador'],
    ['img', '15_temas.png', 'Temas visuais e acessibilidade'],

    ['h1', '6. Requisitos não funcionais'],
    ['table', { title: 'Requisitos não funcionais', widths: [1, 2, 5], header: ['ID', 'Categoria', 'Requisito'], rows: [
      ['RNF-01', 'Desempenho', 'Atualização das telas em até ~1 s (polling); respostas da API em menos de 200 ms em uso normal.'],
      ['RNF-02', 'Escala', 'Até 60 jogadores por sala; várias salas simultâneas no mesmo servidor.'],
      ['RNF-03', 'Compatibilidade', 'Navegadores modernos (Chrome, Edge, Firefox, Safari) em computador e celular; sem instalação.'],
      ['RNF-04', 'Hospedagem', 'Funcionar em hospedagem WSGI sem WebSockets (PythonAnywhere); estado em SQLite compartilhado entre processos.'],
      ['RNF-05', 'Segurança', 'Gabarito nunca enviado aos jogadores antes do fim da pergunta; ações exigem token; código de sala pública só é revelado após aprovação.'],
      ['RNF-06', 'Acessibilidade', 'Contraste alto disponível, informação não dependente só de cor, alvos de toque de 44 px no modo acessível.'],
      ['RNF-07', 'Internacionalização', 'Todos os textos via dicionário PT/EN/ES.'],
      ['RNF-08', 'Manutenção', 'Regras do jogo isoladas em game.py, testáveis sem servidor; 36 testes automatizados e 6 roteiros de navegador.'],
      ['RNF-09', 'Privacidade', 'Sem coleta de e-mail ou dados pessoais além do apelido; salas apagadas após 24 h sem uso.']] }],

    ['h1', '7. Métricas de sucesso'],
    ['table', { title: 'Indicadores', widths: [3, 3, 2], header: ['Indicador', 'Como medir', 'Meta inicial'], rows: [
      ['Tempo até o 1º jogador entrar', 'Da criação da sala ao primeiro "join"', '< 1 min'],
      ['Taxa de participação', 'Jogadores que responderam ÷ jogadores na sala', '> 85%'],
      ['Partidas concluídas', 'Partidas que chegam ao pódio ÷ partidas iniciadas', '> 80%'],
      ['Quizzes próprios', 'Salas com quiz importado/criado ÷ salas criadas', '> 50%'],
      ['Uso de acessibilidade', 'Aparelhos com modo acessível ligado', 'Monitorar'],
      ['Satisfação', 'Enquete final (template Pesquisa de clima)', '≥ 4 de 5']] }],

    ['h1', '8. Premissas, restrições e riscos'],
    ['table', { title: 'Riscos', widths: [3, 1, 4], header: ['Risco', 'Impacto', 'Mitigação'], rows: [
      ['Cota de CPU do plano gratuito do PythonAnywhere com muitas telas fazendo polling', 'Alto', 'Plano pago para turmas grandes; intervalo de polling ajustável.'],
      ['Navegadores bloqueiam som até o primeiro toque', 'Médio', 'Desbloqueio de áudio no primeiro toque; o jogador toca para entrar.'],
      ['Código de sala pública repassado por quem foi aceito', 'Médio', 'Evolução: aprovação também para entrada por código.'],
      ['Dependência de CDNs (Tailwind, Font Awesome, Google Fonts)', 'Médio', 'Evolução: empacotar CSS e fontes localmente.'],
      ['Conteúdo dos templates com erro factual', 'Baixo', 'Revisão pelo organizador antes do uso; editor visual.']] }],

    ['h1', '9. Próximos passos sugeridos'],
    ['numbered', [
      'Relatório da partida (CSV/PDF) com acertos por pergunta e por jogador.',
      'Aprovação do organizador também para quem entra digitando o código.',
      'Equipes (times) e modo torneio com várias partidas.',
      'Upload de imagens e áudio nas perguntas.',
      'Empacotar CSS e fontes localmente para funcionar sem internet externa.',
      'Contas de organizador para salvar quizzes no servidor.']],

    ['h1', '10. Glossário'],
    ['table', { title: 'Termos', widths: [2, 6], header: ['Termo', 'Significado'], rows: [
      ['Telão / apresentador', 'Tela do organizador, normalmente projetada (/host ou /host/classic).'],
      ['Sala / PIN', 'Partida identificada por código de 4 caracteres.'],
      ['Lobby', 'Sala de espera antes do início.'],
      ['Revelação (reveal)', 'Momento após a pergunta em que a resposta certa e o gráfico aparecem.'],
      ['Combo / sequência', 'Acertos seguidos que aumentam a pontuação.'],
      ['Palco', 'Visual em tela cheia da pergunta no telão para temas de auditório, inclusão e infantil.'],
      ['Polling', 'Consulta periódica (1 s) das telas ao servidor para obter o estado do jogo.']] }]
  ]
}, path.join(__dirname, '..', 'PRD_Arena_Quiz_Multiplayer.docx'));
