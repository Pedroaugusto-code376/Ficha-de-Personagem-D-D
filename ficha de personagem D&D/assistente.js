// Assistente: janelas que aparecem após cada escolha (classe, espécie, antecedente, nível)
// com as opções necessárias para calcular a ficha.

const wz = document.getElementById('wizard');
const wzBody = document.getElementById('wzBody');
let wzSections = [];

const SKILL_NAMES = Object.fromEntries(ATRIBUTOS.flatMap((a) => a.pericias));
const ATTR_NAMES = Object.fromEntries(ATRIBUTOS.map((a) => [a.id, a.nome]));
const HAB_CONJ = ['int', 'sab', 'car'];
const HAB_INICIADO = { 'Clérigo': 'sab', 'Druida': 'sab', 'Mago': 'int' };

const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const rollDie = (faces) => 1 + Math.floor(Math.random() * faces);
const picked = (root, name) => [...root.querySelectorAll(`input[name="${name}"]:checked`)].map((i) => i.value);
const tier = (nivel) => (nivel >= 17 ? 4 : nivel >= 11 ? 3 : nivel >= 5 ? 2 : 1);
const findWeapon = (n) => ARMAS.find((w) => w.n === n);
const findTruque = (n) => TRUQUES.find((t) => t.n === n);
const attrOptions = () => ATRIBUTOS.map((a) => `<option value="${a.id}">${a.nome}</option>`).join('');
let uid = 0;
const uname = (base) => `${base}_${++uid}`;

// ---------- origem do que foi preenchido ----------
// Cada escolha (classe, espécie, antecedente) anota o que colocou na ficha, para que possa ser
// removido ao trocar: campos (com o valor anterior), linhas de texto, linhas de tabela e somas (PO, atributos).
let ledger = {};
let fonte = null;
const NAO_REGISTRAR = new Set(['ca', 'nivel', 'nivel_aplicado', 'classe', 'especie', 'antecedente', 'subclasse']);
const SOMA = (name) => name === 'po' || name.startsWith('attr_');
const TABELA_DE = { classe: CLASSES, especie: ESPECIES, antecedente: ANTECEDENTES };
const ROTULO = { classe: 'a classe', especie: 'a espécie', antecedente: 'o antecedente' };

function comFonte(f, fn) {
  const antes = fonte;
  fonte = f;
  try { return fn(); } finally { fonte = antes; }
}
const registro = () => (ledger[fonte] ||= {});

function registrarCampo(name, antigo, novo) {
  if (!fonte || NAO_REGISTRAR.has(name)) return;
  const r = registro();
  if (SOMA(name)) {
    r.somas ||= {};
    r.somas[name] = (r.somas[name] || 0) + (Number(novo) || 0) - (Number(antigo) || 0);
    return;
  }
  r.campos ||= {};
  if (!(name in r.campos)) r.campos[name] = antigo;
}

function registrarLinhas(name, linhas) {
  if (!fonte || !linhas.length) return;
  const r = registro();
  r.linhas ||= {};
  (r.linhas[name] ||= []).push(...linhas);
}

function registrarLinhaTabela(tabela, chave) {
  if (fonte) (registro()[tabela] ||= []).push(chave);
}

// "Característica de Campeão" e "Característica de Subclasse" contam como a mesma linha
const normalLinha = (l) => l.trim().replace(/Característica de [^;]+/g, 'Característica de Subclasse');

function desfazer(f) {
  const r = ledger[f];
  delete ledger[f];
  if (!r) return;
  comFonte(null, () => {
    for (const [name, linhas] of Object.entries(r.linhas || {})) {
      const tirar = new Set(linhas.map(normalLinha));
      setField(name, val(name).split('\n').filter((l) => !tirar.has(normalLinha(l))).join('\n'));
    }
    for (const [tabela, col] of [['tblArmas', 'ref'], ['tblMagias', 'nome']]) {
      const chaves = new Set(r[tabela] || []);
      rowsOf(tabela).forEach((tr) => { if (chaves.has(tr.querySelector(`[data-col=${col}]`).value.trim())) tr.remove(); });
    }
    for (const [name, d] of Object.entries(r.somas || {})) {
      const atual = Number(val(name)) || (name === 'po' ? 0 : 10);
      setField(name, name === 'po' ? Math.max(0, atual - d) || '' : Math.max(1, atual - d));
    }
    for (const [name, v] of Object.entries(r.campos || {})) {
      if (/^(save|skill)_/.test(name)) setProf(name, v || 0);
      else setField(name, v);
    }
  });
  scheduleLayout();
}

const APLICAR = { classe: (v) => applyClass(v), especie: (v) => applySpecies(v), antecedente: (v) => applyBackground(v) };

// troca classe/espécie/antecedente: remove o que a escolha anterior preencheu e aplica a nova
function trocar(campo, novo, confirmar = true) {
  const atual = ledger[campo];
  const anterior = atual?.nome ?? '';
  if (novo === anterior) return;
  if (confirmar && atual && !atual.legado && !confirm(`Trocar ${ROTULO[campo]} de "${anterior}" para "${novo || '(nenhum)'}"?\n\nTudo o que "${anterior}" preencheu na ficha será removido.`)) {
    form.elements[campo].value = anterior;
    return;
  }
  if (atual?.legado && anterior) toast(`Ficha antiga: o que "${anterior}" preencheu não pôde ser removido automaticamente.`);
  desfazer(campo);
  if (campo === 'classe') {
    const sub = val('subclasse').trim();
    if (sub && !CLASSES[novo]?.sub.includes(sub)) { form.elements.subclasse.value = ''; applySubclass(''); }
    updateSubclassList();
  }
  if (TABELA_DE[campo][novo]) {
    ledger[campo] = { nome: novo };
    comFonte(campo, () => APLICAR[campo](novo));
  }
}

function refazer(campo) {
  const v = val(campo).trim();
  if (!TABELA_DE[campo][v]) return toast(`Escolha ${ROTULO[campo].replace(/^(a|o) /, (m) => (m === 'a ' ? 'uma ' : 'um '))} da lista primeiro.`);
  desfazer(campo);
  ledger[campo] = { nome: v };
  comFonte(campo, () => APLICAR[campo](v));
}

