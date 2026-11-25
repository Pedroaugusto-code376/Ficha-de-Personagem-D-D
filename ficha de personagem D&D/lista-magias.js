// Janela "Lista de Magias": cada magia tem os botões Adicionar e Explicação.
// A explicação abre por cima da lista; as duas janelas fecham pelo X (ou Esc).

const slDlg = document.getElementById('spellList');
const siDlg = document.getElementById('spellInfo');
const slLista = document.getElementById('slLista');
const NIVEL_NOME = (nv) => (nv === 0 ? 'Truque' : `${nv}º nível`);
const findMagia = (n) => MAGIAS.find((s) => s.n === n);
const ehConcentracao = (s) => /^Concentração/.test(s.dur);

document.getElementById('slClasse').insertAdjacentHTML('beforeend',
  Object.keys(CLASSES).map((c) => `<option value="${c}">${c}</option>`).join(''));

function abrirListaMagias() {
  const classe = val('classe').trim();
  document.getElementById('slClasse').value = CLASSES[classe] ? classe : '';
  document.getElementById('slBusca').value = '';
  document.getElementById('slNivel').value = '';
  renderListaMagias();
  slDlg.showModal();
  slLista.scrollTop = 0;
}

function renderListaMagias() {
  const busca = document.getElementById('slBusca').value.trim().toLowerCase();
  const nivel = document.getElementById('slNivel').value;
  const classe = document.getElementById('slClasse').value;
  const naFicha = new Set(spellNames());
  const lista = MAGIAS
    .filter((s) => (!busca || s.n.toLowerCase().includes(busca) || (s.en || '').toLowerCase().includes(busca))
      && (nivel === '' || s.nv === Number(nivel))
      && (!classe || s.cls.includes(classe)))
    .sort((a, b) => a.nv - b.nv || a.n.localeCompare(b.n));
  if (!lista.length) {
    slLista.innerHTML = '<p class="help sl-vazio">Nenhuma magia encontrada com esses filtros.</p>';
    return;
  }
  let html = '';
  let grupo = null;
  for (const s of lista) {
    if (s.nv !== grupo) {
      grupo = s.nv;
      html += `<h4 class="sl-grupo">${grupo === 0 ? 'Truques' : `${grupo}º nível`}</h4>`;
    }
    const tem = naFicha.has(s.n);
    const marcas = [ehConcentracao(s) ? 'Concentração' : '', s.r ? 'Ritual' : ''].filter(Boolean).join(' · ');
    html += `<div class="sl-item">
      <div class="sl-nome"><strong>${esc(s.n)}</strong><small>${NIVEL_NOME(s.nv)} · ${s.esc}${marcas ? ' · ' + marcas : ''}</small></div>
      <button type="button" class="sl-add" data-n="${esc(s.n)}"${tem ? ' disabled' : ''}>${tem ? 'Adicionada ✓' : 'Adicionar'}</button>
      <button type="button" class="sl-info" data-n="${esc(s.n)}">Explicação</button>
    </div>`;
  }
  slLista.innerHTML = html;
}

