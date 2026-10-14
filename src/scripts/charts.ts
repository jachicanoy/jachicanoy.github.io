/**
 * Gráficos SVG mínimos para los tableros (sin dependencias).
 * - Colores vía clases CSS que leen tokens (--series-1/--series-2): el cambio de tema no requiere redibujar.
 * - Marcas delgadas con extremos redondeados de 4px anclados a la línea base, separación de 2px entre barras.
 * - Tooltip por marca (hover y foco con teclado). Etiquetas de valor solo en el extremo de cada barra horizontal.
 */
export type Datum = { label: string; a: number; b?: number };
export type Fmt = (n: number) => string;

const NS = 'http://www.w3.org/2000/svg';
const el = (tag: string, attrs: Record<string, string | number> = {}) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
};

let tip: HTMLDivElement | null = null;
function tooltip() {
  if (tip) return tip;
  tip = document.createElement('div');
  tip.className = 'chart-tip';
  tip.setAttribute('role', 'status');
  document.body.appendChild(tip);
  return tip;
}
function bindTip(target: Element, html: string) {
  const show = (x: number, y: number) => {
    const t = tooltip();
    t.innerHTML = html;
    t.style.opacity = '1';
    const w = t.offsetWidth;
    t.style.left = `${Math.min(window.innerWidth - w - 12, Math.max(12, x - w / 2))}px`;
    t.style.top = `${y - t.offsetHeight - 12 + window.scrollY}px`;
  };
  const hide = () => { if (tip) tip.style.opacity = '0'; };
  target.addEventListener('mousemove', (e) => show((e as MouseEvent).clientX, (e as MouseEvent).clientY));
  target.addEventListener('mouseleave', hide);
  target.addEventListener('focus', () => { const r = (target as Element).getBoundingClientRect(); show(r.left + r.width / 2, r.top); });
  target.addEventListener('blur', hide);
}

/** Barra con extremo redondeado (4px) solo en el lado opuesto a la línea base. */
function barPath(x: number, y: number, w: number, h: number, horizontal: boolean) {
  const r = Math.min(4, horizontal ? h / 2 : w / 2, horizontal ? w : h);
  if (w <= 0 || h <= 0) return '';
  if (horizontal) return `M${x},${y}h${w - r}a${r},${r} 0 0 1 ${r},${r}v${h - 2 * r}a${r},${r} 0 0 1 -${r},${r}h-${w - r}z`;
  return `M${x},${y + h}v-${h - r}a${r},${r} 0 0 1 ${r},-${r}h${w - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${h - r}z`;
}

/** Barras horizontales (una o dos series agrupadas). */
export function hbars(host: HTMLElement, data: Datum[], o: { fmt: Fmt; names?: [string, string?]; labelW?: number; max?: number }) {
  host.innerHTML = '';
  const two = data.some((d) => d.b !== undefined);
  const width = Math.max(280, host.clientWidth || 600);
  // El ancho de etiqueta nunca supera el 42 % del gráfico (pantallas estrechas conservan barras legibles)
  const labelW = Math.min(o.labelW ?? 170, Math.round(width * 0.42));
  const maxChars = Math.floor((labelW - 12) / 6.4);
  const valueW = 64;
  const row = two ? 30 : 24;
  const barH = two ? 10 : 12;
  const height = data.length * row + 8;
  const max = o.max ?? Math.max(1, ...data.flatMap((d) => [d.a, d.b ?? 0]));
  const plotW = width - labelW - valueW;
  const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, width: '100%', height, role: 'img' });
  svg.appendChild(el('line', { x1: labelW, x2: labelW, y1: 0, y2: height, class: 'axis' }));
  data.forEach((d, i) => {
    const y0 = i * row + 4;
    const g = el('g', { class: 'mark', tabindex: 0 });
    const label = el('text', { x: labelW - 10, y: y0 + row / 2 - 1, class: 'lbl', 'text-anchor': 'end', 'dominant-baseline': 'middle' });
    label.textContent = d.label.length > maxChars ? d.label.slice(0, maxChars - 1) + '…' : d.label;
    if (d.label.length > maxChars) { const ti = el('title'); ti.textContent = d.label; label.appendChild(ti); }
    g.appendChild(label);
    const series: [number, string][] = two ? [[d.a, 's1'], [d.b ?? 0, 's2']] : [[d.a, 's1']];
    series.forEach(([v, cls], k) => {
      const w = (v / max) * plotW;
      const y = two ? y0 + 4 + k * (barH + 2) : y0 + (row - barH) / 2 - 2;
      g.appendChild(el('path', { d: barPath(labelW, y, w, barH, true), class: `bar ${cls}` }));
    });
    const end = Math.max(d.a, d.b ?? 0);
    const val = el('text', { x: labelW + (end / max) * plotW + 6, y: y0 + row / 2 - 1, class: 'val', 'dominant-baseline': 'middle' });
    val.textContent = d.a === 0 && two ? '—' : o.fmt(d.a);
    g.appendChild(val);
    g.appendChild(el('rect', { x: 0, y: y0, width, height: row, class: 'hit' }));
    const n = o.names ?? ['', ''];
    bindTip(g, `<strong>${d.label}</strong>${two ? `<span><i class="sw s1"></i>${n[0]}: ${o.fmt(d.a)}</span><span><i class="sw s2"></i>${n[1]}: ${o.fmt(d.b ?? 0)}</span>` : `<span>${o.fmt(d.a)}</span>`}`);
    svg.appendChild(g);
  });
  host.appendChild(svg);
}