// janela dos botões da barra: mostra as opções com um resumo; escolher outra troca,
// escolher a mesma refaz as escolhas dela
function escolherWizard(campo) {
  const classe = val('classe').trim();
  if (campo === 'subclasse' && !CLASSES[classe]) return toast('Escolha uma classe da lista primeiro.');
  const atual = val(campo).trim();
  const opcoes = {
    classe: () => Object.entries(CLASSES).map(([n, c]) => ({ value: n, info: `d${c.dv} · ${c.princ}${c.magia ? ' · conjurador' : ''}` })),
    especie: () => Object.entries(ESPECIES).map(([n, e]) => ({ value: n, info: `${e.tam} · ${e.desl}` })),
    antecedente: () => Object.entries(ANTECEDENTES).map(([n, b]) => ({ value: n, info: `${b.attrs.map((a) => ATTR_NAMES[a]).join(', ')} · ${b.talento}` })),
    subclasse: () => CLASSES[classe].sub.map((n) => ({ value: n, info: '' })),
  }[campo]().map((o) => ({ ...o, label: o.value, checked: o.value === atual }));
  const nm = uname('esc');
  const titulos = { classe: 'Classe', especie: 'Espécie', antecedente: 'Antecedente', subclasse: `Subclasse de ${classe}` };
  openWizard(titulos[campo], [{
    titulo: atual ? `Atual: ${atual}` : 'Escolha uma opção',
    ajuda: campo === 'subclasse'
      ? 'A subclasse aparece no nome das características de subclasse.'
      : 'Escolher outra opção remove da ficha o que a anterior preencheu e aplica a nova. Escolher a mesma refaz as escolhas dela.',
    html: chips(nm, opcoes, 0, 'radio'),
    validate(el) { if (!picked(el, nm).length) return 'Escolha uma opção.'; },
    apply(el) {
      const v = picked(el, nm)[0];
      // espera a janela fechar: a troca pode abrir as janelas de escolha da nova opção
      setTimeout(() => {
        form.elements[campo].value = v;
        if (campo === 'subclasse') applySubclass(v);
        else if (v === ledger[campo]?.nome) refazer(campo);
        else trocar(campo, v, false);
        onChange();
      });
    },
  }]);
}

// a subclasse só aparece no nome das características de subclasse
function applySubclass(novo) {
  const de = `Característica de ${ledger.subclasse?.nome || 'Subclasse'}`;
  const para = `Característica de ${novo || 'Subclasse'}`;
  if (de !== para) comFonte(null, () => setField('caracteristicas_classe', val('caracteristicas_classe').split(de).join(para)));
  ledger.subclasse = { nome: novo };
}

// ---------- cálculos ----------
function ctx() {
  const nivel = Math.min(20, Math.max(1, Number(val('nivel')) || 1));
  const mods = {};
  for (const a of ATRIBUTOS) mods[a.id] = mod(val(`attr_${a.id}`));
  return { nivel, prof: 2 + Math.floor((nivel - 1) / 4), mods, classe: val('classe').trim() };
}

function weaponProficient(w, classe) {
  const c = CLASSES[classe];
  if (!c || w.cat === 'simples') return true;
  if (c.marciais === 'todas') return true;
  if (c.marciais === 'acuidade_leve') return w.p.includes('Acuidade') || w.p.includes('Leve');
  if (c.marciais === 'leve') return w.p.includes('Leve');
  return false;
}

function weaponCalc(w, c) {
  const monge = c.classe === 'Monge';
  const desarmado = w.n === 'Ataque Desarmado';
  let dado = w.d;
  if (desarmado && monge) dado = '1' + ['d6', 'd8', 'd10', 'd12'][tier(c.nivel) - 1];
  // Artes Marciais do Monge: pode usar Destreza com desarmado, armas simples e marciais Leves corpo a corpo
  const acuidade = w.p.includes('Acuidade') ||
    (monge && w.tipo === 'cac' && (desarmado || w.cat === 'simples' || w.p.includes('Leve')));
  const m = w.tipo === 'dist' ? c.mods.des : acuidade ? Math.max(c.mods.for, c.mods.des) : c.mods.for;
  const prof = weaponProficient(w, c.classe);
  return {
    prof,
    bonus: fmt(m + (prof ? c.prof : 0)),
    dano: dado === '1' ? `${Math.max(1, 1 + m)} ${w.t}` : `${dado}${m ? fmt(m) : ''} ${w.t}`,
  };
}

function cantripCalc(t, hab, c) {
  const ab = hab || val('conj_hab');
  const m = ab ? c.mods[ab] : 0;
  const n = tier(c.nivel);
  return {
    bonus: t.atq ? fmt(c.prof + m) : `CD ${8 + c.prof + m} (${t.res})`,
    dano: t.raios ? `${n} raio${n > 1 ? 's' : ''} de 1${t.d} ${t.t}` : `${n}${t.d} ${t.t}`,
  };
}

function breathCalc(tipo, c) {
  return { bonus: `CD ${8 + c.mods.con + c.prof} (DES)`, dano: `${tier(c.nivel)}d10 ${tipo}` };
}

// ref de uma linha: "arma:Nome" | "truque:Nome[:hab]" | "sopro:tipo"
function refCalc(ref, c) {
  const [k, a, b] = ref.split(':');
  if (k === 'arma') { const w = findWeapon(a); return w && weaponCalc(w, c); }
  if (k === 'truque') { const t = findTruque(a); return t && cantripCalc(t, b, c); }
  if (k === 'sopro') return breathCalc(a, c);
}

function updateRefRows() {
  const c = ctx();
  rowsOf('tblArmas').forEach((tr) => {
    const ref = tr.querySelector('[data-col=ref]')?.value;
    const r = ref && refCalc(ref, c);
    tr.classList.toggle('auto', !!r);
    if (!r) return;
    tr.querySelector('[data-col=bonus]').value = r.bonus;
    tr.querySelector('[data-col=dano]').value = r.dano;
  });
}

function calcCA(mods) {
  const arm = ARMADURAS[val('armadura')];
  const classe = val('classe').trim();
  let ca = arm ? arm.base + Math.min(mods.des, arm.des)
    : classe === 'Bárbaro' ? 10 + mods.des + mods.con
    : classe === 'Monge' ? 10 + mods.des + mods.sab
    : 10 + mods.des;
  if (form.elements.escudo.checked) ca += 2;
  return ca;
}

