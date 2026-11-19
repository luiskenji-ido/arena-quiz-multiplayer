# Manual completo — Arena Quiz Multiplayer

> Guia detalhado de uso. Visão geral, instalação e licença estão no [README](../README.md).


Quiz em tempo real para celulares: o apresentador projeta a tela, os jogadores entram pelo **QR code**,
digitam o nome e **o primeiro a acertar leva os pontos e o progresso dos poderes**.

* Flask + SQLite, **sem WebSockets** (funciona no PythonAnywhere): as telas consultam o servidor 1x por segundo.
* O relógio é do servidor: a pergunta fecha sozinha quando o tempo acaba (ou quando todos já responderam).
* Idiomas: português, inglês e espanhol (seletor em cada tela).

## Modos de jogo
| Modo | Visual | Como funciona |
|---|---|---|
| **Arena** (corrida + poderes) | Gamer, neon escuro | Só o 1º a acertar pontua e destrava até 9 poderes táticos. |
| **Clássico** | Corporativo, claro, botões coloridos | Todos pontuam: quanto mais rápido, mais pontos (50% a 100%), bônus de sequência, gráfico de respostas, placar entre perguntas e pódio. Sem poderes. |

Cada modo tem a sua tela (`/host` e `/host/classic`; o celular abre a tela certa sozinho).
O modo é escolhido ao criar a sala e pode ser trocado em **Configurar Jogo** enquanto a sala está no lobby.

## Quem responde: o mais rápido ou por vez
Em **Configurar Jogo → Quem responde** (vale nos modos Arena e Clássico):

| Opção | Como funciona |
|---|---|
| **O mais rápido** (padrão) | Todos respondem ao mesmo tempo. |
| **Por vez** (ordem dos participantes) | Cada pergunta é de um participante, em rodízio pela ordem de entrada na sala. Só ele responde (e usa os poderes próprios). Os outros veem no celular "Vez de Ana: acompanhe a jogada", as alternativas que ela eliminou e a resposta escolhida; o apresentador acompanha no telão. A pergunta fecha assim que a pessoa da vez responde. |

No modo **Por vez**: o **Bloqueio** faz o alvo perder a próxima vez dele (estilo UNO); os poderes de ataque podem ser
usados por qualquer um, mesmo fora da vez; quem não responde a tempo perde o combo; e o apresentador pode
**dar a vez** a outra pessoa pelo ícone 👆 no placar (antes de alguém responder).

## Interação e aparência (Configurar Jogo → Interação e aparência)
* **📢 Chamar atenção**: no celular, o jogador escolhe um rival e um som (Buzina, Susto ou Sirene). O botão fica esmaecido, com um aviso, quando não há outro participante conectado (quem fica 5 minutos sem conexão sai da sala). O celular do rival
  toca alto, vibra e pisca a tela com "Fulano chamou sua atenção!". Padrão: 2 usos por jogador por partida (0 desliga).
* **😀 Reações**: barra de emojis no celular (😀 😂 🤣 HAHAHA 😍 👏 🔥 😮 😱 😡 🤬 😭 🤯 🎉). Elas sobem flutuando na
  tela do organizador, com o nome de quem mandou. Pode ser desligado.
* **🎵 Música de tensão**: nos últimos 5/10/15/20 segundos da pergunta toca um tique-taque com batida de coração que
  acelera, no telão e nos celulares. Pausar a pergunta para a música. Cada aparelho tem um botão 🔊/🔇 no canto.
* **🎨 Temas** (valem no telão e em todos os celulares; podem ser trocados durante o jogo). Cada tema tem
  **3 tons de cor**: no seletor, clique na bolinha do tom desejado (ex.: Neon Rosa → rosa choque, pink ou rosa claro).
  * **Programa de auditório**: 💜 Neon Rosa, 💙 Neon Azul, 🎤 Palco de TV, 🏆 Show de Prêmios azul e 💰 Show de Prêmios vermelho.
  * **Diversidade e inclusão**: 🏳️‍🌈 Orgulho LGBTQIA+ (roxo, coração e bordas arco-íris), 🌍 Diversidade (perfis em vários
    tons de pele e arco-íris), 🌂 Inclusão Infantil (guarda-chuva arco-íris e corações) e 🧠 Mentes Coloridas.
  * **Infantil e escolar**: 🧸 Infantil, com 3 estilos no lugar dos 3 tons: 📒 Caderno colorido ("QUIZ" com letras
    coloridas, perguntas numeradas, sol e grama com flores), 🎪 Circo (tenda listrada, carrinho e cartões verde-claros)
    e 💚💛 Verde e amarelo (moldura verde, "QUIZ" azul, números em círculos).
  * **Básicos**: 🎮 Gamer (original), 💼 Corporativo e 🔳 Alto contraste.
  * Nos temas de auditório e de inclusão a pergunta no telão vira um "palco" em tela cheia. Tudo é desenhado em CSS/SVG, sem fotos.
