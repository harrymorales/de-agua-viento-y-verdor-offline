/* Convierte la franja institucional del portal en su encabezado, sin alterar
   el componente React que construye el inicio. */
(() => {
  const enhanceHeader = () => {
    const footer = document.querySelector('.portal-home .portal-footer');
    if (!footer || footer.dataset.headerReady === 'true') return;

    const institutionalLogo = footer.querySelector('img');
    const credits = footer.querySelector('a');
    if (!institutionalLogo || !credits) return;

    const brand = document.createElement('div');
    brand.className = 'portal-header-brand';
    brand.innerHTML = [
      '<img src="favicon_audioteca_margen_blanco_reducido.png" alt="Audioteca De agua, viento y verdor">',
      '<span>De agua, viento y verdor</span>'
    ].join('');

    const partners = document.createElement('div');
    partners.className = 'portal-header-partners';
    partners.append(institutionalLogo, credits);

    footer.classList.add('portal-header');
    footer.prepend(brand);
    footer.append(partners);
    footer.dataset.headerReady = 'true';
  };

  const observer = new MutationObserver(enhanceHeader);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  enhanceHeader();
})();