function slotsFor(c, n) {
  if (c.magia === 'completo') return ESPACOS_COMPLETO[n - 1];
  if (c.magia === 'meio') return ESPACOS_COMPLETO[Math.ceil(n / 2) - 1];
  if (c.magia === 'pacto') {
    const lv = Math.min(5, Math.ceil(n / 2));
    const s = Array(lv).fill(0);
    s[lv - 1] = n >= 17 ? 4 : n >= 11 ? 3 : n >= 2 ? 2 : 1;
    return s;
  }
  return [];
}

function applySlots() {
  const c = CLASSES[val('classe').trim()];
  if (!c || !c.magia) return;
  const s = slotsFor(c, ctx().nivel);
  for (let i = 1; i <= 9; i++) setField(`slot_total_${i}`, s[i - 1] || '');
}

const nivelPorXP = (xp) => XP_NIVEL.filter((v) => xp >= v).length || 1;
const niveisASI = (classe) => ASI[classe] || ASI.padrao;
const niveisEscolha = (classe) => [...niveisASI(classe), 19];

// adiciona as características da classe dos níveis de..ate
function appendFeatures(classe, de, ate) {
  const lista = CARACTERISTICAS[classe];
  if (!lista) return;
  const sub = val('subclasse').trim();
  const linhas = [];
  for (let l = Math.max(1, de); l <= ate; l++) {
    let nomes = [lista[l], niveisASI(classe).includes(l) ? 'Aumento no Valor de Atributo' : ''].filter(Boolean).join('; ');
    if (sub) nomes = nomes.replace(/Característica de Subclasse/g, `Característica de ${sub}`);
    if (nomes) linhas.push(`Nv ${l} — ${nomes}`);
  }
  appendLines('caracteristicas_classe', linhas);
}

// ---------- linhas das tabelas ----------
function placeRow(tableId, data) {
  const rows = rowsOf(tableId);
  const same = (tr, col, v) => tr.querySelector(`[data-col=${col}]`)?.value.trim() === v;
  if (data.ref ? rows.some((tr) => same(tr, 'ref', data.ref)) : rows.some((tr) => same(tr, 'nome', data.nome))) return;
  const empty = rows.find((tr) => [...tr.querySelectorAll('[data-col]')]
    .filter((i) => i.type !== 'checkbox' && i.type !== 'hidden').every((i) => !i.value));
  if (empty) fillRow(empty, data);
  else addRow(tableId, data);
  registrarLinhaTabela(tableId, data.ref || data.nome);
  if (tableId === 'tblMagias') sortSpells();
}

// truques primeiro, depois magias por nível; linhas vazias no fim
function sortSpells() {
  const ordem = (tr) => {
    const nome = tr.querySelector('[data-col=nome]').value.trim();
    const n = tr.querySelector('[data-col=nivel]').value;
    if (!nome && !n) return 99;
    return n === 'T' ? 0 : Number(n) || 50;
  };
  const rows = rowsOf('tblMagias');
  const sorted = rows.map((r, i) => [r, ordem(r), i]).sort((a, b) => a[1] - b[1] || a[2] - b[2]).map((x) => x[0]);
  if (sorted.every((r, i) => r === rows[i])) return;
  const tbody = document.querySelector('#tblMagias tbody');
  sorted.forEach((r) => tbody.appendChild(r));
  scheduleLayout();
}

function addWeaponRef(w, maestria) {
  const notas = [...w.p, maestria && w.m ? `Maestria: ${w.m}` : ''].filter(Boolean).join(', ');
  placeRow('tblArmas', { nome: w.n, notas, ref: `arma:${w.n}` });
}

// origem: 'classe' | 'especie' | 'talento' | 'extra' — usada para contar os truques da classe
function addCantrip(t, hab = '', origem = 'extra') {
  if (!t) return;
  placeRow('tblMagias', {
    nivel: 'T', nome: t.n, tempo: t.tempo || 'Ação', alcance: t.alc, c: !!t.c, m: !!t.m, origem,
    notas: [t.nota, hab ? `usa ${ATTR_NAMES[hab]}` : ''].filter(Boolean).join(' · '),
  });
  if (t.d) placeRow('tblArmas', { nome: t.n, notas: t.nota || '', ref: `truque:${t.n}${hab ? ':' + hab : ''}` });
}

const spellNames = () => rowsOf('tblMagias').map((tr) => tr.querySelector('[data-col=nome]').value.trim());
const magiasPreparadas = () => rowsOf('tblMagias').filter((tr) =>
  tr.querySelector('[data-col=nome]').value.trim() && /^[1-9]$/.test(tr.querySelector('[data-col=nivel]').value)).length;
const truquesConhecidos = (c, nivel) => c.truques + (nivel >= 4) + (nivel >= 10);

// quantos truques da classe a ficha já tem
function truquesDaClasse(classe) {
  const lista = new Set(TRUQUES.filter((t) => t.cls.includes(classe)).map((t) => t.n));
  return rowsOf('tblMagias').filter((tr) => {
    const get = (col) => tr.querySelector(`[data-col=${col}]`)?.value.trim() || '';
    const origem = get('origem');
    if (origem) return origem === 'classe';
    // fichas antigas, sem origem: truque da lista da classe que não veio de espécie/talento ("usa X" nas notas)
    return get('nivel').toUpperCase() === 'T' && lista.has(get('nome')) && !get('notas').includes('usa ');
  }).length;
}

function applyEquip(o, defineCA) {
  if (o.itens) appendLines('equipamento', o.itens);
  if (o.po) setField('po', (Number(val('po')) || 0) + o.po);
  (o.armas || []).forEach((n) => { const w = findWeapon(n); if (w) addWeaponRef(w, false); });
  if (defineCA && o.itens) {
    setField('armadura', o.armadura || '');
    setField('escudo', !!o.escudo);
    setField('ca_auto', '1');
  }
}

function bump(a, n, max) {
  setField(`attr_${a}`, Math.min(max, (Number(val(`attr_${a}`)) || 10) + n));
}

