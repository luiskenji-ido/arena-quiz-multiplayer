/* Textos extras: modo clássico, configurações, criação de quiz. Carregar depois de common.js. */
(function () {
  const X = {
    pt: {
      lbl_mode: "Modo de jogo", mode_arena: "Arena (corrida + poderes)", mode_arena_d: "Só o 1º a acertar pontua e destrava 9 poderes táticos.",
      mode_classic: "Clássico", mode_classic_d: "Todos pontuam: quanto mais rápido, mais pontos. Sem poderes, com pódio.",
      create_mode: "Escolha o modo de jogo", lbl_classic_points: "Pontos por acerto (máx.)", btn_config: "Configurar Jogo", btn_loadquiz: "Carregar Quiz",
      cfg_title: "CONFIGURAR JOGO", btn_save: "Salvar", btn_close: "Fechar", lbl_quiz: "Quiz", quiz_n: "{n} perguntas", lbl_preview: "Perguntas do quiz", cfg_saved: "Configurações salvas!",
      cfg_arena_only: "Só no modo Arena",
      tab_templates: "Templates", tab_upload: "Arquivo", tab_text: "Texto rápido", tab_editor: "Editor", tab_ai: "IA / JSON",
      quizmodal_title: "CARREGAR OU CRIAR QUIZ", quiz_applied: "Quiz aplicado: {n} perguntas", quiz_use: "Usar este quiz",
      tpl_help: "Escolha um quiz pronto. Você pode usar direto ou abrir no editor para ajustar. (Idioma: {lang})", tpl_edit: "Editar", tpl_n: "{n} perguntas",
      up_drop: "Arraste um arquivo .json ou .csv aqui, ou toque para escolher", up_help: "JSON no mesmo formato do prompt de IA, ou CSV com colunas: pergunta, a, b, c, d, correta (A-D ou 1-4), explicacao, dica.",
      up_dl_json: "Baixar modelo JSON", up_dl_csv: "Baixar modelo CSV", up_read: "Arquivo lido: {n} perguntas", up_err: "Não consegui ler: {err}",
      tx_help: "Uma pergunta por bloco, separados por linha em branco. 1ª linha = pergunta; as seguintes = alternativas; marque a correta com * no início. Linha com > no início = explicação.",
      tx_ph: "Qual é a capital da França?\nLondres\n*Paris\nMadri\nRoma\n> Paris é a capital desde a Idade Média.\n\n2 + 2 = ?\n3\n*4\n5",
      tx_read: "{n} perguntas reconhecidas",
      ed_name_ph: "Nome do quiz", ed_add: "Adicionar pergunta", ed_q: "Pergunta", ed_opt: "Alternativa", ed_add_opt: "+ alternativa", ed_expl: "Explicação (opcional)",
      ed_hint: "Dica (opcional)", ed_time: "Tempo em segundos (opcional)", ed_image: "URL de imagem (opcional)", ed_dup: "Duplicar", ed_del: "Excluir", ed_up: "Subir", ed_down: "Descer",
      ed_save: "Salvar rascunho neste navegador", ed_saved: "Rascunho salvo!", ed_mine: "Meus quizzes salvos", ed_load: "Abrir", ed_export: "Exportar JSON", ed_current: "Carregar o quiz atual da sala", ed_new: "Novo quiz em branco",
      ed_correct: "Correta", ed_err: "Pergunta {n}: {msg}", ed_e_empty: "texto vazio", ed_e_opts: "precisa de pelo menos 2 alternativas preenchidas", ed_e_correct: "marque uma alternativa correta preenchida", ed_none: "Nenhum rascunho salvo ainda.",
      ai_help: "Copie o prompt, envie para uma IA (ChatGPT, Gemini...) junto com o seu material e cole abaixo o JSON gerado.", ai_ph: "Cole o JSON aqui...", ai_read: "{n} perguntas reconhecidas", ai_prompt_copied: "Prompt copiado! Cole na sua IA.",
      dist_title: "Respostas", mode_now: "Modo",
      cl_wait: "Resposta enviada! Aguarde o resultado...", cl_correct: "✅ Correto! +{pts} pontos", cl_wrong: "❌ Resposta errada", cl_timeup: "⏰ Você não respondeu a tempo", cl_rank: "Você está em {n}º lugar", cl_streak: "🔥 Sequência de {n} acertos",
      err_powers_off: "Poderes desligados no modo clássico.", err_template_not_found: "Template não encontrado.", err_network: "Sem conexão com o servidor.",
      help_classic_title: "Modo Clássico", help_classic_1: "Todos respondem à pergunta e <strong>todo acerto pontua</strong>.", help_classic_2: "Quanto mais rápido, mais pontos (de 50% a 100% do valor).",
      help_classic_3: "Acertos seguidos dão bônus de sequência (+100 por acerto, até +500).", help_classic_4: "Não há poderes: a graça é a velocidade e o pódio final."
    },
    en: {
      lbl_mode: "Game mode", mode_arena: "Arena (race + powers)", mode_arena_d: "Only the 1st correct answer scores and unlocks 9 tactical powers.",
      mode_classic: "Classic", mode_classic_d: "Everyone scores: the faster, the more points. No powers, with podium.",
      create_mode: "Choose the game mode", lbl_classic_points: "Points per correct answer (max)", btn_config: "Game Settings", btn_loadquiz: "Load Quiz",
      cfg_title: "GAME SETTINGS", btn_save: "Save", btn_close: "Close", lbl_quiz: "Quiz", quiz_n: "{n} questions", lbl_preview: "Quiz questions", cfg_saved: "Settings saved!",
      cfg_arena_only: "Arena mode only",
      tab_templates: "Templates", tab_upload: "File", tab_text: "Quick text", tab_editor: "Editor", tab_ai: "AI / JSON",
      quizmodal_title: "LOAD OR CREATE QUIZ", quiz_applied: "Quiz applied: {n} questions", quiz_use: "Use this quiz",
      tpl_help: "Pick a ready-made quiz. Use it as is or open it in the editor to tweak. (Language: {lang})", tpl_edit: "Edit", tpl_n: "{n} questions",
      up_drop: "Drag a .json or .csv file here, or tap to choose", up_help: "JSON in the same format as the AI prompt, or CSV with columns: question, a, b, c, d, correct (A-D or 1-4), explanation, hint.",
      up_dl_json: "Download JSON template", up_dl_csv: "Download CSV template", up_read: "File read: {n} questions", up_err: "Could not read it: {err}",
      tx_help: "One question per block, separated by a blank line. 1st line = question; next lines = options; mark the correct one with * at the start. A line starting with > = explanation.",
      tx_ph: "What is the capital of France?\nLondon\n*Paris\nMadrid\nRome\n> Paris has been the capital since the Middle Ages.\n\n2 + 2 = ?\n3\n*4\n5",
      tx_read: "{n} questions recognized",
      ed_name_ph: "Quiz name", ed_add: "Add question", ed_q: "Question", ed_opt: "Option", ed_add_opt: "+ option", ed_expl: "Explanation (optional)",
      ed_hint: "Hint (optional)", ed_time: "Time in seconds (optional)", ed_image: "Image URL (optional)", ed_dup: "Duplicate", ed_del: "Delete", ed_up: "Move up", ed_down: "Move down",
      ed_save: "Save draft in this browser", ed_saved: "Draft saved!", ed_mine: "My saved quizzes", ed_load: "Open", ed_export: "Export JSON", ed_current: "Load the room's current quiz", ed_new: "New blank quiz",
      ed_correct: "Correct", ed_err: "Question {n}: {msg}", ed_e_empty: "empty text", ed_e_opts: "needs at least 2 filled options", ed_e_correct: "mark a filled option as correct", ed_none: "No saved drafts yet.",
      ai_help: "Copy the prompt, send it to an AI (ChatGPT, Gemini...) along with your material and paste the generated JSON below.", ai_ph: "Paste the JSON here...", ai_read: "{n} questions recognized", ai_prompt_copied: "Prompt copied! Paste it into your AI.",
      dist_title: "Answers", mode_now: "Mode",
      cl_wait: "Answer sent! Wait for the result...", cl_correct: "✅ Correct! +{pts} points", cl_wrong: "❌ Wrong answer", cl_timeup: "⏰ You did not answer in time", cl_rank: "You are in place #{n}", cl_streak: "🔥 Streak of {n} correct answers",
      err_powers_off: "Powers are off in classic mode.", err_template_not_found: "Template not found.", err_network: "No connection to the server.",
      help_classic_title: "Classic mode", help_classic_1: "Everyone answers the question and <strong>every correct answer scores</strong>.", help_classic_2: "The faster you answer, the more points (50% to 100% of the value).",
      help_classic_3: "Consecutive hits give a streak bonus (+100 per hit, up to +500).", help_classic_4: "There are no powers: it is all about speed and the final podium."
    },
    es: {
      lbl_mode: "Modo de juego", mode_arena: "Arena (carrera + poderes)", mode_arena_d: "Sólo el 1º en acertar puntúa y desbloquea 9 poderes tácticos.",
      mode_classic: "Clásico", mode_classic_d: "Todos puntúan: cuanto más rápido, más puntos. Sin poderes, con podio.",
      create_mode: "Elige el modo de juego", lbl_classic_points: "Puntos por acierto (máx.)", btn_config: "Configurar Juego", btn_loadquiz: "Cargar Quiz",
      cfg_title: "CONFIGURAR JUEGO", btn_save: "Guardar", btn_close: "Cerrar", lbl_quiz: "Quiz", quiz_n: "{n} preguntas", lbl_preview: "Preguntas del quiz", cfg_saved: "¡Configuración guardada!",
      cfg_arena_only: "Sólo en modo Arena",
      tab_templates: "Plantillas", tab_upload: "Archivo", tab_text: "Texto rápido", tab_editor: "Editor", tab_ai: "IA / JSON",
      quizmodal_title: "CARGAR O CREAR QUIZ", quiz_applied: "Quiz aplicado: {n} preguntas", quiz_use: "Usar este quiz",
      tpl_help: "Elige un quiz listo. Úsalo tal cual o ábrelo en el editor para ajustarlo. (Idioma: {lang})", tpl_edit: "Editar", tpl_n: "{n} preguntas",
      up_drop: "Arrastra un archivo .json o .csv aquí, o toca para elegir", up_help: "JSON con el mismo formato del prompt de IA, o CSV con columnas: pregunta, a, b, c, d, correcta (A-D o 1-4), explicacion, pista.",
      up_dl_json: "Descargar modelo JSON", up_dl_csv: "Descargar modelo CSV", up_read: "Archivo leído: {n} preguntas", up_err: "No pude leerlo: {err}",
      tx_help: "Una pregunta por bloque, separadas por una línea en blanco. 1ª línea = pregunta; las siguientes = alternativas; marca la correcta con * al inicio. Línea con > al inicio = explicación.",
      tx_ph: "¿Cuál es la capital de Francia?\nLondres\n*París\nMadrid\nRoma\n> París es la capital desde la Edad Media.\n\n2 + 2 = ?\n3\n*4\n5",
      tx_read: "{n} preguntas reconocidas",
      ed_name_ph: "Nombre del quiz", ed_add: "Agregar pregunta", ed_q: "Pregunta", ed_opt: "Alternativa", ed_add_opt: "+ alternativa", ed_expl: "Explicación (opcional)",
      ed_hint: "Pista (opcional)", ed_time: "Tiempo en segundos (opcional)", ed_image: "URL de imagen (opcional)", ed_dup: "Duplicar", ed_del: "Eliminar", ed_up: "Subir", ed_down: "Bajar",
      ed_save: "Guardar borrador en este navegador", ed_saved: "¡Borrador guardado!", ed_mine: "Mis quizzes guardados", ed_load: "Abrir", ed_export: "Exportar JSON", ed_current: "Cargar el quiz actual de la sala", ed_new: "Nuevo quiz en blanco",
      ed_correct: "Correcta", ed_err: "Pregunta {n}: {msg}", ed_e_empty: "texto vacío", ed_e_opts: "necesita al menos 2 alternativas completas", ed_e_correct: "marca una alternativa completa como correcta", ed_none: "Aún no hay borradores guardados.",
      ai_help: "Copia el prompt, envíalo a una IA (ChatGPT, Gemini...) junto con tu material y pega abajo el JSON generado.", ai_ph: "Pega el JSON aquí...", ai_read: "{n} preguntas reconocidas", ai_prompt_copied: "¡Prompt copiado! Pégalo en tu IA.",
      dist_title: "Respuestas", mode_now: "Modo",
      cl_wait: "¡Respuesta enviada! Espera el resultado...", cl_correct: "✅ ¡Correcto! +{pts} puntos", cl_wrong: "❌ Respuesta incorrecta", cl_timeup: "⏰ No respondiste a tiempo", cl_rank: "Estás en el puesto {n}", cl_streak: "🔥 Racha de {n} aciertos",
      err_powers_off: "Los poderes están apagados en el modo clásico.", err_template_not_found: "Plantilla no encontrada.", err_network: "Sin conexión con el servidor.",
      help_classic_title: "Modo Clásico", help_classic_1: "Todos responden la pregunta y <strong>cada acierto puntúa</strong>.", help_classic_2: "Cuanto más rápido, más puntos (del 50% al 100% del valor).",
      help_classic_3: "Los aciertos seguidos dan bono de racha (+100 por acierto, hasta +500).", help_classic_4: "No hay poderes: lo importante es la velocidad y el podio final."
    }
  };
  for (const l in X) Object.assign(I18N[l], X[l]);

  // O manual passa a explicar o modo clássico quando a sala está nele
  const baseHelp = helpHTML;
  helpHTML = function () {
    if (typeof ST !== 'undefined' && ST && ST.settings && ST.settings.mode === 'classic') {
      const li = k => `<li>${t(k)}</li>`;
      return `<div class="panel border border-amber-500/30 text-sm text-slate-300 space-y-2"><h4 class="font-esports text-sm font-bold text-amber-300">${t('help_classic_title')}</h4><ul class="list-disc list-inside space-y-1">${['help_classic_1', 'help_classic_2', 'help_classic_3', 'help_classic_4', 'help_classic_5', 'help_classic_6', 'help_classic_7', 'help_classic_8'].map(li).join('')}</ul></div>`;
    }
    return baseHelp();
  };
})();

