// Folhas A4 de tamanho fixo. Texto ou linhas de tabela que não cabem no seu quadro
// continuam em folhas extras, criadas só quando necessário — a tela e a impressão ficam iguais.

const sheetEl = document.getElementById('sheet');
const FLOW = [...document.querySelectorAll('textarea[data-flow]')].map((ta) => ({ name: ta.name, titulo: ta.dataset.flow, main: ta }));
const TABELAS = { tblArmas: 'Armas e Truques de Dano', tblMagias: 'Truques e Magias Preparadas' };
const MIN_LIVRE = 70; // px: com menos espaço que isso numa folha extra, começa outra

const flowOf = (name) => FLOW.find((f) => f.name === name);
const isFlow = (name) => !!flowOf(name);
const conts = (name) => [...document.querySelectorAll(`textarea[data-cont-of="${name}"]`)];
const segments = (name) => [flowOf(name).main, ...conts(name)];
const getText = (name) => segments(name).map((t) => t.value).join('');
const rowsOf = (id) => [...document.querySelectorAll(`tbody[data-rows="${id}"] tr`)];
const overflows = (el) => el.scrollHeight > el.clientHeight + 1;

function setText(name, v) {
  conts(name).forEach((t) => (t.value = ''));
  flowOf(name).main.value = v;
  scheduleLayout();
}

// coloca no campo o maior pedaço do texto que cabe (cortando em espaço ou quebra de linha); devolve o tamanho
function fitText(ta, text) {
  ta.value = text;
  if (!overflows(ta)) return text.length;
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    ta.value = text.slice(0, mid);
    if (overflows(ta)) hi = mid - 1; else lo = mid;
  }
  // prefere cortar no fim de uma linha; senão, num espaço; senão, onde der
  const fimLinha = text.lastIndexOf('\n', lo - 1);
  const espaco = text.lastIndexOf(' ', lo - 1);
  const quebra = fimLinha > 0 && fimLinha >= lo - 250 ? fimLinha : espaco;
  const k = quebra > 0 && quebra >= lo - 250 ? quebra + 1 : lo;
  ta.value = text.slice(0, k);
  return k;
}

// ---------- foco e cursor sobrevivem à repaginação ----------
function captureFocus() {
  const el = document.activeElement;
  if (!el || !sheetEl.contains(el)) return null;
  const name = el.tagName === 'TEXTAREA' && (el.dataset.flow ? el.name : el.dataset.contOf);
  if (name) {
    let off = 0;
    for (const s of segments(name)) { if (s === el) break; off += s.value.length; }
    return { name, off: off + el.selectionStart };
  }
  let start = null;
  try { start = el.selectionStart; } catch { /* campos sem cursor */ }
  return { el, start };
}

function restoreFocus(f) {
  if (!f) return;
  if (f.name) {
    const segs = segments(f.name);
    let off = f.off;
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      const proximoVazio = !segs[i + 1]?.value;
      if (off < s.value.length || i === segs.length - 1 || (off === s.value.length && proximoVazio)) {
        const pos = Math.min(off, s.value.length);
        if (document.activeElement !== s) s.focus();
        s.setSelectionRange(pos, pos);
        return;
      }
      off -= s.value.length;
    }
  } else if (f.el.isConnected && document.activeElement !== f.el) {
    f.el.focus({ preventScroll: true });
    try { if (f.start != null) f.el.setSelectionRange(f.start, f.start); } catch { /* campos sem cursor */ }
  }
}

