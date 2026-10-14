/**
 * Filtro cruzado Stack ⇄ Proyectos ⇄ Productos.
 * - Hover (punteros finos): previsualiza el filtro sin fijarlo.
 * - Click: fija/libera el filtro; se sincroniza con ?tech= para compartir enlaces.
 * - Los chips de tecnología dentro de las tarjetas también fijan el filtro.
 * - En Productos, el filtro por tecnología se combina con las pestañas de tipo.
 * Los textos llegan localizados vía data-attributes del bloque [data-filter-i18n].
 */
export function initFilter() {
  const matrix = document.querySelector<HTMLElement>('[data-matrix]');
  const items = [...document.querySelectorAll<HTMLElement>('[data-item]')];
  const statusEls = [...document.querySelectorAll<HTMLElement>('[data-filter-status]')];
  const toast = document.querySelector<HTMLElement>('[data-filter-toast]');
  const i18n = document.querySelector<HTMLElement>('[data-filter-i18n]')?.dataset ?? {};
  const typeTabs = [...document.querySelectorAll<HTMLButtonElement>('[data-type-tab]')];
  const watched = ['projects', 'products'].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
  if (!matrix || !items.length) return;

  const buttons = [...matrix.querySelectorAll<HTMLButtonElement>('button[data-tech]')];
  const byId = new Map(buttons.map((b) => [b.dataset.tech!, b]));
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  let pinned: string | null = new URLSearchParams(location.search).get('tech');
  if (pinned && !byId.has(pinned)) pinned = null;
  let hover: string | null = null;
  let type = 'all';
  const visible = new Set<Element>();

  const label = (n: number, name: string) => `${n} ${n === 1 ? i18n.one : i18n.many} ${i18n.with} ${name}`;

  const render = () => {
    const active = hover ?? pinned;
    const related = new Set((active && byId.get(active)?.dataset.related?.split(' ')) || []);

    matrix.classList.toggle('has-focus', !!active);
    buttons.forEach((b) => {
      const id = b.dataset.tech!;
      b.setAttribute('aria-pressed', String(id === pinned));
      b.classList.toggle('is-hover', id === hover);
      b.classList.toggle('is-related', !!active && id !== active && related.has(id));
    });

    const counts = new Map<string, number>();
    items.forEach((c) => {
      const techOk = !active || c.dataset.tech!.split(' ').includes(active);
      const typeOk = !c.dataset.type || type === 'all' || c.dataset.type === type;
      const show = techOk && typeOk;
      c.hidden = !show;
      const group = c.dataset.group!;
      if (show) counts.set(group, (counts.get(group) ?? 0) + 1);
      c.querySelectorAll<HTMLElement>('[data-chip-tech]').forEach((chip) =>
        chip.classList.toggle('is-active', chip.dataset.chipTech === active),
      );
    });

    const name = active ? byId.get(active)?.dataset.name ?? active : '';
    statusEls.forEach((s) => {
      const n = counts.get(s.dataset.filterStatus!) ?? 0;
      s.hidden = !active;
      const l = s.querySelector('[data-filter-label]');
      if (l) l.textContent = active ? label(n, name) : '';
    });
    document.querySelectorAll<HTMLElement>('[data-filter-empty]').forEach((e) => {
      e.hidden = (counts.get(e.dataset.filterEmpty!) ?? 0) > 0;
    });

    if (toast) {
      const total = [...counts.values()].reduce((a, b) => a + b, 0);
      toast.hidden = !pinned || visible.size > 0;
      const tl = toast.querySelector('[data-toast-label]');
      if (tl) tl.textContent = `${total} ${total === 1 ? i18n.one : i18n.many} · ${name}`;
    }
  };

  const setPinned = (id: string | null) => {
    pinned = id;
    const url = new URL(location.href);
    if (id) url.searchParams.set('tech', id); else url.searchParams.delete('tech');
    history.replaceState(null, '', url);
    render();
  };

  buttons.forEach((b) => {
    const id = b.dataset.tech!;
    b.addEventListener('click', () => setPinned(pinned === id ? null : id));
    if (canHover) {
      b.addEventListener('mouseenter', () => { hover = id; render(); });
      b.addEventListener('mouseleave', () => { hover = null; render(); });
    }
  });

  typeTabs.forEach((tab) =>
    tab.addEventListener('click', () => {
      type = tab.dataset.typeTab!;
      typeTabs.forEach((x) => x.setAttribute('aria-selected', String(x === tab)));
      render();
    }),
  );

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const chip = target.closest<HTMLElement>('[data-chip-tech]');
    if (chip) { const id = chip.dataset.chipTech!; setPinned(pinned === id ? null : id); return; }
    if (target.closest('[data-filter-clear]')) setPinned(null);
  });

  if (toast) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      render();
    }, { threshold: 0.05 });
    watched.forEach((w) => io.observe(w));
  }

  render();
}