/* Controles do apresentador, placar, poderes configuráveis, enquetes e telas corporativas */
(function () {
  const X = {
    pt: {
      ctrl_title: "Controles", ctrl_pause: "Pausar", ctrl_resume: "Retomar", ctrl_finish: "Finalizar jogo", ctrl_restart: "Reiniciar partida",
      ctrl_board_show: "Mostrar placar", ctrl_board_hide: "Ocultar placar", paused_banner: "⏸ JOGO PAUSADO",
      confirm_finish: "Finalizar o jogo agora e mostrar o pódio?", confirm_restart: "Reiniciar a partida? Os pontos serão zerados e todos voltam para a sala de espera.",
      cfg_board: "Placar", board_live: "Ao vivo (sempre visível)", board_reveal: "Só depois de cada pergunta", board_end: "Só no final (suspense)",
      cfg_powers: "Poderes", cfg_powers_d: "Ligue ou desligue cada poder e defina quantos acertos são necessários para liberá-lo.", cfg_power_hits: "acertos",
      cfg_live_note: "Jogo em andamento: dá para mudar tempo, pontos, placar e poderes. Modo, idioma, cargas e quiz só no lobby.",
      board_hidden: "🔒 Placar oculto pelo apresentador", tpl_cat_corp: "Corporativo & Treinamento", tpl_cat_fun: "Diversão & Conhecimentos Gerais",
      ed_poll: "Enquete (sem resposta certa)", poll_badge: "ENQUETE", poll_label: "(enquete)", voted: "✅ Voto registrado!", poll_result: "📊 Resultado da enquete",
      err_paused: "Jogo pausado. Aguarde o apresentador.", err_power_off: "Este poder está desligado nesta sala.", err_poll_question: "Poderes não valem em enquetes.",
      corp_join_at: "Entre em", corp_with_pin: "com o PIN do jogo", corp_waiting: "Aguardando participantes…", corp_start: "Começar", corp_answers: "respostas",
      corp_scoreboard: "Placar", corp_podium: "Pódio", corp_behind: "{pts} pts atrás de {name}", corp_lead: "Você está na liderança!",
      corp_question_n: "Pergunta {n} de {total}", corp_nick: "Seu nome", corp_enter: "OK, entrar!", corp_youre_in: "Você entrou!", corp_see_name: "Veja seu nome na tela do apresentador",
      corp_answered: "Resposta enviada! Aguardando os outros…", corp_final_pos: "Você terminou em {n}º lugar", corp_points: "pontos", corp_correct: "Correto", corp_wrong: "Incorreto", corp_timeup: "Tempo esgotado",
      corp_paused: "Pausado", corp_view_all: "Ver classificação completa", corp_get_ready: "Prepare-se!", corp_poll_thanks: "Obrigado pela resposta!"
    },
    en: {
      ctrl_title: "Controls", ctrl_pause: "Pause", ctrl_resume: "Resume", ctrl_finish: "End game", ctrl_restart: "Restart match",
      ctrl_board_show: "Show scoreboard", ctrl_board_hide: "Hide scoreboard", paused_banner: "⏸ GAME PAUSED",
      confirm_finish: "End the game now and show the podium?", confirm_restart: "Restart the match? Scores will be reset and everyone goes back to the waiting room.",
      cfg_board: "Scoreboard", board_live: "Live (always visible)", board_reveal: "Only after each question", board_end: "Only at the end (suspense)",
      cfg_powers: "Powers", cfg_powers_d: "Turn each power on or off and set how many correct answers unlock it.", cfg_power_hits: "hits",
      cfg_live_note: "Game in progress: you can change time, points, scoreboard and powers. Mode, language, charges and quiz only in the lobby.",
      board_hidden: "🔒 Scoreboard hidden by the host", tpl_cat_corp: "Corporate & Training", tpl_cat_fun: "Fun & General Knowledge",
      ed_poll: "Poll (no right answer)", poll_badge: "POLL", poll_label: "(poll)", voted: "✅ Vote recorded!", poll_result: "📊 Poll result",
      err_paused: "Game paused. Wait for the host.", err_power_off: "This power is turned off in this room.", err_poll_question: "Powers don't work on polls.",
      corp_join_at: "Join at", corp_with_pin: "with the game PIN", corp_waiting: "Waiting for participants…", corp_start: "Start", corp_answers: "answers",
      corp_scoreboard: "Scoreboard", corp_podium: "Podium", corp_behind: "{pts} pts behind {name}", corp_lead: "You are in the lead!",
      corp_question_n: "Question {n} of {total}", corp_nick: "Your name", corp_enter: "OK, go!", corp_youre_in: "You're in!", corp_see_name: "See your name on the host screen",
      corp_answered: "Answer sent! Waiting for the others…", corp_final_pos: "You finished in place #{n}", corp_points: "points", corp_correct: "Correct", corp_wrong: "Incorrect", corp_timeup: "Time's up",
      corp_paused: "Paused", corp_view_all: "See full ranking", corp_get_ready: "Get ready!", corp_poll_thanks: "Thanks for your answer!"
    },
    es: {
      ctrl_title: "Controles", ctrl_pause: "Pausar", ctrl_resume: "Reanudar", ctrl_finish: "Finalizar juego", ctrl_restart: "Reiniciar partida",
      ctrl_board_show: "Mostrar marcador", ctrl_board_hide: "Ocultar marcador", paused_banner: "⏸ JUEGO EN PAUSA",
      confirm_finish: "¿Finalizar el juego ahora y mostrar el podio?", confirm_restart: "¿Reiniciar la partida? Los puntos se reinician y todos vuelven a la sala de espera.",
      cfg_board: "Marcador", board_live: "En vivo (siempre visible)", board_reveal: "Sólo después de cada pregunta", board_end: "Sólo al final (suspenso)",
      cfg_powers: "Poderes", cfg_powers_d: "Activa o desactiva cada poder y define cuántos aciertos lo desbloquean.", cfg_power_hits: "aciertos",
      cfg_live_note: "Juego en curso: puedes cambiar tiempo, puntos, marcador y poderes. Modo, idioma, cargas y quiz sólo en el lobby.",
      board_hidden: "🔒 Marcador oculto por el presentador", tpl_cat_corp: "Corporativo y Capacitación", tpl_cat_fun: "Diversión y Cultura General",
      ed_poll: "Encuesta (sin respuesta correcta)", poll_badge: "ENCUESTA", poll_label: "(encuesta)", voted: "✅ ¡Voto registrado!", poll_result: "📊 Resultado de la encuesta",
      err_paused: "Juego en pausa. Espera al presentador.", err_power_off: "Este poder está desactivado en esta sala.", err_poll_question: "Los poderes no valen en encuestas.",
      corp_join_at: "Entra en", corp_with_pin: "con el PIN del juego", corp_waiting: "Esperando participantes…", corp_start: "Comenzar", corp_answers: "respuestas",
      corp_scoreboard: "Marcador", corp_podium: "Podio", corp_behind: "{pts} pts detrás de {name}", corp_lead: "¡Vas en primer lugar!",
      corp_question_n: "Pregunta {n} de {total}", corp_nick: "Tu nombre", corp_enter: "¡OK, entrar!", corp_youre_in: "¡Ya estás dentro!", corp_see_name: "Mira tu nombre en la pantalla del presentador",
      corp_answered: "¡Respuesta enviada! Esperando a los demás…", corp_final_pos: "Terminaste en el puesto {n}", corp_points: "puntos", corp_correct: "Correcto", corp_wrong: "Incorrecto", corp_timeup: "Se acabó el tiempo",
      corp_paused: "En pausa", corp_view_all: "Ver clasificación completa", corp_get_ready: "¡Prepárate!", corp_poll_thanks: "¡Gracias por tu respuesta!"
    }
  };
  for (const l in X) Object.assign(I18N[l], X[l]);
})();

