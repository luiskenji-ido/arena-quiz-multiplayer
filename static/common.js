/* Utilidades compartilhadas: idiomas (PT/EN/ES), API, sons, patentes, manual. */
const I18N = {
pt: {
  app_title:"ARENA QUIZ MULTIPLAYER", landing_sub:"Quem responder primeiro leva os pontos e os poderes!",
  btn_host:"Criar sala (Apresentador)", btn_join:"Entrar numa sala", lbl_code:"Código da sala", lbl_name:"Seu nome", btn_enter:"Entrar",
  lbl_password:"Senha do apresentador", btn_create:"Criar sala", btn_resume:"Retomar sala", host_title:"PAINEL DO APRESENTADOR",
  lbl_timer:"Tempo por pergunta (s)", lbl_basexp:"XP base", lbl_mult:"Multiplicador de XP", lbl_charges:"Cargas por poder (99 = ∞)",
  lbl_progressive:"Poderes liberados por acertos", lbl_close_first:"Encerrar a pergunta no 1º acerto", lbl_quiz_lang:"Idioma do quiz padrão",
  btn_import:"Carregar quiz (JSON)", import_ph:"Cole aqui o JSON do quiz...", btn_copy_prompt:"Copiar prompt para IA", prompt_copied:"Prompt copiado!",
  btn_apply:"Aplicar", btn_start:"Iniciar jogo", btn_next:"Próxima pergunta", btn_close_now:"Encerrar pergunta", btn_restart:"Nova partida (mesmos jogadores)",
  scan_to_join:"Aponte a câmera do celular e entre no jogo", or_open:"ou acesse", players_in_room:"Jogadores na sala", waiting_players:"Aguardando jogadores...",
  quiz_default:"Quiz padrão", quiz_custom:"Quiz importado", quiz_loaded:"{n} perguntas carregadas", btn_kick:"Remover",
  answered_count:"{n}/{total} responderam", winner_banner:"⚡ {name} foi o mais rápido e ganhou +{pts} XP!", nobody_won:"Ninguém acertou desta vez!",
  correct_answer:"Resposta correta", final_title:"PÓDIO FINAL", round:"RODADA", round_of:"RODADA {n}/{total}", btn_help:"Como Jogar", btn_fullscreen:"Tela cheia",
  lbl_leaderboard:"Placar", lbl_feed:"Jogadas da Arena", lbl_corrects:"acertos", host_hint_auto:"A pergunta fecha sozinha quando o tempo acaba.",
  waiting_start:"Aguardando o apresentador iniciar...", you_are:"Você é", blocked_msg:"🚫 Você foi BLOQUEADO nesta pergunta!", locked_wrong:"Você errou. Aguarde o fim da rodada.",
  answered_late:"Você acertou, mas outro foi mais rápido! (sem pontos)", you_won_short:"🏆 Você foi o mais rápido!", you_won:"🏆 Você foi o mais rápido! +{pts} XP", sent_wait:"Resposta enviada!",
  someone_won:"{name} foi o mais rápido! (+{pts} XP)", next_soon:"Aguarde a próxima pergunta...", sealed_notice:"🔒 Você está LACRADO: sem poderes por mais {n} pergunta(s).",
  blocked_next_notice:"🚫 Você será bloqueado na próxima pergunta!", trap_notice:"🪤 Há uma armadilha em você: se errar, perde dobrado!",
  lbl_arsenal:"Arsenal", lbl_hint:"Dica", game_over:"Fim de jogo!", your_place:"Você ficou em {n}º lugar", room_gone:"Sala não encontrada ou encerrada.", leave:"Sair",
  pwr_p5050:"50/50", pwr_doubleXp:"DOBRO", pwr_dice:"DADO", pwr_hint:"DICA", pwr_card:"CARTA", pwr_trap:"ARMADILHA", pwr_block:"BLOQUEIO", pwr_seal:"LACRE", pwr_steal:"ROUBO",
  err_room_not_found:"Sala não encontrada. Confira o código.", err_bad_auth:"Acesso negado.", err_bad_password:"Senha incorreta.", err_name_required:"Digite seu nome.",
  err_room_full:"Sala cheia.", err_not_open:"A pergunta não está aberta.", err_closed:"Tempo esgotado!", err_blocked:"Você está bloqueado nesta pergunta.", err_already:"Você já respondeu.",
  err_eliminated:"Essa alternativa foi eliminada.", err_bad_idx:"Opção inválida.", err_sealed:"Você está lacrado: sem poderes.", err_locked:"Poder ainda bloqueado.",
  err_no_charges:"Sem cargas.", err_used_this_round:"Já usado nesta pergunta.", err_not_active:"Só durante o jogo.", err_bad_target:"Alvo inválido.", err_nothing_to_remove:"Nada para eliminar.",
  err_quiz_invalid:"JSON do quiz inválido. Confira o formato.", err_bad_phase:"Ação indisponível agora.", err_no_players:"Aguarde pelo menos 1 jogador.", err_generic:"Algo deu errado.",
  atk_badge:"ATAQUE TÁTICO", atk_pick:"Escolha o alvo", atk_cancel:"Cancelar", atk_back:"Voltar", atk_charges:"cargas", atk_steal_step:"Qual poder roubar de {name}?",
  atk_title_block:"Bloqueio", atk_title_seal:"Lacre de Poderes", atk_title_steal:"Roubo de Poder", atk_title_trap:"Armadilha de XP",
  atk_desc_block:"O alvo não poderá responder à PRÓXIMA pergunta.", atk_desc_seal:"O alvo fica sem usar poderes nesta e na próxima pergunta.",
  atk_desc_steal:"Rouba 1 carga de um poder à sua escolha.", atk_desc_trap:"Se o alvo errar, perde o dobro da penalidade do 2x XP. Se acertar, desarma.",
  tag_blocked:"Já bloqueado", tag_sealed:"Já lacrado", tag_trapped:"Já armadilhado", tag_nothing:"Sem poderes",
  dice_badge:"DADO TÁTICO D6", dice_title:"Rolagem de Bônus", dice_desc:"Cada face dá um efeito imediato só para você!", dice_btn_roll:"Lançar Dado!", dice_btn_close:"Fechar", dice_rolling:"Rolando...",
  dice_t1:"🎲 DADO 1 — IMPULSO!", dice_d1:"+{xp} XP imediatos!", dice_t2:"🎲 DADO 2 — REFORÇO!", dice_d2:"+{xp} XP imediatos!",
  dice_t3:"🎲 DADO 3 — RADAR TÁTICO!", dice_d3:"+{xp} XP e 1 alternativa errada eliminada!", dice_t4:"🎲 DADO 4 — SUPER BÔNUS!", dice_d4:"+{xp} XP imediatos!",
  dice_t5:"🎲 DADO 5 — ESCUDO DE ESTABILIDADE!", dice_d5:"+{xp} XP e proteção de Streak nesta pergunta!", dice_t6:"👑 DADO 6 — JACKPOT!", dice_d6:"2 alternativas erradas eliminadas e DOBRO DE XP (2x)!",
  card_badge:"DECK MISTERIOSO DE CORINGAS", card_title:"Escolha 1 Carta para Virar", card_front:"CARTA CORINGA #{n}", card_front_click:"Toque para revelar",
  card_HINT_t:"Mentoria", card_HINT_d:"Revela a dica da questão!", card_PVP_t:"Desafio PvP", card_PVP_d:"Se for o 1º a acertar: +150 XP e drena 50 XP do líder!",
  card_SHIELD_t:"Seguro (2ª Chance)", card_SHIELD_d:"Anula o seu primeiro clique errado!", card_ALLIN_t:"All-In 3x", card_ALLIN_d:"Triplica o XP desta pergunta se você for o 1º a acertar!",
  tip_double:"2x XP ativo", tip_allin:"All-In 3x ativo", tip_pvp:"PvP ativo", tip_shield:"Seguro ativo", tip_streak:"Streak protegido",
  ev_join:"{name} entrou na arena", ev_win:"⚡ {name} acertou primeiro (+{pts} XP)", ev_unlock:"🔓 {name} desbloqueou {power}", ev_5050:"✂️ {name} usou 50/50",
  ev_double:"🔥 {name} apostou 2x XP", ev_dice:"🎲 {name} rolou o dado e tirou {roll}", ev_hint:"💡 {name} pediu uma dica", ev_card:"🃏 {name} virou uma carta coringa",
  ev_pvp_drain:"⚡ {name} drenou 50 XP de {leader}", ev_shield_hit:"🛡️ {name} absorveu um erro com o Seguro", ev_block:"🚫 {name} bloqueou {target}!",
  ev_seal:"🔒 {name} lacrou {target}!", ev_steal:"🥷 {name} roubou {power} de {target}!", ev_trap_set:"🪤 {name} armou uma armadilha para {target}!",
  ev_trap_hit:"🪤 {name} caiu na armadilha e perdeu {pts} XP!", ev_trap_defused:"🪤 {name} desarmou a armadilha!",
  rank_iron:"Ferro", rank_bronze:"Bronze", rank_silver:"Prata", rank_gold:"Ouro", rank_platinum:"Platina", rank_diamond:"Diamante", rank_immortal:"Imortal", rank_radiant:"Radiante",
  help_title:"MANUAL: COMO JOGAR", help_close:"Entendi, vamos jogar!",
  help_s1:"1. A corrida", help_s1_l1:"Todos recebem a pergunta no celular ao mesmo tempo.", help_s1_l2:"<strong>Só o primeiro a acertar</strong> ganha os pontos e o progresso dos poderes.",
  help_s1_l3:"Você tem <strong>uma tentativa</strong> por pergunta: errou, espera a próxima.", help_s1_l4:"A pergunta fecha sozinha quando o tempo acaba (ou quando todos já responderam).",
  help_s2:"2. Os 9 Poderes", help_s2_d:"Acerte primeiro para desbloquear. Cada poder só pode ser usado 1 vez por pergunta.",
  help_p5050:"<strong>2 acertos · ✂️ 50/50:</strong> elimina 2 alternativas erradas só para você.", help_pdoubleXp:"<strong>3 acertos · 🔥 DOBRO:</strong> 2x XP se for o 1º a acertar; se errar, perde pontos.",
  help_pdice:"<strong>4 acertos · 🎲 DADO D6:</strong> animação com 6 faces: XP imediato, eliminar erradas, escudo de Streak ou Jackpot (2x + eliminar 2).",
  help_phint:"<strong>5 acertos · 💡 DICA:</strong> mostra a dica da questão só para você.", help_pcard:"<strong>6 acertos · 🃏 CARTA:</strong> 4 cartas viradas, escolha 1: Dica, Desafio PvP, Seguro 2ª Chance ou All-In 3x.",
  help_ptrap:"<strong>3 acertos · 🪤 ARMADILHA:</strong> escolha um rival; se ele errar, perde o dobro da penalidade do 2x. Se acertar, desarma.",
  help_pblock:"<strong>4 acertos · 🚫 BLOQUEIO:</strong> o rival não poderá responder à próxima pergunta.", help_pseal:"<strong>6 acertos · 🔒 LACRE:</strong> o rival fica sem poderes nesta e na próxima pergunta.",
  help_psteal:"<strong>7 acertos · 🥷 ROUBO:</strong> escolha o rival e qual poder dele roubar (1 carga passa para você).",
  help_s3:"3. Pontos", help_s3_l1:"XP = (base + bônus de velocidade) × multiplicador × combo (🔥 vitórias seguidas).", help_s3_l2:"Quanto mais rápido, maior o bônus. O combo se perde ao errar.",
  help_s4:"4. Dicas", help_s4_l1:"Use o <strong>Lacre</strong> no líder antes de uma pergunta difícil.", help_s4_l2:"O <strong>Roubo</strong> tira o 50/50 de quem ameaça você.", help_s4_l3:"Poderes de ataque podem ser usados até entre as perguntas."
},
en: {
  app_title:"ARENA QUIZ MULTIPLAYER", landing_sub:"Whoever answers first gets the points and the powers!",
  btn_host:"Create room (Host)", btn_join:"Join a room", lbl_code:"Room code", lbl_name:"Your name", btn_enter:"Join",
  lbl_password:"Host password", btn_create:"Create room", btn_resume:"Resume room", host_title:"HOST PANEL",
  lbl_timer:"Time per question (s)", lbl_basexp:"Base XP", lbl_mult:"XP multiplier", lbl_charges:"Charges per power (99 = ∞)",
  lbl_progressive:"Powers unlocked by hits", lbl_close_first:"End question on 1st correct answer", lbl_quiz_lang:"Default quiz language",
  btn_import:"Load quiz (JSON)", import_ph:"Paste the quiz JSON here...", btn_copy_prompt:"Copy AI prompt", prompt_copied:"Prompt copied!",
  btn_apply:"Apply", btn_start:"Start game", btn_next:"Next question", btn_close_now:"End question", btn_restart:"New match (same players)",
  scan_to_join:"Point your phone camera and join the game", or_open:"or go to", players_in_room:"Players in the room", waiting_players:"Waiting for players...",
  quiz_default:"Default quiz", quiz_custom:"Imported quiz", quiz_loaded:"{n} questions loaded", btn_kick:"Remove",
  answered_count:"{n}/{total} answered", winner_banner:"⚡ {name} was the fastest and won +{pts} XP!", nobody_won:"Nobody got it right this time!",
  correct_answer:"Correct answer", final_title:"FINAL PODIUM", round:"ROUND", round_of:"ROUND {n}/{total}", btn_help:"How to Play", btn_fullscreen:"Fullscreen",
  lbl_leaderboard:"Leaderboard", lbl_feed:"Arena Feed", lbl_corrects:"hits", host_hint_auto:"The question closes by itself when time runs out.",
  waiting_start:"Waiting for the host to start...", you_are:"You are", blocked_msg:"🚫 You were BLOCKED on this question!", locked_wrong:"Wrong answer. Wait for the round to end.",
  answered_late:"Correct, but someone was faster! (no points)", you_won_short:"🏆 You were the fastest!", you_won:"🏆 You were the fastest! +{pts} XP", sent_wait:"Answer sent!",
  someone_won:"{name} was the fastest! (+{pts} XP)", next_soon:"Wait for the next question...", sealed_notice:"🔒 You are SEALED: no powers for {n} more question(s).",
  blocked_next_notice:"🚫 You will be blocked on the next question!", trap_notice:"🪤 There is a trap on you: if you miss, you lose double!",
  lbl_arsenal:"Arsenal", lbl_hint:"Hint", game_over:"Game over!", your_place:"You finished in place #{n}", room_gone:"Room not found or closed.", leave:"Leave",
  pwr_p5050:"50/50", pwr_doubleXp:"DOUBLE", pwr_dice:"DICE", pwr_hint:"HINT", pwr_card:"CARD", pwr_trap:"TRAP", pwr_block:"BLOCK", pwr_seal:"SEAL", pwr_steal:"STEAL",
  err_room_not_found:"Room not found. Check the code.", err_bad_auth:"Access denied.", err_bad_password:"Wrong password.", err_name_required:"Type your name.",
  err_room_full:"Room is full.", err_not_open:"The question is not open.", err_closed:"Time is up!", err_blocked:"You are blocked on this question.", err_already:"You already answered.",
  err_eliminated:"That option was eliminated.", err_bad_idx:"Invalid option.", err_sealed:"You are sealed: no powers.", err_locked:"Power still locked.",
  err_no_charges:"No charges left.", err_used_this_round:"Already used on this question.", err_not_active:"Only during the game.", err_bad_target:"Invalid target.", err_nothing_to_remove:"Nothing to remove.",
  err_quiz_invalid:"Invalid quiz JSON. Check the format.", err_bad_phase:"Action unavailable right now.", err_no_players:"Wait for at least 1 player.", err_generic:"Something went wrong.",
  atk_badge:"TACTICAL ATTACK", atk_pick:"Choose your target", atk_cancel:"Cancel", atk_back:"Back", atk_charges:"charges", atk_steal_step:"Which power to steal from {name}?",
  atk_title_block:"Block", atk_title_seal:"Power Seal", atk_title_steal:"Power Steal", atk_title_trap:"XP Trap",
  atk_desc_block:"The target cannot answer the NEXT question.", atk_desc_seal:"The target cannot use powers on this and the next question.",
  atk_desc_steal:"Steals 1 charge of a power of your choice.", atk_desc_trap:"If the target misses, they lose double the 2x XP penalty. If they hit, it is defused.",
  tag_blocked:"Already blocked", tag_sealed:"Already sealed", tag_trapped:"Already trapped", tag_nothing:"No powers",
  dice_badge:"TACTICAL D6 DICE", dice_title:"Bonus Roll", dice_desc:"Each face gives an instant effect just for you!", dice_btn_roll:"Roll the Dice!", dice_btn_close:"Close", dice_rolling:"Rolling...",
  dice_t1:"🎲 DIE 1 — BOOST!", dice_d1:"+{xp} instant XP!", dice_t2:"🎲 DIE 2 — REINFORCEMENT!", dice_d2:"+{xp} instant XP!",
  dice_t3:"🎲 DIE 3 — TACTICAL RADAR!", dice_d3:"+{xp} XP and 1 wrong option eliminated!", dice_t4:"🎲 DIE 4 — SUPER BONUS!", dice_d4:"+{xp} instant XP!",
  dice_t5:"🎲 DIE 5 — STABILITY SHIELD!", dice_d5:"+{xp} XP and Streak protection on this question!", dice_t6:"👑 DIE 6 — JACKPOT!", dice_d6:"2 wrong options eliminated and DOUBLE XP (2x)!",
  card_badge:"MYSTERY WILD CARD DECK", card_title:"Pick 1 Card to Flip", card_front:"WILD CARD #{n}", card_front_click:"Tap to reveal",
  card_HINT_t:"Mentors' Advice", card_HINT_d:"Reveals the question hint!", card_PVP_t:"PvP Challenge", card_PVP_d:"If you are the 1st to get it right: +150 XP and drain 50 XP from the leader!",
  card_SHIELD_t:"Insurance (2nd Chance)", card_SHIELD_d:"Cancels your first wrong click!", card_ALLIN_t:"All-In 3x", card_ALLIN_d:"Triples this question's XP if you are the 1st to get it right!",
  tip_double:"2x XP active", tip_allin:"All-In 3x active", tip_pvp:"PvP active", tip_shield:"Insurance active", tip_streak:"Streak protected",
  ev_join:"{name} joined the arena", ev_win:"⚡ {name} got it first (+{pts} XP)", ev_unlock:"🔓 {name} unlocked {power}", ev_5050:"✂️ {name} used 50/50",
  ev_double:"🔥 {name} bet 2x XP", ev_dice:"🎲 {name} rolled a {roll}", ev_hint:"💡 {name} asked for a hint", ev_card:"🃏 {name} flipped a wild card",
  ev_pvp_drain:"⚡ {name} drained 50 XP from {leader}", ev_shield_hit:"🛡️ {name} absorbed a mistake with Insurance", ev_block:"🚫 {name} blocked {target}!",
  ev_seal:"🔒 {name} sealed {target}!", ev_steal:"🥷 {name} stole {power} from {target}!", ev_trap_set:"🪤 {name} set a trap for {target}!",
  ev_trap_hit:"🪤 {name} fell into the trap and lost {pts} XP!", ev_trap_defused:"🪤 {name} defused the trap!",
  rank_iron:"Iron", rank_bronze:"Bronze", rank_silver:"Silver", rank_gold:"Gold", rank_platinum:"Platinum", rank_diamond:"Diamond", rank_immortal:"Immortal", rank_radiant:"Radiant",
  help_title:"MANUAL: HOW TO PLAY", help_close:"Got it, let's play!",
  help_s1:"1. The race", help_s1_l1:"Everyone gets the question on their phone at the same time.", help_s1_l2:"<strong>Only the first correct answer</strong> gets the points and power progress.",
  help_s1_l3:"You have <strong>one attempt</strong> per question: miss and wait for the next.", help_s1_l4:"The question closes by itself when time runs out (or when everyone has answered).",
  help_s2:"2. The 9 Powers", help_s2_d:"Answer first to unlock. Each power can be used once per question.",
  help_p5050:"<strong>2 hits · ✂️ 50/50:</strong> removes 2 wrong options just for you.", help_pdoubleXp:"<strong>3 hits · 🔥 DOUBLE:</strong> 2x XP if you are the 1st to get it right; if you miss, you lose points.",
  help_pdice:"<strong>4 hits · 🎲 D6 DICE:</strong> animated 6 faces: instant XP, wrong-option removal, Streak shield or Jackpot (2x + remove 2).",
  help_phint:"<strong>5 hits · 💡 HINT:</strong> shows the question hint just for you.", help_pcard:"<strong>6 hits · 🃏 CARD:</strong> 4 face-down cards, pick 1: Hint, PvP Challenge, 2nd Chance Insurance or All-In 3x.",
  help_ptrap:"<strong>3 hits · 🪤 TRAP:</strong> pick a rival; if they miss, they lose double the 2x penalty. If they hit, it is defused.",
  help_pblock:"<strong>4 hits · 🚫 BLOCK:</strong> the rival cannot answer the next question.", help_pseal:"<strong>6 hits · 🔒 SEAL:</strong> the rival cannot use powers on this and the next question.",
  help_psteal:"<strong>7 hits · 🥷 STEAL:</strong> pick a rival and which of their powers to steal (1 charge moves to you).",
  help_s3:"3. Points", help_s3_l1:"XP = (base + speed bonus) × multiplier × combo (🔥 consecutive wins).", help_s3_l2:"The faster you are, the bigger the bonus. A miss breaks the combo.",
  help_s4:"4. Tips", help_s4_l1:"Use <strong>Seal</strong> on the leader before a hard question.", help_s4_l2:"<strong>Steal</strong> takes the 50/50 from whoever threatens you.", help_s4_l3:"Attack powers can even be used between questions."
},
es: {
  app_title:"ARENA QUIZ MULTIPLAYER", landing_sub:"¡Quien responda primero se lleva los puntos y los poderes!",
  btn_host:"Crear sala (Presentador)", btn_join:"Entrar a una sala", lbl_code:"Código de la sala", lbl_name:"Tu nombre", btn_enter:"Entrar",
  lbl_password:"Contraseña del presentador", btn_create:"Crear sala", btn_resume:"Retomar sala", host_title:"PANEL DEL PRESENTADOR",
  lbl_timer:"Tiempo por pregunta (s)", lbl_basexp:"XP base", lbl_mult:"Multiplicador de XP", lbl_charges:"Cargas por poder (99 = ∞)",
  lbl_progressive:"Poderes liberados por aciertos", lbl_close_first:"Cerrar la pregunta en el 1er acierto", lbl_quiz_lang:"Idioma del quiz predeterminado",
  btn_import:"Cargar quiz (JSON)", import_ph:"Pega aquí el JSON del quiz...", btn_copy_prompt:"Copiar prompt para IA", prompt_copied:"¡Prompt copiado!",
  btn_apply:"Aplicar", btn_start:"Iniciar juego", btn_next:"Siguiente pregunta", btn_close_now:"Cerrar pregunta", btn_restart:"Nueva partida (mismos jugadores)",
  scan_to_join:"Apunta la cámara del móvil y entra al juego", or_open:"o entra en", players_in_room:"Jugadores en la sala", waiting_players:"Esperando jugadores...",
  quiz_default:"Quiz predeterminado", quiz_custom:"Quiz importado", quiz_loaded:"{n} preguntas cargadas", btn_kick:"Quitar",
  answered_count:"{n}/{total} respondieron", winner_banner:"⚡ ¡{name} fue el más rápido y ganó +{pts} XP!", nobody_won:"¡Nadie acertó esta vez!",
  correct_answer:"Respuesta correcta", final_title:"PODIO FINAL", round:"RONDA", round_of:"RONDA {n}/{total}", btn_help:"Cómo Jugar", btn_fullscreen:"Pantalla completa",
  lbl_leaderboard:"Marcador", lbl_feed:"Jugadas de la Arena", lbl_corrects:"aciertos", host_hint_auto:"La pregunta se cierra sola cuando se acaba el tiempo.",
  waiting_start:"Esperando que el presentador inicie...", you_are:"Eres", blocked_msg:"🚫 ¡Fuiste BLOQUEADO en esta pregunta!", locked_wrong:"Fallaste. Espera el final de la ronda.",
  answered_late:"¡Acertaste, pero otro fue más rápido! (sin puntos)", you_won_short:"🏆 ¡Fuiste el más rápido!", you_won:"🏆 ¡Fuiste el más rápido! +{pts} XP", sent_wait:"¡Respuesta enviada!",
  someone_won:"¡{name} fue el más rápido! (+{pts} XP)", next_soon:"Espera la siguiente pregunta...", sealed_notice:"🔒 Estás SELLADO: sin poderes por {n} pregunta(s) más.",
  blocked_next_notice:"🚫 ¡Serás bloqueado en la próxima pregunta!", trap_notice:"🪤 Tienes una trampa: ¡si fallas, pierdes el doble!",
  lbl_arsenal:"Arsenal", lbl_hint:"Pista", game_over:"¡Fin del juego!", your_place:"Quedaste en el puesto {n}", room_gone:"Sala no encontrada o cerrada.", leave:"Salir",
  pwr_p5050:"50/50", pwr_doubleXp:"DOBLE", pwr_dice:"DADO", pwr_hint:"PISTA", pwr_card:"CARTA", pwr_trap:"TRAMPA", pwr_block:"BLOQUEO", pwr_seal:"SELLO", pwr_steal:"ROBO",
  err_room_not_found:"Sala no encontrada. Revisa el código.", err_bad_auth:"Acceso denegado.", err_bad_password:"Contraseña incorrecta.", err_name_required:"Escribe tu nombre.",
  err_room_full:"Sala llena.", err_not_open:"La pregunta no está abierta.", err_closed:"¡Tiempo agotado!", err_blocked:"Estás bloqueado en esta pregunta.", err_already:"Ya respondiste.",
  err_eliminated:"Esa alternativa fue eliminada.", err_bad_idx:"Opción inválida.", err_sealed:"Estás sellado: sin poderes.", err_locked:"Poder aún bloqueado.",
  err_no_charges:"Sin cargas.", err_used_this_round:"Ya usado en esta pregunta.", err_not_active:"Sólo durante el juego.", err_bad_target:"Objetivo inválido.", err_nothing_to_remove:"Nada que eliminar.",
  err_quiz_invalid:"JSON del quiz inválido. Revisa el formato.", err_bad_phase:"Acción no disponible ahora.", err_no_players:"Espera al menos 1 jugador.", err_generic:"Algo salió mal.",
  atk_badge:"ATAQUE TÁCTICO", atk_pick:"Elige el objetivo", atk_cancel:"Cancelar", atk_back:"Volver", atk_charges:"cargas", atk_steal_step:"¿Qué poder robarle a {name}?",
  atk_title_block:"Bloqueo", atk_title_seal:"Sello de Poderes", atk_title_steal:"Robo de Poder", atk_title_trap:"Trampa de XP",
  atk_desc_block:"El objetivo no podrá responder la PRÓXIMA pregunta.", atk_desc_seal:"El objetivo no podrá usar poderes en esta y la próxima pregunta.",
  atk_desc_steal:"Roba 1 carga de un poder a tu elección.", atk_desc_trap:"Si el objetivo falla, pierde el doble de la penalización del 2x XP. Si acierta, se desarma.",
  tag_blocked:"Ya bloqueado", tag_sealed:"Ya sellado", tag_trapped:"Ya con trampa", tag_nothing:"Sin poderes",
  dice_badge:"DADO TÁCTICO D6", dice_title:"Tirada de Bono", dice_desc:"¡Cada cara da un efecto inmediato sólo para ti!", dice_btn_roll:"¡Lanzar Dado!", dice_btn_close:"Cerrar", dice_rolling:"Rodando...",
  dice_t1:"🎲 DADO 1 — ¡IMPULSO!", dice_d1:"¡+{xp} XP inmediatos!", dice_t2:"🎲 DADO 2 — ¡REFUERZO!", dice_d2:"¡+{xp} XP inmediatos!",
  dice_t3:"🎲 DADO 3 — ¡RADAR TÁCTICO!", dice_d3:"¡+{xp} XP y 1 alternativa incorrecta eliminada!", dice_t4:"🎲 DADO 4 — ¡SUPER BONO!", dice_d4:"¡+{xp} XP inmediatos!",
  dice_t5:"🎲 DADO 5 — ¡ESCUDO DE ESTABILIDAD!", dice_d5:"¡+{xp} XP y protección de Racha en esta pregunta!", dice_t6:"👑 DADO 6 — ¡JACKPOT!", dice_d6:"¡2 alternativas incorrectas eliminadas y DOBLE XP (2x)!",
  card_badge:"MAZO MISTERIOSO DE COMODINES", card_title:"Elige 1 Carta para Voltear", card_front:"CARTA COMODÍN #{n}", card_front_click:"Toca para revelar",
  card_HINT_t:"Mentoría", card_HINT_d:"¡Revela la pista de la pregunta!", card_PVP_t:"Desafío PvP", card_PVP_d:"¡Si eres el 1º en acertar: +150 XP y drenas 50 XP del líder!",
  card_SHIELD_t:"Seguro (2ª Oportunidad)", card_SHIELD_d:"¡Anula tu primer clic incorrecto!", card_ALLIN_t:"All-In 3x", card_ALLIN_d:"¡Triplica el XP de esta pregunta si eres el 1º en acertar!",
  tip_double:"2x XP activo", tip_allin:"All-In 3x activo", tip_pvp:"PvP activo", tip_shield:"Seguro activo", tip_streak:"Racha protegida",
  ev_join:"{name} entró a la arena", ev_win:"⚡ {name} acertó primero (+{pts} XP)", ev_unlock:"🔓 {name} desbloqueó {power}", ev_5050:"✂️ {name} usó 50/50",
  ev_double:"🔥 {name} apostó 2x XP", ev_dice:"🎲 {name} lanzó el dado y sacó {roll}", ev_hint:"💡 {name} pidió una pista", ev_card:"🃏 {name} volteó una carta comodín",
  ev_pvp_drain:"⚡ {name} drenó 50 XP de {leader}", ev_shield_hit:"🛡️ {name} absorbió un error con el Seguro", ev_block:"🚫 ¡{name} bloqueó a {target}!",
  ev_seal:"🔒 ¡{name} selló a {target}!", ev_steal:"🥷 ¡{name} robó {power} a {target}!", ev_trap_set:"🪤 ¡{name} puso una trampa a {target}!",
  ev_trap_hit:"🪤 ¡{name} cayó en la trampa y perdió {pts} XP!", ev_trap_defused:"🪤 ¡{name} desarmó la trampa!",
  rank_iron:"Hierro", rank_bronze:"Bronce", rank_silver:"Plata", rank_gold:"Oro", rank_platinum:"Platino", rank_diamond:"Diamante", rank_immortal:"Inmortal", rank_radiant:"Radiante",
  help_title:"MANUAL: CÓMO JUGAR", help_close:"¡Entendido, a jugar!",
  help_s1:"1. La carrera", help_s1_l1:"Todos reciben la pregunta en el móvil al mismo tiempo.", help_s1_l2:"<strong>Sólo el primero en acertar</strong> gana los puntos y el progreso de poderes.",
  help_s1_l3:"Tienes <strong>un intento</strong> por pregunta: si fallas, espera la siguiente.", help_s1_l4:"La pregunta se cierra sola al acabar el tiempo (o cuando todos ya respondieron).",
  help_s2:"2. Los 9 Poderes", help_s2_d:"Acierta primero para desbloquear. Cada poder se puede usar 1 vez por pregunta.",
  help_p5050:"<strong>2 aciertos · ✂️ 50/50:</strong> elimina 2 alternativas incorrectas sólo para ti.", help_pdoubleXp:"<strong>3 aciertos · 🔥 DOBLE:</strong> 2x XP si eres el 1º en acertar; si fallas, pierdes puntos.",
  help_pdice:"<strong>4 aciertos · 🎲 DADO D6:</strong> animación con 6 caras: XP inmediato, eliminar incorrectas, escudo de Racha o Jackpot (2x + eliminar 2).",
  help_phint:"<strong>5 aciertos · 💡 PISTA:</strong> muestra la pista de la pregunta sólo para ti.", help_pcard:"<strong>6 aciertos · 🃏 CARTA:</strong> 4 cartas boca abajo, elige 1: Pista, Desafío PvP, Seguro 2ª Oportunidad o All-In 3x.",
  help_ptrap:"<strong>3 aciertos · 🪤 TRAMPA:</strong> elige un rival; si falla, pierde el doble de la penalización del 2x. Si acierta, se desarma.",
  help_pblock:"<strong>4 aciertos · 🚫 BLOQUEO:</strong> el rival no podrá responder la próxima pregunta.", help_pseal:"<strong>6 aciertos · 🔒 SELLO:</strong> el rival no podrá usar poderes en esta y la próxima pregunta.",
  help_psteal:"<strong>7 aciertos · 🥷 ROBO:</strong> elige un rival y cuál de sus poderes robar (1 carga pasa a ti).",
  help_s3:"3. Puntos", help_s3_l1:"XP = (base + bono de velocidad) × multiplicador × combo (🔥 victorias seguidas).", help_s3_l2:"Cuanto más rápido, mayor el bono. El combo se pierde al fallar.",
  help_s4:"4. Consejos", help_s4_l1:"Usa el <strong>Sello</strong> en el líder antes de una pregunta difícil.", help_s4_l2:"El <strong>Robo</strong> quita el 50/50 a quien te amenaza.", help_s4_l3:"Los poderes de ataque se pueden usar incluso entre preguntas."
}
};

