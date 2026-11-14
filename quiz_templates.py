"""Templates de quiz prontos (pt/en/es). Formato compacto: (pergunta, alternativas, índice_correto, explicação, dica)."""

_T = {}


def _add(tid, icon, color, names, descs, data, category='fun'):
    _T[tid] = {'id': tid, 'icon': icon, 'color': color, 'names': names, 'descs': descs, 'data': data,
               'category': category}


# --------------------------------------------------------------------------
_add('general', 'fa-earth-americas', 'cyan',
     {'pt': 'Conhecimentos Gerais', 'en': 'General Knowledge', 'es': 'Cultura General'},
     {'pt': 'Perguntas rápidas e leves, ótimo para aquecer a turma.', 'en': 'Quick, light questions to warm up the crowd.', 'es': 'Preguntas rápidas y ligeras para calentar al grupo.'},
     {
         'pt': [
             ('Qual é a capital da Austrália?', ['Sydney', 'Canberra', 'Melbourne', 'Perth'], 1, 'Canberra é a capital; Sydney é a maior cidade.', 'Não é a maior cidade do país.'),
             ('Qual é o planeta mais próximo do Sol?', ['Vênus', 'Mercúrio', 'Marte', 'Terra'], 1, 'Mercúrio é o planeta mais próximo do Sol.', 'Também é o menor do sistema solar.'),
             ('Quantos lados tem um hexágono?', ['5', '6', '7', '8'], 1, 'Hexa = seis: o hexágono tem 6 lados.', 'O prefixo "hexa" indica o número.'),
             ('Quem escreveu "Dom Casmurro"?', ['José de Alencar', 'Machado de Assis', 'Graciliano Ramos', 'Clarice Lispector'], 1, 'Dom Casmurro (1899) é de Machado de Assis.', 'Fundador da Academia Brasileira de Letras.'),
             ('Qual é o maior oceano do planeta?', ['Atlântico', 'Índico', 'Pacífico', 'Ártico'], 2, 'O Pacífico cobre cerca de um terço da superfície da Terra.', 'Seu nome significa "calmo".'),
             ('Qual é o idioma com mais falantes nativos no mundo?', ['Inglês', 'Espanhol', 'Mandarim', 'Hindi'], 2, 'O mandarim tem mais falantes nativos.', 'É falado principalmente na China.'),
             ('Quantos jogadores de cada time ficam em campo no futebol?', ['9', '10', '11', '12'], 2, 'Cada time joga com 11, incluindo o goleiro.', 'Mais que dez, menos que doze.'),
             ('Qual é a moeda do Japão?', ['Yuan', 'Won', 'Iene', 'Rupia'], 2, 'A moeda japonesa é o iene.', 'Seu símbolo é ¥.'),
         ],
         'en': [
             ('What is the capital of Australia?', ['Sydney', 'Canberra', 'Melbourne', 'Perth'], 1, 'Canberra is the capital; Sydney is the largest city.', 'It is not the largest city.'),
             ('Which planet is closest to the Sun?', ['Venus', 'Mercury', 'Mars', 'Earth'], 1, 'Mercury is the closest planet to the Sun.', 'It is also the smallest planet.'),
             ('How many sides does a hexagon have?', ['5', '6', '7', '8'], 1, 'Hexa means six: a hexagon has 6 sides.', 'The prefix "hexa" gives it away.'),
             ('Who wrote "Romeo and Juliet"?', ['Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Jane Austen'], 1, 'Romeo and Juliet was written by William Shakespeare.', 'The Bard of Avon.'),
             ('What is the largest ocean on Earth?', ['Atlantic', 'Indian', 'Pacific', 'Arctic'], 2, 'The Pacific covers about a third of Earth\'s surface.', 'Its name means "peaceful".'),
             ('Which language has the most native speakers?', ['English', 'Spanish', 'Mandarin', 'Hindi'], 2, 'Mandarin has the most native speakers.', 'Mainly spoken in China.'),
             ('How many players per team are on the field in football (soccer)?', ['9', '10', '11', '12'], 2, 'Each team plays with 11, including the goalkeeper.', 'More than ten, fewer than twelve.'),
             ('What is the currency of Japan?', ['Yuan', 'Won', 'Yen', 'Rupee'], 2, 'Japan\'s currency is the yen.', 'Its symbol is ¥.'),
         ],
         'es': [
             ('¿Cuál es la capital de Australia?', ['Sídney', 'Canberra', 'Melbourne', 'Perth'], 1, 'Canberra es la capital; Sídney es la ciudad más grande.', 'No es la ciudad más grande.'),
             ('¿Cuál es el planeta más cercano al Sol?', ['Venus', 'Mercurio', 'Marte', 'Tierra'], 1, 'Mercurio es el planeta más cercano al Sol.', 'También es el más pequeño.'),
             ('¿Cuántos lados tiene un hexágono?', ['5', '6', '7', '8'], 1, 'Hexa significa seis: el hexágono tiene 6 lados.', 'El prefijo "hexa" lo indica.'),
             ('¿Quién escribió "Don Quijote de la Mancha"?', ['Lope de Vega', 'Miguel de Cervantes', 'Quevedo', 'Gabriel García Márquez'], 1, 'Don Quijote fue escrito por Miguel de Cervantes.', 'Autor español del Siglo de Oro.'),
             ('¿Cuál es el océano más grande del planeta?', ['Atlántico', 'Índico', 'Pacífico', 'Ártico'], 2, 'El Pacífico cubre cerca de un tercio de la superficie terrestre.', 'Su nombre significa "tranquilo".'),
             ('¿Qué idioma tiene más hablantes nativos?', ['Inglés', 'Español', 'Mandarín', 'Hindi'], 2, 'El mandarín tiene más hablantes nativos.', 'Se habla sobre todo en China.'),
             ('¿Cuántos jugadores de cada equipo hay en el campo en el fútbol?', ['9', '10', '11', '12'], 2, 'Cada equipo juega con 11, incluido el portero.', 'Más de diez, menos de doce.'),
             ('¿Cuál es la moneda de Japón?', ['Yuan', 'Won', 'Yen', 'Rupia'], 2, 'La moneda japonesa es el yen.', 'Su símbolo es ¥.'),
         ],
     })

