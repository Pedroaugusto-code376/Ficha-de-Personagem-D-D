// Dados do Livro do Jogador (2024).

const ATRIBUTOS = [
  { id: 'for', nome: 'Força', pericias: [['atletismo', 'Atletismo']] },
  { id: 'des', nome: 'Destreza', pericias: [['acrobacia', 'Acrobacia'], ['furtividade', 'Furtividade'], ['prestidigitacao', 'Prestidigitação']] },
  { id: 'con', nome: 'Constituição', pericias: [] },
  { id: 'int', nome: 'Inteligência', pericias: [['arcanismo', 'Arcanismo'], ['historia', 'História'], ['investigacao', 'Investigação'], ['natureza', 'Natureza'], ['religiao', 'Religião']] },
  { id: 'sab', nome: 'Sabedoria', pericias: [['adestrar', 'Adestrar Animais'], ['intuicao', 'Intuição'], ['medicina', 'Medicina'], ['percepcao', 'Percepção'], ['sobrevivencia', 'Sobrevivência']] },
  { id: 'car', nome: 'Carisma', pericias: [['atuacao', 'Atuação'], ['enganacao', 'Enganação'], ['intimidacao', 'Intimidação'], ['persuasao', 'Persuasão']] },
];

// dv = dado de vida; sal = salvaguardas; arm = treinamento com armaduras; conj = habilidade de conjuração;
// marciais = quais armas marciais a classe usa ('todas' | 'acuidade_leve' | 'leve' | null);
// magia = progressão de espaços ('completo' | 'meio' | 'pacto'); truques = truques conhecidos no nível 1;
// maestria = nº de armas com maestria; ferr = ferramenta fixa; ferrEscolha = ferramentas a escolher.
const CLASSES = {
  'Bárbaro': {
    dv: 12, sal: ['for', 'con'], arm: ['leve', 'media', 'escudos'], conj: '', princ: 'Força',
    armas: 'Armas simples e marciais', marciais: 'todas', maestria: 2,
    pericias: { n: 2, lista: ['adestrar', 'atletismo', 'intimidacao', 'natureza', 'percepcao', 'sobrevivencia'] },
    sub: ['Caminho do Berserker', 'Caminho do Coração Selvagem', 'Caminho da Árvore do Mundo', 'Caminho do Fanático'],
  },
  'Bardo': {
    dv: 8, sal: ['des', 'car'], arm: ['leve'], conj: 'car', princ: 'Carisma',
    armas: 'Armas simples', marciais: null, magia: 'completo', truques: 2,
    ferrEscolha: { n: 3, tipo: 'instrumento' },
    pericias: { n: 3, lista: 'qualquer' },
    sub: ['Colégio da Dança', 'Colégio do Glamour', 'Colégio do Conhecimento', 'Colégio da Bravura'],
  },
  'Bruxo': {
    dv: 8, sal: ['sab', 'car'], arm: ['leve'], conj: 'car', princ: 'Carisma',
    armas: 'Armas simples', marciais: null, magia: 'pacto', truques: 2,
    pericias: { n: 2, lista: ['arcanismo', 'enganacao', 'historia', 'intimidacao', 'investigacao', 'natureza', 'religiao'] },
    sub: ['Patrono Arquifada', 'Patrono Celestial', 'Patrono Ínfero', 'Patrono Grande Antigo'],
  },
  'Clérigo': {
    dv: 8, sal: ['sab', 'car'], arm: ['leve', 'media', 'escudos'], conj: 'sab', princ: 'Sabedoria',
    armas: 'Armas simples', marciais: null, magia: 'completo', truques: 3,
    pericias: { n: 2, lista: ['historia', 'intuicao', 'medicina', 'persuasao', 'religiao'] },
    sub: ['Domínio da Vida', 'Domínio da Luz', 'Domínio da Trapaça', 'Domínio da Guerra'],
  },
  'Druida': {
    dv: 8, sal: ['int', 'sab'], arm: ['leve', 'escudos'], conj: 'sab', princ: 'Sabedoria',
    armas: 'Armas simples', marciais: null, magia: 'completo', truques: 2, ferr: 'Kit de Herbalismo',
    pericias: { n: 2, lista: ['adestrar', 'arcanismo', 'intuicao', 'medicina', 'natureza', 'percepcao', 'religiao', 'sobrevivencia'] },
    sub: ['Círculo da Terra', 'Círculo da Lua', 'Círculo do Mar', 'Círculo das Estrelas'],
  },
  'Feiticeiro': {
    dv: 6, sal: ['con', 'car'], arm: [], conj: 'car', princ: 'Carisma',
    armas: 'Armas simples', marciais: null, magia: 'completo', truques: 4,
    pericias: { n: 2, lista: ['arcanismo', 'enganacao', 'intuicao', 'intimidacao', 'persuasao', 'religiao'] },
    sub: ['Feitiçaria Aberrante', 'Feitiçaria Mecânica', 'Feitiçaria Dracônica', 'Feitiçaria Selvagem'],
  },
  'Guerreiro': {
    dv: 10, sal: ['for', 'con'], arm: ['leve', 'media', 'pesada', 'escudos'], conj: '', princ: 'Força ou Destreza',
    armas: 'Armas simples e marciais', marciais: 'todas', maestria: 3,
    pericias: { n: 2, lista: ['acrobacia', 'adestrar', 'atletismo', 'historia', 'intuicao', 'intimidacao', 'persuasao', 'percepcao', 'sobrevivencia'] },
    sub: ['Mestre de Batalha', 'Campeão', 'Cavaleiro Arcano', 'Guerreiro Psíquico'],
  },
  'Ladino': {
    dv: 8, sal: ['des', 'int'], arm: ['leve'], conj: '', princ: 'Destreza',
    armas: 'Armas simples e armas marciais com a propriedade Acuidade ou Leve', marciais: 'acuidade_leve', maestria: 2,
    ferr: 'Ferramentas de Ladrão',
    pericias: { n: 4, lista: ['acrobacia', 'atletismo', 'enganacao', 'intuicao', 'intimidacao', 'investigacao', 'percepcao', 'persuasao', 'prestidigitacao', 'furtividade'] },
    sub: ['Assassino', 'Trapaceiro Arcano', 'Ladrão', 'Lâmina da Alma'],
  },
  'Mago': {
    dv: 6, sal: ['int', 'sab'], arm: [], conj: 'int', princ: 'Inteligência',
    armas: 'Armas simples', marciais: null, magia: 'completo', truques: 3,
    pericias: { n: 2, lista: ['arcanismo', 'historia', 'intuicao', 'investigacao', 'medicina', 'natureza', 'religiao'] },
    sub: ['Abjurador', 'Adivinho', 'Evocador', 'Ilusionista'],
  },
  'Monge': {
    dv: 8, sal: ['for', 'des'], arm: [], conj: '', princ: 'Destreza e Sabedoria',
    armas: 'Armas simples e armas marciais com a propriedade Leve', marciais: 'leve',
    ferrEscolha: { n: 1, tipo: 'artesao_ou_instrumento' },
    pericias: { n: 2, lista: ['acrobacia', 'atletismo', 'historia', 'intuicao', 'religiao', 'furtividade'] },
    sub: ['Guerreiro da Misericórdia', 'Guerreiro das Sombras', 'Guerreiro dos Elementos', 'Guerreiro da Mão Aberta'],
  },
  'Paladino': {
    dv: 10, sal: ['sab', 'car'], arm: ['leve', 'media', 'pesada', 'escudos'], conj: 'car', princ: 'Força e Carisma',
    armas: 'Armas simples e marciais', marciais: 'todas', magia: 'meio', maestria: 2,
    pericias: { n: 2, lista: ['atletismo', 'intuicao', 'intimidacao', 'medicina', 'persuasao', 'religiao'] },
    sub: ['Juramento de Devoção', 'Juramento da Glória', 'Juramento dos Anciões', 'Juramento de Vingança'],
  },
  'Patrulheiro': {
    dv: 10, sal: ['for', 'des'], arm: ['leve', 'media', 'escudos'], conj: 'sab', princ: 'Destreza e Sabedoria',
    armas: 'Armas simples e marciais', marciais: 'todas', magia: 'meio', maestria: 2,
    pericias: { n: 3, lista: ['adestrar', 'atletismo', 'intuicao', 'investigacao', 'natureza', 'percepcao', 'furtividade', 'sobrevivencia'] },
    sub: ['Andarilho Feérico', 'Errante do Horizonte', 'Caçador', 'Mestre das Feras'],
  },
};