const POWER_META = [
  {key:'p5050',icon:'fa-scissors',color:'amber'},{key:'doubleXp',icon:'fa-fire',color:'purple'},
  {key:'dice',icon:'fa-dice',color:'emerald'},{key:'hint',icon:'fa-lightbulb',color:'cyan'},
  {key:'card',icon:'fa-clone',color:'pink'},{key:'trap',icon:'fa-skull-crossbones',color:'red'},
  {key:'block',icon:'fa-ban',color:'rose'},{key:'seal',icon:'fa-user-lock',color:'orange'},
  {key:'steal',icon:'fa-user-ninja',color:'indigo'}
];
// classes completas para o Tailwind CDN enxergar (não montar nomes dinamicamente sem listar)
const PW_STYLE = {
  amber:'border-amber-500/60 bg-amber-500/15 text-amber-300', purple:'border-purple-500/60 bg-purple-500/15 text-purple-300',
  emerald:'border-emerald-500/60 bg-emerald-500/15 text-emerald-300', cyan:'border-cyan-500/60 bg-cyan-500/15 text-cyan-300',
  pink:'border-pink-500/60 bg-pink-500/15 text-pink-300', red:'border-red-500/60 bg-red-500/15 text-red-300',
  rose:'border-rose-500/60 bg-rose-500/15 text-rose-300', orange:'border-orange-500/60 bg-orange-500/15 text-orange-300',
  indigo:'border-indigo-500/60 bg-indigo-500/15 text-indigo-300'
};
const PW_BADGE = {amber:'bg-amber-400',purple:'bg-purple-400',emerald:'bg-emerald-400',cyan:'bg-cyan-400',pink:'bg-pink-400',red:'bg-red-400',rose:'bg-rose-400',orange:'bg-orange-400',indigo:'bg-indigo-400'};