/* Salas públicas/privadas, pedidos de entrada e avanço automático */
(function () {
  const X = {
    pt: {
      pub_title: "Salas públicas", pub_sub: "Escolha uma sala e peça para entrar. O organizador aprova o seu pedido.", pub_empty: "Nenhuma sala pública aberta agora.",
      pub_request: "Pedir para entrar", pub_send: "Enviar pedido", pub_cancel: "Cancelar", pub_waiting: "Pedido enviado! Aguardando o organizador aceitar…",
      pub_denied: "O organizador recusou o pedido.", pub_approved: "Pedido aceito! Escaneie o QR code com o celular ou entre agora:", pub_enter_now: "Entrar agora",
      pub_players: "{n} jogadores", pub_in_game: "em jogo", pub_in_lobby: "na sala de espera", pub_or_code: "Tem um código? Digite acima.",
      cfg_room: "Sala", lbl_room_name: "Nome da sala (aparece na lista pública)", vis_private: "Privada", vis_private_d: "Só entra quem tem o código ou o QR code. Não aparece em nenhuma lista.",
      vis_public: "Pública", vis_public_d: "Aparece na lista de salas da página inicial. As pessoas pedem para entrar e você aceita ou recusa.",
      cfg_auto: "Avançar sozinho para a próxima pergunta", cfg_auto_delay: "Tempo mostrando o resultado antes da próxima", ctrl_auto: "Automático",
      next_in: "Próxima em {s}s", next_q_in: "Próxima pergunta em {s}s", auto_hold: "Avanço automático segurado", ctrl_hold: "Segurar", ctrl_release: "Continuar",
      req_title: "Pedidos de entrada", req_accept: "Aceitar", req_deny: "Recusar", req_new: "{name} pediu para entrar",
      err_room_private: "Esta sala é privada.", err_too_many_requests: "Muitos pedidos pendentes. Tente mais tarde.", err_request_not_found: "Pedido não encontrado."
    },
    en: {
      pub_title: "Public rooms", pub_sub: "Pick a room and ask to join. The organizer approves your request.", pub_empty: "No public rooms open right now.",
      pub_request: "Ask to join", pub_send: "Send request", pub_cancel: "Cancel", pub_waiting: "Request sent! Waiting for the organizer to accept…",
      pub_denied: "The organizer declined the request.", pub_approved: "Request accepted! Scan the QR code with your phone or join now:", pub_enter_now: "Join now",
      pub_players: "{n} players", pub_in_game: "in game", pub_in_lobby: "in the waiting room", pub_or_code: "Have a code? Type it above.",
      cfg_room: "Room", lbl_room_name: "Room name (shown in the public list)", vis_private: "Private", vis_private_d: "Only people with the code or QR code can join. Not listed anywhere.",
      vis_public: "Public", vis_public_d: "Shown in the room list on the home page. People ask to join and you accept or decline.",
      cfg_auto: "Move on to the next question automatically", cfg_auto_delay: "Time showing the result before the next one", ctrl_auto: "Automatic",
      next_in: "Next in {s}s", next_q_in: "Next question in {s}s", auto_hold: "Auto-advance on hold", ctrl_hold: "Hold", ctrl_release: "Continue",
      req_title: "Join requests", req_accept: "Accept", req_deny: "Decline", req_new: "{name} asked to join",
      err_room_private: "This room is private.", err_too_many_requests: "Too many pending requests. Try again later.", err_request_not_found: "Request not found."
    },
    es: {
      pub_title: "Salas públicas", pub_sub: "Elige una sala y pide entrar. El organizador aprueba tu solicitud.", pub_empty: "No hay salas públicas abiertas ahora.",
      pub_request: "Pedir entrar", pub_send: "Enviar solicitud", pub_cancel: "Cancelar", pub_waiting: "¡Solicitud enviada! Esperando que el organizador acepte…",
      pub_denied: "El organizador rechazó la solicitud.", pub_approved: "¡Solicitud aceptada! Escanea el código QR con el móvil o entra ahora:", pub_enter_now: "Entrar ahora",
      pub_players: "{n} jugadores", pub_in_game: "en juego", pub_in_lobby: "en la sala de espera", pub_or_code: "¿Tienes un código? Escríbelo arriba.",
      cfg_room: "Sala", lbl_room_name: "Nombre de la sala (aparece en la lista pública)", vis_private: "Privada", vis_private_d: "Sólo entra quien tiene el código o el QR. No aparece en ninguna lista.",
      vis_public: "Pública", vis_public_d: "Aparece en la lista de salas de la página de inicio. Las personas piden entrar y tú aceptas o rechazas.",
      cfg_auto: "Pasar sola a la siguiente pregunta", cfg_auto_delay: "Tiempo mostrando el resultado antes de la siguiente", ctrl_auto: "Automático",
      next_in: "Siguiente en {s}s", next_q_in: "Siguiente pregunta en {s}s", auto_hold: "Avance automático detenido", ctrl_hold: "Detener", ctrl_release: "Continuar",
      req_title: "Solicitudes de entrada", req_accept: "Aceptar", req_deny: "Rechazar", req_new: "{name} pidió entrar",
      err_room_private: "Esta sala es privada.", err_too_many_requests: "Demasiadas solicitudes pendientes. Inténtalo más tarde.", err_request_not_found: "Solicitud no encontrada."
    }
  };
  for (const l in X) Object.assign(I18N[l], X[l]);
})();