* **⤢ Maximizar**: toda janela (Configurar Jogo, Carregar Quiz, Como Jogar) tem um botão para abrir em tela inteira
  (o navegador lembra a escolha). Todos os aparelhos têm também o botão ⛶ de tela cheia no canto da tela.
* **♿ Modo acessível** (botão no canto de cada aparelho, combina com qualquer tema): letras maiores e mais legíveis
  (Atkinson Hyperlegible), mais contraste, menos animação e foco bem visível. Em todos os temas a resposta certa
  e a errada também aparecem com ✓ e ✗, sem depender só da cor.

Obs.: os navegadores só liberam som depois do primeiro toque na tela; como o jogador toca para entrar, isso já acontece.

## Salas privadas e públicas
Não existe uma lista geral de salas: cada sala tem o próprio PIN de 4 letras e QR code.
Em **Configurar Jogo → Sala** o organizador escolhe:

| Tipo | Quem entra | Aparece na página inicial? |
|---|---|---|
| **Privada** (padrão) | Só quem recebeu o código ou escaneou o QR code | Não |
| **Pública** | Qualquer pessoa pode **pedir para entrar**; o organizador aceita ou recusa | Sim, com nome da sala, modo, idioma e nº de jogadores (o código **não** aparece) |

Fluxo da sala pública: a pessoa abre a página inicial, clica em **Pedir para entrar** e digita o nome.
O pedido aparece no canto da tela do apresentador (**Aceitar / Recusar**). Ao aceitar, a pessoa vê o QR code
e o botão **Entrar agora** (já entra com o nome pedido). A sala some da lista se o apresentador fechar a tela por mais de 2 minutos.

## Controles do apresentador
Durante o jogo aparece a barra de controles:
* **Pausar / Retomar**: congela o relógio e bloqueia respostas e poderes.
* **Encerrar pergunta** e **Próxima**.
* **Automático** + tempo (3 a 60 s): depois do resultado, a próxima pergunta começa sozinha, com contagem
  regressiva no telão e nos celulares. **Segurar / Continuar** pausa e retoma essa contagem.
* **Mostrar placar**: abre o placar na tela mesmo quando ele está oculto para os jogadores.
* **Finalizar jogo**: vai direto ao pódio (pede confirmação).
* **Reiniciar partida**: zera pontos e volta ao lobby com os mesmos jogadores (pede confirmação).
* **Configurar Jogo** continua disponível: tempo, pontos, placar e poderes podem mudar com o jogo rolando;
  modo, idioma, cargas e quiz só no lobby.

### 🚪 Sair e expiração da conexão
* **Participante:** o botão **Sair** (canto inferior esquerdo do celular, ao lado dos botões de som, acessibilidade e tela cheia) pede confirmação, tira você da sala na hora e volta à página inicial.
  Durante a partida os seus pontos são perdidos; no pódio, o ranking final é mantido.
* **Organizador:** o botão **Sair** da barra inferior encerra a sala para todos. Os participantes veem "A sala foi encerrada".
* **Fechou o navegador?** Você tem **5 minutos** para voltar (mesmo link ou código) e continuar de onde parou.
  Passando disso, a sessão é encerrada:
  * o **participante** sai da sala (aparece "ficou 5 min sem conexão" no feed) e não trava mais a rodada nem a vez dos outros;
  * se o **organizador** some por 5 minutos, a sala é encerrada. Ao reabrir, ele vê o aviso e pode criar uma nova sala.
* No pódio a sala não expira. O prazo pode ser mudado com a variável de ambiente `PRESENCE_TIMEOUT` (em segundos; padrão 300).

### 🔢 Escopo da partida (quantas perguntas usar)
Em **Configurar Jogo → Escopo da partida** (no lobby, antes de iniciar):
* Escolha quantas perguntas do quiz serão usadas, pelo controle deslizante ou digitando o número.
  Exemplo: o quiz tem 120 perguntas, mas o tempo do evento só comporta 90. O botão **Todas** volta a usar o quiz inteiro.