/** Columnas verticales de una serie (meses, años). */
export function columns(host: HTMLElement, data: Datum[], o: { fmt: Fmt; label?: (d: Datum) => string }) {
  host.innerHTML = '';
  const width = Math.max(260, host.clientWidth || 500);
  const height = 200;
  const pad = { t: 22, b: 26, l: 8, r: 8 };
  const max = Math.max(1, ...data.map((d) => d.a));
  const slot = (width - pad.l - pad.r) / data.length;
  const bw = Math.min(56, slot - 2 - slot * 0.35);
  const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, width: '100%', height, role: 'img' });
  const base = height - pad.b;
  svg.appendChild(el('line', { x1: pad.l, x2: width - pad.r, y1: base, y2: base, class: 'axis' }));
  data.forEach((d, i) => {
    const h = (d.a / max) * (base - pad.t);
    const x = pad.l + i * slot + (slot - bw) / 2;
    const g = el('g', { class: 'mark', tabindex: 0 });
    g.appendChild(el('path', { d: barPath(x, base - h, bw, h, false), class: 'bar s1' }));
    const t = el('text', { x: x + bw / 2, y: base + 16, class: 'lbl', 'text-anchor': 'middle' });
    t.textContent = d.label;
    g.appendChild(t);
    if (i === data.length - 1 || data.length <= 6) {
      const v = el('text', { x: x + bw / 2, y: base - h - 6, class: 'val', 'text-anchor': 'middle' });
      v.textContent = o.fmt(d.a);
      g.appendChild(v);
    }
    g.appendChild(el('rect', { x: pad.l + i * slot, y: pad.t, width: slot, height: base - pad.t, class: 'hit' }));
    bindTip(g, `<strong>${d.label}</strong><span>${o.label ? o.label(d) : o.fmt(d.a)}</span>`);
    svg.appendChild(g);
  });
  host.appendChild(svg);
}

/** Redibuja al cambiar el ancho del contenedor. */
export function responsive(host: HTMLElement, draw: () => void) {
  let w = 0;
  new ResizeObserver(([e]) => {
    const nw = Math.round(e.contentRect.width);
    if (Math.abs(nw - w) > 8) { w = nw; draw(); }
  }).observe(host);
}

export const compact = (lang: string) => {
  const f = new Intl.NumberFormat(lang === 'es' ? 'es-CO' : 'en-US', { notation: 'compact', maximumFractionDigits: 1 });
  return (n: number) => f.format(n);
};
export const full = (lang: string) => {
  const f = new Intl.NumberFormat(lang === 'es' ? 'es-CO' : 'en-US');
  return (n: number) => f.format(n);
};
