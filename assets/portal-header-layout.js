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

    const partnerMarks = document.createElement('div');
    partnerMarks.className = 'portal-partner-marks';
    partnerMarks.innerHTML = [
      '<span class="portal-partner-mark portal-partner-mark--education"><img src="images/logo educacion.png" alt="Ministerio de Educación Nacional"></span>',
      '<span class="portal-partner-mark portal-partner-mark--cultures"><img src="images/logo cultura.png" alt="Ministerio de las Culturas, las Artes y los Saberes"></span>',
      '<span class="portal-partner-mark portal-partner-mark--cocrea"><img src="images/logo-cocrea.svg" alt="CoCrea"></span>'
    ].join('');
    institutionalLogo.replaceWith(partnerMarks);

    const partners = document.createElement('div');
    partners.className = 'portal-header-partners';
    partners.append(partnerMarks, credits);

    footer.classList.add('portal-header');
    footer.prepend(brand);
    footer.append(partners);
    footer.dataset.headerReady = 'true';
  };

  const observer = new MutationObserver(enhanceHeader);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  enhanceHeader();
})();
