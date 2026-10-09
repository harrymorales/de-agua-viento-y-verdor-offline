/* Actualiza las marcas institucionales del encabezado sin tocar el componente
   de inicio ni los contenidos de las audiotecas. */
(() => {
  const replace = () => {
    const image = Array.from(document.querySelectorAll('.portal-home .portal-footer img'))
      .find(candidate => candidate.getAttribute('src') === 'images/portal/cobranding-blanco.png');
    if (!image || image.dataset.currentPartners === 'true') return;
    image.src = 'images/portal/cobranding-educacion-culturas-cocrea.svg';
    image.alt = 'Ministerio de Educación, Ministerio de las Culturas y CoCrea';
    image.dataset.currentPartners = 'true';
  };

  new MutationObserver(replace).observe(document.documentElement, { childList: true, subtree: true });
  replace();
})();
