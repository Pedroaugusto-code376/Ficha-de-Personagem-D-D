const STORAGE_KEY = 'ficha-dnd';

const form = document.getElementById('sheet');
const $ = (id) => document.getElementById(id);
const fmt = (n) => (n >= 0 ? '+' : '') + n;

// ---------- construção da interface ----------
function buildAbilities() {
  ATRIBUTOS.forEach((a, i) => {
    const box = document.createElement('div');
    box.className = 'box';
    let html = `
      <div class="ability-head">
        <div class="name">${a.nome}</div>
        <div class="ability-nums">
          <div><output class="mod" id="mod_${a.id}">+0</output><small>Modificador</small></div>
          <div>
            <input class="score" name="attr_${a.id}" type="number" min="1" max="30" value="10"><small>Valor</small>
            <input type="hidden" name="bonus_${a.id}" value="0"><small class="bon" id="bon_${a.id}"></small>
          </div>
        </div>
      </div>
      ${skillRow(`save_${a.id}`, 'Salvaguarda', true)}`;
    for (const [id, nome] of a.pericias) html += skillRow(`skill_${id}`, nome);
    box.innerHTML = html;
    // Força, Destreza e Constituição na 1ª coluna; Inteligência, Sabedoria e Carisma na 2ª
    $(i < 3 ? 'abilitiesA' : 'abilitiesB').appendChild(box);
  });
}

// pip: 0 = sem proficiência, 1 = proficiente, 2 = especialização (apenas perícias)
function skillRow(name, label, isSave = false) {
  return `<div class="skill${isSave ? ' save' : ''}">
    <button type="button" class="pip" data-v="0" data-max="${isSave ? 1 : 2}" title="Clique para alternar proficiência"></button>
    <input type="hidden" name="${name}" value="0">
    <output class="val" id="v_${name}">+0</output>
    <span>${label}</span>
  </div>`;
}

function buildSlots() {
  const wrap = $('slots');
  for (let n = 1; n <= 9; n++) {
    wrap.insertAdjacentHTML('beforeend', `
      <div class="slot">${n}º
        <input name="slot_total_${n}" type="number" min="0" placeholder="total">
        <input name="slot_gasto_${n}" type="number" min="0" placeholder="gastos">
      </div>`);
  }
}

function buildArmaduras() {
  const grupos = { leve: 'Leves', media: 'Médias', pesada: 'Pesadas' };
  $('selArmadura').innerHTML = '<option value="">Sem armadura</option>'
    + Object.entries(grupos).map(([tipo, rotulo]) => `<optgroup label="${rotulo}">${Object.entries(ARMADURAS)
      .filter(([, a]) => a.tipo === tipo)
      .map(([n]) => `<option value="${n}">${n}</option>`).join('')}</optgroup>`).join('');
}

// resumo da armadura vestida: como a CA é calculada e os efeitos que ela tem
function armorInfo() {
  const a = ARMADURAS[val('armadura')];
  const classe = val('classe').trim();
  const avisos = [];
  let txt;
  if (!a) {
    txt = classe === 'Bárbaro' ? 'Defesa sem Armadura: 10 + DES + CON'
      : classe === 'Monge' ? 'Defesa sem Armadura: 10 + DES + SAB' : 'Sem armadura: 10 + DES';
  } else {
    txt = `CA ${a.base}${a.des >= 99 ? ' + DES' : a.des ? ` + DES (máx. ${a.des})` : ''}`;
    if (!form.elements[`arm_${a.tipo}`].checked) avisos.push('sem treinamento: desvantagem em FOR/DES e não pode conjurar');
    if (a.for && (Number(val('attr_for')) || 10) < a.for) avisos.push(`exige Força ${a.for}: −3 m de deslocamento`);
    if (a.furt) avisos.push('desvantagem em Furtividade');
  }
  if (form.elements.escudo.checked) txt += ' + 2 (escudo)';
  if (val('ca_auto') !== '1') txt += ' · CA digitada à mão';
  $('armInfo').textContent = [txt, ...avisos].join(' · ');
  $('armInfo').classList.toggle('alerta', avisos.some((t) => !t.startsWith('desvantagem em Furt')));
}

function fillRow(row, data) {
  row.querySelectorAll('[data-col]').forEach((el) => {
    const v = data[el.dataset.col];
    if (el.type === 'checkbox') el.checked = !!v;
    else el.value = v ?? '';
  });
}