// ---------- paginação ----------
function layout() {
  const foco = captureFocus();
  const textos = Object.fromEntries(FLOW.map((f) => [f.name, getText(f.name)]));
  const linhas = Object.fromEntries(Object.keys(TABELAS).map((id) => [id, rowsOf(id)]));
  document.querySelectorAll('.page.extra').forEach((p) => p.remove());

  const sobra = [];
  for (const [id, rows] of Object.entries(linhas)) {
    const tbody = document.querySelector(`#${id} tbody`);
    const box = tbody.closest('.box');
    rows.forEach((r) => tbody.appendChild(r));
    const resto = [];
    while (tbody.lastElementChild && overflows(box)) {
      const r = tbody.lastElementChild;
      r.remove();
      resto.unshift(r);
    }
    if (resto.length) sobra.push({ id, titulo: TABELAS[id], rows: resto, origem: box });
  }
  for (const f of FLOW) {
    const texto = textos[f.name];
    const k = fitText(f.main, texto);
    if (k < texto.length) sobra.push({ name: f.name, titulo: f.titulo, text: texto.slice(k), origem: f.main });
  }
  // continuações na mesma ordem em que os quadros aparecem na ficha
  sobra.sort((a, b) => (a.origem.compareDocumentPosition(b.origem) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  if (sobra.length) buildExtras(sobra);
  restoreFocus(foco);
  fitZoom();
}

function newSheet() {
  const p = document.createElement('section');
  p.className = 'page extra';
  p.innerHTML = '<div class="extra-head"><span>Folha de continuação</span><span class="logo small">D<span>&amp;</span>D</span></div><div class="extra-body"></div>';
  sheetEl.appendChild(p);
  return p.querySelector('.extra-body');
}

function freeSpace(body) {
  const last = body.lastElementChild;
  const gap = parseFloat(getComputedStyle(body).rowGap) || 0;
  return body.clientHeight - (last ? last.offsetTop + last.offsetHeight + gap : 0);
}

function makeBox(titulo) {
  const box = document.createElement('div');
  box.className = 'box';
  box.innerHTML = `<div class="title">${titulo} (continuação)</div>`;
  return box;
}

function buildExtras(itens) {
  let body = newSheet();
  for (const it of itens) {
    if (it.rows) {
      let rows = it.rows;
      while (rows.length) {
        if (freeSpace(body) < MIN_LIVRE) body = newSheet();
        const nova = !body.children.length;
        const orig = document.getElementById(it.id);
        const box = makeBox(it.titulo);
        box.insertAdjacentHTML('beforeend', `<table class="dyn">${orig.querySelector('colgroup').outerHTML}${orig.querySelector('thead').outerHTML}<tbody data-rows="${it.id}"></tbody></table>`);
        body.appendChild(box);
        const tbody = box.querySelector('tbody');
        let n = 0;
        while (n < rows.length) {
          tbody.appendChild(rows[n]);
          if (overflows(body) && !(nova && n === 0)) { rows[n].remove(); break; }
          n++;
        }
        if (n === 0) { box.remove(); body = newSheet(); continue; }
        rows = rows.slice(n);
        if (rows.length) body = newSheet();
      }
    } else {
      let rest = it.text;
      while (rest.length) {
        if (freeSpace(body) < MIN_LIVRE) body = newSheet();
        const nova = !body.children.length;
        const livre = freeSpace(body);
        const box = makeBox(it.titulo);
        const ta = document.createElement('textarea');
        ta.dataset.contOf = it.name;
        box.appendChild(ta);
        body.appendChild(box);
        ta.style.height = `${Math.max(20, livre - (box.offsetHeight - ta.offsetHeight))}px`;
        let k = fitText(ta, rest);
        if (k === 0 && nova) { ta.value = rest; k = rest.length; }
        if (k === 0) { box.remove(); body = newSheet(); continue; }
        rest = rest.slice(k);
        if (rest.length) {
          body = newSheet();
        } else {
          // encolhe até o conteúdo, deixando duas linhas livres para continuar escrevendo
          const max = ta.offsetHeight;
          const linha = parseFloat(getComputedStyle(ta).lineHeight) || 16;
          ta.style.height = '0px';
          ta.style.height = `${Math.min(max, ta.scrollHeight + 2 * linha)}px`;
        }
      }
    }
  }
}

let layoutFrame = 0;
function scheduleLayout() {
  if (!layoutFrame) layoutFrame = requestAnimationFrame(() => { layoutFrame = 0; layout(); });
}

// em telas estreitas a folha A4 é reduzida inteira (sem mudar o layout interno)
function fitZoom() {
  const wrap = document.getElementById('sheetWrap');
  const vw = document.documentElement.clientWidth;
  const w = sheetEl.offsetWidth;
  const z = Math.min(1, (vw - 16) / w);
  if (z < 1) {
    sheetEl.style.transform = `scale(${z})`;
    sheetEl.style.marginLeft = `${(vw - w * z) / 2}px`;
    wrap.style.height = `${sheetEl.offsetHeight * z + 48}px`;
  } else {
    sheetEl.style.transform = sheetEl.style.marginLeft = wrap.style.height = '';
  }
}

window.addEventListener('resize', fitZoom);
window.addEventListener('beforeprint', layout);
document.fonts?.ready.then(() => layout());