let LANG = (function(){ try { return localStorage.getItem('arena_lang') || (navigator.language||'pt').slice(0,2); } catch(e){ return 'pt'; } })();
if (!I18N[LANG]) LANG = 'pt';
function t(k, p) {
  let s = (I18N[LANG] && I18N[LANG][k]) || I18N.pt[k] || k;
  if (p) for (const key in p) s = s.split('{' + key + '}').join(p[key]);
  return s;
}
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  document.documentElement.lang = LANG;
  const sel = document.getElementById('langSelect'); if (sel) sel.value = LANG;
}
function setLang(l) {
  if (!I18N[l]) return; LANG = l;
  try { localStorage.setItem('arena_lang', l); } catch(e){}
  applyI18n();
  if (typeof onLangChange === 'function') onLangChange();
}
function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch(e){} return null; }

async function api(path, body) {
  const opt = body === undefined ? {} : { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) };
  let r;
  try { r = await fetch(path, opt); } catch (e) { return { ok: false, status: 0, data: { error: 'network' } }; }
  let data = {}; try { data = await r.json(); } catch (e) {}
  return { ok: r.ok, status: r.status, data };
}
function errText(code) { return t('err_' + code) === 'err_' + code ? t('err_generic') : t('err_' + code); }

function eventText(e) {
  const p = Object.assign({}, e.p);
  if (p.power) p.power = t('pwr_' + p.power);
  if (p.hp) p.hp = t('ha_' + p.hp);
  if (p.card) p.card = t('card_' + p.card + '_t');
  if (p.target === '*') p.target = t('ha_everyone');
  if (e.k === 'ev_host_dice') p.fx = t('hdice_' + e.p.roll);
  if (e.k === 'ev_card') return t('ev_card', p);
  return t(e.k, p);
}