// novas linhas entram no fim da tabela (na folha de continuação, se houver)
function addRow(tableId, data = {}) {
  const tpl = $(tableId === 'tblArmas' ? 'rowArmas' : 'rowMagias');
  const row = tpl.content.firstElementChild.cloneNode(true);
  fillRow(row, data);
  const bodies = document.querySelectorAll(`tbody[data-rows="${tableId}"]`);
  bodies[bodies.length - 1].appendChild(row);
  scheduleLayout();
  return row;
}

// ---------- listas e preenchimento automático ----------
function fillDatalist(id, items) {
  $(id).innerHTML = items.map((v) => `<option value="${v}">`).join('');
}

function buildLists() {
  fillDatalist('listaClasses', Object.keys(CLASSES));
  fillDatalist('listaEspecies', Object.keys(ESPECIES));
  fillDatalist('listaAntecedentes', Object.keys(ANTECEDENTES));
  updateSubclassList();
}

function updateSubclassList() {
  fillDatalist('listaSubclasses', CLASSES[val('classe').trim()]?.sub || Object.values(CLASSES).flatMap((c) => c.sub));
}

function setField(name, value) {
  const el = form.elements[name];
  if (!el && !isFlow(name)) return;
  registrarCampo(name, el?.type === 'checkbox' ? el.checked : val(name), value);
  if (isFlow(name)) return setText(name, String(value));
  if (el.type === 'checkbox') el.checked = !!value;
  else el.value = value;
}

// adiciona linhas a um campo de texto sem repetir as que já existem
function appendLines(name, lines) {
  const existing = val(name).split('\n').map((l) => l.trim()).filter(Boolean);
  const novas = lines.filter((l) => !existing.includes(l));
  registrarLinhas(name, novas);
  comFonte(null, () => setField(name, [...existing, ...novas].join('\n')));
}

function setProf(name, v) {
  const hidden = form.elements[name];
  registrarCampo(name, hidden.value, v);
  hidden.value = String(v);
  hidden.previousElementSibling.dataset.v = String(v);
}

let toastTimer;
function toast(msg) {
  const t = $('toast');
  // com a janela do assistente aberta, o aviso precisa ficar dentro dela para aparecer por cima
  const host = [...document.querySelectorAll('dialog[open]')].pop() || document.body;
  if (t.parentNode !== host) host.appendChild(t);
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}

function applyClass(nome) {
  updateSubclassList();
  const c = CLASSES[nome];
  if (!c) return;
  const { nivel } = ctx();
  for (const a of ATRIBUTOS) setProf(`save_${a.id}`, c.sal.includes(a.id) ? 1 : 0);
  for (const t of ['leve', 'media', 'pesada', 'escudos']) setField(`arm_${t}`, c.arm.includes(t));
  setField('prof_armas', c.armas);
  setField('conj_hab', c.conj);
  setField('dv_max', `${nivel}d${c.dv}`);
  if (c.ferr) appendLines('prof_ferramentas', [c.ferr]);
  if (IDIOMA_CLASSE[nome]) appendLines('idiomas', [IDIOMA_CLASSE[nome]]);
  if (val('ca') === '10' || val('ca') === '') setField('ca_auto', '1');
  appendFeatures(nome, 1, nivel);
  setField('nivel_aplicado', nivel);
  applySlots();
  classWizard(nome);
}

function applySpecies(nome) {
  const e = ESPECIES[nome];
  if (!e) return;
  setField('tamanho', e.tam.split(' ou ')[0]);
  setField('deslocamento', e.desl);
  appendLines('tracos_especie', e.tracos);
  if (e.truque) addCantrip(findTruque(e.truque), e.habTruque, 'especie');
  speciesWizard(nome);
  toast(`${nome}: tamanho, deslocamento e traços preenchidos.`);
}

function applyBackground(nome) {
  const b = ANTECEDENTES[nome];
  if (!b) return;
  for (const p of b.pericias) if (val(`skill_${p}`) === '0') setProf(`skill_${p}`, 1);
  appendLines('talentos', [`${b.talento} (talento de origem)`]);
  if (b.ferramenta) appendLines('prof_ferramentas', [b.ferramenta]);
  backgroundWizard(nome);
}

// mantém "NdX" dos Dados de Vida em dia com o nível, se o campo estiver no formato padrão
function syncHitDice() {
  const c = CLASSES[val('classe').trim()];
  const m = /^(\d+)d(\d+)$/.exec(val('dv_max').trim());
  if (c && m && Number(m[2]) === c.dv) setField('dv_max', `${Number(val('nivel')) || 1}d${c.dv}`);
}