* **Na sequência do quiz**: usa as primeiras N perguntas, na ordem do arquivo.
  **Sorteadas do quiz**: sorteia N perguntas sem repetir, em ordem aleatória.
* A janela mostra a **duração estimada** (perguntas × tempo + resultado) e, no modo **Por vez**, quantas perguntas cada jogador responde.
* O lobby mostra, por exemplo, "90 de 120 perguntas", e o telão e os celulares mostram "Rodada 1/90".
* **Reiniciar partida** devolve o quiz completo. Com "Sorteadas", cada nova partida sorteia outras perguntas.

### 🧰 Arsenal e emojis do organizador
Na parte de baixo da tela do apresentador (Arena e Clássico) fica uma barra flutuante:
* **😀 Emojis para todos**: 20 emojis (👏 🔥 😂 HAHAHA 😮 😱 😡 🎉 👋 ⏰ 💪 🏆 🙌 ❤️ …). Aparecem grandes no celular de
  todos os participantes com "🎤 Organizador" e também no telão. O botão ◂ recolhe a fileira.
* **🧰 Arsenal** (ilimitado, não gasta cargas):
  * **Para todos** (com a pergunta aberta): 50/50 geral, XP/pontos em dobro, Dica, +15 s, **Dado da sorte** (D6 animado:
    +5 s, +10 s, some 1 errada, +15 s, escudo de sequência, ou some 2 erradas + dobro) e **Carta surpresa**
    (Mentoria, Seguro 2ª chance, All-In 3x ou Tempo Extra +20 s). Valem no Arena e no Clássico.
  * **Contra um participante** (Arena): Armadilha, Bloqueio ou Lacre.
  * **Dar cargas** (Arena): +1 de qualquer poder para um participante ou para todos.
* Cada ação aparece como aviso 🎤 nos celulares e no feed de eventos.

### Placar
* **Ao vivo**: sempre visível.
* **Só depois de cada pergunta**: some durante a pergunta (no Clássico, botão "Placar" após o resultado).
* **Só no final**: suspense total; jogadores não veem posição até o pódio.

### Poderes (modo Arena)
Em **Configurar Jogo** cada poder pode ser ligado/desligado e ter a sua meta de acertos para liberar.

## Como jogar (resumo)
1. O apresentador abre `/host`, escolhe o modo e clica em **Criar sala** (QR code + código de 4 letras).
2. Cada jogador escaneia o QR code, escreve o nome e cai na sala de espera.
3. O apresentador usa **Carregar Quiz** (ou deixa o quiz padrão) e **Configurar Jogo**, e clica em **Iniciar jogo**.
4. Todos veem a pergunta ao mesmo tempo. A pergunta fecha sozinha quando o tempo acaba (ou quando todos responderam).
5. O manual completo está no botão **Como Jogar** de cada tela.

## Formas de criar o quiz (botão "Carregar Quiz")
1. **Templates** (PT/EN/ES), use direto ou abra no editor:
   * Corporativo & Treinamento: Segurança da Informação, Gestão & Comunicação, Atendimento ao Cliente,
     Onboarding (modelo editável com [CAMPOS]), Pesquisa de clima (enquetes) e modelo em branco.
   * Diversão & Conhecimentos: Conhecimentos Gerais, Tecnologia, Ciência, Geografia, Games.
2. **Arquivo**: arraste um `.json` ou `.csv` (separador `,` ou `;`). Há botões para baixar um modelo de cada.
3. **Texto rápido**: cole perguntas em texto simples (uma por bloco, `*` marca a correta, `>` é a explicação).
4. **Editor visual**: monte perguntas no navegador (2 a 6 alternativas, dica, explicação, tempo por pergunta, imagem por URL),
   salve rascunhos neste navegador e exporte em JSON.
5. **IA / JSON**: copie o prompt, gere o quiz numa IA e cole o JSON.

### Enquetes
Perguntas sem resposta certa (`"poll": true` no JSON, caixa "Enquete" no editor ou coluna `tipo` = `enquete` no CSV):
todos votam, ninguém ganha ou perde pontos e o resultado aparece em gráfico.