/* Quem responde: mais rápido x por vez */
(function () {
  const X = {
    pt: {
      cfg_order: "Quem responde", order_speed: "O mais rápido", order_speed_d: "Todos respondem ao mesmo tempo; vale a velocidade.",
      order_turns: "Por vez (ordem dos participantes)", order_turns_d: "Cada pergunta é de um participante, na ordem de entrada. Os outros acompanham a jogada no celular.",
      turn_of: "Vez de {name}", your_turn: "🎯 SUA VEZ! Responda agora", watch_turn: "👀 Vez de {name}: acompanhe a jogada", turn_picked: "{name} escolheu {letter}",
      turn_right: "✅ {name} acertou!", turn_wrong: "❌ {name} errou.", turn_timeout: "⏰ {name} não respondeu a tempo.", turn_waiting: "Aguardando {name} responder…",
      give_turn: "Dar a vez", order_list: "Ordem dos participantes", err_not_your_turn: "Não é a sua vez.",
      ev_turn: "🎯 Vez de {name}", ev_turn_skip: "🚫 {name} perdeu a vez (bloqueio)", ev_turn_timeout: "⏰ {name} não respondeu a tempo"
    },
    en: {
      cfg_order: "Who answers", order_speed: "The fastest", order_speed_d: "Everyone answers at the same time; speed wins.",
      order_turns: "Turns (participant order)", order_turns_d: "Each question belongs to one participant, in joining order. The others follow the play on their phones.",
      turn_of: "{name}'s turn", your_turn: "🎯 YOUR TURN! Answer now", watch_turn: "👀 {name}'s turn: follow the play", turn_picked: "{name} chose {letter}",
      turn_right: "✅ {name} got it right!", turn_wrong: "❌ {name} got it wrong.", turn_timeout: "⏰ {name} did not answer in time.", turn_waiting: "Waiting for {name} to answer…",
      give_turn: "Give turn", order_list: "Participant order", err_not_your_turn: "It's not your turn.",
      ev_turn: "🎯 {name}'s turn", ev_turn_skip: "🚫 {name} lost the turn (block)", ev_turn_timeout: "⏰ {name} did not answer in time"
    },
    es: {
      cfg_order: "Quién responde", order_speed: "El más rápido", order_speed_d: "Todos responden al mismo tiempo; gana la velocidad.",
      order_turns: "Por turno (orden de participantes)", order_turns_d: "Cada pregunta es de un participante, en orden de entrada. Los demás siguen la jugada en el móvil.",
      turn_of: "Turno de {name}", your_turn: "🎯 ¡TU TURNO! Responde ahora", watch_turn: "👀 Turno de {name}: sigue la jugada", turn_picked: "{name} eligió {letter}",
      turn_right: "✅ ¡{name} acertó!", turn_wrong: "❌ {name} falló.", turn_timeout: "⏰ {name} no respondió a tiempo.", turn_waiting: "Esperando que {name} responda…",
      give_turn: "Dar el turno", order_list: "Orden de participantes", err_not_your_turn: "No es tu turno.",
      ev_turn: "🎯 Turno de {name}", ev_turn_skip: "🚫 {name} perdió el turno (bloqueo)", ev_turn_timeout: "⏰ {name} no respondió a tiempo"
    }
  };
  for (const l in X) Object.assign(I18N[l], X[l]);
})();