// ---------- cálculos ----------
const mod = (score) => Math.floor((Number(score || 10) - 10) / 2);
const val = (name) => (isFlow(name) ? getText(name) : form.elements[name]?.value ?? '');

function recalc() {
  const { nivel, prof, mods, classe } = ctx();
  $('profBonus').value = fmt(prof);

  for (const a of ATRIBUTOS) {
    $(`mod_${a.id}`).value = fmt(mods[a.id]);
    const bonus = Number(val(`bonus_${a.id}`)) || 0;
    $(`bon_${a.id}`).textContent = bonus ? `${fmt(bonus)} antecedente` : '';
    $(`v_save_${a.id}`).value = fmt(mods[a.id] + prof * Number(val(`save_${a.id}`)));
    for (const [id] of a.pericias) {
      $(`v_skill_${id}`).value = fmt(mods[a.id] + prof * Number(val(`skill_${id}`)));
    }
  }

  $('iniciativa').value = fmt(mods.des);
  $('percPassiva').value = 10 + mods.sab + prof * Number(val('skill_percepcao'));
  if (val('ca_auto') === '1') setField('ca', calcCA(mods));
  armorInfo();
  $('xpProx').textContent = nivel < 20 ? `Próximo nível: ${XP_NIVEL[nivel].toLocaleString('pt-BR')} XP` : 'Nível máximo';

  const hab = val('conj_hab');
  if (hab) {
    $('conjMod').value = fmt(mods[hab]);
    $('conjCD').value = 8 + prof + mods[hab];
    $('conjAtq').value = fmt(prof + mods[hab]);
  } else {
    $('conjMod').value = $('conjCD').value = $('conjAtq').value = '—';
  }
  const c = CLASSES[classe];
  const maxPrep = PREPARADAS[classe]?.[nivel - 1];
  $('conjPrep').value = maxPrep ? `${magiasPreparadas()}/${maxPrep}` : '—';
  $('conjMax').value = c?.magia ? `${slotsFor(c, nivel).length}º` : '—';

  updateRefRows();
}

// ---------- salvar / carregar ----------
function serialize() {
  const data = {};
  for (const el of form.elements) {
    if (!el.name) continue;
    data[el.name] = el.type === 'checkbox' ? el.checked : el.dataset.flow ? getText(el.name) : el.value;
  }
  for (const id of ['tblArmas', 'tblMagias']) {
    data[id] = rowsOf(id).map((tr) => {
      const row = {};
      tr.querySelectorAll('[data-col]').forEach((el) => {
        row[el.dataset.col] = el.type === 'checkbox' ? el.checked : el.value;
      });
      return row;
    });
  }
  data.origens = ledger;
  return data;
}

function load(data) {
  document.querySelectorAll('.page.extra').forEach((p) => p.remove());
  form.reset();
  // campos ocultos numéricos (proficiências, bônus, nível aplicado) voltam a 0; os demais ficam vazios
  form.querySelectorAll('input[type=hidden]').forEach((h) => (h.value = !h.name || ['armadura', 'ca_auto'].includes(h.name) ? '' : '0'));
  for (const el of form.elements) {
    if (!el.name || !(el.name in data)) continue;
    if (el.type === 'checkbox') el.checked = !!data[el.name];
    else el.value = data[el.name];
  }
  // a CA é calculada sozinha, a não ser que tenha sido digitada à mão ("0")
  if (!val('ca_auto')) form.elements.ca_auto.value = '1';
  syncPips();
  for (const id of ['tblArmas', 'tblMagias']) {
    document.querySelector(`#${id} tbody`).innerHTML = '';
    const rows = data[id]?.length ? data[id] : [{}, {}, {}];
    rows.forEach((r) => addRow(id, r));
  }
  // fichas salvas antes desse registro: as escolhas existem, mas não dá para saber o que preencheram
  ledger = data.origens || {};
  if (!data.origens) {
    for (const campo of Object.keys(TABELA_DE)) if (val(campo).trim()) ledger[campo] = { nome: val(campo).trim(), legado: true };
    ledger.subclasse = { nome: val('subclasse').trim() };
  }
  updateSubclassList();
  recalc();
  layout();
}

function syncPips() {
  form.querySelectorAll('.pip').forEach((pip) => {
    pip.dataset.v = pip.nextElementSibling.value || '0';
  });
}