// ---------- janela ----------
function chips(name, opts, max = 0, type = 'checkbox') {
  return `<div class="chips"${max ? ` data-max="${max}"` : ''}>${opts.map((o) => `
    <label class="chip${o.disabled ? ' off' : ''}">
      <input type="${type}" name="${name}" value="${esc(o.value)}"${o.checked ? ' checked' : ''}${o.disabled ? ' disabled' : ''}>
      <span>${esc(o.label)}${o.info ? `<small>${esc(o.info)}</small>` : ''}</span>
    </label>`).join('')}</div>`;
}

// cada seção: { titulo, ajuda?, limite?, html, init?(el), validate?(el) -> erro, apply(el) }
// o que a janela aplicar fica registrado na origem ativa quando ela abriu (classe, espécie...)
let wzFonte = null;
function openWizard(titulo, sections) {
  sections = sections.filter(Boolean);
  if (!sections.length || wz.open) return;
  wzFonte = fonte;
  document.getElementById('wzTitle').textContent = titulo;
  wzBody.innerHTML = '';
  wzSections = sections.map((s) => {
    const el = document.createElement('section');
    el.className = 'wz-sec';
    el.innerHTML = `<h3>${esc(s.titulo)}${s.limite ? '<span class="count"></span>' : ''}</h3>`
      + (s.ajuda ? `<p class="help">${s.ajuda}</p>` : '') + s.html;
    wzBody.appendChild(el);
    s.init?.(el);
    return { s, el };
  });
  updateCounts();
  wz.showModal();
  wzBody.scrollTop = 0;
}

function updateCounts() {
  for (const { el } of wzSections) {
    const box = el.querySelector('.chips[data-max]');
    const out = el.querySelector('h3 .count');
    if (box && out) out.textContent = `${box.querySelectorAll('input:checked').length}/${box.dataset.max}`;
  }
}

wzBody.addEventListener('change', (e) => {
  const box = e.target.closest('.chips[data-max]');
  if (box && e.target.checked && box.querySelectorAll('input:checked').length > Number(box.dataset.max)) {
    e.target.checked = false;
    toast(`Escolha no máximo ${box.dataset.max}.`);
  }
  updateCounts();
});

document.getElementById('wzApply').addEventListener('click', () => {
  for (const { s, el } of wzSections) {
    const erro = s.validate?.(el);
    if (erro) { toast(erro); el.scrollIntoView({ block: 'nearest' }); return; }
  }
  comFonte(wzFonte, () => { for (const { s, el } of wzSections) s.apply(el); });
  wz.close();
  onChange();
  layout();
  toast('Escolhas aplicadas à ficha.');
});
document.getElementById('wzSkip').addEventListener('click', () => wz.close());
document.getElementById('wzClose').addEventListener('click', () => wz.close());

// ---------- seções reutilizáveis ----------
function secOne(titulo, opts, onApply, ajuda = '') {
  const nm = uname('one');
  return {
    titulo, ajuda,
    html: chips(nm, opts.map((o, i) => ({ ...o, checked: i === 0 })), 0, 'radio'),
    apply(el) { const v = picked(el, nm)[0]; if (v) onApply(v); },
  };
}

function secPericias(n, lista, titulo) {
  const nm = uname('per');
  const ids = lista === 'qualquer' ? Object.keys(SKILL_NAMES) : lista;
  return {
    titulo, limite: true, ajuda: `Escolha ${n}. Perícias em que você já é proficiente aparecem desativadas.`,
    html: chips(nm, ids.map((id) => {
      const ja = val(`skill_${id}`) !== '0';
      return { value: id, label: SKILL_NAMES[id], disabled: ja, info: ja ? 'já proficiente' : '' };
    }), n),
    apply(el) { picked(el, nm).forEach((id) => setProf(`skill_${id}`, 1)); },
  };
}

function secFerramentas(n, tipo) {
  const nm = uname('ferr');
  const lista = tipo === 'artesao_ou_instrumento' ? [...FERRAMENTAS.artesao, ...FERRAMENTAS.instrumento] : FERRAMENTAS[tipo];
  return {
    titulo: `Ferramentas: escolha ${n}`, limite: true,
    html: chips(nm, lista.map((f) => ({ value: f, label: f })), n),
    apply(el) { appendLines('prof_ferramentas', picked(el, nm)); },
  };
}

function secIdiomas() {
  const nm = uname('idi');
  const ja = val('idiomas');
  return {
    titulo: 'Idiomas: Comum + 2 à escolha', limite: true,
    ajuda: 'Todo personagem fala Comum e mais dois idiomas. Os idiomas raros dependem da permissão do Mestre.',
    html: chips(nm, [
      ...IDIOMAS_PADRAO.map((i) => ({ value: i, label: i })),
      ...IDIOMAS_RAROS.map((i) => ({ value: i, label: i, info: 'raro' })),
    ].map((o) => (ja.includes(o.value) ? { ...o, disabled: true, info: 'já conhecido' } : o)), 2),
    apply(el) { appendLines('idiomas', ['Comum', ...picked(el, nm)]); },
  };
}

function secEquip(titulo, opcoes, defineCA) {
  const nm = uname('eq');
  return {
    titulo,
    ajuda: 'Os itens vão para Equipamento, o ouro para Moedas e as armas para a tabela de armas'
      + (defineCA ? '; a armadura e o escudo definem a Classe de Armadura.' : '.'),
    html: chips(nm, opcoes.map((o, i) => ({
      value: i, checked: i === 0,
      label: `Opção ${'ABC'[i]}`,
      info: [...(o.itens || []), `${o.po} PO`].join(', '),
    })), 0, 'radio'),
    apply(el) { applyEquip(opcoes[Number(picked(el, nm)[0])], defineCA); },
  };
}

function secMaestria(n) {
  const c = ctx();
  const nm = uname('mae');
  return {
    titulo: `Maestria em armas: escolha ${n}`, limite: true,
    ajuda: 'Você pode usar a propriedade de maestria dessas armas. Elas entram na tabela de armas com bônus de ataque e dano calculados.',
    html: chips(nm, ARMAS.filter((w) => w.m && weaponProficient(w, c.classe)).map((w) => {
      const r = weaponCalc(w, c);
      return { value: w.n, label: w.n, info: `${r.bonus} · ${r.dano} · ${w.m}` };
    }), n),
    apply(el) { picked(el, nm).forEach((x) => addWeaponRef(findWeapon(x), true)); },
  };
}

