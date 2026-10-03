/* Navegación compacta para teléfonos y tabletas. */
(() => {
  const closeOnAction = (container, selector) => {
    container.querySelectorAll(selector).forEach((action) => {
      action.addEventListener('click', () => container.classList.remove('mobile-navigation-open'));
    });
  };

  const addTerritoryMenu = () => {
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
    closeOnAction(topbar, '.top-actions button');
    topbar.dataset.mobileNavigationReady = 'true';
  };

  const addPortalMenu = () => {
    const header = document.querySelector('.portal-home .portal-header');
    if (!header || header.dataset.mobileNavigationReady) return;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mobile-navigation-toggle portal-mobile-navigation-toggle';
    toggle.setAttribute('aria-label', 'Abrir menú principal');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span></span><span></span><span></span>';
    toggle.addEventListener('click', () => {
      const home = header.closest('.portal-home');
      const isOpen = home.classList.toggle('mobile-navigation-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú principal' : 'Abrir menú principal');
    });

    header.append(toggle);
    closeOnAction(header, '.portal-header-partners button, .portal-header-partners a');
    header.dataset.mobileNavigationReady = 'true';
  };

  const controlMapPageScroll = () => {
    const map = document.querySelector('.portal-home .territory-map');
    const toggle = map?.querySelector('.map-toggle');
    if (!map || !toggle || map.dataset.scrollLockReady) return;

    const sync = () => {
      const isOpen = map.classList.contains('open');
      document.documentElement.classList.toggle('map-panel-open', isOpen);
      document.body.classList.toggle('map-panel-open', isOpen);
    };

    toggle.addEventListener('click', () => window.setTimeout(sync, 0));
    sync();
    map.dataset.scrollLockReady = 'true';
  };

  const enhance = () => {
    addTerritoryMenu();
    addPortalMenu();
    controlMapPageScroll();
  };

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    document.querySelector('.topbar')?.classList.remove('mobile-navigation-open');
    document.querySelector('.portal-home')?.classList.remove('mobile-navigation-open');
  });

  new MutationObserver(enhance).observe(document.documentElement, { childList: true, subtree: true });
  enhance();
})();