const RANKS = [
  ['rank_iron',0,'fa-shield','text-slate-300 border-slate-600 bg-slate-800'],['rank_bronze',1500,'fa-shield-halved','text-amber-400 border-amber-700 bg-amber-950/80'],
  ['rank_silver',3500,'fa-medal','text-slate-100 border-slate-400 bg-slate-700/80'],['rank_gold',6500,'fa-award','text-amber-300 border-amber-400 bg-amber-500/20'],
  ['rank_platinum',10000,'fa-gem','text-cyan-300 border-cyan-400 bg-cyan-500/20'],['rank_diamond',15000,'fa-star','text-blue-300 border-blue-400 bg-blue-500/20'],
  ['rank_immortal',22000,'fa-fire-flame-curved','text-purple-300 border-purple-400 bg-purple-500/20'],['rank_radiant',30000,'fa-crown','text-amber-200 border-amber-300 bg-rose-500/25']
];
function rankFor(score) { let r = RANKS[0]; for (const x of RANKS) if (score >= x[1]) r = x; return r; }
function rankBadge(score) { const r = rankFor(score); return `<span class="px-1.5 rounded border font-esports text-[9px] ${r[3]}"><i class="fa-solid ${r[2]} mr-0.5"></i>${t(r[0])}</span>`; }