# --------------------------------------------------------------------------
_add('tech', 'fa-microchip', 'purple',
     {'pt': 'Tecnologia & Internet', 'en': 'Technology & Internet', 'es': 'Tecnología e Internet'},
     {'pt': 'Conceitos básicos de computação, web e programação.', 'en': 'Basic computing, web and programming concepts.', 'es': 'Conceptos básicos de computación, web y programación.'},
     {
         'pt': [
             ('O que significa a sigla HTML?', ['HyperText Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Logic', 'Home Tool Markup Language'], 0, 'HTML é a linguagem de marcação usada para estruturar páginas web.', 'É uma linguagem de marcação, não de programação.'),
             ('Quem criou o kernel Linux?', ['Bill Gates', 'Linus Torvalds', 'Steve Jobs', 'Dennis Ritchie'], 1, 'Linus Torvalds criou o Linux em 1991.', 'O nome do sistema vem do primeiro nome dele.'),
             ('Qual protocolo é usado para navegação web segura?', ['FTP', 'HTTPS', 'SMTP', 'SSH'], 1, 'HTTPS é o HTTP com criptografia (TLS).', 'Aparece como um cadeado no navegador.'),
             ('Qual linguagem de programação leva o nome de um grupo de comédia britânico?', ['Java', 'Python', 'Ruby', 'Go'], 1, 'Python homenageia o grupo Monty Python.', 'Tem o nome de uma cobra, mas a origem é outra.'),
             ('O que significa CPU?', ['Placa de vídeo', 'Unidade Central de Processamento', 'Disco de armazenamento', 'Fonte de energia'], 1, 'CPU é o processador, o "cérebro" do computador.', 'É onde as instruções são executadas.'),
             ('Qual destas é uma ferramenta de controle de versão?', ['Git', 'Excel', 'Photoshop', 'Chrome'], 0, 'Git registra o histórico de mudanças do código.', 'Também criado por Linus Torvalds.'),
             ('Quantos bits formam 1 byte?', ['4', '8', '16', '32'], 1, '1 byte = 8 bits.', 'Uma potência de dois entre 4 e 16.'),
             ('O que significa a sigla IA?', ['Interface Avançada', 'Inteligência Artificial', 'Integração Analítica', 'Internet Aberta'], 1, 'IA é Inteligência Artificial: sistemas que aprendem e decidem.', 'Máquinas que aprendem.'),
         ],
         'en': [
             ('What does HTML stand for?', ['HyperText Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Logic', 'Home Tool Markup Language'], 0, 'HTML is the markup language used to structure web pages.', 'It is a markup language, not a programming one.'),
             ('Who created the Linux kernel?', ['Bill Gates', 'Linus Torvalds', 'Steve Jobs', 'Dennis Ritchie'], 1, 'Linus Torvalds created Linux in 1991.', 'The system\'s name comes from his first name.'),
             ('Which protocol is used for secure web browsing?', ['FTP', 'HTTPS', 'SMTP', 'SSH'], 1, 'HTTPS is HTTP with encryption (TLS).', 'Shown as a padlock in the browser.'),
             ('Which programming language is named after a British comedy group?', ['Java', 'Python', 'Ruby', 'Go'], 1, 'Python is named after Monty Python.', 'Named like a snake, but the origin is different.'),
             ('What does CPU stand for?', ['Video card', 'Central Processing Unit', 'Storage disk', 'Power supply'], 1, 'The CPU is the processor, the computer\'s "brain".', 'It is where instructions are executed.'),
             ('Which of these is a version control tool?', ['Git', 'Excel', 'Photoshop', 'Chrome'], 0, 'Git records the history of code changes.', 'Also created by Linus Torvalds.'),
             ('How many bits are in 1 byte?', ['4', '8', '16', '32'], 1, '1 byte = 8 bits.', 'A power of two between 4 and 16.'),
             ('What does AI stand for?', ['Advanced Interface', 'Artificial Intelligence', 'Analytical Integration', 'Open Internet'], 1, 'AI is Artificial Intelligence: systems that learn and decide.', 'Machines that learn.'),
         ],
         'es': [
             ('¿Qué significa la sigla HTML?', ['HyperText Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Logic', 'Home Tool Markup Language'], 0, 'HTML es el lenguaje de marcado que estructura las páginas web.', 'Es un lenguaje de marcado, no de programación.'),
             ('¿Quién creó el kernel Linux?', ['Bill Gates', 'Linus Torvalds', 'Steve Jobs', 'Dennis Ritchie'], 1, 'Linus Torvalds creó Linux en 1991.', 'El nombre del sistema viene de su nombre.'),
             ('¿Qué protocolo se usa para la navegación web segura?', ['FTP', 'HTTPS', 'SMTP', 'SSH'], 1, 'HTTPS es HTTP con cifrado (TLS).', 'Aparece como un candado en el navegador.'),
             ('¿Qué lenguaje de programación lleva el nombre de un grupo de comedia británico?', ['Java', 'Python', 'Ruby', 'Go'], 1, 'Python rinde homenaje a Monty Python.', 'Se llama como una serpiente, pero el origen es otro.'),
             ('¿Qué significa CPU?', ['Tarjeta de video', 'Unidad Central de Procesamiento', 'Disco de almacenamiento', 'Fuente de energía'], 1, 'La CPU es el procesador, el "cerebro" del ordenador.', 'Es donde se ejecutan las instrucciones.'),
             ('¿Cuál de estas es una herramienta de control de versiones?', ['Git', 'Excel', 'Photoshop', 'Chrome'], 0, 'Git registra el historial de cambios del código.', 'También creado por Linus Torvalds.'),
             ('¿Cuántos bits forman 1 byte?', ['4', '8', '16', '32'], 1, '1 byte = 8 bits.', 'Una potencia de dos entre 4 y 16.'),
             ('¿Qué significa la sigla IA?', ['Interfaz Avanzada', 'Inteligencia Artificial', 'Integración Analítica', 'Internet Abierta'], 1, 'IA es Inteligencia Artificial: sistemas que aprenden y deciden.', 'Máquinas que aprenden.'),
         ],
     })