### CSV
Colunas reconhecidas (em português, inglês ou espanhol): `pergunta, a, b, c, d (até f), correta, explicacao, dica, referencia, bloco, topico, tempo, imagem`.
`correta` pode ser a letra (A-F), o número (1-6) ou o texto da alternativa.

## Rodar no seu computador
```bash
pip install -r requirements.txt
python app.py            # abre em http://localhost:5000
```
Para testar com celulares na mesma rede Wi-Fi, abra `http://IP-DO-SEU-PC:5000/host` (o QR code usa o endereço que você acessou).

## Publicar no PythonAnywhere
1. Crie a conta em pythonanywhere.com e abra um **Bash console**.
2. Envie o projeto (aba **Files** > upload do .zip, ou `git clone`) para `/home/SEU_USUARIO/arena_multiplayer`.
3. No console, crie o ambiente virtual e instale as dependências:
   ```bash
   mkvirtualenv arena --python=python3.10
   pip install -r ~/arena_multiplayer/requirements.txt
   ```
4. Aba **Web** > **Add a new web app** > **Manual configuration** > escolha a mesma versão do Python.
5. Em **Virtualenv**, informe `/home/SEU_USUARIO/.virtualenvs/arena`.
6. Clique no link do arquivo **WSGI configuration file** e substitua o conteúdo pelo de `wsgi_pythonanywhere.py` (na raiz do projeto)
   (ajuste usuário e senha do apresentador).
7. (Opcional) Em **Static files**: URL `/static/` -> diretório `/home/SEU_USUARIO/arena_multiplayer/static`.
8. Clique em **Reload**. A plataforma fica em `https://SEU_USUARIO.pythonanywhere.com`.

Notas:
* `HOST_PASSWORD` (variável de ambiente) é opcional, mas recomendada: sem ela qualquer pessoa que achar a URL cria salas.
* As salas ficam no arquivo `rooms.sqlite3` e são apagadas após 24 h sem uso.
* Planos gratuitos têm cota diária de CPU e poucos processos. Como cada tela faz polling a cada segundo,
  turmas grandes funcionam melhor em plano pago. Confira os limites atuais no site do PythonAnywhere.
* Para reduzir carga, aumente o intervalo do `setInterval(poll, 1000)` em `templates/play.html` e `templates/host.html`.

## Formato do quiz (JSON)
```json
[
  {
    "block": "Tema", "topic": "Subtema",
    "question": "Pergunta?",
    "options": ["A", "B", "C", "D"], "correct": 0,
    "hint": "Dica curta (usada pelo poder Dica e pela carta Mentoria)",
    "reference": "Fonte", "explanation": "Explicação do gabarito"
  }
]
```
Campos opcionais: `poll` (enquete, sem `correct`), `hint` (sem ele a dica mostra a `reference`), `time` (segundos, 5 a 300, sobrescreve o tempo padrão) e `image` (URL http/https).
O botão **Copiar prompt para IA** gera um prompt pronto.

## Estrutura
```
app.py             rotas Flask, SQLite, QR code, API de templates
game.py            todas as regras (modos, respostas, poderes, pontuação) - testável sem Flask
quiz_templates.py  templates de quiz prontos (pt/en/es)
default_quiz.json  perguntas de exemplo
templates/         index (entrada), host + play (Arena), host_classic + play_classic (Clássico corporativo),
                   _host_modals.html (configurar, quiz, manual)
static/            common.js e i18n_extra.js (idiomas, manual), host_core.js (controles do apresentador),
                   fun.js (sons, chamar atenção, reações, temas, palco, acessibilidade), themes.css, showthemes.css, inclusion.css e kids.css,
                   quizkit.js (criação de quiz), style.css (Arena), corp.css (Clássico)
tests/             test_game.py (pytest), e2e.js ... e2e10.js (Playwright), fixtures/
```

## Testes
```bash
pip install pytest
pytest -q tests
```

## Documentação
Em `docs/`:
* `PRD_Arena_Quiz_Multiplayer.docx` – requisitos de produto.
* `PTD_Arena_Quiz_Multiplayer.docx` – visão técnica (arquitetura, segurança, implantação, testes).
* `DTD_Arena_Quiz_Multiplayer.docx` – detalhamento (modelo de dados, API, algoritmos, erros, front-end).
* `diagramas/` – 19 diagramas Mermaid (`.mmd`) e as imagens geradas (`.png`).
* `gerador/` – scripts que geram os documentos: `docs/gerador/gerar.sh`.