// Espaços de magia de conjurador completo, por nível de personagem (índice 0 = nível 1).
const ESPACOS_COMPLETO = [
  [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

// linhagens: escolhas da espécie; hab = a espécie escolhe Int/Sab/Car para suas magias.
const ESPECIES = {
  'Aasimar': { tam: 'Médio ou Pequeno', desl: '9 m', truque: 'Luz', habTruque: 'car',
    tracos: ['Resistência Celestial (necrótico e radiante)', 'Visão no Escuro (18 m)', 'Mãos Curativas', 'Portador da Luz', 'Revelação Celestial (nível 3)'] },
  'Anão': { tam: 'Médio', desl: '9 m',
    tracos: ['Visão no Escuro (36 m)', 'Resiliência Anã (resistência a veneno)', 'Robustez Anã (+1 PV por nível)', 'Conhecimento de Pedra'] },
  'Draconato': { tam: 'Médio', desl: '9 m', draconico: true,
    tracos: ['Ancestralidade Dracônica', 'Arma de Sopro', 'Resistência a Dano', 'Visão no Escuro (18 m)', 'Voo Dracônico (nível 5)'] },
  'Elfo': { tam: 'Médio', desl: '9 m',
    tracos: ['Visão no Escuro (18 m)', 'Linhagem Élfica', 'Ancestralidade Feérica', 'Sentidos Aguçados', 'Transe'],
    linhagens: {
      'Drow': { truques: ['Luzes Dançantes'], tracos: ['Visão no Escuro ampliada para 36 m'], nota: 'nível 3: Fogo Feérico · nível 5: Escuridão' },
      'Alto Elfo': { truques: ['Prestidigitação'], nota: 'nível 3: Detectar Magia · nível 5: Passo Nebuloso' },
      'Elfo da Floresta': { truques: ['Druidismo'], desl: '10,5 m', nota: 'nível 3: Passos Largos · nível 5: Passos sem Pegadas' },
    } },
  'Gnomo': { tam: 'Pequeno', desl: '9 m',
    tracos: ['Visão no Escuro (18 m)', 'Astúcia Gnômica', 'Linhagem Gnômica'],
    linhagens: {
      'Gnomo da Floresta': { truques: ['Ilusão Menor'], nota: 'Falar com Animais sempre preparada' },
      'Gnomo das Rochas': { truques: ['Consertar', 'Prestidigitação'], nota: 'pode criar pequenos dispositivos mecânicos' },
    } },
  'Golias': { tam: 'Médio', desl: '10,5 m', gigante: true,
    tracos: ['Ancestralidade Gigante', 'Forma Grande (nível 5)'] },
  'Halfling': { tam: 'Pequeno', desl: '9 m',
    tracos: ['Bravura', 'Agilidade Halfling', 'Sorte', 'Furtividade Natural'] },
  'Humano': { tam: 'Médio ou Pequeno', desl: '9 m', humano: true,
    tracos: ['Engenhoso (Inspiração Heroica ao terminar um descanso longo)', 'Habilidoso', 'Versátil'] },
  'Orc': { tam: 'Médio', desl: '9 m',
    tracos: ['Surto de Adrenalina', 'Visão no Escuro (36 m)', 'Resistência Implacável'] },
  'Tiefling': { tam: 'Médio ou Pequeno', desl: '9 m',
    tracos: ['Visão no Escuro (18 m)', 'Legado Ínfero', 'Presença Sobrenatural (Taumaturgia)'],
    linhagens: {
      'Abissal': { truques: ['Rajada de Veneno'], resist: 'veneno', nota: 'nível 3: Raio Nauseante · nível 5: Imobilizar Pessoa' },
      'Ctônico': { truques: ['Toque Arrepiante'], resist: 'necrótico', nota: 'nível 3: Vitalidade Falsa · nível 5: Raio do Enfraquecimento' },
      'Infernal': { truques: ['Raio de Fogo'], resist: 'fogo', nota: 'nível 3: Repreensão Infernal · nível 5: Escuridão' },
    } },
};

const DRACONICOS = {
  'Azul': 'elétrico', 'Branco': 'frio', 'Bronze': 'elétrico', 'Cobre': 'ácido', 'Latão': 'fogo',
  'Negro': 'ácido', 'Ouro': 'fogo', 'Prata': 'frio', 'Verde': 'veneno', 'Vermelho': 'fogo',
};

const GIGANTES = {
  'Gigante da Colina': 'Derrubada da Colina: ao atingir uma criatura Grande ou menor, você pode deixá-la Caída',
  'Gigante do Fogo': 'Queimadura de Fogo: ao atingir com um ataque, causa +1d10 de dano de fogo',
  'Gigante do Gelo': 'Frio do Gelo: ao atingir com um ataque, causa +1d6 de dano de frio e reduz o deslocamento do alvo em 3 m',
  'Gigante das Nuvens': 'Passo da Nuvem: Ação Bônus para se teletransportar até 9 m',
  'Gigante da Pedra': 'Resistência da Pedra: Reação para reduzir o dano sofrido em 1d12 + mod. de Constituição',
  'Gigante da Tempestade': 'Trovão da Tempestade: Reação ao sofrer dano para causar 1d8 de dano trovejante no atacante',
};

// attrs = atributos que o antecedente pode aumentar; ferrTipo = categoria quando a ferramenta é à escolha.
const ANTECEDENTES = {
  'Acólito':    { attrs: ['int', 'sab', 'car'], pericias: ['intuicao', 'religiao'],         talento: 'Iniciado em Magia (Clérigo)', ferramenta: 'Suprimentos de Calígrafo' },
  'Andarilho':  { attrs: ['des', 'sab', 'car'], pericias: ['intuicao', 'furtividade'],      talento: 'Sortudo',                     ferramenta: 'Ferramentas de Ladrão' },
  'Artesão':    { attrs: ['for', 'des', 'int'], pericias: ['investigacao', 'persuasao'],    talento: 'Artesão',                     ferrTipo: 'artesao' },
  'Artista':    { attrs: ['for', 'des', 'car'], pericias: ['acrobacia', 'atuacao'],         talento: 'Músico',                      ferrTipo: 'instrumento' },
  'Charlatão':  { attrs: ['des', 'con', 'car'], pericias: ['enganacao', 'prestidigitacao'], talento: 'Habilidoso',                  ferramenta: 'Kit de Falsificação' },
  'Criminoso':  { attrs: ['des', 'con', 'int'], pericias: ['furtividade', 'prestidigitacao'], talento: 'Alerta',                    ferramenta: 'Ferramentas de Ladrão' },
  'Eremita':    { attrs: ['con', 'sab', 'car'], pericias: ['medicina', 'religiao'],         talento: 'Curandeiro',                  ferramenta: 'Kit de Herbalismo' },
  'Escriba':    { attrs: ['des', 'int', 'sab'], pericias: ['investigacao', 'percepcao'],    talento: 'Habilidoso',                  ferramenta: 'Suprimentos de Calígrafo' },
  'Fazendeiro': { attrs: ['for', 'con', 'sab'], pericias: ['adestrar', 'natureza'],         talento: 'Vigoroso',                    ferramenta: 'Ferramentas de Carpinteiro' },
  'Guarda':     { attrs: ['for', 'int', 'sab'], pericias: ['atletismo', 'percepcao'],       talento: 'Alerta',                      ferrTipo: 'jogo' },
  'Guia':       { attrs: ['des', 'con', 'sab'], pericias: ['furtividade', 'sobrevivencia'], talento: 'Iniciado em Magia (Druida)',  ferramenta: 'Ferramentas de Cartógrafo' },
  'Marinheiro': { attrs: ['for', 'des', 'sab'], pericias: ['acrobacia', 'percepcao'],       talento: 'Brigão de Taverna',           ferramenta: 'Ferramentas de Navegador' },
  'Mercador':   { attrs: ['con', 'int', 'car'], pericias: ['adestrar', 'persuasao'],        talento: 'Sortudo',                     ferramenta: 'Ferramentas de Navegador' },
  'Nobre':      { attrs: ['for', 'int', 'car'], pericias: ['historia', 'persuasao'],        talento: 'Habilidoso',                  ferrTipo: 'jogo' },
  'Sábio':      { attrs: ['con', 'int', 'sab'], pericias: ['arcanismo', 'historia'],        talento: 'Iniciado em Magia (Mago)',    ferramenta: 'Suprimentos de Calígrafo' },
  'Soldado':    { attrs: ['for', 'des', 'con'], pericias: ['atletismo', 'intimidacao'],     talento: 'Atacante Selvagem',           ferrTipo: 'jogo' },
};

const TALENTOS_ORIGEM = ['Alerta', 'Artesão', 'Atacante Selvagem', 'Brigão de Taverna', 'Curandeiro', 'Habilidoso',
  'Iniciado em Magia (Clérigo)', 'Iniciado em Magia (Druida)', 'Iniciado em Magia (Mago)', 'Músico', 'Sortudo', 'Vigoroso'];

const FERRAMENTAS = {
  artesao: ['Ferramentas de Alquimista', 'Suprimentos de Cervejeiro', 'Suprimentos de Calígrafo', 'Ferramentas de Carpinteiro',
    'Ferramentas de Cartógrafo', 'Ferramentas de Sapateiro', 'Utensílios de Cozinheiro', 'Ferramentas de Vidreiro',
    'Ferramentas de Joalheiro', 'Ferramentas de Coureiro', 'Ferramentas de Pedreiro', 'Suprimentos de Pintor',
    'Ferramentas de Oleiro', 'Ferramentas de Ferreiro', 'Ferramentas de Funileiro', 'Ferramentas de Tecelão', 'Ferramentas de Entalhador'],
  instrumento: ['Gaita de Foles', 'Tambor', 'Saltério', 'Flauta', 'Trompa', 'Alaúde', 'Lira', 'Flauta de Pã', 'Charamela', 'Viola'],
  jogo: ['Dados', 'Xadrez de Dragão', 'Baralho', 'Jogo dos Três Dragões'],
};

// cat: simples | marcial; tipo: cac (corpo a corpo) | dist (à distância); d = dado de dano; m = maestria.
const ARMAS = [
  { n: 'Ataque Desarmado', cat: 'simples', tipo: 'cac', d: '1', t: 'concussão', p: [], m: '' },
  { n: 'Adaga', cat: 'simples', tipo: 'cac', d: '1d4', t: 'perfurante', p: ['Acuidade', 'Leve', 'Arremesso (6/18 m)'], m: 'Ágil' },
  { n: 'Azagaia', cat: 'simples', tipo: 'cac', d: '1d6', t: 'perfurante', p: ['Arremesso (9/36 m)'], m: 'Lentidão' },
  { n: 'Bordão', cat: 'simples', tipo: 'cac', d: '1d6', t: 'concussão', p: ['Versátil (1d8)'], m: 'Derrubar' },
  { n: 'Clava', cat: 'simples', tipo: 'cac', d: '1d4', t: 'concussão', p: ['Leve'], m: 'Lentidão' },
  { n: 'Clava Grande', cat: 'simples', tipo: 'cac', d: '1d8', t: 'concussão', p: ['Duas Mãos'], m: 'Empurrão' },
  { n: 'Foice Curta', cat: 'simples', tipo: 'cac', d: '1d4', t: 'cortante', p: ['Leve'], m: 'Ágil' },
  { n: 'Lança', cat: 'simples', tipo: 'cac', d: '1d6', t: 'perfurante', p: ['Arremesso (6/18 m)', 'Versátil (1d8)'], m: 'Enfraquecer' },
  { n: 'Maça', cat: 'simples', tipo: 'cac', d: '1d6', t: 'concussão', p: [], m: 'Enfraquecer' },
  { n: 'Machadinha', cat: 'simples', tipo: 'cac', d: '1d6', t: 'cortante', p: ['Leve', 'Arremesso (6/18 m)'], m: 'Atormentar' },
  { n: 'Martelo Leve', cat: 'simples', tipo: 'cac', d: '1d4', t: 'concussão', p: ['Leve', 'Arremesso (6/18 m)'], m: 'Ágil' },
  { n: 'Arco Curto', cat: 'simples', tipo: 'dist', d: '1d6', t: 'perfurante', p: ['Munição (24/96 m)', 'Duas Mãos'], m: 'Atormentar' },
  { n: 'Besta Leve', cat: 'simples', tipo: 'dist', d: '1d8', t: 'perfurante', p: ['Munição (24/96 m)', 'Recarga', 'Duas Mãos'], m: 'Lentidão' },
  { n: 'Dardo', cat: 'simples', tipo: 'dist', d: '1d4', t: 'perfurante', p: ['Acuidade', 'Arremesso (6/18 m)'], m: 'Atormentar' },
  { n: 'Funda', cat: 'simples', tipo: 'dist', d: '1d4', t: 'concussão', p: ['Munição (9/36 m)'], m: 'Lentidão' },
  { n: 'Alabarda', cat: 'marcial', tipo: 'cac', d: '1d10', t: 'cortante', p: ['Pesada', 'Alcance', 'Duas Mãos'], m: 'Trespassar' },
  { n: 'Chicote', cat: 'marcial', tipo: 'cac', d: '1d4', t: 'cortante', p: ['Acuidade', 'Alcance'], m: 'Lentidão' },
  { n: 'Cimitarra', cat: 'marcial', tipo: 'cac', d: '1d6', t: 'cortante', p: ['Acuidade', 'Leve'], m: 'Ágil' },
  { n: 'Espada Curta', cat: 'marcial', tipo: 'cac', d: '1d6', t: 'perfurante', p: ['Acuidade', 'Leve'], m: 'Atormentar' },
  { n: 'Espada Grande', cat: 'marcial', tipo: 'cac', d: '2d6', t: 'cortante', p: ['Pesada', 'Duas Mãos'], m: 'Raspão' },
  { n: 'Espada Longa', cat: 'marcial', tipo: 'cac', d: '1d8', t: 'cortante', p: ['Versátil (1d10)'], m: 'Atormentar' },
  { n: 'Glaive', cat: 'marcial', tipo: 'cac', d: '1d10', t: 'cortante', p: ['Pesada', 'Alcance', 'Duas Mãos'], m: 'Raspão' },
  { n: 'Lança de Montaria', cat: 'marcial', tipo: 'cac', d: '1d10', t: 'perfurante', p: ['Pesada', 'Alcance', 'Duas Mãos (exceto montado)'], m: 'Derrubar' },
  { n: 'Maça Estrela', cat: 'marcial', tipo: 'cac', d: '1d8', t: 'perfurante', p: [], m: 'Enfraquecer' },
  { n: 'Machado Grande', cat: 'marcial', tipo: 'cac', d: '1d12', t: 'cortante', p: ['Pesada', 'Duas Mãos'], m: 'Trespassar' },
  { n: 'Machado de Batalha', cat: 'marcial', tipo: 'cac', d: '1d8', t: 'cortante', p: ['Versátil (1d10)'], m: 'Derrubar' },
  { n: 'Malho', cat: 'marcial', tipo: 'cac', d: '2d6', t: 'concussão', p: ['Pesada', 'Duas Mãos'], m: 'Derrubar' },
  { n: 'Mangual', cat: 'marcial', tipo: 'cac', d: '1d8', t: 'concussão', p: [], m: 'Enfraquecer' },
  { n: 'Martelo de Guerra', cat: 'marcial', tipo: 'cac', d: '1d8', t: 'concussão', p: ['Versátil (1d10)'], m: 'Empurrão' },
  { n: 'Picareta de Guerra', cat: 'marcial', tipo: 'cac', d: '1d8', t: 'perfurante', p: ['Versátil (1d10)'], m: 'Enfraquecer' },
  { n: 'Pique', cat: 'marcial', tipo: 'cac', d: '1d10', t: 'perfurante', p: ['Pesada', 'Alcance', 'Duas Mãos'], m: 'Empurrão' },
  { n: 'Rapieira', cat: 'marcial', tipo: 'cac', d: '1d8', t: 'perfurante', p: ['Acuidade'], m: 'Atormentar' },
  { n: 'Tridente', cat: 'marcial', tipo: 'cac', d: '1d8', t: 'perfurante', p: ['Arremesso (6/18 m)', 'Versátil (1d10)'], m: 'Derrubar' },
  { n: 'Arco Longo', cat: 'marcial', tipo: 'dist', d: '1d8', t: 'perfurante', p: ['Munição (45/180 m)', 'Pesada', 'Duas Mãos'], m: 'Lentidão' },
  { n: 'Besta de Mão', cat: 'marcial', tipo: 'dist', d: '1d6', t: 'perfurante', p: ['Munição (9/36 m)', 'Leve', 'Recarga'], m: 'Atormentar' },
  { n: 'Besta Pesada', cat: 'marcial', tipo: 'dist', d: '1d10', t: 'perfurante', p: ['Munição (30/120 m)', 'Pesada', 'Recarga', 'Duas Mãos'], m: 'Empurrão' },
  { n: 'Mosquete', cat: 'marcial', tipo: 'dist', d: '1d12', t: 'perfurante', p: ['Munição (12/36 m)', 'Recarga', 'Duas Mãos'], m: 'Lentidão' },
  { n: 'Pistola', cat: 'marcial', tipo: 'dist', d: '1d10', t: 'perfurante', p: ['Munição (9/27 m)', 'Recarga'], m: 'Atormentar' },
  { n: 'Zarabatana', cat: 'marcial', tipo: 'dist', d: '1', t: 'perfurante', p: ['Munição (7,5/30 m)', 'Recarga'], m: 'Atormentar' },
];

// Truques. d/t = dado e tipo de dano (só truques de dano); atq = jogada de ataque de magia;
// res = salvaguarda exigida; raios = Rajada Mística (mais raios em vez de mais dados).
const TRUQUES = [
  { n: 'Badalar dos Mortos', d: 'd8', t: 'necrótico', res: 'SAB', alc: '18 m', cls: ['Bruxo', 'Clérigo', 'Mago'], nota: 'd12 se o alvo já estiver ferido' },
  { n: 'Chama Sagrada', d: 'd8', t: 'radiante', res: 'DES', alc: '18 m', cls: ['Clérigo'] },
  { n: 'Chicote de Espinhos', d: 'd6', t: 'perfurante', atq: true, alc: '9 m', cls: ['Druida'], nota: 'Puxa o alvo 3 m' },
  { n: 'Explosão Feiticeira', d: 'd8', t: 'tipo à escolha', atq: true, alc: '36 m', cls: ['Feiticeiro'] },
  { n: 'Fagulha Estelar', d: 'd8', t: 'radiante', atq: true, alc: '18 m', cls: ['Bardo', 'Druida'] },
  { n: 'Lasca Mental', d: 'd6', t: 'psíquico', res: 'INT', alc: '18 m', cls: ['Bruxo', 'Feiticeiro', 'Mago'] },
  { n: 'Palavra de Radiância', d: 'd6', t: 'radiante', res: 'CON', alc: '1,5 m', cls: ['Clérigo'] },
  { n: 'Produzir Chamas', d: 'd8', t: 'fogo', atq: true, alc: '18 m', cls: ['Druida'], tempo: 'Ação Bônus' },
  { n: 'Raio de Fogo', d: 'd10', t: 'fogo', atq: true, alc: '36 m', cls: ['Feiticeiro', 'Mago'] },
  { n: 'Raio de Gelo', d: 'd8', t: 'frio', atq: true, alc: '18 m', cls: ['Feiticeiro', 'Mago'], nota: 'Reduz o deslocamento em 3 m' },
  { n: 'Rajada de Veneno', d: 'd12', t: 'veneno', atq: true, alc: '9 m', cls: ['Bruxo', 'Druida', 'Feiticeiro', 'Mago'] },
  { n: 'Rajada Mística', d: 'd10', t: 'energia', atq: true, alc: '36 m', cls: ['Bruxo'], raios: true },
  { n: 'Respingo Ácido', d: 'd6', t: 'ácido', res: 'DES', alc: '18 m', cls: ['Feiticeiro', 'Mago'], nota: 'Esfera de 1,5 m' },
  { n: 'Toque Arrepiante', d: 'd10', t: 'necrótico', atq: true, alc: 'Toque', cls: ['Bruxo', 'Feiticeiro', 'Mago'] },
  { n: 'Toque Chocante', d: 'd8', t: 'elétrico', atq: true, alc: 'Toque', cls: ['Feiticeiro', 'Mago'] },
  { n: 'Zombaria Viciosa', d: 'd6', t: 'psíquico', res: 'SAB', alc: '18 m', cls: ['Bardo'] },
  { n: 'Amizade', alc: '3 m', c: true, m: true, cls: ['Bardo', 'Bruxo', 'Feiticeiro', 'Mago'] },
  { n: 'Consertar', alc: 'Toque', m: true, tempo: '1 minuto', cls: ['Bardo', 'Clérigo', 'Druida', 'Feiticeiro', 'Mago'] },
  { n: 'Druidismo', alc: '9 m', cls: ['Druida'] },
  { n: 'Elementalismo', alc: '9 m', cls: ['Druida', 'Feiticeiro', 'Mago'] },
  { n: 'Golpe Certeiro', alc: 'Pessoal', m: true, cls: ['Bardo', 'Bruxo', 'Feiticeiro', 'Mago'] },
  { n: 'Ilusão Menor', alc: '9 m', m: true, cls: ['Bardo', 'Bruxo', 'Feiticeiro', 'Mago'] },
  { n: 'Luz', alc: 'Toque', m: true, cls: ['Bardo', 'Clérigo', 'Feiticeiro', 'Mago'] },
  { n: 'Luzes Dançantes', alc: '36 m', c: true, m: true, cls: ['Bardo', 'Feiticeiro', 'Mago'] },
  { n: 'Mãos Mágicas', alc: '9 m', cls: ['Bardo', 'Bruxo', 'Feiticeiro', 'Mago'] },
  { n: 'Mensagem', alc: '36 m', m: true, cls: ['Bardo', 'Druida', 'Feiticeiro', 'Mago'] },
  { n: 'Orientação', alc: 'Toque', c: true, cls: ['Clérigo', 'Druida'] },
  { n: 'Poupar os Moribundos', alc: '4,5 m', cls: ['Clérigo', 'Druida'] },
  { n: 'Prestidigitação', alc: '3 m', cls: ['Bardo', 'Bruxo', 'Feiticeiro', 'Mago'] },
  { n: 'Resistência', alc: 'Toque', c: true, cls: ['Clérigo', 'Druida'] },
  { n: 'Taumaturgia', alc: '9 m', cls: ['Clérigo'] },
];

// XP mínimo de cada nível (índice 0 = nível 1).
const XP_NIVEL = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];

// Magias preparadas por nível de classe.
const PREP_COMPLETO = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22];
const PREP_MEIO = [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15];
const PREPARADAS = {
  'Bardo': PREP_COMPLETO,
  'Clérigo': PREP_COMPLETO,
  'Druida': PREP_COMPLETO,
  'Feiticeiro': [2, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
  'Bruxo': [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
  'Mago': [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 18, 19, 21, 22, 23, 24, 25],
  'Paladino': PREP_MEIO,
  'Patrulheiro': PREP_MEIO,
};

// Níveis com Aumento no Valor de Atributo.
const ASI = { padrao: [4, 8, 12, 16], 'Guerreiro': [4, 6, 8, 12, 14, 16], 'Ladino': [4, 8, 10, 12, 16] };

// Características de classe por nível (o Aumento no Valor de Atributo é somado a partir de ASI).
const CARACTERISTICAS = {
  'Bárbaro': { 1: 'Fúria; Defesa sem Armadura; Maestria em Armas', 2: 'Sentido de Perigo; Ataque Descuidado',
    3: 'Subclasse de Bárbaro; Conhecimento Primitivo', 5: 'Ataque Extra; Movimento Rápido', 6: 'Característica de Subclasse',
    7: 'Instinto Selvagem; Salto Instintivo', 9: 'Golpe Brutal', 10: 'Característica de Subclasse', 11: 'Fúria Implacável',
    13: 'Golpe Brutal Aprimorado', 14: 'Característica de Subclasse', 15: 'Fúria Persistente', 17: 'Golpe Brutal Aprimorado',
    18: 'Poder Indomável', 19: 'Dádiva Épica', 20: 'Campeão Primitivo' },
  'Bardo': { 1: 'Inspiração de Bardo; Conjuração', 2: 'Especialização; Pau pra Toda Obra', 3: 'Subclasse de Bardo',
    5: 'Fonte de Inspiração', 6: 'Característica de Subclasse', 7: 'Contramágica', 9: 'Especialização', 10: 'Segredos Mágicos',
    14: 'Característica de Subclasse', 18: 'Inspiração Superior', 19: 'Dádiva Épica', 20: 'Palavras da Criação' },
  'Bruxo': { 1: 'Invocações Místicas; Magia de Pacto', 2: 'Astúcia Mágica', 3: 'Subclasse de Bruxo',
    6: 'Característica de Subclasse', 9: 'Contatar Patrono', 10: 'Característica de Subclasse',
    11: 'Arcana Mística (magia de 6º nível)', 13: 'Arcana Mística (magia de 7º nível)', 14: 'Característica de Subclasse',
    15: 'Arcana Mística (magia de 8º nível)', 17: 'Arcana Mística (magia de 9º nível)', 19: 'Dádiva Épica', 20: 'Mestre Místico' },
  'Clérigo': { 1: 'Conjuração; Ordem Divina', 2: 'Canalizar Divindade', 3: 'Subclasse de Clérigo', 5: 'Destruir Mortos-Vivos',
    6: 'Característica de Subclasse', 7: 'Golpes Abençoados', 10: 'Intervenção Divina', 14: 'Golpes Abençoados Aprimorados',
    17: 'Característica de Subclasse', 19: 'Dádiva Épica', 20: 'Intervenção Divina Superior' },
  'Druida': { 1: 'Conjuração; Druídico; Ordem Primal', 2: 'Forma Selvagem; Companheiro Selvagem', 3: 'Subclasse de Druida',
    5: 'Ressurgimento Selvagem', 6: 'Característica de Subclasse', 7: 'Fúria Elemental', 10: 'Característica de Subclasse',
    14: 'Característica de Subclasse', 15: 'Fúria Elemental Aprimorada', 18: 'Conjuração Bestial', 19: 'Dádiva Épica', 20: 'Arquidruida' },
  'Feiticeiro': { 1: 'Conjuração; Feitiçaria Inata', 2: 'Fonte de Magia; Metamagia', 3: 'Subclasse de Feiticeiro',
    5: 'Restauração Feiticeira', 6: 'Característica de Subclasse', 7: 'Encarnação Feiticeira', 10: 'Metamagia',
    14: 'Característica de Subclasse', 17: 'Metamagia', 18: 'Característica de Subclasse', 19: 'Dádiva Épica', 20: 'Apoteose Arcana' },
  'Guerreiro': { 1: 'Estilo de Luta; Retomar o Fôlego; Maestria em Armas', 2: 'Surto de Ação; Mente Tática',
    3: 'Subclasse de Guerreiro', 5: 'Ataque Extra; Mudança Tática', 7: 'Característica de Subclasse', 9: 'Indomável; Mestre Tático',
    10: 'Característica de Subclasse', 11: 'Dois Ataques Extras', 13: 'Indomável (2 usos); Ataques Estudados',
    15: 'Característica de Subclasse', 17: 'Surto de Ação (2 usos); Indomável (3 usos)', 18: 'Característica de Subclasse',
    19: 'Dádiva Épica', 20: 'Três Ataques Extras' },
  'Ladino': { 1: 'Especialização; Ataque Furtivo; Gíria de Ladrão; Maestria em Armas', 2: 'Ação Ardilosa',
    3: 'Subclasse de Ladino; Mira Firme', 5: 'Golpe Astuto; Esquiva Sobrenatural', 6: 'Especialização',
    7: 'Evasão; Talento Confiável', 9: 'Característica de Subclasse', 11: 'Golpe Astuto Aprimorado', 13: 'Característica de Subclasse',
    14: 'Golpes Desleais', 15: 'Mente Escorregadia', 17: 'Característica de Subclasse', 18: 'Elusivo', 19: 'Dádiva Épica', 20: 'Golpe de Sorte' },
  'Mago': { 1: 'Conjuração; Ritualista; Recuperação Arcana', 2: 'Estudioso', 3: 'Subclasse de Mago', 5: 'Memorizar Magia',
    6: 'Característica de Subclasse', 10: 'Característica de Subclasse', 14: 'Característica de Subclasse',
    18: 'Domínio de Magia', 19: 'Dádiva Épica', 20: 'Magias Assinatura' },
  'Monge': { 1: 'Artes Marciais; Defesa sem Armadura', 2: 'Foco do Monge; Movimento sem Armadura; Metabolismo Incomum',
    3: 'Subclasse de Monge; Desviar Ataques', 4: 'Queda Lenta', 5: 'Ataque Extra; Golpe Atordoante',
    6: 'Golpes Fortalecidos; Característica de Subclasse', 7: 'Evasão', 9: 'Movimento Acrobático', 10: 'Foco Elevado; Autorrestauração',
    11: 'Característica de Subclasse', 13: 'Desviar Energia', 14: 'Sobrevivente Disciplinado', 15: 'Foco Perfeito',
    17: 'Característica de Subclasse', 18: 'Defesa Superior', 19: 'Dádiva Épica', 20: 'Corpo e Mente' },
  'Paladino': { 1: 'Imposição das Mãos; Conjuração; Maestria em Armas', 2: 'Estilo de Luta; Golpe do Paladino',
    3: 'Canalizar Divindade; Subclasse de Paladino', 5: 'Ataque Extra; Corcel Fiel', 6: 'Aura de Proteção',
    7: 'Característica de Subclasse', 9: 'Abjurar Inimigos', 10: 'Aura de Coragem', 11: 'Golpes Radiantes', 14: 'Toque Restaurador',
    15: 'Característica de Subclasse', 18: 'Expansão de Aura', 19: 'Dádiva Épica', 20: 'Característica de Subclasse' },
  'Patrulheiro': { 1: 'Conjuração; Inimigo Favorito; Maestria em Armas', 2: 'Explorador Hábil; Estilo de Luta',
    3: 'Subclasse de Patrulheiro', 5: 'Ataque Extra', 6: 'Andarilho', 7: 'Característica de Subclasse', 9: 'Especialização',
    10: 'Incansável', 11: 'Característica de Subclasse', 13: 'Caçador Implacável', 14: 'Véu da Natureza',
    15: 'Característica de Subclasse', 17: 'Caçador Preciso', 18: 'Sentidos Selvagens', 19: 'Dádiva Épica', 20: 'Matador de Inimigos' },
};

const IDIOMAS_PADRAO = ['Anão', 'Dracônico', 'Élfico', 'Gigante', 'Gnômico', 'Goblin', 'Halfling', 'Língua de Sinais Comum', 'Orc'];
const IDIOMAS_RAROS = ['Abissal', 'Celestial', 'Dialeto Subterrâneo', 'Infernal', 'Primordial', 'Silvestre'];
const IDIOMA_CLASSE = { 'Druida': 'Druídico', 'Ladino': 'Gíria de Ladrão' };

// base = CA da armadura; des = máximo de Destreza somado; tipo = treinamento exigido;
// for = Força mínima (abaixo dela, −3 m de deslocamento); furt = desvantagem em Furtividade.
const ARMADURAS = {
  'Armadura Acolchoada': { tipo: 'leve', base: 11, des: 99, furt: true },
  'Armadura de Couro': { tipo: 'leve', base: 11, des: 99 },
  'Armadura de Couro Batido': { tipo: 'leve', base: 12, des: 99 },
  'Gibão de Peles': { tipo: 'media', base: 12, des: 2 },
  'Camisão de Malha': { tipo: 'media', base: 13, des: 2 },
  'Brunea': { tipo: 'media', base: 14, des: 2, furt: true },
  'Peitoral': { tipo: 'media', base: 14, des: 2 },
  'Meia Armadura': { tipo: 'media', base: 15, des: 2, furt: true },
  'Cota de Anéis': { tipo: 'pesada', base: 14, des: 0, furt: true },
  'Cota de Malha': { tipo: 'pesada', base: 16, des: 0, for: 13, furt: true },
  'Cota de Talas': { tipo: 'pesada', base: 17, des: 0, for: 15, furt: true },
  'Armadura de Placas': { tipo: 'pesada', base: 18, des: 0, for: 15, furt: true },
};

// Equipamento inicial: opções A, B (e C). armas entram na tabela; armadura/escudo calculam a CA.
const EQUIP_CLASSE = {
  'Bárbaro': [
    { itens: ['Machado Grande', '4 Machadinhas', 'Pacote de Explorador'], armas: ['Machado Grande', 'Machadinha'], po: 15 },
    { po: 75 },
  ],
  'Bardo': [
    { itens: ['Armadura de Couro', '2 Adagas', 'Instrumento Musical (à escolha)', 'Pacote de Artista'], armas: ['Adaga'], armadura: 'Armadura de Couro', po: 19 },
    { po: 90 },
  ],
  'Bruxo': [
    { itens: ['Armadura de Couro', 'Foice Curta', '2 Adagas', 'Foco Arcano (orbe)', 'Livro (conhecimento oculto)', 'Pacote de Estudioso'], armas: ['Foice Curta', 'Adaga'], armadura: 'Armadura de Couro', po: 15 },
    { po: 100 },
  ],
  'Clérigo': [
    { itens: ['Camisão de Malha', 'Escudo', 'Maça', 'Símbolo Sagrado', 'Pacote de Sacerdote'], armas: ['Maça'], armadura: 'Camisão de Malha', escudo: true, po: 7 },
    { po: 110 },
  ],
  'Druida': [
    { itens: ['Armadura de Couro', 'Escudo', 'Foice Curta', 'Foco Druídico (bordão)', 'Pacote de Explorador', 'Kit de Herbalismo'], armas: ['Foice Curta', 'Bordão'], armadura: 'Armadura de Couro', escudo: true, po: 9 },
    { po: 50 },
  ],
  'Feiticeiro': [
    { itens: ['Lança', '2 Adagas', 'Foco Arcano (cristal)', 'Pacote de Explorador de Masmorras'], armas: ['Lança', 'Adaga'], po: 28 },
    { po: 50 },
  ],
  'Guerreiro': [
    { itens: ['Cota de Malha', 'Espada Grande', 'Mangual', '8 Azagaias', 'Pacote de Explorador de Masmorras'], armas: ['Espada Grande', 'Mangual', 'Azagaia'], armadura: 'Cota de Malha', po: 4 },
    { itens: ['Armadura de Couro Batido', 'Cimitarra', 'Espada Curta', 'Arco Longo', '20 Flechas', 'Aljava', 'Pacote de Explorador de Masmorras'], armas: ['Cimitarra', 'Espada Curta', 'Arco Longo'], armadura: 'Armadura de Couro Batido', po: 11 },
    { po: 155 },
  ],
  'Ladino': [
    { itens: ['Armadura de Couro', '2 Adagas', 'Espada Curta', 'Arco Curto', '20 Flechas', 'Aljava', 'Ferramentas de Ladrão', 'Pacote de Assaltante'], armas: ['Adaga', 'Espada Curta', 'Arco Curto'], armadura: 'Armadura de Couro', po: 8 },
    { po: 100 },
  ],
  'Mago': [
    { itens: ['2 Adagas', 'Foco Arcano (bordão)', 'Túnica', 'Grimório', 'Pacote de Estudioso'], armas: ['Adaga', 'Bordão'], po: 5 },
    { po: 55 },
  ],
  'Monge': [
    { itens: ['Lança', '5 Adagas', 'Ferramenta de artesão ou instrumento (o escolhido)', 'Pacote de Explorador'], armas: ['Lança', 'Adaga', 'Ataque Desarmado'], po: 11 },
    { po: 50 },
  ],
  'Paladino': [
    { itens: ['Cota de Malha', 'Escudo', 'Espada Longa', '6 Azagaias', 'Símbolo Sagrado', 'Pacote de Sacerdote'], armas: ['Espada Longa', 'Azagaia'], armadura: 'Cota de Malha', escudo: true, po: 9 },
    { po: 150 },
  ],
  'Patrulheiro': [
    { itens: ['Armadura de Couro Batido', 'Cimitarra', 'Espada Curta', 'Arco Longo', '20 Flechas', 'Aljava', 'Foco Druídico (ramo de visco)', 'Pacote de Explorador'], armas: ['Cimitarra', 'Espada Curta', 'Arco Longo'], armadura: 'Armadura de Couro Batido', po: 7 },
    { po: 150 },
  ],
};

// Opção A do antecedente (a opção B é sempre 50 PO).
const EQUIP_ANTEC = {
  'Acólito': { itens: ['Suprimentos de Calígrafo', 'Livro (orações)', 'Símbolo Sagrado', 'Pergaminho (10 folhas)', 'Túnica'], po: 8 },
  'Andarilho': { itens: ['2 Adagas', 'Ferramentas de Ladrão', 'Kit de Jogo (qualquer)', 'Saco de Dormir', '2 Bolsas', 'Roupas de Viajante'], armas: ['Adaga'], po: 16 },
  'Artesão': { itens: ['Ferramentas de artesão (as escolhidas)', '2 Bolsas', 'Roupas de Viajante'], po: 32 },
  'Artista': { itens: ['Instrumento Musical (o escolhido)', '2 Fantasias', 'Espelho', 'Perfume', 'Roupas de Viajante'], po: 11 },
  'Charlatão': { itens: ['Kit de Falsificação', 'Fantasia', 'Roupas Finas'], po: 15 },
  'Criminoso': { itens: ['2 Adagas', 'Ferramentas de Ladrão', '2 Bolsas', 'Pé de Cabra', 'Roupas de Viajante'], armas: ['Adaga'], po: 16 },
  'Eremita': { itens: ['Bordão', 'Kit de Herbalismo', 'Saco de Dormir', 'Livro (filosofia)', 'Lâmpada', 'Óleo (3 frascos)', 'Roupas de Viajante'], armas: ['Bordão'], po: 16 },
  'Escriba': { itens: ['Suprimentos de Calígrafo', 'Roupas Finas', 'Lâmpada', 'Óleo (3 frascos)', 'Pergaminho (12 folhas)'], po: 23 },
  'Fazendeiro': { itens: ['Foice Curta', 'Ferramentas de Carpinteiro', 'Kit de Curandeiro', 'Pá', 'Panela de Ferro', 'Roupas de Viajante'], armas: ['Foice Curta'], po: 30 },
  'Guarda': { itens: ['Lança', 'Besta Leve', '20 Virotes', 'Aljava', 'Kit de Jogo (o escolhido)', 'Lanterna Coberta', 'Algemas', 'Roupas de Viajante'], armas: ['Lança', 'Besta Leve'], po: 12 },
  'Guia': { itens: ['Arco Curto', '20 Flechas', 'Aljava', 'Ferramentas de Cartógrafo', 'Saco de Dormir', 'Tenda', 'Roupas de Viajante'], armas: ['Arco Curto'], po: 3 },
  'Marinheiro': { itens: ['Adaga', 'Ferramentas de Navegador', 'Corda', 'Roupas de Viajante'], armas: ['Adaga'], po: 20 },
  'Mercador': { itens: ['Ferramentas de Navegador', '2 Bolsas', 'Roupas de Viajante'], po: 22 },
  'Nobre': { itens: ['Kit de Jogo (o escolhido)', 'Roupas Finas', 'Perfume'], po: 29 },
  'Sábio': { itens: ['Bordão', 'Suprimentos de Calígrafo', 'Livro (história)', 'Pergaminho (8 folhas)', 'Túnica'], armas: ['Bordão'], po: 8 },
  'Soldado': { itens: ['Lança', 'Arco Curto', '20 Flechas', 'Kit de Jogo (o escolhido)', 'Kit de Curandeiro', 'Aljava', 'Roupas de Viajante'], armas: ['Lança', 'Arco Curto'], po: 14 },
};