// por vez: rótulo do resultado da jogada (ex.: "Ana escolheu B · ✅ Ana acertou!")
function turnResultText(q) {
  if (!q || !q.turn) return '';
  if (q.turn_pick === undefined || q.turn_pick === null) return t('turn_timeout', { name: q.turn.name });
  const pick = t('turn_picked', { name: q.turn.name, letter: 'ABCDEF'[q.turn_pick] });
  if (q.poll) return pick;
  return pick + ' · ' + (q.turn_pick === q.correct ? t('turn_right', { name: q.turn.name }) : t('turn_wrong', { name: q.turn.name }));
}

(function () {
  I18N.pt.help_s1_l5 = "<strong>Modo Por vez:</strong> cada pergunta é de um participante (na ordem de entrada). Só ele responde e usa os poderes próprios; os outros acompanham a escolha dele e podem usar poderes de ataque. O Bloqueio faz o alvo perder a próxima vez.";
  I18N.en.help_s1_l5 = "<strong>Turns mode:</strong> each question belongs to one participant (in joining order). Only they answer and use self powers; the others watch their choice and can use attack powers. Block makes the target lose their next turn.";
  I18N.es.help_s1_l5 = "<strong>Modo Por turno:</strong> cada pregunta es de un participante (en orden de entrada). Sólo él responde y usa sus poderes; los demás siguen su elección y pueden usar poderes de ataque. El Bloqueo hace que el objetivo pierda su próximo turno.";
  I18N.pt.help_classic_5 = "No modo <strong>Por vez</strong>, cada pergunta é de um participante e os outros acompanham a resposta dele.";
  I18N.en.help_classic_5 = "In <strong>Turns</strong> mode, each question belongs to one participant and the others watch their answer.";
  I18N.es.help_classic_5 = "En el modo <strong>Por turno</strong>, cada pregunta es de un participante y los demás siguen su respuesta.";
})();

/* Chamar atenção, reações, música de tensão e temas */
(function () {
  const X = {
    pt: {
      sound_on: "Som ligado", sound_off: "Som desligado", nudge_btn: "Chamar atenção", nudge_title: "Chamar atenção", nudge_desc: "Escolha o som e o rival: o celular dele vai tocar alto! Restam {n}.",
      nudge_horn: "Buzina", nudge_scare: "Susto", nudge_siren: "Sirene", nudge_got: "{name} chamou sua atenção!", nudge_sent: "Você chamou a atenção de {name}!",
      ev_nudge: "📢 {name} chamou a atenção de {target}!", react_title: "Reações (aparecem no telão)",
      err_no_nudges: "Você já usou todas as chamadas de atenção.", err_reactions_off: "Reações desligadas pelo organizador.", err_bad_emoji: "Emoji inválido.", err_slow_down: "Calma! Espere um instante.",
      cfg_fun: "Interação e aparência", cfg_nudge: "Chamar atenção: usos por jogador (0 = desligado)", cfg_reactions: "Reações com emoji na tela do organizador",
      cfg_tension: "Música de tensão quando o tempo estiver acabando", cfg_tension_secs: "Começa nos últimos", cfg_theme: "Tema visual",
      theme_auto: "Automático", theme_gamer: "Gamer", theme_tech: "Tecnológico", theme_corporate: "Corporativo", theme_minimal: "Minimalista",
      theme_feminine: "Feminino", theme_inclusive: "Inclusivo", theme_kids: "Infantil", theme_nature: "Natureza"
    },
    en: {
      sound_on: "Sound on", sound_off: "Sound off", nudge_btn: "Get attention", nudge_title: "Get attention", nudge_desc: "Pick the sound and the rival: their phone will ring loud! {n} left.",
      nudge_horn: "Horn", nudge_scare: "Scare", nudge_siren: "Siren", nudge_got: "{name} wants your attention!", nudge_sent: "You nudged {name}!",
      ev_nudge: "📢 {name} nudged {target}!", react_title: "Reactions (shown on the big screen)",
      err_no_nudges: "You have used all your nudges.", err_reactions_off: "Reactions are turned off by the organizer.", err_bad_emoji: "Invalid emoji.", err_slow_down: "Easy! Wait a moment.",
      cfg_fun: "Interaction and look", cfg_nudge: "Get attention: uses per player (0 = off)", cfg_reactions: "Emoji reactions on the organizer screen",
      cfg_tension: "Tension music when time is running out", cfg_tension_secs: "Starts in the last", cfg_theme: "Visual theme",
      theme_auto: "Automatic", theme_gamer: "Gamer", theme_tech: "Tech", theme_corporate: "Corporate", theme_minimal: "Minimal",
      theme_feminine: "Feminine", theme_inclusive: "Inclusive", theme_kids: "Kids", theme_nature: "Nature"
    },
    es: {
      sound_on: "Sonido activado", sound_off: "Sonido desactivado", nudge_btn: "Llamar la atención", nudge_title: "Llamar la atención", nudge_desc: "Elige el sonido y el rival: ¡su móvil sonará fuerte! Quedan {n}.",
      nudge_horn: "Bocina", nudge_scare: "Susto", nudge_siren: "Sirena", nudge_got: "¡{name} te llamó la atención!", nudge_sent: "¡Le llamaste la atención a {name}!",
      ev_nudge: "📢 ¡{name} le llamó la atención a {target}!", react_title: "Reacciones (aparecen en la pantalla grande)",
      err_no_nudges: "Ya usaste todos tus llamados de atención.", err_reactions_off: "El organizador desactivó las reacciones.", err_bad_emoji: "Emoji inválido.", err_slow_down: "¡Calma! Espera un momento.",
      cfg_fun: "Interacción y apariencia", cfg_nudge: "Llamar la atención: usos por jugador (0 = desactivado)", cfg_reactions: "Reacciones con emoji en la pantalla del organizador",
      cfg_tension: "Música de tensión cuando se acaba el tiempo", cfg_tension_secs: "Empieza en los últimos", cfg_theme: "Tema visual",
      theme_auto: "Automático", theme_gamer: "Gamer", theme_tech: "Tecnológico", theme_corporate: "Corporativo", theme_minimal: "Minimalista",
      theme_feminine: "Femenino", theme_inclusive: "Inclusivo", theme_kids: "Infantil", theme_nature: "Naturaleza"
    }
  };
  for (const l in X) Object.assign(I18N[l], X[l]);
})();