function secTruques(classe, n, opts = {}) {
  const c = ctx();
  const nm = uname('tru');
  const nh = uname('hab');
  const ja = new Set(spellNames());
  const habPadrao = opts.hab || HAB_CONJ[0];
  return {
    titulo: opts.titulo || `Truques de ${classe}: escolha ${n}`, limite: true,
    ajuda: 'Truques de dano também entram na tabela de Armas e Truques de Dano, com bônus/CD e dano calculados.',
    html: (opts.escolherHab
      ? `<h4>Habilidade de conjuração</h4>${chips(nh, HAB_CONJ.map((a) => ({ value: a, label: ATTR_NAMES[a], checked: a === habPadrao })), 0, 'radio')}<h4>Truques</h4>`
      : '')
      + chips(nm, TRUQUES.filter((t) => t.cls.includes(classe)).map((t) => {
        let info = 'utilidade';
        if (ja.has(t.n)) info = 'já conhecido';
        else if (t.d) { const r = cantripCalc(t, opts.escolherHab ? habPadrao : '', c); info = `${r.bonus} · ${r.dano}`; }
        return { value: t.n, label: t.n, info, disabled: ja.has(t.n) };
      }), n),
    apply(el) {
      const hab = opts.escolherHab ? picked(el, nh)[0] : '';
      picked(el, nm).forEach((x) => addCantrip(findTruque(x), hab, opts.origem));
    },
  };
}

function secTruquesFaltando(classe, titulo) {
  const c = CLASSES[classe];
  if (!c?.truques) return null;
  const faltam = truquesConhecidos(c, ctx().nivel) - truquesDaClasse(classe);
  if (faltam <= 0) return null;
  return secTruques(classe, faltam, {
    origem: 'classe',
    titulo: titulo ? `${titulo}: escolha ${faltam}` : undefined,
  });
}

function secMagias(classe) {
  const c = CLASSES[classe];
  if (!c?.magia) return null;
  const { nivel } = ctx();
  const max = PREPARADAS[classe][nivel - 1];
  const tem = magiasPreparadas();
  const faltam = max - tem;
  if (faltam <= 0) return null;
  const nmax = slotsFor(c, nivel).length;
  const nm = uname('mag');
  const ja = new Set(spellNames());
  const lista = MAGIAS.filter((s) => s.nv >= 1 && s.nv <= nmax && s.cls.includes(classe))
    .sort((a, b) => a.nv - b.nv || a.n.localeCompare(b.n));
  return {
    titulo: `Magias preparadas: ${tem} de ${max} — escolha ${faltam}`, limite: true,
    ajuda: `Magias de ${classe} do 1º ao ${nmax}º nível. Para ler a explicação de cada uma, use o botão <strong>+ Magia</strong> no quadro de magias.`,
    html: chips(nm, lista.map((s) => ({
      value: s.n, label: s.n, disabled: ja.has(s.n),
      info: ja.has(s.n) ? 'já na ficha' : `${s.nv}º nível · ${s.esc}${/^Concentração/.test(s.dur) ? ' · Concentração' : ''}`,
    })), faltam),
    apply(el) { picked(el, nm).forEach((n) => linhaMagia(findMagia(n))); },
  };
}

function secASI(lv) {
  if (lv === 19) {
    return {
      titulo: 'Nível 19: Dádiva Épica',
      ajuda: 'Escolha um talento de Dádiva Épica. Ele também aumenta um atributo em 1 (máximo 30).',
      html: `<div class="row-sel"><label>Dádiva<input class="feat" placeholder="Nome da dádiva"></label><label>+1 em<select class="a1">${attrOptions()}</select></label></div>`,
      apply(el) {
        const f = el.querySelector('.feat').value.trim();
        if (f) appendLines('talentos', [`${f} (Dádiva Épica)`]);
        bump(el.querySelector('.a1').value, 1, 30);
      },
    };
  }
  const nm = uname('asi');
  return {
    titulo: `Nível ${lv}: Aumento no Valor de Atributo`,
    ajuda: 'Aumente um atributo em 2 ou dois atributos em 1 (máximo 20), ou escolha um talento no lugar.',
    html: chips(nm, [
      { value: '2', label: '+2 em um atributo', checked: true },
      { value: '11', label: '+1 em dois atributos' },
      { value: 't', label: 'Talento' },
    ], 0, 'radio')
      + `<div class="row-sel asi-a"><label>Atributo<select class="a1">${attrOptions()}</select></label>`
      + `<label class="asi-b">Segundo atributo<select class="a2">${attrOptions()}</select></label></div>`
      + '<div class="row-sel asi-t"><label>Talento<input class="feat" placeholder="Nome do talento"></label></div>',
    init(el) {
      el.querySelector('.a2').selectedIndex = 1;
      const upd = () => {
        const m = picked(el, nm)[0];
        el.querySelector('.asi-a').hidden = m === 't';
        el.querySelector('.asi-b').hidden = m !== '11';
        el.querySelector('.asi-t').hidden = m !== 't';
      };
      el.addEventListener('change', upd);
      upd();
    },
    validate(el) {
      const m = picked(el, nm)[0];
      if (m === '11' && el.querySelector('.a1').value === el.querySelector('.a2').value) return 'Escolha dois atributos diferentes.';
      if (m === 't' && !el.querySelector('.feat').value.trim()) return `Escreva o nome do talento do nível ${lv}.`;
    },
    apply(el) {
      const m = picked(el, nm)[0];
      if (m === 't') return appendLines('talentos', [`${el.querySelector('.feat').value.trim()} (nível ${lv})`]);
      bump(el.querySelector('.a1').value, m === '2' ? 2 : 1, 20);
      if (m === '11') bump(el.querySelector('.a2').value, 1, 20);
    },
  };
}

