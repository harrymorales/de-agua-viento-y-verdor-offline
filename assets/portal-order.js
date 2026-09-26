/* Keeps the portal's approved community order: Palenque, then Raizal. */
(() => {
  if (location.pathname.includes('/territories/')) return;

  const normalize = value => value.replace(/\s+/g, ' ').trim().toLocaleLowerCase();
  const putPalenqueFirst = container => {
    if (!container) return;
    const buttons = Array.from(container.querySelectorAll('button'));
    const palenque = buttons.find(button => normalize(button.textContent).includes('palenque'));
    const raizal = buttons.find(button => normalize(button.textContent).includes('raizal'));
    if (palenque && raizal && raizal.compareDocumentPosition(palenque) & Node.DOCUMENT_POSITION_FOLLOWING) {
      container.insertBefore(palenque, raizal);
    }
  };

  const update = () => {
    putPalenqueFirst(document.querySelector('.community-map'));
    putPalenqueFirst(document.querySelector('.map-art'));
  };
  update();
  new MutationObserver(update).observe(document.body, { childList: true, subtree: true });
})();
