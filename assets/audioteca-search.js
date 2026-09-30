/* Búsqueda global del portal: pistas, vocabularios, experiencias y contenidos. */
(() => {
  const normalize = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  let searchIndex = null;
  let overlay;

  const getIndex = async () => {
    if (searchIndex) return searchIndex;
    const response = await fetch('assets/audioteca-search-index.json');
    if (!response.ok) throw new Error('No fue posible cargar el índice de la audioteca.');
    searchIndex = await response.json();
    return searchIndex;
  };

  const close = () => overlay?.remove();

  const open = async () => {
    close();
    overlay = document.createElement('div');
    overlay.className = 'audioteca-search-overlay';
    overlay.innerHTML = `
      <section class="audioteca-search-dialog" role="dialog" aria-modal="true" aria-label="Buscar en la audioteca">
        <div class="audioteca-search-top">
          <div><span>Explora todas las comunidades</span><h2>Buscar en la audioteca</h2></div>
          <button type="button" aria-label="Cerrar búsqueda">×</button>
        </div>
        <label class="audioteca-search-field"><span aria-hidden="true">⌕</span><input type="search" autocomplete="off" placeholder="Busca una palabra, canción, arrullo o relato"></label>
        <p class="audioteca-search-help">Encuentra pistas, vocabularios, experiencias y contenidos de las seis comunidades.</p>
        <div class="audioteca-search-results" aria-live="polite"><p class="audioteca-search-empty">Escribe para comenzar la búsqueda.</p></div>
      </section>`;
    document.body.append(overlay);

    const input = overlay.querySelector('input');
    const results = overlay.querySelector('.audioteca-search-results');
    overlay.querySelector('.audioteca-search-top button').addEventListener('click', close);
    overlay.addEventListener('mousedown', event => { if (event.target === overlay) close(); });
    document.addEventListener('keydown', function escape(event) {
      if (event.key !== 'Escape') return;
      close();
      document.removeEventListener('keydown', escape);
    });

    try {
      const entries = await getIndex();
      input.addEventListener('input', () => {
        const query = normalize(input.value).trim();
        if (query.length < 2) {
          results.innerHTML = '<p class="audioteca-search-empty">Escribe al menos dos letras para buscar.</p>';
          return;
        }
        const terms = query.split(/\s+/);
        const matches = entries.filter(item => {
          const text = normalize(item.text);
          return terms.every(term => text.includes(term));
        }).slice(0, 24);
        results.innerHTML = matches.length
          ? matches.map(item => `<a href="${item.url}"><span>${item.community} · ${item.type}</span><b>${item.title}</b><p>${item.snippet}</p></a>`).join('')
          : '<p class="audioteca-search-empty">No encontramos resultados. Prueba con otra palabra.</p>';
      });
      input.focus();
    } catch (error) {
      results.innerHTML = '<p class="audioteca-search-empty">La búsqueda no está disponible en este momento.</p>';
    }
  };

  const addButton = () => {
    const partners = document.querySelector('.portal-header-partners');
    if (!partners || partners.querySelector('.audioteca-search-button')) return;
    const button = document.createElement('button');
    button.className = 'audioteca-search-button';
    button.type = 'button';
    button.setAttribute('aria-label', 'Buscar en toda la audioteca');
    button.innerHTML = '<span aria-hidden="true">⌕</span><small>Buscar</small>';
    button.addEventListener('click', open);
    partners.insertBefore(button, partners.querySelector('a'));
  };

  const observer = new MutationObserver(addButton);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  addButton();
})();