function secPV() {
  const c = CLASSES[val('classe').trim()];
  if (!c) return null;
  const nm = uname('pv');
  const media = c.dv / 2 + 1;
  return {
    titulo: `Pontos de Vida (d${c.dv} por nível)`,
    ajuda: 'No 1º nível você recebe o valor máximo do dado. Nos níveis seguintes, use a média fixa ou role o dado. O modificador de Constituição é somado em cada nível.',
    html: chips(nm, [
      { value: 'media', label: 'Média fixa', info: `${media} por nível`, checked: true },
      { value: 'rolar', label: 'Rolar o dado', info: `1d${c.dv} por nível` },
    ], 0, 'radio') + '<div class="pv-rolls"></div><p class="pv-total"></p>',
    init(el) {
      const rolls = el.querySelector('.pv-rolls');
      const out = el.querySelector('.pv-total');
      const total = () => {
        const { nivel, mods } = ctx();
        const usarMedia = picked(el, nm)[0] === 'media';
        let t = Math.max(1, c.dv + mods.con);
        const linhas = [`Nível 1: ${c.dv} ${fmt(mods.con)} CON = ${t}`];
        let resto = 0;
        for (let n = 2; n <= nivel; n++) {
          const d = usarMedia ? media : Number(rolls.querySelector(`input[data-n="${n}"]`)?.value) || 0;
          resto += Math.max(1, d + mods.con);
        }
        if (nivel > 1) linhas.push(`Níveis 2–${nivel}: ${usarMedia ? `${nivel - 1} × (${media} ${fmt(mods.con)} CON)` : `rolagens ${fmt(mods.con)} CON cada`} = ${resto}`);
        t += resto;
        el.dataset.total = t;
        out.innerHTML = `${linhas.join('<br>')}<br><strong>PV máximo: ${t}</strong>`;
      };
      const build = () => {
        const { nivel } = ctx();
        rolls.innerHTML = picked(el, nm)[0] !== 'rolar' || nivel < 2 ? '' :
          '<button type="button" class="wz-mini roll-all">🎲 Rolar todos</button>'
          + Array.from({ length: nivel - 1 }, (_, i) => i + 2).map((n) => `
            <div class="roll">Nível ${n}
              <input type="number" min="1" max="${c.dv}" data-n="${n}">
              <button type="button" class="roll-one" data-n="${n}" title="Rolar 1d${c.dv}">🎲</button>
            </div>`).join('');
        total();
      };
      el.addEventListener('change', (e) => (e.target.name === nm ? build() : total()));
      el.addEventListener('input', total);
      el.addEventListener('click', (e) => {
        if (e.target.matches('.roll-one')) rolls.querySelector(`input[data-n="${e.target.dataset.n}"]`).value = rollDie(c.dv);
        else if (e.target.matches('.roll-all')) rolls.querySelectorAll('input').forEach((i) => (i.value = rollDie(c.dv)));
        else return;
        total();
      });
      build();
    },
    validate(el) {
      if ([...el.querySelectorAll('.pv-rolls input')].some((i) => !i.value)) return 'Role ou preencha os PV de todos os níveis.';
    },
    apply(el) {
      const antigo = val('pv_max');
      setField('pv_max', el.dataset.total);
      if (!val('pv_atual') || val('pv_atual') === antigo) setField('pv_atual', el.dataset.total);
    },
  };
}

function secBonus(attrs) {
  const nm = uname('bon');
  const opts = attrs.map((a) => `<option value="${a}">${ATTR_NAMES[a]}</option>`).join('');
  return {
    titulo: 'Aumento de atributos do antecedente',
    ajuda: `Atributos do antecedente: <strong>${attrs.map((a) => ATTR_NAMES[a]).join(', ')}</strong>. Dê +2 em um e +1 em outro, ou +1 nos três. Nenhum valor passa de 20.`,
    html: chips(nm, [{ value: '21', label: '+2 e +1', checked: true }, { value: '111', label: '+1 / +1 / +1' }], 0, 'radio')
      + `<div class="row-sel"><label>+2 em<select class="b2">${opts}</select></label><label>+1 em<select class="b1">${opts}</select></label></div>`,
    init(el) {
      el.querySelector('.b1').selectedIndex = 1;
      const upd = () => { el.querySelector('.row-sel').hidden = picked(el, nm)[0] !== '21'; };
      el.addEventListener('change', upd);
      upd();
    },
    validate(el) {
      if (picked(el, nm)[0] === '21' && el.querySelector('.b2').value === el.querySelector('.b1').value)
        return 'Escolha atributos diferentes para +2 e +1.';
    },
    apply(el) {
      const novo = Object.fromEntries(ATRIBUTOS.map((a) => [a.id, 0]));
      if (picked(el, nm)[0] === '21') {
        novo[el.querySelector('.b2').value] += 2;
        novo[el.querySelector('.b1').value] += 1;
      } else attrs.forEach((a) => (novo[a] = 1));
      // troca o bônus antigo pelo novo sem perder o valor-base
      for (const a of ATRIBUTOS) {
        const antigo = Number(val(`bonus_${a.id}`)) || 0;
        const atual = Number(val(`attr_${a.id}`)) || 10;
        setField(`attr_${a.id}`, Math.min(20, atual - antigo + novo[a.id]));
        setField(`bonus_${a.id}`, novo[a.id]);
      }
    },
  };
}

const PADRAO = [15, 14, 13, 12, 10, 8];
const CUSTO = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