# --------------------------------------------------------------------------
_add('science', 'fa-flask', 'emerald',
     {'pt': 'Ciência & Natureza', 'en': 'Science & Nature', 'es': 'Ciencia y Naturaleza'},
     {'pt': 'Física, química, biologia e astronomia em nível básico.', 'en': 'Basic physics, chemistry, biology and astronomy.', 'es': 'Física, química, biología y astronomía en nivel básico.'},
     {
         'pt': [
             ('Qual é a fórmula química da água?', ['CO2', 'H2O', 'O2', 'NaCl'], 1, 'A água é formada por dois hidrogênios e um oxigênio.', 'Dois hidrogênios.'),
             ('Qual gás as plantas absorvem na fotossíntese?', ['Oxigênio', 'Nitrogênio', 'Gás carbônico', 'Hélio'], 2, 'Elas absorvem CO2 e liberam oxigênio.', 'É o gás que expiramos.'),
             ('Qual planeta é conhecido como "Planeta Vermelho"?', ['Júpiter', 'Marte', 'Vênus', 'Saturno'], 1, 'Marte é vermelho por causa do óxido de ferro no solo.', 'Leva o nome do deus romano da guerra.'),
             ('Quantos ossos tem o corpo humano adulto?', ['106', '206', '306', '406'], 1, 'Um adulto tem 206 ossos.', 'Mais de 200.'),
             ('Qual é a velocidade aproximada da luz no vácuo?', ['3.000 km/s', '30.000 km/s', '300.000 km/s', '3.000.000 km/s'], 2, 'A luz viaja a cerca de 300.000 km/s.', 'Três seguido de cinco zeros.'),
             ('Qual órgão bombeia o sangue pelo corpo?', ['Pulmão', 'Fígado', 'Coração', 'Rim'], 2, 'O coração bombeia o sangue pelo sistema circulatório.', 'Bate cerca de 70 vezes por minuto.'),
             ('Qual é a unidade básica da vida?', ['Átomo', 'Célula', 'Molécula', 'Órgão'], 1, 'A célula é a menor unidade viva.', 'Foi observada primeiro numa cortiça.'),
             ('Qual estado da matéria tem forma e volume definidos?', ['Sólido', 'Líquido', 'Gasoso', 'Plasma'], 0, 'Os sólidos mantêm forma e volume.', 'Uma pedra é um exemplo.'),
         ],
         'en': [
             ('What is the chemical formula of water?', ['CO2', 'H2O', 'O2', 'NaCl'], 1, 'Water has two hydrogens and one oxygen.', 'Two hydrogens.'),
             ('Which gas do plants absorb during photosynthesis?', ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Helium'], 2, 'They absorb CO2 and release oxygen.', 'It is the gas we exhale.'),
             ('Which planet is known as the "Red Planet"?', ['Jupiter', 'Mars', 'Venus', 'Saturn'], 1, 'Mars is red because of iron oxide in its soil.', 'Named after the Roman god of war.'),
             ('How many bones does an adult human body have?', ['106', '206', '306', '406'], 1, 'An adult has 206 bones.', 'More than 200.'),
             ('What is the approximate speed of light in a vacuum?', ['3,000 km/s', '30,000 km/s', '300,000 km/s', '3,000,000 km/s'], 2, 'Light travels at about 300,000 km/s.', 'Three followed by five zeros.'),
             ('Which organ pumps blood around the body?', ['Lung', 'Liver', 'Heart', 'Kidney'], 2, 'The heart pumps blood through the circulatory system.', 'It beats about 70 times a minute.'),
             ('What is the basic unit of life?', ['Atom', 'Cell', 'Molecule', 'Organ'], 1, 'The cell is the smallest living unit.', 'First observed in a slice of cork.'),
             ('Which state of matter has a definite shape and volume?', ['Solid', 'Liquid', 'Gas', 'Plasma'], 0, 'Solids keep their shape and volume.', 'A rock is an example.'),
         ],
         'es': [
             ('¿Cuál es la fórmula química del agua?', ['CO2', 'H2O', 'O2', 'NaCl'], 1, 'El agua tiene dos hidrógenos y un oxígeno.', 'Dos hidrógenos.'),
             ('¿Qué gas absorben las plantas en la fotosíntesis?', ['Oxígeno', 'Nitrógeno', 'Dióxido de carbono', 'Helio'], 2, 'Absorben CO2 y liberan oxígeno.', 'Es el gas que exhalamos.'),
             ('¿Qué planeta se conoce como el "Planeta Rojo"?', ['Júpiter', 'Marte', 'Venus', 'Saturno'], 1, 'Marte es rojo por el óxido de hierro de su suelo.', 'Lleva el nombre del dios romano de la guerra.'),
             ('¿Cuántos huesos tiene el cuerpo humano adulto?', ['106', '206', '306', '406'], 1, 'Un adulto tiene 206 huesos.', 'Más de 200.'),
             ('¿Cuál es la velocidad aproximada de la luz en el vacío?', ['3.000 km/s', '30.000 km/s', '300.000 km/s', '3.000.000 km/s'], 2, 'La luz viaja a unos 300.000 km/s.', 'Un tres seguido de cinco ceros.'),
             ('¿Qué órgano bombea la sangre por el cuerpo?', ['Pulmón', 'Hígado', 'Corazón', 'Riñón'], 2, 'El corazón bombea la sangre por el sistema circulatorio.', 'Late unas 70 veces por minuto.'),
             ('¿Cuál es la unidad básica de la vida?', ['Átomo', 'Célula', 'Molécula', 'Órgano'], 1, 'La célula es la unidad viva más pequeña.', 'Se observó primero en un corcho.'),
             ('¿Qué estado de la materia tiene forma y volumen definidos?', ['Sólido', 'Líquido', 'Gaseoso', 'Plasma'], 0, 'Los sólidos mantienen su forma y volumen.', 'Una piedra es un ejemplo.'),
         ],
     })

# --------------------------------------------------------------------------
_add('geo', 'fa-map-location-dot', 'amber',
     {'pt': 'Geografia & Mundo', 'en': 'Geography & World', 'es': 'Geografía y Mundo'},
     {'pt': 'Capitais, rios, montanhas e curiosidades do planeta.', 'en': 'Capitals, rivers, mountains and world trivia.', 'es': 'Capitales, ríos, montañas y curiosidades del planeta.'},
     {
         'pt': [
             ('Qual é o maior rio do Brasil em extensão e volume?', ['São Francisco', 'Amazonas', 'Paraná', 'Tocantins'], 1, 'O rio Amazonas é o maior em volume de água do mundo.', 'Corta a maior floresta tropical.'),
             ('Qual é a capital do Canadá?', ['Toronto', 'Ottawa', 'Vancouver', 'Montreal'], 1, 'Ottawa é a capital; Toronto é a maior cidade.', 'Não é a maior cidade.'),
             ('Qual país tem o formato de uma bota?', ['Grécia', 'Itália', 'Espanha', 'Portugal'], 1, 'A Itália tem o formato de uma bota.', 'Famosa pela pizza.'),
             ('O deserto do Saara fica em qual continente?', ['Ásia', 'África', 'América do Sul', 'Oceania'], 1, 'O Saara fica no norte da África.', 'O continente das pirâmides do Egito.'),
             ('Qual é a montanha mais alta do mundo?', ['K2', 'Everest', 'Kilimanjaro', 'Aconcágua'], 1, 'O Everest tem cerca de 8.849 m.', 'Fica no Himalaia.'),
             ('Qual é a capital da Argentina?', ['Santiago', 'Montevidéu', 'Buenos Aires', 'Lima'], 2, 'Buenos Aires é a capital argentina.', 'Cidade do tango.'),
             ('Qual oceano banha a costa leste do Brasil?', ['Pacífico', 'Atlântico', 'Índico', 'Ártico'], 1, 'O litoral brasileiro é banhado pelo Atlântico.', 'Separa a América da Europa e da África.'),
             ('Em qual país fica Machu Picchu?', ['Chile', 'Peru', 'Bolívia', 'Colômbia'], 1, 'Machu Picchu é uma cidade inca no Peru.', 'Antigo império inca.'),
         ],
         'en': [
             ('Which is the longest river in Brazil by length and volume?', ['São Francisco', 'Amazon', 'Paraná', 'Tocantins'], 1, 'The Amazon is the largest river in the world by water volume.', 'It crosses the largest rainforest.'),
             ('What is the capital of Canada?', ['Toronto', 'Ottawa', 'Vancouver', 'Montreal'], 1, 'Ottawa is the capital; Toronto is the largest city.', 'It is not the largest city.'),
             ('Which country is shaped like a boot?', ['Greece', 'Italy', 'Spain', 'Portugal'], 1, 'Italy is shaped like a boot.', 'Famous for pizza.'),
             ('On which continent is the Sahara Desert?', ['Asia', 'Africa', 'South America', 'Oceania'], 1, 'The Sahara is in northern Africa.', 'The continent of Egypt\'s pyramids.'),
             ('What is the highest mountain in the world?', ['K2', 'Everest', 'Kilimanjaro', 'Aconcagua'], 1, 'Everest is about 8,849 m high.', 'It is in the Himalayas.'),
             ('What is the capital of Argentina?', ['Santiago', 'Montevideo', 'Buenos Aires', 'Lima'], 2, 'Buenos Aires is Argentina\'s capital.', 'The city of tango.'),
             ('Which ocean washes the east coast of Brazil?', ['Pacific', 'Atlantic', 'Indian', 'Arctic'], 1, 'Brazil\'s coast is washed by the Atlantic.', 'It separates the Americas from Europe and Africa.'),
             ('In which country is Machu Picchu?', ['Chile', 'Peru', 'Bolivia', 'Colombia'], 1, 'Machu Picchu is an Inca city in Peru.', 'The former Inca empire.'),
         ],
         'es': [
             ('¿Cuál es el río más grande de Brasil en extensión y caudal?', ['São Francisco', 'Amazonas', 'Paraná', 'Tocantins'], 1, 'El Amazonas es el río con más caudal del mundo.', 'Cruza la selva tropical más grande.'),
             ('¿Cuál es la capital de Canadá?', ['Toronto', 'Ottawa', 'Vancouver', 'Montreal'], 1, 'Ottawa es la capital; Toronto es la ciudad más grande.', 'No es la ciudad más grande.'),
             ('¿Qué país tiene forma de bota?', ['Grecia', 'Italia', 'España', 'Portugal'], 1, 'Italia tiene forma de bota.', 'Famosa por la pizza.'),
             ('¿En qué continente está el desierto del Sahara?', ['Asia', 'África', 'Sudamérica', 'Oceanía'], 1, 'El Sahara está en el norte de África.', 'El continente de las pirámides de Egipto.'),
             ('¿Cuál es la montaña más alta del mundo?', ['K2', 'Everest', 'Kilimanjaro', 'Aconcagua'], 1, 'El Everest mide unos 8.849 m.', 'Está en el Himalaya.'),
             ('¿Cuál es la capital de Argentina?', ['Santiago', 'Montevideo', 'Buenos Aires', 'Lima'], 2, 'Buenos Aires es la capital argentina.', 'La ciudad del tango.'),
             ('¿Qué océano baña la costa este de Brasil?', ['Pacífico', 'Atlántico', 'Índico', 'Ártico'], 1, 'El litoral brasileño está bañado por el Atlántico.', 'Separa América de Europa y África.'),
             ('¿En qué país está Machu Picchu?', ['Chile', 'Perú', 'Bolivia', 'Colombia'], 1, 'Machu Picchu es una ciudad inca en Perú.', 'El antiguo imperio inca.'),
         ],
     })

# --------------------------------------------------------------------------
_add('games', 'fa-gamepad', 'rose',
     {'pt': 'Games & Cultura Pop', 'en': 'Games & Pop Culture', 'es': 'Videojuegos y Cultura Pop'},
     {'pt': 'Personagens, consoles e jogos famosos.', 'en': 'Famous characters, consoles and games.', 'es': 'Personajes, consolas y videojuegos famosos.'},
     {
         'pt': [
             ('Qual é a profissão do Mario?', ['Carpinteiro', 'Encanador', 'Eletricista', 'Pedreiro'], 1, 'Mario é um encanador italiano.', 'Trabalha com canos verdes.'),
             ('Qual jogo é famoso por seu mundo feito de blocos?', ['Fortnite', 'Minecraft', 'Roblox', 'Terraria'], 1, 'Minecraft é o jogo de blocos mais vendido da história.', 'Tem Creepers e Endermen.'),
             ('Qual empresa criou o console PlayStation?', ['Microsoft', 'Sony', 'Nintendo', 'Sega'], 1, 'O PlayStation é da Sony.', 'Empresa japonesa de eletrônicos.'),
             ('Quem é o vilão principal da série The Legend of Zelda?', ['Bowser', 'Ganondorf', 'Sephiroth', 'Dr. Eggman'], 1, 'Ganondorf (Ganon) é o grande vilão de Zelda.', 'Rei do povo Gerudo.'),
             ('Qual é o mascote clássico da Sega?', ['Mario', 'Sonic', 'Pac-Man', 'Crash'], 1, 'Sonic, o ouriço azul, é o mascote da Sega.', 'É famoso pela velocidade.'),
             ('Em qual jogo existe o "Battle Bus"?', ['Fortnite', 'Apex Legends', 'Free Fire', 'Valorant'], 0, 'O Battle Bus leva os jogadores à ilha do Fortnite.', 'Um ônibus voador.'),
             ('O que significa "XP" nos jogos?', ['Extra Power', 'Pontos de experiência', 'Xtreme Play', 'Xbox Pro'], 1, 'XP vem de "experience points".', 'Serve para subir de nível.'),
             ('O que o Pac-Man mais come no labirinto?', ['Frutas', 'Bolinhas', 'Moedas', 'Cogumelos'], 1, 'Ele come as bolinhas (pac-dots) do labirinto.', 'São pequenas e amarelas.'),
         ],
         'en': [
             ('What is Mario\'s job?', ['Carpenter', 'Plumber', 'Electrician', 'Mason'], 1, 'Mario is an Italian plumber.', 'He works with green pipes.'),
             ('Which game is famous for its world made of blocks?', ['Fortnite', 'Minecraft', 'Roblox', 'Terraria'], 1, 'Minecraft is the best-selling game of all time.', 'It has Creepers and Endermen.'),
             ('Which company created the PlayStation console?', ['Microsoft', 'Sony', 'Nintendo', 'Sega'], 1, 'PlayStation is made by Sony.', 'A Japanese electronics company.'),
             ('Who is the main villain of The Legend of Zelda?', ['Bowser', 'Ganondorf', 'Sephiroth', 'Dr. Eggman'], 1, 'Ganondorf (Ganon) is Zelda\'s main villain.', 'King of the Gerudo.'),
             ('Who is Sega\'s classic mascot?', ['Mario', 'Sonic', 'Pac-Man', 'Crash'], 1, 'Sonic the Hedgehog is Sega\'s mascot.', 'Famous for his speed.'),
             ('In which game does the "Battle Bus" appear?', ['Fortnite', 'Apex Legends', 'Free Fire', 'Valorant'], 0, 'The Battle Bus carries players to the Fortnite island.', 'A flying bus.'),
             ('What does "XP" mean in games?', ['Extra Power', 'Experience points', 'Xtreme Play', 'Xbox Pro'], 1, 'XP stands for "experience points".', 'Used to level up.'),
             ('What does Pac-Man mostly eat in the maze?', ['Fruit', 'Pellets', 'Coins', 'Mushrooms'], 1, 'He eats the pellets (pac-dots) in the maze.', 'Small and yellow.'),
         ],
         'es': [
             ('¿Cuál es la profesión de Mario?', ['Carpintero', 'Fontanero', 'Electricista', 'Albañil'], 1, 'Mario es un fontanero italiano.', 'Trabaja con tuberías verdes.'),
             ('¿Qué juego es famoso por su mundo hecho de bloques?', ['Fortnite', 'Minecraft', 'Roblox', 'Terraria'], 1, 'Minecraft es el juego más vendido de la historia.', 'Tiene Creepers y Endermen.'),
             ('¿Qué empresa creó la consola PlayStation?', ['Microsoft', 'Sony', 'Nintendo', 'Sega'], 1, 'PlayStation es de Sony.', 'Empresa japonesa de electrónica.'),
             ('¿Quién es el villano principal de The Legend of Zelda?', ['Bowser', 'Ganondorf', 'Sephiroth', 'Dr. Eggman'], 1, 'Ganondorf (Ganon) es el gran villano de Zelda.', 'Rey de los Gerudo.'),
             ('¿Cuál es la mascota clásica de Sega?', ['Mario', 'Sonic', 'Pac-Man', 'Crash'], 1, 'Sonic, el erizo azul, es la mascota de Sega.', 'Famoso por su velocidad.'),
             ('¿En qué juego aparece el "Battle Bus"?', ['Fortnite', 'Apex Legends', 'Free Fire', 'Valorant'], 0, 'El Battle Bus lleva a los jugadores a la isla de Fortnite.', 'Un autobús volador.'),
             ('¿Qué significa "XP" en los juegos?', ['Extra Power', 'Puntos de experiencia', 'Xtreme Play', 'Xbox Pro'], 1, 'XP viene de "experience points".', 'Sirve para subir de nivel.'),
             ('¿Qué come sobre todo Pac-Man en el laberinto?', ['Frutas', 'Bolitas', 'Monedas', 'Hongos'], 1, 'Come las bolitas (pac-dots) del laberinto.', 'Son pequeñas y amarillas.'),
         ],
     })

# --------------------------------------------------------------------------
# Modelo em branco (serve de exemplo de preenchimento)
_BLANK = {
    'pt': [('Escreva aqui a sua pergunta?', ['Alternativa A', 'Alternativa B (correta)', 'Alternativa C', 'Alternativa D'], 1, 'Explique por que esta é a resposta certa.', 'Uma dica curta que não entrega a resposta.')],
    'en': [('Write your question here?', ['Option A', 'Option B (correct)', 'Option C', 'Option D'], 1, 'Explain why this is the right answer.', 'A short hint that does not give the answer away.')],
    'es': [('¿Escribe aquí tu pregunta?', ['Opción A', 'Opción B (correcta)', 'Opción C', 'Opción D'], 1, 'Explica por qué esta es la respuesta correcta.', 'Una pista corta que no revele la respuesta.')],
}
_add('blank', 'fa-pen-ruler', 'slate',
     {'pt': 'Modelo em branco', 'en': 'Blank template', 'es': 'Plantilla en blanco'},
     {'pt': 'Uma pergunta de exemplo para você abrir no editor e preencher.', 'en': 'One sample question to open in the editor and fill in.', 'es': 'Una pregunta de ejemplo para abrir en el editor y completar.'},
     _BLANK, category='corp')


# ==========================================================================
# TEMPLATES CORPORATIVOS (categoria 'corp')
# ==========================================================================
_add('security', 'fa-shield-halved', 'cyan',
     {'pt': 'Segurança da Informação', 'en': 'Information Security', 'es': 'Seguridad de la Información'},
     {'pt': 'Phishing, senhas, MFA e proteção de dados no dia a dia.', 'en': 'Phishing, passwords, MFA and everyday data protection.', 'es': 'Phishing, contraseñas, MFA y protección de datos en el día a día.'},
     {
         'pt': [
             ('O que é phishing?', ['Um vírus que estraga o hardware', 'Uma tentativa de enganar a pessoa para roubar dados ou induzir cliques', 'Um tipo de backup automático', 'Um modelo de firewall'], 1, 'Phishing usa mensagens falsas (e-mail, SMS, WhatsApp) para roubar dados ou instalar malware.', 'Começa com uma mensagem que parece legítima.'),
             ('Qual destas senhas é a mais forte?', ['123456', 'Senha2024', 'Cavalo-Azul!Trem7Lua', 'admin'], 2, 'Senhas longas, com várias palavras e símbolos, são muito mais difíceis de quebrar.', 'Tamanho conta mais que complexidade.'),
             ('O que é autenticação multifator (MFA)?', ['Usar duas ou mais formas de verificação para entrar', 'Ter várias contas no mesmo sistema', 'Trocar a senha todos os dias', 'Usar o mesmo login em vários sites'], 0, 'MFA combina algo que você sabe (senha) com algo que você tem (celular, token) ou é (biometria).', 'Senha + código no celular.'),
             ('Chegou um e-mail urgente do "diretor" pedindo uma transferência. O que fazer?', ['Transferir rápido para não atrasar', 'Responder o mesmo e-mail pedindo detalhes', 'Confirmar por outro canal oficial antes de agir', 'Encaminhar para toda a equipe'], 2, 'É a fraude do falso executivo: confirme sempre por telefone ou canal oficial conhecido.', 'Desconfie da urgência.'),
             ('Do que trata a LGPD?', ['Proteção de dados pessoais', 'Licitações públicas', 'Regras trabalhistas', 'Impostos sobre serviços'], 0, 'A Lei Geral de Proteção de Dados (Lei 13.709/2018) regula o tratamento de dados pessoais no Brasil.', 'Tem a ver com privacidade.'),
             ('Você vai sair da mesa por alguns minutos. O que fazer com o computador?', ['Deixar como está', 'Bloquear a tela', 'Só desligar o monitor', 'Deixar um bilhete com a senha'], 1, 'Bloquear a tela (Windows + L / Ctrl + Cmd + Q) impede o acesso de outras pessoas.', 'Windows + L.'),
             ('Você achou um pen drive no estacionamento. O que fazer?', ['Conectar para descobrir o dono', 'Entregar à TI/segurança sem conectar', 'Formatar e usar', 'Conectar num computador pessoal'], 1, 'Dispositivos "perdidos" são uma técnica de ataque: nunca conecte, entregue à equipe responsável.', 'Curiosidade é a isca.'),
         ],
         'en': [
             ('What is phishing?', ['A virus that damages hardware', 'An attempt to trick people into giving data or clicking malicious links', 'A type of automatic backup', 'A firewall model'], 1, 'Phishing uses fake messages (email, SMS, chat) to steal data or install malware.', 'It starts with a message that looks legitimate.'),
             ('Which of these passwords is the strongest?', ['123456', 'Password2024', 'Blue-Horse!Train7Moon', 'admin'], 2, 'Long passwords with several words and symbols are much harder to crack.', 'Length matters more than complexity.'),
             ('What is multi-factor authentication (MFA)?', ['Using two or more forms of verification to sign in', 'Having several accounts on the same system', 'Changing your password every day', 'Using the same login on many sites'], 0, 'MFA combines something you know (password) with something you have (phone, token) or are (biometrics).', 'Password + code on your phone.'),
             ('An urgent email from the "director" asks for a bank transfer. What should you do?', ['Transfer quickly to avoid delays', 'Reply to the same email asking for details', 'Confirm through another official channel before acting', 'Forward it to the whole team'], 2, 'This is CEO fraud: always confirm by phone or a known official channel.', 'Be suspicious of urgency.'),
             ('What does the GDPR regulate?', ['Protection of personal data', 'Public procurement', 'Labor rules', 'Service taxes'], 0, 'The General Data Protection Regulation sets the rules for processing personal data in the EU.', 'It is about privacy.'),
             ('You are leaving your desk for a few minutes. What should you do with your computer?', ['Leave it as it is', 'Lock the screen', 'Just turn off the monitor', 'Leave a note with the password'], 1, 'Locking the screen (Windows + L / Ctrl + Cmd + Q) stops others from using it.', 'Windows + L.'),
             ('You find a USB stick in the parking lot. What should you do?', ['Plug it in to find the owner', 'Hand it to IT/security without plugging it in', 'Format it and use it', 'Plug it into a personal computer'], 1, '"Lost" devices are an attack technique: never plug them in, hand them to the responsible team.', 'Curiosity is the bait.'),
         ],
         'es': [
             ('¿Qué es el phishing?', ['Un virus que daña el hardware', 'Un intento de engañar a las personas para robar datos o inducir clics', 'Un tipo de copia de seguridad automática', 'Un modelo de firewall'], 1, 'El phishing usa mensajes falsos (correo, SMS, chat) para robar datos o instalar malware.', 'Empieza con un mensaje que parece legítimo.'),
             ('¿Cuál de estas contraseñas es la más fuerte?', ['123456', 'Clave2024', 'Caballo-Azul!Tren7Luna', 'admin'], 2, 'Las contraseñas largas, con varias palabras y símbolos, son mucho más difíciles de descifrar.', 'La longitud importa más que la complejidad.'),
             ('¿Qué es la autenticación multifactor (MFA)?', ['Usar dos o más formas de verificación para entrar', 'Tener varias cuentas en el mismo sistema', 'Cambiar la contraseña todos los días', 'Usar el mismo usuario en varios sitios'], 0, 'La MFA combina algo que sabes (contraseña) con algo que tienes (móvil, token) o eres (biometría).', 'Contraseña + código en el móvil.'),
             ('Llega un correo urgente del "director" pidiendo una transferencia. ¿Qué haces?', ['Transferir rápido para no retrasar', 'Responder el mismo correo pidiendo detalles', 'Confirmar por otro canal oficial antes de actuar', 'Reenviarlo a todo el equipo'], 2, 'Es el fraude del falso directivo: confirma siempre por teléfono o un canal oficial conocido.', 'Desconfía de la urgencia.'),
             ('¿Qué regula el RGPD?', ['La protección de datos personales', 'La contratación pública', 'Las normas laborales', 'Los impuestos sobre servicios'], 0, 'El Reglamento General de Protección de Datos fija las reglas para tratar datos personales en la UE.', 'Tiene que ver con la privacidad.'),
             ('Vas a dejar tu puesto unos minutos. ¿Qué haces con el ordenador?', ['Dejarlo como está', 'Bloquear la pantalla', 'Sólo apagar el monitor', 'Dejar una nota con la contraseña'], 1, 'Bloquear la pantalla (Windows + L / Ctrl + Cmd + Q) impide que otros lo usen.', 'Windows + L.'),
             ('Encuentras un pendrive en el aparcamiento. ¿Qué haces?', ['Conectarlo para encontrar al dueño', 'Entregarlo a TI/seguridad sin conectarlo', 'Formatearlo y usarlo', 'Conectarlo en un ordenador personal'], 1, 'Los dispositivos "perdidos" son una técnica de ataque: nunca los conectes, entrégalos al equipo responsable.', 'La curiosidad es el cebo.'),
         ],
     }, category='corp')

_add('softskills', 'fa-people-group', 'purple',
     {'pt': 'Gestão & Comunicação', 'en': 'Management & Communication', 'es': 'Gestión y Comunicación'},
     {'pt': 'Metas SMART, feedback, priorização e reuniões produtivas.', 'en': 'SMART goals, feedback, prioritization and productive meetings.', 'es': 'Metas SMART, feedback, priorización y reuniones productivas.'},
     {
         'pt': [
             ('Nas metas SMART, o que significa o "S"?', ['Simples', 'Específica (Specific)', 'Rápida', 'Segura'], 1, 'SMART = Específica, Mensurável, Atingível, Relevante e Temporal.', 'Vem do inglês.'),
             ('O que representa o modelo de feedback SBI?', ['Situação, Comportamento, Impacto', 'Sucesso, Benefício, Ideia', 'Síntese, Base, Informação', 'Status, Bônus, Indicador'], 0, 'SBI (Situation-Behavior-Impact) descreve o contexto, o comportamento observado e o efeito dele.', 'Começa pelo contexto.'),
             ('A Matriz de Eisenhower organiza tarefas por:', ['Custo e prazo', 'Urgência e importância', 'Equipe e cliente', 'Tamanho e risco'], 1, 'Ela divide as tarefas em 4 quadrantes: fazer, agendar, delegar e eliminar.', 'Dois eixos: urgente e importante.'),
             ('O que significa o ciclo PDCA?', ['Planejar, Fazer, Checar, Agir', 'Pensar, Decidir, Corrigir, Aprovar', 'Prever, Definir, Contratar, Avaliar', 'Priorizar, Delegar, Cobrar, Arquivar'], 0, 'PDCA (Plan-Do-Check-Act) é o ciclo de melhoria contínua.', 'Melhoria contínua.'),
             ('O que é escuta ativa?', ['Responder enquanto o outro fala', 'Prestar atenção total, fazer perguntas e confirmar o entendimento', 'Ouvir só o resumo', 'Gravar a reunião para ouvir depois'], 1, 'Escuta ativa é ouvir com atenção plena e confirmar o que foi entendido.', 'Envolve perguntar e confirmar.'),
             ('Qual destas é uma boa prática para reuniões produtivas?', ['Não ter pauta', 'Definir pauta e objetivo com antecedência', 'Convidar o máximo de pessoas', 'Não ter horário de término'], 1, 'Pauta clara, participantes certos e horário definido tornam a reunião objetiva.', 'Tudo começa pela pauta.'),
         ],
         'en': [
             ('In SMART goals, what does the "S" stand for?', ['Simple', 'Specific', 'Speedy', 'Safe'], 1, 'SMART = Specific, Measurable, Achievable, Relevant and Time-bound.', 'Be precise.'),
             ('What does the SBI feedback model stand for?', ['Situation, Behavior, Impact', 'Success, Benefit, Idea', 'Summary, Basis, Information', 'Status, Bonus, Indicator'], 0, 'SBI describes the context, the observed behavior and its effect.', 'It starts with the context.'),
             ('The Eisenhower Matrix sorts tasks by:', ['Cost and deadline', 'Urgency and importance', 'Team and customer', 'Size and risk'], 1, 'It splits tasks into 4 quadrants: do, schedule, delegate and eliminate.', 'Two axes: urgent and important.'),
             ('What does the PDCA cycle stand for?', ['Plan, Do, Check, Act', 'Think, Decide, Correct, Approve', 'Predict, Define, Hire, Assess', 'Prioritize, Delegate, Chase, Archive'], 0, 'PDCA (Plan-Do-Check-Act) is the continuous improvement cycle.', 'Continuous improvement.'),
             ('What is active listening?', ['Answering while the other person speaks', 'Paying full attention, asking questions and confirming understanding', 'Listening only to the summary', 'Recording the meeting to listen later'], 1, 'Active listening means full attention plus confirming what you understood.', 'It involves asking and confirming.'),
             ('Which of these is a good practice for productive meetings?', ['Having no agenda', 'Setting the agenda and goal in advance', 'Inviting as many people as possible', 'Having no end time'], 1, 'A clear agenda, the right people and a set time keep meetings focused.', 'It all starts with the agenda.'),
         ],
         'es': [
             ('En las metas SMART, ¿qué significa la "S"?', ['Simple', 'Específica (Specific)', 'Rápida', 'Segura'], 1, 'SMART = Específica, Medible, Alcanzable, Relevante y con Tiempo definido.', 'Viene del inglés.'),
             ('¿Qué representa el modelo de feedback SBI?', ['Situación, Comportamiento, Impacto', 'Éxito, Beneficio, Idea', 'Síntesis, Base, Información', 'Estado, Bono, Indicador'], 0, 'SBI (Situation-Behavior-Impact) describe el contexto, el comportamiento observado y su efecto.', 'Empieza por el contexto.'),
             ('La Matriz de Eisenhower organiza las tareas por:', ['Costo y plazo', 'Urgencia e importancia', 'Equipo y cliente', 'Tamaño y riesgo'], 1, 'Divide las tareas en 4 cuadrantes: hacer, agendar, delegar y eliminar.', 'Dos ejes: urgente e importante.'),
             ('¿Qué significa el ciclo PDCA?', ['Planificar, Hacer, Verificar, Actuar', 'Pensar, Decidir, Corregir, Aprobar', 'Prever, Definir, Contratar, Evaluar', 'Priorizar, Delegar, Cobrar, Archivar'], 0, 'PDCA (Plan-Do-Check-Act) es el ciclo de mejora continua.', 'Mejora continua.'),
             ('¿Qué es la escucha activa?', ['Responder mientras el otro habla', 'Prestar total atención, hacer preguntas y confirmar lo entendido', 'Escuchar sólo el resumen', 'Grabar la reunión para escucharla después'], 1, 'La escucha activa es atención plena y confirmar lo que se entendió.', 'Implica preguntar y confirmar.'),
             ('¿Cuál de estas es una buena práctica para reuniones productivas?', ['No tener agenda', 'Definir agenda y objetivo con antelación', 'Invitar a la mayor cantidad de personas', 'No tener hora de cierre'], 1, 'Agenda clara, las personas correctas y horario definido hacen la reunión objetiva.', 'Todo empieza por la agenda.'),
         ],
     }, category='corp')

_add('customer', 'fa-headset', 'emerald',
     {'pt': 'Atendimento ao Cliente', 'en': 'Customer Service', 'es': 'Atención al Cliente'},
     {'pt': 'Indicadores (NPS, CSAT, SLA) e boas práticas de atendimento.', 'en': 'Metrics (NPS, CSAT, SLA) and service best practices.', 'es': 'Indicadores (NPS, CSAT, SLA) y buenas prácticas de atención.'},
     {
         'pt': [
             ('O que significa NPS?', ['Net Promoter Score', 'New Product Sales', 'National Price System', 'Net Profit Share'], 0, 'O NPS mede a probabilidade de o cliente recomendar a empresa.', 'Mede recomendação.'),
             ('Na escala do NPS (0 a 10), quem são os promotores?', ['Notas 0 a 6', 'Notas 7 e 8', 'Notas 9 e 10', 'Só nota 10'], 2, 'Promotores dão 9 ou 10; neutros, 7 ou 8; detratores, 0 a 6.', 'As duas notas mais altas.'),
             ('O que é um SLA?', ['Acordo de nível de serviço', 'Sistema de logística avançada', 'Salário líquido anual', 'Setor de lançamentos'], 0, 'SLA (Service Level Agreement) define prazos e padrões de atendimento combinados.', 'Define prazos combinados.'),
             ('Um cliente está irritado. Qual é o primeiro passo recomendado?', ['Interromper e explicar a política', 'Ouvir com empatia e reconhecer o problema', 'Transferir sem explicar', 'Encerrar o contato'], 1, 'Reconhecer o problema e mostrar empatia reduz a tensão e abre caminho para a solução.', 'Primeiro, ouvir.'),
             ('O que o CSAT mede?', ['A satisfação do cliente com uma interação', 'O custo de aquisição de clientes', 'O tempo de entrega', 'O número de vendas'], 0, 'CSAT (Customer Satisfaction Score) mede a satisfação logo após um atendimento ou compra.', 'Satisfação pontual.'),
             ('O que é "resolução no primeiro contato" (FCR)?', ['Resolver o problema já no primeiro atendimento', 'Responder em até 1 minuto', 'Atender o primeiro cliente do dia', 'Ligar para o cliente após a venda'], 0, 'FCR mede quantos casos são resolvidos sem o cliente precisar voltar.', 'Sem precisar voltar.'),
         ],
         'en': [
             ('What does NPS stand for?', ['Net Promoter Score', 'New Product Sales', 'National Price System', 'Net Profit Share'], 0, 'NPS measures how likely customers are to recommend the company.', 'It measures recommendation.'),
             ('On the NPS scale (0 to 10), who are the promoters?', ['Scores 0 to 6', 'Scores 7 and 8', 'Scores 9 and 10', 'Only a score of 10'], 2, 'Promoters give 9 or 10; passives, 7 or 8; detractors, 0 to 6.', 'The two highest scores.'),
             ('What is an SLA?', ['Service Level Agreement', 'Advanced logistics system', 'Annual net salary', 'Launch department'], 0, 'An SLA defines the agreed service deadlines and standards.', 'It defines agreed deadlines.'),
             ('A customer is angry. What is the recommended first step?', ['Interrupt and explain the policy', 'Listen with empathy and acknowledge the problem', 'Transfer without explaining', 'End the contact'], 1, 'Acknowledging the problem with empathy lowers tension and opens the way to a solution.', 'First, listen.'),
             ('What does CSAT measure?', ['Customer satisfaction with an interaction', 'Customer acquisition cost', 'Delivery time', 'Number of sales'], 0, 'CSAT (Customer Satisfaction Score) measures satisfaction right after a service or purchase.', 'Point-in-time satisfaction.'),
             ('What is "First Contact Resolution" (FCR)?', ['Solving the issue on the first contact', 'Answering within 1 minute', 'Serving the first customer of the day', 'Calling the customer after the sale'], 0, 'FCR measures how many cases are solved without the customer having to come back.', 'No need to come back.'),
         ],
         'es': [
             ('¿Qué significa NPS?', ['Net Promoter Score', 'New Product Sales', 'National Price System', 'Net Profit Share'], 0, 'El NPS mide la probabilidad de que el cliente recomiende la empresa.', 'Mide la recomendación.'),
             ('En la escala NPS (0 a 10), ¿quiénes son los promotores?', ['Notas 0 a 6', 'Notas 7 y 8', 'Notas 9 y 10', 'Sólo la nota 10'], 2, 'Los promotores dan 9 o 10; los pasivos, 7 u 8; los detractores, 0 a 6.', 'Las dos notas más altas.'),
             ('¿Qué es un SLA?', ['Acuerdo de nivel de servicio', 'Sistema de logística avanzada', 'Salario neto anual', 'Departamento de lanzamientos'], 0, 'El SLA (Service Level Agreement) define los plazos y estándares de atención acordados.', 'Define plazos acordados.'),
             ('Un cliente está molesto. ¿Cuál es el primer paso recomendado?', ['Interrumpir y explicar la política', 'Escuchar con empatía y reconocer el problema', 'Transferir sin explicar', 'Terminar el contacto'], 1, 'Reconocer el problema con empatía reduce la tensión y abre el camino a la solución.', 'Primero, escuchar.'),
             ('¿Qué mide el CSAT?', ['La satisfacción del cliente con una interacción', 'El costo de adquisición de clientes', 'El tiempo de entrega', 'El número de ventas'], 0, 'El CSAT (Customer Satisfaction Score) mide la satisfacción justo después de una atención o compra.', 'Satisfacción puntual.'),
             ('¿Qué es la "resolución en el primer contacto" (FCR)?', ['Resolver el problema en la primera atención', 'Responder en menos de 1 minuto', 'Atender al primer cliente del día', 'Llamar al cliente después de la venta'], 0, 'El FCR mide cuántos casos se resuelven sin que el cliente tenga que volver.', 'Sin tener que volver.'),
         ],
     }, category='corp')

_add('onboarding', 'fa-id-badge', 'amber',
     {'pt': 'Onboarding (modelo editável)', 'en': 'Onboarding (editable template)', 'es': 'Onboarding (plantilla editable)'},
     {'pt': 'Integração de novos colaboradores. Abra no editor e troque os [CAMPOS] pelos dados da sua empresa.', 'en': 'New-hire onboarding. Open it in the editor and replace the [FIELDS] with your company data.', 'es': 'Integración de nuevos colaboradores. Ábrela en el editor y cambia los [CAMPOS] por los datos de tu empresa.'},
     {
         'pt': [
             ('Em que ano a [EMPRESA] foi fundada?', ['[ANO A]', '[ANO CORRETO]', '[ANO C]', '[ANO D]'], 1, '[Conte um pouco da história da empresa.]', '[Dica opcional]'),
             ('Qual é a missão da [EMPRESA]?', ['[MISSÃO CORRETA]', '[OPÇÃO ERRADA 1]', '[OPÇÃO ERRADA 2]', '[OPÇÃO ERRADA 3]'], 0, '[Explique a missão com um exemplo do dia a dia.]', ''),
             ('Qual destes é um dos nossos valores?', ['[VALOR ERRADO 1]', '[VALOR ERRADO 2]', '[VALOR CORRETO]', '[VALOR ERRADO 3]'], 2, '[Liste todos os valores da empresa.]', ''),
             ('Com quem devo falar sobre benefícios e férias?', ['Financeiro', 'Recursos Humanos', 'TI', 'Jurídico'], 1, '[Nome/contato do RH.]', ''),
             ('Qual canal usamos para a comunicação interna do dia a dia?', ['Carta', '[FERRAMENTA DE CHAT]', 'Fax', 'Redes sociais pessoais'], 1, '[Explique os canais e quando usar cada um.]', ''),
             ('Onde ficam as políticas e manuais da empresa?', ['[INTRANET / PORTAL]', 'No e-mail pessoal', 'Não existem', 'Com cada gestor, em papel'], 0, '[Coloque o link da intranet.]', ''),
         ],
         'en': [
             ('In what year was [COMPANY] founded?', ['[YEAR A]', '[CORRECT YEAR]', '[YEAR C]', '[YEAR D]'], 1, '[Tell a bit of the company history.]', '[Optional hint]'),
             ("What is [COMPANY]'s mission?", ['[CORRECT MISSION]', '[WRONG OPTION 1]', '[WRONG OPTION 2]', '[WRONG OPTION 3]'], 0, '[Explain the mission with an everyday example.]', ''),
             ('Which of these is one of our values?', ['[WRONG VALUE 1]', '[WRONG VALUE 2]', '[CORRECT VALUE]', '[WRONG VALUE 3]'], 2, '[List all company values.]', ''),
             ('Who should I talk to about benefits and vacation?', ['Finance', 'Human Resources', 'IT', 'Legal'], 1, '[HR name/contact.]', ''),
             ('Which channel do we use for day-to-day internal communication?', ['Letters', '[CHAT TOOL]', 'Fax', 'Personal social media'], 1, '[Explain the channels and when to use each one.]', ''),
             ('Where are the company policies and handbooks?', ['[INTRANET / PORTAL]', 'In personal email', 'They do not exist', 'With each manager, on paper'], 0, '[Add the intranet link.]', ''),
         ],
         'es': [
             ('¿En qué año se fundó [EMPRESA]?', ['[AÑO A]', '[AÑO CORRECTO]', '[AÑO C]', '[AÑO D]'], 1, '[Cuenta un poco de la historia de la empresa.]', '[Pista opcional]'),
             ('¿Cuál es la misión de [EMPRESA]?', ['[MISIÓN CORRECTA]', '[OPCIÓN INCORRECTA 1]', '[OPCIÓN INCORRECTA 2]', '[OPCIÓN INCORRECTA 3]'], 0, '[Explica la misión con un ejemplo del día a día.]', ''),
             ('¿Cuál de estos es uno de nuestros valores?', ['[VALOR INCORRECTO 1]', '[VALOR INCORRECTO 2]', '[VALOR CORRECTO]', '[VALOR INCORRECTO 3]'], 2, '[Enumera todos los valores de la empresa.]', ''),
             ('¿Con quién hablo sobre beneficios y vacaciones?', ['Finanzas', 'Recursos Humanos', 'TI', 'Legal'], 1, '[Nombre/contacto de RR. HH.]', ''),
             ('¿Qué canal usamos para la comunicación interna del día a día?', ['Cartas', '[HERRAMIENTA DE CHAT]', 'Fax', 'Redes sociales personales'], 1, '[Explica los canales y cuándo usar cada uno.]', ''),
             ('¿Dónde están las políticas y manuales de la empresa?', ['[INTRANET / PORTAL]', 'En el correo personal', 'No existen', 'Con cada jefe, en papel'], 0, '[Agrega el enlace de la intranet.]', ''),
         ],
     }, category='corp')

_add('pulse', 'fa-square-poll-vertical', 'rose',
     {'pt': 'Pesquisa de clima (enquetes)', 'en': 'Pulse survey (polls)', 'es': 'Encuesta de clima (sondeos)'},
     {'pt': 'Perguntas sem resposta certa: o grupo vota e todos veem o resultado. Ótimo para abrir ou fechar reuniões.', 'en': 'Questions with no right answer: the group votes and everyone sees the result. Great to open or close meetings.', 'es': 'Preguntas sin respuesta correcta: el grupo vota y todos ven el resultado. Ideal para abrir o cerrar reuniones.'},
     {
         'pt': [
             ('Como você está se sentindo hoje?', ['😄 Ótimo', '🙂 Bem', '😐 Mais ou menos', '😟 Cansado(a)'], None, '', ''),
             ('Quão clara está a meta da equipe para este trimestre?', ['Muito clara', 'Clara', 'Pouco clara', 'Nada clara'], None, '', ''),
             ('Qual formato de reunião você prefere?', ['Presencial', 'Online', 'Híbrido', 'Assíncrono (por escrito)'], None, '', ''),
             ('O que mais ajudaria a sua produtividade?', ['Menos reuniões', 'Ferramentas melhores', 'Mais treinamento', 'Mais tempo de foco'], None, '', ''),
             ('Você recomendaria este encontro a um colega?', ['Com certeza', 'Provavelmente', 'Talvez', 'Não'], None, '', ''),
         ],
         'en': [
             ('How are you feeling today?', ['😄 Great', '🙂 Good', '😐 So-so', '😟 Tired'], None, '', ''),
             ("How clear is the team's goal for this quarter?", ['Very clear', 'Clear', 'Not very clear', 'Not clear at all'], None, '', ''),
             ('Which meeting format do you prefer?', ['In person', 'Online', 'Hybrid', 'Async (in writing)'], None, '', ''),
             ('What would help your productivity the most?', ['Fewer meetings', 'Better tools', 'More training', 'More focus time'], None, '', ''),
             ('Would you recommend this session to a colleague?', ['Definitely', 'Probably', 'Maybe', 'No'], None, '', ''),
         ],
         'es': [
             ('¿Cómo te sientes hoy?', ['😄 Genial', '🙂 Bien', '😐 Más o menos', '😟 Cansado(a)'], None, '', ''),
             ('¿Qué tan clara está la meta del equipo para este trimestre?', ['Muy clara', 'Clara', 'Poco clara', 'Nada clara'], None, '', ''),
             ('¿Qué formato de reunión prefieres?', ['Presencial', 'En línea', 'Híbrido', 'Asíncrono (por escrito)'], None, '', ''),
             ('¿Qué ayudaría más a tu productividad?', ['Menos reuniones', 'Mejores herramientas', 'Más capacitación', 'Más tiempo de foco'], None, '', ''),
             ('¿Recomendarías este encuentro a un colega?', ['Sin duda', 'Probablemente', 'Tal vez', 'No'], None, '', ''),
         ],
     }, category='corp')


def _expand(theme_name, rows):
    out = []
    for q, opts, correct, expl, hint in rows:
        item = {'block': theme_name, 'topic': '', 'question': q, 'options': list(opts), 'correct': correct,
                'hint': hint, 'reference': theme_name, 'explanation': expl}
        if correct is None:
            item['poll'] = True
        out.append(item)
    return out


def list_templates(lang='pt'):
    lang = lang if lang in ('pt', 'en', 'es') else 'pt'
    return [{'id': t['id'], 'icon': t['icon'], 'color': t['color'], 'name': t['names'][lang],
             'desc': t['descs'][lang], 'count': len(t['data'][lang]),
             'category': t['category']} for t in _T.values()]


def get_template(tid, lang='pt'):
    lang = lang if lang in ('pt', 'en', 'es') else 'pt'
    t = _T.get(tid)
    if not t:
        return None
    return {'id': tid, 'name': t['names'][lang], 'questions': _expand(t['names'][lang], t['data'][lang])}