/* Temas de programa de auditório */
(function () {
  const X = {
    pt: { theme_neon_pink: "Neon Rosa", theme_neon_blue: "Neon Azul", theme_stage: "Palco de TV", theme_prize_blue: "Show de Prêmios (azul)", theme_prize_red: "Show de Prêmios (vermelho)", stage_question: "Pergunta {n} de {total}", stage_correct_n: "{n} acertaram" },
    en: { theme_neon_pink: "Pink Neon", theme_neon_blue: "Blue Neon", theme_stage: "TV Stage", theme_prize_blue: "Prize Show (blue)", theme_prize_red: "Prize Show (red)", stage_question: "Question {n} of {total}", stage_correct_n: "{n} got it right" },
    es: { theme_neon_pink: "Neón Rosa", theme_neon_blue: "Neón Azul", theme_stage: "Plató de TV", theme_prize_blue: "Show de Premios (azul)", theme_prize_red: "Show de Premios (rojo)", stage_question: "Pregunta {n} de {total}", stage_correct_n: "{n} acertaron" }
  };
  for (const l in X) Object.assign(I18N[l], X[l]);
})();

/* Temas de inclusão, variações de cor e modo acessível */
(function () {
  const X = {
    pt: { theme_pride: "Orgulho LGBTQIA+", theme_diversity: "Diversidade", theme_kids_incl: "Inclusão Infantil", theme_minds: "Mentes Coloridas", theme_inclusive: "Alto contraste",
          theme_group_show: "Programa de auditório", theme_group_incl: "Diversidade e inclusão", theme_group_base: "Básicos", variant_n: "tom {n}",
          a11y_on: "Modo acessível ligado: letras maiores, mais contraste e menos animação", a11y_off: "Modo acessível desligado" },
    en: { theme_pride: "LGBTQIA+ Pride", theme_diversity: "Diversity", theme_kids_incl: "Kids Inclusion", theme_minds: "Colorful Minds", theme_inclusive: "High contrast",
          theme_group_show: "Game show", theme_group_incl: "Diversity and inclusion", theme_group_base: "Basics", variant_n: "shade {n}",
          a11y_on: "Accessible mode on: bigger text, more contrast, less motion", a11y_off: "Accessible mode off" },
    es: { theme_pride: "Orgullo LGBTQIA+", theme_diversity: "Diversidad", theme_kids_incl: "Inclusión Infantil", theme_minds: "Mentes de Colores", theme_inclusive: "Alto contraste",
          theme_group_show: "Programa de concursos", theme_group_incl: "Diversidad e inclusión", theme_group_base: "Básicos", variant_n: "tono {n}",
          a11y_on: "Modo accesible activado: letras más grandes, más contraste y menos animación", a11y_off: "Modo accesible desactivado" }
  };
  for (const l in X) Object.assign(I18N[l], X[l]);
})();

/* Tema Infantil, maximizar e tela cheia */
(function () {
  const X = {
    pt: { theme_kids: "Infantil", theme_group_kids: "Infantil e escolar", kids_v0: "Caderno colorido", kids_v1: "Circo", kids_v2: "Verde e amarelo", stage_heading: "Pergunta {n}",
          win_max: "Maximizar janela", win_restore: "Restaurar tamanho", fs_enter: "Tela cheia", fs_exit: "Sair da tela cheia" },
    en: { theme_kids: "Kids", theme_group_kids: "Kids and school", kids_v0: "Colorful notebook", kids_v1: "Circus", kids_v2: "Green and yellow", stage_heading: "Question {n}",
          win_max: "Maximize window", win_restore: "Restore size", fs_enter: "Fullscreen", fs_exit: "Exit fullscreen" },
    es: { theme_kids: "Infantil", theme_group_kids: "Infantil y escolar", kids_v0: "Cuaderno colorido", kids_v1: "Circo", kids_v2: "Verde y amarillo", stage_heading: "Pregunta {n}",
          win_max: "Maximizar ventana", win_restore: "Restaurar tamaño", fs_enter: "Pantalla completa", fs_exit: "Salir de pantalla completa" }
  };
  for (const l in X) Object.assign(I18N[l], X[l]);
})();