function secAtributos() {
  const nm = uname('met');
  const classe = val('classe').trim();
  const s = {
    titulo: 'Como gerar os valores',
    ajuda: (CLASSES[classe] ? `Atributo principal de ${classe}: <strong>${CLASSES[classe].princ}</strong>. ` : '')
      + 'O bônus do antecedente é somado automaticamente. Os valores atuais da ficha serão substituídos.',
    html: chips(nm, [
      { value: 'padrao', label: 'Conjunto padrão', info: '15, 14, 13, 12, 10, 8', checked: true },
      { value: 'compra', label: 'Compra de pontos', info: '27 pontos, valores de 8 a 15' },
      { value: 'rolagem', label: 'Rolar 4d6', info: 'soma os 3 maiores' },
    ], 0, 'radio') + '<div class="attr-body"></div>',
  };
  let erro = null;
  let bases = () => [];
  s.init = (el) => {
    const body = el.querySelector('.attr-body');
    let pool = PADRAO;
    const metodo = () => picked(el, nm)[0];
    bases = () => [...body.querySelectorAll('tr[data-a]')].map((tr) => {
      const inp = tr.querySelector('.base');
      return [tr.dataset.a, metodo() === 'compra' ? Number(inp.value) : inp.value === '' ? null : pool[Number(inp.value)]];
    });
    const update = () => {
      const b = bases();
      if (metodo() === 'compra') {
        const gasto = b.reduce((t, [, v]) => t + (CUSTO[v] ?? 0), 0);
        erro = b.some(([, v]) => !(v in CUSTO)) ? 'Na compra de pontos, cada valor vai de 8 a 15.'
          : gasto > 27 ? `Você gastou ${gasto} de 27 pontos.` : null;
        body.querySelector('.attr-msg').textContent = erro || `Pontos gastos: ${gasto} de 27`;
      } else {
        erro = b.some(([, v]) => v == null) ? 'Distribua todos os valores entre os atributos.' : null;
        body.querySelector('.attr-msg').textContent = erro || 'Tudo distribuído ✓';
      }
      for (const [a, v] of b) {
        const tr = body.querySelector(`tr[data-a="${a}"]`);
        const fin = v == null || Number.isNaN(v) ? null : Math.min(20, v + (Number(val(`bonus_${a}`)) || 0));
        tr.querySelector('.fin').textContent = fin ?? '—';
        tr.querySelector('.md').textContent = fin == null ? '—' : fmt(mod(fin));
      }
    };
    const render = () => {
      const m = metodo();
      let rolls = [];
      if (m === 'rolagem') {
        rolls = Array.from({ length: 6 }, () => [rollDie(6), rollDie(6), rollDie(6), rollDie(6)].sort((x, y) => y - x));
        pool = rolls.map((d) => d[0] + d[1] + d[2]);
      } else pool = PADRAO;
      body.innerHTML = (m === 'rolagem'
        ? `<p class="rolls">${rolls.map((d, i) => `<span title="dados: ${d.join(', ')} (descarta ${d[3]})">${pool[i]}</span>`).join('')}
           <button type="button" class="wz-mini reroll">🎲 Rolar de novo</button></p>` : '')
        + '<table class="attr-tbl"><thead><tr><th>Atributo</th><th>Valor</th><th>Antecedente</th><th>Final</th><th>Mod.</th></tr></thead><tbody>'
        + ATRIBUTOS.map((a) => `<tr data-a="${a.id}"><td>${a.nome}</td><td>${m === 'compra'
          ? '<input class="base" type="number" min="8" max="15" value="8">'
          : `<select class="base"><option value="">—</option>${pool.map((v, i) => `<option value="${i}">${v}</option>`).join('')}</select>`}</td>
          <td>${fmt(Number(val(`bonus_${a.id}`)) || 0)}</td><td class="fin"></td><td class="md"></td></tr>`).join('')
        + '</tbody></table><p class="attr-msg"></p>';
      update();
    };
    el.addEventListener('change', (e) => {
      if (e.target.name === nm) return render();
      // cada valor do conjunto só pode ir para um atributo: libera o atributo que o usava antes
      if (e.target.matches('select.base') && e.target.value !== '') {
        body.querySelectorAll('select.base').forEach((sel) => { if (sel !== e.target && sel.value === e.target.value) sel.value = ''; });
      }
      update();
    });
    el.addEventListener('input', update);
    el.addEventListener('click', (e) => { if (e.target.matches('.reroll')) render(); });
    render();
  };
  s.validate = () => erro;
  s.apply = () => {
    for (const [a, v] of bases()) setField(`attr_${a}`, Math.min(20, v + (Number(val(`bonus_${a}`)) || 0)));
  };
  return s;
}

// ---------- janelas de cada escolha ----------
function classWizard(nome) {
  const c = CLASSES[nome];
  const { nivel } = ctx();
  openWizard(`Escolhas de ${nome}`, [
    secPericias(c.pericias.n, c.pericias.lista, `Perícias de ${nome}: escolha ${c.pericias.n}`),
    c.ferrEscolha && secFerramentas(c.ferrEscolha.n, c.ferrEscolha.tipo),
    c.maestria && secMaestria(c.maestria),
    EQUIP_CLASSE[nome] && secEquip(`Equipamento inicial de ${nome}`, EQUIP_CLASSE[nome], true),
    secTruquesFaltando(nome),
    secMagias(nome),
    ...niveisEscolha(nome).filter((l) => l <= nivel).map(secASI),
    secPV(),
  ]);
}

function speciesWizard(nome) {
  const e = ESPECIES[nome];
  const secs = [];
  if (e.tam.includes(' ou ')) {
    secs.push(secOne('Tamanho', e.tam.split(' ou ').map((t) => ({ value: t, label: t })), (v) => setField('tamanho', v)));
  }
  if (e.linhagens) {
    const nl = uname('lin');
    const nh = uname('hab');
    const habPadrao = val('conj_hab') || 'int';
    secs.push({
      titulo: nome === 'Tiefling' ? 'Legado Ínfero' : 'Linhagem',
      html: chips(nl, Object.entries(e.linhagens).map(([n, l], i) => ({
        value: n, label: n, checked: i === 0,
        info: [...l.truques.map((t) => `Truque: ${t}`), l.resist ? `Resistência a ${l.resist}` : '', l.desl ? `Deslocamento ${l.desl}` : '', l.nota]
          .filter(Boolean).join(' · '),
      })), 0, 'radio')
        + '<h4>Habilidade de conjuração dessas magias</h4>'
        + chips(nh, HAB_CONJ.map((a) => ({ value: a, label: ATTR_NAMES[a], checked: a === habPadrao })), 0, 'radio'),
      apply(el) {
        const n = picked(el, nl)[0];
        const hab = picked(el, nh)[0];
        const l = e.linhagens[n];
        appendLines('tracos_especie', [`${n}: ${l.nota}`, ...(l.tracos || []), ...(l.resist ? [`Resistência a dano de ${l.resist}`] : [])]);
        if (l.desl) setField('deslocamento', l.desl);
        l.truques.forEach((t) => addCantrip(findTruque(t), hab, 'especie'));
      },
    });
  }
  if (e.draconico) {
    secs.push(secOne('Ancestralidade Dracônica',
      Object.entries(DRACONICOS).map(([d, t]) => ({ value: d, label: `Dragão ${d}`, info: `dano ${t}` })),
      (d) => {
        const tipo = DRACONICOS[d];
        appendLines('tracos_especie', [`Ancestral: Dragão ${d}`, `Resistência a dano ${tipo}`]);
        placeRow('tblArmas', {
          nome: 'Arma de Sopro', ref: `sopro:${tipo}`,
          notas: 'Cone de 4,5 m ou linha de 9 m; usos = bônus de proficiência por descanso longo',
        });
      },
      'Define o tipo de dano da Arma de Sopro e sua resistência. A Arma de Sopro entra na tabela de armas com CD e dano calculados.'));
  }
  if (e.gigante) {
    secs.push(secOne('Ancestralidade Gigante',
      Object.entries(GIGANTES).map(([g, d]) => ({ value: g, label: g, info: d })),
      (g) => appendLines('tracos_especie', [`${g} — ${GIGANTES[g]} (usos = bônus de proficiência por descanso longo)`])));
  }
  if (e.humano) {
    secs.push(secPericias(1, 'qualquer', 'Habilidoso: 1 perícia à sua escolha'));
    secs.push(secOne('Versátil: talento de origem', TALENTOS_ORIGEM.map((t) => ({ value: t, label: t })),
      (t) => appendLines('talentos', [`${t} (talento de origem — Humano)`])));
  }
  openWizard(`Escolhas de ${nome}`, secs);
}