function helpHTML() {
  const li = k => `<li>${t(k)}</li>`;
  const pw = ['p5050','pdoubleXp','pdice','phint','pcard','ptrap','pblock','pseal','psteal'];
  return `<div class="space-y-4 text-xs sm:text-sm text-slate-300">
   <div class="panel border border-slate-800"><h4 class="font-esports text-sm font-bold text-cyan-300 mb-2">${t('help_s1')}</h4><ul class="list-disc list-inside space-y-1">${['help_s1_l1','help_s1_l2','help_s1_l3','help_s1_l4','help_s1_l5','help_s1_l6','help_s1_l7'].map(li).join('')}</ul></div>
   <div class="panel border border-amber-500/30"><h4 class="font-esports text-sm font-bold text-amber-300 mb-1">${t('help_s2')}</h4><p class="text-xs text-slate-400 mb-2">${t('help_s2_d')}</p><ul class="space-y-1.5 text-[12px]">${pw.map(k => `<li class="bg-slate-950/60 p-2 rounded-lg border border-slate-800">${t('help_' + k)}</li>`).join('')}</ul></div>
   <div class="panel border border-slate-800"><h4 class="font-esports text-sm font-bold text-emerald-300 mb-2">${t('help_s3')}</h4><ul class="list-disc list-inside space-y-1">${['help_s3_l1','help_s3_l2'].map(li).join('')}</ul></div>
   <div class="panel border border-slate-800"><h4 class="font-esports text-sm font-bold text-purple-300 mb-2">${t('help_s4')}</h4><ul class="list-disc list-inside space-y-1">${['help_s4_l1','help_s4_l2','help_s4_l3'].map(li).join('')}</ul></div>
   <div class="panel border border-amber-500/30"><h4 class="font-esports text-sm font-bold text-amber-300 mb-2">${t('help_s5')}</h4><ul class="list-disc list-inside space-y-1">${['help_s5_l1','help_s5_l2','help_s5_l3','help_s5_l4'].map(li).join('')}</ul></div>
  </div>`;
}
function openHelp() {
  document.getElementById('helpBody').innerHTML = helpHTML();
  document.getElementById('helpModal').classList.remove('hidden');
}
function closeHelp() { document.getElementById('helpModal').classList.add('hidden'); }