let saveTimer;
function autosave() {
  clearTimeout(saveTimer);
  $('saveStatus').textContent = 'Salvando…';
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize()));
      $('saveStatus').textContent = 'Salvo ✓';
    } catch {
      $('saveStatus').textContent = 'Não foi possível salvar';
    }
  }, 400);
}

function onChange() {
  recalc();
  autosave();
}

// ---------- eventos ----------
const LISTAS = ['classe', 'especie', 'antecedente', 'subclasse'];

form.addEventListener('input', (e) => {
  const t = e.target;
  // escolher um item da lista sugerida confirma o campo na hora (dispara o "change")
  if (LISTAS.includes(t.name) && (e.inputType === 'insertReplacementText' || !e.inputType)) t.blur();
  // editar bônus/dano à mão desliga o cálculo automático daquela linha
  if (t.dataset.col === 'bonus' || t.dataset.col === 'dano') {
    const ref = t.closest('tr').querySelector('[data-col=ref]');
    if (ref) ref.value = '';
  }
  // editar a CA à mão desliga o cálculo automático da CA
  if (t.name === 'ca') setField('ca_auto', '0');
  // texto que passou do quadro (ou que tem continuação) é repaginado na hora
  if (t.tagName === 'TEXTAREA') {
    const name = t.dataset.flow ? t.name : t.dataset.contOf;
    if (name && (overflows(t) || conts(name).length)) layout();
  }
  onChange();
});

form.addEventListener('change', (e) => {
  const { name, value } = e.target;
  if (name in TABELA_DE) trocar(name, value.trim());
  else if (name === 'subclasse') applySubclass(value.trim());
  // escolher a armadura ou o escudo volta a calcular a CA automaticamente
  else if (name === 'armadura' || name === 'escudo') setField('ca_auto', '1');
  else if (name === 'nivel') onLevelChange();
  else if (name === 'xp') {
    const n = nivelPorXP(Number(value) || 0);
    if (n > ctx().nivel) {
      setField('nivel', n);
      toast(`Experiência suficiente para o nível ${n}!`);
      onLevelChange();
    }
  } else if (e.target.dataset.col === 'nivel') sortSpells();
  onChange();
});

form.addEventListener('click', (e) => {
  const pip = e.target.closest('.pip');
  if (pip) {
    const hidden = pip.nextElementSibling;
    const next = (Number(hidden.value) + 1) % (Number(pip.dataset.max) + 1);
    hidden.value = pip.dataset.v = String(next);
    pip.title = ['Sem proficiência', 'Proficiente', 'Especialização'][next];
    onChange();
    return;
  }
  const add = e.target.closest('button[data-table]');
  if (add) {
    const row = addRow(add.dataset.table);
    layout();
    row.querySelector('input:not([type=hidden]), select').focus();
    autosave();
    return;
  }
  const del = e.target.closest('.del');
  if (del) {
    del.closest('tr').remove();
    layout();
    onChange();
  }
});

// botões "Refazer escolhas" da barra superior
document.addEventListener('click', (e) => {
  const redo = e.target.closest('[data-redo]');
  if (!redo) return;
  escolherWizard(redo.dataset.redo);
});

$('btnAtributos').addEventListener('click', attrWizard);
$('btnPV').addEventListener('click', hpWizard);
$('btnArmaLista').addEventListener('click', weaponPicker);
$('btnTruqueDano').addEventListener('click', cantripPicker);

$('btnNew').addEventListener('click', () => {
  if (!confirm('Criar uma nova ficha? Os dados atuais serão apagados (salve os dados antes, se quiser guardá-los).')) return;
  load({});
  autosave();
});

$('btnExport').addEventListener('click', () => {
  const data = serialize();
  if (Object.keys(textosMagias).length) data.textosMagias = textosMagias;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${(data.nome || 'personagem').trim().replace(/[^\w\-À-ú ]/g, '') || 'personagem'}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

$('fileImport').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (data.textosMagias) salvarTextosMagias({ ...textosMagias, ...data.textosMagias });
    delete data.textosMagias;
    load(data);
    autosave();
  } catch {
    alert('Arquivo inválido.');
  }
  e.target.value = '';
});

$('btnPrint').addEventListener('click', () => { layout(); window.print(); });

// ---------- inicialização ----------
buildAbilities();
buildSlots();
buildArmaduras();
let saved = {};
try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch {}
load(saved);
buildLists();