function backgroundWizard(nome) {
  const b = ANTECEDENTES[nome];
  const iniciado = /Iniciado em Magia \(([^)]+)\)/.exec(b.talento);
  openWizard(`Escolhas de ${nome}`, [
    secBonus(b.attrs),
    b.ferrTipo && secFerramentas(1, b.ferrTipo),
    secIdiomas(),
    EQUIP_ANTEC[nome] && secEquip(`Equipamento de ${nome}`, [EQUIP_ANTEC[nome], { po: 50 }], false),
    iniciado && secTruques(iniciado[1], 2, {
      escolherHab: true, hab: HAB_INICIADO[iniciado[1]], origem: 'talento',
      titulo: `Iniciado em Magia (${iniciado[1]}): escolha 2 truques`,
    }),
  ]);
}

function attrWizard() {
  openWizard('Valores de Atributo', [secAtributos()]);
}

function hpWizard() {
  const s = secPV();
  if (!s) return toast('Escolha uma classe da lista para calcular os PV.');
  openWizard('Pontos de Vida', [s]);
}

function weaponPicker() {
  const c = ctx();
  const nm = uname('arm');
  const grupos = [
    ['Simples corpo a corpo', (w) => w.cat === 'simples' && w.tipo === 'cac'],
    ['Simples à distância', (w) => w.cat === 'simples' && w.tipo === 'dist'],
    ['Marciais corpo a corpo', (w) => w.cat === 'marcial' && w.tipo === 'cac'],
    ['Marciais à distância', (w) => w.cat === 'marcial' && w.tipo === 'dist'],
  ];
  openWizard('Escolher armas', [{
    titulo: 'Armas',
    ajuda: 'Bônus de ataque e dano já calculados com seus atributos e proficiências; eles se atualizam quando você muda atributos ou nível.',
    html: grupos.map(([g, f]) => `<h4>${g}</h4>` + chips(nm, ARMAS.filter(f).map((w) => {
      const r = weaponCalc(w, c);
      return { value: w.n, label: w.n, info: [`${r.bonus} · ${r.dano}`, ...w.p, r.prof ? '' : 'sem proficiência'].filter(Boolean).join(' · ') };
    }))).join(''),
    apply(el) { picked(el, nm).forEach((n) => addWeaponRef(findWeapon(n), false)); },
  }]);
}

function cantripPicker() {
  const c = ctx();
  const nm = uname('td');
  const nh = uname('hab');
  const habFicha = val('conj_hab');
  let hab = '';
  const lista = TRUQUES.filter((t) => t.d)
    .sort((a, b) => b.cls.includes(c.classe) - a.cls.includes(c.classe) || a.n.localeCompare(b.n));
  openWizard('Truques de dano', [
    {
      titulo: 'Habilidade usada',
      html: chips(nh, [
        { value: '', label: 'A da ficha', info: habFicha ? ATTR_NAMES[habFicha] : 'ainda não definida', checked: true },
        ...HAB_CONJ.map((a) => ({ value: a, label: ATTR_NAMES[a] })),
      ], 0, 'radio'),
      apply(el) { hab = picked(el, nh)[0] || ''; },
    },
    {
      titulo: 'Truques',
      ajuda: c.classe ? `Os truques de ${c.classe} aparecem primeiro.` : '',
      html: chips(nm, lista.map((t) => {
        const r = cantripCalc(t, '', c);
        return { value: t.n, label: t.n, info: `${r.bonus} · ${r.dano}${t.cls.includes(c.classe) ? '' : ' · ' + t.cls.join(', ')}` };
      })),
      apply(el) { picked(el, nm).forEach((n) => addCantrip(findTruque(n), hab)); },
    },
  ]);
}

// ao mudar o nível: atualiza Dados de Vida, espaços e características na hora, e abre a janela
// do novo nível (aumentos de atributo, truques, magias, PV) quando o valor para de mudar
let nivelTimer;
const asiPendentes = new Set();
function onLevelChange() {
  comFonte(ledger.classe ? 'classe' : null, mudarNivel);
}

function mudarNivel() {
  syncHitDice();
  applySlots();
  const classe = val('classe').trim();
  if (!CLASSES[classe]) return;
  const { nivel } = ctx();
  const antes = Number(val('nivel_aplicado')) || 0;
  if (nivel > antes) {
    appendFeatures(classe, antes + 1, nivel);
    niveisEscolha(classe).filter((l) => l > antes && l <= nivel).forEach((l) => asiPendentes.add(l));
  }
  setField('nivel_aplicado', nivel);
  clearTimeout(nivelTimer);
  nivelTimer = setTimeout(() => {
    const secs = [...asiPendentes].sort((a, b) => a - b).filter((l) => l <= ctx().nivel).map(secASI);
    asiPendentes.clear();
    comFonte(ledger.classe ? 'classe' : null, () => openWizard(`Nível ${ctx().nivel}`, [
      ...secs,
      secTruquesFaltando(classe, `Novos truques de ${classe}`),
      secMagias(classe),
      secPV(),
    ]));
  }, 900);
}