let _ac = null;
function beep(type) {
  try {
    _ac = _ac || new (window.AudioContext || window.webkitAudioContext)();
    const ctx = _ac, now = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    const seq = { click:[[520]], correct:[[523,0],[659,.09],[784,.18]], wrong:[[220,0],[130,.25]], power:[[440,0],[880,.2]], fanfare:[[440,0],[554,.12],[659,.24],[880,.36]], start:[[660,0],[880,.12]] }[type] || [[440]];
    o.type = type === 'wrong' ? 'sawtooth' : 'triangle';
    seq.forEach(s => o.frequency.setValueAtTime(s[0], now + (s[1] || 0)));
    g.gain.setValueAtTime(.13, now); g.gain.exponentialRampToValueAtTime(.001, now + .5);
    o.start(now); o.stop(now + .5);
  } catch (e) {}
}
function toast(msg, good) {
  let box = document.getElementById('toastBox');
  if (!box) { box = document.createElement('div'); box.id = 'toastBox'; box.className = 'fixed top-16 right-3 left-3 sm:left-auto z-[80] pointer-events-none flex flex-col gap-2 items-end'; document.body.appendChild(box); }
  const d = document.createElement('div');
  d.className = 'toast px-3.5 py-2 rounded-xl text-xs font-bold font-esports border max-w-sm ' + (good === false ? 'bg-rose-950/95 border-rose-500 text-rose-200' : 'bg-slate-900/95 border-emerald-400 text-emerald-200');
  d.textContent = msg; box.appendChild(d); setTimeout(() => d.remove(), 2700);
}
function langSelectHTML() {
  return `<select id="langSelect" onchange="setLang(this.value)" class="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"><option value="pt">🇧🇷 PT</option><option value="en">🇺🇸 EN</option><option value="es">🇪🇸 ES</option></select>`;
}
function fmt(n) { return Number(n).toLocaleString(); }