/* Arsenal e emojis do organizador */
(function () {
  const X = {
    pt: {
      host_arsenal: "Arsenal", host_arsenal_title: "Arsenal do organizador", host_emojis: "Emojis p/ todos", host_label: "Organizador",
      ha_desc: "O organizador não gasta cargas: o arsenal é ilimitado. Os efeitos “Para todos” valem para todos os participantes na pergunta aberta.",
      ha_all: "Para todos (pergunta aberta)", ha_target: "Contra um participante (Arena)", ha_give: "Dar cargas de poder (Arena)", ha_give_btn: "Dar +1 carga", ha_everyone: "Todos",
      ha_all_5050: "50/50 geral", ha_all_double: "XP em dobro", ha_all_hint: "Dica p/ todos", ha_all_time: "+15 s", ha_all_dice: "Dado da sorte", ha_all_card: "Carta surpresa",
      ha_trap: "Armadilha", ha_block: "Bloquear", ha_seal: "Lacrar", ha_card_shield: "2ª chance para todos (o 1º erro não conta)", ha_card_allin: "pontos triplicados (3x) para todos",
      ha_only_open: "Abra uma pergunta para usar os efeitos “Para todos”.", ha_arena_only: "Disponível só no modo Arena (no Clássico não há cargas de poder).", ha_done: "{power}: enviado!",
      hdice_1: "+5 s para todos", hdice_2: "+10 s para todos", hdice_3: "1 alternativa errada some", hdice_4: "+15 s para todos", hdice_5: "escudo de sequência para todos", hdice_6: "2 erradas somem + XP em dobro!",
      card_TIME_t: "Tempo Extra", card_TIME_d: "+20 segundos para todos",
      ev_host_power: "🎤 O organizador ativou {hp} para todos!", ev_host_dice: "🎤🎲 Dado do organizador: {roll} — {fx}", ev_host_card: "🎤🃏 Carta do organizador: {card}!",
      ev_host_target: "🎤 O organizador usou {hp} em {target}!", ev_host_give: "🎤🎁 O organizador deu +1 {power} para {target}!",
      err_powers_off: "Poderes desligados nesta sala.", err_bad_power: "Poder inválido.", err_bad_emoji: "Emoji inválido.", err_poll_question: "Não vale em enquete.",
      help_s5: "5. Arsenal e emojis do organizador",
      help_s5_l1: "Na tela do organizador fica a barra <strong>🧰 Arsenal + emojis</strong>. Os emojis aparecem grandes no celular de todos os participantes.",
      help_s5_l2: "<strong>Para todos</strong> (com a pergunta aberta): 50/50 geral, XP em dobro, dica, +15 s, Dado da sorte e Carta surpresa. Não gasta cargas.",
      help_s5_l3: "<strong>Contra um participante</strong> (Arena): Armadilha, Bloqueio ou Lacre. <strong>Dar cargas</strong>: +1 de qualquer poder para um participante ou para todos.",
      help_s5_l4: "Cada ação do organizador aparece como aviso 🎤 nos celulares e no feed de eventos.",
      help_classic_6: "O organizador tem um <strong>🧰 Arsenal</strong> (50/50 geral, pontos em dobro, dica, +15 s, dado e carta para todos) e envia <strong>emojis</strong> que aparecem no celular de todos."
    },
    en: {
      host_arsenal: "Arsenal", host_arsenal_title: "Organizer's arsenal", host_emojis: "Emojis to all", host_label: "Organizer",
      ha_desc: "The organizer spends no charges: the arsenal is unlimited. “For everyone” effects apply to all participants on the open question.",
      ha_all: "For everyone (open question)", ha_target: "Against one participant (Arena)", ha_give: "Give power charges (Arena)", ha_give_btn: "Give +1 charge", ha_everyone: "Everyone",
      ha_all_5050: "50/50 for all", ha_all_double: "Double XP", ha_all_hint: "Hint for all", ha_all_time: "+15 s", ha_all_dice: "Lucky dice", ha_all_card: "Surprise card",
      ha_trap: "Trap", ha_block: "Block", ha_seal: "Seal", ha_card_shield: "2nd chance for everyone (first miss does not count)", ha_card_allin: "triple points (3x) for everyone",
      ha_only_open: "Open a question to use “For everyone” effects.", ha_arena_only: "Arena mode only (Classic has no power charges).", ha_done: "{power}: sent!",
      hdice_1: "+5 s for everyone", hdice_2: "+10 s for everyone", hdice_3: "1 wrong option removed", hdice_4: "+15 s for everyone", hdice_5: "streak shield for everyone", hdice_6: "2 wrong options removed + double XP!",
      card_TIME_t: "Extra Time", card_TIME_d: "+20 seconds for everyone",
      ev_host_power: "🎤 The organizer activated {hp} for everyone!", ev_host_dice: "🎤🎲 Organizer's dice: {roll} — {fx}", ev_host_card: "🎤🃏 Organizer's card: {card}!",
      ev_host_target: "🎤 The organizer used {hp} on {target}!", ev_host_give: "🎤🎁 The organizer gave +1 {power} to {target}!",
      err_powers_off: "Powers are off in this room.", err_bad_power: "Invalid power.", err_bad_emoji: "Invalid emoji.", err_poll_question: "Not valid on a poll.",
      help_s5: "5. Organizer's arsenal and emojis",
      help_s5_l1: "The organizer screen has the <strong>🧰 Arsenal + emojis</strong> bar. Emojis pop up big on every participant's phone.",
      help_s5_l2: "<strong>For everyone</strong> (open question): 50/50, double XP, hint, +15 s, Lucky dice and Surprise card. No charges spent.",
      help_s5_l3: "<strong>Against one participant</strong> (Arena): Trap, Block or Seal. <strong>Give charges</strong>: +1 of any power to one participant or everyone.",
      help_s5_l4: "Every organizer action shows up as a 🎤 notice on phones and in the event feed.",
      help_classic_6: "The organizer has an <strong>🧰 Arsenal</strong> (50/50, double points, hint, +15 s, dice and card for everyone) and sends <strong>emojis</strong> that pop up on every phone."
    },
    es: {
      host_arsenal: "Arsenal", host_arsenal_title: "Arsenal del organizador", host_emojis: "Emojis p/ todos", host_label: "Organizador",
      ha_desc: "El organizador no gasta cargas: el arsenal es ilimitado. Los efectos “Para todos” valen para todos los participantes en la pregunta abierta.",
      ha_all: "Para todos (pregunta abierta)", ha_target: "Contra un participante (Arena)", ha_give: "Dar cargas de poder (Arena)", ha_give_btn: "Dar +1 carga", ha_everyone: "Todos",
      ha_all_5050: "50/50 general", ha_all_double: "XP doble", ha_all_hint: "Pista p/ todos", ha_all_time: "+15 s", ha_all_dice: "Dado de la suerte", ha_all_card: "Carta sorpresa",
      ha_trap: "Trampa", ha_block: "Bloquear", ha_seal: "Sellar", ha_card_shield: "2ª oportunidad para todos (el 1er error no cuenta)", ha_card_allin: "puntos triples (3x) para todos",
      ha_only_open: "Abre una pregunta para usar los efectos “Para todos”.", ha_arena_only: "Sólo en modo Arena (el Clásico no tiene cargas de poder).", ha_done: "{power}: ¡enviado!",
      hdice_1: "+5 s para todos", hdice_2: "+10 s para todos", hdice_3: "desaparece 1 opción incorrecta", hdice_4: "+15 s para todos", hdice_5: "escudo de racha para todos", hdice_6: "¡desaparecen 2 incorrectas + XP doble!",
      card_TIME_t: "Tiempo Extra", card_TIME_d: "+20 segundos para todos",
      ev_host_power: "🎤 ¡El organizador activó {hp} para todos!", ev_host_dice: "🎤🎲 Dado del organizador: {roll} — {fx}", ev_host_card: "🎤🃏 ¡Carta del organizador: {card}!",
      ev_host_target: "🎤 ¡El organizador usó {hp} en {target}!", ev_host_give: "🎤🎁 ¡El organizador dio +1 {power} a {target}!",
      err_powers_off: "Poderes desactivados en esta sala.", err_bad_power: "Poder inválido.", err_bad_emoji: "Emoji inválido.", err_poll_question: "No vale en encuesta.",
      help_s5: "5. Arsenal y emojis del organizador",
      help_s5_l1: "En la pantalla del organizador está la barra <strong>🧰 Arsenal + emojis</strong>. Los emojis aparecen en grande en el móvil de todos.",
      help_s5_l2: "<strong>Para todos</strong> (pregunta abierta): 50/50, XP doble, pista, +15 s, Dado de la suerte y Carta sorpresa. No gasta cargas.",
      help_s5_l3: "<strong>Contra un participante</strong> (Arena): Trampa, Bloqueo o Sello. <strong>Dar cargas</strong>: +1 de cualquier poder a un participante o a todos.",
      help_s5_l4: "Cada acción del organizador aparece como aviso 🎤 en los móviles y en el feed de eventos.",
      help_classic_6: "El organizador tiene un <strong>🧰 Arsenal</strong> (50/50, puntos dobles, pista, +15 s, dado y carta para todos) y envía <strong>emojis</strong> que aparecen en todos los móviles."
    }
  };
  for (const l in X) Object.assign(I18N[l], X[l]);
})();