// põe a magia na tabela (truques de dano também entram na tabela de armas)
function linhaMagia(s) {
  const origem = s.cls.includes(val('classe').trim()) ? 'classe' : 'extra';
  if (s.nv === 0) {
    addCantrip(findTruque(s.n) || { n: s.n, alc: s.alc, tempo: s.t.split(/[,(]/)[0].trim(), cls: s.cls }, '', origem);
    return;
  }
  placeRow('tblMagias', {
    nivel: String(s.nv), nome: s.n, tempo: s.t.split(/[,(]/)[0].trim(), alcance: s.alc.split(/[,(]/)[0].trim(),
    c: ehConcentracao(s), r: !!s.r, m: /\bM\b/.test(s.comp),
    notas: s.dur.replace(/^Concentração, /, ''), origem,
  });
}

function adicionarMagia(s) {
  linhaMagia(s);
  onChange();
  layout();
  toast(`${s.n} adicionada à ficha.`);
}

// textos que o jogador digitou (por exemplo, copiados do próprio livro), guardados neste navegador
const TEXTOS_KEY = 'ficha-dnd-textos-magias';
let textosMagias = {};
try { textosMagias = JSON.parse(localStorage.getItem(TEXTOS_KEY)) || {}; } catch { /* sem armazenamento */ }
function salvarTextosMagias(t) {
  textosMagias = t;
  try { localStorage.setItem(TEXTOS_KEY, JSON.stringify(t)); } catch { /* sem armazenamento */ }
}

// parágrafos separados por linha; linhas com " | " viram tabela; "Rótulo. texto" ganha o rótulo em negrito
function formatarTexto(txt) {
  const linhas = txt.split('\n').map((l) => l.trim()).filter(Boolean);
  let html = '';
  for (let i = 0; i < linhas.length; i++) {
    if (linhas[i].includes(' | ')) {
      const tab = [];
      while (i < linhas.length && linhas[i].includes(' | ')) tab.push(linhas[i++].split(' | '));
      i--;
      html += `<table class="si-tab"><thead><tr>${tab[0].map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${
        tab.slice(1).map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      continue;
    }
    const m = linhas[i].match(/^([A-ZÀ-Ú][^.:!?]{1,48}[.:]) (.+)$/);
    html += m && m[1].split(' ').length <= 6
      ? `<p class="si-desc"><strong>${esc(m[1])}</strong> ${esc(m[2])}</p>`
      : `<p class="si-desc">${esc(linhas[i])}</p>`;
  }
  return html;
}

const SUP_ROTULO = (s) => (s.nv === 0 ? 'Aprimoramento de Truque.' : 'Usando um Espaço de Magia de Nível Superior.');
const textoOriginal = (s) => s.desc + (s.sup ? `\n${SUP_ROTULO(s)} ${s.sup}` : '');

function mostrarExplicacao(s, editando = false) {
  document.getElementById('siNome').textContent = s.n;
  const marcas = [ehConcentracao(s) ? 'Concentração' : '', s.r ? 'Ritual' : ''].filter(Boolean);
  const proprio = textosMagias[s.n];
  const fonte = proprio
    ? 'Texto digitado por você.'
    : s.fonte === 'resumo'
      ? 'Resumo — esta magia não faz parte do SRD, então o texto completo não pode ser incluído. Use “Editar texto” para colocar o texto do seu livro.'
      : 'Texto do SRD 5.2.1 (Wizards of the Coast, licença CC-BY-4.0), traduzido. Pode diferir das palavras do livro em português.';
  const corpo = editando
    ? `<textarea id="siTexto" class="si-edit" spellcheck="false">${esc(proprio ?? textoOriginal(s))}</textarea>
       <p class="si-legenda">Um parágrafo por linha. Para uma tabela, separe as colunas com " | ".</p>
       <div class="si-acoes"><button type="button" data-si="cancelar">Cancelar</button><button type="button" class="sl-add" data-si="salvar">Salvar texto</button></div>`
    : `${proprio ? formatarTexto(proprio) : formatarTexto(s.desc) + (s.sup ? `<p class="si-desc"><strong>${SUP_ROTULO(s)}</strong> ${esc(s.sup)}</p>` : '')}
       <p class="si-legenda">${fonte}<br>Componentes: V = verbal (palavras), S = somático (gestos), M = material (o item entre parênteses).</p>
       <div class="si-acoes">${proprio ? '<button type="button" data-si="restaurar">Voltar ao texto original</button>' : ''}<button type="button" class="sl-info" data-si="editar">Editar texto</button></div>`;
  document.getElementById('siBody').innerHTML = `
    <p class="si-meta">${NIVEL_NOME(s.nv)} · ${s.esc}${marcas.length ? ' · ' + marcas.join(' · ') : ''}</p>
    <dl class="si-dados">
      <dt>Tempo de conjuração</dt><dd>${esc(s.t)}${s.r ? ' ou Ritual' : ''}</dd>
      <dt>Alcance</dt><dd>${esc(s.alc)}</dd>
      <dt>Componentes</dt><dd>${esc(s.comp)}</dd>
      <dt>Duração</dt><dd>${esc(s.dur)}</dd>
      <dt>Classes</dt><dd>${s.cls.join(', ')}</dd>
    </dl>
    ${corpo}`;
  siDlg.dataset.n = s.n;
  if (!siDlg.open) siDlg.showModal();
  if (editando) document.getElementById('siTexto').focus();
  else document.getElementById('siBody').scrollTop = 0;
}

document.getElementById('siBody').addEventListener('click', (e) => {
  const acao = e.target.closest('[data-si]')?.dataset.si;
  if (!acao) return;
  const s = findMagia(siDlg.dataset.n);
  if (acao === 'editar') return mostrarExplicacao(s, true);
  if (acao === 'salvar') {
    const txt = document.getElementById('siTexto').value.trim();
    const t = { ...textosMagias };
    if (txt && txt !== textoOriginal(s)) t[s.n] = txt; else delete t[s.n];
    salvarTextosMagias(t);
    toast('Texto salvo neste navegador.');
  }
  if (acao === 'restaurar') {
    const t = { ...textosMagias };
    delete t[s.n];
    salvarTextosMagias(t);
  }
  mostrarExplicacao(s);
});

slLista.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-n]');
  if (!btn) return;
  const s = findMagia(btn.dataset.n);
  if (btn.classList.contains('sl-add')) {
    adicionarMagia(s);
    btn.disabled = true;
    btn.textContent = 'Adicionada ✓';
  } else {
    mostrarExplicacao(s);
  }
});

['slBusca', 'slNivel', 'slClasse'].forEach((id) => document.getElementById(id).addEventListener('input', renderListaMagias));
document.getElementById('slClose').addEventListener('click', () => slDlg.close());
document.getElementById('siClose').addEventListener('click', () => siDlg.close());
document.getElementById('btnMagiaLista').addEventListener('click', abrirListaMagias);
