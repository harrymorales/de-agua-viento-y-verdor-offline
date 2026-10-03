/* Cada encabezado conserva el nombre de su comunidad y usa un lema común. */
(() => {
  const applyLabel = () => {
    const brand = document.querySelector('.topbar .brand');
    if (!brand) return;
    const subtitle = brand.querySelector('small');
    if (subtitle) subtitle.textContent = 'De agua, viento y verdor';
  };

  [0, 50, 300].forEach(delay => window.setTimeout(applyLabel, delay));
})();

/* Menú compacto para los encabezados de las audiotecas en móvil/tablet. */
(() => {
  const enhance = () => {
    const topbar = document.querySelector('.topbar');
    const actions = topbar?.querySelector('.top-actions');
    if (!topbar || !actions || topbar.dataset.mobileNavigationReady) return;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mobile-navigation-toggle';
    toggle.setAttribute('aria-label', 'Abrir menú de la comunidad');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span></span><span></span><span></span>';
    toggle.addEventListener('click', () => {
      const isOpen = topbar.classList.toggle('mobile-navigation-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú de la comunidad' : 'Abrir menú de la comunidad');
    });

    topbar.append(toggle);
    const closeActiveOverlay = () => {
      const closeButtons = document.querySelectorAll([
        '.photo-overlay button[aria-label="Cerrar fototeca"]',
        '.guide-overlay button[aria-label="Cerrar"]',
        '.overlay:not(.photo-overlay):not(.guide-overlay) button[aria-label="Cerrar"]'
      ].join(','));
      closeButtons.forEach((button) => button.click());
    };

    actions.querySelectorAll('button').forEach((action) => {
      action.addEventListener('click', () => {
        closeActiveOverlay();
        topbar.classList.remove('mobile-navigation-open');
      });
    });
    topbar.dataset.mobileNavigationReady = 'true';
  };

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') document.querySelector('.topbar')?.classList.remove('mobile-navigation-open');
  });
  new MutationObserver(enhance).observe(document.documentElement, { childList: true, subtree: true });
  enhance();
})();