/* Escopo da partida: quantidade de perguntas */
(function () {
  const X = {
    pt: { cfg_scope: "Escopo da partida", scope_all: "Todas", scope_first: "Na sequência do quiz", scope_random: "Sorteadas do quiz", scope_random_short: "sorteadas",
          scope_badge: "{n} perguntas", scope_per_player: "({n} p/ jogador)", scope_info: "Serão usadas {n} de {total} perguntas do quiz · duração estimada ≈ {min} min",
          quiz_n_of: "{n} de {total} perguntas",
          help_s1_l6: "<strong>Escopo da partida:</strong> em Configurar Jogo, o organizador escolhe quantas perguntas do quiz usar (ex.: 90 de 120), na sequência ou sorteadas. A tela mostra quantas cada jogador responde no modo Por vez e a duração estimada.",
          help_classic_7: "O organizador pode usar só parte do quiz (ex.: 90 de 120 perguntas), na sequência ou sorteadas, em <strong>Configurar Jogo → Escopo da partida</strong>." },
    en: { cfg_scope: "Game scope", scope_all: "All", scope_first: "In quiz order", scope_random: "Randomly drawn", scope_random_short: "random",
          scope_badge: "{n} questions", scope_per_player: "({n} per player)", scope_info: "{n} of {total} quiz questions will be used · estimated length ≈ {min} min",
          quiz_n_of: "{n} of {total} questions",
          help_s1_l6: "<strong>Game scope:</strong> in Game Settings, the organizer chooses how many quiz questions to use (e.g. 90 of 120), in order or randomly drawn. The screen shows how many each player answers in Turns mode and the estimated length.",
          help_classic_7: "The organizer can use only part of the quiz (e.g. 90 of 120 questions), in order or randomly drawn, in <strong>Game Settings → Game scope</strong>." },
    es: { cfg_scope: "Alcance de la partida", scope_all: "Todas", scope_first: "En el orden del quiz", scope_random: "Sorteadas del quiz", scope_random_short: "sorteadas",
          scope_badge: "{n} preguntas", scope_per_player: "({n} por jugador)", scope_info: "Se usarán {n} de {total} preguntas del quiz · duración estimada ≈ {min} min",
          quiz_n_of: "{n} de {total} preguntas",
          help_s1_l6: "<strong>Alcance de la partida:</strong> en Configurar Juego, el organizador elige cuántas preguntas del quiz usar (ej.: 90 de 120), en orden o sorteadas. La pantalla muestra cuántas responde cada jugador en modo Por turno y la duración estimada.",
          help_classic_7: "El organizador puede usar solo parte del quiz (ej.: 90 de 120 preguntas), en orden o sorteadas, en <strong>Configurar Juego → Alcance de la partida</strong>." }
  };
  for (const l in X) Object.assign(I18N[l], X[l]);
})();

/* Sair e expiração da sessão (5 min sem conexão) */
(function () {
  const X = {
    pt: { btn_leave: "Sair", leave_confirm: "Sair da sala? Seus pontos desta partida serão perdidos.", leave_confirm_end: "Sair da sala?",
          host_leave_title: "Sair e encerrar a sala", host_leave_confirm: "Encerrar a sala e sair? Todos os participantes serão desconectados.",
          session_ended: "Você saiu da sala: ficou mais de 5 minutos sem conexão ou foi removido pelo organizador. Entre novamente com o código.",
          room_closed: "A sala foi encerrada: o organizador saiu ou ficou mais de 5 minutos sem conexão.",
          host_session_ended: "Sua sala foi encerrada (você saiu ou ficou mais de 5 minutos sem conexão). Crie uma nova sala.",
          err_room_closed: "A sala foi encerrada.",
          ev_left: "👋 {name} saiu da sala", ev_left_idle: "📴 {name} ficou 5 min sem conexão e saiu da sala",
          help_s1_l7: "<strong>Sair e conexão:</strong> use o botão <b>Sair</b> para deixar a sala. Se fechar o navegador ou o celular desconectar, você tem <b>5 minutos</b> para voltar (mesmo link ou código): depois disso a sessão é encerrada. Se o organizador ficar 5 minutos sem conexão, a sala é encerrada.",
          help_classic_8: "Use o botão <strong>Sair</strong> para deixar a sala. Quem fica <strong>5 minutos sem conexão</strong> é desconectado, e a sala é encerrada se o organizador ficar 5 minutos ausente." },
    en: { btn_leave: "Leave", leave_confirm: "Leave the room? Your points in this game will be lost.", leave_confirm_end: "Leave the room?",
          host_leave_title: "Leave and close the room", host_leave_confirm: "Close the room and leave? All participants will be disconnected.",
          session_ended: "You left the room: you were offline for more than 5 minutes or were removed by the organizer. Join again with the code.",
          room_closed: "The room was closed: the organizer left or was offline for more than 5 minutes.",
          host_session_ended: "Your room was closed (you left or were offline for more than 5 minutes). Create a new room.",
          err_room_closed: "The room was closed.",
          ev_left: "👋 {name} left the room", ev_left_idle: "📴 {name} was offline for 5 min and left the room",
          help_s1_l7: "<strong>Leaving and connection:</strong> use the <b>Leave</b> button to exit the room. If you close the browser or your phone disconnects, you have <b>5 minutes</b> to come back (same link or code): after that the session ends. If the organizer is offline for 5 minutes, the room is closed.",
          help_classic_8: "Use the <strong>Leave</strong> button to exit the room. Anyone offline for <strong>5 minutes</strong> is disconnected, and the room is closed if the organizer is away for 5 minutes." },
    es: { btn_leave: "Salir", leave_confirm: "¿Salir de la sala? Perderás tus puntos de esta partida.", leave_confirm_end: "¿Salir de la sala?",
          host_leave_title: "Salir y cerrar la sala", host_leave_confirm: "¿Cerrar la sala y salir? Todos los participantes serán desconectados.",
          session_ended: "Saliste de la sala: pasaste más de 5 minutos sin conexión o el organizador te quitó. Entra de nuevo con el código.",
          room_closed: "La sala fue cerrada: el organizador salió o pasó más de 5 minutos sin conexión.",
          host_session_ended: "Tu sala fue cerrada (saliste o pasaste más de 5 minutos sin conexión). Crea una sala nueva.",
          err_room_closed: "La sala fue cerrada.",
          ev_left: "👋 {name} salió de la sala", ev_left_idle: "📴 {name} estuvo 5 min sin conexión y salió de la sala",
          help_s1_l7: "<strong>Salir y conexión:</strong> usa el botón <b>Salir</b> para dejar la sala. Si cierras el navegador o el móvil se desconecta, tienes <b>5 minutos</b> para volver (mismo enlace o código): después la sesión termina. Si el organizador pasa 5 minutos sin conexión, la sala se cierra.",
          help_classic_8: "Usa el botón <strong>Salir</strong> para dejar la sala. Quien pasa <strong>5 minutos sin conexión</strong> es desconectado, y la sala se cierra si el organizador se ausenta 5 minutos." }
  };
  for (const l in X) Object.assign(I18N[l], X[l]);
})();

/* Chamar atenção: aviso quando não há rival na sala */
(function () {
  const X = {
    pt: { nudge_need_more: "Precisa de outro participante conectado na sala para chamar a atenção." },
    en: { nudge_need_more: "You need another connected participant in the room to get their attention." },
    es: { nudge_need_more: "Necesitas otro participante conectado en la sala para llamar su atención." }
  };
  for (const l in X) Object.assign(I18N[l], X[l]);
})();
